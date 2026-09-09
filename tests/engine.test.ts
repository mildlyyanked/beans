import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluate } from '../src/engine/expr';
import { parseDice, roll, makeCheck } from '../src/engine/dice';
import { srdRuleset as rs } from '../src/data/srd';
import { abilityMod, proficiencyBonus, levelForXp, armorClass, skillMod, spellSlotsFor, findClass, applyLevelUp, fuzzyFind } from '../src/engine/rules';
import { buildCharacter, autoAssignAbilities, autoChoices, finalAbilities } from '../src/engine/character';
import { validateRuleset } from '../src/engine/schema';
import { rankEntities, newEntity, mergeEntity, chunkToSummarize } from '../src/engine/memory';
import { executeTool } from '../src/engine/tools';
import type { Campaign } from '../src/types/campaign';

test('expression evaluator', () => {
  assert.equal(evaluate('floor((score - 10) / 2)', { score: 15 }), 2);
  assert.equal(evaluate('floor((score - 10) / 2)', { score: 9 }), -1);
  assert.equal(evaluate('10 + dex', { dex: 3 }), 13);
  assert.equal(evaluate('max(1, min(5, x))', { x: 9 }), 5);
  assert.equal(evaluate('unknown + 2'), 2);
  assert.throws(() => evaluate('1 +'));
});

test('dice parsing and rolling', () => {
  const p = parseDice('2d6+1d4+3');
  assert.equal(p.terms.length, 2); assert.equal(p.modifier, 3);
  for (let i = 0; i < 200; i++) { const r = roll('4d6kh3'); assert.ok(r.total >= 3 && r.total <= 18); assert.equal(r.kept.length, 3); }
  for (let i = 0; i < 100; i++) { const r = roll('1d20-1'); assert.ok(r.total >= 0 && r.total <= 19); }
  assert.throws(() => parseDice('2x6'));
  const c = makeCheck({ label: 't', modifier: 5, dc: 10, advantage: 'advantage' });
  assert.equal(c.rolls.length, 2); assert.equal(c.total, (c.kept![0]) + 5); assert.equal(c.success, c.total >= 10);
});

test('srd ruleset validates and core math', () => {
  const v = validateRuleset(rs); assert.ok(v.ok);
  assert.equal(abilityMod(rs, 10), 0); assert.equal(abilityMod(rs, 20), 5); assert.equal(abilityMod(rs, 8), -1);
  assert.equal(proficiencyBonus(rs, 1), 2); assert.equal(proficiencyBonus(rs, 5), 3); assert.equal(proficiencyBonus(rs, 17), 6);
  assert.equal(levelForXp(rs, 0), 1); assert.equal(levelForXp(rs, 300), 2); assert.equal(levelForXp(rs, 899), 2); assert.equal(levelForXp(rs, 355000), 20);
  assert.deepEqual(Object.keys(spellSlotsFor(rs, findClass(rs, 'wizard'), 5)), ['1', '2', '3']);
  assert.equal(spellSlotsFor(rs, findClass(rs, 'paladin'), 1)[1], undefined);
  assert.equal(spellSlotsFor(rs, findClass(rs, 'warlock'), 5)[3]?.max, 2);
  assert.equal(fuzzyFind(rs.monsters, 'Goblin')?.id, 'goblin');
  assert.equal(fuzzyFind(rs.spells, 'Magic Missile')?.id, 'magic-missile');
});

function hero(classId = 'fighter', speciesId = 'human') {
  const cls = findClass(rs, classId)!; const bg = rs.backgrounds[0];
  const base = autoAssignAbilities(rs, cls);
  return buildCharacter(rs, { name: 'Test', kind: 'player', speciesId, classId, backgroundId: bg.id, baseAbilities: base, ...autoChoices(rs, cls, bg, 1, base), persona: { personality: '', ideals: '', bonds: '', flaws: '', voice: '', backstory: '', appearance: '' } });
}

test('character build: fighter has chain mail AC and level-up works', () => {
  const ch = hero();
  assert.equal(finalAbilities(rs, { baseAbilities: { str: 15 }, speciesId: 'human' }).str, 16);
  assert.ok(armorClass(rs, ch).ac >= 16);
  assert.ok(ch.maxHp >= 10);
  assert.ok(skillMod(rs, ch, 'athletics') >= 2);
  const up = applyLevelUp(rs, { ...ch, xp: 300 });
  assert.equal(up.character.level, 2); assert.ok(up.hpGained >= 6); assert.ok(up.newFeatures.some((f) => f.name === 'Action Surge'));
  const monk = hero('monk', 'elf');
  assert.equal(armorClass(rs, monk).source, 'Unarmored Defense');
  const wiz = hero('wizard', 'gnome');
  assert.ok(wiz.spells.cantrips.length === 3 && wiz.spells.known.length >= 1 && wiz.spells.slots[1].max === 2);
});

