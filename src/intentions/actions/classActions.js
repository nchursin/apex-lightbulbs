const R = require('ramda')
const { capitalize } = require('../../helpers')
const { DEFAULT_ACCESS_LEVEL } = require('../../constants')
const { singleIndent } = require('../../helpers/indentation')

// defnType:"CLASS"
// access:"public"
// sharing:"with sharing"
// classType:"normal"
// className:"FeatureToggleMgr"

const superConstr = R.ifElse(
  R.prop('isExtends'),
  () => `${singleIndent()}super();\n`,
  () => ''
)

const getConstructor = (metadata) => `${DEFAULT_ACCESS_LEVEL} ${metadata.className} {\n${superConstr(metadata)}${singleIndent()}// constructor\n}\n`

module.exports = {
  getConstructor: getConstructor,
}
