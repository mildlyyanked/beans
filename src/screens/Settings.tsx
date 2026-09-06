import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { useSettings, DEFAULT_MODELS, DEFAULT_IMAGE_STYLE, DEFAULT_BASE_URL, type ModelConfig } from '@/store/settings';
import { useUI } from '@/store/ui';
import { checkKey, listModels, type OpenRouterModel } from '@/llm/openrouter';
import { TopBar, Button, Field, Toggle, Sheet, SectionTitle } from '@/components/ui';

const ROLE_INFO: Record<keyof ModelConfig, [string, string]> = {
  dm: ['Dungeon Master', 'Narration, rules adjudication, tool use. Needs function calling. Best with a strong model.'],
  companion: ['Companions', 'Voices your party members. A fast, cheap model works well.'],
  utility: ['Scribe & generators', 'Summaries, character/world generation, ruleset edits.'],
  image: ['Illustrator', 'Must support image output (e.g. Gemini image models).'],
};

function ModelPicker({ role, open, onClose }: { role: keyof ModelConfig | null; open: boolean; onClose: () => void }) {
  const models = useSettings((s) => s.modelCache);
  const setModel = useSettings((s) => s.setModel);
  const current = useSettings((s) => (role ? s.models[role] : ''));
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let l = models;
    if (role === 'image') l = l.filter((m) => m.architecture?.output_modalities?.includes('image'));
    else if (role === 'dm') l = l.filter((m) => (m.supported_parameters ?? []).includes('tools') || !m.supported_parameters?.length);
    if (ql) l = l.filter((m) => m.id.toLowerCase().includes(ql) || m.name.toLowerCase().includes(ql));
    return l.slice(0, 120);
  }, [models, q, role]);
  const price = (m: OpenRouterModel) => {
    const p = parseFloat(m.pricing?.prompt ?? '0') * 1e6, c = parseFloat(m.pricing?.completion ?? '0') * 1e6;
    if (!p && !c) return 'free';
    return `$${p.toFixed(2)} / $${c.toFixed(2)} per M`;
  };
  return (
    <Sheet open={open} onClose={onClose} title={role ? ROLE_INFO[role][0] : ''}>
      <div className="searchbar mb-16"><Search size={16} className="mute" /><input placeholder="Search models…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {role && (
        <div className="stack-sm">
          <input className="input ui" placeholder="Or type a model id, e.g. anthropic/claude-sonnet-4.5" value={current} onChange={(e) => setModel(role, e.target.value)} />
          {list.map((m) => (
            <div key={m.id} className={`card flat clickable ${m.id === current ? 'selected' : ''}`} onClick={() => { setModel(role, m.id); onClose(); }} style={{ padding: '10px 12px' }}>
              <div className="ui" style={{ fontWeight: 600, fontSize: 13.5 }}>{m.name}</div>
              <div className="tiny mute ui">{m.id} · {price(m)}{m.context_length ? ` · ${Math.round(m.context_length / 1000)}k ctx` : ''}</div>
            </div>
          ))}
          {!models.length && <div className="empty">No model list cached. Tap “Refresh models”.</div>}
        </div>
      )}
    </Sheet>
  );
}

export function SettingsScreen() {
  const s = useSettings();
  const toast = useUI((st) => st.toast);
  const [key, setKey] = useState(s.apiKey);
  const [picker, setPicker] = useState<keyof ModelConfig | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    if (!s.apiKey) { toast('Add an API key first', 'error'); return; }
    setRefreshing(true);
    try { s.setModelCache(await listModels(s.apiKey)); toast('Model list updated', 'success'); } catch (e) { toast((e as Error).message, 'error'); }
    setRefreshing(false);
  };
  useEffect(() => { if (s.apiKey && Date.now() - s.modelCacheAt > 24 * 3600e3) void refresh(); /* eslint-disable-next-line */ }, []);

  const saveKey = async () => {
    const k = key.trim();
    if (!k) { s.setApiKey(''); toast('Key removed'); return; }
    const res = await checkKey(k);
    if (!res.ok) { toast(res.error ?? 'Key rejected', 'error'); return; }
    s.setApiKey(k, res.label);
    toast(`Key verified${res.label ? ` (${res.label})` : ''}`, 'success');
    void refresh();
  };

  return (
    <>
      <TopBar title="Settings" back />
      <div className="scroll pad stack">
        <SectionTitle>OpenRouter</SectionTitle>
        <div className="card stack">
          <Field label="API key" hint="Stored only in this browser's local storage.">
            <input className="input ui" type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-or-v1-…" autoCapitalize="off" />
          </Field>
          <div className="row">
            <Button variant="primary" size="sm" onClick={saveKey}>Save & verify</Button>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={refreshing}><RefreshCw size={14} className={refreshing ? 'spin' : ''} /> Refresh models</Button>
          </div>
          {s.keyLabel && <div className="tiny mute ui">Connected: {s.keyLabel}</div>}
          <details>
            <summary className="tiny mute ui" style={{ cursor: 'pointer' }}>Advanced: API endpoint</summary>
            <Field label="Base URL" hint="Any OpenAI-compatible endpoint (OpenRouter, a local Ollama/LM Studio server, …).">
              <input className="input ui" value={s.baseUrl} onChange={(e) => s.setBaseUrl(e.target.value)} placeholder={DEFAULT_BASE_URL} autoCapitalize="off" />
            </Field>
          </details>
        </div>

        <SectionTitle>Models</SectionTitle>
        <div className="card stack-sm">
          {(Object.keys(ROLE_INFO) as (keyof ModelConfig)[]).map((role) => (
            <div key={role} className="list-item clickable" onClick={() => setPicker(role)} style={{ cursor: 'pointer' }}>
              <div className="grow">
                <div className="t">{ROLE_INFO[role][0]}</div>
                <div className="s">{ROLE_INFO[role][1]}</div>
                <div className="tiny gold ui mt-8" style={{ fontWeight: 600 }}>{s.models[role]}</div>
              </div>
              <span className="chip">Change</span>
            </div>
          ))}
          <Button variant="subtle" size="sm" onClick={() => (Object.keys(DEFAULT_MODELS) as (keyof ModelConfig)[]).forEach((r) => s.setModel(r, DEFAULT_MODELS[r]))}>Reset to defaults</Button>
        </div>

        <SectionTitle>Narration</SectionTitle>
        <div className="card stack">
          <Field label={`Creativity · ${s.temperature.toFixed(2)}`} hint="Higher = more surprising prose, lower = more grounded.">
            <input type="range" min={0.2} max={1.3} step={0.05} value={s.temperature} onChange={(e) => s.setTemperature(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--gold)' }} />
          </Field>
        </div>

        <SectionTitle>Illustration</SectionTitle>
        <div className="card stack">
          <Field label="Art style" hint="Appended to every image prompt.">
            <textarea className="textarea ui" value={s.imageStyle} onChange={(e) => s.setImageStyle(e.target.value)} />
          </Field>
          <Button variant="subtle" size="sm" onClick={() => s.setImageStyle(DEFAULT_IMAGE_STYLE)}>Reset style</Button>
        </div>

        <SectionTitle>Accessibility</SectionTitle>
        <div className="card">
          <Toggle on={s.reduceMotion} onChange={s.setReduceMotion} label="Reduce motion" hint="Disables animations and transitions." />
        </div>
        <div className="tiny mute ui" style={{ textAlign: 'center', padding: '10px 0 30px' }}>Tavern · v0.1 · SRD 5.1 content used under CC-BY-4.0</div>
      </div>
      <ModelPicker role={picker} open={!!picker} onClose={() => setPicker(null)} />
    </>
  );
}
