import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CharacterDraft } from '@/engine/character';
import type { WorldSeed } from '@/engine/generators';
import type { CampaignSettings } from '@/types/campaign';

/** Autosaved state of the New Campaign wizard so nothing is lost if the app is backgrounded or crashes. */
export interface WizardDraft {
  step: number;
  rsId: string;
  idea: string;
  tones: string[];
  rating: 'pg' | 'pg13' | 'r';
  manual: boolean;
  manualWorld: { premise: string; setting: string; openingHook: string; startingLocation: string };
  seed: WorldSeed | null;
  name: string;
  hero: CharacterDraft | null;
  companions: CharacterDraft[];
  opts: CampaignSettings;
  updatedAt: number;
}

interface DraftState {
  draft: WizardDraft | null;
  save: (d: Partial<WizardDraft>) => void;
  clear: () => void;
}

export const useDraft = create<DraftState>()(
  persist(
    (set, get) => ({
      draft: null,
      save: (d) => set({ draft: { ...(get().draft ?? emptyDraft()), ...d, updatedAt: Date.now() } }),
      clear: () => set({ draft: null }),
    }),
    { name: 'tavern-wizard-draft' },
  ),
);

export function emptyDraft(): WizardDraft {
  return {
    step: 0, rsId: 'srd-5e', idea: '', tones: ['Heroic'], rating: 'pg13', manual: false,
    manualWorld: { premise: '', setting: '', openingHook: '', startingLocation: '' }, seed: null, name: '', hero: null, companions: [],
    opts: { autoRoll: true, companionsSpeak: true, autoIllustrate: false, narrationLength: 'adaptive', difficulty: 'normal', contextWindowMessages: 30 },
    updatedAt: Date.now(),
  };
}

export function draftHasContent(d: WizardDraft | null): boolean {
  return !!d && (!!d.seed || d.idea.trim().length > 0 || !!d.hero?.name?.trim() || d.companions.length > 0 || d.manualWorld.premise.trim().length > 0);
}
