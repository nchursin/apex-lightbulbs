import { TYPES } from '../constants';
import { join, find, findLast, compose, repeat } from 'ramda';
import { TextDocument, SymbolInformation, window } from 'vscode';
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

export const getAllSymbols = async (textDocument: TextDocument, languageClient: LanguageClient): Promise<SymbolInformation[]> => {
    const docSymbolResult: SymbolInformation[] = await languageClient.sendRequest(
        'textDocument/documentSymbol',
        {
            textDocument: {
                uri: `${textDocument.uri.scheme}://${textDocument.uri.fsPath}`,
            }
        }
    );
    const str = JSON.stringify(docSymbolResult); // this line is to easily copy JSON value of server response
    return docSymbolResult;
};

export const getSymbolAtLine = async (lineNumber: number, textDocument: TextDocument, languageClient: LanguageClient): Promise<SymbolInformation | undefined> => {
    const docSymbolResult: SymbolInformation[] = await getAllSymbols(textDocument, languageClient);
    const firstMatch = find((symbol) => symbol.location.range.start.line === lineNumber, docSymbolResult);
    return firstMatch;
};

export const findSymbolAtLine = (docSymbolResult: SymbolInformation[], lineNumber: number): SymbolInformation | undefined => {
    return find((symbol) => symbol.location.range.start.line === lineNumber, docSymbolResult);
};

export const getFirstNonVarDefnLine = async (textDocument: TextDocument, languageClient: LanguageClient): Promise<number> => {
    const docSymbolResult: SymbolInformation[] = await languageClient.sendRequest(
        'textDocument/documentSymbol',
        {
            textDocument: {
                uri: `${textDocument.uri.scheme}://${textDocument.uri.fsPath}`,
            }
        }
    );
    const firstNonVar = find((symbol) => symbol.kind !== 7 && symbol.kind !== 8, docSymbolResult);
    let result: number;
    if (firstNonVar && firstNonVar.location.range.start.line) {
        result = firstNonVar.location.range.start.line;
    } else {
        const lastVar = findLast((symbol) => symbol.kind === 7 || symbol.kind === 8, docSymbolResult);
        if (!lastVar) {
            throw new Error('No symbols found');
        }
        result = lastVar.location.range.start.line + 1;
    }
    return result;
};

const repeatString = compose<string, number, string[], string>(
    join(''),
    repeat
);

export const editor = () => window.activeTextEditor;
// TODO: stub vscode.window.activeTextEditor in test to avoid using the || hack
export const isSpaceIndent = () => editor()?.options.insertSpaces || true;
export const tabSize = () => Number(editor()?.options.tabSize || 4);
export const singleIndent = isSpaceIndent() ? repeatString(' ', tabSize()) : '\t';
