import type { CharClass } from '@/types/ruleset';

const asi = {
  name: 'Ability Score Improvement',
  description: 'Increase one ability score by 2, or two ability scores by 1 each. No score may exceed 20.',
};

export const rogue: CharClass = {
  id: 'rogue',
  name: 'Rogue',
  description:
    'A cunning specialist who relies on stealth, precision, and skill rather than brute force. Rogues excel at finding weak points, delivering devastating sneak attacks, slipping past danger, and mastering more skills than any other class.',
  hitDie: 8,
  primaryAbilities: ['dex'],
  savingThrows: ['dex', 'int'],
  armorProficiencies: ['light armor'],
  weaponProficiencies: ['simple weapons', 'hand crossbows', 'longswords', 'rapiers', 'shortswords'],
  toolProficiencies: ['thieves\' tools'],
  skillChoices: {
    count: 4,
    from: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleight-of-hand', 'stealth'],
  },
  startingEquipment: [
    'A rapier',
    'A shortbow and a quiver of 20 arrows',
    'A burglar\'s pack',
    'Leather armor, two daggers, and thieves\' tools',
  ],
  startingItems: [
    { itemId: 'rapier', qty: 1 },
    { itemId: 'shortbow', qty: 1 },
    { itemId: 'arrows', qty: 20 },
    { itemId: 'burglars-pack', qty: 1 },
    { itemId: 'leather-armor', qty: 1 },
    { itemId: 'dagger', qty: 2 },
    { itemId: 'thieves-tools', qty: 1 },
  ],
  startingGold: 0,
  features: [
    {
      level: 1,
      name: 'Expertise',
      description: 'Choose two skill proficiencies (or one skill and thieves\' tools); your proficiency bonus is doubled for checks using them. Choose two more at 6th level.',
    },
    {
      level: 1,
      name: 'Sneak Attack',
      description:
        'Once per turn, deal extra damage to a creature you hit with a finesse or ranged weapon if you have advantage, or if an ally is within 5 feet of the target and you lack disadvantage. Extra damage is 1d6 at 1st level, increasing by 1d6 at every odd level (2d6 at 3rd, 3d6 at 5th, and so on) up to 10d6 at 19th.',
    },
    {
      level: 1,
      name: 'Thieves\' Cant',
      description: 'You know a secret mix of dialect, jargon, and code that lets you hide messages in ordinary conversation; conveying a message takes four times as long. You also recognize thieves\' signs and symbols.',
    },
    {
      level: 2,
      name: 'Cunning Action',
      description: 'On each of your turns you can use a bonus action to Dash, Disengage, or Hide.',
    },
    {
      level: 3,
      name: 'Roguish Archetype',
      description: 'Choose an archetype that grants features at 3rd, 9th, 13th, and 17th level.',
    },
    { level: 4, ...asi },
    {
      level: 5,
      name: 'Uncanny Dodge',
      description: 'When an attacker you can see hits you with an attack, use your reaction to halve the damage.',
    },
    {
      level: 7,
      name: 'Evasion',
      description: 'When subjected to an effect that allows a Dexterity save for half damage, you take no damage on a success and half damage on a failure.',
    },
    { level: 8, ...asi },
    { level: 10, ...asi },
    {
      level: 11,
      name: 'Reliable Talent',
      description: 'Whenever you make an ability check using a skill or tool you are proficient with, treat any d20 roll of 9 or lower as a 10.',
    },
    { level: 12, ...asi },
    {
      level: 14,
      name: 'Blindsense',
      description: 'If you can hear, you are aware of the location of any hidden or invisible creature within 10 feet of you.',
    },
    {
      level: 15,
      name: 'Slippery Mind',
      description: 'You gain proficiency in Wisdom saving throws.',
    },
    { level: 16, ...asi },
    {
      level: 18,
      name: 'Elusive',
      description: 'No attack roll has advantage against you while you are not incapacitated.',
    },
    { level: 19, ...asi },
    {
      level: 20,
      name: 'Stroke of Luck',
      description: 'Turn a missed attack into a hit, or treat a failed ability check as a natural 20. Once per short or long rest.',
    },
  ],
  subclassLevel: 3,
  subclassLabel: 'Roguish Archetype',
  subclasses: [
    {
      id: 'thief',
      name: 'Thief',
      description:
        'Thieves refine the classic burglar\'s craft: nimble hands, quick climbing, silent movement, and a knack for using tools and magic items that were never meant for them.',
      features: [
        {
          level: 3,
          name: 'Fast Hands',
          description: 'Your Cunning Action can also be used to make a Sleight of Hand check, use thieves\' tools to disarm a trap or open a lock, or take the Use an Object action.',
        },
        {
          level: 3,
          name: 'Second-Story Work',
          description: 'Climbing no longer costs you extra movement, and your running long jump distance increases by feet equal to your Dexterity modifier.',
        },
        {
          level: 9,
          name: 'Supreme Sneak',
          description: 'You have advantage on Stealth checks if you move no more than half your speed on the same turn.',
        },
        {
          level: 13,
          name: 'Use Magic Device',
          description: 'You ignore all class, race, and level requirements when using magic items.',
        },
        {
          level: 17,
          name: 'Thief\'s Reflexes',
          description: 'You take two turns during the first round of any combat: one at your normal initiative and a second at your initiative minus 10. This does not apply when you are surprised.',
        },
      ],
    },
  ],
};