function campaign(): Campaign {
  const pc = hero();
  return {
    id: 'c', name: 'T', rulesetId: rs.id, createdAt: 0, updatedAt: 0, turn: 5,
    world: { premise: '', setting: '', tone: '', themes: [], contentRating: 'pg13', openingHook: '', canon: [], calendar: { day: 1, timeOfDay: 'morning', elapsedMinutes: 480 }, bible: '', secrets: [] },
    scene: { locationName: 'Inn', description: '', presentEntityIds: [], timeOfDay: 'morning', weather: '', mood: '', situation: '' },
    characters: { [pc.id]: pc }, playerCharacterId: pc.id, partyIds: [pc.id], entities: {}, chronicle: [], messages: [], combat: null, pendingRoll: null,
    settings: { autoRoll: true, companionsSpeak: false, autoIllustrate: false, narrationLength: 'standard', difficulty: 'normal', contextWindowMessages: 20 }, images: {},
  };
}

test('memory: ranking prefers mentioned, present, and pinned entities', () => {
  const c = campaign();
  const a = newEntity(c, { name: 'Marla Voss', type: 'npc', summary: 'innkeeper' });
  const b = newEntity(c, { name: 'Old Mill', type: 'location', summary: 'ruin', pinned: true });
  const d = newEntity(c, { name: 'Forgotten', type: 'lore', summary: 'x', lastSeenTurn: -20 });
  c.entities = { [a.id]: a, [b.id]: b, [d.id]: d };
  const ranked = rankEntities(c, [{ id: 'm', role: 'dm', content: 'Marla Voss smiles', createdAt: 0, turn: 5 }], 10);
  assert.equal(ranked[0].id, a.id);
  assert.ok(ranked.some((e) => e.id === b.id));
  const merged = mergeEntity(a, { facts: ['owes a debt'], attitude: 'wary' }, 6);
  assert.deepEqual(merged.facts, ['owes a debt']); assert.equal(merged.attitude, 'wary'); assert.equal(merged.mentions, 2);
  // summarization threshold
  for (let i = 0; i < 60; i++) c.messages.push({ id: 'm' + i, role: i % 2 ? 'dm' : 'player', content: 'x', createdAt: 0, turn: Math.floor(i / 2) });
  const chunk = chunkToSummarize(c);
  assert.ok(chunk && chunk.length >= 20 && chunk.length < 60);
});

