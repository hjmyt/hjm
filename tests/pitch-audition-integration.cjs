const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const index = pathToFileURL(path.resolve(__dirname, '../index.html')).href;

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(index);
    await page.locator('[data-music-enter-muted]').click();
    await page.evaluate(() => {
      state.cards.encounters.push('lala');
      state.cards.collection.lala.owned = true;
      state.cards.collection.lala.copies = 1;
      state.cards.team = ['lala'];
      save();
      route('pitch');
    });
    const frame = page.locator('#pitchGameMount');
    async function completePerfectGame() {
      await frame.locator('[data-action="start"]').click();
      await frame.locator('#gameRoot').evaluate(() => {
        const game = window.__pitchAudition;
        for (let index = 0; index < 3; index++) {
          const item = game.rounds[game.state.round];
          game.state.selected = item.wrongIndex;
          game.state.direction = item.offset > 0 ? 'high' : 'low';
          game.submitIdentify();
          game.setAdjustment(-item.offset);
          game.submitTune();
          game.nextRound();
        }
      });
    }
    await frame.locator('[data-action="start"]').waitFor();
    assert.deepEqual(await frame.locator('#gameRoot').evaluate(() => { const settings = window.__pitchAudition.audioSettings(); return { waveform:settings.waveform, voiceCount:settings.voiceCount, masterGain:settings.masterGain }; }), { waveform:'sine', voiceCount:1, masterGain:1 }, 'Main-game pitch tones use one pure sine oscillator at full master gain');
    assert.equal(await page.locator('[data-route="pitch"].nav-btn').getAttribute('aria-current'), 'page');
    assert.match(await page.locator('#pitchTeam').textContent(), /垃垃/);
    assert.match(await page.locator('#pitchTeam').textContent(), /每角色每天最多 10 次/);
    await page.screenshot({ path: '/tmp/hjm-pitch-desktop.png' });

    const firstId = await frame.locator('.intro-session code').textContent();
    await frame.locator('[data-action="start"]').click();
    for (let round = 0; round < 3; round++) {
      const answer = await frame.locator('#gameRoot').evaluate(() => {
        const game = window.__pitchAudition;
        const item = game.rounds[game.state.round];
        return { index: item.wrongIndex, direction: item.offset > 0 ? 'high' : 'low', adjustment: -item.offset };
      });
      await frame.locator(`[data-note-index="${answer.index}"]`).click();
      await frame.locator(`[data-direction="${answer.direction}"]`).click();
      await frame.locator('[data-action="identify-submit"]').click();
      await frame.locator('#gameRoot').evaluate((_, adjustment) => window.__pitchAudition.setAdjustment(adjustment), answer.adjustment);
      await frame.locator('[data-action="tune-submit"]').click();
      await frame.locator('[data-action="next"]').click();
    }
    await page.waitForFunction(() => state.coins === 36);
    assert.match(await page.locator('#pitchRewardStatus').textContent(), /6 音符/);
    await frame.locator('#resultRewardAmount').filter({ hasText: '6' }).waitFor();
    assert.equal((await frame.locator('#resultDailyValue').textContent()).trim(), '6 / 20');
    assert.match(await frame.locator('#embeddedPayout').textContent(), /还可获得 14 音符/);
    assert.equal(await page.evaluate(() => state.bondProgress.daily.counts['performance:lala']), 1);
    assert.equal(await page.evaluate(() => economy().daily.rhythm), 0, 'Pitch rewards do not consume rhythm song quotas');
    const result = await frame.locator('#gameRoot').evaluate(() => ({ type: 'hjm-pitch-complete', challenge: 'pitch', id: window.__pitchAudition.questionId, mode: window.__pitchAudition.state.mode, score: window.__pitchAudition.state.score, rounds: window.__pitchAudition.rounds, answers: window.__pitchAudition.state.answers }));
    await frame.locator('#gameRoot').evaluate((_, message) => parent.postMessage(message, '*'), result);
    await page.waitForTimeout(80);
    assert.equal(await page.evaluate(() => state.coins), 36, 'Repeated finish event pays once');

    await frame.locator('[data-action="restart"]').click();
    await frame.locator('[data-action="start"]').waitFor();
    assert.notEqual(await frame.locator('.intro-session code').textContent(), firstId, 'A replay starts a fresh random question set');
    await page.evaluate(() => { state.bondProgress.daily.counts['performance:lala'] = 10; save(); });
    await frame.locator('[data-action="start"]').click();
    for (let round = 0; round < 3; round++) {
      const answer = await frame.locator('#gameRoot').evaluate(() => {
        const game = window.__pitchAudition;
        return { index: game.rounds[game.state.round].wrongIndex, direction: game.rounds[game.state.round].offset > 0 ? 'high' : 'low' };
      });
      await frame.locator(`[data-note-index="${round === 0 ? answer.index : (answer.index + 1) % 6}"]`).click();
      await frame.locator(`[data-direction="${answer.direction}"]`).click();
      await frame.locator('[data-action="identify-submit"]').click();
      await frame.locator('[data-action="tune-submit"]').click();
      await frame.locator('[data-action="next"]').click();
    }
    await page.waitForFunction(() => state.coins === 37);
    assert.equal(await page.evaluate(() => cardBond('lala')), 1, 'The shared daily performance cap blocks extra bond');
    assert.equal(await page.evaluate(() => state.bondProgress.daily.counts['performance:lala']), 10);
    assert.match(await page.locator('#pitchRewardStatus').textContent(), /1 音符/);
    assert.deepEqual(await page.evaluate(() => economy().daily.pitchNotes), { simple: 7, medium: 0, hard: 0 }, 'Simple winnings accumulate independently of medium and hard mode');
    await frame.locator('[data-action="restart"]').click();
    await frame.locator('[data-action="start"]').waitFor();
    assert.match(await frame.locator('[data-mode="simple"]').textContent(), /今日 7 \/ 20 音符/);
    await completePerfectGame();
    await page.waitForFunction(() => state.coins === 43 && economy().daily.pitchNotes.simple === 13);
    await frame.locator('[data-action="restart"]').click();
    await frame.locator('[data-mode="simple"]').waitFor();
    assert.equal(await frame.locator('[data-mode="simple"]').isDisabled(), false, 'Fourth and later simple games remain playable');
    await completePerfectGame();
    await page.waitForFunction(() => state.coins === 49 && economy().daily.pitchNotes.simple === 19);
    await frame.locator('[data-action="restart"]').click();
    await frame.locator('[data-action="start"]').waitFor();
    await completePerfectGame();
    await page.waitForFunction(() => state.coins === 50 && economy().daily.pitchNotes.simple === 20);
    assert.match(await page.locator('#pitchRewardStatus').textContent(), /本局获得 1 音符（今日该模式音符额度已达上限）/);
    await frame.locator('[data-action="restart"]').click();
    await frame.locator('[data-action="start"]').waitFor();
    assert.equal(await frame.locator('[data-mode="simple"]').isDisabled(), false, 'Simple remains playable at the daily note cap');
    assert.match(await frame.locator('.mode-message').textContent(), /仍可继续练习/);
    await page.evaluate(() => { state.bondProgress.daily.counts['performance:lala'] = 9; save(); });
    await completePerfectGame();
    await page.waitForFunction(() => economy().daily.pitchNotes.simple === 20 && document.getElementById('pitchRewardStatus').textContent.includes('本局获得 0 音符'));
    assert.equal(await page.evaluate(() => state.coins), 50, 'Simple practice beyond the cap gives zero notes');
    assert.equal(await page.evaluate(() => state.bondProgress.daily.counts['performance:lala']), 10, 'Zero-note practice still follows the shared bond quota');
    assert.equal(await page.evaluate(() => cardBond('lala')), 2);
    await frame.locator('[data-action="restart"]').click();
    await frame.locator('[data-mode="hard"]').click();
    await frame.locator('[data-action="start"]').click();
    assert.equal(await frame.locator('[data-audio="standard"]').count(), 0, 'Hard mode hides standard melody');
    assert.deepEqual(await frame.locator('.audio-panel [data-audio]').evaluateAll(nodes => nodes.map(node => node.dataset.audio)), ['exam', 'a4']);
    await frame.locator('#gameRoot').evaluate(() => window.__pitchAudition.play('standard'));
    assert.equal(await frame.locator('.game-card.audio-active').count(), 0, 'Hard mode also rejects hidden standard playback');
    await frame.locator('#gameRoot').evaluate(() => {
      const game = window.__pitchAudition;
      for (let index = 0; index < 3; index++) {
        const item = game.rounds[game.state.round];
        game.state.selected = item.wrongIndex;
        game.state.direction = item.offset > 0 ? 'high' : 'low';
        game.submitIdentify();
        game.setAdjustment(-item.offset);
        game.submitTune();
        game.nextRound();
      }
    });
    await page.waitForFunction(() => state.coins === 62 && economy().daily.pitchNotes.hard === 12);
    assert.match(await page.locator('#pitchRewardStatus').textContent(), /12 音符/);
    assert.equal(await page.evaluate(() => economy().daily.pitchNotes.simple), 20, 'Hard games do not consume simple note quota');
    await frame.locator('[data-action="restart"]').click();
    await frame.locator('[data-mode="simple"]').waitFor();
    assert.equal(await frame.locator('[data-mode="simple"]').isDisabled(), false, 'Simple mode stays playable after another refresh');
    await frame.locator('[data-mode="hard"]').click();
    await frame.locator('[data-action="start"]').click();
    await frame.locator('#gameRoot').evaluate(() => {
      const game = window.__pitchAudition;
      for (let index = 0; index < 3; index++) {
        const item = game.rounds[game.state.round];
        game.state.selected = index === 0 ? item.wrongIndex : (item.wrongIndex + 1) % 6;
        game.state.direction = item.offset > 0 ? 'high' : 'low';
        game.submitIdentify();
        game.setAdjustment(16);
        game.submitTune();
        game.nextRound();
      }
    });
    await page.waitForFunction(() => state.coins === 64 && economy().daily.pitchNotes.hard === 14);
    assert.match(await page.locator('#pitchRewardStatus').textContent(), /困难模式 1 分，本局获得 2 音符/);
    await frame.locator('[data-action="restart"]').click();
    await frame.locator('[data-action="start"]').waitFor();
    await page.evaluate(() => { economy().daily.pitchNotes.hard = 55; save(); PitchAudition.renderTeam(); });
    await frame.locator('[data-mode="hard"]').click();
    await completePerfectGame();
    await page.waitForFunction(() => state.coins === 69 && economy().daily.pitchNotes.hard === 60);
    assert.match(await page.locator('#pitchRewardStatus').textContent(), /本局获得 5 音符（今日该模式音符额度已达上限）/);
    await frame.locator('[data-action="restart"]').click();
    await frame.locator('[data-action="start"]').waitFor();
    await frame.locator('[data-mode="hard"]').click();
    await completePerfectGame();
    await page.waitForFunction(() => document.getElementById('pitchRewardStatus').textContent.includes('本局获得 0 音符'));
    assert.equal(await page.evaluate(() => state.coins), 69, 'Hard practice beyond 60 notes gives zero');
    await frame.locator('[data-action="restart"]').click();
    await frame.locator('[data-action="start"]').waitFor();
    await page.evaluate(() => {
      economy().daily.pitchNotes.simple = 19;
      save();
      window.__realPitchSave = window.save;
      window.save = () => false;
      PitchAudition.renderTeam();
    });
    await completePerfectGame();
    await page.waitForFunction(() => document.getElementById('pitchRewardStatus').textContent.includes('结算保存失败'));
    assert.deepEqual(await page.evaluate(() => ({coins:state.coins,simple:economy().daily.pitchNotes.simple,medium:economy().daily.pitchNotes.medium,hard:economy().daily.pitchNotes.hard})), {coins:69,simple:19,medium:0,hard:60}, 'Failed save rolls back balance and all note counters');
    await page.evaluate(() => { window.save = window.__realPitchSave; delete window.__realPitchSave; });
    await frame.locator('[data-action="restart"]').click();
    await frame.locator('[data-action="start"]').waitFor();
    await page.evaluate(() => { state.sound = false; renderGlobal(); });
    await frame.locator('[data-action="start"]').click();
    await frame.locator('[data-audio="exam"]').click();
    assert.match(await frame.locator('.audio-status').textContent(), /声音已关闭/);
    await page.evaluate(() => route('cards'));
    assert.equal(await page.locator('#pitchGameMount').evaluate(node => node.shadowRoot?.childElementCount || 0), 0, 'Leaving destroys the mounted audition component');
    await page.reload();
    assert.equal(await page.evaluate(() => state.coins), 69);
    assert.equal(await page.evaluate(() => cardBond('lala')), 2);

    await page.locator('[data-music-enter-muted]').click();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => route('pitch'));
    await frame.locator('[data-action="start"]').waitFor();
    assert.equal(await frame.locator('[data-mode="simple"]').isDisabled(), false, 'Both modes stay playable after reload');
    assert.match(await frame.locator('[data-mode="hard"]').textContent(), /今日 60 \/ 60 音符/);
    assert.equal(await page.evaluate(() => {
      const legacy = JSON.parse(JSON.stringify(state.economy));
      legacy.version = 2;
      legacy.daily.pitchEasyRuns = 3;
      delete legacy.daily.pitchNotes;
      const migrated = cleanEconomy(legacy);
      return migrated.version === 4 && migrated.daily.pitchNotes.simple === 0 && migrated.daily.pitchNotes.medium === 0 && migrated.daily.pitchNotes.hard === 0;
    }), true, 'Older saves initialize only new note counters without inferring unrecorded payouts');
    assert.deepEqual(await page.evaluate(() => {
      const legacy = JSON.parse(JSON.stringify(state.economy));
      legacy.version = 3;
      legacy.daily.pitchNotes = { simple: 12, hard: 34 };
      const migrated = cleanEconomy(legacy);
      return { version:migrated.version, ...migrated.daily.pitchNotes };
    }), { version:4, simple:12, medium:0, hard:34 }, 'Version-three saves preserve simple/hard usage and initialize only the medium quota');
    await page.evaluate(() => { state.economy.daily.date = '2000-01-01'; economy(); save(); PitchAudition.renderTeam(); });
    assert.deepEqual(await page.evaluate(() => economy().daily.pitchNotes), {simple:0,medium:0,hard:0}, 'A new day restores all daily note budgets');
    assert.match(await frame.locator('[data-mode="simple"]').textContent(), /今日 0 \/ 20 音符/);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Main game has no mobile horizontal overflow');
    const embeddedWidth = await frame.evaluate(node => { const box=node.getBoundingClientRect(),surface=node.shadowRoot.querySelector('.game-surface'); return { scroll:surface.scrollWidth, viewport:node.clientWidth, offenders:[...node.shadowRoot.querySelectorAll('*')].filter(el=>el.getBoundingClientRect().right>box.right+1).slice(0,6).map(el=>`${el.tagName}.${el.className}`) }; });
    assert(embeddedWidth.scroll <= embeddedWidth.viewport && !embeddedWidth.offenders.length, `Mounted audition has no mobile horizontal overflow: ${JSON.stringify(embeddedWidth)}`);
    const innerScrollers = await frame.evaluate(node => [...node.shadowRoot.querySelectorAll('*')].filter(el => { const style=getComputedStyle(el); return /(auto|scroll)/.test(style.overflowY) && el.scrollHeight>el.clientHeight+2; }).map(el=>`${el.tagName}.${el.className}`));
    assert.deepEqual(innerScrollers, [], 'Mounted game uses the main page scrollbar only');
    const startBox = await frame.locator('[data-action="start"]').boundingBox();
    assert(startBox.y + startBox.height < 900, `Start button should appear near the top of the mobile page: ${JSON.stringify(startBox)}`);
    await page.screenshot({ path: '/tmp/hjm-pitch-mobile.png' });
    await page.screenshot({ path: '/tmp/hjm-pitch-mobile-full.png', fullPage: true });
    await frame.locator('[data-action="start"]').click();
    await page.waitForFunction(() => {
      const mounted = document.getElementById('pitchGameMount');
      return mounted && window.scrollY > 0 && mounted.getBoundingClientRect().top >= 0 && mounted.getBoundingClientRect().top < 48;
    }, null, { timeout: 2000 });
    await page.waitForTimeout(200);
    await page.screenshot({ path: '/tmp/hjm-pitch-mobile-focused.png' });
    await page.screenshot({ path: '/tmp/hjm-pitch-mobile-question.png', fullPage: true });
    const firstMobileRound = await frame.locator('#gameRoot').evaluate(() => {
      const item = window.__pitchAudition.rounds[0];
      return { index: item.wrongIndex, direction: item.offset > 0 ? 'high' : 'low' };
    });
    await frame.locator(`[data-note-index="${firstMobileRound.index}"]`).click();
    await frame.locator(`[data-direction="${firstMobileRound.direction}"]`).click();
    await frame.locator('[data-action="identify-submit"]').click();
    await page.waitForFunction(() => {
      const mounted = document.getElementById('pitchGameMount');
      return mounted && mounted.getBoundingClientRect().top >= 0 && mounted.getBoundingClientRect().top < 48;
    });
    await page.waitForTimeout(200);
    await page.screenshot({ path: '/tmp/hjm-pitch-mobile-tune.png', fullPage: true });
    const tuneLayout = await frame.evaluate(node => { const surface=node.shadowRoot.querySelector('.game-surface'),shell=node.shadowRoot.querySelector('.shell'),card=node.shadowRoot.querySelector('.game-card'); return { mountHeight:node.clientHeight,surfaceHeight:Math.ceil(surface.getBoundingClientRect().height),shellHeight:Math.ceil(shell.getBoundingClientRect().height),cardHeight:Math.ceil(card.getBoundingClientRect().height) }; });
    assert(tuneLayout.surfaceHeight <= tuneLayout.mountHeight + 2, `Tune screen expands inside the main page without nested scrolling: ${JSON.stringify(tuneLayout)}`);
    assert.deepEqual(errors, []);

    const root = path.resolve(__dirname, '..');
    const server = http.createServer((request, response) => {
      const file = path.resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
      if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end(); return; }
      response.writeHead(200, { 'Content-Type': ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp', '.wav': 'audio/wav' })[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
      response.end(fs.readFileSync(file));
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
      const httpPage = await browser.newPage();
      const failed = [];
      httpPage.on('response', response => { if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`); });
      await httpPage.goto(`http://127.0.0.1:${server.address().port}/index.html`);
      await httpPage.locator('[data-music-enter-muted]').click();
      await httpPage.evaluate(() => route('pitch'));
      await httpPage.locator('#pitchGameMount').locator('[data-action="start"]').waitFor();
      assert(await httpPage.locator('#pitchGameMount').evaluate(node => !!node.shadowRoot?.querySelector('.game-surface')), 'HTTP deployment mounts the JS component directly in the tab');
      assert.deepEqual(failed, [], 'HTTP deployment loads the mounted game scripts, styles and assets');
      await httpPage.close();
    } finally {
      await new Promise(resolve => server.close(resolve));
    }
    await page.evaluate(() => {
      const legacy = JSON.parse(localStorage.getItem(KEY));
      legacy.economy.version = 2;
      legacy.economy.daily.pitchEasyRuns = 3;
      delete legacy.economy.daily.pitchNotes;
      localStorage.setItem(KEY, JSON.stringify(legacy));
    });
    await page.reload();
    assert.equal(await page.evaluate(() => state.coins), 69, 'Real previous-version save preserves protected wallet balance');
    assert.deepEqual(await page.evaluate(() => economy().daily.pitchNotes), {simple:0,medium:0,hard:0}, 'Real previous-version save adds only missing daily note counters');
    console.log('PASS: pitch route, shared lineup/bond quota, daily simple 20, medium 30 and hard 60 note caps, continued capped practice, partial payouts, save migration, next-day reset, mute and mobile layout.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
