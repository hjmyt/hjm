const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {})
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    await page.evaluate(() => closeModal(false));

    const result = await page.evaluate(async () => {
      state = freshState();
      state.sound = false;
      route('cards');
      const locked = Object.fromEntries(['jerry', 'yuerou', 'laodu', 'xuezi', 'xiaojie'].map(id => {
        const img = document.querySelector(`[data-card-id="${id}"] .card-cover-image`);
        return [id, img?.getAttribute('src') || ''];
      }));

      for (const id of ['jerry', 'yuerou', 'laodu', 'xuezi', 'xiaojie']) {
        state.cards.encounters.push(id);
        state.cards.collection[id].owned = true;
      }
      state.cards.selected = 'jerry';
      renderGlobal();
      route('home');
      const home = {
        feature: document.querySelector('#homeFeature .card-cover-image')?.getAttribute('src') || '',
        jerry: document.querySelector('.mini-character[data-card-open="jerry"] .card-cover-image')?.getAttribute('src') || '',
        yuerou: document.querySelector('.mini-character[data-card-open="yuerou"] .card-cover-image')?.getAttribute('src') || '',
        laodu: document.querySelector('.mini-character[data-card-open="laodu"] .card-cover-image')?.getAttribute('src') || '',
        xuezi: document.querySelector('.mini-character[data-card-open="xuezi"] .card-cover-image')?.getAttribute('src') || '',
        xiaojie: document.querySelector('.mini-character[data-card-open="xiaojie"] .card-cover-image')?.getAttribute('src') || ''
      };

      route('cards');
      const open = Object.fromEntries(['jerry', 'yuerou', 'laodu', 'xuezi', 'xiaojie'].map(id => {
        const img = document.querySelector(`[data-card-id="${id}"] .card-cover-image`);
        return [id, img?.getAttribute('src') || ''];
      }));
      state.cards.team = ['jerry', 'yuerou', 'laodu'];
      renderCards();
      const avatars = [...document.querySelectorAll('.team-slot .card-avatar-image')].map(img => img.getAttribute('src'));
      avatars.push(cardThumbnail(cardDef('xuezi'), 'avatar'));
      avatars.push(cardThumbnail(cardDef('xiaojie'), 'avatar'));

      goCard('jerry');
      const detail = { jerry: document.querySelector('.character-cover .card-full-image')?.getAttribute('src') || '' };
      goCard('xuezi');
      detail.xuezi = document.querySelector('.character-cover .card-full-image')?.getAttribute('src') || '';
      goCard('laodu');
      detail.laodu = document.querySelector('.character-cover .card-full-image')?.getAttribute('src') || '';
      goCard('xiaojie');
      detail.xiaojie = document.querySelector('.character-cover .card-full-image')?.getAttribute('src') || '';
      const laoduCard = cardDef('laodu');
      const laoduProfile = concealCardSkills(renderDetailContent(laoduCard, true), laoduCard);
      state.affinity.laodu = 35;
      const laoduSkillsAt35 = concealCardSkills(renderDetailContent(laoduCard, true), laoduCard);
      const xueziCard = cardDef('xuezi');
      const xueziProfile = concealCardSkills(renderDetailContent(xueziCard, true), xueziCard);
      state.affinity.xuezi = 35;
      const xueziSkillsAt35 = concealCardSkills(renderDetailContent(xueziCard, true), xueziCard);
      const sizes = {};
      for (const key of ['cardJerryCover', 'cardYuerouCover', 'cardLaoduCover', 'cardXueziCover', 'cardXiaojieCover', 'avatarJerry', 'cardYuerouAvatar', 'cardLaoduAvatar', 'cardXueziAvatar', 'cardXiaojieAvatar']) {
        const img = new Image();
        img.src = ASSETS[key];
        await img.decode();
        sizes[key] = [img.naturalWidth, img.naturalHeight];
      }
      return { locked, home, open, avatars, detail, sizes, laodu: { rarity: laoduCard.rarity, stars: laoduCard.stars, fields: laoduCard.profileFields.length, profile: laoduProfile, skillsAt35: laoduSkillsAt35 }, xuezi: { rarity: xueziCard.rarity, stars: xueziCard.stars, fields: xueziCard.profileFields.length, profile: xueziProfile, skillsAt35: xueziSkillsAt35 } };
    });

    assert.match(result.locked.jerry, /thumbs\/cards\/720\/jerry\.webp$/);
    assert.match(result.locked.yuerou, /thumbs\/cards\/720\/yuerou\.webp$/);
    assert.match(result.locked.laodu, /thumbs\/cards\/720\/laodu\.webp$/);
    assert.match(result.locked.xuezi, /thumbs\/cards\/720\/xuezi\.webp$/);
    assert.match(result.locked.xiaojie, /thumbs\/cards\/720\/xiaojie\.webp$/);
    assert.match(result.home.feature, /jerry-card-cover\.webp$/);
    assert.match(result.home.jerry, /thumbs\/cards\/360\/jerry\.webp$/);
    assert.match(result.home.yuerou, /thumbs\/cards\/360\/yuerou\.webp$/);
    assert.match(result.home.laodu, /thumbs\/cards\/360\/laodu\.webp$/);
    assert.match(result.home.xuezi, /thumbs\/cards\/360\/xuezi\.webp$/);
    assert.match(result.home.xiaojie, /thumbs\/cards\/360\/xiaojie\.webp$/);
    assert.match(result.open.jerry, /thumbs\/cards\/720\/jerry\.webp$/);
    assert.match(result.open.yuerou, /thumbs\/cards\/720\/yuerou\.webp$/);
    assert.match(result.open.laodu, /thumbs\/cards\/720\/laodu\.webp$/);
    assert.match(result.open.xuezi, /thumbs\/cards\/720\/xuezi\.webp$/);
    assert.match(result.open.xiaojie, /thumbs\/cards\/720\/xiaojie\.webp$/);
    assert(result.avatars.some(src => /thumbs\/avatars\/192\/jerry\.webp$/.test(src)));
    assert(result.avatars.some(src => /thumbs\/avatars\/192\/yuerou\.webp$/.test(src)));
    assert(result.avatars.some(src => /thumbs\/avatars\/192\/laodu\.webp$/.test(src)));
    assert(result.avatars.some(src => /thumbs\/avatars\/192\/xuezi\.webp$/.test(src)));
    assert(result.avatars.some(src => /thumbs\/avatars\/192\/xiaojie\.webp$/.test(src)));
    assert.match(result.detail.jerry, /jerry-portrait\.webp$/);
    assert.match(result.detail.xuezi, /xuezi-portrait\.webp$/);
    assert.match(result.detail.laodu, /laodu-portrait\.webp$/);
    assert.match(result.detail.xiaojie, /xiaojie-portrait\.webp$/);
    assert.deepEqual(result.sizes.cardJerryCover, [900, 600]);
    assert.deepEqual(result.sizes.cardYuerouCover, [900, 600]);
    assert.deepEqual(result.sizes.cardLaoduCover, [900, 600]);
    assert.deepEqual(result.sizes.cardXueziCover, [900, 600]);
    assert.deepEqual(result.sizes.cardXiaojieCover, [900, 600]);
    assert.deepEqual(result.sizes.avatarJerry, [600, 600]);
    assert.deepEqual(result.sizes.cardYuerouAvatar, [600, 600]);
    assert.deepEqual(result.sizes.cardLaoduAvatar, [600, 600]);
    assert.deepEqual(result.sizes.cardXueziAvatar, [600, 600]);
    assert.deepEqual(result.sizes.cardXiaojieAvatar, [600, 600]);
    assert.deepEqual([result.xuezi.rarity, result.xuezi.stars, result.xuezi.fields], ['R', 2, 4]);
    assert.match(result.xuezi.profile, /缝针/);
    assert.match(result.xuezi.profile, /眼力见/);
    assert.doesNotMatch(result.xuezi.profile, /当所爱之人走向别人/);
    assert.match(result.xuezi.skillsAt35, /当所爱之人走向别人/);
    assert.deepEqual([result.laodu.rarity, result.laodu.stars, result.laodu.fields], ['SR', 3, 4]);
    assert.match(result.laodu.profile, /Lydian 开讲/);
    assert.match(result.laodu.profile, /口碑最好的人/);
    assert.doesNotMatch(result.laodu.profile, /登台前他只说两个字/);
    assert.match(result.laodu.skillsAt35, /登台前他只说两个字/);
    assert.deepEqual(errors, []);

    await page.evaluate(() => {
      closeModal(false);
      state = freshState();
      state.sound = false;
      CardUI.filter = '全部';
      CardUI.sort = 'chapter';
      route('cards');
      closeModal(false);
      $('modalBackdrop').hidden = true;
      $('musicWelcome').hidden = true;
    });
    await page.locator('[data-card-id="jerry"]').screenshot({ path: '/tmp/hjm-jerry-locked-card.png' });
    await page.locator('[data-card-id="yuerou"]').screenshot({ path: '/tmp/hjm-yuerou-locked-card.png' });
    await page.locator('[data-card-id="laodu"]').screenshot({ path: '/tmp/hjm-laodu-locked-card.png' });
    await page.locator('[data-card-id="xuezi"]').screenshot({ path: '/tmp/hjm-xuezi-locked-card.png' });
    await page.locator('[data-card-id="xiaojie"]').screenshot({ path: '/tmp/hjm-xiaojie-locked-card.png' });
    await page.screenshot({ path: '/tmp/hjm-card-portrait-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => route('cards'));
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Cards fit mobile viewport');
    await page.screenshot({ path: '/tmp/hjm-card-portrait-mobile.png', fullPage: true });
    console.log('PASS: dedicated cover/avatar/full portrait assets are used across locked, open, home, detail and team surfaces.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
