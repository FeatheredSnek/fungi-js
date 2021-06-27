/*
This main class for the game object contains the board,
the inventory and the gold & time values.
It controls them via action functions (described below), which,
as the name suggests, dispatch actions to board or inventory elements.
Note that this class does not monitor the 'state' of a game i.e.
if a game is won or lost. Instead it returns action responses,
which then can be handled by the external controller displaying
fail/success states. This gives some more flexibility and
allows for easier testing.
*/

class Game {

  // This static enum style is used in Godot - you can easily notice allcaps
  static actionResponses = {
    'CONTINUE': 0,
    'SLOT_NOT_PICKABLE': 1,
    'INVENTORY_NOT_SELLABLE': 2,
    'INVENTORY_FULL' : 3,
    'NO_LEGAL_MOVES': 4
  }

  constructor (boardSize, inventorySize, settings) {
    // individually copy settings' values to this Game instance for easy access
    this.mushroomTable = settings.mushrooms
    this.advanceCost = settings.advanceCost
    this.pickupCost = settings.pickupCost
    this.pickupPenalty = settings.pickupPenalty
    this.pickupPenaltyExponent = settings.pickupPenaltyExponent
    this.stageBonusExponent = settings.stageBonusExponent
    this.sameTypeBonusMultiplier = settings.sameTypeBonusMultiplier
    this.sameStageBonusMultiplier = settings.sameStageBonusMultiplier
    this.tricolorBonus = settings.tricolorBonus
    /*
    The probability P of an event happening is often expressed as x/1
    however, when adjusting the growth settings or adding new fungi
    it would be tedious to manually calculate the probabilites so they sum to 1.
    The game does it by calculating probabilites as p(F1)/p(F1)+p(F2)+...+p(Fn).
    */
    this.frequencySum = settings.emptySlotFrequency
    settings.mushrooms.forEach(mushroom => this.frequencySum += mushroom.frequency)
    /*
    The probabilites of certain fungi appearing on board are stored in an array
    of tresholds. When a number between 0 and frequencySum is given we can then
    check into which treshold it falls - and the index of this treshold will be
    the index of a fungus that should be generated.
    */
    this.populationTresholds = []
    let currentTreshold = 0
    for (let mushroom of settings.mushrooms) {
      currentTreshold += mushroom.frequency
      this.populationTresholds.push(currentTreshold)
    }
    // This 0-1 number tells us the chance of an empty slot being repopulated.
    this.repopulationFactor = settings.repopulationFactor
    // 'Score' values, starting values are kept and used for resetting the game.
    this.startingGold = settings.startingGold
    this.gold = settings.startingGold
    this.maxGoldCap = settings.maxGoldCap
    this.time = 0
    // Generate inventory and an empty board.
    this.inventory = new Inventory(inventorySize)
    this.board = []
    for (let i = 0; i < boardSize; i++) {
      this.board.push(new Slot())
    }
  }

  /*
  These three small helper functions below are used by the 'action functions'
  to control the board. You may easily turn the board from an array-type property
  of the Game to a separate Board object - but it would be a glorified array
  with little extra functionality so I didn't bother.
  */
  clearBoard () {
    this.board.forEach(slot => slot.empty)
  }

  advanceBoard () {
    this.board.forEach(slot => slot.advance(this.mushroomTable, this.populationTresholds, this.frequencySum, this.repopulationFactor))
  }

  repopulateBoard () {
    this.clearBoard()
    this.advanceBoard()
  }

  /*
  Below are the 'action functions' - functions through which an external
  controller (user interface, machine learning program etc.) controls the game.
  Each action function returns an 'action response' that can be read by the
  external controller. In order to facilitate communication between the game
  and the controller the responses are stored as static enum values in the
  Game class (see above, before the constructor).
  */
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

  actionStart () {
    this.gold = this.startingGold
    this.time = 0
    this.inventory.empty()
    this.repopulateBoard()
  }

  /*
  This helper function tells the external controller whether the game is
  'continuable' or 'lost'. It checks four conditions:
  1) can the inventory be sold for a value that results in positive gold,
  2) can the board be advanced,
  3) can anything be picked up from the board.
  It returns NO_LEGAL_MOVES when no condition is met - i.e. when
  absolutely nothing can be done to gain gold in the next move.
  It is up to the external controller whether this results in an info,
  a warning or a gameover-type halt.
  */
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

  // Two helper functions for debug purposes
  previewInventory() {
    console.table(this.inventory)
  }
  previewBoard () {
    console.table(this.board)
  }

}
