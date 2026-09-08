import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OpenRouterModel } from '@/llm/openrouter';

export interface ModelConfig {
  dm: string;
  companion: string;
  utility: string; // summarizer / scribe / generators
  image: string;
}

export const DEFAULT_MODELS: ModelConfig = {
  dm: 'deepseek/deepseek-v4-pro-0813',
  companion: '~deepseek/deepseek-v4-flash-latest',
  utility: '~deepseek/deepseek-v4-flash-latest',
  image: 'openai/gpt-5-image-mini',
};

export const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';

export interface SettingsState {
  apiKey: string;
  baseUrl: string;
  keyLabel?: string;
  models: ModelConfig;
  temperature: number;
  imageStyle: string;
  reduceMotion: boolean;
  modelCache: OpenRouterModel[];
  modelCacheAt: number;
  onboarded: boolean;
  setApiKey: (k: string, label?: string) => void;
  setBaseUrl: (u: string) => void;
  setModel: (role: keyof ModelConfig, id: string) => void;
  setTemperature: (t: number) => void;
  setImageStyle: (s: string) => void;
  setReduceMotion: (b: boolean) => void;
  setModelCache: (m: OpenRouterModel[]) => void;
  setOnboarded: (b: boolean) => void;
}

export const DEFAULT_IMAGE_STYLE =
  'Painterly dark-fantasy illustration, dramatic chiaroscuro lighting, rich textures, cinematic composition, in the style of classic tabletop RPG cover art. No text.';

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: '',
      baseUrl: DEFAULT_BASE_URL,
      models: DEFAULT_MODELS,
      temperature: 0.9,
      imageStyle: DEFAULT_IMAGE_STYLE,
      reduceMotion: false,
      modelCache: [],
      modelCacheAt: 0,
      onboarded: false,
      setApiKey: (apiKey, keyLabel) => set({ apiKey, keyLabel }),
      setBaseUrl: (baseUrl) => set({ baseUrl: baseUrl.trim().replace(/\/+$/, '') || DEFAULT_BASE_URL }),
      setModel: (role, id) => set((s) => ({ models: { ...s.models, [role]: id } })),
      setTemperature: (temperature) => set({ temperature }),
      setImageStyle: (imageStyle) => set({ imageStyle }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setModelCache: (modelCache) => set({ modelCache, modelCacheAt: Date.now() }),
      setOnboarded: (onboarded) => set({ onboarded }),
    }),
    { name: 'tavern-settings', partialize: (s) => ({ apiKey: s.apiKey, baseUrl: s.baseUrl, keyLabel: s.keyLabel, models: s.models, temperature: s.temperature, imageStyle: s.imageStyle, reduceMotion: s.reduceMotion, modelCache: s.modelCache.slice(0, 400), modelCacheAt: s.modelCacheAt, onboarded: s.onboarded }) },
  ),
);
