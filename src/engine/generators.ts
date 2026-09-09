import type { Ruleset } from '@/types/ruleset';
import type { Campaign, Persona, World } from '@/types/campaign';
import { chatJson, chat } from '@/llm/openrouter';
import { useSettings } from '@/store/settings';
import { RULESET_SCHEMA_DOC, validateRuleset } from './schema';
import { findClass, findSpecies, findBackground } from './rules';
import { slug } from './rules';

function key(): string {
  const k = useSettings.getState().apiKey;
  if (!k) throw new Error('Add your OpenRouter API key in Settings first.');
  return k;
}
function utilityModel(): string { return useSettings.getState().models.utility; }
function dmModel(): string { return useSettings.getState().models.dm; }

/* ------------------------------------------------------------------ */
/* World                                                               */
/* ------------------------------------------------------------------ */

export interface WorldSeed {
  premise: string;
  setting: string;
  tone: string;
  themes: string[];
  openingHook: string;
  bible: string;
  secrets: string[];
  startingLocation: { name: string; description: string };
  suggestedName: string;
  npcs: { name: string; summary: string; description: string; attitude: string }[];
  factions: { name: string; summary: string }[];
  quests: { name: string; summary: string; objectives: string[] }[];
}

export async function generateWorld(rs: Ruleset, prompt: string, opts: { tone?: string; contentRating?: string; onProgress?: (chars: number) => void } = {}): Promise<WorldSeed> {
  const system = `You are a master worldbuilder and campaign designer for the tabletop RPG system "${rs.name}". ${rs.gmGuidance}

Design a compelling campaign premise from the user's idea. Be specific and concrete — names, places, factions with agendas, a central tension, a hook that starts in motion. Avoid clichés unless twisted. The player is a single hero (with optional companions), so build around personal stakes.

Respond with JSON only:
{
  "suggestedName": "campaign title (2-5 words)",
  "premise": "2-3 sentence pitch the player sees",
  "setting": "1 paragraph: the region/world, its texture and rules",
  "tone": "a few words, e.g. 'grim, hopeful, wry'",
  "themes": ["3-5 short themes"],
  "openingHook": "2-3 sentences: the very first scene, in motion, with a decision looming",
  "bible": "400-700 words of DM-facing world bible: history, geography, power players, secrets, what's really going on, how the story could branch, escalations, and a possible climax",
  "secrets": ["3-6 DM-only secrets/twists the player must discover"],
  "startingLocation": {"name": "...", "description": "one line"},
  "npcs": [{"name": "...", "summary": "one line", "description": "2-3 sentences: appearance, manner, wants, secret", "attitude": "friendly|wary|indifferent|hostile"}] (4-6 NPCs),
  "factions": [{"name": "...", "summary": "one line"}] (2-3),
  "quests": [{"name": "...", "summary": "one line", "objectives": ["..."]}] (1-2 starting quests)
}`;
  const user = `Campaign idea: ${prompt || 'Surprise me with something fresh and evocative.'}${opts.tone ? `\nDesired tone: ${opts.tone}` : ''}${opts.contentRating ? `\nContent rating: ${opts.contentRating}` : ''}`;
  return chatJson<WorldSeed>(key(), { model: dmModel(), messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 1.0, max_tokens: 7000, onProgress: opts.onProgress });
}

/* ------------------------------------------------------------------ */
/* Characters                                                          */
/* ------------------------------------------------------------------ */

export interface PersonaSeed extends Persona { name?: string; pronouns?: string; alignment?: string; portraitPrompt?: string }

