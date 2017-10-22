const vscode = require('vscode')
const R = require('ramda')
const { capitalize } = require('../../helpers')
const { DEFAULT_ACCESS_LEVEL } = require('../../constants')

const actGetter = (text, metadata) => {
  console.log('>> actGetter <<')
  console.log('text >> ', text)
  const staticKeyWord = metadata.isStatic ? ' static' : ''
  const thisKeyword = metadata.isStatic ? '' : 'this.'
  const result = `${DEFAULT_ACCESS_LEVEL}${staticKeyWord} ${metadata.varType} get${capitalize(metadata.varName)}() {\n`
    + `\treturn ${thisKeyword}${metadata.varName};\n`
    + `}\n`
  console.log('result >> ', result)
  return result
}


module.exports = vscode.commands.registerCommand('apex-intention-actions.addGetter', actGetter)
