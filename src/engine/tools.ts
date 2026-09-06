import type { Ruleset, Monster } from '@/types/ruleset';
import type { Campaign, Character, Combatant, Entity, EntityType, PendingRoll, RollResult } from '@/types/campaign';
import type { ToolDef } from '@/llm/openrouter';
import { makeCheck, roll, describeRoll, type Advantage } from './dice';
import { abilityMod, armorClass, findClass, findItem, findMonster, findSpell, fuzzyFind, initiativeMod, monsterAbilityMod, saveMod, skillMod, proficiencyBonus, xpForNextLevel, weaponAttacks } from './rules';
import { findEntityByName, mergeEntity, newEntity, entityCard } from './memory';
import { characterBlock } from './prompt';
import { uid, truncate } from '@/util/id';

/* ------------------------------------------------------------------ */
/* Tool definitions                                                    */
/* ------------------------------------------------------------------ */

const str = (description: string, extra: Record<string, unknown> = {}) => ({ type: 'string', description, ...extra });
const num = (description: string) => ({ type: 'number', description });
const bool = (description: string) => ({ type: 'boolean', description });
const obj = (properties: Record<string, unknown>, required: string[] = []) => ({ type: 'object', properties, required, additionalProperties: false });
const fn = (name: string, description: string, parameters: Record<string, unknown>): ToolDef => ({ type: 'function', function: { name, description, parameters } });

export function dmTools(rs: Ruleset): ToolDef[] {
  const skillIds = rs.skills.map((s) => s.id);
  const abilityIds = rs.abilities.map((a) => a.id);
  return [
    fn('roll_check', 'Roll a d20 check for a character or combatant. The app computes the modifier from their sheet/stat block and rolls real dice. Use for skill checks, saving throws, attack rolls, ability checks, and initiative.', obj({
      character: str('Name of the character or combatant rolling'),
      kind: str('Type of roll', { enum: ['skill', 'save', 'ability', 'attack', 'custom'] }),
      skill: str('Skill id for kind=skill', { enum: skillIds }),
      ability: str('Ability id for kind=save/ability, or the attack ability for kind=attack', { enum: abilityIds }),
      dc: num('Difficulty class or target AC. Omit for opposed/open rolls.'),
      advantage: str('Advantage state', { enum: ['advantage', 'disadvantage', 'none'] }),
      label: str('Short human label, e.g. "Perception to spot the ambush" or "Goblin scimitar vs Kael"'),
      modifier: num('For kind=custom: the total flat modifier to add to the d20. For other kinds, an extra situational bonus/penalty.'),
      weapon: str('For kind=attack on a party member: the weapon name to use (optional)'),
    }, ['character', 'kind', 'label'])),
    fn('roll_dice', 'Roll arbitrary dice, e.g. damage "2d6+3", a random table "1d100", or "4d6kh3".', obj({ expression: str('Dice expression'), label: str('What the roll is for') }, ['expression', 'label'])),
    fn('apply_damage', 'Deal damage to a character or combatant (temp HP absorbs first). Returns new HP and whether they dropped.', obj({ target: str('Name'), amount: num('Damage amount'), type: str('Damage type'), source: str('What caused it') }, ['target', 'amount'])),
    fn('heal', 'Restore hit points to a character or combatant.', obj({ target: str('Name'), amount: num('HP to restore'), source: str('Source of healing') }, ['target', 'amount'])),
    fn('set_temp_hp', 'Grant temporary hit points (does not stack; keeps the higher value).', obj({ target: str('Name'), amount: num('Temp HP') }, ['target', 'amount'])),
    fn('set_condition', 'Add or remove a condition on a character or combatant.', obj({ target: str('Name'), condition: str('Condition name, e.g. prone, poisoned, frightened, grappled, unconscious'), remove: bool('true to remove the condition') }, ['target', 'condition'])),
    fn('death_save', 'Roll a death saving throw for a party member at 0 HP. The app tracks successes/failures, stabilizes at three successes and kills at three failures.', obj({ character: str('Name') }, ['character'])),
    fn('use_spell_slot', 'Expend a spell slot for a party member when they cast a leveled spell.', obj({ character: str('Name'), level: num('Slot level') }, ['character', 'level'])),
    fn('rest', 'Apply a short or long rest to the whole party (restores HP/slots per the rules) and advances time.', obj({ kind: str('Rest kind', { enum: ['short', 'long'] }), interrupted: bool('If true, the rest does not complete') }, ['kind'])),
    fn('give_item', 'Add an item to a party member\'s inventory. Use the ruleset item name when one exists.', obj({ character: str('Name'), item: str('Item name'), qty: num('Quantity (default 1)'), description: str('Description if it is a unique/custom item') }, ['character', 'item'])),
    fn('remove_item', 'Remove or consume an item from a party member\'s inventory.', obj({ character: str('Name'), item: str('Item name'), qty: num('Quantity (default 1)') }, ['character', 'item'])),
    fn('adjust_gold', 'Change a party member\'s coin (positive to give, negative to take).', obj({ character: str('Name'), delta: num('Amount in the base currency'), reason: str('Why') }, ['character', 'delta'])),
    fn('award_xp', 'Award experience points to every party member.', obj({ amount: num('XP per character'), reason: str('What earned it') }, ['amount', 'reason'])),
    fn('start_combat', 'Begin structured combat. Enemies are looked up in the ruleset bestiary by name when possible; otherwise provide custom stats. The app rolls initiative for everyone.', obj({
      enemies: { type: 'array', description: 'Enemy groups', items: obj({ name: str('Creature name (ruleset monster name if it exists)'), count: num('How many (default 1)'), label: str('Optional display name for a unique foe, e.g. "Grishnak the Butcher"'), hp: num('Custom max HP (optional)'), ac: num('Custom AC (optional)'), initiativeBonus: num('Custom initiative bonus (optional)') }, ['name']) },
      allies: { type: 'array', description: 'Non-party allies in the fight (optional)', items: obj({ name: str('Name'), hp: num('Max HP'), ac: num('AC'), initiativeBonus: num('Initiative bonus') }, ['name']) },
      surprise: str('Who is surprised, if anyone', { enum: ['none', 'party', 'enemies'] }),
    }, ['enemies'])),
    fn('advance_combat_turn', 'Advance the initiative tracker to the next combatant (skipping defeated ones). Returns whose turn it is.', obj({})),
    fn('end_combat', 'End structured combat.', obj({ outcome: str('victory | defeat | fled | parley | other'), summary: str('One-line summary') }, ['outcome'])),
    fn('upsert_entity', 'Create or update a world entity (NPC, location, faction, item, quest, lore, creature). This is your long-term memory: register anything named that might matter later.', obj({
      type: str('Entity type', { enum: ['npc', 'location', 'faction', 'item', 'quest', 'lore', 'creature'] }),
      name: str('Canonical name'),
      aliases: { type: 'array', items: { type: 'string' }, description: 'Other names/titles' },
      summary: str('One-line summary (who/what they are)'),
      description: str('Fuller description: appearance, manner, wants, secrets (DM-only ok)'),
      facts: { type: 'array', items: { type: 'string' }, description: 'Durable facts to append' },
      status: str('e.g. alive, dead, missing, ruined, sealed'),
      attitude: str('For NPCs/factions: attitude toward the party — hostile, wary, indifferent, friendly, devoted'),
      location: str('Name of the location entity where this is (for NPCs/items)'),
      tags: { type: 'array', items: { type: 'string' } },
      questStatus: str('For quests', { enum: ['active', 'completed', 'failed', 'hidden'] }),
      objectives: { type: 'array', items: { type: 'string' }, description: 'For quests: objective texts to add' },
      present: bool('Mark this entity as present in the current scene'),
    }, ['type', 'name', 'summary'])),
    fn('update_quest', 'Update a quest\'s status or objectives.', obj({ name: str('Quest name'), status: str('New status', { enum: ['active', 'completed', 'failed', 'hidden'] }), completeObjective: str('Text (or prefix) of an objective to mark done'), addObjective: str('New objective to add'), note: str('Fact to append') }, ['name'])),
    fn('record_fact', 'Record a durable canon fact about the world or story that must remain true from now on.', obj({ text: str('The fact, one sentence, specific'), category: str('e.g. history, geography, relationship, promise, death, discovery') }, ['text'])),
    fn('set_scene', 'Update the current scene: location, situation, who is present, time, weather, mood. Call whenever the party moves or the situation shifts.', obj({
      location: str('Location name (will be registered as a location entity)'),
      description: str('One-line description of the place'),
      situation: str('What is happening right now, one or two sentences'),
      present: { type: 'array', items: { type: 'string' }, description: 'Names of NPCs/creatures present (entities are created if missing)' },
      timeOfDay: str('e.g. dawn, morning, midday, afternoon, dusk, night, midnight'),
      weather: str('Weather / ambience'),
      mood: str('Emotional register, e.g. tense, festive, eerie'),
    }, [])),
    fn('advance_time', 'Advance the in-game clock.', obj({ minutes: num('Minutes'), hours: num('Hours'), days: num('Days'), timeOfDay: str('Resulting time of day label') }, [])),
    fn('illustrate', 'Generate an illustration of the current moment. Provide a rich, concrete visual prompt (subject, setting, lighting, mood, composition). Use sparingly.', obj({ prompt: str('Visual description'), kind: str('Image kind', { enum: ['scene', 'portrait', 'item', 'map'] }) }, ['prompt'])),
    fn('lookup_rule', 'Search the ruleset rules text and conditions.', obj({ query: str('Topic, e.g. "grappling", "cover", "exhaustion"') }, ['query'])),
    fn('lookup_spell', 'Get the full text of a spell from the ruleset.', obj({ name: str('Spell name') }, ['name'])),
    fn('lookup_monster', 'Get a creature\'s full stat block from the ruleset bestiary, or search by keyword/CR.', obj({ name: str('Creature name or keyword'), maxCr: num('Optional maximum CR when searching') }, ['name'])),
    fn('lookup_item', 'Get an item\'s details from the ruleset equipment list.', obj({ name: str('Item name') }, ['name'])),
    fn('lookup_character', 'Get the full detailed sheet for a party member.', obj({ name: str('Character name') }, ['name'])),
    fn('lookup_entity', 'Get the full record for a known world entity.', obj({ name: str('Entity name') }, ['name'])),
    fn('dm_note', 'Write a private note to yourself (a plan, a twist, a secret) that persists across sessions and is never shown to the player.', obj({ text: str('The note') }, ['text'])),
  ];
}

