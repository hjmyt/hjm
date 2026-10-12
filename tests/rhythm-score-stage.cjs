const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {pathToFileURL}=require('node:url');const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.html':'text/html'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE});
 try{
 for(const mobile of [false,true]){
  const page=await browser.newPage({viewport:{width:mobile?390:1440,height:900},hasTouch:mobile});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(mobile?`http://127.0.0.1:${server.address().port}/index.html`:pathToFileURL(root+'/index.html').href);
  await page.locator('[data-music-enter]').click();await page.locator('.nav-btn[data-route="rhythm"]').click();
  // The recording is replaced in place; every migrated part follows the audition score.
  assert.equal(await page.locator('#trackSelect option').filter({hasText:'千与千寻'}).count(),1);
  for(const [index,songId,count,seconds] of [[5,'spirited-away',6,150.5],[9,'second-waltz',7,132],[6,'dandelion-promise',5,260*60/68+2],[10,'ting-hai',5,159.5]]){
   await page.locator('#trackSelect').selectOption(String(index));
   assert.equal(await page.locator('#rhythmScorePart option').count(),count);
   assert.equal(await page.evaluate(()=>game.mode),'gentle');
   assert.equal(await page.evaluate(()=>game.duration),seconds);
   await page.evaluate(({songId,count})=>{
    const track=TRACKS[game.track];
    if(track.audio||!RhythmScoreStage.active())throw Error('Score song must replace recording');
    for(const p of track.scoreParts){
     const select=$('rhythmScorePart');select.value=p.id;select.dispatchEvent(new Event('change'));
     const source=ScoreAuditionRules.visibleScores.find(s=>s.songId===songId&&s.partId===p.id), events=ScoreAuditionRules.soundingEvents(source);
     if(events.length!==game.notes.length)throw Error('Missing score notes');
     game.notes.forEach((n,i)=>{
      if(Math.abs(n.time-(1+events[i].beat*60/source.tempo))>1e-7)throw Error('Score onset changed');
      if(!Number.isFinite(n.pitch)||n.lane<0||n.lane>3)throw Error('Invalid pitch/lane');
      if(n.duration!==0)throw Error('Every note must be a tap');
     });
     const original=scoreInstrumentAt;
     try{
      for(const mode of ['full','part']){
       const backing=$('rhythmScoreBacking');backing.value=mode;backing.dispatchEvent(new Event('change'));
       const calls=[];scoreInstrumentAt=(...args)=>calls.push(args);RhythmScoreStage.schedule(100,0);
       const expected=mode==='full'?track.scoreParts.flatMap(p=>p.events):p.events;
       if(calls.some(c=>!ScoreInstrumentAudio.profiles[c[4]]))throw Error('Missing instrument voice');
       if(mode==='part'&&calls.some(c=>c[4]!==p.instrument))throw Error('Wrong part instrument');
       if(calls.length!==expected.length)throw Error('Backing event count');
       // Compare part identity, including distinct violin parts sharing one timbre.
       let offset=0;const levels=[];
       for(const sourcePart of mode==='full'?track.scoreParts:[p]){
        const segment=calls.slice(offset,offset+sourcePart.events.length);offset+=segment.length;
        if(segment.some(c=>c[3]!==segment[0][3]))throw Error('Inconsistent part gain');
        levels.push({lead:sourcePart.id===p.id,level:segment[0][3]});
       }
       if(mode==='full'&&levels.some(l=>!l.lead&&l.level*8>=levels.find(l=>l.lead).level))throw Error('Selected part must stand out in full mix');
       if(mode==='full'&&levels.filter(l=>!l.lead).reduce((sum,l)=>sum+l.level,0)>=levels.find(l=>l.lead).level)throw Error('Combined backing gains must stay below the selected part');
       const resumed=[];scoreInstrumentAt=(...args)=>resumed.push(args);RhythmScoreStage.schedule(100,110);
       if(resumed.some(c=>!levels.some(l=>l.level===c[3])))throw Error('Resume loses mix balance');
       if(mode==='part')calls.forEach((c,i)=>{if(c[0]!==p.events[i].pitch||Math.abs(c[1]-(101+p.events[i].beat*60/p.tempo))>1e-7||Math.abs(c[2]-p.events[i].duration*60/p.tempo)>1e-7)throw Error('Solo backing alignment');});
      }
     }finally{scoreInstrumentAt=original;}
     state.best[gameKey()]={score:2468,accuracy:70,rank:'B',combo:4};
     game.mode='normal';state.best[gameKey()]={score:3456,accuracy:80,rank:'A',combo:5};
    }
    for(const key of track.legacyScoreIds||[])state.best[`${key}_gentle`]={score:88,accuracy:50,rank:'C',combo:1};
    save();
   },{songId,count});
  }
  await page.locator('#trackSelect').selectOption('8');assert.equal(await page.locator('#rhythmScorePart option').count(),5);
  assert.equal(await page.evaluate(()=>game.mode),'gentle');
  assert(await page.locator('#rhythmScoreControls').evaluate(el=>el.getBoundingClientRect().width>250),'Part controls use full card width');
  const stats=await page.evaluate(()=>{
   const track=TRACKS[game.track],result=[];
   for(const p of track.scoreParts){
    const select=$('rhythmScorePart');select.value=p.id;select.dispatchEvent(new Event('change'));
    if(game.notes.length!==p.events.length)throw Error('All original attacks preserved');
    if(game.notes.some(n=>n.duration))throw Error('Unexpected hold');
    const notes=game.notes;
    notes.forEach((n,i)=>{const e=p.events[i];if(Math.abs(n.time-(1+e.beat*60/p.tempo))>1e-7||n.pitch!==e.pitch||n.duration!==0)throw Error('Original score timing changed');});

    state.best[gameKey()]={score:1234,accuracy:70,rank:'B',combo:4};
    result.push({part:p.id,notes:notes.length,holds:notes.filter(n=>n.duration).length});
   }
   for(const id of track.legacyScoreIds)state.best[`${id}_gentle`]={score:77,accuracy:50,rank:'C',combo:1};
   state.best['0_gentle']={score:99,accuracy:50,rank:'C',combo:1};save();return result;
  });assert.equal(stats.length,5);
  await page.locator('#rhythmScorePart').selectOption('viola');
  // Verify that backing selection schedules the actual selected score(s).
  const counts=[];
  for(const backing of ['full','part']){
   await page.locator('#rhythmScoreBacking').selectOption(backing);
   counts.push(await page.evaluate(()=>{const original=scoreInstrumentAt,calls=[];try{scoreInstrumentAt=(...args)=>calls.push(args);RhythmScoreStage.schedule(100,0);}finally{scoreInstrumentAt=original;}return calls.length;}));
  }
  assert(counts[0]>counts[1]*4);assert.equal(counts[1],126);
  await page.evaluate(()=>{
   const original=gameTime;let time;gameTime=()=>time;
   try{
    for(const index of [5,6,8,9,10]){
     game.track=index;stopGame(true);game.status='running';game.cardRun=captureCardRun();
     const n=game.notes.find(n=>n.beats>1);time=n.time;game.elapsed=time;
     hitLane(n.lane);
     if(!n.hit||game.score!==1000||game.cardRun.sourceSnapshot.manualHits!==1)throw Error('Long musical note awards immediately on tap');
     document.dispatchEvent(new KeyboardEvent('keyup',{key:['d','f','j','k'][n.lane]}));
     time+=.5;game.elapsed=time;RhythmScoreStage.frame();
     if(n.missed||game.miss||n.holding||n.holdPaused||game.score!==1000)throw Error('Release must not interrupt');
    }
    game.track=8;
   }finally{gameTime=original;stopGame(true);}
  });
  // Count-in ends exactly at score beat zero; first note gets its fall during 3/2/1.
  await page.evaluate(()=>{
   const saved={track:game.track,elapsed:game.elapsed,status:game.status}, paw=drawPaw;
   try{
    for(const index of [5,6,8,9,10]){
     game.track=index;generateChart();
     if(gameCountdownEnd()!==1)throw Error('Score count-in boundary');
     for(const [time,label] of [[-2,3],[-1,2],[0,1]]){game.elapsed=time;if(gameCountdownRemaining()!==label)throw Error('Count-in cadence');}
    }
    game.track=8;generateChart();game.status='countdown';game.elapsed=0;
    let paws=0;drawPaw=()=>paws++;drawGame(performance.now());
    if(paws<=4)throw Error('First notes must be visible during count-in');
    game.track=2;if(gameCountdownEnd()!==-gameLeadIn())throw Error('Recording prelude changed');
   }finally{drawPaw=paw;Object.assign(game,saved);stopGame(true);}
  });
  if(!mobile)await page.evaluate(async()=>{
   const signatures=[];
   for(const instrument of Object.keys(ScoreInstrumentAudio.profiles)){
    const c=new OfflineAudioContext(1,44100,44100);
    if(SCORE_SAMPLE_MANIFEST[instrument]&&!await ScoreInstrumentAudio.prepare(c,[instrument]))throw Error('Sample preparation failed: '+instrument);
    const played=ScoreInstrumentAudio.play(c,c.destination,instrument,220,0,.7,.12);
    if(SCORE_SAMPLE_MANIFEST[instrument]&&!played.sampled)throw Error('Must use sampled voice: '+instrument);
    const buffer=await c.startRendering(),a=buffer.getChannelData(0);
    const rms=(from,to)=>Math.sqrt(a.slice(from,to).reduce((sum,x)=>sum+x*x,0)/(to-from));
    if(rms(15000,25000)<.005)throw Error('Instrument sustain silent: '+instrument);
    if(rms(42000,44000)>.0001)throw Error('Instrument release did not end: '+instrument);
    signatures.push(Array.from(a.slice(16000,16024)).map(x=>x.toFixed(5)).join(','));
   }
   if(new Set(signatures).size!==signatures.length)throw Error('Instrument voices must differ');
  });
  // Real point taps, synthesis, countdown and pause on a formerly long note.
  await page.evaluate(async()=>{await ensureAudio();const a=audioCtx.createAnalyser();audioMaster.connect(a);window.scoreAudioAnalyser=a;});
  await page.evaluate(()=>{window.stageScheduled=[];window.stageScheduleStart=audioCtx.currentTime;window.stageOriginalTone=scoreInstrumentAt;scoreInstrumentAt=(...args)=>{stageScheduled.push([...args,audioCtx.currentTime]);return stageOriginalTone(...args);};});
  await page.locator('#startGame').click();
  await page.waitForFunction(()=>stageScheduled.length>0);
  assert(await page.evaluate(()=>{const first=stageScheduled.slice(0,RhythmScoreStage.part().events.length).reduce((a,b)=>a[1]<b[1]?a:b);return Math.abs((first[1]-first[5])-3)<.15;}),'Music scheduled immediately after three-second count-in');
  await page.waitForFunction(()=>game.status==='running');
  await page.waitForFunction(()=>{const a=new Float32Array(scoreAudioAnalyser.fftSize);scoreAudioAnalyser.getFloatTimeDomainData(a);return a.some(v=>Math.abs(v)>.0001);},null,{timeout:500});
  await page.evaluate(()=>{scoreInstrumentAt=stageOriginalTone;});
  assert(await page.locator('#rhythmScorePart').isDisabled());assert(await page.locator('#rhythmScoreBacking').isDisabled());
  const next=await page.evaluate(()=>game.notes.find(n=>!n.duration&&n.time>gameTime()+.3));
  await page.waitForFunction(t=>gameTime()>=t-.025,next.time,{polling:'raf'});
  if(mobile)await page.locator(`[data-lane="${next.lane}"]`).tap();else await page.keyboard.press(['d','f','j','k'][next.lane]);
  assert(await page.evaluate(()=>game.score>0));assert(await page.evaluate(()=>ScoreInstrumentAudio.ready(audioCtx,[RhythmScoreStage.part().instrument])),'Real playback uses samples');
  await page.waitForFunction(()=>{const samples=new Float32Array(scoreAudioAnalyser.fftSize);scoreAudioAnalyser.getFloatTimeDomainData(samples);return samples.some(v=>Math.abs(v)>.0001);});
  const long=await page.evaluate(()=>game.notes.find(n=>n.beats>1&&n.time>gameTime()+.4));
  await page.waitForFunction(t=>gameTime()>=t-.025,long.time,{polling:'raf'});
  if(mobile)await page.locator(`[data-lane="${long.lane}"]`).tap();else await page.keyboard.press(['d','f','j','k'][long.lane]);
  assert(await page.evaluate(t=>game.notes.find(n=>n.time===t).hit,long.time),'One tap completes long musical note');
  await page.waitForTimeout(300);
  assert(await page.evaluate(t=>{const n=game.notes.find(n=>n.time===t);return n.hit&&!n.missed&&!n.holding;},long.time));
  await page.locator('#pauseGame').click();const paused=await page.evaluate(()=>game.elapsed);await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>game.elapsed),paused);assert(await page.evaluate(()=>songNodes.size===0),'Pause stops all sampled sources');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:`/tmp/hjm-wedding-${mobile?'mobile':'desktop'}.png`,fullPage:true});
  await page.reload();await page.waitForFunction(()=>TRACKS.find(t=>t.id==='jay-wedding-stage').scoreParts.every(p=>state.best[`jay-wedding-${p.id}-taps-v1_gentle`]?.score===1234&&state.best[`jay-wedding-${p.id}-holds-v1_gentle`]?.score===77&&state.best[`jay-wedding-${p.id}-holds-v2_gentle`]?.score===77)&&state.best['0_gentle']?.score===99);
  assert(await page.evaluate(()=>[5,6,9,10].every(i=>TRACKS[i].scoreParts.every(p=>state.best[`${TRACKS[i].scoreIds[`${p.id}_gentle`]}_gentle`]?.score===2468&&state.best[`${TRACKS[i].scoreIds[`${p.id}_normal`]}_normal`]?.score===3456))&&[5,6].every(i=>TRACKS[i].legacyScoreIds.every(id=>state.best[`${id}_gentle`]?.score===88))),'Migrated parts and retired recording bests survive reload');
  assert.deepEqual(errors,[]);await page.close();
 }
 const retry=await browser.newPage();
 await retry.route('**/musyng-kite/*.js*',r=>r.abort());
 await retry.goto(`http://127.0.0.1:${server.address().port}/index.html`);
 await retry.locator('[data-music-enter]').click();await retry.locator('.nav-btn[data-route="rhythm"]').click();
 await retry.locator('#trackSelect').selectOption('8');await retry.locator('#rhythmScorePart').selectOption('viola');await retry.locator('#rhythmScoreBacking').selectOption('part');
 await retry.locator('#startGame').click();await retry.waitForFunction(()=>game.status==='countdown');
 assert.match(await retry.locator('#audioStatus').textContent(),/采样未载入/);
 await retry.evaluate(()=>stopGame(true));await retry.unroute('**/musyng-kite/*.js*');
 await retry.locator('#startGame').click();await retry.waitForFunction(()=>game.status==='countdown');
 assert(await retry.evaluate(()=>ScoreInstrumentAudio.ready(audioCtx,['viola'])),'Failed bank is retryable');
 await retry.evaluate(()=>stopGame(true));
 let heldRoute;await retry.route('**/musyng-kite/violin.js*',r=>{heldRoute=r;});
 await retry.locator('#rhythmScorePart').selectOption('violin-1');
 await retry.evaluate(()=>{window.cancelledStart=startGame();});
 while(!heldRoute)await retry.waitForTimeout(20);
 await retry.evaluate(()=>stopGame(true));await heldRoute.abort();await retry.evaluate(()=>cancelledStart);
 assert.equal(await retry.evaluate(()=>game.status),'idle','Cancelled preparation cannot start later');
 await retry.close();
 console.log('PASS: five songs / 28 parts, recording replacement, full/solo backing, original timing, countdown without silent padding, visible first notes, tap-only notes, immediate scoring, preserved audio durations, release without interruption, real inputs, old/new saves and file/HTTP layouts');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
