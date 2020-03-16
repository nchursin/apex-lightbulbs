import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';

import { getLineType } from '../../../lib/lineType';
import { TYPES } from '../../../constants';
import { keys } from 'ramda';

const TYPE_CHECK_TEST_CASES = {
    'public string varname;': TYPES.VAR,
    'string varname;': TYPES.VAR,
    'Private string varname ;': TYPES.VAR,
    'Protected     string    varname;': TYPES.VAR,
    'Public static string varname;': TYPES.VAR,
    'Public static st4231_ring var3124_name;': TYPES.VAR,
    '@testvisible private static st4231_ring var3124_name;': TYPES.VAR,
    '@testvisible static st4231_ring var3124_name;': TYPES.VAR,
    'static st4231_ring var3124_name;': TYPES.VAR,
    '@testvisible st4231_ring var3124_name;': TYPES.VAR,

    'Public static static  string varname;': TYPES.UNKNOWN,
    'public': TYPES.UNKNOWN,
};

suite('Line Type Analyzer Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

    test('run all test cases for getLineType', () => {
        const cases = keys(TYPE_CHECK_TEST_CASES);
        cases.forEach((key) => {
            const expected = TYPE_CHECK_TEST_CASES[key];
            const actual = getLineType(key);
            assert.equal(actual, expected, `Return result must be "${expected}" for ${key}`);
        });
    });
});