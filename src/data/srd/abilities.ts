import type { Ability, Skill } from '@/types/ruleset';

export const abilities: Ability[] = [
  { id: 'str', name: 'Strength', abbr: 'STR', description: 'Physical power, athletic training, and raw force.' },
  { id: 'dex', name: 'Dexterity', abbr: 'DEX', description: 'Agility, reflexes, balance, and fine motor control.' },
  { id: 'con', name: 'Constitution', abbr: 'CON', description: 'Health, stamina, and vital force.' },
  { id: 'int', name: 'Intelligence', abbr: 'INT', description: 'Mental acuity, memory, and reasoning.' },
  { id: 'wis', name: 'Wisdom', abbr: 'WIS', description: 'Perception, intuition, and awareness.' },
  { id: 'cha', name: 'Charisma', abbr: 'CHA', description: 'Force of personality, persuasiveness, and confidence.' },
];

export const skills: Skill[] = [
  { id: 'acrobatics', name: 'Acrobatics', ability: 'dex', description: 'Balance, tumbling, and staying on your feet in tricky situations.' },
  { id: 'animal-handling', name: 'Animal Handling', ability: 'wis', description: 'Calming, controlling, or reading the intentions of animals.' },
  { id: 'arcana', name: 'Arcana', ability: 'int', description: 'Recalling lore about spells, magic items, eldritch symbols, and planes.' },
  { id: 'athletics', name: 'Athletics', ability: 'str', description: 'Climbing, jumping, swimming, and feats of physical exertion.' },
  { id: 'deception', name: 'Deception', ability: 'cha', description: 'Convincingly hiding the truth through words or actions.' },
  { id: 'history', name: 'History', ability: 'int', description: 'Recalling lore about historical events, legendary people, and ancient kingdoms.' },
  { id: 'insight', name: 'Insight', ability: 'wis', description: 'Determining the true intentions of a creature.' },
  { id: 'intimidation', name: 'Intimidation', ability: 'cha', description: 'Influencing someone through overt threats and hostile action.' },
  { id: 'investigation', name: 'Investigation', ability: 'int', description: 'Looking for clues and making deductions.' },
  { id: 'medicine', name: 'Medicine', ability: 'wis', description: 'Stabilizing the dying and diagnosing illness.' },
  { id: 'nature', name: 'Nature', ability: 'int', description: 'Recalling lore about terrain, plants, animals, and weather.' },
  { id: 'perception', name: 'Perception', ability: 'wis', description: 'Spotting, hearing, or otherwise detecting the presence of something.' },
  { id: 'performance', name: 'Performance', ability: 'cha', description: 'Delighting an audience with music, dance, acting, or storytelling.' },
  { id: 'persuasion', name: 'Persuasion', ability: 'cha', description: 'Influencing someone with tact, social graces, or good nature.' },
  { id: 'religion', name: 'Religion', ability: 'int', description: 'Recalling lore about deities, rites, prayers, and holy symbols.' },
  { id: 'sleight-of-hand', name: 'Sleight of Hand', ability: 'dex', description: 'Manual trickery such as planting or lifting an object unnoticed.' },
  { id: 'stealth', name: 'Stealth', ability: 'dex', description: 'Concealing yourself from enemies and moving unseen.' },
  { id: 'survival', name: 'Survival', ability: 'wis', description: 'Following tracks, hunting, navigating, and predicting the weather.' },
];
