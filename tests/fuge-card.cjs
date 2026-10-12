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
      const own = id => { state.cards.encounters.push(id); state.cards.collection[id].owned = true; state.cards.collection[id].copies = 1; };
      state = freshState(); state.sound = false;
      const card = cardDef('fuge');
      check(card?.rarity === 'SR' && card.stars === 4 && cardStarCount(card) === 4 && card.role === '大提琴', 'SR card is four stars');
      check(card.stats.map(row => row[1]).join(',') === '80,85,62,82', 'level one stats');
      check(card.autoSkill && card.activeName === '刻苦练习' && card.passiveName === '笔记共享' && card.extraSkills?.[0]?.name === '抿嘴专注', 'three passive skills configured');
      check(cardBondDialogue(card, 0) === null && cardBondDialogue(card, 1)?.[0] === 0 && cardBondDialogue(card, 4)?.[0] === 3 && cardBondDialogue(card, 7)?.[0] === 6, 'strict greater-than bond dialogue tiers');
      const coffee = cardGifts(card).find(gift => gift[0] === 'black_coffee');
      check(coffee[3] === 50 && coffee[4] === 10, 'black coffee follows unified top gift tier');

      state.coins = 100;
      const unlocked = purchaseCardUnlock('fuge');
      check(unlocked.ok && state.coins === 50 && cardOwned('fuge') && cardBond('fuge') === 3, 'notes unlock is atomic');
      const legacy = persistedState(); legacy.bondVault.v = 11; delete legacy.bondVault.values.fuge; delete legacy.cards.collection.fuge; delete legacy.cards.fuge;
      const migrated = cleanImportedState(legacy);
      state = migrated;
      check(migrated.affinity.fuge === 0 && migrated.cards.collection.fuge && migrated.cards.fuge.streak === 0 && persistedState().bondVault.v === 16, 'v11 migration adds Fugue fields');
      const broken = persistedState(); delete broken.bondVault.values.fuge;
      let rejected = false; try { cleanImportedState(broken); } catch { rejected = true; }
      check(rejected, 'current save missing Fugue is rejected');

      state = freshState(); state.sound = false; own('fuge'); own('jiukuangkuang'); own('mobius');
      state.cards.team = ['fuge', 'jiukuangkuang'];
      check(cardXPAward('fuge', 20) === 30, 'Fugue always receives fifty percent self experience');
      check(cardXPAward('jiukuangkuang', 20) === 23, 'teammate receives fifteen percent shared experience');
      check(cardXPAward('mobius', 20) === 20, 'non-teammate experience is unchanged');
      addCardXP('fuge', 20); addCardXP('jiukuangkuang', 20); addCardXP('mobius', 20);
      check(state.cards.collection.fuge.xp === 30 && state.cards.collection.jiukuangkuang.xp === 23 && state.cards.collection.mobius.xp === 20, 'central experience entry applies exact gains');

      state.coins = 100; CardUI.detailId = 'fuge'; CardUI.gift = 'black_coffee'; feedCard();
      check(state.coins === 50 && state.cards.collection.fuge.xp === 84 && cardBond('fuge') === 10, 'feeding experience receives fifty percent bonus');
      trainCard('fuge');
      check(state.coins === 42 && state.cards.collection.fuge.xp === 129, 'short-practice experience receives fifty percent bonus');

      state.cards.collection.fuge.xp = 0; state.cards.collection.jiukuangkuang.xp = 0; state.cards.fuge.streak = 0;
      game.cardRun = captureCardRun();
      check(updateFugeFocus(true, 1) === 1, 'first completed performance creates one focus layer');
      awardCardPerformance(1);
      check(state.cards.collection.fuge.xp === 31 && state.cards.collection.jiukuangkuang.xp === 23, 'first layer adds five percent to Fugue performance experience');
      check(game.cardRun.fuge.xpGains.map(item => item.amount).join(',') === '31,23', 'performance result records exact gains');
      game.cardRun = captureCardRun(); updateFugeFocus(true, 1); awardCardPerformance(1);
      check(state.cards.fuge.streak === 2 && state.cards.collection.fuge.xp === 63 && state.cards.collection.jiukuangkuang.xp === 46, 'second uninterrupted performance stacks to ten percent');
      state.cards.fuge.streak = 4; game.cardRun = captureCardRun();
      check(updateFugeFocus(true, 1) === 5 && cardXPAward('fuge', 20, { performance: true, focusStack: 5, team: game.cardRun.ids }) === 35, 'focus caps at five layers and twenty-five percent');
      game.cardRun = captureCardRun();
      check(updateFugeFocus(false, 1) === 0 && state.cards.fuge.streak === 0, 'interrupted performance clears focus');
      state.cards.fuge.streak = 3; state.cards.team = ['jiukuangkuang']; game.cardRun = captureCardRun();
      check(updateFugeFocus(true, 1) === 0 && state.cards.fuge.streak === 0, 'performing without Fugue clears focus');
      state.cards.fuge.streak = 5;
      check(cleanCards(JSON.parse(JSON.stringify(state.cards))).fuge.streak === 5, 'focus stack survives reload');

      state = freshState(); state.sound = false; own('fuge'); state.cards.selected = 'fuge'; state.cards.team = ['fuge'];
      applyBondValue('fuge', 6); renderGlobal(); goCard('fuge'); CardUI.tab = 'bond'; renderCardPage();
      const dialogueText = document.querySelector('.bond-dialogue-panel')?.textContent || '';
      check(dialogueText.includes('开始对话') && !dialogueText.includes('复印了很多份') && !dialogueText.includes('看起来就像天赋'), 'responses stay behind the dialogue button');
      document.querySelector('[data-card-bond-dialogue="fuge"]').click();
      check($('modalContent').textContent.includes('复印了很多份') && cardBond('fuge') === 7, 'exactly six uses middle response and grants daily companionship');
      closeModal();
      document.querySelector('[data-card-bond-dialogue="fuge"]').click();
      check($('modalContent').textContent.includes('看起来就像天赋') && cardBond('fuge') === 7, 'greater-than-six uses highest response without duplicate gain');
      closeModal();
      CardUI.tab = 'detail'; renderCardPage();
      check(document.querySelectorAll('.skill-item').length >= 3 && !document.querySelector('[data-card-skill="fuge"]'), 'all passive skills render without a prepare button');
      renderRhythmTeam();
      check(document.getElementById('rhythmTeam').textContent.includes('赋格经验 +50%') && document.getElementById('rhythmTeam').textContent.includes('队友 +15%'), 'team panel displays experience effects');

      const load = src => new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve([image.naturalWidth, image.naturalHeight]); image.onerror = reject; image.src = src; });
      return { keys: [card.asset, card.coverAsset, card.avatarAsset], full: await load(cardImage(card, 'full')), cover: await load(cardImage(card, 'cover')), avatar: await load(cardImage(card, 'avatar')), thumbnail: cardThumbnail(card, 'avatar'), overflow: document.documentElement.scrollWidth > innerWidth };
    });
    assert.deepEqual(result.keys, ['cardFuge', 'cardFugeCover', 'cardFugeAvatar']);
    assert.deepEqual(result.full, [1086, 1448]); assert.deepEqual(result.cover, [1536, 1024]); assert.deepEqual(result.avatar, [1254, 1254]);
    assert.match(result.thumbnail, /thumbs\/avatars\/192\/fuge\.webp\?v=fuge20261012$/);
    assert.equal(result.overflow, false); assert.deepEqual(errors, []);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { CardUI.tab = 'detail'; goCard('fuge'); document.getElementById('musicWelcome').hidden = true; });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    console.log('PASS: Fugue card, v11 migration, all-source self/team experience, five-layer focus, strict bond dialogue and three image usages.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
