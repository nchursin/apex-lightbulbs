import * as vscode from 'vscode';
import { VARIABLE_ACTIONS } from '@labels';
import { SymbolParser } from "@utils";
import { SymbolKind, SymbolInformation } from 'vscode-languageclient';
import { BaseProvider } from '@actionProviders/baseProvider';

export class GetterSetterActionProvider extends BaseProvider {

    public getActionableSymbolKinds(): SymbolKind[] {
        return [ SymbolKind.Field ];
    }

    protected getAction(
        document: vscode.TextDocument,
        varSymbol: SymbolInformation,
        classSymbols: SymbolInformation[]
    ): vscode.CodeAction {
        const addGetSetAction = new vscode.CodeAction(VARIABLE_ACTIONS.ADD_GET_SET, vscode.CodeActionKind.Refactor);
        addGetSetAction.edit = new vscode.WorkspaceEdit();

        const line = document.lineAt(varSymbol.location.range.start.line);
        const text = line.text.trim();
        const firstChar = line.firstNonWhitespaceCharacterIndex;
        const lastChar = firstChar + text.length;
        const lastPosition = new vscode.Position(line.lineNumber, lastChar - 1);
        const rangeToReplace = new vscode.Range(lastPosition, lastPosition.translate(0, 1));
        addGetSetAction.edit.replace(document.uri, rangeToReplace, ' { get; set; }');

        return addGetSetAction;
    }
}
