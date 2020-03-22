import { TYPES } from '../constants';
import { join, tail, find, split, findIndex, dropWhile, drop } from 'ramda';
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

export const getFirstNonVarDefnLine = async(textDocument: TextDocument, languageClient?: LanguageClient): Promise<number> => {
    // if (languageClient) {
    //     try {
    //         const result: any[] = await languageClient.sendRequest(
    //             'textDocument/documentSymbol',
    //             {
    //                 textDocument: {
    //                     uri: `${textDocument.uri.scheme}://${textDocument.uri.fsPath}`,
    //                 }
    //             }
    //         );
    //         console.log('service >> ', result[0].location.uri);
    //         console.log('doc >> ', textDocument.uri.path);
    //     } catch(err) {
    //         console.error(err);
    //     }
    // }

    const text = textDocument.getText();
    const splitted: string[] = split('\n', text);
    const classDeclarationIndex = findIndex((lineText) => Boolean(lineText.trim()) && classRegex.test(lineText.trim()), splitted);
    const increaseIndexBy = 1 + classDeclarationIndex;
    const indexFirstNonVar = findIndex((lineText: string) => Boolean(lineText.trim()) && !varRegex.test(lineText.trim()), drop(increaseIndexBy, splitted));
    return indexFirstNonVar + increaseIndexBy;
};
