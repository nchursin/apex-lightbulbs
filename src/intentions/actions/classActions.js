const vscode = require('vscode')
const R = require('ramda')
const { capitalize } = require('../../helpers')
const { DEFAULT_ACCESS_LEVEL } = require('../../constants')

// defnType:"CLASS"
// access:"public"
// sharing:"with sharing"
// classType:"normal"
// className:"FeatureToggleMgr"

const getConstructor = (metadata) => `${DEFAULT_ACCESS_LEVEL} ${metadata.className} {\n\t// constructor\n}\n`

module.exports = {
  getConstructor: vscode.commands.registerCommand('apex-intention-actions.addConstructor', getConstructor),
}
