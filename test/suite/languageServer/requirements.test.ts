/*
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// tslint:disable:no-unused-expression

import { expect } from 'chai';
import * as path from 'path';
import * as shell from 'shelljs';
import { workspace } from 'vscode';
import { JAVA_HOME_KEY, JAVA_MEMORY_KEY } from '@src/lib/languageServer/requirements';

suite('Java Requirements Test', () => {
  test('The jar should be signed', () => {
    shell.config.execPath = process.execPath;
    const apexJarPath = path.join(__dirname, '..', '..', '..', 'src', 'apex-jorje-lsp.jar');
    console.log(shell.exec(`ls ${path.join(__dirname, '..', '..', '..', 'src')}`).stdout);
    expect(
      shell
        .exec(`jarsigner -verify ${apexJarPath}`)
        .stdout.includes('jar verified')
    ).to.be.true;
  });

  test('Should have java.home section', () => {
    const config = workspace.getConfiguration();
    expect(config.has(JAVA_HOME_KEY)).to.be.true;
  });

  test('Should have java.memory section', () => {
    const config = workspace.getConfiguration();
    expect(config.has(JAVA_MEMORY_KEY)).to.be.true;
  });
});
