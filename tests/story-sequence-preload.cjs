const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
    const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
    try {
        const page = await browser.newPage();
        await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
        const result = await page.evaluate(async () => {
            const NativeImage = window.Image;
            const started = [];
            let active = 0, peak = 0;
            class TimedImage extends EventTarget {
                complete = false;
                decoding = '';
                set src(value) {
                    started.push(value);
                    peak = Math.max(peak, ++active);
                    setTimeout(() => {
                        this.complete = true;
                        active--;
                        this.dispatchEvent(new Event('load'));
                    }, 8);
                }
                decode() { return Promise.resolve(); }
            }
            window.Image = TimedImage;
            try {
                scheduleStorySequencePreload(['chapter-a', 'chapter-b', 'chapter-b', 'chapter-c'], { limit: 2 });
                await new Promise(resolve => setTimeout(resolve, 130));
                const first = { started: [...started], peak, retained: storySequencePreloads.size };
                scheduleStorySequencePreload(['old-1', 'old-2']);
                await new Promise(resolve => setTimeout(resolve, 3));
                scheduleStorySequencePreload(['new-1', 'new-2']);
                await new Promise(resolve => setTimeout(resolve, 90));
                return { first, second: started.slice(first.started.length) };
            } finally {
                window.Image = NativeImage;
                scheduleStorySequencePreload([]);
            }
        });
        assert.deepEqual(result.first.started, ['chapter-a', 'chapter-b', 'chapter-c']);
        assert.equal(result.first.peak, 1, 'Chapter artwork loads one image at a time');
        assert.equal(result.first.retained, 2, 'Older image references leave the bounded queue');
        assert.deepEqual(result.second, ['old-1', 'new-1', 'new-2'], 'Entering a different chapter cancels the previous chapter queue');
        console.log('PASS: ordered chapter image loading, deduplication, bounded references and queue cancellation.');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
