import { z } from 'zod';
import type { Ruleset } from '@/types/ruleset';

/**
 * Lenient zod schema for rulesets. Used to validate imported JSON and LLM output.
 * Most fields have defaults so a partially-specified ruleset still loads.
 */

const str = z.string().catch('');
const num = z.coerce.number().catch(0);
const strArr = z.array(z.string()).catch([]);
const numRecord = z.record(z.string(), z.coerce.number()).catch({});

const trait = z.object({ name: str, description: str, level: z.number().optional() }).passthrough();

const abilitySchema = z.object({ id: z.string(), name: str, abbr: str, description: str }).passthrough();
const skillSchema = z.object({ id: z.string(), name: str, ability: z.string(), description: str }).passthrough();

const speciesSchema = z.object({
  id: z.string(), name: str, description: str,
  abilityBonuses: numRecord,
  flexibleBonus: z.object({ count: num, amount: num, exclude: strArr.optional() }).optional(),
  size: str.default('Medium'), speed: num.default(30), traits: z.array(trait).catch([]), languages: strArr,
  variants: z.array(z.object({ id: z.string(), name: str, description: str, abilityBonuses: numRecord.optional(), traits: z.array(trait).optional(), speed: z.number().optional() }).passthrough()).optional(),
}).passthrough();

const featureSchema = z.object({ level: num.default(1), name: str, description: str }).passthrough();

const spellcastingSchema = z.object({
  ability: z.string(), type: z.enum(['full', 'half', 'third', 'pact', 'none']).catch('full'),
  cantripsKnown: z.array(z.number()).optional(), spellsKnown: z.array(z.number()).optional(),
  prepared: z.object({ levelMultiplier: num, minimum: num }).optional(),
  startsAtLevel: z.number().optional(), spellList: strArr, ritualCasting: z.boolean().optional(), focus: z.string().optional(),
}).passthrough();

const subclassSchema = z.object({ id: z.string(), name: str, description: str, features: z.array(featureSchema).catch([]), bonusSpells: z.record(z.string(), z.array(z.string())).optional() }).passthrough();

const classSchema = z.object({
  id: z.string(), name: str, description: str, hitDie: num.default(8),
  primaryAbilities: strArr, savingThrows: strArr, armorProficiencies: strArr, weaponProficiencies: strArr, toolProficiencies: strArr,
  skillChoices: z.object({ count: num.default(2), from: strArr }).catch({ count: 2, from: [] }),
  startingEquipment: strArr, startingItems: z.array(z.object({ itemId: z.string(), qty: z.number().optional() })).optional(), startingGold: z.number().optional(),
  features: z.array(featureSchema).catch([]), spellcasting: spellcastingSchema.optional(),
  subclassLevel: z.number().optional(), subclassLabel: z.string().optional(), subclasses: z.array(subclassSchema).optional(),
}).passthrough();

const backgroundSchema = z.object({
  id: z.string(), name: str, description: str, skillProficiencies: strArr, toolProficiencies: strArr, languages: num,
  equipment: strArr, startingItems: z.array(z.object({ itemId: z.string(), qty: z.number().optional() })).optional(), startingGold: z.number().optional(),
  feature: z.object({ name: str, description: str }).catch({ name: '', description: '' }),
  suggestedCharacteristics: z.object({ personalityTraits: strArr.optional(), ideals: strArr.optional(), bonds: strArr.optional(), flaws: strArr.optional() }).optional(),
}).passthrough();

const spellSchema = z.object({
  id: z.string(), name: str, level: num, school: str, castingTime: str, range: str, components: str, duration: str,
  concentration: z.boolean().optional(), ritual: z.boolean().optional(), description: str, higherLevels: z.string().optional(), classes: strArr,
  damage: z.object({ dice: str, type: str, scaling: z.string().optional() }).optional(),
}).passthrough();

const itemSchema = z.object({
  id: z.string(), name: str, category: z.string().catch('gear'),
  cost: z.object({ amount: num, unit: str.default('gp') }).optional(), weight: z.number().optional(), description: z.string().optional(), rarity: z.string().optional(),
  weapon: z.object({ damage: str, damageType: str, properties: strArr, range: z.object({ normal: num, long: num }).optional(), category: str, kind: z.string().catch('melee'), versatileDamage: z.string().optional() }).optional(),
  armor: z.object({ baseAc: num, dexBonus: z.enum(['none', 'full', 'max2']).catch('full'), stealthDisadvantage: z.boolean().optional(), strengthRequirement: z.number().optional(), category: str }).optional(),
  shieldBonus: z.number().optional(),
}).passthrough();

const actionSchema = z.object({ name: str, description: str, attackBonus: z.number().optional(), damage: z.string().optional(), damageType: z.string().optional(), reach: z.string().optional() }).passthrough();

