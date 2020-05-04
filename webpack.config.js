//@ts-check

'use strict';

const path = require('path');

const root = __dirname;
const packageContent = require('./package.json');
const { mapObjIndexed } = require('ramda');

const alias = mapObjIndexed(
    (aliasContent, aliasName, obj) => path.resolve(root, aliasContent.replace('out/', '')),
    packageContent._moduleAliases
);

/**@type {import('webpack').Configuration}*/
const config = {
  target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/

  entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(root, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js'],
    alias,
    // : {
    //     "@src": path.resolve(root, "src"),
    //     "@utils": path.resolve(root, "src/lib/utils"),
    //     "@labels": path.resolve(root, "src/labels"),
    //     "@constants": path.resolve(root, "src/constants"),
    //     "@templates": path.resolve(root, "src/lib/templates"),
    //     "@languageServer": path.resolve(root, "src/lib/languageServer"),
    //     "@actionProviders": path.resolve(root, "src/lib/actionProviders"),
	// 	"@testutils": path.resolve(root, "out/test/utils"),
    // },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
    ]
  }
};
module.exports = config;
