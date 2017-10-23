const R = require('ramda')
const { ACTION_NAMES, ACTION_COMMANDS } = require('../../constants')
const { getter, setter, getterSetter } = require('./varActions')
const { getConstructor } = require('./classActions')

const actions = {
  [ACTION_NAMES.GETTER]: getter,
  [ACTION_NAMES.SETTER]: setter,
  [ACTION_NAMES.GETTER_SETTER]: getterSetter,
  [ACTION_NAMES.CONSTRUCTOR]: getConstructor,
}

const getCodeActions = (acts, args) => R.map((a) => {
  return {
    title: a,
    command: ACTION_COMMANDS[a],
    arguments: args,
  }
}, acts)

module.exports = {
  actions,
  getCodeActions,
}
