import type { CharClass } from '@/types/ruleset';

const asi = {
  name: 'Ability Score Improvement',
  description: 'Increase one ability score by 2, or two ability scores by 1 each. No score may exceed 20.',
};

export const wizard: CharClass = {
  id: 'wizard',
  name: 'Wizard',
  description:
    'A scholar of the arcane who learns magic through study and experimentation. Wizards keep their spells in a spellbook and prepare a different selection each day, giving them the widest and most adaptable spell list of any class at the cost of fragility.',
  hitDie: 6,
  primaryAbilities: ['int'],
  savingThrows: ['int', 'wis'],
  armorProficiencies: [],
  weaponProficiencies: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'],
  toolProficiencies: [],
  skillChoices: {
    count: 2,
    from: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'],
  },
  startingEquipment: [
    'A quarterstaff',
    'An arcane focus',
    'A scholar\'s pack',
    'A spellbook',
  ],
  startingItems: [
    { itemId: 'quarterstaff', qty: 1 },
    { itemId: 'arcane-focus', qty: 1 },
    { itemId: 'scholars-pack', qty: 1 },
    { itemId: 'spellbook', qty: 1 },
  ],
  startingGold: 0,
  features: [
    {
      level: 1,
      name: 'Spellcasting',
      description:
        'You cast wizard spells using Intelligence. Your spellbook begins with six 1st-level spells and gains two more each level; you may also copy found spells into it. Each day prepare spells equal to your Intelligence modifier plus your wizard level (minimum 1). You know 3 cantrips at 1st level and can cast ritual spells from your book without preparing them.',
    },
    {
      level: 1,
      name: 'Arcane Recovery',
      description:
        'Once per day during a short rest, recover expended spell slots with a combined level up to half your wizard level (rounded up), none of which may be 6th level or higher.',
    },
    {
      level: 2,
      name: 'Arcane Tradition',
      description: 'Choose a school of magic to specialize in. It grants features at 2nd, 6th, 10th, and 14th level.',
    },
    { level: 4, ...asi },
    { level: 8, ...asi },
    { level: 12, ...asi },
    { level: 16, ...asi },
    {
      level: 18,
      name: 'Spell Mastery',
      description: 'Choose one 1st-level and one 2nd-level wizard spell from your spellbook. You can cast them at their lowest level without expending a spell slot while they are prepared. You may swap the choices after 8 hours of study.',
    },
    { level: 19, ...asi },
    {
      level: 20,
      name: 'Signature Spells',
      description: 'Choose two 3rd-level wizard spells from your spellbook; they are always prepared, do not count against your prepared total, and each can be cast once at 3rd level without a slot per short or long rest.',
    },
  ],
  spellcasting: {
    ability: 'int',
    type: 'full',
    cantripsKnown: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    prepared: { levelMultiplier: 1, minimum: 1 },
    startsAtLevel: 1,
    ritualCasting: true,
    focus: 'arcane focus',
    spellList: [
      // cantrips
      'acid-splash', 'chill-touch', 'dancing-lights', 'fire-bolt', 'light', 'mage-hand', 'mending', 'message', 'minor-illusion', 'poison-spray', 'prestidigitation', 'ray-of-frost', 'shocking-grasp', 'true-strike',
      // 1st
      'alarm', 'burning-hands', 'charm-person', 'color-spray', 'comprehend-languages', 'detect-magic', 'disguise-self', 'expeditious-retreat', 'false-life', 'feather-fall', 'find-familiar', 'floating-disk', 'fog-cloud', 'grease', 'hideous-laughter', 'identify', 'illusory-script', 'jump', 'longstrider', 'mage-armor', 'magic-missile', 'protection-from-evil-and-good', 'shield', 'silent-image', 'sleep', 'thunderwave', 'unseen-servant',
      // 2nd
      'acid-arrow', 'alter-self', 'arcane-lock', 'blindness-deafness', 'blur', 'continual-flame', 'darkness', 'darkvision', 'detect-thoughts', 'enlarge-reduce', 'flaming-sphere', 'gentle-repose', 'gust-of-wind', 'hold-person', 'invisibility', 'knock', 'levitate', 'locate-object', 'magic-mouth', 'magic-weapon', 'magic-aura', 'mirror-image', 'misty-step', 'ray-of-enfeeblement', 'rope-trick', 'scorching-ray', 'see-invisibility', 'shatter', 'spider-climb', 'suggestion', 'web',
      // 3rd
      'animate-dead', 'bestow-curse', 'blink', 'clairvoyance', 'counterspell', 'dispel-magic', 'fear', 'fireball', 'fly', 'gaseous-form', 'glyph-of-warding', 'haste', 'hypnotic-pattern', 'lightning-bolt', 'magic-circle', 'major-image', 'nondetection', 'phantom-steed', 'protection-from-energy', 'remove-curse', 'sending', 'sleet-storm', 'slow', 'stinking-cloud', 'tiny-hut', 'tongues', 'vampiric-touch', 'water-breathing',
      // 4th
      'arcane-eye', 'banishment', 'black-tentacles', 'blight', 'confusion', 'conjure-minor-elementals', 'control-water', 'dimension-door', 'faithful-hound', 'fabricate', 'fire-shield', 'greater-invisibility', 'hallucinatory-terrain', 'ice-storm', 'locate-creature', 'phantasmal-killer', 'polymorph', 'private-sanctum', 'resilient-sphere', 'secret-chest', 'stone-shape', 'stoneskin', 'wall-of-fire',
      // 5th
      'animate-objects', 'arcane-hand', 'cloudkill', 'cone-of-cold', 'conjure-elemental', 'contact-other-plane', 'creation', 'dominate-person', 'dream', 'geas', 'hold-monster', 'legend-lore', 'mislead', 'modify-memory', 'passwall', 'planar-binding', 'scrying', 'seeming', 'telekinesis', 'telepathic-bond', 'teleportation-circle', 'wall-of-force', 'wall-of-stone',
      // 6th
      'chain-lightning', 'circle-of-death', 'contingency', 'create-undead', 'disintegrate', 'eyebite', 'flesh-to-stone', 'freezing-sphere', 'globe-of-invulnerability', 'guards-and-wards', 'instant-summons', 'irresistible-dance', 'magic-jar', 'mass-suggestion', 'move-earth', 'programmed-illusion', 'sunbeam', 'true-seeing', 'wall-of-ice',
      // 7th
      'arcane-sword', 'delayed-blast-fireball', 'etherealness', 'finger-of-death', 'forcecage', 'magnificent-mansion', 'mirage-arcane', 'plane-shift', 'prismatic-spray', 'project-image', 'reverse-gravity', 'sequester', 'simulacrum', 'symbol', 'teleport',
      // 8th
      'antimagic-field', 'antipathy-sympathy', 'clone', 'control-weather', 'demiplane', 'dominate-monster', 'feeblemind', 'incendiary-cloud', 'maze', 'mind-blank', 'power-word-stun', 'sunburst',
      // 9th
      'astral-projection', 'foresight', 'gate', 'imprisonment', 'meteor-swarm', 'power-word-kill', 'prismatic-wall', 'shapechange', 'time-stop', 'true-polymorph', 'weird', 'wish',
    ],
  },
  subclassLevel: 2,
  subclassLabel: 'Arcane Tradition',
  subclasses: [
    {
      id: 'evocation',
      name: 'School of Evocation',
      description:
        'Evokers specialize in spells that channel raw elemental energy into blasts of fire, lightning, and cold. They learn to shield allies from their own explosions, squeeze extra damage from every spell, and eventually turn cantrips and blasts into near-certain hits.',
      features: [
        {
          level: 2,
          name: 'Evocation Savant',
          description: 'Copying an evocation spell into your spellbook costs half the usual gold and time.',
        },
        {
          level: 2,
          name: 'Sculpt Spells',
          description: 'When you cast an evocation spell, choose a number of creatures equal to 1 + the spell\'s level; they automatically succeed on their saves against it and take no damage if they would normally take half on a success.',
        },
        {
          level: 6,
          name: 'Potent Cantrip',
          description: 'When a creature succeeds on a saving throw against one of your damaging cantrips, it still takes half the cantrip\'s damage but suffers no other effect.',
        },
        {
          level: 10,
          name: 'Empowered Evocation',
          description: 'Add your Intelligence modifier to one damage roll of any wizard evocation spell you cast.',
        },
        {
          level: 14,
          name: 'Overchannel',
          description:
            'When you cast a wizard spell of 1st through 5th level that deals damage, you can deal maximum damage. The first use per long rest is free; each further use deals 2d12 necrotic damage per spell level to you, ignoring resistance and immunity, increasing by 1d12 per level for each additional use before a long rest.',
        },
      ],
    },
  ],
};
