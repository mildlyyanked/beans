import type { Mechanics } from '@/types/ruleset';

const full: number[][] = [
  [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1],
];
const half: number[][] = [
  [], [2], [3], [3], [4, 2], [4, 2], [4, 3], [4, 3], [4, 3, 2], [4, 3, 2],
  [4, 3, 3], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2],
];
const third: number[][] = [
  [], [], [2], [3], [3], [3], [4, 2], [4, 2], [4, 2], [4, 3],
  [4, 3], [4, 3], [4, 3, 2], [4, 3, 2], [4, 3, 2], [4, 3, 3], [4, 3, 3], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 1],
];
// Pact magic: one slot level; represent as [slots at that level] with zeros for lower levels.
const pact: number[][] = [
  [1], [2], [0, 2], [0, 2], [0, 0, 2], [0, 0, 2], [0, 0, 0, 2], [0, 0, 0, 2], [0, 0, 0, 0, 2], [0, 0, 0, 0, 2],
  [0, 0, 0, 0, 3], [0, 0, 0, 0, 3], [0, 0, 0, 0, 3], [0, 0, 0, 0, 3], [0, 0, 0, 0, 3], [0, 0, 0, 0, 3], [0, 0, 0, 0, 4], [0, 0, 0, 0, 4], [0, 0, 0, 0, 4], [0, 0, 0, 0, 4],
];

