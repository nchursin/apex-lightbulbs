import * as fs from 'fs';
import * as path from 'path';

import { TextDocument, WorkspaceEdit, Range, Position } from "vscode";
import { LanguageClient } from "vscode-languageclient";
import { stub } from "sinon";

export const replaceDocumentText = (textDocument: TextDocument, textToSet: string) => {
    const edit = new WorkspaceEdit();
    const lineCount = textDocument.lineCount;
    const lastLine = textDocument.lineAt(lineCount - 1);

    edit.replace(textDocument.uri, new Range(new Position(0,0), lastLine.range.end), textToSet);
};

export const getStubLanguageClient = async (dataFolderPath: string): Promise<LanguageClient> => {
    const langClient = new LanguageClient('', { command: '' }, {});
    const documentSymbolFile = path.join(dataFolderPath, 'documentSymbol.json');
    const documentSymbolString = await fs.promises.readFile(documentSymbolFile, 'utf8');
    const documentSymbol = JSON.parse(documentSymbolString);
    stub(langClient, 'sendRequest').returns(Promise.resolve(documentSymbol));
    return langClient;
};
