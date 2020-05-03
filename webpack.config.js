//@ts-check

'use strict';

const path = require('path');

/**@type {import('webpack').Configuration}*/
const config = {
  target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/

  entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
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
    alias: {
        "@src": path.resolve(__dirname, "src"),
        "@assets": path.resolve(__dirname, "assets"),
        "@utils": path.resolve(__dirname, "src/lib/utils"),
        "@labels": path.resolve(__dirname, "src/labels"),
        "@constants": path.resolve(__dirname, "src/constants"),
        "@templates": path.resolve(__dirname, "src/lib/templates"),
        "@languageServer": path.resolve(__dirname, "src/lib/languageServer"),
        "@actionProviders": path.resolve(__dirname, "src/lib/actionProviders"),
    },
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
      {
        test: /\.apex$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'raw-loader'
          }
        ]
      },
    ]
  }
};
module.exports = config;
