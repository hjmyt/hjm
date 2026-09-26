const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 const errors=[];
 try{
  for(const track of ['2','0']){
   const context=await browser.newContext();const page=await context.newPage();
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
   await page.locator('.nav-btn[data-route="rhythm"]').click();
   await page.locator('#trackSelect').selectOption(track);
   await page.evaluate(()=>{
    window.cues=[];window.cuePeak=0;
    const originalEnsure=ensureAudio,originalTone=toneAt,originalCue=playCountdownTone;
    let tapped=false,insideCue=false;
    ensureAudio=async()=>{
     const result=await originalEnsure();
     if(result&&!tapped){
      tapped=true;const analyser=audioCtx.createAnalyser();audioMaster.connect(analyser);
      const samples=new Float32Array(analyser.fftSize);
      const sample=()=>{analyser.getFloatTimeDomainData(samples);for(const value of samples)window.cuePeak=Math.max(window.cuePeak,Math.abs(value));requestAnimationFrame(sample);};sample();
     }
     return result;
    };
    playCountdownTone=n=>{insideCue=true;try{return originalCue(n);}finally{insideCue=false;}};
    toneAt=(...args)=>{
     if(insideCue)window.cues.push({number:game.countdownLabel,visible:document.querySelector('.countdown-num')?.textContent,pitch:args[0],at:performance.now()});
     return originalTone(...args);
    };
   });
   await page.locator('#startGame').click();
   await page.waitForFunction(()=>cues.length===1&&cuePeak>.001);
   assert.deepEqual(await page.evaluate(()=>cues.map(c=>[c.number,c.visible,c.pitch])),[[3,'3',79]]);
   await page.evaluate(()=>{for(let i=0;i<5;i++)renderGameOverlay();});
   assert.equal(await page.evaluate(()=>cues.length),1,'Rerender never repeats cue');
   await page.locator('#pauseGame').click();
   const pausedCount=await page.evaluate(()=>cues.length);
   await page.waitForTimeout(1100);
   assert.equal(await page.evaluate(()=>cues.length),pausedCount,'No future cue sounds while paused');
   assert.equal(await page.evaluate(()=>songNodes.size),0,'Pause cancels cue and scheduled melody');
   await page.locator('#gameOverlay [data-game="resume"]').click();
   await page.waitForFunction(()=>game.status==='running');
   assert.deepEqual(await page.evaluate(()=>cues.map(c=>[c.number,c.visible,c.pitch])),[[3,'3',79],[2,'2',79],[1,'1',84]]);
   await page.evaluate(()=>{for(let i=0;i<5;i++)renderGameOverlay();});
   assert.equal(await page.evaluate(()=>cues.length),3,'No fourth cue over the music');
   await page.locator('#restartGame').click();
   await page.locator('#soundBtn').click();
   await page.evaluate(()=>{window.cues=[];window.cuePeak=0;});
   await page.locator('#startGame').click();
   await page.waitForFunction(()=>game.status==='running');
   assert.deepEqual(await page.evaluate(()=>cues),[],'Muted countdown creates no cues');
   await page.locator('#restartGame').click();
   await page.locator('#soundBtn').click();
   await page.locator('#startGame').click();
   await page.waitForFunction(()=>cues.length===1);
   assert.equal(await page.evaluate(()=>cues[0].number),3,'New run restores the first cue');
   await context.close();
  }
  assert.deepEqual(errors,[]);console.log('PASS: recorded/synth countdown cues align with 3/2/1, real audio signal, rerender dedupe, pause/resume, mute and restart.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
