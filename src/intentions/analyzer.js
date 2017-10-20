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

const getCodeLineType = (doc, position) => getType(getLineText(doc, position.line))

module.exports = {
  getCodeLineType,
}
