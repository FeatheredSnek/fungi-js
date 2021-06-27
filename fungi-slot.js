/*
Rudimentary slot object that knows nothing about the world around it.
Still, it can populate and advance itself, given that it receives
appropriate data from its parent.
Provides functionalities required by the board and the inventory.
*/

class Slot {
  constructor () {
    this.type = null
    this.stage = null
  }

  // Debug mode of population, not used anywhere
  populateFixed (_type, _stage) {
    this.type = _type
    this.stage = _stage
  }

  // Proper mode of population - requires data about population conditions
  populateRandom (mushroomTable, tresholdTable, frequencySum) {
    let seed = Math.random() * frequencySum
    this.type = null
    this.stage = null
    for (let treshold of tresholdTable) {
      if (treshold > seed) {
        this.type = mushroomTable[tresholdTable.indexOf(treshold)].name
        this.type == 'rock' ? this.stage = 3 : this.stage = 1
        return
      }
    }
  }

  /*
  Three functions below (each named with a single verb) are used to control
  the slot and are usually called by its parent (board or inventory).
  */
  pickUp () {
    let returnType = this.type
    let returnStage = this.stage
    this.empty()
    return [returnType, returnStage]
  }

  empty () {
    this.type = null
    this.stage = null
  }

  advance (mushroomTable, tresholdTable, frequencySum, repopulationFactor) {
    if (this.type != null && this.type != 'rock') {
      if (this.stage < 3) {
        this.stage += 1
      }
      else {
        this.empty()
      }
    }
    else if (this.type == 'rock') {
      if (this.stage > 1) {
        this.stage -= 1
      }
      else {
        this.type = null
        this.stage = null
      }
    }
    else if (this.type == null) {
      if (repopulationFactor > Math.random()) {
        this.populateRandom(mushroomTable, tresholdTable, frequencySum)
      }
    }
  }

  /*
  Two helper functions used by the Game (board) to determine slot pickability
  */
  getPickupCost (baseCost, pickupPenalty, pickupPenaltyExponent) {
    return baseCost + pickupPenalty * Math.pow(this.stage-1 , pickupPenaltyExponent)
  }

  isPickable () {
    return (this.type != 'rock' && this.type != null)
  }

}