const monsterSchema = z.object({
  id: z.string(), name: str, size: str, type: str, alignment: str, ac: num.default(10), acNote: z.string().optional(),
  hp: z.object({ average: num, formula: str }).catch({ average: 10, formula: '2d8+1' }), speed: str.default('30 ft.'),
  abilities: numRecord, savingThrows: numRecord.optional(), skills: numRecord.optional(),
  damageVulnerabilities: strArr.optional(), damageResistances: strArr.optional(), damageImmunities: strArr.optional(), conditionImmunities: strArr.optional(),
  senses: str, languages: str, cr: z.union([z.string(), z.number()]).transform(String).catch('0'), xp: num,
  traits: z.array(actionSchema).optional(), actions: z.array(actionSchema).catch([]), reactions: z.array(actionSchema).optional(), legendaryActions: z.array(actionSchema).optional(),
  description: z.string().optional(), tags: strArr.optional(),
}).passthrough();

const conditionSchema = z.object({ id: z.string(), name: str, description: str }).passthrough();
const ruleSectionSchema = z.object({ id: z.string(), title: str, text: str, core: z.boolean().optional(), tags: strArr.optional() }).passthrough();

const mechanicsSchema = z.object({
  abilityModifierFormula: str.default('floor((score - 10) / 2)'),
  proficiencyBonusByLevel: z.array(z.number()).catch([2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6]),
  xpThresholds: z.array(z.number()).catch([0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000]),
  levelCap: num.default(20),
  standardArray: z.array(z.number()).catch([15, 14, 13, 12, 10, 8]),
  pointBuy: z.object({ budget: num, min: num, max: num, costs: numRecord }).catch({ budget: 27, min: 8, max: 15, costs: { '8': 0, '9': 1, '10': 2, '11': 3, '12': 4, '13': 5, '14': 7, '15': 9 } }),
  rollMethod: str.default('4d6kh3'),
  abilityScoreMax: num.default(20),
  spellSlots: z.object({ full: z.array(z.array(z.number())), half: z.array(z.array(z.number())), third: z.array(z.array(z.number())), pact: z.array(z.array(z.number())) }).catch({ full: [], half: [], third: [], pact: [] }),
  unarmoredAcFormula: str.default('10 + dex'),
  hpPerLevel: z.enum(['average', 'roll']).catch('average'),
  dcGuidelines: z.array(z.object({ label: str, dc: num })).catch([]),
  xpBudgetPerLevel: z.array(z.object({ easy: num, medium: num, hard: num, deadly: num })).optional(),
  coreRules: z.array(ruleSectionSchema).catch([]),
  deathSaves: z.object({ successesNeeded: num, failuresAllowed: num }).optional(),
  initiativeFormula: str.default('1d20 + dex'),
}).passthrough();

export const rulesetSchema = z.object({
  id: z.string(), name: str, version: str.default('1.0'), description: str, author: z.string().optional(), license: z.string().optional(), builtIn: z.boolean().optional(),
  labels: z.object({
    species: str.default('Species'), speciesPlural: str.default('Species'), class: str.default('Class'), classPlural: str.default('Classes'),
    background: str.default('Background'), backgroundPlural: str.default('Backgrounds'), spell: str.default('Spell'), spellPlural: str.default('Spells'),
    monster: str.default('Creature'), monsterPlural: str.default('Creatures'), gm: str.default('Game Master'), currency: str.default('gp'),
  }).catch({ species: 'Species', speciesPlural: 'Species', class: 'Class', classPlural: 'Classes', background: 'Background', backgroundPlural: 'Backgrounds', spell: 'Spell', spellPlural: 'Spells', monster: 'Creature', monsterPlural: 'Creatures', gm: 'Game Master', currency: 'gp' }),
  gmGuidance: str,
  abilities: z.array(abilitySchema).catch([]),
  skills: z.array(skillSchema).catch([]),
  species: z.array(speciesSchema).catch([]),
  classes: z.array(classSchema).catch([]),
  backgrounds: z.array(backgroundSchema).catch([]),
  spells: z.array(spellSchema).catch([]),
  equipment: z.array(itemSchema).catch([]),
  monsters: z.array(monsterSchema).catch([]),
  conditions: z.array(conditionSchema).catch([]),
  mechanics: mechanicsSchema.catch({} as any),
  createdAt: z.number().optional(), updatedAt: z.number().optional(),
}).passthrough();

