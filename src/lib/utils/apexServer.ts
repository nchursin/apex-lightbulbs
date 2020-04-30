import { TextDocument, SymbolInformation } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';

namespace ApexServer {
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
}

export default ApexServer;
