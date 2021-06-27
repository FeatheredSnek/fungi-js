class Renderer {
  constructor (
    game,
    boardDOMElement,
    inventoryDOMElement,
    goldCounterDOMElement,
    timeCounterDOMElement) {
    this.game = game
    this.boardDOMElement = boardDOMElement
    this.inventoryDOMElement = inventoryDOMElement
    this.goldCounterDOMElement = goldCounterDOMElement
    this.timeCounterDOMElement = timeCounterDOMElement
    this.overlayDOMElement = overlayDOMElement
  }

  static animationTimes = {
    slotAction: 700,
    slotWarning: 500,
    buttonAction: 500,
    restartAction: 800
  }

  initialRender () {
    this.createBoard()
    this.createInventory()
    this.updateGoldCounter()
    this.updateTimeCounter()
  }

  createBoard () {
    this.game.board.forEach(slot =>
      this.createSlot(slot, this.game.board.indexOf(slot), this.boardDOMElement)
    )
  }

  createInventory () {
    this.game.inventory.slots.forEach(slot =>
      this.createSlot(slot, this.game.inventory.slots.indexOf(slot), this.inventoryDOMElement)
    )
  }

  createSlot (slotData, slotId, containerDOMElement) {
    // initialize empty slot
    let slotDOMElement = document.createElement('div')
    slotDOMElement.id = slotId
    slotDOMElement.classList.add('slot')
    let slotImage = document.createElement('img')
    slotDOMElement.append(slotImage)
    slotDOMElement.setAttribute('type', 'null')
    slotDOMElement.setAttribute('stage', 'null')
    containerDOMElement.append(slotDOMElement)
    // generate and add grassy background for board slots
    if (containerDOMElement == this.boardDOMElement) {
      slotDOMElement.setAttribute('style', this.getGrassBackgroundRule())
    }
    // render its contents
    this.renderSlot(slotData, slotDOMElement, true)
  }

  updateBoard () {
    for (let slotDOMElement of this.boardDOMElement.children) {
      this.updateBoardSlot(slotDOMElement)
    }
  }

  updateInventory () {
    for (let slotDOMElement of this.inventoryDOMElement.children) {
      this.updateInventorySlot(slotDOMElement)
    }
  }

  updateBoardSlot (slotDOMElement) {
    let slotData = this.game.board[slotDOMElement.id]
    this.renderSlot(slotData, slotDOMElement, true)
  }

  updateInventorySlot (slotDOMElement) {
    let slotData = this.game.inventory.slots[slotDOMElement.id]
    this.renderSlot(slotData, slotDOMElement, true)
  }

  renderSlot (slotData, slotDOMElement, animated) {
    let slotImage = slotDOMElement.children[0]
    // slot contents do not change => do nothing
    if (slotDOMElement.getAttribute('stage') == slotData.stage && slotDOMElement.getAttribute('type') == slotData.type) {
      return
    }
    // empty into full => grow
    // full into full => grow
    else if (slotData.type != null && slotData.stage != null) {
      slotDOMElement.setAttribute('type', slotData.type)
      slotDOMElement.setAttribute('stage', slotData.stage)
      slotImage.classList.remove('empty')
      slotImage.classList.add('full')
      slotImage.classList.add('grow')
      slotImage.src = this.getSlotImageSource(slotData.type, slotData.stage)
      slotImage.alt = this.getSlotDescription(slotData.type, slotData.stage)
      setTimeout(() => slotImage.classList.remove('grow'), Renderer.animationTimes.slotAction)
    }
    // full into empty => disappear
    else if (slotData.type == null && slotData.stage == null && slotImage.className == 'full') {
      slotDOMElement.setAttribute('type', slotData.type)
      slotDOMElement.setAttribute('stage', slotData.stage)
      slotImage.classList.add('disappear')
      setTimeout(() => {
        slotImage.src = ''
        slotImage.alt = 'empty slot'
        slotImage.className = 'empty'
      }, Renderer.animationTimes.slotAction)
    }
    // empty into empty => do nothing
    else if (slotData.type == null && slotData.stage == null && slotImage.className == 'empty') {
      return
    }
  }

  wiggleSlot (slotDOMElement) {
    let slotImage = slotDOMElement.children[0]
    slotImage.classList.add('wiggle')
    setTimeout(() => slotImage.classList.remove('wiggle'), Renderer.animationTimes.slotWarning)
  }

  wiggleInventory () {
    for (let slotElement of this.inventoryDOMElement.children) {
      this.wiggleSlot(slotElement)
    }
  }

  getSlotImageSource (type, stage) {
    return `images/fungi/${type}-${stage}.svg`
  }

  getSlotDescription (type, stage) {
    return `${type[0].toUpperCase() + type.slice(1)}, growth stage ${stage}`
  }

  updateGoldCounter () {
    let currentGold = this.goldCounterDOMElement.textContent
    let newGold = this.game.gold
    let goldCounterIcon = this.goldCounterDOMElement.previousElementSibling
    if (newGold > currentGold) {
      goldCounterIcon.classList.add('popout')
      setTimeout(function() {
        goldCounterIcon.classList.remove('popout')
      }, Renderer.animationTimes.buttonAction)
    }
    else {
      goldCounterIcon.classList.add('popdown')
      setTimeout(function() {
        goldCounterIcon.classList.remove('popdown')
      }, Renderer.animationTimes.buttonAction)
    }
    this.goldCounterDOMElement.className = newGold < 0 ? 'negative-value' : ''
    this.goldCounterDOMElement.textContent = this.game.gold
  }

  updateTimeCounter () {
    let timeCounterIcon = this.timeCounterDOMElement.previousElementSibling
    timeCounterIcon.classList.add('popout')
    setTimeout(() => timeCounterIcon.classList.remove('popout'), Renderer.animationTimes.buttonAction)
    this.timeCounterDOMElement.textContent = this.game.time
  }

  buttonPopIn (buttonDOMElement, small) {
    let classSizeName = small ? 'popin-small' : 'popin'
    buttonDOMElement.classList.add(classSizeName)
    setTimeout(() => buttonDOMElement.classList.remove(classSizeName), Renderer.animationTimes.buttonAction)
  }

  showOverlay () {
    this.overlayDOMElement.classList.remove('hidden')
    setTimeout(() => this.overlayDOMElement.classList.remove('invisible'), 50)
    setTimeout(() => this.overlayDOMElement.children[0].classList.remove('shifted-up'), 50)
  }

  hideOverlay () {
    this.overlayDOMElement.children[0].classList.add('shifted-down')
    this.overlayDOMElement.classList.add('invisible')
    setTimeout(() => this.overlayDOMElement.classList.add('hidden'), 550)
    setTimeout(() => this.overlayDOMElement.classList.add('shifted-up'), 600)
  }

  renderFailState () {
    this.showOverlay()
  }

  restart () {
    setTimeout(() => {
        this.updateBoard();
        this.updateInventory();
        this.updateGoldCounter();
        this.updateTimeCounter();
      },
    200)
    setTimeout(() => this.hideOverlay(), 100)
  }

  getGrassBackgroundRule () {
    let backgroundRule = 'background-image: '
    let backgroundPositionRule = 'background-position: '
    let backgroundRepeatRule = 'background-repeat: '
    let backgroundSizeRule = 'background-size: '
    let seed = Math.random()
    let blades = seed > 0.5 ? 2 : 3
    for (let i = 0; i < blades; i++) {
      seed = Math.random()
      let color = seed > 0.5 ? 'dark' : 'light'
      seed = Math.random()
      let size = seed < 0.33 ? 'small' : seed > 0.33 && seed < 0.66 ? 'medium' : 'big'
      let url = `url(images/ui/grass-${color}-${size}.svg)`
      let positionX = Math.floor(Math.random() * (90 - 10 + 1)) + 10
      let positionY = Math.floor(Math.random() * (90 - 10 + 1)) + 10
      let ending = i == blades - 1 ? ';' : ', '
      backgroundRule += `${url}${ending}`
      backgroundPositionRule += `${positionX}% ${positionY}%${ending}`
      backgroundRepeatRule += `no-repeat${ending}`
      backgroundSizeRule += `15%${ending}`
    }
    return backgroundRule + backgroundPositionRule + backgroundRepeatRule + backgroundSizeRule
  }

}
