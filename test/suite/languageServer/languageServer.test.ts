/*
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// tslint:disable:no-unused-expression

import { expect } from 'chai';
import { Uri } from 'vscode';
import { code2ProtocolConverter } from '@src/lib/languageServer/languageServer';
import { before, after } from 'mocha';

suite('Apex Language Server Client', () => {
  suite('Should properly handle sending URI to server on Windows', () => {
    let originalPlatform: PropertyDescriptor;

    before(() => {
      originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform')!;
      Object.defineProperty(process, 'platform', { value: 'win32' });
    });

    after(() => {
      Object.defineProperty(process, 'platform', originalPlatform);
    });

    test('Should only replace first :', () => {
      const actual = code2ProtocolConverter(
        Uri.parse('file:///c%3A/path/to/file/with%20%3A%20in%20name')
      );
      expect(actual).to.be.eql(
        'file:///c:/path/to/file/with%20%3A%20in%20name'
      );
    });
  });

  suite('Should properly handle sending URI to server on *nix', () => {
    let originalPlatform: PropertyDescriptor;

    before(() => {
      originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform')!;
      Object.defineProperty(process, 'platform', { value: 'darwin' });
    });

    after(() => {
      Object.defineProperty(process, 'platform', originalPlatform);
    });

    test('Should not replace first :', () => {
      const actual = code2ProtocolConverter(
        Uri.parse('file:///path/to/file/with%20%3A%20in%20name')
      );
      expect(actual).to.be.eql('file:///path/to/file/with%20%3A%20in%20name');
    });
  });
});
