const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const fixture = require('./fixtures/personal-v1-cp-he.json');
const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
    const data = fs.readFileSync(file), types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.webp': 'image/webp' };
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Content-Length': data.length }); res.end(data);
});
(async () => {
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
    try {
        for (const url of [pathToFileURL(path.join(root, 'index.html')).href, `http://127.0.0.1:${server.address().port}/index.html`]) {
            const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
            const page = await context.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
            await page.addInitScript(() => {
                const AC = window.AudioContext || window.webkitAudioContext, original = AC.prototype.createGain;
                AC.prototype.createGain = function(...args) {
                    const gain = original.apply(this, args), connect = gain.connect;
                    gain.connect = function(destination, ...rest) {
                        const result = connect.call(this, destination, ...rest);
                        if (destination === this.context.destination) { window.outputMeter = this.context.createAnalyser(); connect.call(this, outputMeter); }
                        return result;
                    }; return gain;
                };
            });
            await page.goto(url); await page.locator('[data-music-enter]').click();
            await page.evaluate(() => {
                state = freshState(); state.sound = true; state.coins = 123; Chronicle.enterFusionCp();
                const p = state.chronicle.personal, s = p.routes.baoshi_feihong;
                s.scene = 'cp_HE'; s.page = 3; p.rev++; save(); renderGlobal();
            });
            assert.equal(await page.locator('.story-cinematic').count(), 0, 'No early scene spoiler');
            await page.locator('[data-cp-action="personal-page"]').click();
            assert.equal(await page.locator('.story-cinematic').count(), 0, 'Reading hug page does not auto-open');
            assert(await page.evaluate(() => state.memories.includes('cp7_cp_HE_page5') && !state.memories.includes('cp7_cp_HE_page6') && state.coins === 123));
            await page.waitForTimeout(220);
            await page.locator('[data-cp-action="personal-page"]').click();
            await page.waitForTimeout(220);
            await page.locator('[data-cp-action="personal-choose"]').click();
            await page.waitForSelector('.story-cinematic');
            await page.waitForFunction(() => { const v = document.querySelector('.cinematic-picture video'); return v && !v.paused && v.currentTime > .1; });
            assert(await page.evaluate(() => { const v = document.querySelector('.cinematic-picture video'); return !v.loop && v.muted && v.playsInline && v.videoWidth === 960 && v.videoHeight === 720; }), 'Silent inline video automatically plays');
            await page.evaluate(() => { const v = document.querySelector('.cinematic-picture video'); v.currentTime = v.duration - .25; });
            await page.waitForFunction(() => { const v = document.querySelector('.cinematic-picture video'); const img = document.querySelector('.cinematic-still'); return v.ended && v.hidden && !img.hidden && img.complete && img.naturalWidth > 0; });

            await page.waitForFunction(() => { const a = document.getElementById('storyBgmAudio'); return a.currentSrc.includes('baoshi-feihong-ferris-wheel.mp3') && !a.paused && a.currentTime > .1; });
            assert(await page.evaluate(() => document.querySelector('.cinematic-still').getAttribute('src') === ASSETS.personal_cp_HE_page5), 'Finish displays the original illustration');
            await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); renderGlobal(); });
            assert(await page.evaluate(() => { const v = document.querySelector('.cinematic-picture video'); return v.paused && v.hidden && !document.querySelector('.cinematic-still').hidden; }), 'Returning from background preserves the final illustration');
            await page.locator('[data-cinematic-replay]').click();
            await page.waitForFunction(() => { const v = document.querySelector('.cinematic-picture video'); return !v.hidden && !v.paused && v.currentTime < 3 && document.querySelector('.cinematic-still').hidden; });
            assert(await page.evaluate(() => state.chronicle.personal.routes.baoshi_feihong.previewed === 'cp_HE' && state.chronicle.personal.routes.baoshi_feihong.scene === 'complete' && state.memories.includes('cp7_cp_HE_page5') && state.coins === 138));
            assert.equal(await page.locator('audio').count(), 1, 'One shared music player');
            assert(await page.evaluate(() => Math.abs(document.getElementById('storyBgmAudio').duration - 208.956531) < .1));
            if (url.startsWith('http')) await page.waitForFunction(() => { if (!window.outputMeter) return false; const a = new Float32Array(outputMeter.fftSize); outputMeter.getFloatTimeDomainData(a); return a.some(v => Math.abs(v) > .00001); }, null, { timeout: 8000 });
            const t = await page.evaluate(() => document.getElementById('storyBgmAudio').currentTime);
            await page.evaluate(() => { renderGlobal(); renderGlobal(); });
            assert(await page.evaluate(t => document.getElementById('storyBgmAudio').currentTime >= t, t), 'Rerender does not restart BGM');
            for (const [width, height] of [[1440, 1000], [320, 480], [375, 560], [390, 664], [430, 760], [390, 844], [844, 390]]) {
                await page.setViewportSize({ width, height });
                await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
                if (width <= 720) {
                    await page.evaluate(() => { const story = document.querySelector('.cinematic-story'); story.scrollTop = story.scrollHeight; });
                    assert(await page.evaluate(() => {
                        const story = document.querySelector('.cinematic-story'), footer = document.querySelector('.cinematic-footer').getBoundingClientRect();
                        const last = document.querySelector('.cinematic-credit').getBoundingClientRect();
                        return last.bottom <= footer.top && last.top >= story.getBoundingClientRect().top && story.clientHeight > 100 && footer.bottom <= innerHeight + 1;
                    }), `All final text reachable above controls at ${width}x${height}`);
                    await page.evaluate(() => { document.querySelector('.cinematic-story').scrollTop = 0; });
                }
                await page.locator('.story-cinematic').screenshot({ path: `/tmp/cp-he-cinematic-${width}.png` });
                assert(await page.evaluate(() => {
                    const picture = document.querySelector('.cinematic-picture video'), close = document.querySelector('[data-cinematic-close]').getBoundingClientRect();
                    return document.documentElement.scrollWidth <= innerWidth && getComputedStyle(picture).objectFit === 'contain' && close.bottom <= innerHeight && close.left >= 0;
                }), `Safe full composition and controls ${width}`);
            }
            await page.locator('[data-cinematic-replay]').click();
            await page.locator('.cinematic-music [data-music-toggle]').click();
            assert(await page.evaluate(() => document.getElementById('storyBgmAudio').paused));
            await page.locator('.cinematic-music [data-music-toggle]').click();
            await page.waitForFunction(() => !document.getElementById('storyBgmAudio').paused);
            await page.evaluate(() => { state.sound = false; renderGlobal(); });
            assert(await page.evaluate(() => document.getElementById('storyBgmAudio').paused), 'Global mute honored');
            await page.evaluate(() => { state.sound = true; renderGlobal(); });
            await page.waitForFunction(() => !document.getElementById('storyBgmAudio').paused);
            await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
            assert(await page.evaluate(() => document.getElementById('storyBgmAudio').paused && document.querySelector('.story-cinematic').classList.contains('is-paused') && document.querySelector('.cinematic-picture video').paused));
            await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
            await page.waitForFunction(() => !document.querySelector('.cinematic-picture video').paused);
            await page.evaluate(() => { window.closedCinematicVideo = document.querySelector('.cinematic-picture video'); });
            await page.locator('[data-cinematic-close]').click();
            assert(await page.evaluate(() => closedCinematicVideo.paused && !closedCinematicVideo.hasAttribute('src')), 'Closing releases video');
            await page.evaluate(() => renderGlobal());
            assert.equal(await page.locator('.story-cinematic').count(), 0, 'Closing stays closed during ordinary rerenders');
            await page.reload(); await page.locator('[data-music-enter-muted]').click();
            await page.evaluate(() => route('chronicle'));
            assert.equal(await page.locator('.story-cinematic').count(), 1, 'Reloaded HE opens automatically');
            await page.locator('[data-cinematic-close]').click();
            await page.locator('[data-cp-action="personal-cinematic"]').click();
            assert.equal(await page.locator('.story-cinematic').count(), 1, 'Explicit replay works');
            await page.evaluate(() => route('home'));
            assert.equal(await page.locator('.story-cinematic').count(), 0, 'Navigation closes presentation');
            await page.evaluate(() => route('chronicle'));
            assert.equal(await page.locator('.story-cinematic').count(), 1, 'Returning in the same run opens automatically');
            await page.locator('[data-cinematic-close]').click();
            await page.evaluate(() => route('chronicle'));
            assert.equal(await page.locator('.story-cinematic').count(), 1, 'Explicit reentry opens automatically');
            await page.evaluate(() => route('home'));
            await page.evaluate(() => { const p = state.chronicle.personal, s = p.routes.baoshi_feihong; s.scene = 'cp_BE'; s.ending = null; s.page = 4; p.rev++; route('chronicle'); });
            assert.equal(await page.locator('.story-cinematic').count(), 0, 'BE cannot trigger HE');
            // The existing per-run previewed receipt remains the only persisted marker.
            const cleaned = await page.evaluate(old => {
                state = freshState(); state.chronicle.personal = old;
                const clean = cleanState(JSON.parse(JSON.stringify(state)));
                return { first: clean.chronicle.personal, again: cleanState(JSON.parse(JSON.stringify(clean))).chronicle.personal };
            }, fixture.personal);
            assert.deepEqual(cleaned.first, fixture.personal, 'Previous shape is preserved exactly');
            assert.deepEqual(cleaned.first, cleaned.again, 'Cleaning remains idempotent');
            const completed = structuredClone(fixture.personal);
            Object.assign(completed.routes.baoshi_feihong, {scene:'complete', ending:'cp_HE', endings:['cp_HE'], previewed:'cp_HE'});
            await page.evaluate(old => { state = freshState(); state.chronicle.personal = old; state.economy.claimed['chapter:7'] = true; save(); }, completed);
            await page.reload(); await page.locator('[data-music-enter-muted]').click(); await page.evaluate(() => route('chronicle'));
            assert.equal(await page.locator('.story-cinematic').count(), 1, 'Previously viewed old ending also opens on entry');
            await page.locator('[data-cinematic-close]').click();
            await page.waitForTimeout(220);
            await page.locator('[data-cp-action="personal-restart"]').first().click();
            await page.waitForTimeout(220);
            await page.locator('[data-cp-action="personal-confirm-restart"]').click();
            assert(await page.evaluate(() => state.chronicle.personal.routes.baoshi_feihong.previewed === null), 'New run clears original preview receipt');
            await page.evaluate(() => { const p=state.chronicle.personal,s=p.routes.baoshi_feihong;s.scene='cp_HE';s.page=5;p.rev++;renderGlobal(); });
            await page.waitForTimeout(220);
            await page.locator('[data-cp-action="personal-choose"]').click();
            assert.equal(await page.locator('.story-cinematic').count(), 1, 'Entering HE after restart automatically opens embrace again');
            await page.locator('[data-cinematic-close]').click();
            await page.waitForTimeout(220);
            await page.locator('[data-cp-action="personal-cinematic"]').click();
            assert.equal(await page.locator('.story-cinematic').count(), 1);
            assert(await page.evaluate(() => state.coins === 30), 'A known old ending and replay never duplicate the chapter reward');
            assert.deepEqual(errors, []);
            await context.close();
        }
        console.log('PASS: HE-only entry, manual close/replay, shared audio signal and controls, three viewports, reload, previous-version compatibility and restart.');
    } finally { await browser.close(); await new Promise(r => server.close(r)); }
})().catch(e => { console.error(e); process.exitCode = 1; });
