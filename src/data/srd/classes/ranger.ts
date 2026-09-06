import type { CharClass } from '@/types/ruleset';

const asi = {
  name: 'Ability Score Improvement',
  description: 'Increase one ability score by 2, or two ability scores by 1 each. No score may exceed 20.',
};

export const ranger: CharClass = {
  id: 'ranger',
  name: 'Ranger',
  description:
    'A wilderness warrior who stalks the borderlands and hunts the threats that lurk there. Rangers pair skilled archery or two-weapon fighting with nature magic, tracking chosen enemies across favored terrain with uncanny precision.',
  hitDie: 10,
  primaryAbilities: ['dex', 'wis'],
  savingThrows: ['str', 'dex'],
  armorProficiencies: ['light armor', 'medium armor', 'shields'],
  weaponProficiencies: ['simple weapons', 'martial weapons'],
  toolProficiencies: [],
  skillChoices: {
    count: 3,
    from: ['animal-handling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'],
  },
  startingEquipment: [
    'Scale mail',
    'Two shortswords',
    'An explorer\'s pack',
    'A longbow and a quiver of 20 arrows',
  ],
  startingItems: [
    { itemId: 'scale-mail', qty: 1 },
    { itemId: 'shortsword', qty: 2 },
    { itemId: 'explorers-pack', qty: 1 },
    { itemId: 'longbow', qty: 1 },
    { itemId: 'arrows', qty: 20 },
  ],
  startingGold: 0,
  features: [
    {
      level: 1,
      name: 'Favored Enemy',
      description:
        'Choose a creature type (or two humanoid races). You have advantage on Survival checks to track it and Intelligence checks to recall lore about it, and you learn one language it speaks. Choose an additional favored enemy at 6th and 14th level.',
    },
    {
      level: 1,
      name: 'Natural Explorer',
      description:
        'Choose a favored terrain. There, difficult terrain does not slow your group, you cannot become lost except by magic, you stay alert while tracking or foraging, you find double food, and you learn details about creatures you track. Choose more terrains at 6th and 10th level.',
    },
    {
      level: 2,
      name: 'Fighting Style',
      description:
        'Choose one specialty: Archery (+2 to ranged attack rolls), Defense (+1 AC in armor), Dueling (+2 damage with a one-handed weapon and no other weapon), or Two-Weapon Fighting (add ability modifier to off-hand damage).',
    },
    {
      level: 2,
      name: 'Spellcasting',
      description:
        'From 2nd level you cast ranger spells using Wisdom. You know 2 spells at 2nd level, learning more as you level, and can swap one known spell whenever you gain a level.',
    },
    {
      level: 3,
      name: 'Ranger Archetype',
      description: 'Choose an archetype that grants features at 3rd, 7th, 11th, and 15th level.',
    },
    {
      level: 3,
      name: 'Primeval Awareness',
      description:
        'Spend a spell slot as an action to sense for 1 minute per slot level whether aberrations, celestials, dragons, elementals, fey, fiends, or undead are within 1 mile (6 miles in favored terrain), without learning their number or location.',
    },
    { level: 4, ...asi },
    {
      level: 5,
      name: 'Extra Attack',
      description: 'When you take the Attack action, attack twice instead of once.',
    },
    { level: 8, ...asi },
    {
      level: 8,
      name: 'Land\'s Stride',
      description: 'Moving through nonmagical difficult terrain costs no extra movement, and you pass through nonmagical plants without harm. You have advantage on saves against magically created plants that impede movement.',
    },
    {
      level: 10,
      name: 'Hide in Plain Sight',
      description:
        'Spend 1 minute camouflaging yourself with natural materials to gain +10 to Stealth checks while you remain motionless against a solid surface. The benefit ends when you move or act.',
    },
    { level: 12, ...asi },
    {
      level: 14,
      name: 'Vanish',
      description: 'You can take the Hide action as a bonus action, and you cannot be tracked by nonmagical means unless you choose to leave a trail.',
    },
    { level: 16, ...asi },
    {
      level: 18,
      name: 'Feral Senses',
      description: 'You suffer no disadvantage attacking creatures you cannot see, and you know the location of any invisible creature within 30 feet that is not hidden from you.',
    },
    { level: 19, ...asi },
    {
      level: 20,
      name: 'Foe Slayer',
      description: 'Once per turn, add your Wisdom modifier to the attack roll or damage roll of an attack against one of your favored enemies. You may choose after rolling.',
    },
  ],
  spellcasting: {
    ability: 'wis',
    type: 'half',
    cantripsKnown: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    spellsKnown: [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11],
    startsAtLevel: 2,
    ritualCasting: false,
    focus: 'none',
    spellList: [
      // 1st
      'alarm', 'animal-friendship', 'cure-wounds', 'detect-magic', 'detect-poison-and-disease', 'fog-cloud', 'goodberry', 'hunters-mark', 'jump', 'longstrider', 'speak-with-animals',
      // 2nd
      'animal-messenger', 'barkskin', 'darkvision', 'find-traps', 'lesser-restoration', 'locate-animals-or-plants', 'locate-object', 'pass-without-trace', 'protection-from-poison', 'silence', 'spike-growth',
      // 3rd
      'conjure-animals', 'daylight', 'nondetection', 'plant-growth', 'protection-from-energy', 'speak-with-plants', 'water-breathing', 'water-walk', 'wind-wall',
      // 4th
      'conjure-woodland-beings', 'freedom-of-movement', 'locate-creature', 'stoneskin',
      // 5th
      'commune-with-nature', 'tree-stride',
    ],
  },
  subclassLevel: 3,
  subclassLabel: 'Ranger Archetype',
  subclasses: [
    {
      id: 'hunter',
      name: 'Hunter',
      description:
        'Hunters study the creatures that threaten civilization and tailor their techniques accordingly, choosing from a menu of offensive and defensive tactics at each tier of their career.',
      features: [
        {
          level: 3,
          name: 'Hunter\'s Prey',
          description:
            'Choose one: Colossus Slayer (once per turn, +1d8 damage to a creature below its hit point maximum), Giant Killer (reaction attack against a Large or larger creature within 5 feet that misses you), or Horde Breaker (once per turn, an extra attack against a different creature within 5 feet of your original target).',
        },
        {
          level: 7,
          name: 'Defensive Tactics',
          description:
            'Choose one: Escape the Horde (opportunity attacks against you have disadvantage), Multiattack Defense (+4 AC against later attacks from a creature that hits you this turn), or Steel Will (advantage on saves against being frightened).',
        },
        {
          level: 11,
          name: 'Multiattack',
          description:
            'Choose one: Volley (as an action, make a ranged attack against every creature within 10 feet of a point in range, using one piece of ammunition each) or Whirlwind Attack (as an action, make a melee attack against every creature within 5 feet of you).',
        },
        {
          level: 15,
          name: 'Superior Hunter\'s Defense',
          description:
            'Choose one: Evasion (no damage on successful Dexterity saves for half, half on failure), Stand Against the Tide (reaction to redirect a missed melee attack to another creature), or Uncanny Dodge (reaction to halve damage from one attack).',
        },
      ],
    },
  ],
};
