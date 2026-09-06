import type { Condition } from '@/types/ruleset';

export const conditions: Condition[] = [
  { id: 'blinded', name: 'Blinded', description: "Can't see and automatically fails any ability check that requires sight. Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage." },
  { id: 'charmed', name: 'Charmed', description: "Can't attack the charmer or target the charmer with harmful abilities or magical effects. The charmer has advantage on any ability check to interact socially with the creature." },
  { id: 'deafened', name: 'Deafened', description: "Can't hear and automatically fails any ability check that requires hearing." },
  { id: 'exhaustion', name: 'Exhaustion', description: 'Measured in six levels. 1: disadvantage on ability checks. 2: speed halved. 3: disadvantage on attack rolls and saving throws. 4: hit point maximum halved. 5: speed reduced to 0. 6: death. A long rest reduces exhaustion by 1 if the creature has eaten and drunk.' },
  { id: 'frightened', name: 'Frightened', description: "Disadvantage on ability checks and attack rolls while the source of fear is within line of sight. Can't willingly move closer to the source of its fear." },
  { id: 'grappled', name: 'Grappled', description: "Speed becomes 0 and can't benefit from any bonus to speed. Ends if the grappler is incapacitated or the creature is moved out of reach." },
  { id: 'incapacitated', name: 'Incapacitated', description: "Can't take actions or reactions." },
  { id: 'invisible', name: 'Invisible', description: "Impossible to see without the aid of magic or a special sense; heavily obscured for the purpose of hiding. The creature's location can be detected by noise or tracks. Attack rolls against it have disadvantage, and its attack rolls have advantage." },
  { id: 'paralyzed', name: 'Paralyzed', description: "Incapacitated and can't move or speak. Automatically fails Strength and Dexterity saving throws. Attack rolls against it have advantage. Any attack that hits is a critical hit if the attacker is within 5 feet." },
  { id: 'petrified', name: 'Petrified', description: 'Transformed into solid inanimate substance. Weight increases tenfold, ceases aging. Incapacitated, can\'t move or speak, unaware of surroundings. Attacks have advantage, auto-fails STR/DEX saves, resistance to all damage, immune to poison and disease.' },
  { id: 'poisoned', name: 'Poisoned', description: 'Disadvantage on attack rolls and ability checks.' },
  { id: 'prone', name: 'Prone', description: 'Only movement option is to crawl unless it stands up (costs half movement). Disadvantage on attack rolls. Attack rolls against it have advantage if the attacker is within 5 feet, otherwise disadvantage.' },
  { id: 'restrained', name: 'Restrained', description: "Speed becomes 0. Attack rolls against it have advantage, its attack rolls have disadvantage, and it has disadvantage on Dexterity saving throws." },
  { id: 'stunned', name: 'Stunned', description: "Incapacitated, can't move, and can speak only falteringly. Automatically fails Strength and Dexterity saving throws. Attack rolls against it have advantage." },
  { id: 'unconscious', name: 'Unconscious', description: "Incapacitated, can't move or speak, unaware of surroundings. Drops whatever it is holding and falls prone. Auto-fails STR/DEX saves. Attacks against it have advantage; any hit from within 5 feet is a critical hit." },
  { id: 'concentrating', name: 'Concentrating', description: 'Maintaining a concentration spell. Taking damage requires a Constitution saving throw (DC 10 or half the damage, whichever is higher) to maintain it. Casting another concentration spell, being incapacitated, or dying ends it.' },
];
