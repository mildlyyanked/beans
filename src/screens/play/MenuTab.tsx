import React, { useEffect, useState } from 'react';
import { Save, Download, RotateCcw, Trash2, Settings, BookOpen, Home, Sliders } from 'lucide-react';
import { useCampaign } from '@/store/campaign';
import { useRulesets } from '@/store/rulesets';
import { useUI } from '@/store/ui';
import { Button, Toggle, Segmented, SectionTitle, Confirm, Field } from '@/components/ui';
import type { SaveSlot } from '@/types/campaign';
import { downloadJson, timeAgo } from '@/util/id';
import { db } from '@/db';

export function MenuTab() {
  const campaign = useCampaign((s) => s.campaign)!;
  const st = useCampaign();
  const rs = useRulesets((s) => s.get(campaign.rulesetId));
  const go = useUI((s) => s.go);
  const replace = useUI((s) => s.replace);
  const toast = useUI((s) => s.toast);
  const [saves, setSaves] = useState<SaveSlot[]>([]);
  const [saveName, setSaveName] = useState('');
  const [loadSlot, setLoadSlot] = useState<SaveSlot | null>(null);
  const [delSlot, setDelSlot] = useState<SaveSlot | null>(null);
  const refresh = () => st.listSaves(campaign.id).then(setSaves);
  useEffect(() => { void refresh(); /* eslint-disable-next-line */ }, [campaign.id]);

  const doSave = async () => {
    const slot = await st.saveSlot(saveName.trim() || `${campaign.scene.locationName || 'Save'} · turn ${campaign.turn}`);
    setSaveName('');
    await refresh();
    toast(`Saved "${slot.name}"`, 'success');
  };
  const exportCampaign = async () => {
    await st.flush();
    const images = await db.images.where('campaignId').equals(campaign.id).toArray();
    downloadJson(`${campaign.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.tavern.json`, { version: 1, exportedAt: Date.now(), campaign, images: images.map((i) => ({ id: i.id, dataUrl: i.dataUrl })) });
  };
  const setSetting = (p: Partial<typeof campaign.settings>) => st.update((c) => ({ ...c, settings: { ...c.settings, ...p } }));

  return (
    <>
      <div className="scroll pad stack" style={{ paddingBottom: 40 }}>
        <div className="card glow">
          <div className="eyebrow">{rs?.name}</div>
          <h2 className="mt-8">{campaign.name}</h2>
          <div className="tiny mute ui mt-8">Turn {campaign.turn} · {campaign.messages.length} messages · {Object.keys(campaign.entities).length} entities · {campaign.world.canon.length} canon {campaign.world.canon.length === 1 ? 'fact' : 'facts'} · autosaved {timeAgo(campaign.updatedAt)}</div>
        </div>

        <SectionTitle>Save slots</SectionTitle>
        <div className="card stack-sm">
          <div className="row"><input className="input ui grow" placeholder="Name this save (optional)" value={saveName} onChange={(e) => setSaveName(e.target.value)} /><Button variant="primary" size="sm" onClick={doSave}><Save size={14} /> Save</Button></div>
          {saves.map((s) => (
            <div key={s.id} className="list-item">
              <div className="grow"><div className="t">{s.name}</div><div className="s">Turn {s.turn} · {timeAgo(s.createdAt)}</div></div>
              <Button variant="ghost" size="xs" onClick={() => setLoadSlot(s)}><RotateCcw size={12} /> Load</Button>
              <button className="iconbtn" onClick={() => setDelSlot(s)}><Trash2 size={15} /></button>
            </div>
          ))}
          {!saves.length && <div className="tiny mute ui">The campaign autosaves continuously. Manual slots let you return to a moment.</div>}
        </div>

        <SectionTitle>Table rules</SectionTitle>
        <div className="card stack-sm">
          <Toggle on={campaign.settings.autoRoll} onChange={(v) => setSetting({ autoRoll: v })} label="Auto-roll for me" hint="Off: you tap to roll your own checks." />
          <div className="divider" />
          <Toggle on={campaign.settings.companionsSpeak} onChange={(v) => setSetting({ companionsSpeak: v })} label="Companions speak up" />
          <div className="divider" />
          <Toggle on={campaign.settings.autoIllustrate} onChange={(v) => setSetting({ autoIllustrate: v })} label="Auto-illustrate scenes" />
          <div className="divider" />
          <Field label="Pacing" hint="Adaptive lets the DM match length to the beat."><Segmented value={campaign.settings.narrationLength} options={[{ value: 'adaptive', label: 'Adaptive' }, { value: 'brief', label: 'Brief' }, { value: 'standard', label: 'Standard' }, { value: 'cinematic', label: 'Epic' }]} onChange={(v) => setSetting({ narrationLength: v })} /></Field>
          <Field label={`Verbatim context · ${campaign.settings.contextWindowMessages} messages`} hint="Older messages are summarized into the chronicle."><input type="range" min={12} max={80} step={2} value={campaign.settings.contextWindowMessages} onChange={(e) => setSetting({ contextWindowMessages: parseInt(e.target.value, 10) })} style={{ width: '100%', accentColor: 'var(--gold)' }} /></Field>
        </div>

        <SectionTitle>More</SectionTitle>
        <div className="card stack-sm">
          <Button variant="ghost" block onClick={exportCampaign}><Download size={15} /> Export campaign (JSON)</Button>
          <Button variant="ghost" block onClick={() => go({ name: 'rules', id: campaign.rulesetId })}><BookOpen size={15} /> Browse the rules</Button>
          <Button variant="ghost" block onClick={() => go({ name: 'settings' })}><Settings size={15} /> Models & API key</Button>
          <Button variant="ghost" block onClick={() => { st.close(); replace({ name: 'home' }); }}><Home size={15} /> Leave the table</Button>
        </div>
        <div className="tiny mute ui" style={{ textAlign: 'center' }}><Sliders size={11} /> Tune your DM under Settings → Models.</div>
      </div>
      <Confirm open={!!loadSlot} onClose={() => setLoadSlot(null)} onConfirm={() => loadSlot && st.loadSlot(loadSlot.id).then(() => toast('Save loaded', 'success'))} title={`Load "${loadSlot?.name}"?`} text="Current progress since that save will be replaced. Autosave continues from the loaded state." confirmLabel="Load" />
      <Confirm open={!!delSlot} onClose={() => setDelSlot(null)} onConfirm={() => delSlot && st.deleteSlot(delSlot.id).then(refresh)} title="Delete this save?" confirmLabel="Delete" danger />
    </>
  );
}
