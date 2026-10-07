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
    for (const [chapter, ending, type] of [[2, 'c2_dual', 'HE'], [2, 'c2_retry', 'TE'], [3, 'c3_qiqi', 'BE']]) {
      await page.evaluate(({ chapter, ending }) => {
        state = freshState(); state.sound = false; Chronicle.closeLibrary();
        state.chronicle.completedChapters = Array.from({ length: chapter - 1 }, (_, i) => i + 1);
        const memory = ChronicleData.ENDINGS[ending].memory;
        Object.assign(state.chronicle.run, { chapter, ch: chapter + 1, name: '结局排版测试', scene: `title${chapter + 1}`, ending, previewedEnding: ending });
        state.memories.push(memory);
        route('chronicle');
      }, { chapter, ending });
      assert.equal(await page.locator('#cpMain .cp-ending-type').textContent(), `${type} 结局`);
      assert.equal(await page.locator('#cpMain .cp-ending-type').getAttribute('data-ending-type'), type);
      const layout = await page.evaluate(() => {
        const card = document.querySelector('#cpMain>.cp-main-ending').getBoundingClientRect();
        const nav = document.querySelector('.main-nav').getBoundingClientRect();
        const lastAction = (document.querySelector('#cpMain>.cp-main-ending>.cp-teaser') || document.querySelector('#cpMain>.cp-main-ending>.cp-choices>:last-child')).getBoundingClientRect();
        return { gap: nav.top - card.bottom, lastActionBottom: lastAction.bottom, navTop: nav.top, overflow: document.documentElement.scrollWidth > innerWidth };
      });
      assert(!layout.overflow, `${type} ending has no horizontal overflow`);
      assert(layout.gap >= -2 && layout.gap < 18, `${type} ending fills the available height without covering the navigation: ${JSON.stringify(layout)}`);
      assert(layout.lastActionBottom < layout.navTop, `${type} ending actions remain above the navigation`);
    }
    await page.setViewportSize({ width: 320, height: 640 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Small-screen ending has no horizontal overflow');
    assert(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight), 'Small-screen ending can scroll instead of clipping its actions');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    assert(await page.evaluate(() => {
      const navTop = document.querySelector('.main-nav').getBoundingClientRect().top;
      const actionBottom = document.querySelector('#cpMain>.cp-main-ending>.cp-teaser').getBoundingClientRect().bottom;
      return actionBottom < navTop;
    }), 'Small-screen next-chapter action remains reachable above the fixed navigation');
    await page.setViewportSize({ width: 1280, height: 900 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Desktop ending has no horizontal overflow');
    assert.equal(await page.locator('#cpMain .cp-ending-type').textContent(), 'BE 结局');
    assert.deepEqual(errors, []);
    console.log('PASS: HE/TE/BE labels and compact ending layout at mobile and small-screen sizes.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
