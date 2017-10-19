const R = require('ramda')

const getLineText = R.curry(
  (doc, lineNumber) => doc.getText(doc.lineAt(lineNumber).range).trim()
)


module.exports = {
  getLineText,
}
