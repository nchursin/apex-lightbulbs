// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode')
const R = require('ramda')
const { getLineText } = require('./helpers')
const { getCodeLineType } = require('./intentions/analyzer')
const { DOC_SELECTOR, ACTION_MAPPING, PLUGIN_NAME } = require('./constants')
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
      const result = getCodeActions(ACTION_MAPPING[lineIntent], [ getLineText(doc, range.start.line) ])
      return result
    },
  }

  const prov = vscode.languages.registerCodeActionsProvider(DOC_SELECTOR, codeActionProvider)
  ctx.subscriptions.push(prov)
  const disposable = vscode.commands.registerCommand(`${PLUGIN_NAME}.getActions`, function () {
    const editor = vscode.window.activeTextEditor
    const position = editor.selection.active
    const currentActions = getCodeActions(position)
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
