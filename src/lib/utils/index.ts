import { find } from 'ramda';
import { TextDocument, SymbolInformation } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';

import ApexServer from './apexServer';
import SymbolParser from './symbolParser';
import Editor from './editor';

export const getSymbolAtLine = async (lineNumber: number, textDocument: TextDocument, languageClient: LanguageClient): Promise<SymbolInformation | undefined> => {
    const docSymbolResult: SymbolInformation[] = await ApexServer.getAllSymbols(textDocument, languageClient);
    const firstMatch = find((symbol) => symbol.location.range.start.line === lineNumber, docSymbolResult);
    return firstMatch;
};

export const getFirstNonVarDefnLine = async (textDocument: TextDocument, languageClient: LanguageClient): Promise<number> => {
    const docSymbolResult: SymbolInformation[] = await ApexServer.getAllSymbols(textDocument, languageClient);
    return SymbolParser.findFirstNonVarDeclarationLine(docSymbolResult);
};

export {
    ApexServer,
    SymbolParser,
    Editor,
};
