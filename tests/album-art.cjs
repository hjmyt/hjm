const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/imagegen/album-art.json')));
const catalog = vm.runInNewContext(fs.readFileSync(path.join(root, 'js/data/assets.js'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'js/data/chronicle-art.js'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'js/data/personal-routes.js'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'js/data/memories.js'), 'utf8') + '\n({ASSETS,MEMORIES})');
assert.equal(manifest.length, 64);
assert.equal(new Set(manifest.map(m => m.id)).size, 64);
assert.equal(new Set(manifest.map(m => createHash('sha256').update(fs.readFileSync(path.join(root, m.asset))).digest('hex'))).size, 64, 'Every event has a distinct image');
for (const m of manifest) assert.equal(catalog.ASSETS[catalog.MEMORIES.find(x => x.id === m.id).asset], m.asset);
for (const m of catalog.MEMORIES) assert(fs.statSync(path.join(root, catalog.ASSETS[m.asset])).size > 0);
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  res.end(fs.readFileSync(file));
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
    await page.evaluate(() => route('album'));
    assert.equal(await page.locator('.memory-card.locked img').count(), 0, 'Locked memories reveal no artwork');
    assert.equal(await page.locator('.memory-card:not(.locked)').count(), 1, 'New game retains its unlock rules');
    await page.evaluate(() => showMemory('cp6_he'));
    assert(await page.locator('#modalBackdrop').isHidden(), 'Locked detail remains inaccessible');
    await page.evaluate(() => {
      state.memories.push('cp_audition', 'cp4_fail'); save();
    });
    await page.reload();
    assert(await page.evaluate(() => memoryVisible('cp_audition') && memoryVisible('cp4_fail')), 'Existing memory IDs survive reload');
    await page.evaluate(() => route('album'));
    const albumOrder = await page.locator('#albumGrid .memory-card').evaluateAll(cards => cards.map(card => ({ id: card.dataset.memory, locked: card.classList.contains('locked') })));
    assert.deepEqual(albumOrder.slice(0, 3), [
      { id: 'first', locked: false },
      { id: 'cp_audition', locked: false },
      { id: 'cp4_fail', locked: false }
    ], 'Unlocked memories are grouped first in collection order');
    assert(albumOrder.slice(3).every(item => item.locked), 'Locked placeholders follow all collected memories');
    await page.evaluate(() => document.querySelector('[data-filter="unlocked"]').click());
    assert.deepEqual(await page.locator('#albumGrid .memory-card').evaluateAll(cards => cards.map(card => card.dataset.memory)), ['first', 'cp_audition', 'cp4_fail'], 'Collected filter keeps collection order');
    await page.evaluate(() => document.querySelector('[data-filter="all"]').click());
    // Layout fixture only: real unlock guards checked above, no live save touched.
    await page.evaluate(() => { memoryVisible = () => true; route('album'); });
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      // Album can re-render while media controls settle; inspect the current DOM, not detached images.
      await page.waitForFunction(() => {
        const imgs = [...document.querySelectorAll('.memory-img img')];
        imgs.forEach(img => img.loading = 'eager');
        return imgs.length && imgs.every(img => img.complete && img.naturalWidth > 0);
      });
      const checks = await page.evaluate(() => {
        const imgs = [...document.querySelectorAll('.memory-img img')];
        return { count: imgs.length, fit: imgs.every(img => getComputedStyle(img).objectFit === 'contain'), overflow: document.documentElement.scrollWidth > innerWidth, sizes: imgs.every(img => img.naturalWidth > 0) };
      });
      assert.deepEqual(checks, { count: catalog.MEMORIES.length, fit: true, overflow: false, sizes: true });
      await page.locator('#albumGrid').screenshot({ path: `/tmp/hjm-album-${width}.png` });
      for (const id of ['cp_audition', 'cp4_fail', 'zhu_night']) {
        await page.evaluate(id => showMemory(id), id);
        const detail = await page.locator('.photo-frame img').evaluate(async img => { await img.decode(); return { src: img.getAttribute('src'), fit: getComputedStyle(img).objectFit, height: img.getBoundingClientRect().height }; });
        assert.equal(detail.src, await page.locator(`[data-memory="${id}"] img`).getAttribute('src'));
        assert.equal(detail.fit, 'contain'); assert(detail.height <= 480);
        await page.screenshot({ path: `/tmp/hjm-album-detail-${id}-${width}.png` });
        await page.evaluate(() => closeModal());
      }
    }
    // Export keeps the complete square scene and names the correct event.
    await page.evaluate(() => showMemory('cp_audition'));
    const pendingDownload = page.waitForEvent('download');
    await page.locator('#saveMemoryPhoto').click();
    const download = await pendingDownload;
    assert(download.suggestedFilename().includes(catalog.MEMORIES.find(m => m.id === 'cp_audition').title));
    const exported = '/tmp/hjm-album-export.png'; await download.saveAs(exported);
    const png = fs.readFileSync(exported);
    assert.equal(png.readUInt32BE(16), 900);
    const item = manifest.find(m => m.id === 'cp_audition');
    assert.equal(png.readUInt32BE(20), Math.round(820 * (item.crop[3] - item.crop[1]) / (item.crop[2] - item.crop[0])) + 246);
    assert.deepEqual(errors, []);
    console.log(`PASS: ${catalog.MEMORIES.length} image mappings, 64 original crops, locked guards, save compatibility, desktop/mobile thumbnail/detail and PNG download.`);
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(e => { console.error(e); process.exitCode = 1; });
