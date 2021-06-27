class Inventory {
  constructor (size) {
    this.slots = []
    for (let i = 0; i < size; i++) {
      this.slots.push(new Slot())
    }
  }

  empty () {
    this.slots.forEach(slot => slot.empty())
  }

  add (contents) {
    let freeSlotId = this.slots.findIndex(e => e.type === null)
    if (freeSlotId > -1) {
      this.slots[freeSlotId].type = contents[0]
      this.slots[freeSlotId].stage = contents[1]
    }
    if (this.isFull() && this.slotsAllIdentical() && this.slots[0].stage < 3) {
      this.collapse()
    }
  }

  collapse () {
    this.slots[0].stage += 1
    for (let j = 1; j < this.slots.length; j++) {
      this.slots[j].empty()
    }
  }

  sell (
    mushroomTable,
    stageBonusExponent,
    sameTypeBonusMultiplier,
    sameStageBonusMultiplier,
    tricolorBonus)
    {
    if (!this.isFull()) {
      return false
    }
    else {
      let sellValue = this.getTotalValue(
        mushroomTable,
        stageBonusExponent,
        sameTypeBonusMultiplier,
        sameStageBonusMultiplier,
        tricolorBonus)
      this.empty()
      return sellValue
    }
  }

  getTotalValue (
    mushroomTable,
    stageBonusExponent,
    sameTypeBonusMultiplier,
    sameStageBonusMultiplier,
    tricolorBonus)
    {
    let bonus = 0
    let multiplier = 1
    if (this.slotsAllSameType()) {
      multiplier *= sameTypeBonusMultiplier
    }
    if (this.slotsAllSameStage()) {
      multiplier *= sameStageBonusMultiplier
    }
    if (this.isFull() && this.slotsAllDifferent()) {
      bonus += tricolorBonus
    }
    let slotsValue = this.slots.reduce((accumulator, currentSlot) => {
      return accumulator + this.getSlotValue(currentSlot, mushroomTable, stageBonusExponent)
    }, 0)
    return (slotsValue + bonus) * multiplier
  }

  getSlotValue (slot, mushroomTable, stageBonusExponent) {
    let slotValue = 0
    let slotTableEquivalent = mushroomTable.find(mushroom => mushroom.name === slot.type)
    if (slotTableEquivalent) {
      slotValue = slotTableEquivalent.value * slot.stage + Math.pow(slot.stage - 1, stageBonusExponent)
    }
    return slotValue
  }

  isFull () {
    if (this.slots.findIndex(e => e.type === null) != -1) {
      return false
    }
    else {
      return true
    }
  }

  slotsAllIdentical () {
    return this.slotsAllSameType() && this.slotsAllSameStage()
  }

  slotsAllSameStage () {
    return this.slots.every(slot => slot.stage == this.slots[0].stage)
  }

  slotsAllSameType () {
    return this.slots.every(slot => slot.type == this.slots[0].type)
  }

  slotsAllDifferent () {
    let valueSet = new Set()
    this.slots.every(slot => valueSet.add(slot.type))
    return valueSet.size == this.slots.length
  }

}
