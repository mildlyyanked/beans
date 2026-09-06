import React from 'react';
import { ScrollText, Users, BookMarked, Globe2, Menu } from 'lucide-react';
import { useUI, type PlayTab } from '@/store/ui';
import { useCampaign } from '@/store/campaign';
import { StoryTab } from './play/StoryTab';
import { PartyTab } from './play/PartyTab';
import { JournalTab } from './play/JournalTab';
import { WorldTab } from './play/WorldTab';
import { MenuTab } from './play/MenuTab';
import { TopBar } from '@/components/ui';
import { xpForNextLevel } from '@/engine/rules';
import { useRulesets } from '@/store/rulesets';

const TABS: { id: PlayTab; label: string; icon: React.ReactNode }[] = [
  { id: 'story', label: 'Story', icon: <ScrollText size={20} /> },
  { id: 'party', label: 'Party', icon: <Users size={20} /> },
  { id: 'journal', label: 'Journal', icon: <BookMarked size={20} /> },
  { id: 'world', label: 'World', icon: <Globe2 size={20} /> },
  { id: 'menu', label: 'Menu', icon: <Menu size={20} /> },
];

export function PlayScreen() {
  const campaign = useCampaign((s) => s.campaign);
  const tab = useUI((s) => s.playTab);
  const setTab = useUI((s) => s.setPlayTab);
  const replace = useUI((s) => s.replace);
  const rs = useRulesets((s) => (campaign ? s.get(campaign.rulesetId) : undefined));
  if (!campaign || !rs) { replace({ name: 'home' }); return null; }
  const pc = campaign.characters[campaign.playerCharacterId];
  const levelUp = campaign.partyIds.some((id) => { const ch = campaign.characters[id]; const n = ch ? xpForNextLevel(rs, ch.level) : null; return ch && n !== null && ch.xp >= n; });
  const activeQuests = Object.values(campaign.entities).filter((e) => e.type === 'quest' && e.questStatus === 'active').length;

  return (
    <>
      {tab !== 'story' && <TopBar title={campaign.name} subtitle={`${pc?.name} · Level ${pc?.level} · ${campaign.scene.locationName}`} />}
      {tab === 'story' && (
        <TopBar>
          <div className="row-between">
            <div className="grow"><div className="title truncate">{campaign.name}</div><div className="subtitle truncate">{pc?.name} · HP {pc?.hp}/{pc?.maxHp}{campaign.combat?.active ? ` · ⚔ Round ${campaign.combat.round}` : ''}</div></div>
          </div>
        </TopBar>
      )}
      <div className="screen" style={{ minHeight: 0 }}>
        {tab === 'story' && <StoryTab />}
        {tab === 'party' && <PartyTab />}
        {tab === 'journal' && <JournalTab />}
        {tab === 'world' && <WorldTab />}
        {tab === 'menu' && <MenuTab />}
      </div>
      <nav className="bottomnav">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            {t.icon}<span>{t.label}</span>
            {t.id === 'party' && levelUp && <span className="badge">↑</span>}
            {t.id === 'journal' && activeQuests > 0 && <span className="badge">{activeQuests}</span>}
          </button>
        ))}
      </nav>
    </>
  );
}