/* ------------------------------------------------------------------ */
/* Execution                                                           */
/* ------------------------------------------------------------------ */

export interface ToolContext {
  rs: Ruleset;
  get: () => Campaign;
  set: (fn: (c: Campaign) => Campaign) => void;
  onRoll: (r: RollResult) => void;
  onEvent: (text: string) => void;
  onIllustrate: (prompt: string, kind: string) => void;
  /** When false, player-character rolls become pending for the human to roll. */
  autoRoll: boolean;
}

export interface ToolOutcome {
  result: string;
  effect?: string;
  /** Set when the loop must stop and wait for the human (manual roll). */
  halt?: boolean;
}

function findCharacter(c: Campaign, name: string): Character | undefined {
  const chars = Object.values(c.characters);
  const q = name.trim().toLowerCase();
  return chars.find((x) => x.name.toLowerCase() === q) || chars.find((x) => x.name.toLowerCase().startsWith(q) || q.startsWith(x.name.toLowerCase().split(' ')[0])) || chars.find((x) => x.name.toLowerCase().includes(q));
}

function findCombatant(c: Campaign, name: string): Combatant | undefined {
  if (!c.combat?.active) return undefined;
  const q = name.trim().toLowerCase();
  const list = c.combat.combatants;
  return list.find((x) => x.name.toLowerCase() === q) || list.find((x) => !x.defeated && x.name.toLowerCase().includes(q)) || list.find((x) => x.name.toLowerCase().includes(q));
}

function monsterForCombatant(rs: Ruleset, cb: Combatant | undefined): Monster | undefined {
  return cb?.monsterId ? findMonster(rs, cb.monsterId) : undefined;
}

function setCharacterHp(ctx: ToolContext, ch: Character, hp: number, tempHp = ch.tempHp): void {
  ctx.set((c) => ({ ...c, characters: { ...c.characters, [ch.id]: { ...c.characters[ch.id], hp, tempHp } } }));
  // Mirror onto combatant if present
  ctx.set((c) => {
    if (!c.combat) return c;
    return { ...c, combat: { ...c.combat, combatants: c.combat.combatants.map((x) => (x.characterId === ch.id ? { ...x, hp, defeated: hp <= 0 && x.kind === 'enemy' } : x)) } };
  });
}

function setCombatantHp(ctx: ToolContext, cb: Combatant, hp: number): void {
  ctx.set((c) => c.combat ? { ...c, combat: { ...c.combat, combatants: c.combat.combatants.map((x) => (x.id === cb.id ? { ...x, hp, defeated: hp <= 0 } : x)) } } : c);
}

