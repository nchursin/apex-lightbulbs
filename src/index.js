// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode')
const R = require('ramda')
const { getLineText } = require('./helpers')
const { getCodeLineType } = require('./intentions/analyzer')
const { DOC_SELECTOR, ACTION_MAPPING } = require('./constants')
const { getCodeActions, actions } = require('./intentions/actions')

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(ctx) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "apex-intention-actions" is now active!')

  const codeActionProvider = {
    provideCodeActions: (doc, range, ctx) => {
      const lineIntent = getCodeLineType(doc, range.start)
      // console.log('ctx >> ', ctx)
      // console.log('getCodeActions(ACTION_MAPPING[lineIntent]) >> ', getCodeActions(ACTION_MAPPING[lineIntent]))
      const result = R.map(R.assoc('arguments', getLineText(range.start.line)), getCodeActions(ACTION_MAPPING[lineIntent]))
      // console.log('result >> ', result)
      return result
    },
  }

  const prov = vscode.languages.registerCodeActionsProvider(DOC_SELECTOR, codeActionProvider)
  ctx.subscriptions.push(prov)
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand('apex-intention-actions.getActions', function () {
    // The code you place here will be executed every time your command is executed

    // Display a message box to the user
    // vscode.window.showInformationMessage('Hello World!');

    // const currentDoc = vscode.window.activeTextEditor.document
    const editor = vscode.window.activeTextEditor
    const position = editor.selection.active
    const currentActions = getCodeActions(position)
    // console.log('actions >> ', currentActions)
    return currentActions
  });

  ctx.subscriptions.push(disposable);
  R.forEach(ctx.subscriptions.push, actions)
}

// this method is called when your extension is deactivated
function deactivate() {
}

module.exports = {
  activate,
  deactivate,
}
