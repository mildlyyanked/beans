import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Square, Dices, Image as ImageIcon, RotateCcw, Sparkles } from 'lucide-react';
import { useCampaign } from '@/store/campaign';
import { useUI } from '@/store/ui';
import { Markdown } from '@/components/Markdown';
import { Avatar, AutoTextarea, Button, D20, useStoredImage, Chip } from '@/components/ui';
import { submitPlayerAction, resolvePendingRoll, stopGeneration, nudgeDm, illustrate, runCompanions } from '@/engine/dm';
import type { Message } from '@/types/campaign';
import { fmtMod } from '@/engine/dice';

function RollCard({ m }: { m: Message }) {
  const r = m.roll!;
  const nat = r.kept?.[0] ?? r.rolls[0];
  const isD20 = r.expression.startsWith('1d20') || r.kind !== 'dice';
  const cls = r.success === true ? 'success' : r.success === false ? 'failure' : '';
  return (
    <motion.div className={`roll ${cls} ${r.critical ? 'crit' : ''}`} initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
      {isD20 ? <D20 value={nat} /> : <div className="d20"><Dices size={26} className="gold" /></div>}
      <div className="grow">
        <div className="rl">{r.characterName ? `${r.characterName} · ` : ''}{r.label}</div>
        <div className="detail">
          {r.rolls.length > 1 ? `[${r.rolls.join(', ')}]` : `d${isD20 ? 20 : ''} ${nat}`}{r.advantage && r.advantage !== 'none' ? ` · ${r.advantage}` : ''}{r.modifier ? ` ${fmtMod(r.modifier)}` : ''}{r.dc !== undefined ? ` · DC ${r.dc}` : ''}
          {r.critical === 'hit' ? ' · NATURAL 20' : r.critical === 'miss' ? ' · NATURAL 1' : ''}
        </div>
      </div>
      {r.success !== undefined && <span className={`verdict ${cls}`}>{r.success ? 'Success' : 'Fail'}</span>}
      <div className="total">{r.total}</div>
    </motion.div>
  );
}

function ImageCard({ m }: { m: Message }) {
  const url = useStoredImage(m.imageId);
  return (
    <div className="msg-image">
      {m.streaming ? <div className="shimmer" style={{ aspectRatio: '16/9' }} /> : url ? <img src={url} alt={m.imagePrompt ?? ''} /> : m.error ? <div className="msg-error" style={{ margin: 10 }}>{m.error}</div> : null}
      {m.imagePrompt && <div className="caption">{m.streaming ? 'Painting… ' : ''}{m.imagePrompt}</div>}
    </div>
  );
}

function MessageView({ m }: { m: Message }) {
  const campaign = useCampaign((s) => s.campaign)!;
  switch (m.role) {
    case 'dm':
      return (
        <div className="msg-dm">
          {m.content ? <Markdown text={m.content} streaming={m.streaming} /> : m.streaming ? <span className="cursor" /> : null}
          {m.error && <div className="msg-error mt-8">{m.error}</div>}
          {m.effects?.length ? <div className="effects">{m.effects.slice(0, 8).map((e, i) => <Chip key={i} tone={/damage|dying|loses|Fail/i.test(e) ? 'ember' : /heal|gains|receives|XP|LEVEL/i.test(e) ? 'moss' : /Canon|New |Scene|Quest/i.test(e) ? 'gold' : ''}>{e.length > 110 ? e.slice(0, 108) + '…' : e}</Chip>)}</div> : null}
        </div>
      );
    case 'player':
      return <div className="msg-player"><div className="who">{m.characterName ?? 'You'}</div><Markdown text={m.content} className="prose" /></div>;
    case 'companion': {
      const ch = m.characterId ? campaign.characters[m.characterId] : undefined;
      return (
        <div className="msg-companion">
          <Avatar name={m.characterName ?? '?'} imageId={ch?.portraitImageId} />
          <div className="bubble"><div className="who">{m.characterName}</div><Markdown text={m.content} className="prose" /></div>
        </div>
      );
    }
    case 'roll': return <RollCard m={m} />;
    case 'image': return <ImageCard m={m} />;
    case 'event': return <div className="msg-event">✦ {m.content}</div>;
    case 'system': return m.hidden ? null : <div className="msg-event"><b>{m.content}</b></div>;
    default: return null;
  }
}

