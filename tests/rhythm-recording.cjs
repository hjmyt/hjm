const {chromium, devices} = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const {pathToFileURL} = require('node:url');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', ({'.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.mp3':'audio/mpeg'})[path.extname(file)] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
});
(async () => {
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const browser = await chromium.launch({headless:true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE} : {})});
    const errors = [];
    try {
        for (const [index, url] of [pathToFileURL(path.join(root,'index.html')).href, `http://127.0.0.1:${server.address().port}/index.html`].entries()) {
            const context = await browser.newContext(index ? devices['iPhone 13'] : {viewport:{width:1440,height:1000}});
            const page = await context.newPage();
            page.on('pageerror', e => errors.push(e.message));
            await page.addInitScript(() => {
                const Native = window.Audio;
                window.Audio = function(src) {
                    const audio = new Native(src);
                    if (src?.includes('op-preview')) window.recording = audio;
                    return audio;
                };
            });
            await page.goto(url);
            await page.locator('.nav-btn[data-route="rhythm"]').click();
            assert.equal(await page.locator('#trackSelect').inputValue(), '2', 'OP is selected by default');
            assert.equal(await page.locator('#trackSelect option').first().getAttribute('value'), '2', 'OP is displayed first');
            assert.match(await page.locator('#trackKind').textContent(), /原曲/);
            assert.equal(await page.evaluate(() => game.notes.length), 62);
            const duration = await page.evaluate(() => game.duration);
            await page.locator('[data-mode="normal"]').click();
            assert.equal(await page.evaluate(() => game.duration), duration, 'Difficulty never changes recording speed');
            assert.equal(await page.evaluate(() => game.notes.length), 121);
            assert(await page.evaluate(() => game.notes.some((n, i, a) => i && n.time-a[i-1].time < .3)), 'Hard chart includes drum subdivisions');
            await page.locator('[data-mode="gentle"]').click();
            await page.locator('#startGame').click();
            await page.waitForFunction(() => game.status === 'countdown' && recording.currentTime > 1.6);
            // Inspect actual canvas drawing during "2": only four fixed targets.
            assert.equal(await page.evaluate(() => {
                let paws=0;const original=drawPaw;
                try { drawPaw=(...args)=>{paws++;original(...args);};drawGame(performance.now()); }
                finally { drawPaw=original; }
                return paws;
            }),4,'No falling notes during the countdown');
            await page.keyboard.press('d');
            assert.equal(await page.evaluate(() => game.score + game.miss),0);
            await page.screenshot({path:`/tmp/hjm-countdown-${index ? 'mobile' : 'desktop'}.png`,fullPage:true});
            assert.equal(await page.evaluate(() => recording.playbackRate), 1);
            if (index) await page.evaluate(() => {
                // Same-origin HTTP permits observing the real media output.
                const source=audioCtx.createMediaElementSource(recording), analyser=audioCtx.createAnalyser();
                source.connect(analyser);analyser.connect(audioCtx.destination);
                const samples=new Float32Array(analyser.fftSize);window.introPeak=0;
                const sample=()=>{
                    if(game.status==='running' && game.elapsed<0){
                        analyser.getFloatTimeDomainData(samples);
                        for(const value of samples)window.introPeak=Math.max(window.introPeak,Math.abs(value));
                    }
                    requestAnimationFrame(sample);
                };sample();
            });
            // Pausing during the silent count-in must also freeze the media clock.
            await page.locator('#pauseGame').click();
            const paused = await page.evaluate(() => recording.currentTime);
            await page.waitForTimeout(180);
            assert.equal(await page.evaluate(() => recording.currentTime), paused);
            await page.locator('#gameOverlay [data-game="resume"]').click();
            await page.waitForFunction(() => game.status === 'running' && game.elapsed < -1.5);
            assert(await page.evaluate(() => game.notes[0].time-game.elapsed > 2.5), 'First note gets a full fall after countdown');
            if (index) {
                await page.waitForFunction(() => window.introPeak>.003 && game.elapsed<0);
                assert(await page.evaluate(() => recording.currentTime<5.5), 'Audible music during the lead-in, before the original silent-padding boundary');
            }
            await page.locator('#pauseGame').click();
            await page.locator('#gameOverlay [data-game="resume"]').click();
            await page.waitForFunction(() => game.status === 'running');
            assert(await page.locator('#gameOverlay').isHidden(), 'Lead-in resume does not restart countdown');
            await page.waitForFunction(() => game.elapsed > .05);
            assert(await page.evaluate(() => Math.abs(game.elapsed - (recording.currentTime - 5.5)) < .1));
            await page.locator('#soundBtn').click();
            assert(await page.evaluate(() => recording.muted));
            await page.locator('#soundBtn').click();
            assert.equal(await page.evaluate(() => recording.muted), false);
            // Real keyboard/touch handlers at an upcoming note; no mocked playback clock.
            const next = await page.evaluate(() => game.notes.find(n => n.time > gameTime() + .3));
            await page.waitForFunction(t => gameTime() >= t - .035, next.time, {polling:'raf'});
            if (index) await page.locator(`[data-lane="${next.lane}"]`).tap();
            else await page.keyboard.press(['d','f','j','k'][next.lane]);
            assert(await page.evaluate(() => game.score > 0));
            await page.screenshot({path:`/tmp/hjm-op-preview-${index ? 'mobile' : 'desktop'}.png`,fullPage:true});
            await page.locator('.nav-btn[data-route="home"]').click();
            assert.equal(await page.evaluate(() => game.status), 'paused');
            assert(await page.evaluate(() => recording.paused));
            await page.locator('.nav-btn[data-route="rhythm"]').click();
            await page.locator('#gameOverlay [data-game="resume"]').click();
            await page.waitForFunction(() => game.status === 'running');
            if (!index) {
                // Complete one real-time performance. Input scheduling uses the exact
                // same hit handler as controls; audio is neither sought nor accelerated.
                await page.evaluate(() => {
                    window.testHits = setInterval(() => {
                        for (const n of game.notes) if (!n.hit && !n.missed && Math.abs(n.time-gameTime()) < .035) hitLane(n.lane);
                        if (game.status === 'finished') clearInterval(window.testHits);
                    }, 8);
                });
                await page.waitForFunction(() => game.status === 'finished', null, {timeout:35000});
                assert(await page.evaluate(() => game.result.accuracy >= 85 && game.result.reward > 0 && recording.paused));
                const coins = await page.evaluate(() => state.coins);
                await page.evaluate(() => finishGame());
                assert.equal(await page.evaluate(() => state.coins), coins, 'End settles once');
                assert(await page.evaluate(() => state.best['love-hakimi-op-opening-drums-v1_gentle'].score > 0));
                await page.reload();
                assert(await page.evaluate(() => state.best['love-hakimi-op-opening-drums-v1_gentle'].score > 0));
            } else {
                await page.evaluate(() => {
                    Object.defineProperty(document, 'hidden', {configurable:true,value:true});
                    document.dispatchEvent(new Event('visibilitychange'));
                });
                assert(await page.evaluate(() => recording.paused && game.status === 'paused'));
                await page.evaluate(() => Object.defineProperty(document,'hidden',{configurable:true,value:false}));
                await page.locator('#restartGame').click();
                const before = await page.evaluate(() => state.coins);
                await page.route('**/love-hakimi-op-preview.mp3*', r => r.abort());
                await page.locator('#startGame').click();
                await page.waitForFunction(() => game.status === 'idle');
                assert.equal(await page.evaluate(() => state.coins), before, 'Failed load grants no payout');
                await page.unroute('**/love-hakimi-op-preview.mp3*');
                await page.locator('#startGame').click();
                await page.waitForFunction(() => game.status === 'countdown');
                await page.locator('#restartGame').click();
                assert(await page.evaluate(() => recording.paused && game.status === 'idle'));
                await page.locator('#trackSelect').selectOption('0');
                await page.locator('#startGame').click();
                await page.waitForFunction(() => game.status === 'countdown');
                assert(await page.evaluate(() => recording.paused && songNodes.size > 0));
            }
            await context.close();
        }
        assert.deepEqual(errors, []);
        console.log('PASS: OP file/HTTP playback, two original-speed charts, media-clock sync, real keyboard/touch hits, countdown and route/background pause, mute, complete-once rewards, persistence, load failure/retry and synth fallback.');
    } finally {
        await browser.close();
        await new Promise(r => server.close(r));
    }
})().catch(e => {console.error(e);process.exitCode=1;});
