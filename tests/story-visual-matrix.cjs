const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
  await page.locator('[data-music-enter-muted]').click();
  await page.evaluate(()=>{
   window.__storyVisualReset=()=>{state=freshState();state.sound=false;route('chronicle');Chronicle.closeLibrary();};
   window.__storyPersonalRun=scene=>({scene,page:0,flags:{},done:{},resume:null,resumePage:0,read:[],ending:null,endings:[],run:1,duets:2,chatIndex:0,focus:0,score:10,dang:0,previewed:null,reply:'',month:0,aff:{},chatSpent:{},chatContacts:{},chatSeen:{},chatReactions:{},chatMessage:null});
  });

  async function settle(){
   await page.evaluate(()=>document.querySelectorAll('#toastStack .toast').forEach(node=>node.remove()));
   await page.waitForTimeout(700);
  }
  async function shot(name,setup,selector,arg){
   await page.evaluate(setup,arg);
   await page.locator(selector).waitFor();
   await settle();
   const layout=await page.evaluate(selector=>{
    const node=document.querySelector(selector),rect=node.getBoundingClientRect();
    const extra=[...document.querySelectorAll('.cp-log,.story-reading-extras,.cp-reader-details')].filter(item=>getComputedStyle(item).display!=='none');
    return {left:rect.left,right:rect.right,width:rect.width,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,footer:getComputedStyle(document.querySelector('.page-footer')).display,extras:extra.length};
   },selector);
   assert(layout.left>=-1&&layout.right<=layout.viewport+1,`${name} primary surface fits viewport: ${JSON.stringify(layout)}`);
   assert(layout.scrollWidth<=layout.viewport+1,`${name} has no horizontal overflow: ${JSON.stringify(layout)}`);
   assert.equal(layout.footer,'none',`${name} hides generic site footer`);
   assert.equal(layout.extras,0,`${name} keeps logs/settings out of the main story surface`);
   await page.screenshot({path:`/tmp/hjm-story-matrix-${name}.png`});
  }
  await shot('library-main',()=>{state=freshState();state.sound=false;route('chronicle');Chronicle.openLibrary('main');},'.story-library');
  await shot('library-personal',()=>{state=freshState();state.sound=false;state.coins=420;route('chronicle');Chronicle.openLibrary('personal');},'.story-personal-list');
  await shot('library-fusion',()=>{state=freshState();state.sound=false;state.cards.encounters.push('jerry');state.cards.collection.jerry.owned=true;state.affinity.jerry=25;syncUnifiedBonds(state);state.fusion.invited=true;route('fusion');renderFusion();},'.fusion-chapters');
  await shot('enrollment',()=>{__storyVisualReset();state.chronicle.run.scene='start';state.chronicle.run.rev++;renderGlobal();},'.cp-form');
  await shot('week-dashboard',()=>{__storyVisualReset();state.chronicle.run.scene='menu';state.chronicle.run.name='小音';state.chronicle.run.rev++;renderGlobal();},'.story-week');
  await shot('contacts',()=>{__storyVisualReset();state.chronicle.run.scene='chat_select';state.chronicle.run.name='小音';state.chronicle.run.rev++;renderGlobal();},'.story-contacts');
  await shot('partner-picker',()=>{__storyVisualReset();state.chronicle.run.scene='practice_partner';state.chronicle.run.name='小音';state.chronicle.run.battle=null;state.chronicle.run.rev++;renderGlobal();},'.cp-partner-picker');
  await shot('battle',()=>{__storyVisualReset();const run=state.chronicle.run;run.name='小音';run.scene='practice_turn';run.battle={context:'weekly',partner:'lala',round:1,hp:12,maxHp:12,pressure:10,over:false,last:'首席举起笔，准备记下你们的第一句。'};run.rev++;renderGlobal();},'.cp-battle-board');
  await shot('performance',()=>{__storyVisualReset();const run=state.chronicle.run;run.name='小音';run.scene='live_play';run.live={scores:[10,6],score:16,diff:35,pos:48,dir:1,phase:'ready',last:'',finished:false,width:24};run.rev++;renderGlobal();},'.cp-live-score');
  await shot('shanqiu-menu',()=>{__storyVisualReset();const run=state.chronicle.run;run.name='小音';run.scene='zhu_offer';run.bar={closed:false,order:null};run.rev++;renderGlobal();},'.shanqiu-menu');
  {
   const fit=await page.evaluate(()=>{const menu=document.querySelector('.shanqiu-menu'),nav=document.querySelector('.main-nav'),decline=menu.querySelector('.shanqiu-decline'),caption=menu.querySelector('.cp-caption');return {menu:menu.getBoundingClientRect(),nav:nav.getBoundingClientRect(),decline:decline.getBoundingClientRect(),caption:caption.getBoundingClientRect(),number:decline.querySelector('.shanqiu-drink-no')?.textContent};});
   assert.equal(fit.number,'05','Shanqiu refusal is a visible numbered option');
   assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('.main-nav')).display),'none','Shanqiu reader hides persistent navigation');
   assert(fit.decline.bottom<=844+1,`Shanqiu decline action stays inside the viewport: ${JSON.stringify(fit)}`);
   assert(fit.caption.bottom<=844+1,`Shanqiu rules stay readable inside the viewport: ${JSON.stringify(fit)}`);
  }

  await shot('shanqiu-menu-no-art',()=>{__storyVisualReset();const run=state.chronicle.run;Object.assign(run,{chapter:4,ch:4,name:'小音',scene:'zhu_offer',week:1});run.bar={closed:true,order:null,returnTo:'c4_intro',closureSeen:true};run.rev++;renderGlobal();},'.shanqiu-menu');

  await shot('text-only-zhu-reply',()=>{__storyVisualReset();const run=state.chronicle.run;Object.assign(run,{chapter:2,ch:2,name:'小音',scene:'zhu_reply',week:1});run.bar={closed:false,order:'decline',returnTo:'c2_intro',closureSeen:false};run.rev++;renderGlobal();},'.cp-novel-text-only');
  await shot('text-only-yangcun',()=>{__storyVisualReset();const run=state.chronicle.run;Object.assign(run,{chapter:2,ch:2,name:'小音',scene:'c2_yangcun',week:1});run.flags.bandGroup=1;run.flags.yangcun=1;run.rev++;renderGlobal();},'.cp-novel-text-only');
  {
   const textOnly=await page.evaluate(()=>{const stage=document.querySelector('.cp-novel-text-only'),dialogue=stage.querySelector('.cp-novel-dialogue'),copy=stage.querySelector('.cp-text'),toolbar=document.querySelector('.story-reader-toolbar'),nav=document.querySelector('.main-nav');return {stage:stage.getBoundingClientRect(),dialogue:dialogue.getBoundingClientRect(),nav:nav.getBoundingClientRect(),viewportHeight:innerHeight,copyColor:getComputedStyle(copy).color,dialogueBackground:getComputedStyle(dialogue).backgroundColor,toolbarBackground:getComputedStyle(toolbar).backgroundColor};});
   assert(textOnly.dialogue.top<textOnly.viewportHeight*.62,`text-only dialogue uses the visual center instead of leaving a blank upper screen: ${JSON.stringify(textOnly)}`);
   assert(textOnly.dialogue.bottom<=textOnly.viewportHeight+1,`text-only dialogue stays inside the viewport: ${JSON.stringify(textOnly)}`);
   assert.notEqual(textOnly.dialogueBackground,'rgba(0, 0, 0, 0)','text-only dialogue has a readable sheet');
   assert.equal(textOnly.toolbarBackground,'rgba(0, 0, 0, 0)','text-only toolbar has no detached full-width slab');
  }

  for(const week of [1,2,3,4,5])await shot(`training-${week}`,week=>{__storyVisualReset();const run=state.chronicle.run;run.name='小音';run.scene='training';run.weekly.trainingWeek=week;run.weekly.training[week]={round:0,points:0,phase:'ready',score:0,step:0,correct:0,message:''};economy().training[`1:${week}`]={paid:true,gain:0};run.rev++;renderGlobal();},'.cp-training-player',week);

  const endingCases=[
   {chapter:1,scene:'title2',ending:'debut'}, {chapter:2,scene:'title3',ending:'c2_dual'},
   {chapter:3,scene:'title4',ending:'c3_he'}, {chapter:4,scene:'title5',ending:'c4_he'},
   {chapter:5,scene:'title6',ending:'c5_he'}, {chapter:6,scene:'title7',ending:'c6_he'}
  ];
  for(const item of endingCases)await shot(`ending-chapter-${item.chapter}`,item=>{__storyVisualReset();state.chronicle.completedChapters=[1,2,3,4,5,6];Object.assign(state.chronicle.run,{chapter:item.chapter,ch:item.chapter,name:'视觉验收',inst:'小提琴',scene:item.scene,ending:item.ending,week:6,tech:24,level:6,live:{scores:[10,10,10,10,10],score:50,diff:24}});state.chronicle.endings=[item.ending];renderGlobal();},'.cp-ending-hero',item);

  await shot('personal-hub-azhe',()=>{__storyVisualReset();const p=state.chronicle.personal;p.active=true;p.selected='azhe';p.unlocks.azhe=true;p.routes.azhe=__storyPersonalRun('hub');renderGlobal();},'.cp-personal-hub');
  await shot('personal-reader-azhe',()=>{__storyVisualReset();const p=state.chronicle.personal;p.active=true;p.selected='azhe';p.unlocks.azhe=true;p.routes.azhe=__storyPersonalRun('azhe_01');renderGlobal();},'.cp-personal-novel');
  await shot('personal-ending-azhe',()=>{__storyVisualReset();const p=state.chronicle.personal;p.active=true;p.selected='azhe';p.unlocks.azhe=true;p.routes.azhe=__storyPersonalRun('complete');p.routes.azhe.ending='azhe_HE';p.routes.azhe.endings=['azhe_HE'];renderGlobal();},'.cp-personal-complete');
  await shot('yangcun-chat',()=>{__storyVisualReset();const p=state.chronicle.personal;p.active=true;p.selected='yangcun';p.storyUnlocks.yangcun=true;p.routes.yangcun=__storyPersonalRun('chat');p.routes.yangcun.chatContacts={goose:true,dayang:true,xiaota:true,rek:true,baoshi:true,feihong:true};renderGlobal();},'.cp-yc-chat');
  await shot('chapter-seven-reader',()=>{__storyVisualReset();state.chronicle.completedChapters=[1,2,3,4,5,6];state.chronicle.chapterSeven={active:true,scene:'q_start',page:0,flags:{},done:{},read:[],ending:null,endings:[],run:1,unity:0,qiqi:0,azhe:0,rev:0,previewed:null};renderGlobal();},'.cp-chapter-seven .cp-novel');
  await shot('chapter-seven-ending',()=>{__storyVisualReset();state.chronicle.completedChapters=[1,2,3,4,5,6,7];state.chronicle.chapterSeven={active:true,scene:'q_badloan',page:0,flags:{},done:{q_badloan:true},read:[],ending:'q_badloan',endings:['q_badloan'],run:1,unity:0,qiqi:0,azhe:0,rev:1,previewed:'q_badloan'};renderGlobal();},'.cp-personal-complete');

  await shot('fusion-reader',()=>{state=freshState();state.sound=false;state.cards.encounters.push('jerry');state.cards.collection.jerry.owned=true;state.affinity.jerry=25;syncUnifiedBonds(state);state.fusion.invited=true;state.fusion.chapter='rl';route('fusion');renderFusion();},'#fusionMain .cp-novel');
  await page.locator('[data-story-tools]:visible').last().click();await page.locator('.story-tools').waitFor();await settle();await page.screenshot({path:'/tmp/hjm-story-matrix-tools-modal.png'});await page.evaluate(()=>closeModal(false));
  await shot('fusion-ending',()=>{state=freshState();state.sound=false;state.cards.encounters.push('jerry');state.cards.collection.jerry.owned=true;state.affinity.jerry=25;syncUnifiedBonds(state);state.fusion.invited=true;state.fusion.chapter='rl';Object.assign(state.fusion.runs.rl,{ended:true,ending:'fs_08',done:['fs_01','fs_02','fs_08'],chatTotal:2,read:['fs_01']});route('fusion');renderFusion();},'.fusion-ending');

  await page.setViewportSize({width:1440,height:1000});
  await shot('desktop-library-main',()=>{state=freshState();state.sound=false;route('chronicle');Chronicle.openLibrary('main');},'.story-library');
  await shot('desktop-week-dashboard',()=>{__storyVisualReset();state.chronicle.run.scene='menu';state.chronicle.run.name='小音';state.chronicle.run.rev++;renderGlobal();},'.story-week');
  await shot('desktop-training',()=>{__storyVisualReset();const run=state.chronicle.run;run.name='小音';run.scene='training';run.weekly.trainingWeek=3;run.weekly.training[3]={round:0,points:0,phase:'ready',score:0,step:0,correct:0,message:''};economy().training['1:3']={paid:true,gain:0};run.rev++;renderGlobal();},'.cp-training-player');
  await shot('desktop-personal-reader',()=>{__storyVisualReset();const p=state.chronicle.personal;p.active=true;p.selected='azhe';p.unlocks.azhe=true;p.routes.azhe=__storyPersonalRun('azhe_01');renderGlobal();},'.cp-personal-novel');
  await shot('desktop-personal-hub',()=>{__storyVisualReset();const p=state.chronicle.personal;p.active=true;p.selected='azhe';p.unlocks.azhe=true;p.routes.azhe=__storyPersonalRun('hub');renderGlobal();},'.cp-personal-hub');
  await shot('desktop-ending-chapter-6',()=>{__storyVisualReset();state.chronicle.completedChapters=[1,2,3,4,5,6];Object.assign(state.chronicle.run,{chapter:6,ch:6,name:'视觉验收',inst:'小提琴',scene:'title7',ending:'c6_he',week:6,tech:24,level:6,live:{scores:[10,10,10,10,10],score:50,diff:24}});state.chronicle.endings=['c6_he'];renderGlobal();},'.cp-ending-hero');
  await shot('desktop-fusion-ending',()=>{state=freshState();state.sound=false;state.cards.encounters.push('jerry');state.cards.collection.jerry.owned=true;state.affinity.jerry=25;syncUnifiedBonds(state);state.fusion.invited=true;state.fusion.chapter='rl';Object.assign(state.fusion.runs.rl,{ended:true,ending:'fs_08',done:['fs_01','fs_02','fs_08'],chatTotal:2,read:['fs_01']});route('fusion');renderFusion();},'.fusion-ending');

  assert.deepEqual(await page.locator('.main-nav .nav-btn').allTextContents(),['排练室','乐团卡册','喵咪小屋','乐团剧情','节奏舞台','空格考验','回忆相册']);
  assert.deepEqual(errors,[]);
  console.log('PASS story visual matrix: libraries, setup, week, contacts, five trainings, battle, performance, bar, six endings, personal, Yangcun, chapter seven, fusion, and tools modal.');
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
