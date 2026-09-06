import type { Ruleset } from '@/types/ruleset';
import type { Campaign, Character, Message } from '@/types/campaign';
import type { LlmMessage } from '@/llm/openrouter';
import { abilityMod, armorClass, findClass, findSpecies, findBackground, findSpell, proficiencyBonus, skillMod, saveMod, spellSaveDc, weaponAttacks, xpForNextLevel, allFeatures } from './rules';
import { rankEntities, entityCard, unsummarizedMessages } from './memory';
import { fmtMod } from './dice';
import { truncate } from '@/util/id';

/* ------------------------------------------------------------------ */
/* Character sheet → prompt text                                       */
/* ------------------------------------------------------------------ */

export function characterBlock(rs: Ruleset, ch: Character, opts: { detailed?: boolean } = {}): string {
  const sp = findSpecies(rs, ch.speciesId);
  const cls = findClass(rs, ch.classId);
  const bg = findBackground(rs, ch.backgroundId);
  const { ac, source } = armorClass(rs, ch);
  const pb = proficiencyBonus(rs, ch.level);
  const lines: string[] = [];
  const role = ch.kind === 'player' ? 'PLAYER CHARACTER (controlled by the human — never decide their actions or words)' : 'COMPANION (AI-voiced party member; the DM may narrate their actions in combat and reactions in scenes)';
  lines.push(`### ${ch.name} — ${role}`);
  lines.push(`${sp?.name ?? ch.speciesId}${ch.speciesVariantId ? ` (${ch.speciesVariantId})` : ''} ${cls?.name ?? ch.classId}${ch.subclassId ? ` / ${cls?.subclasses?.find((s) => s.id === ch.subclassId)?.name ?? ch.subclassId}` : ''}, level ${ch.level}, ${bg?.name ?? ch.backgroundId}${ch.alignment ? `, ${ch.alignment}` : ''}${ch.pronouns ? `, pronouns ${ch.pronouns}` : ''}`);
  lines.push(`HP ${ch.hp}/${ch.maxHp}${ch.tempHp ? ` (+${ch.tempHp} temp)` : ''} · AC ${ac} (${source}) · Speed ${ch.speed} · Prof ${fmtMod(pb)} · XP ${ch.xp}${xpForNextLevel(rs, ch.level) !== null ? `/${xpForNextLevel(rs, ch.level)}` : ''}${ch.inspiration ? ' · INSPIRATION' : ''}`);
  lines.push('Abilities: ' + rs.abilities.map((a) => `${a.abbr} ${ch.abilities[a.id] ?? 10} (${fmtMod(abilityMod(rs, ch.abilities[a.id] ?? 10))})`).join(', '));
  lines.push('Saves: ' + rs.abilities.map((a) => `${a.abbr} ${fmtMod(saveMod(rs, ch, a.id))}${ch.proficiencies.saves.includes(a.id) ? '*' : ''}`).join(', '));
  const profSkills = rs.skills.filter((s) => ch.proficiencies.skills.includes(s.id) || ch.proficiencies.expertise?.includes(s.id));
  lines.push('Skills (proficient): ' + (profSkills.map((s) => `${s.name} ${fmtMod(skillMod(rs, ch, s.id))}`).join(', ') || 'none') + ` · Passive Perception ${10 + skillMod(rs, ch, 'perception')}`);
  const atks = weaponAttacks(rs, ch).filter((a) => !a.name.includes('(stowed)'));
  if (atks.length) lines.push('Attacks: ' + atks.map((a) => `${a.name} ${fmtMod(a.attackBonus)} to hit, ${a.damage} ${a.damageType}${a.range ? ` (${a.range})` : ''}`).join('; '));
  if (ch.conditions.length) lines.push('CONDITIONS: ' + ch.conditions.join(', '));
  if (ch.hp <= 0) lines.push(`DYING — death saves ${ch.deathSaves.successes}S/${ch.deathSaves.failures}F`);
  const inv = ch.inventory.map((i) => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ''}${i.equipped ? ' (equipped)' : ''}`);
  lines.push(`Inventory: ${truncate(inv.join(', '), opts.detailed ? 1200 : 420) || 'nothing'} · ${ch.gold} ${rs.labels.currency}`);
  if (cls?.spellcasting) {
    const dc = spellSaveDc(rs, ch);
    const slots = Object.entries(ch.spells.slots).map(([l, s]) => `L${l}: ${s.max - s.used}/${s.max}`).join(', ');
    const names = (ids: string[]) => ids.map((id) => findSpell(rs, id)?.name ?? id).join(', ');
    lines.push(`Spellcasting (DC ${dc}): cantrips — ${names(ch.spells.cantrips) || 'none'}; prepared/known — ${names(ch.spells.prepared.length ? ch.spells.prepared : ch.spells.known) || 'none'}; slots — ${slots || 'none'}`);
  }
  const feats = allFeatures(rs, ch);
  lines.push('Features: ' + (opts.detailed ? feats.map((f) => `${f.name}: ${truncate(f.description, 200)}`).join(' | ') : feats.map((f) => f.name).join(', ')));
  const p = ch.persona;
  const personaBits = [p.personality && `Personality: ${p.personality}`, p.ideals && `Ideals: ${p.ideals}`, p.bonds && `Bonds: ${p.bonds}`, p.flaws && `Flaws: ${p.flaws}`, p.appearance && `Appearance: ${p.appearance}`].filter(Boolean);
  if (personaBits.length) lines.push(truncate(personaBits.join(' · '), opts.detailed ? 1500 : 500));
  if (ch.kind === 'companion') {
    if (p.voice) lines.push(`Voice: ${p.voice}`);
    if (p.relationship) lines.push(`Relationship to the party: ${p.relationship}`);
  }
  if (p.backstory && opts.detailed) lines.push(`Backstory: ${truncate(p.backstory, 1200)}`);
  else if (p.backstory) lines.push(`Backstory: ${truncate(p.backstory, 260)}`);
  return lines.join('\n');
}

/* ------------------------------------------------------------------ */
/* System prompt                                                       */
/* ------------------------------------------------------------------ */

const LENGTH_GUIDE: Record<Campaign['settings']['narrationLength'], string> = {
  brief: '1–2 tight paragraphs (60–140 words). Punchy. Get to the choice fast.',
  standard: '2–4 paragraphs (140–300 words). Vivid but efficient.',
  cinematic: '3–6 paragraphs (250–500 words). Lush, sensory, literary — but always end with agency for the player.',
};

export function stableSystemPrompt(rs: Ruleset, c: Campaign): string {
  const core = rs.mechanics.coreRules.filter((r) => r.core);
  const dcs = rs.mechanics.dcGuidelines.map((d) => `${d.label} ${d.dc}`).join(', ');
  const rating = { pg: 'family-friendly (PG): violence is stylized, no gore, no sexual content', pg13: 'PG-13: peril, blood, moral darkness and mature themes are fine; no explicit sexual content or gratuitous gore', r: 'mature (R): graphic violence, horror, and adult themes are permitted; keep it purposeful, never gratuitous' }[c.world.contentRating];
  const secrets = c.world.secrets.length ? `\n\nDM-ONLY SECRETS (never reveal directly; let the player discover them through play):\n${c.world.secrets.map((s) => `- ${s}`).join('\n')}` : '';

  return `You are the ${rs.labels.gm} for a solo tabletop roleplaying campaign using the "${rs.name}" ruleset. You run the world, voice every non-player character, adjudicate rules fairly, and keep the story consistent. The human controls exactly one character — the player character (PC). AI-voiced companions travel with the PC; they have their own voices (handled separately), but you may narrate their actions in combat and brief reactions in scenes.

## Your craft
- Narrate in second person, present tense, addressing the player as "you". ${LENGTH_GUIDE[c.settings.narrationLength]}
- Show, don't tell: concrete sensory detail, specific verbs, distinct NPC voices. Give NPCs wants, fears, and things to hide. Vary rhythm: quiet moments, dread, humor, spectacle.
- NEVER narrate the PC's decisions, dialogue, feelings, or actions beyond what the player stated. Stop at the moment of choice. End nearly every response with the situation open — a question, a beat of tension, or a clear set of options — so the player acts next.
- Honor player agency and the fiction: if an action is impossible, say why in-world; if it is risky, telegraph the risk before the roll.
- Consequences are real. Failure moves the story sideways, not to a dead end. Success is earned, not given.
- Keep the world consistent: respect every established fact (canon), entity card, and chronicle entry. If the player misremembers, gently correct through the fiction. Never contradict a stated fact; if you must retcon, do it explicitly and register the new fact.
- Content rating: ${rating}.
- Formatting: Markdown. Use **bold** for a named NPC or location the first time it appears in a scene, *italics* for emphasis or unspoken thoughts, and quotation marks for dialogue. Use a > blockquote for read-aloud text like signs, letters, or inscriptions. No headings. No out-of-character commentary unless the player asks (messages starting with "//" or "(OOC)" are out-of-character; answer them plainly, then resume).

## Dice & rules — the app is the referee
- You NEVER invent die results. To resolve anything uncertain, call \`roll_check\` (for characters) or \`roll_dice\`. The app rolls real dice and returns the result; then narrate the outcome.
- Call for a roll only when the outcome is uncertain AND failure is interesting. Routine actions just succeed. Choose the DC from the guideline scale: ${dcs}.
- All mechanical state (HP, conditions, items, gold, XP, spell slots, combat, time, scene, entities, facts) lives in the app. Change it ONLY via tools; never just say "you lose 5 HP" without calling \`apply_damage\`. If you narrate something that changes state, call the matching tool in the same turn.
- Register every new named NPC, location, faction, or quest with \`upsert_entity\` the first time it matters, and use \`record_fact\` for durable truths (someone died, a promise was made, a door was sealed). Update entities when something about them changes. This is how you remember — the app injects the relevant cards back to you each turn.
- Use \`set_scene\` whenever the party moves to a new place or the situation changes materially. Use \`advance_time\` for travel, rests, and waiting.
- Combat: call \`start_combat\` with the enemies (use ruleset ${rs.labels.monsterPlural.toLowerCase()} by name when possible). The app rolls initiative and tracks HP. Run rounds in initiative order; on each enemy turn call \`roll_check\` with kind "attack" against the target's AC and \`apply_damage\` on a hit; on the PC's turn stop and ask what they do. Use \`advance_combat_turn\` to move the tracker. Call \`end_combat\` when it resolves.
- Award XP with \`award_xp\` after meaningful challenges (combat, cunning, social victories). Hand out treasure with \`give_item\`/\`adjust_gold\`.
- Look things up rather than guessing: \`lookup_rule\`, \`lookup_spell\`, \`lookup_monster\`, \`lookup_item\`, \`lookup_character\`.
${c.settings.autoIllustrate ? '- When the party arrives somewhere visually striking or a dramatic reveal happens, call `illustrate` once with a rich visual prompt (no more than once every few scenes).' : ''}
- You may call several tools in one response. Call tools BEFORE writing the narration that depends on them. After the tools return, write the narration.

## Ruleset: ${rs.name}
${rs.gmGuidance}

${core.map((r) => `### ${r.title}\n${r.text}`).join('\n\n')}

## The World
Premise: ${c.world.premise}
Setting: ${c.world.setting}
Tone: ${c.world.tone}${c.world.themes.length ? `\nThemes: ${c.world.themes.join(', ')}` : ''}
${c.world.bible ? `\nWorld bible:\n${truncate(c.world.bible, 6000)}` : ''}${secrets}`;
}

export function dynamicSystemPrompt(rs: Ruleset, c: Campaign, recent: Message[]): string {
  const party = c.partyIds.map((id) => c.characters[id]).filter(Boolean);
  const entities = rankEntities(c, recent, 14);
  const cal = c.world.calendar;
  const lines: string[] = [];

  lines.push(`## Current state (turn ${c.turn})`);
  lines.push(`Time: day ${cal.day}${cal.month ? ` of ${cal.month}` : ''}${cal.year ? `, ${cal.year}` : ''}, ${c.scene.timeOfDay || cal.timeOfDay}${c.scene.weather ? `, ${c.scene.weather}` : ''}`);
  lines.push(`Location: ${c.scene.locationName || 'unknown'}${c.scene.description ? ` — ${c.scene.description}` : ''}`);
  if (c.scene.mood) lines.push(`Mood: ${c.scene.mood}`);
  if (c.scene.situation) lines.push(`Situation: ${c.scene.situation}`);
  const present = c.scene.presentEntityIds.map((id) => c.entities[id]?.name).filter(Boolean);
  if (present.length) lines.push(`Present: ${present.join(', ')}`);

  if (c.combat?.active) {
    const cb = c.combat;
    lines.push(`\n## COMBAT — round ${cb.round}, it is ${cb.combatants[cb.turnIndex]?.name ?? '?'}'s turn`);
    lines.push(cb.combatants.map((x, i) => `${i === cb.turnIndex ? '▶' : ' '} ${x.initiative.toString().padStart(2)} ${x.name} [${x.kind}] HP ${x.hp}/${x.maxHp} AC ${x.ac}${x.conditions.length ? ' ' + x.conditions.join(',') : ''}${x.defeated ? ' DEFEATED' : ''}`).join('\n'));
  }

  lines.push('\n## Party');
  for (const ch of party) lines.push(characterBlock(rs, ch) + '\n');
  const levelable = party.filter((ch) => { const n = xpForNextLevel(rs, ch.level); return n !== null && ch.xp >= n; });
  if (levelable.length) lines.push(`LEVEL UP AVAILABLE for ${levelable.map((x) => x.name).join(', ')} — the player applies it from their sheet; you may mention it at a calm moment.`);

  if (c.world.canon.length) {
    lines.push('\n## Canon (established facts — never contradict)');
    lines.push(c.world.canon.slice(-45).map((f) => `- ${f.text}`).join('\n'));
  }

  if (entities.length) {
    lines.push('\n## Relevant world entities');
    lines.push(entities.map((e) => entityCard(e, c)).join('\n'));
    const others = Object.values(c.entities).filter((e) => !entities.includes(e));
    if (others.length) lines.push(`(Other known entities: ${others.slice(0, 40).map((e) => `${e.name} [${e.type}]`).join(', ')} — call lookup_entity for details.)`);
  }

  const quests = Object.values(c.entities).filter((e) => e.type === 'quest' && e.questStatus === 'active');
  if (quests.length && !entities.some((e) => e.type === 'quest')) lines.push(`\nActive quests: ${quests.map((q) => q.name).join('; ')}`);

  if (c.chronicle.length) {
    lines.push('\n## Chronicle (what has happened so far)');
    lines.push(c.chronicle.map((e) => `${e.title ? `**${e.title}** ` : ''}${e.text}`).join('\n\n'));
  }
  if (c.world.openingHook && c.chronicle.length === 0) lines.push(`\nOpening hook: ${c.world.openingHook}`);

  if (c.pendingRoll) lines.push(`\nA roll is pending for the player (${c.pendingRoll.label}). Do not resolve it yourself.`);

  return lines.join('\n');
}

