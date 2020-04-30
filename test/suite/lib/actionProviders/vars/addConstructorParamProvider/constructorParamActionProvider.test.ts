import * as assert from 'assert';
import * as path from 'path';
import * as Mocha from 'mocha';
import { promises as fsPromises } from 'fs';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { find, propEq } from "ramda";
import { VARIABLE_ACTIONS } from '@src/labels';
import { ConstructorParamActionProvider } from '@src/lib/actionProviders/vars/constructorParamActionProvider';
import { replaceDocumentText, getStubLanguageClient } from '@testutils';

const suiteName = 'ConstructorParamActionProvider Suite';

suite(suiteName, async () => {
    vscode.window.showInformationMessage(`Starting ${suiteName}...`);

    const dataFolder = path.resolve(__dirname, 'data');
    const testClass = path.join(dataFolder, 'Test1', 'Class.cls');

    let textDocument: vscode.TextDocument;
    let initialState: string;

    Mocha.before(async () => {
        // const langClient = await getStubLanguageClient(dataFolder);
        // provider = new ConstructorParamActionProvider(langClient);
    });

    Mocha.beforeEach(async () => {
        textDocument = await vscode.workspace.openTextDocument(testClass);
        initialState = textDocument.getText();
    });

    Mocha.afterEach(async () => {
        replaceDocumentText(textDocument, initialState);
    });

    test('addConstructorParam should add constructor param to existing constructor', async () => {
        const lineNumber = 1;
        const label = VARIABLE_ACTIONS.ADD_CONSTRUCTOR_PARAM;
        const actionKind = vscode.CodeActionKind.Refactor;

        const testCaseDataFolder = path.join(dataFolder, 'Test1');

        const expectedFilePath = path.join(testCaseDataFolder, 'Expected.cls');
        const expectedText = await fsPromises.readFile(expectedFilePath, 'utf8');

        const langClient = await getStubLanguageClient(testCaseDataFolder);
        const provider = new ConstructorParamActionProvider(langClient);

        const position = new vscode.Position(lineNumber, 15);
        const actions: vscode.CodeAction[] = await provider.provideCodeActions(textDocument, new vscode.Range(position, position));
        const act: vscode.CodeAction | undefined = find(propEq('title', label), actions);
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
            console.log('textAfter >> ', textAfter);
            console.log('expectedText >> ', expectedText);
            assert.equal(textAfter, expectedText, 'Changed text is different from expected');
        }
    });

    test('non-variable type must provide no actions', async () => {
        const testCaseDataFolder = path.join(dataFolder, 'Test1');
        const langClient = await getStubLanguageClient(testCaseDataFolder);
        const provider = new ConstructorParamActionProvider(langClient);

        const position = new vscode.Position(0, 15);
        const actions = await provider.provideCodeActions(textDocument, new vscode.Range(position, position));
        assert.equal(actions.length, 0, '0 actions must be returned');
    });
});
