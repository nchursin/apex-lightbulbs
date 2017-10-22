const R = require('ramda')
const { getLineText, firstWord, dropFirstWord } = require('../helpers')
const { REGEX } = require('../constants')

const isComplexType = R.contains('<')

const getType = (text) => R.compose(
  R.head,
  R.keys,
  R.filter(
    (rSet) => R.filter((r) => r.test(text), rSet).length
  )
)(REGEX)

const getCodeLineType = (doc, position) => getType(getLineText(doc, position.line))

const getVarMetadata = (t) => {
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
    varType = text.substring(0, closingType + 1).trim()
    text = text.replace(varType, '').trim()
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

const getDefnMetadata = (t) => {
  const defnType = getType(t)
  let metadata = {
    defnType,
  }
  switch (defnType) {
    default:
      metadata = R.merge(metadata, getVarMetadata(t))
  }
  return metadata
}

module.exports = {
  getDefnMetadata,
  getCodeLineType,
}
