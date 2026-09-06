import React, { useMemo, useState } from 'react';
import { Pin, Search, Plus, BookMarked } from 'lucide-react';
import { useCampaign } from '@/store/campaign';
import { Chip, Field, Sheet, Button, Empty, SectionTitle } from '@/components/ui';
import type { Entity, EntityType } from '@/types/campaign';
import { newEntity } from '@/engine/memory';
import { maybeSummarize } from '@/engine/dm';
import { useUI } from '@/store/ui';

const TYPES: { id: EntityType | 'all' | 'chronicle' | 'canon'; label: string }[] = [
  { id: 'quest', label: 'Quests' }, { id: 'npc', label: 'People' }, { id: 'location', label: 'Places' }, { id: 'faction', label: 'Factions' },
  { id: 'item', label: 'Items' }, { id: 'lore', label: 'Lore' }, { id: 'chronicle', label: 'Chronicle' }, { id: 'canon', label: 'Canon' },
];

function EntityCard({ e, onOpen }: { e: Entity; onOpen: () => void }) {
  const campaign = useCampaign((s) => s.campaign)!;
  const loc = e.locationId ? campaign.entities[e.locationId] : undefined;
  return (
    <div className="card flat clickable" onClick={onOpen}>
      <div className="row-between">
        <div className="card-title">{e.pinned && <Pin size={12} className="gold" style={{ marginRight: 6 }} />}{e.name}</div>
        <div className="row" style={{ gap: 4 }}>
          {e.type === 'quest' && e.questStatus && <Chip tone={e.questStatus === 'active' ? 'gold' : e.questStatus === 'completed' ? 'moss' : e.questStatus === 'failed' ? 'blood' : ''}>{e.questStatus}</Chip>}
          {e.attitude && <Chip tone={/hostile/i.test(e.attitude) ? 'blood' : /friendly|devoted/i.test(e.attitude) ? 'moss' : ''}>{e.attitude}</Chip>}
          {e.status && e.status !== 'alive' && <Chip>{e.status}</Chip>}
        </div>
      </div>
      {e.summary && <div className="small dim mt-8">{e.summary}</div>}
      {e.objectives?.length ? <div className="stack-sm mt-8">{e.objectives.map((o, i) => <div key={i} className="small" style={{ textDecoration: o.done ? 'line-through' : undefined, opacity: o.done ? 0.5 : 1 }}>{o.done ? '✓' : '○'} {o.text}</div>)}</div> : null}
      {loc && <div className="tiny mute ui mt-8">at {loc.name}</div>}
    </div>
  );
}

