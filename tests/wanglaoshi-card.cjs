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
      const card = cardDef('wanglaoshi');
      check(card?.rarity === 'R' && card.stars === 4 && card.role === '小提琴（导师）', 'R four-star teacher identity');
      check(card.stats.map(row => row[1]).join(',') === '80,78,72,74', 'level one stats');
      check(card.activeName === '奶爸的耐心' && card.passiveName === '稳定输出' && card.extraSkills?.[0]?.name === '接孩子要走了', 'three skills');
      const juice = cardGifts(card).find(gift => gift[0] === 'kids_juice');
      check(juice[3] === 50 && juice[4] === 10, 'juice follows unified top gift tier');
      check(!isWangTeacherLate(new Date('2026-10-09T19:59:00')) && isWangTeacherLate(new Date('2026-10-09T20:00:00')), 'late penalty begins at eight');
      check(wangTeacherStableScore(1000, -1) === 975 && wangTeacherStableScore(1000, 1) === 1025, 'stable score stays within five percent span');

      state.coins = 100;
      const unlocked = purchaseCardUnlock('wanglaoshi');
      check(unlocked.ok && state.coins === 50 && cardOwned('wanglaoshi') && cardBond('wanglaoshi') === 3, 'notes unlock is atomic');
      const legacy = persistedState(); legacy.bondVault.v = 7; delete legacy.bondVault.values.wanglaoshi; delete legacy.cards.collection.wanglaoshi;
      const migrated = cleanImportedState(legacy);
      check(migrated.affinity.wanglaoshi === 0 && migrated.cards.collection.wanglaoshi && persistedState().bondVault.v === 9, 'v7 migration adds Wang fields');

      state = freshState();
      for (const id of ['wanglaoshi', 'mobius', 'ria']) { state.cards.encounters.push(id); state.cards.collection[id].owned = true; }
      state.cards.team = ['wanglaoshi', 'mobius', 'ria'];
      game.cardRun = captureCardRun();
      const boosts = Object.fromEntries(game.cardRun.wanglaoshi.pitchBoosts.map(item => [item.id, item]));
      check(boosts.mobius.before === 68 && boosts.mobius.after === 83 && boosts.ria.before === 65 && boosts.ria.after === 70, 'mentor boosts low pitch and respects RIA cap');
      renderGlobal(); goCard('wanglaoshi');
      const text = document.getElementById('view-card').textContent;
      check(text.includes('奶爸的耐心') && text.includes('稳定输出') && text.includes('接孩子要走了') && !document.querySelector('[data-card-skill="wanglaoshi"]'), 'automatic skills render');
      applyBondValue('wanglaoshi', 7); CardUI.tab = 'bond'; renderCardPage();
      check(!document.querySelector('.bond-dialogue-panel').textContent.includes('我女儿今天问我'), 'bond response is not exposed inline');
      document.querySelector('[data-card-bond-dialogue="wanglaoshi"]').click();
      check($('modalContent').textContent.includes('我女儿今天问我'), 'greater-than-six opens Wang highest response');
      closeModal();

      const load = src => new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve([image.naturalWidth, image.naturalHeight]); image.onerror = reject; image.src = src; });
      return { keys: [card.asset, card.coverAsset, card.avatarAsset], full: await load(cardImage(card, 'full')), cover: await load(cardImage(card, 'cover')), avatar: await load(cardImage(card, 'avatar')), thumbnail: cardThumbnail(card, 'avatar'), overflow: document.documentElement.scrollWidth > innerWidth };
    });
    assert.deepEqual(result.keys, ['cardWanglaoshi', 'cardWanglaoshiCover', 'cardWanglaoshiAvatar']);
    assert.deepEqual(result.full, [1024, 1536]); assert.deepEqual(result.cover, [1536, 1024]); assert.deepEqual(result.avatar, [1254, 1254]);
    assert.match(result.thumbnail, /thumbs\/avatars\/192\/wanglaoshi\.webp\?v=wanglaoshi20261009$/);
    assert.equal(result.overflow, false); assert.deepEqual(errors, []);
    console.log('PASS: 汪老师 card, v7 migration, four stars, mentor boost/cap, stable range, late rule, strict bond dialogue button, unified gift and three image usages.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
