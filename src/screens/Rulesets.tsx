import React, { useState } from 'react';
import { Copy, Wand2, Upload, Download, Trash2, PencilLine, BookOpen, Lock } from 'lucide-react';
import { useRulesets } from '@/store/rulesets';
import { useUI } from '@/store/ui';
import { useSettings } from '@/store/settings';
import { TopBar, Button, Sheet, Field, Confirm, Chip } from '@/components/ui';
import { validateRuleset } from '@/engine/schema';
import { generateRuleset } from '@/engine/generators';
import { downloadJson, readFileAsText } from '@/util/id';
import type { Ruleset } from '@/types/ruleset';

const GEN_IDEAS = [
  'A grim cyberpunk system: Body/Reflex/Mind/Edge, cyberware instead of magic, corporate gangs as monsters.',
  'Wuxia martial arts: qi techniques replace spells, sects replace classes, inner-cultivation levels.',
  'Cosmic horror in the 1920s: sanity as a resource, investigators, no true healing magic.',
  'Post-apocalyptic mutants and machines: scavenged tech, mutations as traits, radiation zones.',
  'Fairy-tale adventure for kids: gentle stakes, charm and cleverness over combat.',
];

export function RulesetsScreen() {
  const { builtIn, custom, save, remove, fork } = useRulesets();
  const go = useUI((s) => s.go);
  const toast = useUI((s) => s.toast);
  const apiKey = useSettings((s) => s.apiKey);
  const [gen, setGen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [progress, setProgress] = useState<{ stage: string; pct: number } | null>(null);
  const [del, setDel] = useState<Ruleset | null>(null);

  const doGenerate = async () => {
    if (!apiKey) { toast('Add your OpenRouter key in Settings first', 'error'); return; }
    setProgress({ stage: 'Starting', pct: 0 });
    try {
      const rs = await generateRuleset(prompt, (stage, pct) => setProgress((p) => ({ stage, pct: pct < 0 ? (p?.pct ?? 0) : pct })));
      await save(rs);
      setGen(false); setProgress(null);
      toast(`"${rs.name}" is ready — review it in the editor`, 'success');
      go({ name: 'ruleset-editor', id: rs.id });
    } catch (e) { toast((e as Error).message, 'error'); setProgress(null); }
  };

  const importFile = async (file: File) => {
    try {
      const v = validateRuleset(JSON.parse(await readFileAsText(file)));
      if (!v.ok) throw new Error(v.error);
      const rs = { ...v.ruleset, id: builtIn.some((b) => b.id === v.ruleset.id) ? v.ruleset.id + '-import' : v.ruleset.id, builtIn: false };
      await save(rs);
      toast(`Imported "${rs.name}"${v.warnings.length ? ` with ${v.warnings.length} warnings` : ''}`, 'success');
    } catch (e) { toast((e as Error).message, 'error'); }
  };

  const Card = ({ rs }: { rs: Ruleset }) => (
    <div className="card stack-sm">
      <div className="row-between">
        <div className="card-title">{rs.name}</div>
        {rs.builtIn ? <Chip tone="gold"><Lock size={11} /> Built-in</Chip> : <Chip tone="arcane">Custom</Chip>}
      </div>
      <div className="small dim">{rs.description}</div>
      <div className="tiny mute ui">{rs.classes.length} {rs.labels.classPlural.toLowerCase()} · {rs.species.length} {rs.labels.speciesPlural.toLowerCase()} · {rs.spells.length} {rs.labels.spellPlural.toLowerCase()} · {rs.monsters.length} {rs.labels.monsterPlural.toLowerCase()} · {rs.equipment.length} items</div>
      <div className="row wrap" style={{ gap: 6 }}>
        <Button variant="ghost" size="xs" onClick={() => go({ name: 'rules', id: rs.id })}><BookOpen size={12} /> Browse</Button>
        {rs.builtIn ? <Button variant="ghost" size="xs" onClick={async () => { const f = await fork(rs.id); toast(`Forked as "${f.name}"`, 'success'); go({ name: 'ruleset-editor', id: f.id }); }}><Copy size={12} /> Fork & edit</Button>
          : <Button variant="ghost" size="xs" onClick={() => go({ name: 'ruleset-editor', id: rs.id })}><PencilLine size={12} /> Edit</Button>}
        <Button variant="ghost" size="xs" onClick={() => downloadJson(`${rs.id}.ruleset.json`, rs)}><Download size={12} /> Export</Button>
        {!rs.builtIn && <Button variant="danger" size="xs" onClick={() => setDel(rs)}><Trash2 size={12} /></Button>}
      </div>
    </div>
  );

  return (
    <>
      <TopBar title="Rulesets" subtitle="The rules are data. Change them." back />
      <div className="scroll pad stack" style={{ paddingBottom: 40 }}>
        <div className="row">
          <Button variant="arcane" className="grow" onClick={() => setGen(true)}><Wand2 size={15} /> Generate a system</Button>
          <label className="btn ghost" style={{ cursor: 'pointer' }}><Upload size={15} /><input type="file" accept="application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void importFile(f); e.target.value = ''; }} /></label>
        </div>
        <div className="eyebrow mt-8">Built in</div>
        {builtIn.map((rs) => <Card key={rs.id} rs={rs} />)}
        {custom.length > 0 && <div className="eyebrow mt-8">Yours</div>}
        {custom.map((rs) => <Card key={rs.id} rs={rs} />)}
        <div className="tiny mute ui" style={{ lineHeight: 1.5 }}>A ruleset defines abilities, skills, {builtIn[0].labels.classPlural.toLowerCase()}, peoples, backgrounds, spells, equipment, a bestiary, conditions, level tables, and the core rules the DM reads. Fork the built-in system to tweak anything, or generate a whole new one from a sentence.</div>
      </div>

      <Sheet open={gen} onClose={() => !progress && setGen(false)} title="Generate a ruleset">
        {!progress ? (
          <div className="stack">
            <p className="small dim">Describe the system you want. The AI designs mechanics, peoples, classes, powers, gear, and a bestiary in six passes, then you can hand-edit anything.</p>
            <Field label="Design brief"><textarea className="textarea" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={GEN_IDEAS[0]} /></Field>
            <div className="chips">{GEN_IDEAS.map((i) => <Chip key={i} onClick={() => setPrompt(i)}>{i.split(':')[0]}</Chip>)}</div>
            <Button variant="arcane" block onClick={doGenerate}><Wand2 size={15} /> Design it</Button>
            <div className="tiny mute ui">Takes a few minutes and several large model calls. Uses your DM model.</div>
          </div>
        ) : (
          <div className="stack center" style={{ padding: 20 }}>
            <div className="progress-ring">
              <svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" stroke="rgba(226,184,91,0.15)" strokeWidth="6" fill="none" /><circle cx="60" cy="60" r="52" stroke="var(--gold)" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={2 * Math.PI * 52} strokeDashoffset={2 * Math.PI * 52 * (1 - progress.pct)} style={{ transition: 'stroke-dashoffset .6s' }} /></svg>
              <div className="pct">{Math.round(progress.pct * 100)}%</div>
            </div>
            <div className="display" style={{ letterSpacing: '0.1em', fontSize: 13 }}>{progress.stage}</div>
            <div className="tiny mute ui">Please keep the app open.</div>
          </div>
        )}
      </Sheet>
      <Confirm open={!!del} onClose={() => setDel(null)} onConfirm={() => del && void remove(del.id)} title={`Delete "${del?.name}"?`} text="Campaigns using this ruleset will no longer open." confirmLabel="Delete" danger />
    </>
  );
}
