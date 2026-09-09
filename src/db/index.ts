import Dexie, { type Table } from 'dexie';
import type { Campaign, SaveSlot, CharacterTemplate } from '@/types/campaign';
import type { Ruleset } from '@/types/ruleset';

export interface StoredImage {
  id: string;
  campaignId: string;
  dataUrl: string;
  createdAt: number;
}

export interface StoredRuleset {
  id: string;
  name: string;
  updatedAt: number;
  data: Ruleset;
}

class TavernDB extends Dexie {
  campaigns!: Table<Campaign, string>;
  saves!: Table<SaveSlot, string>;
  images!: Table<StoredImage, string>;
  rulesets!: Table<StoredRuleset, string>;
  characters!: Table<CharacterTemplate, string>;

  constructor() {
    super('tavern-ai');
    this.version(1).stores({
      campaigns: 'id, updatedAt, name',
      saves: 'id, campaignId, createdAt',
      images: 'id, campaignId, createdAt',
      rulesets: 'id, updatedAt, name',
    });
    this.version(2).stores({
      campaigns: 'id, updatedAt, name',
      saves: 'id, campaignId, createdAt',
      images: 'id, campaignId, createdAt',
      rulesets: 'id, updatedAt, name',
      characters: 'id, updatedAt, rulesetId, kind',
    });
  }
}

export const db = new TavernDB();

export async function putImage(campaignId: string, id: string, dataUrl: string) {
  await db.images.put({ id, campaignId, dataUrl, createdAt: Date.now() });
}

export async function getImage(id: string): Promise<string | undefined> {
  const row = await db.images.get(id);
  return row?.dataUrl;
}

export async function deleteCampaignData(campaignId: string) {
  await db.transaction('rw', db.campaigns, db.saves, db.images, async () => {
    await db.campaigns.delete(campaignId);
    await db.saves.where('campaignId').equals(campaignId).delete();
    await db.images.where('campaignId').equals(campaignId).delete();
  });
}
