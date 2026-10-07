const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');

(async () => {
    const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
    try {
        const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
        await page.locator('[data-music-enter-muted]').click();
        await page.evaluate(() => {
            const check = (value, message) => { if (!value) throw Error(message); };
            state = freshState(); state.cards.encounters = CARD_DEFS.map(card => card.id); state.sound = false; state.coins = 49; save();
            for (const card of CARD_DEFS) {
                const gift = effectiveGifts(card).filter(isQiqiTransformationGift);
                check(gift.length === (card.id === 'qiqi' && !card.placeholder ? 1 : 0), `${card.id} recipient restriction`);
                if (gift.length) check(gift[0][1] === '柒柒的华丽变装' && gift[0][3] === 50 && gift[0][4] === 10, 'gift offer values');
            }
            check(!purchaseQiqiTransformationGift('baoshi', QIQI_TRANSFORMATION_GIFT.id), 'wrong recipient refused');
            goCard('qiqi'); chooseCardGift(QIQI_TRANSFORMATION_GIFT.id);
            check($('cardFeedBtn').disabled, 'insufficient balance disables feed'); feedCard();
            check(state.coins === 49 && cardBond('qiqi') === 0 && !state.cards.daily.gifts.qiqi, 'insufficient balance has no effect');
            state.coins = 100; state.affinity.qiqi = 20; save();
            const saved = localStorage.getItem(KEY), native = Storage.prototype.setItem;
            Storage.prototype.setItem = function () { throw Error('simulated quota'); };
            storageOK = true; feedCard(); Storage.prototype.setItem = native;
            check(state.coins === 100 && cardBond('qiqi') === 20 && !state.cards.daily.gifts.qiqi, 'save error rolls transaction back');
            check(localStorage.getItem(KEY) === saved && !document.querySelector('.gift-performance'), 'failed transaction starts no effect');
            state.coins = 100; storageOK = true; feedCard(); GiftEffects.stop();
            check(state.coins === 50 && cardBond('qiqi') === 30 && state.cards.daily.gifts.qiqi === 1, '50 notes and +10 bond');
            check(state.cards.collection.qiqi.xp === 0, 'no experience reward');
            state.affinity.qiqi = 98; state.coins = 50; save(); feedCard(); GiftEffects.stop();
            check(cardBond('qiqi') === 100 && state.coins === 0 && state.cards.daily.gifts.qiqi === 2, 'bond cap and paid repeat');
            state.affinity.qiqi = 140; state.coins = 50; save(); feedCard(); GiftEffects.stop();
            check(cardBond('qiqi') === 140 && state.coins === 0, 'legacy over-cap bond retained');
            state.coins = 50; state.cards.daily.gifts.qiqi = BOND_RULES.giftsPerDay; save(); feedCard();
            check(state.coins === 50 && state.cards.daily.gifts.qiqi === 5, 'daily gift limit');
            state.cards.encounters = state.cards.encounters.filter(id => id !== 'qiqi'); state.cards.daily.gifts.qiqi = 0; save();
            check(!purchaseQiqiTransformationGift('qiqi', QIQI_TRANSFORMATION_GIFT.id), 'unowned recipient refused');
        });

        await page.setViewportSize({ width: 1280, height: 900 });
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.evaluate(() => {
            state = freshState(); state.cards.encounters = CARD_DEFS.map(card => card.id); state.coins = 150; state.sound = true; save();
            goCard('qiqi'); chooseCardGift(QIQI_TRANSFORMATION_GIFT.id); feedCard();
        });
        assert.equal(await page.evaluate(() => cardBond('qiqi')), 10);
        await page.waitForFunction(() => document.querySelector('.gift-encore-video')?.currentTime > 4);
        assert(await page.locator('.gift-encore-video').evaluate(video => video.videoWidth === 480 && video.currentSrc.includes('qiqi-transformation-full-v2-delivery.mp4') && video.webkitAudioDecodedByteCount > 0 && !video.muted));
        assert(await page.locator('.gift-performance').evaluate(element => element.classList.contains('is-gift-full-background') && element.classList.contains('gift-qiqi-transformation')));
        assert.equal(await page.locator('.gift-ritual-title span').textContent(), '柒柒的华丽变装');
        await page.screenshot({ path: '/tmp/hjm-qiqi-transformation-desktop.png' });
        await page.waitForSelector('.is-ritual-delivered');
        await page.waitForFunction(() => !document.querySelector('.gift-performance'));
        await page.waitForFunction(() => !document.querySelector('.is-bond-growing'));
        assert.equal(await page.locator('#cardFeeding .progress-fill').evaluate(element => parseFloat(element.style.width)), 10);

        await page.setViewportSize({ width: 390, height: 844 });
        await page.evaluate(() => { state.coins = 150; state.cards.daily.gifts.qiqi = 0; save(); chooseCardGift(QIQI_TRANSFORMATION_GIFT.id); feedCard(); });
        await page.waitForFunction(() => document.querySelector('.gift-encore-video')?.currentTime > 3);
        const bounds = await page.locator('.gift-encore-video').boundingBox();
        assert(bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= 391 && bounds.y + bounds.height <= 845);
        assert(await page.locator('.gift-performance').evaluate(element => element.classList.contains('is-gift-full-background')));
        await page.screenshot({ path: '/tmp/hjm-qiqi-transformation-mobile.png' });
        await page.locator('.gift-dragon-skip').click();
        assert.equal(await page.evaluate(() => cardBond('qiqi')), 20, 'skip does not settle gift again');
        await page.waitForSelector('.gift-performance', { state: 'detached' });
        assert.deepEqual(errors, []);
        console.log('PASS: Qiqi-only offer, 50 notes/+10, insufficient funds, daily cap, 100 cap and historic value, rollback, no XP, compressed full-scene video/audio, desktop/mobile delivery and skip cleanup.');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
