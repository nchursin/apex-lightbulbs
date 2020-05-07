import * as vscode from "vscode";
import { CLASS_ACTIONS } from "@labels";
import { Templates } from "@templates";
import { join, find, last, equals, findIndex, slice, findLastIndex, repeat, add } from "ramda";
import { LanguageClient, SymbolKind } from "vscode-languageclient";
import { ApexServer, SymbolParser, Editor } from "@utils";

export class AddConstructorProvider implements vscode.CodeActionProvider {
    private languageClient: LanguageClient;

    public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.Refactor
	];

    constructor(languageClient: LanguageClient) {
        this.languageClient = languageClient;
    }

    public async provideCodeActions(document: vscode.TextDocument, range: vscode.Range): Promise<vscode.CodeAction[]> {
        const allSymbols = await ApexServer.getAllSymbols(document, this.languageClient);
        const providingSymbol = SymbolParser.findSymbolAtLine(allSymbols, range.start.line);

        if (!providingSymbol || !this.isClassSymbol(providingSymbol)) {
            return [];
        }

        const classSymbols = this.getWholeClassMeta(providingSymbol, allSymbols);
        return await this.getAvailableClassActions(classSymbols, document);
    }

    private async getAvailableClassActions(symbolInfos: vscode.SymbolInformation[], document: vscode.TextDocument): Promise<vscode.CodeAction[]> {
        const result: vscode.CodeAction[] = [];
        if (!this.hasConstructor(symbolInfos)) {
            const addConstructorAction = await this.createAction(symbolInfos, document);
            result.push(addConstructorAction);
        }
        return result;
    }

    private isClassSymbol(symbol: vscode.SymbolInformation): boolean {
        return SymbolKind.Class === symbol.kind;
    }

    private hasConstructor(symbolInfos: vscode.SymbolInformation[]): Boolean {
        return Boolean(this.findConstructor(symbolInfos));
    }

    private findConstructor(symbolInfos: vscode.SymbolInformation[]): vscode.SymbolInformation | undefined {
        const classDeclaration = last(symbolInfos);
        return classDeclaration && find((symbol: vscode.SymbolInformation) => {
            return SymbolKind.Constructor === symbol.kind && symbol.name.startsWith(classDeclaration.name);
        }, symbolInfos);
    }

    private getWholeClassMeta(symbol: vscode.SymbolInformation, allSymbols: vscode.SymbolInformation[]) {
        const classDefnIndex = findIndex(equals(symbol), allSymbols);
        if (allSymbols.length === classDefnIndex + 1) {
            return allSymbols;
        }
        const previousSymbols = slice(0, classDefnIndex, allSymbols);
        const lastClassIndex = findLastIndex(this.isClassSymbol, previousSymbols);
        return slice(lastClassIndex + 1, classDefnIndex + 1, allSymbols);
    }

    private async createAction(classSymbols: vscode.SymbolInformation[], document: vscode.TextDocument): Promise<vscode.CodeAction> {
        const lineToAddConstructor = SymbolParser.findFirstNonVarDeclarationLine(classSymbols);
        const addConstructorAction = new vscode.CodeAction(CLASS_ACTIONS.ADD_CONSTRUCTOR, vscode.CodeActionKind.Refactor);

        const classDeclarationSymbol = classSymbols[classSymbols.length - 1];

        const line = document.lineAt(lineToAddConstructor);
        const lineText = line.text.trim();

        const nameSplit = classDeclarationSymbol.name.split('.');
        const indent = join('', repeat(Editor.singleIndent, nameSplit.length));
        let text = await Templates.constructor({ indent, className: last(nameSplit) || '' });
        if (lineText) {
            text += '\n';
        }
        addConstructorAction.edit = new vscode.WorkspaceEdit();
        addConstructorAction.edit.insert(document.uri, new vscode.Position(lineToAddConstructor, 0), text);

        return addConstructorAction;
    }
}
