import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';

import { getLineMetadata } from '../../../lib/lineType';
import { TYPES } from '../../../constants';
import { keys } from 'ramda';

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

    'Public static static  string varname;': constructLineMeta(TYPES.UNKNOWN),
    // 'Public static static varname;': constructLineMeta(TYPES.UNKNOWN),
    'public': constructLineMeta(TYPES.UNKNOWN),
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
});
