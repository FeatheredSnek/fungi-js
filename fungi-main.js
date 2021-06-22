const settings = Settings.getDefault()

const boardDOMElement = document.getElementById('board')
const inventoryDOMElement = document.getElementById('inventory')
const goldCounterDOMElement = document.getElementById('gold-counter')
const timeCounterDOMElement = document.getElementById('time-counter')
const overlayDOMElement = document.getElementById('overlay')

const buttonAdvanceDOMElement = document.getElementById('button-advance')
const buttonSellDOMElement = document.getElementById('button-sell')
const buttonRestartDOMElement = document.getElementById('button-restart')

let currentGame
let renderer

function advanceHandler () {
  renderer.buttonPopIn(this)
  let response = currentGame.advanceBoard()
  renderer.updateBoard()
  renderer.updateGoldCounter()
  if (response === Game.actionResponses.NO_LEGAL_MOVES) {
    failStateHandler()
  }
}

function slotPickupHandler () {
  let slotId = this.id
  let slotDOMElement = this
  let response = currentGame.pickUpFromBoard(this.id)
  if (response === Game.actionResponses.SLOT_NOT_PICKABLE) {
    renderer.wiggleSlot(slotDOMElement)
    renderer.renderWarning('slot_not_pickable')
  }
  else if (response === Game.actionResponses.INVENTORY_FULL) {
    renderer.wiggleSlot(slotDOMElement)
    renderer.renderWarning('inventory full, cant pick up')
  }
  else {
    renderer.updateBoardSlot(slotDOMElement)
    renderer.updateInventory()
    renderer.updateGoldCounter()
    if (response === Game.actionResponses.NO_LEGAL_MOVES) {
      failStateHandler()
    }
  }
}

function sellHandler () {
  let response = currentGame.sellInventory()
  if (response === Game.actionResponses.INVENTORY_NOT_SELLABLE) {
    renderer.buttonPopIn(this, 'small')
    renderer.wiggleInventory()
    renderer.renderWarning('inventory_not_sellable')
  }
  else {
    renderer.buttonPopIn(this)
    renderer.updateInventory()
    renderer.updateGoldCounter()
    renderer.updateTimeCounter()
    if (response === Game.actionResponses.NO_LEGAL_MOVES) {
      failStateHandler()
    }
  }
}

function failStateHandler () {
  renderer.renderFailState()
  removeEvents()
}

function restartHandler () {
  renderer.buttonPopIn(this)
  currentGame.restart()
  renderer.restart()
  connectEvents()
  console.log('restart');
}

function connectEvents () {
  for (let childNode of boardDOMElement.children) {
    childNode.addEventListener('click', slotPickupHandler)
  }
  buttonAdvanceDOMElement.addEventListener('click', advanceHandler)
  buttonSellDOMElement.addEventListener('click', sellHandler)
  buttonRestartDOMElement.addEventListener('click', restartHandler)
}

function removeEvents () {
  for (let childNode of boardDOMElement.children) {
    childNode.removeEventListener('click', slotPickupHandler)
  }
  buttonAdvanceDOMElement.removeEventListener('click', advanceHandler)
  buttonSellDOMElement.removeEventListener('click', sellHandler)
}

function _init() {
  currentGame = new Game(9, 3, settings)
  renderer = new Renderer(
    currentGame,
    boardDOMElement,
    inventoryDOMElement,
    goldCounterDOMElement,
    timeCounterDOMElement,
    overlayDOMElement
  )
  renderer.initialRender()
  connectEvents()
  console.log('start');
}


_init()