export async function generatePersona(rs: Ruleset, opts: { name?: string; speciesId: string; classId: string; backgroundId: string; kind: 'player' | 'companion'; worldPremise?: string; hint?: string; playerName?: string; onProgress?: (chars: number) => void }): Promise<PersonaSeed> {
  const sp = findSpecies(rs, opts.speciesId)?.name ?? opts.speciesId;
  const cls = findClass(rs, opts.classId)?.name ?? opts.classId;
  const bg = findBackground(rs, opts.backgroundId);
  const system = `You write vivid, playable RPG characters for the "${rs.name}" system. Respond with JSON only:
{
  "name": "a fitting name${opts.name ? ' (use the given one)' : ''}",
  "pronouns": "e.g. she/her",
  "alignment": "one of the classic nine alignments",
  "personality": "2 sentences of personality traits",
  "ideals": "1 sentence",
  "bonds": "1 sentence",
  "flaws": "1 sentence — a real, exploitable flaw",
  "voice": "how they talk: cadence, vocabulary, verbal tics, 1-2 sentences",
  "backstory": "120-200 words, concrete, with one hook a DM can pull on",
  "appearance": "2 sentences, visually specific",
  ${opts.kind === 'companion' ? '"relationship": "1-2 sentences: why they travel with the player and how they feel about them",' : ''}
  "portraitPrompt": "one-line visual prompt for an illustrated portrait"
}`;
  const user = `${opts.kind === 'companion' ? 'A companion NPC' : 'The player character'}: ${opts.name ? `named ${opts.name}, ` : ''}a ${sp} ${cls} with the ${bg?.name ?? opts.backgroundId} background.${bg?.suggestedCharacteristics ? ` Background flavor: ${(bg.suggestedCharacteristics.personalityTraits ?? []).slice(0, 2).join(' / ')}` : ''}${opts.worldPremise ? `\nCampaign: ${opts.worldPremise}` : ''}${opts.playerName ? `\nThe player character is ${opts.playerName}.` : ''}${opts.hint ? `\nNotes: ${opts.hint}` : ''}`;
  return chatJson<PersonaSeed>(key(), { model: utilityModel(), messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 1.0, max_tokens: 2000, onProgress: opts.onProgress });
}

export interface CompanionConcept { name: string; speciesId: string; classId: string; backgroundId: string; hint: string }

export async function suggestCompanions(rs: Ruleset, world: Pick<World, 'premise' | 'setting' | 'tone'>, player: { name: string; classId: string; speciesId: string }, count = 2): Promise<CompanionConcept[]> {
  const system = `Suggest ${count} companion party members that complement the player character mechanically and dramatically. Choose only from these ids.
Species ids: ${rs.species.map((s) => s.id).join(', ')}
Class ids: ${rs.classes.map((c) => c.id).join(', ')}
Background ids: ${rs.backgrounds.map((b) => b.id).join(', ')}
Respond with JSON only: {"companions":[{"name":"...","speciesId":"...","classId":"...","backgroundId":"...","hint":"one line concept & why they're with the hero"}]}`;
  const user = `Campaign: ${world.premise}\nSetting: ${world.setting}\nTone: ${world.tone}\nPlayer: ${player.name}, ${player.speciesId} ${player.classId}`;
  const json = await chatJson<{ companions: CompanionConcept[] }>(key(), { model: utilityModel(), messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 1.0, max_tokens: 800 });
  return (json.companions ?? []).filter((c) => findClass(rs, c.classId) && findSpecies(rs, c.speciesId)).map((c) => ({ ...c, backgroundId: findBackground(rs, c.backgroundId) ? c.backgroundId : rs.backgrounds[0]?.id }));
}

