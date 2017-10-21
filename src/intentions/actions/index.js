const R = require('ramda')
const { ACTION_NAMES, ACTION_COMMANDS } = require('../../constants')
const getter = require('./actGetter')

console.log('actions/index')

const actions = {
  [ACTION_NAMES.GETTER]: getter,
}

const getCodeActions = R.map((a) => {
  // console.log('actions >> ', actions)
  // console.log('a >> ', a)
  // console.log('actions[a] >> ', actions[a])
  return {
    title: a,
    command: ACTION_COMMANDS[a],
  }
})

module.exports = {
  actions,
  getCodeActions,
}
