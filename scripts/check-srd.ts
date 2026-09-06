import { srdRuleset as rs } from '../src/data/srd';
import { validateRuleset } from '../src/engine/schema';
import { buildCharacter, autoAssignAbilities, autoChoices } from '../src/engine/character';
import { armorClass, spellSaveDc, weaponAttacks } from '../src/engine/rules';

const v = validateRuleset(rs);
if (!v.ok) { console.error('INVALID', v.error); process.exit(1); }
console.log('Ruleset valid. Warnings:', v.warnings);
const spellIds = new Set(rs.spells.map((s) => s.id));
const itemIds = new Set(rs.equipment.map((i) => i.id));
const skillIds = new Set(rs.skills.map((s) => s.id));
let problems = 0;
for (const c of rs.classes) {
  const missing = (c.spellcasting?.spellList ?? []).filter((id) => !spellIds.has(id));
  if (missing.length) { problems += missing.length; console.log(`${c.name}: missing spells`, missing); }
  for (const sub of c.subclasses ?? []) for (const [lvl, ids] of Object.entries(sub.bonusSpells ?? {})) { const m = ids.filter((id) => !spellIds.has(id)); if (m.length) { problems += m.length; console.log(`${sub.name} L${lvl}: missing bonus spells`, m); } }
  const mi = (c.startingItems ?? []).filter((x) => !itemIds.has(x.itemId));
  if (mi.length) console.log(`${c.name}: unresolved starting items (tolerated)`, mi.map((x) => x.itemId));
  const badSkills = c.skillChoices.from.filter((s) => !skillIds.has(s));
  if (badSkills.length) { problems++; console.log(`${c.name}: bad skills`, badSkills); }
}
for (const b of rs.backgrounds) {
  const mi = (b.startingItems ?? []).filter((x) => !itemIds.has(x.itemId));
  if (mi.length) console.log(`${b.name}: unresolved starting items (tolerated)`, mi.map((x) => x.itemId));
  const bad = b.skillProficiencies.filter((s) => !skillIds.has(s));
  if (bad.length) { problems++; console.log(`${b.name}: bad skills`, bad); }
}
const dupSpells = rs.spells.map((s) => s.id).filter((id, i, a) => a.indexOf(id) !== i);
if (dupSpells.length) { problems++; console.log('duplicate spell ids', dupSpells); }
const spellsNoClass = rs.spells.filter((s) => !rs.classes.some((c) => c.spellcasting?.spellList.includes(s.id)));
if (spellsNoClass.length) console.log('spells on no class list:', spellsNoClass.map((s) => s.id));
console.log(`Counts: ${rs.classes.length} classes, ${rs.species.length} species, ${rs.backgrounds.length} backgrounds, ${rs.spells.length} spells, ${rs.equipment.length} items, ${rs.monsters.length} monsters, ${rs.conditions.length} conditions`);

// Smoke-test character building for every class
for (const c of rs.classes) {
  const base = autoAssignAbilities(rs, c);
  const bg = rs.backgrounds[0];
  const ch = buildCharacter(rs, { name: `Test ${c.name}`, kind: 'player', speciesId: 'human', classId: c.id, backgroundId: bg.id, baseAbilities: base, ...autoChoices(rs, c, bg, 1, base), persona: { personality: '', ideals: '', bonds: '', flaws: '', voice: '', backstory: '', appearance: '' } });
  const ac = armorClass(rs, ch);
  console.log(`${c.name.padEnd(10)} HP ${ch.maxHp} AC ${ac.ac} (${ac.source}) atk ${weaponAttacks(rs, ch).map((a) => `${a.name} +${a.attackBonus}`).join('/') || '—'} DC ${spellSaveDc(rs, ch) ?? '—'} cantrips ${ch.spells.cantrips.length} spells ${ch.spells.known.length} slots ${JSON.stringify(ch.spells.slots)}`);
}
console.log(problems ? `PROBLEMS: ${problems}` : 'OK');
process.exit(problems ? 1 : 0);
