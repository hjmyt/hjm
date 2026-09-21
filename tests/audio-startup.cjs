// Chromium verifies startup ordering, decoded audio signal and recovery. The
// AudioSession/interrupted shims model iOS states; this is not a device test.
const {chromium,devices}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const url=pathToFileURL(path.resolve(__dirname,'../index.html')).href;
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 const errors=[];
 async function fresh(modern=true){
  const context=await browser.newContext({...devices['iPhone 13']});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(modern=>{
   window.audioEvents=[];window.synthPeak=0;window.interrupted=false;window.rejectResume=false;
   let type='ambient';
   Object.defineProperty(navigator,'audioSession',{configurable:true,value:modern?{get type(){return type;},set type(v){type=v;audioEvents.push(v);}}:undefined});
   const Native=window.AudioContext;
   window.AudioContext=class extends Native{
    constructor(...args){
     if(modern&&type!=='playback')throw new Error('Synth created before configuring media playback');
     super(...args);audioEvents.push('context');
    }
    get state(){return window.interrupted?'interrupted':super.state;}
    resume(){
     audioEvents.push('resume:'+this.state);
     if(window.rejectResume){window.rejectResume=false;return Promise.reject(new DOMException('Try again','NotAllowedError'));}
     window.interrupted=false;return super.resume();
    }
    createDynamicsCompressor(){
     const compressor=super.createDynamicsCompressor(),analyser=this.createAnalyser();compressor.connect(analyser);
     const samples=new Float32Array(analyser.fftSize);
     function sample(){analyser.getFloatTimeDomainData(samples);for(const x of samples)window.synthPeak=Math.max(window.synthPeak,Math.abs(x));requestAnimationFrame(sample);}
     requestAnimationFrame(sample);return compressor;
    }
   };
  },modern);
  await page.goto(url);return {page,context};
 }
 const signal=page=>page.waitForFunction(()=>window.synthPeak>.00001);
 const noStory=async page=>assert.equal(await page.locator('#storyBgmAudio').getAttribute('src'),null,'No story BGM needed to unlock synthesis');
 try{
  // Fresh home -> very first cat tap, without visiting stories.
  {
   const {page,context}=await fresh();
   await page.locator('#view-home .cat-touch').tap();await signal(page);await noStory(page);
   assert.deepEqual((await page.evaluate(()=>audioEvents)).slice(0,2),['playback','context']);
   assert.equal(await page.evaluate(()=>synthAudioBridge),null,'Modern iOS uses playback session without a silent media loop');
   await page.waitForFunction(()=>synthNodes.size===0);
   await page.locator('#soundBtn').tap();await page.evaluate(()=>window.synthPeak=0);
   await page.locator('#view-home .cat-touch').tap();
   assert.equal(await page.evaluate(()=>synthNodes.size),0,'Muted pet interactions schedule no sound');
   await context.close();
  }
  // Independent fresh load -> rhythm; also cover interrupted and failed resumes.
  {
   const {page,context}=await fresh();
   await page.locator('.nav-btn[data-route="rhythm"]').tap();
   await page.locator('#startGame').tap();await signal(page);await noStory(page);
   assert.equal(await page.evaluate(()=>audioCtx.state),'running');
   await page.evaluate(async()=>{await audioCtx.suspend();window.interrupted=true;});
   await page.waitForFunction(()=>game.status==='paused');
   await page.locator('#gameOverlay [data-game="resume"]').tap();
   await page.waitForFunction(()=>['running','countdown'].includes(game.status));
   assert((await page.evaluate(()=>audioEvents)).includes('resume:interrupted'));
   await page.evaluate(async()=>{pauseGame();await audioCtx.suspend();window.interrupted=true;window.rejectResume=true;});
   await page.locator('#gameOverlay [data-game="resume"]').tap();
   await page.waitForFunction(()=>audioBlocked);
   assert.equal(await page.evaluate(()=>game.status),'paused','Failed audio resume does not silently advance gameplay');
   assert.equal(await page.evaluate(()=>audioUnavailable),false,'Temporary denial remains retryable');
   await page.locator('#gameOverlay [data-game="resume"]').tap();
   await page.waitForFunction(()=>!audioBlocked&&audioCtx.state==='running');
   await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
   assert.equal(await page.evaluate(()=>game.status),'paused');
   await context.close();
  }
  // Older iOS: direct cat tap uses a tiny real media asset and releases it.
  {
   const {page,context}=await fresh(false);
   await page.locator('#view-home .cat-touch').tap();await signal(page);await noStory(page);
   await page.waitForFunction(()=>synthAudioBridge&&!synthAudioBridge.paused&&synthAudioBridge.currentTime>0);
   assert.equal(await page.evaluate(()=>synthAudioBridge.muted),false);
   await page.waitForFunction(()=>synthNodes.size===0&&synthAudioBridge.paused);
   await context.close();
  }
  // Older iOS: bridge stays alive for a performance, stops on mute/route exit.
  {
   const {page,context}=await fresh(false);
   await page.locator('.nav-btn[data-route="rhythm"]').tap();await page.locator('#startGame').tap();await signal(page);await noStory(page);
   assert.equal(await page.evaluate(()=>synthAudioBridge.paused),false);
   await page.locator('#soundBtn').tap();assert.equal(await page.evaluate(()=>synthAudioBridge.paused),true);
   await page.locator('#soundBtn').tap();await page.waitForFunction(()=>!synthAudioBridge.paused);
   await page.locator('.nav-btn[data-route="home"]').tap();assert.equal(await page.evaluate(()=>synthAudioBridge.paused),true);
   await context.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: first cat tap and direct rhythm startup without BGM, media-session order, real synth signal, interruption/retry, mute, background and legacy iOS bridge lifecycle. (Simulated iOS paths in Chromium; physical iPhone still needs verification.)');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
