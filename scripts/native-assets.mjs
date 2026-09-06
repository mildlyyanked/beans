// Renders assets/logo.png (1024x1024) and assets/splash.png (2732x2732) from public/icon.svg for @capacitor/assets.
import { chromium } from 'playwright';
import fs from 'node:fs';
const EXEC = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const svg = fs.readFileSync('public/icon.svg', 'utf8');
const inner = svg.replace(/<rect width="512" height="512" rx="112"[^>]*\/>/g, ''); // strip rounded background; adaptive icons add their own
const browser = await chromium.launch({ executablePath: EXEC });
fs.mkdirSync('assets', { recursive: true });
const render = async (file, size, body) => {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<html><body style="margin:0;width:${size}px;height:${size}px;background:#0b0a10;display:flex;align-items:center;justify-content:center">${body}</body></html>`);
  await page.screenshot({ path: file });
  await page.close();
};
// Foreground logo on solid background (Play requires opaque icons); glyph occupies the safe zone.
await render('assets/logo.png', 1024, inner.replace('<svg ', '<svg width="700" height="700" '));
await render('assets/icon-foreground.png', 1024, inner.replace('<svg ', '<svg width="620" height="620" '));
await render('assets/splash.png', 2732, `<div style="display:flex;flex-direction:column;align-items:center;gap:40px">${inner.replace('<svg ', '<svg width="520" height="520" ')}<div style="font-family:Georgia,serif;font-size:140px;letter-spacing:0.25em;color:#e2b85b;font-weight:700">TAVERN</div></div>`);
await browser.close();
await (async () => { const b = await chromium.launch({ executablePath: EXEC }); const page = await b.newPage({ viewport: { width: 1024, height: 1024 } }); await page.setContent('<body style="margin:0;background:#0b0a10"></body>'); await page.screenshot({ path: 'assets/icon-background.png' }); await b.close(); })();
console.log('native assets rendered');
