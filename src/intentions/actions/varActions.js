const R = require('ramda')
const { capitalize } = require('../../helpers')
const { DEFAULT_ACCESS_LEVEL } = require('../../constants')
const { singleIndent } = require('../../helpers/indentation')

const handleStatic = (metadata) => ({
  staticKeyword: metadata.isStatic ? ' static' : '',
  thisKeyword: metadata.isStatic ? '' : 'this.',
})

const getter = (metadata) => {
  const { staticKeyword, thisKeyword } = handleStatic(metadata)
  const result = `${DEFAULT_ACCESS_LEVEL}${staticKeyword} ${metadata.varType} get${capitalize(metadata.varName)}() {\n`
    + `${singleIndent()}return ${thisKeyword}${metadata.varName};\n`
    + `}\n`
  return result
}

const setter = (metadata) => {
  const { staticKeyword, thisKeyword } = handleStatic(metadata)
  const result = `${DEFAULT_ACCESS_LEVEL}${staticKeyword} void set${capitalize(metadata.varName)}(${metadata.varType} value) {\n`
    + `${singleIndent()}${thisKeyword}${metadata.varName} = value;\n`
    + `}\n`
  return result
}

const getterSetter = (metadata) => `${getter(metadata)}\n${setter(metadata)}`

module.exports = {
  getter: getter,
  setter: setter,
  getterSetter: getterSetter,
}
