const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

(async () => {
    const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
    try {
        for (const [width, touch] of [[390, false], [390, true], [320, true], [1440, false]]) {
            const page = await browser.newPage({ viewport: { width, height: 844 }, isMobile: touch, hasTouch: touch });
            const errors = [];
            page.on('pageerror', e => errors.push(e.message));
            await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
            await page.evaluate(async () => {
                state = freshState(); state.sound = true; state.coins = 30;
                const r = state.chronicle.run;
                Object.assign(r, { name: '滚动回归', inst: '弦乐', scene: 'menu', week: 1 });
                r.weekly.done = [1, 2, 3, 4, 5]; r.weekly.active = 0;
                route('chronicle'); await ensureAudio();
                window.__audioOffset = 0;
                const get = Object.getOwnPropertyDescriptor(BaseAudioContext.prototype, 'currentTime').get;
                Object.defineProperty(audioCtx, 'currentTime', { get: () => get.call(audioCtx) + window.__audioOffset });
            });
            const selector = action => `[data-cp-action="${action}"]`;
            const activate = async locator => touch ? locator.tap() : locator.click();
            await activate(page.locator(`${selector('training-start')}[data-cp-week="1"]`));
            await page.waitForTimeout(700); // Let the intentional scene-entry scroll finish.
            const y = () => page.evaluate(() => scrollY);
            async function unchanged(before, label) {
                await page.waitForTimeout(300); // Also catch delayed browser anchoring/smooth scroll.
                const now = await page.evaluate(() => ({ y: scrollY, max: document.documentElement.scrollHeight - innerHeight }));
                assert(Math.abs(now.y - Math.min(before, now.max)) <= 2, `${width}px ${label}: ${before} -> ${now.y}`);
            }
            async function press(action, suffix = '') {
                const button = page.locator(selector(action) + suffix);
                // Position the real control clear of the fixed mobile navigation.
                if (action === 'training-begin') await button.scrollIntoViewIfNeeded();
                else await button.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
                await page.waitForTimeout(300);
                const before = await y();
                assert(before > 100, 'Exercise must be scrolled away from the page top');
                await activate(button);
                await unchanged(before, action);
            }
            async function endPlayback(phase) {
                // A player may scroll during playback. Completion must preserve this
                // latest position, not restore the position where playback began.
                await page.evaluate(() => window.scrollBy({ top: -40, behavior: 'instant' }));
                const before = await y();
                await page.evaluate(() => { window.__audioOffset += 10; });
                await page.waitForFunction(phase => state.chronicle.run.weekly.training[1].phase === phase && !document.querySelector('[data-cp-action="training-ear-stop"]'), phase);
                await unchanged(before, 'playback completion');
            }
            await press('training-begin');
            await page.waitForFunction(() => document.querySelector('.cp-ear-note.sounding'));
            assert(await page.locator('.cp-ear-note.sounding').evaluate(el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight - 90; }), 'Playing animation stays on screen');
            await endPlayback('input');
            await press('training-ear-answer', '[data-cp-answer="6"]');
            await press('training-ear-select', '[data-ear-index="2"]');
            await press('training-ear-answer', '[data-cp-answer="6"]');
            await press('training-ear-answer', '[data-cp-answer="2"]');
            await press('training-ear-replay');
            await endPlayback('input');
            await press('training-ear-submit');
            const scored = await page.evaluate(() => JSON.stringify([state.chronicle.run.weekly.training[1], state.economy.training, state.coins]));
            await press('training-ear-review');
            await endPlayback('feedback');
            await press('training-ear-review');
            await press('training-ear-stop');
            assert.equal(await page.evaluate(() => JSON.stringify([state.chronicle.run.weekly.training[1], state.economy.training, state.coins])), scored, 'Review does not change scores or rewards');
            await press('training-next');
            await press('training-begin');
            // Navigation retains its own top-of-page behavior, with no stale restore.
            await page.evaluate(() => route('album'));
            await page.waitForTimeout(350);
            assert.equal(await y(), 0);
            assert.deepEqual(errors, []);
            await page.close();
        }
        console.log('PASS: 390/320/1440px real touch/click training controls and playback completion preserve scroll; highlights remain visible; navigation and rewards unchanged.');
    } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
