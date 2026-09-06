import type { CharClass } from '@/types/ruleset';

const asi = {
  name: 'Ability Score Improvement',
  description: 'Increase one ability score by 2, or two ability scores by 1 each. No score may exceed 20.',
};

export const druid: CharClass = {
  id: 'druid',
  name: 'Druid',
  description:
    'A guardian of the natural world who draws magic from the land itself. Druids command the elements, speak with beasts, and can shed their own form to fight or scout as an animal, refusing metal armor as a matter of principle.',
  hitDie: 8,
  primaryAbilities: ['wis'],
  savingThrows: ['int', 'wis'],
  armorProficiencies: ['light armor (nonmetal)', 'medium armor (nonmetal)', 'shields (nonmetal)'],
  weaponProficiencies: ['clubs', 'daggers', 'darts', 'javelins', 'maces', 'quarterstaffs', 'scimitars', 'sickles', 'slings', 'spears'],
  toolProficiencies: ['herbalism kit'],
  skillChoices: {
    count: 2,
    from: ['arcana', 'animal-handling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'],
  },
  startingEquipment: [
    'A wooden shield',
    'A scimitar',
    'Leather armor, an explorer\'s pack, and a druidic focus',
  ],
  startingItems: [
    { itemId: 'shield', qty: 1 },
    { itemId: 'scimitar', qty: 1 },
    { itemId: 'leather-armor', qty: 1 },
    { itemId: 'explorers-pack', qty: 1 },
    { itemId: 'druidic-focus', qty: 1 },
  ],
  startingGold: 0,
  features: [
    {
      level: 1,
      name: 'Druidic',
      description: 'You know the secret language of druids and can leave hidden messages readable only by other druids; others need a DC 15 Wisdom (Perception) check to notice a message and magic to decipher it.',
    },
    {
      level: 1,
      name: 'Spellcasting',
      description:
        'You cast druid spells using Wisdom. You know 2 cantrips at 1st level and prepare a number of spells equal to your Wisdom modifier plus your druid level (minimum 1) from the druid list each day. A druidic focus channels your magic, and you can cast prepared ritual spells as rituals.',
    },
    {
      level: 2,
      name: 'Wild Shape',
      description:
        'As an action, transform into a beast you have seen, twice per short or long rest, for hours equal to half your druid level. Max CR 1/4 with no flying or swimming speed at 2nd; CR 1/2 with swimming at 4th; CR 1 with flying at 8th. You keep your mental scores and revert when reduced to 0 hit points.',
    },
    {
      level: 2,
      name: 'Druid Circle',
      description: 'Choose a circle that grants features at 2nd, 6th, 10th, and 14th level.',
    },
    { level: 4, ...asi },
    { level: 8, ...asi },
    { level: 12, ...asi },
    { level: 16, ...asi },
    {
      level: 18,
      name: 'Timeless Body',
      description: 'You age only one year for every ten that pass, and you cannot be magically aged.',
    },
    {
      level: 18,
      name: 'Beast Spells',
      description: 'You can cast many druid spells while in a Wild Shape form, performing somatic and verbal components in beast form, though not material components.',
    },
    { level: 19, ...asi },
    {
      level: 20,
      name: 'Archdruid',
      description: 'You can use Wild Shape an unlimited number of times, and you may ignore verbal and somatic components and material components without cost for druid spells.',
    },
  ],
  spellcasting: {
    ability: 'wis',
    type: 'full',
    cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    prepared: { levelMultiplier: 1, minimum: 1 },
    startsAtLevel: 1,
    ritualCasting: true,
    focus: 'druidic focus',
    spellList: [
      // cantrips
      'druidcraft', 'guidance', 'mending', 'poison-spray', 'produce-flame', 'resistance', 'shillelagh',
      // 1st
      'animal-friendship', 'charm-person', 'create-or-destroy-water', 'cure-wounds', 'detect-magic', 'detect-poison-and-disease', 'entangle', 'faerie-fire', 'fog-cloud', 'goodberry', 'healing-word', 'jump', 'longstrider', 'purify-food-and-drink', 'speak-with-animals', 'thunderwave',
      // 2nd
      'animal-messenger', 'barkskin', 'darkvision', 'enhance-ability', 'find-traps', 'flame-blade', 'flaming-sphere', 'gust-of-wind', 'heat-metal', 'hold-person', 'lesser-restoration', 'locate-animals-or-plants', 'locate-object', 'moonbeam', 'pass-without-trace', 'protection-from-poison', 'spike-growth',
      // 3rd
      'call-lightning', 'conjure-animals', 'daylight', 'dispel-magic', 'meld-into-stone', 'plant-growth', 'protection-from-energy', 'sleet-storm', 'speak-with-plants', 'water-breathing', 'water-walk', 'wind-wall',
      // 4th
      'blight', 'confusion', 'conjure-minor-elementals', 'conjure-woodland-beings', 'control-water', 'dominate-beast', 'freedom-of-movement', 'giant-insect', 'hallucinatory-terrain', 'ice-storm', 'locate-creature', 'polymorph', 'stone-shape', 'stoneskin', 'wall-of-fire',
      // 5th
      'antilife-shell', 'awaken', 'commune-with-nature', 'conjure-elemental', 'contagion', 'geas', 'greater-restoration', 'insect-plague', 'mass-cure-wounds', 'planar-binding', 'reincarnate', 'scrying', 'tree-stride', 'wall-of-stone',
      // 6th
      'conjure-fey', 'find-the-path', 'heal', 'heroes-feast', 'move-earth', 'sunbeam', 'transport-via-plants', 'wall-of-thorns', 'wind-walk',
      // 7th
      'fire-storm', 'mirage-arcane', 'plane-shift', 'regenerate', 'reverse-gravity',
      // 8th
      'animal-shapes', 'antipathy-sympathy', 'control-weather', 'earthquake', 'feeblemind', 'sunburst',
      // 9th
      'foresight', 'shapechange', 'storm-of-vengeance', 'true-resurrection',
    ],
  },
  subclassLevel: 2,
  subclassLabel: 'Druid Circle',
  subclasses: [
    {
      id: 'land',
      name: 'Circle of the Land',
      description:
        'Druids of the Circle of the Land keep ancient traditions of nature magic tied to a particular terrain. They lean on spellcasting rather than shapeshifting, gaining extra spells and resilience from their chosen land.',
      features: [
        {
          level: 2,
          name: 'Bonus Cantrip',
          description: 'You learn one additional druid cantrip of your choice.',
        },
        {
          level: 2,
          name: 'Natural Recovery',
          description:
            'Once per day during a short rest, recover expended spell slots with a combined level up to half your druid level (rounded up), none of which may be 6th level or higher.',
        },
        {
          level: 3,
          name: 'Circle Spells',
          description:
            'Choose a land type (arctic, coast, desert, forest, grassland, mountain, swamp, or Underdark). You gain two bonus spells tied to it at 3rd, 5th, 7th, and 9th level; they are always prepared and count as druid spells.',
        },
        {
          level: 6,
          name: 'Land\'s Stride',
          description: 'Moving through nonmagical difficult terrain costs no extra movement, and you can pass through nonmagical plants without harm. You have advantage on saves against magically created or manipulated plants that impede movement.',
        },
        {
          level: 10,
          name: 'Nature\'s Ward',
          description: 'You cannot be charmed or frightened by elementals or fey, and you are immune to poison and disease.',
        },
        {
          level: 14,
          name: 'Nature\'s Sanctuary',
          description:
            'When a beast or plant creature attacks you, it must first succeed on a Wisdom save against your spell save DC or choose a different target or action. A creature that saves is immune to this for 24 hours.',
        },
      ],
    },
  ],
};
