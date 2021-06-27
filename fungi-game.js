class Game {

  static actionResponses = {
    'CONTINUE': 0,
    'SLOT_NOT_PICKABLE': 1,
    'INVENTORY_NOT_SELLABLE': 2,
    'INVENTORY_FULL' : 3,
    'NO_LEGAL_MOVES': 4
  }

  constructor (boardSize, inventorySize, settings) {

    this.mushroomTable = settings.mushrooms
    this.advanceCost = settings.advanceCost
    this.pickupCost = settings.pickupCost
    this.pickupPenalty = settings.pickupPenalty
    this.pickupPenaltyExponent = settings.pickupPenaltyExponent
    this.stageBonusExponent = settings.stageBonusExponent
    this.sameTypeBonusMultiplier = settings.sameTypeBonusMultiplier
    this.sameStageBonusMultiplier = settings.sameStageBonusMultiplier
    this.tricolorBonus = settings.tricolorBonus

    this.frequencySum = settings.emptySlotFrequency
    settings.mushrooms.forEach(mushroom => this.frequencySum += mushroom.frequency)
    this.populationTresholds = []
    let currentTreshold = 0
    for (let mushroom of settings.mushrooms) {
      currentTreshold += mushroom.frequency
      this.populationTresholds.push(currentTreshold)
    }
    this.repopulationFactor = settings.repopulationFactor

    this.startingGold = settings.startingGold
    this.gold = settings.startingGold
    this.maxGoldCap = settings.maxGoldCap
    this.time = 0

    this.inventory = new Inventory(inventorySize)
    this.board = []
    for (let i = 0; i < boardSize; i++) {
      this.board.push(new Slot())
    }
  }

  clearBoard () {
    this.board.forEach(slot => slot.empty)
  }

  advanceBoard () {
    this.board.forEach(slot => slot.advance(this.mushroomTable, this.populationTresholds, this.frequencySum, this.repopulationFactor))
    this.previewBoard()
  }

  repopulateBoard () {
    this.clearBoard()
    this.advanceBoard()
  }

  actionAdvance () {
    this.advanceBoard()
    this.time += 1
    this.gold -= this.advanceCost
    return this.checkLegalMoves()
  }

  actionPickup (slotId) {
    if (this.board[slotId].isPickable() && !this.inventory.isFull()) {
      this.gold -= this.board[slotId].getPickupCost(this.pickupCost, this.pickupPenalty, this.pickupPenaltyExponent)
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

  actionSell() {
    let sellValue = this.inventory.sell(
      this.mushroomTable,
      this.stageBonusExponent,
      this.sameTypeBonusMultiplier,
      this.sameStageBonusMultiplier,
      this.tricolorBonus
    )
    if (sellValue) {
      this.gold = Math.min(this.gold + sellValue, this.maxGoldCap)
      return this.checkLegalMoves()
    }
    else {
      return Game.actionResponses.INVENTORY_NOT_SELLABLE
    }
  }

  checkLegalMoves () {
    let inventoryContentCondition = this.inventory.isFull()
    let inventoryValueCondition = this.inventory.getTotalValue(
      this.mushroomTable,
      this.stageBonusExponent,
      this.sameTypeBonusMultiplier,
      this.sameStageBonusMultiplier,
      this.tricolorBonus
    ) + this.gold > 0
    let inventoryCondition = inventoryContentCondition && inventoryValueCondition
    let advanceCondition = this.gold >= this.advanceCost
    let boardPickupCondition = false
    for (let slot of this.board) {
      if (slot.isPickable() && slot.getPickupCost(this.pickupCost, this.pickupPenalty, this.pickupPenaltyExponent) <= this.gold) {
        boardPickupCondition = true
      }
    }
    if (inventoryCondition || advanceCondition || boardPickupCondition) {
      return Game.actionResponses.CONTINUE
    }
    else {
      return Game.actionResponses.NO_LEGAL_MOVES
    }
  }

  start () {
    this.gold = this.startingGold
    this.time = 0
    this.inventory.empty()
    this.repopulateBoard()
  }

  previewInventory() {
    console.table(this.inventory)
  }

  previewBoard () {
    console.table(this.board)
  }

}
