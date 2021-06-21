class Game {

  static actionResponses = {
    'CONTINUE': 0,
    'SLOT_NOT_PICKABLE': 1,
    'INVENTORY_NOT_SELLABLE': 2,
    'INVENTORY_FULL' : 3,
    'NO_LEGAL_MOVES': 4
  }

  constructor (boardSize, inventorySize, settings) {
    this.state = true
    this.mushroomTable = settings.mushrooms
    this.advanceCost = settings.advanceCost
    this.pickupCost = settings.pickupCost
    this.pickupPenalty = settings.pickupPenalty
    this.frequencySum = settings.emptySlotFrequency
    settings.mushrooms.forEach(mushroom => this.frequencySum += mushroom.frequency)
    this.populationTresholds = []
    let currentTreshold = 0
    for (let mushroom of settings.mushrooms) {
      currentTreshold += mushroom.frequency
      this.populationTresholds.push(currentTreshold)
    }
    this.repopulationFactor = settings.repopulationFactor
    this.gold = settings.startingGold
    this.time = 0
    this.inventory = new Inventory(inventorySize)
    this.board = []
    for (let i = 0; i < boardSize; i++) {
      this.board.push(new Slot())
      this.board[i].populateRandom(this.mushroomTable, this.populationTresholds, this.frequencySum)
    }
  }

  advanceBoard () {
    for (let slot of this.board) {
      slot.advance(this.mushroomTable, this.populationTresholds, this.frequencySum, this.repopulationFactor)
    }
    this.time += 1
    this.gold -= this.advanceCost
    return this.checkLegalMoves()
  }

  pickUpFromBoard (slotId) {
    // if (this.board[slotId].type != null && this.board[slotId].type != 'rock') {
    if (this.board[slotId].isPickable() && !this.inventory.isFull()) {
      this.gold -= this.board[slotId].getPickupCost(this.pickupCost, this.pickupPenalty)
      this.inventory.add(this.board[slotId].pickUp())
      return this.checkLegalMoves()
    }
    else if (this.inventory.isFull()) {
      return Game.actionResponses.INVENTORY_FULL
    }
    else {
      return Game.actionResponses.SLOT_NOT_PICKABLE
    }
  }

  sellInventory() {
    let sellValue = this.inventory.sell(this.mushroomTable)
    if (sellValue) {
      this.gold += sellValue
      return this.checkLegalMoves()
    }
    else {
      return Game.actionResponses.INVENTORY_NOT_SELLABLE
    }
  }

  checkLegalMoves () {
    let inventoryCondition = this.inventory.isFull()
    let advanceCondition = this.gold >= this.advanceCost
    let boardPickupCondition = false
    for (let slot of this.board) {
      if (slot.isPickable() && slot.getPickupCost(this.pickupCost, this.pickupPenalty) <= this.gold) {
        boardPickupCondition = true
      }
    }
    if (inventoryCondition || advanceCondition || boardPickupCondition) {
      return Game.actionResponses.CONTINUE
    }
    else {
      this.state = false
      return Game.actionResponses.NO_LEGAL_MOVES
    }
  }

  previewInventory() {
    console.table(this.inventory)
  }

  previewBoard () {
    console.table(this.board)
  }
}
