class Slot {
  constructor () {
    this.type = null
    this.stage = null
  }

  populateFixed (_type, _stage) {
    this.type = _type
    this.stage = _stage
  }

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
        // console.log('grow');
      }
      else {
        this.empty()
        // console.log('whither slot');
      }
    }
    else if (this.type == 'rock') {
      if (this.stage > 1) {
        this.stage -= 1
        // console.log('whither rock');
      }
      else {
        this.type = null
        this.stage = null
        // console.log('destroy rock');
      }
    }
    else if (this.type == null) {
      console.log('try repopulating');
      if (repopulationFactor > Math.random()) {
        this.populateRandom(mushroomTable, tresholdTable, frequencySum)
        // console.log('treshold matched, repopulate');
      }
    }
  }

  getPickupCost (baseCost, pickupPenalty, pickupPenaltyExponent) {
    // let cost = baseCost + (this.stage - 1) * pickupPenalty
    let cost = baseCost + pickupPenalty * Math.pow(this.stage-1 , pickupPenaltyExponent)
    return cost
  }

  isPickable () {
    return (this.type != 'rock' && this.type != null)
  }

}
