import type { Ruleset } from '@/types/ruleset';
import type { Campaign, Message, RollResult, ChronicleEntry, PendingRoll } from '@/types/campaign';
import { chat, chatJson, generateImage, type LlmMessage, type ToolCall } from '@/llm/openrouter';
import { useCampaign } from '@/store/campaign';
import { useSettings } from '@/store/settings';
import { useRulesets } from '@/store/rulesets';
import { buildDmMessages, companionPrompt, scribePrompt } from './prompt';
import { dmTools, executeTool, type ToolContext } from './tools';
import { chunkToSummarize, transcriptText, findEntityByName, newEntity, mergeEntity, touchMentionedEntities } from './memory';
import { makeCheck, describeRoll } from './dice';
import { skillMod, saveMod, abilityMod, weaponAttacks } from './rules';
import { uid } from '@/util/id';

const MAX_TOOL_ROUNDS = 10;

function ruleset(): Ruleset {
  const c = useCampaign.getState().campaign!;
  const rs = useRulesets.getState().get(c.rulesetId);
  if (!rs) throw new Error('Ruleset not found for this campaign');
  return rs;
}

/** Player submits an action or line of dialogue. */
export async function submitPlayerAction(text: string): Promise<void> {
  const st = useCampaign.getState();
  const c = st.campaign;
  if (!c || st.busy) return;
  const pc = c.characters[c.playerCharacterId];
  st.update((d) => ({ ...d, turn: d.turn + 1, pendingRoll: null }));
  st.addMessage({ role: 'player', content: text.trim(), characterId: pc?.id, characterName: pc?.name });
  await runDmTurn();
}

/** Resolve a pending (manual) roll by rolling now and sending the result. */
export async function resolvePendingRoll(): Promise<void> {
  const st = useCampaign.getState();
  const c = st.campaign;
  if (!c?.pendingRoll || st.busy) return;
  const rs = ruleset();
  const p: PendingRoll = c.pendingRoll;
  const ch = c.characters[p.characterId];
  let modifier = 0;
  if (ch) {
    if (p.kind === 'skill' && p.skillId) modifier = skillMod(rs, ch, p.skillId);
    else if (p.kind === 'save' && p.abilityId) modifier = saveMod(rs, ch, p.abilityId);
    else if (p.kind === 'ability' && p.abilityId) modifier = abilityMod(rs, ch.abilities[p.abilityId] ?? 10);
    else if (p.kind === 'attack') modifier = weaponAttacks(rs, ch)[0]?.attackBonus ?? 0;
    else if (p.expression) { const m = p.expression.match(/1d20([+-]\d+)?/); modifier = m?.[1] ? parseInt(m[1], 10) : 0; }
  }
  const r = makeCheck({ label: p.label, modifier, dc: p.dc, advantage: p.advantage, characterName: ch?.name, kind: p.kind });
  st.update((d) => ({ ...d, pendingRoll: null }));
  st.addMessage({ role: 'roll', content: describeRoll(r), roll: r, characterId: ch?.id, characterName: ch?.name });
  await runDmTurn();
}

/** Ask the DM to continue without a player action (e.g. "continue", or after a level-up). */
export async function nudgeDm(note?: string): Promise<void> {
  const st = useCampaign.getState();
  if (!st.campaign || st.busy) return;
  st.update((d) => ({ ...d, turn: d.turn + 1 }));
  st.addMessage({ role: 'system', content: note ?? 'Continue the scene.', hidden: !note });
  await runDmTurn();
}

export function stopGeneration(): void {
  useCampaign.getState().abort?.abort();
}

/* ------------------------------------------------------------------ */
/* DM turn                                                             */
/* ------------------------------------------------------------------ */

