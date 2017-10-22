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

const getCodeLineType = (doc, position) => getType(getLineText(doc, position.line))

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
  let sharing, classType
  if ('class' !== firstWord(text) && !R.startsWith('with', firstWord(text))) {
    if (firstWord(text) === 'abstract') {
      classType = CLASS_TYPES.ABSTRACT
    } else {
      classType = CLASS_TYPES.VIRTUAL
    }
    text = dropFirstWord(text)
  }
  if ('class' !== firstWord(text) && R.startsWith('with', firstWord(text))) {
    if (firstWord(text) === 'with') {
      sharing = SHARING_TYPES.WITH_SHARING
    } else {
      sharing = SHARING_TYPES.WITHOUT_SHARING
    }
    text = dropFirstWord(dropFirstWord(text))
  }
  text = dropFirstWord(text)
  const className = firstWord(text)
  if (!sharing) {
    sharing = SHARING_TYPES.INHERIT
  }
  if (!classType) {
    classType = CLASS_TYPES.NORMAL
  }
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
