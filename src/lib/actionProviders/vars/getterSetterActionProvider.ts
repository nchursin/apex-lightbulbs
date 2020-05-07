import * as vscode from 'vscode';
import { VARIABLE_ACTIONS } from '@labels';
import { SymbolParser } from "@utils";
import { SymbolKind } from 'vscode-languageclient';
import { BaseProvider } from '../baseProvider';

export class GetterSetterActionProvider extends BaseProvider {

	public async provideCodeActions(document: vscode.TextDocument, range: vscode.Range): Promise<vscode.CodeAction[]> {
        try {
            const result = [];
            const allSymbols = await this.getAllSymbols(document);
            const symbol = SymbolParser.findSymbolAtLine(allSymbols, range.start.line);

            if (symbol && this.isActionable(symbol)) {
                const addGetSetAction = this.getAddGetSetAction(document, range);
                result.push(addGetSetAction);
            }
            return result;
        } catch(err) {
            console.error(err);
            throw err;
        }
    }

    public getActionableSymbolKinds(): SymbolKind[] {
        return [ SymbolKind.Field ];
    }

    private getAddGetSetAction(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction {
        const addGetSetAction = new vscode.CodeAction(VARIABLE_ACTIONS.ADD_GET_SET, vscode.CodeActionKind.Refactor);
        addGetSetAction.edit = new vscode.WorkspaceEdit();

        const line = document.lineAt(range.start.line);
        const text = line.text.trim();
        const firstChar = line.firstNonWhitespaceCharacterIndex;
        const lastChar = firstChar + text.length;
        const lastPosition = new vscode.Position(line.lineNumber, lastChar - 1);
        const rangeToReplace = new vscode.Range(lastPosition, lastPosition.translate(0, 1));
        addGetSetAction.edit.replace(document.uri, rangeToReplace, ' { get; set; }');

        return addGetSetAction;
    }
}
