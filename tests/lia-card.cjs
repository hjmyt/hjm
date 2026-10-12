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
      const card = cardDef('lia');
      check(card?.rarity === 'SR' && card.stars === 4 && cardStarCount(card) === 4 && card.role === '第一小提琴', 'SR card is four stars');
      check(card.stats.map(row => row[1]).join(',') === '82,78,68,76', 'level one stats');
      check(card.traits.includes('二次元') && card.traits.includes('波尔卡前成员') && cardDef('lala').traits.includes('波尔卡前成员') && cardDef('shiyuan').traits.includes('波尔卡前成员'), 'team traits configured');
      check(card.autoSkill && card.activeName === '天然呆' && card.passiveName === '波尔卡之魂' && card.extraSkills?.[0]?.name === '姐妹情深', 'three automatic skills configured');
      check(cardBondDialogue(card, 0) === null && cardBondDialogue(card, 1)?.[0] === 0 && cardBondDialogue(card, 4)?.[0] === 3 && cardBondDialogue(card, 7)?.[0] === 6, 'strict greater-than bond dialogue tiers');
      const blindbox = cardGifts(card).find(gift => gift[0] === 'anime_badge_blindbox');
      check(blindbox[3] === 50 && blindbox[4] === 10, 'exclusive blind box follows unified top gift tier');

      state.coins = 100;
      const unlocked = purchaseCardUnlock('lia');
      check(unlocked.ok && state.coins === 50 && cardOwned('lia') && cardBond('lia') === 3, 'notes unlock is atomic');
      const legacy = persistedState(); legacy.bondVault.v = 12; delete legacy.bondVault.values.lia; delete legacy.cards.collection.lia;
      const migrated = cleanImportedState(legacy); state = migrated;
      check(migrated.affinity.lia === 0 && migrated.cards.collection.lia && persistedState().bondVault.v === 16, 'v12 migration adds Lia fields');
      const broken = persistedState(); delete broken.bondVault.values.lia;
      let rejected = false; try { cleanImportedState(broken); } catch { rejected = true; }
      check(rejected, 'current save missing Lia is rejected');

      state = freshState(); state.sound = false; for (const id of ['lia', 'lala', 'shiyuan', 'jiukuangkuang', 'fuge']) own(id);
      state.cards.team = ['lia', 'lala', 'jiukuangkuang'];
      trio().energy.lia = 20; trio().energy.lala = 30;
      game.cardRun = captureCardRun(() => .19);
      check(game.cardRun.lia.polkaEnergy.map(item => item.id).join(',') === 'lia,lala', 'Polka members receive opening energy');
      check(game.cardRun.lia.sisterTechnique.map(item => item.id).join(',') === 'lala,jiukuangkuang' && game.cardRun.lia.voice?.line.includes('老大'), 'female teammates receive technique and voice roll');
      check(jiukuangkuangRhythmBoosts().map(item => item.id).join(',') === 'jiukuangkuang,lia', 'anime trait integrates with existing rhythm link');
      applyLiaOpeningEnergy(); applyLiaOpeningEnergy();
      check(trioEnergy('lia') === 45 && trioEnergy('lala') === 55, 'opening energy applies once and respects existing energy system');
      check(liaVoiceEasterEgg(['lia', 'lala'], () => .2) === null && liaSisterTechniqueBoosts(['lia', 'fuge']).length === 0, 'voice boundary and male teammate exclusion');

      Object.assign(game, { good: 0, nice: 0, perfect: 0, score: 0, combo: 0, maxCombo: 0, miss: 0, elapsed: 1 });
      for (let lane = 0; lane < 4; lane++) settleLateNote({ lane }, performance.now());
      check(game.good === 3 && game.miss === 1 && game.cardRun.lia.rescues === 3, 'first three misses become GOOD and fourth remains MISS');

      state.cards.team = ['lia', 'shiyuan']; game.cardRun = captureCardRun(() => .19); renderRhythmTeam();
      const teamText = document.getElementById('rhythmTeam').textContent;
      check(teamText.includes('天然呆 0/3') && teamText.includes('波尔卡精力') && teamText.includes('十元 +5'), 'team panel displays all Lia links');

      state.cards.selected = 'lia'; applyBondValue('lia', 6); renderGlobal(); goCard('lia'); CardUI.tab = 'bond'; renderCardPage();
      const dialogueText = document.querySelector('.bond-dialogue-panel')?.textContent || '';
      check(dialogueText.includes('开始对话') && !dialogueText.includes('她们以为我是女生') && !dialogueText.includes('从来不撒谎'), 'responses stay behind dialogue button');
      document.querySelector('[data-card-bond-dialogue="lia"]').click();
      check($('modalContent').textContent.includes('她们以为我是女生') && cardBond('lia') === 7, 'exactly six uses middle response and grants daily companionship');
      closeModal();
      document.querySelector('[data-card-bond-dialogue="lia"]').click();
      check($('modalContent').textContent.includes('从来不撒谎') && cardBond('lia') === 7, 'greater-than-six uses highest response without duplicate gain');
      closeModal();
      CardUI.tab = 'detail'; renderCardPage();
      check(document.querySelectorAll('.skill-item').length >= 3 && !document.querySelector('[data-card-skill="lia"]'), 'all automatic skills render without prepare button');

      const load = src => new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve([image.naturalWidth, image.naturalHeight]); image.onerror = reject; image.src = src; });
      return { keys: [card.asset, card.coverAsset, card.avatarAsset], full: await load(cardImage(card, 'full')), cover: await load(cardImage(card, 'cover')), avatar: await load(cardImage(card, 'avatar')), thumbnail: cardThumbnail(card, 'avatar'), overflow: document.documentElement.scrollWidth > innerWidth };
    });
    assert.deepEqual(result.keys, ['cardLia', 'cardLiaCover', 'cardLiaAvatar']);
    assert.deepEqual(result.full, [1087, 1447]); assert.deepEqual(result.cover, [1536, 1024]); assert.deepEqual(result.avatar, [1254, 1254]);
    assert.match(result.thumbnail, /thumbs\/avatars\/192\/lia\.webp\?v=lia20261012$/);
    assert.equal(result.overflow, false); assert.deepEqual(errors, []);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { CardUI.tab = 'detail'; goCard('lia'); document.getElementById('musicWelcome').hidden = true; });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    console.log('PASS: Lia card, v12 migration, three natural rescues, Polka energy, sister technique/voice links, strict bond dialogue and three image usages.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
