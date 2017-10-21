const R = require('ramda')
const { ACTION_NAMES, ACTION_COMMANDS } = require('../../constants')
const getter = require('./actGetter')

const actions = {
  [ACTION_NAMES.GETTER]: getter,
}

const getCodeActions = (actions, args) => R.map((a) => {
  return {
    title: a,
    command: ACTION_COMMANDS[a],
    arguments: args,
  }
}, actions)

module.exports = {
  actions,
  getCodeActions,
}
