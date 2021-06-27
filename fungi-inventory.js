/*
Inventory object consists of several slots and functionalities to fill them
and sell their contents. It is the only class within the system that has any
idea about the values of fungi.
*/

class Inventory {
  constructor (size) {
    this.slots = []
    for (let i = 0; i < size; i++) {
      this.slots.push(new Slot())
    }
  }

  /*
  Four functions below (each named with a single verb) are the means
  of controlling the inventory and in this manner are usually called
  by the inventory's instance parent.
  */
  empty () {
    this.slots.forEach(slot => slot.empty())
  }
  /*
  Adding something from the board to the inventory is done via copying values
  into an array and passing it over to the inventory - thats why add receives
  one argument that contains the pickup's type and value.
  */
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
  // The leftmost fungus grows and the rest is removed
  collapse () {
    this.slots[0].stage += 1
    for (let j = 1; j < this.slots.length; j++) {
      this.slots[j].empty()
    }
  }
  /*
  Separation of sell and getTotalValue allows not only for readability, but
  also for easier modifications of both - i.e. selling the inventory may
  take time or even cost gold. These functionalities can be added here.
  */
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

  /*
  This helper function is rahter self explanatory - it calculates the total
  sell value of current inventory contents. It has to take in several arguments,
  because my goal was to make the inventory as stupid as possible - it is
  oblivious of the current game's settings, which strongly determine the values.
  */
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
    let slotsValueSum = this.slots.reduce((accumulator, currentSlot) => {
      return accumulator + this.getSlotValue(currentSlot, mushroomTable, stageBonusExponent)
    }, 0)
    return (slotsValueSum + bonus) * multiplier
  }

  /*
  The heart of the selling system looks up the value of a particular mushroom
  in the table (provided by the caller, see the comment above on stupidity)
  and applies the value calculating formula to the base cost.
  */
  getSlotValue (slot, mushroomTable, stageBonusExponent) {
    let slotValue = 0
    let slotTableEquivalent = mushroomTable.find(mushroom => mushroom.name === slot.type)
    if (slotTableEquivalent) {
      slotValue = slotTableEquivalent.value * slot.stage + Math.pow(slot.stage - 1, stageBonusExponent)
    }
    return slotValue
  }

  /*
  Helpers below allow for a quick examination of the current inventory contents.
  Used by functions above, may also be called by the external controller or
  the renderer (eg. to slightly flash the contents when the inventory is full)
  */
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
