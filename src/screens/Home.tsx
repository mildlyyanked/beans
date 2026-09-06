import React, { useEffect, useState } from 'react';
import { Plus, Settings, BookOpen, Trash2, Upload } from 'lucide-react';
import { useUI } from '@/store/ui';
import { useCampaign } from '@/store/campaign';
import { useRulesets } from '@/store/rulesets';
import { Button, IconButton, Sigil, useStoredImage, Confirm } from '@/components/ui';
import type { CampaignSummary, Campaign } from '@/types/campaign';
import { timeAgo, readFileAsText } from '@/util/id';
import { db } from '@/db';

function CampaignCard({ c, onOpen, onDelete }: { c: CampaignSummary; onOpen: () => void; onDelete: () => void }) {
  const img = useStoredImage(c.coverImageId);
  const rs = useRulesets((s) => s.get(c.rulesetId));
  return (
    <div className="campaign-card" onClick={onOpen}>
      {img && <img src={img} alt="" />}
      <div className="fade" />
      <div className="body">
        <div className="row-between">
          <div className="eyebrow">{rs?.name ?? 'Unknown ruleset'} · Turn {c.turn}</div>
          <IconButton onClick={(e) => { e.stopPropagation(); onDelete(); }} aria-label="Delete"><Trash2 size={16} /></IconButton>
        </div>
        <div className="name">{c.name}</div>
        <div className="meta">{c.playerName} · Level {c.level} {c.playerClass} · {c.locationName || 'Unknown location'} · {timeAgo(c.updatedAt)}</div>
        <div className="premise">{c.premise}</div>
      </div>
    </div>
  );
}

export function HomeScreen() {
  const go = useUI((s) => s.go);
  const toast = useUI((s) => s.toast);
  const library = useCampaign((s) => s.library);
  const loadLibrary = useCampaign((s) => s.loadLibrary);
  const remove = useCampaign((s) => s.remove);
  const open = useCampaign((s) => s.open);
  const [del, setDel] = useState<CampaignSummary | null>(null);

  useEffect(() => { void loadLibrary(); }, [loadLibrary]);

  const importCampaign = async (file: File) => {
    try {
      const data = JSON.parse(await readFileAsText(file)) as { campaign: Campaign; images?: { id: string; dataUrl: string }[] };
      const c = data.campaign ?? (data as unknown as Campaign);
      if (!c?.id || !c.characters) throw new Error('Not a campaign export');
      c.id = c.id + '_' + Date.now().toString(36);
      await db.campaigns.put(c);
      for (const im of data.images ?? []) await db.images.put({ id: im.id, campaignId: c.id, dataUrl: im.dataUrl, createdAt: Date.now() });
      await loadLibrary();
      toast('Campaign imported', 'success');
    } catch (e) { toast((e as Error).message, 'error'); }
  };

  return (
    <>
      <div className="scroll">
        <div className="hero">
          <Sigil />
          <h1 className="gradient-text">TAVERN</h1>
          <div className="tag">Your table. Any world. A Dungeon Master who never forgets.</div>
        </div>
        <div className="pad stack">
          <div className="new-card" onClick={() => go({ name: 'new-campaign' })}>
            <div className="row center" style={{ gap: 8 }}><Plus size={18} className="gold" /><span className="display gold" style={{ letterSpacing: '0.14em', fontSize: 13, textTransform: 'uppercase', fontWeight: 600 }}>Begin a new campaign</span></div>
            <div className="tiny mute ui mt-8">Forge a world, build a hero, gather companions</div>
          </div>
          {library.length === 0 && (
            <div className="stack-sm mt-8">
              {[
                ['🕯️', 'A DM with a long memory', 'NPCs, places, promises and canon live in a structured world memory the DM reads every turn.'],
                ['⚔️', 'Honest dice, real stakes', 'The app rolls, tracks HP, spells, gold, and initiative. The DM only narrates.'],
                ['📜', 'Any ruleset', 'Fifth Edition SRD is built in. Fork it, hand-edit it, or generate a new system.'],
                ['🎨', 'Illustrated', 'Scene art and portraits from any image model on OpenRouter.'],
              ].map(([ico, t, s]) => (
                <div key={t} className="card flat row" style={{ alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontSize: 20, lineHeight: 1.2 }}>{ico}</span>
                  <div><div className="card-title" style={{ fontSize: 13.5 }}>{t}</div><div className="small dim">{s}</div></div>
                </div>
              ))}
            </div>
          )}
          {library.length > 0 && <div className="eyebrow mt-8">Your campaigns</div>}
          {library.map((c) => (
            <CampaignCard key={c.id} c={c} onOpen={async () => { await open(c.id); go({ name: 'play' }); }} onDelete={() => setDel(c)} />
          ))}
          <div className="row mt-16" style={{ justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="ghost" size="sm" onClick={() => go({ name: 'rulesets' })}><BookOpen size={15} /> Rulesets</Button>
            <Button variant="ghost" size="sm" onClick={() => go({ name: 'settings' })}><Settings size={15} /> Settings</Button>
            <label className="btn ghost sm" style={{ cursor: 'pointer' }}><Upload size={15} /> Import<input type="file" accept="application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void importCampaign(f); e.target.value = ''; }} /></label>
          </div>
          <div className="tiny mute ui" style={{ textAlign: 'center', marginTop: 20, lineHeight: 1.5 }}>Everything is stored on this device. Bring your own OpenRouter key.</div>
        </div>
      </div>
      <Confirm open={!!del} onClose={() => setDel(null)} onConfirm={() => del && void remove(del.id)} title={`Delete "${del?.name}"?`} text="This erases the campaign, its saves, and its images from this device." confirmLabel="Delete" danger />
    </>
  );
}
