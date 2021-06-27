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
let controlState

function advanceHandler () {
  if (controlState) {
    lockControls(Renderer.animationTimes.slotAction)
    let response = currentGame.actionAdvance()
    renderer.updateBoard()
    renderer.updateTimeCounter()
    renderer.updateGoldCounter()
    renderer.buttonPopIn(this)
    if (response === Game.actionResponses.NO_LEGAL_MOVES) {
      failStateHandler()
    }
  }
}

function slotPickupHandler () {
  if (controlState) {
    let slotId = this.id
    let slotDOMElement = this
    let response = currentGame.actionPickup(this.id)
    if (response === Game.actionResponses.SLOT_NOT_PICKABLE) {
      lockControls(Renderer.animationTimes.slotWarning)
      renderer.wiggleSlot(slotDOMElement)
    }
    else if (response === Game.actionResponses.INVENTORY_FULL) {
      lockControls(Renderer.animationTimes.slotWarning)
      renderer.wiggleSlot(slotDOMElement)
    }
    else {
      lockControls(Renderer.animationTimes.slotAction)
      renderer.updateInventory()
      renderer.updateGoldCounter()
      renderer.updateBoardSlot(slotDOMElement)
      if (response === Game.actionResponses.NO_LEGAL_MOVES) {
        failStateHandler()
      }
    }
  }
}

function sellHandler () {
  if (controlState) {
    let response = currentGame.actionSell()
    if (response === Game.actionResponses.INVENTORY_NOT_SELLABLE) {
      lockControls(Renderer.animationTimes.slotWarning)
      renderer.buttonPopIn(this, 'small')
      renderer.wiggleInventory()

    }
    else {
      lockControls(Renderer.animationTimes.buttonAction)
      renderer.updateInventory()
      renderer.updateGoldCounter()
      renderer.updateTimeCounter()
      renderer.buttonPopIn(this)
      if (response === Game.actionResponses.NO_LEGAL_MOVES) {
        failStateHandler()
      }
    }
  }
}

function restartHandler () {
  lockControls(Renderer.animationTimes.restartAction)
  renderer.buttonPopIn(this)
  currentGame.actionStart()
  renderer.restart()
  connectEvents()
  console.log('restart');
}

function failStateHandler () {
  renderer.renderFailState()
  removeEvents()
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

function lockControls (lockTime) {
  controlState = false
  setTimeout(() => {
    controlState = true
  }, lockTime)
}

function _init() {
  controlState = true
  currentGame = new Game(9, 3, Settings.getDefault())
  renderer = new Renderer(
    currentGame,
    boardDOMElement,
    inventoryDOMElement,
    goldCounterDOMElement,
    timeCounterDOMElement,
    overlayDOMElement
  )
  currentGame.actionStart()
  renderer.initialRender()
  connectEvents()
}


_init()
