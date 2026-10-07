const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {})
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1180, height: 900 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve(__dirname, '../previews/pitch-audition-v3/index.html')).href);
    assert.match(await page.title(), /空格的音准考验/);
    assert.equal(await page.locator('#themeToggle').count(), 0, 'Theme toggle is removed');
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light', 'Preview always starts in light mode');
    await page.evaluate(() => localStorage.setItem('pitch-audition-v3-theme', 'dark'));
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light', 'Old theme memory cannot switch the preview back to dark mode');
    assert.equal(await page.locator('#gameRoot').getAttribute('data-stage'), 'intro');
    assert.match(await page.locator('.intro-panel h2').textContent(), /哪一个音，走偏了/);
    assert.match(await page.locator('.intro-session code').textContent(), /^#[A-Z0-9]{7}$/);
    assert.equal(await page.locator('.intro-meta > span').count(), 4, 'Intro uses four scannable rule cards');
    assert.equal(await page.locator('.intro-panel .badge-changed').count(), 0, 'Player-facing intro contains no development marker');
    const signatures = [];
    for (let load = 0; load < 6; load++) {
      const generated = await page.evaluate(() => ({ signature: window.__pitchAudition.questionSignature, rounds: window.__pitchAudition.rounds }));
      signatures.push(generated.signature);
      assert.equal(generated.rounds.length, 3);
      assert.equal(new Set(generated.rounds.map(round => round.wrongIndex)).size, 3, 'Wrong-note positions vary inside each random set');
      generated.rounds.forEach((round,index) => {
        assert.equal(round.notes.length, 6);
        assert(round.notes.every(note => note >= 1 && note <= 7));
        assert([440,442].includes(round.referenceHz), 'Each question uses an explicit 440 Hz or 442 Hz reference');
        assert(round.notes.every((note,noteIndex) => noteIndex === 0 || note !== round.notes[noteIndex - 1]), 'Generated melody has no immediate repeats');
        assert(new Set(round.notes).size >= 4, 'Generated melody has useful pitch variety');
        const magnitude = Math.abs(round.offset), ranges = [[8,12],[6,10],[4.5,8]];
        assert(magnitude >= ranges[index][0] && magnitude <= ranges[index][1]);
      });
      if (load < 5) await page.reload();
    }
    assert.equal(new Set(signatures).size, signatures.length, 'Every consecutive refresh generates a new question set');
    await page.locator('[data-action="start"]').click();
    const firstQuestion = await page.evaluate(() => {
      const game = window.__pitchAudition;
      const round = game.rounds[game.state.round];
      return { referenceHz: round.referenceHz, labels: round.notes.map(game.noteLabel), aFrequency: game.frequencyForNote(6,round.referenceHz) };
    });
    assert.equal(firstQuestion.aFrequency, firstQuestion.referenceHz, 'Displayed A reference drives the actual frequency calculation');
    assert.equal((await page.locator('.pitch-reference strong').textContent()).trim(), `A = ${firstQuestion.referenceHz} Hz`);
    assert.deepEqual(await page.locator('.note-choice').evaluateAll(nodes => nodes.map(node => node.getAttribute('aria-label').replace(/^第 \d+ 音，/,''))), firstQuestion.labels);
    assert.match(await page.locator('[data-audio="a4"]').textContent(), new RegExp(`${firstQuestion.referenceHz} Hz`));
    await page.locator('[data-audio="standard"]').click();
    await page.waitForFunction(() => window.__pitchAudition.audioSettings().contextState === 'running');
    const audioSettings = await page.evaluate(() => window.__pitchAudition.audioSettings());
    assert(Math.abs(audioSettings.masterGain - .72) < .001 && audioSettings.peakGain === .32 && audioSettings.sustainGain === .15, 'V3 uses the increased protected audio envelope');
    assert.equal(audioSettings.contextState, 'running', 'Playback click unlocks and resumes Web Audio');
    assert.equal(audioSettings.audioStatus, '声音已启用');
    assert.match(await page.locator('.audio-status').textContent(), /声音已启用/);
    assert(await page.locator('.game-card').evaluate(card => card.classList.contains('audio-active')), 'Audio playback activates the neon visualizer');

    for (let round = 0; round < 3; round++) {
      const answer = await page.evaluate(() => {
        const game = window.__pitchAudition;
        const data = game.rounds[game.state.round];
        const target = data.notes[data.wrongIndex];
        return { index: data.wrongIndex, direction: data.offset > 0 ? 'high' : 'low', adjustment: -data.offset, targetLabel: game.noteLabel(target), referenceHz: data.referenceHz };
      });
      await page.locator(`[data-note-index="${answer.index}"]`).click();
      await page.locator(`[data-direction="${answer.direction}"]`).click();
      await page.locator('[data-action="identify-submit"]').click();
      assert.equal(await page.locator('#gameRoot').getAttribute('data-stage'), 'tune');
      assert.match(await page.locator('.stage-title h2').textContent(), new RegExp(`调回 ${answer.targetLabel.replace(/[（）]/g,'\\$&')}$`));
      assert.equal((await page.locator('.pitch-reference strong').textContent()).trim(), `A = ${answer.referenceHz} Hz`);
      await page.evaluate(value => window.__pitchAudition.setAdjustment(value), answer.adjustment);
      await page.locator('[data-action="tune-submit"]').click();
      assert.equal(await page.locator('#gameRoot').getAttribute('data-stage'), 'round-result');
      await page.locator('[data-action="next"]').click();
    }

    assert.equal(await page.locator('#gameRoot').getAttribute('data-stage'), 'finish');
    assert.equal((await page.locator('#totalScore').textContent()).trim(), '6');
    assert.match(await page.locator('#gameRoot').textContent(), /全音准通过/);
    assert.deepEqual(errors, []);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile preview must not overflow horizontally');
    await page.locator('[data-action="start"]').click();
    assert.equal(await page.locator('.score-staff .note-choice').count(), 6);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile game must not overflow horizontally');

    await page.evaluate(() => { const d = new Date(); localStorage.setItem('pitch-audition-v3-simple-daily', JSON.stringify({ date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`, completed: 3 })); });
    await page.reload();
    assert.equal(await page.locator('[data-mode="simple"]').isDisabled(), true, 'Standalone V3 honors its daily simple limit');
    assert.equal(await page.locator('[data-mode="hard"]').getAttribute('aria-pressed'), 'true');
    await page.locator('[data-action="start"]').click();
    assert.equal(await page.locator('[data-audio="standard"]').count(), 0, 'Hard mode cannot play standard melody');
    assert.deepEqual(await page.locator('.audio-panel [data-audio]').evaluateAll(nodes => nodes.map(node => node.dataset.audio)), ['exam', 'a4']);
    await page.evaluate(() => window.__pitchAudition.play('standard'));
    assert.equal(await page.locator('.game-card.audio-active').count(), 0, 'Hidden standard melody is also blocked in playback logic');
    await page.evaluate(() => {
      const game = window.__pitchAudition;
      const item = game.rounds[0];
      game.state.selected = item.wrongIndex;
      game.state.direction = item.offset > 0 ? 'high' : 'low';
      game.submitIdentify();
    });
    assert.equal(await page.locator('[data-audio="standard"]').count(), 0, 'Hard mode cannot play the correct note while tuning');
    assert.match(await page.locator('.tune-copy').textContent(), /参考 A 标准音/);
    await page.evaluate(() => {
      const game = window.__pitchAudition;
      for (let index = 0; index < 3; index++) {
        if (index) {
          const item = game.rounds[game.state.round];
          game.state.selected = item.wrongIndex;
          game.state.direction = item.offset > 0 ? 'high' : 'low';
          game.submitIdentify();
        }
        game.setAdjustment(-game.rounds[game.state.round].offset);
        game.submitTune();
        game.nextRound();
      }
    });
    assert.match(await page.locator('#gameRoot').textContent(), /6 分 × 2 = 12 音符/);
    await page.evaluate(() => localStorage.setItem('pitch-audition-v3-simple-daily', JSON.stringify({ date: '2000-01-01', completed: 3 })));
    await page.reload();
    assert.equal(await page.locator('[data-mode="simple"]').isDisabled(), false, 'Simple quota resets on a new local day');

    await page.goto(pathToFileURL(path.resolve(__dirname, '../previews/pitch-audition-v3/requirement.html')).href);
    assert.match(await page.locator('h1').textContent(), /空格的音准考验/);
    assert.equal(await page.locator('a[href="index.html"]').count(), 2);
    assert.equal(await page.locator('#themeToggle').count(), 0, 'Requirement page also removes the theme toggle');
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light', 'Requirement page stays light');
    assert.deepEqual(errors, []);

    const iphonePage = await browser.newPage({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
    });
    const iphoneErrors = [];
    iphonePage.on('pageerror', error => iphoneErrors.push(error.message));
    await iphonePage.goto(pathToFileURL(path.resolve(__dirname, '../previews/pitch-audition-v3/index.html')).href);
    await iphonePage.locator('[data-action="start"]').click();
    await iphonePage.locator('[data-audio="standard"]').click();
    await iphonePage.waitForFunction(() => window.__pitchAudition.audioSettings().contextState === 'running');
    const iphoneAudio = await iphonePage.evaluate(() => window.__pitchAudition.audioSettings());
    assert.equal(iphoneAudio.iosAudio, true, 'iPhone user agent uses the main-game iOS audio route');
    assert.equal(iphoneAudio.bridgeCreated, true, 'Older-iOS media bridge is created when AudioSession API is unavailable');
    assert.equal(iphoneAudio.bridgePlaying, true, 'The unmuted silent media bridge stays active while synthesized notes play');
    assert.deepEqual(iphoneErrors, []);
    await iphonePage.close();
    console.log('PASS: V3 main-game iPhone audio route, 440/442 Hz targets, non-repeating questions, game flow, scoring, responsive layout, and linked requirements.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
