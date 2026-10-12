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
      const card = cardDef('zouzou');
      check(card?.rarity === 'SSR' && card.stars === 5 && cardStarCount(card) === 5 && card.role === '大号（Tuba）' && card.group === '管乐', 'SSR card is five stars and grouped as brass');
      check(card.stats.map(row => row[1]).join(',') === '99,95,90,88', 'level one stats');
      check(card.autoSkill && card.activeName === 'TUBA' && card.passiveName === '博士的从容' && card.extraSkills.map(skill => skill.name).join(',') === '神隐,低音共振', 'all four skills configured');
      check(cardBondDialogue(card, 0) === null && cardBondDialogue(card, 1)?.[0] === 0 && cardBondDialogue(card, 4)?.[0] === 3 && cardBondDialogue(card, 7)?.[0] === 6, 'strict greater-than bond dialogue tiers');
      const ramen = cardGifts(card).find(gift => gift[0] === 'japanese_ramen');
      check(ramen[3] === 50 && ramen[4] === 10, 'exclusive ramen follows unified top gift tier');

      state.coins = 100;
      const unlocked = purchaseCardUnlock('zouzou');
      check(unlocked.ok && state.coins === 50 && cardOwned('zouzou') && cardBond('zouzou') === 3, 'notes unlock is atomic');
      const legacy = persistedState(); legacy.bondVault.v = 13; delete legacy.bondVault.values.zouzou; delete legacy.cards.collection.zouzou;
      const migrated = cleanImportedState(legacy); state = migrated;
      check(migrated.affinity.zouzou === 0 && migrated.cards.collection.zouzou && persistedState().bondVault.v === 16, 'v13 migration adds ZouZou fields');
      const broken = persistedState(); delete broken.bondVault.values.zouzou;
      let rejected = false; try { cleanImportedState(broken); } catch { rejected = true; }
      check(rejected, 'current save missing ZouZou is rejected');

      state = freshState(); state.sound = false; own('zouzou'); own('fuge'); own('lala'); own('lia');
      state.cards.team = ['fuge'];
      const lineup = zouzouPerformanceLineup();
      check(lineup.autoJoined && lineup.ids.join(',') === 'fuge,zouzou', 'performance day auto-joins ZouZou into an open slot');
      game.cardRun = captureCardRun(() => .99, lineup.ids, { zouzouAutoJoined: lineup.autoJoined });
      Object.assign(game, { status: 'running', elapsed: 10, score: 0 });
      check(game.cardRun.zouzou.energy === 50 && game.cardRun.zouzou.statBoost === 15 && cardDisplayStat(card, '音准') === 114, 'Doctor calm and Hidden entry start with energy and stat boost');
      for (let i = 0; i < 5; i++) onZouzouJudgement('PERFECT');
      check(game.cardRun.zouzou.energy === 100 && activateZouzouTuba(10), 'five perfects fill and activate TUBA');
      check(game.cardRun.zouzou.activeUntil === 25 && game.cardRun.zouzou.cooldownUntil === 130 && zouzouTubaActive(24.99), 'cello resonance extends TUBA to fifteen seconds');
      check(zouzouScoreBonus(1000, 11) === 400 && game.cardRun.zouzou.bonusScore === 400, 'active TUBA adds forty percent score');
      game.cardRun.zouzou.energy = 100;
      check(!activateZouzouTuba(30) && game.cardRun.zouzou.energy === 100, 'cooldown blocks reactivation without consuming energy');
      state.cards.team = ['fuge', 'lala', 'lia'];
      check(!zouzouPerformanceLineup().autoJoined && !zouzouPerformanceLineup().ids.includes('zouzou'), 'full lineup is never displaced');
      state.cards.team = ['fuge']; game.status = 'idle'; game.cardRun = null; toggleTeam('zouzou');
      check(!state.cards.team.includes('zouzou'), 'Hidden trait keeps ZouZou out of the permanent lineup');
      renderRhythmTeam();
      check(document.getElementById('rhythmTeam').textContent.includes('演出日待命'), 'rhythm panel explains the pending auto-join');

      state.cards.selected = 'zouzou'; applyBondValue('zouzou', 6); renderGlobal(); goCard('zouzou'); CardUI.tab = 'bond'; renderCardPage();
      const dialogueText = document.querySelector('.bond-dialogue-panel')?.textContent || '';
      check(dialogueText.includes('开始对话') && !dialogueText.includes('其实是想离她近一点'), 'responses stay behind dialogue button');
      document.querySelector('[data-card-bond-dialogue="zouzou"]').click();
      check(document.getElementById('modalContent').textContent.includes('有没有好吃的拉面店') && cardBond('zouzou') === 7, 'exactly six uses middle response and grants daily companionship');
      closeModal();
      document.querySelector('[data-card-bond-dialogue="zouzou"]').click();
      check(document.getElementById('modalContent').textContent.includes('其实是想离她近一点') && cardBond('zouzou') === 7, 'greater-than-six uses highest response without duplicate gain');
      closeModal();
      CardUI.tab = 'detail'; renderCardPage();
      check(document.querySelectorAll('.skill-item').length >= 4 && !document.querySelector('[data-card-skill="zouzou"]'), 'all automatic and runtime skills render without a prepare button');

      const load = src => new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve([image.naturalWidth, image.naturalHeight]); image.onerror = reject; image.src = src; });
      return { keys: [card.asset, card.coverAsset, card.avatarAsset], full: await load(cardImage(card, 'full')), cover: await load(cardImage(card, 'cover')), avatar: await load(cardImage(card, 'avatar')), thumbnail: cardThumbnail(card, 'avatar'), overflow: document.documentElement.scrollWidth > innerWidth };
    });
    assert.deepEqual(result.keys, ['cardZouzou', 'cardZouzouCover', 'cardZouzouAvatar']);
    assert.deepEqual(result.full, [1086, 1448]); assert.deepEqual(result.cover, [1536, 1024]); assert.deepEqual(result.avatar, [1254, 1254]);
    assert.match(result.thumbnail, /thumbs\/avatars\/192\/zouzou\.webp\?v=zouzou20261012$/);
    assert.equal(result.overflow, false); assert.deepEqual(errors, []);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { CardUI.tab = 'detail'; goCard('zouzou'); document.getElementById('musicWelcome').hidden = true; });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    console.log('PASS: ZouZou card, v13 migration, performance auto-join, TUBA energy/cooldown, cello resonance, strict bond dialogue and three image usages.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
