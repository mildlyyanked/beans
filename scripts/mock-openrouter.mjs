/**
 * Mock OpenAI-compatible server emulating the subset of OpenRouter that Tavern uses.
 * Streams SSE, emits tool calls, answers JSON-mode requests, and returns images.
 * Usage: node scripts/mock-openrouter.mjs [port]
 */
import http from 'node:http';

const PORT = Number(process.argv[2] ?? 8787);
const IMG = 'data:image/svg+xml;base64,' + Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b1d4d"/><stop offset="0.6" stop-color="#7a3b2e"/><stop offset="1" stop-color="#e2b85b"/></linearGradient></defs><rect width="640" height="360" fill="url(#g)"/><circle cx="500" cy="90" r="46" fill="#f3d58a" opacity="0.9"/><path d="M0 300 L120 200 L220 260 L330 150 L450 240 L560 190 L640 250 L640 360 L0 360Z" fill="#0b0a10" opacity="0.85"/></svg>`).toString('base64');

const json = (res, obj, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }); res.end(JSON.stringify(obj)); };
const sse = (res) => { res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Access-Control-Allow-Origin': '*' }); return (o) => res.write(`data: ${JSON.stringify(o)}\n\n`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const text = (m) => (typeof m?.content === 'string' ? m.content : Array.isArray(m?.content) ? m.content.map((p) => p.text ?? '').join(' ') : '');
// The app merges consecutive user-role messages (companion lines, dice) — only the last paragraph is the player's action.
const lastLine = (s) => s.trim().split(/\n\n+/).pop() ?? '';

function jsonReply(system, user) {
  if (/master worldbuilder/i.test(system)) return {
    suggestedName: 'The Drowned Bell', premise: 'A frontier town where the dead have stopped staying buried, and the only priest has gone missing.', setting: 'Greywater is a mist-choked port at the edge of the Sallow Marsh, its wealth built on peat and smuggled reliquaries.', tone: 'grim, hopeful', themes: ['faith', 'rot', 'debts'],
    openingHook: 'You wake in the Drowned Bell tavern to the sound of the church bell ringing itself. Nobody is in the tower. The innkeeper, Marla Voss, slides a sealed letter across the bar with your name on it.',
    bible: 'Greywater was founded on a drowned temple. The priest, Father Ambrose, discovered the bell is a binding and fled with its clapper. The dead rise because the binding weakens each night...', secrets: ['Father Ambrose is alive and hiding in the marsh lighthouse', 'Marla Voss owes the Reeve a blood debt'],
    startingLocation: { name: 'The Drowned Bell', description: 'A low-beamed tavern smelling of peat smoke and river water.' },
    npcs: [{ name: 'Marla Voss', summary: 'Innkeeper of the Drowned Bell, tired and sharp-eyed', description: 'Grey-streaked hair, burn-scarred hands, keeps a crossbow under the bar.', attitude: 'wary' }, { name: 'Reeve Corwin Hale', summary: 'The town\'s reeve, drowning in debts', description: 'Handsome once; now hollow.', attitude: 'indifferent' }],
    factions: [{ name: 'The Peat Guild', summary: 'Controls the marsh cuttings and half the town council' }],
    quests: [{ name: 'The Missing Priest', summary: 'Find out what happened to Father Ambrose', objectives: ['Ask around the Drowned Bell', 'Search the church tower'] }],
  };
  if (/playable RPG characters/i.test(system)) return { name: /companion/i.test(user) ? 'Bram Ashvale' : 'Kaelen Storm', pronouns: 'he/him', alignment: 'Neutral Good', personality: 'Quick to laugh, slow to forgive. Counts exits when entering a room.', ideals: 'Debts are sacred.', bonds: 'Owes his life to a marsh witch.', flaws: 'Cannot resist a wager.', voice: 'Dry, clipped sentences with the occasional sailor\'s oath.', backstory: 'Raised on the peat barges of Greywater, he learned early that the marsh gives and the marsh takes. A bad winter and a worse debt drove him to the road.', appearance: 'Wiry, sun-browned, a scar through one eyebrow, a coat two sizes too large.', relationship: 'Travels with the hero out of a debt of honor neither of them mentions.', portraitPrompt: 'A wiry scarred rogue in an oversized coat' };
  if (/companion party members/i.test(system)) return { companions: [{ name: 'Bram Ashvale', speciesId: 'halfling', classId: 'rogue', backgroundId: 'criminal', hint: 'A smuggler who knows the marsh and owes the hero a debt' }, { name: 'Sister Idony', speciesId: 'human', classId: 'cleric', backgroundId: 'acolyte', hint: 'Father Ambrose\'s former acolyte, desperate to find him' }] };
  if (/voice the AI companions/i.test(system)) return { lines: [{ character: 'Bram Ashvale', text: '*leans back, boots on the table* Bells ringing themselves. That\'s new. Say the word and I\'ll have a look at that tower — quiet-like.' }] };
  if (/campaign scribe/i.test(system)) return { title: 'The Bell That Rang Itself', summary: 'The hero woke to the church bell ringing with no one in the tower. Marla Voss delivered a sealed letter. Investigation of the tower revealed claw marks and a missing clapper.', facts: ['The church bell\'s clapper is missing'], entities: [{ name: 'The Church Tower', type: 'location', summary: 'Stone tower above Greywater; the bell rings by itself', facts: ['Claw marks on the stairs'] }], questUpdates: [] };
  if (/game designer/i.test(system)) return { id: 'mock', name: 'Mock System', version: '1', description: 'x', labels: {}, gmGuidance: 'x', abilities: [{ id: 'body', name: 'Body', abbr: 'BOD', description: '' }], skills: [], conditions: [], mechanics: {}, species: [], backgrounds: [], equipment: [], spells: [], classes: [], monsters: [] };
  return { ok: true };
}

let call = 0;
function dmToolCalls(lastUser) {
  const t = lastUser.toLowerCase();
  const tc = (name, args) => ({ name, args });
  if (t.includes('begin the session')) return [tc('set_scene', { location: 'The Drowned Bell', description: 'A low-beamed tavern smelling of peat smoke and river water.', situation: 'The church bell is ringing itself. Marla slides a sealed letter across the bar.', present: ['Marla Voss'], timeOfDay: 'dawn', weather: 'thick river mist', mood: 'uneasy' }), tc('record_fact', { text: 'The church bell of Greywater rings by itself at dawn.', category: 'discovery' })];
  if (t.includes('attack') || t.includes('fight')) return [tc('start_combat', { enemies: [{ name: 'goblin', count: 2 }], surprise: 'none' })];
  if (t.includes('swing') || t.includes('strike')) return [tc('roll_check', { character: 'Kaelen Storm', kind: 'attack', dc: 15, label: 'Longsword vs Goblin 1' }), tc('roll_dice', { expression: '1d8+3', label: 'Longsword damage' }), tc('apply_damage', { target: 'Goblin 1', amount: 7, type: 'slashing' }), tc('advance_combat_turn', {})];
  if (t.includes('goblin turn')) return [tc('roll_check', { character: 'Goblin 2', kind: 'attack', dc: 16, label: 'Goblin 2 scimitar vs Kaelen' }), tc('apply_damage', { target: 'Kaelen Storm', amount: 5, type: 'slashing' }), tc('advance_combat_turn', {})];
  if (t.includes('finish')) return [tc('end_combat', { outcome: 'victory', summary: 'The goblins lie dead in the mud.' }), tc('award_xp', { amount: 100, reason: 'Defeating the goblin ambush' }), tc('give_item', { character: 'Kaelen Storm', item: 'potion of healing', qty: 1 }), tc('adjust_gold', { character: 'Kaelen Storm', delta: 12, reason: 'goblin purse' })];
  if (t.includes('look') || t.includes('search')) return [tc('roll_check', { character: 'Kaelen Storm', kind: 'skill', skill: 'perception', dc: 12, label: 'Perception — the tower stairs' }), tc('upsert_entity', { type: 'location', name: 'The Church Tower', summary: 'Stone tower above Greywater where the bell rings itself', facts: ['Claw marks score the stairs'], present: false })];
  if (t.includes('rest')) return [tc('rest', { kind: 'short' })];
  if (t.includes('picture') || t.includes('illustrate')) return [tc('illustrate', { prompt: 'A mist-choked tavern at dawn, a bell tower looming', kind: 'scene' })];
  if (t.includes('hurt')) return [tc('apply_damage', { target: 'Kaelen Storm', amount: 4, type: 'bludgeoning' }), tc('set_condition', { target: 'Kaelen Storm', condition: 'prone' })];
  if (t.includes('xp')) return [tc('award_xp', { amount: 300, reason: 'A hard lesson' })];
  if (t.includes('talk') || t.includes('marla')) return [tc('upsert_entity', { type: 'npc', name: 'Marla Voss', summary: 'Innkeeper of the Drowned Bell', facts: ['Gave the hero a sealed letter'], attitude: 'wary', present: true }), tc('update_quest', { name: 'The Missing Priest', completeObjective: 'Ask around', note: 'Marla says Ambrose left three nights ago' })];
  return [];
}

function narration(lastUser, toolResults) {
  const t = lastUser.toLowerCase();
  if (toolResults.some((r) => /PENDING/.test(r))) return 'The stairs groan under your weight, and somewhere above, the bell tolls again — closer now. You reach for the rail, eyes straining into the dark…';
  if (t.includes('begin')) return 'The bell is ringing.\n\nNot the slow, dutiful toll you remember from a hundred grey mornings — it *lurches*, iron on iron, like something inside it is trying to get out. Peat smoke hangs in the low beams of the **Drowned Bell**, and through the shutters the mist is the colour of old milk.\n\n**Marla Voss** doesn\'t look up from the glass she\'s polishing. She just slides a letter across the bar, sealed with black wax. "Came for you in the night," she says. "Nobody saw who brought it."\n\n> *To the one who wakes when the bell rings — the tower. Before the mist lifts.*\n\nThe bell tolls again. What do you do?';
  if (t.includes('attack') || t.includes('fight')) return 'Two **goblins** burst from the reeds, scimitars flashing, yellow eyes wide with a hunger that has nothing to do with gold. Steel out — *roll for initiative!*';
  if (t.includes('swing') || t.includes('strike')) return 'Your blade bites deep. The goblin shrieks, black blood spattering the mud, and staggers back into the reeds. Its companion snarls and lunges.';
  if (t.includes('finish')) return 'The last goblin gurgles and falls. Silence, but for the bell. You find a small purse and, tucked in a rotting satchel, a stoppered vial that glows faintly red.';
  if (t.includes('look') || t.includes('search')) return 'You climb. Halfway up the tower stairs the stone is scored with deep, fresh gouges — four parallel lines, as if something with claws dragged itself upward. The bell tolls once more above you.';
  if (t.includes('rest')) return 'You bar the door and sit with your back to the cold stone. An hour passes. The bell, at last, is quiet.';
  if (t.includes('hurt')) return 'The floor gives way beneath you — rotten planks — and you crash to the stone below, the wind knocked from your lungs.';
  return 'Marla considers you for a long moment. "The tower," she says finally. "If you\'re going, take a light. And don\'t touch the bell."';
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' }); return res.end(); }
  const url = new URL(req.url, 'http://x');
  if (url.pathname.endsWith('/models')) return json(res, { data: [
    { id: 'mock/dm', name: 'Mock DM', pricing: { prompt: '0.000003', completion: '0.000015' }, context_length: 200000, supported_parameters: ['tools', 'response_format'], architecture: { output_modalities: ['text'] } },
    { id: 'mock/fast', name: 'Mock Fast', pricing: { prompt: '0', completion: '0' }, context_length: 128000, supported_parameters: ['tools'], architecture: { output_modalities: ['text'] } },
    { id: 'mock/image', name: 'Mock Painter', pricing: { prompt: '0.0000003', completion: '0.0000025' }, context_length: 32000, supported_parameters: [], architecture: { output_modalities: ['image', 'text'] } },
  ] });
  if (url.pathname.endsWith('/auth/key')) return json(res, { data: { label: 'mock key', usage: 0.42, limit: null } });
  if (!url.pathname.endsWith('/chat/completions')) return json(res, { error: { message: 'not found' } }, 404);
  let body = ''; for await (const c of req) body += c;
  const b = JSON.parse(body);
  call++;
  const system = b.messages.filter((m) => m.role === 'system').map(text).join('\n');
  const lastUser = [...b.messages].reverse().find((m) => m.role === 'user');
  const lastMsg = b.messages[b.messages.length - 1];

  if (Array.isArray(b.modalities) && b.modalities.includes('image')) { await sleep(300); return json(res, { choices: [{ message: { role: 'assistant', content: '', images: [{ type: 'image_url', image_url: { url: IMG } }] }, finish_reason: 'stop' }] }); }
  if (b.response_format?.type === 'json_object') {
    const payload = JSON.stringify(jsonReply(system, text(lastUser)));
    if (!b.stream) { await sleep(200); return json(res, { choices: [{ message: { role: 'assistant', content: payload }, finish_reason: 'stop' }], usage: { total_tokens: 100 } }); }
    const send = sse(res);
    for (let i = 0; i < payload.length; i += 120) { send({ choices: [{ delta: { content: payload.slice(i, i + 120) } }] }); await sleep(5); }
    send({ choices: [{ delta: {}, finish_reason: 'stop' }] });
    res.write('data: [DONE]\n\n'); return res.end();
  }

  const toolResults = b.messages.filter((m) => m.role === 'tool').map(text);
  const wantsTools = Array.isArray(b.tools) && b.tools.length && lastMsg.role !== 'tool';
  const calls = wantsTools ? dmToolCalls(lastLine(text(lastUser))) : [];
  const content = calls.length ? '' : narration(lastLine(text(lastUser)), toolResults);
  if (!b.stream) return json(res, { choices: [{ message: { role: 'assistant', content, tool_calls: calls.map((c, i) => ({ id: `call_${call}_${i}`, type: 'function', function: { name: c.name, arguments: JSON.stringify(c.args) } })) }, finish_reason: calls.length ? 'tool_calls' : 'stop' }] });
  const send = sse(res);
  if (calls.length) {
    calls.forEach((c, i) => {
      const args = JSON.stringify(c.args);
      send({ choices: [{ delta: { tool_calls: [{ index: i, id: `call_${call}_${i}`, type: 'function', function: { name: c.name, arguments: args.slice(0, 10) } }] } }] });
      send({ choices: [{ delta: { tool_calls: [{ index: i, function: { arguments: args.slice(10) } }] } }] });
    });
    send({ choices: [{ delta: {}, finish_reason: 'tool_calls' }] });
  } else {
    for (const w of content.split(/(?<=\s)/)) { send({ choices: [{ delta: { content: w } }] }); await sleep(12); }
    send({ choices: [{ delta: {}, finish_reason: 'stop' }], usage: { total_tokens: 500 } });
  }
  res.write('data: [DONE]\n\n');
  res.end();
});
server.listen(PORT, () => console.log(`mock openrouter on http://localhost:${PORT}`));