export async function runDmTurn(): Promise<void> {
  const store = useCampaign.getState();
  const settings = useSettings.getState();
  const rs = ruleset();
  if (!settings.apiKey) { store.setError('Add your OpenRouter API key in Settings to play.'); return; }

  const abort = new AbortController();
  store.setAbort(abort);
  store.setBusy(true, 'The Dungeon Master is thinking…');
  store.setError(null);

  const dmMsg = store.addMessage({ role: 'dm', content: '', streaming: true });
  const effects: string[] = [];
  const illustrations: { prompt: string; kind: string }[] = [];

  const ctx: ToolContext = {
    rs,
    get: () => useCampaign.getState().campaign!,
    set: (fn) => useCampaign.getState().update((c) => fn(c)),
    autoRoll: store.campaign!.settings.autoRoll,
    onRoll: (r: RollResult) => { useCampaign.getState().addMessage({ role: 'roll', content: describeRoll(r), roll: r, characterName: r.characterName }); },
    onEvent: (text) => { effects.push(text); },
    onIllustrate: (prompt, kind) => { illustrations.push({ prompt, kind }); },
  };

  let halted = false;
  let finalText = '';
  try {
    // Build once; tool results are appended as we go.
    const base = buildDmMessages(rs, useCampaign.getState().campaign!);
    // Remove the empty streaming DM message we just added from the transcript (it's skipped by streaming flag anyway).
    const messages: LlmMessage[] = [...base];
    const tools = dmTools(rs);

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      let streamed = finalText ? finalText + '\n\n' : '';
      let lastFlush = 0;
      const flush = () => {
        const text = streamed;
        useCampaign.getState().updateMessage(dmMsg.id, (m) => ({ ...m, content: text }));
      };
      const res = await chat(settings.apiKey, {
        model: settings.models.dm,
        messages,
        tools,
        temperature: settings.temperature,
        max_tokens: 2500,
        signal: abort.signal,
        onDelta: (d) => {
          streamed += d;
          const now = performance.now();
          if (now - lastFlush > 60) { lastFlush = now; flush(); }
        },
      });
      flush();

      if (res.toolCalls.length) {
        // The assistant message that carried the tool calls.
        messages.push({ role: 'assistant', content: res.content || null, tool_calls: res.toolCalls });
        for (const tc of res.toolCalls as ToolCall[]) {
          useCampaign.getState().setBusy(true, toolLabel(tc.function.name));
          const out = executeTool(ctx, tc.function.name, tc.function.arguments);
          if (out.effect) effects.push(out.effect);
          messages.push({ role: 'tool', tool_call_id: tc.id, name: tc.function.name, content: out.result });
          if (out.halt) halted = true;
        }
        // If the model already wrote narration alongside the tool calls, keep it as a prefix.
        if (res.content?.trim()) finalText = res.content.trim();
        if (halted) {
          // Let the model write its closing beat, without tools.
          const closing = await chat(settings.apiKey, { model: settings.models.dm, messages, temperature: settings.temperature, max_tokens: 900, signal: abort.signal, tool_choice: 'none', onDelta: (d) => { streamed += d; flush(); } });
          finalText = [finalText, closing.content.trim()].filter(Boolean).join('\n\n');
          break;
        }
        continue;
      }
      finalText = [finalText, res.content.trim()].filter(Boolean).join('\n\n');
      break;
    }
  } catch (e) {
    const err = e as Error;
    if (err.name === 'AbortError') {
      finalText = finalText || useCampaign.getState().campaign?.messages.find((m) => m.id === dmMsg.id)?.content || '';
    } else {
      useCampaign.getState().setError(err.message);
      useCampaign.getState().updateMessage(dmMsg.id, (m) => ({ ...m, streaming: false, error: err.message, content: m.content }));
      useCampaign.getState().setBusy(false);
      useCampaign.getState().setAbort(null);
      return;
    }
  }

  try {
    // Finalize DM message
    const dedupedEffects = Array.from(new Set(effects));
    useCampaign.getState().update((c) => {
      const messages = c.messages.map((m) => (m.id === dmMsg.id ? { ...m, content: finalText, streaming: false, effects: dedupedEffects } : m));
      return touchMentionedEntities({ ...c, messages }, finalText);
    });
    if (!finalText.trim()) useCampaign.getState().removeMessage(dmMsg.id);

    // Illustrations (fire and forget)
    for (const il of illustrations.slice(0, 1)) void illustrate(il.prompt, il.kind as any);

    // Companions react
    const c2 = useCampaign.getState().campaign!;
    if (c2.settings.companionsSpeak && !halted && finalText.trim()) {
      try { await runCompanions(); } catch (e) { console.warn('companions failed', e); }
    }
  } catch (e) {
    console.error('post-turn processing failed', e);
    useCampaign.getState().setError((e as Error).message);
  } finally {
    useCampaign.getState().setBusy(false);
    useCampaign.getState().setAbort(null);
  }

  // Background memory maintenance
  void maybeSummarize();
}

