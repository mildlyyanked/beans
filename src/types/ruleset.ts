/**
 * Ruleset schema.
 *
 * A Ruleset is pure data: the app has no hardcoded knowledge of D&D. Everything
 * the rules engine and the DM prompt need (abilities, classes, spells, monsters,
 * level tables, core mechanics prose) comes from a Ruleset object. The bundled
 * 5e SRD ruleset is just one instance; users can fork it, hand-edit it, or have
 * the LLM generate an entirely new one.
 */

export type AbilityId = string; // e.g. 'str'
export type SkillId = string; // e.g. 'perception'

export interface Ability {
  id: AbilityId;
  name: string; // Strength
  abbr: string; // STR
  description: string;
}

export interface Skill {
  id: SkillId;
  name: string;
  ability: AbilityId;
  description: string;
}

export interface Trait {
  name: string;
  description: string;
  /** Optional level at which a trait unlocks (species traits are usually level 1). */
  level?: number;
}

export interface Species {
  id: string;
  name: string;
  description: string;
  /** Fixed bonuses keyed by ability id. */
  abilityBonuses: Record<AbilityId, number>;
  /** Optional flexible bonus: choose `count` abilities to receive `amount` each. */
  flexibleBonus?: { count: number; amount: number; exclude?: AbilityId[] };
  size: string; // Small | Medium
  speed: number;
  traits: Trait[];
  languages: string[];
  /** Optional sub-options (subraces / lineages). */
  variants?: {
    id: string;
    name: string;
    description: string;
    abilityBonuses?: Record<AbilityId, number>;
    traits?: Trait[];
    speed?: number;
  }[];
}

export type SpellcastingType = 'full' | 'half' | 'third' | 'pact' | 'none';

export interface Spellcasting {
  ability: AbilityId;
  type: SpellcastingType;
  /** Cantrips known indexed by character level (index 0 = level 1). */
  cantripsKnown?: number[];
  /** Spells known indexed by character level, for "known" casters. */
  spellsKnown?: number[];
  /** For "prepared" casters: prepared count = ability modifier + (level * multiplier). */
  prepared?: { levelMultiplier: number; minimum: number };
  /** Level at which spellcasting begins (1 for full casters, 2 for paladin/ranger, 3 for third casters). */
  startsAtLevel?: number;
  /** Which spells (by id) this class may learn. */
  spellList: string[];
  /** Whether the class uses ritual casting */
  ritualCasting?: boolean;
  focus?: string;
}

export interface ClassFeature {
  level: number;
  name: string;
  description: string;
}

export interface Subclass {
  id: string;
  name: string;
  description: string;
  features: ClassFeature[];
  /** Additional spells always known/prepared, keyed by class level. */
  bonusSpells?: Record<number, string[]>;
}

export interface CharClass {
  id: string;
  name: string;
  description: string;
  hitDie: number; // 6, 8, 10, 12
  primaryAbilities: AbilityId[];
  savingThrows: AbilityId[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  skillChoices: { count: number; from: SkillId[] };
  /** Human-readable starting equipment lines; ids in `startingItems` are resolved to equipment. */
  startingEquipment: string[];
  startingItems?: { itemId: string; qty?: number }[];
  startingGold?: number;
  features: ClassFeature[];
  spellcasting?: Spellcasting;
  subclassLevel?: number;
  subclassLabel?: string; // e.g. "Martial Archetype"
  subclasses?: Subclass[];
  /** Which class-level counts as "level" for multiclass/spell slot purposes. Usually class level. */
}

export interface Background {
  id: string;
  name: string;
  description: string;
  skillProficiencies: SkillId[];
  toolProficiencies: string[];
  languages: number;
  equipment: string[];
  startingItems?: { itemId: string; qty?: number }[];
  startingGold?: number;
  feature: { name: string; description: string };
  suggestedCharacteristics?: {
    personalityTraits?: string[];
    ideals?: string[];
    bonds?: string[];
    flaws?: string[];
  };
}

export interface Spell {
  id: string;
  name: string;
  level: number; // 0 = cantrip
  school: string;
  castingTime: string;
  range: string;
  components: string; // "V, S, M (a pinch of salt)"
  duration: string;
  concentration?: boolean;
  ritual?: boolean;
  description: string;
  higherLevels?: string;
  classes: string[]; // class ids
  /** Optional structured damage for the engine/DM, e.g. "1d10" */
  damage?: { dice: string; type: string; scaling?: string };
}

export type ItemCategory =
  | 'weapon'
  | 'armor'
  | 'shield'
  | 'gear'
  | 'tool'
  | 'consumable'
  | 'treasure'
  | 'magic';

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  cost?: { amount: number; unit: string }; // gp, sp, cp
  weight?: number;
  description?: string;
  rarity?: string;
  weapon?: {
    damage: string; // "1d8"
    damageType: string;
    properties: string[]; // finesse, light, two-handed, versatile (1d10), ...
    range?: { normal: number; long: number };
    category: 'simple' | 'martial' | string;
    kind: 'melee' | 'ranged';
    versatileDamage?: string;
  };
  armor?: {
    baseAc: number;
    /** 'none' = no dex bonus, 'full' = full dex, 'max2' = dex max +2 */
    dexBonus: 'none' | 'full' | 'max2';
    stealthDisadvantage?: boolean;
    strengthRequirement?: number;
    category: 'light' | 'medium' | 'heavy' | 'shield' | string;
  };
  shieldBonus?: number;
}

