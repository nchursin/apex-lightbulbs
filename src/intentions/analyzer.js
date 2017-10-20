const R = require('ramda')
const vscode = require('vscode');
const { getLineText } = require('../helpers')
const { ACTION_MAPPING, REGEX } = require('../constants')

const getType = (text) => R.compose(
  R.head,
  R.keys,
  R.filter(
    (rSet) => R.filter((r) => r.test(text), rSet).length
  )
)(REGEX)

const getAvaliableActions = (position) => {
  const doc = vscode.window.activeTextEditor.document

  const type = getType(getLineText(doc, position.line))
  return ACTION_MAPPING[type]
}

module.exports = {
  getAvaliableActions,
}
