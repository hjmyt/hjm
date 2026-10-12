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
      const card = cardDef('zenta');
      check(card?.rarity === 'SR' && card.stars === 4 && cardStarCount(card) === 4 && card.role === '大提琴', 'SR card is four stars and consistently uses cello');
      check(card.stats.map(row => row[1]).join(',') === '72,70,68,80', 'level one stats');
      check(card.autoSkill && card.activeName === '默默支持' && card.passiveName === '和声填充' && card.extraSkills?.[0]?.name === '温水效应', 'three automatic skills configured');
      check(cardBondDialogue(card, 0) === null && cardBondDialogue(card, 1)?.[0] === 0 && cardBondDialogue(card, 4)?.[0] === 3 && cardBondDialogue(card, 7)?.[0] === 6, 'strict greater-than bond dialogue tiers');
      const milk = cardGifts(card).find(gift => gift[0] === 'warm_milk');
      check(milk[3] === 50 && milk[4] === 10, 'exclusive warm milk follows unified top gift tier');

      state.coins = 100;
      const unlocked = purchaseCardUnlock('zenta');
      check(unlocked.ok && state.coins === 50 && cardOwned('zenta') && cardBond('zenta') === 3, 'notes unlock is atomic');
      const legacy = persistedState(); legacy.bondVault.v = 14; delete legacy.bondVault.values.zenta; delete legacy.cards.collection.zenta; delete legacy.cards.trio.energy.zenta;
      const migrated = cleanImportedState(legacy); state = migrated;
      check(migrated.affinity.zenta === 0 && migrated.cards.collection.zenta && migrated.cards.trio.energy.zenta === 100 && persistedState().bondVault.v === 16, 'v14 migration adds ZENTA fields and energy');
      const broken = persistedState(); delete broken.bondVault.values.zenta;
      let rejected = false; try { cleanImportedState(broken); } catch { rejected = true; }
      check(rejected, 'current save missing ZENTA is rejected');

      state = freshState(); state.sound = false; for (const id of ['zenta', 'lia', 'ria']) own(id);
      state.cards.team = ['zenta', 'lia', 'ria'];
      game.cardRun = captureCardRun(() => .99);
      check(game.cardRun.zenta.pitchBoosts.map(item => item.id).join(',') === 'lia,ria', 'all violin teammates receive harmony filling');
      check(cardDisplayStat(cardDef('lia'), '音准') === 92 && cardDisplayStat(cardDef('ria'), '音准') === 70, 'pitch boost respects the RIA pitch cap');
      check(zentaScoreBonus(1000) === 120 && game.cardRun.zenta.bonusScore === 120, 'teammate score gains twelve percent');
      trio().energy.zenta = 50; trio().energy.lia = 50; trio().energy.ria = 50;
      onTrioPerformance(game.cardRun);
      check(['zenta', 'lia', 'ria'].every(id => trioEnergy(id) === 45) && game.cardRun.zenta.energyRestores.length === 3, 'warm-water effect makes the performance a net five energy cost');
      check(game.cardRun.trioReport.includes('温水效应'), 'energy recovery is visible in the result report');
      state.cards.team = ['zenta']; game.cardRun = captureCardRun(() => .99);
      check(zentaScoreBonus(1000) === 0, 'ZENTA never grants the score bonus to herself alone');
      state.cards.team = ['zenta', 'lia']; game.cardRun = null; game.status = 'idle'; renderRhythmTeam();
      const teamText = document.getElementById('rhythmTeam').textContent;
      check(teamText.includes('队友得分 +12%') && teamText.includes('Lia +10') && teamText.includes('全队精力 +5'), 'team panel displays all support effects');

      state.cards.selected = 'zenta'; applyBondValue('zenta', 6); renderGlobal(); goCard('zenta'); CardUI.tab = 'bond'; renderCardPage();
      const dialogueText = document.querySelector('.bond-dialogue-panel')?.textContent || '';
      check(dialogueText.includes('开始对话') && !dialogueText.includes('如果你能看见我'), 'responses stay behind dialogue button');
      document.querySelector('[data-card-bond-dialogue="zenta"]').click();
      check(document.getElementById('modalContent').textContent.includes('帮你和了声') && cardBond('zenta') === 7, 'exactly six uses middle response and grants daily companionship');
      closeModal();
      document.querySelector('[data-card-bond-dialogue="zenta"]').click();
      check(document.getElementById('modalContent').textContent.includes('如果你能看见我') && cardBond('zenta') === 7, 'greater-than-six uses highest response without duplicate gain');
      closeModal();
      CardUI.tab = 'detail'; renderCardPage();
      check(document.querySelectorAll('.skill-item').length >= 3 && !document.querySelector('[data-card-skill="zenta"]'), 'all support skills render without a prepare button');

      const load = src => new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve([image.naturalWidth, image.naturalHeight]); image.onerror = reject; image.src = src; });
      return { keys: [card.asset, card.coverAsset, card.avatarAsset], full: await load(cardImage(card, 'full')), cover: await load(cardImage(card, 'cover')), avatar: await load(cardImage(card, 'avatar')), thumbnail: cardThumbnail(card, 'avatar'), overflow: document.documentElement.scrollWidth > innerWidth };
    });
    assert.deepEqual(result.keys, ['cardZenta', 'cardZentaCover', 'cardZentaAvatar']);
    assert.deepEqual(result.full, [1086, 1448]); assert.deepEqual(result.cover, [1536, 1024]); assert.deepEqual(result.avatar, [1254, 1254]);
    assert.match(result.thumbnail, /thumbs\/avatars\/192\/zenta\.webp\?v=zenta20261012$/);
    assert.equal(result.overflow, false); assert.deepEqual(errors, []);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { CardUI.tab = 'detail'; goCard('zenta'); document.getElementById('musicWelcome').hidden = true; });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    console.log('PASS: ZENTA card, v14 migration, teammate score, violin pitch cap, team energy recovery, strict bond dialogue and three image usages.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
