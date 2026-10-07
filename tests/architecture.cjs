const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
execFileSync(process.execPath, [path.join(root, 'scripts/version-assets.cjs'), '--check'], { stdio: 'inherit' });
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const assetPath = reference => reference.split(/[?#]/)[0];
const metaContent = (attribute, value) => {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.match(new RegExp(`<meta\\s+${attribute}="${escaped}"\\s+content="([^"]+)"`, 'i'))?.[1] || '';
};
const scripts = [...html.matchAll(/<script\b([^>]*)\bsrc="([^"]+)"[^>]*><\/script>/g)].map(m => ({ attrs: m[1], file: assetPath(m[2]) }));
const styles = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(m => assetPath(m[1]));
assert(!/<style\b|<script>(?!\s*<\/script>)/.test(html), 'Entry contains no embedded application source');
assert(!/<iframe\b/i.test(html), 'Main application does not embed feature pages with iframes');
assert(html.includes('id="pitchGameMount"'), 'Pitch tab exposes a direct component mount');
assert(!html.includes('pitchGameFrame'), 'Legacy pitch iframe is removed');
const shareTitle = metaContent('property', 'og:title');
const shareDescription = metaContent('property', 'og:description');
const shareUrl = metaContent('property', 'og:url');
const shareImage = metaContent('property', 'og:image');
assert(shareTitle.includes('恋与哈基米'), 'Share title names the game');
assert(shareDescription.length >= 20, 'Share description is useful');
assert.equal(shareUrl, 'https://hjmyt.github.io/hjm/', 'Canonical share URL matches GitHub Pages');
assert(shareImage.startsWith(shareUrl), 'Share image uses an absolute same-origin HTTPS URL');
assert(fs.existsSync(path.join(root, new URL(shareImage).pathname.replace(/^\/hjm\//, ''))), 'Share image exists locally');
assert(scripts.length > 0 && styles.length > 0);
assert.equal(new Set(scripts.map(s => s.file)).size, scripts.length, 'Scripts load exactly once');
assert.equal(scripts.at(-1).file, 'js/app/bootstrap.js', 'Bootstrap is last');
const featureControllerIndex = scripts.findIndex(script => script.file === 'js/features/pitch-audition.js');
const rhythmGameIndex = scripts.findIndex(script => script.file === 'js/features/rhythm-audition-game.js');
const rhythmDataIndex = scripts.findIndex(script => script.file === 'js/data/rhythm-audition.js');
const rhythmRulesIndex = scripts.findIndex(script => script.file === 'js/features/rhythm-audition-rules.js');
const rhythmVoicesIndex = scripts.findIndex(script => script.file === 'js/audio/rhythm-audition-voices.js');
assert(rhythmVoicesIndex >= 0 && rhythmVoicesIndex < rhythmGameIndex, 'Reference click samples load before the rhythm game');
assert(rhythmDataIndex >= 0 && rhythmDataIndex < rhythmRulesIndex && rhythmRulesIndex < rhythmGameIndex, 'Shared rhythm data and clocks load before the game and reward controller');
for (const feature of ['js/features/pitch-audition-game.js', 'js/features/rhythm-audition-game.js']) {
  const index = scripts.findIndex(script => script.file === feature);
  assert(index >= 0 && index < featureControllerIndex, `${feature} loads before its controller`);
}
for (const style of ['styles/game-pitch-audition.css', 'styles/game-rhythm-audition.css']) {
  assert(styles.includes(style), `${style} is included in the root asset version chain`);
}
assert(!fs.existsSync(path.join(root, 'game/pitch-audition/index.html')), 'Pitch game is no longer an independent HTML page');
assert(!fs.existsSync(path.join(root, 'game/rhythm-audition/index.html')), 'Rhythm game is no longer an independent HTML page');
for (const script of scripts) {
  assert(/\bdefer\b/.test(script.attrs), 'Ordered deferred loading: ' + script.file);
  new vm.Script(fs.readFileSync(path.join(root, script.file), 'utf8'), { filename: script.file });
}
const applicationSource = scripts.map(script => fs.readFileSync(path.join(root, script.file), 'utf8')).join('\n');
assert(!/\bisBandPartner\b/.test(applicationSource), 'Band membership uses the single progression roster');
for (const script of scripts.filter(script => script.file !== 'js/core/progression.js')) {
  const source = fs.readFileSync(path.join(root, script.file), 'utf8');
  assert(!/\braise(?:Band|Orchestra)Level\b/.test(source), 'Level growth uses claimed milestones outside progression core: ' + script.file);
}
for (const file of styles) assert(fs.statSync(path.join(root, file)).size > 0);
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); res.end(); return;
  }
  const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg' };
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
  res.end(fs.readFileSync(file));
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
    for (const url of [pathToFileURL(path.join(root, 'index.html')).href, `http://127.0.0.1:${server.address().port}/index.html`]) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
      const page = await context.newPage(), errors = [], failures = [], loaded = new Set();
      page.on('pageerror', e => errors.push(e.message));
      page.on('requestfailed', req => {
        // Rapid navigation cancels the new auto-playing BGM; a cancelled media
        // or preloaded image request is not a missing asset. Missing files still
        // reach the response >= 400 check below; playback has dedicated coverage.
        if (req.resourceType() === 'media' && req.failure()?.errorText === 'net::ERR_ABORTED') return;
        if (req.resourceType() === 'image' && req.failure()?.errorText === 'net::ERR_ABORTED') return;
        failures.push(req.url() + ': ' + req.failure()?.errorText);
      });
      page.on('response', res => {
        if (res.status() >= 400) failures.push(`${res.status()} ${res.url()}`);
        const pathname = new URL(res.url()).pathname;
        for (const file of [...scripts.map(s => s.file), ...styles]) if (pathname.endsWith('/' + file)) loaded.add(file);
      });
      await page.goto(url);
      assert.equal(loaded.size, scripts.length + styles.length, 'All split resources loaded');
      await page.evaluate(() => {
        if (!state || state.coins !== 30 || !storageOK) throw Error('Fresh state failed');
        if (CARD_DEFS.length !== 27 || new Set(CARD_DEFS.map(c => c.id)).size !== CARD_DEFS.length) throw Error('Card catalog integrity');
        if (new Set(MEMORIES.map(m => m.id)).size !== MEMORIES.length) throw Error('Memory catalog integrity');
        for (const view of ['home', 'chronicle', 'story', 'care', 'rhythm', 'pitch', 'album', 'cards', 'fusion']) route(view);
        state.coins = 287;
        grantBond('lala', 5, { key: 'special:architecture' });
        state.economy.daily.rhythm = 3;
        save();
      });
      await page.reload();
      assert(await page.evaluate(() => state.coins === 287 && cardBond('lala') === 5 && state.economy.daily.rhythm === 3), 'Save remains compatible after actual reload');
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 900 });
        for (const view of ['home', 'chronicle', 'rhythm', 'pitch', 'cards']) {
          await page.evaluate(view => route(view), view);
          assert.equal(await page.evaluate(() => location.hash), `#${view}`, `${view} publishes its shareable anchor`);
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${view} fits ${width}`);
          assert(await page.evaluate(() => getComputedStyle(document.querySelector('.card') || document.body).fontFamily.length > 0));
          if (view === 'pitch') {
            assert(await page.evaluate(() => {
              const mount = document.getElementById('pitchGameMount');
              return Boolean(mount?.shadowRoot?.querySelector('.game-surface'));
            }), `Pitch game mounts directly through JS at ${width}`);
          }
        }
      }
      assert.deepEqual(errors, [], 'No runtime errors');
      assert.deepEqual(failures, [], 'No missing assets or modules');
      await context.close();
    }
    console.log(`PASS: ${scripts.length} scripts and ${styles.length} styles, file/HTTP loading, strict MIME, view navigation, storage reload and desktop/mobile layouts.`);
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
