const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
    const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
    try {
        const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
        const checks = await page.evaluate(() => {
            const checks = [], check = (name, ok) => { if (!ok) throw Error(name); checks.push(name); };
            state = freshState(); state.sound = false; state.cards.encounters = CARD_DEFS.map(c => c.id); save();
            for (const c of CARD_DEFS.filter(c => !c.placeholder)) {
                state.coins = 199; state.affinity[c.id] = 14; state.cards.daily.gifts[c.id] = 5;
                goCard(c.id);
                const special = document.querySelector('[data-card-gift="full_bond"]');
                check(c.id + ' full gift selectable after five normal gifts', special && !special.disabled);
                check(c.id + ' normal gifts stay disabled', [...document.querySelectorAll('[data-card-gift]:not([data-card-gift="full_bond"])')].every(b => b.disabled));
                chooseCardGift('full_bond');
                check(c.id + ' displays 200-note price', $('cardFeedBtn').textContent.includes('200') && $('cardGiftHint').textContent.includes('200 音符'));
                check(c.id + ' insufficient balance disables payment', $('cardFeedBtn').disabled && $('cardGiftHint').textContent.includes('音符不足'));
                feedCard();
                check(c.id + ' direct action cannot overspend', state.coins === 199 && cardBond(c.id) === 14 && state.cards.daily.gifts[c.id] === 5);
                const xp = state.cards.collection[c.id].xp, companion = JSON.stringify(state.bondProgress.daily);
                state.coins = 200; chooseCardGift('full_bond');
                check(c.id + ' payment enabled at daily cap', !$('cardFeedBtn').disabled);
                feedCard(); feedCard();
                check(c.id + ' exactly one charge and full bond', state.coins === 0 && cardBond(c.id) === 100);
                check(c.id + ' ordinary and companion quotas unchanged', state.cards.daily.gifts[c.id] === 5 && JSON.stringify(state.bondProgress.daily) === companion && state.cards.collection[c.id].xp === xp);
                check(c.id + ' full bond gift remains selectable with insufficient funds', $('cardFeedBtn').disabled && !document.querySelector('[data-card-gift="full_bond"]').disabled);
                state.coins = 600; chooseCardGift('full_bond');
                check(c.id + ' full bond allows repeat payment', !$('cardFeedBtn').disabled);
                feedCard(); feedCard();
                check(c.id + ' each repeat charges 200 without extra growth', state.coins === 200 && cardBond(c.id) === 100 && state.cards.daily.gifts[c.id] === 5 && state.cards.collection[c.id].xp === xp && JSON.stringify(state.bondProgress.daily) === companion);
            }
            check('Global bond object remains shared', state.affinity === state.chronicle.run.aff && state.affinity === state.chronicle.bonds);
            check('Crossing 35 unlocks bond eligibility', hiddenSkillReady('tim'));
            check('Additional hidden skill requirements remain', !hiddenSkillReady('kongge', 'clue'));
            check('No automatic bad ending', !sourceCast().lemon.ended && !state.chronicle.run.ending);
            state.affinity.lala = 140; state.coins = 200; goCard('lala'); CardUI.gift = 'full_bond'; feedCard();
            check('Historic values above 100 survive paid gifts', cardBond('lala') === 140 && state.coins === 0);
            state.affinity.shiyuan = 0; state.cards.daily.gifts.shiyuan = 0; state.coins = 205; goCard('shiyuan'); chooseCardGift('full_bond'); feedCard();
            check('Exact payment leaves ordinary quota available', state.coins === 5 && state.cards.daily.gifts.shiyuan === 0 && cardBond('shiyuan') === 100);
            CardUI.gift = effectiveGifts(cardDef('shiyuan'))[0][0]; feedCard();
            check('Ordinary feeding still spends 5 and uses quota', state.coins === 0 && state.cards.daily.gifts.shiyuan === 1);
            state.cards.encounters = state.cards.encounters.filter(id => id !== 'tim'); state.affinity.tim = 0; state.coins = 200; CardUI.detailId = 'tim'; CardUI.gift = 'full_bond'; feedCard();
            check('Unavailable character cannot receive special gift', state.coins === 200 && cardBond('tim') === 0);
            state.cards.encounters.push('tim'); save();
            return checks;
        });
        await page.reload();
        assert(await page.evaluate(() => state.coins === 200 && cardBond('shiyuan') === 100 && cardBond('lala') === 140 && state.chronicle.run.aff.shiyuan === 100 && state.cards.daily.gifts.shiyuan === 1), 'Real reload preserves payment, bond and quota');
        await page.locator('[data-music-enter-muted]').click();
        for (const width of [1440, 768, 390]) {
            await page.setViewportSize({ width, height: 1000 });
            for (const id of ['shiyuan', 'lala', 'tim', 'tang', 'baoshi']) {
                await page.evaluate(id => { state.affinity[id] = 100; state.coins = 200; goCard(id); }, id);
                await page.locator('[data-card-gift="full_bond"]').click();
                assert(await page.locator('#cardFeedBtn').isEnabled(), `${id} actual gift selection works at ${width}`);
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${id} layout fits ${width}`);
            }
        }
        await page.evaluate(() => { goCard('shiyuan'); chooseCardGift('full_bond'); document.querySelectorAll('.toast').forEach(e => e.remove()); });
        await page.locator('#cardFeeding').screenshot({ path: '/tmp/hjm-full-bond-gift-mobile.png' });
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.locator('#cardFeeding').screenshot({ path: '/tmp/hjm-full-bond-gift-desktop.png' });
        assert.deepEqual(errors, []);
        console.log(`PASS: ${checks.length} full-bond gift checks, actual reload and gift selection at three viewport sizes, no runtime errors.`);
    } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
