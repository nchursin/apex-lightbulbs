import * as vscode from "vscode";
import { LanguageClient, SymbolInformation, SymbolKind } from "vscode-languageclient";
import { ApexServer, SymbolParser } from "@utils";

export abstract class BaseProvider implements vscode.CodeActionProvider {
    private languageClient: LanguageClient;

    constructor(languageClient: LanguageClient) {
        this.languageClient = languageClient;
    }

    public abstract getActionableSymbolKinds(): SymbolKind[];

    protected abstract getAction(
        document: vscode.TextDocument,
        actionableSymbol: SymbolInformation,
        allSymbols: SymbolInformation[]
    ): vscode.CodeAction | Promise<vscode.CodeAction | undefined> | undefined;

    public async provideCodeActions(document: vscode.TextDocument, range: vscode.Range): Promise<vscode.CodeAction[]> {
        const result: vscode.CodeAction[] = [];
        const allSymbols = await this.getAllSymbols(document);
        const providingSymbol = SymbolParser.findSymbolAtLine(allSymbols, range.start.line);

        if (providingSymbol && this.isActionable(providingSymbol)) {
            const action = await this.getAction(document, providingSymbol, allSymbols);
            if (action) {
                result.push(action);
            }
        }
        return result;
    }

    public getProvidedCodeActionsKind(): vscode.CodeActionKind[] {
        return [
            vscode.CodeActionKind.Refactor
        ];
    }

    protected isActionable(symbol: SymbolInformation) {
        return this.getActionableSymbolKinds().includes(symbol.kind);
    }

    protected getAllSymbols(document: vscode.TextDocument): Promise<SymbolInformation[]> {
        return ApexServer.getAllSymbols(document, this.languageClient);
    }
}
