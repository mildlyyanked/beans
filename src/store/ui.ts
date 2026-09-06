import { create } from 'zustand';

export type Screen =
  | { name: 'home' }
  | { name: 'onboarding' }
  | { name: 'new-campaign' }
  | { name: 'play' }
  | { name: 'settings' }
  | { name: 'rulesets' }
  | { name: 'ruleset-editor'; id: string }
  | { name: 'rules'; id: string; section?: string };

export type PlayTab = 'story' | 'party' | 'journal' | 'world' | 'menu';

interface Toast { id: number; text: string; kind: 'info' | 'error' | 'success' }

interface UIState {
  screen: Screen;
  stack: Screen[];
  playTab: PlayTab;
  toasts: Toast[];
  go: (s: Screen) => void;
  replace: (s: Screen) => void;
  back: () => void;
  setPlayTab: (t: PlayTab) => void;
  toast: (text: string, kind?: Toast['kind']) => void;
  dismissToast: (id: number) => void;
}

let toastId = 0;
export const useUI = create<UIState>((set, get) => ({
  screen: { name: 'home' },
  stack: [],
  playTab: 'story',
  toasts: [],
  go: (s) => set((st) => ({ stack: [...st.stack, st.screen], screen: s })),
  replace: (s) => set({ screen: s }),
  back: () => set((st) => {
    const stack = [...st.stack];
    const prev = stack.pop() ?? { name: 'home' as const };
    return { stack, screen: prev };
  }),
  setPlayTab: (playTab) => set({ playTab }),
  toast: (text, kind = 'info') => {
    const id = ++toastId;
    set((st) => ({ toasts: [...st.toasts.slice(-1), { id, text, kind }] }));
    setTimeout(() => get().dismissToast(id), kind === 'error' ? 6000 : 2600);
  },
  dismissToast: (id) => set((st) => ({ toasts: st.toasts.filter((t) => t.id !== id) })),
}));
