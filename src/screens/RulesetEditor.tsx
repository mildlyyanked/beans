import React, { useMemo, useState } from 'react';
import { Plus, Search, Wand2, Save, Trash2, Code2 } from 'lucide-react';
import { useRulesets } from '@/store/rulesets';
import { useUI } from '@/store/ui';
import { TopBar, Button, Field, Sheet, Empty } from '@/components/ui';
import { RULESET_SECTIONS, type Ruleset, type RulesetSectionKey } from '@/types/ruleset';
import { validateRuleset } from '@/engine/schema';
import { reviseRulesetSection } from '@/engine/generators';
import { slug } from '@/engine/rules';

type Tab = 'about' | 'mechanics' | 'rules' | RulesetSectionKey | 'json';

function JsonEditor({ value, onCommit, onCancel, onDelete }: { value: unknown; onCommit: (v: unknown) => void; onCancel: () => void; onDelete?: () => void }) {
  const [text, setText] = useState(JSON.stringify(value, null, 2));
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="stack">
      <textarea className="textarea code" value={text} onChange={(e) => { setText(e.target.value); setErr(null); }} spellCheck={false} />
      {err && <div className="msg-error">{err}</div>}
      <div className="row">
        {onDelete && <Button variant="danger" size="sm" onClick={onDelete}><Trash2 size={13} /></Button>}
        <Button variant="ghost" className="grow" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" className="grow" onClick={() => { try { onCommit(JSON.parse(text)); } catch (e) { setErr((e as Error).message); } }}><Save size={14} /> Save</Button>
      </div>
    </div>
  );
}

const TEMPLATES: Record<RulesetSectionKey, unknown> = {
  abilities: { id: 'new-ability', name: 'New Ability', abbr: 'NEW', description: '' },
  skills: { id: 'new-skill', name: 'New Skill', ability: 'str', description: '' },
  species: { id: 'new-species', name: 'New Species', description: '', abilityBonuses: {}, size: 'Medium', speed: 30, traits: [{ name: 'Trait', description: '' }], languages: ['Common'] },
  classes: { id: 'new-class', name: 'New Class', description: '', hitDie: 8, primaryAbilities: ['str'], savingThrows: ['str', 'con'], armorProficiencies: [], weaponProficiencies: ['Simple weapons'], toolProficiencies: [], skillChoices: { count: 2, from: ['athletics', 'perception'] }, startingEquipment: [], startingItems: [], features: [{ level: 1, name: 'Feature', description: '' }] },
  backgrounds: { id: 'new-background', name: 'New Background', description: '', skillProficiencies: [], toolProficiencies: [], languages: 0, equipment: [], feature: { name: 'Feature', description: '' } },
  spells: { id: 'new-spell', name: 'New Spell', level: 1, school: 'Evocation', castingTime: '1 action', range: '60 feet', components: 'V, S', duration: 'Instantaneous', description: '', classes: [] },
  equipment: { id: 'new-item', name: 'New Item', category: 'gear', cost: { amount: 1, unit: 'gp' }, weight: 1, description: '' },
  monsters: { id: 'new-monster', name: 'New Monster', size: 'Medium', type: 'humanoid', alignment: 'neutral', ac: 12, hp: { average: 11, formula: '2d8+2' }, speed: '30 ft.', abilities: { str: 12, dex: 12, con: 12, int: 10, wis: 10, cha: 10 }, senses: 'passive Perception 10', languages: 'Common', cr: '1/4', xp: 50, actions: [{ name: 'Attack', description: 'Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6+1) slashing damage.', attackBonus: 3, damage: '1d6+1', damageType: 'slashing' }] },
  conditions: { id: 'new-condition', name: 'New Condition', description: '' },
};