export function validateRuleset(input: unknown): { ok: true; ruleset: Ruleset; warnings: string[] } | { ok: false; error: string } {
  const res = rulesetSchema.safeParse(input);
  if (!res.success) return { ok: false, error: res.error.issues.slice(0, 5).map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') };
  const rs = res.data as unknown as Ruleset;
  const warnings: string[] = [];
  if (!rs.abilities.length) warnings.push('No abilities defined');
  if (!rs.classes.length) warnings.push('No classes defined');
  if (!rs.species.length) warnings.push('No species defined');
  const abilityIds = new Set(rs.abilities.map((a) => a.id));
  for (const s of rs.skills) if (!abilityIds.has(s.ability)) warnings.push(`Skill ${s.name} references unknown ability ${s.ability}`);
  const spellIds = new Set(rs.spells.map((s) => s.id));
  for (const c of rs.classes) {
    const missing = (c.spellcasting?.spellList ?? []).filter((id) => !spellIds.has(id));
    if (missing.length) warnings.push(`${c.name}: ${missing.length} spells in list not found (${missing.slice(0, 3).join(', ')}…)`);
  }
  return { ok: true, ruleset: rs, warnings };
}

/** Compact text description of the schema for LLM generation prompts. */
export const RULESET_SCHEMA_DOC = `
Ruleset JSON shape (all ids kebab-case, all arrays may be empty):
{
  "id": string, "name": string, "version": string, "description": string,
  "labels": { "species","speciesPlural","class","classPlural","background","backgroundPlural","spell","spellPlural","monster","monsterPlural","gm","currency" : string },
  "gmGuidance": string (tone, genre, how the system plays, 100-300 words),
  "abilities": [{ "id","name","abbr","description" }],
  "skills": [{ "id","name","ability": abilityId,"description" }],
  "species": [{ "id","name","description","abilityBonuses": {abilityId: number}, "flexibleBonus"?: {"count","amount"}, "size","speed": number, "traits": [{"name","description"}], "languages": [string], "variants"?: [{ "id","name","description","abilityBonuses"?,"traits"? }] }],
  "classes": [{ "id","name","description","hitDie": number, "primaryAbilities": [abilityId], "savingThrows": [abilityId], "armorProficiencies": [string], "weaponProficiencies": [string], "toolProficiencies": [string], "skillChoices": {"count": number,"from": [skillId]}, "startingEquipment": [string], "startingItems"?: [{"itemId","qty"}], "features": [{"level","name","description"}], "spellcasting"?: { "ability": abilityId, "type": "full"|"half"|"third"|"pact"|"none", "cantripsKnown"?: number[20], "spellsKnown"?: number[20], "prepared"?: {"levelMultiplier","minimum"}, "startsAtLevel"?: number, "spellList": [spellId], "ritualCasting"?: bool }, "subclassLevel"?: number, "subclassLabel"?: string, "subclasses"?: [{ "id","name","description","features": [{"level","name","description"}] }] }],
  "backgrounds": [{ "id","name","description","skillProficiencies": [skillId], "toolProficiencies": [string], "languages": number, "equipment": [string], "startingGold"?: number, "feature": {"name","description"}, "suggestedCharacteristics"?: {"personalityTraits": [string],"ideals": [string],"bonds": [string],"flaws": [string]} }],
  "spells": [{ "id","name","level": number (0=cantrip), "school","castingTime","range","components","duration","concentration"?: bool,"ritual"?: bool,"description","higherLevels"?,"classes": [classId], "damage"?: {"dice","type","scaling"?} }],
  "equipment": [{ "id","name","category": "weapon"|"armor"|"shield"|"gear"|"tool"|"consumable"|"treasure"|"magic", "cost"?: {"amount","unit"}, "weight"?: number, "description"?, "weapon"?: {"damage","damageType","properties": [string],"range"?: {"normal","long"},"category","kind": "melee"|"ranged"}, "armor"?: {"baseAc","dexBonus": "none"|"full"|"max2","stealthDisadvantage"?,"strengthRequirement"?,"category": "light"|"medium"|"heavy"}, "shieldBonus"?: number }],
  "monsters": [{ "id","name","size","type","alignment","ac": number,"hp": {"average","formula"},"speed","abilities": {abilityId: number},"savingThrows"?,"skills"?,"damageResistances"?,"damageImmunities"?,"conditionImmunities"?,"senses","languages","cr": string,"xp": number,"traits"?: [{"name","description"}],"actions": [{"name","description","attackBonus"?,"damage"?,"damageType"?}],"legendaryActions"?,"description"?,"tags"? }],
  "conditions": [{ "id","name","description" }],
  "mechanics": { "abilityModifierFormula": expression in score (e.g. "floor((score - 10) / 2)"), "proficiencyBonusByLevel": number[levelCap], "xpThresholds": number[levelCap], "levelCap": number, "standardArray": number[], "pointBuy": {"budget","min","max","costs": {"score": cost}}, "rollMethod": dice string, "abilityScoreMax": number, "spellSlots": {"full": number[][], "half": number[][], "third": number[][], "pact": number[][]} (slots[casterLevel-1][spellLevel-1]), "unarmoredAcFormula": expression using ability ids as modifier variables (e.g. "10 + dex"), "hpPerLevel": "average"|"roll", "dcGuidelines": [{"label","dc"}], "coreRules": [{"id","title","text","core": bool (true = always sent to the GM; keep those under 120 words each)}], "deathSaves"?: {"successesNeeded","failuresAllowed"}, "initiativeFormula": e.g. "1d20 + dex" }
}`;
