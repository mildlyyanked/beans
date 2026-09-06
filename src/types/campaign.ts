import type { AbilityId, SkillId } from './ruleset';

/* ------------------------------------------------------------------ */
/* Characters                                                          */
/* ------------------------------------------------------------------ */

export type CharacterKind = 'player' | 'companion';

export interface InventoryItem {
  id: string; // instance id
  itemId?: string; // ruleset item id, if any
  name: string;
  qty: number;
  equipped?: boolean;
  description?: string;
  category?: string;
  weight?: number;
}

export interface SpellSlots {
  [level: number]: { max: number; used: number };
}

export interface Persona {
  personality: string;
  ideals: string;
  bonds: string;
  flaws: string;
  voice: string; // how they speak — used for companion LLM prompts
  backstory: string;
  appearance: string;
  /** Companion-only: relationship to the player and current attitude. */
  relationship?: string;
}

export interface Character {
  id: string;
  kind: CharacterKind;
  name: string;
  pronouns?: string;
  speciesId: string;
  speciesVariantId?: string;
  classId: string;
  subclassId?: string;
  backgroundId: string;
  alignment?: string;
  level: number;
  xp: number;
  abilities: Record<AbilityId, number>;
  /** Skills & saves the character is proficient in. */
  proficiencies: {
    skills: SkillId[];
    expertise?: SkillId[];
    saves: AbilityId[];
    armor: string[];
    weapons: string[];
    tools: string[];
    languages: string[];
  };
  maxHp: number;
  hp: number;
  tempHp: number;
  hitDice: { total: number; used: number; die: number };
  speed: number;
  inventory: InventoryItem[];
  gold: number; // in the ruleset's base currency
  spells: {
    cantrips: string[];
    known: string[]; // known or in spellbook
    prepared: string[];
    slots: SpellSlots;
  };
  conditions: string[];
  inspiration: boolean;
  deathSaves: { successes: number; failures: number };
  persona: Persona;
  portraitImageId?: string;
  notes: string;
  /** Free-form extra features/feats added during play. */
  extraFeatures: { name: string; description: string }[];
  createdAt: number;
}

/* ------------------------------------------------------------------ */
/* World memory                                                        */
/* ------------------------------------------------------------------ */

export type EntityType = 'npc' | 'location' | 'faction' | 'item' | 'quest' | 'lore' | 'creature';

export type QuestStatus = 'active' | 'completed' | 'failed' | 'hidden';

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  aliases: string[];
  /** One-line summary shown in prompts and lists. */
  summary: string;
  /** Detailed description (prompted on demand). */
  description: string;
  /** Immutable-ish facts the DM must respect. */
  facts: string[];
  tags: string[];
  /** For NPCs: attitude toward the party, status (alive/dead/missing), current location entity id. */
  status?: string;
  attitude?: string;
  locationId?: string;
  /** For quests. */
  questStatus?: QuestStatus;
  objectives?: { text: string; done: boolean }[];
  /** Relationships to other entities: "ally of", "owes", etc. */
  relations?: { targetId: string; relation: string }[];
  imageId?: string;
  /** Turn numbers the entity appeared on — powers recency scoring. */
  firstSeenTurn: number;
  lastSeenTurn: number;
  mentions: number;
  pinned?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CanonFact {
  id: string;
  text: string;
  turn: number;
  createdAt: number;
  category?: string;
}

export interface ChronicleEntry {
  id: string;
  /** Inclusive range of transcript turns this entry summarizes. */
  fromTurn: number;
  toTurn: number;
  text: string;
  title?: string;
  createdAt: number;
}

export interface Scene {
  locationId?: string;
  locationName: string;
  description: string;
  presentEntityIds: string[];
  timeOfDay: string;
  weather: string;
  mood: string;
  imageId?: string;
  /** Free-form "what is happening right now" beat used to anchor the DM. */
  situation: string;
}

export interface WorldCalendar {
  day: number;
  month?: string;
  year?: number;
  timeOfDay: string;
  /** Total in-game minutes elapsed (for tracking rests). */
  elapsedMinutes: number;
}

