import * as moduleAlias from 'module-alias';
import * as path from 'path';
import { forEachObjIndexed } from 'ramda';
import { CodeLensResolveRequest } from 'vscode-languageclient';
const tsconfigContent = require('../../tsconfig.json');

//
// Register alias
//

const paths = tsconfigContent.compilerOptions.paths;
const extensionRoot = path.resolve(__dirname, '..', '..');

forEachObjIndexed(
    ([ aliasContent ]: string[], aliasName: string, obj: {}) => {
        const name = aliasName.replace('/*', '');
        const aliasPath = path.resolve(extensionRoot, 'out', aliasContent.replace('/*', ''));
        moduleAlias.addAlias(name,  aliasPath);
    }, paths
);
