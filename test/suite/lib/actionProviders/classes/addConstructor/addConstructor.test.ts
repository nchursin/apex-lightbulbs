import * as assert from 'assert';
import * as path from 'path';
import * as Mocha from 'mocha';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { find, propEq, replace } from "ramda";
import { CLASS_ACTIONS } from '../../../../../../src/labels';
import { AddConstructorProvider } from '../../../../../../src/lib/actionProviders/classes/addConstructorProvider';
import { replaceDocumentText, getStubLanguageClient } from '../../../../../utils';

suite('AddConstructorActionProvider Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    const dataFolder = path.resolve(__dirname, 'data');
    let textDocument: vscode.TextDocument;
    let provider: AddConstructorProvider;

    let initialState: string;

    Mocha.afterEach(async () => {
        replaceDocumentText(textDocument, initialState);
    });

    const prepareTestData = async (testCaseName: string) => {
        const testCaseDataFolder = path.join(dataFolder, testCaseName);
        const testClass = path.join(testCaseDataFolder, 'Class.cls');
        textDocument = await vscode.workspace.openTextDocument(testClass);
        initialState = textDocument.getText();

        const langClient = await getStubLanguageClient(testCaseDataFolder);
        provider = new AddConstructorProvider(langClient);
    };

    test('"Add constructor"', async () => {
        await prepareTestData('AddConstructor');

        const lineToReplace = 'public String stringVar;';
        const replacement = `${lineToReplace}\n\n    public Test() {\n    }`;
        const result = replace(lineToReplace, replacement, initialState);

        const label = CLASS_ACTIONS.ADD_CONSTRUCTOR;
        const actionKind = vscode.CodeActionKind.Refactor;
        const lineNumber = 0;

        const position = new vscode.Position(lineNumber, 5);
        const actions: vscode.CodeAction[] = await provider.provideCodeActions(textDocument, new vscode.Range(position, position));
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
            const textAfter = textDocument.getText();
            assert.equal(textAfter, result, 'Changed text is different from expected');
        }
    });

    test('No "Add constructor" action should be shown if one without params already exists', async () => {
        await prepareTestData('NEGAddConstructor');

        const label = CLASS_ACTIONS.ADD_CONSTRUCTOR;
        const lineNumber = 0;

        const position = new vscode.Position(lineNumber, 5);
        const actions: vscode.CodeAction[] = await provider.provideCodeActions(textDocument, new vscode.Range(position, position));
        const act = find(propEq('title', label), actions);
        assert.equal(act, undefined, `Constructor exists, bust action still shown`);
    });

    test('No "Add constructor" action should be shown if one with params already exists', async () => {
        await prepareTestData('NEGAddConstructor2');

        const label = CLASS_ACTIONS.ADD_CONSTRUCTOR;
        const lineNumber = 0;

        const position = new vscode.Position(lineNumber, 5);
        const actions: vscode.CodeAction[] = await provider.provideCodeActions(textDocument, new vscode.Range(position, position));
        const act = find(propEq('title', label), actions);
        assert.equal(act, undefined, `Constructor exists, bust action still shown`);
    });

    test('"Add constructor" for inner class', async () => {
        await prepareTestData('AddConstructorInner');

        const lineToReplace = 'public class InnerClass {';
        const replacement = `${lineToReplace}\n        public InnerClass() {\n        }`;
        const result = replace(lineToReplace, replacement, initialState);

        const label = CLASS_ACTIONS.ADD_CONSTRUCTOR;
        const actionKind = vscode.CodeActionKind.Refactor;
        const lineNumber = 3;

        const position = new vscode.Position(lineNumber, 5);
        const actions: vscode.CodeAction[] = await provider.provideCodeActions(textDocument, new vscode.Range(position, position));
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
            const textAfter = textDocument.getText();
            assert.equal(textAfter, result, 'Changed text is different from expected');
        }
    });

    test('if line type is not class declaration - no action must be provided', async () => {
        await prepareTestData('AddConstructor');

        const lineNumber = 1;
        const position = new vscode.Position(lineNumber, 5);
        const actions: vscode.CodeAction[] = await provider.provideCodeActions(textDocument, new vscode.Range(position, position));
        assert.equal(0, actions.length);
    });
});



