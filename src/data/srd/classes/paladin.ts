import type { CharClass } from '@/types/ruleset';

const asi = {
  name: 'Ability Score Improvement',
  description: 'Increase one ability score by 2, or two ability scores by 1 each. No score may exceed 20.',
};

export const paladin: CharClass = {
  id: 'paladin',
  name: 'Paladin',
  description:
    'A holy warrior bound by a sacred oath. Paladins combine heavy armor and martial prowess with divine magic, smiting foes with radiant power, healing allies through touch, and radiating protective auras to those who stand beside them.',
  hitDie: 10,
  primaryAbilities: ['str', 'cha'],
  savingThrows: ['wis', 'cha'],
  armorProficiencies: ['light armor', 'medium armor', 'heavy armor', 'shields'],
  weaponProficiencies: ['simple weapons', 'martial weapons'],
  toolProficiencies: [],
  skillChoices: {
    count: 2,
    from: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'],
  },
  startingEquipment: [
    'A longsword and a shield',
    'Five javelins',
    'A priest\'s pack',
    'Chain mail and a holy symbol',
  ],
  startingItems: [
    { itemId: 'longsword', qty: 1 },
    { itemId: 'shield', qty: 1 },
    { itemId: 'javelin', qty: 5 },
    { itemId: 'priests-pack', qty: 1 },
    { itemId: 'chain-mail', qty: 1 },
    { itemId: 'holy-symbol', qty: 1 },
  ],
  startingGold: 0,
  features: [
    {
      level: 1,
      name: 'Divine Sense',
      description:
        'As an action, sense the location of any celestial, fiend, or undead within 60 feet that is not behind total cover, plus consecrated or desecrated places. Uses per long rest equal 1 + Charisma modifier.',
    },
    {
      level: 1,
      name: 'Lay on Hands',
      description:
        'You have a pool of healing equal to five times your paladin level, restored on a long rest. As an action, touch a creature to restore any amount from the pool, or spend 5 points to cure one disease or neutralize one poison. No effect on undead or constructs.',
    },
    {
      level: 2,
      name: 'Fighting Style',
      description:
        'Choose one specialty: Defense (+1 AC in armor), Dueling (+2 damage with a one-handed weapon and no other weapon), Great Weapon Fighting (reroll 1s and 2s on two-handed damage dice), or Protection (reaction with shield to impose disadvantage on an attack against an adjacent ally).',
    },
    {
      level: 2,
      name: 'Spellcasting',
      description:
        'From 2nd level you cast paladin spells using Charisma. You prepare a number of spells equal to your Charisma modifier plus half your paladin level (minimum 1) from the paladin list each day, and a holy symbol serves as your focus.',
    },
    {
      level: 2,
      name: 'Divine Smite',
      description:
        'When you hit with a melee weapon attack, expend one spell slot to deal extra radiant damage: 2d8 for a 1st-level slot plus 1d8 per higher slot level, to a maximum of 5d8. Add 1d8 more if the target is undead or a fiend.',
    },
    {
      level: 3,
      name: 'Divine Health',
      description: 'The divine magic within you makes you immune to disease.',
    },
    {
      level: 3,
      name: 'Sacred Oath',
      description: 'Swear an oath that grants oath spells, two Channel Divinity options, and features at 3rd, 7th, 15th, and 20th level. Channel Divinity is usable once per short or long rest.',
    },
    { level: 4, ...asi },
    {
      level: 5,
      name: 'Extra Attack',
      description: 'When you take the Attack action, attack twice instead of once.',
    },
    {
      level: 6,
      name: 'Aura of Protection',
      description: 'While you are conscious, you and friendly creatures within 10 feet add your Charisma modifier (minimum +1) to saving throws. The aura expands to 30 feet at 18th level.',
    },
    { level: 8, ...asi },
    {
      level: 10,
      name: 'Aura of Courage',
      description: 'While you are conscious, you and friendly creatures within 10 feet cannot be frightened. The aura expands to 30 feet at 18th level.',
    },
    {
      level: 11,
      name: 'Improved Divine Smite',
      description: 'Whenever you hit a creature with a melee weapon attack, it takes an extra 1d8 radiant damage.',
    },
    { level: 12, ...asi },
    {
      level: 14,
      name: 'Cleansing Touch',
      description: 'As an action, end one spell on yourself or a willing creature you touch. Uses per long rest equal your Charisma modifier (minimum 1).',
    },
    { level: 16, ...asi },
    { level: 19, ...asi },
  ],
  spellcasting: {
    ability: 'cha',
    type: 'half',
    prepared: { levelMultiplier: 0.5, minimum: 1 },
    startsAtLevel: 2,
    ritualCasting: false,
    focus: 'holy symbol',
    spellList: [
      // 1st
      'bless', 'command', 'cure-wounds', 'detect-evil-and-good', 'detect-magic', 'detect-poison-and-disease', 'divine-favor', 'heroism', 'protection-from-evil-and-good', 'purify-food-and-drink', 'shield-of-faith',
      // 2nd
      'aid', 'branding-smite', 'find-steed', 'lesser-restoration', 'locate-object', 'magic-weapon', 'protection-from-poison', 'zone-of-truth',
      // 3rd
      'create-food-and-water', 'daylight', 'dispel-magic', 'magic-circle', 'remove-curse', 'revivify',
      // 4th
      'banishment', 'death-ward', 'locate-creature',
      // 5th
      'dispel-evil-and-good', 'geas', 'raise-dead',
    ],
  },
  subclassLevel: 3,
  subclassLabel: 'Sacred Oath',
  subclasses: [
    {
      id: 'devotion',
      name: 'Oath of Devotion',
      description:
        'Paladins sworn to Devotion hold themselves to ideals of honesty, courage, and compassion. They bless their weapons with holy light, turn back fiends and undead, and eventually shine with an aura that punishes evil.',
      bonusSpells: {
        3: ['protection-from-evil-and-good', 'sanctuary'],
        5: ['lesser-restoration', 'zone-of-truth'],
        9: ['beacon-of-hope', 'dispel-magic'],
        13: ['freedom-of-movement', 'guardian-of-faith'],
        17: ['commune', 'flame-strike'],
      },
      features: [
        {
          level: 3,
          name: 'Channel Divinity: Sacred Weapon',
          description:
            'As an action, imbue one weapon you hold for 1 minute: add your Charisma modifier to attack rolls with it (minimum +1), and it sheds bright light in a 20-foot radius. Ends if you drop the weapon or fall unconscious.',
        },
        {
          level: 3,
          name: 'Channel Divinity: Turn the Unholy',
          description:
            'As an action, each fiend or undead within 30 feet that can see or hear you must make a Wisdom save or be turned for 1 minute or until it takes damage.',
        },
        {
          level: 7,
          name: 'Aura of Devotion',
          description: 'While you are conscious, you and friendly creatures within 10 feet cannot be charmed. The aura expands to 30 feet at 18th level.',
        },
        {
          level: 15,
          name: 'Purity of Spirit',
          description: 'You are permanently under the effect of a protection from evil and good spell.',
        },
        {
          level: 20,
          name: 'Holy Nimbus',
          description:
            'As an action, radiate sunlight for 1 minute: bright light in a 30-foot radius, hostile creatures starting their turn in it take 10 radiant damage, and you have advantage on saves against spells cast by fiends or undead. Once per long rest.',
        },
      ],
    },
  ],
};
