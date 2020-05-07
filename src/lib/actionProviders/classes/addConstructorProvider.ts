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
        const classSymbols = SymbolParser.getWholeClassMeta(actionableSymbol, allSymbols);

        if (!this.hasConstructor(classSymbols)) {
            return this.createAction(classSymbols, document);
        }
    }

    private hasConstructor(symbolInfos: SymbolInformation[]): Boolean {
        return Boolean(SymbolParser.findConstructor(symbolInfos));
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
