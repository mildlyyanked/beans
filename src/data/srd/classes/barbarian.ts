import type { CharClass } from '@/types/ruleset';

export const barbarian: CharClass = {
  id: 'barbarian',
  name: 'Barbarian',
  description:
    'A ferocious warrior who channels primal fury into devastating melee attacks. Barbarians shrug off blows with sheer toughness rather than heavy armor, and their rage lets them hit harder and endure more than any other frontline fighter.',
  hitDie: 12,
  primaryAbilities: ['str'],
  savingThrows: ['str', 'con'],
  armorProficiencies: ['light armor', 'medium armor', 'shields'],
  weaponProficiencies: ['simple weapons', 'martial weapons'],
  toolProficiencies: [],
  skillChoices: {
    count: 2,
    from: ['animal-handling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'],
  },
  startingEquipment: [
    'A greataxe',
    'Two handaxes',
    'An explorer\'s pack',
    'Four javelins',
  ],
  startingItems: [
    { itemId: 'greataxe', qty: 1 },
    { itemId: 'handaxe', qty: 2 },
    { itemId: 'explorers-pack', qty: 1 },
    { itemId: 'javelin', qty: 4 },
  ],
  startingGold: 0,
  features: [
    {
      level: 1,
      name: 'Rage',
      description:
        'As a bonus action, enter a rage for up to 1 minute: advantage on Strength checks and saves, +2 bonus damage on Strength melee attacks, and resistance to bludgeoning, piercing, and slashing damage. Requires no heavy armor. Uses per long rest: 2 (level 1), 3 (3rd), 4 (6th), 5 (12th), 6 (17th), unlimited (20th). Bonus damage rises to +3 at 9th and +4 at 16th.',
    },
    {
      level: 1,
      name: 'Unarmored Defense',
      description:
        'While wearing no armor, your AC equals 10 + Dexterity modifier + Constitution modifier. You may still use a shield and keep this benefit.',
    },
    {
      level: 2,
      name: 'Reckless Attack',
      description:
        'When you make your first attack on your turn, you may attack recklessly: you gain advantage on Strength melee attack rolls this turn, but attack rolls against you have advantage until your next turn.',
    },
    {
      level: 2,
      name: 'Danger Sense',
      description:
        'You have advantage on Dexterity saving throws against effects you can see, such as traps and spells, as long as you are not blinded, deafened, or incapacitated.',
    },
    {
      level: 3,
      name: 'Primal Path',
      description:
        'Choose a path that shapes the nature of your rage, granting features at 3rd, 6th, 10th, and 14th level.',
    },
    { level: 4, name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each. No score may exceed 20.' },
    {
      level: 5,
      name: 'Extra Attack',
      description: 'When you take the Attack action on your turn, you can attack twice instead of once.',
    },
    {
      level: 5,
      name: 'Fast Movement',
      description: 'Your speed increases by 10 feet while you are not wearing heavy armor.',
    },
    {
      level: 7,
      name: 'Feral Instinct',
      description:
        'You have advantage on initiative rolls. If you are surprised at the start of combat but not incapacitated, you can act normally on your first turn as long as you enter a rage first.',
    },
    { level: 8, name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each. No score may exceed 20.' },
    {
      level: 9,
      name: 'Brutal Critical',
      description:
        'Roll one additional weapon damage die when you score a critical hit with a melee attack. This becomes two extra dice at 13th level and three at 17th level.',
    },
    {
      level: 11,
      name: 'Relentless Rage',
      description:
        'While raging, if you drop to 0 hit points without dying, make a DC 10 Constitution save; on a success you drop to 1 hit point instead. The DC increases by 5 each time you use this, resetting after a short or long rest.',
    },
    { level: 12, name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each. No score may exceed 20.' },
    {
      level: 15,
      name: 'Persistent Rage',
      description: 'Your rage only ends early if you fall unconscious or choose to end it; it no longer requires attacking or taking damage each turn.',
    },
    { level: 16, name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each. No score may exceed 20.' },
    {
      level: 18,
      name: 'Indomitable Might',
      description: 'If the total of a Strength check is less than your Strength score, you can use your Strength score in place of the total.',
    },
    { level: 19, name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each. No score may exceed 20.' },
    {
      level: 20,
      name: 'Primal Champion',
      description: 'Your Strength and Constitution scores each increase by 4, and their maximum becomes 24.',
    },
  ],
  subclassLevel: 3,
  subclassLabel: 'Primal Path',
  subclasses: [
    {
      id: 'berserker',
      name: 'Path of the Berserker',
      description:
        'Berserkers embrace rage as pure, unrestrained violence, trading their own endurance for overwhelming offense and a fearsome presence on the battlefield.',
      features: [
        {
          level: 3,
          name: 'Frenzy',
          description:
            'When you rage, you can go into a frenzy: for the rage\'s duration you may make one melee weapon attack as a bonus action each turn. When the rage ends, you suffer one level of exhaustion.',
        },
        {
          level: 6,
          name: 'Mindless Rage',
          description: 'You cannot be charmed or frightened while raging; if you were already charmed or frightened, the effect is suspended for the rage\'s duration.',
        },
        {
          level: 10,
          name: 'Intimidating Presence',
          description:
            'As an action, frighten one creature within 30 feet that can see or hear you unless it succeeds on a Wisdom save (DC 8 + proficiency + Charisma modifier). You can extend the effect each turn with your action; a creature that saves is immune for 24 hours.',
        },
        {
          level: 14,
          name: 'Retaliation',
          description: 'When a creature within 5 feet damages you, you can use your reaction to make a melee weapon attack against it.',
        },
      ],
    },
  ],
};
