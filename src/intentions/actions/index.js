const R = require('ramda')
const { ACTION_NAMES, ACTION_COMMANDS } = require('../../constants')
const { getter, setter } = require('./varActions')

const actions = {
  [ACTION_NAMES.GETTER]: getter,
  [ACTION_NAMES.SETTER]: setter,
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