export interface MonsterAction {
  name: string;
  description: string;
  /** Optional structured attack data for the engine. */
  attackBonus?: number;
  damage?: string; // "2d6+3"
  damageType?: string;
  reach?: string;
}

export interface Monster {
  id: string;
  name: string;
  size: string;
  type: string; // beast, humanoid, undead...
  alignment: string;
  ac: number;
  acNote?: string;
  hp: { average: number; formula: string };
  speed: string;
  abilities: Record<AbilityId, number>;
  savingThrows?: Record<AbilityId, number>;
  skills?: Record<string, number>;
  damageVulnerabilities?: string[];
  damageResistances?: string[];
  damageImmunities?: string[];
  conditionImmunities?: string[];
  senses: string;
  languages: string;
  cr: string; // "1/4", "5"
  xp: number;
  traits?: MonsterAction[];
  actions: MonsterAction[];
  reactions?: MonsterAction[];
  legendaryActions?: MonsterAction[];
  description?: string;
  tags?: string[];
}

export interface Condition {
  id: string;
  name: string;
  description: string;
}

export interface RuleSection {
  id: string;
  title: string;
  /** Markdown-ish prose. Fed to the DM on demand and shown in the Rules browser. */
  text: string;
  /** Sections tagged `core` are always included in the DM system prompt (keep them short). */
  core?: boolean;
  tags?: string[];
}

export interface Mechanics {
  /** Expression in `score`, e.g. "floor((score - 10) / 2)". */
  abilityModifierFormula: string;
  /** Proficiency bonus by character level (index 0 = level 1). */
  proficiencyBonusByLevel: number[];
  /** XP required to *reach* each level (index 0 = level 1 = 0 xp). */
  xpThresholds: number[];
  levelCap: number;
  /** Ability score generation options. */
  standardArray: number[];
  pointBuy: { budget: number; min: number; max: number; costs: Record<string, number> };
  rollMethod: string; // "4d6kh3"
  abilityScoreMax: number;
  /** Spell slots by caster type: slots[casterLevel-1][spellLevel-1]. */
  spellSlots: Record<Exclude<SpellcastingType, 'none'>, number[][]>;
  /** Base AC when unarmored. Expression may use `dex` (modifier). */
  unarmoredAcFormula: string;
  /** Hit points at level 1 = hitDie + con; later levels average or roll. */
  hpPerLevel: 'average' | 'roll';
  dcGuidelines: { label: string; dc: number }[];
  /** Difficulty / encounter guidance. */
  xpBudgetPerLevel?: { easy: number; medium: number; hard: number; deadly: number }[];
  /** Named death/dying rule summary etc. live in coreRules. */
  coreRules: RuleSection[];
  deathSaves?: { successesNeeded: number; failuresAllowed: number };
  /** Initiative expression (uses ability ids as modifier variables). */
  initiativeFormula: string; // "1d20 + dex"
}

export interface Ruleset {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  license?: string;
  builtIn?: boolean;
  /** What this system calls things. UI and prompts use these. */
  labels: {
    species: string;
    speciesPlural: string;
    class: string;
    classPlural: string;
    background: string;
    backgroundPlural: string;
    spell: string;
    spellPlural: string;
    monster: string;
    monsterPlural: string;
    gm: string; // "Dungeon Master"
    currency: string; // "gp"
  };
  /** Free-form guidance for the GM on genre, tone, and how the system plays. */
  gmGuidance: string;
  abilities: Ability[];
  skills: Skill[];
  species: Species[];
  classes: CharClass[];
  backgrounds: Background[];
  spells: Spell[];
  equipment: Item[];
  monsters: Monster[];
  conditions: Condition[];
  mechanics: Mechanics;
  createdAt?: number;
  updatedAt?: number;
}

export type RulesetSectionKey =
  | 'abilities'
  | 'skills'
  | 'species'
  | 'classes'
  | 'backgrounds'
  | 'spells'
  | 'equipment'
  | 'monsters'
  | 'conditions';

export const RULESET_SECTIONS: RulesetSectionKey[] = [
  'abilities',
  'skills',
  'species',
  'classes',
  'backgrounds',
  'spells',
  'equipment',
  'monsters',
  'conditions',
];
