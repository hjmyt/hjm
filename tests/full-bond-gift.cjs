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
                state.coins = 9999; state.affinity[c.id] = 14; state.cards.daily.gifts[c.id] = 3;
                goCard(c.id);
                const special = document.querySelector('[data-card-gift="full_bond"]');
                check(c.id + ' full gift selectable after three normal gifts', special && !special.disabled);
                check(c.id + ' normal gifts stay disabled', [...document.querySelectorAll('[data-card-gift]:not([data-card-gift="full_bond"])')].every(b => b.disabled));
                chooseCardGift('full_bond');
                check(c.id + ' insufficient balance disables payment', $('cardFeedBtn').disabled && $('cardGiftHint').textContent.includes('音符不足'));
                feedCard();
                check(c.id + ' direct action cannot overspend', state.coins === 9999 && cardBond(c.id) === 14 && state.cards.daily.gifts[c.id] === 3);
                const xp = state.cards.collection[c.id].xp, companion = JSON.stringify(state.bondProgress.daily);
                state.coins = 20000; chooseCardGift('full_bond');
                check(c.id + ' payment enabled at daily cap', !$('cardFeedBtn').disabled);
                feedCard(); feedCard();
                check(c.id + ' exactly one charge and full bond', state.coins === 10000 && cardBond(c.id) === 100);
                check(c.id + ' ordinary and companion quotas unchanged', state.cards.daily.gifts[c.id] === 3 && JSON.stringify(state.bondProgress.daily) === companion && state.cards.collection[c.id].xp === xp);
                check(c.id + ' full bond disables repeat payment', $('cardFeedBtn').disabled && document.querySelector('[data-card-gift="full_bond"]').disabled);
            }
            check('Global bond object remains shared', state.affinity === state.chronicle.run.aff && state.affinity === state.chronicle.bonds);
            check('Crossing 35 unlocks bond eligibility', hiddenSkillReady('tim'));
            check('Additional hidden skill requirements remain', !hiddenSkillReady('kongge', 'clue'));
            check('No automatic bad ending', !sourceCast().lemon.ended && !state.chronicle.run.ending);
            state.affinity.lala = 140; state.coins = 20000; goCard('lala'); CardUI.gift = 'full_bond'; feedCard();
            check('Historic values above 100 are never reduced or charged', cardBond('lala') === 140 && state.coins === 20000);
            state.affinity.shiyuan = 0; state.cards.daily.gifts.shiyuan = 0; state.coins = 10010; goCard('shiyuan'); chooseCardGift('full_bond'); feedCard();
            check('Exact payment leaves ordinary quota available', state.coins === 10 && state.cards.daily.gifts.shiyuan === 0 && cardBond('shiyuan') === 100);
            CardUI.gift = effectiveGifts(cardDef('shiyuan'))[0][0]; feedCard();
            check('Ordinary feeding still spends 10 and uses quota', state.coins === 0 && state.cards.daily.gifts.shiyuan === 1);
            state.cards.encounters = state.cards.encounters.filter(id => id !== 'tim'); state.affinity.tim = 0; state.coins = 10000; CardUI.detailId = 'tim'; CardUI.gift = 'full_bond'; feedCard();
            check('Unavailable character cannot receive special gift', state.coins === 10000 && cardBond('tim') === 0);
            state.cards.encounters.push('tim'); save();
            return checks;
        });
        await page.reload();
        assert(await page.evaluate(() => state.coins === 10000 && cardBond('shiyuan') === 100 && cardBond('lala') === 140 && state.chronicle.run.aff.shiyuan === 100 && state.cards.daily.gifts.shiyuan === 1), 'Real reload preserves payment, bond and quota');
        for (const width of [1440, 768, 390]) {
            await page.setViewportSize({ width, height: 1000 });
            for (const id of ['shiyuan', 'lala', 'tim', 'tang', 'baoshi']) {
                await page.evaluate(id => { state.affinity[id] = 14; state.coins = 10000; goCard(id); }, id);
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
