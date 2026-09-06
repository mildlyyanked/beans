import type { Ruleset, CharClass, Species, Background } from '@/types/ruleset';
import type { Character, CharacterKind, InventoryItem, Persona } from '@/types/campaign';
import { abilityMod, findClass, findSpecies, findBackground, findItem, hpForLevel, spellSlotsFor, cantripsKnownAt, spellsKnownAt, availableSpells, maxSpellLevel } from './rules';
import { roll } from './dice';
import { uid, titleCase } from '@/util/id';

export interface CharacterDraft {
  name: string;
  pronouns?: string;
  kind: CharacterKind;
  speciesId: string;
  speciesVariantId?: string;
  classId: string;
  subclassId?: string;
  backgroundId: string;
  alignment?: string;
  /** Base scores before species bonuses. */
  baseAbilities: Record<string, number>;
  /** Chosen flexible bonuses (species flexibleBonus). */
  flexibleBonusChoices?: string[];
  skillChoices: string[];
  cantrips?: string[];
  spells?: string[];
  persona: Persona;
  level?: number;
}

export function emptyPersona(): Persona {
  return { personality: '', ideals: '', bonds: '', flaws: '', voice: '', backstory: '', appearance: '' };
}

export function rollAbilityScores(rs: Ruleset): number[] {
  return rs.abilities.map(() => roll(rs.mechanics.rollMethod || '4d6kh3').total);
}

export function pointBuyCost(rs: Ruleset, scores: Record<string, number>): number {
  const costs = rs.mechanics.pointBuy.costs;
  return Object.values(scores).reduce((sum, v) => sum + (costs[String(v)] ?? 0), 0);
}

export function finalAbilities(rs: Ruleset, draft: Pick<CharacterDraft, 'baseAbilities' | 'speciesId' | 'speciesVariantId' | 'flexibleBonusChoices'>): Record<string, number> {
  const sp = findSpecies(rs, draft.speciesId);
  const out: Record<string, number> = {};
  for (const a of rs.abilities) out[a.id] = draft.baseAbilities[a.id] ?? 10;
  if (sp) {
    for (const [k, v] of Object.entries(sp.abilityBonuses ?? {})) out[k] = (out[k] ?? 10) + v;
    const v = sp.variants?.find((x) => x.id === draft.speciesVariantId);
    if (v?.abilityBonuses) for (const [k, n] of Object.entries(v.abilityBonuses)) out[k] = (out[k] ?? 10) + n;
    if (sp.flexibleBonus && draft.flexibleBonusChoices) for (const k of draft.flexibleBonusChoices.slice(0, sp.flexibleBonus.count)) out[k] = (out[k] ?? 10) + sp.flexibleBonus.amount;
  }
  const max = rs.mechanics.abilityScoreMax || 20;
  for (const k of Object.keys(out)) out[k] = Math.min(max, out[k]);
  return out;
}

function resolveItems(rs: Ruleset, entries: { itemId: string; qty?: number }[] | undefined, fallbackLines: string[]): InventoryItem[] {
  const out: InventoryItem[] = [];
  if (entries?.length) {
    for (const e of entries) {
      const it = findItem(rs, e.itemId);
      out.push({
        id: uid('inv'), itemId: it?.id, name: it?.name ?? titleCase(e.itemId), qty: e.qty ?? 1,
        category: it?.category ?? 'gear', weight: it?.weight, description: it?.description,
        equipped: it ? (it.category === 'armor' || it.category === 'shield' || it.category === 'weapon') : false,
      });
    }
  } else {
    for (const line of fallbackLines) out.push({ id: uid('inv'), name: line, qty: 1, category: 'gear' });
  }
  return out;
}

/** Only one body armor and one shield should be equipped; weapons: up to two. */
function normalizeEquipped(rs: Ruleset, inv: InventoryItem[]): InventoryItem[] {
  let armor = 0, shield = 0, weapons = 0;
  return inv.map((i) => {
    const it = i.itemId ? findItem(rs, i.itemId) : undefined;
    if (!it || !i.equipped) return i;
    if (it.shieldBonus) { shield++; return { ...i, equipped: shield <= 1 }; }
    if (it.armor) { armor++; return { ...i, equipped: armor <= 1 }; }
    if (it.weapon) { weapons++; return { ...i, equipped: weapons <= 2 }; }
    return i;
  });
}

