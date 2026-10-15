const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const url = pathToFileURL(path.resolve(__dirname, '../index.html')).href + '#care';
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/pet-single-v16.json'), 'utf8'));
assert.equal(fixture.bondVault.v, 16);
assert.equal(fixture.petHouse, undefined, 'Real predecessor fixture has only one cat');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
  const errors = [];
  async function open(raw, backup) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    page.on('pageerror', e => errors.push(e.message));
    if (raw) await page.addInitScript(({ raw, backup }) => {
      if (!localStorage.getItem('love_hakimi_cards_save_v62')) {
        localStorage.setItem('love_hakimi_cards_save_v62', raw);
        if (backup) localStorage.setItem('love_hakimi_cards_save_v62_backup', backup);
      }
    }, { raw: typeof raw === 'string' ? raw : JSON.stringify(raw), backup: backup && JSON.stringify(backup) });
    await page.goto(url);
    await page.locator('[data-music-enter-muted]').click();
    return page;
  }
  try {
    const page = await open(fixture);
    const migrated = await page.evaluate(() => ({ cat: state.cat, catName: state.catName, coins: state.coins, memories: state.memories, house: state.petHouse, ledger: state.bondProgress.daily.counts, encoded: persistedState() }));
    assert.deepEqual(migrated.cat, { aff: 42, hunger: 33, mood: 64, energy: 19, pets: 12 });
    assert.equal(migrated.catName, '旧档团宠'); assert.equal(migrated.coins, 77);
    assert.deepEqual(migrated.memories, fixture.memories);
    assert.equal(migrated.house.version, 1); assert.equal(migrated.house.selected, 'orange');
    assert.equal(migrated.house.cats.white.aff, 0); assert.equal(migrated.house.cats.singer.aff, 0);
    assert.equal(migrated.encoded.bondVault.v, 16, 'Existing character vault remains unchanged');
    assert.equal(migrated.encoded.petBondVault.v, 1);
    assert.equal(migrated.encoded.petHouse.cats.white.aff, undefined, 'New bonds are protected, not plain text');
    assert(migrated.encoded.petBondVault.values.white && migrated.encoded.petBondVault.values.singer);
    await page.evaluate(raw => {
      raw.bondProgress.daily.date = dateKey();
      const upgraded = cleanImportedState(raw), counts = upgraded.bondProgress.daily.counts;
      if (counts['catGift:cat'] !== 3 || counts['companion:cat'] !== 1 || counts['catGift:catwhite'] || counts['companion:catsinger']) throw Error('Migration must preserve only the original cat quota');
    }, structuredClone(fixture));
    await page.evaluate(() => {
      const first = JSON.stringify(state);
      state = cleanImportedState(persistedState());
      if (JSON.stringify(state) !== first) throw Error('Three-cat migration must be idempotent');
    });
    await page.reload(); await page.locator('[data-music-enter-muted]').click();
    assert.equal(await page.evaluate(() => state.cat.aff), 42, 'Real refresh retains legacy growth');

    const checks = await page.evaluate(() => {
      closeModal(false); state = freshState(); state.sound = false; state.coins = 200; save();
      const out = [], check = (label, ok) => { if (!ok) throw Error(label); out.push(label); };
      const act = action => { lastPetAction = -1000; care(action); };
      const choose = id => { if (!selectPet(id)) throw Error('Select failed ' + id); renderPet(); };
      for (const id of ['orange', 'white', 'singer']) petStats(id).hunger = 0;
      choose('orange'); act('feed'); act('pet'); act('play');
      check('Orange alone receives its feeding and companionship', state.cat.aff === 2 && petStats('white').aff === 0 && petStats('singer').aff === 0);
      choose('white'); const orange = JSON.stringify(state.cat);
      for (let i = 0; i < 6; i++) act('feed'); act('pet'); act('play');
      check('White independently receives five gifts and one companion point', petStats().aff === 6 && state.bondProgress.daily.counts['catGift:catwhite'] === 5 && state.bondProgress.daily.counts['companion:catwhite'] === 1);
      check('White care leaves orange untouched', JSON.stringify(state.cat) === orange);
      choose('singer'); act('feed'); act('pet');
      check('Singer has separate feeding and companionship', petStats().aff === 2 && state.bondProgress.daily.counts['catGift:catsinger'] === 1 && state.bondProgress.daily.counts['companion:catsinger'] === 1);
      check('All cats share the same wallet', state.coins === 165);
      check('Each cat earns only its own first-pet memory', ['purr', 'pet_white_purr', 'pet_singer_purr'].every(id => state.memories.includes(id)));
      for (const [id, name] of [['orange', '橘子'], ['white', '糯米'], ['singer', '麦麦']]) { choose(id); check('Rename ' + id, renameSelectedPet(name)); renderPet(); }
      check('Three names are independent', state.catName === '橘子' && petName('white') === '糯米' && petName('singer') === '麦麦');
      check('Home and detail show the selected singer', $('view-home').querySelector('.cat-touch img').src.includes('hakimi-music-trio') && $('view-care').querySelector('.pet-name').textContent === '麦麦');
      petStats().energy = 0; petRestTimes.singer = 0; act('rest'); act('rest');
      check('Singer rest cooldown is local to singer', petStats().energy === 25);
      choose('white'); petStats().energy = 0; petRestTimes.white = 0; act('rest');
      check('White can rest while singer cools down', petStats().energy === 25 && petStats('singer').energy === 25);
      petStats().aff = 59; act('pet'); check('Repeated daily companionship does not award 60', petStats().aff === 59);
      grantBond('catwhite', 1); act('rest'); // Already cooling down; no collectible should be guessed.
      check('Only reached interaction awards trust', !state.memories.includes('pet_white_trust'));
      petRestTimes.white = 0; act('rest');
      check('White trust does not unlock other cats trust', state.memories.includes('pet_white_trust') && !state.memories.includes('trust') && !state.memories.includes('pet_singer_trust'));
      $('takePhoto').click(); closeModal(false);
      check('White photo is independently collected', state.memories.includes('pet_white_photo') && !state.memories.includes('photo') && !state.memories.includes('pet_singer_photo'));
      const invalid = JSON.stringify(state); check('Unknown pet is rejected', !selectPet('unknown') && !selectPet('constructor') && JSON.stringify(state) === invalid);
      choose('singer'); petStats().hunger = 0; state.coins = 4; const singer = JSON.stringify(petStats()); act('feed');
      check('Singer cannot feed without enough currency', state.coins === 4 && JSON.stringify(petStats()) === singer);
      state.coins = 20; petStats().aff = 99; act('feed'); petStats().hunger = 0; act('feed');
      check('Each cat bond caps at 100', petStats().aff === 100);
      petStats().aff = 140; petStats().hunger = 0; act('feed'); check('Historic higher bond is preserved', petStats().aff === 140);
      save(); const raw = localStorage.getItem(KEY), before = JSON.stringify(state), native = Storage.prototype.setItem;
      Storage.prototype.setItem = function(k, v) { if (k === KEY) throw Error('Injected failure'); return native.call(this, k, v); };
      try { petStats().hunger = 0; const ready = JSON.stringify(state); act('feed'); check('New cat failed feeding rolls back all data', JSON.stringify(state) === ready); } finally { Storage.prototype.setItem = native; }
      check('Failed new cat save keeps prior readable save', localStorage.getItem(KEY) === raw);
      storageOK = true; state = cleanImportedState(JSON.parse(raw));
      Storage.prototype.setItem = function(k, v) { if (k === KEY) throw Error('Injected selection failure'); return native.call(this, k, v); };
      try { check('Failed selection rolls back selected identity', !selectPet('white') && selectedPetDef().id === 'singer'); } finally { Storage.prototype.setItem = native; }
      storageOK = true;
      Storage.prototype.setItem = function(k, v) { if (k === KEY) throw Error('Injected name failure'); return native.call(this, k, v); };
      try { check('Failed rename rolls back only target name', !renameSelectedPet('未保存') && petName() === '麦麦'); } finally { Storage.prototype.setItem = native; }
      storageOK = true; save(); renderGlobal(); return out;
    });
    const expected = await page.evaluate(() => ({ house: state.petHouse, cat: state.cat, catName: state.catName, ledger: state.bondProgress.daily.counts, memories: state.memories, coins: state.coins }));
    await page.reload(); await page.locator('[data-music-enter-muted]').click();
    assert.deepEqual(await page.evaluate(() => ({ house: state.petHouse, cat: state.cat, catName: state.catName, ledger: state.bondProgress.daily.counts, memories: state.memories, coins: state.coins })), expected, 'Actual refresh preserves all three identities, states, quotas and collectibles');
    assert.equal(await page.evaluate(() => selectedPetDef().id), 'singer');
    // Missing newly added non-protected stats initialize only that cat's stats.
    const partial = await page.evaluate(() => { const raw = persistedState(); delete raw.petHouse.cats.white; return raw; });
    const restored = await page.evaluate(raw => cleanImportedState(raw), partial);
    assert.equal(restored.petHouse.cats.white.aff, expected.house.cats.white.aff, 'Protected growth survives missing new metadata');
    assert.deepEqual(restored.cat, expected.cat); assert.deepEqual(restored.petHouse.cats.singer, expected.house.cats.singer);
    const valid = await page.evaluate(() => persistedState());
    const corrupt = structuredClone(valid); corrupt.petBondVault.values.white = corrupt.petBondVault.values.singer;
    const recovered = await open(corrupt, valid);
    assert.equal(await recovered.evaluate(() => storageRecovered || storageLoadError.includes('恢复')), true);
    assert.deepEqual(await recovered.evaluate(() => state.petHouse), expected.house, 'Backup recovery restores all three cats');
    const blocked = await open(corrupt);
    assert.equal(await blocked.evaluate(() => storageOK), false);
    assert.equal(await blocked.evaluate(() => localStorage.getItem(KEY)), JSON.stringify(corrupt), 'Corrupt current data must never be overwritten on startup');
    assert.equal(await blocked.evaluate(() => localStorage.getItem(RECOVERY_KEY)), JSON.stringify(corrupt));
    const missingVault = structuredClone(valid); delete missingVault.petBondVault;
    await assert.rejects(() => page.evaluate(raw => cleanImportedState(raw), missingVault), /猫咪羁绊数据缺失/);
    await page.evaluate(() => { showSettings(); $('resetSave').click(); $('confirmReset').click(); });
    assert.deepEqual(await page.evaluate(() => PET_DEFS.map(p => petStats(p.id).aff)), [0, 0, 0], 'Explicit reset resets all three cats');
    await page.evaluate(async raw => { await importSave(new File([JSON.stringify(raw)], 'three-cats.json', { type: 'application/json' })); $('confirmImport').click(); }, valid);
    assert.deepEqual(await page.evaluate(() => state.petHouse), expected.house, 'Actual import restores all three pets');
    assert.deepEqual(errors, []);
    console.log('PASS: ' + checks.length + ' independent-cat checks, real v16 migration/idempotence, names/states/quotas/memories, protected save/import/reload, missing metadata, save rollback, backup recovery and corrupt startup protection.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
