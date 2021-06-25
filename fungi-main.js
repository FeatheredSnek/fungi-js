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
let control

function advanceHandler () {
  if (control) {
    lockControls(Renderer.animationTimes.slotAction)
    let response = currentGame.advanceBoard()
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
  if (control) {
    let slotId = this.id
    let slotDOMElement = this
    let response = currentGame.pickUpFromBoard(this.id)
    if (response === Game.actionResponses.SLOT_NOT_PICKABLE) {
      lockControls(Renderer.animationTimes.slotWarning)
      renderer.wiggleSlot(slotDOMElement)
      renderer.renderWarning('slot_not_pickable')
    }
    else if (response === Game.actionResponses.INVENTORY_FULL) {
      lockControls(Renderer.animationTimes.slotWarning)
      renderer.wiggleSlot(slotDOMElement)
      renderer.renderWarning('inventory full, cant pick up')
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
  if (control) {
    let response = currentGame.sellInventory()
    if (response === Game.actionResponses.INVENTORY_NOT_SELLABLE) {
      lockControls(Renderer.animationTimes.slotWarning)
      renderer.buttonPopIn(this, 'small')
      renderer.wiggleInventory()
      renderer.renderWarning('inventory_not_sellable')
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
  currentGame.start()
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
  control = false
  setTimeout(() => {
    control = true
  }, lockTime)
}

function _init() {
  control = true
  currentGame = new Game(9, 3, settings)
  renderer = new Renderer(
    currentGame,
    boardDOMElement,
    inventoryDOMElement,
    goldCounterDOMElement,
    timeCounterDOMElement,
    overlayDOMElement
  )
  currentGame.start()
  renderer.initialRender()
  connectEvents()
  console.log('start');
}


_init()