test('tools mutate authoritative state', () => {
  let c = campaign();
  const rolls: string[] = []; const events: string[] = [];
  const ctx = { rs, get: () => c, set: (fn: (x: Campaign) => Campaign) => { c = fn(c); }, onRoll: (r: any) => rolls.push(r.label), onEvent: (e: string) => events.push(e), onIllustrate: () => {}, autoRoll: true };
  const pc = () => c.characters[c.playerCharacterId];
  assert.match(executeTool(ctx, 'roll_check', JSON.stringify({ character: 'Test', kind: 'skill', skill: 'perception', dc: 10, label: 'Spot' })).result, /Spot: \d+/);
  assert.equal(rolls.length, 1);
  executeTool(ctx, 'apply_damage', JSON.stringify({ target: 'Test', amount: 4, type: 'fire' }));
  assert.equal(pc().hp, pc().maxHp - 4);
  executeTool(ctx, 'heal', JSON.stringify({ target: 'Test', amount: 99 }));
  assert.equal(pc().hp, pc().maxHp);
  executeTool(ctx, 'start_combat', JSON.stringify({ enemies: [{ name: 'goblin', count: 2 }] }));
  assert.ok(c.combat?.active && c.combat.combatants.length === 3);
  const g = c.combat!.combatants.find((x) => x.name === 'Goblin 1')!;
  executeTool(ctx, 'apply_damage', JSON.stringify({ target: 'Goblin 1', amount: 100 }));
  assert.ok(c.combat!.combatants.find((x) => x.id === g.id)!.defeated);
  assert.match(executeTool(ctx, 'end_combat', JSON.stringify({ outcome: 'victory' })).result, /XP/);
  assert.equal(c.combat, null);
  executeTool(ctx, 'upsert_entity', JSON.stringify({ type: 'npc', name: 'Marla', summary: 'innkeeper', facts: ['sharp'], present: true }));
  const marla = Object.values(c.entities).find((e) => e.name === 'Marla')!;
  assert.ok(marla && c.scene.presentEntityIds.includes(marla.id));
  executeTool(ctx, 'upsert_entity', JSON.stringify({ type: 'npc', name: 'marla', summary: 'innkeeper of the Bell', facts: ['keeps a crossbow'] }));
  assert.equal(Object.values(c.entities).filter((e) => e.type === 'npc').length, 1);
  assert.deepEqual(c.entities[marla.id].facts, ['sharp', 'keeps a crossbow']);
  executeTool(ctx, 'set_scene', JSON.stringify({ location: 'The Tower', situation: 'bell ringing', timeOfDay: 'dusk' }));
  assert.equal(c.scene.locationName, 'The Tower'); assert.equal(c.world.calendar.timeOfDay, 'dusk');
  executeTool(ctx, 'advance_time', JSON.stringify({ hours: 10 }));
  assert.equal(c.world.calendar.day, 1);
  executeTool(ctx, 'advance_time', JSON.stringify({ hours: 10 }));
  assert.equal(c.world.calendar.day, 2);
  executeTool(ctx, 'award_xp', JSON.stringify({ amount: 300, reason: 'test' }));
  assert.equal(pc().xp, 300);
  executeTool(ctx, 'give_item', JSON.stringify({ character: 'Test', item: 'Potion of Healing', qty: 2 }));
  assert.ok(pc().inventory.some((i) => i.itemId === 'potion-of-healing' && i.qty === 2));
  executeTool(ctx, 'record_fact', JSON.stringify({ text: 'The bell is cursed.' }));
  assert.equal(c.world.canon.length, 1);
  // manual mode halts for player rolls
  const manual = { ...ctx, autoRoll: false };
  const out = executeTool(manual, 'roll_check', JSON.stringify({ character: 'Test', kind: 'save', ability: 'dex', dc: 12, label: 'Dodge' }));
  assert.ok(out.halt && c.pendingRoll?.label === 'Dodge');
  // death saves
  executeTool(ctx, 'apply_damage', JSON.stringify({ target: 'Test', amount: 500 }));
  assert.equal(pc().hp, 0);
  const ds = executeTool(ctx, 'death_save', JSON.stringify({ character: 'Test' }));
  assert.match(ds.result, /Death saving throw/);
});

test('map: relative placement is consistent and travel is recorded', async () => {
  const { placeLocation, recordTravel, mapModel, parseDirection, parseDistance } = await import('../src/engine/map');
  let c = campaign();
  const inn = newEntity(c, { name: 'The Drowned Bell', type: 'location', summary: 'inn' });
  inn.map = placeLocation(c, inn);
  c.entities[inn.id] = inn; c.scene.locationId = inn.id;
  assert.deepEqual([inn.map.x, inn.map.y], [0, 0]);
  const tower = newEntity(c, { name: 'Church Tower', type: 'location', summary: '' });
  tower.map = placeLocation(c, tower, { relativeToId: inn.id, direction: parseDirection('north'), distance: parseDistance('near') });
  c.entities[tower.id] = tower;
  assert.ok(tower.map.y < -2 && Math.abs(tower.map.x) < 0.01, 'north is up');
  const room = newEntity(c, { name: 'Bell Loft', type: 'location', summary: '', parentId: tower.id });
  room.map = placeLocation(c, room, { relativeToId: tower.id, direction: 'inside' });
  c.entities[room.id] = room;
  assert.ok(Math.hypot(room.map.x - tower.map.x, room.map.y - tower.map.y) < 1.5, 'rooms cluster inside their parent');
  const clash = newEntity(c, { name: 'Twin', type: 'location', summary: '' });
  clash.map = placeLocation(c, clash, { relativeToId: inn.id, direction: 'n', distance: 'near' });
  assert.ok(Math.hypot(clash.map.x - tower.map.x, clash.map.y - tower.map.y) >= 1.2, 'overlapping placements are nudged apart');
  c = recordTravel(c, inn.id, tower.id);
  c = recordTravel(c, tower.id, room.id);
  assert.equal(c.travel!.routes.length, 1, 'no route drawn into a nested room');
  const m = mapModel({ ...c, scene: { ...c.scene, locationId: tower.id } });
  assert.equal(m.nodes.find((n) => n.current)?.name, 'Church Tower');
});
