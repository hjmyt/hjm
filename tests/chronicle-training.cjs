const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'}),errors=[];let checks=0;
  page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
  const clock=()=>page.evaluate(async()=>{window.__now=performance.now();performance.now=()=>window.__now;state.sound=true;await ensureAudio();Object.defineProperty(audioCtx,'currentTime',{configurable:true,get:()=>window.__now/1000});});await clock();
  const check=(ok,label)=>{assert(ok,label);checks++;};
  const click=sel=>page.evaluate(sel=>{window.__now+=250;const b=document.querySelector(sel);if(!b||b.disabled)throw Error('Unavailable '+sel);b.click();},sel);
  const action=a=>click(`[data-cp-action="${a}"]`);
  await page.evaluate(()=>{state=freshState();state.sound=true;state.coins=100;Object.assign(state.chronicle.run,{name:'训练测试',inst:'弦乐',scene:'menu',week:5});state.chronicle.run.weekly.done=[1,2,3,4,5];state.chronicle.run.weekly.active=0;route('chronicle');});
  // A locked future week is guarded in the handler; the current free exercise opens at zero balance.
  check(await page.evaluate(()=>{const r=state.chronicle.run;r.week=1;state.coins=0;const old=JSON.stringify([r.tech,state.economy]);window.__now+=250;const b=document.createElement('button');b.dataset.cpAction='training-start';b.dataset.cpWeek=5;document.body.append(b);b.click();b.remove();return r.scene==='menu'&&state.coins===0&&JSON.stringify([r.tech,state.economy])===old;}),'Future-week execution guard');
  await click('[data-cp-action="training-start"][data-cp-week="1"]');
  check(await page.evaluate(()=>state.coins===0&&state.chronicle.run.scene==='training'&&state.economy.training['1:1'].paid),'Current weekly training opens free at zero balance');
  await page.evaluate(()=>{state.coins=100;Object.assign(state.chronicle.run,{scene:'menu',week:5});state.chronicle.run.rev++;renderGlobal();});
  await click('[data-cp-action="training-start"][data-cp-week="1"]');
  check(await page.evaluate(()=>state.coins===100&&state.economy.training['1:1'].paid),'Opening and resuming training never deduct notes');
  await action('training-begin');
  // A run with no input cannot receive rewards.
  await page.evaluate(()=>{window.__now+=10000;});await page.waitForTimeout(80);
  check(await page.evaluate(()=>state.chronicle.run.weekly.training[1].score===0&&!state.economy.training['1:1'].gain),'No-input round yields zero');
  await submitEar(true);
  await action('training-next');await action('training-begin');
  await page.evaluate(()=>route('album'));
  check(await page.evaluate(()=>state.chronicle.run.weekly.training[1].phase==='ready'&&state.coins===100),'Navigation pauses without charging');
  await page.evaluate(()=>route('chronicle'));
  await page.reload();await clock();await page.evaluate(()=>route('chronicle'));
  // The redesigned story entry intentionally opens the chapter library after a
  // reload. Resume the saved chapter before exercising the recovered round.
  await click('[data-story-read="1"]');
  check(await page.evaluate(()=>state.coins===100&&state.chronicle.run.scene==='training'&&state.chronicle.run.weekly.training[1].round===1),'Reload preserves free enrollment and completed rounds');
  for(let i=1;i<3;i++){
   await action('training-begin');await page.evaluate(()=>{window.__now+=10000;});await page.waitForTimeout(80);
   await submitEar(true);
   if(i<2)await action('training-next');
  }
  check(await page.evaluate(()=>state.chronicle.run.weekly.training[1].phase==='result'&&state.chronicle.run.tech===5),'Failed full attempt grants no growth');
  await action('training-retry');check(await page.evaluate(()=>state.coins===100),'Failure retry is free');
  async function submitEar(wrong=false){
   await page.waitForFunction(()=>state.chronicle.run.weekly.training[1].phase==='input');
   const c=await page.evaluate(()=>chronicleEarChart(state.chronicle.run.chapter,state.chronicle.run.weekly.training[1].round));
   for(const i of c.blanks)await click(`[data-cp-action="training-ear-answer"][data-cp-answer="${wrong?c.notes[i]%7+1:c.notes[i]}"]`);
   await action('training-ear-submit');
  }
  async function solveRound(jitter=0,wrongIndices=[]){
   await action('training-begin');
   const type=await page.evaluate(()=>document.querySelector('.cp-ear')?'ear':document.querySelector('.cp-note-pads')?'memory':document.querySelector('.cp-pulse')?'pulse':'timed');
   if(type==='ear'){
    await page.waitForFunction(()=>document.querySelector('#cpTrainingStatus').textContent.includes('准备听'));
    await page.evaluate(()=>window.__now+=10000);await page.waitForTimeout(80);
    const first=await page.evaluate(()=>state.chronicle.run.weekly.training[1].round===0);
    await submitEar(jitter>0&&first);
   }else if(type==='timed'){
    const timing=await page.evaluate(()=>({start:window.__now+1000,beat:Number(document.querySelector('.cp-training-beats').dataset.beatMs),targets:[...document.querySelectorAll('.cp-beat-cell')].flatMap((e,i)=>e.classList.contains('mine')?[i]:[]),total:document.querySelectorAll('.cp-beat-cell').length}));
    for(const n of timing.targets){
     await page.evaluate(({time})=>{window.__now=time;document.querySelector('[data-cp-action="training-tap"]').click();},{time:timing.start+n*timing.beat+timing.beat*jitter});
    }
    await page.evaluate(time=>{window.__now=time;},timing.start+timing.total*timing.beat+400);await page.waitForTimeout(80);
   }else if(type==='memory'){
    const notes=[];let last=0;
    for(let i=0;i<45;i++){
     await page.evaluate(()=>{window.__now+=250;});await page.waitForTimeout(45);
     const seen=await page.evaluate(()=>({text:document.querySelector('#cpTrainingStatus').textContent,active:[...document.querySelectorAll('.cp-note-pad')].findIndex(e=>e.classList.contains('active')),phase:state.chronicle.run.weekly.training[state.chronicle.run.weekly.trainingWeek].phase}));
     if(seen.phase==='input')break;
     const n=Number(/示范 (\d+)/.exec(seen.text)?.[1]);if(n>last){assert.equal(n,last+1,'No demo notes skipped');notes.push(seen.active);last=n;}
    }
    check(notes.length===10,'Complete ten-note melody demo');
    for(const [i,n] of notes.entries()){
     await click(`[data-cp-action="training-answer"][data-cp-answer="${wrongIndices.includes(i)?(n+1)%4:n}"]`);
     if(i<9)check(await page.evaluate(i=>{const t=state.chronicle.run.weekly.training[state.chronicle.run.weekly.trainingWeek];return t.phase==='input'&&t.step===i+1;},i),'Every input before ten keeps the round open');
     if(i===3)check(await page.evaluate(()=>{const t=state.chronicle.run.weekly.training[state.chronicle.run.weekly.trainingWeek];return t.phase==='input'&&t.step===4&&document.querySelector('#cpTrainingStatus').textContent.includes('4 / 10');}),'Four inputs do not finish a ten-note melody');
    }
   }else{
    const data=await page.evaluate(()=>({start:window.__now+Number(document.querySelector('#cpPulseField').dataset.lead),end:Number(document.querySelector('#cpPulseField').dataset.end),notes:[...document.querySelectorAll('[data-note]')].map(n=>({at:Number(n.dataset.at),lane:Number(n.dataset.lane)})).sort((a,b)=>a.at-b.at)}));
    for(const n of data.notes)await page.evaluate(({n,start})=>{window.__now=start+n.at;document.dispatchEvent(new KeyboardEvent('keydown',{code:['KeyD','KeyF','KeyJ','KeyK'][n.lane],bubbles:true}));},{n,start:data.start});
    await page.evaluate(now=>window.__now=now,data.start+data.end+400);await page.waitForFunction(()=>['feedback','result'].includes(state.chronicle.run.weekly.training[state.chronicle.run.weekly.trainingWeek].phase));
   }
   check(await page.evaluate(()=>['feedback','result'].includes(state.chronicle.run.weekly.training[state.chronicle.run.weekly.trainingWeek].phase)),'Exercise completes from real controls: '+JSON.stringify(await page.evaluate(()=>({week:state.chronicle.run.weekly.trainingWeek,t:state.chronicle.run.weekly.training[state.chronicle.run.weekly.trainingWeek]})))+' errors: '+errors.join('; '));
  }
  // A partial attempt earns the first point without completing the training.
  for(let round=0;round<3;round++){
   await action('training-begin');await page.evaluate(()=>{window.__now+=10000;});await page.waitForTimeout(80);
   await submitEar(round!==0);
   if(round<2)await action('training-next');
  }
  check(await page.evaluate(()=>{const r=state.chronicle.run,e=state.economy.training['1:1'];return r.weekly.training[1].score>0&&r.weekly.training[1].score<60&&r.tech===6&&e.gain===1&&document.querySelector('.cp-training-result')?.textContent.includes('+1/3');}),'Partial score earns first technique point and shows cumulative cap');
  check(await page.evaluate(()=>cleanEconomy({training:{'1:1':{paid:true,gain:1}}}).training['1:1'].gain===1),'Partial reward survives save normalization');
  await action('training-back');
  check((await page.locator('[data-cp-action="training-start"][data-cp-week="1"]').textContent()).includes('继续练习'),'Partial reward does not mark training complete');
  await click('[data-cp-action="training-start"][data-cp-week="1"]');await action('training-retry');
  for(let week=1;week<=5;week++){
   if(week>1)await click(`[data-cp-action="training-start"][data-cp-week="${week}"]`);
   for(let round=0;round<3;round++){await solveRound(week===1?.27:0);if(round<2)await action('training-next');}
   check(await page.evaluate(week=>state.economy.training['1:'+week].gain===(week===1?2:3),week),'Base/excellent reward '+week);
   await action('training-back');
  }
  check(await page.evaluate(()=>state.coins===100&&state.chronicle.run.tech===19),'Five free trainings fit stage target with bounded growth');
  await click('[data-cp-action="training-start"][data-cp-week="1"]');await action('training-retry');
  for(let round=0;round<3;round++){await solveRound();if(round<2)await action('training-next');}
  check(await page.evaluate(()=>state.coins===100&&state.chronicle.run.tech===20&&state.economy.training['1:1'].gain===3),'Free replay pays only the missing point up to the cap');
  await action('training-back');
  await click('[data-cp-action="training-start"][data-cp-week="2"]');await action('training-retry');
  await solveRound(0,[0,4,9]);
  check(await page.evaluate(()=>state.chronicle.run.weekly.training[2].score===70),'Wrong first/middle/last notes finish only at ten, score 70');
  await action('training-next');await solveRound();
  check(await page.evaluate(()=>state.chronicle.run.weekly.training[2].score===100),'Correct count resets between rounds');
  await action('training-next');await solveRound(0,[0,1,2,3,4,5,6,7,8,9]);
  check(await page.evaluate(()=>{const t=state.chronicle.run.weekly.training[2];return t.phase==='result'&&t.points===170&&t.score===57&&state.coins===100&&state.chronicle.run.tech===20&&state.economy.training['1:2'].gain===3;}),'Lower replay score never reduces or repeats claimed growth');
  await action('training-back');await action('restart');await action('confirm-restart');
  check(await page.evaluate(()=>state.chronicle.run.tech===20&&state.coins===100&&state.chronicle.run.week===1),'Restart retains learned training without re-award');
  await page.reload();await clock();await page.evaluate(()=>route('chronicle'));
  check(await page.evaluate(()=>state.economy.training['1:5'].gain===3&&state.chronicle.run.tech===20),'Training ledger survives real reload');
  // A saved unfinished free training can always be resumed after a restart.
  await page.evaluate(()=>{Chronicle.closeLibrary();Object.assign(state.chronicle.run,{chapter:2,ch:2,week:3,scene:'menu'});state.chronicle.run.weekly.done=[1,2,3,4,5];state.chronicle.run.weekly.active=0;state.chronicle.run.flags.strGroup=1;state.coins=10;state.chronicle.run.rev++;renderGlobal();});
  await click('[data-cp-action="training-start"][data-cp-week="3"]');await action('training-back');await action('restart');await action('confirm-restart');
  check(await page.evaluate(()=>state.economy.training['2:3'].paid&&state.coins===10),'Unfinished free enrollment survives restart');
  check(await page.evaluate(()=>[1,2,3,4,5,6].map(ch=>Chronicle.requiredTech({chapter:ch})).join(',')==='12,14,16,18,20,22'),'Stage technique rises in every chapter');
  // Responsive fixtures include each different interaction, an untrained stage gate, and muted demo.
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1100});
   for(let week=1;week<=5;week++){
    await page.evaluate(week=>{Chronicle.suspend();const r=state.chronicle.run;Object.assign(r,{chapter:1,week:5,scene:'menu'});r.weekly.training={};r.weekly.done=[1,2,3,4,5];r.weekly.active=0;r.rev++;renderGlobal();},week);
    await click(`[data-cp-action="training-start"][data-cp-week="${week}"]`);
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Training fits '+width+':'+week);
    await page.locator('#cpMain').screenshot({path:`/tmp/hjm-training-${week}-${width}.png`});await action('training-back');
   }
   await page.evaluate(()=>{const r=state.chronicle.run;Object.assign(r,{week:6,scene:'b_live',tech:5});r.rev++;renderGlobal();});
   check((await page.locator('.cp-training-gate').textContent()).includes('7'),'Exact remaining-tech guidance');
   await click('.cp-training-gate [data-cp-action="menu"]');
   check(await page.locator('.cp-training-hub').isVisible(),'Stage gate leads directly to catch-up training');
  }
  assert.deepEqual(errors,[]);console.log(`PASS: ${checks} training checks; five free playable exercises, progressive stage requirements, partial/retry top-ups capped at three, reload/restart, pause, stage recovery and desktop/mobile.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
