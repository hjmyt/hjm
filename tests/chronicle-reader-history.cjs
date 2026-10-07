const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    await page.locator('[data-music-enter-muted]').click();
    await page.evaluate(() => {
      state = freshState();
      state.sound = false;
      state.chronicle.completedChapters = [1, 2, 3, 4, 5];
      Object.assign(state.chronicle.run, { chapter: 6, ch: 6, scene: 'c6_intro', name: '小音', week: 1 });
      Chronicle.closeLibrary();
      route('chronicle');
      renderGlobal();
    });
    const initial = await page.evaluate(() => {
      const controls = document.querySelector('.cp-reader-next');
      const next = controls.querySelector('.cp-page-next').getBoundingClientRect();
      const bounds = controls.getBoundingClientRect();
      return { nextRight: next.right, controlRight: bounds.right, hasPrevious: !!controls.querySelector('.cp-page-prev') };
    });
    assert(!initial.hasPrevious, 'the first chapter page does not show an unnecessary previous control');
    assert(initial.controlRight - initial.nextRight < 12, 'the sole forward action aligns with the right edge');
    await page.screenshot({ path: '/tmp/hjm-chronicle-intro-navigation.png' });

    const click = async selector => { await page.waitForTimeout(230); await page.locator(selector).click(); };
    await click('[data-cp-choice="0"]');
    assert.equal(await page.evaluate(() => state.chronicle.run.scene), 'c6_zhu');
    assert.equal(await page.locator('[data-cp-action="reader-prev"]').count(), 0, 'branching choices do not show a previous-page control');
    await page.screenshot({ path: '/tmp/hjm-chronicle-branch-navigation.png' });

    await click('[data-cp-choice="0"]');
    assert.equal(await page.evaluate(() => state.chronicle.run.scene), 'c6_warn');
    const settled = await page.evaluate(() => ({ rev: state.chronicle.run.rev, coins: state.coins, bond: state.affinity.zhu, scene: state.chronicle.run.scene }));
    await click('.cp-reader-next .cp-page-prev');
    assert(await page.locator('#cpStoryText').innerText().then(text => text.includes('咖啡杯摞成塔')));
    await page.screenshot({ path: '/tmp/hjm-chronicle-history-navigation.png' });
    await click('.cp-reader-next .cp-page-prev');
    assert(await page.locator('#cpStoryText').innerText().then(text => text.includes('立项成功')));
    await click('.cp-reader-next .cp-page-next');
    await click('.cp-reader-next .cp-page-next');
    assert(await page.locator('#cpStoryText').innerText().then(text => text.includes('垃垃把你拉到一边')));
    assert.deepEqual(await page.evaluate(() => ({ rev: state.chronicle.run.rev, coins: state.coins, bond: state.affinity.zhu, scene: state.chronicle.run.scene })), settled, 'read-only history never replays rewards or advances the scene');
    assert.deepEqual(errors, []);
    console.log('PASS chronicle reader history: right-aligned continuation, multiple previous pages, read-only return, no duplicate rewards.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
