import React, { useState } from 'react';
import { ExternalLink, KeyRound, Sparkles } from 'lucide-react';
import { useUI } from '@/store/ui';
import { useSettings } from '@/store/settings';
import { checkKey } from '@/llm/openrouter';
import { Button, Sigil, Field, Ornament } from '@/components/ui';

export function OnboardingScreen() {
  const replace = useUI((s) => s.replace);
  const toast = useUI((s) => s.toast);
  const setApiKey = useSettings((s) => s.setApiKey);
  const setOnboarded = useSettings((s) => s.setOnboarded);
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const k = key.trim();
    if (!k) { setOnboarded(true); replace({ name: 'home' }); return; }
    setBusy(true);
    const res = await checkKey(k);
    setBusy(false);
    if (!res.ok) { toast(res.error ?? 'Key rejected', 'error'); return; }
    setApiKey(k, res.label);
    setOnboarded(true);
    toast('Key verified — welcome to the Tavern', 'success');
    replace({ name: 'home' });
  };

  return (
    <div className="scroll">
      <div className="hero">
        <Sigil size={96} />
        <h1 className="gradient-text">TAVERN</h1>
        <div className="tag">An AI Dungeon Master with a long memory.</div>
      </div>
      <div className="pad stack">
        <div className="card glow stack">
          <div className="row"><KeyRound size={18} className="gold" /><div className="card-title">Connect OpenRouter</div></div>
          <p className="dim small">Tavern talks directly to OpenRouter from your device. Your key is stored locally and never sent anywhere else. Pick any model you like later in Settings.</p>
          <Field label="API key">
            <input className="input ui" type="password" placeholder="sk-or-v1-…" value={key} onChange={(e) => setKey(e.target.value)} autoCapitalize="off" autoCorrect="off" />
          </Field>
          <a className="row ui small" href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" style={{ gap: 6 }}>Get a key at openrouter.ai <ExternalLink size={13} /></a>
          <Button variant="primary" block disabled={busy} onClick={save}>{busy ? 'Verifying…' : key.trim() ? 'Enter the Tavern' : 'Skip for now'}</Button>
        </div>
        <Ornament short />
        <div className="stack-sm">
          {[
            ['A DM that remembers', 'NPCs, places, promises and lore live in a structured world memory the DM consults every turn — not a fading chat history.'],
            ['Any ruleset', 'Fifth Edition SRD ships built-in. Fork it, hand-edit it, or have the AI generate an entirely new system.'],
            ['Real dice, real stakes', 'The app rolls the dice and tracks HP, spells, inventory, and initiative. The DM narrates; the math is honest.'],
            ['Illustrated', 'Generate scene art and portraits with any image model on OpenRouter.'],
          ].map(([t, s]) => (
            <div key={t} className="card flat row" style={{ alignItems: 'flex-start' }}>
              <Sparkles size={16} className="gold" style={{ marginTop: 4, flexShrink: 0 }} />
              <div><div className="card-title" style={{ fontSize: 13.5 }}>{t}</div><div className="small dim">{s}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
