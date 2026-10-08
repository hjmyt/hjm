const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    const result = await page.evaluate(async () => {
      const check = (ok, message) => { if (!ok) throw new Error(message); };
      state = freshState(); state.sound = false;
      const card = cardDef('sammy');
      check(card?.rarity === 'NR' && card.stars === 2 && card.role === '中提琴' && card.eventLimited && card.eventName === '教堂的回声', 'limited NR identity');
      check(card.stats.map(row => row[1]).join(',') === '78,74,70,80', 'level one stats');
      check(card.activeName === '前团长的指挥' && card.passiveName === '和善的威严' && card.extraSkills?.[0]?.name === '怕笛', 'three skills');
      const tea = cardGifts(card).find(gift => gift[0] === 'earl_grey');
      check(tea[3] === 50 && tea[4] === 10, 'tea follows unified top gift tier');

      state.coins = 100;
      const unlocked = purchaseCardUnlock('sammy');
      check(unlocked.ok && state.coins === 50 && cardOwned('sammy') && cardBond('sammy') === 3, 'notes unlock is atomic');
      const legacy = persistedState(); legacy.bondVault.v = 8; delete legacy.bondVault.values.sammy; delete legacy.cards.collection.sammy;
      const migrated = cleanImportedState(legacy);
      check(migrated.affinity.sammy === 0 && migrated.cards.collection.sammy && persistedState().bondVault.v === 9, 'v8 migration adds Sammy fields');

      state = freshState();
      for (const id of ['sammy', 'dijie']) { state.cards.encounters.push(id); state.cards.collection[id].owned = true; }
      state.cards.team = ['sammy', 'dijie']; game.cardRun = captureCardRun();
      check(game.cardRun.sammy.timingOffsetMultiplier === .5 && game.cardRun.sammy.flutePenalty === 5 && sammyStableOffset(.04) === .02, 'timing stability and flute penalty');
      Object.assign(game, { combo: 11, maxCombo: 11, miss: 0, good: 0, nice: 0, perfect: 0, score: 0, elapsed: 1 });
      const oldRandom = Math.random;
      try { Math.random = () => 0; settleLateNote({ lane: 0 }, performance.now()); } finally { Math.random = oldRandom; }
      check(game.miss === 1 && game.combo === 11 && game.cardRun.sammy.comboSaves === 1 && game.judgement.text.includes('没关系'), 'twenty-five percent save keeps combo but records miss');
      try { Math.random = () => .99; settleLateNote({ lane: 1 }, performance.now()); } finally { Math.random = oldRandom; }
      check(game.miss === 2 && game.combo === 0, 'failed save breaks combo');

      renderGlobal(); goCard('sammy'); route('cards');
      const collectionText = document.querySelector('[data-card-id="sammy"]')?.textContent || '';
      check(collectionText.includes('活动限定') && collectionText.includes('教堂的回声'), 'event source renders on collection card');
      goCard('sammy');
      const detailText = document.getElementById('view-card').textContent;
      check(detailText.includes('前团长的指挥') && detailText.includes('和善的威严') && detailText.includes('怕笛') && !document.querySelector('[data-card-skill="sammy"]'), 'automatic skills render');
      applyBondValue('sammy', 7); CardUI.tab = 'bond'; renderCardPage();
      check(!document.querySelector('.bond-dialogue-panel').textContent.includes('很久没人这样看着我'), 'bond response is not exposed inline');
      document.querySelector('[data-card-bond-dialogue="sammy"]').click();
      check($('modalContent').textContent.includes('很久没人这样看着我'), 'greater-than-six opens Sammy highest response');
      closeModal();

      const load = src => new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve([image.naturalWidth, image.naturalHeight]); image.onerror = reject; image.src = src; });
      return { keys: [card.asset, card.coverAsset, card.avatarAsset], full: await load(cardImage(card, 'full')), cover: await load(cardImage(card, 'cover')), avatar: await load(cardImage(card, 'avatar')), thumbnail: cardThumbnail(card, 'avatar'), overflow: document.documentElement.scrollWidth > innerWidth };
    });
    assert.deepEqual(result.keys, ['cardSammy', 'cardSammyCover', 'cardSammyAvatar']);
    assert.deepEqual(result.full, [1024, 1536]); assert.deepEqual(result.cover, [1536, 1024]); assert.deepEqual(result.avatar, [1254, 1254]);
    assert.match(result.thumbnail, /thumbs\/avatars\/192\/sammy\.webp\?v=sammy20261009$/);
    assert.equal(result.overflow, false); assert.deepEqual(errors, []);
    console.log('PASS: Sammy limited NR card, v8 migration, combo save, timing stability, flute penalty, strict bond dialogue button, unified gift and three image usages.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
