const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
(async () => {
    const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
    try {
        const page = await browser.newPage({ viewport: { width: 390, height: 820 } });
        const errors = []; page.on('pageerror', e => errors.push(e.message));
        await page.goto(pathToFileURL(path.resolve(__dirname, '../previews/paw-gift.html')).href);
        await page.locator('#replay').click();
        await page.waitForFunction(() => previewAudio?.state === 'running');
        await page.evaluate(() => {
            PawGift.stop();
            window.meter = previewAudio.createAnalyser(); meter.fftSize = 2048;
            previewOutput.connect(meter);
            window.sample = () => {
                const values = new Float32Array(meter.fftSize); meter.getFloatTimeDomainData(values);
                return Math.max(...values.map(Math.abs));
            };
            window.capture = () => new Promise(resolve => {
                const peaks = [0, 0, 0];
                const start = performance.now();
                document.getElementById('replay').click();
                const tick = () => {
                    const t = performance.now() - start;
                    for (const [i, from, to] of [[0, 310, 600], [1, 1020, 1510], [2, 1810, 2550]]) {
                        if (t > from && t < to) peaks[i] = Math.max(peaks[i], sample());
                    }
                    if (t < 2750) requestAnimationFrame(tick); else resolve(peaks);
                }; tick();
            });
        });
        const peaks = await page.evaluate(() => capture());
        peaks.forEach((peak, i) => assert(peak > .001, `Cue ${i} produces real audio: ${peak}`));
        await page.locator('#sound-toggle').click();
        const muted = await page.evaluate(() => capture());
        assert(muted.every(p => p < .0001), 'Muted preview has no audio signal');
        await page.locator('#sound-toggle').click();
        await page.locator('#replay').click();
        await page.waitForTimeout(450);
        await page.locator('#sound-toggle').click();
        await page.waitForTimeout(180);
        assert(await page.evaluate(() => sample() < .0001), 'Mid-animation mute silences active nodes');
        await page.locator('#sound-toggle').click();
        await page.waitForTimeout(1250);
        assert(await page.evaluate(() => sample() < .0001), 'Unmute does not replay cancelled cues');
        await page.locator('#replay').click();
        await page.waitForTimeout(400);
        await page.evaluate(() => PawGift.stop());
        await page.waitForTimeout(150);
        assert(await page.evaluate(() => sample() < .0001), 'Cleanup stops sound');
        await page.locator('#replay').click(); await page.locator('#replay').click();
        assert.equal(await page.locator('.paw-gift').count(), 1);
        await page.waitForTimeout(3400);
        assert.equal(await page.locator('.paw-gift').count(), 0);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.locator('#replay').click();
        assert.equal(await page.locator('.paw-gift-hand').isVisible(), false);
        await page.waitForTimeout(200);
        assert(await page.evaluate(() => sample() > .001), 'Reduced motion uses one gentle confirmation cue');
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
        await page.locator('[data-music-enter-muted]').click();
        await page.evaluate(() => {
            state = freshState(); state.sound = true; state.coins = 100;
            state.cards.encounters = CARD_DEFS.map(c => c.id);
            goCard('jerry'); chooseCardGift(effectiveGifts(cardDef('jerry'))[0][0]);
        });
        await page.locator('#cardFeedBtn').click();
        await page.waitForFunction(() => synthNodes.size > 0);
        assert.equal(await page.locator('.paw-gift').count(), 1);
        await page.evaluate(() => route('home'));
        assert(await page.evaluate(() => synthNodes.size === 0), 'Navigation releases shared game audio nodes');
        assert.deepEqual(errors, []);
        console.log('PASS: three audible timed cues, mute, mid-play mute/unmute, cancellation, replay cleanup and reduced motion.');
    } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
