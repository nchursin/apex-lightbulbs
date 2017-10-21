const vscode = require('vscode')
const R = require('ramda')
const { firstWord, dropFirstWord, capitalize } = require('../../helpers')

const isComplexType = R.contains('<')

const getDefnMetadata = (t) => {
  let text = t
  const access = firstWord(text)
  text = dropFirstWord(text)
  const isStatic = text.toLowerCase().startsWith('static')
  if (isStatic) {
    text = dropFirstWord(text)
  }
  let varType
  if (isComplexType(text)) {
    // handling complex types like List<T> ot Map<K, V>
    const closingType = R.lastIndexOf('> ', text)
    varType = text.substring(0, closingType).trim()
    text = varType.replace(varType, '').trim()
  } else {
    varType = firstWord(text)
    text = dropFirstWord(text)
  }
  let varName = firstWord(text)
  if (varName.endsWith(';')) {
    varName = varName.slice(0, -1);
  }
  text = dropFirstWord(text)

  return {
    access,
    isStatic,
    varType,
    varName,
  }
}

const actGetter = (text) => {
  console.log('>> actGetter <<')
  console.log('text >> ', text)
  const metadata = getDefnMetadata(text)
  const staticKeyWord = metadata.isStatic ? ' static' : ''
  const thisKeyword = metadata.isStatic ? '' : 'this.'
  const result = `${metadata.access}${staticKeyWord} ${metadata.varType} get${capitalize(metadata.varName)}() {\n`
    + `\treturn ${thisKeyword}${metadata.varName};\n`
    + `}\n`
  console.log('result >> ', result)
  return result
}


module.exports = vscode.commands.registerCommand('apex-intention-actions.addGetter', actGetter)
