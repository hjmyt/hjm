const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : {})
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    const result = await page.evaluate(async () => {
      const check = (ok, message) => { if (!ok) throw new Error(message); };
      state = freshState();
      state.sound = false;
      const card = cardDef('ria');
      check(card && card.rarity === 'R' && card.stars === 4 && card.role === '第二小提琴', 'card identity and four stars');
      check(card.activeKind === '被动' && card.passiveKind === '天赋' && card.autoSkill, 'skills are automatic passive and talent');
      check(card.stats.map(row => row[1]).join(',') === '65,68,85,62', 'level one stats match');
      check(card.statCaps?.音准 === 70, 'pitch cap is configured');
      check(card.bondLines.map(row => row[0]).join(',') === '0,3,6', 'bond dialogue thresholds');
      const macaron = cardGifts(card).find(gift => gift[0] === 'macaron');
      check(macaron[3] === 50 && macaron[4] === 10, 'macaron follows unified 50 notes / 10 bond tier');

      state.coins = 100;
      const unlocked = purchaseCardUnlock('ria');
      check(unlocked.ok && state.coins === 50 && cardOwned('ria') && cardBond('ria') === 3, 'notes unlock is atomic');

      const legacy = persistedState();
      legacy.bondVault.v = 5;
      delete legacy.bondVault.values.ria;
      delete legacy.cards.collection.ria;
      const migrated = cleanImportedState(legacy);
      check(migrated.affinity.ria === 0 && migrated.cards.collection.ria, 'v5 save adds only RIA fields');
      state = migrated;
      check(persistedState().bondVault.v === 9, 'migrated saves write bond vault v9');
      const broken = persistedState();
      delete broken.bondVault.values.ria;
      let rejected = false;
      try { cleanImportedState(broken); } catch { rejected = true; }
      check(rejected, 'current save missing RIA is rejected');

      state = freshState();
      state.cards.encounters = ['ria'];
      state.cards.collection.ria.owned = true;
      state.cards.collection.ria.xp = 3540;
      state.cards.selected = 'ria';
      state.cards.team = ['ria'];
      renderGlobal();
      goCard('ria');
      check(!document.querySelector('[data-card-skill="ria"]') && document.getElementById('view-card').textContent.includes('天赋'), 'automatic passive has no prepare button');
      const pitch = [...document.querySelectorAll('.profile-stat')].find(node => node.textContent.includes('音准'))?.querySelector('strong')?.textContent;
      check(pitch === '70', 'pitch display remains capped at level sixty');

      game.cardRun = captureCardRun();
      game.score = 7000;
      check(applyRiaCompensation(true, 7, 79.99) === 1400 && game.score === 8400, 'below eighty percent adds twenty percent score');
      check(applyRiaCompensation(true, 7, 70) === 0 && game.score === 8400, 'compensation only settles once');
      game.cardRun = captureCardRun(); game.score = 7000;
      check(applyRiaCompensation(true, 8, 80) === 0 && game.score === 7000, 'exactly eighty percent does not compensate');
      game.cardRun = captureCardRun(); game.score = 7000;
      check(applyRiaCompensation(false, 7, 70) === 0 && game.score === 7000, 'interrupted performance does not compensate');

      game.cardRun = captureCardRun();
      Object.assign(game, { status: 'running', notes: Array(10).fill({}), score: 7000, perfect: 7, good: 0, nice: 0, miss: 3, combo: 7, maxCombo: 7, duration: 10, elapsed: 10 });
      finishGame();
      check(game.score === 8400 && game.result.accuracy === 70 && game.result.rank === 'B', 'finish keeps raw accuracy and rank while compensating score');
      check(state.best[gameKey()].score === 7000, 'best score remains the unassisted performance');
      renderGameOverlay();
      check(document.getElementById('gameOverlay').textContent.includes('低于 80% 补偿 +1400'), 'result receipt explains the compensation');

      applyBondValue('ria', 7);
      goCard('ria');
      CardUI.tab = 'bond';
      renderCardPage();
      const dialogueText = document.querySelector('.bond-dialogue-panel')?.textContent || '';
      check(dialogueText.includes('开始对话') && !dialogueText.includes('第一次拉这首') && !dialogueText.includes('我也会紧张'), 'bond responses stay behind the dialogue button');
      document.querySelector('[data-card-bond-dialogue="ria"]').click();
      check($('modalContent').textContent.includes('我也会紧张'), 'greater-than-six opens RIA highest response');
      closeModal();

      const load = src => new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve([image.naturalWidth, image.naturalHeight]);
        image.onerror = reject;
        image.src = src;
      });
      return {
        keys: [card.asset, card.coverAsset, card.avatarAsset],
        full: await load(cardImage(card, 'full')),
        cover: await load(cardImage(card, 'cover')),
        avatar: await load(cardImage(card, 'avatar')),
        thumbnail: cardThumbnail(card, 'avatar'),
        overflow: document.documentElement.scrollWidth > innerWidth
      };
    });
    assert.deepEqual(result.keys, ['cardRia', 'cardRiaCover', 'cardRiaAvatar']);
    assert.deepEqual(result.full, [1024, 1536]);
    assert.deepEqual(result.cover, [1536, 1024]);
    assert.deepEqual(result.avatar, [1254, 1254]);
    assert.match(result.thumbnail, /thumbs\/avatars\/192\/ria\.webp\?v=ria20261008$/);
    assert.equal(result.overflow, false);
    await page.evaluate(() => { CardUI.tab = 'detail'; goCard('ria'); document.getElementById('musicWelcome').hidden = true; });
    await page.locator('#view-card .character-cover').screenshot({ path: '/tmp/hjm-ria-detail-desktop.png' });
    await page.evaluate(() => route('cards'));
    await page.locator('[data-card-id="ria"]').screenshot({ path: '/tmp/hjm-ria-collection-desktop.png' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { CardUI.tab = 'detail'; goCard('ria'); document.getElementById('musicWelcome').hidden = true; });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.locator('#view-card .character-cover').screenshot({ path: '/tmp/hjm-ria-detail-mobile.png' });
    assert.deepEqual(errors, []);
    console.log('PASS: RIA card data, v5 migration, unified macaron tier, score compensation, pitch cap, strict bond dialogue button and three image usages.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
