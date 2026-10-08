const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/imagegen/chronicle/art.json')));
const plan = JSON.parse(fs.readFileSync(path.join(root, 'docs/imagegen/chronicle/plan.json')));
const expectedCount = new Set(plan.flatMap(g => g.scenes.map(s => s.id))).size;
assert.equal(manifest.length, expectedCount);
assert.equal(new Set(manifest.map(a => a.id)).size, expectedCount);
assert.equal(new Set(manifest.map(a => createHash('sha256').update(fs.readFileSync(path.join(root, a.asset))).digest('hex'))).size, expectedCount);

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const errors = [], failures = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('requestfailed', req => failures.push(req.url()));
    await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
    const count = await page.evaluate(() => {
      const checks = [];
      const check = (name, value) => { if (!value) throw Error(name); checks.push(name); };
      state = freshState(); state.sound = false;
      const r = state.chronicle.run;
      Object.assign(r, { name: '插图测试', inst: '弦乐', scene: 's_room', tech: 30, level: 1 });
      const resources = JSON.stringify([state.coins, state.affinity, r.tech]);
      route('chronicle');
      check('Only reached illustration collected', state.memories.includes('scene_1_s_room') && !state.memories.includes('scene_1_gig'));
      check('Retired top counters removed', !document.querySelector('#albumStat') && !document.querySelector('#cardCount'));
      const once = state.memories.length;
      renderGlobal(); renderGlobal();
      check('Repeated rendering does not award resources or duplicate memories', state.memories.length === once && resources === JSON.stringify([state.coins, state.affinity, r.tech]));
      const src = document.querySelector('.cp-novel-art img').getAttribute('src');
      check('Desktop Chronicle scene art fills the reader stage without cropping', getComputedStyle(document.querySelector('.cp-novel-art')).paddingTop === '0px' && getComputedStyle(document.querySelector('.cp-novel-art img')).objectFit === 'contain');
      document.querySelector('.cp-memory-link').click();
      check('Read scene opens same album image', document.querySelector('.photo-frame img').getAttribute('src') === src);
      closeModal();
      r.scene = 's_conflict'; state.progression.orchestraLevel = 1; r.rev++; renderGlobal();
      check('No dispute art for incidental meeting', state.memories.includes('scene_1_s_conflict_meeting') && !state.memories.includes('scene_1_s_conflict'));
      state.progression.orchestraLevel = 2; r.rev++; renderGlobal();
      check('Actual dispute gets its own art', state.memories.includes('scene_1_s_conflict'));
      r.scene = 'b_live'; r.tech = 0; r.rev++; renderGlobal();
      check('Unready stage has its own preparation art', state.memories.includes('scene_1_b_live_unready') && !state.memories.includes('scene_1_b_live'));
      r.scene = 'after_practice'; r.battle = {win: false}; r.rev++; renderGlobal();
      check('Failure scene only unlocks failure image', state.memories.includes('scene_1_after_practice_fail') && !state.memories.includes('scene_1_after_practice_win'));
      r.battle.win = true; r.rev++; renderGlobal();
      check('Success gets separate illustration', state.memories.includes('scene_1_after_practice_win'));
      check('Success keeps both speaker turns', document.querySelectorAll('#cpStoryText [data-speaker]').length === 2);
      r.chapter = 2; r.scene = 'after_practice'; r.rev++; renderGlobal();
      check('Same scene name in other chapter has its own art', chronicleSceneArt(r)?.id === 'scene_2_after_practice');
      r.chapter = 5; r.scene = 'c5_intro'; state.affinity.shiyuan = 0; r.rev++; renderGlobal();
      check('Early ending has no later rival spoiler', !state.memories.includes('scene_5_c5_intro') && state.memories.includes('scene_5_c5_intro_wind'));
      const old = freshState();
      Object.assign(old.chronicle.run, {name:'旧档',inst:'弦乐',scene:'menu',week:6,journal:[
        {chapter:1,week:1,scene:'s_room',who:'lala',text:'来得正好',choice:null},
        {chapter:1,week:4,scene:'s_conflict',who:'narrator',text:'旧场景',choice:null}
      ]});
      const restored = cleanState(JSON.parse(JSON.stringify(old)));
      check('Legacy real journal backfills seen scene', restored.memories.includes('scene_1_s_room'));
      check('Week alone cannot unlock future or uncertain branch scenes', !restored.memories.includes('scene_1_gig') && !restored.memories.includes('scene_1_s_conflict'));
      check('Migration is idempotent', JSON.stringify(restored.memories) === JSON.stringify(cleanState(JSON.parse(JSON.stringify(restored))).memories));
      // Check every binding can render its authored scene and gets its own matching image.
      for (const art of CHRONICLE_ART) {
        state = freshState(); state.sound = false;
        Object.assign(state.chronicle.run, {chapter:art.chapter,scene:art.scene,name:'布局测试',inst:'弦乐',level:5,tech:40,battle:{win:art.condition!=='practiceFail'}});
        state.progression.orchestraLevel = 5;
        state.affinity.shiyuan = art.condition === 'summerUnready' ? 0 : 85;
        state.affinity.zhu = 12;
        state.chronicle.chapterEndings = {1:['debut'],2:['c2_dual'],3:['c3_he'],4:['c4_he']};
        if (art.condition === 'incidentalMeeting') {
          state.chronicle.run.level = 1;
          state.progression.orchestraLevel = 1;
        }
        if (art.condition === 'performanceUnready') state.chronicle.run.tech = 0;
        if (art.condition === 'openingIncomplete') state.affinity.zhu = 0;
        if (art.condition === 'konggeStays') state.chronicle.run.flags.konggeStay = 1;
        if (art.condition === 'approachSecond') state.chronicle.run.weekly.approach = 1;
        if (art.condition === 'shadowPendingChat') {
          state.chronicle.run.chat = 'shiyuan';
          state.chronicle.run.flags.beShiyuan = 1;
        }
        if (art.condition === 'qiqiRefusalFirst') state.chronicle.run.flags.qHate = 1;
        if (art.condition === 'qiqiRefusalSecond') state.chronicle.run.flags.qHate = 2;
        if (art.condition === 'rumorFirst') state.chronicle.run.flags.qBack = 1;
        if (art.condition === 'rumorSecond') state.chronicle.run.flags.qBack = 2;
        Chronicle.syncBonds(state.chronicle, state.affinity); route('chronicle');
        check('Artwork reachable ' + art.id, document.querySelector('.cp-novel-art img')?.getAttribute('src') === ASSETS[art.asset]);
        check('Artwork collected ' + art.id, memoryVisible(art.id));
        check('Unvisited alternatives remain locked ' + art.id, CHRONICLE_ART.filter(a => a.id !== art.id && a.chapter === art.chapter && a.scene === art.scene).every(a => !memoryVisible(a.id)));
      }
      // Save/reload uses the normal storage path, with a future illustration still locked.
      state = freshState(); state.sound = false;
      Object.assign(state.chronicle.run, {scene:'s_room',name:'插图测试',inst:'弦乐'});
      route('chronicle'); save();
      return checks.length;
    });
    await page.reload();
    assert(await page.evaluate(() => state.memories.includes('scene_1_s_room') && !state.memories.includes('scene_1_gig')));
    if (await page.locator('[data-music-enter-muted]').count()) await page.locator('[data-music-enter-muted]').click();
    for (const width of [390, 768, 1440, 2356]) {
      await page.setViewportSize({ width, height: 1100 });
      for (const scene of ['s_room', 'gig', 'emo', 'zhu_offer', 'practice_partner', 'c6_warn', 'c2_bar']) {
        await page.evaluate(scene => {
          closeModal();Chronicle.closeLibrary();state.sound = false;
          const r = state.chronicle.run;
          Object.assign(r, {chapter:scene==='c6_warn'?6:scene==='c2_bar'?2:1,scene,level:5,tech:30});
          state.progression.orchestraLevel = 5;
          r.rev++; route('chronicle');renderGlobal();
        }, scene);
        const layout = await page.evaluate(async () => {
          const img = document.querySelector('.cp-novel-art img');
          if(!img)return {noArt:true,overflow:document.documentElement.scrollWidth>innerWidth,textOnly:!!document.querySelector('.cp-novel-text-only'),currentView,copy:$('view-chronicle').innerText.slice(0,120)};
          await img.decode();
          const stage=document.querySelector('.cp-novel-illustrated').getBoundingClientRect(),dialogue=document.querySelector('.cp-novel-dialogue').getBoundingClientRect(),nav=document.querySelector('.main-nav').getBoundingClientRect();
	          return {overflow: document.documentElement.scrollWidth > innerWidth,
	            imageWidth: img.getBoundingClientRect().width, imageHeight: img.getBoundingClientRect().height,
	            stageWidth:stage.width,stageHeight:stage.height,stageTop:stage.top,stageBottom:stage.bottom,dialogueBottom:dialogue.bottom,navTop:nav.top,
	            viewportHeight:innerHeight,navHidden:document.querySelector('.main-nav').offsetParent===null,
            reservedWidth: img.getAttribute('width'), reservedHeight: img.getAttribute('height'),
            artPadding: getComputedStyle(document.querySelector('.cp-novel-art')).paddingTop,
            artFit: getComputedStyle(img).objectFit,
            sidebarClosed: !document.querySelector('.cp-reader-details').open};
        });
        assert(!layout.overflow, `${scene} overflows ${width}`);
        if(layout.noArt){assert(layout.textOnly,`${scene} without bound art stays a compact text-only scene: ${JSON.stringify(layout)}`);continue;}
        assert(Math.abs(layout.imageWidth-layout.stageWidth)<=1&&Math.abs(layout.imageHeight-layout.stageHeight)<=1, `${scene} image fills the reader stage at ${width}: ${JSON.stringify(layout)}`);
        assert.equal(layout.reservedWidth, '440', `${scene} reserves image width before decode`);
        assert.equal(layout.reservedHeight, '440', `${scene} reserves image height before decode`);
        assert.equal(layout.artPadding, '0px', `${scene} removes the old detached photo edge`);
        if (width === 390) {
          assert.equal(layout.artFit, 'cover', `${scene} fills the mobile stage without a blank band`);
	          assert(layout.stageTop>=-1&&layout.stageBottom<=(layout.navHidden?layout.viewportHeight:layout.navTop)+1&&layout.dialogueBottom<=layout.stageBottom+1,`${scene} stays inside the mobile viewport: ${JSON.stringify(layout)}`);
        } else {
          assert.equal(layout.artFit, 'contain', `${scene} keeps desktop/tablet full composition`);
          assert(layout.stageHeight<=1100,`${scene} desktop/tablet stage fits the viewport`);
        }
        assert(layout.sidebarClosed);
        if ((width === 1440 || width === 390) && ['s_room', 'zhu_offer', 'c6_warn', 'c2_bar'].includes(scene))
          await page.locator('.cp-novel').screenshot({path:`/tmp/hjm-reader-${scene}-${width}.png`});
      }
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(failures, []);
    console.log(`PASS: ${count} scene/migration/unlock checks; ${expectedCount} unique illustrations; 28 responsive reader fixtures; reload, album link and branch guards.`);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