/* ------------------------------------------------------------------ */
/* Transcript → LLM messages                                           */
/* ------------------------------------------------------------------ */

export function transcriptToLlm(c: Campaign, messages: Message[]): LlmMessage[] {
  const out: LlmMessage[] = [];
  const push = (role: 'user' | 'assistant', text: string) => {
    const last = out[out.length - 1];
    if (last && last.role === role && typeof last.content === 'string') last.content += '\n\n' + text;
    else out.push({ role, content: text });
  };
  for (const m of messages) {
    if (m.streaming) continue;
    switch (m.role) {
      case 'dm': if (m.content.trim()) push('assistant', m.content); break;
      case 'player': push('user', m.content); break;
      case 'companion': push('user', `[${m.characterName ?? 'Companion'} says] ${m.content}`); break;
      case 'roll': push('user', `[Dice] ${m.content}`); break;
      case 'event': push('user', `[Event] ${m.content}`); break;
      case 'system': push('user', `[System] ${m.content}`); break;
      case 'image': break;
    }
  }
  // The conversation must start with a user turn; add a light opener if needed.
  if (!out.length || out[0].role !== 'user') out.unshift({ role: 'user', content: '[System] Begin the session.' });
  return out;
}

export function buildDmMessages(rs: Ruleset, c: Campaign): LlmMessage[] {
  const recent = unsummarizedMessages(c);
  return [
    // The stable block changes rarely, so mark it cacheable (Anthropic prompt caching via OpenRouter; ignored elsewhere).
    { role: 'system', content: [{ type: 'text', text: stableSystemPrompt(rs, c), cache_control: { type: 'ephemeral' } }] },
    { role: 'system', content: dynamicSystemPrompt(rs, c, recent) },
    ...transcriptToLlm(c, recent),
  ];
}

