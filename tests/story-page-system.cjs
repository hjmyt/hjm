const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try {
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
  await page.locator('[data-music-enter-muted]').click();
  await page.evaluate(()=>{state=freshState();state.sound=false;save();Chronicle.closeLibrary();route('chronicle');});

  async function show(name,setup,selector){
   await page.evaluate(setup);
   await page.locator(selector).waitFor();
   const layout=await page.evaluate(selector=>{const node=document.querySelector(selector),rect=node.getBoundingClientRect();return {width:rect.width,left:rect.left,right:rect.right,overflow:document.documentElement.scrollWidth>innerWidth+1};},selector);
   assert(!layout.overflow&&layout.left>=-1&&layout.right<=391,`${name} fits the mobile viewport: ${JSON.stringify(layout)}`);
   await page.evaluate(()=>document.querySelectorAll('#toastStack .toast').forEach(node=>node.remove()));
   await page.screenshot({path:`/tmp/hjm-story-system-${name}.png`,fullPage:true});
  }

  await show('enrollment',()=>{const run=state.chronicle.run;run.scene='start';run.rev++;renderGlobal();},'.cp-form');
  assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('.cp-instruments')).gridTemplateColumns.split(' ').length),4,'Enrollment instruments stay in one compact mobile row');

  await show('training',()=>{const run=state.chronicle.run;run.name='小音';run.scene='training';run.weekly.trainingWeek=1;run.weekly.training[1]={round:0,points:0,phase:'ready',score:0,step:0,correct:0,message:''};economy().training['1:1']={paid:true,gain:0};run.rev++;renderGlobal();},'.cp-training-player');
  assert((await page.locator('.cp-training-player').boundingBox()).height<760,'Training setup remains inside one practical mobile viewport');

  await show('battle',()=>{const run=state.chronicle.run;run.scene='practice_turn';run.battle={context:'weekly',partner:'lala',round:1,hp:12,maxHp:12,pressure:10,over:false,last:'首席举起笔，准备记下你们的第一句。'};run.rev++;renderGlobal();},'.cp-battle-board');
  assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('#cpMain>.cp-surface:has(.cp-battle-board)>.cp-choices')).gridTemplateColumns.split(' ').length),1,'Battle actions remain touch-friendly on mobile');

  await show('performance',()=>{const run=state.chronicle.run;run.scene='live_play';run.live={scores:[10,6],score:16,diff:35,pos:48,dir:1,phase:'ready',last:'',finished:false,width:24};run.rev++;renderGlobal();},'.cp-live-score');
  const performance=await page.evaluate(()=>{const surface=document.querySelector('#cpMain>.cp-surface:has(.cp-live-score)'),color=getComputedStyle(surface).backgroundImage;return {dark:color.includes('gradient'),actions:surface.querySelectorAll('.cp-live-actions .btn').length};});
  assert(performance.dark&&performance.actions>=1,'Performance page uses the stage treatment and keeps its controls');

  await show('ending',()=>{const run=state.chronicle.run;run.scene='title2';run.ending='debut';run.week=6;run.live={scores:[10,10,8,8,10],score:46,diff:35};run.rev++;renderGlobal();},'.cp-ending-hero');
  assert(await page.locator('#cpMain>.cp-surface:has(.cp-ending-hero)>.cp-choices').isVisible(),'Chapter ending keeps memories and next actions in the epilogue card');

  await show('personal-hub',()=>{const personal=state.chronicle.personal;personal.active=true;personal.selected='azhe';personal.unlocks.azhe=true;personal.routes.azhe={scene:'hub',page:0,flags:{},done:{},resume:null,resumePage:0,read:[],ending:null,endings:[],run:1,duets:2,chatIndex:0,focus:0,score:0,dang:0,previewed:null,reply:'',month:0,aff:{},chatSpent:{},chatContacts:{},chatSeen:{},chatReactions:{},chatMessage:null};personal.rev++;renderGlobal();},'.cp-personal #cpMain>.cp-surface');
  await show('personal-ending',()=>{const story=state.chronicle.personal.routes.azhe;story.scene='complete';story.ending='azhe_HE';story.endings=['azhe_HE'];state.chronicle.personal.rev++;renderGlobal();},'.cp-personal-complete');
  assert(await page.locator('.cp-personal-complete .cp-personal-ending-art img').isVisible(),'Personal ending keeps its collected illustration');
  await show('personal-ending-be',()=>{const personal=state.chronicle.personal;personal.selected='shiyuan';personal.unlocks.shiyuan=true;personal.routes.shiyuan={...structuredClone(personal.routes.azhe),scene:'complete',ending:'sy_BE_ge',endings:['sy_BE_ge']};personal.rev++;renderGlobal();},'.cp-personal-complete');
  for(const [width,height] of [[390,844],[320,568]]){
   await page.setViewportSize({width,height});
   await page.waitForTimeout(120);
   await page.waitForFunction(()=>[...document.querySelectorAll('.cp-personal-complete img')].every(img=>img.complete));
   const fit=await page.evaluate(()=>{const box=selector=>document.querySelector(selector).getBoundingClientRect();return {hero:box('.cp-personal-complete>.cp-ending-hero').height,art:box('.cp-personal-ending-art img').height,actionsBottom:box('.cp-personal-complete>.cp-personal-hub-actions').bottom,navTop:box('.main-nav').top,pageWidth:document.documentElement.scrollWidth};});
   assert(fit.hero<=110,`BE completion heading stays compact at ${width}×${height}: ${JSON.stringify(fit)}`);
   assert(fit.actionsBottom<=fit.navTop-8,`BE completion actions stay above the navigation without scrolling at ${width}×${height}: ${JSON.stringify(fit)}`);
   assert(fit.pageWidth<=width+1,`BE completion has no horizontal overflow at ${width}×${height}: ${JSON.stringify(fit)}`);
   if(width===320)await page.screenshot({path:'/tmp/hjm-story-system-personal-ending-be-compact.png'});
  }
  await page.setViewportSize({width:390,height:844});

  await show('seven-reader',()=>{state.chronicle.personal.active=false;state.chronicle.chapterSeven.active=true;Object.assign(state.chronicle.chapterSeven,{scene:'q_start',page:1,ending:null,active:true,rev:state.chronicle.chapterSeven.rev+1});renderGlobal();},'.cp-chapter-seven .cp-novel');
  assert(await page.locator('[data-cp-action="chapter-seven-page-prev"]').isVisible(),'Multi-page reader exposes a previous-page control after page one');
  assert(await page.locator('[data-cp-action="chapter-seven-page"]').isVisible(),'Previous and next controls share the pager row');
  assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('.main-nav')).display),'none','Persistent navigation is hidden while reading');
  await page.locator('[data-cp-action="chapter-seven-page-prev"]').click();
  assert.equal(await page.evaluate(()=>state.chronicle.chapterSeven.page),0,'Previous-page control moves back without leaving the chapter');

  await show('seven-ending',()=>{state.chronicle.personal.active=false;state.chronicle.chapterSeven.active=true;Object.assign(state.chronicle.chapterSeven,{scene:'q_badloan',ending:'q_badloan',active:true,rev:state.chronicle.chapterSeven.rev+1});renderGlobal();},'.cp-personal-complete');
  assert(await page.locator('.cp-personal-complete .cp-personal-ending-art img').isVisible(),'Chapter seven ending keeps its collected illustration');

  assert.deepEqual(errors,[]);
  console.log('PASS story page system: enrollment, training, battle, performance, main/personal/chapter-seven ending mobile layouts.');
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