/** Regenerate a single persona field, keeping the rest of the character as context. */
export async function generatePersonaField(rs: Ruleset, opts: { field: keyof Persona; draft: { name: string; speciesId: string; classId: string; backgroundId: string; kind: 'player' | 'companion'; persona: Persona; concept?: string }; worldPremise?: string; playerName?: string }): Promise<string> {
  const { field, draft } = opts;
  const sp = findSpecies(rs, draft.speciesId)?.name ?? draft.speciesId;
  const cls = findClass(rs, draft.classId)?.name ?? draft.classId;
  const bg = findBackground(rs, draft.backgroundId)?.name ?? draft.backgroundId;
  const guide: Record<keyof Persona, string> = {
    personality: '2 sentences of personality traits, specific and playable',
    ideals: '1 sentence: what they believe in',
    bonds: '1 sentence: who or what they are tied to',
    flaws: '1 sentence: a real, exploitable flaw',
    voice: '1–2 sentences: cadence, vocabulary, verbal tics — how they talk',
    backstory: '120–200 words, concrete, with one hook a DM can pull on',
    appearance: '2 sentences, visually specific',
    relationship: '1–2 sentences: why they travel with the hero and how they feel about them',
  };
  const others = (Object.keys(draft.persona) as (keyof Persona)[]).filter((k) => k !== field && draft.persona[k]).map((k) => `${k}: ${draft.persona[k]}`).join('\n');
  const system = `You write vivid, playable RPG characters for the "${rs.name}" system. Write ONLY the "${field}" field for the character below, consistent with everything else known about them. Respond with JSON only: {"value": "..."}. Guidance for this field: ${guide[field]}.`;
  const user = `${draft.kind === 'companion' ? 'Companion NPC' : 'Player character'}: ${draft.name || 'unnamed'}, ${sp} ${cls}, ${bg} background.${opts.worldPremise ? `\nCampaign: ${opts.worldPremise}` : ''}${opts.playerName && draft.kind === 'companion' ? `\nThe hero is ${opts.playerName}.` : ''}${draft.concept ? `\nDirection from the player: ${draft.concept}` : ''}${others ? `\n\nKnown so far:\n${others}` : ''}${draft.persona[field] ? `\n\nCurrent ${field} (write a fresh, different take): ${draft.persona[field]}` : ''}`;
  const json = await chatJson<{ value?: string }>(key(), { model: utilityModel(), messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 1.0, max_tokens: 700 });
  return String(json.value ?? '').trim();
}

/* ------------------------------------------------------------------ */
/* Rulesets                                                            */
/* ------------------------------------------------------------------ */

export type RulesetGenProgress = (stage: string, pct: number) => void;

/**
 * Generate a full custom ruleset in stages so each response stays a manageable size.
 * Stages: core (abilities/skills/mechanics/labels/gmGuidance) → species+backgrounds → classes → equipment → spells → monsters.
 */
