const R = require('ramda')

module.exports.DOC_SELECTOR = 'apex'

const TYPES = module.exports.TYPES = {
  VAR: 'VAR',
  CLASS: 'CLASS',
  METHOD: 'METHOD',
  CONSTR: 'CONSTR',
}

const ACTION_NAMES = module.exports.ACTION_NAMES = {
  GETTER: 'Add getter',
  SETTER: 'Add setter',
  GETTER_SETTER: 'Add getter and setter',
  GET_SET: 'Add {get; set;}',
  CONSTRUCTOR: 'Add constructor',
  CONSTRUCTOR_PARAM: 'Add constructor parameter',
  OVERLOAD: 'Add overload',
}

module.exports.ACTION_MAPPING = {
  [TYPES.VAR]: [
    ACTION_NAMES.GETTER,
    ACTION_NAMES.SETTER,
    ACTION_NAMES.GETTER_SETTER,
    ACTION_NAMES.GET_SET,
    ACTION_NAMES.CONSTRUCTOR_PARAM,
  ],
  [TYPES.CLASS]: [
    ACTION_NAMES.CONSTRUCTOR,
  ],
  [TYPES.CONSTR]: [
    ACTION_NAMES.OVERLOAD,
  ],
  [TYPES.METHOD]: [
    ACTION_NAMES.OVERLOAD,
  ],
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const NUMBERS = '1234567890'
const SYMBOLS = '\.,<>_ '
const LETTERS_NUMBERS = `${LETTERS}${NUMBERS}`
const ALL_IN_ONE = `${LETTERS_NUMBERS}${SYMBOLS}`
const TYPE_REGEX = `([${ALL_IN_ONE}]+)`
const INDENT = '^(\\s*)\\w'

const varRegexes = {
  propDef: new RegExp(`(public|private|global|protected)\\s*(static){0,1}\\s+${TYPE_REGEX}\\s+(\\w+)\\s*;`),
  propDefGetSet: new RegExp(`(public|private|global|protected)\\s*(static){0,1}\\s+${TYPE_REGEX}\\s+(\\w+)\\s*\\{\\s*(get(;|\\{(.|\\n)*?\\}))\\s*(set(;|\\{(.|\\n)*?\\}))\\s*\\}`),
  propDefGetSetOptional: new RegExp(`((public|private|global|protected)\\s*(static){0,1}\\s+${TYPE_REGEX}\\s+(\\w+)\\s*(;|\\{\\s*(\\w*\\s*get(;|\\{(.|\\n)*?\\}))\\s*(\\w*\\s*set(;|\\{(.|\\n)*?\\}))\\s*\\}))`),
}
const classRegexes = {
  classDef: new RegExp(`((public|private|global|protected)\\s*(virtual|abstract|with sharing|without sharing){0,1}\\s+class\\s+(\\w+)\\s*.*{?)`),
  className: new RegExp(`(class\\s+(\\w+)\\s+.*{)`),
}
const methodRegexes = {}
const constrRegexes = {}

module.exports.REGEX = {
  [TYPES.VAR]: R.values(varRegexes),
  [TYPES.CLASS]: R.values(classRegexes),
  [TYPES.METHOD]: R.values(methodRegexes),
  [TYPES.CONSTR]: R.values(constrRegexes),
}
