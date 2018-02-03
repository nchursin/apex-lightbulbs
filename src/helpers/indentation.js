const R = require('ramda')
const vscode = require('vscode')


const repeatString = R.curry(R.compose(
  R.join(''),
  R.repeat
))

const editor = () => vscode.window.activeTextEditor
const position = () => editor().selection.active
const document = () => editor().document
const isSpaceIndent = () => editor().options.insertSpaces
const tabSize = () => editor().options.tabSize
const singleIndent = () => isSpaceIndent() ? repeatString(' ', tabSize()) : '\t'

const toSpaces = R.compose(
  R.join(''),
  R.map(
    R.ifElse(
      R.equals('\t'),
      R.compose(repeatString(' '), tabSize),
      R.identity
    )
  )
)

const isWhiteSpace = R.unary(R.converge(R.or, [R.equals(' '), R.equals('\t')]))

const getPosText = R.curry(
  (doc, pos) => doc.getText(doc.lineAt(pos.line).range)
)

const getLeadingSpaces = R.reduceWhile(R.flip(isWhiteSpace), R.concat, '')

// returns number of whitespaces at the start of the string
const getIndent = R.compose(
  R.prop('length'),
  toSpaces,
  getLeadingSpaces,
  getPosText(document())
)

const getStartLine = (pos, indent) => {
  for (let i = pos.line - 1; 1 <= i; i--) {
    if (indent > getIndent(new vscode.Position(i, 0))) {
      return i
    }
  }
  return 0
}

const getEndLine = (pos, indent) => {
  for (let i = pos.line + 1; i <= document().lineCount; i++) {
    if (indent > getIndent(new vscode.Position(i, 0))) {
      return i
    }
  }
  return document().lineCount - 1
}

const getFoldableRegion = (pos) => {
  const indent = getIndent(pos)

  const startPos = new vscode.Position(getStartLine(pos, indent), 0)
  const endPos = document().lineAt(getEndLine(pos, indent)).range.end

  return new vscode.Range(startPos, endPos)
}

const getLinesFoldableRegion = (lineNumber) => getFoldableRegion(new vscode.Position(lineNumber, 0))

const addIndentation = R.compose(
  R.join('\n'),
  R.map(
    R.ifElse(
      R.prop('length'),
      R.concat(singleIndent()),
      R.identity
    )
  ),
  R.split('\n')
)

module.exports = {
  getFoldableRegion,
  getLinesFoldableRegion,
  singleIndent,
  getIndent,
  addIndentation,
}
