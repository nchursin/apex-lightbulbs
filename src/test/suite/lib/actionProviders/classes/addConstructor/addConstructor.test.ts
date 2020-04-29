import * as assert from 'assert';
import * as path from 'path';
import * as Mocha from 'mocha';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { find, propEq, replace, keys } from "ramda";
import { CLASS_ACTIONS } from '../../../../../../labels';
import { AddConstructorProvider } from '../../../../../../lib/actionProviders/classes/addConstructorProvider';
import { replaceDocumentText, getStubLanguageClient } from '../../../../../utils';

suite('AddConstructorActionProvider Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    const dataFolder = path.resolve(__dirname, 'data', 'AddConstructor');
    const testClass = path.join(dataFolder, 'AddConstructor.test.cls');
    let textDocument: vscode.TextDocument;
    let provider: AddConstructorProvider;

    let initialState: string;

    Mocha.before(async () => {
        const langClient = await getStubLanguageClient(dataFolder);
        provider = new AddConstructorProvider(langClient);
    });

    Mocha.beforeEach(async () => {
        textDocument = await vscode.workspace.openTextDocument(testClass);
        initialState = textDocument.getText();
    });

    Mocha.afterEach(async () => {
        // replaceDocumentText(textDocument, initialState);
    });

    test('"Add constructor"', async () => {
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

    // test('"Add constructor" for inner class', async () => {
    //     const lineToReplace = 'public class InnerClass {';
    //     const replacement = `${lineToReplace}\n    public InnerClass() {\n    }`;
    //     const result = replace(lineToReplace, replacement, initialState);

    //     const label = CLASS_ACTIONS.ADD_CONSTRUCTOR;
    //     const actionKind = vscode.CodeActionKind.Refactor;
    //     const lineNumber = 3;

    //     const position = new vscode.Position(lineNumber, 5);
    //     const actions: vscode.CodeAction[] = await provider.provideCodeActions(textDocument, new vscode.Range(position, position));
    //     const act = find(propEq('title', label), actions);
    //     if (!act) {
    //         assert.notEqual(act, undefined, `No action "${label}" found`);
    //         return;
    //     }
    //     assert.equal(act.title, label, 'title is different from expected');
    //     assert.equal(act.kind, actionKind, 'Action Kind is different from expected');
    //     assert.notEqual(act.edit, undefined, 'Edit must be set for action');
    //     if (act.edit) {
    //         await vscode.workspace.applyEdit(act.edit);
    //         const textAfter = textDocument.getText();
    //         assert.equal(textAfter, result, 'Changed text is different from expected');
    //     }
    // });

    test('if line type is not class declaration - no action must be provided', async () => {
        const lineNumber = 1;
        const position = new vscode.Position(lineNumber, 5);
        const actions: vscode.CodeAction[] = await provider.provideCodeActions(textDocument, new vscode.Range(position, position));
        assert.equal(0, actions.length);
    });
});



