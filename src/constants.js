const R = require('ramda')

module.exports.DOC_SELECTOR = 'apex'
const PLUGIN_NAME = module.exports.PLUGIN_NAME = 'apex-intention-actions'

const PLACERS = module.exports.PLACERS = {
  END_OF_BLOCK: 'END_OF_BLOCK',
  START_OF_BLOCK: 'START_OF_BLOCK',
  BEFORE_BLOCK: 'BEFORE_BLOCK',
  AFTER_BLOCK: 'AFTER_BLOCK',
  INSTEAD_OF_BLOCK: 'INSTEAD_OF_BLOCK',
  IN_CONSTRUCTOR: 'IN_CONSTRUCTOR',
}

module.exports.PLACER_OPERATION = {
  INSERT: 'INSERT',
  REPLACE: 'REPLACE',
}

module.exports.DEFAULT_ACCESS_LEVEL = 'public'

const TYPES = module.exports.TYPES = {
  VAR: 'VAR',
  CLASS: 'CLASS',
  METHOD: 'METHOD',
  CONSTR: 'CONSTR',
}

module.exports.CLASS_TYPES = {
  NORMAL: 'normal',
  ABSTRACT: 'abstract',
  VIRTUAL: 'virtual',
}

module.exports.SHARING_TYPES = {
  INHERIT: 'inherit',
  WITH_SHARING: 'with sharing',
  WITHOUT_SHARING: 'without sharing',
}

const ACTION_NAMES = module.exports.ACTION_NAMES = {
  GETTER: 'Add getter',
  SETTER: 'Add setter',
  GETTER_SETTER: 'Add getter and setter',
  // GET_SET: 'Add {get; set;}',
  CONSTRUCTOR: 'Add constructor',
  // CONSTRUCTOR_PARAM: 'Add constructor parameter',
  // OVERLOAD: 'Add overload',
}

module.exports.ACTION_COMMANDS = {
  [ACTION_NAMES.GETTER]: `${PLUGIN_NAME}.addGetter`,
  [ACTION_NAMES.SETTER]: `${PLUGIN_NAME}.addSetter`,
  [ACTION_NAMES.GET_SET]: `${PLUGIN_NAME}.addGetSet`,
  [ACTION_NAMES.GETTER_SETTER]: `${PLUGIN_NAME}.addGetterSetter`,
  [ACTION_NAMES.CONSTRUCTOR]: `${PLUGIN_NAME}.addConstructor`,
  [ACTION_NAMES.CONSTRUCTOR_PARAM]: `${PLUGIN_NAME}.addConstructorParam`,
  [ACTION_NAMES.OVERLOAD]: `${PLUGIN_NAME}.addOverload`,
}

module.exports.ACTION_MAPPING = {
  [TYPES.VAR]: [
    ACTION_NAMES.GETTER,
    ACTION_NAMES.SETTER,
    ACTION_NAMES.GETTER_SETTER,
    // ACTION_NAMES.GET_SET,
    // ACTION_NAMES.CONSTRUCTOR_PARAM,
  ],
  [TYPES.CLASS]: [
    ACTION_NAMES.CONSTRUCTOR,
  ],
  // [TYPES.CONSTR]: [
  //   ACTION_NAMES.OVERLOAD,
  // ],
  // [TYPES.METHOD]: [
  //   ACTION_NAMES.OVERLOAD,
  // ],
}

const BLOCK_NAMES = module.exports.BLOCK_NAMES = {
  FOLDABLE: 'FOLDABLE',
  SELF: 'SELF',
  CONSTRUCTOR: 'CONSTRUCTOR',
}

module.exports.ACTION_PLACERS = {
  [ACTION_NAMES.GETTER]: {
    BLOCK: BLOCK_NAMES.FOLDABLE,
    PLACE: PLACERS.END_OF_BLOCK,
  },
  [ACTION_NAMES.SETTER]: {
    BLOCK: BLOCK_NAMES.FOLDABLE,
    PLACE: PLACERS.END_OF_BLOCK,
  },
  [ACTION_NAMES.GET_SET]: {
    BLOCK: BLOCK_NAMES.SELF,
    PLACE: PLACERS.INSTEAD_OF_BLOCK,
  },
  [ACTION_NAMES.GETTER_SETTER]: {
    BLOCK: BLOCK_NAMES.FOLDABLE,
    PLACE: PLACERS.END_OF_BLOCK,
  },
  [ACTION_NAMES.CONSTRUCTOR]: {
    BLOCK: BLOCK_NAMES.FOLDABLE,
    PLACE: PLACERS.END_OF_BLOCK,
  },
  [ACTION_NAMES.CONSTRUCTOR_PARAM]: {
    BLOCK: BLOCK_NAMES.CONSTRUCTOR,
    PLACE: PLACERS.IN_CONSTRUCTOR,
  },
  [ACTION_NAMES.OVERLOAD]: {
    BLOCK: BLOCK_NAMES.FOLDABLE,
    PLACE: PLACERS.AFTER_BLOCK,
  },
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
