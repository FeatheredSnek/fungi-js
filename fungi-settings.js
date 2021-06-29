/*
This helper class serves a storage for game settings.
As mentioned in the readme file, I would like to make a script that messess
around with settings and aims for playable, challenging values.
For now it stores some static data just because it's honestly easier to do it
this way than to load inital settings from JSON, especially if the scrpits
were to be loaded into some web editor like codepen or fiddle.
*/

class Settings {
  constructor() {

  }

  static getDefault () {
    let settings = {
      /*
      Each mushroom has a name - used only internally, but has to match the name
      of a particular mushroom's SVG spriteset - a base sell value and
      an arbitrary number describing how often it grows on the board.
      In game, frequency p(F1) of a fungus F1 appearing is calculated as follows:
      p(F1) / p(F1) + p(F2) + ... p(Fn) + p(E)
      where F1...Fn are frequency values for mushrooms and E is the frequency
      value for an empty slot.
      Note that this table additionally contains 'rock' - an unpickable object
      that shrinks instead of growing.
      */
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
      // How often an empty slot is generated instead of a mushroom
      emptySlotFrequency: 8,
      // How often a slot is repopulated after being emptied (x/1 value)
      repopulationFactor: 0.3,
      // Gold cost of advancing time
      advanceCost: 10,
      // Gold cost of picking up any mushroom, always
      pickupCost: 5,
      // Base penalty for picking up larger (grown) mushrooms
      pickupPenalty: 15,
      // Above penalty is raised to this power when the mushroom is fully grown
      pickupPenaltyExponent: 2,
      // Base value is raised to this power when grown mushrooms are sold
      stageBonusExponent: 2,
      // Sell value is multiplied by this when all mushrooms are the same type
      sameTypeBonusMultiplier: 3,
      // Sell value is multiplied by this when all mushrooms are the same stage
      sameStageBonusMultiplier: 2,
      // Added to sell value (before multiplying) when all mushrooms are different types
      tricolorBonus: 20,
      // Best case scenario player needs 15 gold to start the game (3 pickups at start)
      startingGold: 100,
      // After reaching this gold is not added anymore (it can still be lost however)
      maxGoldCap: 9999
    }
    return settings
  }
}
