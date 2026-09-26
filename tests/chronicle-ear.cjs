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
  await page.evaluate(()=>{
   window.__now=performance.now();performance.now=()=>window.__now;
   state=freshState();state.sound=false;state.coins=30;
   const r=state.chronicle.run;Object.assign(r,{name:'练耳测试',inst:'弦乐',scene:'menu',week:1});
   r.weekly.done=[1,2,3,4,5];r.weekly.active=0;route('chronicle');
  });
  const click=sel=>page.evaluate(sel=>{window.__now+=250;const el=document.querySelector(sel);if(!el||el.disabled)throw Error('Unavailable '+sel);el.click();},sel);
  const action=name=>click(`[data-cp-action="${name}"]`);
  const current=()=>page.evaluate(()=>({...state.chronicle.run.weekly.training[1],coins:state.coins,tech:state.chronicle.run.tech,gain:state.economy.training['1:1'].gain}));
  const phase=p=>page.waitForFunction(p=>state.chronicle.run.weekly.training[1].phase===p,p);
  await click('[data-cp-action="training-start"][data-cp-week="1"]');
  await action('training-begin');assert.equal((await current()).phase,'ready','Muted ear training requires sound');
  assert.equal((await current()).coins,20);
  await page.evaluate(async()=>{
   state.sound=true;await ensureAudio();
   window.__analyser=audioCtx.createAnalyser();audioMaster.connect(window.__analyser);
   window.__voices=[];const create=audioCtx.createOscillator.bind(audioCtx);
   audioCtx.createOscillator=()=>{const node=create(),start=node.start.bind(node),stop=node.stop.bind(node);const record={};window.__voices.push(record);
    node.start=time=>{record.at=time;record.frequency=node.frequency.value;start(time);};
    node.stop=time=>{record.stop=time??audioCtx.currentTime;stop(time);};return node;};
  });
  await action('training-begin');
  const firstChart=await page.evaluate(()=>structuredClone(state.chronicle.run.weekly.training[1].earChart));
  await page.waitForFunction(()=>document.querySelector('[data-ear-note="0"]').classList.contains('sounding'));
  await page.waitForFunction(()=>{const b=new Float32Array(window.__analyser.fftSize);window.__analyser.getFloatTimeDomainData(b);return b.some(n=>Math.abs(n)>.001);});
  assert(await page.evaluate(note=>{const midi=[60,62,64,65,67,69,71],expected=440*2**((midi[note-1]-69)/12);return window.__voices.length===7&&Math.abs(window.__voices[0].frequency-expected)<.1;},firstChart.notes[0]),'Real C-major audio is scheduled, including hidden pitches');
  assert(await page.evaluate(()=>[...document.querySelectorAll('.cp-ear-blank b')].every(el=>el.textContent==='·')),'Playback never reveals hidden pitches');
  await phase('input');
  assert.equal((await current()).points,0,'Listening alone cannot score');
  assert(await page.locator('[data-cp-action="training-ear-submit"]').isDisabled());
  await page.evaluate(()=>{window.__now+=250;const b=document.createElement('button');b.dataset.cpAction='training-ear-submit';document.body.append(b);b.click();b.remove();});
  assert.equal((await current()).phase,'input','Handler rejects incomplete submission');
  await page.keyboard.press('9');assert.deepEqual((await current()).answers,{},'Out-of-range keyboard input ignored');
  const [firstBlank,secondBlank]=firstChart.blanks;
  await page.keyboard.press('1');assert.equal((await current()).answers[firstBlank],1);
  await click('[data-cp-action="training-ear-answer"][data-cp-answer="2"]');
  await click(`[data-cp-action="training-ear-select"][data-ear-index="${firstBlank}"]`);
  await page.keyboard.press('6');assert.equal((await current()).answers[firstBlank],6,'Selected blank is editable with keyboard');
  // Advance only the audio clock from here, after verifying actual sound and a full real-time phrase.
  await page.evaluate(()=>{window.__audioOffset=0;const get=Object.getOwnPropertyDescriptor(AudioContext.prototype,'currentTime')?.get||Object.getOwnPropertyDescriptor(BaseAudioContext.prototype,'currentTime').get;Object.defineProperty(audioCtx,'currentTime',{get:()=>get.call(audioCtx)+window.__audioOffset});});
  async function finishPlayback(){await page.waitForFunction(()=>document.querySelector('#cpTrainingStatus').textContent.includes('准备听'));await page.evaluate(()=>window.__audioOffset+=10);await phase('input');}
  await action('training-ear-replay');await finishPlayback();
  assert.deepEqual((await current()).answers,{[firstBlank]:6,[secondBlank]:2},'Replay preserves answers');
  assert.equal((await current()).coins,20,'Replay is free');
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:1100});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page fits '+width);
   assert(await page.evaluate(()=>[...document.querySelectorAll('.cp-ear-note,.cp-ear-keys button')].every(el=>{const b=el.getBoundingClientRect();return b.left>=0&&b.right<=innerWidth;})),'Score and keys fit '+width);
   await page.locator('.cp-training-ear').screenshot({path:`/tmp/hjm-ear-${width}.png`});
  }
  const wrongAnswer=firstChart.notes[firstBlank]===7?6:7;
  await click(`[data-cp-action="training-ear-select"][data-ear-index="${firstBlank}"]`);await page.keyboard.press(String(wrongAnswer));
  await click(`[data-cp-action="training-ear-select"][data-ear-index="${secondBlank}"]`);await page.keyboard.press(String(firstChart.notes[secondBlank]));
  await action('training-ear-submit');assert.equal((await current()).score,50);
  assert.equal(await page.locator('.cp-ear-revealed.incorrect b').textContent(),String(firstChart.notes[firstBlank]),'Review shows correct pitch in the original blank');
  assert((await page.locator('.cp-ear-revealed.incorrect small').textContent()).includes(String(wrongAnswer)),'Review shows the wrong answer separately');
  assert.equal(await page.locator('.cp-ear-revealed.correct').count(),1);
  const beforeReview=await current();await action('training-ear-review');
  await page.waitForFunction(()=>document.querySelector('[data-cp-action="training-ear-stop"]'));
  await page.evaluate(()=>window.__audioOffset+=.8);
  await page.waitForFunction(()=>document.querySelector('[data-ear-note="0"]').classList.contains('sounding'));
  await page.evaluate(()=>window.__audioOffset+=10);
  await page.waitForFunction(()=>document.querySelector('[data-cp-action="training-ear-review"]'));
  assert.deepEqual(await current(),beforeReview,'Answer playback preserves phase, points, rewards, and answers');
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:1100});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Review fits '+width);
   await page.locator('.cp-training-ear').screenshot({path:`/tmp/hjm-ear-review-${width}.png`});
  }
  await action('training-ear-review');await page.waitForFunction(()=>document.querySelector('[data-cp-action="training-ear-stop"]'));
  await action('training-ear-stop');assert.deepEqual(await current(),beforeReview,'Stopping review does not reset the scored round');
  const first=await current();await page.evaluate(()=>{window.__now+=250;const b=document.createElement('button');b.dataset.cpAction='training-ear-submit';document.body.append(b);b.click();b.remove();});
  assert.deepEqual(await current(),first,'Repeated submit cannot duplicate score');
  for(let round=1;round<3;round++){
   await action('training-next');assert.equal((await current()).answers,undefined,'Next round clears answers');
   await action('training-begin');await finishPlayback();
   const c=await page.evaluate(()=>chronicleEarChart(1,state.chronicle.run.weekly.training[1].round));
   for(const i of c.blanks)await page.keyboard.press(String(c.notes[i]));
   await action('training-ear-submit');
  }
  assert.equal((await current()).score,83);assert.equal((await current()).gain,2);assert.equal((await current()).tech,7);
  assert.equal(await page.locator('.cp-ear-review').count(),1,'Final results retain the last round answer board');
  const resultBefore=await current();await action('training-ear-review');
  await page.waitForFunction(()=>document.querySelector('[data-cp-action="training-ear-stop"]'));
  await page.evaluate(()=>window.__audioOffset+=10);
  await page.waitForFunction(()=>document.querySelector('[data-cp-action="training-ear-review"]'));
  assert.deepEqual(await current(),resultBefore,'Result replay cannot award growth again');
  const completedFirstChart=JSON.stringify(firstChart);
  await action('training-retry');
  const retryFirstChart=await page.evaluate(()=>JSON.stringify(chronicleEarChart(1,0)));
  assert.notEqual(retryFirstChart,completedFirstChart,'Free retry immediately prepares a different first-round question');
  await action('training-begin');
  await page.waitForFunction(()=>window.__voices.length>=7);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
  assert.equal((await current()).phase,'ready','Background pauses playback');
  await page.waitForFunction(()=>synthNodes.size===0);
  await page.evaluate(()=>{delete document.hidden;route('album');route('chronicle');});
  await action('training-begin');await page.evaluate(()=>route('album'));
  assert.equal((await current()).phase,'ready','Navigation pauses playback');
  await page.waitForFunction(()=>synthNodes.size===0);
  await page.evaluate(()=>route('chronicle'));
  // Existing paid rhythm attempts keep their score, round, and global ledger through cleaning.
  await page.evaluate(()=>{const r=state.chronicle.run;r.weekly.training[1]={round:1,points:70,phase:'playing',score:70};r.rev++;save();});
  await page.reload();await page.evaluate(()=>route('chronicle'));
  assert(await page.evaluate(()=>{const t=state.chronicle.run.weekly.training[1];return t.round===1&&t.points===70&&t.phase==='ready'&&state.coins===20&&state.economy.training['1:1'].gain===2;}),'Old rhythm progress and rewards migrate without repaying');
  const charts=await page.evaluate(()=>Array.from({length:6},(_,c)=>Array.from({length:3},(_,r)=>chronicleEarChart(c+1,r))).flat());
  for(const c of charts){assert.equal(c.notes.length,8);assert.equal(c.notes[7],0);assert(c.blanks.every(i=>c.notes[i]>=1&&c.notes[i]<=7));}
  assert.equal(charts[0].blanks.length,2);assert.equal(charts.at(-1).blanks.length,4);
  const beforeRefresh=await page.evaluate(()=>{const c=chronicleEarChart(1,0);return `${c.notes.join(',')}|${c.blanks.join(',')}`;});
  await page.reload();
  const afterRefresh=await page.evaluate(()=>{const c=chronicleEarChart(1,0);return `${c.notes.join(',')}|${c.blanks.join(',')}`;});
  assert.notEqual(afterRefresh,beforeRefresh,'A page refresh generates a different unstarted question');
  const submittedChart=await page.evaluate(()=>{const r=state.chronicle.run,c=chronicleEarChart(1,1);r.weekly.trainingWeek=1;r.weekly.training[1]={round:1,points:100,phase:'feedback',score:100,message:'',answers:{[c.blanks[0]]:c.notes[c.blanks[0]]},earChart:structuredClone(c)};save();return JSON.stringify(c);});
  await page.reload();
  assert.equal(await page.evaluate(()=>JSON.stringify(state.chronicle.run.weekly.training[1].earChart)),submittedChart,'Submitted answer review keeps its original random chart after refresh');
  assert.deepEqual(errors,[]);
  console.log('PASS: ear training random refresh-safe charts, real audio/highlight, hidden notes, editable mouse/keyboard answers, replay, submission guards, three-round rewards, audio cleanup, old saves and 1440/390/320 layouts.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