export function buildCharacter(rs: Ruleset, draft: CharacterDraft): Character {
  const cls = findClass(rs, draft.classId);
  const sp = findSpecies(rs, draft.speciesId);
  const bg = findBackground(rs, draft.backgroundId);
  const level = Math.max(1, draft.level ?? 1);
  const abilities = finalAbilities(rs, draft);
  const conMod = abilityMod(rs, abilities.con ?? 10);
  const maxHp = hpForLevel(rs, cls, level, conMod);
  const variant = sp?.variants?.find((v) => v.id === draft.speciesVariantId);
  const speed = variant?.speed ?? sp?.speed ?? 30;

  const inventory = normalizeEquipped(rs, [
    ...resolveItems(rs, cls?.startingItems, cls?.startingEquipment ?? []),
    ...resolveItems(rs, bg?.startingItems, bg?.equipment ?? []),
  ]);

  const slots = spellSlotsFor(rs, cls, level);
  const languages = [...(sp?.languages ?? [])];
  const skills = Array.from(new Set([...(bg?.skillProficiencies ?? []), ...draft.skillChoices]));

  const ch: Character = {
    id: uid('ch'),
    kind: draft.kind,
    name: draft.name.trim() || 'Nameless',
    pronouns: draft.pronouns,
    speciesId: draft.speciesId,
    speciesVariantId: draft.speciesVariantId,
    classId: draft.classId,
    subclassId: draft.subclassId,
    backgroundId: draft.backgroundId,
    alignment: draft.alignment,
    level,
    xp: rs.mechanics.xpThresholds[level - 1] ?? 0,
    abilities,
    proficiencies: {
      skills,
      saves: [...(cls?.savingThrows ?? [])],
      armor: [...(cls?.armorProficiencies ?? [])],
      weapons: [...(cls?.weaponProficiencies ?? [])],
      tools: [...(cls?.toolProficiencies ?? []), ...(bg?.toolProficiencies ?? [])],
      languages,
    },
    maxHp,
    hp: maxHp,
    tempHp: 0,
    hitDice: { total: level, used: 0, die: cls?.hitDie ?? 8 },
    speed,
    inventory,
    gold: (cls?.startingGold ?? 0) + (bg?.startingGold ?? 0),
    spells: { cantrips: draft.cantrips ?? [], known: draft.spells ?? [], prepared: draft.spells ?? [], slots },
    conditions: [],
    inspiration: false,
    deathSaves: { successes: 0, failures: 0 },
    persona: draft.persona,
    notes: '',
    extraFeatures: [],
    createdAt: Date.now(),
  };
  return ch;
}

/** Sensible default ability assignment: standard array mapped to class primary abilities. */
export function autoAssignAbilities(rs: Ruleset, cls: CharClass | undefined): Record<string, number> {
  const arr = [...rs.mechanics.standardArray].sort((a, b) => b - a);
  const order: string[] = [];
  for (const p of cls?.primaryAbilities ?? []) if (!order.includes(p)) order.push(p);
  if (!order.includes('con') && rs.abilities.some((a) => a.id === 'con')) order.push('con');
  for (const a of rs.abilities) if (!order.includes(a.id)) order.push(a.id);
  const out: Record<string, number> = {};
  order.forEach((id, i) => { out[id] = arr[i] ?? 10; });
  return out;
}

/** Auto-pick skills / spells for quick-start or companions. */
export function autoChoices(rs: Ruleset, cls: CharClass | undefined, bg: Background | undefined, level = 1, abilities?: Record<string, number>) {
  const skillChoices: string[] = [];
  if (cls) {
    const pool = cls.skillChoices.from.filter((s) => !bg?.skillProficiencies.includes(s));
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    skillChoices.push(...shuffled.slice(0, cls.skillChoices.count));
  }
  let cantrips: string[] = [];
  let spells: string[] = [];
  if (cls?.spellcasting) {
    const slots = spellSlotsFor(rs, cls, level);
    const maxLvl = maxSpellLevel(slots);
    const pool = availableSpells(rs, cls, level, maxLvl);
    const nC = cantripsKnownAt(cls, level);
    const fake = { level, abilities: abilities ?? {}, classId: cls.id } as unknown as Character;
    const nS = spellsKnownAt(rs, fake, cls);
    // Prefer damage/heal cantrips first, then anything.
    const c = pool.filter((s) => s.level === 0).sort((a, b) => (b.damage ? 1 : 0) - (a.damage ? 1 : 0));
    cantrips = c.slice(0, nC).map((s) => s.id);
    const l = pool.filter((s) => s.level > 0 && s.level <= Math.max(1, maxLvl)).sort((a, b) => (b.damage ? 1 : 0) - (a.damage ? 1 : 0) || a.level - b.level);
    spells = l.slice(0, Math.max(0, nS)).map((s) => s.id);
  }
  return { skillChoices, cantrips, spells };
}

export function describeCharacterShort(rs: Ruleset, ch: Character): string {
  const sp = findSpecies(rs, ch.speciesId)?.name ?? ch.speciesId;
  const cls = findClass(rs, ch.classId)?.name ?? ch.classId;
  return `${ch.name}, level ${ch.level} ${sp} ${cls}`;
}

export const ALIGNMENTS = ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'];

export type { CharClass, Species, Background };
