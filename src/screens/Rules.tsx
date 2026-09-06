import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useRulesets } from '@/store/rulesets';
import { TopBar, Empty, Chip } from '@/components/ui';
import { Markdown } from '@/components/Markdown';
import { monsterBlock } from '@/engine/tools';
import { crToNumber } from '@/engine/rules';

type Tab = 'rules' | 'classes' | 'species' | 'backgrounds' | 'spells' | 'monsters' | 'equipment' | 'conditions';

export function RulesScreen({ id, section }: { id: string; section?: string }) {
  const rs = useRulesets((s) => s.get(id));
  const [tab, setTab] = useState<Tab>((section as Tab) ?? 'rules');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  if (!rs) return <><TopBar title="Rules" back /><Empty title="Ruleset not found" /></>;
  const ql = q.trim().toLowerCase();
  const match = (s: string) => !ql || s.toLowerCase().includes(ql);
  const tabs: { id: Tab; label: string }[] = [
    { id: 'rules', label: 'Rules' }, { id: 'classes', label: rs.labels.classPlural }, { id: 'species', label: rs.labels.speciesPlural }, { id: 'backgrounds', label: rs.labels.backgroundPlural },
    { id: 'spells', label: rs.labels.spellPlural }, { id: 'monsters', label: rs.labels.monsterPlural }, { id: 'equipment', label: 'Gear' }, { id: 'conditions', label: 'Conditions' },
  ];
  const D = ({ k, title, meta, children }: { k: string; title: string; meta?: string; children: React.ReactNode }) => (
    <details className="card flat" open={open === k} onToggle={(e) => (e.target as HTMLDetailsElement).open && setOpen(k)} style={{ padding: '10px 14px' }}>
      <summary style={{ cursor: 'pointer' }}><span style={{ fontWeight: 600 }}>{title}</span>{meta && <span className="tiny mute ui" style={{ marginLeft: 8 }}>{meta}</span>}</summary>
      <div className="small dim mt-8">{children}</div>
    </details>
  );
  const spells = useMemo(() => rs.spells.filter((s) => match(s.name) || match(s.description)).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name)), [rs, ql]);
  const monsters = useMemo(() => rs.monsters.filter((m) => match(m.name) || match(m.type) || (m.tags ?? []).some(match)).sort((a, b) => crToNumber(a.cr) - crToNumber(b.cr) || a.name.localeCompare(b.name)), [rs, ql]);

  return (
    <>
      <TopBar title={rs.name} subtitle="Reference" back />
      <div className="tabs">{tabs.map((t) => <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>{t.label}</button>)}</div>
      <div className="pad-x" style={{ paddingTop: 10 }}><div className="searchbar"><Search size={16} className="mute" /><input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} /></div></div>
      <div className="scroll pad stack-sm" style={{ paddingBottom: 40 }}>
        {tab === 'rules' && (
          <>
            <div className="card"><div className="eyebrow">How this system plays</div><p className="small dim mt-8">{rs.gmGuidance}</p></div>
            {rs.mechanics.coreRules.filter((r) => match(r.title) || match(r.text)).map((r) => <D key={r.id} k={r.id} title={r.title} meta={r.core ? 'core' : undefined}><Markdown text={r.text} className="prose small" /></D>)}
            <div className="card flat"><div className="eyebrow">Difficulty</div><div className="chips mt-8">{rs.mechanics.dcGuidelines.map((d) => <Chip key={d.label}>{d.label} · DC {d.dc}</Chip>)}</div></div>
          </>
        )}
        {tab === 'classes' && rs.classes.filter((c) => match(c.name)).map((c) => (
          <D key={c.id} k={c.id} title={c.name} meta={`d${c.hitDie} · ${c.primaryAbilities.map((a) => a.toUpperCase()).join('/')}`}>
            <p>{c.description}</p>
            <p className="mt-8"><b>Saves:</b> {c.savingThrows.map((s) => s.toUpperCase()).join(', ')} · <b>Skills:</b> choose {c.skillChoices.count} from {c.skillChoices.from.join(', ')}</p>
            <p className="mt-8"><b>Equipment:</b> {c.startingEquipment.join('; ')}</p>
            {c.spellcasting && <p className="mt-8"><b>Spellcasting:</b> {c.spellcasting.type} caster ({c.spellcasting.ability.toUpperCase()}), {c.spellcasting.spellList.length} spells on list</p>}
            <div className="mt-8">{c.features.map((f, i) => <div key={i} className="mt-8"><b>Level {f.level} — {f.name}.</b> {f.description}</div>)}</div>
            {c.subclasses?.map((s) => <div key={s.id} className="mt-16"><div className="eyebrow">{c.subclassLabel ?? 'Subclass'}: {s.name}</div><p className="mt-8">{s.description}</p>{s.features.map((f, i) => <div key={i} className="mt-8"><b>Level {f.level} — {f.name}.</b> {f.description}</div>)}</div>)}
          </D>
        ))}
        {tab === 'species' && rs.species.filter((s) => match(s.name)).map((s) => (
          <D key={s.id} k={s.id} title={s.name} meta={`${s.size} · ${s.speed} ft`}>
            <p>{s.description}</p>
            <p className="mt-8"><b>Bonuses:</b> {Object.entries(s.abilityBonuses).map(([k, v]) => `${k.toUpperCase()} +${v}`).join(', ') || '—'}{s.flexibleBonus ? `; +${s.flexibleBonus.amount} to ${s.flexibleBonus.count} others` : ''} · <b>Languages:</b> {s.languages.join(', ')}</p>
            {s.traits.map((t, i) => <div key={i} className="mt-8"><b>{t.name}.</b> {t.description}</div>)}
            {s.variants?.map((v) => <div key={v.id} className="mt-8"><div className="eyebrow">{v.name}</div><p>{v.description}</p>{v.traits?.map((t, i) => <div key={i} className="mt-8"><b>{t.name}.</b> {t.description}</div>)}</div>)}
          </D>
        ))}
        {tab === 'backgrounds' && rs.backgrounds.filter((b) => match(b.name)).map((b) => (
          <D key={b.id} k={b.id} title={b.name} meta={b.skillProficiencies.join(', ')}>
            <p>{b.description}</p>
            <p className="mt-8"><b>{b.feature.name}.</b> {b.feature.description}</p>
            <p className="mt-8"><b>Equipment:</b> {b.equipment.join(', ')}</p>
          </D>
        ))}
        {tab === 'spells' && spells.slice(0, 400).map((s) => (
          <D key={s.id} k={s.id} title={s.name} meta={`${s.level === 0 ? 'Cantrip' : `Level ${s.level}`} · ${s.school}${s.concentration ? ' · C' : ''}${s.ritual ? ' · R' : ''}`}>
            <p className="tiny mute ui">{s.castingTime} · {s.range} · {s.components} · {s.duration}</p>
            <p className="mt-8">{s.description}</p>
            {s.higherLevels && <p className="mt-8"><b>At higher levels.</b> {s.higherLevels}</p>}
            <p className="tiny mute ui mt-8">{s.classes.join(', ')}</p>
          </D>
        ))}
        {tab === 'monsters' && monsters.slice(0, 400).map((m) => (
          <D key={m.id} k={m.id} title={m.name} meta={`CR ${m.cr} · ${m.size} ${m.type}`}>
            {m.description && <p style={{ fontStyle: 'italic' }}>{m.description}</p>}
            <pre className="json mt-8" style={{ fontFamily: 'inherit', fontSize: 13 }}>{monsterBlock(m)}</pre>
          </D>
        ))}
        {tab === 'equipment' && rs.equipment.filter((i) => match(i.name) || match(i.category)).map((i) => (
          <D key={i.id} k={i.id} title={i.name} meta={`${i.category}${i.cost ? ` · ${i.cost.amount} ${i.cost.unit}` : ''}${i.weight ? ` · ${i.weight} lb` : ''}`}>
            {i.weapon && <p><b>{i.weapon.damage} {i.weapon.damageType}</b> · {i.weapon.properties.join(', ') || 'no properties'}{i.weapon.range ? ` · range ${i.weapon.range.normal}/${i.weapon.range.long}` : ''}</p>}
            {i.armor && <p><b>AC {i.armor.baseAc}</b> ({i.armor.category}, {i.armor.dexBonus === 'none' ? 'no DEX' : i.armor.dexBonus === 'max2' ? 'DEX max +2' : 'full DEX'}){i.armor.stealthDisadvantage ? ' · Stealth disadvantage' : ''}{i.armor.strengthRequirement ? ` · STR ${i.armor.strengthRequirement}` : ''}</p>}
            {i.shieldBonus && <p><b>+{i.shieldBonus} AC</b></p>}
            {i.description && <p className="mt-8">{i.description}</p>}
          </D>
        ))}
        {tab === 'conditions' && rs.conditions.filter((c) => match(c.name) || match(c.description)).map((c) => <D key={c.id} k={c.id} title={c.name}><p>{c.description}</p></D>)}
      </div>
    </>
  );
}
