const R = require('ramda')
const vscode = require('vscode')
const { ACTION_NAMES, ACTION_COMMANDS, ACTION_PLACERS, PLACER_OPERATION } = require('../../constants')
const { getter, setter, getterSetter } = require('./varActions')
const { getConstructor } = require('./classActions')
const { addIndentation, getLinesFoldableRegion } = require('../../helpers/indentation')
const locators = require('../../helpers/locators')

const ACTIONS = {
  [ACTION_NAMES.GETTER]: getter,
  [ACTION_NAMES.SETTER]: setter,
  [ACTION_NAMES.GETTER_SETTER]: getterSetter,
  [ACTION_NAMES.CONSTRUCTOR]: getConstructor,
}

const curryBinCompose = R.curry(R.binary(R.compose))

const respectIndents = curryBinCompose(addIndentation)

const registerCommand = vscode.commands.registerCommand

const finalizeMetadata = (actionName) => {
  const generateCode = respectIndents(ACTIONS[actionName])
  return (metadata) => Object.assign(
    metadata,
    {
      code: generateCode(metadata),
      placingAction: locators[ACTION_PLACERS[actionName].PLACE].operation,
      location: locators[ACTION_PLACERS[actionName].PLACE].locator(getLinesFoldableRegion(metadata.lineNumber)),
      block: ACTION_PLACERS[actionName].BLOCK,
    })
}

const applyAction = (finalMeta) => {
  const editor = vscode.window.activeTextEditor
  editor.edit((editBuilder) => {
    console.log('finalMeta.placingAction >> ', finalMeta.placingAction)
    // const place = PLACER_OPERATION.REPLACE === finalMeta.placingAction
    //   ? editBuilder.replace
    //   : editBuilder.insert
    const location = PLACER_OPERATION.REPLACE === finalMeta.placingAction
      ? finalMeta.location
      : finalMeta.location.start
    console.log('location >> ', location)
    console.log('finalMeta.code >> ', finalMeta.code)
    // await place(location, finalMeta.code)
    if (PLACER_OPERATION.REPLACE === finalMeta.placingAction) {
      console.log('replacing')
      editBuilder.replace(location, finalMeta.code)
      console.log('done')
    } else {
      console.log('inserting')
      editBuilder.insert(location, finalMeta.code)
      console.log('done')
    }
  })
}

const action = (actionName) => {
  return R.compose(
    applyAction,
    finalizeMetadata(actionName)
  )
}

const actions = {
  [ACTION_NAMES.GETTER]: registerCommand(ACTION_COMMANDS[ACTION_NAMES.GETTER], action(ACTION_NAMES.GETTER)),
  [ACTION_NAMES.SETTER]: registerCommand(ACTION_COMMANDS[ACTION_NAMES.SETTER], action(ACTION_NAMES.SETTER)),
  [ACTION_NAMES.GETTER_SETTER]: registerCommand(ACTION_COMMANDS[ACTION_NAMES.GETTER_SETTER], action(ACTION_NAMES.GETTER_SETTER)),
  [ACTION_NAMES.CONSTRUCTOR]: registerCommand(ACTION_COMMANDS[ACTION_NAMES.CONSTRUCTOR], action(ACTION_NAMES.CONSTRUCTOR)),
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
