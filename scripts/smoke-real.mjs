/**
 * Real-API smoke test. Runs a short session against OpenRouter with cheap models
 * and reports the credit delta. Never stores the key anywhere.
 *
 *   OPENROUTER_API_KEY=sk-or-... npm run build && node scripts/smoke-real.mjs
 *
 * Optional: DM_MODEL, FAST_MODEL, IMAGE_MODEL, SKIP_IMAGE=1
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const KEY = process.env.OPENROUTER_API_KEY;
if (!KEY) { console.error('Set OPENROUTER_API_KEY'); process.exit(1); }
const DM = process.env.DM_MODEL || 'anthropic/claude-haiku-4.5';
const FAST = process.env.FAST_MODEL || 'anthropic/claude-haiku-4.5';
const IMAGE = process.env.IMAGE_MODEL || 'google/gemini-2.5-flash-image-preview';
const EXEC = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const OUT = 'screenshots/real'; fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const usage = async () => { const r = await fetch('https://openrouter.ai/api/v1/auth/key', { headers: { Authorization: `Bearer ${KEY}` } }); const j = await r.json(); return Number(j.data?.usage ?? 0); };
const before = await usage();
console.log(`credits used before: $${before.toFixed(4)} · models: dm=${DM} fast=${FAST} image=${IMAGE}`);

const preview = spawn('npx', ['vite', 'preview', '--port', '4174', '--strictPort'], { stdio: 'pipe' });
await sleep(2500);
const browser = await chromium.launch({ executablePath: EXEC });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await ctx.addInitScript(({ key, dm, fast, image }) => {
  localStorage.setItem('tavern-settings', JSON.stringify({ state: { apiKey: key, models: { dm, companion: fast, utility: fast, image }, onboarded: true, temperature: 0.9 }, version: 0 }));
}, { key: KEY, dm: DM, fast: FAST, image: IMAGE });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png` });
const idle = () => page.waitForFunction(() => !document.querySelector('.thinking'), null, { timeout: 120000 });
const dmText = async () => (await page.locator('.msg-dm').last().innerText()).slice(0, 400);
let ok = true;
try {
  await page.goto('http://localhost:4174/');
  await page.click('text=Begin a new campaign');
  await page.fill('textarea', 'A frontier town where the dead have stopped staying buried, and the only priest has gone missing.');
  await page.click('text=Forge world');
  await page.waitForSelector('.card.glow', { timeout: 120000 });
  console.log('world:', await page.locator('.card.glow p').first().innerText());
  await shot('01-world');
  await page.click('text=Continue');
  await page.fill('input[placeholder="What are you called?"]', 'Kaelen Storm');
  await page.click('text=Fighter');
  const chips = page.locator('.chips .chip.selectable:not(.on)'); await chips.nth(0).click(); await chips.nth(0).click();
  await page.click('text=Write with AI');
  await page.waitForSelector('text=Character written', { timeout: 60000 });
  await page.click('text=Continue');
  await page.click('text=Suggest companions');
  await page.waitForSelector('.card.row.clickable', { timeout: 120000 });
  console.log('companions:', await page.locator('.card.row.clickable .card-title').allInnerTexts());
  await shot('02-companions');
  await page.click('text=Continue');
  await page.click('text=Begin the adventure');
  await page.waitForSelector('.msg-dm', { timeout: 120000 });
  await idle(); await sleep(500);
  console.log('opening:', await dmText());
  console.log('effects:', await page.locator('.effects .chip').allInnerTexts());
  await shot('03-opening');
  const say = async (t) => { await page.fill('.composer textarea', t); await page.click('.composer .send'); await idle(); await sleep(400); console.log(`> ${t}\n`, await dmText()); console.log('effects:', await page.locator('.effects .chip').last().innerText().catch(() => '')); };
  await say('I examine the room carefully for anything out of place, then ask whoever is nearest what happened here.');
  await shot('04-turn');
  await say('I draw my sword and go looking for trouble — attack the first threat I find.');
  await shot('05-turn');
  console.log('rolls:', await page.locator('.roll').count(), 'tracker:', await page.locator('.tracker').count(), 'companion lines:', await page.locator('.msg-companion').count());
  if (!process.env.SKIP_IMAGE) {
    await page.click('.quick .chip:has-text("Illustrate")');
    await page.waitForSelector('.msg-image img, .msg-image .msg-error', { timeout: 120000 });
    console.log('image:', (await page.locator('.msg-image img').count()) ? 'ok' : await page.locator('.msg-image .msg-error').innerText());
    await sleep(500); await shot('06-image');
  }
  await page.click('nav.bottomnav button:has-text("Journal")');
  await sleep(300); await shot('07-journal');
  console.log('journal entries:', await page.locator('.card.flat.clickable .card-title').allInnerTexts());
} catch (e) { ok = false; console.error('SMOKE FAILED', e); await shot('99-failure'); }
if (errors.length) console.log('console errors:', errors.slice(0, 5));
await browser.close(); preview.kill();
const after = await usage();
console.log(`credits used after: $${after.toFixed(4)} · this run cost ≈ $${(after - before).toFixed(4)}`);
console.log(ok ? 'SMOKE OK' : 'SMOKE HAD FAILURES');
process.exit(ok ? 0 : 1);