export const mechanics: Mechanics = {
  abilityModifierFormula: 'floor((score - 10) / 2)',
  proficiencyBonusByLevel: [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6],
  xpThresholds: [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000],
  levelCap: 20,
  standardArray: [15, 14, 13, 12, 10, 8],
  pointBuy: { budget: 27, min: 8, max: 15, costs: { '8': 0, '9': 1, '10': 2, '11': 3, '12': 4, '13': 5, '14': 7, '15': 9 } },
  rollMethod: '4d6kh3',
  abilityScoreMax: 20,
  spellSlots: { full, half, third, pact },
  unarmoredAcFormula: '10 + dex',
  hpPerLevel: 'average',
  initiativeFormula: '1d20 + dex',
  deathSaves: { successesNeeded: 3, failuresAllowed: 3 },
  dcGuidelines: [
    { label: 'Very easy', dc: 5 },
    { label: 'Easy', dc: 10 },
    { label: 'Medium', dc: 15 },
    { label: 'Hard', dc: 20 },
    { label: 'Very hard', dc: 25 },
    { label: 'Nearly impossible', dc: 30 },
  ],
  xpBudgetPerLevel: [
    { easy: 25, medium: 50, hard: 75, deadly: 100 }, { easy: 50, medium: 100, hard: 150, deadly: 200 },
    { easy: 75, medium: 150, hard: 225, deadly: 400 }, { easy: 125, medium: 250, hard: 375, deadly: 500 },
    { easy: 250, medium: 500, hard: 750, deadly: 1100 }, { easy: 300, medium: 600, hard: 900, deadly: 1400 },
    { easy: 350, medium: 750, hard: 1100, deadly: 1700 }, { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
    { easy: 550, medium: 1100, hard: 1600, deadly: 2400 }, { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
    { easy: 800, medium: 1600, hard: 2400, deadly: 3600 }, { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
    { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 }, { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
    { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 }, { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
    { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 }, { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
    { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 }, { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 },
  ],
  coreRules: [
    {
      id: 'checks',
      title: 'Ability Checks, Saves & Attacks',
      core: true,
      tags: ['core'],
      text: 'Every check is d20 + ability modifier (+ proficiency bonus if proficient) against a DC or Armor Class. Meet or beat the target to succeed. Advantage: roll 2d20 keep highest; disadvantage: keep lowest; they cancel each other out regardless of count. A natural 20 on an attack is a critical hit (roll damage dice twice); a natural 1 on an attack always misses. Only call for a roll when the outcome is uncertain and failure is interesting. Passive checks = 10 + modifiers.',
    },
    {
      id: 'combat',
      title: 'Combat',
      core: true,
      tags: ['core', 'combat'],
      text: 'Roll initiative (d20 + DEX) at the start; act in descending order each round (6 seconds). On your turn: move up to your speed and take one action (Attack, Cast a Spell, Dash, Disengage, Dodge, Help, Hide, Ready, Search, Use an Object). Some features grant a bonus action; each creature gets one reaction per round (e.g. opportunity attacks when an enemy leaves your reach without Disengaging). Attack roll: d20 + ability mod + proficiency vs target AC. Melee uses STR (or DEX for finesse); ranged uses DEX. Damage = weapon dice + ability modifier. Two-weapon fighting: bonus-action attack with a light weapon, no ability modifier to damage. Cover grants +2 (half) or +5 (three-quarters) AC.',
    },
    {
      id: 'damage-death',
      title: 'Damage, Dying & Healing',
      core: true,
      tags: ['core', 'combat'],
      text: 'Temporary hit points absorb damage first and do not stack. At 0 HP a creature falls unconscious and begins making death saving throws at the start of its turns: d20, 10+ is a success, below 10 a failure; three successes stabilize, three failures kill. A natural 1 counts as two failures; a natural 20 restores 1 HP. Damage taken while at 0 HP causes a failure (a critical hit causes two). If damage reduces you to 0 and the remainder equals or exceeds your HP maximum, you die instantly. Stabilize a creature with a DC 10 Medicine check. Any healing returns an unconscious creature to consciousness.',
    },
    {
      id: 'resting',
      title: 'Resting',
      core: true,
      tags: ['core'],
      text: 'Short rest: at least 1 hour; spend Hit Dice (roll + CON mod each) to heal. Long rest: at least 8 hours (6 sleeping); regain all HP, half your total Hit Dice (min 1), and all spell slots. A character can benefit from only one long rest per 24 hours. Rests can be interrupted by combat or strenuous activity.',
    },
    {
      id: 'spellcasting',
      title: 'Spellcasting',
      core: true,
      tags: ['core', 'magic'],
      text: 'Spell save DC = 8 + proficiency bonus + spellcasting ability modifier. Spell attack bonus = proficiency bonus + spellcasting ability modifier. Casting a leveled spell expends a slot of that level or higher; cantrips are free and scale with character level (5th, 11th, 17th). Only one concentration spell at a time; taking damage forces a CON save (DC 10 or half damage, whichever is higher). You can cast only one leveled spell per turn if you also cast a bonus-action spell. Rituals take 10 extra minutes but cost no slot.',
    },
    {
      id: 'social-exploration',
      title: 'Social Interaction & Exploration',
      core: true,
      tags: ['core'],
      text: 'NPCs have attitudes: hostile, indifferent, or friendly. Persuasion, Deception, and Intimidation can shift attitude; DC depends on how much the NPC stands to lose. Travel pace: fast (4 mph, -5 passive Perception), normal (3 mph), slow (2 mph, can stealth). Light: bright, dim (lightly obscured, disadvantage on Perception by sight), darkness (heavily obscured, effectively blinded). Darkvision sees dim light as bright and darkness as dim within range, in shades of gray. Falling: 1d6 bludgeoning per 10 feet (max 20d6). Suffocation: hold breath for 1 + CON mod minutes.',
    },
    {
      id: 'advancement',
      title: 'Advancement',
      core: false,
      tags: ['core'],
      text: 'Characters gain XP for overcoming challenges (monster XP is listed in stat blocks; non-combat challenges award comparable XP). On reaching the threshold for a new level they gain hit points (roll or take average of their hit die + CON mod), new class features, and, at levels 4, 8, 12, 16, and 19, an Ability Score Improvement (+2 to one score or +1 to two, max 20). Milestone advancement: the DM may instead level the party after major story achievements.',
    },
    {
      id: 'equipment',
      title: 'Equipment & Encumbrance',
      core: false,
      text: 'Currency: 1 gp = 10 sp = 100 cp; 1 pp = 10 gp; 1 ep = 5 sp. Carrying capacity = STR score × 15 pounds. Armor: light adds full DEX, medium adds DEX up to +2, heavy adds none and may impose disadvantage on Stealth and a speed penalty if STR is too low. Donning armor takes 1 minute (light), 5 (medium), 10 (heavy). A shield adds +2 AC and requires a free hand. Lifestyle expenses range from wretched (free) to aristocratic (10 gp/day).',
    },
    {
      id: 'conditions-ref',
      title: 'Conditions',
      core: false,
      text: 'See the Conditions section of this ruleset for full definitions of Blinded, Charmed, Deafened, Exhaustion, Frightened, Grappled, Incapacitated, Invisible, Paralyzed, Petrified, Poisoned, Prone, Restrained, Stunned, and Unconscious.',
    },
    {
      id: 'monsters',
      title: 'Running Monsters',
      core: false,
      tags: ['combat'],
      text: 'Use the stat block as written. Challenge Rating approximates the level of a party of four that would find the creature a medium-hard fight. Encounter difficulty: total monster XP (multiplied ×1.5 for 2 monsters, ×2 for 3–6, ×2.5 for 7–10) compared against the party XP thresholds. Monsters act with intent: predators retreat when badly hurt, intelligent foes use terrain, parley, or flee.',
    },
  ],
};
