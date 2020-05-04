import * as path from 'path';

import { runTests, resolveCliPathFromVSCodeExecutablePath, downloadAndUnzipVSCode } from 'vscode-test';
import { spawnSync } from 'child_process';

async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		// The path to test runner
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

        // Download VS Code, unzip it
        const vscodeExecutablePath = await downloadAndUnzipVSCode();
        const cliPath = resolveCliPathFromVSCodeExecutablePath(vscodeExecutablePath);
        spawnSync(cliPath, ['--install-extension', 'salesforce.salesforcedx-vscode-apex'], {
            encoding: 'utf-8',
            stdio: 'inherit'
        });

        // run the integration test
		await runTests({ extensionDevelopmentPath, extensionTestsPath });
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();
