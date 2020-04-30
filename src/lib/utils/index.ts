import { join, find, findLast, compose, repeat } from 'ramda';
import { TextDocument, SymbolInformation, window } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';

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
    const docSymbolResult: SymbolInformation[] = await getAllSymbols(textDocument, languageClient);
    return findFirstNonVarDefnLine(docSymbolResult);
};

export const findFirstNonVarDefnLine = (docSymbolResult: SymbolInformation[]) => {
    if (1 === docSymbolResult.length) {
        // If class is empty - return first line after definition
        return docSymbolResult[0].location.range.start.line + 1;
    }
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
