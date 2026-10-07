const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const plan = JSON.parse(fs.readFileSync(path.join(root, 'docs/imagegen/baoshi-feihong-2026-10/plan.json')));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/imagegen/baoshi-feihong-2026-10/art.json')));
const expected = new Set(plan.flatMap(b => b.scenes.map(s => `${s.kind}:${s.id}`)));
assert.deepEqual(new Set(manifest.map(s => `${s.kind}:${s.id}`)), expected, 'Every planned scene has a final crop');
for (const item of manifest) {
  for (const file of [item.source, item.prompt, item.output]) assert(fs.statSync(path.join(root, file)).size > 0, file);
  assert(item.cell >= 1 && item.cell <= 8);
  assert(Math.abs(item.size[0] / item.size[1] - 2) < .02, 'Four columns by two square-panel rows');
  assert(item.crop[0] >= 0 && item.crop[1] >= 0 && item.crop[2] <= item.size[0] && item.crop[3] <= item.size[1]);
}
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
    await page.locator('[data-music-enter-muted]').click();
    const bound = await page.evaluate(async rows => {
      for (const row of rows) {
        const keys = Object.keys(ASSETS).filter(key => ASSETS[key] === row.output);
        if (!keys.length) throw Error('Unbound refreshed scene: ' + row.id);
        const memories = MEMORIES.filter(m => keys.includes(m.asset));
        if (!memories.length) throw Error('No matching album resource: ' + row.id);
        const img = new Image(); img.src = row.output; await img.decode();
      }
      return rows.length;
    }, manifest.map(row => row.id === 'cp_HE_page5' && row.kind === 'personal' ? {...row, output: 'assets/chronicle/personal/cp-he-embrace-cinematic-202610.webp'} : row));
    assert.equal(bound, expected.size);
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const id of ['baoshi', 'feihong']) {
        const result = await page.evaluate(async id => {
          closeModal(false); state = freshState(); state.sound = false;
          CardUI.filter = '全部'; CardUI.sort = 'chapter'; route('cards');
          const locked = document.querySelector(`[data-card-id="${id}"] .card-cover-image`).getAttribute('src');
          state.cards.encounters.push(id); state.cards.collection[id].owned = true;
          state.cards.selected = id; state.cards.team = [id]; renderGlobal(); route('cards');
          const open = document.querySelector(`[data-card-id="${id}"] .card-cover-image`).getAttribute('src');
          const avatar = document.querySelector('.team-slot .card-avatar-image').getAttribute('src');
          route('home');
          const feature = document.querySelector('#homeFeature .card-cover-image').getAttribute('src');
          const mini = document.querySelector(`.mini-character[data-card-open="${id}"] .card-cover-image`).getAttribute('src');
          goCard(id);
          const full = document.querySelector('.character-cover .card-full-image').getAttribute('src');
          const card = cardDef(id), sizes = {};
          for (const usage of ['full', 'cover', 'avatar']) {
            const img = new Image(); img.src = cardImage(card, usage); await img.decode(); sizes[usage] = [img.naturalWidth, img.naturalHeight];
          }
          return { locked, open, avatar, feature, mini, full, sizes, overflow: document.documentElement.scrollWidth > innerWidth };
        }, id);
        assert.equal(result.locked, result.open, 'Locked/open use identical safe crops');
        assert.match(result.locked, /\?v=bf202610$/);
        assert.match(result.avatar, /thumbs\/avatars\/192\/.*\?v=bf202610$/);
        assert.match(result.mini, /thumbs\/cards\/360\/.*\?v=bf202610$/);
        assert.equal(result.feature, `assets/characters/${id}-cover-2026-10.webp`);
        assert.equal(result.full, `assets/characters/${id}-full-2026-10.webp`);
        assert.deepEqual(result.sizes, { full: [1024, 1536], cover: [1024, 683], avatar: [600, 600] });
        assert.equal(result.overflow, false);
        await page.locator('.character-cover').screenshot({ path: `/tmp/hjm-refresh-${id}-${width}-detail.png` });
        await page.evaluate(() => route('home'));
        await page.locator('#homeFeature').screenshot({ path: `/tmp/hjm-refresh-${id}-${width}-home.png` });
        await page.locator(`.mini-character[data-card-open="${id}"]`).screenshot({ path: `/tmp/hjm-refresh-${id}-${width}-mini.png` });
        await page.evaluate(() => route('cards'));
        await page.locator(`[data-card-id="${id}"]`).screenshot({ path: `/tmp/hjm-refresh-${id}-${width}-open.png` });
        await page.locator('.team-slot:visible').first().screenshot({ path: `/tmp/hjm-refresh-${id}-${width}-team.png` });
        await page.evaluate(() => { state = freshState(); state.sound = false; route('cards'); });
        assert(await page.locator(`[data-card-id="${id}"]`).evaluate(el => el.classList.contains('locked')), 'Fresh card is visibly locked');
        await page.locator(`[data-card-id="${id}"]`).screenshot({ path: `/tmp/hjm-refresh-${id}-${width}-locked.png` });
      }
    }
    assert.deepEqual(errors, []);
    console.log(`PASS: ${bound} scene/album bindings, eight-panel crop provenance, both characters on six desktop/mobile card surfaces.`);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
