import React, { useState } from 'react';
import { Image as ImageIcon, Eye, EyeOff, Clock, MapPin, CloudSun, Swords } from 'lucide-react';
import { useCampaign } from '@/store/campaign';
import { Button, Chip, Field, SectionTitle, useStoredImage, StoredImage } from '@/components/ui';
import { illustrate } from '@/engine/dm';
import { useUI } from '@/store/ui';
import { RegionMap } from '@/components/RegionMap';
import type { MapNode } from '@/engine/map';

export function WorldTab() {
  const campaign = useCampaign((s) => s.campaign)!;
  const update = useCampaign((s) => s.update);
  const toast = useUI((s) => s.toast);
  const [showSecrets, setShowSecrets] = useState(false);
  const sceneImg = useStoredImage(campaign.scene.imageId);
  const present = campaign.scene.presentEntityIds.map((id) => campaign.entities[id]).filter(Boolean);
  const location = campaign.scene.locationId ? campaign.entities[campaign.scene.locationId] : undefined;
  const images = Object.values(campaign.images).sort((a, b) => b.createdAt - a.createdAt);
  const [node, setNode] = useState<MapNode | null>(null);
  const nodeEntity = node ? campaign.entities[node.id] : undefined;

  return (
    <div className="scroll pad stack" style={{ paddingBottom: 40 }}>
      <div>
        <div className="row-between mb-8"><div className="eyebrow">Region map</div><div className="tiny mute ui">drag · pinch · tap a place</div></div>
        <RegionMap campaign={campaign} onSelect={setNode} />
        {node && nodeEntity && (
          <div className="card flat mt-8">
            <div className="row-between"><div className="card-title">{nodeEntity.name}</div>{node.current && <Chip tone="gold">You are here</Chip>}</div>
            {nodeEntity.summary && <div className="small dim mt-8">{nodeEntity.summary}</div>}
            {node.npcs.length > 0 && <div className="tiny mute ui mt-8">People here: {node.npcs.join(', ')}</div>}
            {nodeEntity.parentId && campaign.entities[nodeEntity.parentId] && <div className="tiny mute ui mt-8">Inside {campaign.entities[nodeEntity.parentId].name}</div>}
            {nodeEntity.facts.length > 0 && <div className="small dim mt-8">{nodeEntity.facts.slice(-3).map((f, i) => <div key={i}>• {f}</div>)}</div>}
          </div>
        )}
      </div>
      <div className="card" style={{ padding: 0 }}>
        {sceneImg ? <img src={sceneImg} alt="" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} /> : <div className="center" style={{ aspectRatio: '16/9', background: 'linear-gradient(160deg, var(--bg-4), var(--bg-2))' }}><Button variant="ghost" size="sm" onClick={() => void illustrate(`${campaign.scene.locationName}. ${campaign.scene.description} ${campaign.scene.situation}`, 'scene').then((id) => !id && toast('Illustration failed', 'error'))}><ImageIcon size={14} /> Illustrate this scene</Button></div>}
        <div style={{ padding: '14px 16px' }}>
          <div className="eyebrow">Current scene</div>
          <h2 className="mt-8">{campaign.scene.locationName || 'Unknown'}</h2>
          {campaign.scene.description && <p className="small dim mt-8">{campaign.scene.description}</p>}
          {campaign.scene.situation && <p className="mt-8" style={{ fontStyle: 'italic' }}>{campaign.scene.situation}</p>}
          <div className="chips mt-16">
            <Chip><Clock size={12} /> Day {campaign.world.calendar.day} · {campaign.scene.timeOfDay}</Chip>
            {campaign.scene.weather && <Chip><CloudSun size={12} /> {campaign.scene.weather}</Chip>}
            {campaign.scene.mood && <Chip tone="arcane">{campaign.scene.mood}</Chip>}
            {campaign.combat?.active && <Chip tone="blood"><Swords size={12} /> Combat · round {campaign.combat.round}</Chip>}
          </div>
          {present.length > 0 && <div className="mt-16"><div className="eyebrow mb-8">Present</div><div className="chips">{present.map((e) => <Chip key={e.id} tone="gold"><MapPin size={11} /> {e.name}</Chip>)}</div></div>}
          {location?.facts.length ? <div className="mt-16"><div className="eyebrow mb-8">Known about this place</div>{location.facts.slice(-5).map((f, i) => <div key={i} className="small dim">• {f}</div>)}</div> : null}
        </div>
      </div>

      <SectionTitle>The world</SectionTitle>
      <div className="card stack-sm">
        <div><div className="eyebrow">Premise</div><p className="small mt-8">{campaign.world.premise}</p></div>
        <div><div className="eyebrow">Setting</div><p className="small dim mt-8">{campaign.world.setting}</p></div>
        <div className="chips">{campaign.world.themes.map((t) => <Chip key={t}>{t}</Chip>)}<Chip tone="gold">{campaign.world.tone}</Chip><Chip>{campaign.world.contentRating.toUpperCase()}</Chip></div>
      </div>

      {campaign.world.bible && (
        <details className="card">
          <summary className="card-title" style={{ cursor: 'pointer' }}>World bible <span className="tiny mute ui">(DM notes — spoilers)</span></summary>
          <p className="small dim mt-16" style={{ whiteSpace: 'pre-wrap' }}>{campaign.world.bible}</p>
        </details>
      )}
      {campaign.world.secrets.length > 0 && (
        <div className="card">
          <div className="row-between"><div className="card-title">DM secrets</div><Button variant="subtle" size="xs" onClick={() => setShowSecrets(!showSecrets)}>{showSecrets ? <EyeOff size={12} /> : <Eye size={12} />} {showSecrets ? 'Hide' : `Reveal (${campaign.world.secrets.length})`}</Button></div>
          {showSecrets && <div className="stack-sm mt-16">{campaign.world.secrets.map((s, i) => <div key={i} className="small dim">• {s}</div>)}</div>}
          {!showSecrets && <div className="tiny mute ui mt-8">Peeking spoils the mystery. You've been warned.</div>}
        </div>
      )}

      <SectionTitle>Steer the story</SectionTitle>
      <Field label="Tone" hint="Changes how the DM narrates from now on."><input className="input" value={campaign.world.tone} onChange={(e) => update((c) => ({ ...c, world: { ...c.world, tone: e.target.value } }))} /></Field>

      {images.length > 0 && (
        <>
          <SectionTitle>Gallery</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {images.map((im) => <div key={im.id} className="msg-image" style={{ borderRadius: 12 }} onClick={() => update((c) => ({ ...c, coverImageId: im.id }))}><StoredImage id={im.id} /><div className="caption truncate">{im.kind}{campaign.coverImageId === im.id ? ' · cover' : ''}</div></div>)}
          </div>
          <div className="tiny mute ui">Tap an image to make it the campaign cover.</div>
        </>
      )}
    </div>
  );
}
