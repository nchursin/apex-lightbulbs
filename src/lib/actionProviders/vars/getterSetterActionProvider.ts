import * as vscode from 'vscode';
import { VARIABLE_ACTIONS } from '../../../labels';
import { TYPES } from '../../../constants';
import { getLineMetadata } from "../../lineType";

export class GetterSetterActionProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.Refactor
	];

	public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] {
        const line = document.lineAt(range.start.line);
        const lineMeta = getLineMetadata(line.text.trim());
        if (TYPES.VAR !== lineMeta.type) {
            return [];
        }

        const addGetSetAction = this.getAddGetSetAction(document, range);
        return [
            addGetSetAction,
        ];
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
