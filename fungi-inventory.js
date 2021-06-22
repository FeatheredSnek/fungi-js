class Inventory {
  constructor (size) {
    this.slots = []
    for (let i = 0; i < size; i++) {
      this.slots.push(new Slot())
    }
  }

  add (contents) {
    let freeSlotId = this.slots.findIndex(e => e.type === null)
    if (freeSlotId > -1) {
      this.slots[freeSlotId].type = contents[0]
      this.slots[freeSlotId].stage = contents[1]
    }
    this.collapse()
  }

  collapse () {
    for (let i = 1; i < this.slots.length; i++) {
      if (this.slots[i].type != this.slots[0].type || this.slots[i].stage != this.slots[0].stage) {
        return false
      }
    }
    if (this.slots[0].stage != null && this.slots[0].stage < 3) {
      this.slots[0].stage += 1
      for (let j = 1; j < this.slots.length; j++) {
        this.slots[j].empty()
      }
    }
    else {
      return false
    }
  }

  sell (mushroomTable) {
    if (!this.isFull()) {
      return false
    }
    let sameType = this.slots.every(el => el.type == this.slots[0].type)
    let sameStage = this.slots.every(el => el.stage == this.slots[0].stage)
    let multiplier = 1
    if (sameType) {
      multiplier *= 3
    }
    if (sameStage) {
      multiplier *= 2
    }
    let sellValue = 0
    for (let slot of this.slots) {
      let slotValue = mushroomTable.find(mushroom => mushroom.name === slot.type).value
      sellValue += slotValue
    }
    sellValue *= multiplier
    this.slots.forEach(slot => slot.empty())
    return sellValue
  }

  isFull () {
    if (this.slots.findIndex(e => e.type === null) != -1) {
      return false
    }
    else {
      return true
    }
  }

  empty () {
    this.slots.forEach(slot => slot.empty())
  }

}
