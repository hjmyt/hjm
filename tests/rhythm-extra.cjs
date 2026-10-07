const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.mp3':'audio/mpeg'})[path.extname(file)]||'application/octet-stream');const data=fs.readFileSync(file),range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
 if(range){const start=Number(range[1]),end=range[2]?Number(range[2]):data.length-1;res.writeHead(206,{'Accept-Ranges':'bytes','Content-Range':`bytes ${start}-${end}/${data.length}`,'Content-Length':end-start+1});res.end(data.subarray(start,end+1));}
 else{res.setHeader('Content-Length',data.length);res.setHeader('Accept-Ranges','bytes');res.end(data);}
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  for(const mobile of [false,true]){
   const page=await browser.newPage({viewport:{width:mobile?390:1440,height:900},hasTouch:mobile});
   page.setDefaultTimeout(20000);
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{const Native=Audio;window.Audio=function(src){const a=new Native(src);if(/(?:miau-in-c|changyou|love-hakimi-op|qian-yu-qian-xun|pu-gong-ying-de-yue-ding)-full/.test(src))window.recording=a;return a;};});
   await page.goto(mobile?`http://127.0.0.1:${server.address().port}/index.html`:pathToFileURL(path.join(root,'index.html')).href);
   await page.locator('[data-music-enter]').click();
   await page.locator('.nav-btn[data-route="rhythm"]').click();
   assert.equal(await page.locator('#trackSelect').inputValue(),'2');
   assert(await page.evaluate(()=>{
    const saved={mode:game.mode,status:game.status,elapsed:game.elapsed,notes:game.notes}, original=drawPaw, positions=[];
    try{
     Object.assign(game,{status:'running',elapsed:0,notes:[{time:1,lane:0,hit:false,missed:false}]});
     for(const mode of ['gentle','normal']){game.mode=mode;let y;drawPaw=(x,at)=>{y=at;};drawGame(performance.now());positions.push(y);}
     return positions[0]===positions[1];
    }finally{drawPaw=original;Object.assign(game,saved);}
   }),'Hard and easy have identical fall speed');
   assert.match(await page.locator('#trackSelect option').last().textContent(),/蒲公英的约定$/);
   for(const [index,playMode] of [[2,'normal'],[3,'normal'],[4,'normal'],[5,'gentle'],[5,'normal'],[6,'gentle'],[6,'normal']]){
    await page.locator('#trackSelect').selectOption(String(index));
    assert.equal(await page.evaluate(()=>game.mode),'gentle','Selecting a track defaults to easy');
    for(const mode of ['gentle','normal']){
     await page.locator(`[data-mode="${mode}"]`).click();
     assert(await page.evaluate(()=>{
      const t=TRACKS[game.track], notes=game.notes;
      return notes[0].time<1.2&&t.gentle===t.normal&&notes.length>150&&notes.every((n,i)=>n.time>=.25&&n.time<game.duration-.4&&n.lane>=0&&n.lane<4&&(!i||n.time-notes[i-1].time>=.084))&&t.charts.normal.length>t.charts.gentle.length;
     }));
    }
    await page.locator(`[data-mode="${playMode}"]`).click();
    assert.match(await page.locator('#audioStatus').textContent(),/原曲录音/);
    await page.locator('#startGame').click();
    await page.waitForFunction(()=>game.status==='countdown'&&recording.currentTime>.1);
    assert(await page.evaluate(()=>recording.playbackRate===1&&Math.abs(game.elapsed-(recording.currentTime-5.5))<.1));
    await page.waitForFunction(()=>game.status==='running'&&game.elapsed<0);
    assert(await page.evaluate(()=>game.notes[0].time-game.elapsed<3.8),'Notes appear during the music lead-in');
    await page.locator('#pauseGame').click();
    const paused=await page.evaluate(()=>recording.currentTime);await page.waitForTimeout(150);
    assert.equal(await page.evaluate(()=>recording.currentTime),paused);
    await page.locator('#gameOverlay [data-game="resume"]').click();
    const next=await page.evaluate(()=>game.notes.find(n=>n.time>gameTime()+.5));
    await page.waitForFunction(t=>gameTime()>=t-.035,next.time,{polling:'raf'});
    if(mobile)await page.locator(`[data-lane="${next.lane}"]`).tap();else await page.keyboard.press(['d','f','j','k'][next.lane]);
    assert(await page.evaluate(()=>game.score>0));
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:`/tmp/hjm-extra-${index}-${playMode}-${mobile?'mobile':'desktop'}.png`,fullPage:true});
    // Seek only for completion-path regression; real opening playback/hits checked above.
    await page.evaluate(()=>{recording.currentTime=5.5+game.duration-.2;});
    await page.waitForFunction(()=>game.status==='finished');
    assert(await page.evaluate(()=>game.result.reward===0),'Missed full chart cannot earn currency');
    await page.evaluate(()=>{
     state=freshState();state.best['0_gentle']={score:1234,accuracy:60,rank:'C',combo:2};
     state.best[TRACKS[game.track].scoreId+'_normal']={score:123,accuracy:50,rank:'C',combo:1};
     state.best[(game.track===2?'love-hakimi-op':TRACKS[game.track].id)+'-audible-rhythm-v2_normal']={score:456,accuracy:60,rank:'C',combo:2};
     const run=captureCardRun();
     Object.assign(game,{status:'running',elapsed:game.duration,score:game.notes.length*1000,perfect:game.notes.length,good:0,nice:0,miss:0,maxCombo:game.notes.length,cardRun:run});
     finishGame();if(game.result.reward!==(game.track===2?10:game.mode==='gentle'?6:7))throw Error('Track uses the correct S reward');
     const coins=state.coins;finishGame();if(state.coins!==coins)throw Error('Duplicate payout');save();
    });
    const key=await page.evaluate(()=>gameKey()), oldKey=await page.evaluate(()=>TRACKS[game.track].scoreId+'_normal'), previousKey=await page.evaluate(()=>(game.track===2?'love-hakimi-op':TRACKS[game.track].id)+'-audible-rhythm-v2_normal');
    await page.reload();await page.locator('[data-music-enter]').click();assert(await page.evaluate(({key,oldKey,previousKey})=>state.best[key]?.rank==='S'&&state.best[oldKey]?.score===123&&state.best[previousKey]?.score===456&&state.best['0_gentle'].score===1234,{key,oldKey,previousKey}));
    await page.evaluate(()=>route('rhythm'));
   }
   assert.deepEqual(errors,[]);await page.close();
  }
  console.log('PASS: all five recording songs and difficulties, file/HTTP, real keyboard/touch, pause, media ending, rewards, reload and layouts');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
