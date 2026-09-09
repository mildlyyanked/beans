import React, { useEffect, useMemo, useState } from 'react';
import { Dices, Sparkles, Wand2, Save, FolderOpen, Trash2 } from 'lucide-react';
import type { Ruleset } from '@/types/ruleset';
import type { CharacterDraft } from '@/engine/character';
import { emptyPersona, finalAbilities, pointBuyCost, rollAbilityScores, autoAssignAbilities, ALIGNMENTS } from '@/engine/character';
import { abilityMod, findClass, findSpecies, findBackground, cantripsKnownAt, spellSlotsFor, maxSpellLevel, availableSpells, spellsKnownAt } from '@/engine/rules';
import { fmtMod } from '@/engine/dice';
import { generatePersona, generatePersonaField } from '@/engine/generators';
import { useLibrary } from '@/store/library';
import type { Persona } from '@/types/campaign';
import { Button, Field, Select, Segmented, Chip, SectionTitle, Sheet } from '@/components/ui';
import { useUI } from '@/store/ui';
import type { Character } from '@/types/campaign';

export function newDraft(rs: Ruleset, kind: 'player' | 'companion'): CharacterDraft {
  const cls = rs.classes[0];
  return {
    name: '', kind, speciesId: rs.species[0]?.id ?? '', classId: cls?.id ?? '', backgroundId: rs.backgrounds[0]?.id ?? '',
    baseAbilities: autoAssignAbilities(rs, cls), skillChoices: [], cantrips: [], spells: [], persona: emptyPersona(), level: 1,
  };
}

