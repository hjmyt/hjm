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
      const card = cardDef('jinsang');
      check(card?.rarity === 'NR' && card.stars === 2 && cardStarCount(card) === 2 && card.role === '小号', 'NR card follows existing two-star mapping');
      check(compareCollection({ id: 'n-test', rarity: 'N' }, card, 'rarity') < 0, 'NR sorts below the ordinary N tier');
      check(card.eventLimited && card.eventName === '破音也要吹下去' && card.stats.map(row => row[1]).join(',') === '60,65,75,60', 'limited profile and level-one stats');
      check(card.activeName === '引人注目' && card.passiveName === '孜孜不倦' && card.extraSkills?.[0]?.name === '空格分格', 'three skills configured');
      check(cardBondDialogue(card, 0) === null && cardBondDialogue(card, 1)?.[0] === 0 && cardBondDialogue(card, 4)?.[0] === 3 && cardBondDialogue(card, 7)?.[0] === 6, 'strict greater-than bond dialogue tiers');
      const mint = cardGifts(card).find(gift => gift[0] === 'mint_candy');
      check(mint[3] === 50 && mint[4] === 10, 'exclusive mint follows unified top gift tier');

      state.coins = 100;
      const unlocked = purchaseCardUnlock('jinsang');
      check(unlocked.ok && state.coins === 50 && cardOwned('jinsang') && cardBond('jinsang') === 3, 'formal limited card follows universal notes unlock rule atomically');
      const legacy = persistedState(); legacy.bondVault.v = 15; delete legacy.bondVault.values.jinsang; delete legacy.cards.collection.jinsang; delete legacy.cards.jinsang;
      const migrated = cleanImportedState(legacy); state = migrated;
      check(migrated.affinity.jinsang === 0 && migrated.cards.collection.jinsang && migrated.cards.jinsang.highlightBonus === 0 && persistedState().bondVault.v === 16, 'v15 migration adds Jinsang fields');
      const broken = persistedState(); delete broken.bondVault.values.jinsang;
      let rejected = false; try { cleanImportedState(broken); } catch { rejected = true; }
      check(rejected, 'current save missing Jinsang is rejected');

      state = freshState(); state.sound = false; for (const id of ['jinsang', 'kongge']) own(id);
      state.cards.team = ['jinsang'];
      game.cardRun = captureCardRun(() => .1);
      check(game.cardRun.jinsang.event === 'crash' && state.cards.jinsang.highlightBonus === 5 && game.cardRun.jinsang.nextHighlightChance === .25, 'crash raises next-song highlight chance');
      check(jinsangScoreBonus(1000) === -150 && game.cardRun.jinsang.bonusScore === -150, 'crash subtracts fifteen percent');
      state.cards.jinsang.highlightBonus = 30;
      game.cardRun = captureCardRun(() => .65);
      check(game.cardRun.jinsang.event === 'highlight' && game.cardRun.jinsang.highlightChance === .5 && jinsangScoreBonus(1000) === 600, 'highlight chance caps at fifty percent and grants sixty percent score');
      state.cards.team = ['jinsang', 'kongge'];
      const rolls = [.25, .1]; game.cardRun = captureCardRun(() => rolls.shift());
      check(game.cardRun.jinsang.simultaneousHighlight && jinsangScoreBonus(1000) === 1550, 'Kongge pairing combines -5%, +60% highlight and +100% dual highlight');
      state.cards.jinsang.highlightBonus = 0; game.cardRun = null; game.status = 'idle'; renderRhythmTeam();
      check(document.getElementById('rhythmTeam').textContent.includes('金桑 · 开场待判定 · 高光 20%') && document.getElementById('rhythmTeam').textContent.includes('空格分格 -5%'), 'team panel previews opening odds and pairing penalty');

      state.cards.selected = 'jinsang'; applyBondValue('jinsang', 6); renderGlobal(); goCard('jinsang'); CardUI.tab = 'bond'; renderCardPage();
      const dialogueText = document.querySelector('.bond-dialogue-panel')?.textContent || '';
      check(dialogueText.includes('开始对话') && !dialogueText.includes('真是亲兄弟'), 'responses stay behind dialogue button');
      document.querySelector('[data-card-bond-dialogue="jinsang"]').click();
      check(document.getElementById('modalContent').textContent.includes('全场都听见了') && cardBond('jinsang') === 7, 'exactly six uses middle response and grants daily companionship');
      closeModal();
      document.querySelector('[data-card-bond-dialogue="jinsang"]').click();
      check(document.getElementById('modalContent').textContent.includes('真是亲兄弟') && cardBond('jinsang') === 7, 'greater-than-six uses highest response without duplicate gain');
      closeModal();

      const load = src => new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve([image.naturalWidth, image.naturalHeight]); image.onerror = reject; image.src = src; });
      return { keys: [card.asset, card.coverAsset, card.avatarAsset], full: await load(cardImage(card, 'full')), cover: await load(cardImage(card, 'cover')), avatar: await load(cardImage(card, 'avatar')), thumbnail: cardThumbnail(card, 'avatar'), overflow: document.documentElement.scrollWidth > innerWidth };
    });
    assert.deepEqual(result.keys, ['cardJinsang', 'cardJinsangCover', 'cardJinsangAvatar']);
    assert.deepEqual(result.full, [1086, 1448]); assert.deepEqual(result.cover, [1536, 1024]); assert.deepEqual(result.avatar, [1254, 1254]);
    assert.match(result.thumbnail, /thumbs\/avatars\/192\/jinsang\.webp\?v=jinsang20261012$/);
    assert.equal(result.overflow, false); assert.deepEqual(errors, []);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { CardUI.tab = 'detail'; goCard('jinsang'); document.getElementById('musicWelcome').hidden = true; });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    console.log('PASS: Jinsang card, v15 migration, crash/highlight persistence, Kongge dual highlight, strict bond dialogue and three image usages.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
