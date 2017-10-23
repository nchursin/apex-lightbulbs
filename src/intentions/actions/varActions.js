const vscode = require('vscode')
const R = require('ramda')
const { capitalize } = require('../../helpers')
const { DEFAULT_ACCESS_LEVEL } = require('../../constants')

const handleStatic = (metadata) => ({
  staticKeyword: metadata.isStatic ? ' static' : '',
  thisKeyword: metadata.isStatic ? '' : 'this.',
})

const getter = (text, metadata) => {
  console.log('>> actGetter <<')
  console.log('text >> ', text)
  const { staticKeyword, thisKeyword } = handleStatic(metadata)
  const result = `${DEFAULT_ACCESS_LEVEL}${staticKeyword} ${metadata.varType} get${capitalize(metadata.varName)}() {\n`
    + `\treturn ${thisKeyword}${metadata.varName};\n`
    + `}\n`
  console.log('result >> ', result)
  return result
}

const setter = (text, metadata) => {
  console.log('>> actSetter <<')
  console.log('text >> ', text)
  const { staticKeyword, thisKeyword } = handleStatic(metadata)
  const result = `${DEFAULT_ACCESS_LEVEL}${staticKeyword} void set${capitalize(metadata.varName)}(${metadata.varType} value) {\n`
    + `\t${thisKeyword}${metadata.varName} = value;\n`
    + `}\n`
  console.log('result >> ', result)
  return result
}


module.exports = {
  getter: vscode.commands.registerCommand('apex-intention-actions.addGetter', getter),
  setter: vscode.commands.registerCommand('apex-intention-actions.addSetter', setter),
}
