const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
  await page.evaluate(()=>{window.__now=performance.now();performance.now=()=>window.__now;});
  async function begin(chapter=3,round=1,sound=false){
   await page.evaluate(({chapter,round,sound})=>{
    Chronicle.suspend();state=freshState();state.sound=sound;state.coins=30;
    const r=state.chronicle.run;Object.assign(r,{chapter,week:3,name:'音游测试',inst:'弦乐',scene:'menu'});
    r.weekly.done=[1,2,3,4,5];r.weekly.active=0;route('chronicle');window.__now+=250;
    document.querySelector('[data-cp-action="training-start"][data-cp-week="3"]').click();
    r.weekly.training[3].round=round;r.rev++;renderGlobal();window.__now+=250;
   },{chapter,round,sound});
   await page.locator('[data-cp-action="training-begin"]').click();
   await page.waitForTimeout(50);
   return page.evaluate(()=>{
    const f=document.querySelector('#cpPulseField');
    return {start:window.__now+Number(f.dataset.lead),end:Number(f.dataset.end),bpm:Number(f.dataset.bpm),notes:[...f.querySelectorAll('[data-note]')].map(n=>({at:Number(n.dataset.at),lane:Number(n.dataset.lane)})).sort((a,b)=>a.at-b.at)};
   });
  }
  async function strike(chart,n,offset=0,lanes=[n.lane],touch=false){
   await page.evaluate(({time,lanes,touch})=>{
    window.__now=time;
    for(const lane of lanes){
     if(touch)document.querySelector(`[data-training-lane="${lane}"]`).dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'touch',pointerId:lane+1}));
     else document.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,code:['KeyD','KeyF','KeyJ','KeyK'][lane]}));
    }
   },{time:chart.start+n.at+offset,lanes,touch});
  }
  async function finish(chart){
   await page.evaluate(now=>window.__now=now,chart.start+chart.end+400);
   await page.waitForFunction(()=>['feedback','result'].includes(state.chronicle.run.weekly.training[3].phase));
   return page.evaluate(()=>state.chronicle.run.weekly.training[3].score);
  }
  let chart=await begin();assert.equal(await finish(chart),0,'No input earns zero');
  for(const [offset,expected] of [[0,100],[66,80],[121,50],[181,0]]){
   chart=await begin();for(const n of chart.notes)await strike(chart,n,offset);
   assert.equal(await finish(chart),expected,`Timing judgement at ${offset} ms`);
  }
  chart=await begin();
  for(const n of chart.notes)await strike(chart,n,0,[0,1,2,3]);
  assert((await finish(chart))<60,'Mashing all lanes cannot pass');
  chart=await begin();await strike(chart,chart.notes[0]);await strike(chart,chart.notes[0]);
  assert.equal(await page.locator('#cpPulseCombo').textContent(),'0','Duplicate hit resets combo');
  assert((await finish(chart))<4,'One note cannot be scored twice');
  chart=await begin(6,1);
  assert(chart.notes.some((n,i)=>i&&n.at===chart.notes[i-1].at),'Later chart includes chords');
  for(let i=0;i<chart.notes.length;i++){
   const n=chart.notes[i],lanes=[n.lane];
   while(chart.notes[i+1]?.at===n.at)lanes.push(chart.notes[++i].lane);
   await strike(chart,n,0,lanes,true);
  }
  assert.equal(await finish(chart),100,'Simultaneous touch hits every chord without click debounce');
  const early=await begin(1,0),late=await begin(6,2);
  assert(late.bpm>early.bpm&&late.notes.length>early.notes.length,'Tempo and chart complexity increase');
  // Verify oscillator cleanup and automatic pause using the real Web Audio context.
  await page.evaluate(async()=>{await ensureAudio();window.__osc=[];const create=audioCtx.createOscillator.bind(audioCtx);audioCtx.createOscillator=()=>{const osc=create(),stop=osc.stop.bind(osc);osc.__stops=0;osc.stop=(...args)=>{osc.__stops++;return stop(...args);};window.__osc.push(osc);return osc;};});
  chart=await begin(3,1,true);await strike(chart,chart.notes[0]);
  await page.waitForFunction(()=>window.__osc.length>0);
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  assert(await page.evaluate(()=>state.chronicle.run.weekly.training[3].phase==='ready'&&window.__osc.every(o=>o.__stops>=2)),'Blur pauses and stops scheduled sound');
  assert(await page.evaluate(()=>state.coins===20&&!state.economy.training['3:3'].gain),'Pause neither refunds nor rewards');
  // Capture actual falling notes on desktop and mobile, not only the ready screen.
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1100});chart=await begin(3,1);
   await strike(chart,chart.notes[0]);await page.waitForTimeout(50);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
   await page.locator('.cp-pulse').screenshot({path:`/tmp/hjm-pulse-playing-${width}.png`});
  }
  assert.deepEqual(errors,[]);console.log('PASS: pulse timing windows, misses, anti-mashing, duplicate hits, multi-touch chords, progressive charts, audio cleanup, pause and responsive gameplay.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
