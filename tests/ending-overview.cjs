const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
 const checks=await page.evaluate(async()=>{
  const out=[],check=(n,v)=>{if(!v)throw Error(n);out.push(n);},click=async s=>{await new Promise(r=>setTimeout(r,215));const b=document.querySelector(s);if(!b||b.disabled)throw Error('Unavailable '+s);b.click();};
  const setup=()=>{closeModal(false);state=freshState();state.sound=false;state.chronicle.completedChapters=[1,2,3,4,5];Object.assign(state.chronicle.run,{chapter:6,ch:6,name:'结局测试',inst:'长笛',scene:'b_live',week:6,tech:20,aff:{...state.chronicle.run.aff,zhu:20}});save();route('chronicle');};
  const reload=()=>{state=cleanState(JSON.parse(JSON.stringify(state)));save();route('chronicle');};
  const open=()=>click('.cp-end-overview [data-cp-action="gallery"]');
  const row=ch=>document.querySelector('[data-ending-chapter="'+ch+'"]');
  setup();state.chronicle.endings=['ordinary','c2_dual','c3_qiqi','c4_he','c5_fail','c6_he'];state.chronicle.run.rev++;renderGlobal();
  check('HE gate remains two out of four',$('cpStoryText').textContent.includes('HE 2/4'));
  check('Persistent overview shows all ending types',document.querySelector('.cp-end-overview').textContent.includes('HE 3')&&document.querySelector('.cp-end-overview').textContent.includes('TE 2')&&document.querySelector('.cp-end-overview').textContent.includes('BE 1'));
  await click('.cp-end-gate');check('Gate links directly to chapter breakdown',!!row(6));
  check('Contributors are chapters two and four',[2,4].every(ch=>row(ch).querySelector('.cp-end-credit').textContent.includes('已计入'))&&[1,3,5].every(ch=>!row(ch).querySelector('.cp-end-credit').textContent.includes('已计入')));
  check('Each chapter shows acquired type and name',row(1).textContent.includes('TE')&&row(1).textContent.includes('下一次一定行')&&row(3).textContent.includes('BE')&&row(3).textContent.includes('温柔的刀'));
  check('Unread ending names remain concealed',!row(5).textContent.includes('婚礼上的一元')&&!row(4).textContent.includes('远方的机票'));
  check('Sixth HE explicitly excluded from prerequisite',row(6).textContent.includes('不计入前期演出 HE'));
  closeModal(false);state.chronicle.endings.push('debut','c3_he','c3_he');state.chronicle.slots[5]={...Chronicle.fresh().run,chapter:5,ch:6,name:'结局测试',inst:'长笛',scene:'title6',ending:'c5_fail'};reload();check('Four distinct prior HE unlock stage',$('cpStoryText').textContent.includes('大幕即将拉开'));
  await open();check('First GOOD END normalized to HE',row(1).querySelector('[data-ending-type="HE"]')&&row(1).textContent.includes('第一笔合约'));
  check('Multiple past endings retained',row(1).querySelectorAll('.cp-end-earned .cp-end-memory').length===2&&row(3).querySelectorAll('.cp-end-earned .cp-end-memory').length===2);
  check('Duplicate HE ignored',row(3).querySelector('[data-ending-type="HE"]').textContent==='HE 1');
  await click('[data-ending-chapter="5"] [data-cp-action="ending-chapter"]');check('Return button navigates without resetting sixth',currentView==='chronicle'&&state.chronicle.run.chapter===5&&state.chronicle.slots[6].scene==='b_live'&&$('modalBackdrop').hidden);
  await click('.cp-chapter-tile[data-cp-chapter="6"]');check('Return to sixth retains affinity and credit',state.chronicle.run.aff.zhu===20&&$('cpStoryText').textContent.includes('大幕即将拉开'));
  setup();Object.assign(state.chronicle.run,{chapter:3,ch:3,scene:'chat_select',aff:{...state.chronicle.run.aff,shiyuan:98}});state.chronicle.bonds.shiyuan=98;state.chronicle.run.rev++;renderGlobal();await click('[data-cp-person="shiyuan"]');check('Shared BE stores originating chapter',state.chronicle.chapterEndings[3].includes('shadow'));
  await click('[data-cp-action="restart"]');await click('[data-cp-action="confirm-restart"]');reload();await open();check('Shared BE remains in correct chapter after restart',row(3).textContent.includes('团长的影子')&&![1,2,4].some(ch=>row(ch).textContent.includes('团长的影子')));closeModal(false);
  setup();state.chronicle.endings=['shadow'];reload();await open();check('Unknown legacy BE not fabricated in four chapters',[1,2,3,4].every(ch=>!row(ch).textContent.includes('团长的影子'))&&$('modalContent').textContent.includes('早期存档 · 未注明章节'));closeModal(false);
  setup();state.chronicle.slots[2]={...Chronicle.fresh().run,chapter:2,ch:3,name:'结局测试',scene:'title3',ending:'c2_dual'};reload();await open();check('Old chapter snapshot contributes matching HE',row(2).textContent.includes('本章存档：HE · 双核')&&row(2).textContent.includes('已计入'));closeModal(false);
  setup();state.chronicle.chapterEndings={1:['c6_he','missing'],2:['c2_dual','c2_dual'],6:['shadow']};reload();check('Invalid chapter history filtered',state.chronicle.chapterEndings[1].length===0&&state.chronicle.chapterEndings[2].length===1&&state.chronicle.chapterEndings[6].length===0);
  setup();state.chronicle.endings=['ordinary','c2_dual','c3_qiqi','c4_he','c5_fail'];reload();await open();save();return out;
 });
 await page.screenshot({path:'/tmp/hjm-ending-overview-desktop.png'});await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.querySelector('.modal').scrollWidth<=document.querySelector('.modal').clientWidth),'mobile overflow');await page.screenshot({path:'/tmp/hjm-ending-overview-mobile.png'});
 await page.reload();await page.evaluate(()=>route('chronicle'));const restored=await page.locator('.cp-end-overview').textContent();assert(restored.includes('2 章 / 至少 4 章'),'reload retains counters: '+restored);for(const scene of ['c6_warn','b_live']){await page.evaluate(scene=>{state.chronicle.endings=['debut','c2_dual','c3_he','c4_he'];state.chronicle.run.scene=scene;state.chronicle.run.rev++;save();},scene);await page.reload();assert.equal(await page.evaluate(()=>state.chronicle.run.scene),scene,'Cold load retains '+scene);await page.evaluate(()=>route('chronicle'));assert((await page.locator('.cp-end-overview').textContent()).includes('4 章 / 至少 4 章'),'Cold load counts four HE at '+scene);}
 assert.deepEqual(errors,[]);console.log('PASS: '+checks.length+' ending overview checks, persisted counters, desktop and mobile.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
