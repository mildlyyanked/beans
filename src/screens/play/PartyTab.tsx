import React, { useState } from 'react';
import { ArrowUpCircle, Image as ImageIcon, Heart, Shield, Zap, Backpack, Sparkles, Scroll, Minus, Plus } from 'lucide-react';
import { useCampaign } from '@/store/campaign';
import { useRulesets } from '@/store/rulesets';
import { useUI } from '@/store/ui';
import { Avatar, Bar, Button, Chip, SectionTitle, Sheet, Field, Select } from '@/components/ui';
import { abilityMod, armorClass, findClass, findSpecies, findBackground, findSpell, findItem, proficiencyBonus, skillMod, saveMod, spellSaveDc, spellAttackBonus, weaponAttacks, xpForNextLevel, allFeatures, applyLevelUp, availableSpells, spellSlotsFor, maxSpellLevel, cantripsKnownAt, spellsKnownAt } from '@/engine/rules';
import { fmtMod } from '@/engine/dice';
import { illustrate, nudgeDm } from '@/engine/dm';
import type { Character } from '@/types/campaign';

function LevelUpSheet({ ch, open, onClose }: { ch: Character; open: boolean; onClose: () => void }) {
  const campaign = useCampaign((s) => s.campaign)!;
  const rs = useRulesets((s) => s.get(campaign.rulesetId))!;
  const updateCharacter = useCampaign((s) => s.updateCharacter);
  const toast = useUI((s) => s.toast);
  const preview = applyLevelUp(rs, ch);
  const cls = findClass(rs, ch.classId);
  const [asi, setAsi] = useState<Record<string, number>>({});
  const [newCantrips, setNewCantrips] = useState<string[]>([]);
  const [newSpells, setNewSpells] = useState<string[]>([]);
  const [subclassId, setSubclassId] = useState(ch.subclassId ?? '');
  const asiSpent = Object.values(asi).reduce((a, b) => a + b, 0);
  const next = preview.character;
  const slots = spellSlotsFor(rs, cls, next.level);
  const maxLvl = Math.max(1, maxSpellLevel(slots));
  const pool = cls?.spellcasting ? availableSpells(rs, cls, next.level, maxLvl) : [];
  const cantripsAllowed = cls ? cantripsKnownAt(cls, next.level) - ch.spells.cantrips.length : 0;
  const spellsAllowed = cls?.spellcasting ? spellsKnownAt(rs, next, cls) - (cls.spellcasting.spellsKnown ? ch.spells.known.length : ch.spells.prepared.length) : 0;
  const needsSubclass = !!cls?.subclasses?.length && next.level >= (cls.subclassLevel ?? 99) && !ch.subclassId;

  const apply = () => {
    if (preview.asiPending && asiSpent !== 2) { toast('Assign both ability points', 'error'); return; }
    if (needsSubclass && !subclassId) { toast(`Choose a ${cls?.subclassLabel ?? 'subclass'}`, 'error'); return; }
    updateCharacter(ch.id, () => {
      const abilities = { ...next.abilities };
      for (const [k, v] of Object.entries(asi)) abilities[k] = Math.min(rs.mechanics.abilityScoreMax, (abilities[k] ?? 10) + v);
      const conDelta = abilityMod(rs, abilities.con ?? 10) - abilityMod(rs, ch.abilities.con ?? 10);
      const hpBump = conDelta * next.level;
      const known = [...next.spells.known, ...newSpells];
      const prepared = cls?.spellcasting?.prepared ? [...next.spells.prepared, ...newSpells] : [...next.spells.prepared, ...newSpells];
      return { ...next, abilities, maxHp: next.maxHp + hpBump, hp: next.hp + hpBump, subclassId: subclassId || next.subclassId, spells: { ...next.spells, cantrips: [...next.spells.cantrips, ...newCantrips], known, prepared } };
    });
    toast(`${ch.name} reaches level ${next.level}!`, 'success');
    onClose();
    void nudgeDm(`${ch.name} has advanced to level ${next.level}.`);
  };

  return (
    <Sheet open={open} onClose={onClose} title={`Level ${next.level} — ${ch.name}`}>
      <div className="stack">
        <div className="card glow"><div className="eyebrow">Hit points</div><div className="display" style={{ fontSize: 22, fontWeight: 700 }}>+{preview.hpGained} <span className="mute" style={{ fontSize: 14 }}>({ch.maxHp} → {next.maxHp})</span></div></div>
        {preview.newFeatures.length > 0 && (
          <div className="card stack-sm">
            <div className="eyebrow">New features</div>
            {preview.newFeatures.map((f) => <div key={f.name}><div className="card-title" style={{ fontSize: 14 }}>{f.name}</div><div className="small dim">{f.description}</div></div>)}
          </div>
        )}
        {needsSubclass && (
          <Field label={cls?.subclassLabel ?? 'Subclass'}>
            <Select value={subclassId} onChange={(e) => setSubclassId(e.target.value)}><option value="">Choose…</option>{cls!.subclasses!.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
            {subclassId && <div className="small dim mt-8">{cls!.subclasses!.find((s) => s.id === subclassId)?.description}</div>}
          </Field>
        )}
        {preview.asiPending && (
          <div className="card stack-sm">
            <div className="eyebrow">Ability score improvement · {2 - asiSpent} left</div>
            {rs.abilities.map((a) => (
              <div key={a.id} className="row-between">
                <span>{a.name} <span className="mute tiny ui">{(next.abilities[a.id] ?? 10) + (asi[a.id] ?? 0)}</span></span>
                <div className="stepper">
                  <button disabled={!asi[a.id]} onClick={() => setAsi({ ...asi, [a.id]: (asi[a.id] ?? 0) - 1 })}><Minus size={14} /></button>
                  <span className="n">{asi[a.id] ?? 0}</span>
                  <button disabled={asiSpent >= 2 || (next.abilities[a.id] ?? 10) + (asi[a.id] ?? 0) >= rs.mechanics.abilityScoreMax} onClick={() => setAsi({ ...asi, [a.id]: (asi[a.id] ?? 0) + 1 })}><Plus size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        {cantripsAllowed > 0 && (
          <div className="card stack-sm">
            <div className="eyebrow">New cantrips · choose {cantripsAllowed}</div>
            <div className="chips">{pool.filter((s) => s.level === 0 && !ch.spells.cantrips.includes(s.id)).map((s) => <Chip key={s.id} tone="arcane" on={newCantrips.includes(s.id)} onClick={() => setNewCantrips((c) => (c.includes(s.id) ? c.filter((x) => x !== s.id) : c.length < cantripsAllowed ? [...c, s.id] : c))}>{s.name}</Chip>)}</div>
          </div>
        )}
        {spellsAllowed > 0 && (
          <div className="card stack-sm">
            <div className="eyebrow">New {rs.labels.spellPlural.toLowerCase()} · choose {spellsAllowed}</div>
            <div className="chips">{pool.filter((s) => s.level > 0 && !ch.spells.known.includes(s.id) && !ch.spells.prepared.includes(s.id)).map((s) => <Chip key={s.id} tone="arcane" on={newSpells.includes(s.id)} onClick={() => setNewSpells((c) => (c.includes(s.id) ? c.filter((x) => x !== s.id) : c.length < spellsAllowed ? [...c, s.id] : c))}>{s.name} <span className="mute">L{s.level}</span></Chip>)}</div>
          </div>
        )}
        <Button variant="primary" block onClick={apply}><ArrowUpCircle size={16} /> Level up</Button>
      </div>
    </Sheet>
  );
}

function CharacterSheet({ ch }: { ch: Character }) {
  const campaign = useCampaign((s) => s.campaign)!;
  const rs = useRulesets((s) => s.get(campaign.rulesetId))!;
  const updateCharacter = useCampaign((s) => s.updateCharacter);
  const toast = useUI((s) => s.toast);
  const [tab, setTab] = useState<'stats' | 'gear' | 'spells' | 'story'>('stats');
  const [levelUp, setLevelUp] = useState(false);
  const [portraitBusy, setPortraitBusy] = useState(false);
  const cls = findClass(rs, ch.classId);
  const sp = findSpecies(rs, ch.speciesId);
  const bg = findBackground(rs, ch.backgroundId);
  const { ac, source } = armorClass(rs, ch);
  const nextXp = xpForNextLevel(rs, ch.level);
  const canLevel = nextXp !== null && ch.xp >= nextXp;
  const prevXp = rs.mechanics.xpThresholds[ch.level - 1] ?? 0;
  const dc = spellSaveDc(rs, ch);
  const atkBonus = spellAttackBonus(rs, ch);

  const portrait = async () => {
    setPortraitBusy(true);
    const id = await illustrate(`Character portrait of ${ch.name}, a ${sp?.name ?? ''} ${cls?.name ?? ''}. ${ch.persona.appearance || ''} Head-and-shoulders, looking at the viewer.`, 'portrait', { silent: true });
    if (id) { updateCharacter(ch.id, (c) => ({ ...c, portraitImageId: id })); toast('Portrait painted', 'success'); } else toast('Portrait failed — check your image model', 'error');
    setPortraitBusy(false);
  };

  const toggleEquip = (invId: string) => updateCharacter(ch.id, (c) => ({ ...c, inventory: c.inventory.map((i) => (i.id === invId ? { ...i, equipped: !i.equipped } : i)) }));
  const togglePrepared = (spellId: string) => updateCharacter(ch.id, (c) => ({ ...c, spells: { ...c.spells, prepared: c.spells.prepared.includes(spellId) ? c.spells.prepared.filter((x) => x !== spellId) : [...c.spells.prepared, spellId] } }));

  return (
    <div className="stack">
      <div className="row" style={{ alignItems: 'flex-start', gap: 14 }}>
        <div style={{ position: 'relative' }}>
          <Avatar name={ch.name} imageId={ch.portraitImageId} size="xl" />
          <button className="iconbtn" style={{ position: 'absolute', right: -6, bottom: -6, background: 'var(--bg-3)', border: '1px solid var(--line-strong)' }} onClick={portrait} disabled={portraitBusy} aria-label="Generate portrait">{portraitBusy ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <ImageIcon size={14} />}</button>
        </div>
        <div className="grow">
          <h2>{ch.name}</h2>
          <div className="small dim">{sp?.name} {cls?.name}{ch.subclassId ? ` (${cls?.subclasses?.find((s) => s.id === ch.subclassId)?.name})` : ''} · {bg?.name}</div>
          <div className="tiny mute ui">{ch.kind === 'player' ? 'Your character' : 'Companion'}{ch.alignment ? ` · ${ch.alignment}` : ''}{ch.pronouns ? ` · ${ch.pronouns}` : ''}</div>
          <div className="row mt-8" style={{ gap: 6 }}>
            <Chip tone="gold">Level {ch.level}</Chip>
            {canLevel && <Button variant="primary" size="xs" onClick={() => setLevelUp(true)}><ArrowUpCircle size={12} /> Level up!</Button>}
          </div>
        </div>
      </div>
      <div>
        <div className="row-between tiny ui mute mb-8"><span>XP {ch.xp}{nextXp !== null ? ` / ${nextXp}` : ' · max level'}</span>{ch.inspiration && <span className="gold">✦ Inspiration</span>}</div>
        <Bar kind="xp" value={ch.xp - prevXp} max={(nextXp ?? ch.xp) - prevXp} />
      </div>
      <div className="vitals">
        <div className="vital"><div className="v" style={{ color: ch.hp <= ch.maxHp / 4 ? '#ff8b90' : undefined }}>{ch.hp}<span className="mute" style={{ fontSize: 12 }}>/{ch.maxHp}</span></div><div className="k">HP{ch.tempHp ? ` +${ch.tempHp}` : ''}</div></div>
        <div className="vital"><div className="v">{ac}</div><div className="k">AC</div></div>
        <div className="vital"><div className="v">{fmtMod(abilityMod(rs, ch.abilities.dex ?? 10))}</div><div className="k">Init</div></div>
        <div className="vital"><div className="v">{ch.speed}</div><div className="k">Speed</div></div>
      </div>
      <Bar kind="hp" value={ch.hp} max={ch.maxHp} />
      {ch.conditions.length > 0 && <div className="chips">{ch.conditions.map((c) => <Chip key={c} tone="blood">{c}</Chip>)}</div>}
      {ch.hp <= 0 && <div className="card flat row-between"><span className="ember display" style={{ fontSize: 12, letterSpacing: '0.1em' }}>DYING</span><span className="ui small">Saves: {'●'.repeat(ch.deathSaves.successes)}{'○'.repeat(3 - ch.deathSaves.successes)} · Fails: {'●'.repeat(ch.deathSaves.failures)}{'○'.repeat(3 - ch.deathSaves.failures)}</span></div>}

      <div className="seg">
        {(['stats', 'gear', 'spells', 'story'] as const).filter((t) => t !== 'spells' || cls?.spellcasting).map((t) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      {tab === 'stats' && (
        <>
          <div className="stat-grid">
            {rs.abilities.map((a) => (
              <div key={a.id} className={`stat ${ch.proficiencies.saves.includes(a.id) ? 'prof' : ''}`}>
                <div className="abbr">{a.abbr}</div>
                <div className="mod">{fmtMod(abilityMod(rs, ch.abilities[a.id] ?? 10))}</div>
                <div className="score">{ch.abilities[a.id] ?? 10}</div>
              </div>
            ))}
          </div>
          <div className="tiny mute ui">Saves: {rs.abilities.map((a) => `${a.abbr} ${fmtMod(saveMod(rs, ch, a.id))}${ch.proficiencies.saves.includes(a.id) ? '*' : ''}`).join(' · ')} · Proficiency {fmtMod(proficiencyBonus(rs, ch.level))}</div>
          <SectionTitle>Skills</SectionTitle>
          <div className="card flat" style={{ padding: '4px 14px' }}>
            {rs.skills.map((s) => {
              const prof = ch.proficiencies.skills.includes(s.id);
              const exp = ch.proficiencies.expertise?.includes(s.id);
              return <div key={s.id} className="kv"><span className={prof ? '' : 'mute'}>{exp ? '◆ ' : prof ? '● ' : '○ '}{s.name} <span className="tiny mute ui">{s.ability.toUpperCase()}</span></span><span className={`v display ${prof ? 'gold' : ''}`} style={{ fontWeight: 700 }}>{fmtMod(skillMod(rs, ch, s.id))}</span></div>;
            })}
          </div>
          <SectionTitle>Attacks</SectionTitle>
          <div className="card flat" style={{ padding: '4px 14px' }}>
            {weaponAttacks(rs, ch).map((a) => <div key={a.name} className="kv"><span>{a.name}</span><span className="v ui small"><b className="gold">{fmtMod(a.attackBonus)}</b> · {a.damage} {a.damageType}{a.range ? ` · ${a.range}` : ''}</span></div>)}
            {!weaponAttacks(rs, ch).length && <div className="kv mute">Unarmed strike · 1 + STR bludgeoning</div>}
          </div>
          <SectionTitle>Features & traits</SectionTitle>
          <div className="stack-sm">
            {allFeatures(rs, ch).map((f, i) => <details key={i} className="card flat" style={{ padding: '10px 14px' }}><summary style={{ cursor: 'pointer', fontWeight: 600 }}>{f.name} <span className="tiny mute ui">{f.source}</span></summary><div className="small dim mt-8">{f.description}</div></details>)}
          </div>
          <SectionTitle>Proficiencies</SectionTitle>
          <div className="small dim">
            {ch.proficiencies.armor.length > 0 && <div><b className="mute ui tiny">ARMOR</b> {ch.proficiencies.armor.join(', ')}</div>}
            {ch.proficiencies.weapons.length > 0 && <div><b className="mute ui tiny">WEAPONS</b> {ch.proficiencies.weapons.join(', ')}</div>}
            {ch.proficiencies.tools.length > 0 && <div><b className="mute ui tiny">TOOLS</b> {ch.proficiencies.tools.join(', ')}</div>}
            {ch.proficiencies.languages.length > 0 && <div><b className="mute ui tiny">LANGUAGES</b> {ch.proficiencies.languages.join(', ')}</div>}
          </div>
        </>
      )}

      {tab === 'gear' && (
        <>
          <div className="row-between"><span className="eyebrow">Coin</span><span className="display gold" style={{ fontSize: 18, fontWeight: 700 }}>{ch.gold} {rs.labels.currency}</span></div>
          <div className="tiny mute ui">AC {ac} from {source}. Tap an item to equip or stow it.</div>
          <div className="card flat" style={{ padding: '4px 14px' }}>
            {ch.inventory.map((i) => {
              const it = i.itemId ? findItem(rs, i.itemId) : undefined;
              const equippable = !!(it?.weapon || it?.armor || it?.shieldBonus);
              return (
                <div key={i.id} className="list-item" onClick={() => equippable && toggleEquip(i.id)} style={{ cursor: equippable ? 'pointer' : 'default' }}>
                  <div className="grow">
                    <div className="t">{i.name}{i.qty > 1 ? <span className="mute"> ×{i.qty}</span> : null}</div>
                    <div className="s">{it?.weapon ? `${it.weapon.damage} ${it.weapon.damageType} · ${it.weapon.properties.join(', ')}` : it?.armor ? `AC ${it.armor.baseAc} (${it.armor.category})` : it?.shieldBonus ? `+${it.shieldBonus} AC` : i.description ?? it?.description ?? i.category ?? ''}</div>
                  </div>
                  {equippable && <Chip tone={i.equipped ? 'gold' : ''}>{i.equipped ? 'Equipped' : 'Stowed'}</Chip>}
                </div>
              );
            })}
            {!ch.inventory.length && <div className="kv mute">Nothing but the clothes on your back.</div>}
          </div>
        </>
      )}

      {tab === 'spells' && cls?.spellcasting && (
        <>
          <div className="vitals" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="vital"><div className="v">{dc}</div><div className="k">Save DC</div></div>
            <div className="vital"><div className="v">{atkBonus !== null ? fmtMod(atkBonus) : '—'}</div><div className="k">Attack</div></div>
            <div className="vital"><div className="v">{cls.spellcasting.ability.toUpperCase()}</div><div className="k">Ability</div></div>
          </div>
          {Object.keys(ch.spells.slots).length > 0 && (
            <div className="card flat stack-sm">
              <div className="eyebrow">Spell slots</div>
              {Object.entries(ch.spells.slots).map(([lvl, s]) => (
                <div key={lvl} className="row-between">
                  <span className="small">Level {lvl}</span>
                  <div className="row" style={{ gap: 5 }}>
                    {Array.from({ length: s.max }).map((_, i) => <span key={i} onClick={() => updateCharacter(ch.id, (c) => ({ ...c, spells: { ...c.spells, slots: { ...c.spells.slots, [lvl]: { ...s, used: i < s.used ? i : i + 1 } } } }))} style={{ width: 16, height: 16, borderRadius: 4, cursor: 'pointer', background: i < s.max - s.used ? 'linear-gradient(180deg, var(--arcane-2), var(--arcane))' : 'rgba(255,255,255,0.08)', border: '1px solid var(--line-strong)' }} />)}
                  </div>
                </div>
              ))}
              <div className="tiny mute ui">Tap a slot to expend or restore it.</div>
            </div>
          )}
          <SectionTitle>Cantrips</SectionTitle>
          <div className="stack-sm">{ch.spells.cantrips.map((id) => { const s = findSpell(rs, id); return s ? <details key={id} className="card flat" style={{ padding: '10px 14px' }}><summary style={{ cursor: 'pointer', fontWeight: 600 }}>{s.name} <span className="tiny mute ui">{s.school} · {s.castingTime}</span></summary><div className="small dim mt-8">{s.description}</div></details> : null; })}</div>
          <SectionTitle>{cls.spellcasting.prepared ? 'Prepared & known' : 'Known'}</SectionTitle>
          <div className="stack-sm">
            {Array.from(new Set([...ch.spells.known, ...ch.spells.prepared])).map((id) => { const s = findSpell(rs, id); if (!s) return null; const prep = ch.spells.prepared.includes(id); return (
              <details key={id} className="card flat" style={{ padding: '10px 14px', borderColor: prep ? 'rgba(139,108,255,0.4)' : undefined }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{s.name} <span className="tiny mute ui">L{s.level} {s.school}{s.concentration ? ' · conc.' : ''}{s.ritual ? ' · ritual' : ''}</span></summary>
                <div className="small dim mt-8">{s.castingTime} · {s.range} · {s.duration}</div>
                <div className="small dim mt-8">{s.description}</div>
                {s.higherLevels && <div className="tiny mute ui mt-8">Higher levels: {s.higherLevels}</div>}
                {cls.spellcasting?.prepared && <Button variant="subtle" size="xs" className="mt-8" onClick={() => togglePrepared(id)}>{prep ? 'Unprepare' : 'Prepare'}</Button>}
              </details>
            ); })}
          </div>
        </>
      )}

      {tab === 'story' && (
        <div className="stack-sm">
          {(['appearance', 'personality', 'ideals', 'bonds', 'flaws', 'voice', 'relationship', 'backstory'] as const).map((k) => ch.persona[k] ? <div key={k} className="card flat"><div className="eyebrow">{k}</div><div className="small mt-8">{ch.persona[k]}</div></div> : null)}
          <Field label="Notes"><textarea className="textarea" value={ch.notes} onChange={(e) => updateCharacter(ch.id, (c) => ({ ...c, notes: e.target.value }))} placeholder="Private notes about this character…" /></Field>
        </div>
      )}
      <LevelUpSheet ch={ch} open={levelUp} onClose={() => setLevelUp(false)} />
    </div>
  );
}

export function PartyTab() {
  const campaign = useCampaign((s) => s.campaign)!;
  const party = campaign.partyIds.map((id) => campaign.characters[id]).filter(Boolean);
  const [sel, setSel] = useState(campaign.playerCharacterId);
  const ch = campaign.characters[sel] ?? party[0];
  return (
    <div className="scroll">
      {party.length > 1 && (
        <div className="tabs">{party.map((p) => <button key={p.id} className={p.id === ch.id ? 'on' : ''} onClick={() => setSel(p.id)}>{p.name}</button>)}</div>
      )}
      <div className="pad" style={{ paddingBottom: 40 }}>{ch && <CharacterSheet ch={ch} />}</div>
    </div>
  );
}