function ensureEntity(ctx: ToolContext, name: string, type: EntityType, extra: Partial<Entity> = {}): Entity {
  const c = ctx.get();
  const existing = findEntityByName(c, name, type) ?? findEntityByName(c, name);
  if (existing) {
    const merged = mergeEntity(existing, extra, c.turn);
    ctx.set((c2) => ({ ...c2, entities: { ...c2.entities, [merged.id]: merged } }));
    return merged;
  }
  const e = newEntity(c, { name, type, ...extra });
  ctx.set((c2) => ({ ...c2, entities: { ...c2.entities, [e.id]: e } }));
  return e;
}

export function executeTool(ctx: ToolContext, name: string, rawArgs: string): ToolOutcome {
  let args: any = {};
  try { args = rawArgs ? JSON.parse(rawArgs) : {}; } catch { return { result: 'ERROR: tool arguments were not valid JSON' }; }
  try {
    const h = handlers[name];
    if (!h) return { result: `ERROR: unknown tool ${name}` };
    return h(ctx, args);
  } catch (e) {
    return { result: `ERROR: ${(e as Error).message}` };
  }
}

type Handler = (ctx: ToolContext, a: any) => ToolOutcome;

const handlers: Record<string, Handler> = {
  roll_check(ctx, a) {
    const c = ctx.get();
    const rs = ctx.rs;
    const adv = (['advantage', 'disadvantage'].includes(a.advantage) ? a.advantage : 'none') as Advantage;
    const ch = findCharacter(c, a.character);
    const cb = ch ? undefined : findCombatant(c, a.character);
    if (!ch && !cb) return { result: `ERROR: no character or combatant named "${a.character}". Party: ${Object.values(c.characters).map((x) => x.name).join(', ')}${c.combat?.active ? '; combatants: ' + c.combat.combatants.map((x) => x.name).join(', ') : ''}` };
    const who = ch?.name ?? cb!.name;
    let modifier = Number(a.modifier ?? 0) || 0;
    let kindLabel = a.kind;
    if (ch) {
      if (a.kind === 'skill' && a.skill) modifier += skillMod(rs, ch, a.skill);
      else if (a.kind === 'save' && a.ability) modifier += saveMod(rs, ch, a.ability);
      else if (a.kind === 'ability' && a.ability) modifier += abilityMod(rs, ch.abilities[a.ability] ?? 10);
      else if (a.kind === 'attack') {
        const atks = weaponAttacks(rs, ch);
        const w = a.weapon ? atks.find((x) => x.name.toLowerCase().includes(String(a.weapon).toLowerCase())) : atks[0];
        if (w) modifier += w.attackBonus;
        else if (a.ability) modifier += abilityMod(rs, ch.abilities[a.ability] ?? 10) + proficiencyBonus(rs, ch.level);
        else { const cls = findClass(rs, ch.classId); const ab = cls?.spellcasting?.ability ?? 'str'; modifier += abilityMod(rs, ch.abilities[ab] ?? 10) + proficiencyBonus(rs, ch.level); }
      }
      // Manual rolling for the player character
      if (ch.kind === 'player' && !ctx.autoRoll) {
        const pending: PendingRoll = { id: uid('roll'), characterId: ch.id, kind: a.kind, label: a.label, skillId: a.skill, abilityId: a.ability, dc: a.dc, advantage: adv, expression: `1d20${modifier >= 0 ? '+' : ''}${modifier}`, reason: a.label };
        ctx.set((c2) => ({ ...c2, pendingRoll: pending }));
        return { result: `PENDING: the player will roll ${a.label} (${pending.expression}${a.dc ? ` vs DC ${a.dc}` : ''}) themselves. End your response now with the tension of the moment — do NOT narrate the result. You will be told the outcome next turn.`, halt: true };
      }
    } else if (cb) {
      const m = monsterForCombatant(rs, cb);
      if (m) {
        if (a.kind === 'skill' && a.skill) { const sk = rs.skills.find((s) => s.id === a.skill); modifier += m.skills?.[a.skill] ?? m.skills?.[sk?.name ?? ''] ?? (sk ? monsterAbilityMod(rs, m, sk.ability) : 0); }
        else if (a.kind === 'save' && a.ability) modifier += m.savingThrows?.[a.ability] ?? monsterAbilityMod(rs, m, a.ability);
        else if (a.kind === 'ability' && a.ability) modifier += monsterAbilityMod(rs, m, a.ability);
        else if (a.kind === 'attack') {
          const act = m.actions.find((x) => x.attackBonus !== undefined && (!a.weapon || x.name.toLowerCase().includes(String(a.weapon).toLowerCase()))) ?? m.actions.find((x) => x.attackBonus !== undefined);
          modifier += act?.attackBonus ?? (monsterAbilityMod(rs, m, 'str') + 2);
          kindLabel = `attack (${act?.name ?? 'attack'})`;
        }
      } else if (a.kind === 'attack') modifier += cb.notes ? 0 : 3;
    }
    const r = makeCheck({ label: a.label, modifier, dc: a.dc, advantage: adv, characterName: who, kind: kindLabel });
    ctx.onRoll(r);
    let extra = '';
    if (a.kind === 'attack' && a.dc !== undefined) extra = r.critical === 'hit' ? ' CRITICAL HIT — roll damage dice twice.' : r.critical === 'miss' ? ' Automatic miss.' : r.success ? ' HIT.' : ' MISS.';
    return { result: describeRoll(r) + extra };
  },

  roll_dice(ctx, a) {
    const d = roll(String(a.expression));
    const r: RollResult = { label: a.label, expression: d.expression, rolls: d.rolls, kept: d.kept, modifier: d.modifier, total: d.total, kind: 'dice' };
    ctx.onRoll(r);
    return { result: `${a.label}: ${d.total} (${d.expression} → [${d.rolls.join(', ')}]${d.modifier ? (d.modifier > 0 ? ' +' : ' ') + d.modifier : ''})` };
  },

  apply_damage(ctx, a) {
    const c = ctx.get();
    const amount = Math.max(0, Math.round(Number(a.amount) || 0));
    const ch = findCharacter(c, a.target);
    if (ch) {
      let remaining = amount;
      let temp = ch.tempHp;
      if (temp > 0) { const absorbed = Math.min(temp, remaining); temp -= absorbed; remaining -= absorbed; }
      const hp = Math.max(0, ch.hp - remaining);
      const massive = remaining - ch.hp >= ch.maxHp && ch.hp > 0;
      setCharacterHp(ctx, ch, hp, temp);
      let effect = `${ch.name} takes ${amount} ${a.type ?? ''} damage (${hp}/${ch.maxHp})`.replace('  ', ' ');
      if (hp === 0 && ch.hp > 0) {
        effect += massive ? ' — killed outright!' : ' — falls unconscious and is dying';
        ctx.set((c2) => ({ ...c2, characters: { ...c2.characters, [ch.id]: { ...c2.characters[ch.id], conditions: Array.from(new Set([...c2.characters[ch.id].conditions, 'unconscious'])) } } }));
      }
      ctx.onEvent(effect);
      return { result: `${ch.name}: ${amount} damage${temp !== ch.tempHp ? ` (${ch.tempHp - temp} absorbed by temp HP)` : ''}. HP now ${hp}/${ch.maxHp}.${hp === 0 ? (massive ? ' MASSIVE DAMAGE — instant death.' : ' They are at 0 HP: unconscious and dying (death saves each turn).') : ''}`, effect };
    }
    const cb = findCombatant(c, a.target);
    if (cb) {
      const hp = Math.max(0, cb.hp - amount);
      setCombatantHp(ctx, cb, hp);
      const effect = `${cb.name} takes ${amount} damage (${hp}/${cb.maxHp})${hp === 0 ? ' — defeated' : ''}`;
      ctx.onEvent(effect);
      return { result: `${cb.name}: ${amount} damage. HP now ${hp}/${cb.maxHp}.${hp === 0 ? ' DEFEATED.' : hp <= cb.maxHp / 4 ? ' Badly wounded.' : ''}`, effect };
    }
    return { result: `ERROR: no target named "${a.target}". If this is a new enemy, call start_combat first or describe the damage narratively.` };
  },

  heal(ctx, a) {
    const c = ctx.get();
    const amount = Math.max(0, Math.round(Number(a.amount) || 0));
    const ch = findCharacter(c, a.target);
    if (ch) {
      const hp = Math.min(ch.maxHp, ch.hp + amount);
      setCharacterHp(ctx, ch, hp);
      if (ch.hp === 0 && hp > 0) ctx.set((c2) => ({ ...c2, characters: { ...c2.characters, [ch.id]: { ...c2.characters[ch.id], conditions: c2.characters[ch.id].conditions.filter((x) => x !== 'unconscious'), deathSaves: { successes: 0, failures: 0 } } } }));
      const effect = `${ch.name} heals ${hp - ch.hp} (${hp}/${ch.maxHp})`;
      ctx.onEvent(effect);
      return { result: `${ch.name} regains ${hp - ch.hp} HP → ${hp}/${ch.maxHp}.`, effect };
    }
    const cb = findCombatant(c, a.target);
    if (cb) { const hp = Math.min(cb.maxHp, cb.hp + amount); setCombatantHp(ctx, cb, hp); return { result: `${cb.name} → ${hp}/${cb.maxHp}`, effect: `${cb.name} heals to ${hp}/${cb.maxHp}` }; }
    return { result: `ERROR: no target named "${a.target}"` };
  },

  set_temp_hp(ctx, a) {
    const ch = findCharacter(ctx.get(), a.target);
    if (!ch) return { result: `ERROR: no character "${a.target}"` };
    const t = Math.max(ch.tempHp, Math.round(Number(a.amount) || 0));
    setCharacterHp(ctx, ch, ch.hp, t);
    return { result: `${ch.name} has ${t} temporary HP.`, effect: `${ch.name} gains ${t} temp HP` };
  },

  set_condition(ctx, a) {
    const c = ctx.get();
    const cond = String(a.condition).toLowerCase().trim();
    const ch = findCharacter(c, a.target);
    if (ch) {
      const next = a.remove ? ch.conditions.filter((x) => x !== cond) : Array.from(new Set([...ch.conditions, cond]));
      ctx.set((c2) => ({ ...c2, characters: { ...c2.characters, [ch.id]: { ...c2.characters[ch.id], conditions: next } } }));
      ctx.set((c2) => c2.combat ? { ...c2, combat: { ...c2.combat, combatants: c2.combat.combatants.map((x) => x.characterId === ch.id ? { ...x, conditions: next } : x) } } : c2);
      const effect = `${ch.name} is ${a.remove ? 'no longer' : 'now'} ${cond}`;
      ctx.onEvent(effect);
      return { result: effect, effect };
    }
    const cb = findCombatant(c, a.target);
    if (cb) {
      const next = a.remove ? cb.conditions.filter((x) => x !== cond) : Array.from(new Set([...cb.conditions, cond]));
      ctx.set((c2) => c2.combat ? { ...c2, combat: { ...c2.combat, combatants: c2.combat.combatants.map((x) => x.id === cb.id ? { ...x, conditions: next } : x) } } : c2);
      const effect = `${cb.name} is ${a.remove ? 'no longer' : 'now'} ${cond}`;
      return { result: effect, effect };
    }
    return { result: `ERROR: no target "${a.target}"` };
  },

  death_save(ctx, a) {
    const c = ctx.get();
    const ch = findCharacter(c, a.character);
    if (!ch) return { result: `ERROR: no character "${a.character}"` };
    if (ch.hp > 0) return { result: `${ch.name} is not dying (HP ${ch.hp}).` };
    const rules = ctx.rs.mechanics.deathSaves ?? { successesNeeded: 3, failuresAllowed: 3 };
    const r = makeCheck({ label: 'Death saving throw', modifier: 0, dc: 10, characterName: ch.name, kind: 'death' });
    ctx.onRoll(r);
    const nat = r.kept?.[0] ?? r.rolls[0];
    let { successes, failures } = ch.deathSaves;
    let outcome = '';
    if (nat === 20) { outcome = `${ch.name} surges back to consciousness with 1 HP!`; setCharacterHp(ctx, ch, 1); successes = 0; failures = 0; ctx.set((c2) => ({ ...c2, characters: { ...c2.characters, [ch.id]: { ...c2.characters[ch.id], conditions: c2.characters[ch.id].conditions.filter((x) => x !== 'unconscious'), deathSaves: { successes: 0, failures: 0 } } } })); ctx.onEvent(outcome); return { result: outcome, effect: outcome }; }
    if (nat === 1) failures += 2; else if (r.success) successes += 1; else failures += 1;
    if (failures >= rules.failuresAllowed) outcome = `${ch.name} has died.`;
    else if (successes >= rules.successesNeeded) { outcome = `${ch.name} is stable (unconscious, 0 HP).`; successes = 0; failures = 0; }
    else outcome = `${ch.name}: ${successes} success${successes === 1 ? '' : 'es'}, ${failures} failure${failures === 1 ? '' : 's'}.`;
    ctx.set((c2) => ({ ...c2, characters: { ...c2.characters, [ch.id]: { ...c2.characters[ch.id], deathSaves: { successes, failures }, conditions: failures >= rules.failuresAllowed ? Array.from(new Set([...c2.characters[ch.id].conditions, 'dead'])) : c2.characters[ch.id].conditions } } }));
    ctx.onEvent(outcome);
    return { result: `${describeRoll(r)} — ${outcome}`, effect: outcome };
  },

  use_spell_slot(ctx, a) {
    const ch = findCharacter(ctx.get(), a.character);
    if (!ch) return { result: `ERROR: no character "${a.character}"` };
    const lvl = Number(a.level);
    const slot = ch.spells.slots[lvl];
    if (!slot) return { result: `${ch.name} has no level ${lvl} slots.` };
    if (slot.used >= slot.max) return { result: `${ch.name} has no level ${lvl} slots remaining (${slot.max - slot.used}/${slot.max}).` };
    ctx.set((c2) => ({ ...c2, characters: { ...c2.characters, [ch.id]: { ...c2.characters[ch.id], spells: { ...c2.characters[ch.id].spells, slots: { ...c2.characters[ch.id].spells.slots, [lvl]: { ...slot, used: slot.used + 1 } } } } } }));
    const effect = `${ch.name} expends a level ${lvl} slot (${slot.max - slot.used - 1} left)`;
    return { result: effect, effect };
  },

  rest(ctx, a) {
    const c = ctx.get();
    const rs = ctx.rs;
    const long = a.kind === 'long';
    if (a.interrupted) return { result: 'The rest was interrupted; no benefits applied.' };
    const lines: string[] = [];
    for (const id of c.partyIds) {
      const ch = c.characters[id];
      if (!ch) continue;
      let next: Character = { ...ch };
      if (long) {
        const slots = Object.fromEntries(Object.entries(ch.spells.slots).map(([k, v]) => [k, { ...v, used: 0 }]));
        next = { ...next, hp: ch.maxHp, tempHp: 0, hitDice: { ...ch.hitDice, used: Math.max(0, ch.hitDice.used - Math.max(1, Math.floor(ch.hitDice.total / 2))) }, spells: { ...ch.spells, slots }, deathSaves: { successes: 0, failures: 0 }, conditions: ch.conditions.filter((x) => !['unconscious', 'exhaustion'].includes(x)) };
        lines.push(`${ch.name}: full HP, slots restored`);
      } else {
        // Spend hit dice to heal up to max
        let hp = ch.hp; let used = ch.hitDice.used; const con = abilityMod(rs, ch.abilities.con ?? 10);
        while (hp < ch.maxHp && used < ch.hitDice.total) { hp = Math.min(ch.maxHp, hp + Math.max(1, roll(`1d${ch.hitDice.die}`).total + con)); used++; }
        next = { ...next, hp, hitDice: { ...ch.hitDice, used } };
        const cls = findClass(rs, ch.classId);
        if (cls?.spellcasting?.type === 'pact') next.spells = { ...ch.spells, slots: Object.fromEntries(Object.entries(ch.spells.slots).map(([k, v]) => [k, { ...v, used: 0 }])) };
        lines.push(`${ch.name}: HP ${hp}/${ch.maxHp} (spent ${used - ch.hitDice.used} hit dice)`);
      }
      ctx.set((c2) => ({ ...c2, characters: { ...c2.characters, [id]: next } }));
    }
    handlers.advance_time(ctx, long ? { hours: 8, timeOfDay: 'morning' } : { hours: 1 });
    const effect = `${long ? 'Long' : 'Short'} rest: ${lines.join('; ')}`;
    ctx.onEvent(effect);
    return { result: effect, effect };
  },

  give_item(ctx, a) {
    const ch = findCharacter(ctx.get(), a.character);
    if (!ch) return { result: `ERROR: no character "${a.character}"` };
    const it = fuzzyFind(ctx.rs.equipment, String(a.item));
    const qty = Math.max(1, Math.round(Number(a.qty) || 1));
    const existing = ch.inventory.find((i) => (it && i.itemId === it.id) || i.name.toLowerCase() === String(a.item).toLowerCase());
    let inventory;
    if (existing) inventory = ch.inventory.map((i) => i.id === existing.id ? { ...i, qty: i.qty + qty } : i);
    else inventory = [...ch.inventory, { id: uid('inv'), itemId: it?.id, name: it?.name ?? String(a.item), qty, category: it?.category ?? 'gear', description: a.description ?? it?.description, weight: it?.weight, equipped: false }];
    ctx.set((c2) => ({ ...c2, characters: { ...c2.characters, [ch.id]: { ...c2.characters[ch.id], inventory } } }));
    const effect = `${ch.name} receives ${qty > 1 ? qty + '× ' : ''}${it?.name ?? a.item}`;
    ctx.onEvent(effect);
    return { result: effect + (it ? ` (ruleset item: ${truncate(it.description ?? it.category, 160)})` : ' (custom item)'), effect };
  },

  remove_item(ctx, a) {
    const ch = findCharacter(ctx.get(), a.character);
    if (!ch) return { result: `ERROR: no character "${a.character}"` };
    const q = String(a.item).toLowerCase();
    const item = ch.inventory.find((i) => i.name.toLowerCase() === q) ?? ch.inventory.find((i) => i.name.toLowerCase().includes(q));
    if (!item) return { result: `${ch.name} has no "${a.item}". Inventory: ${ch.inventory.map((i) => i.name).join(', ')}` };
    const qty = Math.max(1, Math.round(Number(a.qty) || 1));
    const inventory = item.qty > qty ? ch.inventory.map((i) => i.id === item.id ? { ...i, qty: i.qty - qty } : i) : ch.inventory.filter((i) => i.id !== item.id);
    ctx.set((c2) => ({ ...c2, characters: { ...c2.characters, [ch.id]: { ...c2.characters[ch.id], inventory } } }));
    const effect = `${ch.name} loses ${qty > 1 ? qty + '× ' : ''}${item.name}`;
    ctx.onEvent(effect);
    return { result: effect, effect };
  },

  adjust_gold(ctx, a) {
    const ch = findCharacter(ctx.get(), a.character);
    if (!ch) return { result: `ERROR: no character "${a.character}"` };
    const delta = Math.round(Number(a.delta) || 0);
    const gold = Math.max(0, ch.gold + delta);
    ctx.set((c2) => ({ ...c2, characters: { ...c2.characters, [ch.id]: { ...c2.characters[ch.id], gold } } }));
    const effect = `${ch.name} ${delta >= 0 ? 'gains' : 'spends'} ${Math.abs(delta)} ${ctx.rs.labels.currency} (${gold} total)`;
    ctx.onEvent(effect);
    return { result: effect, effect };
  },

  award_xp(ctx, a) {
    const c = ctx.get();
    const amount = Math.max(0, Math.round(Number(a.amount) || 0));
    const ups: string[] = [];
    for (const id of c.partyIds) {
      const ch = c.characters[id]; if (!ch) continue;
      const xp = ch.xp + amount;
      ctx.set((c2) => ({ ...c2, characters: { ...c2.characters, [id]: { ...c2.characters[id], xp } } }));
      const next = xpForNextLevel(ctx.rs, ch.level);
      if (next !== null && xp >= next) ups.push(ch.name);
    }
    const effect = `+${amount} XP to the party — ${a.reason}${ups.length ? ` · LEVEL UP available: ${ups.join(', ')}` : ''}`;
    ctx.onEvent(effect);
    return { result: effect, effect };
  },

  start_combat(ctx, a) {
    const c = ctx.get();
    const rs = ctx.rs;
    const combatants: Combatant[] = [];
    for (const id of c.partyIds) {
      const ch = c.characters[id]; if (!ch) continue;
      const init = roll('1d20').total + initiativeMod(rs, ch);
      combatants.push({ id: uid('cb'), name: ch.name, kind: ch.kind === 'player' ? 'pc' : 'companion', characterId: ch.id, initiative: init, hp: ch.hp, maxHp: ch.maxHp, ac: armorClass(rs, ch).ac, conditions: [...ch.conditions] });
    }
    const groups: any[] = Array.isArray(a.enemies) ? a.enemies : [];
    const unknown: string[] = [];
    for (const g of groups) {
      const m = fuzzyFind(rs.monsters, String(g.name));
      const count = Math.min(12, Math.max(1, Math.round(Number(g.count) || 1)));
      for (let i = 0; i < count; i++) {
        const baseName = g.label ?? m?.name ?? String(g.name);
        const nm = count > 1 ? `${baseName} ${i + 1}` : baseName;
        const maxHp = Number(g.hp) || m?.hp.average || 11;
        const ac = Number(g.ac) || m?.ac || 12;
        const initBonus = Number(g.initiativeBonus) || (m ? monsterAbilityMod(rs, m, 'dex') : 0);
        combatants.push({ id: uid('cb'), name: nm, kind: 'enemy', monsterId: m?.id, initiative: roll('1d20').total + initBonus, hp: maxHp, maxHp, ac, conditions: a.surprise === 'enemies' ? ['surprised'] : [], notes: m ? undefined : 'custom' });
        if (!m) unknown.push(String(g.name));
      }
    }
    for (const al of Array.isArray(a.allies) ? a.allies : []) {
      combatants.push({ id: uid('cb'), name: String(al.name), kind: 'ally', initiative: roll('1d20').total + (Number(al.initiativeBonus) || 0), hp: Number(al.hp) || 10, maxHp: Number(al.hp) || 10, ac: Number(al.ac) || 12, conditions: [] });
    }
    if (a.surprise === 'party') for (const x of combatants) if (x.kind === 'pc' || x.kind === 'companion') x.conditions.push('surprised');
    combatants.sort((x, y) => y.initiative - x.initiative);
    ctx.set((c2) => ({ ...c2, combat: { active: true, round: 1, turnIndex: 0, combatants, startedTurn: c2.turn, log: [] } }));
    const order = combatants.map((x) => `${x.initiative} ${x.name} (HP ${x.hp}, AC ${x.ac})`).join('; ');
    ctx.onEvent(`Combat begins! Initiative: ${combatants.map((x) => `${x.name} ${x.initiative}`).join(', ')}`);
    const blocks = Array.from(new Set(combatants.filter((x) => x.monsterId).map((x) => x.monsterId!))).map((id) => { const m = findMonster(rs, id)!; return `${m.name}: ${m.actions.map((ac) => `${ac.name}${ac.attackBonus !== undefined ? ` +${ac.attackBonus} to hit` : ''}${ac.damage ? ` ${ac.damage} ${ac.damageType ?? ''}` : ''}`).join('; ')}${m.traits?.length ? ` | Traits: ${m.traits.map((t) => t.name).join(', ')}` : ''}`; });
    return { result: `Combat started. Initiative order: ${order}. First up: ${combatants[0]?.name}.${unknown.length ? ` (Not in bestiary, used custom stats: ${unknown.join(', ')})` : ''}\n${blocks.join('\n')}\nRun the round in order. When it is the player character's turn, stop and ask what they do. Surprised creatures skip their first turn.` };
  },

  advance_combat_turn(ctx) {
    const c = ctx.get();
    if (!c.combat?.active) return { result: 'No combat is active.' };
    const cb = c.combat;
    const n = cb.combatants.length;
    let idx = cb.turnIndex; let round = cb.round;
    for (let i = 0; i < n; i++) {
      idx = (idx + 1) % n;
      if (idx === 0) round++;
      const x = cb.combatants[idx];
      if (!x.defeated && !(x.characterId && c.characters[x.characterId]?.hp === 0 && x.kind !== 'pc')) break;
    }
    // clear 'surprised' after round 1
    const combatants = round > 1 ? cb.combatants.map((x) => ({ ...x, conditions: x.conditions.filter((k) => k !== 'surprised') })) : cb.combatants;
    ctx.set((c2) => c2.combat ? { ...c2, combat: { ...c2.combat, turnIndex: idx, round, combatants } } : c2);
    const cur = combatants[idx];
    const alive = combatants.filter((x) => x.kind === 'enemy' && !x.defeated).length;
    return { result: `Round ${round}: it is ${cur.name}'s turn [${cur.kind}] (HP ${cur.hp}/${cur.maxHp}). ${alive === 0 ? 'No enemies remain standing — consider end_combat.' : ''}${cur.kind === 'pc' ? ' Stop and ask the player what they do.' : ''}` };
  },

  end_combat(ctx, a) {
    const c = ctx.get();
    if (!c.combat) return { result: 'No combat is active.' };
    const xp = c.combat.combatants.filter((x) => x.kind === 'enemy' && x.monsterId).reduce((s, x) => s + (findMonster(ctx.rs, x.monsterId!)?.xp ?? 0), 0);
    ctx.set((c2) => ({ ...c2, combat: null }));
    const effect = `Combat ends — ${a.outcome}${a.summary ? `: ${a.summary}` : ''}`;
    ctx.onEvent(effect);
    return { result: `${effect}. Bestiary XP for defeated foes totals ${xp}; call award_xp with an appropriate per-character share (e.g. full total for a solo hero, split for a party) if they earned it.`, effect };
  },

  upsert_entity(ctx, a) {
    const c = ctx.get();
    const type = (['npc', 'location', 'faction', 'item', 'quest', 'lore', 'creature'].includes(a.type) ? a.type : 'lore') as EntityType;
    let locationId: string | undefined;
    if (a.location) locationId = ensureEntity(ctx, String(a.location), 'location').id;
    const extra: Partial<Entity> = {
      aliases: Array.isArray(a.aliases) ? a.aliases.map(String) : undefined,
      summary: a.summary, description: a.description, facts: Array.isArray(a.facts) ? a.facts.map(String) : undefined,
      status: a.status, attitude: a.attitude, tags: Array.isArray(a.tags) ? a.tags.map(String) : undefined, locationId,
      questStatus: type === 'quest' ? (a.questStatus ?? 'active') : undefined,
    };
    const e = ensureEntity(ctx, String(a.name), type, extra);
    if (Array.isArray(a.objectives) && a.objectives.length) {
      const objs = [...(e.objectives ?? [])];
      for (const o of a.objectives) if (!objs.some((x) => x.text === String(o))) objs.push({ text: String(o), done: false });
      ctx.set((c2) => ({ ...c2, entities: { ...c2.entities, [e.id]: { ...c2.entities[e.id], objectives: objs } } }));
    }
    if (a.present) ctx.set((c2) => ({ ...c2, scene: { ...c2.scene, presentEntityIds: Array.from(new Set([...c2.scene.presentEntityIds, e.id])) } }));
    const isNew = !c.entities[e.id];
    return { result: `${isNew ? 'Registered' : 'Updated'} ${type} "${e.name}".`, effect: isNew ? `New ${type}: ${e.name}` : undefined };
  },

  update_quest(ctx, a) {
    const c = ctx.get();
    let q = findEntityByName(c, String(a.name), 'quest');
    if (!q) q = ensureEntity(ctx, String(a.name), 'quest', { summary: a.note ?? '', questStatus: 'active' });
    const objectives = [...(q.objectives ?? [])];
    if (a.completeObjective) { const t = String(a.completeObjective).toLowerCase(); for (const o of objectives) if (o.text.toLowerCase().startsWith(t) || o.text.toLowerCase().includes(t)) o.done = true; }
    if (a.addObjective) objectives.push({ text: String(a.addObjective), done: false });
    const facts = a.note ? [...q.facts, String(a.note)] : q.facts;
    const questStatus = a.status ?? q.questStatus;
    ctx.set((c2) => ({ ...c2, entities: { ...c2.entities, [q!.id]: { ...c2.entities[q!.id], objectives, facts, questStatus, updatedAt: Date.now(), lastSeenTurn: c2.turn } } }));
    const effect = a.status && a.status !== q.questStatus ? `Quest ${questStatus}: ${q.name}` : a.completeObjective ? `Objective complete: ${a.completeObjective}` : a.addObjective ? `New objective: ${a.addObjective}` : undefined;
    if (effect) ctx.onEvent(effect);
    return { result: `Quest "${q.name}" updated (${questStatus}).`, effect };
  },

  record_fact(ctx, a) {
    const c = ctx.get();
    const fact = { id: uid('fact'), text: String(a.text), turn: c.turn, createdAt: Date.now(), category: a.category };
    ctx.set((c2) => ({ ...c2, world: { ...c2.world, canon: [...c2.world.canon, fact] } }));
    return { result: 'Recorded.', effect: `Canon: ${truncate(String(a.text), 90)}` };
  },

  set_scene(ctx, a) {
    const patch: Partial<Campaign['scene']> = {};
    if (a.location) { const loc = ensureEntity(ctx, String(a.location), 'location', { summary: a.description ?? undefined }); patch.locationId = loc.id; patch.locationName = loc.name; }
    if (a.description) patch.description = String(a.description);
    if (a.situation) patch.situation = String(a.situation);
    if (a.timeOfDay) patch.timeOfDay = String(a.timeOfDay);
    if (a.weather !== undefined) patch.weather = String(a.weather);
    if (a.mood) patch.mood = String(a.mood);
    if (Array.isArray(a.present)) patch.presentEntityIds = a.present.map((n: string) => ensureEntity(ctx, String(n), 'npc', { locationId: patch.locationId }).id);
    ctx.set((c2) => ({ ...c2, scene: { ...c2.scene, ...patch, ...(a.timeOfDay ? {} : {}) }, world: a.timeOfDay ? { ...c2.world, calendar: { ...c2.world.calendar, timeOfDay: String(a.timeOfDay) } } : c2.world }));
    const effect = a.location ? `Scene: ${a.location}` : undefined;
    return { result: 'Scene updated.', effect };
  },

  advance_time(ctx, a) {
    const mins = (Number(a.minutes) || 0) + (Number(a.hours) || 0) * 60 + (Number(a.days) || 0) * 1440;
    ctx.set((c2) => {
      const cal = { ...c2.world.calendar };
      cal.elapsedMinutes += mins;
      const prevDays = Math.floor((cal.elapsedMinutes - mins) / 1440);
      const newDays = Math.floor(cal.elapsedMinutes / 1440);
      cal.day += newDays - prevDays;
      if (a.timeOfDay) cal.timeOfDay = String(a.timeOfDay);
      else if (mins > 0) {
        const hour = Math.floor((cal.elapsedMinutes % 1440) / 60);
        cal.timeOfDay = hour < 5 ? 'deep night' : hour < 7 ? 'dawn' : hour < 12 ? 'morning' : hour < 14 ? 'midday' : hour < 18 ? 'afternoon' : hour < 20 ? 'dusk' : 'night';
      }
      return { ...c2, world: { ...c2.world, calendar: cal }, scene: { ...c2.scene, timeOfDay: cal.timeOfDay } };
    });
    const cal = ctx.get().world.calendar;
    const label = mins >= 1440 ? `${Math.round(mins / 1440)} day(s)` : mins >= 60 ? `${Math.round(mins / 60)} hour(s)` : `${mins} minute(s)`;
    return { result: `Time advanced ${label}. It is now day ${cal.day}, ${cal.timeOfDay}.`, effect: mins >= 60 ? `Time passes: ${label}` : undefined };
  },

  illustrate(ctx, a) {
    ctx.onIllustrate(String(a.prompt), String(a.kind ?? 'scene'));
    return { result: 'Illustration requested; it will appear for the player. Continue narrating.', effect: 'Illustration' };
  },

  lookup_rule(ctx, a) {
    const q = String(a.query).toLowerCase();
    const rs = ctx.rs;
    const rules = rs.mechanics.coreRules.filter((r) => r.title.toLowerCase().includes(q) || r.text.toLowerCase().includes(q) || (r.tags ?? []).some((t) => t.includes(q)));
    const conds = rs.conditions.filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    const out = [...rules.map((r) => `## ${r.title}\n${r.text}`), ...conds.map((c) => `Condition — ${c.name}: ${c.description}`)];
    return { result: out.length ? out.slice(0, 4).join('\n\n') : `No rule found for "${a.query}". Adjudicate with the core rules and common sense.` };
  },

  lookup_spell(ctx, a) {
    const s = fuzzyFind(ctx.rs.spells, String(a.name));
    if (!s) return { result: `No spell named "${a.name}" in this ruleset.` };
    return { result: `${s.name} — level ${s.level} ${s.school}${s.ritual ? ' (ritual)' : ''}. Casting time ${s.castingTime}; range ${s.range}; components ${s.components}; duration ${s.duration}${s.concentration ? ' (concentration)' : ''}.\n${s.description}${s.higherLevels ? `\nAt higher levels: ${s.higherLevels}` : ''}${s.damage ? `\nDamage: ${s.damage.dice} ${s.damage.type}${s.damage.scaling ? ` (${s.damage.scaling})` : ''}` : ''}` };
  },

  lookup_monster(ctx, a) {
    const rs = ctx.rs;
    const m = fuzzyFind(rs.monsters, String(a.name));
    if (m) return { result: monsterBlock(m) };
    const q = String(a.name).toLowerCase();
    const maxCr = a.maxCr !== undefined ? Number(a.maxCr) : Infinity;
    const hits = rs.monsters.filter((x) => (x.type.toLowerCase().includes(q) || (x.tags ?? []).some((t) => t.includes(q)) || x.name.toLowerCase().includes(q)) && crNum(x.cr) <= maxCr).slice(0, 12);
    return { result: hits.length ? `Matches: ${hits.map((x) => `${x.name} (CR ${x.cr}, ${x.type})`).join('; ')}` : `No creature matching "${a.name}". You may invent one and pass custom hp/ac to start_combat.` };
  },

  lookup_item(ctx, a) {
    const it = fuzzyFind(ctx.rs.equipment, String(a.name));
    if (!it) return { result: `No item named "${a.name}" in this ruleset (custom items are fine — describe them).` };
    const parts = [`${it.name} (${it.category}${it.rarity ? `, ${it.rarity}` : ''})`];
    if (it.cost) parts.push(`${it.cost.amount} ${it.cost.unit}`);
    if (it.weapon) parts.push(`${it.weapon.damage} ${it.weapon.damageType}, ${it.weapon.properties.join(', ')}${it.weapon.range ? `, range ${it.weapon.range.normal}/${it.weapon.range.long}` : ''}`);
    if (it.armor) parts.push(`AC ${it.armor.baseAc} (${it.armor.dexBonus} dex)${it.armor.stealthDisadvantage ? ', stealth disadvantage' : ''}`);
    if (it.description) parts.push(it.description);
    return { result: parts.join(' · ') };
  },

  lookup_character(ctx, a) {
    const ch = findCharacter(ctx.get(), String(a.name));
    if (!ch) return { result: `No party member named "${a.name}".` };
    return { result: characterBlock(ctx.rs, ch, { detailed: true }) };
  },

  lookup_entity(ctx, a) {
    const c = ctx.get();
    const e = findEntityByName(c, String(a.name));
    if (!e) return { result: `No entity named "${a.name}". Known: ${Object.values(c.entities).slice(0, 60).map((x) => x.name).join(', ')}` };
    return { result: entityCard(e, c, true) };
  },

  dm_note(ctx, a) {
    ctx.set((c2) => ({ ...c2, world: { ...c2.world, secrets: [...c2.world.secrets, String(a.text)] } }));
    return { result: 'Noted.' };
  },
};

