import type { Species } from '@/types/ruleset';

/**
 * SRD 5.1 species (races). Trait text is drawn from the System Reference
 * Document 5.1 (CC-BY-4.0). Descriptions are original.
 */
export const species: Species[] = [
  {
    id: 'dwarf',
    name: 'Dwarf',
    description:
      'Stout and unyielding, dwarves carve their halls from the roots of mountains and measure their lives in the slow accretion of stone and gold. They keep long memories, longer grudges, and an ironclad loyalty to clan and craft.',
    abilityBonuses: { con: 2 },
    size: 'Medium',
    speed: 25,
    languages: ['Common', 'Dwarvish'],
    traits: [
      {
        name: 'Darkvision',
        description:
          'Accustomed to life underground, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.',
      },
      {
        name: 'Dwarven Resilience',
        description: 'You have advantage on saving throws against poison, and you have resistance against poison damage.',
      },
      {
        name: 'Dwarven Combat Training',
        description: 'You have proficiency with the battleaxe, handaxe, light hammer, and warhammer.',
      },
      {
        name: 'Tool Proficiency',
        description: 'You gain proficiency with the artisan\'s tools of your choice: smith\'s tools, brewer\'s supplies, or mason\'s tools.',
      },
      {
        name: 'Stonecunning',
        description:
          'Whenever you make an Intelligence (History) check related to the origin of stonework, you are considered proficient in the History skill and add double your proficiency bonus to the check, instead of your normal proficiency bonus.',
      },
      {
        name: 'Speed',
        description: 'Your speed is not reduced by wearing heavy armor.',
      },
    ],
    variants: [
      {
        id: 'hill-dwarf',
        name: 'Hill Dwarf',
        description: 'As a hill dwarf, you have keen senses, deep intuition, and remarkable resilience.',
        abilityBonuses: { wis: 1 },
        traits: [
          {
            name: 'Dwarven Toughness',
            description: 'Your hit point maximum increases by 1, and it increases by 1 every time you gain a level.',
          },
        ],
      },
    ],
  },
  {
    id: 'elf',
    name: 'Elf',
    description:
      'Graceful and long-lived, elves move through the world with the patience of those who expect to see centuries unfold. They love beauty, music, and magic, and they dream where others merely sleep.',
    abilityBonuses: { dex: 2 },
    size: 'Medium',
    speed: 30,
    languages: ['Common', 'Elvish'],
    traits: [
      {
        name: 'Darkvision',
        description:
          'Accustomed to twilit forests and the night sky, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.',
      },
      {
        name: 'Keen Senses',
        description: 'You have proficiency in the Perception skill.',
      },
      {
        name: 'Fey Ancestry',
        description: 'You have advantage on saving throws against being charmed, and magic can\'t put you to sleep.',
      },
      {
        name: 'Trance',
        description:
          'Elves don\'t need to sleep. Instead, they meditate deeply, remaining semiconscious, for 4 hours a day. (The Common word for such meditation is "trance.") While meditating, you can dream after a fashion; such dreams are actually mental exercises that have become reflexive through years of practice. After resting in this way, you gain the same benefit that a human does from 8 hours of sleep.',
      },
    ],
    variants: [
      {
        id: 'high-elf',
        name: 'High Elf',
        description:
          'As a high elf, you have a keen mind and a mastery of at least the basics of magic. You know one additional language of your choice.',
        abilityBonuses: { int: 1 },
        traits: [
          {
            name: 'Elf Weapon Training',
            description: 'You have proficiency with the longsword, shortsword, shortbow, and longbow.',
          },
          {
            name: 'Cantrip',
            description: 'You know one cantrip of your choice from the wizard spell list. Intelligence is your spellcasting ability for it.',
          },
          {
            name: 'Extra Language',
            description: 'You can speak, read, and write one extra language of your choice.',
          },
        ],
      },
    ],
  },
  {
    id: 'halfling',
    name: 'Halfling',
    description:
      'Small, cheerful, and quietly indomitable, halflings prize comfort, good food, and the company of friends. Yet beneath the easy warmth lies a stubborn courage that has carried many a halfling through perils giants would flee.',
    abilityBonuses: { dex: 2 },
    size: 'Small',
    speed: 25,
    languages: ['Common', 'Halfling'],
    traits: [
      {
        name: 'Lucky',
        description: 'When you roll a 1 on the d20 for an attack roll, ability check, or saving throw, you can reroll the die and must use the new roll.',
      },
      {
        name: 'Brave',
        description: 'You have advantage on saving throws against being frightened.',
      },
      {
        name: 'Halfling Nimbleness',
        description: 'You can move through the space of any creature that is of a size larger than yours.',
      },
    ],
    variants: [
      {
        id: 'lightfoot',
        name: 'Lightfoot',
        description: 'As a lightfoot halfling, you can easily hide from notice, even using other people as cover. You\'re inclined to be affable and get along well with others.',
        abilityBonuses: { cha: 1 },
        traits: [
          {
            name: 'Naturally Stealthy',
            description: 'You can attempt to hide even when you are obscured only by a creature that is at least one size larger than you.',
          },
        ],
      },
    ],
  },
  {
    id: 'human',
    name: 'Human',
    description:
      'Restless, ambitious, and endlessly varied, humans build empires in a single lifetime and forget them in the next. What they lack in longevity they make up for in sheer drive, adapting to every land and calling under the sun.',
    abilityBonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
    size: 'Medium',
    speed: 30,
    languages: ['Common'],
    traits: [
      {
        name: 'Extra Language',
        description: 'You can speak, read, and write one extra language of your choice.',
      },
    ],
  },
  {
    id: 'dragonborn',
    name: 'Dragonborn',
    description:
      'Born of dragons and proud of it, dragonborn walk with the bearing of their mighty ancestors. Scaled, tall, and honor-bound, they carry a spark of draconic fury that can be unleashed with a single breath.',
    abilityBonuses: { str: 2, cha: 1 },
    size: 'Medium',
    speed: 30,
    languages: ['Common', 'Draconic'],
    traits: [
      {
        name: 'Draconic Ancestry',
        description:
          'You have draconic ancestry. Choose one type of dragon: black (acid, 5 by 30 ft. line, Dex. save), blue (lightning, 5 by 30 ft. line, Dex. save), brass (fire, 5 by 30 ft. line, Dex. save), bronze (lightning, 5 by 30 ft. line, Dex. save), copper (acid, 5 by 30 ft. line, Dex. save), gold (fire, 15 ft. cone, Dex. save), green (poison, 15 ft. cone, Con. save), red (fire, 15 ft. cone, Dex. save), silver (cold, 15 ft. cone, Con. save), or white (cold, 15 ft. cone, Con. save). Your breath weapon and damage resistance are determined by the dragon type.',
      },
      {
        name: 'Breath Weapon',
        description:
          'You can use your action to exhale destructive energy. Your draconic ancestry determines the size, shape, and damage type of the exhalation. When you use your breath weapon, each creature in the area of the exhalation must make a saving throw, the type of which is determined by your draconic ancestry. The DC for this saving throw equals 8 + your Constitution modifier + your proficiency bonus. A creature takes 2d6 damage on a failed save, and half as much damage on a successful one. The damage increases to 3d6 at 6th level, 4d6 at 11th level, and 5d6 at 16th level. After you use your breath weapon, you can\'t use it again until you complete a short or long rest.',
      },
      {
        name: 'Damage Resistance',
        description: 'You have resistance to the damage type associated with your draconic ancestry.',
      },
    ],
  },
  {
    id: 'gnome',
    name: 'Gnome',
    description:
      'Gnomes greet the world with boundless curiosity and a laugh never far from their lips. Tinkerers, illusionists, and burrow-dwellers, they find delight in every clever mechanism and every secret the earth keeps.',
    abilityBonuses: { int: 2 },
    size: 'Small',
    speed: 25,
    languages: ['Common', 'Gnomish'],
    traits: [
      {
        name: 'Darkvision',
        description:
          'Accustomed to life underground, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.',
      },
      {
        name: 'Gnome Cunning',
        description: 'You have advantage on all Intelligence, Wisdom, and Charisma saving throws against magic.',
      },
    ],
    variants: [
      {
        id: 'rock-gnome',
        name: 'Rock Gnome',
        description: 'As a rock gnome, you have a natural inventiveness and hardiness beyond that of other gnomes.',
        abilityBonuses: { con: 1 },
        traits: [
          {
            name: 'Artificer\'s Lore',
            description:
              'Whenever you make an Intelligence (History) check related to magic items, alchemical objects, or technological devices, you can add twice your proficiency bonus, instead of any proficiency bonus you normally apply.',
          },
          {
            name: 'Tinker',
            description:
              'You have proficiency with artisan\'s tools (tinker\'s tools). Using those tools, you can spend 1 hour and 10 gp worth of materials to construct a Tiny clockwork device (AC 5, 1 hp). The device ceases to function after 24 hours (unless you spend 1 hour repairing it to keep the device functioning), or when you use your action to dismantle it; at that time, you can reclaim the materials used to create it. You can have up to three such devices active at a time. When you create a device, choose one of the following options: Clockwork Toy (a clockwork animal, monster, or person that moves 5 feet across the ground on each of your turns in a random direction and makes noises appropriate to the creature it represents), Fire Starter (a device that produces a miniature flame, which you can use to light a candle, torch, or campfire; using the device requires your action), or Music Box (when opened, this music box plays a single song at a moderate volume; the box stops playing when it reaches the song\'s end or when it is closed).',
          },
        ],
      },
    ],
  },
  {
    id: 'half-elf',
    name: 'Half-Elf',
    description:
      'Caught between two worlds and fully at home in neither, half-elves learn early to make their own way. They pair elven grace with human ambition, and their easy charm opens doors that stay shut to others.',
    abilityBonuses: { cha: 2 },
    flexibleBonus: { count: 2, amount: 1, exclude: ['cha'] },
    size: 'Medium',
    speed: 30,
    languages: ['Common', 'Elvish'],
    traits: [
      {
        name: 'Darkvision',
        description:
          'Thanks to your elf blood, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.',
      },
      {
        name: 'Fey Ancestry',
        description: 'You have advantage on saving throws against being charmed, and magic can\'t put you to sleep.',
      },
      {
        name: 'Skill Versatility',
        description: 'You gain proficiency in two skills of your choice.',
      },
      {
        name: 'Extra Language',
        description: 'You can speak, read, and write one extra language of your choice.',
      },
    ],
  },
  {
    id: 'half-orc',
    name: 'Half-Orc',
    description:
      'Half-orcs carry the strength and ferocity of their orc heritage alongside a human capacity for restraint and reflection. Many are met with suspicion, and many answer it by proving themselves the fiercest, most steadfast companions on any battlefield.',
    abilityBonuses: { str: 2, con: 1 },
    size: 'Medium',
    speed: 30,
    languages: ['Common', 'Orc'],
    traits: [
      {
        name: 'Darkvision',
        description:
          'Thanks to your orc blood, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.',
      },
      {
        name: 'Menacing',
        description: 'You gain proficiency in the Intimidation skill.',
      },
      {
        name: 'Relentless Endurance',
        description: 'When you are reduced to 0 hit points but not killed outright, you can drop to 1 hit point instead. You can\'t use this feature again until you finish a long rest.',
      },
      {
        name: 'Savage Attacks',
        description: 'When you score a critical hit with a melee weapon attack, you can roll one of the weapon\'s damage dice one additional time and add it to the extra damage of the critical hit.',
      },
    ],
  },
  {
    id: 'tiefling',
    name: 'Tiefling',
    description:
      'Marked by horns, tails, and eyes that glow like banked coals, tieflings bear the legacy of an infernal bargain struck long before they were born. The world watches them warily, so tieflings learn to rely on wit, will, and the fire in their blood.',
    abilityBonuses: { int: 1, cha: 2 },
    size: 'Medium',
    speed: 30,
    languages: ['Common', 'Infernal'],
    traits: [
      {
        name: 'Darkvision',
        description:
          'Thanks to your infernal heritage, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.',
      },
      {
        name: 'Hellish Resistance',
        description: 'You have resistance to fire damage.',
      },
      {
        name: 'Infernal Legacy',
        description:
          'You know the thaumaturgy cantrip. When you reach 3rd level, you can cast the hellish rebuke spell as a 2nd-level spell once with this trait and regain the ability to do so when you finish a long rest. When you reach 5th level, you can cast the darkness spell once with this trait and regain the ability to do so when you finish a long rest. Charisma is your spellcasting ability for these spells.',
      },
    ],
  },
];
