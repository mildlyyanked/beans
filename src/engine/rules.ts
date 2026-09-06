import type { Ruleset, CharClass, Item, Species, Background, Spell, Monster, AbilityId, SkillId } from '@/types/ruleset';
import type { Character, SpellSlots } from '@/types/campaign';
import { evaluate } from './expr';

/* ------------------------------------------------------------------ */
/* Lookups                                                             */
/* ------------------------------------------------------------------ */

export function findClass(rs: Ruleset, id: string): CharClass | undefined { return rs.classes.find((c) => c.id === id); }
export function findSpecies(rs: Ruleset, id: string): Species | undefined { return rs.species.find((s) => s.id === id); }
export function findBackground(rs: Ruleset, id: string): Background | undefined { return rs.backgrounds.find((b) => b.id === id); }
export function findItem(rs: Ruleset, id: string): Item | undefined { return rs.equipment.find((i) => i.id === id); }
export function findSpell(rs: Ruleset, id: string): Spell | undefined { return rs.spells.find((s) => s.id === id); }
export function findMonster(rs: Ruleset, id: string): Monster | undefined { return rs.monsters.find((m) => m.id === id); }

export function slug(s: string): string {
  return s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Fuzzy find across a collection by id, name, or slugged name. */
export function fuzzyFind<T extends { id: string; name: string }>(list: T[], query: string): T | undefined {
  const q = query.trim().toLowerCase();
  const s = slug(query);
  return (
    list.find((x) => x.id === q || x.id === s) ||
    list.find((x) => x.name.toLowerCase() === q) ||
    list.find((x) => x.name.toLowerCase().includes(q) || q.includes(x.name.toLowerCase())) ||
    list.find((x) => slug(x.name).includes(s))
  );
}

/* ------------------------------------------------------------------ */
/* Core math                                                           */
/* ------------------------------------------------------------------ */

export function abilityMod(rs: Ruleset, score: number): number {
  try { return evaluate(rs.mechanics.abilityModifierFormula, { score }); } catch { return Math.floor((score - 10) / 2); }
}

export function proficiencyBonus(rs: Ruleset, level: number): number {
  const t = rs.mechanics.proficiencyBonusByLevel;
  return t[Math.min(Math.max(level, 1), t.length) - 1] ?? 2;
}

export function levelForXp(rs: Ruleset, xp: number): number {
  const t = rs.mechanics.xpThresholds;
  let lvl = 1;
  for (let i = 0; i < t.length; i++) if (xp >= t[i]) lvl = i + 1;
  return Math.min(lvl, rs.mechanics.levelCap);
}

export function xpForNextLevel(rs: Ruleset, level: number): number | null {
  const t = rs.mechanics.xpThresholds;
  return level >= rs.mechanics.levelCap ? null : t[level] ?? null;
}

export function modsOf(rs: Ruleset, ch: Character): Record<AbilityId, number> {
  const out: Record<string, number> = {};
  for (const a of rs.abilities) out[a.id] = abilityMod(rs, ch.abilities[a.id] ?? 10);
  return out;
}

export function skillMod(rs: Ruleset, ch: Character, skillId: SkillId): number {
  const sk = rs.skills.find((s) => s.id === skillId);
  if (!sk) return 0;
  const base = abilityMod(rs, ch.abilities[sk.ability] ?? 10);
  const pb = proficiencyBonus(rs, ch.level);
  if (ch.proficiencies.expertise?.includes(skillId)) return base + pb * 2;
  if (ch.proficiencies.skills.includes(skillId)) return base + pb;
  return base;
}

export function saveMod(rs: Ruleset, ch: Character, abilityId: AbilityId): number {
  const base = abilityMod(rs, ch.abilities[abilityId] ?? 10);
  return ch.proficiencies.saves.includes(abilityId) ? base + proficiencyBonus(rs, ch.level) : base;
}

export function passiveSkill(rs: Ruleset, ch: Character, skillId: SkillId): number {
  return 10 + skillMod(rs, ch, skillId);
}

export function initiativeMod(rs: Ruleset, ch: Character): number {
  const mods = modsOf(rs, ch);
  try {
    // Evaluate the formula with the d20 term stripped, to get the static bonus.
    const f = rs.mechanics.initiativeFormula.replace(/\d*d\d+/gi, '0');
    return evaluate(f, mods);
  } catch { return mods.dex ?? 0; }
}

/** Armor class from equipped armor/shield, else unarmored formula (plus class unarmored-defense heuristics). */
export function armorClass(rs: Ruleset, ch: Character): { ac: number; source: string } {
  const mods = modsOf(rs, ch);
  const dex = mods.dex ?? 0;
  const equipped = ch.inventory.filter((i) => i.equipped && i.itemId);
  let body: Item | undefined;
  let shield = 0;
  for (const inv of equipped) {
    const it = findItem(rs, inv.itemId!);
    if (!it) continue;
    if (it.shieldBonus) shield += it.shieldBonus;
    else if (it.armor && it.armor.category !== 'shield') body = it;
  }
  let ac: number;
  let source: string;
  if (body?.armor) {
    const a = body.armor;
    const dexPart = a.dexBonus === 'none' ? 0 : a.dexBonus === 'max2' ? Math.min(2, dex) : dex;
    ac = a.baseAc + dexPart;
    source = body.name;
  } else {
    ac = evaluate(rs.mechanics.unarmoredAcFormula, mods);
    source = 'Unarmored';
    const cls = findClass(rs, ch.classId);
    // Unarmored Defense heuristics: driven by feature names in the ruleset data.
    const ud = cls?.features.find((f) => f.level <= ch.level && /unarmored defense/i.test(f.name));
    if (ud && shield === 0 || (ud && cls?.id !== 'monk')) {
      if (/constitution/i.test(ud!.description)) { ac = Math.max(ac, 10 + dex + (mods.con ?? 0)); source = 'Unarmored Defense'; }
      else if (/wisdom/i.test(ud!.description)) { ac = Math.max(ac, 10 + dex + (mods.wis ?? 0)); source = 'Unarmored Defense'; }
    }
  }
  // Magic +AC items (e.g. ring of protection) — parse "+N" from equipped magic items' names/descriptions
  for (const inv of equipped) {
    const it = findItem(rs, inv.itemId!);
    if (it?.category === 'magic' && /(\+1|\+2|\+3) (bonus )?to (ac|armor class)/i.test(it.description ?? '')) {
      const m = it.description!.match(/\+(\d)/); if (m) ac += parseInt(m[1], 10);
    }
  }
  return { ac: ac + shield, source: shield ? `${source} + shield` : source };
}

/* ------------------------------------------------------------------ */
/* Spellcasting                                                        */
/* ------------------------------------------------------------------ */

export function spellSlotsFor(rs: Ruleset, cls: CharClass | undefined, level: number): SpellSlots {
  const slots: SpellSlots = {};
  if (!cls?.spellcasting || cls.spellcasting.type === 'none') return slots;
  const table = rs.mechanics.spellSlots[cls.spellcasting.type];
  const row = table?.[Math.min(level, table.length) - 1] ?? [];
  row.forEach((n, i) => { if (n > 0) slots[i + 1] = { max: n, used: 0 }; });
  return slots;
}

export function spellSaveDc(rs: Ruleset, ch: Character): number | null {
  const cls = findClass(rs, ch.classId);
  if (!cls?.spellcasting) return null;
  return 8 + proficiencyBonus(rs, ch.level) + abilityMod(rs, ch.abilities[cls.spellcasting.ability] ?? 10);
}

export function spellAttackBonus(rs: Ruleset, ch: Character): number | null {
  const cls = findClass(rs, ch.classId);
  if (!cls?.spellcasting) return null;
  return proficiencyBonus(rs, ch.level) + abilityMod(rs, ch.abilities[cls.spellcasting.ability] ?? 10);
}

export function cantripsKnownAt(cls: CharClass, level: number): number {
  const arr = cls.spellcasting?.cantripsKnown;
  if (!arr) return 0;
  return arr[Math.min(level, arr.length) - 1] ?? 0;
}

export function spellsKnownAt(rs: Ruleset, ch: Character, cls: CharClass): number {
  const sc = cls.spellcasting;
  if (!sc) return 0;
  if (sc.spellsKnown) return sc.spellsKnown[Math.min(ch.level, sc.spellsKnown.length) - 1] ?? 0;
  if (sc.prepared) {
    const mod = abilityMod(rs, ch.abilities[sc.ability] ?? 10);
    return Math.max(sc.prepared.minimum, Math.floor(ch.level * sc.prepared.levelMultiplier) + mod);
  }
  return 0;
}

export function maxSpellLevel(slots: SpellSlots): number {
  return Math.max(0, ...Object.keys(slots).map(Number));
}

export function availableSpells(rs: Ruleset, cls: CharClass, level: number, maxLevel: number): Spell[] {
  const list = cls.spellcasting?.spellList ?? [];
  return rs.spells.filter((s) => list.includes(s.id) && (s.level === 0 ? level >= (cls.spellcasting?.startsAtLevel ?? 1) : s.level <= maxLevel));
}

/* ------------------------------------------------------------------ */
/* Hit points & leveling                                               */
/* ------------------------------------------------------------------ */

export function hpForLevel(rs: Ruleset, cls: CharClass | undefined, level: number, conMod: number): number {
  const die = cls?.hitDie ?? 8;
  const first = die + conMod;
  const perLevel = (rs.mechanics.hpPerLevel === 'average' ? Math.floor(die / 2) + 1 : Math.floor(die / 2) + 1) + conMod;
  return Math.max(1, first + Math.max(0, level - 1) * Math.max(1, perLevel));
}

export interface LevelUpResult {
  character: Character;
  newFeatures: { name: string; description: string }[];
  hpGained: number;
  asiPending: boolean;
  newSpellsAllowed: boolean;
}

export function applyLevelUp(rs: Ruleset, ch: Character): LevelUpResult {
  const cls = findClass(rs, ch.classId);
  const oldLevel = ch.level;
  const newLevel = Math.min(rs.mechanics.levelCap, oldLevel + 1);
  if (newLevel === oldLevel) return { character: ch, newFeatures: [], hpGained: 0, asiPending: false, newSpellsAllowed: false };
  const conMod = abilityMod(rs, ch.abilities.con ?? 10);
  const die = cls?.hitDie ?? 8;
  const hpGained = Math.max(1, Math.floor(die / 2) + 1 + conMod);
  const newFeatures = (cls?.features ?? []).filter((f) => f.level === newLevel).map((f) => ({ name: f.name, description: f.description }));
  const sub = cls?.subclasses?.find((s) => s.id === ch.subclassId);
  if (sub) newFeatures.push(...sub.features.filter((f) => f.level === newLevel).map((f) => ({ name: f.name, description: f.description })));
  const slots = spellSlotsFor(rs, cls, newLevel);
  // preserve used counts
  for (const k of Object.keys(slots)) { const used = ch.spells.slots[+k]?.used ?? 0; slots[+k].used = Math.min(used, slots[+k].max); }
  const character: Character = {
    ...ch,
    level: newLevel,
    maxHp: ch.maxHp + hpGained,
    hp: ch.hp + hpGained,
    hitDice: { ...ch.hitDice, total: newLevel },
    spells: { ...ch.spells, slots },
  };
  const asiPending = newFeatures.some((f) => /ability score improvement/i.test(f.name));
  return { character, newFeatures, hpGained, asiPending, newSpellsAllowed: !!cls?.spellcasting };
}

/* ------------------------------------------------------------------ */
/* Feature aggregation (for sheet & prompts)                           */
/* ------------------------------------------------------------------ */

export function allFeatures(rs: Ruleset, ch: Character): { name: string; description: string; source: string }[] {
  const out: { name: string; description: string; source: string }[] = [];
  const sp = findSpecies(rs, ch.speciesId);
  if (sp) {
    for (const t of sp.traits) if (!t.level || t.level <= ch.level) out.push({ ...t, source: sp.name });
    const v = sp.variants?.find((x) => x.id === ch.speciesVariantId);
    if (v?.traits) for (const t of v.traits) out.push({ ...t, source: v.name });
  }
  const cls = findClass(rs, ch.classId);
  if (cls) {
    for (const f of cls.features) if (f.level <= ch.level && !/ability score improvement/i.test(f.name)) out.push({ name: f.name, description: f.description, source: `${cls.name} ${f.level}` });
    const sub = cls.subclasses?.find((s) => s.id === ch.subclassId);
    if (sub) for (const f of sub.features) if (f.level <= ch.level) out.push({ name: f.name, description: f.description, source: sub.name });
  }
  const bg = findBackground(rs, ch.backgroundId);
  if (bg) out.push({ ...bg.feature, source: bg.name });
  out.push(...ch.extraFeatures.map((f) => ({ ...f, source: 'Acquired' })));
  return out;
}

/** Weapon attack summary for a character's equipped weapons. */
export function weaponAttacks(rs: Ruleset, ch: Character): { name: string; attackBonus: number; damage: string; damageType: string; range?: string }[] {
  const mods = modsOf(rs, ch);
  const pb = proficiencyBonus(rs, ch.level);
  const out: { name: string; attackBonus: number; damage: string; damageType: string; range?: string }[] = [];
  for (const inv of ch.inventory) {
    if (!inv.itemId) continue;
    const it = findItem(rs, inv.itemId);
    if (!it?.weapon) continue;
    const w = it.weapon;
    const finesse = w.properties.some((p) => /finesse/i.test(p));
    const useDex = w.kind === 'ranged' || (finesse && (mods.dex ?? 0) > (mods.str ?? 0));
    const abil = useDex ? mods.dex ?? 0 : mods.str ?? 0;
    const prof = ch.proficiencies.weapons.some((p) => new RegExp(p.replace(/s$/, ''), 'i').test(w.category) || new RegExp(p, 'i').test(it.name) || /all/i.test(p)) ? pb : 0;
    out.push({
      name: it.name + (inv.equipped ? '' : ' (stowed)'),
      attackBonus: abil + prof,
      damage: `${w.damage}${abil ? (abil > 0 ? '+' : '') + abil : ''}`,
      damageType: w.damageType,
      range: w.range ? `${w.range.normal}/${w.range.long} ft` : undefined,
    });
  }
  return out;
}

export function monsterAbilityMod(rs: Ruleset, m: Monster, ability: AbilityId): number {
  return abilityMod(rs, m.abilities[ability] ?? 10);
}

export function crToNumber(cr: string): number {
  if (cr.includes('/')) { const [a, b] = cr.split('/').map(Number); return a / b; }
  return Number(cr) || 0;
}