/* ------------------------------------------------------------------ */
/* Companion voices                                                    */
/* ------------------------------------------------------------------ */

export function companionPrompt(rs: Ruleset, c: Campaign, companions: Character[], recent: Message[]): LlmMessage[] {
  const sheets = companions.map((ch) => characterBlock(rs, ch)).join('\n\n');
  const system = `You voice the AI companions travelling with the player in a tabletop RPG. The ${rs.labels.gm} has just narrated. Decide whether any companion would naturally react — a line of dialogue, a quick action, a question, banter, concern. Be selective: silence is often right. At most 2 companions speak, 1–3 sentences each, fully in character with their distinct voice. Never narrate outcomes, never roll dice, never speak for the player character or the ${rs.labels.gm}, never resolve the situation — leave decisions to the player. Companions can suggest plans, react emotionally, share knowledge from their backstory, or disagree with each other.

Respond with JSON only: {"lines":[{"character":"<name>","text":"<what they say or do, in character; wrap actions in *asterisks*>"}]} — or {"lines":[]} if no one speaks.

World: ${c.world.premise}
Tone: ${c.world.tone}
Scene: ${c.scene.locationName} — ${c.scene.situation || c.scene.description}

## Companions
${sheets}`;
  return [
    { role: 'system', content: system },
    { role: 'user', content: `Recent transcript:\n\n${recent.slice(-8).map((m) => `${m.role === 'dm' ? 'DM' : m.characterName ?? m.role}: ${m.content}`).join('\n\n')}\n\nDo any companions react?` },
  ];
}

