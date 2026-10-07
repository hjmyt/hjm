'use strict';

const assert = require('node:assert/strict');
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
    await page.goto(`${index}#pitch-rhythm`);
    await page.locator('[data-music-enter-muted]').click();
    await page.evaluate(() => {
      state.cards.encounters.push('lala');
      state.cards.collection.lala.owned = true;
      state.cards.collection.lala.copies = 1;
      state.cards.team = ['lala'];
      save();
      PitchAudition.renderTeam();
    });

    assert.equal(await page.locator('[data-pitch-challenge]').count(), 2, 'Space challenge exposes two first-class choices');
    const frame = page.locator('#pitchGameMount');
    await frame.locator('[data-action="start"]').waitFor();
    assert.equal(await page.evaluate(() => currentView), 'pitch', 'Direct rhythm deep link opens the Space Challenge view');
    assert.equal(await page.evaluate(() => location.hash), '#pitch-rhythm');
    assert.equal(await page.locator('[data-pitch-challenge="rhythm"]').getAttribute('aria-pressed'), 'true');
    assert(await page.locator('#pitchGameMount').evaluate(node => !!node.shadowRoot?.querySelector('.game-surface')), 'Rhythm challenge mounts directly into the Space Challenge tab');
    await page.locator('[data-pitch-challenge="pitch"]').click();
    assert.equal(await page.evaluate(() => location.hash), '#pitch-tone', 'Challenge tabs publish distinct shareable anchors');
    await frame.locator('.intro-session').waitFor();
    await page.locator('[data-pitch-challenge="rhythm"]').click();
    await frame.locator('[data-mode="medium"]').waitFor();
    await frame.locator('[data-action="start"]').waitFor();
    assert.equal(await page.evaluate(() => location.hash), '#pitch-rhythm');
    await page.evaluate(() => history.back());
    await page.waitForFunction(() => location.hash === '#pitch-tone' && document.getElementById('pitchChallengeTone').getAttribute('aria-pressed') === 'true');
    await frame.locator('.intro-session').waitFor();
    await page.evaluate(() => history.forward());
    await page.waitForFunction(() => location.hash === '#pitch-rhythm' && document.getElementById('pitchChallengeRhythm').getAttribute('aria-pressed') === 'true');
    await frame.locator('[data-mode="medium"]').waitFor();
    assert.equal(await frame.locator('[data-mode]').count(), 3, 'Rhythm challenge offers simple, medium and hard modes');

    const generated = await frame.locator('#gameRoot').evaluate(() => {
      const game = window.__rhythmAudition;
      const units = stage => stage.measures.map(measure => measure.reduce((sum, id) => sum + game.TOKENS[id].units, 0));
      return {
        stages: game.stages,
        units: game.stages.map(units),
        settings: game.audioSettings(),
        timing:game.timing(game.stages[0]),
        svg: game.notationSVG(game.stages[0]),
        restSvg: game.notationSVG(game.stages[3]),
        triplet: (() => {
          const data = { stage:2, meter:'4/4', tempo:84, measures:[['triplet','quarter','quarter','quarter'],['quarter','quarter','quarter','quarter']] };
          return { onsets:game.targetOnsets(data).slice(0,3), svg:game.notationSVG(data) };
        })(),
        eighthBeaming: {
          grouped:game.notationSVG({stage:1,meter:'2/4',tempo:84,measures:[['eighth','eighth','eighth','eighth'],['eighth','eighth','eighth','eighth']]}),
          interrupted:game.notationSVG({stage:4,meter:'2/4',tempo:84,measures:[['eighth','eighth-rest','eighth','eighth-rest'],['eighth','eighth-rest','eighth','eighth-rest']]}),
          preview:game.notationSVG({stage:1,meter:'2/4',tempo:84,measures:[['eighth','quarter','eighth'],['eighth','quarter','eighth']]})
        },
        tieSvg:game.notationSVG({stage:2,meter:'4/4',tempo:84,measures:[['tied-syncopation','quarter','quarter'],['quarter','quarter','half']]}),
        referencePatterns: ['quarter','eighth-pair','four-sixteenth','eighth-two-sixteenth','two-sixteenth-eighth','syncopation','triplet','dotted-eighth-sixteenth','sixteenth-dotted-eighth'].map(id => ({ id, svg:game.notationSVG({ stage:2,meter:'4/4',tempo:84,measures:[[id,'quarter','quarter','quarter'],['quarter','quarter','quarter','quarter']] }) })),
        syncopationOnsets: game.TOKENS.syncopation.onsets,
        dottedOnsets: [game.TOKENS['dotted-eighth-sixteenth'].onsets,game.TOKENS['sixteenth-dotted-eighth'].onsets],
        sloppy: (() => {
          const stage = game.stages[0], secondsPerUnit = 60 / stage.tempo / 4;
          const targets = game.targetOnsets(stage).map(unit => unit * secondsPerUnit);
          return game.evaluateTapEvidence(targets.slice(0, Math.max(1, Math.floor(targets.length * .75))).map(value => value + .09));
        })()
      };
    });
    assert.equal(generated.stages.length, 4);
    assert(['4/4', '2/4'].includes(generated.stages[0].meter));
    assert(['4/4', '2/4'].includes(generated.stages[1].meter));
    assert(['6/8', '3/4', '3/8'].includes(generated.stages[2].meter));
    assert(generated.stages[3].measures.flat().some(id => id.endsWith('rest')), 'Stage four always contains a rest');
    generated.stages.forEach((stage, index) => assert.deepEqual(generated.units[index], [({ '4/4': 16, '2/4': 8, '3/4': 12, '6/8': 12, '3/8': 6 })[stage.meter], ({ '4/4': 16, '2/4': 8, '3/4': 12, '6/8': 12, '3/8': 6 })[stage.meter]], `Stage ${index + 1} fills two exact measures`));
    assert.match(generated.svg, /<svg/);
    assert.match(generated.restSvg, /data-rest="(?:quarter|eighth)-rest"/, 'Stage-four rests use explicit vector paths instead of unavailable font glyphs');
    assert.deepEqual(generated.triplet.onsets, [0, 4 / 3, 8 / 3], 'Triplet playback schedules three equal subdivisions inside one beat');
    assert.match(generated.triplet.svg, /data-rhythm="triplet"[\s\S]*>3<\/text>/, 'Triplet notation carries an explicit bracket and 3 marker');
    assert.equal((generated.eighthBeaming.grouped.match(/data-cross-token-beam="true"/g) || []).length, 4, 'Adjacent eighth notes share one beam inside each natural beat group');
    assert.doesNotMatch(generated.eighthBeaming.grouped, /data-eighth-flag="true"/, 'Beamed eighth notes do not retain separate flags');
    assert.equal((generated.eighthBeaming.interrupted.match(/data-eighth-flag="true"/g) || []).length, 4, 'Rests interrupt eighth-note beaming');
    assert.doesNotMatch(generated.eighthBeaming.interrupted, /data-cross-token-beam="true"/, 'Eighth notes are never beamed across a rest');
    assert.equal((generated.eighthBeaming.preview.match(/data-eighth-flag="true"/g) || []).length, 4, 'Isolated eighth notes keep their individual flags');
    assert.deepEqual(generated.syncopationOnsets, [0,1,3], 'Reference syncopation plays sixteenth-eighth-sixteenth inside one beat');
    assert.deepEqual(generated.dottedOnsets, [[0,3],[0,1]], 'Both dotted reference patterns use their exact onset positions');
    for (const pattern of generated.referencePatterns) assert.match(pattern.svg, new RegExp(`data-rhythm="${pattern.id}"`), `${pattern.id} uses the shared explicit SVG notation renderer`);
    assert.match(generated.referencePatterns.find(pattern => pattern.id === 'dotted-eighth-sixteenth').svg, /<circle[^>]+r="2\.2"/, 'Dotted-eighth pattern draws its augmentation dot');
    assert.equal(generated.sloppy.passed, false, 'A loose partial rhythm with 90 ms average drift cannot pass');
    assert.equal(generated.timing.countInSeconds,generated.timing.measureSeconds,'Count-in lasts exactly one measure at the question tempo');
    assert.match(generated.tieSvg,/data-tie="true"/,'Tied syncopation displays the continuation curve');
    assert.equal(generated.settings.masterGain, 1, 'Normalized reference clicks do not need distortion-inducing output boost');
    assert.equal(generated.settings.voices.metronome.gain, 1, 'Reference metronome runs at full component gain');
    assert.equal(generated.settings.voices.scoreRhythm.gain, 1, 'Score and player-tap voice runs at full component gain');
    assert(generated.settings.voices.metronome.duration >= .09, 'Reference click preserves its recorded percussive decay');
    assert(generated.settings.voices.scoreRhythm.duration < .1, 'Short player feedback avoids covering the next sixteenth note');
    assert.equal(generated.settings.sampledReference, true, 'Voices use actual reference samples rather than synthetic metal partials');
    assert.equal(generated.settings.pitchGlide, false, 'Recorded click has no synthetic downward pitch bend');
    assert.equal(generated.settings.limiterThreshold, -1, 'Peak limiter only engages close to digital full scale');
    assert.deepEqual(
      [generated.settings.voices.metronome.waveform, generated.settings.voices.userTap.waveform, generated.settings.voices.scoreRhythm.waveform],
      ['sample', 'sample', 'sample'],
      'Metronome and rhythm use reference-derived percussion samples'
    );
    assert.notEqual(generated.settings.voices.metronome.sample,generated.settings.voices.scoreRhythm.sample,'Metronome and player input remain distinct');
    assert.equal(generated.settings.accents.strong.sample,'accent','First beat uses the high reference click');
    assert.equal(generated.settings.accents.secondary.sample,'normal','Secondary accent keeps the low ordinary timbre');
    assert(generated.settings.accents.weak.gain>=.85,'Ordinary beats remain clear, not drastically quieter');
    assert.equal(generated.settings.tapMatchesScore, true, 'Player tap feedback reuses the exact score-playback voice');
    assert.equal(generated.settings.listeningHasContinuousMetronome, false, 'Listening playback does not layer a metronome over the two measures');
    assert.equal(generated.settings.tapInputEvent, 'pointerdown', 'Modern mobile input is recorded on press rather than delayed click release');
    await page.screenshot({ path: '/tmp/hjm-rhythm-audition-desktop.png', fullPage: true });

    async function finishPerfect(alreadyStarted = false, firstStage = 0) {
      if (!alreadyStarted) await frame.locator('[data-action="start"]').click();
      for (let stage = firstStage; stage < 4; stage++) {
        await frame.locator('#gameRoot').evaluate(() => window.__rhythmAudition.completeStageForTest(true));
        await frame.locator('[data-action="next"]').click();
      }
    }

    await frame.locator('[data-action="start"]').click();
    await frame.locator('[data-action="perform"]').waitFor();
    assert.equal(await frame.locator('.score-sheet svg').count(), 1, 'Simple mode shows the generated score before tapping');
    assert.equal(await frame.locator('.score-sheet svg').getAttribute('data-score-layout'), 'inline', 'Desktop keeps both measures on one horizontal staff');
    assert.equal(await frame.locator('[data-action="preview"]').count(), 1, 'Simple mode can preview the correct rhythm');
    assert.match(await frame.locator('.audio-strip > span').textContent(), /一小节预备/, 'Correct-rhythm preview explains its meter-aware count-in');
    assert.match(await frame.locator('.audio-strip > span').textContent(), /不再叠加节拍器/, 'Correct-rhythm preview explains the metronome-free score playback');
    await page.evaluate(() => { state.sound = true; PitchAudition.syncSound(); });
    await frame.locator('[data-action="preview"]').click();
    assert.equal(await frame.locator('[data-listen-countdown]').textContent(), String(generated.timing.countInBeats), 'Preview starts with the actual number of beats in the meter');
    await frame.locator('#gameRoot').evaluate(() => {
      const game = window.__rhythmAudition;
      const answers = game.stages.map((stage, index) => {
        const {secondsPerUnit} = game.timing(stage);
        const targets = game.targetOnsets(stage).map(unit => unit * secondsPerUnit);
        return { stage:index + 1, passed:true, evidence:{ taps:targets.slice(0, Math.max(1, Math.ceil(targets.length * .78))).map(value => value + .09) } };
      });
      parent.postMessage({ type:'hjm-pitch-complete', challenge:'rhythm', id:game.questionId, mode:'simple', score:4, stages:game.stages, answers }, '*');
    });
    await page.waitForTimeout(80);
    assert.equal(await page.evaluate(() => economy().daily.pitchNotes.simple), 0, 'Main game rejects a claimed pass with roughly 78% hits and 90 ms drift');
    await page.screenshot({ path: '/tmp/hjm-rhythm-audition-simple-stage.png', fullPage: true });
    for (let stage = 0; stage < 3; stage++) {
      await frame.locator('#gameRoot').evaluate(() => window.__rhythmAudition.completeStageForTest(true));
      assert.equal(await frame.locator('[data-action="review"]').count(), 1, 'Each feedback screen offers correct-rhythm audio review');
      if (stage === 0) {
        await frame.locator('[data-action="review"]').click();
        assert.equal(await frame.locator('[data-action="review"]').isDisabled(), true, 'Review button indicates active playback');
        assert.match(await frame.locator('[data-action="review"]').textContent(), /正在播放正确节奏/);
        assert.equal(await frame.locator('[data-listen-countdown]').textContent(), String(generated.timing.countInBeats), 'Review uses the same meter-aware count-in');
        await page.screenshot({ path: '/tmp/hjm-rhythm-audition-feedback-review.png', fullPage: true });
      }
      await frame.locator('[data-action="next"]').click();
    }
    assert(await frame.locator('.score-sheet [data-rest]').count() > 0, 'Stage-four rests are visible in the rendered score');
    await page.screenshot({ path: '/tmp/hjm-rhythm-audition-rest-stage.png', fullPage: true });
    await frame.locator('#gameRoot').evaluate(() => window.__rhythmAudition.completeStageForTest(true));
    await frame.locator('[data-action="next"]').click();
    await page.waitForFunction(() => economy().daily.pitchNotes.simple === 4);
    assert.equal(await page.evaluate(() => state.coins), 34);
    assert.match(await page.locator('#pitchRewardStatus').textContent(), /节奏听写 · 简单模式 4 分，本局获得 4 音符/);
    assert.equal(await page.evaluate(() => state.bondProgress.daily.counts['performance:lala']), 1);
    assert.equal((await frame.locator('#resultDailyValue').textContent()).trim(), '今日 4 / 20 音符');

    await frame.locator('[data-action="restart"]').click();
    await frame.locator('[data-mode="medium"]').waitFor();
    await page.evaluate(() => { economy().daily.pitchNotes.medium = 29; save(); PitchAudition.syncRules(); });
    await frame.locator('[data-mode="medium"]').click();
    await frame.locator('[data-action="start"]').click();
    await frame.locator('[data-action="perform"]').waitFor();
    assert.equal(await frame.locator('[data-action="preview"]').count(), 0, 'Medium mode does not expose the correct-rhythm preview');
    await finishPerfect(true);
    await page.waitForFunction(() => economy().daily.pitchNotes.medium === 30);
    assert.equal(await page.evaluate(() => state.coins), 35);
    assert.match(await page.locator('#pitchRewardStatus').textContent(), /节奏听写 · 中级模式 4 分，本局获得 1 音符/);
    assert.equal(await page.evaluate(() => state.bondProgress.daily.counts['performance:lala']), 2);

    await frame.locator('[data-action="restart"]').click();
    await frame.locator('[data-mode="hard"]').waitFor();
    await frame.locator('[data-mode="hard"]').click();
    await frame.locator('[data-action="start"]').click();
    assert.equal(await frame.locator('.score-empty').count(), 1, 'Hard mode hides the answer score while listening');
    assert.equal((await frame.locator('[data-action="listen"]').textContent()).trim(), '播放考核节奏');
    assert.match(await frame.locator('.audio-strip').textContent(), /预备拍跟随题目拍号和速度/, 'Hard-mode listening announces its meter-aware count-in');
    await frame.locator('[data-action="write"]').click();
    const firstSolution = await frame.locator('#gameRoot').evaluate(() => window.__rhythmAudition.stages[0].measures);
    for (const measure of firstSolution)
      for (const token of measure)
        await frame.locator(`[data-token="${token}"]`).click();
    assert.equal(await frame.locator('[data-action="submit-write"]').isDisabled(), false, 'Two complete measures can be submitted');
    await frame.locator('[data-action="submit-write"]').click();
    assert.match(await frame.locator('.feedback').textContent(), /阶段通过/);
    await frame.locator('[data-action="next"]').click();
    await frame.locator('[data-action="write"]').click();
    await frame.locator('.palette').screenshot({ path: '/tmp/hjm-rhythm-pattern-palette.png' });
    await finishPerfect(true, 1);
    await page.waitForFunction(() => economy().daily.pitchNotes.hard === 8);
    assert.equal(await page.evaluate(() => state.coins), 43);
    assert.match(await page.locator('#pitchRewardStatus').textContent(), /节奏听写 · 困难模式 4 分，本局获得 8 音符/);
    assert.equal(await page.evaluate(() => state.bondProgress.daily.counts['performance:lala']), 3);

    await frame.locator('[data-action="restart"]').click();
    await frame.locator('[data-action="start"]').waitFor();
    await page.evaluate(() => { economy().daily.pitchNotes.simple = 19; save(); PitchAudition.syncRules(); });
    await frame.locator('[data-action="start"]').click();
    await frame.locator('#gameRoot').evaluate(() => parent.postMessage({ type: 'hjm-pitch-complete', challenge: 'rhythm', id: window.__rhythmAudition.questionId, mode: 'simple', score: 4, stages: window.__rhythmAudition.stages, answers: [1, 2, 3, 4].map(stage => ({ stage, passed: true, evidence: { taps: [] } })) }, '*'));
    await page.waitForTimeout(80);
    assert.equal(await page.evaluate(() => economy().daily.pitchNotes.simple), 19, 'Main game rejects a forged rhythm score without matching tap evidence');
    await finishPerfect(true);
    await page.waitForFunction(() => economy().daily.pitchNotes.simple === 20);
    assert.equal(await page.evaluate(() => state.coins), 44, 'Shared simple cap only pays the one remaining note');
    assert.match(await page.locator('#pitchRewardStatus').textContent(), /本局获得 1 音符（今日该模式音符额度已达上限）/);

    await page.locator('[data-pitch-challenge="pitch"]').click();
    await frame.locator('[data-mode="simple"]').waitFor();
    assert.match(await frame.locator('[data-mode="simple"]').textContent(), /今日 20 \/ 20 音符/, 'Pitch audition sees the rhythm challenge shared cap');
    assert.equal(await frame.locator('.side-card').isVisible(), false, 'The duplicated embedded judge sidebar is removed');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${index}#pitch-rhythm`);
    if (await page.locator('[data-music-enter-muted]').isVisible()) await page.locator('[data-music-enter-muted]').click();
    await frame.locator('[data-action="start"]').waitFor();
    await page.waitForTimeout(450);
    const deepLinkPosition = await page.evaluate(() => ({ view:currentView, hash:location.hash, top:document.getElementById('pitchChallengeNav').getBoundingClientRect().top, viewport:innerHeight }));
    assert.equal(deepLinkPosition.view, 'pitch');
    assert.equal(deepLinkPosition.hash, '#pitch-rhythm');
    assert(deepLinkPosition.top >= 0 && deepLinkPosition.top < deepLinkPosition.viewport * .7, `Mobile deep link brings the challenge selector into the main viewport: ${JSON.stringify(deepLinkPosition)}`);
    assert.equal(await page.locator('.pitch-challenge-nav').evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length), 2, 'Mobile selector becomes two compact cards');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Main page has no horizontal overflow');
    const embeddedWidth = await frame.evaluate(node => { const box=node.getBoundingClientRect(),surface=node.shadowRoot.querySelector('.game-surface'); return { scroll:surface.scrollWidth, viewport:node.clientWidth, offenders:[...node.shadowRoot.querySelectorAll('*')].filter(el=>el.getBoundingClientRect().right>box.right+1).slice(0,6).map(el=>`${el.tagName}.${el.className}`) }; });
    assert(embeddedWidth.scroll <= embeddedWidth.viewport && !embeddedWidth.offenders.length, `Mounted rhythm challenge has no horizontal overflow: ${JSON.stringify(embeddedWidth)}`);
    const innerScrollers = await frame.evaluate(node => [...node.shadowRoot.querySelectorAll('*')].filter(el => { const style=getComputedStyle(el); return /(auto|scroll)/.test(style.overflowY) && el.scrollHeight>el.clientHeight+2; }).map(el=>`${el.tagName}.${el.className}`));
    assert.deepEqual(innerScrollers, [], 'Mobile rhythm challenge keeps one main-page scrollbar');
    await page.screenshot({ path: '/tmp/hjm-rhythm-audition-mobile.png', fullPage: true });
    await frame.locator('[data-action="start"]').click();
    assert.equal(await frame.locator('.score-sheet svg').getAttribute('data-score-layout'), 'stacked', 'Mobile stacks one measure per staff for legibility');
    assert((await frame.locator('.score-sheet svg').boundingBox()).height > 190, 'Mobile score is materially taller and easier to read');
    await frame.locator('[data-action="perform"]').click();
    const mobileTapPad=frame.locator('[data-action="tap"]');
    await mobileTapPad.click();
    assert.equal(await frame.locator('#gameRoot').evaluate(()=>window.__rhythmAudition.state.taps.length),1,'A mobile press is recorded immediately and its following click is not counted twice');
    assert((await frame.locator('#gameRoot').evaluate(()=>window.__rhythmAudition.audioSettings().tapLatencyCompensation))>=0,'Mobile tap timing applies a non-negative output-latency correction');
    await frame.locator('#gameRoot').evaluate(() => window.__rhythmAudition.completeStageForTest(false));
    assert.equal(await frame.locator('.feedback.fail').count(), 1, 'Failed mobile feedback shows the review state');
    assert(await frame.locator('[data-note-status="error"]').count() > 0, 'Failed tap feedback marks missed or mistimed notes in red on the score');
    assert.match(await frame.locator('.score-review-title').textContent(), /正确节奏与本次击打/, 'Tap feedback explains that the score includes the player attempt');
    assert.equal(await frame.locator('[data-action="next"]').count(), 1, 'A failed stage can be skipped when the player does not want to retry');
    assert.match(await frame.locator('[data-action="next"]').textContent(), /跳过，进入下一阶段/, 'The failed-stage next action is clearly labelled as a skip');
    assert.equal(await frame.locator('[data-action="retry"]').count(), 1, 'Failed feedback offers another attempt on the same rhythm');
    const retryRange = await frame.locator('[data-retry-tempo]').evaluate(input => ({ min:Number(input.min), max:Number(input.max), value:Number(input.value) }));
    assert(retryRange.min < retryRange.max && retryRange.value < retryRange.max, `Retry starts slower and exposes a BPM range: ${JSON.stringify(retryRange)}`);
    await frame.locator('[data-retry-tempo]').fill(String(retryRange.min));
    assert.match(await frame.locator('[data-action="review"]').textContent(), new RegExp(`${retryRange.min} BPM`), 'Correct-rhythm review visibly follows the selected slower BPM');
    await frame.locator('[data-action="review"]').click();
    assert.equal(await frame.locator('#gameRoot').evaluate(() => window.__rhythmAudition.retrySettings().lastReviewTempo), retryRange.min, 'Correct-rhythm audio scheduling uses the selected slower BPM');
    await frame.locator('[data-action="retry"]').click();
    const retrySettings = await frame.locator('#gameRoot').evaluate(() => window.__rhythmAudition.retrySettings());
    assert.deepEqual({ active:retrySettings.active, tempo:retrySettings.tempo, originalTempo:retrySettings.originalTempo, count:retrySettings.count }, { active:true, tempo:retryRange.min, originalTempo:retryRange.max, count:1 }, 'Retry keeps the same stage and uses the selected slower BPM');
    await frame.locator('#gameRoot').evaluate(() => window.__rhythmAudition.completeStageForTest(false));
    assert.equal(await frame.locator('[data-action="retry"]').count(), 1, 'A failed retry can be repeated without a limit');
    await frame.locator('[data-action="retry"]').click();
    await frame.locator('#gameRoot').evaluate(() => window.__rhythmAudition.completeStageForTest(true));
    assert.match(await frame.locator('.feedback.pass').textContent(), /练习重试成功，本阶段仍为 0 分/, 'Retry success is clearly marked as no-score practice');
    assert.equal(await frame.locator('#gameRoot').evaluate(() => window.__rhythmAudition.state.score), 0, 'Retry success never restores the failed stage point');
    assert.equal(await frame.locator('[data-action="next"]').count(), 1, 'Retry success unlocks the next stage');
    const reviewButtons = await frame.locator('.review-actions button').evaluateAll(nodes => nodes.map(node => ({ left:node.getBoundingClientRect().left, right:node.getBoundingClientRect().right, width:node.getBoundingClientRect().width })));
    assert(reviewButtons.every(button => button.left >= 0 && button.right <= 390 && button.width > 250), `Mobile review actions stack at usable width: ${JSON.stringify(reviewButtons)}`);
    await page.screenshot({ path: '/tmp/hjm-rhythm-audition-mobile-feedback.png', fullPage: true });
    await frame.locator('.game-card').screenshot({ path: '/tmp/hjm-rhythm-audition-mobile-feedback-card.png' });
    assert.deepEqual(errors, []);
    console.log('rhythm audition integration ok');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
