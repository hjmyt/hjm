const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { pathToFileURL } = require('node:url');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const fileURL = pathToFileURL(path.join(root, 'index.html')).href;
const media = JSON.parse(execFileSync('ffprobe', ['-v', 'quiet', '-show_streams', '-of', 'json', path.join(root, 'assets/pet/hakimi-companion-trio-202610.mp4')], { encoding: 'utf8' }));
assert.equal(media.streams.length, 1, 'Delivered video has no competing audio track');
assert.equal(media.streams[0].codec_name, 'h264');
assert(Number(media.streams[0].duration) >= 10, 'Full supplied animation survives compression');
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.webp': 'image/webp', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg' };
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(fileURL);
    assert.equal(await page.locator('#petRoomVideo').getAttribute('src'), null, 'Home does not download the video');
    await page.evaluate(() => { closeModal(false); document.querySelector('[data-music-enter-muted]')?.click(); route('care'); });
    await page.waitForFunction(() => !$('petRoomVideo').paused && !$('petRoomVideo').hidden && $('petRoomVideo').currentTime > .1);
    assert.equal(await page.evaluate(() => $('petRoomVideo').muted), true);
    const snapshot = await page.evaluate(() => JSON.stringify(state));
    for (const pose of ['rest', 'music', 'idle']) {
      await page.locator(`[data-pet-pose-select="${pose}"]`).click();
      assert.equal(await page.locator(`[data-pet-pose-select="${pose}"]`).getAttribute('aria-pressed'), 'true');
      assert.equal(await page.evaluate(() => !$('petRoomImage').hidden), true, 'Selected cat remains visible beside the separate concert');
    }
    assert.equal(await page.evaluate(() => JSON.stringify(state)), snapshot, 'Pose switches grant no progress or currency');
    await page.waitForFunction(() => !$('petRoomVideo').hidden);
    await page.locator('#petMotionToggle').click();
    assert.equal(await page.evaluate(() => $('petRoomVideo').paused && !$('petRoomImage').hidden), true);
    await page.locator('#petMotionToggle').click();
    await page.waitForFunction(() => !$('petRoomVideo').paused);
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
    const pausedTime = await page.evaluate(() => $('petRoomVideo').currentTime);
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => $('petRoomVideo').currentTime), pausedTime, 'Background stops the video clock');
    await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
    await page.waitForFunction(() => !$('petRoomVideo').paused);
    await page.evaluate(() => route('cards'));
    assert.equal(await page.evaluate(() => $('petRoomVideo').paused), true, 'Navigation releases playback');
    await page.evaluate(() => { route('care'); setPetPose('rest'); setPetPose('idle'); setPetPose('music'); setPetPose('idle'); });
    await page.waitForFunction(() => !$('petRoomVideo').paused && !$('petRoomVideo').hidden);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => $('petRoomVideo').paused);
    assert.equal(await page.evaluate(() => $('petRoomVideo').paused), true, 'Changing motion preference pauses video');

    const checks = await page.evaluate(() => {
      const checks = [], check = (label, value) => { if (!value) throw Error(label); checks.push(label); };
      const act = action => { lastPetAction = -1000; care(action); };
      state = freshState(); state.sound = false; state.cat.hunger = 0; state.coins = 4; renderGlobal();
      act('feed'); check('Insufficient balance preserves all feeding state', state.coins === 4 && state.cat.hunger === 0 && state.cat.aff === 0 && !state.bondProgress.daily.counts['catGift:cat']);
      check('UI explains the real five-note price', $('petCareRules').textContent.includes('5 音符') && $('view-care').querySelector('[data-care="feed"]').disabled);
      state.coins = 30;
      for (let i = 0; i < 6; i++) act('feed');
      check('Five paid gifts, then reject', state.coins === 5 && state.cat.aff === 5 && state.cat.hunger === 90 && state.bondProgress.daily.counts['catGift:cat'] === 5);
      check('Limit text and disabled UI match execution', $('petFeedQuota').textContent === '今日小鱼干 5 / 5 次' && $('view-care').querySelector('[data-care="feed"]').disabled);
      act('pet'); act('play'); check('Free companionship cannot farm bonds', state.cat.aff === 6 && state.coins === 5);
      check('Play stays with the selected orange cat', petPose === 'idle' && $('petRoomImage').src.includes('hakimi-bow-trio'));
      state.cat.energy = 0; lastRest = 0; act('rest');
      check('Actual rest button action restores energy without payment', state.cat.energy === 25 && state.coins === 5 && state.cat.aff === 6 && petPose === 'idle');
      act('rest'); check('Rest cooldown rejects repeated clicks', state.cat.energy === 25);
      state.cat.energy = 98; lastRest = 0; act('rest'); check('Rest caps at 100', state.cat.energy === 100);
      state.bondProgress.daily.date = '2000-01-01'; state.cat.hunger = 99; act('feed');
      check('Next day restores gift quota and caps fullness', state.coins === 0 && state.cat.hunger === 100 && state.bondProgress.daily.counts['catGift:cat'] === 1);
      const full = JSON.stringify(state); act('feed'); check('Full cat refuses payment', JSON.stringify(state) === full);
      state.cat.hunger = 0; state.coins = 10; state.cat.aff = 99; act('feed');
      state.cat.hunger = 0; act('feed'); check('Feeding never exceeds normal bond cap', state.cat.aff === 100 && state.coins === 0);
      state.coins = 10; state.cat.hunger = 0; save();
      const before = JSON.stringify({ cat: state.cat, coins: state.coins, ledger: state.bondProgress, memories: state.memories }), raw = localStorage.getItem(KEY);
      const native = Storage.prototype.setItem;
      Storage.prototype.setItem = function(key, value) { if (key === KEY) throw Error('Injected save failure'); return native.call(this, key, value); };
      try { act('feed'); } finally { Storage.prototype.setItem = native; }
      check('Failed save restores currency, cat, quota and memories', before === JSON.stringify({ cat: state.cat, coins: state.coins, ledger: state.bondProgress, memories: state.memories }));
      check('Failed save keeps previous readable save', localStorage.getItem(KEY) === raw);
      storageOK = true;
      state.catName = '蓝莓'; state.coins = 77; state.cat = { aff: 42, hunger: 33, mood: 64, energy: 19, pets: 12 }; state.memories = ['first', 'purr', 'photo', 'trust']; save(); renderGlobal();
      return checks;
    });
    await page.reload();
    assert.deepEqual(await page.evaluate(() => ({ name: state.catName, coins: state.coins, cat: state.cat, memories: state.memories })), { name: '蓝莓', coins: 77, cat: { aff: 42, hunger: 33, mood: 64, energy: 19, pets: 12 }, memories: ['first', 'purr', 'photo', 'trust'] }, 'Reload preserves existing names, cat growth and memories');
    const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/pre-bingbing-v3.json'), 'utf8'));
    await page.evaluate(fixture => {
      const previous = cleanState(fixture);
      if (previous.catName !== fixture.catName || previous.cat.energy !== fixture.cat.energy || !previous.memories.includes('cp7_azhe_03')) throw Error('Historical save preservation');
      const once = JSON.stringify(previous.cat); const twice = JSON.stringify(cleanState(JSON.parse(JSON.stringify(previous))).cat);
      if (once !== twice) throw Error('Historical save cleaning must be idempotent');
    }, fixture);
    await page.evaluate(() => { route('care'); $('takePhoto').click(); });
    assert.equal(await page.evaluate(() => $('modalContent').querySelector('img').src.includes('hakimi-bow-trio')), true, 'Album detail uses supplied cat identity');
    await page.evaluate(() => closeModal(false));
    for (const width of [320, 390, 760, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      for (const pose of ['idle', 'rest', 'music']) {
        await page.evaluate(pose => setPetPose(pose), pose);
        await page.waitForFunction(() => $('petRoomImage').complete && $('petRoomImage').naturalWidth > 0);
        assert.equal(await page.evaluate(() => {
          const image = $('petRoomImage'), host = image.closest('.cat-touch');
          return Math.abs(image.getBoundingClientRect().width - host.getBoundingClientRect().width) < 1 && getComputedStyle(image).objectFit === 'contain';
        }), true, `${width}px ${pose} uses the full centered image area`);
        const layout = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, offenders: [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1 && e.getBoundingClientRect().width).map(e => `${e.tagName}.${e.className}`).slice(0, 8) }));
        assert(layout.scroll <= width, `${width}px ${pose} has no horizontal overflow: ${JSON.stringify(layout)}`);
        for (const selector of ['.pet-pose-picker', '#view-care .pet-actions', '.pet-room-cat']) {
          const box = await page.locator(selector).boundingBox();
          assert(box.x >= 0 && box.x + box.width <= width + 1, `${selector} stays inside ${width}px`);
        }
      }
    }
    const reduced = await browser.newPage({ reducedMotion: 'reduce' });
    await reduced.goto(fileURL + '#care');
    assert.equal(await reduced.locator('#petRoomVideo').getAttribute('src'), null, 'Reduced motion never downloads animation');
    assert.equal(await reduced.locator('#petRoomImage').isVisible(), true);
    await reduced.close();
    // Real HTTP media loading and error fallback, independently of file://.
    const httpPage = await browser.newPage();
    httpPage.on('pageerror', e => errors.push(e.message));
    const address = `http://127.0.0.1:${server.address().port}/index.html#care`;
    await httpPage.goto(address);
    await httpPage.locator('[data-music-enter-muted]').click();
    await httpPage.waitForFunction(() => !$('petRoomVideo').hidden && $('petRoomVideo').currentTime > .1);
    await httpPage.close();
    const failed = await browser.newPage();
    failed.on('pageerror', e => errors.push(e.message));
    await failed.route('**/hakimi-companion-trio-202610.mp4', route => route.abort());
    await failed.goto(address);
    await failed.locator('[data-music-enter-muted]').click();
    await failed.waitForFunction(() => petVideoFailed && !$('petRoomImage').hidden);
    assert.equal(await failed.locator('#petMotionToggle').innerText(), '重试动画');
    await failed.unroute('**/hakimi-companion-trio-202610.mp4');
    await failed.locator('#petMotionToggle').click();
    await failed.waitForFunction(() => !$('petRoomVideo').hidden && !$('petRoomVideo').paused);
    assert.deepEqual(errors, []);
    console.log('PASS: pet identity, three poses, full muted video on file/HTTP, lifecycle/retry/reduced motion, feeding boundaries, rest, save rollback, reload/legacy preservation, album and 320–1440px layouts. ' + checks.length + ' gameplay checks.');
  } finally { await browser.close(); server.close(); }
})().catch(error => { server.close(); console.error(error); process.exitCode = 1; });
