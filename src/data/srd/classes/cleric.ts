import type { CharClass } from '@/types/ruleset';

const asi = {
  name: 'Ability Score Improvement',
  description: 'Increase one ability score by 2, or two ability scores by 1 each. No score may exceed 20.',
};

export const cleric: CharClass = {
  id: 'cleric',
  name: 'Cleric',
  description:
    'A priestly champion who wields divine power on behalf of a deity. Clerics blend potent healing and protective magic with solid armor and combat ability, and their chosen domain shapes whether they lean toward battle, support, or utility.',
  hitDie: 8,
  primaryAbilities: ['wis'],
  savingThrows: ['wis', 'cha'],
  armorProficiencies: ['light armor', 'medium armor', 'shields'],
  weaponProficiencies: ['simple weapons'],
  toolProficiencies: [],
  skillChoices: {
    count: 2,
    from: ['history', 'insight', 'medicine', 'persuasion', 'religion'],
  },
  startingEquipment: [
    'A mace',
    'Scale mail',
    'A light crossbow and 20 bolts',
    'A priest\'s pack',
    'A shield and a holy symbol',
  ],
  startingItems: [
    { itemId: 'mace', qty: 1 },
    { itemId: 'scale-mail', qty: 1 },
    { itemId: 'light-crossbow', qty: 1 },
    { itemId: 'crossbow-bolts', qty: 20 },
    { itemId: 'priests-pack', qty: 1 },
    { itemId: 'shield', qty: 1 },
    { itemId: 'holy-symbol', qty: 1 },
  ],
  startingGold: 0,
  features: [
    {
      level: 1,
      name: 'Spellcasting',
      description:
        'You cast cleric spells using Wisdom. You know 3 cantrips at 1st level and prepare a number of spells equal to your Wisdom modifier plus your cleric level (minimum 1) from the full cleric list each day. A holy symbol serves as your focus, and you can cast prepared ritual spells as rituals.',
    },
    {
      level: 1,
      name: 'Divine Domain',
      description: 'Choose a domain tied to your deity. It grants domain spells, extra features at 1st, 2nd, 6th, 8th, and 17th level, and shapes your Channel Divinity.',
    },
    {
      level: 2,
      name: 'Channel Divinity',
      description:
        'Channel divine energy for effects granted by your domain. Turn Undead is always available: each undead within 30 feet that can see or hear you must succeed on a Wisdom save or be turned for 1 minute. Usable once per short or long rest, twice at 6th level, three times at 18th.',
    },
    { level: 4, ...asi },
    {
      level: 5,
      name: 'Destroy Undead',
      description:
        'When an undead fails its save against your Turn Undead, it is destroyed outright if its challenge rating is 1/2 or lower. The threshold rises to CR 1 at 8th, CR 2 at 11th, CR 3 at 14th, and CR 4 at 17th level.',
    },
    { level: 8, ...asi },
    {
      level: 10,
      name: 'Divine Intervention',
      description:
        'As an action, implore your deity for aid: roll percentile dice, and if the result is at or below your cleric level, the deity intervenes. On success you cannot use this again for 7 days; otherwise you can retry after a long rest. At 20th level it succeeds automatically.',
    },
    { level: 12, ...asi },
    { level: 16, ...asi },
    { level: 19, ...asi },
  ],
  spellcasting: {
    ability: 'wis',
    type: 'full',
    cantripsKnown: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    prepared: { levelMultiplier: 1, minimum: 1 },
    startsAtLevel: 1,
    ritualCasting: true,
    focus: 'holy symbol',
    spellList: [
      // cantrips
      'guidance', 'light', 'mending', 'resistance', 'sacred-flame', 'spare-the-dying', 'thaumaturgy',
      // 1st
      'bane', 'bless', 'command', 'create-or-destroy-water', 'cure-wounds', 'detect-evil-and-good', 'detect-magic', 'detect-poison-and-disease', 'guiding-bolt', 'healing-word', 'inflict-wounds', 'protection-from-evil-and-good', 'purify-food-and-drink', 'sanctuary', 'shield-of-faith',
      // 2nd
      'aid', 'augury', 'blindness-deafness', 'calm-emotions', 'continual-flame', 'enhance-ability', 'find-traps', 'gentle-repose', 'hold-person', 'lesser-restoration', 'locate-object', 'prayer-of-healing', 'protection-from-poison', 'silence', 'spiritual-weapon', 'warding-bond', 'zone-of-truth',
      // 3rd
      'animate-dead', 'beacon-of-hope', 'bestow-curse', 'clairvoyance', 'create-food-and-water', 'daylight', 'dispel-magic', 'glyph-of-warding', 'magic-circle', 'mass-healing-word', 'meld-into-stone', 'protection-from-energy', 'remove-curse', 'revivify', 'sending', 'speak-with-dead', 'spirit-guardians', 'tongues', 'water-walk',
      // 4th
      'banishment', 'control-water', 'death-ward', 'divination', 'freedom-of-movement', 'guardian-of-faith', 'locate-creature', 'stone-shape',
      // 5th
      'commune', 'contagion', 'dispel-evil-and-good', 'flame-strike', 'geas', 'greater-restoration', 'hallow', 'insect-plague', 'legend-lore', 'mass-cure-wounds', 'planar-binding', 'raise-dead', 'scrying',
      // 6th
      'blade-barrier', 'create-undead', 'find-the-path', 'forbiddance', 'harm', 'heal', 'heroes-feast', 'planar-ally', 'true-seeing', 'word-of-recall',
      // 7th
      'conjure-celestial', 'divine-word', 'etherealness', 'fire-storm', 'plane-shift', 'regenerate', 'resurrection', 'symbol',
      // 8th
      'antimagic-field', 'control-weather', 'earthquake', 'holy-aura',
      // 9th
      'astral-projection', 'gate', 'mass-heal', 'true-resurrection',
    ],
  },
  subclassLevel: 1,
  subclassLabel: 'Divine Domain',
  subclasses: [
    {
      id: 'life',
      name: 'Life Domain',
      description:
        'Clerics of the Life Domain serve gods of healing and vitality. They wear heavy armor, restore hit points more effectively than anyone, and eventually make every healing spell a burst of restoration.',
      bonusSpells: {
        1: ['bless', 'cure-wounds'],
        3: ['lesser-restoration', 'spiritual-weapon'],
        5: ['beacon-of-hope', 'revivify'],
        7: ['death-ward', 'guardian-of-faith'],
        9: ['mass-cure-wounds', 'raise-dead'],
      },
      features: [
        {
          level: 1,
          name: 'Bonus Proficiency',
          description: 'You gain proficiency with heavy armor.',
        },
        {
          level: 1,
          name: 'Disciple of Life',
          description: 'Whenever you cast a spell of 1st level or higher that restores hit points, the target regains additional hit points equal to 2 + the spell\'s level.',
        },
        {
          level: 2,
          name: 'Channel Divinity: Preserve Life',
          description:
            'As an action, present your holy symbol to restore hit points totaling five times your cleric level, divided as you choose among creatures within 30 feet. No creature can be healed above half its maximum, and undead and constructs are unaffected.',
        },
        {
          level: 6,
          name: 'Blessed Healer',
          description: 'When you cast a spell of 1st level or higher that heals another creature, you also regain hit points equal to 2 + the spell\'s level.',
        },
        {
          level: 8,
          name: 'Divine Strike',
          description: 'Once per turn when you hit with a weapon attack, deal an extra 1d8 radiant damage. This increases to 2d8 at 14th level.',
        },
        {
          level: 17,
          name: 'Supreme Healing',
          description: 'Instead of rolling dice to determine hit points restored by a spell, use the highest possible result for each die.',
        },
      ],
    },
  ],
};
