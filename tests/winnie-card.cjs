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
      const card = cardDef('winnie');
      check(card?.rarity === 'R' && card.stars === 3 && cardStarCount(card) === 3 && card.role === '第二小提琴', 'R rarity maps to three stars');
      check(card.stats.map(row => row[1]).join(',') === '78,70,65,74', 'level one stats');
      check(card.activeName === '隐忍' && card.activeKind === '主动' && card.preparable && card.passiveName === '观察', 'active and talent configuration');
      check(cardBondDialogue(card, 0) === null && cardBondDialogue(card, 1)?.[0] === 0 && cardBondDialogue(card, 4)?.[0] === 3 && cardBondDialogue(card, 7)?.[0] === 6, 'strict greater-than bond dialogue tiers');
      const tea = cardGifts(card).find(gift => gift[0] === 'black_tea');
      check(tea[3] === 50 && tea[4] === 10, 'black tea follows unified top gift tier');

      state.coins = 100;
      const unlocked = purchaseCardUnlock('winnie');
      check(unlocked.ok && state.coins === 50 && cardOwned('winnie') && cardBond('winnie') === 3, 'notes unlock is atomic');
      const legacy = persistedState(); legacy.bondVault.v = 9; delete legacy.bondVault.values.winnie; delete legacy.cards.collection.winnie;
      const migrated = cleanImportedState(legacy);
      check(migrated.affinity.winnie === 0 && migrated.cards.collection.winnie && persistedState().bondVault.v === 16, 'v9 migration adds Winnie fields');
      const broken = persistedState(); delete broken.bondVault.values.winnie;
      let rejected = false; try { cleanImportedState(broken); } catch { rejected = true; }
      check(rejected, 'current save missing Winnie is rejected');

      state = freshState(); state.sound = false;
      state.cards.encounters = ['winnie']; state.cards.collection.winnie.owned = true; state.cards.selected = 'winnie'; state.cards.team = ['winnie'];
      prepareCardSkill('winnie');
      check(state.cards.prepared?.id === 'winnie' && state.cards.prepared.amount === 0, 'active skill prepares without currency bonus');
      game.cardRun = captureCardRun();
      check(winnieScoreBonus(1000, 29.999) === 0 && !game.cardRun.winnie.activated, 'no burst before thirty seconds');
      check(winnieScoreBonus(1000, 30) === 300 && game.cardRun.winnie.activated && game.cardRun.winnie.bonusScore === 300, 'burst starts at exactly thirty seconds');

      Object.assign(game, { combo: 4, maxCombo: 4, miss: 0, good: 0, nice: 0, perfect: 0, score: 0, elapsed: 10 });
      const oldRandom = Math.random;
      try { Math.random = () => .29; settleLateNote({ lane: 0 }, performance.now()); } finally { Math.random = oldRandom; }
      check(game.good === 1 && game.miss === 0 && game.combo === 5 && game.judgement.text.includes('Winnie · 观察'), 'observation converts miss to good at thirty percent');
      state.cards.daily.winnieAssists = 5; game.cardRun = captureCardRun();
      Object.assign(game, { combo: 2, miss: 0, good: 0, nice: 0, perfect: 0, score: 0, elapsed: 10 });
      try { Math.random = () => 0; settleLateNote({ lane: 1 }, performance.now()); } finally { Math.random = oldRandom; }
      check(game.miss === 1 && game.good === 0 && game.combo === 0, 'daily observation cap is enforced');
      const cleaned = cleanCards(JSON.parse(JSON.stringify(state.cards)));
      check(cleaned.daily.winnieAssists === 5 && cleaned.prepared?.id === 'winnie', 'daily cap and prepared active survive reload');

      state.cards.daily.winnieAssists = 0; applyBondValue('winnie', 6); renderGlobal(); goCard('winnie'); CardUI.tab = 'bond'; renderCardPage();
      const dialogueText = document.querySelector('.bond-dialogue-panel')?.textContent || '';
      check(dialogueText.includes('开始对话') && !dialogueText.includes('坐得近') && !dialogueText.includes('你的想法也很重要'), 'responses stay behind the dialogue button');
      document.querySelector('[data-card-bond-dialogue="winnie"]').click();
      check($('modalContent').textContent.includes('坐得近') && cardBond('winnie') === 7, 'exactly six uses middle response and grants daily companionship');
      closeModal();
      document.querySelector('[data-card-bond-dialogue="winnie"]').click();
      check($('modalContent').textContent.includes('你的想法也很重要') && cardBond('winnie') === 7, 'greater-than-six uses highest response without duplicate gain');
      closeModal();

      const load = src => new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve([image.naturalWidth, image.naturalHeight]); image.onerror = reject; image.src = src; });
      return { keys: [card.asset, card.coverAsset, card.avatarAsset], full: await load(cardImage(card, 'full')), cover: await load(cardImage(card, 'cover')), avatar: await load(cardImage(card, 'avatar')), thumbnail: cardThumbnail(card, 'avatar'), overflow: document.documentElement.scrollWidth > innerWidth };
    });
    assert.deepEqual(result.keys, ['cardWinnie', 'cardWinnieCover', 'cardWinnieAvatar']);
    assert.deepEqual(result.full, [1086, 1448]); assert.deepEqual(result.cover, [1536, 1024]); assert.deepEqual(result.avatar, [1254, 1254]);
    assert.match(result.thumbnail, /thumbs\/avatars\/192\/winnie\.webp\?v=winnie20261011$/);
    assert.equal(result.overflow, false); assert.deepEqual(errors, []);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { CardUI.tab = 'detail'; goCard('winnie'); document.getElementById('musicWelcome').hidden = true; });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    console.log('PASS: Winnie card, v9 migration, thirty-second burst, observation daily cap, strict bond dialogue and three image usages.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
