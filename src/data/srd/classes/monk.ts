import type { CharClass } from '@/types/ruleset';

const asi = {
  name: 'Ability Score Improvement',
  description: 'Increase one ability score by 2, or two ability scores by 1 each. No score may exceed 20.',
};

export const monk: CharClass = {
  id: 'monk',
  name: 'Monk',
  description:
    'A disciplined martial artist who harnesses inner energy called ki. Monks fight unarmored and often unarmed, striking with blinding speed, moving faster than anyone else, and turning their bodies into weapons through years of training.',
  hitDie: 8,
  primaryAbilities: ['dex', 'wis'],
  savingThrows: ['str', 'dex'],
  armorProficiencies: [],
  weaponProficiencies: ['simple weapons', 'shortswords'],
  toolProficiencies: ['one artisan\'s tool or musical instrument of your choice'],
  skillChoices: {
    count: 2,
    from: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'],
  },
  startingEquipment: [
    'A shortsword',
    'A dungeoneer\'s pack',
    '10 darts',
  ],
  startingItems: [
    { itemId: 'shortsword', qty: 1 },
    { itemId: 'dungeoneers-pack', qty: 1 },
    { itemId: 'darts', qty: 10 },
  ],
  startingGold: 0,
  features: [
    {
      level: 1,
      name: 'Unarmored Defense',
      description: 'While wearing no armor and not using a shield, your AC equals 10 + Dexterity modifier + Wisdom modifier.',
    },
    {
      level: 1,
      name: 'Martial Arts',
      description:
        'While unarmed or using monk weapons (shortswords and simple melee weapons without two-handed or heavy) and wearing no armor or shield, you may use Dexterity for attacks and damage, roll a d4 for unarmed strikes, and make one unarmed strike as a bonus action after attacking. The die becomes d6 at 5th, d8 at 11th, and d10 at 17th level.',
    },
    {
      level: 2,
      name: 'Ki',
      description:
        'You have ki points equal to your monk level, regained on a short or long rest. Spend 1 point for Flurry of Blows (two unarmed strikes as a bonus action after attacking), Patient Defense (Dodge as a bonus action), or Step of the Wind (Disengage or Dash as a bonus action, doubling jump distance). Ki save DC = 8 + proficiency + Wisdom modifier.',
    },
    {
      level: 2,
      name: 'Unarmored Movement',
      description:
        'Your speed increases by 10 feet while unarmored and without a shield. This rises to 15 feet at 6th, 20 at 10th, 25 at 14th, and 30 at 18th level. From 9th level you can run along vertical surfaces and across liquids without falling during your move.',
    },
    {
      level: 3,
      name: 'Monastic Tradition',
      description: 'Choose a tradition that grants features at 3rd, 6th, 11th, and 17th level.',
    },
    {
      level: 3,
      name: 'Deflect Missiles',
      description:
        'When hit by a ranged weapon attack, use your reaction to reduce the damage by 1d10 + Dexterity modifier + monk level. If reduced to 0 and you have a free hand, you can catch the missile and spend 1 ki to throw it back as a monk weapon attack with 20/60 range.',
    },
    { level: 4, ...asi },
    {
      level: 4,
      name: 'Slow Fall',
      description: 'Use your reaction when falling to reduce the falling damage you take by five times your monk level.',
    },
    {
      level: 5,
      name: 'Extra Attack',
      description: 'When you take the Attack action, attack twice instead of once.',
    },
    {
      level: 5,
      name: 'Stunning Strike',
      description: 'When you hit a creature with a melee weapon attack, spend 1 ki point to force a Constitution save; on a failure the target is stunned until the end of your next turn.',
    },
    {
      level: 6,
      name: 'Ki-Empowered Strikes',
      description: 'Your unarmed strikes count as magical for the purpose of overcoming resistance and immunity to nonmagical attacks and damage.',
    },
    {
      level: 7,
      name: 'Evasion',
      description: 'When subjected to an effect that allows a Dexterity save for half damage, you take no damage on a success and half damage on a failure.',
    },
    {
      level: 7,
      name: 'Stillness of Mind',
      description: 'Use your action to end one effect on yourself that is causing you to be charmed or frightened.',
    },
    { level: 8, ...asi },
    {
      level: 10,
      name: 'Purity of Body',
      description: 'You are immune to disease and poison.',
    },
    { level: 12, ...asi },
    {
      level: 13,
      name: 'Tongue of the Sun and Moon',
      description: 'You understand all spoken languages, and any creature that understands a language can understand what you say.',
    },
    {
      level: 14,
      name: 'Diamond Soul',
      description: 'You are proficient in all saving throws. When you fail a save, you can spend 1 ki point to reroll it and take the second result.',
    },
    {
      level: 15,
      name: 'Timeless Body',
      description: 'You suffer none of the frailty of old age, cannot be aged magically, and no longer need food or water, though you can still die of old age.',
    },
    { level: 16, ...asi },
    {
      level: 18,
      name: 'Empty Body',
      description:
        'Spend 4 ki points as an action to become invisible for 1 minute with resistance to all damage except force. Spend 8 ki points to cast astral projection on yourself only, without material components.',
    },
    { level: 19, ...asi },
    {
      level: 20,
      name: 'Perfect Self',
      description: 'When you roll initiative and have no ki points remaining, you regain 4 ki points.',
    },
  ],
  subclassLevel: 3,
  subclassLabel: 'Monastic Tradition',
  subclasses: [
    {
      id: 'open-hand',
      name: 'Way of the Open Hand',
      description:
        'Masters of unarmed combat, Open Hand monks manipulate an opponent\'s ki as readily as their own. They knock foes down, push them away, heal themselves through meditation, and can deliver a lethal delayed strike.',
      features: [
        {
          level: 3,
          name: 'Open Hand Technique',
          description:
            'Whenever you hit a creature with a Flurry of Blows attack, choose one: it must succeed on a Dexterity save or be knocked prone; it must succeed on a Strength save or be pushed 15 feet; or it cannot take reactions until the end of your next turn.',
        },
        {
          level: 6,
          name: 'Wholeness of Body',
          description: 'As an action, regain hit points equal to three times your monk level. Once per long rest.',
        },
        {
          level: 11,
          name: 'Tranquility',
          description:
            'At the end of a long rest you gain the effect of a sanctuary spell that lasts until your next long rest or until you attack or cast a hostile spell. The save DC is 8 + proficiency + Wisdom modifier.',
        },
        {
          level: 17,
          name: 'Quivering Palm',
          description:
            'When you hit with an unarmed strike, spend 3 ki to set up lethal vibrations that last a number of days equal to your monk level. As an action you can end them: the target makes a Constitution save, dropping to 0 hit points on a failure or taking 10d10 necrotic damage on a success.',
        },
      ],
    },
  ],
};