function toolLabel(name: string): string {
  const map: Record<string, string> = {
    roll_check: 'Rolling dice…', roll_dice: 'Rolling dice…', apply_damage: 'Applying damage…', heal: 'Healing…', start_combat: 'Rolling initiative…',
    upsert_entity: 'Updating the world…', record_fact: 'Recording canon…', set_scene: 'Setting the scene…', illustrate: 'Sketching…',
    lookup_rule: 'Consulting the rules…', lookup_spell: 'Consulting the spellbook…', lookup_monster: 'Opening the bestiary…', award_xp: 'Awarding experience…',
  };
  return map[name] ?? 'The Dungeon Master is thinking…';
}

/* ------------------------------------------------------------------ */
/* Companions                                                          */
/* ------------------------------------------------------------------ */

export async function runCompanions(force = false): Promise<void> {
  const st = useCampaign.getState();
  const c = st.campaign!;
  const rs = ruleset();
  const settings = useSettings.getState();
  const companions = c.partyIds.map((id) => c.characters[id]).filter((ch) => ch && ch.kind === 'companion' && ch.hp > 0);
  if (!companions.length) return;
  st.setBusy(true, 'Your companions consider…');
  const recent = c.messages.filter((m) => !m.hidden).slice(-10);
  const msgs = companionPrompt(rs, c, companions, recent);
  if (force) (msgs[1].content as string) += '\n\n(The player addressed the companions directly — at least one should answer.)';
  const json = await chatJson<{ lines?: { character: string; text: string }[] }>(settings.apiKey, { model: settings.models.companion, messages: msgs, temperature: 0.9, max_tokens: 600 });
  const lines = Array.isArray(json?.lines) ? json.lines : [];
  for (const l of lines.slice(0, 2)) {
    const ch = companions.find((x) => x.name.toLowerCase() === String(l.character).toLowerCase()) ?? companions.find((x) => String(l.character).toLowerCase().includes(x.name.toLowerCase().split(' ')[0]));
    if (!ch || !l.text?.trim()) continue;
    useCampaign.getState().addMessage({ role: 'companion', content: String(l.text).trim(), characterId: ch.id, characterName: ch.name });
  }
}

/* ------------------------------------------------------------------ */
/* Images                                                              */
/* ------------------------------------------------------------------ */