export async function generateRuleset(prompt: string, onProgress: RulesetGenProgress, opts: { base?: Ruleset } = {}): Promise<Ruleset> {
  const apiKey = key();
  const model = dmModel();
  const sys = `You are a game designer creating a complete, internally consistent tabletop RPG ruleset as JSON for a digital game master. Use kebab-case ids everywhere and reference ids consistently across sections. Every number must be playable (no placeholders). Prose fields are concise and mechanical. Respond with JSON only, no commentary.\n\n${RULESET_SCHEMA_DOC}`;
  const brief = `Design brief: ${prompt}`;
  const call = async <T,>(stage: string, ask: string, maxTokens: number): Promise<T> => {
    onProgress(stage, 0);
    return chatJson<T>(apiKey, { model, messages: [{ role: 'system', content: sys }, { role: 'user', content: `${brief}\n\n${ask}` }], temperature: 0.8, max_tokens: maxTokens, timeoutMs: 600000, onProgress: (chars) => onProgress(`${stage} · ${(chars / 1000).toFixed(1)}k chars`, -1) });
  };

  onProgress('Designing core mechanics', 0.05);
  const core = await call<Partial<Ruleset>>('Designing core mechanics', 'Produce ONLY these top-level fields: id, name, version, description, labels, gmGuidance, abilities (4-8), skills (8-20, each referencing an ability id), conditions (6-15), mechanics (complete, including 6-10 coreRules with `core:true` on the 4-6 essential ones, spellSlots tables sized to levelCap, xpThresholds and proficiencyBonusByLevel of length levelCap).', 6000);
  onProgress('Populating peoples & backgrounds', 0.25);
  const ctx1 = `Context (already designed): abilities ${JSON.stringify((core.abilities ?? []).map((a) => a.id))}, skills ${JSON.stringify((core.skills ?? []).map((s) => s.id))}, levelCap ${core.mechanics?.levelCap ?? 20}.`;
  const peoples = await call<Partial<Ruleset>>('Populating peoples & backgrounds', `${ctx1}\nProduce ONLY: species (5-9, with traits and abilityBonuses using the ability ids) and backgrounds (6-10, with skillProficiencies using skill ids, equipment lines, a feature, and suggestedCharacteristics).`, 6000);
  onProgress('Forging equipment', 0.4);
  const gear = await call<Partial<Ruleset>>('Forging equipment', `${ctx1}\nProduce ONLY: equipment — 25-45 items covering weapons (with structured weapon data), armor (with structured armor data), a shield, ammunition, consumables, adventuring gear, and a few rare/magical or high-tech items appropriate to the setting.`, 6000);
  onProgress('Writing spells & powers', 0.55);
  const itemIds = (gear.equipment ?? []).map((i) => i.id);
  const spellsRes = await call<Partial<Ruleset>>('Writing spells & powers', `${ctx1}\nProduce ONLY: spells — 30-60 spells/powers/techniques (whatever fits the setting) across levels 0-5 at least, each with a "classes" array containing the class ids you intend to define next. Class ids to use: choose 4-8 evocative kebab-case class ids now and use them consistently; list them in an extra top-level field "plannedClassIds".`, 7000);
  onProgress('Designing classes', 0.7);
  const spellIds = (spellsRes.spells ?? []).map((s) => s.id);
  const plannedClasses = ((spellsRes as any).plannedClassIds as string[] | undefined) ?? [];
  const classesRes = await call<Partial<Ruleset>>('Designing classes', `${ctx1}\nItem ids available: ${JSON.stringify(itemIds.slice(0, 60))}\nSpell ids available: ${JSON.stringify(spellIds)}\nClass ids to define: ${JSON.stringify(plannedClasses)} (define exactly these; if empty, define 4-8).\nProduce ONLY: classes — each with hitDie, primaryAbilities, savingThrows (2 ability ids), proficiencies, skillChoices from skill ids, startingEquipment lines + startingItems (item ids), features for every level up to levelCap (at least one per level, concise), optional spellcasting (spellList using only the spell ids above; include cantripsKnown/spellsKnown arrays sized to levelCap where relevant), and one subclass with 3-4 features.`, 8000);
  onProgress('Populating the bestiary', 0.85);
  const monstersRes = await call<Partial<Ruleset>>('Populating the bestiary', `${ctx1}\nProduce ONLY: monsters — 20-35 creatures/foes spanning the difficulty range from trivial to legendary, with full stat blocks (ac, hp average+formula, speed, abilities using ability ids, senses, languages, cr as a string, xp, 1-3 traits, 1-3 actions with attackBonus/damage where applicable), description and tags.`, 8000);
  onProgress('Assembling', 0.95);

  const merged: any = {
    ...(opts.base ? JSON.parse(JSON.stringify(opts.base)) : {}),
    ...core,
    species: peoples.species ?? [],
    backgrounds: peoples.backgrounds ?? [],
    equipment: gear.equipment ?? [],
    spells: spellsRes.spells ?? [],
    classes: classesRes.classes ?? [],
    monsters: monstersRes.monsters ?? [],
    builtIn: false,
    author: 'Generated',
  };
  merged.id = `rs_${slug(merged.name || 'custom')}_${Date.now().toString(36)}`;
  const v = validateRuleset(merged);
  if (!v.ok) throw new Error(`Generated ruleset failed validation: ${v.error}`);
  onProgress('Done', 1);
  return v.ruleset;
}

/** Ask the model to edit an existing ruleset section given natural-language instructions. */
export async function reviseRulesetSection(rs: Ruleset, section: keyof Ruleset, instruction: string): Promise<unknown> {
  const current = JSON.stringify((rs as any)[section]).slice(0, 60000);
  const sys = `You edit one section of a tabletop RPG ruleset JSON. Return ONLY the full revised value for the "${String(section)}" field as JSON (same shape as the input), applying the instruction faithfully and keeping all ids kebab-case and references consistent.\n\n${RULESET_SCHEMA_DOC}`;
  const res = await chat(key(), { model: dmModel(), messages: [{ role: 'system', content: sys }, { role: 'user', content: `Instruction: ${instruction}\n\nCurrent value of ${String(section)}:\n${current}` }], temperature: 0.4, max_tokens: 8000, stream: false });
  const { parseJsonLenient } = await import('@/llm/openrouter');
  return parseJsonLenient(res.content);
}

/** Build a fresh Campaign object from a world seed and characters. */
export function emptyCampaign(): Pick<Campaign, 'entities' | 'chronicle' | 'messages' | 'combat' | 'pendingRoll' | 'images'> {
  return { entities: {}, chronicle: [], messages: [], combat: null, pendingRoll: null, images: {} };
}
