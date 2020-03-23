import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';

import { getLineMetadata, getFirstNonVarDefnLine } from '../../../../lib/lineType';
import { TYPES } from '../../../../constants';
import { keys } from 'ramda';
import { stub } from "sinon";
import { LanguageClient, ServerOptions } from 'vscode-languageclient';

const constructLineMeta = (type: string, isStatic: Boolean = false) => ({
    type,
    isStatic,
});

const TYPE_CHECK_TEST_CASES = {
    'public string varname;': constructLineMeta(TYPES.VAR),
    'string varname;': constructLineMeta(TYPES.VAR),
    'Private string varname ;': constructLineMeta(TYPES.VAR),
    'Protected     string    varname;': constructLineMeta(TYPES.VAR),
    'Public static string varname;': constructLineMeta(TYPES.VAR, true),
    'Public static st4231_ring var3124_name;': constructLineMeta(TYPES.VAR, true),
    '@testvisible private static st4231_ring var3124_name;': constructLineMeta(TYPES.VAR, true),
    '@testvisible static st4231_ring var3124_name;': constructLineMeta(TYPES.VAR, true),
    'static st4231_ring var3124_name;': constructLineMeta(TYPES.VAR, true),
    '@testvisible st4231_ring var3124_name;': constructLineMeta(TYPES.VAR),

    'public string methodName() {': constructLineMeta(TYPES.METHOD),

    'public class ClassName {': constructLineMeta(TYPES.CLASS),
    'public with sharing class classname {': constructLineMeta(TYPES.CLASS),
    'public without sharing class classname {': constructLineMeta(TYPES.CLASS),
    'public inherited sharing class classname {': constructLineMeta(TYPES.CLASS),
    'public abstract class ClassName {': constructLineMeta(TYPES.CLASS),
    'public virtual class ClassName {': constructLineMeta(TYPES.CLASS),
    'public class ClassName': constructLineMeta(TYPES.CLASS),
    'public virtual with sharing class ClassName': constructLineMeta(TYPES.CLASS),
    'Public class className': constructLineMeta(TYPES.CLASS),

    'Public static static  string varname;': {
        type: TYPES.UNKNOWN
    },
    'Public static static varname;': {
        type: TYPES.UNKNOWN
    },
    'Public class varname;': {
        type: TYPES.UNKNOWN
    },
    'Public static class varname;': {
        type: TYPES.UNKNOWN
    },
    'public': {
        type: TYPES.UNKNOWN
    },
};

const NON_VAR_LINE_TEST_CASES = {
    'Test1': 2,
    'Test2': 7,
    'Test3': 9,
    'Test4': 8,
    'Test5': 12,
    // 'Test6': 12,
};

suite('Line Type Analyzer Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

    test('run all test cases for getLineType', () => {
        const cases = keys(TYPE_CHECK_TEST_CASES);
        cases.forEach((key) => {
            const expected = TYPE_CHECK_TEST_CASES[key];
            const actual = getLineMetadata(key);
            assert.deepEqual(actual, expected, `Return result must be "${JSON.stringify(expected)}" for ${key}, actual: "${JSON.stringify(actual)}"`);
        });
    });

    test('get first non-var defn line number', async () => {

        const cases = keys(NON_VAR_LINE_TEST_CASES);
        await Promise.all(cases.map(async (fileName) => {
            const langClient = new LanguageClient('', { command: '' }, {});

            const expected = NON_VAR_LINE_TEST_CASES[fileName];
            const dataFolder = path.resolve(__dirname);
            const testClass = path.join(dataFolder, 'data', fileName, 'Class.cls');
            const documentSymbolFile = path.join(dataFolder, 'data', fileName, 'documentSymbol.json');
            const documentSymbolString = await fs.promises.readFile(documentSymbolFile, 'utf8');
            const documentSymbol = JSON.parse(documentSymbolString);
            const textDocument = await vscode.workspace.openTextDocument(testClass);
            stub(langClient, 'sendRequest').returns(Promise.resolve(documentSymbol));

            const actual = await getFirstNonVarDefnLine(textDocument, langClient);
            assert.equal(actual, expected, `First non-ver defn line number is different from expected for test: ${fileName}`);
            return Promise.resolve();
        }));

    });
});
