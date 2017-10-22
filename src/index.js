// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode')
const R = require('ramda')
const { getLineText, logger } = require('./helpers')
const { getDefnMetadata } = require('./intentions/analyzer')
const { DOC_SELECTOR, ACTION_MAPPING, PLUGIN_NAME } = require('./constants')
const { getCodeActions, actions } = require('./intentions/actions')

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(ctx) {
  // Logger
  // TODO: find better way to log things
  logger()

  console.log('Congratulations, your extension "apex-intention-actions" is now active!')

  const codeActionProvider = {
    provideCodeActions: (doc, range, ctx) => {
      const text = getLineText(doc, range.start.line)
      try {
        const metadata = getDefnMetadata(text)
        const result = getCodeActions( ACTION_MAPPING[metadata.defnType], [ text, metadata ] )
        return result
      } catch (e) {
        console.log('e >> ', e)
      }
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
