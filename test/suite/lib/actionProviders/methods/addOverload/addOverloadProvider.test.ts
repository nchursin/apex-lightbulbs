import * as assert from 'assert';
import * as path from 'path';
import * as Mocha from 'mocha';
import { promises as fsPromises } from 'fs';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { find, propEq, difference } from "ramda";
import { METHOD_ACTIONS, PLACEHOLDERS } from '@src/labels';
import { COMMANDS } from '@src/constants';
import { AddOverloadActionProvider } from '@src/lib/actionProviders/methods/addOverloadProvider';
import { replaceDocumentText, getStubLanguageClient } from '@testutils';
import { stub, reset as stubReset, SinonStub, restore as restoreFunctions } from "sinon";

const suiteName = 'AddOverloadProvider Suite';

suite(suiteName, async () => {
    vscode.window.showInformationMessage(`Starting ${suiteName}...`);

    const dataFolder = path.resolve(__dirname, 'data');

    let quickPickStub: SinonStub;
    let inputBoxStub: SinonStub;

    let textDocument: vscode.TextDocument;
    let initialState: string;

    Mocha.before(async () => {
        // const langClient = await getStubLanguageClient(dataFolder);
        // provider = new AddOverloadActionProvider(langClient);
        quickPickStub = stub(vscode.window, 'showQuickPick');
        inputBoxStub = stub(vscode.window, 'showInputBox');
    });

    Mocha.beforeEach(async () => {
    });

    Mocha.afterEach(async () => {
        replaceDocumentText(textDocument, initialState);
        stubReset();
    });

    Mocha.after(() => {
        restoreFunctions();
    });

    const runTestCase = async (testDataFolder: string, lineNumber: number, argNumToOverload: number, defaultValue: string) => {
        const label = METHOD_ACTIONS.ADD_OVERLOAD;
        const actionKind = vscode.CodeActionKind.Refactor;

        const testCaseDataFolder = path.join(dataFolder, testDataFolder);

        const testFilePath = path.join(testCaseDataFolder, 'Class.cls');
        const expectedFilePath = path.join(testCaseDataFolder, 'Expected.cls');
        const quickPickOptionsFile = path.join(testCaseDataFolder, 'quickPickOptions.json');
        const expectedText = await fsPromises.readFile(expectedFilePath, 'utf8');
        const quickPickOptions = JSON.parse(await fsPromises.readFile(quickPickOptionsFile, 'utf8'));
        textDocument = await vscode.workspace.openTextDocument(testFilePath);
        initialState = textDocument.getText();

        quickPickStub.resolves(quickPickOptions[argNumToOverload]);
        inputBoxStub.resolves(defaultValue);

        const langClient = await getStubLanguageClient(testCaseDataFolder);
        const provider = new AddOverloadActionProvider(langClient);

        const position = new vscode.Position(lineNumber, 15);

        const actions: vscode.CodeAction[] = await provider.provideCodeActions(textDocument, new vscode.Range(position, position));
        const act: vscode.CodeAction | undefined = find(propEq('title', label), actions);
        if (!act) {
            assert.notEqual(act, undefined, `No action "${label}" found`);
            return;
        }

        const commands = await vscode.commands.getCommands();
        const filtered = commands.filter((c) => c === COMMANDS.ADD_OVERLOAD);
        assert(filtered.length, 'Command not registered');

        assert.equal(act.title, label, 'title is different from expected');
        assert.equal(act.kind, actionKind, 'Action Kind is different from expected');
        assert.notEqual(act.command, undefined, 'Command must be set for action');
        if (act.command) {
            assert.equal(act.command.command, COMMANDS.ADD_OVERLOAD, 'Command is different from expected');
            if (!act.command.arguments) {
                assert(false, 'action.command.arguments is undefined');
                return;
            }
            await vscode.commands.executeCommand(act.command.command, act.command.arguments[0], act.command.arguments[1], act.command.arguments[2]);
            assert(quickPickStub.calledOnce, 'showQuickPick is not called');
            assert(quickPickStub.calledWith(quickPickOptions), `QuickPickItems are different from expected: ${JSON.stringify(quickPickStub.args)}`);
            assert(quickPickStub.calledWith(quickPickOptions, { placeHolder: PLACEHOLDERS.ADD_OVERLOAD.QUICK_PICK_ARGS }), 'QuickPickOptions are different from expected');

            assert(inputBoxStub.calledOnce, 'showInputBox is not called');
            assert(inputBoxStub.calledWith({ placeHolder: 'Enter default value' }), 'InputBoxOptions are different from expected');

            const textAfter = textDocument.getText();
            assert.equal(textAfter, expectedText, 'Changed text is different from expected');
        }
    };

    test('addOverload should add constructor param to existing constructor', async () => {
        await runTestCase('Test1', 1, 0, '\'cba\'');
    });

    test('addOverload should add constructor param to existing constructor', async () => {
        await runTestCase('Test1.1', 1, 0, '\'cba\'');
    });

    test('addOverload should add constructor param to existing constructor', async () => {
        await runTestCase('Test1.2', 2, 0, '\'cba\'');
    });

    test('non-method type must provide no actions', async () => {
        const testCaseDataFolder = path.join(dataFolder, 'TestNegative');
        const langClient = await getStubLanguageClient(testCaseDataFolder);
        const provider = new AddOverloadActionProvider(langClient);

        const position = new vscode.Position(0, 15);
        const actions = await provider.provideCodeActions(textDocument, new vscode.Range(position, position));
        assert.equal(actions.length, 0, '0 actions must be returned');
    });

    test('method with no args must provide no actions', async () => {
        const testCaseDataFolder = path.join(dataFolder, 'TestNegative');
        const langClient = await getStubLanguageClient(testCaseDataFolder);
        const provider = new AddOverloadActionProvider(langClient);

        const position = new vscode.Position(1, 15);
        const actions = await provider.provideCodeActions(textDocument, new vscode.Range(position, position));
        assert.equal(actions.length, 0, '0 actions must be returned');
    });
});
