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
      const card = cardDef('jiukuangkuang');
      check(card?.rarity === 'SR' && card.stars === 4 && cardStarCount(card) === 4 && card.role === '大提琴', 'SR card is four stars');
      check(card.stats.map(row => row[1]).join(',') === '76,72,70,78', 'level one stats');
      check(card.traits.includes('二次元') && card.activeName === '理智爆发' && card.preparable && card.passiveName === '定海神针', 'skill and trait configuration');
      check(cardBondDialogue(card, 0) === null && cardBondDialogue(card, 1)?.[0] === 0 && cardBondDialogue(card, 4)?.[0] === 3 && cardBondDialogue(card, 7)?.[0] === 6, 'strict greater-than bond dialogue tiers');
      const chips = cardGifts(card).find(gift => gift[0] === 'potato_chips');
      check(chips[3] === 50 && chips[4] === 10, 'chips follow unified top gift tier');

      state.coins = 100;
      const unlocked = purchaseCardUnlock('jiukuangkuang');
      check(unlocked.ok && state.coins === 50 && cardOwned('jiukuangkuang') && cardBond('jiukuangkuang') === 3, 'notes unlock is atomic');
      const legacy = persistedState(); legacy.bondVault.v = 10; delete legacy.bondVault.values.jiukuangkuang; delete legacy.cards.collection.jiukuangkuang;
      const migrated = cleanImportedState(legacy);
      state = migrated;
      check(migrated.affinity.jiukuangkuang === 0 && migrated.cards.collection.jiukuangkuang && persistedState().bondVault.v === 16, 'v10 migration adds Jiukuangkuang fields');
      const broken = persistedState(); delete broken.bondVault.values.jiukuangkuang;
      let rejected = false; try { cleanImportedState(broken); } catch { rejected = true; }
      check(rejected, 'current save missing Jiukuangkuang is rejected');

      state = freshState(); state.sound = false;
      state.cards.encounters = ['jiukuangkuang']; state.cards.collection.jiukuangkuang.owned = true; state.cards.selected = 'jiukuangkuang'; state.cards.team = ['jiukuangkuang'];
      prepareCardSkill('jiukuangkuang');
      check(state.cards.prepared?.id === 'jiukuangkuang' && state.cards.prepared.amount === 0, 'active skill prepares without currency bonus');
      game.cardRun = captureCardRun();
      check(game.cardRun.jiukuangkuang.judgementWidth === .12 && game.cardRun.jiukuangkuang.missToGoodChance === .08, 'team forgiveness values captured');
      check(tryJiukuangkuangRescue(() => .079) && !tryJiukuangkuangRescue(() => .08) && game.cardRun.jiukuangkuang.rescues === 1, 'miss rescue has exact eight percent boundary');
      check(!jiukuangkuangAutoHold({ duration: 0, beats: 1 }, 0), 'tap notes do not activate hold skill');
      check(jiukuangkuangAutoHold({ duration: 0, beats: 2 }, 0) && jiukuangkuangAutoHold({ duration: 3 }, 9), 'native and score-source hold notes are protected for ten seconds');
      check(!jiukuangkuangAutoHold({ duration: 2 }, 10.001) && jiukuangkuangAutoHold({ duration: 2 }, 60), 'hold skill respects sixty-second cooldown');
      check(game.cardRun.jiukuangkuang.activations === 2 && game.cardRun.jiukuangkuang.autoHolds === 3, 'hold skill counters are correct');
      const cleaned = cleanCards(JSON.parse(JSON.stringify(state.cards)));
      check(cleaned.prepared?.id === 'jiukuangkuang' && cleaned.prepared.amount === 0, 'prepared active survives reload');

      const partner = cardDef('bingbing_intp'), oldTraits = partner.traits;
      try {
        partner.traits = [...(oldTraits || []), '二次元'];
        state.cards.team = ['jiukuangkuang', 'bingbing_intp'];
        const boosts = jiukuangkuangRhythmBoosts();
        check(boosts.map(item => item.id).join(',') === 'jiukuangkuang,bingbing_intp' && boosts.every(item => item.boost === 10), 'anime pairing boosts both members');
        check(cardDisplayStat(card, '节奏') === 82 && cardDisplayStat(partner, '节奏') === 84, 'rhythm bonus is reflected in team stats');
      } finally { partner.traits = oldTraits; }

      state.cards.team = ['jiukuangkuang'];
      applyBondValue('jiukuangkuang', 6); renderGlobal(); goCard('jiukuangkuang'); CardUI.tab = 'bond'; renderCardPage();
      const dialogueText = document.querySelector('.bond-dialogue-panel')?.textContent || '';
      check(dialogueText.includes('开始对话') && !dialogueText.includes('泰拉大陆') && !dialogueText.includes('干员部署'), 'responses stay behind the dialogue button');
      document.querySelector('[data-card-bond-dialogue="jiukuangkuang"]').click();
      check($('modalContent').textContent.includes('泰拉大陆') && cardBond('jiukuangkuang') === 7, 'exactly six uses middle response and grants daily companionship');
      closeModal();
      document.querySelector('[data-card-bond-dialogue="jiukuangkuang"]').click();
      check($('modalContent').textContent.includes('干员部署') && cardBond('jiukuangkuang') === 7, 'greater-than-six uses highest response without duplicate gain');
      closeModal();

      const load = src => new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve([image.naturalWidth, image.naturalHeight]); image.onerror = reject; image.src = src; });
      return { keys: [card.asset, card.coverAsset, card.avatarAsset], full: await load(cardImage(card, 'full')), cover: await load(cardImage(card, 'cover')), avatar: await load(cardImage(card, 'avatar')), thumbnail: cardThumbnail(card, 'avatar'), overflow: document.documentElement.scrollWidth > innerWidth };
    });
    assert.deepEqual(result.keys, ['cardJiukuangkuang', 'cardJiukuangkuangCover', 'cardJiukuangkuangAvatar']);
    assert.deepEqual(result.full, [1086, 1448]); assert.deepEqual(result.cover, [1536, 1024]); assert.deepEqual(result.avatar, [1254, 1254]);
    assert.match(result.thumbnail, /thumbs\/avatars\/192\/jiukuangkuang\.webp\?v=jiukuangkuang20261012$/);
    assert.equal(result.overflow, false); assert.deepEqual(errors, []);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { CardUI.tab = 'detail'; goCard('jiukuangkuang'); document.getElementById('musicWelcome').hidden = true; });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    console.log('PASS: Jiukuangkuang card, v10 migration, team forgiveness, active hold protection, anime synergy, strict bond dialogue and three image usages.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
