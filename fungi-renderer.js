/*
HTML DOM renderer object. Keeps track of the game and
the DOM Nodes provided by the caller. Its job is to display and animate elements
based on the game's data.
It is by no means abstracted - it's quite tightly one-way coupled with the
Game class - it's build on top of the Game as its visual extension.
The renderer instance provides no responses or information to the external
controller that operates it - it just modifies the elements that were provided.
It would be possible to design it this way - so, for example, it would return
timings or even promises when animation is playing. However, I decided that the
renreder should be oblivious of that and resort to displaying.
*/

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
  // Timings are used internally or externally by the controller.
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

  /*
  Functions below deal with slots, both in the inventory or on the board.
  All of them depend primarily on the renderSlot function.
  */
  createSlot (slotData, slotId, containerDOMElement) {
    // Initialize empty slot
    let slotDOMElement = document.createElement('div')
    slotDOMElement.id = slotId
    slotDOMElement.classList.add('slot')
    let slotImage = document.createElement('img')
    slotDOMElement.append(slotImage)
    slotDOMElement.setAttribute('type', 'null')
    slotDOMElement.setAttribute('stage', 'null')
    containerDOMElement.append(slotDOMElement)
    // Generate and add grassy background for board slots
    if (containerDOMElement == this.boardDOMElement) {
      slotDOMElement.setAttribute('style', this.getGrassBackgroundRule())
    }
    // Render the slot's contents
    this.renderSlot(slotData, slotDOMElement, true)
  }

  /*
  Update functions may be called by the externall controller when there's
  a need to display the changes within the game.
  */
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

  /*
  renderSlot is the most important functionality of this renderer - based
  on the slotData provided it changes the visuals within slotDOMElement
  by operating on it's classList.
  The value of the 'animated' argument is not used.
  The function compares the properties of slotData - the current state of the
  slot provided by the game - with the properties of slotDOMElement - previously
  rendered state of the slot. Based on that it decides what to display and how
  to animate the transition. There are 5 possible cases:
  */
  renderSlot (slotData, slotDOMElement, animated) {
    let slotImage = slotDOMElement.children[0]
    // 1) Contents of a full slot do not change -> do nothing
    if (slotDOMElement.getAttribute('stage') == slotData.stage && slotDOMElement.getAttribute('type') == slotData.type) {
      return
    }
    // 2) Empty slot becomes full -> animate growth
    // 3) Full slot stays full -> animate growth
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
    // Full slot becomes empty -> animate disappearance
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
    // Empty slot stays empty -> do nothing
    else if (slotData.type == null && slotData.stage == null && slotImage.className == 'empty') {
      return
    }
  }

  /*
  Wiggling animation provides feedback when an illegal action is attempted
  */
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

  /*
  Two helper functions that transform raw slot data into appropriate strings
  */
  getSlotImageSource (type, stage) {
    return `images/fungi/${type}-${stage}.svg`
  }

  getSlotDescription (type, stage) {
    return `${type[0].toUpperCase() + type.slice(1)}, growth stage ${stage}`
  }

  /*
  Updating gold & time - 'score' - counters comes with a simple animation.
  As above, the renderer compares the actual data received from the game
  and the data that is currently displayed and acts accordingly.
  Updating gold counter is more complex as it involves (1) two animations - one
  for a gain and one for a loss of gold - and (2) visual indicator of
  a negative gold value.
  */
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

  /*
  Button's visual feedback, can be called with additional 'small' argument for
  a very little popin (indicating that an action is invalid)
  */
  buttonPopIn (buttonDOMElement, small) {
    let classSizeName = small ? 'popin-small' : 'popin'
    buttonDOMElement.classList.add(classSizeName)
    setTimeout(() => buttonDOMElement.classList.remove(classSizeName), Renderer.animationTimes.buttonAction)
  }

  /*
  Overlay is also controlled by manipulating classList - css classes themselves
  contain all the required animation data. Current overlay serves only
  one purpose - to inform the player of the GAME OVER state.
  */
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

  /*
  Arbitrary timing values below
  */
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

  /*
  This rather convoluted function returns a string that is used to style
  a board slot with some randomly generated grass background. The class list
  cannot be used here, so we style each element directly.
  */
  getGrassBackgroundRule () {
    // Multiple backgrounds are used, one for each blade of grass
    let backgroundRule = 'background-image: '
    let backgroundPositionRule = 'background-position: '
    let backgroundRepeatRule = 'background-repeat: '
    let backgroundSizeRule = 'background-size: '
    // Seed variable is reused with new values to increase readability a bit
    let seed = Math.random()
    // Background can contain 2 or 3 blades of grass
    let blades = seed > 0.5 ? 2 : 3
    // Each blade...
    for (let i = 0; i < blades; i++) {
      // ...may be light or dark colored...
      seed = Math.random()
      let color = seed > 0.5 ? 'dark' : 'light'
      // ...big, small or medium sized.
      seed = Math.random()
      let size = seed < 0.33 ? 'small' : seed > 0.33 && seed < 0.66 ? 'medium' : 'big'
      // Color and size determine which svg image will be used
      let url = `url(images/ui/grass-${color}-${size}.svg)`
      // Its position is randomized on both axes
      let positionX = Math.floor(Math.random() * (90 - 10 + 1)) + 10
      let positionY = Math.floor(Math.random() * (90 - 10 + 1)) + 10
      // For the last blade the rule string must end with ; for others with ,
      let ending = i == blades - 1 ? ';' : ', '
      // Information about the blade is converted and added to styling strings
      backgroundRule += `${url}${ending}`
      backgroundPositionRule += `${positionX}% ${positionY}%${ending}`
      backgroundRepeatRule += `no-repeat${ending}`
      backgroundSizeRule += `15%${ending}`
    }
    // Then all rules describing all the blades are returned and used by the slot generator
    return backgroundRule + backgroundPositionRule + backgroundRepeatRule + backgroundSizeRule
  }

}
