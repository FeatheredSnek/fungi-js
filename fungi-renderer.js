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
      setTimeout(function() {
        slotImage.classList.remove('grow')
      }, 700)
    }
    // full into empty => disappear
    else if (slotData.type == null && slotData.stage == null && slotImage.className == 'full') {
      slotDOMElement.setAttribute('type', slotData.type)
      slotDOMElement.setAttribute('stage', slotData.stage)
      slotImage.classList.add('disappear')
      setTimeout(function() {
        slotImage.src = ''
        slotImage.alt = 'empty slot'
        slotImage.className = 'empty'
      }, 700)
    }
    // empty into empty => do nothing
    else if (slotData.type == null && slotData.stage == null && slotImage.className == 'empty') {
      return
    }
  }

  wiggleSlot (slotDOMElement) {
    let slotImage = slotDOMElement.children[0]
    slotImage.classList.add('wiggle')
    setTimeout(function() {
      slotImage.classList.remove('wiggle')
    }, 500)
  }

  wiggleInventory () {
    for (let slotElement of this.inventoryDOMElement.children) {
      this.wiggleSlot(slotElement)
    }
  }

  // popinSlot (slotDOMElement) {
  //   let slotImage = slotDOMElement.children[0]
  //   slotImage.classList.add('wiggle')
  //   setTimeout(function() {
  //     slotImage.classList.remove('wiggle')
  //   }, 500)
  // }
  //
  // animateSlot (slotDOMElement, animationName, animationTime) {
  //   let slotImage = slotDOMElement.children[0]
  //   slotImage.classList.add(animationName)
  //   setTimeout(function() {
  //     slotImage.classList.remove(animationName)
  //   }, animationTime)
  // }

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
      }, 500)
    }
    else {
      goldCounterIcon.classList.add('popdown')
      setTimeout(function() {
        goldCounterIcon.classList.remove('popdown')
      }, 500)
    }
    if (newGold < 0) {
      this.goldCounterDOMElement.className = 'negative'
    }
    else {
      this.goldCounterDOMElement.className = ''
    }
    this.goldCounterDOMElement.textContent = this.game.gold
  }

  updateTimeCounter () {
    let timeCounterIcon = this.timeCounterDOMElement.previousElementSibling
    timeCounterIcon.classList.add('popout')
    setTimeout(function() {
      timeCounterIcon.classList.remove('popout')
    }, 500)
    this.timeCounterDOMElement.textContent = this.game.time
  }

  buttonPopIn (buttonDOMElement) {
    buttonDOMElement.classList.add('popin')
    setTimeout(function() {
      buttonDOMElement.classList.remove('popin')
    }, 500)
  }

  renderWarning (warningType) {
    console.warn(warningType);
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
}
