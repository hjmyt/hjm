const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
(async () => {
 const browser = await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE} : {})});
 try {
  const page = await browser.newPage({viewport:{width:1440,height:1000}, reducedMotion:'reduce'}), errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
  const result = await page.evaluate(async () => {
   const checks=[], traces={};
   const check=(name,ok)=>{if(!ok)throw Error(name+' at '+state.chronicle.run.chapter+':'+state.chronicle.run.week+':'+state.chronicle.run.scene);checks.push(name);};
   const click=async sel=>{await new Promise(r=>setTimeout(r,210));const b=document.querySelector(sel);if(!b||b.disabled)throw Error('Unavailable '+sel+' at '+state.chronicle.run.scene);b.click();};
   const action=a=>click(`[data-cp-action="${a}"]`), choice=i=>click(`[data-cp-choice="${i}"]`);
   const setup=ch=>{
    closeModal(false); state=freshState();state.sound=false;state.coins=100;
    Object.assign(state.chronicle.run,{chapter:ch,ch,name:'每周测试',inst:'长笛',tech:30,level:5,scene:ch===1?'s_door':`c${ch}_intro`});
    state.chronicle.completedChapters=Array.from({length:ch-1},(_,i)=>i+1);
    state.chronicle.endings=['debut','c2_dual','c3_he','c4_he'];
    for(const k of Object.keys(state.affinity)) state.affinity[k]=85;
    Chronicle.syncBonds(state.chronicle,state.affinity);save();route('chronicle');
   };
   const read=async()=>{
    const r=state.chronicle.run;
    if(r.scene==='practice_partner') await click('[data-cp-action="partner"][data-cp-person="shiyuan"]');
    else if(r.scene==='practice_turn') await click('[data-cp-action="battle"][data-cp-battle="duet"]');
    else if(r.scene==='practice_result') await action('practice-continue');
    else await choice(r.scene==='zhu_offer'?4:0);
   };
   for(let ch=1;ch<=6;ch++) {
    setup(ch);traces[ch]=[];
    let count=0;
    while(state.chronicle.run.week<6 && ++count<100) {
     const r=state.chronicle.run;traces[ch].push([r.week,r.scene]);
     if(r.scene==='menu') {
      check(ch+' week card '+r.week,document.querySelector('.cp-week-story h3').textContent===ChronicleWeeks[ch][r.week-1].title);
      if(r.weekly.done.includes(r.week)) {
       check('Recap exists '+ch+':'+r.week,!!r.weekly.recaps[r.week]);
       const week=r.week;
       await action('end-week');
       check('One click enters next story '+ch+':'+week,r.week===week+1&&r.scene!=='menu'&&!document.querySelector('[data-cp-action="week-story"]'));
      } else {
       check('Next week disabled before core',document.querySelector('[data-cp-action="end-week"]').disabled);
       // DOM tampering cannot skip a core week or open the stage early.
       const week=r.week, forged=document.createElement('button');forged.dataset.cpAction='end-week';document.body.append(forged);
       await new Promise(r=>setTimeout(r,210));forged.click();forged.remove();check('Handler protects unfinished core',r.week===week);
       await action('week-story');
      }
     } else await read();
    }
    check('All five weeks completed '+ch, [1,2,3,4,5].every(n=>state.chronicle.run.weekly.done.includes(n)));
    while(state.chronicle.run.scene.startsWith('c'+ch+'_jeal')) await read();
    check('Week six opens stage directly '+ch,state.chronicle.run.scene==='b_live');
    check('Unique weekly titles '+ch,new Set(ChronicleWeeks[ch].map(p=>p.title)).size===6);
    for(let w=1;w<=5;w++) check('Authored root at correct week '+ch+':'+w,traces[ch].some(([n,s])=>n===w&&s===ChronicleWeeks[ch][w-1].scene));
    const before=JSON.stringify(state.chronicle.run.weekly);
    state=cleanState(JSON.parse(JSON.stringify(state)));route('chronicle');
    check('Weekly save roundtrip '+ch,JSON.stringify(state.chronicle.run.weekly)===before);
    check('Stage survives cleaning '+ch,state.chronicle.run.scene==='b_live');
    await choice(0);check('Original stage intact '+ch,state.chronicle.run.scene==='live_intro');
   }
   // Old pending menus still work; forged advancement cannot skip their unfinished core.
   for(let ch=1;ch<=6;ch++) {
    setup(ch);const r=state.chronicle.run;
    Object.assign(r,{week:2,scene:'menu',weekly:{version:1,done:[1],active:0,side:[],recaps:{1:'已完成'},approach:null}});
    r.rev++;renderGlobal();
    const button=document.querySelector('[data-cp-action="end-week"]');
    check('Pending old menu blocks next week '+ch,button.disabled);
    button.disabled=false;await action('end-week');
    check('Forged next cannot skip '+ch,r.week===2&&r.scene==='menu');
    await action('week-story');
    check('Old pending menu still starts '+ch,r.scene===ChronicleWeeks[ch][1].scene&&r.weekly.active===2);
   }
   // Both new rehearsal choices have different prose, persist mid-scene and grant no resources.
   for(const ch of [5,6])for(const selected of [0,1]) {
    setup(ch);Object.assign(state.chronicle.run,{week:5,scene:'weekly_prep',weekly:{version:1,done:[1,2,3,4],active:5,side:[],recaps:{},approach:null}});state.chronicle.run.rev++;renderGlobal();
    const resources=JSON.stringify([state.coins,state.affinity,state.chronicle.run.tech]);
    await choice(selected);check('Preparation response '+ch+':'+selected,state.chronicle.run.scene==='weekly_reply'&&state.chronicle.run.weekly.approach===selected);
    state=cleanState(JSON.parse(JSON.stringify(state)));route('chronicle');check('Midweek response survives cleaning',state.chronicle.run.weekly.active===5&&state.chronicle.run.weekly.approach===selected);
    await choice(0);check('Preparation records week without rewards',state.chronicle.run.weekly.done.includes(5)&&resources===JSON.stringify([state.coins,state.affinity,state.chronicle.run.tech]));
   }
   // Optional stories neither complete nor block the core; stale double-click cannot charge twice.
   setup(4);Object.assign(state.chronicle.run,{week:2,scene:'menu',weekly:{version:1,done:[1],active:0,side:[],recaps:{1:'已完成'},approach:null}});
   // Explicitly encountered character makes this optional scene available.
   state.cards.encounters.push('lemon');syncStoryCards(state);state.chronicle.run.rev++;renderGlobal();
   // Force the appropriate encounter through its already-read source node if card ownership was not reconstructed.
   if(!cardOwned('lemon')) {state.chronicle.run.journal.push({chapter:4,week:2,scene:'c4_band_lemon',who:'lemon',text:'柠檬',choice:null});syncStoryCards(state);state.chronicle.run.rev++;renderGlobal();}
   await click('[data-cp-action="week-side"][data-cp-event="c4_band_lemon"]');await choice(1);await choice(0);
   check('Side choice leaves main pending',!state.chronicle.run.weekly.done.includes(2));
   check('Side cannot replay in run',document.querySelector('[data-cp-event="c4_band_lemon"]').disabled);
   await action('week-story');check('Main remains reachable',state.chronicle.run.scene==='c4_prep');
   // Legacy migration preserves seen opening, scene, balances and history; repeated cleaning is stable.
   setup(3);let raw=JSON.parse(JSON.stringify(state));delete raw.chronicle.run.weekly;Object.assign(raw.chronicle.run,{scene:'menu',week:1});
   state=cleanState(raw);check('Old menu carries read opening',state.chronicle.run.weekly.done.includes(1)&&state.chronicle.run.weekly.done.includes(5)&&state.coins===100);
   const stable=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);const once=stable(state.chronicle);state=cleanState(JSON.parse(JSON.stringify(state)));check('Migration idempotent',stable(state.chronicle)===once);
   delete raw.chronicle.run.weekly;raw.chronicle.run.scene='c3_ge_a';state=cleanState(raw);check('Mid-dialogue old save continues in correct week',state.chronicle.run.scene==='c3_ge_a'&&state.chronicle.run.week===4&&state.chronicle.run.weekly.active===4);
   // Earlier endings remain possible, no need to clear six weeks.
   setup(2);state.chronicle.run.scene='c2_night';state.chronicle.run.rev++;renderGlobal();await choice(1);check('Pop ending retained',state.chronicle.run.ending==='c2_street');
   setup(5);state.affinity.shiyuan=0;state.chronicle.run.rev++;renderGlobal();await choice(0);check('Fifth chapter short ending retained',state.chronicle.run.ending==='c5_wind');
   setup(1);state.chronicle.run.scene='s_dream';state.chronicle.run.rev++;renderGlobal();await choice(2);check('Explicit shadow ending retained',state.chronicle.run.ending==='shadow');
   // Fresh restart must reset weekly progress, not global balances or bond claims.
   setup(4);state.chronicle.run.weekly.done=[1,2];state.chronicle.run.weekly.active=0;
   await action('restart');await action('confirm-restart');check('Restart schedules first week',state.chronicle.run.week===1&&state.chronicle.run.weekly.active===1&&state.chronicle.run.weekly.done.length===0&&state.coins===100);
   setup(1);state.chronicle.run.scene='zhu_offer';state.chronicle.run.bar.returnTo='s_first';state.chronicle.run.rev++;save();renderGlobal();
   return {count:checks.length,traces};
  });
  await page.reload();await page.evaluate(()=>route('chronicle'));
  for(const width of [1440,390]) {
   await page.setViewportSize({width,height:900});
   for(const scene of ['start','s_room','zhu_offer','zhu_reply','menu']) {
    await page.evaluate(scene=>{state.chronicle.run.scene=scene;state.chronicle.run.rev++;renderGlobal();},scene);
    const images=page.locator('.cp-story-art img');
    if(await images.count()) assert(await images.evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode().then(()=>i.naturalWidth>0)))).then(v=>v.every(Boolean)),'Attachment loads');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),scene+' mobile layout');
    await page.locator('#cpMain').screenshot({path:`/tmp/hjm-weekly-${scene}-${width}.png`});
   }
  }
  assert.deepEqual(errors,[]);
  console.log(`PASS: ${result.count} weekly-flow checks, all six chapters, guards, branches, optional choices, migration/restart, attachment loading, actual reload and desktop/mobile layout.`);
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