export async function illustrate(prompt: string, kind: 'scene' | 'portrait' | 'item' | 'map' | 'other' = 'scene', opts: { attachTo?: 'scene' | 'cover'; silent?: boolean } = {}): Promise<string | null> {
  const settings = useSettings.getState();
  const st = useCampaign.getState();
  if (!st.campaign || !settings.apiKey) return null;
  const c = st.campaign;
  const styled = `${prompt}. ${settings.imageStyle} Setting: ${c.world.setting.slice(0, 160)}.`;
  const placeholder = opts.silent ? null : st.addMessage({ role: 'image', content: '', imagePrompt: prompt, streaming: true });
  try {
    const dataUrl = await generateImage(settings.apiKey, settings.models.image, styled, { aspect: kind === 'portrait' ? 'portrait' : 'landscape' });
    const id = await useCampaign.getState().storeImage(dataUrl, { prompt, kind });
    if (placeholder) useCampaign.getState().updateMessage(placeholder.id, (m) => ({ ...m, imageId: id, streaming: false }));
    if (kind === 'scene' || opts.attachTo === 'scene') useCampaign.getState().setScene({ imageId: id });
    if (opts.attachTo === 'cover' || !useCampaign.getState().campaign?.coverImageId) useCampaign.getState().patch({ coverImageId: id });
    return id;
  } catch (e) {
    if (placeholder) useCampaign.getState().updateMessage(placeholder.id, (m) => ({ ...m, streaming: false, error: (e as Error).message }));
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Scribe                                                              */
/* ------------------------------------------------------------------ */

let summarizing = false;
export async function maybeSummarize(force = false): Promise<void> {
  if (summarizing) return;
  const st = useCampaign.getState();
  const c = st.campaign;
  if (!c) return;
  const chunk = force ? c.messages.filter((m) => !m.hidden && m.turn > c.chronicle.reduce((mx, e) => Math.max(mx, e.toTurn), 0)) : chunkToSummarize(c);
  if (!chunk || chunk.length < 4) return;
  summarizing = true;
  try {
    const rs = ruleset();
    const settings = useSettings.getState();
    const transcript = transcriptText(chunk, c.characters);
    const json = await chatJson<{ title?: string; summary?: string; facts?: string[]; entities?: any[]; questUpdates?: any[] }>(settings.apiKey, { model: settings.models.utility, messages: scribePrompt(rs, c, transcript), temperature: 0.3, max_tokens: 1500 });
    const entry: ChronicleEntry = { id: uid('chr'), fromTurn: chunk[0].turn, toTurn: chunk[chunk.length - 1].turn, title: json.title, text: json.summary ?? '', createdAt: Date.now() };
    useCampaign.getState().update((d) => {
      let next: Campaign = { ...d, chronicle: [...d.chronicle, entry] };
      for (const f of json.facts ?? []) if (typeof f === 'string' && f.trim() && !next.world.canon.some((x) => x.text === f)) next = { ...next, world: { ...next.world, canon: [...next.world.canon, { id: uid('fact'), text: f, turn: entry.toTurn, createdAt: Date.now(), category: 'scribe' }] } };
      for (const e of json.entities ?? []) {
        if (!e?.name) continue;
        const type = (['npc', 'location', 'faction', 'item', 'quest', 'lore', 'creature'].includes(e.type) ? e.type : 'lore');
        const existing = findEntityByName(next, e.name);
        const patch = { summary: e.summary, facts: Array.isArray(e.facts) ? e.facts : [], status: e.status, attitude: e.attitude };
        const ent = existing ? mergeEntity(existing, patch, entry.toTurn) : newEntity(next, { name: e.name, type, ...patch, questStatus: type === 'quest' ? 'active' : undefined });
        next = { ...next, entities: { ...next.entities, [ent.id]: ent } };
      }
      for (const q of json.questUpdates ?? []) {
        const ent = q?.name ? findEntityByName(next, q.name, 'quest') : undefined;
        if (ent) next = { ...next, entities: { ...next.entities, [ent.id]: { ...ent, questStatus: q.status ?? ent.questStatus, facts: q.note ? [...ent.facts, q.note] : ent.facts } } };
      }
      // Compact very long chronicles: merge oldest entries into an epoch.
      if (next.chronicle.length > 14) {
        const old = next.chronicle.slice(0, 6);
        const merged: ChronicleEntry = { id: uid('chr'), fromTurn: old[0].fromTurn, toTurn: old[old.length - 1].toTurn, title: `${old[0].title ?? 'Earlier'} … ${old[old.length - 1].title ?? ''}`.trim(), text: old.map((o) => o.text).join(' '), createdAt: Date.now() };
        next = { ...next, chronicle: [merged, ...next.chronicle.slice(6)] };
      }
      // Cap canon by trimming oldest scribe-derived facts once very long.
      if (next.world.canon.length > 90) next = { ...next, world: { ...next.world, canon: next.world.canon.slice(-80) } };
      return next;
    });
  } catch (e) {
    console.warn('scribe failed', e);
  } finally {
    summarizing = false;
  }
}

/** Ask the DM model for a fresh opening scene for a brand new campaign. */
export async function openCampaign(): Promise<void> {
  const st = useCampaign.getState();
  if (!st.campaign) return;
  if (st.campaign.messages.length) return;
  st.addMessage({ role: 'system', content: 'The session begins. Open with the opening hook: set the scene vividly (call set_scene and register the starting location and any NPCs present), introduce the situation, and end with the player character facing a choice. Do not summarize the premise back to the player — drop them into the moment.', hidden: true });
  await runDmTurn();
}
