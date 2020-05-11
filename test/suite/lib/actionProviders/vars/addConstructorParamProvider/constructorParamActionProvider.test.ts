import * as assert from 'assert';
import * as path from 'path';
import * as Mocha from 'mocha';
import { promises as fsPromises } from 'fs';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { find, propEq } from "ramda";
import { VARIABLE_ACTIONS, PLACEHOLDERS } from '@src/labels';
import { ConstructorParamActionProvider } from '@src/lib/actionProviders/vars/constructorParamActionProvider';
import { replaceDocumentText, getStubLanguageClient } from '@testutils';
import { COMMANDS } from '@src/constants';
import { SinonStub, reset as stubReset, createSandbox, restore as restoreFunctions } from 'sinon';

const suiteName = 'ConstructorParamActionProvider Suite';

suite(suiteName, async () => {
    vscode.window.showInformationMessage(`Starting ${suiteName}...`);

    const dataFolder = path.resolve(__dirname, 'data');
    const stubSandbox = createSandbox();

    let textDocument: vscode.TextDocument;
    let initialState: string;
    let quickPickStub: SinonStub;
    let inputBoxStub: SinonStub;

    Mocha.before(async () => {
        quickPickStub = stubSandbox.stub(vscode.window, 'showQuickPick');
        inputBoxStub = stubSandbox.stub(vscode.window, 'showInputBox');
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

    const runTestCase = async (testDataFolder: string, lineNumber: number, isMultiConstructor: boolean = false, optionNumberToPick: number = 0) => {
        const label = VARIABLE_ACTIONS.ADD_CONSTRUCTOR_PARAM;
        const actionKind = vscode.CodeActionKind.Refactor;

        const testCaseDataFolder = path.join(dataFolder, testDataFolder);

        const testFilePath = path.join(testCaseDataFolder, 'Class.cls');
        const expectedFilePath = path.join(testCaseDataFolder, 'Expected.cls');
        const expectedText = await fsPromises.readFile(expectedFilePath, 'utf8');
        textDocument = await vscode.workspace.openTextDocument(testFilePath);
        initialState = textDocument.getText();

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

        if (!isMultiConstructor) {
            await testEditForSingleConstructorCases(act, expectedText);
        } else {
            await testCommandForMultiConstructorCases(act, expectedText, testCaseDataFolder, optionNumberToPick);
        }
    };

    const testEditForSingleConstructorCases = async (act: vscode.CodeAction, expectedText: string) => {
        assert.notEqual(act.edit, undefined, 'Edit must be set for action');
        if (act.edit) {
            await vscode.workspace.applyEdit(act.edit);
            const textAfter = textDocument.getText();
            assert.equal(textAfter, expectedText, 'Changed text is different from expected');
        }
    };

    const testCommandForMultiConstructorCases = async (
        act: vscode.CodeAction,
        expectedText: string,
        testCaseFolder: string,
        optionNumberToPick: number
    ) => {
        assert.notEqual(act.command, undefined, 'Command must be set for action');
        if (act.command) {
            const command: vscode.Command = act.command;
            assert.equal(command.command, COMMANDS.ADD_CONSTRUCTOR_PARAM, 'Command name is different from expected');
            const commands = await vscode.commands.getCommands();
            const filtered = commands.filter((c) => c === command.command);
            assert(Boolean(filtered.length), 'Command not registered');

            if (!act.command.arguments) {
                assert(false, 'No command arguments provided');
                return;
            }

            const quickPickOptionsFile = path.join(testCaseFolder, 'quickPickOptions.json');
            const quickPickOptions: vscode.QuickPickItem[] =
            JSON.parse(await fsPromises.readFile(quickPickOptionsFile, 'utf8'));
            quickPickStub.resolves(quickPickOptions[optionNumberToPick]);

            await vscode.commands.executeCommand(
                act.command.command,
                act.command.arguments[0],
                act.command.arguments[1],
                act.command.arguments[2]
            );

            assert(quickPickStub.calledOnce, 'showQuickPick is not called');
            assert(
                quickPickStub.calledWith(quickPickOptions),
                `QuickPickItems are different from expected: ${JSON.stringify(quickPickStub.args)}`
            );
            assert(
                quickPickStub.calledWith(
                    quickPickOptions,
                    { placeHolder: PLACEHOLDERS.ADD_CONSTRUCTOR_PARAM.QUICK_PICK_ARGS }
                ),
                `QuickPickOptions are different from expected: ${JSON.stringify(quickPickStub.args)}`
            );

            const textAfter = textDocument.getText();
            assert.equal(textAfter, expectedText, 'Changed text is different from expected');
        }
    };

    test('addConstructorParam should add constructor param to existing constructor', async () => {
        await runTestCase('Test1', 1);
    });

    test('addConstructorParam should add constructor param to existing constructor (space after declaration)', async () => {
        await runTestCase('Test1.1', 1);
    });

    test('addConstructorParam should add constructor param to existing constructor (space after declaration)', async () => {
        await runTestCase('Test1.2', 1);
    });

    test('addConstructorParam should add constructor param to existing constructor with param', async () => {
        await runTestCase('Test2', 2);
    });

    test('addConstructorParam should add constructor param to existing constructor with param (multiline)', async () => {
        await runTestCase('Test3', 2);
    });

    test('addConstructorParam should add constructor param to existing constructor (inner class)', async () => {
        await runTestCase('Test4', 9);
    });

    test('addConstructorParam should add constructor param to existing constructor (inner class)', async () => {
        await runTestCase('Test4.1', 10);
    });

    test('addConstructorParam should add constructor param to existing constructor (with inner class for top lvl)', async () => {
        await runTestCase('Test4.2', 1);
    });

    test('addConstructorParam should create constructor and add constructor param', async () => {
        await runTestCase('Test5', 1);
    });

    test('addConstructorParam should add constructor param to selected constructor', async () => {
        await runTestCase('Test6.1', 2, true, 1);
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
