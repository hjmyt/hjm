const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
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
        const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/pre-bingbing-v3.json')));
        await page.evaluate(old => {
            const check = (ok, message) => { if (!ok) throw Error(message); };
            const restored = cleanImportedState(old);
            const oldBond = restored.affinity.bill;
            restored.cards.collection.bill = { owned: true, xp: 3540, copies: 1 };
            restored.cards.encounters.push('bill');
            restored.cards.selected = 'bill';
            restored.cards.team = ['bill', 'azhe'];
            state = cleanState(restored);
            check(state.coins === 321 && cardBond('azhe') === 47, 'Legacy balance and bonds survive');
            check(state.affinity.bill === oldBond && state.cards.collection.bill.xp === 3540, 'Retired growth remains in save');
            check(state.cards.selected !== 'bill' && !state.cards.team.includes('bill'), 'Legacy selection and team cannot retain Bill');
            check(!cardDef('bill') && !cardOwned('bill') && !availableCardPool().some(c => c.id === 'bill'), 'Retired card is unavailable');
            check(!mentionedStoryCards('Bill 又缺席了', 'bill').includes('bill'), 'Story cannot re-unlock Bill');
            const coins = state.coins;
            check(!purchaseCardUnlock('bill').ok && state.coins === coins, 'Removed purchase cannot charge');
            route('cards');
            goCard('bill');
            check(currentView === 'cards', 'Direct card entry rejected');
            check(save(), 'Save succeeds');
            const encoded = persistedState();
            check(encoded.bondVault.v === 4 && encoded.bondVault.values.bill, 'Protected save format remains compatible');
            check(cleanImportedState(encoded).affinity.bill === oldBond, 'Export and import preserve retired bond');
        }, fixture);
        await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
        for (const width of [1440, 390]) {
            await page.setViewportSize({ width, height: 1000 });
            for (const view of ['home', 'cards']) {
                await page.evaluate(view => route(view), view);
                assert.equal(await page.locator('[data-card-open="bill"], [data-card-id="bill"], [data-card-unlock="bill"]').count(), 0);
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
            }
            await page.screenshot({ path: `/tmp/hjm-bill-removed-${width}.png` });
        }
        await page.reload();
        assert(await page.evaluate(() => storageOK && state.coins === 321 && state.cards.collection.bill.xp === 3540 && !cardOwned('bill') && state.cards.selected !== 'bill'));
        assert.deepEqual(errors, []);
        console.log('PASS: Bill removal, legacy protected save, direct entry, story unlock, refresh, desktop and mobile.');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
