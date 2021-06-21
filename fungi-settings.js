class Settings {
  constructor() {

  }

  static getDefault () {
    let settings = {
      mushrooms: [
        {
          name: 'amanita',
          value: 10,
          frequency: 3
        },
        {
          name: 'cortinarius',
          value: 5,
          frequency: 6
        },
        {
          name: 'rock',
          value: 0,
          frequency: 1.5
        }
      ],
      emptySlotFrequency: 5,
      repopulationFactor: 0.3,
      advanceCost: 10,
      pickupCost: 5,
      pickupPenalty: 10,
      startingGold: 100
    }
    return settings
  }
}
