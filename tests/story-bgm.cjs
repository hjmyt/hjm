const http=require('node:http'),fs=require('node:fs');
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{const browser=await chromium.launch({headless:true,args:['--autoplay-policy=document-user-activation-required'],...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});const root=path.resolve(__dirname,'..'),server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}const data=fs.readFileSync(file),type=file.endsWith('.mp3')?'audio/mpeg':file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream';const range=req.headers.range?.match(/bytes=(\d+)-(\d*)/);if(range){const start=+range[1],end=range[2]?Math.min(+range[2],data.length-1):data.length-1;res.writeHead(206,{'Content-Type':type,'Content-Range':`bytes ${start}-${end}/${data.length}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});res.end(data.subarray(start,end+1));}else{res.writeHead(200,{'Content-Type':type,'Content-Length':data.length,'Accept-Ranges':'bytes'});res.end(data);}});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url=`http://127.0.0.1:${server.address().port}/index.html`;try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const original=AC.prototype.createMediaElementSource;AC.prototype.createMediaElementSource=function(media){const source=original.call(this,media);window.bgmAnalyser=this.createAnalyser();source.connect(window.bgmAnalyser);return source;};});await page.goto(url);
 const player=()=>page.evaluate(()=>({paused:document.querySelector('#storyBgmAudio').paused,time:document.querySelector('#storyBgmAudio').currentTime,src:document.querySelector('#storyBgmAudio').getAttribute('src')?.split('?')[0] || null,duration:document.querySelector('#storyBgmAudio').duration}));
 const playing=()=>page.waitForFunction(()=>{const a=document.querySelector('#storyBgmAudio');return !a.paused&&a.currentTime>.05;});
 await page.waitForFunction(()=>!document.querySelector('#musicWelcome').hidden);
 assert(await page.locator('#musicWelcome').isVisible(),'Every page load opens the welcome entrance');
 assert.equal(await page.locator('#musicWelcomeTitle').textContent(),'欢迎来到《恋与哈基米》');
 assert(await page.locator('.music-welcome-art img').evaluate(img=>img.complete&&img.naturalWidth===1448&&img.naturalHeight===1086),'Welcome illustration loads at its original resolution');
 assert(!(await page.locator('[data-music-enter]').evaluate(button=>button.matches(':focus'))),'Welcome does not draw a focus ring before keyboard navigation');
 await page.locator('#musicWelcome').screenshot({path:'/tmp/hjm-music-welcome.png'});
 assert.equal((await player()).src,null,'Music waits for an explicit entrance choice');
 assert((await player()).paused,'Welcome entrance keeps music paused');
 await page.locator('[data-music-enter]').click();await playing();assert(await page.locator('#musicWelcome').isHidden());
 await page.locator('.nav-btn[data-route="chronicle"]').click();await playing();assert((await player()).src.endsWith('a-little-story.mp3'));assert(Math.abs((await player()).duration-204.460408)<1,'Original full-length MP3 decodes');
 await page.waitForFunction(()=>{if(!window.bgmAnalyser)return true;const a=new Float32Array(bgmAnalyser.fftSize);bgmAnalyser.getFloatTimeDomainData(a);return a.some(v=>Math.abs(v)>.00001);},{},{timeout:5000});
 await page.evaluate(()=>{document.querySelector('#storyBgmAudio').currentTime=25;renderGlobal();renderGlobal();});assert((await player()).time>=25,'Dialogue rendering does not restart track');
 const setScene=async(ch,scene,extra={})=>{await page.evaluate(([ch,scene,extra])=>{closeModal(false);Object.assign(state.chronicle.run,{chapter:ch,ch,scene,...extra});renderGlobal();},[ch,scene,extra]);};
 await setScene(2,'c2_bar');await playing();assert((await player()).src.endsWith('refrain.mp3'));
 await setScene(4,'shanqiu_closed');await playing();assert((await player()).src.endsWith('the-truth-that-you-leave.mp3'));
 await page.evaluate(()=>{state.chronicle.run.bar.closed=true;state.chronicle.run.bar.closureSeen=true;});await setScene(4,'zhu_offer');assert((await player()).src.endsWith('the-truth-that-you-leave.mp3'),'Closure treat retains mood');
 await page.evaluate(()=>StoryBgm.sync({view:'chronicle',sound:true,chapter:4,scene:'live_play'}));assert((await player()).paused,'Timed performance suspends BGM');
 await setScene(4,'c4_prep');await playing();
 await page.locator('#soundBtn').click();assert((await player()).paused,'Master mute immediately pauses');await page.locator('#soundBtn').click();await playing();
 await page.locator('#view-chronicle [data-music-volume]').fill('19');
 await page.locator('#view-chronicle [data-music-toggle]').click();assert((await player()).paused,'Independent music mute');
 await page.reload();assert(await page.locator('#musicWelcome').isVisible(),'Reload always restores the welcome entrance');await page.locator('[data-music-enter-muted]').click();await page.locator('.nav-btn[data-route="chronicle"]').click();assert((await player()).paused,'Music preference persists');assert.equal(await page.locator('#view-chronicle [data-music-volume]').inputValue(),'19');
 await page.locator('#view-chronicle [data-music-toggle]').click();await playing();
 await page.evaluate(()=>route('rhythm'));assert((await player()).paused,'Rhythm view has no story audio');
 await page.evaluate(()=>route('story'));await playing();assert((await player()).src.endsWith('a-little-story.mp3'));assert.equal(await page.locator('#view-story [data-music-volume]').inputValue(),'19');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});assert((await player()).paused,'Background tab pauses');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});await playing();
 await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));assert((await player()).paused);await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));await playing();
 // Recover from browser autoplay rejection with the explicit control.
 await page.evaluate(()=>{route('home');window.realPlay=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=()=>Promise.reject(new DOMException('Blocked','NotAllowedError'));route('story');});
 await page.waitForFunction(()=>document.querySelector('#view-story [data-music-status]').textContent==='浏览器阻止自动播放，点击开启');
 await page.evaluate(()=>HTMLMediaElement.prototype.play=window.realPlay);await page.locator('[data-music-enter]').click();await playing();
 // A missing/unreadable file is a recoverable UI state, not an unhandled rejection.
 await page.evaluate(()=>{route('home');HTMLMediaElement.prototype.play=()=>Promise.reject(new DOMException('Decode failed','NotSupportedError'));route('story');});
 await page.waitForFunction(()=>document.querySelector('#view-story [data-music-status]').textContent.includes('加载失败'));
 await page.evaluate(()=>HTMLMediaElement.prototype.play=window.realPlay);await page.locator('#view-story [data-music-toggle]').click();await playing();
 await page.evaluate(()=>StoryBgm.sync({view:'chronicle',sound:true,chapter:3,scene:'c3_prep'}));await playing();assert((await player()).src.endsWith('lakeside.mp3'));
 await page.evaluate(()=>StoryBgm.sync({view:'chronicle',sound:true,chapter:1,scene:'zhu_offer'}));await playing();assert((await player()).src.endsWith('fish-in-the-pool.mp3'));
 await page.evaluate(()=>StoryBgm.sync({view:'story',sound:true,character:'lala'}));await playing();assert((await player()).src.endsWith('distant-memories.mp3'));
 await page.evaluate(()=>StoryBgm.sync({view:'chronicle',sound:true,chapter:6,scene:'c6_intro'}));await playing();assert((await player()).src.endsWith('re-lie.mp3'),'Musical uses user supplied BGM');
 assert(Math.abs((await player()).duration-207.192)<1,'Current musical MP3 decodes');
 await page.waitForFunction(()=>{const a=new Float32Array(bgmAnalyser.fftSize);bgmAnalyser.getFloatTimeDomainData(a);return a.some(v=>Math.abs(v)>.00001);},{},{timeout:5000});
 await page.evaluate(()=>{document.querySelector('#storyBgmAudio').currentTime=35;StoryBgm.sync({view:'chronicle',sound:true,chapter:6,scene:'c6_warn'});});assert((await player()).time>=35,'Musical dialogue does not restart song');
 await page.evaluate(()=>StoryBgm.sync({view:'chronicle',sound:true,chapter:6,scene:'live_play'}));assert((await player()).paused,'Musical pauses for timed performance');
 await page.evaluate(()=>StoryBgm.sync({view:'chronicle',sound:true,chapter:6,scene:'c6_he',ending:'c6_he'}));await playing();assert((await player()).src.endsWith('re-lie.mp3'),'Musical finale retains Heat');
 await page.evaluate(()=>StoryBgm.sync({view:'chronicle',sound:true,chapter:4,scene:'title5',ending:'c4_fail'}));await playing();assert((await player()).src.endsWith('the-truth-that-you-leave.mp3'),'Ending screen retains its mood');
 // Rapid scene switches keep a single player and settle on the final requested track.
 await page.evaluate(()=>{route('chronicle');for(const chapter of [1,2,3,4]){Object.assign(state.chronicle.run,{chapter,scene:'menu'});renderGlobal();}});await playing();assert((await player()).src.endsWith('breath-and-life.mp3'));assert.equal(await page.locator('audio').count(),1);
 await page.setViewportSize({width:390,height:844});for(const view of ['story','chronicle']){await page.evaluate(view=>route(view),view);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),view+' mobile overflow');}
 await page.locator('#view-chronicle [data-story-music]').screenshot({path:'/tmp/hjm-story-bgm-mobile.png'});
 // The welcome entrance unlocks sound, then direct navigation keeps audible output.
 // Measure after the volume gain: a running media clock or pre-gain signal can still be silent.
 for(const touch of [false,true]){
  const ctx=await browser.newContext({viewport:touch?{width:390,height:844}:{width:1440,height:1000},hasTouch:touch,isMobile:touch}),direct=await ctx.newPage();
  direct.on('pageerror',e=>errors.push(e.message));
  await direct.addInitScript(()=>{
   const AC=window.AudioContext||window.webkitAudioContext,createGain=AC.prototype.createGain;
   AC.prototype.createGain=function(...args){
    const gain=createGain.apply(this,args),connect=gain.connect;
    gain.connect=function(destination,...rest){
     const result=connect.call(this,destination,...rest);
     if(destination===this.context.destination){window.directBgmGain=this;window.directBgmOutput=this.context.createAnalyser();connect.call(this,window.directBgmOutput);}
     return result;
    };
    return gain;
   };
  });
  await direct.goto(url);await direct.reload();
  await direct.waitForFunction(()=>!document.querySelector('#musicWelcome').hidden);
  const enter=direct.locator('[data-music-enter]');
  if(touch)await enter.tap();else await enter.click();
  const nav=direct.locator('.nav-btn[data-route="chronicle"]');
  if(touch)await nav.tap();else await nav.click();
  await direct.waitForFunction(()=>{const a=document.querySelector('#storyBgmAudio');return !a.paused&&a.currentSrc.includes('a-little-story.mp3')&&a.currentTime>.1;});
  await direct.waitForFunction(()=>{if(!window.directBgmOutput)return false;const samples=new Float32Array(directBgmOutput.fftSize);directBgmOutput.getFloatTimeDomainData(samples);return samples.some(v=>Math.abs(v)>.00001);},null,{timeout:5000});
  assert(await direct.evaluate(()=>directBgmGain.gain.value>0),'First navigation restores audible output gain');
  await ctx.close();
 }
 // Fresh site startup, uninterrupted browsing and actual end-to-start looping.
 for(const entry of [url,pathToFileURL(path.join(root,'index.html')).href]){
  const ctx=await browser.newContext({viewport:{width:1440,height:1000}}),site=await ctx.newPage();
  site.on('pageerror',e=>errors.push(e.message));
  await site.goto(entry);
  const status=()=>site.evaluate(()=>{const a=document.querySelector('#storyBgmAudio');return {src:a.getAttribute('src'),paused:a.paused,time:a.currentTime,loop:a.loop,duration:a.duration};});
  const waitSite=()=>site.waitForFunction(()=>{const a=document.querySelector('#storyBgmAudio');return a.currentSrc.includes('love-hakimi-strings.mp3')&&a.readyState>=2&&!a.paused&&a.currentTime>.05;});
  await site.waitForFunction(()=>!document.querySelector('#musicWelcome').hidden);
  assert.equal((await status()).src,null,'Fresh entry waits behind the welcome entrance');
  assert((await status()).paused,'Welcome entrance stays paused');
  await site.locator('[data-music-enter]').click();await waitSite();
  assert.equal((await status()).loop,true,'Whole song loops');
  assert(Math.abs((await status()).duration-154.8535)<1,'Full string recording decodes');
  await site.evaluate(()=>document.querySelector('#storyBgmAudio').currentTime=20);
  for(const view of ['cards','card','care','album','home']){
   await site.evaluate(view=>route(view),view);await waitSite();
   assert((await status()).time>=20,view+' keeps the music position');
   assert(await site.locator('#siteMusicControls').isVisible());
  }
  await site.evaluate(()=>{const a=document.querySelector('#storyBgmAudio');a.currentTime=a.duration-.2;});
  await site.waitForFunction(()=>{const a=document.querySelector('#storyBgmAudio');return !a.paused&&a.currentTime>0&&a.currentTime<2;});
  await site.locator('#soundBtn').click();assert((await status()).paused);
  await site.locator('#soundBtn').click();await waitSite();
  await site.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});assert((await status()).paused);
  await site.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});await waitSite();
  await site.evaluate(()=>route('chronicle'));
  await site.waitForFunction(()=>{const a=document.querySelector('#storyBgmAudio');return !a.paused&&a.currentSrc.includes('a-little-story.mp3')&&a.currentTime>.05;});
  assert(await site.locator('#siteMusicControls').isHidden());
  await site.evaluate(()=>StoryBgm.sync({view:'chronicle',chapter:7,scene:'cp_BE',ending:'cp_BE',sound:true}));
  await site.waitForFunction(()=>{const a=document.querySelector('#storyBgmAudio');return !a.paused&&a.currentSrc.includes('huimosrushen-de-mingzi.mp3')&&a.currentTime>.05;});
  assert((await status()).duration>1,'Baoshi-Feihong BE song decodes');
  await site.evaluate(()=>StoryBgm.sync({view:'chronicle',chapter:1,scene:'training',sound:true}));assert((await status()).paused,'Training pauses music');
  await site.evaluate(()=>route('home'));await waitSite();
  await site.evaluate(()=>route('rhythm'));assert((await status()).paused,'Rhythm stage pauses site music');
  await site.locator('#startGame').click();assert((await status()).paused,'No background track over the rhythm song');
  await site.evaluate(()=>route('home'));await waitSite();
  assert.equal(await site.locator('#storyBgmAudio').count(),1,'One shared BGM player');
  await site.locator('#siteMusicControls [data-music-volume]').fill('21');
  await site.locator('#siteMusicControls [data-music-toggle]').click();assert((await status()).paused);
  await site.reload();assert(await site.locator('#musicWelcome').isVisible(),'Welcome returns even when music was off');await site.locator('[data-music-enter-muted]').click();assert((await status()).paused,'Music off persists');
  assert.equal(await site.locator('#siteMusicControls [data-music-volume]').inputValue(),'21');
  await site.locator('#siteMusicControls [data-music-toggle]').click();await waitSite();
  for(const width of [320,390,1440]){
   await site.setViewportSize({width,height:900});
   assert(await site.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Site control fits '+width);
  }
  if(entry===url)await site.locator('#siteMusicControls').screenshot({path:'/tmp/hjm-site-music.png'});
  await ctx.close();
 }
 // Quiet entry dismisses the welcome layer, but every reload asks again.
 const quietContext=await browser.newContext(),quiet=await quietContext.newPage();
 await quiet.goto(url);
 await quiet.waitForFunction(()=>!document.querySelector('#musicWelcome').hidden);
 await quiet.locator('[data-music-enter-muted]').click();
 assert(await quiet.locator('#musicWelcome').isHidden());
 assert.equal(await quiet.locator('#siteMusicControls [data-music-status]').textContent(),'配乐已关闭');
 assert((await quiet.evaluate(()=>document.querySelector('#storyBgmAudio').paused)),'Quiet entry does not play audio');
 await quiet.reload();
 assert(await quiet.locator('#musicWelcome').isVisible(),'Quiet choice never skips the next welcome entrance');
 await quiet.locator('[data-music-enter]').click();await quiet.waitForFunction(()=>!document.querySelector('#storyBgmAudio').paused);
 await quietContext.close();
 // Even a browser that allows autoplay waits for the welcome choice on every load.
 const autoBrowser=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required'],...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  for(const entry of [url,pathToFileURL(path.join(root,'index.html')).href]){
   const ctx=await autoBrowser.newContext(),auto=await ctx.newPage();
   auto.on('pageerror',e=>errors.push(e.message));
   await auto.goto(entry);
   const autoPlaying=()=>auto.waitForFunction(()=>{const a=document.querySelector('#storyBgmAudio');return !a.paused&&!a.muted&&a.volume>0&&a.currentTime>.1&&a.loop;});
   assert(await auto.locator('#musicWelcome').isVisible());assert.equal(await auto.locator('#storyBgmAudio').getAttribute('src'),null);
   await auto.locator('[data-music-enter]').click();await autoPlaying();
   assert.equal(await auto.locator('#siteMusicControls [data-music-status]').textContent(),'正在播放');
   await auto.reload();assert(await auto.locator('#musicWelcome').isVisible());await auto.locator('[data-music-enter]').click();await autoPlaying();
   await auto.locator('#siteMusicControls [data-music-toggle]').click();
   assert(await auto.evaluate(()=>document.querySelector('#storyBgmAudio').paused));
   await auto.reload();
   assert(await auto.locator('#musicWelcome').isVisible(),'Saved music-off preference still shows welcome');
   assert.equal(await auto.locator('#storyBgmAudio').getAttribute('src'),null,'Welcome prevents playback before a choice');
   await auto.locator('[data-music-enter-muted]').click();
   await auto.locator('#siteMusicControls [data-music-toggle]').click();await autoPlaying();
   await auto.locator('#soundBtn').click();await auto.reload();assert(await auto.locator('#musicWelcome').isVisible());await auto.locator('[data-music-enter]').click();
   assert.equal(await auto.locator('#storyBgmAudio').getAttribute('src'),null,'Saved master mute prevents autoplay');
   await ctx.close();
  }
 }finally{await autoBrowser.close();}
 assert.deepEqual(errors,[]);console.log('PASS: every-load illustrated welcome, explicit sound/quiet entrance, blocked-playback recovery, full-track playback and looping over file/HTTP, browsing continuity, original story tracks, independent/master mute, persisted volume, training/rhythm/background pause, recovery and mobile.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}})().catch(e=>{console.error(e);process.exitCode=1;});
