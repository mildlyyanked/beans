import { create } from 'zustand';
import { db } from '@/db';
import type { Ruleset } from '@/types/ruleset';
import { srdRuleset } from '@/data/srd';
import { uid } from '@/util/id';

interface RulesetsState {
  builtIn: Ruleset[];
  custom: Ruleset[];
  loaded: boolean;
  load: () => Promise<void>;
  get: (id: string) => Ruleset | undefined;
  all: () => Ruleset[];
  save: (rs: Ruleset) => Promise<void>;
  remove: (id: string) => Promise<void>;
  fork: (id: string, name?: string) => Promise<Ruleset>;
}

export const useRulesets = create<RulesetsState>((set, get) => ({
  builtIn: [srdRuleset],
  custom: [],
  loaded: false,
  load: async () => {
    const rows = await db.rulesets.orderBy('updatedAt').reverse().toArray();
    set({ custom: rows.map((r) => r.data), loaded: true });
  },
  get: (id) => get().builtIn.find((r) => r.id === id) ?? get().custom.find((r) => r.id === id),
  all: () => [...get().builtIn, ...get().custom],
  save: async (rs) => {
    const data = { ...rs, builtIn: false, updatedAt: Date.now(), createdAt: rs.createdAt ?? Date.now() };
    await db.rulesets.put({ id: data.id, name: data.name, updatedAt: data.updatedAt, data });
    set((s) => ({ custom: [data, ...s.custom.filter((c) => c.id !== data.id)] }));
  },
  remove: async (id) => {
    await db.rulesets.delete(id);
    set((s) => ({ custom: s.custom.filter((c) => c.id !== id) }));
  },
  fork: async (id, name) => {
    const src = get().get(id);
    if (!src) throw new Error('Ruleset not found');
    const copy: Ruleset = JSON.parse(JSON.stringify(src));
    copy.id = uid('rs');
    copy.name = name ?? `${src.name} (Custom)`;
    copy.builtIn = false;
    copy.author = 'You';
    copy.createdAt = Date.now();
    copy.updatedAt = Date.now();
    await get().save(copy);
    return copy;
  },
}));
