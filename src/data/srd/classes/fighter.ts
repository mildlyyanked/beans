import type { CharClass } from '@/types/ruleset';

const asi = {
  name: 'Ability Score Improvement',
  description: 'Increase one ability score by 2, or two ability scores by 1 each. No score may exceed 20.',
};

export const fighter: CharClass = {
  id: 'fighter',
  name: 'Fighter',
  description:
    'A master of arms trained in every weapon and armor. Fighters attack more often than any other class, recover quickly in battle, and gain extra ability score improvements that make them exceptionally flexible.',
  hitDie: 10,
  primaryAbilities: ['str', 'dex'],
  savingThrows: ['str', 'con'],
  armorProficiencies: ['light armor', 'medium armor', 'heavy armor', 'shields'],
  weaponProficiencies: ['simple weapons', 'martial weapons'],
  toolProficiencies: [],
  skillChoices: {
    count: 2,
    from: ['acrobatics', 'animal-handling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'],
  },
  startingEquipment: [
    'Chain mail',
    'A longsword and a shield',
    'A light crossbow and 20 bolts',
    'A dungeoneer\'s pack',
  ],
  startingItems: [
    { itemId: 'chain-mail', qty: 1 },
    { itemId: 'longsword', qty: 1 },
    { itemId: 'shield', qty: 1 },
    { itemId: 'light-crossbow', qty: 1 },
    { itemId: 'crossbow-bolts', qty: 20 },
    { itemId: 'dungeoneers-pack', qty: 1 },
  ],
  startingGold: 0,
  features: [
    {
      level: 1,
      name: 'Fighting Style',
      description:
        'Choose one specialty: Archery (+2 to ranged attack rolls), Defense (+1 AC in armor), Dueling (+2 damage with a one-handed weapon and no other weapon), Great Weapon Fighting (reroll 1s and 2s on two-handed damage dice), Protection (reaction with shield to impose disadvantage on an attack against an adjacent ally), or Two-Weapon Fighting (add ability modifier to off-hand damage).',
    },
    {
      level: 1,
      name: 'Second Wind',
      description: 'As a bonus action, regain hit points equal to 1d10 + your fighter level. Once per short or long rest.',
    },
    {
      level: 2,
      name: 'Action Surge',
      description: 'On your turn, take one additional action on top of your regular action. Once per short or long rest; twice between rests from 17th level, but only once per turn.',
    },
    {
      level: 3,
      name: 'Martial Archetype',
      description: 'Choose an archetype that grants features at 3rd, 7th, 10th, 15th, and 18th level.',
    },
    { level: 4, ...asi },
    {
      level: 5,
      name: 'Extra Attack',
      description: 'When you take the Attack action, attack twice instead of once. This becomes three attacks at 11th level and four at 20th level.',
    },
    { level: 6, ...asi },
    { level: 8, ...asi },
    {
      level: 9,
      name: 'Indomitable',
      description: 'Reroll a saving throw you fail; you must use the new roll. Once per long rest, twice from 13th level, three times from 17th.',
    },
    { level: 12, ...asi },
    { level: 14, ...asi },
    { level: 16, ...asi },
    { level: 19, ...asi },
  ],
  subclassLevel: 3,
  subclassLabel: 'Martial Archetype',
  subclasses: [
    {
      id: 'champion',
      name: 'Champion',
      description:
        'Champions hone raw physical excellence rather than tricks or magic. They score critical hits more often, excel at athletic feats, and become nearly unstoppable through sheer conditioning.',
      features: [
        {
          level: 3,
          name: 'Improved Critical',
          description: 'Your weapon attacks score a critical hit on a roll of 19 or 20.',
        },
        {
          level: 7,
          name: 'Remarkable Athlete',
          description:
            'Add half your proficiency bonus (rounded up) to Strength, Dexterity, and Constitution checks that do not already use it. Your running long jump distance increases by feet equal to your Strength modifier.',
        },
        {
          level: 10,
          name: 'Additional Fighting Style',
          description: 'Choose a second option from the Fighting Style feature.',
        },
        {
          level: 15,
          name: 'Superior Critical',
          description: 'Your weapon attacks score a critical hit on a roll of 18, 19, or 20.',
        },
        {
          level: 18,
          name: 'Survivor',
          description: 'At the start of each of your turns, if you have no more than half your hit points and at least 1, regain hit points equal to 5 + your Constitution modifier.',
        },
      ],
    },
  ],
};
