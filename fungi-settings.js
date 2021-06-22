class Settings {
  constructor() {

  }

  static getDefault () {
    let settings = {
      mushrooms: [
        {
          name: 'amanita',
          value: 10,
          frequency: 4
        },
        {
          name: 'cortinarius',
          value: 5,
          frequency: 6
        },
        {
          name: 'chanterelle',
          value: 15,
          frequency: 2
        },
        {
          name: 'indigo',
          value: 25,
          frequency: 0.5
        },
        {
          name: 'rock',
          value: 0,
          frequency: 3
        }
      ],
      emptySlotFrequency: 8,
      repopulationFactor: 0.3,
      advanceCost: 10,
      pickupCost: 5,
      pickupPenalty: 10,
      startingGold: 100
    }
    return settings
  }
}
