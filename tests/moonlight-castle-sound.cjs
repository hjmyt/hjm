const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),scope={};
vm.runInNewContext(fs.readFileSync(path.join(root,'js/audio/moonlight-castle-effects.js'),'utf8')+';globalThis.sfx=CastleSfx;',scope);
const buffers=new Map();
for(const id of scope.sfx.ids){
 const samples=scope.sfx.render(id,44100);let energy=0,peak=0;
 for(const value of samples){assert(Number.isFinite(value),id+' finite samples');energy+=value*value;peak=Math.max(peak,Math.abs(value));}
 assert(samples.length>4410&&peak>.05&&peak<=.721&&Math.sqrt(energy/samples.length)>.006,id+' is audible without clipping');
 assert(Math.abs(samples[0])<.001&&Math.abs(samples.at(-1))<.001,id+' has clean boundaries');buffers.set(id,samples);
}
// The piano cue has a sustained bass resonance, followed by an audible metal bolt.
const piano=buffers.get('piano-unlock');
function energy(start,end){let sum=0;for(let i=Math.floor(start*44100);i<end*44100;i++)sum+=piano[i]**2;return sum/((end-start)*44100);}
assert(energy(.1,.4)>.001);assert(energy(.63,.83)>energy(1.4,1.6)*4);
assert.equal(scope.sfx.render('unknown',44100),null);
// A listening preview built from the exact production PCM, at normal game volume.
const wav=Buffer.alloc(44+piano.length*2);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(44100,24);wav.writeUInt32LE(88200,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(piano.length*2,40);piano.forEach((value,i)=>wav.writeInt16LE(Math.round(value*1.15*.4*32767),44+i*2));fs.writeFileSync('/tmp/hjm-castle-piano-unlock.wav',wav);
let browser;
(async()=>{
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  const Native=window.AudioContext||window.webkitAudioContext;window.castleSoundEvents=[];window.castleToneEvents=[];
  const links=new WeakMap();
  function wrapConnect(node){const connect=node.connect.bind(node);node.connect=(destination,...args)=>{links.set(node,destination);return connect(destination,...args);};return node;}
  function Wrapped(...args){
   const ctx=new Native(...args),gain=ctx.createGain.bind(ctx),source=ctx.createBufferSource.bind(ctx),oscillator=ctx.createOscillator.bind(ctx);
   ctx.createGain=()=>wrapConnect(gain());
   ctx.createBufferSource=()=>{
    const node=wrapConnect(source()),start=node.start.bind(node),stop=node.stop.bind(node);let event;
    node.start=(...args)=>{const g=links.get(node),master=links.get(g),samples=node.buffer.getChannelData(0);let energy=0;for(const value of samples)energy+=value*value;event={duration:node.buffer.duration,rms:Math.sqrt(energy/samples.length)*g.gain.value*master.gain.value,volume:master.gain.value,stopped:false};window.castleSoundEvents.push(event);return start(...args);};
    node.stop=(...args)=>{if(event)event.stopped=true;return stop(...args);};return node;
   };
   ctx.createOscillator=()=>{const node=wrapConnect(oscillator()),start=node.start.bind(node);node.start=(...args)=>{const master=links.get(links.get(node));window.castleToneEvents.push({frequency:node.frequency.value,volume:master.gain.value});return start(...args);};return node;};
   return ctx;
  }
  Wrapped.prototype=Native.prototype;window.AudioContext=Wrapped;
 });
 const url=pathToFileURL(path.join(root,'moonlight-castle.html')).href;
 await page.goto(url);await page.click('#start-btn');
 const door=async room=>{const overview=page.locator('#scene-overview');if(await overview.isVisible()&&await overview.getAttribute('aria-pressed')!=='true')await overview.tap();await page.locator('#scene-doors [data-exit='+room+']').tap();};
 assert.equal(await page.evaluate(()=>castleSoundEvents.length),0,'Entering/restore does not replay action sounds');
 await page.locator('.castle-dock [data-castle-drawer=explore]').tap();await page.locator('#object-tray [data-examine=piano]').tap();
 for(const i of [0,2,4,6,1])await page.locator('.piano-key:not(.black)').nth(i).tap();
 await page.waitForFunction(()=>castleSoundEvents.some(event=>event.duration===2.5));
 await page.waitForTimeout(100);
 assert(await page.evaluate(()=>Math.abs(CastleAudio.audio.volume-CastleAudio.volume*.42)<.015),'BGM ducks while effects play');
 assert.equal(await page.evaluate(()=>G.doors.study),true);
 assert.equal(await page.evaluate(()=>castleSoundEvents.filter(event=>event.duration===2.5).length),1,'Real solution plays one resonance-plus-unlock cue');
 assert.equal(await page.evaluate(()=>castleToneEvents.length),5,'Piano keys keep their note feedback');
 await page.evaluate(()=>{CastleUI.sync();showText('钢琴发出一声低沉的共鸣。书房的方向传来门锁开启的声音！');});await page.waitForTimeout(120);
 assert.equal(await page.evaluate(()=>castleSoundEvents.length),1,'Re-render and repeated narration never synthesize effects from text');
 await door('study');assert.equal(await page.evaluate(()=>G.currentRoom),'study');
 assert.equal(await page.evaluate(()=>castleSoundEvents.at(-1).duration),1.3,'Entering a room plays the wooden door');
 await door('music');
 assert.equal(await page.evaluate(()=>G.currentRoom),'study');assert.equal(await page.evaluate(()=>castleSoundEvents.at(-1).duration),.45,'A locked door rattles without moving rooms');
 await page.evaluate(()=>{G.inventory.push('silver_key');CastleUI.sync();});
 await door('music');assert.equal(await page.evaluate(()=>G.currentRoom),'music');
 assert.equal(await page.evaluate(()=>castleSoundEvents.filter(event=>event.duration===.8).length),1,'Using a key plays one metal unlock cue');
 assert.equal(await page.evaluate(()=>castleSoundEvents.at(-1).duration),1.3,'The unlocked door then opens');
 await page.locator('.castle-dock [data-castle-drawer=music]').tap();
 await page.click('#pause-btn');assert(await page.evaluate(()=>castleSoundEvents.every(event=>event.stopped)),'Pause stops both current resonance and door sources');
 const pausedCount=await page.evaluate(()=>castleSoundEvents.length);await page.evaluate(()=>{CastleAudio.effect('unlock');CastleAudio.tone(440);});assert.equal(await page.evaluate(()=>castleSoundEvents.length),pausedCount);
 await page.click('#resume-btn');await page.waitForTimeout(120);assert.equal(await page.evaluate(()=>castleSoundEvents.length),pausedCount,'Resume never replays interrupted effects');
 await page.click('#castle-sound');await page.evaluate(()=>{CastleAudio.effect('glass');CastleAudio.tone(440);});assert.equal(await page.evaluate(()=>castleSoundEvents.length),pausedCount,'Mute gates effects');
 await page.click('#castle-sound');
 const volumes=await page.evaluate(()=>{CastleAudio.setVolume(.2);CastleAudio.effect('glass');CastleAudio.tone(440);const low=castleSoundEvents.at(-1);CastleAudio.setVolume(.8);CastleAudio.effect('glass');CastleAudio.tone(440);return{low,high:castleSoundEvents.at(-1),notes:castleToneEvents.slice(-2)};});
 assert(Math.abs(volumes.high.rms/volumes.low.rms-4)<.001,'Real source graph follows volume for effects');assert.deepEqual(volumes.notes.map(event=>Math.round(event.volume*10)),[2,8],'Notes share the volume gain');
 await page.evaluate(()=>CastleAudio.setVolume(0));const zero=await page.evaluate(()=>castleSoundEvents.length);await page.evaluate(()=>CastleAudio.effect('unlock'));assert.equal(await page.evaluate(()=>castleSoundEvents.length),zero,'Zero volume is silent');
 await page.evaluate(()=>{CastleAudio.setVolume(.4);CastleAudio.effect('door',.5);});await page.click('#pause-btn');assert(await page.evaluate(()=>castleSoundEvents.at(-1).stopped),'Pause cancels a scheduled future source');await page.click('#resume-btn');
 await page.evaluate(()=>{CastleAudio.effect('piano-unlock');Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});assert(await page.evaluate(()=>castleSoundEvents.at(-1).stopped),'Background stops effects');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});await page.click('#resume-btn');
 await page.evaluate(()=>{CastleUI.mark();CastleUI.persist();});await page.reload();await page.click('#continue-btn');assert.equal(await page.evaluate(()=>castleSoundEvents.length),0,'Save continuation does not replay previous unlock');
 await page.evaluate(()=>{CastleAudio.effect('door');window.dispatchEvent(new Event('pagehide'));});assert(await page.evaluate(()=>castleSoundEvents.at(-1).stopped),'Leaving the page stops effects');
 await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));await page.click('#resume-btn');assert(await page.evaluate(()=>CastleAudio.effect('unlock')),'Returning from page cache can play new actions');
 await page.waitForTimeout(1250);assert(await page.evaluate(()=>Math.abs(CastleAudio.audio.volume-CastleAudio.volume)<.015),'BGM smoothly returns after the final effect ends');
 assert.deepEqual(errors,[]);console.log('PASS: audible finite unclipped cues, real piano/door actions, explicit event wiring, shared note/effect volume, mute/zero, pause/background/pagehide/cache return and no save/re-render replay.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();});