export function CharacterBuilder({ rs, draft, onChange, worldPremise, playerName }: { rs: Ruleset; draft: CharacterDraft; onChange: (d: CharacterDraft) => void; worldPremise?: string; playerName?: string }) {
  const toast = useUI((s) => s.toast);
  const [method, setMethod] = useState<'array' | 'points' | 'roll'>('array');
  const [genBusy, setGenBusy] = useState(false);
  const [genChars, setGenChars] = useState(0);
  const [fieldBusy, setFieldBusy] = useState<string | null>(null);
  const [libOpen, setLibOpen] = useState(false);
  const library = useLibrary();
  useEffect(() => { if (!library.loaded) void library.load(); /* eslint-disable-next-line */ }, []);
  const cls = findClass(rs, draft.classId);
  const sp = findSpecies(rs, draft.speciesId);
  const bg = findBackground(rs, draft.backgroundId);
  const abilities = finalAbilities(rs, draft);
  const set = (p: Partial<CharacterDraft>) => onChange({ ...draft, ...p });

  // Keep choices valid when class changes
  useEffect(() => {
    if (!cls) return;
    const valid = draft.skillChoices.filter((s) => cls.skillChoices.from.includes(s) && !bg?.skillProficiencies.includes(s)).slice(0, cls.skillChoices.count);
    if (valid.length !== draft.skillChoices.length) set({ skillChoices: valid });
    // eslint-disable-next-line
  }, [draft.classId, draft.backgroundId]);

  const slots = spellSlotsFor(rs, cls, draft.level ?? 1);
  const maxLvl = Math.max(1, maxSpellLevel(slots));
  const pool = cls?.spellcasting ? availableSpells(rs, cls, draft.level ?? 1, maxLvl) : [];
  const nCantrips = cls ? cantripsKnownAt(cls, draft.level ?? 1) : 0;
  const nSpells = cls?.spellcasting ? spellsKnownAt(rs, { level: draft.level ?? 1, abilities, classId: cls.id } as unknown as Character, cls) : 0;
  const canCastNow = cls?.spellcasting && (draft.level ?? 1) >= (cls.spellcasting.startsAtLevel ?? 1);

  const standardLeft = useMemo(() => {
    const used = Object.values(draft.baseAbilities);
    const arr = [...rs.mechanics.standardArray];
    for (const u of used) { const i = arr.indexOf(u); if (i >= 0) arr.splice(i, 1); }
    return arr;
  }, [draft.baseAbilities, rs]);
  const pb = rs.mechanics.pointBuy;
  const spent = pointBuyCost(rs, draft.baseAbilities);

  const generate = async () => {
    setGenBusy(true);
    try {
      setGenChars(0);
      const p = await generatePersona(rs, { name: draft.name || undefined, speciesId: draft.speciesId, classId: draft.classId, backgroundId: draft.backgroundId, kind: draft.kind, worldPremise, playerName, hint: draft.concept, onProgress: setGenChars });
      set({ name: draft.name || p.name || '', pronouns: p.pronouns, alignment: p.alignment ?? draft.alignment, persona: { personality: p.personality ?? '', ideals: p.ideals ?? '', bonds: p.bonds ?? '', flaws: p.flaws ?? '', voice: p.voice ?? '', backstory: p.backstory ?? '', appearance: p.appearance ?? '', relationship: p.relationship } });
      toast('Character written', 'success');
    } catch (e) { toast((e as Error).message, 'error'); }
    setGenBusy(false);
  };

  const generateField = async (field: keyof Persona) => {
    setFieldBusy(field);
    try {
      const value = await generatePersonaField(rs, { field, draft: { name: draft.name, speciesId: draft.speciesId, classId: draft.classId, backgroundId: draft.backgroundId, kind: draft.kind, persona: draft.persona, concept: draft.concept }, worldPremise, playerName });
      if (value) set({ persona: { ...draft.persona, [field]: value } });
    } catch (e) { toast((e as Error).message, 'error'); }
    setFieldBusy(null);
  };
  const saveToLibrary = async () => {
    if (!draft.name.trim()) { toast('Give the character a name first', 'error'); return; }
    const summary = `${findSpecies(rs, draft.speciesId)?.name ?? ''} ${findClass(rs, draft.classId)?.name ?? ''} · ${findBackground(rs, draft.backgroundId)?.name ?? ''}`;
    const existing = library.templates.find((t) => t.name === draft.name.trim() && t.rulesetId === rs.id);
    await library.save(rs.id, draft, summary, existing?.id);
    toast(existing ? `Updated "${draft.name}" in your library` : `Saved "${draft.name}" to your library`, 'success');
  };
  const loadFromLibrary = (t: (typeof library.templates)[number]) => {
    const d = t.draft as CharacterDraft;
    onChange({ ...d, kind: draft.kind, persona: { ...emptyPersona(), ...d.persona } });
    setLibOpen(false);
    toast(`Loaded ${t.name}`, 'success');
  };
  const toggle = (list: string[], id: string, max: number) => list.includes(id) ? list.filter((x) => x !== id) : list.length < max ? [...list, id] : list;

  const compatible = library.templates.filter((t) => t.rulesetId === rs.id);
  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'flex-end', gap: 6 }}>
        <Button variant="subtle" size="xs" onClick={() => setLibOpen(true)}><FolderOpen size={12} /> Load saved{compatible.length ? ` (${compatible.length})` : ''}</Button>
        <Button variant="subtle" size="xs" onClick={saveToLibrary}><Save size={12} /> Save to library</Button>
      </div>
      <Field label="Name">
        <input className="input" placeholder="What are you called?" value={draft.name} onChange={(e) => set({ name: e.target.value })} />
      </Field>
      <div className="row">
        <Field label="Pronouns"><input className="input ui" placeholder="they/them" value={draft.pronouns ?? ''} onChange={(e) => set({ pronouns: e.target.value })} /></Field>
        <Field label="Alignment"><Select className="ui" value={draft.alignment ?? ''} onChange={(e) => set({ alignment: e.target.value })}><option value="">—</option>{ALIGNMENTS.map((a) => <option key={a}>{a}</option>)}</Select></Field>
      </div>

      <SectionTitle>{rs.labels.species}</SectionTitle>
      <div className="option-grid">
        {rs.species.map((s) => (
          <div key={s.id} className={`option ${draft.speciesId === s.id ? 'on' : ''}`} onClick={() => set({ speciesId: s.id, speciesVariantId: undefined, flexibleBonusChoices: [] })}>
            <div className="t">{s.name}</div>
            <div className="s">{Object.entries(s.abilityBonuses).map(([k, v]) => `${k.toUpperCase()} +${v}`).join(', ')}{s.flexibleBonus ? ` · +${s.flexibleBonus.amount} to ${s.flexibleBonus.count} others` : ''}</div>
          </div>
        ))}
      </div>
      {sp?.variants?.length ? (
        <Field label="Lineage">
          <Select value={draft.speciesVariantId ?? ''} onChange={(e) => set({ speciesVariantId: e.target.value || undefined })}>
            <option value="">Standard {sp.name}</option>
            {sp.variants.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </Select>
        </Field>
      ) : null}
      {sp?.flexibleBonus && (
        <Field label={`Choose ${sp.flexibleBonus.count} abilities for +${sp.flexibleBonus.amount}`}>
          <div className="chips">{rs.abilities.filter((a) => !sp.flexibleBonus!.exclude?.includes(a.id)).map((a) => <Chip key={a.id} on={draft.flexibleBonusChoices?.includes(a.id)} onClick={() => set({ flexibleBonusChoices: toggle(draft.flexibleBonusChoices ?? [], a.id, sp.flexibleBonus!.count) })}>{a.abbr}</Chip>)}</div>
        </Field>
      )}
      {sp && <div className="small dim">{sp.description}</div>}

      <SectionTitle>{rs.labels.class}</SectionTitle>
      <div className="option-grid">
        {rs.classes.map((c) => (
          <div key={c.id} className={`option ${draft.classId === c.id ? 'on' : ''}`} onClick={() => set({ classId: c.id, subclassId: undefined, cantrips: [], spells: [], baseAbilities: method === 'array' ? autoAssignAbilities(rs, c) : draft.baseAbilities })}>
            <div className="t">{c.name}</div>
            <div className="s">d{c.hitDie} · {c.primaryAbilities.map((a) => a.toUpperCase()).join('/')}{c.spellcasting ? ' · Caster' : ''}</div>
          </div>
        ))}
      </div>
      {cls && <div className="small dim">{cls.description}</div>}
      {cls?.subclasses?.length && (draft.level ?? 1) >= (cls.subclassLevel ?? 99) ? (
        <Field label={cls.subclassLabel ?? 'Subclass'}>
          <Select value={draft.subclassId ?? ''} onChange={(e) => set({ subclassId: e.target.value || undefined })}><option value="">—</option>{cls.subclasses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
        </Field>
      ) : null}

      <SectionTitle>{rs.labels.background}</SectionTitle>
      <Field>
        <Select value={draft.backgroundId} onChange={(e) => set({ backgroundId: e.target.value })}>{rs.backgrounds.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</Select>
      </Field>
      {bg && <div className="small dim">{bg.description} <span className="mute">Skills: {bg.skillProficiencies.map((s) => rs.skills.find((k) => k.id === s)?.name ?? s).join(', ')}.</span></div>}

      <SectionTitle>Ability scores</SectionTitle>
      <Segmented value={method} options={[{ value: 'array', label: 'Standard' }, { value: 'points', label: 'Point buy' }, { value: 'roll', label: 'Roll' }]} onChange={(m) => {
        setMethod(m);
        if (m === 'array') set({ baseAbilities: autoAssignAbilities(rs, cls) });
        if (m === 'points') set({ baseAbilities: Object.fromEntries(rs.abilities.map((a) => [a.id, pb.min])) });
        if (m === 'roll') { const r = rollAbilityScores(rs).sort((a, b) => b - a); const order = Object.keys(autoAssignAbilities(rs, cls)); set({ baseAbilities: Object.fromEntries(order.map((id, i) => [id, r[i]])) }); }
      }} />
      {method === 'roll' && <Button variant="ghost" size="sm" onClick={() => { const r = rollAbilityScores(rs).sort((a, b) => b - a); const order = Object.keys(autoAssignAbilities(rs, cls)); set({ baseAbilities: Object.fromEntries(order.map((id, i) => [id, r[i]])) }); }}><Dices size={14} /> Roll {rs.mechanics.rollMethod}</Button>}
      {method === 'points' && <div className="row-between ui small"><span className="mute">Points spent</span><span className={spent > pb.budget ? 'ember' : 'gold'} style={{ fontWeight: 700 }}>{spent} / {pb.budget}</span></div>}
      {method === 'array' && standardLeft.length > 0 && <div className="tiny mute ui">Unassigned: {standardLeft.join(', ')}</div>}
      <div className="card flat">
        {rs.abilities.map((a) => {
          const base = draft.baseAbilities[a.id] ?? 10;
          const total = abilities[a.id];
          const bonus = total - base;
          return (
            <div key={a.id} className="score-row">
              <div>
                <div className="display" style={{ fontSize: 13, letterSpacing: '0.08em' }}>{a.name}</div>
                <div className="tiny mute ui">{cls?.primaryAbilities.includes(a.id) ? 'Primary · ' : ''}{bonus ? `+${bonus} ${rs.labels.species.toLowerCase()} bonus` : ''}</div>
              </div>
              <div className="row" style={{ gap: 12 }}>
                {method === 'array' ? (
                  <Select className="ui" value={base} onChange={(e) => { const v = parseInt(e.target.value, 10); const next = { ...draft.baseAbilities }; const other = Object.keys(next).find((k) => k !== a.id && next[k] === v); if (other) next[other] = base; next[a.id] = v; set({ baseAbilities: next }); }} style={{ width: 84, padding: '8px 30px 8px 12px' }}>
                    {rs.mechanics.standardArray.map((v, i) => <option key={i} value={v}>{v}</option>)}
                  </Select>
                ) : method === 'points' ? (
                  <div className="stepper">
                    <button disabled={base <= pb.min} onClick={() => set({ baseAbilities: { ...draft.baseAbilities, [a.id]: base - 1 } })}>−</button>
                    <span className="n">{base}</span>
                    <button disabled={base >= pb.max || spent + ((pb.costs[String(base + 1)] ?? 99) - (pb.costs[String(base)] ?? 0)) > pb.budget} onClick={() => set({ baseAbilities: { ...draft.baseAbilities, [a.id]: base + 1 } })}>+</button>
                  </div>
                ) : (
                  <span className="display" style={{ fontSize: 18, fontWeight: 700, width: 34, textAlign: 'center' }}>{base}</span>
                )}
                <div style={{ width: 54, textAlign: 'right' }}>
                  <span className="display gold" style={{ fontSize: 18, fontWeight: 700 }}>{fmtMod(abilityMod(rs, total))}</span>
                  <span className="tiny mute ui" style={{ marginLeft: 4 }}>{total}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {cls && (
        <>
          <SectionTitle>Skills · choose {cls.skillChoices.count}</SectionTitle>
          <div className="chips">
            {cls.skillChoices.from.map((id) => {
              const sk = rs.skills.find((s) => s.id === id);
              const fromBg = bg?.skillProficiencies.includes(id);
              return <Chip key={id} tone={fromBg ? 'gold' : ''} on={draft.skillChoices.includes(id)} onClick={fromBg ? undefined : () => set({ skillChoices: toggle(draft.skillChoices, id, cls.skillChoices.count) })}>{sk?.name ?? id}{fromBg ? ' ✓' : ''}</Chip>;
            })}
          </div>
        </>
      )}

      {canCastNow && (
        <>
          {nCantrips > 0 && (
            <>
              <SectionTitle>Cantrips · choose {nCantrips}</SectionTitle>
              <div className="chips">{pool.filter((s) => s.level === 0).map((s) => <Chip key={s.id} tone="arcane" on={draft.cantrips?.includes(s.id)} onClick={() => set({ cantrips: toggle(draft.cantrips ?? [], s.id, nCantrips) })}>{s.name}</Chip>)}</div>
            </>
          )}
          {nSpells > 0 && (
            <>
              <SectionTitle>{rs.labels.spellPlural} · choose {nSpells}</SectionTitle>
              <div className="chips">{pool.filter((s) => s.level > 0).map((s) => <Chip key={s.id} tone="arcane" on={draft.spells?.includes(s.id)} onClick={() => set({ spells: toggle(draft.spells ?? [], s.id, nSpells) })}>{s.name}</Chip>)}</div>
            </>
          )}
        </>
      )}

      <SectionTitle right={<Button variant="arcane" size="xs" disabled={genBusy} onClick={generate}><Wand2 size={12} /> {genBusy ? (genChars ? `Writing… ${genChars}` : 'Thinking…') : 'Write all with AI'}</Button>}>Persona</SectionTitle>
      <Field label="Direction for the AI" hint="Optional. A sentence of intent — the AI writes every field around it.">
        <textarea className="textarea" style={{ minHeight: 52 }} value={draft.concept ?? ''} onChange={(e) => set({ concept: e.target.value })} placeholder={draft.kind === 'companion' ? 'A gruff ex-soldier who owes the hero a life debt and hates magic' : 'A disgraced knight who lies about her past and collects other people\'s secrets'} />
      </Field>
      <div className="stack-sm">
        {(['personality', 'ideals', 'bonds', 'flaws', 'appearance', 'voice', 'backstory'] as const).map((k) => (
          <Field key={k} label={k}>
            <div style={{ position: 'relative' }}>
              <textarea className="textarea" style={{ minHeight: k === 'backstory' ? 120 : 52, paddingRight: 44 }} value={draft.persona[k]} onChange={(e) => set({ persona: { ...draft.persona, [k]: e.target.value } })} placeholder={bg?.suggestedCharacteristics?.[k === 'personality' ? 'personalityTraits' : k === 'ideals' ? 'ideals' : k === 'bonds' ? 'bonds' : k === 'flaws' ? 'flaws' : 'ideals']?.[0] ?? ''} />
              <button className="iconbtn arcane" style={{ position: 'absolute', right: 6, top: 6 }} disabled={fieldBusy !== null} onClick={() => generateField(k)} aria-label={`Generate ${k}`} title={`Generate ${k} with AI`}>{fieldBusy === k ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Wand2 size={14} />}</button>
            </div>
          </Field>
        ))}
        {draft.kind === 'companion' && (
          <Field label="Relationship to the hero">
            <div style={{ position: 'relative' }}>
              <textarea className="textarea" style={{ minHeight: 52, paddingRight: 44 }} value={draft.persona.relationship ?? ''} onChange={(e) => set({ persona: { ...draft.persona, relationship: e.target.value } })} />
              <button className="iconbtn arcane" style={{ position: 'absolute', right: 6, top: 6 }} disabled={fieldBusy !== null} onClick={() => generateField('relationship')} aria-label="Generate relationship">{fieldBusy === 'relationship' ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Wand2 size={14} />}</button>
            </div>
          </Field>
        )}
      </div>
      <Sheet open={libOpen} onClose={() => setLibOpen(false)} title="Character library">
        <div className="stack-sm">
          {!compatible.length && <div className="empty"><div className="ico">📜</div><div className="display" style={{ fontSize: 13, letterSpacing: '0.1em' }}>No saved characters</div><div className="small mt-8">Save any hero or companion to reuse them in other campaigns.</div></div>}
          {compatible.map((t) => (
            <div key={t.id} className="card flat row clickable" onClick={() => loadFromLibrary(t)}>
              <div className="grow"><div className="card-title">{t.name}</div><div className="tiny mute ui">{t.summary} · {t.kind}</div></div>
              <button className="iconbtn" onClick={(e) => { e.stopPropagation(); void library.remove(t.id); }}><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      </Sheet>
      <div className="tiny mute ui row" style={{ gap: 6 }}><Sparkles size={12} /> Personas power your companions' voices and give the DM hooks to pull on.</div>
    </div>
  );
}
