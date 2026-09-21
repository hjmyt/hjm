const http=require('node:http'),fs=require('node:fs');
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});const root=path.resolve(__dirname,'..'),server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}const data=fs.readFileSync(file),type=file.endsWith('.mp3')?'audio/mpeg':file.endsWith('.js')?'application/javascript':file.endsWith('.html')?'text/html':'application/octet-stream';const range=req.headers.range?.match(/bytes=(\d+)-(\d*)/);if(range){const start=+range[1],end=range[2]?Math.min(+range[2],data.length-1):data.length-1;res.writeHead(206,{'Content-Type':type,'Content-Range':`bytes ${start}-${end}/${data.length}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});res.end(data.subarray(start,end+1));}else{res.writeHead(200,{'Content-Type':type,'Content-Length':data.length,'Accept-Ranges':'bytes'});res.end(data);}});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url=`http://127.0.0.1:${server.address().port}/index.html`;try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const original=AC.prototype.createMediaElementSource;AC.prototype.createMediaElementSource=function(media){const source=original.call(this,media);window.bgmAnalyser=this.createAnalyser();source.connect(window.bgmAnalyser);return source;};});await page.goto(url);
 const player=()=>page.evaluate(()=>({paused:document.querySelector('#storyBgmAudio').paused,time:document.querySelector('#storyBgmAudio').currentTime,src:document.querySelector('#storyBgmAudio').getAttribute('src')?.split('?')[0] || null,duration:document.querySelector('#storyBgmAudio').duration}));
 const playing=()=>page.waitForFunction(()=>{const a=document.querySelector('#storyBgmAudio');return !a.paused&&a.currentTime>.05;});
 assert.equal((await player()).src,null,'No audio fetched on home');
 await page.evaluate(()=>route('chronicle'));assert.equal((await player()).src,null,'No playback without a gesture');
 await page.locator('#view-chronicle [data-music-toggle]').click();await playing();assert((await player()).src.endsWith('a-little-story.mp3'));assert(Math.abs((await player()).duration-204.460408)<1,'Original full-length MP3 decodes');
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
 await page.reload();await page.locator('.nav-btn[data-route="chronicle"]').click();assert((await player()).paused,'Music preference persists');assert.equal(await page.locator('#view-chronicle [data-music-volume]').inputValue(),'19');
 await page.locator('#view-chronicle [data-music-toggle]').click();await playing();
 await page.evaluate(()=>route('rhythm'));assert((await player()).paused,'Rhythm view has no story audio');
 await page.evaluate(()=>route('story'));await playing();assert((await player()).src.endsWith('a-little-story.mp3'));assert.equal(await page.locator('#view-story [data-music-volume]').inputValue(),'19');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});assert((await player()).paused,'Background tab pauses');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});await playing();
 await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));assert((await player()).paused);await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));await playing();
 // Recover from browser autoplay rejection with the explicit control.
 await page.evaluate(()=>{route('home');window.realPlay=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=()=>Promise.reject(new DOMException('Blocked','NotAllowedError'));route('story');});
 await page.waitForFunction(()=>document.querySelector('#view-story [data-music-status]').textContent==='点击播放配乐');
 await page.evaluate(()=>HTMLMediaElement.prototype.play=window.realPlay);await page.locator('#view-story [data-music-toggle]').click();await playing();
 // A missing/unreadable file is a recoverable UI state, not an unhandled rejection.
 await page.evaluate(()=>{route('home');HTMLMediaElement.prototype.play=()=>Promise.reject(new DOMException('Decode failed','NotSupportedError'));route('story');});
 await page.waitForFunction(()=>document.querySelector('#view-story [data-music-status]').textContent.includes('加载失败'));
 await page.evaluate(()=>HTMLMediaElement.prototype.play=window.realPlay);await page.locator('#view-story [data-music-toggle]').click();await playing();
 await page.evaluate(()=>StoryBgm.sync({view:'chronicle',sound:true,chapter:3,scene:'c3_prep'}));await playing();assert((await player()).src.endsWith('lakeside.mp3'));
 await page.evaluate(()=>StoryBgm.sync({view:'chronicle',sound:true,chapter:1,scene:'zhu_offer'}));await playing();assert((await player()).src.endsWith('fish-in-the-pool.mp3'));
 await page.evaluate(()=>StoryBgm.sync({view:'story',sound:true,character:'lala'}));await playing();assert((await player()).src.endsWith('distant-memories.mp3'));
 await page.evaluate(()=>StoryBgm.sync({view:'chronicle',sound:true,chapter:6,scene:'c6_intro'}));await playing();assert((await player()).src.endsWith('re-lie.mp3'),'Musical uses user supplied BGM');
 assert(Math.abs((await player()).duration-205.896)<1,'Original 320 kbps musical MP3 decodes');
 await page.waitForFunction(()=>{const a=new Float32Array(bgmAnalyser.fftSize);bgmAnalyser.getFloatTimeDomainData(a);return a.some(v=>Math.abs(v)>.00001);},{},{timeout:5000});
 await page.evaluate(()=>{document.querySelector('#storyBgmAudio').currentTime=35;StoryBgm.sync({view:'chronicle',sound:true,chapter:6,scene:'c6_warn'});});assert((await player()).time>=35,'Musical dialogue does not restart song');
 await page.evaluate(()=>StoryBgm.sync({view:'chronicle',sound:true,chapter:6,scene:'live_play'}));assert((await player()).paused,'Musical pauses for timed performance');
 await page.evaluate(()=>StoryBgm.sync({view:'chronicle',sound:true,chapter:6,scene:'c6_he',ending:'c6_he'}));await playing();assert((await player()).src.endsWith('re-lie.mp3'),'Musical finale retains Heat');
 await page.evaluate(()=>StoryBgm.sync({view:'chronicle',sound:true,chapter:4,scene:'title5',ending:'c4_fail'}));await playing();assert((await player()).src.endsWith('the-truth-that-you-leave.mp3'),'Ending screen retains its mood');
 // Rapid scene switches keep a single player and settle on the final requested track.
 await page.evaluate(()=>{route('chronicle');for(const chapter of [1,2,3,4]){Object.assign(state.chronicle.run,{chapter,scene:'menu'});renderGlobal();}});await playing();assert((await player()).src.endsWith('breath-and-life.mp3'));assert.equal(await page.locator('audio').count(),1);
 await page.setViewportSize({width:390,height:844});for(const view of ['story','chronicle']){await page.evaluate(view=>route(view),view);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),view+' mobile overflow');}
 await page.locator('#view-chronicle [data-story-music]').screenshot({path:'/tmp/hjm-story-bgm-mobile.png'});
 assert.deepEqual(errors,[]);console.log('PASS: real MP3 playback, eight tracks, rerender continuity, independent/master mute, persisted volume, scene/route/visibility changes, autoplay/decode recovery, rapid switching and mobile.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}})().catch(e=>{console.error(e);process.exitCode=1;});
