const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
  const result=await page.evaluate(()=>{
   let count=0;const traces={};
   let now=performance.now();performance.now=()=>now;
   const check=(ok,label)=>{if(!ok)throw Error(label+' at '+state.chronicle.run.chapter+':'+state.chronicle.run.week+':'+state.chronicle.run.scene);count++;};
   const click=sel=>{now+=250;const b=document.querySelector(sel);check(b&&!b.disabled,'Available '+sel);b.click();};
   const setup=ch=>{
    closeModal();state=freshState();state.sound=false;state.coins=100;
    Object.assign(state.chronicle.run,{chapter:ch,ch,name:'连贯测试',inst:'长笛',tech:30,level:ch===2?6:5,scene:ch===1?'s_door':`c${ch}_intro`});
    state.chronicle.completedChapters=Array.from({length:ch-1},(_,i)=>i+1);
    for(const k of Object.keys(state.affinity))state.affinity[k]=85;
    Chronicle.syncBonds(state.chronicle,state.affinity);route('chronicle');
   };
   const read=()=>{
    const s=state.chronicle.run.scene;
    if(s==='practice_partner')click('[data-cp-action="partner"][data-cp-person="shiyuan"]');
    else if(s==='practice_turn')click('[data-cp-action="battle"][data-cp-battle="duet"]');
    else if(s==='practice_result')click('[data-cp-action="practice-continue"]');
    else click(`[data-cp-choice="${s==='zhu_offer'?4:0}"]`);
   };
   const front={1:[1,2,3,4],2:[1,2,3,4],3:[1,2,3],4:[1,2,3,4],5:[1,2,3,4],6:[1,2,3,4]};
   for(let ch=1;ch<=6;ch++){
    setup(ch);traces[ch]=[];let guard=0;
    while(state.chronicle.run.scene!=='menu'&&guard++<80){traces[ch].push([state.chronicle.run.week,state.chronicle.run.scene]);read();}
    check(guard<80,'Opening terminates');
    check(state.chronicle.run.week===1,'Continuous opening stays in week one');
    check(front[ch].every(n=>state.chronicle.run.weekly.done.includes(n)),'Complete front story before training');
    check(front[ch].every(n=>traces[ch].some(([w,s])=>w===1&&s===ChronicleWeeks[ch][n-1].scene)),'All front roots seen together');
    check(!!document.querySelector('.cp-training-hub'),'Training hub follows opening');
    check(document.querySelectorAll('.cp-training-card:not(:disabled)').length===1,'Only first training initially open');
    while(state.chronicle.run.week<6){
     const before=state.chronicle.run.week;click('[data-cp-action="end-week"]');
     check(state.chronicle.run.week===before+1,'Exactly one week advances');
     if(state.chronicle.run.week===6)break;
     let late=0;
     while(state.chronicle.run.scene!=='menu'&&late++<30){traces[ch].push([state.chronicle.run.week,state.chronicle.run.scene]);read();}
     check(late<30,'Late story returns to training');
     check(document.querySelectorAll('.cp-training-card:not(:disabled)').length===state.chronicle.run.week,'Previous training remains available');
    }
    check(state.chronicle.run.scene==='b_live','Week six opens stage');
    check([1,2,3,4,5].every(n=>state.chronicle.run.weekly.done.includes(n)),'All main stories retained');
    for(const n of [1,2,3,4,5].filter(n=>!front[ch].includes(n)))check(traces[ch].some(([w,s])=>w===n&&s===ChronicleWeeks[ch][n-1].scene),'Late scene timing '+n);
    const saved=JSON.parse(JSON.stringify(state));state=cleanState(saved);route('chronicle');
    check(state.chronicle.run.scene==='b_live'&&state.chronicle.run.week===6,'Save keeps stage progress');
   }
   // Forced failed admission assessment still continues to the entire opening and training.
   setup(1);Object.assign(state.chronicle.run,{scene:'s_first',tech:5,level:1});state.chronicle.run.weekly.done=[1];state.chronicle.run.weekly.active=2;
   for(const k of Object.keys(state.affinity))state.affinity[k]=0;
   Chronicle.syncBonds(state.chronicle,state.affinity);state.chronicle.run.rev++;renderGlobal();
   click('[data-cp-choice="0"]');click('[data-cp-action="partner"][data-cp-person="lala"]');
   const random=Math.random;Math.random=()=>.99;
   while(state.chronicle.run.scene==='practice_turn')click('[data-cp-action="battle"][data-cp-battle="stable"]');Math.random=random;
   check(!state.chronicle.run.battle.win,'Failed admission fixture');
   let guard=0;while(state.chronicle.run.scene!=='menu'&&guard++<30)read();
   check(state.chronicle.run.scene==='menu'&&!!document.querySelector('.cp-training-hub'),'Failure reaches training without retry loop');
   // Previous weekly saves continue their exact scene and skip already read roots.
   setup(1);const old=JSON.parse(JSON.stringify(state));
   Object.assign(old.chronicle.run,{week:3,scene:'gig',weekly:{version:1,done:[1,2],active:3,side:[],recaps:{1:'已读'},approach:null}});
   state=cleanState(old);route('chronicle');
   check(state.chronicle.run.week===3&&state.chronicle.run.scene==='gig','Old weekly scene preserved');
   const before=JSON.stringify(state.chronicle.run.weekly);state=cleanState(JSON.parse(JSON.stringify(state)));
   check(JSON.stringify(state.chronicle.run.weekly)===before,'Migration idempotent');
   route('chronicle');read();check(state.chronicle.run.scene==='s_conflict','Old save proceeds to next unread scene');
   setup(2);Object.assign(state.chronicle.run,{scene:'c2_night',level:5});state.chronicle.run.rev++;renderGlobal();check(document.querySelectorAll('[data-cp-choice]').length===2,'Low level still receives both grouping choices');click('[data-cp-choice="0"]');check(state.chronicle.run.scene==='c2_str'&&!state.chronicle.run.ending&&state.chronicle.run.flags.strGroup===1,'Low level can choose strings and continue normally');
   setup(2);Object.assign(state.chronicle.run,{scene:'c2_night',level:5});state.chronicle.run.rev++;renderGlobal();click('[data-cp-choice="1"]');check(state.chronicle.run.ending==='c2_street'&&state.chronicle.run.flags.popGroup===1,'Only choosing band below level six enters street ending');
   setup(2);Object.assign(state.chronicle.run,{scene:'c2_night_pre',level:6});state.chronicle.run.rev++;renderGlobal();check(document.querySelectorAll('[data-cp-choice]').length===2&&!state.chronicle.run.flags.yangcun&&!state.chronicle.run.flags.strGroup,'Grouping choices appear on Jerry scene without a default');click('[data-cp-choice="1"]');check(state.chronicle.run.scene==='c2_yangcun'&&state.chronicle.run.flags.yangcun===1,'Level six can enter Yangcun band branch');state=cleanState(JSON.parse(JSON.stringify(state)));route('chronicle');check(state.chronicle.run.scene==='c2_yangcun','Yangcun confirmation survives refresh');click('[data-cp-choice="1"]');check(state.chronicle.run.scene==='c2_night'&&!state.chronicle.run.flags.yangcun&&document.querySelectorAll('[data-cp-choice]').length===2,'Band confirmation can return to grouping choices');
   setup(5);state.affinity.shiyuan=0;state.chronicle.run.rev++;renderGlobal();click('[data-cp-choice="0"]');check(state.chronicle.run.ending==='c5_wind','Early low-bond ending retained');
   setup(1);state.chronicle.run.scene='menu';state.chronicle.run.weekly.active=0;state.chronicle.run.weekly.done=[1,2,3,4];state.chronicle.run.rev++;save();renderGlobal();
   return {count,traces};
  });
  await page.reload();await page.evaluate(()=>route('chronicle'));
  for(const width of [1440,390]){await page.setViewportSize({width,height:1000});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('#cpMain').screenshot({path:`/tmp/hjm-training-hub-${width}.png`});}
  assert.deepEqual(errors,[]);console.log(`PASS: ${result.count} checks; six continuous openings, late events, training weeks, failed assessment, legacy migration, early endings and layouts.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
