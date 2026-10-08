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
      const card = cardDef('mobius');
      check(card && card.rarity === 'R' && card.stars === 3 && card.role === '第一小提琴', 'card identity and three stars');
      check(card.activeKind === '被动' && card.passiveKind === '天赋' && card.autoSkill, 'skill types and automatic trigger');
      check(card.stats.map(row => row[1]).join(',') === '68,82,72,65', 'level one stats increased by fifty');
      check(!JSON.stringify(card).includes('金色'), 'card copy preserves the supplied hair color');
      check(card.bondLines.map(row => row[0]).join(',') === '0,3,6', 'bond dialogue thresholds');
      check(cardBondDialogue(card, 0) === null && cardBondDialogue(card, 1)?.[0] === 0 && cardBondDialogue(card, 3)?.[0] === 0 && cardBondDialogue(card, 4)?.[0] === 3 && cardBondDialogue(card, 6)?.[0] === 3 && cardBondDialogue(card, 7)?.[0] === 6, 'dialogue tiers use strict greater-than zero, three and six boundaries');
      const gifts = cardGifts(card), drink = gifts.find(gift => gift[0] === 'energy_drink');
      check(drink[3] === 50 && drink[4] === 10, 'energy drink follows unified 50 notes / 10 bond tier');

      state.coins = 100;
      const unlocked = purchaseCardUnlock('mobius');
      check(unlocked.ok && state.coins === 50 && cardOwned('mobius') && cardBond('mobius') === 3, 'notes unlock is atomic');

      const legacy = persistedState();
      legacy.bondVault.v = 4;
      delete legacy.bondVault.values.mobius;
      const migrated = cleanImportedState(legacy);
      check(migrated.affinity.mobius === 0 && migrated.cards.collection.mobius, 'v4 save adds only Mobius fields');
      state = migrated;
      check(persistedState().bondVault.v === 9, 'migrated saves write bond vault v9');
      const broken = persistedState();
      delete broken.bondVault.values.mobius;
      let rejected = false;
      try { cleanImportedState(broken); } catch { rejected = true; }
      check(rejected, 'current save missing Mobius is rejected');

      state = freshState();
      state.cards.encounters = ['mobius'];
      state.cards.collection.mobius.owned = true;
      state.cards.selected = 'mobius';
      state.cards.team = ['mobius'];
      renderGlobal();
      goCard('mobius');
      check(!document.querySelector('[data-card-skill="mobius"]') && document.getElementById('view-card').textContent.includes('天赋'), 'automatic passive has no prepare button');
      game.cardRun = captureCardRun();
      for (let i = 0; i < 10; i++) onMobiusJudgement('PERFECT', 1 + i * .1);
      check(game.cardRun.mobius.activations === 1 && game.cardRun.mobius.hotUntil === 6.9, 'ten perfects trigger five seconds of hot dance');
      check(mobiusScoreBonus(1000, 2) === 150 && game.cardRun.mobius.bonusScore === 150, 'hot dance gives 15 percent score');
      check(document.querySelector('[data-card-member="mobius"]')?.classList.contains('mobius-wave'), 'rhythm avatar performs wave');
      onMobiusJudgement('GOOD', 2.1);
      check(game.cardRun.mobius.perfectStreak === 0, 'non-perfect breaks the perfect streak');

      applyBondValue('mobius', 6);
      goCard('mobius');
      CardUI.tab = 'bond';
      renderCardPage();
      const dialogueText = document.querySelector('.bond-dialogue-panel')?.textContent || '';
      check(dialogueText.includes('开始对话') && !dialogueText.includes('叫我Mob就行') && !dialogueText.includes('热舞收尾'), 'bond page uses a dialogue button instead of exposing responses');
      document.querySelector('[data-card-bond-dialogue="mobius"]').click();
      check($('modalContent').textContent.includes('偷偷跳给你看') && cardBond('mobius') === 7, 'exactly six bond uses the greater-than-three response and grants daily companionship');
      closeModal();
      document.querySelector('[data-card-bond-dialogue="mobius"]').click();
      check($('modalContent').textContent.includes('热舞收尾') && cardBond('mobius') === 7, 'greater-than-six uses the highest response without a second daily gain');
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
    assert.deepEqual(result.keys, ['cardMobius', 'cardMobiusCover', 'cardMobiusAvatar']);
    assert.deepEqual(result.full, [1024, 1536]);
    assert.deepEqual(result.cover, [1536, 1024]);
    assert.deepEqual(result.avatar, [1254, 1254]);
    assert.match(result.thumbnail, /thumbs\/avatars\/192\/mobius\.webp\?v=mobius20261008$/);
    assert.equal(result.overflow, false);
    await page.evaluate(() => { CardUI.tab = 'detail'; goCard('mobius'); document.getElementById('musicWelcome').hidden = true; });
    await page.locator('#view-card .character-cover').screenshot({ path: '/tmp/hjm-mobius-detail-desktop.png' });
    await page.evaluate(() => route('cards'));
    await page.locator('[data-card-id="mobius"]').screenshot({ path: '/tmp/hjm-mobius-collection-desktop.png' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { CardUI.tab = 'detail'; goCard('mobius'); document.getElementById('musicWelcome').hidden = true; });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.locator('#view-card .character-cover').screenshot({ path: '/tmp/hjm-mobius-detail-mobile.png' });
    assert.deepEqual(errors, []);
    console.log('PASS: Mobius card data, v4 migration, unified gift tier, hot-dance scoring, strict bond dialogue button and three image usages.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
