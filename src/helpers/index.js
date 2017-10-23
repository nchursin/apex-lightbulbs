const R = require('ramda')
const { PLUGIN_NAME } = require('../constants')

const getLineText = R.curry(
  (doc, lineNumber) => doc.getText(doc.lineAt(lineNumber).range).trim()
)

const firstWord = R.compose(
  R.head,
  R.split(/[^\w]/)
)

const dropFirstWord = (t) => t.replace(firstWord(t), '').trim()

const capitalize = (text) => `${text.charAt(0).toUpperCase()}${text.slice(1)}`

const logger = () => {
  const oldLog = console.log
  const oldError = console.error
  const filename = R.join(':', R.split('/', R.last(R.split(PLUGIN_NAME, __filename))))
  console.log = function() {
    Array.prototype.unshift.call(arguments, `${PLUGIN_NAME}::`)
    oldLog.apply(this, arguments)
  }
  console.error = function() {
    Array.prototype.unshift.call(arguments, `${PLUGIN_NAME}::`)
    oldError.apply(this, arguments)
  }
}

module.exports = {
  getLineText,
  firstWord,
  dropFirstWord,
  capitalize,
  logger,
}
