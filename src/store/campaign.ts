import { create } from 'zustand';
import { db, putImage, deleteCampaignData } from '@/db';
import type { Campaign, CampaignSummary, Character, Entity, Message, SaveSlot, CanonFact, Scene, CombatState, PendingRoll, ChronicleEntry } from '@/types/campaign';
import { uid, debounce } from '@/util/id';
import { useRulesets } from './rulesets';
import { findClass } from '@/engine/rules';

export interface CampaignState {
  campaign: Campaign | null;
  library: CampaignSummary[];
  busy: boolean; // DM is thinking
  busyLabel: string;
  error: string | null;
  abort: AbortController | null;

  loadLibrary: () => Promise<void>;
  open: (id: string) => Promise<Campaign | null>;
  close: () => void;
  create: (c: Campaign) => Promise<void>;
  remove: (id: string) => Promise<void>;
  /** Functional update of the active campaign; autosaves. */
  update: (fn: (c: Campaign) => Campaign | void) => void;
  patch: (p: Partial<Campaign>) => void;
  addMessage: (m: Omit<Message, 'id' | 'createdAt' | 'turn'> & { turn?: number }) => Message;
  updateMessage: (id: string, fn: (m: Message) => Message) => void;
  removeMessage: (id: string) => void;
  updateCharacter: (id: string, fn: (ch: Character) => Character) => void;
  upsertEntity: (e: Entity) => void;
  addCanon: (text: string, category?: string) => CanonFact;
  setScene: (s: Partial<Scene>) => void;
  setCombat: (c: CombatState | null) => void;
  setPendingRoll: (p: PendingRoll | null) => void;
  addChronicle: (e: ChronicleEntry) => void;
  storeImage: (dataUrl: string, meta: { prompt: string; kind: Campaign['images'][string]['kind'] }) => Promise<string>;
  setBusy: (busy: boolean, label?: string) => void;
  setError: (e: string | null) => void;
  setAbort: (a: AbortController | null) => void;

  // Save slots
  listSaves: (campaignId: string) => Promise<SaveSlot[]>;
  saveSlot: (name: string) => Promise<SaveSlot>;
  loadSlot: (slotId: string) => Promise<void>;
  deleteSlot: (slotId: string) => Promise<void>;
  flush: () => Promise<void>;
}

function summarize(c: Campaign): CampaignSummary {
  const pc = c.characters[c.playerCharacterId];
  const rs = useRulesets.getState().get(c.rulesetId);
  return {
    id: c.id, name: c.name, rulesetId: c.rulesetId, updatedAt: c.updatedAt, turn: c.turn,
    playerName: pc?.name ?? '—', playerClass: pc ? (rs ? findClass(rs, pc.classId)?.name ?? pc.classId : pc.classId) : '—', level: pc?.level ?? 1,
    locationName: c.scene.locationName, coverImageId: c.coverImageId, premise: c.world.premise,
  };
}

let pendingWrite: Campaign | null = null;
const writeNow = async () => {
  const c = pendingWrite; pendingWrite = null;
  if (c) await db.campaigns.put(c);
};
const scheduleWrite = debounce(writeNow, 400);

