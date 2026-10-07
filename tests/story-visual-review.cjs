const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  const page=await browser.newPage({viewport:{width:768,height:1100},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
  await page.locator('[data-music-enter-muted]').click();

  async function shot(name,setup,selector){
   await page.evaluate(setup);
   await page.locator(selector).waitFor();
   await page.evaluate(()=>{document.querySelectorAll('#toastStack .toast').forEach(node=>node.remove());scrollTo({top:0,behavior:'instant'});});
   const metrics=await page.evaluate(selector=>{
    const node=document.querySelector(selector),rect=node.getBoundingClientRect(),footer=document.querySelector('.page-footer'),header=document.querySelector('.site-header'),nav=document.querySelector('.main-nav'),navRect=nav.getBoundingClientRect();
    return {width:rect.width,height:rect.height,top:rect.top,bottom:rect.bottom,left:rect.left,right:rect.right,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,viewportHeight:innerHeight,footer:footer&&getComputedStyle(footer).display,headerBox:header?.getBoundingClientRect().height||0,navTop:navRect.top,navBottom:navRect.bottom,navPosition:getComputedStyle(nav).position};
   },selector);
   assert(metrics.scrollWidth<=metrics.viewport+1,`${name} has no horizontal overflow: ${JSON.stringify(metrics)}`);
   assert(metrics.left>=-1&&metrics.right<=metrics.viewport+1&&metrics.top<metrics.viewportHeight,`${name} starts inside the viewport: ${JSON.stringify(metrics)}`);
   if(metrics.viewport<=900){assert.equal(metrics.navPosition,'fixed',`${name} keeps the original navigation fixed at the bottom`);assert(Math.abs(metrics.navBottom-metrics.viewportHeight)<=1,`${name} navigation touches the viewport bottom: ${JSON.stringify(metrics)}`);}
   assert.equal(metrics.footer,'none',`${name} hides the generic site footer inside story mode`);
   await page.screenshot({path:`/tmp/hjm-story-review-${name}-768.png`,fullPage:true});
   return metrics;
  }

  await shot('fusion-ending',()=>{state=freshState();state.sound=false;state.cards.encounters.push('jerry');state.cards.collection.jerry.owned=true;state.affinity.jerry=21;state.chronicle.bonds.jerry=21;syncUnifiedBonds(state);state.fusion.invited=true;state.fusion.chapter='rl';Object.assign(state.fusion.runs.rl,{ended:true,ending:'fs_08',done:['fs_01','fs_02','fs_08'],chatTotal:2,read:['fs_01']});save();route('fusion');renderFusion();},'.fusion-ending');
  await shot('chapter-six-ending',()=>{state=freshState();state.sound=false;state.chronicle.completedChapters=[1,2,3,4,5,6];Object.assign(state.chronicle.run,{chapter:6,ch:6,name:'视觉验收',inst:'小提琴',scene:'title7',ending:'c6_he',week:6,tech:24,level:6,live:{scores:[10,10,10,10,10],score:50,diff:24}});state.chronicle.endings=['debut','c2_dual','c3_he','c4_he','c5_he','c6_he'];save();route('chronicle');Chronicle.closeLibrary();renderGlobal();},'.cp-ending-hero');
  await shot('chapter-two-result',()=>{state=freshState();state.sound=false;Object.assign(state.chronicle.run,{chapter:2,ch:2,name:'视觉验收',inst:'小提琴',scene:'live_result',ending:'c2_dual',week:6,tech:18,level:5,live:{scores:[6,10,10,10,10],score:46,diff:18}});route('chronicle');Chronicle.closeLibrary();renderGlobal();},'.cp-surface:has(>.cp-speaker):has(>.cp-ending-hero)');
  await shot('week-dashboard',()=>{state=freshState();state.sound=false;Object.assign(state.chronicle.run,{chapter:2,ch:2,name:'视觉验收',scene:'menu',week:2,tech:14,level:4});state.chronicle.run.weekly.training[1]={round:3,points:270,phase:'done',score:90,step:10,correct:9,message:''};state.chronicle.run.weekly.training[2]={round:3,points:270,phase:'done',score:90,step:10,correct:9,message:''};route('chronicle');Chronicle.closeLibrary();renderGlobal();},'.story-week');

  await page.setViewportSize({width:720,height:1100});
  await shot('fusion-ending-mobile-edge',()=>{state=freshState();state.sound=false;state.cards.encounters.push('jerry');state.cards.collection.jerry.owned=true;state.affinity.jerry=21;state.chronicle.bonds.jerry=21;syncUnifiedBonds(state);state.fusion.invited=true;state.fusion.chapter='rl';Object.assign(state.fusion.runs.rl,{ended:true,ending:'fs_08',done:['fs_01','fs_02','fs_08'],chatTotal:2,read:['fs_01']});save();route('fusion');renderFusion();},'.fusion-ending');
  await shot('chapter-six-ending-mobile-edge',()=>{state=freshState();state.sound=false;state.chronicle.completedChapters=[1,2,3,4,5,6];Object.assign(state.chronicle.run,{chapter:6,ch:6,name:'视觉验收',inst:'小提琴',scene:'title7',ending:'c6_he',week:6,tech:24,level:6,live:{scores:[10,10,10,10,10],score:50,diff:24}});state.chronicle.endings=['debut','c2_dual','c3_he','c4_he','c5_he','c6_he'];save();route('chronicle');Chronicle.closeLibrary();renderGlobal();},'.cp-ending-hero');

  assert.deepEqual(errors,[]);
  console.log('PASS story visual review: fusion, chapter endings, performance result and week dashboard at 768px and the 720px mobile edge.');
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
