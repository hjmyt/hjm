const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const url = file => pathToFileURL(path.resolve(__dirname, '..', file)).href;
(async () => {
    const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
    try {
        const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
        const errors = []; page.on('pageerror', e => errors.push(e.message));
        await page.goto(url('previews/gift-effects.html'));
        const count = await page.evaluate(() => {
            let count = 0;
            for (const [id, gifts] of Object.entries(GIFT_EFFECT_BINDINGS)) for (const [key, binding] of Object.entries(gifts)) {
                if (!CARD_DEFS.find(c => c.id === id)?.gifts.some(g => g[0] === key)) throw Error(`Missing gift ${id}:${key}`);
                if (!GIFT_EFFECT_THEMES[binding.theme]) throw Error(`Missing theme ${binding.theme}`);
                count++;
            }
            if (giftEffectFor('unknown', 'full_bond') || giftEffectFor('jerry', 'unknown') || giftEffectFor('jerry', 'quiet')) throw Error('Fallback lookup');
            return count;
        });
        const themes = await page.evaluate(() => Object.keys(GIFT_EFFECT_THEMES));
        assert.equal(themes.length, 26);
        for (const theme of themes) {
            await page.locator(`[data-theme="${theme}"]`).click();
            await page.locator('#replay').click();
            if (theme === 'encore' || theme === 'comfort') {
                await page.waitForFunction(() => document.querySelector('.gift-encore-video')?.currentTime > .2);
                assert(await page.locator('.gift-encore-video').evaluate(v => !v.muted && v.webkitAudioDecodedByteCount > 0));
                await page.evaluate(() => GiftEffects.stop()); continue;
            }
            if (theme === 'full') {
                await page.waitForFunction(() => document.querySelector('.gift-dragon-video')?.currentTime > .2);
                assert(await page.locator('.gift-dragon-video').evaluate(v => !v.muted && v.webkitAudioDecodedByteCount > 0));
                await page.evaluate(() => GiftEffects.stop()); continue;
            }
            await page.waitForFunction(() => galleryContext?.state === 'running');
            await page.evaluate(() => {
                if (!window.giftMeter) { window.giftMeter = galleryContext.createAnalyser(); giftMeter.fftSize = 2048; galleryOutput.connect(giftMeter); }
            });
            await page.waitForTimeout(1950);
            assert(await page.evaluate(() => { const data = new Float32Array(giftMeter.fftSize); giftMeter.getFloatTimeDomainData(data); return Math.max(...data.map(Math.abs)) > .0001; }), `Audible cue for ${theme}`);
            assert.equal(await page.locator(`[data-gift-effect="${theme}"]`).count(), 1);
            assert(await page.locator('#character-image').evaluate(img => img.complete && img.naturalWidth > 0));
            await page.screenshot({ path: `/tmp/hjm-gift-${theme}.png` });
            await page.evaluate(() => GiftEffects.stop());
        }
        for (const width of [390, 768]) {
            await page.setViewportSize({ width, height: 850 });
            await page.locator('[data-theme="full"]').click(); await page.locator('#replay').click();
            await page.waitForTimeout(1950);
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
            const box = await page.locator('.gift-receipt').boundingBox();
            assert(box.x >= 0 && box.x + box.width <= width, `Receipt fits at ${width}`);
            await page.screenshot({ path: `/tmp/hjm-gift-mobile-${width}.png` });
            await page.locator('#stage-replay').click();
            assert.equal(await page.locator('.gift-performance').count(), 1);
        }
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.locator('#stage-replay').click();
        assert.equal(await page.locator('.gift-art-shell').isVisible(), false);
        await page.waitForTimeout(1600); assert.equal(await page.locator('.gift-performance').count(), 0);
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.goto(url('index.html'));
        await page.locator('[data-music-enter-muted]').click();
        const result = await page.evaluate(() => {
            state = freshState(); state.sound = false; state.coins = 20000;
            state.cards.encounters = CARD_DEFS.map(c => c.id);
            goCard('shiyuan'); chooseCardGift('bouquet');
            const gift = effectiveGifts(cardDef('shiyuan')).find(g => g[0] === 'bouquet');
            const before = state.coins, bond = cardBond('shiyuan'); feedCard();
            if (!document.querySelector('[data-gift-effect="bouquet"]') || state.coins !== before - gift[3] || cardBond('shiyuan') !== bond + gift[4]) throw Error('Ordinary payment/effect');
            const after = JSON.stringify(state);
            playCardGiftEffect(cardDef('shiyuan'), gift);
            if (JSON.stringify(state) !== after) throw Error('Visual replay changes save');
            route('home'); if (document.querySelector('.gift-performance')) throw Error('Navigation cleanup');
            goCard('shiyuan'); chooseCardGift('full_bond'); const quota = state.cards.daily.gifts.shiyuan; const funds = state.coins; feedCard();
            if (!document.querySelector('[data-gift-effect="full"]') || state.coins !== funds - 350 || cardBond('shiyuan') !== 100 || state.cards.daily.gifts.shiyuan !== quota) throw Error('Full gift payment/effect');
            GiftEffects.stop(); feedCard(); if (!document.querySelector('[data-gift-effect="full"]') || state.coins !== funds - 700 || cardBond('shiyuan') !== 100 || state.cards.daily.gifts.shiyuan !== quota) throw Error('Full gift repeat');
            goCard('jerry'); chooseCardGift('quiet'); feedCard(); if (!document.querySelector('.paw-gift')) throw Error('Paw fallback');
            GiftEffects.stop(); state.coins = 0; chooseCardGift('coffee'); feedCard();
            if (document.querySelector('.paw-gift,.gift-performance')) throw Error('Insufficient funds played effect');
            state.coins = 100; state.cards.daily.gifts.jerry = 5; feedCard(); if (document.querySelector('.gift-performance')) throw Error('Daily cap played effect');
            state.cards.daily.gifts.jerry = 0; const original = save; save = () => false;
            try { feedCard(); if (document.querySelector('.gift-performance')) throw Error('Failed save played effect'); } finally { save = original; }
            return true;
        });
        assert(result); assert.deepEqual(errors, []);
        console.log(`PASS: ${count} exact gift mappings, 26 visual themes, fallback, desktop/mobile, reduced motion, payment/cap/save failure, full gift and navigation cleanup.`);
    } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
