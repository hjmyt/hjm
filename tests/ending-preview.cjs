const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    await page.clock.install({ time: new Date('2026-09-24T12:00:00Z') });
    await page.clock.pauseAt(new Date('2026-09-24T12:00:01Z'));
    for (let chapter = 1; chapter <= 6; chapter++) {
      const memory = await page.evaluate(chapter => {
        closeModal(); state = freshState(); state.sound = false;
        state.chronicle.completedChapters = Array.from({ length: chapter - 1 }, (_, i) => i + 1);
        const ending = chapter === 1 ? 'debut' : chapter === 2 ? 'c2_dual' : `c${chapter}_he`;
        const memory = ChronicleData.ENDINGS[ending].memory;
        Object.assign(state.chronicle.run, { chapter, name: '结局测试', inst: '弦乐', week: 6, tech: 40, scene: chapter <= 2 ? 'live_result' : ending });
        // Chapters 1–4 award the ending at performance completion, before the closing page.
        if (chapter <= 4) { state.chronicle.run.ending = ending; state.memories.push(memory); }
        route('chronicle');
        return memory;
      }, chapter);
      assert(await page.locator('#modalBackdrop').isHidden(), 'Do not interrupt final dialogue');
      await page.locator(chapter <= 2 ? '#cpMain [data-cp-action="chapter-finish"]' : '#cpMain [data-cp-choice="0"]').click();
      assert.equal(await page.evaluate(() => state.chronicle.run.scene), `title${chapter + 1}`);
      assert(await page.locator('#modalBackdrop').isVisible(), `Chapter ${chapter} automatically opens its memory`);
      assert.equal(await page.locator('.photo-frame img').getAttribute('src'), await page.evaluate(id => ASSETS[MEMORIES.find(m => m.id === id).asset], memory));
      const resources = await page.evaluate(() => JSON.stringify([state.coins, state.cards.tickets, state.memories]));
      await page.clock.fastForward(3000);
      await page.evaluate(() => renderGlobal());
      await page.clock.fastForward(999);
      assert(await page.locator('#modalBackdrop').isVisible());
      await page.clock.fastForward(1);
      assert(await page.locator('#modalBackdrop').isVisible(), 'Stay open after four seconds');
      await page.clock.fastForward(30000);
      assert(await page.locator('#modalBackdrop').isVisible(), 'No delayed auto-close');
      assert(!(await page.locator('#modalBackdrop').textContent()).includes('自动返回'), 'No outdated countdown copy');
      await page.locator('#closeModal').click();
      assert(await page.locator('#modalBackdrop').isHidden(), 'Close manually');
      await page.evaluate(() => { renderGlobal(); route('cards'); route('chronicle'); });
      assert(await page.locator('#modalBackdrop').isHidden(), 'Do not reopen on navigation');
      await page.reload();
      await page.evaluate(() => route('chronicle'));
      assert(await page.locator('#modalBackdrop').isHidden(), 'Do not reopen after loading the save');
      assert.equal(await page.evaluate(() => JSON.stringify([state.coins, state.cards.tickets, state.memories])), resources, 'Preview never grants resources');
    }
    // Existing completed saves without the new marker show once; locked/unknown endings do not.
    await page.evaluate(() => {
      state = freshState(); state.sound = false;
      state.chronicle.completedChapters = [1, 2, 3];
      Object.assign(state.chronicle.run, { chapter: 4, name: '旧结局', inst: '弦乐', ending: 'c4_he', scene: 'title5' });
      state.memories.push('cp4_he'); delete state.chronicle.run.previewedEnding; save();
    });
    await page.reload();
    await page.evaluate(() => route('chronicle'));
    assert(await page.locator('#modalBackdrop').isVisible(), 'Existing completed save gets its missing preview');
    await page.locator('#closeModal').click();
    await page.evaluate(() => renderGlobal());
    assert(await page.locator('#modalBackdrop').isHidden(), 'Manual close is respected');
    await page.locator('#cpMain [data-cp-action="restart"]').click();
    await page.clock.fastForward(250); // Respect the game's double-click guard.
    await page.locator('[data-cp-action="confirm-restart"]').click();
    assert.deepEqual(errors, []);
    assert.equal(await page.evaluate(() => state.chronicle.run.previewedEnding), null, 'A new run resets the preview marker');
    await page.evaluate(() => { const r = state.chronicle.run; r.ending = 'c4_he'; r.scene = 'title5'; r.rev++; renderGlobal(); });
    assert(await page.locator('#modalBackdrop').isVisible(), 'Replayed completion shows again');
    await page.evaluate(() => openModal('其他弹窗', '<p>继续查看</p>'));
    await page.clock.fastForward(5000);
    assert.equal(await page.locator('#modalTitle').textContent(), '其他弹窗');
    assert(await page.locator('#modalBackdrop').isVisible(), 'Old timeout cannot close a replacement modal');
    await page.evaluate(() => { closeModal(); route('album'); });
    await page.locator('#albumGrid [data-memory="cp4_he"]').click();
    await page.clock.fastForward(5000);
    assert(await page.locator('#modalBackdrop').isVisible(), 'Manual album viewing stays open');
    assert.deepEqual(errors, []);
    console.log('PASS: six real chapter-end transitions auto-open matching memories; persistent preview and manual close; reload/navigation deduplication; old saves; replay reset; resources unchanged; manual album and replacement modal retained.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
