import React, { useMemo, useState } from 'react';
import { Wand2, Sparkles, Plus, Trash2, Users, Globe2, Swords, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { useUI } from '@/store/ui';
import { useRulesets } from '@/store/rulesets';
import { useCampaign } from '@/store/campaign';
import { useSettings } from '@/store/settings';
import { TopBar, Button, Field, Select, Chip, Segmented, Toggle, SectionTitle, Sheet, Avatar } from '@/components/ui';
import { CharacterBuilder, newDraft } from '@/components/CharacterBuilder';
import { generateWorld, suggestCompanions, generatePersona, type WorldSeed } from '@/engine/generators';
import { buildCharacter, autoChoices, autoAssignAbilities, type CharacterDraft } from '@/engine/character';
import { findClass, findSpecies, findBackground } from '@/engine/rules';
import { newEntity } from '@/engine/memory';
import { openCampaign, illustrate } from '@/engine/dm';
import type { Campaign, Entity } from '@/types/campaign';
import { uid } from '@/util/id';

const TONES = ['Heroic', 'Grim', 'Whimsical', 'Horror', 'Political intrigue', 'Swashbuckling', 'Mystery', 'Epic', 'Cozy', 'Weird'];
const IDEAS = [
  'A frontier town where the dead have stopped staying buried, and the only priest has gone missing.',
  'A heist against a dragon\'s bank in a city built inside its skull.',
  'The last lighthouse on a coast where the sea has begun to whisper names.',
  'A war has ended and the veterans are coming home to a kingdom that has moved on without them.',
  'A grand tournament where every champion is secretly a spy.',
];

type Step = 0 | 1 | 2 | 3;

export function NewCampaignScreen() {
  const go = useUI((s) => s.go);
  const back = useUI((s) => s.back);
  const toast = useUI((s) => s.toast);
  const builtIn = useRulesets((s) => s.builtIn);
  const custom = useRulesets((s) => s.custom);
  const rulesets = useMemo(() => [...builtIn, ...custom], [builtIn, custom]);
  const apiKey = useSettings((s) => s.apiKey);
  const [step, setStep] = useState<Step>(0);
  const [rsId, setRsId] = useState(rulesets[0]?.id ?? 'srd-5e');
  const rs = useRulesets((s) => s.get(rsId))!;

  // World
  const [idea, setIdea] = useState('');
  const [tones, setTones] = useState<string[]>(['Heroic']);
  const [rating, setRating] = useState<'pg' | 'pg13' | 'r'>('pg13');
  const [seed, setSeed] = useState<WorldSeed | null>(null);
  const [name, setName] = useState('');
  const [forging, setForging] = useState(false);
  const [forgeChars, setForgeChars] = useState(0);
  const [manual, setManual] = useState(false);
  const [manualWorld, setManualWorld] = useState({ premise: '', setting: '', openingHook: '', startingLocation: '' });

  // Hero
  const [hero, setHero] = useState<CharacterDraft>(() => newDraft(rs, 'player'));
  // Companions
  const [companions, setCompanions] = useState<CharacterDraft[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  // Options
  const [opts, setOpts] = useState<Campaign['settings']>({ autoRoll: true, companionsSpeak: true, autoIllustrate: false, narrationLength: 'standard', difficulty: 'normal', contextWindowMessages: 30 });
  const [starting, setStarting] = useState(false);

  const forge = async () => {
    if (!apiKey) { toast('Add your OpenRouter key in Settings first', 'error'); return; }
    setForging(true); setForgeChars(0);
    try {
      const s = await generateWorld(rs, idea, { tone: tones.join(', '), contentRating: rating, onProgress: setForgeChars });
      setSeed(s);
      if (!name) setName(s.suggestedName ?? '');
      toast('World forged', 'success');
    } catch (e) { toast((e as Error).message, 'error'); }
    setForging(false);
  };

  const worldReady = manual ? manualWorld.premise.trim().length > 0 : !!seed;
  const heroReady = hero.name.trim().length > 0 && hero.skillChoices.length >= (findClass(rs, hero.classId)?.skillChoices.count ?? 0);

  const suggest = async () => {
    if (!apiKey) { toast('Add your OpenRouter key in Settings first', 'error'); return; }
    setSuggesting(true);
    try {
      const premise = manual ? manualWorld.premise : seed?.premise ?? '';
      const setting = manual ? manualWorld.setting : seed?.setting ?? '';
      const tone = tones.join(', ');
      const ideas = await suggestCompanions(rs, { premise, setting, tone }, { name: hero.name, classId: hero.classId, speciesId: hero.speciesId }, 2);
      const drafts: CharacterDraft[] = [];
      for (const c of ideas) {
        const cls = findClass(rs, c.classId);
        const bg = findBackground(rs, c.backgroundId);
        const base = autoAssignAbilities(rs, cls);
        const auto = autoChoices(rs, cls, bg, 1, base);
        const d: CharacterDraft = { ...newDraft(rs, 'companion'), name: c.name, speciesId: c.speciesId, classId: c.classId, backgroundId: c.backgroundId, baseAbilities: base, ...auto };
        try {
          const p = await generatePersona(rs, { name: c.name, speciesId: c.speciesId, classId: c.classId, backgroundId: c.backgroundId, kind: 'companion', worldPremise: premise, hint: c.hint, playerName: hero.name });
          d.pronouns = p.pronouns; d.alignment = p.alignment;
          d.persona = { personality: p.personality ?? '', ideals: p.ideals ?? '', bonds: p.bonds ?? '', flaws: p.flaws ?? '', voice: p.voice ?? '', backstory: p.backstory ?? '', appearance: p.appearance ?? '', relationship: p.relationship ?? c.hint };
        } catch { d.persona.relationship = c.hint; }
        drafts.push(d);
      }
      setCompanions((cur) => [...cur, ...drafts].slice(0, 3));
      toast(`${drafts.length} companions joined`, 'success');
    } catch (e) { toast((e as Error).message, 'error'); }
    setSuggesting(false);
  };

  const addBlankCompanion = () => {
    const cls = rs.classes[Math.floor(Math.random() * rs.classes.length)];
    const bg = rs.backgrounds[Math.floor(Math.random() * rs.backgrounds.length)];
    const base = autoAssignAbilities(rs, cls);
    const d: CharacterDraft = { ...newDraft(rs, 'companion'), classId: cls.id, backgroundId: bg.id, speciesId: rs.species[Math.floor(Math.random() * rs.species.length)].id, baseAbilities: base, ...autoChoices(rs, cls, bg, 1, base) };
    setCompanions((c) => [...c, d]);
    setEditing(companions.length);
  };

  const begin = async () => {
    setStarting(true);
    try {
      const pc = buildCharacter(rs, hero);
      const comps = companions.filter((c) => c.name.trim()).map((c) => buildCharacter(rs, c));
      const characters = Object.fromEntries([pc, ...comps].map((c) => [c.id, c]));
      const world = manual
        ? { premise: manualWorld.premise, setting: manualWorld.setting, tone: tones.join(', '), themes: [], contentRating: rating, openingHook: manualWorld.openingHook, canon: [], calendar: { day: 1, timeOfDay: 'morning', elapsedMinutes: 480 }, bible: '', secrets: [] }
        : { premise: seed!.premise, setting: seed!.setting, tone: seed!.tone || tones.join(', '), themes: seed!.themes ?? [], contentRating: rating, openingHook: seed!.openingHook, canon: [], calendar: { day: 1, timeOfDay: 'morning', elapsedMinutes: 480 }, bible: seed!.bible ?? '', secrets: seed!.secrets ?? [] };
      const id = uid('camp');
      const base: Campaign = {
        id, name: name.trim() || seed?.suggestedName || 'Untitled Campaign', rulesetId: rs.id, createdAt: Date.now(), updatedAt: Date.now(), turn: 0,
        world, scene: { locationName: manual ? manualWorld.startingLocation : seed?.startingLocation?.name ?? '', description: manual ? '' : seed?.startingLocation?.description ?? '', presentEntityIds: [], timeOfDay: 'morning', weather: '', mood: '', situation: '' },
        characters, playerCharacterId: pc.id, partyIds: [pc.id, ...comps.map((c) => c.id)], entities: {}, chronicle: [], messages: [], combat: null, pendingRoll: null, settings: opts, images: {},
      };
      // Seed entities
      const ents: Entity[] = [];
      if (!manual && seed) {
        const loc = newEntity(base, { name: seed.startingLocation?.name ?? 'Starting point', type: 'location', summary: seed.startingLocation?.description ?? '', pinned: true });
        ents.push(loc); base.scene.locationId = loc.id;
        for (const n of seed.npcs ?? []) ents.push(newEntity(base, { name: n.name, type: 'npc', summary: n.summary, description: n.description, attitude: n.attitude, status: 'alive' }));
        for (const f of seed.factions ?? []) ents.push(newEntity(base, { name: f.name, type: 'faction', summary: f.summary }));
        for (const q of seed.quests ?? []) ents.push(newEntity(base, { name: q.name, type: 'quest', summary: q.summary, questStatus: 'active', objectives: (q.objectives ?? []).map((t) => ({ text: t, done: false })), pinned: true }));
      } else if (manualWorld.startingLocation) {
        const loc = newEntity(base, { name: manualWorld.startingLocation, type: 'location', summary: '', pinned: true }); ents.push(loc); base.scene.locationId = loc.id;
      }
      for (const e of ents) base.entities[e.id] = e;
      await useCampaign.getState().create(base);
      go({ name: 'play' });
      void openCampaign().then(() => { if (opts.autoIllustrate) void illustrate(`${base.scene.locationName}: ${base.scene.description}. ${world.openingHook}`, 'scene', { attachTo: 'cover' }); });
    } catch (e) { toast((e as Error).message, 'error'); setStarting(false); }
  };

  const stepMeta = [
    { icon: <Globe2 size={16} />, title: 'World' },
    { icon: <Swords size={16} />, title: 'Hero' },
    { icon: <Users size={16} />, title: 'Companions' },
    { icon: <SlidersHorizontal size={16} />, title: 'Table rules' },
  ];

  return (
    <>
      <TopBar title="New Campaign" subtitle={`Step ${step + 1} of 4 · ${stepMeta[step].title}`} onBack={() => (step === 0 ? back() : setStep((step - 1) as Step))} />
      <div className="steps">{[0, 1, 2, 3].map((i) => <i key={i} className={i <= step ? 'done' : ''} />)}</div>
      <div className="scroll pad stack" style={{ paddingBottom: 100 }}>
        {step === 0 && (
          <>
            <Field label="Ruleset">
              <Select value={rsId} onChange={(e) => { setRsId(e.target.value); const r = useRulesets.getState().get(e.target.value)!; setHero(newDraft(r, 'player')); setCompanions([]); }}>
                {rulesets.map((r) => <option key={r.id} value={r.id}>{r.name}{r.builtIn ? '' : ' (custom)'}</option>)}
              </Select>
            </Field>
            <div className="seg"><button className={!manual ? 'on' : ''} onClick={() => setManual(false)}>Forge with AI</button><button className={manual ? 'on' : ''} onClick={() => setManual(true)}>Write my own</button></div>
            {!manual ? (
              <>
                <Field label="Campaign idea" hint="A sentence or a paragraph. Or leave blank and let the DM surprise you.">
                  <textarea className="textarea" placeholder={IDEAS[0]} value={idea} onChange={(e) => setIdea(e.target.value)} />
                </Field>
                <div className="chips">{IDEAS.map((i, n) => <Chip key={n} onClick={() => setIdea(i)}>{i.slice(0, 34)}…</Chip>)}</div>
                <Field label="Tone"><div className="chips">{TONES.map((t) => <Chip key={t} on={tones.includes(t)} onClick={() => setTones((c) => (c.includes(t) ? c.filter((x) => x !== t) : [...c, t].slice(-3)))}>{t}</Chip>)}</div></Field>
                <Field label="Content rating"><Segmented value={rating} options={[{ value: 'pg', label: 'PG' }, { value: 'pg13', label: 'PG-13' }, { value: 'r', label: 'Mature' }]} onChange={setRating} /></Field>
                <Button variant="arcane" block disabled={forging} onClick={forge}><Wand2 size={16} /> {forging ? (forgeChars ? `Forging… ${(forgeChars / 1000).toFixed(1)}k` : 'Contacting the model…') : seed ? 'Forge again' : 'Forge world'}</Button>
                {seed && (
                  <div className="card glow stack-sm">
                    <Field label="Campaign name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
                    <div className="eyebrow mt-8">Premise</div>
                    <p>{seed.premise}</p>
                    <div className="eyebrow mt-8">Setting</div>
                    <p className="small dim">{seed.setting}</p>
                    <div className="eyebrow mt-8">Opening</div>
                    <p className="small dim" style={{ fontStyle: 'italic' }}>{seed.openingHook}</p>
                    <div className="chips mt-8">{(seed.themes ?? []).map((t) => <Chip key={t} tone="gold">{t}</Chip>)}</div>
                    <div className="tiny mute ui mt-8">{seed.npcs?.length ?? 0} NPCs · {seed.factions?.length ?? 0} factions · {seed.quests?.length ?? 0} quests seeded · {seed.secrets?.length ?? 0} DM secrets</div>
                  </div>
                )}
              </>
            ) : (
              <>
                <Field label="Campaign name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="The Ashen Crown" /></Field>
                <Field label="Premise"><textarea className="textarea" value={manualWorld.premise} onChange={(e) => setManualWorld({ ...manualWorld, premise: e.target.value })} placeholder="What is this story about?" /></Field>
                <Field label="Setting"><textarea className="textarea" value={manualWorld.setting} onChange={(e) => setManualWorld({ ...manualWorld, setting: e.target.value })} placeholder="The world, its texture, its rules" /></Field>
                <Field label="Opening hook"><textarea className="textarea" value={manualWorld.openingHook} onChange={(e) => setManualWorld({ ...manualWorld, openingHook: e.target.value })} placeholder="The first scene, in motion" /></Field>
                <Field label="Starting location"><input className="input" value={manualWorld.startingLocation} onChange={(e) => setManualWorld({ ...manualWorld, startingLocation: e.target.value })} placeholder="The Drowned Bell tavern" /></Field>
                <Field label="Content rating"><Segmented value={rating} options={[{ value: 'pg', label: 'PG' }, { value: 'pg13', label: 'PG-13' }, { value: 'r', label: 'Mature' }]} onChange={setRating} /></Field>
              </>
            )}
          </>
        )}

        {step === 1 && <CharacterBuilder rs={rs} draft={hero} onChange={setHero} worldPremise={manual ? manualWorld.premise : seed?.premise} />}

        {step === 2 && (
          <>
            <p className="dim">Companions are AI-voiced party members with their own personalities. They banter, advise, disagree, and fight beside you. Add up to three, or go it alone.</p>
            <div className="row">
              <Button variant="arcane" className="grow" disabled={suggesting || companions.length >= 3} onClick={suggest}><Sparkles size={15} /> {suggesting ? 'Recruiting…' : 'Suggest companions'}</Button>
              <Button variant="ghost" disabled={companions.length >= 3} onClick={addBlankCompanion}><Plus size={16} /></Button>
            </div>
            <div className="stack-sm">
              {companions.map((c, i) => (
                <div key={i} className="card row clickable" onClick={() => setEditing(i)}>
                  <Avatar name={c.name || '?'} size="lg" />
                  <div className="grow">
                    <div className="card-title">{c.name || 'Unnamed companion'}</div>
                    <div className="tiny mute ui">{findSpecies(rs, c.speciesId)?.name} {findClass(rs, c.classId)?.name} · {findBackground(rs, c.backgroundId)?.name}</div>
                    {c.persona.relationship && <div className="small dim mt-8" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.persona.relationship}</div>}
                  </div>
                  <button className="iconbtn" onClick={(e) => { e.stopPropagation(); setCompanions((cs) => cs.filter((_, j) => j !== i)); }}><Trash2 size={16} /></button>
                </div>
              ))}
              {!companions.length && <div className="empty"><div className="ico">🛡️</div><div className="display" style={{ fontSize: 14, letterSpacing: '0.08em' }}>No companions yet</div><div className="small mt-8">A lone hero's tale is a fine tale.</div></div>}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="card stack-sm">
              <Toggle on={opts.autoRoll} onChange={(v) => setOpts({ ...opts, autoRoll: v })} label="Auto-roll for me" hint="Off: the DM pauses and you tap to roll your own d20s." />
              <div className="divider" />
              <Toggle on={opts.companionsSpeak} onChange={(v) => setOpts({ ...opts, companionsSpeak: v })} label="Companions speak up" hint="Party members react in their own voice after the DM." />
              <div className="divider" />
              <Toggle on={opts.autoIllustrate} onChange={(v) => setOpts({ ...opts, autoIllustrate: v })} label="Auto-illustrate scenes" hint="The DM generates art for striking moments. Costs image credits." />
            </div>
            <Field label="Narration length"><Segmented value={opts.narrationLength} options={[{ value: 'brief', label: 'Brief' }, { value: 'standard', label: 'Standard' }, { value: 'cinematic', label: 'Cinematic' }]} onChange={(v) => setOpts({ ...opts, narrationLength: v })} /></Field>
            <Field label="Difficulty" hint="Story: the DM favors drama over lethality. Hard: mistakes bite."><Segmented value={opts.difficulty} options={[{ value: 'story', label: 'Story' }, { value: 'normal', label: 'Normal' }, { value: 'hard', label: 'Hard' }]} onChange={(v) => setOpts({ ...opts, difficulty: v })} /></Field>
            <div className="card glow">
              <div className="eyebrow">Ready</div>
              <div className="card-title mt-8">{name || seed?.suggestedName || 'Untitled Campaign'}</div>
              <div className="small dim mt-8">{hero.name}, {findSpecies(rs, hero.speciesId)?.name} {findClass(rs, hero.classId)?.name}{companions.length ? ` · with ${companions.map((c) => c.name).filter(Boolean).join(', ')}` : ' · alone'}</div>
              <div className="tiny mute ui mt-8">{rs.name}</div>
            </div>
          </>
        )}
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 16px calc(var(--safe-bottom) + 12px)', background: 'linear-gradient(180deg, transparent, var(--bg-0) 40%)' }}>
        {step < 3 ? (
          <Button variant="primary" block disabled={(step === 0 && !worldReady) || (step === 1 && !heroReady)} onClick={() => setStep((step + 1) as Step)}>Continue <ChevronRight size={16} /></Button>
        ) : (
          <Button variant="primary" block disabled={starting} onClick={begin}>{starting ? 'Setting the table…' : 'Begin the adventure'}</Button>
        )}
      </div>

      <Sheet open={editing !== null} onClose={() => setEditing(null)} title={companions[editing ?? 0]?.name || 'Companion'}>
        {editing !== null && companions[editing] && (
          <CharacterBuilder rs={rs} draft={companions[editing]} onChange={(d) => setCompanions((cs) => cs.map((c, i) => (i === editing ? d : c)))} worldPremise={manual ? manualWorld.premise : seed?.premise} playerName={hero.name} />
        )}
        <Button variant="primary" block className="mt-16" onClick={() => setEditing(null)}>Done</Button>
      </Sheet>
    </>
  );
}
