import type { Campaign, Entity, EntityType, Message } from '@/types/campaign';
import { uid, truncate } from '@/util/id';
import { slug } from './rules';

/**
 * World memory: entity registry, relevance retrieval, and canon.
 *
 * The transcript is NOT the source of truth. Entities and canon facts are
 * structured records the DM must respect; each turn the most relevant ones are
 * selected and injected into the prompt, so the model sees a compact,
 * consistent picture of the world instead of a decaying chat history.
 */

export function findEntityByName(c: Campaign, name: string, type?: EntityType): Entity | undefined {
  const q = name.trim().toLowerCase();
  const s = slug(name);
  const list = Object.values(c.entities).filter((e) => !type || e.type === type);
  return (
    list.find((e) => e.name.toLowerCase() === q || e.id === s) ||
    list.find((e) => e.aliases.some((a) => a.toLowerCase() === q)) ||
    list.find((e) => e.name.toLowerCase().includes(q) || q.includes(e.name.toLowerCase())) ||
    (type ? undefined : list.find((e) => slug(e.name) === s))
  );
}

export function newEntity(c: Campaign, partial: Partial<Entity> & { name: string; type: EntityType }): Entity {
  const clean = Object.fromEntries(Object.entries(partial).filter(([, v]) => v !== undefined && v !== null)) as Partial<Entity> & { name: string; type: EntityType };
  return {
    id: uid(partial.type),
    aliases: [],
    summary: '',
    description: '',
    facts: [],
    tags: [],
    firstSeenTurn: c.turn,
    lastSeenTurn: c.turn,
    mentions: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...clean,
  };
}

/** Merge an update into an existing entity without losing facts. */
export function mergeEntity(existing: Entity, update: Partial<Entity>, turn: number): Entity {
  const facts = Array.from(new Set([...(existing.facts ?? []), ...(update.facts ?? [])]));
  const aliases = Array.from(new Set([...(existing.aliases ?? []), ...(update.aliases ?? [])]));
  const tags = Array.from(new Set([...(existing.tags ?? []), ...(update.tags ?? [])]));
  return {
    ...existing,
    ...Object.fromEntries(Object.entries(update).filter(([, v]) => v !== undefined && v !== '' && v !== null)),
    facts, aliases, tags,
    lastSeenTurn: turn,
    mentions: existing.mentions + 1,
    updatedAt: Date.now(),
  };
}

/** Score entities for relevance to the current moment. Higher = more relevant. */
export function rankEntities(c: Campaign, recentMessages: Message[], limit = 14): Entity[] {
  const text = recentMessages.map((m) => m.content).join('\n').toLowerCase();
  const lastText = recentMessages.slice(-4).map((m) => m.content).join('\n').toLowerCase();
  const present = new Set(c.scene.presentEntityIds);
  const scored = Object.values(c.entities).map((e) => {
    let score = 0;
    const names = [e.name, ...(e.aliases ?? [])].map((n) => n.toLowerCase()).filter((n) => n.length > 2);
    for (const n of names) {
      if (lastText.includes(n)) score += 8;
      else if (text.includes(n)) score += 4;
    }
    if (present.has(e.id)) score += 6;
    if (e.id === c.scene.locationId) score += 8;
    if (e.pinned) score += 6;
    if (e.type === 'quest' && e.questStatus === 'active') score += 4;
    if (e.locationId && e.locationId === c.scene.locationId) score += 3;
    const age = c.turn - e.lastSeenTurn;
    score += Math.max(0, 4 - age * 0.5);
    score += Math.min(2, e.mentions * 0.2);
    return { e, score };
  });
  return scored.filter((s) => s.score > 0.5).sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.e);
}

export function entityCard(e: Entity, c: Campaign, detailed = false): string {
  const parts: string[] = [];
  const kind = e.type.toUpperCase();
  let head = `• [${kind}] ${e.name}`;
  if (e.aliases.length) head += ` (aka ${e.aliases.slice(0, 3).join(', ')})`;
  if (e.status) head += ` — ${e.status}`;
  if (e.attitude) head += `, attitude: ${e.attitude}`;
  if (e.type === 'quest' && e.questStatus) head += ` [${e.questStatus}]`;
  parts.push(head);
  if (e.summary) parts.push(`  ${truncate(e.summary, detailed ? 600 : 220)}`);
  if (detailed && e.description) parts.push(`  ${truncate(e.description, 900)}`);
  if (e.locationId && c.entities[e.locationId]) parts.push(`  Location: ${c.entities[e.locationId].name}`);
  if (e.facts.length) parts.push(`  Facts: ${e.facts.slice(-(detailed ? 12 : 5)).map((f) => truncate(f, 140)).join(' | ')}`);
  if (e.objectives?.length) parts.push(`  Objectives: ${e.objectives.map((o) => `${o.done ? '✓' : '○'} ${o.text}`).join('; ')}`);
  if (e.relations?.length) parts.push(`  Relations: ${e.relations.map((r) => `${r.relation} ${c.entities[r.targetId]?.name ?? '?'}`).join('; ')}`);
  return parts.join('\n');
}

/** Register a name mention so recency scoring stays fresh, without the DM calling a tool. */
export function touchMentionedEntities(c: Campaign, text: string): Campaign {
  const lower = text.toLowerCase();
  let changed = false;
  const entities = { ...c.entities };
  for (const e of Object.values(entities)) {
    const names = [e.name, ...(e.aliases ?? [])].filter((n) => n.length > 2);
    if (names.some((n) => lower.includes(n.toLowerCase()))) {
      entities[e.id] = { ...e, lastSeenTurn: c.turn, mentions: e.mentions + 1 };
      changed = true;
    }
  }
  return changed ? { ...c, entities } : c;
}

/* ------------------------------------------------------------------ */
/* Chronicle (episodic summary) bookkeeping                            */
/* ------------------------------------------------------------------ */

export function lastSummarizedTurn(c: Campaign): number {
  return c.chronicle.reduce((m, e) => Math.max(m, e.toTurn), 0);
}

/** Messages not yet folded into the chronicle (hidden messages are hidden from the player, not the model). */
export function unsummarizedMessages(c: Campaign): Message[] {
  const t = lastSummarizedTurn(c);
  return c.messages.filter((m) => m.turn > t);
}

/** Decide whether the oldest unsummarized turns should be compressed. Returns the messages to summarize. */
export function chunkToSummarize(c: Campaign): Message[] | null {
  const window = Math.max(12, c.settings.contextWindowMessages);
  const pending = unsummarizedMessages(c);
  if (pending.length < window + 16) return null;
  // Take the oldest messages, but stop at a turn boundary so we don't split a turn.
  const target = pending.length - window;
  const cut = pending.slice(0, target);
  const lastTurn = cut[cut.length - 1].turn;
  return pending.filter((m) => m.turn <= lastTurn);
}

export function transcriptText(messages: Message[], characters: Campaign['characters']): string {
  return messages.map((m) => {
    switch (m.role) {
      case 'dm': return `DM: ${m.content}`;
      case 'player': return `${m.characterName ?? 'Player'}: ${m.content}`;
      case 'companion': return `${m.characterName ?? 'Companion'}: ${m.content}`;
      case 'roll': return `[Roll] ${m.content}`;
      case 'event': return `[Event] ${m.content}`;
      case 'image': return `[Illustration: ${m.imagePrompt ?? ''}]`;
      default: return `[${m.role}] ${m.content}`;
    }
  }).join('\n\n');
}
