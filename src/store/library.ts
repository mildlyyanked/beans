import { create } from 'zustand';
import { db } from '@/db';
import type { CharacterTemplate } from '@/types/campaign';
import type { CharacterDraft } from '@/engine/character';
import { uid } from '@/util/id';

/** Saved characters, reusable across campaigns. */
interface LibraryState {
  templates: CharacterTemplate[];
  loaded: boolean;
  load: () => Promise<void>;
  save: (rulesetId: string, draft: CharacterDraft, summary: string, existingId?: string) => Promise<CharacterTemplate>;
  remove: (id: string) => Promise<void>;
}

export const useLibrary = create<LibraryState>((set, get) => ({
  templates: [],
  loaded: false,
  load: async () => { const rows = await db.characters.orderBy('updatedAt').reverse().toArray(); set({ templates: rows, loaded: true }); },
  save: async (rulesetId, draft, summary, existingId) => {
    const t: CharacterTemplate = { id: existingId ?? uid('tpl'), name: draft.name || 'Unnamed', rulesetId, kind: draft.kind, summary, updatedAt: Date.now(), draft: JSON.parse(JSON.stringify(draft)) };
    await db.characters.put(t);
    await get().load();
    return t;
  },
  remove: async (id) => { await db.characters.delete(id); await get().load(); },
}));