function crNum(cr: string): number { if (cr.includes('/')) { const [x, y] = cr.split('/').map(Number); return x / y; } return Number(cr) || 0; }

export function monsterBlock(m: Monster): string {
  const ab = Object.entries(m.abilities).map(([k, v]) => `${k.toUpperCase()} ${v}`).join(' ');
  const lines = [
    `${m.name} — ${m.size} ${m.type}, ${m.alignment}. AC ${m.ac}${m.acNote ? ` (${m.acNote})` : ''}, HP ${m.hp.average} (${m.hp.formula}), Speed ${m.speed}. CR ${m.cr} (${m.xp} XP).`,
    ab,
  ];
  if (m.savingThrows && Object.keys(m.savingThrows).length) lines.push('Saves: ' + Object.entries(m.savingThrows).map(([k, v]) => `${k.toUpperCase()} +${v}`).join(', '));
  if (m.skills && Object.keys(m.skills).length) lines.push('Skills: ' + Object.entries(m.skills).map(([k, v]) => `${k} +${v}`).join(', '));
  if (m.damageResistances?.length) lines.push('Resistances: ' + m.damageResistances.join(', '));
  if (m.damageImmunities?.length) lines.push('Immunities: ' + m.damageImmunities.join(', '));
  if (m.conditionImmunities?.length) lines.push('Condition immunities: ' + m.conditionImmunities.join(', '));
  lines.push(`Senses: ${m.senses}. Languages: ${m.languages}.`);
  if (m.traits?.length) lines.push('Traits: ' + m.traits.map((t) => `${t.name}. ${t.description}`).join(' '));
  lines.push('Actions: ' + m.actions.map((t) => `${t.name}${t.attackBonus !== undefined ? ` (+${t.attackBonus} to hit${t.damage ? `, ${t.damage} ${t.damageType ?? ''}` : ''})` : ''}. ${t.description}`).join(' '));
  if (m.reactions?.length) lines.push('Reactions: ' + m.reactions.map((t) => `${t.name}. ${t.description}`).join(' '));
  if (m.legendaryActions?.length) lines.push('Legendary: ' + m.legendaryActions.map((t) => `${t.name}. ${t.description}`).join(' '));
  return lines.join('\n');
}
