import type { CharClass } from '@/types/ruleset';

const asi = {
  name: 'Ability Score Improvement',
  description: 'Increase one ability score by 2, or two ability scores by 1 each. No score may exceed 20.',
};

export const sorcerer: CharClass = {
  id: 'sorcerer',
  name: 'Sorcerer',
  description:
    'A spellcaster whose magic is innate, flowing from an exotic bloodline or a brush with raw arcane power rather than study. Sorcerers know fewer spells than wizards but bend those spells with metamagic, reshaping range, targets, and timing on the fly.',
  hitDie: 6,
  primaryAbilities: ['cha'],
  savingThrows: ['con', 'cha'],
  armorProficiencies: [],
  weaponProficiencies: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'],
  toolProficiencies: [],
  skillChoices: {
    count: 2,
    from: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'],
  },
  startingEquipment: [
    'A light crossbow and 20 bolts',
    'An arcane focus',
    'A dungeoneer\'s pack',
    'Two daggers',
  ],
  startingItems: [
    { itemId: 'light-crossbow', qty: 1 },
    { itemId: 'crossbow-bolts', qty: 20 },
    { itemId: 'arcane-focus', qty: 1 },
    { itemId: 'dungeoneers-pack', qty: 1 },
    { itemId: 'dagger', qty: 2 },
  ],
  startingGold: 0,
  features: [
    {
      level: 1,
      name: 'Spellcasting',
      description:
        'You cast sorcerer spells using Charisma. You know 4 cantrips and 2 spells at 1st level, learning more as you level, and you can swap one known spell each time you gain a level. An arcane focus channels your magic.',
    },
    {
      level: 1,
      name: 'Sorcerous Origin',
      description: 'Choose the source of your innate magic. It grants features at 1st, 6th, 14th, and 18th level.',
    },
    {
      level: 2,
      name: 'Font of Magic',
      description:
        'You have sorcery points equal to your sorcerer level, regained on a long rest. As a bonus action, convert points into spell slots (2 points for 1st, 3 for 2nd, 5 for 3rd, 6 for 4th, 7 for 5th) or convert a spell slot into points equal to its level.',
    },
    {
      level: 3,
      name: 'Metamagic',
      description:
        'Learn two ways to twist spells, spending sorcery points: Careful (1, chosen creatures auto-succeed saves), Distant (1, double range), Empowered (1, reroll damage dice up to Charisma modifier), Extended (1, double duration), Heightened (3, one target has disadvantage on its first save), Quickened (2, cast as a bonus action), Subtle (1, no verbal or somatic components), or Twinned (spell level, target a second creature). Learn one more option at 10th and 17th level.',
    },
    { level: 4, ...asi },
    { level: 8, ...asi },
    { level: 12, ...asi },
    { level: 16, ...asi },
    { level: 19, ...asi },
    {
      level: 20,
      name: 'Sorcerous Restoration',
      description: 'You regain 4 expended sorcery points whenever you finish a short rest.',
    },
  ],
  spellcasting: {
    ability: 'cha',
    type: 'full',
    cantripsKnown: [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
    spellsKnown: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15],
    startsAtLevel: 1,
    ritualCasting: false,
    focus: 'arcane focus',
    spellList: [
      // cantrips
      'acid-splash', 'chill-touch', 'dancing-lights', 'fire-bolt', 'light', 'mage-hand', 'mending', 'message', 'minor-illusion', 'poison-spray', 'prestidigitation', 'ray-of-frost', 'shocking-grasp', 'true-strike',
      // 1st
      'burning-hands', 'charm-person', 'color-spray', 'comprehend-languages', 'detect-magic', 'disguise-self', 'expeditious-retreat', 'false-life', 'feather-fall', 'fog-cloud', 'jump', 'mage-armor', 'magic-missile', 'shield', 'silent-image', 'sleep', 'thunderwave',
      // 2nd
      'alter-self', 'blindness-deafness', 'blur', 'darkness', 'darkvision', 'detect-thoughts', 'enhance-ability', 'enlarge-reduce', 'gust-of-wind', 'hold-person', 'invisibility', 'knock', 'levitate', 'mirror-image', 'misty-step', 'scorching-ray', 'see-invisibility', 'shatter', 'spider-climb', 'suggestion', 'web',
      // 3rd
      'blink', 'clairvoyance', 'counterspell', 'daylight', 'dispel-magic', 'fear', 'fireball', 'fly', 'gaseous-form', 'haste', 'hypnotic-pattern', 'lightning-bolt', 'major-image', 'protection-from-energy', 'sleet-storm', 'slow', 'stinking-cloud', 'tongues', 'water-breathing', 'water-walk',
      // 4th
      'banishment', 'blight', 'confusion', 'dimension-door', 'dominate-beast', 'greater-invisibility', 'ice-storm', 'polymorph', 'stoneskin', 'wall-of-fire',
      // 5th
      'animate-objects', 'cloudkill', 'cone-of-cold', 'creation', 'dominate-person', 'hold-monster', 'insect-plague', 'seeming', 'telekinesis', 'teleportation-circle', 'wall-of-stone',
      // 6th
      'chain-lightning', 'circle-of-death', 'disintegrate', 'eyebite', 'globe-of-invulnerability', 'mass-suggestion', 'move-earth', 'sunbeam', 'true-seeing',
      // 7th
      'delayed-blast-fireball', 'etherealness', 'finger-of-death', 'fire-storm', 'plane-shift', 'prismatic-spray', 'reverse-gravity', 'teleport',
      // 8th
      'dominate-monster', 'earthquake', 'incendiary-cloud', 'power-word-stun', 'sunburst',
      // 9th
      'gate', 'meteor-swarm', 'power-word-kill', 'time-stop', 'wish',
    ],
  },
  subclassLevel: 1,
  subclassLabel: 'Sorcerous Origin',
  subclasses: [
    {
      id: 'draconic',
      name: 'Draconic Bloodline',
      description:
        'The magic of a draconic ancestor runs in your veins. Your body grows tougher and more draconic as you level, your spells of your ancestor\'s element hit harder, and you eventually sprout wings and command a dragon\'s presence.',
      features: [
        {
          level: 1,
          name: 'Dragon Ancestor',
          description:
            'Choose a dragon type and its associated damage type (acid, cold, fire, lightning, or poison). You can read and speak Draconic, and you double your proficiency bonus on Charisma checks when interacting with dragons.',
        },
        {
          level: 1,
          name: 'Draconic Resilience',
          description: 'Your hit point maximum increases by 1 per sorcerer level. While unarmored, your AC equals 13 + Dexterity modifier.',
        },
        {
          level: 6,
          name: 'Elemental Affinity',
          description:
            'When you cast a spell that deals damage of your ancestor\'s type, add your Charisma modifier to one damage roll. You can also spend 1 sorcery point to gain resistance to that damage type for 1 hour.',
        },
        {
          level: 14,
          name: 'Dragon Wings',
          description: 'As a bonus action, sprout dragon wings that grant a flying speed equal to your walking speed. They last until dismissed and cannot appear while you wear armor not made to accommodate them.',
        },
        {
          level: 18,
          name: 'Draconic Presence',
          description:
            'As an action, spend 5 sorcery points to exude awe or fear in a 60-foot aura for 1 minute; each hostile creature starting its turn inside must succeed on a Wisdom save or be charmed or frightened until the aura ends.',
        },
      ],
    },
  ],
};
