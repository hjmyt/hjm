'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href + '#pitch-rhythm');
    await page.locator('[data-music-enter-muted]').click();
    const mount = page.locator('#pitchGameMount');
    await mount.locator('[data-action="start"]').waitFor();
    await page.evaluate(() => { state.sound = true; PitchAudition.syncSound(); });

    async function layout() {
      await page.waitForFunction(() => {
        const body = document.querySelector('#pitchGameMount').shadowRoot.querySelector('.game-body');
        const help = body.querySelector('#holdHelp'), mobile = matchMedia('(max-width:700px)').matches;
        return getComputedStyle(body).display === (mobile ? 'flex' : 'block') && getComputedStyle(help).order === (mobile ? '1' : '0');
      });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      return mount.evaluate(host => {
        const root = host.shadowRoot;
        const rect = selector => {
          const element = root.querySelector(selector);
          if (!element) return null;
          const box = element.getBoundingClientRect();
          return { top: box.top, bottom: box.bottom, height: box.height };
        };
        return {
          score: rect('.score-sheet'), help: rect('#holdHelp'),
          actions: rect('.audio-actions'), description: rect('.audio-strip > span'),
          countdown: rect('.count-panel'), tap: rect('.tap-pad'),
          helpText: root.querySelector('#holdHelp')?.textContent,
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
          mountOverflow: host.getBoundingClientRect().right > innerWidth + 1,
          innerScrollers: [...root.querySelectorAll('*')].filter(element => {
            const style = getComputedStyle(element);
            return /(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 2;
          }).length
        };
      });
    }

    for (const mode of ['simple', 'medium']) {
      await page.evaluate(mode => {
        const game = window.__rhythmAudition;
        game.stages[0] = { stage: 1, meter: '2/4', tempo: 84, measures: [['half'], ['eighth-pair', 'quarter']] };
        game.state.mode = mode;
        game.startGame();
      }, mode);
      for (const width of [320, 390, 700, 701, 1440, 390]) {
        await page.setViewportSize({ width, height: 844 });
        const ready = await layout();
        assert.match(ready.helpText, /可以松开.*下一音.*延音线.*休止符.*三连音/, 'Full instructions remain available');
        assert.equal(await mount.locator('[data-action="preview"]').count(), mode === 'simple' ? 1 : 0, 'Mode permissions do not change with mobile layout');
        assert.equal(ready.mountOverflow, false, `${mode}/${width}: exercise stays inside the viewport`);
        // The existing main header can exceed 320 px after its font has loaded.
        // Keep that unrelated header issue separate from the exercise layout.
        if (width >= 390) assert.equal(ready.horizontalOverflow, false, `${mode}/${width}: no horizontal overflow`);
        assert.equal(ready.innerScrollers, 0, `${mode}/${width}: no nested vertical scroller`);
        if (width <= 700) {
          assert(ready.actions.top >= ready.score.bottom && ready.actions.top - ready.score.bottom <= 32, `${mode}/${width}: mobile controls immediately follow the score: ${JSON.stringify(ready)}`);
          assert(ready.description.top >= ready.actions.bottom, 'Metronome explanation follows preview/start controls');
          assert(ready.help.top >= ready.description.bottom, 'Long-press instructions are at the bottom');
          assert(ready.actions.height >= 48, 'Touch controls keep their usable size');
        } else {
          assert(ready.help.top >= ready.score.bottom && ready.help.bottom <= ready.actions.top, 'Desktop retains instructions before controls');
        }
      }

      if (mode === 'simple') {
        await mount.locator('[data-action="preview"]').click();
        await mount.locator('[data-listen-countdown]:not([hidden])').waitFor();
        const preview = await layout();
        assert(preview.actions.bottom <= preview.description.top, 'Preview countdown stays with controls above instructions');
        await page.screenshot({ path: '/tmp/hjm-rhythm-mobile-ready.png', fullPage: true });
      }
      await mount.locator('[data-action="perform"]').click();
      await mount.locator('.tap-pad').waitFor();
      for (const width of [390, 1440, 390]) {
        await page.setViewportSize({ width, height: 844 });
        const playing = await layout();
        assert.equal(await mount.locator('.tap-pad').getAttribute('aria-describedby'), 'holdHelp', 'Button remains associated with complete instructions');
        if (width <= 700) {
          assert(playing.countdown.top >= playing.score.bottom && playing.tap.top >= playing.countdown.bottom, 'Mobile count-in and tap pad follow the score');
          assert(playing.help.top >= playing.tap.bottom + 12, 'Instructions follow the tap pad without covering its shadow');
        } else {
          assert(playing.help.bottom <= playing.countdown.top, 'Desktop play layout is unchanged');
        }
      }
      await page.screenshot({ path: `/tmp/hjm-rhythm-mobile-play-${mode}.png`, fullPage: true });
      await page.evaluate(() => window.__rhythmAudition.finishSimple());
    }
    assert.deepEqual(errors, []);
    console.log('rhythm mobile layout ok: controls before instructions, simple/medium, 320–1440 widths, live resizing, countdown and tap pad');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