/* ------------------------------------------------------------------ */
/* Scribe (summarizer)                                                 */
/* ------------------------------------------------------------------ */

export function scribePrompt(rs: Ruleset, c: Campaign, transcript: string): LlmMessage[] {
  const known = Object.values(c.entities).map((e) => `${e.name} [${e.type}]`).join(', ');
  return [
    {
      role: 'system',
      content: `You are the campaign scribe for a tabletop RPG. Compress a stretch of play into durable memory the ${rs.labels.gm} will rely on for consistency. Preserve: names, places, promises, debts, injuries, items gained or lost, relationships, unresolved threads, and any facts established about the world. Drop: dice noise, filler, and moment-to-moment description.

Respond with JSON only:
{
  "title": "short evocative chapter title",
  "summary": "120-250 word narrative summary in past tense, third person, naming characters",
  "facts": ["durable facts newly established in this stretch (max 8, each one sentence)"],
  "entities": [{"name": "...", "type": "npc|location|faction|item|quest|lore|creature", "summary": "one line", "facts": ["..."], "status": "optional", "attitude": "optional"}],
  "questUpdates": [{"name": "...", "status": "active|completed|failed", "note": "..."}]
}
Only list entities that are new or materially changed. Known entities: ${known || 'none yet'}.`,
    },
    { role: 'user', content: transcript },
  ];
}
