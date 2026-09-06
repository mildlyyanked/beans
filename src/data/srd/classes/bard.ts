import type { CharClass } from '@/types/ruleset';

const asi = {
  name: 'Ability Score Improvement',
  description: 'Increase one ability score by 2, or two ability scores by 1 each. No score may exceed 20.',
};

export const bard: CharClass = {
  id: 'bard',
  name: 'Bard',
  description:
    'A versatile performer whose music and words carry real magic. Bards inspire allies, undermine foes, and dabble in every skill, drawing on a broad spell list that blends charm, illusion, and healing.',
  hitDie: 8,
  primaryAbilities: ['cha'],
  savingThrows: ['dex', 'cha'],
  armorProficiencies: ['light armor'],
  weaponProficiencies: ['simple weapons', 'hand crossbows', 'longswords', 'rapiers', 'shortswords'],
  toolProficiencies: ['three musical instruments of your choice'],
  skillChoices: {
    count: 3,
    from: [
      'acrobatics', 'animal-handling', 'arcana', 'athletics', 'deception', 'history', 'insight',
      'intimidation', 'investigation', 'medicine', 'nature', 'perception', 'performance',
      'persuasion', 'religion', 'sleight-of-hand', 'stealth', 'survival',
    ],
  },
  startingEquipment: [
    'A rapier',
    'An entertainer\'s pack',
    'A lute',
    'Leather armor and a dagger',
  ],
  startingItems: [
    { itemId: 'rapier', qty: 1 },
    { itemId: 'entertainers-pack', qty: 1 },
    { itemId: 'lute', qty: 1 },
    { itemId: 'leather-armor', qty: 1 },
    { itemId: 'dagger', qty: 1 },
  ],
  startingGold: 0,
  features: [
    {
      level: 1,
      name: 'Spellcasting',
      description:
        'You cast bard spells using Charisma. You know 2 cantrips and 4 spells at 1st level, learning more as you level, and you can swap one known spell each time you gain a level. A musical instrument serves as your spellcasting focus. You can cast known ritual spells as rituals.',
    },
    {
      level: 1,
      name: 'Bardic Inspiration',
      description:
        'As a bonus action, grant one creature within 60 feet an inspiration die (d6) it can add to one attack roll, ability check, or saving throw within 10 minutes. Uses equal your Charisma modifier (minimum 1) per long rest. The die becomes a d8 at 5th, d10 at 10th, and d12 at 15th level.',
    },
    {
      level: 2,
      name: 'Jack of All Trades',
      description: 'Add half your proficiency bonus, rounded down, to any ability check that does not already include your proficiency bonus.',
    },
    {
      level: 2,
      name: 'Song of Rest',
      description:
        'If you perform during a short rest, each ally who spends Hit Dice regains an extra 1d6 hit points. This rises to 1d8 at 9th, 1d10 at 13th, and 1d12 at 17th level.',
    },
    {
      level: 3,
      name: 'Bard College',
      description: 'Choose a college that grants features at 3rd, 6th, and 14th level.',
    },
    {
      level: 3,
      name: 'Expertise',
      description: 'Choose two skill proficiencies; your proficiency bonus is doubled for checks using them. Choose two more at 10th level.',
    },
    { level: 4, ...asi },
    {
      level: 5,
      name: 'Font of Inspiration',
      description: 'You regain all expended uses of Bardic Inspiration when you finish a short or long rest.',
    },
    {
      level: 6,
      name: 'Countercharm',
      description:
        'As an action, begin a performance lasting until the end of your next turn; you and friendly creatures within 30 feet who can hear you have advantage on saves against being frightened or charmed.',
    },
    { level: 8, ...asi },
    {
      level: 10,
      name: 'Magical Secrets',
      description:
        'Learn two spells of your choice from any class\'s spell list, of a level you can cast or cantrips; they count as bard spells. Gain two more at 14th and 18th level.',
    },
    { level: 12, ...asi },
    { level: 16, ...asi },
    { level: 19, ...asi },
    {
      level: 20,
      name: 'Superior Inspiration',
      description: 'When you roll initiative and have no uses of Bardic Inspiration left, you regain one use.',
    },
  ],
  spellcasting: {
    ability: 'cha',
    type: 'full',
    cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    spellsKnown: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22],
    startsAtLevel: 1,
    ritualCasting: true,
    focus: 'musical instrument',
    spellList: [
      // cantrips
      'dancing-lights', 'light', 'mage-hand', 'mending', 'message', 'minor-illusion', 'prestidigitation', 'true-strike', 'vicious-mockery',
      // 1st
      'bane', 'charm-person', 'comprehend-languages', 'cure-wounds', 'detect-magic', 'disguise-self', 'faerie-fire', 'feather-fall', 'healing-word', 'heroism', 'hideous-laughter', 'identify', 'illusory-script', 'longstrider', 'silent-image', 'sleep', 'speak-with-animals', 'thunderwave', 'unseen-servant',
      // 2nd
      'animal-messenger', 'blindness-deafness', 'calm-emotions', 'detect-thoughts', 'enhance-ability', 'enthrall', 'heat-metal', 'hold-person', 'invisibility', 'knock', 'lesser-restoration', 'locate-animals-or-plants', 'locate-object', 'magic-mouth', 'see-invisibility', 'shatter', 'silence', 'suggestion', 'zone-of-truth',
      // 3rd
      'bestow-curse', 'clairvoyance', 'dispel-magic', 'fear', 'glyph-of-warding', 'hypnotic-pattern', 'major-image', 'nondetection', 'plant-growth', 'sending', 'speak-with-dead', 'speak-with-plants', 'stinking-cloud', 'tiny-hut', 'tongues',
      // 4th
      'compulsion', 'confusion', 'dimension-door', 'freedom-of-movement', 'greater-invisibility', 'hallucinatory-terrain', 'locate-creature', 'polymorph',
      // 5th
      'animate-objects', 'awaken', 'dominate-person', 'dream', 'geas', 'greater-restoration', 'hold-monster', 'legend-lore', 'mass-cure-wounds', 'mislead', 'modify-memory', 'planar-binding', 'raise-dead', 'scrying', 'seeming', 'teleportation-circle',
      // 6th
      'eyebite', 'find-the-path', 'guards-and-wards', 'irresistible-dance', 'mass-suggestion', 'programmed-illusion', 'true-seeing',
      // 7th
      'etherealness', 'forcecage', 'magnificent-mansion', 'mirage-arcane', 'project-image', 'regenerate', 'resurrection', 'symbol', 'teleport',
      // 8th
      'dominate-monster', 'feeblemind', 'glibness', 'mind-blank', 'power-word-stun',
      // 9th
      'foresight', 'power-word-kill', 'true-polymorph',
    ],
  },
  subclassLevel: 3,
  subclassLabel: 'Bard College',
  subclasses: [
    {
      id: 'lore',
      name: 'College of Lore',
      description:
        'Bards of the College of Lore collect knowledge from every source and turn it into cutting wit and borrowed magic, weakening enemies while broadening their own repertoire.',
      features: [
        {
          level: 3,
          name: 'Bonus Proficiencies',
          description: 'You gain proficiency in three additional skills of your choice.',
        },
        {
          level: 3,
          name: 'Cutting Words',
          description:
            'When a creature within 60 feet that can hear you makes an attack roll, ability check, or damage roll, use your reaction to expend one Bardic Inspiration and subtract the die from its roll. Cannot affect creatures immune to being charmed.',
        },
        {
          level: 6,
          name: 'Additional Magical Secrets',
          description: 'Learn two spells of your choice from any class, of a level you can cast or cantrips. They count as bard spells but do not count against your spells known.',
        },
        {
          level: 14,
          name: 'Peerless Skill',
          description: 'When you make an ability check, you can expend one Bardic Inspiration and add the die to the result. You decide after rolling but before learning the outcome.',
        },
      ],
    },
  ],
};