export function RulesetEditorScreen({ id }: { id: string }) {
  const get = useRulesets((s) => s.get);
  const save = useRulesets((s) => s.save);
  const back = useUI((s) => s.back);
  const toast = useUI((s) => s.toast);
  const original = get(id);
  const [rs, setRs] = useState<Ruleset | undefined>(original ? JSON.parse(JSON.stringify(original)) : undefined);
  const [tab, setTab] = useState<Tab>('about');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<{ index: number; value: unknown } | null>(null);
  const [revise, setRevise] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [revising, setRevising] = useState(false);
  const [dirty, setDirty] = useState(false);

  if (!rs) return <><TopBar title="Ruleset" back /><Empty title="Ruleset not found" /></>;
  const set = (p: Partial<Ruleset>) => { setRs({ ...rs, ...p }); setDirty(true); };
  const persist = async () => {
    const v = validateRuleset(rs);
    if (!v.ok) { toast(v.error, 'error'); return; }
    await save(v.ruleset);
    setDirty(false);
    toast(v.warnings.length ? `Saved with ${v.warnings.length} warnings: ${v.warnings[0]}` : 'Ruleset saved', v.warnings.length ? 'info' : 'success');
  };
  const isSection = RULESET_SECTIONS.includes(tab as RulesetSectionKey);
  const list = isSection ? (rs[tab as RulesetSectionKey] as { id: string; name: string }[]) : [];
  const filtered = useMemo(() => { const ql = q.toLowerCase(); return list.map((x, i) => ({ x, i })).filter(({ x }) => !ql || x.name.toLowerCase().includes(ql) || x.id.includes(ql)); }, [list, q]);

  const commitItem = (v: any) => {
    if (!editing || !isSection) return;
    const arr = [...list];
    if (!v.id) v.id = slug(v.name || 'item');
    if (editing.index >= arr.length) arr.push(v); else arr[editing.index] = v;
    set({ [tab]: arr } as any);
    setEditing(null);
  };
  const deleteItem = () => { if (!editing || !isSection) return; set({ [tab]: list.filter((_, i) => i !== editing.index) } as any); setEditing(null); };

  const doRevise = async () => {
    if (!isSection && tab !== 'mechanics' && tab !== 'rules') return;
    setRevising(true);
    try {
      const section = tab === 'rules' ? 'mechanics' : (tab as keyof Ruleset);
      const inst = tab === 'rules' ? `Only change the coreRules array: ${instruction}` : instruction;
      const v = await reviseRulesetSection(rs, section, inst);
      set({ [section]: v } as any);
      setRevise(false); setInstruction('');
      toast('Section revised — review and save', 'success');
    } catch (e) { toast((e as Error).message, 'error'); }
    setRevising(false);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'about', label: 'About' }, { id: 'rules', label: 'Core rules' }, { id: 'mechanics', label: 'Tables' },
    ...RULESET_SECTIONS.map((s) => ({ id: s as Tab, label: s === 'species' ? rs.labels.speciesPlural : s === 'classes' ? rs.labels.classPlural : s === 'spells' ? rs.labels.spellPlural : s === 'monsters' ? rs.labels.monsterPlural : s.charAt(0).toUpperCase() + s.slice(1) })),
    { id: 'json', label: 'Raw JSON' },
  ];

  return (
    <>
      <TopBar title={rs.name} subtitle={dirty ? 'Unsaved changes' : 'Editor'} onBack={back} right={<Button variant="primary" size="sm" disabled={!dirty} onClick={persist}><Save size={13} /> Save</Button>} />
      <div className="tabs">{tabs.map((t) => <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>{t.label}</button>)}</div>
      <div className="scroll pad stack" style={{ paddingBottom: 100 }}>
        {tab === 'about' && (
          <>
            <Field label="Name"><input className="input" value={rs.name} onChange={(e) => set({ name: e.target.value })} /></Field>
            <Field label="Description"><textarea className="textarea" value={rs.description} onChange={(e) => set({ description: e.target.value })} /></Field>
            <Field label="GM guidance" hint="Genre, tone, and how the system plays. Sent to the DM every turn."><textarea className="textarea" style={{ minHeight: 160 }} value={rs.gmGuidance} onChange={(e) => set({ gmGuidance: e.target.value })} /></Field>
            <div className="eyebrow mt-8">What things are called</div>
            <div className="option-grid">
              {(Object.keys(rs.labels) as (keyof Ruleset['labels'])[]).map((k) => <Field key={k} label={k}><input className="input ui" value={rs.labels[k]} onChange={(e) => set({ labels: { ...rs.labels, [k]: e.target.value } })} /></Field>)}
            </div>
            <Field label="Version"><input className="input ui" value={rs.version} onChange={(e) => set({ version: e.target.value })} /></Field>
            <Field label="License / attribution"><textarea className="textarea ui" value={rs.license ?? ''} onChange={(e) => set({ license: e.target.value })} /></Field>
          </>
        )}
        {tab === 'rules' && (
          <>
            <p className="small dim">Prose the DM reads. Sections marked <b>core</b> are always in the DM's prompt; others are fetched on demand.</p>
            {rs.mechanics.coreRules.map((r, i) => (
              <div key={r.id} className="card flat clickable" onClick={() => setEditing({ index: i, value: r })}>
                <div className="row-between"><div className="card-title">{r.title}</div>{r.core && <span className="chip gold">core</span>}</div>
                <div className="small dim mt-8" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.text}</div>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setEditing({ index: rs.mechanics.coreRules.length, value: { id: 'new-rule', title: 'New rule', text: '', core: false } })}><Plus size={14} /> Add section</Button>
          </>
        )}
        {tab === 'mechanics' && (
          <>
            <p className="small dim">Formulas and tables. Formulas are expressions: <code>floor((score - 10) / 2)</code>, <code>10 + dex</code>, <code>1d20 + dex</code>.</p>
            <JsonEditor value={{ ...rs.mechanics, coreRules: undefined }} onCancel={() => setTab('about')} onCommit={(v: any) => { set({ mechanics: { ...rs.mechanics, ...v, coreRules: rs.mechanics.coreRules } }); toast('Tables updated'); }} />
          </>
        )}
        {isSection && (
          <>
            <div className="row">
              <div className="searchbar grow"><Search size={16} className="mute" /><input placeholder={`Search ${list.length} entries…`} value={q} onChange={(e) => setQ(e.target.value)} /></div>
              <Button variant="ghost" size="sm" onClick={() => setEditing({ index: list.length, value: TEMPLATES[tab as RulesetSectionKey] })}><Plus size={14} /></Button>
            </div>
            {filtered.slice(0, 300).map(({ x, i }) => (
              <div key={x.id + i} className="list-item clickable" style={{ cursor: 'pointer' }} onClick={() => setEditing({ index: i, value: x })}>
                <div className="grow"><div className="t">{x.name}</div><div className="s">{x.id}{(x as any).level !== undefined ? ` · level ${(x as any).level}` : ''}{(x as any).cr ? ` · CR ${(x as any).cr}` : ''}{(x as any).category ? ` · ${(x as any).category}` : ''}</div></div>
                <Code2 size={15} className="mute" />
              </div>
            ))}
            {filtered.length > 300 && <div className="tiny mute ui">Showing 300 of {filtered.length}. Refine your search.</div>}
          </>
        )}
        {tab === 'json' && (
          <JsonEditor value={rs} onCancel={() => setTab('about')} onCommit={(v) => { const val = validateRuleset(v); if (!val.ok) { toast(val.error, 'error'); return; } setRs({ ...val.ruleset, id: rs.id }); setDirty(true); toast('JSON applied'); }} />
        )}
      </div>
      {(isSection || tab === 'rules' || tab === 'mechanics') && (
        <button className="fab" style={{ background: 'linear-gradient(180deg, #b79dff, #6446d6)', color: '#100a2a' }} onClick={() => setRevise(true)} aria-label="Revise with AI"><Wand2 size={20} /></button>
      )}
      <Sheet open={!!editing} onClose={() => setEditing(null)} title={editing ? ((editing.value as any)?.name ?? (editing.value as any)?.title ?? 'Edit') : ''}>
        {editing && (tab === 'rules'
          ? <JsonEditor value={editing.value} onCancel={() => setEditing(null)} onDelete={() => { set({ mechanics: { ...rs.mechanics, coreRules: rs.mechanics.coreRules.filter((_, i) => i !== editing.index) } }); setEditing(null); }} onCommit={(v: any) => { const arr = [...rs.mechanics.coreRules]; if (editing.index >= arr.length) arr.push(v); else arr[editing.index] = v; set({ mechanics: { ...rs.mechanics, coreRules: arr } }); setEditing(null); }} />
          : <JsonEditor value={editing.value} onCancel={() => setEditing(null)} onDelete={editing.index < list.length ? deleteItem : undefined} onCommit={commitItem} />)}
      </Sheet>
      <Sheet open={revise} onClose={() => !revising && setRevise(false)} title={`Revise ${tab} with AI`}>
        <div className="stack">
          <p className="small dim">Describe the change in plain language. The model rewrites this whole section and you review before saving.</p>
          <Field label="Instruction"><textarea className="textarea" value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder={tab === 'monsters' ? 'Add six sea monsters between CR 2 and CR 8.' : tab === 'classes' ? 'Add a Gunslinger class with a firearm-focused subclass.' : 'Make healing rarer and rests less generous.'} /></Field>
          <Button variant="arcane" block disabled={revising || !instruction.trim()} onClick={doRevise}><Wand2 size={15} /> {revising ? 'Rewriting…' : 'Rewrite section'}</Button>
        </div>
      </Sheet>
    </>
  );
}
