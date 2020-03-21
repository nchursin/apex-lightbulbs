import * as assert from 'assert';
import * as path from 'path';
import * as Mocha from 'mocha';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { find, propEq } from "ramda";
import { VARIABLE_ACTIONS } from '../../../../labels';
import { GetterSetterActionProvider } from '../../../../lib/actionProviders/vars/getterSetterActionProvider';
import { replaceDocumentText } from '../../../utils';

suite('GetterSetterActionProvider Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    const dataFolder = path.resolve(__dirname, '../../../data');
    const testClass = path.join(dataFolder, 'getterSetterActionProvider.test.cls');
    let textDocument: vscode.TextDocument;
    let provider = new GetterSetterActionProvider();
    let initialState: string;

    Mocha.beforeEach(async () => {
        textDocument = await vscode.workspace.openTextDocument(testClass);
        initialState = textDocument.getText();
    });

    Mocha.afterEach(async () => {
        replaceDocumentText(textDocument, initialState);
    });

    const testAddGetSet = async (lineNumber: number, resultText: string) => {
        const label = VARIABLE_ACTIONS.ADD_GET_SET;
        const actionKind = vscode.CodeActionKind.Refactor;

        const position = new vscode.Position(lineNumber, 15);
        const actions = await provider.provideCodeActions(textDocument, new vscode.Range(position, position));
        const act = find(propEq('title', label), actions);
        if (!act) {
            assert.notEqual(act, undefined, `No action "${label}" found`);
            return;
        }
        assert.equal(act.title, label, 'title is different from expected');
        assert.equal(act.kind, actionKind, 'Action Kind is different from expected');
        assert.notEqual(act.edit, undefined, 'Edit must be set for action');
        if (act.edit) {
            await vscode.workspace.applyEdit(act.edit);
            const textAfter = textDocument.lineAt(lineNumber).text.trim();
            assert.equal(textAfter, resultText, 'Changed text is different from expected');
        }
    };

    test('non-variable type must provide no actions', async () => {
        const position = new vscode.Position(0, 15);
        const actions = await provider.provideCodeActions(textDocument, new vscode.Range(position, position));
        assert.equal(actions.length, 0, '0 actions must be returned');
    });

    test('"Add { get; set; }"', async () => {
        await testAddGetSet(1, 'public String stringVar { get; set; }');
    });

    test('"Add { get; set; }" to a line with trailing spaces', async () => {
        await testAddGetSet(2, 'public String stringVarWithSpaces { get; set; }');
    });

    test('"Add { get; set; }" to a line with trailing spaces', async () => {
        await testAddGetSet(5, 'public string innerClassVar { get; set; }');
    });
});
