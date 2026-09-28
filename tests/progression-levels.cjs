const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {})
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    const checks = await page.evaluate(() => {
      const passed = [];
      let now = performance.now();
      performance.now = () => now;
      const check = (label, value) => {
        if (!value) throw new Error(label);
        passed.push(label);
      };
      const clickChoice = index => {
        now += 250;
        const button = document.querySelector(`[data-cp-choice="${index}"]`);
        if (!button || button.disabled) throw new Error('Unavailable choice ' + index);
        button.click();
      };
      const showScene = scene => {
        Object.assign(state.chronicle.run, { chapter: 1, ch: 1, week: 1, name: '等级测试', inst: '键盘', scene, ending: null });
        state.chronicle.run.rev++;
        route('chronicle');
      };

      closeModal(false);
      state = freshState();
      state.sound = false;
      check('Band starts at level one', globalBandLevel() === 1);
      check('Orchestra starts at level one', globalOrchestraLevel() === 1);
      check('Band roster is exact', ['goose', 'xiaota', 'dayang', 'rek', 'baoshi', 'xuezi', 'feihong'].every(id => memberLevelGroup(id) === 'band'));
      check('Azhe and Dijie are orchestra members', memberLevelGroup('azhe') === 'orchestra' && memberLevelGroup('dijie') === 'orchestra');
      check('Jerry is not assigned to either level group', memberLevelGroup('jerry') === null);

      Object.assign(state.chronicle.run, { chapter: 1, ch: 1, week: 1, name: '入口测试', inst: '键盘', scene: 'menu', ending: null });
      route('chronicle');
      const side = document.querySelector('[data-cp-event="c1_band_offer"]');
      check('Fresh first chapter menu shows the band side story without a card gate', !!side);
      check('Band side story is a persistent free-time card', !!side.closest('.cp-actions-grid') && side.textContent.includes('乐队筹备'));
      Object.assign(state.chronicle.run, { scene: 'title2', ending: 'debut' });
      state.chronicle.run.rev++;
      renderGlobal();
      check('Completed first chapter advertises the new side story and restart entry', document.querySelector('#cpMain').textContent.includes('新增支线 · 宝石＋飞鸿乐队筹备') && document.querySelector('#cpMain [data-cp-action="restart"]'));

      for (const [scene, choice, claim] of [
        ['c1_band_offer', 0, 'band:c1:formation-choice'],
        ['c1_band_commit', 0, 'band:c1:commit-choice'],
        ['c1_band_rehearsal', 0, 'band:c1:rehearsal'],
        ['c1_band_arrangement', 0, 'band:c1:arrangement']
      ]) {
        const before = globalBandLevel();
        showScene(scene);
        check(scene + ' hides its level reward from choices', !document.querySelector('.cp-choices').textContent.match(/Lv\.|等级|\+1/));
        clickChoice(choice);
        check(scene + ' grants its one-time band milestone', globalBandLevel() === before + 1 && levelMilestoneClaimed(claim));
        check(scene + ' cannot be claimed twice', claimBandMilestone(claim) === 0 && globalBandLevel() === before + 1);
      }
      check('Four supportive preparation choices reach band level five', globalBandLevel() === 5);

      state.chronicle.run.weekly.side.push('c1_band_qualification');
      state.cards.team = ['baoshi', 'feihong'];
      Object.assign(game, {
        status: 'running', duration: 40, elapsed: 40,
        notes: Array.from({ length: 10 }, () => ({})), score: 4500,
        perfect: 10, good: 0, nice: 0, miss: 0, combo: 10, maxCombo: 10,
        cardRun: { ids: ['baoshi', 'feihong'], sourceSnapshot: { assists: 0 }, credited: true, bondGains: [] }
      });
      finishGame();
      check('BaoShi and Feihong C-rank trial reaches band level six', globalBandLevel() === 6 && levelMilestoneClaimed('band:c1:qualification'));
      check('Qualification run does not also consume generic C-rank growth', !levelMilestoneClaimed('band:rhythm:c'));

      let gains = claimRhythmLevelMilestones(['baoshi', 'azhe'], 'B');
      check('Mixed rhythm lineup can grow both global levels', gains.length === 2 && globalBandLevel() === 7 && globalOrchestraLevel() === 2);
      gains = claimRhythmLevelMilestones(['baoshi', 'azhe'], 'B');
      check('Same group and rank cannot be farmed repeatedly', gains.length === 0 && globalBandLevel() === 7 && globalOrchestraLevel() === 2);
      gains = claimRhythmLevelMilestones(['azhe', 'dijie'], 'A');
      check('Two orchestra members produce one orchestra milestone', gains.length === 1 && globalOrchestraLevel() === 3 && globalBandLevel() === 7);

      const protectedSave = persistedState();
      check('Level claims are protected in vault version three', protectedSave.levelVault.v === 3 && protectedSave.levelVault.claimed.includes('band:c1:qualification'));
      const tampered = JSON.parse(JSON.stringify(protectedSave));
      tampered.levelVault.claimed = tampered.levelVault.claimed.filter(id => id !== 'band:c1:qualification');
      let rejected = false;
      try { cleanImportedState(tampered); } catch (error) { rejected = /等级数据校验失败/.test(error.message); }
      check('Deleting a claimed level milestone invalidates the import', rejected);
      return passed;
    });
    assert.deepEqual(errors, []);
    console.log(`PASS: ${checks.length} global band/orchestra progression checks.`);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
