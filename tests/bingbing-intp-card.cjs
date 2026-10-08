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
      const card = cardDef('bingbing_intp');
      check(card && card.rarity === 'SR' && card.stars === 3 && card.role === '小提琴', 'card identity and SR stars');
      check(card.activeKind === '团队被动' && card.passiveKind === '天赋' && card.autoSkill, 'automatic team passive and talent');
      check(card.stats.map(row => row[1]).join(',') === '76,74,78,82', 'level one stats match');
      check(card.extraSkills?.[0]?.name === '空格认定' && card.extraSkills[0].tag === '联动', 'Kongge link is configured');
      check(card.bondLines.map(row => row[0]).join(',') === '0,3,6', 'bond dialogue thresholds');
      const cookie = cardGifts(card).find(gift => gift[0] === 'cookieann_cookie');
      check(cookie[1] === '可琦安造型饼干' && cookie[3] === 50 && cookie[4] === 10, 'exclusive cookie follows unified gift tier');

      state.coins = 100;
      const unlocked = purchaseCardUnlock('bingbing_intp');
      check(unlocked.ok && state.coins === 50 && cardOwned('bingbing_intp') && cardBond('bingbing_intp') === 3, 'notes unlock is atomic');

      const legacy = persistedState();
      legacy.bondVault.v = 6;
      delete legacy.bondVault.values.bingbing_intp;
      delete legacy.cards.collection.bingbing_intp;
      const migrated = cleanImportedState(legacy);
      check(migrated.affinity.bingbing_intp === 0 && migrated.cards.collection.bingbing_intp, 'v6 save adds only 饼饼 fields');
      state = migrated;
      check(persistedState().bondVault.v === 9, 'migrated saves write bond vault v9');
      const broken = persistedState();
      delete broken.bondVault.values.bingbing_intp;
      let rejected = false;
      try { cleanImportedState(broken); } catch { rejected = true; }
      check(rejected, 'current save missing 饼饼 is rejected');

      state = freshState();
      state.cards.encounters = ['bingbing_intp', 'lala', 'kongge'];
      for (const id of state.cards.encounters) state.cards.collection[id].owned = true;
      state.cards.selected = 'bingbing_intp';
      state.cards.team = ['bingbing_intp'];
      game.cardRun = captureCardRun();
      check(game.cardRun.bingbingIntp.people === 2 && bingbingIntpScoreBonus(1000) === 50, 'two people including player grants five percent');
      state.cards.team = ['bingbing_intp', 'lala'];
      game.cardRun = captureCardRun();
      check(game.cardRun.bingbingIntp.people === 3 && bingbingIntpScoreBonus(1000) === 100, 'three people including player grants ten percent');
      state.cards.team = ['bingbing_intp', 'lala', 'kongge'];
      game.cardRun = captureCardRun();
      check(game.cardRun.bingbingIntp.people === 4 && game.cardRun.bingbingIntp.teamTechnique === 22 && game.cardRun.bingbingIntp.judgementWidth === .08 && bingbingIntpScoreBonus(1000) === 150, 'full team grants fifteen percent, technique and Kongge widening');

      renderGlobal();
      goCard('bingbing_intp');
      const detailText = document.getElementById('view-card').textContent;
      check(!document.querySelector('[data-card-skill="bingbing_intp"]') && detailText.includes('INTP的碎碎念') && detailText.includes('超绝I人') && detailText.includes('空格认定'), 'all three automatic skills render without prepare button');

      currentView = 'rhythm';
      game.track = Math.max(0, TRACKS.findIndex(track => !track.audio));
      game.status = 'idle';
      game.bingbingStrategyReady = false;
      await startGame();
      check(!$('modalBackdrop').hidden && $('modalTitle').textContent.includes('开局碎碎念') && $('modalContent').textContent.includes('全队技巧 +22') && $('modalContent').textContent.includes('判定窗口再拓宽 8%'), 'start opens skippable strategy briefing');
      document.querySelector('[data-bingbing-strategy-close]').click();
      await new Promise(resolve => setTimeout(resolve, 250));
      check(['countdown', 'running'].includes(game.status) && game.cardRun?.bingbingIntp?.teamTechnique === 22, 'closing briefing starts the performance with buff');
      stopGame(true);

      applyBondValue('bingbing_intp', 7);
      goCard('bingbing_intp');
      CardUI.tab = 'bond';
      renderCardPage();
      const dialogueText = document.querySelector('.bond-dialogue-panel')?.textContent || '';
      check(dialogueText.includes('开始对话') && !dialogueText.includes('英国回来的') && !dialogueText.includes('我就没反抗'), 'bond responses stay behind the dialogue button');
      document.querySelector('[data-card-bond-dialogue="bingbing_intp"]').click();
      check($('modalContent').textContent.includes('我就没反抗'), 'greater-than-six opens 饼饼 highest response');
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
    assert.deepEqual(result.keys, ['cardBingbingIntp', 'cardBingbingIntpCover', 'cardBingbingIntpAvatar']);
    assert.deepEqual(result.full, [1024, 1536]);
    assert.deepEqual(result.cover, [1536, 1024]);
    assert.deepEqual(result.avatar, [1254, 1254]);
    assert.match(result.thumbnail, /thumbs\/avatars\/192\/bingbing_intp\.webp\?v=bingbingIntp20261009$/);
    assert.equal(result.overflow, false);
    await page.evaluate(() => { CardUI.tab = 'detail'; goCard('bingbing_intp'); document.getElementById('musicWelcome').hidden = true; });
    await page.locator('#view-card .character-cover').screenshot({ path: '/tmp/hjm-bingbing-intp-detail-desktop.png' });
    await page.evaluate(() => route('cards'));
    await page.locator('[data-card-id="bingbing_intp"]').screenshot({ path: '/tmp/hjm-bingbing-intp-collection-desktop.png' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { CardUI.tab = 'detail'; goCard('bingbing_intp'); document.getElementById('musicWelcome').hidden = true; });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.locator('#view-card .character-cover').screenshot({ path: '/tmp/hjm-bingbing-intp-detail-mobile.png' });
    assert.deepEqual(errors, []);
    console.log('PASS: 饼饼 card data, v6 migration, unified cookie tier, strategy briefing, score tiers, Kongge link, strict bond dialogue button and three image usages.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
