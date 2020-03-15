import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';

import { getLineType } from '../../lib/lineType';
import { TYPES } from '../../constants';

suite('Line Type Analyzer Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('"public string varname;" must be variable', () => {
        const lineText = 'public string varname;';
        const result = getLineType(lineText);
        assert.equal(result, TYPES.VAR, `Return result must be "${TYPES.VAR}" for ${lineText}`);
	});

	test('"public" must be unknown', () => {
        const lineText = 'public';
        const result = getLineType(lineText);
        assert.equal(result, TYPES.UNKNOWN, `Return result must be "${TYPES.UNKNOWN}" for ${lineText}`);
	});

	test('"Private string varname ;" must be variable', () => {
        const lineText = 'Private string varname ;';
        const result = getLineType(lineText);
        assert.equal(result, TYPES.VAR, `Return result must be "${TYPES.VAR}" for ${lineText}`);
	});
});
