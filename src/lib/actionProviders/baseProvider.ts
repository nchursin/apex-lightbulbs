import * as vscode from "vscode";
import { LanguageClient, SymbolInformation, SymbolKind } from "vscode-languageclient";
import { ApexServer } from "@utils";

export abstract class BaseProvider implements vscode.CodeActionProvider {
    private languageClient: LanguageClient;

    constructor(languageClient: LanguageClient) {
        this.languageClient = languageClient;
    }

    public abstract provideCodeActions(document: vscode.TextDocument, range: vscode.Range): Promise<vscode.CodeAction[]>;

    public abstract getProvidedCodeActionsKind(): vscode.CodeActionKind[];
    public abstract getActionableSymbolKinds(): SymbolKind[];

    protected isActionable(symbol: SymbolInformation) {
        return this.getActionableSymbolKinds().includes(symbol.kind);
    }

    protected getAllSymbols(document: vscode.TextDocument): Promise<SymbolInformation[]> {
        return ApexServer.getAllSymbols(document, this.languageClient);
    }
}
