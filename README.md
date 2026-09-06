# Tavern — an AI Dungeon Master that never forgets

Tavern is a mobile-first tabletop RPG app. An LLM runs the table as Dungeon Master, AI-voiced companions travel with you, the app rolls honest dice and tracks every hit point, and a structured world memory keeps the story consistent across a long campaign. The rules are **data, not code**: the full 5e SRD ships built in, and you can fork it, hand-edit it, or have the AI generate an entirely new system.

It runs as an installable PWA (add to home screen on iOS/Android) and can be wrapped with Capacitor for store builds. Everything is stored on-device; you bring your own OpenRouter key.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173 — open on your phone via the LAN URL Vite prints
npm run build      # production build in dist/ (PWA with service worker)
npm run preview    # serve the production build
```

On first launch paste an [OpenRouter](https://openrouter.ai/keys) API key. Pick models per role under **Settings → Models** (the DM needs a model with tool calling; the illustrator needs an image-output model such as `google/gemini-2.5-flash-image-preview`). Settings also exposes the API base URL, so any OpenAI-compatible endpoint (a local Ollama or LM Studio server, for example) works too.

## What's in the box

| Area | What it does |
| --- | --- |
| **Campaign wizard** | Forge a world from a one-line idea (premise, setting, hook, DM-only bible and secrets, seeded NPCs/factions/quests) or write your own. Build a hero with standard array / point buy / rolled scores, class skill choices, spell selection, and an AI-written or hand-written persona. Recruit up to three AI companions. |
| **Play** | Streaming narration with markdown, quick-action chips, dice cards, an initiative tracker during combat, scene banner art, effect chips showing exactly what state changed each turn, and a pending-roll card when you prefer to roll your own d20s. |
| **Party** | Full character sheets driven by the ruleset: abilities, saves, skills, attacks, features, gear with equip/stow, spell slots you can tap, prepared spells, persona, notes, AI portraits, and a guided level-up flow (HP, features, ASI, subclass, new spells). |
| **Journal** | Quests with objectives, people, places, factions, items, lore — all editable — plus the chronicle (auto-written chapter summaries) and the canon ledger of established facts. |
| **World** | Current scene, calendar, present NPCs, world bible, DM secrets (spoiler-gated), tone steering, and an image gallery. |
| **Save / load** | Continuous autosave to IndexedDB, named save slots, JSON export/import of whole campaigns including images. |
| **Rulesets** | Browse the SRD, fork it, edit any section as structured JSON (or ask the AI to rewrite a section in plain language), import/export rulesets, or generate a new system from a design brief in six model passes. |

## How the DM stays consistent

The chat transcript is *not* the source of truth. Each DM turn is assembled from structured state:

1. **Stable block** (cached): identity and craft rules, the ruleset's GM guidance and `core` rule sections, the world premise/setting/bible and DM secrets.
2. **Dynamic block**: calendar and scene, combat tracker, compact party sheets, the canon ledger, the most relevant entity cards (scored by name mentions in recent messages, presence in the scene, pinning, recency), active quests, and the chronicle.
3. **Recent transcript**: only the messages not yet folded into the chronicle.

The DM can only change the world through **tools** (`roll_check`, `apply_damage`, `start_combat`, `upsert_entity`, `record_fact`, `set_scene`, `advance_time`, `award_xp`, `give_item`, `illustrate`, `lookup_*`, …). The app executes them against authoritative state, so HP, inventory, initiative, and canon can't drift, and dice are real RNG. A background **scribe** compresses older turns into chronicle chapters and extracts any entities or facts the DM forgot to register; very long chronicles are merged into epochs. Companions are voiced by a separate, cheaper model call that sees their persona, voice, and relationship to the hero.

## Rulesets

A ruleset is a single JSON document (`src/types/ruleset.ts`): abilities, skills, species, classes (features per level, spellcasting tables, subclasses), backgrounds, spells, equipment (structured weapon/armor data), monsters (full stat blocks), conditions, and `mechanics` — level tables, spell slot tables, point-buy costs, DC guidelines, and *formulas* such as `floor((score - 10) / 2)` or `10 + dex` that the engine evaluates at runtime. The ruleset also carries `labels` so a custom system can call things whatever it likes. Validation is lenient (zod with defaults), so hand-edited and generated rulesets load even when incomplete, with warnings.

The bundled ruleset is the SRD 5.1: 12 classes with one subclass each, 9 races, 10 backgrounds, 319 spells, 160 items, 129 monsters. SRD content is used under CC-BY-4.0 (see the ruleset's license field).

## Development

```bash
npm run typecheck   # tsc
npm test            # unit tests: dice, expressions, rules math, character builder, memory ranking, tool execution
npm run check:srd   # validates the bundled ruleset and smoke-builds a character for every class
npm run mock        # OpenAI-compatible mock server on :8787 (streams, tool calls, JSON mode, images)
npm run e2e         # full Playwright tour against the mock; writes screenshots/ (needs `npm run build` first)
```

`scripts/e2e.mjs` and `scripts/icons.mjs` expect a Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`; set `CHROME_PATH` or run `npx playwright install chromium` to use a downloaded one.

### Project layout

```
src/
  types/        ruleset.ts (rules schema), campaign.ts (world state, characters, transcript)
  data/srd/     the bundled 5e SRD ruleset as TypeScript data
  engine/       dice, expr (formula evaluator), rules (derived stats), character (builder/level-up),
                memory (entities, retrieval, chronicle), prompt (DM/companion/scribe prompts),
                tools (DM tool definitions + executor), dm (turn orchestrator), generators, schema
  llm/          OpenRouter client: SSE streaming, tool-call accumulation, JSON mode, image output
  store/        zustand stores: settings (localStorage), campaign (IndexedDB autosave), rulesets, ui
  db/           Dexie schema: campaigns, saves, images, rulesets
  screens/      Home, Onboarding, NewCampaign, Play (story/party/journal/world/menu), Rulesets, RulesetEditor, Rules, Settings
  components/   design-system primitives, CharacterBuilder, Markdown renderer
```

### Native builds (optional)

```bash
npm run build
npm i -D @capacitor/cli @capacitor/core @capacitor/ios @capacitor/android
npx cap init Tavern app.tavern.dm --web-dir dist
npx cap add ios && npx cap add android
npx cap sync && npx cap open ios
```

## Roadmap

- Multiplayer: the state model (authoritative campaign, tool-driven mutations, per-character messages) is designed so a host can relay turns to remote players.
- Voice input and text-to-speech narration.
- Map generation and battle grid.
