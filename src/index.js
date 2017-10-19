// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { getLineText } = require('./helpers')
const { getAvaliableActions } = require('./actions/analyzer')

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "apex-intention-actions" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand('extension.getActions', function () {
    // The code you place here will be executed every time your command is executed

    // Display a message box to the user
    // vscode.window.showInformationMessage('Hello World!');

    // const currentDoc = vscode.window.activeTextEditor.document
    const editor = vscode.window.activeTextEditor;
    const position = editor.selection.active
    const actions = getAvaliableActions(position)
    console.log('actions >> ', actions)
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {
}

module.exports = {
  activate,
  deactivate,
}