function EntitySheet({ e, onClose }: { e: Entity | null; onClose: () => void }) {
  const upsert = useCampaign((s) => s.upsertEntity);
  const update = useCampaign((s) => s.update);
  const [draft, setDraft] = useState<Entity | null>(e);
  React.useEffect(() => setDraft(e), [e]);
  if (!draft) return <Sheet open={false} onClose={onClose}>{null}</Sheet>;
  const save = () => { upsert({ ...draft, updatedAt: Date.now() }); onClose(); };
  const remove = () => { update((c) => { const ents = { ...c.entities }; delete ents[draft.id]; return { ...c, entities: ents }; }); onClose(); };
  return (
    <Sheet open={!!e} onClose={onClose} title={draft.name || 'New entry'} right={<button className={`iconbtn ${draft.pinned ? 'gold' : ''}`} onClick={() => setDraft({ ...draft, pinned: !draft.pinned })}><Pin size={18} /></button>}>
      <div className="stack">
        <Field label="Name"><input className="input" value={draft.name} onChange={(ev) => setDraft({ ...draft, name: ev.target.value })} /></Field>
        <div className="row">
          <Field label="Type"><div className="select-wrap"><select className="select ui" value={draft.type} onChange={(ev) => setDraft({ ...draft, type: ev.target.value as EntityType })}>{['npc', 'location', 'faction', 'item', 'quest', 'lore', 'creature'].map((t) => <option key={t} value={t}>{t}</option>)}</select></div></Field>
          {draft.type === 'quest' ? (
            <Field label="Status"><div className="select-wrap"><select className="select ui" value={draft.questStatus ?? 'active'} onChange={(ev) => setDraft({ ...draft, questStatus: ev.target.value as any })}>{['active', 'completed', 'failed', 'hidden'].map((t) => <option key={t} value={t}>{t}</option>)}</select></div></Field>
          ) : (
            <Field label="Status"><input className="input ui" value={draft.status ?? ''} onChange={(ev) => setDraft({ ...draft, status: ev.target.value })} placeholder="alive, ruined…" /></Field>
          )}
        </div>
        {draft.type === 'npc' || draft.type === 'faction' ? <Field label="Attitude"><input className="input ui" value={draft.attitude ?? ''} onChange={(ev) => setDraft({ ...draft, attitude: ev.target.value })} placeholder="friendly, wary, hostile…" /></Field> : null}
        <Field label="Summary"><textarea className="textarea" style={{ minHeight: 60 }} value={draft.summary} onChange={(ev) => setDraft({ ...draft, summary: ev.target.value })} /></Field>
        <Field label="Description"><textarea className="textarea" value={draft.description} onChange={(ev) => setDraft({ ...draft, description: ev.target.value })} /></Field>
        <Field label="Facts (one per line)" hint="The DM treats these as established truth."><textarea className="textarea" value={draft.facts.join('\n')} onChange={(ev) => setDraft({ ...draft, facts: ev.target.value.split('\n').filter((x) => x.trim()) })} /></Field>
        {draft.type === 'quest' && <Field label="Objectives (one per line, prefix ✓ for done)"><textarea className="textarea" value={(draft.objectives ?? []).map((o) => `${o.done ? '✓ ' : ''}${o.text}`).join('\n')} onChange={(ev) => setDraft({ ...draft, objectives: ev.target.value.split('\n').filter((x) => x.trim()).map((l) => ({ done: l.trim().startsWith('✓'), text: l.replace(/^✓\s*/, '').trim() })) })} /></Field>}
        <Field label="Aliases (comma separated)"><input className="input ui" value={draft.aliases.join(', ')} onChange={(ev) => setDraft({ ...draft, aliases: ev.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} /></Field>
        <div className="tiny mute ui">First seen turn {draft.firstSeenTurn} · last turn {draft.lastSeenTurn} · {draft.mentions} mentions</div>
        <div className="row"><Button variant="danger" size="sm" onClick={remove}>Delete</Button><Button variant="primary" className="grow" onClick={save}>Save</Button></div>
      </div>
    </Sheet>
  );
}

export function JournalTab() {
  const campaign = useCampaign((s) => s.campaign)!;
  const update = useCampaign((s) => s.update);
  const toast = useUI((s) => s.toast);
  const [type, setType] = useState<typeof TYPES[number]['id']>('quest');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Entity | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return Object.values(campaign.entities)
      .filter((e) => (type === 'all' || e.type === type) && (!ql || e.name.toLowerCase().includes(ql) || e.summary.toLowerCase().includes(ql) || e.facts.some((f) => f.toLowerCase().includes(ql))))
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (a.type === 'quest' ? (a.questStatus === 'active' ? -1 : 1) - (b.questStatus === 'active' ? -1 : 1) : 0) || b.lastSeenTurn - a.lastSeenTurn);
  }, [campaign.entities, type, q]);

  const addNew = () => setOpen(newEntity(campaign, { name: '', type: type === 'chronicle' || type === 'canon' || type === 'all' ? 'lore' : type, questStatus: type === 'quest' ? 'active' : undefined }));

  return (
    <>
      <div className="tabs">{TYPES.map((t) => <button key={t.id} className={type === t.id ? 'on' : ''} onClick={() => setType(t.id)}>{t.label}</button>)}</div>
      <div className="scroll pad stack" style={{ paddingBottom: 90 }}>
        {type === 'chronicle' ? (
          <>
            <p className="small dim">The scribe compresses older play into these chapters so the DM keeps the thread across long campaigns.</p>
            {campaign.chronicle.length === 0 && <Empty icon={<BookMarked />} title="No chapters yet" text="Chapters are written automatically as the story grows." />}
            {campaign.chronicle.map((c) => <div key={c.id} className="card flat"><div className="eyebrow">Turns {c.fromTurn}–{c.toTurn}</div><div className="card-title mt-8">{c.title ?? 'Untitled chapter'}</div><p className="small dim mt-8">{c.text}</p></div>)}
            <Button variant="ghost" size="sm" disabled={summarizing} onClick={async () => { setSummarizing(true); await maybeSummarize(true); setSummarizing(false); toast('Chronicle updated', 'success'); }}>{summarizing ? 'Writing…' : 'Summarize recent play now'}</Button>
          </>
        ) : type === 'canon' ? (
          <>
            <p className="small dim">Established facts the DM will never contradict. Add your own to steer the world.</p>
            {campaign.world.canon.slice().reverse().map((f) => (
              <div key={f.id} className="card flat row" style={{ alignItems: 'flex-start' }}>
                <div className="grow small">{f.text}<div className="tiny mute ui mt-8">turn {f.turn}{f.category ? ` · ${f.category}` : ''}</div></div>
                <button className="iconbtn" onClick={() => update((c) => ({ ...c, world: { ...c.world, canon: c.world.canon.filter((x) => x.id !== f.id) } }))}>×</button>
              </div>
            ))}
            <CanonAdder />
          </>
        ) : (
          <>
            <div className="searchbar"><Search size={16} className="mute" /><input placeholder="Search the journal…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            {list.length === 0 && <Empty icon={<BookMarked />} title={`No ${TYPES.find((t) => t.id === type)?.label.toLowerCase()} yet`} text="The DM records entries as the story unfolds. You can add your own." />}
            {list.map((e) => <EntityCard key={e.id} e={e} onOpen={() => setOpen(e)} />)}
          </>
        )}
      </div>
      {type !== 'chronicle' && type !== 'canon' && <button className="fab" onClick={addNew} aria-label="Add entry"><Plus size={22} /></button>}
      <EntitySheet e={open} onClose={() => setOpen(null)} />
    </>
  );
}

function CanonAdder() {
  const addCanon = useCampaign((s) => s.addCanon);
  const [t, setT] = useState('');
  return (
    <div className="row">
      <input className="input grow" placeholder="Add a fact…" value={t} onChange={(e) => setT(e.target.value)} />
      <Button variant="ghost" onClick={() => { if (t.trim()) { addCanon(t.trim(), 'player'); setT(''); } }}><Plus size={16} /></Button>
    </div>
  );
}