export function StoryTab() {
  const campaign = useCampaign((s) => s.campaign)!;
  const busy = useCampaign((s) => s.busy);
  const busyLabel = useCampaign((s) => s.busyLabel);
  const error = useCampaign((s) => s.error);
  const toast = useUI((s) => s.toast);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [stick, setStick] = useState(true);
  const messages = campaign.messages.filter((m) => !m.hidden);
  const pc = campaign.characters[campaign.playerCharacterId];
  const combat = campaign.combat;
  const sceneImg = useStoredImage(campaign.scene.imageId);
  const lastContent = campaign.messages[campaign.messages.length - 1]?.content;

  useEffect(() => {
    const el = scrollRef.current;
    if (el && stick) el.scrollTop = el.scrollHeight;
  }, [messages.length, lastContent, stick, busy]);

  const onScroll = () => {
    const el = scrollRef.current; if (!el) return;
    setStick(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
  };

  const send = async () => {
    const t = text.trim();
    if (!t || busy) return;
    setText('');
    setStick(true);
    await submitPlayerAction(t);
  };

  const quick = combat?.active
    ? ['I attack!', 'I cast a spell…', 'I dodge', 'I dash away', 'I help an ally', 'I try to parley']
    : ['Look around', 'Talk to…', 'Search the area', 'Rest here', 'Continue on', 'Check for danger'];

  return (
    <>
      {sceneImg ? (
        <div className="scene-banner">
          <img src={sceneImg} alt="" />
          <div className="fade" />
          <div className="info">
            <div className="name">{campaign.scene.locationName}</div>
            <div className="meta">Day {campaign.world.calendar.day} · {campaign.scene.timeOfDay}{campaign.scene.weather ? ` · ${campaign.scene.weather}` : ''}</div>
          </div>
        </div>
      ) : (
        <div className="scene-strip">
          <span className="name truncate">{campaign.scene.locationName || 'Somewhere'}</span>
          <span className="mute">·</span>
          <span className="truncate">Day {campaign.world.calendar.day}, {campaign.scene.timeOfDay}{campaign.scene.weather ? ` · ${campaign.scene.weather}` : ''}</span>
        </div>
      )}
      {combat?.active && (
        <div className="tracker">
          {combat.combatants.map((c, i) => (
            <div key={c.id} className={`cb ${i === combat.turnIndex ? 'active' : ''} ${c.defeated ? 'defeated' : ''}`}>
              <div className="nm">{c.name}</div>
              <div className="st">Init {c.initiative} · AC {c.ac}{c.conditions.length ? ` · ${c.conditions[0]}` : ''}</div>
              <div className={`bar hp ${c.hp / c.maxHp > 0.5 ? 'ok' : c.hp / c.maxHp > 0.25 ? 'warn' : ''}`}><i style={{ width: `${Math.max(0, (c.hp / c.maxHp) * 100)}%` }} /></div>
            </div>
          ))}
        </div>
      )}

      <div className="scroll" ref={scrollRef} onScroll={onScroll}>
        <div className="log">
          {messages.length === 0 && !busy && (
            <div className="empty"><div className="ico">🕯️</div><div className="display" style={{ letterSpacing: '0.1em' }}>The tale awaits</div><Button variant="primary" size="sm" className="mt-16" onClick={() => void nudgeDm()}>Begin</Button></div>
          )}
          {messages.map((m) => <MessageView key={m.id} m={m} />)}
          {error && <div className="msg-error">{error} <button className="btn xs ghost" style={{ marginLeft: 8 }} onClick={() => void nudgeDm('The previous response failed; please continue from where the scene left off.')}><RotateCcw size={11} /> Retry</button></div>}
        </div>
      </div>

      {busy && <div className="thinking"><span className="dots"><i /><i /><i /></span>{busyLabel}</div>}

      {campaign.pendingRoll && !busy && (
        <motion.div className="pending-roll" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <D20 value={20} />
          <div className="grow">
            <div className="display" style={{ fontSize: 13, letterSpacing: '0.06em' }}>{campaign.pendingRoll.label}</div>
            <div className="tiny mute ui">{campaign.pendingRoll.expression}{campaign.pendingRoll.dc ? ` vs DC ${campaign.pendingRoll.dc}` : ''}{campaign.pendingRoll.advantage && campaign.pendingRoll.advantage !== 'none' ? ` · ${campaign.pendingRoll.advantage}` : ''}</div>
          </div>
          <Button variant="primary" size="sm" onClick={() => void resolvePendingRoll()}><Dices size={14} /> Roll</Button>
        </motion.div>
      )}

      <div className="composer">
        {!campaign.pendingRoll && (
          <div className="quick">
            {quick.map((q) => <span key={q} className="chip" onClick={() => setText(q.endsWith('…') ? q.slice(0, -1) : q)}>{q}</span>)}
            <span className="chip" onClick={() => void illustrate(`${campaign.scene.locationName}. ${campaign.scene.situation || campaign.scene.description}`, 'scene').then((id) => !id && toast('Illustration failed', 'error'))}><ImageIcon size={12} /> Illustrate</span>
            {campaign.partyIds.length > 1 && <span className="chip" onClick={() => !busy && void runCompanions(true).finally(() => useCampaign.getState().setBusy(false))}><Sparkles size={12} /> Ask party</span>}
          </div>
        )}
        <div className="box">
          <AutoTextarea value={text} onChange={setText} onSubmit={send} placeholder={campaign.pendingRoll ? 'Roll first…' : combat?.active ? `${pc?.name}, what do you do?` : 'What do you do?'} disabled={!!campaign.pendingRoll} />
          {busy ? (
            <button className="send stop" onClick={stopGeneration} aria-label="Stop"><Square size={16} /></button>
          ) : (
            <button className="send" onClick={send} disabled={!text.trim() || !!campaign.pendingRoll} aria-label="Send"><Send size={17} /></button>
          )}
        </div>
      </div>
    </>
  );
}
