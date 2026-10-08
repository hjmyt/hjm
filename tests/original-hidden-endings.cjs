const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');

(async () => {
  const root = path.resolve(__dirname, '..');
  const plan = JSON.parse(fs.readFileSync(path.join(root, 'docs/imagegen/original-hidden-endings-2026-10/plan.json')));
  assert.equal(plan.panels.length, 8, 'The source atlas must retain exactly eight semantic panels');
  for (const [index, panel] of plan.panels.entries()) {
    assert(panel.pageId && panel.semanticId, `Panel ${index + 1} needs stable page and semantic ids`);
    assert(panel.visibleCast.length <= 2 && new Set(panel.visibleCast).size === panel.visibleCast.length, `Panel ${index + 1} visibleCast must be unique and at most two`);
    for (const target of panel.targets) assert(fs.existsSync(path.join(root, target)), `Missing crop ${target}`);
  }

  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'log' && message.text().startsWith('CHECK ')) console.log(message.text()); });
    await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
    const checks = await page.evaluate(async () => {
      const out = [], check = (name, ok) => { if (!ok) throw Error(name + ` (scene ${state.chronicle.run.scene})`); out.push(name); console.log('CHECK ' + name); };
      const click = async selector => { await new Promise(resolve => setTimeout(resolve, 220)); const button = document.querySelector(selector); if (!button || button.disabled) throw Error('Unavailable ' + selector); button.click(); };
      const choose = index => click(`[data-cp-choice="${index}"]`);
      const reset = (chapter, scene = 'menu') => {
        closeModal(false);
        state = freshState();
        state.sound = false;
        state.cards.encounters = CARD_DEFS.map(card => card.id);
        Object.assign(state.chronicle.run, { chapter, ch: chapter, name: '原始结局测试', inst: '小提琴', scene, week: 1, tech: 30, level: 4, ending: null, flags: {}, weekly: { version: 2, done: [1, 2, 3, 4, 5], active: 0, side: [], recaps: {}, approach: null, training: {}, trainingWeek: 1 } });
        state.chronicle.completedChapters = Array.from({ length: Math.max(0, chapter - 1) }, (_, index) => index + 1);
        save();
        route('chronicle');
      };
      const renderScene = scene => { state.chronicle.run.scene = scene; state.chronicle.run.rev++; save(); renderGlobal(); };

      reset(2, 'chat_select');
      state.affinity.shiyuan = 97;
      state.chronicle.slots[1] = { ...Chronicle.fresh().run, chapter: 1, ch: 1, name: '旧章', inst: '小提琴', scene: 'menu', aff: { ...state.affinity, shiyuan: 97 } };
      state.chronicle.chapter2Start = { ...state.chronicle.run, aff: { ...state.affinity, shiyuan: 97 } };
      save(); renderGlobal();
      await click('[data-cp-action="chat"][data-cp-person="shiyuan"]');
      check('Chapter-two Shiyuan weekly chat grants two then clears at 99', state.chronicle.run.flags.beShiyuan === 1 && cardBond('shiyuan') === 0 && state.chronicle.run.scene === 'chat');
      check('Threshold chat uses its dedicated generated panel', chronicleSceneArt(state.chronicle.run)?.id === 'scene_2_chat_shiyuan_shadow');
      check('Threshold clearing updates every unified-bond replica', [state.affinity, state.chronicle.bonds, state.chronicle.run.aff, state.chronicle.chapter2Start.aff, state.chronicle.slots[1].aff].every(record => record.shiyuan === 0));
      state = cleanState(JSON.parse(JSON.stringify(state))); save(); route('chronicle');
      check('Pending shadow ending and zero bond survive cleaning', state.chronicle.run.flags.beShiyuan === 1 && cardBond('shiyuan') === 0);
      await choose(0);
      check('The next arbitrary story choice settles the shadow ending', state.chronicle.run.ending === 'shadow' && state.chronicle.run.scene === 'be_shiyuan' && cardBond('shiyuan') === 0);
      check('Shadow ending uses the regenerated ending panel', chronicleSceneArt(state.chronicle.run)?.asset === 'scene_2_be_shiyuan');

      reset(2, 'chat_select');
      await click('[data-cp-action="chat"][data-cp-person="shiyuan"]');
      check('First weekly Shiyuan chat grants exactly two', cardBond('shiyuan') === 2 && state.chronicle.run.flags.chatBondWeek === 1);
      await choose(0); renderScene('chat_select'); await click('[data-cp-action="chat"][data-cp-person="lala"]');
      check('A second chat in the same week gives no bond to anyone', cardBond('shiyuan') === 2 && cardBond('lala') === 0);
      await choose(0); state.chronicle.run.week = 2; renderScene('chat_select'); await click('[data-cp-action="chat"][data-cp-person="shiyuan"]');
      check('A new week restores one chat reward', cardBond('shiyuan') === 4 && state.chronicle.run.flags.chatBondWeek === 2);

      reset(1, 'chat_select');
      await click('[data-cp-action="chat"][data-cp-person="lala"]');
      check('Other chapter chats remain plus one', cardBond('lala') === 1);
      renderScene('s_dream');
      check('Chapter one has no direct shadow-ending choice', document.querySelectorAll('[data-cp-choice]').length === 2 && !$('cpStoryText').textContent.includes('结束本章'));

      reset(4, 'c4_qiqi');
      state.chronicle.chapter4Start = structuredClone(state.chronicle.run);
      await choose(0);
      check('First refusal records once and selects first-refusal art', state.chronicle.run.flags.qHate === 1 && chronicleSceneArt(state.chronicle.run)?.id === 'scene_4_c4_qiqi_a_first');
      await click('[data-cp-action="restart"]'); await click('[data-cp-action="confirm-restart"]');
      check('Fourth-chapter restart preserves the refusal count', state.chronicle.run.flags.qHate === 1 && state.chronicle.run.scene === 'c4_intro');
      renderScene('c4_qiqi'); await choose(0);
      check('Second refusal records twice and selects second-refusal art', state.chronicle.run.flags.qHate === 2 && chronicleSceneArt(state.chronicle.run)?.id === 'scene_4_c4_qiqi_a_second' && $('cpStoryText').textContent.includes('和上次一样'));
      state = cleanState(JSON.parse(JSON.stringify(state))); save(); route('chronicle');
      check('Two refusals survive save cleaning', state.chronicle.run.flags.qHate === 2);

      reset(4, 'menu');
      state.affinity.tim = 60; state.affinity.azhe = 30; renderGlobal();
      await click('[data-cp-action="end-week"]');
      check('Exact 60 and 30 gap records the first rumor week', state.chronicle.run.flags.qBack === 1 && state.chronicle.run.scene === 'c4_rumor' && chronicleSceneArt(state.chronicle.run)?.id === 'scene_4_c4_rumor_first');
      await choose(0); await click('[data-cp-action="end-week"]');
      check('A second qualifying weekend records the second rumor week', state.chronicle.run.flags.qBack === 2 && state.chronicle.run.scene === 'c4_rumor' && chronicleSceneArt(state.chronicle.run)?.id === 'scene_4_c4_rumor_second');

      reset(4, 'menu');
      state.affinity.tim = 59; state.affinity.azhe = 29; renderGlobal();
      await click('[data-cp-action="end-week"]');
      check('Below-60 leader does not count', !state.chronicle.run.flags.qBack);
      reset(4, 'menu');
      state.affinity.tim = 60; state.affinity.azhe = 31; renderGlobal();
      await click('[data-cp-action="end-week"]');
      check('A 29-point gap does not count', !state.chronicle.run.flags.qBack);

      const imageTargets = [...new Set([
        'assets/chronicle/scenes/scene_2_chat_shiyuan_shadow.webp',
        'assets/chronicle/scenes/scene_2_be_shiyuan.webp',
        'assets/album/cp_shadow.webp',
        'assets/chronicle/scenes/scene_4_c4_qiqi_a_first.webp',
        'assets/chronicle/scenes/scene_4_c4_qiqi_a_second.webp',
        'assets/chronicle/scenes/scene_4_c4_rumor_first.webp',
        'assets/chronicle/scenes/scene_4_c4_rumor_second.webp',
        'assets/chronicle/scenes/scene_4_be_qiqi4.webp',
        'assets/album/cp4_qiqi.webp'
      ])];
      const imageSizes = await Promise.all(imageTargets.map(src => new Promise(resolve => { const img = new Image(); img.onload = () => resolve([img.naturalWidth, img.naturalHeight]); img.onerror = () => resolve([0, 0]); img.src = src; })));
      check('All generated crops load as 440-square production assets', imageSizes.every(([width, height]) => width === 440 && height === 440));
      return out;
    });
    assert.deepEqual(errors, []);
    console.log(`PASS: ${checks.length} restored hidden-ending checks and one eight-panel art atlas.`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
