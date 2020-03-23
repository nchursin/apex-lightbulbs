import { TYPES } from '../constants';
import { join, tail, find, split, findIndex, dropWhile, drop, findLast } from 'ramda';
import { types } from 'util';
import { TextDocument } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';

const modifiers = [
    'public',
    'private',
    'protected',
];

const annotation = `(@\\w+\\s+)?`;
const accessModifier = `((${join('|', modifiers)})\\s+)?`;
const staticModifier = `(static\\s+)?`;
const typeName = '(?!(?:static|class))\\w+';
const varRegex = new RegExp(`^${annotation}${accessModifier}${staticModifier}${typeName}\\s+\\w+\\s*;`);

const methodRegex = new RegExp(`^${annotation}${accessModifier}${staticModifier}\\w+\\s+\\w+\\s*\\(.*`);

const abstractionModifier = '((abstract|virtual)\\s+)?';
const sharingModifier = '((with|without|inherited)\\s+sharing\\s+)?';
const classRegex = new RegExp(`^${annotation}${accessModifier}${abstractionModifier}${sharingModifier}class\\s+\\w+\\s*{?$`);

export const getLineMetadata = (lineText: string): LineMetadata => {
    const result = new LineMetadata(lineText);
    return result;
};

const metaChecks = [
    {
        regex: varRegex,
        type: TYPES.VAR,
        staticKeywordGroupNumber: 4,
    },
    {
        regex: methodRegex,
        type: TYPES.METHOD,
        staticKeywordGroupNumber: 4,
    },
    {
        regex: classRegex,
        type: TYPES.CLASS,
    },
];

export class LineMetadata {
    public type: string;
    public isStatic: boolean | undefined;

    constructor(lineText: string) {
        this.type = TYPES.UNKNOWN;
        const lowerCase = lineText.toLowerCase();
        const config = find((metaCheckConfig) => metaCheckConfig.regex.test(lowerCase), metaChecks);
        if (config) {
            this.type = config.type;
            const matches = lowerCase.match(config.regex);
            if (config.staticKeywordGroupNumber) {
                this.isStatic = Boolean(matches && matches[config.staticKeywordGroupNumber]);
            } else {
                this.isStatic = false;
            }
        }
    }
}

export const getFirstNonVarDefnLine = async(textDocument: TextDocument, languageClient: LanguageClient): Promise<number> => {
    // TODO: rewrite this to utilize language server
    const docSymbolResult: any[] = await languageClient.sendRequest(
        'textDocument/documentSymbol',
        {
            textDocument: {
                uri: `${textDocument.uri.scheme}://${textDocument.uri.fsPath}`,
            }
        }
    );
    const firstNonVar = find((symbol) => symbol.kind !== 7 && symbol.kind !== 8, docSymbolResult);
    let result: number;
    if (firstNonVar.location.range.start.line) {
        result = firstNonVar.location.range.start.line;
    } else {
        const LastVar = findLast((symbol) => symbol.kind === 7 || symbol.kind === 8, docSymbolResult);
        result = LastVar.location.range.start.line + 1;
    }
    return result;
};
