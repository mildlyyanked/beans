/**
 * End-to-end smoke test + screenshot tour using the mock OpenRouter server.
 * Usage: node scripts/e2e.mjs  (expects `npm run build` first)
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const EXEC = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const OUT = 'screenshots'; fs.mkdirSync(OUT, { recursive: true });
const mock = spawn('node', ['scripts/mock-openrouter.mjs', '8787'], { stdio: 'inherit' });
const preview = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], { stdio: 'pipe' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await sleep(2500);

const browser = await chromium.launch({ executablePath: EXEC });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: 'dark' });
await ctx.addInitScript(() => {
  if (!localStorage.getItem('tavern-settings')) localStorage.setItem('tavern-settings', JSON.stringify({ state: { baseUrl: 'http://localhost:8787', models: { dm: 'mock/dm', companion: 'mock/fast', utility: 'mock/fast', image: 'mock/image' }, onboarded: false, apiKey: '' }, version: 0 }));
});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png` });
const step = (s) => console.log('→', s);
let ok = true;
const expect = async (cond, label) => { if (!cond) { ok = false; console.error('✗', label); } else console.log('✓', label); };

try {
  await page.goto('http://localhost:4173/');
  await page.waitForSelector('text=Connect OpenRouter');
  await shot('01-onboarding');
  await page.fill('input[type=password]', 'sk-or-v1-mock');
  await page.click('text=Enter the Tavern');
  await page.waitForSelector('text=Begin a new campaign');
  await shot('02-home-empty');

  step('new campaign');
  await page.click('text=Begin a new campaign');
  await page.waitForSelector('text=Campaign idea');
  await page.fill('textarea', 'A frontier town where the dead have stopped staying buried.');
  await shot('03-new-world');
  await page.click('text=Forge world');
  await page.waitForSelector('text=The Drowned Bell', { timeout: 15000 });
  await shot('04-world-forged');
  await page.click('text=Continue');
  await page.waitForSelector('text=Ability scores');
  await page.fill('input[placeholder="What are you called?"]', 'Kaelen Storm');
  await page.click('text=Fighter');
  const chips = page.locator('.chips .chip.selectable:not(.on)');
  await chips.nth(0).click(); await chips.nth(0).click();
  await shot('05-hero-top');
  await page.click('text=Write with AI');
  await page.waitForSelector('text=Character written');
  await page.evaluate(() => document.querySelector('.scroll').scrollTo(0, 99999));
  await shot('06-hero-persona');
  await page.click('text=Continue');
  await page.waitForSelector('text=Suggest companions');
  await page.click('text=Suggest companions');
  await page.waitForSelector('text=Bram Ashvale', { timeout: 20000 });
  await shot('07-companions');
  await page.click('text=Continue');
  await page.waitForSelector('text=Table rules');
  await shot('08-options');
  await page.click('text=Begin the adventure');

  step('play');
  await page.waitForSelector('text=Marla Voss', { timeout: 20000 });
  await page.waitForFunction(() => !document.querySelector('.thinking'), null, { timeout: 20000 });
  await sleep(500);
  await shot('09-play-opening');
  await expect(await page.locator('.msg-companion').count() >= 1, 'companion spoke after opening');
  await expect(await page.locator('.effects .chip').count() >= 1, 'effects chips rendered');

  const say = async (t, waitFor) => { await page.fill('.composer textarea', t); await page.click('.composer .send'); if (waitFor) await page.waitForSelector(waitFor, { timeout: 20000 }); await page.waitForFunction(() => !document.querySelector('.thinking'), null, { timeout: 30000 }); await sleep(300); };
  await say('I look around the tower stairs', '.roll');
  await shot('10-play-roll');
  await expect(await page.locator('.roll').count() >= 1, 'roll card rendered');
  await say('I attack the goblins!', '.tracker');
  await shot('11-play-combat');
  await expect(await page.locator('.tracker .cb').count() === 5, 'tracker shows 5 combatants');
  await say('I swing my longsword at Goblin 1');
  await say('The goblin turn');
  await shot('12-play-combat-2');
  await say('finish them');
  await expect((await page.locator('.tracker').count()) === 0, 'combat ended');
  await say('Can I have a picture?');
  await page.waitForSelector('.msg-image img', { timeout: 15000 });
  await sleep(300);
  await shot('13-play-image');
  await say('I talk to Marla');
  await say('xp please');

  step('manual roll mode');
  await page.click('nav.bottomnav button:has-text("Menu")');
  await page.waitForSelector('text=Auto-roll for me');
  await page.click('text=Auto-roll for me');
  await page.click('nav.bottomnav button:has-text("Story")');
  await page.fill('.composer textarea', 'I search the room carefully');
  await page.click('.composer .send');
  await page.waitForSelector('.pending-roll', { timeout: 20000 });
  await sleep(400);
  await shot('13b-pending-roll');
  await expect(await page.locator('.composer textarea').isDisabled(), 'composer disabled while roll pending');
  await page.click('.pending-roll button');
  await page.waitForFunction(() => !document.querySelector('.thinking') && !document.querySelector('.pending-roll'), null, { timeout: 30000 });
  await expect(await page.locator('.roll').count() >= 2, 'manual roll resolved and DM continued');
  await page.click('nav.bottomnav button:has-text("Menu")');
  await page.click('text=Auto-roll for me');

  step('party');
  await page.click('nav.bottomnav button:has-text("Party")');
  await page.waitForSelector('text=Level up!', { timeout: 5000 });
  await shot('14-party');
  await page.click('text=Level up!');
  await page.waitForSelector('.sheet .eyebrow:has-text("Hit points")');
  await sleep(600);
  await shot('15-levelup');
  await page.click('.sheet >> text=Level up');
  await page.waitForSelector('text=reaches level 2');
  await page.waitForFunction(() => !document.querySelector('.thinking'), null, { timeout: 30000 });
  await expect(await page.locator('text=Level 2').count() >= 1, 'level 2 applied');
  await page.click('.seg button:has-text("gear")');
  await shot('16-party-gear');

  step('journal');
  await page.click('nav.bottomnav button:has-text("Journal")');
  await page.waitForSelector('text=The Missing Priest');
  await shot('17-journal-quests');
  await page.click('.tabs button:has-text("People")');
  await page.waitForSelector('text=Marla Voss');
  await shot('18-journal-people');
  await page.click('.tabs button:has-text("Canon")');
  await shot('19-journal-canon');
  await expect(await page.locator('text=rings by itself').count() >= 1, 'canon fact recorded');

  step('world');
  await page.click('nav.bottomnav button:has-text("World")');
  await page.waitForSelector('text=Current scene');
  await shot('20-world');

  step('menu + save');
  await page.click('nav.bottomnav button:has-text("Menu")');
  await page.waitForSelector('text=Save slots');
  await page.click('button:has-text("Save")');
  await page.waitForSelector('text=Load');
  await shot('21-menu');

  step('persistence');
  await page.reload();
  await page.waitForSelector('text=Begin a new campaign');
  await page.waitForSelector('text=The Drowned Bell');
  await shot('22-home-with-campaign');
  await page.click('.campaign-card');
  await page.waitForSelector('.msg-dm');
  await expect(await page.locator('.msg-dm').count() >= 5, 'transcript persisted across reload');

  step('settings / rulesets / rules');
  await page.click('nav.bottomnav button:has-text("Menu")');
  await page.click('text=Models & API key');
  await page.waitForSelector('text=Dungeon Master');
  await shot('23-settings');
  await page.click('.list-item >> nth=0');
  await page.waitForSelector('text=Mock DM');
  await sleep(600);
  await shot('24-model-picker');
  await page.keyboard.press('Escape');
  await page.click('.sheet .iconbtn');
  await page.click('.topbar .iconbtn');
  await page.click('text=Browse the rules');
  await page.waitForSelector('text=How this system plays');
  await shot('25-rules');
  await page.click('.tabs button:has-text("Monsters")');
  await page.fill('.searchbar input', 'dragon');
  await page.click('details >> nth=0');
  await shot('26-rules-monsters');
  await page.click('.topbar .iconbtn');
  await page.click('nav.bottomnav button:has-text("Menu")');
  await page.click('text=Leave the table');
  await page.click('text=Rulesets');
  await page.waitForSelector('text=Fork & edit');
  await shot('27-rulesets');
  await page.click('text=Fork & edit');
  await page.waitForSelector('text=Unsaved changes', { state: 'detached' });
  await page.waitForSelector('.tabs');
  await page.click('.tabs button:has-text("Classes")');
  await page.waitForSelector('text=barbarian');
  await shot('28-editor');
  await page.click('.list-item >> nth=0');
  await page.waitForSelector('textarea.code');
  await shot('29-editor-json');
} catch (e) {
  ok = false; console.error('E2E FAILED:', e); await shot('99-failure');
}
if (errors.length) { console.log('console errors:', errors.slice(0, 10)); }
console.log(ok ? 'E2E OK' : 'E2E HAD FAILURES');
await browser.close();
mock.kill(); preview.kill();
process.exit(ok ? 0 : 1);
