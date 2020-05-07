import * as vscode from "vscode";
import { CLASS_ACTIONS } from "@labels";
import { Templates } from "@templates";
import { join, find, last, equals, findIndex, slice, findLastIndex, repeat, add } from "ramda";
import { SymbolKind, SymbolInformation } from "vscode-languageclient";
import { SymbolParser, Editor } from "@utils";
import { BaseProvider } from '@actionProviders/baseProvider';

export class AddConstructorProvider extends BaseProvider {

    public getActionableSymbolKinds(): SymbolKind[] {
        return [ SymbolKind.Class ];
    }

    protected async getAction(
        document: vscode.TextDocument,
        actionableSymbol: SymbolInformation,
        allSymbols: SymbolInformation[]
    ) {
        const classSymbols = this.getWholeClassMeta(actionableSymbol, allSymbols);

        if (!this.hasConstructor(classSymbols)) {
            return this.createAction(classSymbols, document);
        }
    }

    private isClassSymbol(symbol: SymbolInformation): boolean {
        return SymbolKind.Class === symbol.kind;
    }

    private hasConstructor(symbolInfos: SymbolInformation[]): Boolean {
        return Boolean(this.findConstructor(symbolInfos));
    }

    private findConstructor(symbolInfos: SymbolInformation[]): SymbolInformation | undefined {
        const classDeclaration = last(symbolInfos);
        return classDeclaration && find((symbol: SymbolInformation) => {
            return SymbolKind.Constructor === symbol.kind && symbol.name.startsWith(classDeclaration.name);
        }, symbolInfos);
    }

    private getWholeClassMeta(symbol: SymbolInformation, allSymbols: SymbolInformation[]) {
        const classDefnIndex = findIndex(equals(symbol), allSymbols);
        if (allSymbols.length === classDefnIndex + 1) {
            return allSymbols;
        }
        const previousSymbols = slice(0, classDefnIndex, allSymbols);
        const lastClassIndex = findLastIndex(this.isClassSymbol, previousSymbols);
        return slice(lastClassIndex + 1, classDefnIndex + 1, allSymbols);
    }

    private async createAction(classSymbols: SymbolInformation[], document: vscode.TextDocument): Promise<vscode.CodeAction> {
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
