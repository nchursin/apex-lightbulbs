import * as vscode from 'vscode';
import { VARIABLE_ACTIONS } from '../../../labels';
import { SYMBOL_KIND } from '../../../constants';
import { getSymbolAtLine } from "../../utils";
import { LanguageClient } from 'vscode-languageclient';

export class GetterSetterActionProvider implements vscode.CodeActionProvider {
    private languageClient: LanguageClient | undefined;

    constructor(languageClient: LanguageClient | undefined = undefined) {
        this.languageClient = languageClient;
    }

    public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.Refactor
	];

	public async provideCodeActions(document: vscode.TextDocument, range: vscode.Range): Promise<vscode.CodeAction[]> {
        if (!this.languageClient) {
            throw new Error('Language Client is not provided');
        }
        try {
            const result = [];
            const symbol = await getSymbolAtLine(range.start.line, document, this.languageClient);

            if (symbol && SYMBOL_KIND.FIELD === symbol.kind) {
                const addGetSetAction = this.getAddGetSetAction(document, range);
                result.push(addGetSetAction);
            }
            return result;
        } catch(err) {
            console.error(err);
            throw err;
        }
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