export const useCampaign = create<CampaignState>((set, get) => ({
  campaign: null,
  library: [],
  busy: false,
  busyLabel: '',
  error: null,
  abort: null,

  loadLibrary: async () => {
    const rows = await db.campaigns.orderBy('updatedAt').reverse().toArray();
    set({ library: rows.map(summarize) });
  },
  open: async (id) => {
    const c = await db.campaigns.get(id);
    if (!c) return null;
    set({ campaign: c, error: null });
    return c;
  },
  close: () => { void writeNow(); set({ campaign: null, busy: false, error: null }); },
  create: async (c) => {
    await db.campaigns.put(c);
    set({ campaign: c });
    await get().loadLibrary();
  },
  remove: async (id) => {
    await deleteCampaignData(id);
    if (get().campaign?.id === id) set({ campaign: null });
    await get().loadLibrary();
  },
  update: (fn) => {
    const c = get().campaign;
    if (!c) return;
    const draft: Campaign = { ...c };
    const res = fn(draft);
    const next = (res ?? draft) as Campaign;
    next.updatedAt = Date.now();
    pendingWrite = next;
    scheduleWrite();
    set({ campaign: next, library: get().library.map((l) => (l.id === next.id ? summarize(next) : l)) });
  },
  patch: (p) => get().update((c) => ({ ...c, ...p })),
  addMessage: (m) => {
    const c = get().campaign!;
    const msg: Message = { id: uid('msg'), createdAt: Date.now(), turn: m.turn ?? c.turn, ...m } as Message;
    get().update((c2) => ({ ...c2, messages: [...c2.messages, msg] }));
    return msg;
  },
  updateMessage: (id, fn) => get().update((c) => ({ ...c, messages: c.messages.map((m) => (m.id === id ? fn(m) : m)) })),
  removeMessage: (id) => get().update((c) => ({ ...c, messages: c.messages.filter((m) => m.id !== id) })),
  updateCharacter: (id, fn) => get().update((c) => {
    const ch = c.characters[id];
    if (!ch) return c;
    return { ...c, characters: { ...c.characters, [id]: fn(ch) } };
  }),
  upsertEntity: (e) => get().update((c) => ({ ...c, entities: { ...c.entities, [e.id]: e } })),
  addCanon: (text, category) => {
    const c = get().campaign!;
    const fact: CanonFact = { id: uid('fact'), text, turn: c.turn, createdAt: Date.now(), category };
    get().update((c2) => ({ ...c2, world: { ...c2.world, canon: [...c2.world.canon, fact] } }));
    return fact;
  },
  setScene: (s) => get().update((c) => ({ ...c, scene: { ...c.scene, ...s } })),
  setCombat: (combat) => get().update((c) => ({ ...c, combat })),
  setPendingRoll: (pendingRoll) => get().update((c) => ({ ...c, pendingRoll })),
  addChronicle: (e) => get().update((c) => ({ ...c, chronicle: [...c.chronicle, e] })),
  storeImage: async (dataUrl, meta) => {
    const c = get().campaign!;
    const id = uid('img');
    await putImage(c.id, id, dataUrl);
    get().update((c2) => ({ ...c2, images: { ...c2.images, [id]: { id, prompt: meta.prompt, kind: meta.kind, createdAt: Date.now() } } }));
    return id;
  },
  setBusy: (busy, label = '') => set({ busy, busyLabel: label }),
  setError: (error) => set({ error }),
  setAbort: (abort) => set({ abort }),

  listSaves: async (campaignId) => db.saves.where('campaignId').equals(campaignId).reverse().sortBy('createdAt'),
  saveSlot: async (name) => {
    await writeNow();
    const c = get().campaign!;
    const slot: SaveSlot = { id: uid('save'), campaignId: c.id, name, createdAt: Date.now(), turn: c.turn, snapshot: JSON.parse(JSON.stringify(c)) };
    await db.saves.put(slot);
    get().update((c2) => ({ ...c2, lastSavedAt: Date.now() }));
    return slot;
  },
  loadSlot: async (slotId) => {
    const slot = await db.saves.get(slotId);
    if (!slot) throw new Error('Save not found');
    const restored: Campaign = { ...slot.snapshot, updatedAt: Date.now() };
    pendingWrite = restored;
    await writeNow();
    set({ campaign: restored, busy: false, error: null });
    await get().loadLibrary();
  },
  deleteSlot: async (slotId) => { await db.saves.delete(slotId); },
  flush: writeNow,
}));

/** Convenience selectors */
export const selectPlayer = (s: CampaignState): Character | undefined => s.campaign ? s.campaign.characters[s.campaign.playerCharacterId] : undefined;
export const selectParty = (s: CampaignState): Character[] => s.campaign ? s.campaign.partyIds.map((id) => s.campaign!.characters[id]).filter(Boolean) : [];
