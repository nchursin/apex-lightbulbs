const R = require('ramda')
const { getLineText, firstWord, dropFirstWord, firstOfSplit } = require('../helpers')
const { REGEX, TYPES, CLASS_TYPES, SHARING_TYPES } = require('../constants')

const isComplexType = R.contains('<')

const getType = (text) => R.compose(
  R.head,
  R.keys,
  R.filter(
    (rSet) => R.filter((r) => r.test(text), rSet).length
  )
)(REGEX)

// param text shouldn't start with access or static or else. First part should be the type
const getVarType = R.ifElse(
  isComplexType,
  (text) => firstOfSplit(0, R.lastIndexOf('> ', text), text),
  firstWord
)

// (doc, position) => getType(getLineText(doc, position.line))
const getCodeLineType = R.compose(
  getType,
  getLineText
)

const getVarMetadata = (t) => {
  let text = t
  const access = firstWord(text)
  text = dropFirstWord(text)
  const isStatic = text.toLowerCase().startsWith('static')
  if (isStatic) {
    text = dropFirstWord(text)
  }
  const varType = getVarType(text)
  text = text.replace(varType, '').trim()
  let varName = firstWord(text)
  if (varName.endsWith(';')) {
    varName = varName.slice(0, -1)
  }
  text = dropFirstWord(text)

  return {
    access,
    isStatic,
    varType,
    varName,
  }
}

const getClassMetadata = (t) => {
  let text = t
  const access = firstWord(text)
  text = dropFirstWord(text)
  let sharing = SHARING_TYPES.INHERIT
  let classType = CLASS_TYPES.NORMAL
  if ('class' !== firstWord(text) && !R.startsWith('with', firstWord(text))) {
    classType = firstWord(text) === 'abstract'
      ? CLASS_TYPES.ABSTRACT
      : CLASS_TYPES.VIRTUAL
    text = dropFirstWord(text)
  }
  if ('class' !== firstWord(text) && R.startsWith('with', firstWord(text))) {
    sharing = firstWord(text) === 'with'
      ? sharing = SHARING_TYPES.WITH_SHARING
      : sharing = SHARING_TYPES.WITHOUT_SHARING
    text = dropFirstWord(dropFirstWord(text))
  }
  text = dropFirstWord(text)
  const className = firstWord(text)

  return {
    access,
    sharing,
    classType,
    className,
  }
}

const getDefnMetadata = (t) => {
  const defnType = getType(t)
  if (!defnType) {
    return
  }
  let metadata = {
    defnType,
  }
  switch (defnType) {
    case TYPES.CLASS:
      metadata = R.merge(metadata, getClassMetadata(t))
      console.log('class metadata >> ', metadata)
      break;
    case TYPES.VAR:
      metadata = R.merge(metadata, getVarMetadata(t))
      console.log('var metadata >> ', metadata)
      break;
    default:
      // skip
  }
  return metadata
}

module.exports = {
  getDefnMetadata,
  getCodeLineType,
}
