const { PLACERS, PLACER_OPERATION, BLOCK_NAMES } = require('../constants')
const vscode = require('vscode')

const endOfBlock = (range) => {
  const endPos = range.end
  const pos = new vscode.Position(endPos.line, 0)
  return new vscode.Range(pos, pos)
}

const startOfBlock = (range) => {
  const startPos = range.start
  const pos = new vscode.Position(startPos.line + 1, 0)
  return new vscode.Range(pos, pos)
}

const afterBlock = (range) => {
  const endPos = range.end
  const pos = new vscode.Position(endPos.line + 1, 0)
  return new vscode.Range(pos, pos)
}

const beforeBlock = (range) => {
  const startPos = range.start
  const pos = new vscode.Position(startPos.line, 0)
  return new vscode.Range(pos, pos)
}

const insteadOfBlock = (range) => range

module.exports = {
  [PLACERS.END_OF_BLOCK]: {
    operation: PLACER_OPERATION.INSERT,
    locator: endOfBlock,
  },
  [PLACERS.START_OF_BLOCK]: {
    operation: PLACER_OPERATION.INSERT,
    locator: startOfBlock,
  },
  [PLACERS.AFTER_BLOCK]: {
    operation: PLACER_OPERATION.INSERT,
    locator: afterBlock,
  },
  [PLACERS.BEFORE_BLOCK]: {
    operation: PLACER_OPERATION.INSERT,
    locator: beforeBlock,
  },
  [PLACERS.INSTEAD_OF_BLOCK]: {
    operation: PLACER_OPERATION.REPLACE,
    locator: insteadOfBlock,
  },
}