export interface World {
  premise: string;
  setting: string;
  tone: string;
  themes: string[];
  contentRating: 'pg' | 'pg13' | 'r';
  /** Opening hook the DM used. */
  openingHook: string;
  canon: CanonFact[];
  calendar: WorldCalendar;
  /** Long-form world bible the DM wrote at campaign creation (secret DM notes included). */
  bible: string;
  /** DM-only secrets and planned twists (never shown to the player unless revealed). */
  secrets: string[];
}

/* ------------------------------------------------------------------ */
/* Combat                                                              */
/* ------------------------------------------------------------------ */

export interface Combatant {
  id: string;
  name: string;
  kind: 'pc' | 'companion' | 'enemy' | 'ally';
  characterId?: string;
  monsterId?: string;
  initiative: number;
  hp: number;
  maxHp: number;
  ac: number;
  conditions: string[];
  notes?: string;
  defeated?: boolean;
}

export interface CombatState {
  active: boolean;
  round: number;
  turnIndex: number;
  combatants: Combatant[];
  startedTurn: number;
  log: string[];
}

/* ------------------------------------------------------------------ */
/* Transcript                                                          */
/* ------------------------------------------------------------------ */

export type MessageRole = 'dm' | 'player' | 'companion' | 'system' | 'roll' | 'image' | 'event';

export interface RollResult {
  label: string;
  expression: string;
  rolls: number[];
  kept?: number[];
  modifier: number;
  total: number;
  dc?: number;
  success?: boolean;
  critical?: 'hit' | 'miss';
  advantage?: 'advantage' | 'disadvantage' | 'none';
  characterName?: string;
  kind?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  turn: number;
  characterId?: string;
  characterName?: string;
  roll?: RollResult;
  imageId?: string;
  imagePrompt?: string;
  /** Tool activity that produced state changes during this DM turn. */
  effects?: string[];
  streaming?: boolean;
  error?: string;
  /** Hidden from the player but sent to the model (e.g. DM-only notes). */
  hidden?: boolean;
}

export interface PendingRoll {
  id: string;
  characterId: string;
  kind: 'skill' | 'save' | 'attack' | 'ability' | 'custom' | 'initiative' | 'death';
  label: string;
  skillId?: SkillId;
  abilityId?: AbilityId;
  dc?: number;
  advantage?: 'advantage' | 'disadvantage' | 'none';
  expression?: string;
  reason?: string;
}

/* ------------------------------------------------------------------ */
/* Campaign                                                            */
/* ------------------------------------------------------------------ */

export interface CampaignSettings {
  autoRoll: boolean;
  companionsSpeak: boolean;
  autoIllustrate: boolean;
  narrationLength: 'brief' | 'standard' | 'cinematic';
  difficulty: 'story' | 'normal' | 'hard';
  /** How many recent messages are sent verbatim before summarization kicks in. */
  contextWindowMessages: number;
}

export interface ImageMeta {
  id: string;
  prompt: string;
  createdAt: number;
  kind: 'scene' | 'portrait' | 'item' | 'map' | 'other';
  width?: number;
  height?: number;
}

export interface Campaign {
  id: string;
  name: string;
  rulesetId: string;
  createdAt: number;
  updatedAt: number;
  turn: number;
  world: World;
  scene: Scene;
  characters: Record<string, Character>;
  playerCharacterId: string;
  partyIds: string[];
  entities: Record<string, Entity>;
  chronicle: ChronicleEntry[];
  messages: Message[];
  combat: CombatState | null;
  pendingRoll: PendingRoll | null;
  settings: CampaignSettings;
  images: Record<string, ImageMeta>;
  coverImageId?: string;
  /** Snapshot bookkeeping for manual saves. */
  lastSavedAt?: number;
}

export interface CampaignSummary {
  id: string;
  name: string;
  rulesetId: string;
  updatedAt: number;
  turn: number;
  playerName: string;
  playerClass: string;
  level: number;
  locationName: string;
  coverImageId?: string;
  premise: string;
}

export interface SaveSlot {
  id: string;
  campaignId: string;
  name: string;
  createdAt: number;
  turn: number;
  snapshot: Campaign;
}
