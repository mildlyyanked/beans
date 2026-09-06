import type { CharClass } from '@/types/ruleset';

const asi = {
  name: 'Ability Score Improvement',
  description: 'Increase one ability score by 2, or two ability scores by 1 each. No score may exceed 20.',
};

export const warlock: CharClass = {
  id: 'warlock',
  name: 'Warlock',
  description:
    'A seeker of forbidden power who struck a bargain with an otherworldly patron. Warlocks have few spell slots but recover them on a short rest, and they augment their magic with eldritch invocations and a signature blasting cantrip.',
  hitDie: 8,
  primaryAbilities: ['cha'],
  savingThrows: ['wis', 'cha'],
  armorProficiencies: ['light armor'],
  weaponProficiencies: ['simple weapons'],
  toolProficiencies: [],
  skillChoices: {
    count: 2,
    from: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'],
  },
  startingEquipment: [
    'A light crossbow and 20 bolts',
    'An arcane focus',
    'A scholar\'s pack',
    'Leather armor, a dagger, and a quarterstaff',
  ],
  startingItems: [
    { itemId: 'light-crossbow', qty: 1 },
    { itemId: 'crossbow-bolts', qty: 20 },
    { itemId: 'arcane-focus', qty: 1 },
    { itemId: 'scholars-pack', qty: 1 },
    { itemId: 'leather-armor', qty: 1 },
    { itemId: 'dagger', qty: 1 },
    { itemId: 'quarterstaff', qty: 1 },
  ],
  startingGold: 0,
  features: [
    {
      level: 1,
      name: 'Otherworldly Patron',
      description: 'Choose the entity that grants your power. It provides an expanded spell list and features at 1st, 6th, 10th, and 14th level.',
    },
    {
      level: 1,
      name: 'Pact Magic',
      description:
        'You cast warlock spells using Charisma. You have 1 spell slot at 1st level, 2 at 2nd, 3 at 11th, and 4 at 17th; all slots are the same level (1st at 1st, 2nd at 3rd, 3rd at 5th, 4th at 7th, 5th at 9th) and are regained on a short or long rest. You know 2 cantrips and 2 spells at 1st level and can swap one known spell per level.',
    },
    {
      level: 2,
      name: 'Eldritch Invocations',
      description:
        'Learn two invocations, fragments of forbidden lore that grant persistent benefits such as extra damage or knockback on eldritch blast, at-will utility spells, darkvision to 120 feet, or armor-like protection. You know 3 at 5th, 4 at 7th, 5 at 9th, 6 at 12th, 7 at 15th, and 8 at 18th level, and may swap one when you level.',
    },
    {
      level: 3,
      name: 'Pact Boon',
      description:
        'Choose a gift from your patron: Pact of the Chain (a find familiar spell with special forms such as an imp or sprite), Pact of the Blade (conjure a magic weapon as an action), or Pact of the Tome (a book granting three extra cantrips from any class).',
    },
    { level: 4, ...asi },
    { level: 8, ...asi },
    {
      level: 11,
      name: 'Mystic Arcanum (6th level)',
      description: 'Choose one 6th-level warlock spell as an arcanum. You can cast it once without a spell slot, regaining the use on a long rest.',
    },
    { level: 12, ...asi },
    {
      level: 13,
      name: 'Mystic Arcanum (7th level)',
      description: 'Choose one 7th-level warlock spell; cast it once per long rest without expending a spell slot.',
    },
    {
      level: 15,
      name: 'Mystic Arcanum (8th level)',
      description: 'Choose one 8th-level warlock spell; cast it once per long rest without expending a spell slot.',
    },
    { level: 16, ...asi },
    {
      level: 17,
      name: 'Mystic Arcanum (9th level)',
      description: 'Choose one 9th-level warlock spell; cast it once per long rest without expending a spell slot.',
    },
    { level: 19, ...asi },
    {
      level: 20,
      name: 'Eldritch Master',
      description: 'Spend 1 minute entreating your patron to regain all expended Pact Magic spell slots. Once per long rest.',
    },
  ],
  spellcasting: {
    ability: 'cha',
    type: 'pact',
    cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    spellsKnown: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
    startsAtLevel: 1,
    ritualCasting: false,
    focus: 'arcane focus',
    spellList: [
      // cantrips
      'chill-touch', 'eldritch-blast', 'mage-hand', 'minor-illusion', 'poison-spray', 'prestidigitation', 'true-strike',
      // 1st
      'charm-person', 'comprehend-languages', 'expeditious-retreat', 'hellish-rebuke', 'illusory-script', 'protection-from-evil-and-good', 'unseen-servant',
      // 2nd
      'darkness', 'enthrall', 'hold-person', 'invisibility', 'mirror-image', 'misty-step', 'ray-of-enfeeblement', 'shatter', 'spider-climb', 'suggestion',
      // 3rd
      'counterspell', 'dispel-magic', 'fear', 'fly', 'gaseous-form', 'hypnotic-pattern', 'magic-circle', 'major-image', 'remove-curse', 'tongues', 'vampiric-touch',
      // 4th
      'banishment', 'blight', 'dimension-door', 'hallucinatory-terrain',
      // 5th
      'contact-other-plane', 'dream', 'hold-monster', 'scrying',
      // 6th
      'circle-of-death', 'conjure-fey', 'create-undead', 'eyebite', 'flesh-to-stone', 'mass-suggestion', 'true-seeing',
      // 7th
      'etherealness', 'finger-of-death', 'forcecage', 'plane-shift',
      // 8th
      'demiplane', 'dominate-monster', 'feeblemind', 'glibness', 'power-word-stun',
      // 9th
      'astral-projection', 'foresight', 'imprisonment', 'power-word-kill', 'true-polymorph',
    ],
  },
  subclassLevel: 1,
  subclassLabel: 'Otherworldly Patron',
  subclasses: [
    {
      id: 'fiend',
      name: 'The Fiend',
      description:
        'Your patron is a powerful being of the Lower Planes. Its gifts lean toward fire, fortune, and cruelty: you sap vitality from the dying, bend luck in your favor, resist chosen energies, and can banish foes into a nightmarish vision.',
      bonusSpells: {
        1: ['burning-hands', 'command'],
        3: ['blindness-deafness', 'scorching-ray'],
        5: ['fireball', 'stinking-cloud'],
        7: ['fire-shield', 'wall-of-fire'],
        9: ['flame-strike', 'hallow'],
      },
      features: [
        {
          level: 1,
          name: 'Dark One\'s Blessing',
          description: 'When you reduce a hostile creature to 0 hit points, you gain temporary hit points equal to your Charisma modifier + your warlock level (minimum 1).',
        },
        {
          level: 6,
          name: 'Dark One\'s Own Luck',
          description: 'When you make an ability check or saving throw, add 1d10 to the roll after seeing the die but before knowing the result. Once per short or long rest.',
        },
        {
          level: 10,
          name: 'Fiendish Resilience',
          description: 'After each short or long rest, choose one damage type; you have resistance to it until you choose again. Magical and silvered weapons ignore this resistance.',
        },
        {
          level: 14,
          name: 'Hurl Through Hell',
          description:
            'When you hit a creature with an attack, banish it to the Lower Planes until the end of your next turn; it returns to its space and takes 10d10 psychic damage unless it is a fiend. Once per long rest.',
        },
      ],
    },
  ],
};
