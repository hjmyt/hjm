const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
    const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
    try {
        const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
        await page.locator('[data-music-enter-muted]').click();
        const checks = await page.evaluate(() => {
            const results = [];
            const check = (name, ok) => { if (!ok) throw Error(name); results.push(name); };
            const reset = (coins = 50) => { storageOK = true; state = freshState(); state.sound = false; state.coins = coins; save(); closeModal(false); };
            reset(49);
            const before = JSON.stringify(state);
            check('49 notes cannot unlock', !purchaseCardUnlock('jerry').ok && JSON.stringify(state) === before);
            route('cards');
            check('Insufficient button disabled with shortage', document.querySelector('[data-card-unlock="jerry"]').disabled && document.querySelector('[data-card-id="jerry"]').textContent.includes('还差 1'));
            check('No purchase entry for placeholder', !document.querySelector('[data-card-unlock="bill"]'));
            reset();
            for (const id of ['bill', 'invalid']) check('Reject invalid or placeholder ' + id, !purchaseCardUnlock(id).ok && state.coins === 50);
            for (const c of CARD_DEFS.filter(c => !c.placeholder)) {
                reset();
                const chapters = JSON.stringify(state.chronicle), tickets = state.cards.tickets;
                const result = purchaseCardUnlock(c.id);
                check('Unlock +3 only for ' + c.id, result.ok && result.gain === 3 && state.coins === 0 && cardOwned(c.id) && cardBond(c.id) === 3 && CARD_DEFS.every(other => other.id === c.id || cardBond(other.id) === 0));
                check('No tickets, XP, daily quota or plot advancement ' + c.id, state.cards.tickets === tickets && state.cards.collection[c.id].xp === 0 && !Object.keys(state.cards.daily.gifts).length && !Object.keys(state.bondProgress.daily.counts).length && state.chronicle.run.scene === JSON.parse(chapters).run.scene);
                check('Shared bond and recruit pool ' + c.id, state.chronicle.bonds === state.affinity && state.chronicle.run.aff[c.id] === 3 && availableCardPool().some(item => item.id === c.id));
                state.coins = 50;
                check('Repeat cannot spend ' + c.id, !purchaseCardUnlock(c.id).ok && state.coins === 50 && cardBond(c.id) === 3 && state.cards.collection[c.id].copies === 1);
            }
            for (const [initial, expected] of [[32, 35], [98, 100], [100, 100], [125, 125]]) {
                reset(); state.affinity.jerry = initial;
                check('Bond boundary ' + initial, purchaseCardUnlock('jerry').ok && cardBond('jerry') === expected);
            }
            reset(); state.chronicle.run.name = '测试'; state.chronicle.run.scene = 's_door'; save();
            check('Free plot unlock still free without bonus', cardOwned('lala') && state.coins === 50 && cardBond('lala') === 0 && !purchaseCardUnlock('lala').ok);
            reset(); purchaseCardUnlock('lala');
            state.chronicle.run.name = '测试'; state.chronicle.run.scene = 's_door'; save(); syncStoryCards();
            check('Later story encounter cannot duplicate', cardBond('lala') === 3 && state.cards.collection.lala.copies === 1 && state.coins === 0);
            state = cleanState(JSON.parse(JSON.stringify(state)));
            check('Import/clean retains ownership and receipt', cardOwned('lala') && cardBond('lala') === 3 && state.bondProgress.claimed['special:card-unlock:lala']);
            state.chronicle.run = Chronicle.fresh().run; save();
            check('Reset chapter retains purchase', cardOwned('lala') && cardBond('lala') === 3 && state.coins === 0);
            reset(); state.cards.collection.jerry.owned = true; state.cards.collection.jerry.xp = 120;
            check('Legacy hidden growth can still unlock', purchaseCardUnlock('jerry').ok && state.cards.collection.jerry.xp === 120);
            reset(); storageOK = false;
            check('Unavailable storage cannot spend', !purchaseCardUnlock('jerry').ok && state.coins === 50 && !cardOwned('jerry'));
            reset();
            const persisted = localStorage.getItem(KEY), original = Storage.prototype.setItem, snapshot = JSON.stringify(state);
            Storage.prototype.setItem = function(key, value) { if (key === KEY) throw Error('simulated quota failure'); return original.call(this, key, value); };
            let failed;
            try { failed = purchaseCardUnlock('jerry'); } finally { Storage.prototype.setItem = original; }
            check('Failed save rolls back entire purchase', !failed.ok && JSON.stringify(state) === snapshot && state.chronicle.bonds === state.affinity && !state.bondProgress.claimed['special:card-unlock:jerry']);
            check('Failed save leaves readable current intact', localStorage.getItem(KEY) === persisted);
            storageOK = true;
            check('Retry after save failure grants exactly once', purchaseCardUnlock('jerry').ok && cardBond('jerry') === 3 && state.coins === 0);
            reset(100); route('cards');
            return results;
        });
        // Exercise the actual delegated click handler, then reopen from the home roster.
        await page.locator('#view-cards [data-card-unlock="jerry"]').click();
        assert.deepEqual(await page.evaluate(() => [state.coins, cardOwned('jerry'), cardBond('jerry')]), [50, true, 3]);
        assert.deepEqual(await page.evaluate(() => [currentView, CardUI.detailId, CardUI.tab, CardUI.returnTo, $('view-card').dataset.person]), ['card', 'jerry', 'detail', 'cards', 'jerry']);
        assert(await page.locator('#view-card [data-card-back]').isVisible());
        await page.evaluate(() => route('home'));
        await page.locator('#homeRoster [data-card-open="feihong"]').click();
        assert(await page.locator('#modalContent [data-card-unlock="feihong"]').isVisible());
        await page.locator('#modalContent [data-card-unlock="feihong"]').click();
        assert.deepEqual(await page.evaluate(() => [currentView, CardUI.detailId, CardUI.returnTo, $('modalBackdrop').hidden]), ['card', 'feihong', 'home', true]);
        await page.reload();
        await page.locator('[data-music-enter-muted]').click();
        assert.deepEqual(await page.evaluate(() => [state.coins, cardOwned('jerry'), cardBond('jerry'), cardOwned('feihong'), cardBond('feihong')]), [0, true, 3, true, 3]);
        await page.evaluate(() => { state.coins = 50; save(); route('cards'); });
        await page.locator('#view-cards [data-card-unlock="bingbing"]').click();
        assert.deepEqual(await page.evaluate(() => [state.coins, cardOwned('bingbing'), cardBond('bingbing')]), [0, true, 3]);
        assert.deepEqual(await page.evaluate(() => [currentView, $('view-card').dataset.person]), ['card', 'bingbing']);
        await page.reload();
        await page.locator('[data-music-enter-muted]').click();
        assert(await page.evaluate(() => cardOwned('bingbing') && cardBond('bingbing') === 3));
        for (const width of [1440, 390, 320]) {
            await page.setViewportSize({ width, height: 900 });
            await page.evaluate(() => { closeModal(false); route('cards'); });
            await page.evaluate(() => new Promise(requestAnimationFrame));
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Card layout ' + width + ': ' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => {const r=e.getBoundingClientRect();return r.width && r.right > innerWidth && getComputedStyle(e).position !== 'fixed';}).map(e => [e.tagName, e.className, e.getBoundingClientRect().right]).slice(0, 15))));
            await page.locator('[data-card-id="azhe"]').scrollIntoViewIfNeeded();
            await page.waitForFunction(() => { const img = document.querySelector('[data-card-id="azhe"] img'); return img.complete && img.naturalWidth > 0; });
            await page.locator('[data-card-id="azhe"]').screenshot({ path: '/tmp/hjm-card-note-unlocks-' + width + '.png' });
            await page.locator('#view-cards [data-card-open="azhe"]').click();
            assert(await page.locator('#modalContent [data-card-unlock="azhe"]').isDisabled());
            assert(await page.evaluate(() => { const r = $('modalContent').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }), 'Unlock dialog layout ' + width);
        }
        // Reproduce the reported mixed row: two owned cards beside locked cards.
        for (const width of [1440, 390, 320]) {
            await page.setViewportSize({ width, height: 950 });
            await page.mouse.move(0, 0);
            await page.evaluate(() => {
                closeModal(false); state = freshState(); state.sound = false; state.coins = 978430;
                state.cards.encounters = ['kongge', 'tim']; save(); CardUI.sort = 'chapter'; route('cards');
            });
            await page.evaluate(() => new Promise(requestAnimationFrame));
            const layout = await page.evaluate(() => {
                const cards = [...document.querySelectorAll('.collect-card')].slice(0, 5);
                return cards.map(card => {
                    const info = card.querySelector('.collect-info'), quote = card.querySelector('.collect-quote'), actions = card.querySelector('.collect-actions');
                    return { id: card.dataset.cardId, body: info.getBoundingClientRect().height, gap: actions.getBoundingClientRect().top - quote.getBoundingClientRect().bottom };
                });
            });
            assert(layout.every(card => card.gap <= 25 && card.body < 220), 'Compact mixed cards at ' + width + ': ' + JSON.stringify(layout));
            const consistency = await page.evaluate(() => {
                const cards = [...document.querySelectorAll('.collect-card')].slice(0, 6);
                const style = (element, fields) => { const css = getComputedStyle(element); return fields.map(field => css[field]); };
                return cards.map(card => ({
                    top: card.offsetTop, height: card.offsetHeight,
                    padding: style(card.querySelector('.collect-info'), ['padding']),
                    quote: style(card.querySelector('.collect-quote'), ['fontSize', 'lineHeight', 'fontWeight', 'color', 'margin']),
                    button: style(card.querySelector('.collect-actions .btn'), ['fontSize', 'lineHeight', 'fontWeight', 'color', 'backgroundColor', 'backgroundImage', 'borderRadius', 'height']),
                    buttonFits: card.querySelector('.collect-actions .btn').scrollWidth <= card.querySelector('.collect-actions .btn').clientWidth
                }));
            });
            for (const card of consistency) {
                assert.deepEqual(card.padding, consistency[0].padding, 'Shared card padding ' + width);
                assert.deepEqual(card.quote, consistency[0].quote, 'Shared text style ' + width);
                assert.deepEqual(card.button, consistency[0].button, 'Shared button style/height ' + width);
                assert(card.buttonFits, 'Button text fits ' + width);
                assert(consistency.filter(other => other.top === card.top).every(other => other.height === card.height), 'Equal heights within row ' + width);
            }
            assert(await page.locator('#view-cards [data-card-unlock="bingbing"]').isEnabled());
            await page.waitForFunction(() => [...document.querySelectorAll('.collect-card img')].slice(0, 3).every(img => img.complete && img.naturalWidth > 0));
            await page.locator('[data-card-id="kongge"]').evaluate(card => card.scrollIntoView({ block: 'start' }));
            await page.screenshot({ path: '/tmp/hjm-card-unlock-mixed-' + width + '.png' });
            await page.locator('[data-card-id="bingbing"]').evaluate(card => card.scrollIntoView({ block: 'start' }));
            await page.locator('[data-card-id="bingbing"]').screenshot({ path: '/tmp/hjm-card-unlock-bingbing-' + width + '.png' });
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mixed card overflow ' + width);
        }
        assert.deepEqual(errors, []);
        console.log(`PASS: ${checks.length} note-unlock checks, real clicks, reload and three viewport layouts.`);
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
