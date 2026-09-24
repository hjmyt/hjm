const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
  const checks=await page.evaluate(async()=>{
   const out=[],check=(name,ok)=>{if(!ok)throw Error(name+' at '+state.chronicle.run.scene);out.push(name);};
   const click=async s=>{await new Promise(r=>setTimeout(r,215));const b=document.querySelector(s);if(!b||b.disabled)throw Error('Unavailable '+s);b.click();};
   const choose=n=>click(`[data-cp-choice="${n}"]`);
   const setup=(chapter,scene,aff={},flags={})=>{closeModal(false);state=freshState();state.sound=false;state.chronicle.completedChapters=Array.from({length:chapter-1},(_,i)=>i+1);Object.assign(state.chronicle.run,{chapter,ch:chapter,name:'夏日测试',inst:'长笛',scene,tech:20,level:4,week:6,weekly:{version:2,done:[1,2,3,4,5],active:0,side:[],recaps:{},approach:null,training:{},trainingWeek:1},flags,aff:{...state.chronicle.run.aff,...aff}});save();route('chronicle');};
   const reload=()=>{state=cleanState(JSON.parse(JSON.stringify(state)));save();route('chronicle');};
   const finish=async scores=>{Object.assign(state.chronicle.run,{scene:'live_play',live:{scores,score:scores.reduce((a,b)=>a+b,0),diff:24,pos:0,dir:1,phase:'feedback',last:'测试',finished:false,width:34}});state.chronicle.run.rev++;renderGlobal();await click('[data-cp-action="live-next"]');};
   setup(1,'start');check('Six main chapter tabs and a locked personal chapter',document.querySelectorAll('.cp-chapter-tile').length===7&&document.querySelector('[data-cp-chapter="5"]').disabled&&document.querySelector('[data-cp-chapter="6"]').disabled);
   setup(4,'title5',{shiyuan:80,zhu:14,tim:9});state.chronicle.run.ending='c4_he';state.chronicle.endings=['debut','c2_dual','c3_he','c4_he'];state.chronicle.completedChapters.push(4);state.chronicle.run.rev++;renderGlobal();
   await click('[data-cp-action="switch-chapter"][data-cp-chapter="5"]');
   check('Fifth opens directly with inherited identity and bonds',state.chronicle.run.scene==='c5_intro'&&state.chronicle.run.name==='夏日测试'&&state.chronicle.run.inst==='长笛'&&state.chronicle.run.aff.zhu===14&&state.chronicle.run.aff.tim===9&&$('modalBackdrop').hidden);
   check('Huang unlocks at first mention',cardOwned('huangyx')&&document.querySelector('[data-speaker="huangyx"]'));
   check('No fifth chapter drink menu',!document.querySelector('.shanqiu-menu')&&state.chronicle.run.bar.order===null);
   check('Entry memory saved',state.memories.includes('cp5_entry'));
   await choose(0);check('Camera dialogue assigned to Tang',$('cpStoryText').querySelector('[data-speaker="tangshao"]')&&!$('cpStoryText').textContent.includes('荷鲁斯之眼'));
   await choose(0);await choose(0);await choose(0);await choose(0);check('Fifth weekly loop',state.chronicle.run.scene==='menu');
   await click('[data-cp-action="social"]');await click('[data-cp-person="huangyx"]');check('Huang chat adds global bond',state.chronicle.run.aff.huangyx===1&&$('cpStoryText').textContent.includes('合作方案'));await choose(0);
   state.chronicle.run.aff.shiyuan=98;state.chronicle.bonds.shiyuan=98;await click('[data-cp-action="social"]');await click('[data-cp-person="shiyuan"]');check('Late romance not interrupted at 99',!state.chronicle.run.ending&&state.chronicle.run.aff.shiyuan===99);await choose(0);
   await finish([10,10,10,10,10]);check('Festival win with level increase produces HE',state.chronicle.run.ending==='c5_he'&&state.chronicle.run.level===5);
   check('HE separates Shiyuan and Huang voices',document.querySelectorAll('#cpStoryText [data-speaker]').length===2&&!!document.querySelector('#cpStoryText [data-speaker="huangyx"]'));
   const coins=state.coins;reload();check('Saved ending dialogue survives reload',state.chronicle.run.scene==='c5_he'&&state.coins===coins);await choose(0);
   await click('[data-cp-action="switch-chapter"][data-cp-chapter="6"]');check('Sixth carries global bonds without drinks',state.chronicle.run.scene==='c6_intro'&&state.chronicle.run.aff.zhu===14&&state.chronicle.run.aff.huangyx===1&&!document.querySelector('.shanqiu-menu'));
   await choose(0);const techBeforeProofreading=state.chronicle.run.tech;await choose(1);check('Score proofreading adds skill and Zhu bond',state.chronicle.run.tech===techBeforeProofreading+1&&state.chronicle.run.aff.zhu===19);
   check('Five unique prior HE recognized',$('cpStoryText').textContent.includes('5 场演出 HE'));
   await choose(0);await choose(0);await choose(0);await choose(0);await finish([10,10,10,10,10]);check('Musical HE recorded',state.chronicle.run.ending==='c6_he');await choose(0);check('Season finale opens chapter seven character picker',!!document.querySelector('#cpMain [data-cp-action="personal-picker"]'));
   showLalaJournal(6);check('Sixth journal retains original voice and choices',$('modalContent').textContent.includes('帮他校对和声')&&$('modalContent').textContent.includes('朱老师'));closeModal(false);
   const before=state.coins;await click('[data-cp-action="restart"]');await click('[data-cp-action="confirm-restart"]');check('Restart retains bonds and no ordering',state.chronicle.run.aff.zhu===21&&state.chronicle.run.scene==='c6_intro'&&!document.querySelector('.shanqiu-menu'));await finish([10,10,10,10,10]);check('No repeated ending reward',state.coins===before);
   setup(5,'c5_intro',{shiyuan:79});check('Low bond branch does not reveal Huang',!cardOwned('huangyx')&&!$('cpMain').textContent.includes('黄奕兴'));await choose(0);check('Low bond TE completes chapter',state.chronicle.run.ending==='c5_wind'&&state.chronicle.completedChapters.includes(5));reload();check('Low branch remains locked after migration',!cardOwned('huangyx'));
   for(const [tech,level,scores,id] of [[18,4,[10,10,10,10,10],'c5_be'],[20,3,[10,10,10,10,10],'c5_be'],[20,4,[2,2,2,2,2],'c5_fail']]){setup(5,'menu',{shiyuan:80});Object.assign(state.chronicle.run,{tech,level});await finish(scores);check('Festival outcome '+tech+'/'+level+'/'+scores[0],state.chronicle.run.ending===id);reload();check('Outcome retained '+id,state.chronicle.run.scene===id);}
   setup(5,'b_live',{shiyuan:80});state.chronicle.run.tech=17;state.chronicle.run.rev++;renderGlobal();check('Fifth stage gate uses 18',document.querySelector('#cpStoryText').textContent.includes('上台需要琴技 18'));await choose(0);check('Fifth extra practice advances week and skill',state.chronicle.run.tech===19&&state.chronicle.run.week===7);await choose(0);check('Festival opens above gate',state.chronicle.run.scene==='live_intro');
   setup(6,'b_live',{zhu:10});state.chronicle.endings=['debut','c2_dual','c3_he','c4_he'];state.chronicle.run.tech=19;state.chronicle.run.rev++;renderGlobal();check('Sixth stage gate uses 20',document.querySelector('#cpStoryText').textContent.includes('上台需要琴技 20'));
   setup(6,'b_live',{zhu:9});state.chronicle.endings=['debut','c2_dual','c3_he','c4_he'];state.chronicle.run.rev++;renderGlobal();check('Insufficient Zhu affinity blocks stage',!document.querySelector('[data-cp-action="live-next"]')&&$('cpStoryText').textContent.includes('9/10'));await choose(0);check('Unfinished script branch recorded',state.chronicle.run.ending==='c6_be');await choose(0);
   setup(6,'b_live',{zhu:10});state.chronicle.endings=['debut','c2_dual','c3_he','c3_he'];state.chronicle.run.rev++;renderGlobal();check('Repeating one HE does not count twice',$('cpStoryText').textContent.includes('3/4'));await choose(1);check('Preparation remains available',state.chronicle.run.scene==='menu');
   setup(6,'b_live',{zhu:10});state.chronicle.endings=['debut','c2_dual','c3_he','c4_he'];state.chronicle.run.rev++;renderGlobal();await choose(0);check('Prepared musical reaches stage',state.chronicle.run.scene==='live_intro'&&state.chronicle.run.live.diff===24);await finish([2,2,2,2,2]);check('Musical performance failure becomes TE',state.chronicle.run.ending==='c6_te');
   for(const [ch,id,who,index] of [[5,'c5_band_y','huangyx',0],[5,'c5_band_bao','baoshi',0],[6,'c6_band_zhu','zhu',0],[6,'c6_band_q','qiqi',0]]){setup(ch,id,{shiyuan:80});check('Weekly speaker '+id,!!document.querySelector('#cpStoryText [data-speaker="'+who+'"]'));await choose(index);check('Weekly returns '+id,state.chronicle.run.scene==='menu');}
   setup(5,'c5_intro',{shiyuan:80});route('cards');goCard('huangyx');check('Huang full card renders',cardDef('huangyx').rarity==='UR'&&cardDef('huangyx').stars===5&&$('view-card').textContent.includes('情敌的体面')&&$('view-card').textContent.includes('会议纪要模板')&&!$('view-card').textContent.includes('undefined'));closeModal(false);
   check('Assets referenced externally',ASSETS.cardHuangyx==='assets/huang-yixing.webp');
   state.cards.team=['huangyx'];prepareSourceSkill('huangyx');reload();check('Huang prepared skill persists',state.cards.prepared?.amount===8);check('Huang card stats preserve EX and A',cardDef('huangyx').stats[0][1]==='EX'&&cardDef('huangyx').stats[3][1]==='A');
   setup(5,'title6',{shiyuan:100});state.chronicle.run.ending='c5_wind';state.cards.encounters=[];syncStoryCards(state,false,true);check('Low branch history never invents Huang encounter',!cardOwned('huangyx'));
   setup(1,'start');state.chronicle.endings=['c5_he'];syncStoryCards(state,false,true);check('Recovered festival HE implies Huang encounter',cardOwned('huangyx'));
   setup(6,'c6_intro');Chronicle.requestLegacy({name:'原版',inst:'弦乐',week:2,ch:6,tech:21,scene:'c6_zhu',aff:{zhulaoshi:14,huangyx:7},flags:{}});$('cpConfirmLegacy').click();check('Original sixth save imports with Zhu alias',state.chronicle.run.chapter===6&&state.chronicle.run.scene==='c6_zhu'&&state.chronicle.run.aff.zhu===14&&state.chronicle.run.aff.huangyx===7);
   setup(5,'c5_intro',{shiyuan:80});Chronicle.requestLegacy({name:'原版',inst:'弦乐',week:6,ch:6,tech:22,scene:'c5_he',aff:{shiyuan:90,zhulaoshi:12},flags:{}});$('cpConfirmLegacy').click();check('Original fifth ending stays in fifth',state.chronicle.run.chapter===5&&state.chronicle.run.ending==='c5_he');
   setup(6,'c6_intro',{zhu:10,shiyuan:80});save();return out;
  });
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile overflow');
  await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}'});await page.evaluate(()=>$('toastStack').replaceChildren());await page.screenshot({path:'/tmp/hjm-six-mobile.png',fullPage:true});await page.reload();assert.equal(await page.evaluate(()=>state.chronicle.run.chapter),6);
  assert.deepEqual(errors,[]);console.log(`PASS: ${checks.length} chapter V–VI checks, mobile and reload.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
