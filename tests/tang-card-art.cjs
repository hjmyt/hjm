const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : {})
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    const result = await page.evaluate(async () => {
      state = freshState();
      state.sound = false;
      state.cards.encounters = ['tang'];
      state.cards.collection.tang.owned = true;
      state.cards.selected = 'tang';
      state.cards.team = ['tang'];
      document.getElementById('musicWelcome').hidden = true;
      renderCardGlobals();
      const card = cardDef('tang');
      const load = src => new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve([image.naturalWidth, image.naturalHeight]);
        image.onerror = reject;
        image.src = src;
      });
      const dimensions = {
        full: await load(cardImage(card, 'full')),
        cover: await load(cardImage(card, 'cover')),
        avatar: await load(cardImage(card, 'avatar'))
      };
      const home = document.querySelector('#homeFeature .feature-art')?.getAttribute('src');
      goCard('tang');
      document.getElementById('musicWelcome').hidden = true;
      const detail = document.querySelector('#view-card .card-full-image')?.getAttribute('src');
      const avatar = document.querySelector('#rhythmTeam .card-avatar-image')?.getAttribute('src');
      return {
        keys: [card.asset, card.coverAsset, card.avatarAsset],
        dimensions,
        home,
        detail,
        avatar,
        overflow: document.documentElement.scrollWidth > innerWidth
      };
    });
    assert.deepEqual(result.keys, ['cardTang', 'cardTangCover', 'cardTangAvatar']);
    assert.deepEqual(result.dimensions.full, [1024, 1536]);
    assert.deepEqual(result.dimensions.cover, [1536, 1024]);
    assert.deepEqual(result.dimensions.avatar, [1254, 1254]);
    assert.match(result.home, /tang-cover-2026-10\.webp$/);
    assert.match(result.detail, /tang-full-clean-2026-10\.webp$/);
    assert.match(result.avatar, /thumbs\/avatars\/192\/tang\.webp\?v=tang20261004$/);
    assert.equal(result.overflow, false);
    await page.locator('#view-card .character-cover').screenshot({ path: '/tmp/hjm-tang-card-desktop.png' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { goCard('tang'); document.getElementById('musicWelcome').hidden = true; });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.locator('#view-card .character-cover').screenshot({ path: '/tmp/hjm-tang-card-mobile.png' });
    assert.deepEqual(errors, []);
    console.log('PASS: Tang Shao full, cover and avatar assets load through dedicated desktop/mobile entry points.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
