const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.mp3':'audio/mpeg','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
});
let browser;
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  // Model mobile browsers that ignore HTMLMediaElement.volume writes.
  Object.defineProperty(HTMLMediaElement.prototype,'volume',{configurable:true,get:()=>1,set(){}});
  const Native=window.AudioContext;window.bgmGraphCreations=0;
  function Wrapped(...args){const ctx=new Native(...args),create=ctx.createMediaElementSource.bind(ctx);ctx.createMediaElementSource=media=>{
   const node=create(media),connect=node.connect.bind(node);node.connect=destination=>{if(media.id==='castleBgm'){window.bgmGraph={ctx,node,gain:destination};window.bgmGraphCreations++;}return connect(destination);};return node;
  };return ctx;}
  Wrapped.prototype=Native.prototype;window.AudioContext=Wrapped;
 });
 await page.goto(`http://127.0.0.1:${server.address().port}/moonlight-castle.html`);await page.click('#start-btn');
 await page.waitForFunction(()=>window.bgmGraph&&CastleAudio.audio.currentTime>.15&&bgmGraph.ctx.state==='running');
 await page.evaluate(()=>{const {ctx,gain}=bgmGraph;window.bgmMeter=ctx.createAnalyser();bgmMeter.fftSize=2048;gain.connect(bgmMeter);window.bgmRms=()=>{const data=new Float32Array(bgmMeter.fftSize);bgmMeter.getFloatTimeDomainData(data);return Math.sqrt(data.reduce((sum,v)=>sum+v*v,0)/data.length);};});
 await page.waitForFunction(()=>bgmRms()>1e-5);
 assert.equal(await page.evaluate(()=>CastleAudio.audio.volume),1,'Media volume really ignores writes in this fixture');
 // Feed a stable reference into the exact production BGM gain, after proving
 // the real MP3 reaches it. This removes track dynamics from RMS comparisons.
 await page.evaluate(()=>{const {ctx,node,gain}=bgmGraph;node.disconnect();const tone=ctx.createOscillator(),level=ctx.createGain();tone.frequency.value=440;level.gain.value=.2;tone.connect(level);level.connect(gain);tone.start();});
 await page.waitForTimeout(100);const baseline=await page.evaluate(()=>bgmRms());assert(baseline>.04);
 await page.click('#npc-siyang');await page.waitForFunction(()=>CastleVoice.player.currentTime>.1&&!CastleVoice.player.paused);
 await page.waitForTimeout(100);const spoken=await page.evaluate(()=>bgmRms());assert(Math.abs(spoken/baseline-.05)<.005,'Actual music signal falls to 5% despite ignored media volume');
 await page.evaluate(()=>CastleAudio.effect('glass'));await page.waitForTimeout(800);
 assert(Math.abs((await page.evaluate(()=>bgmRms()))/baseline-.05)<.005,'An effect ending cannot restore music while speech continues');
 await page.evaluate(()=>CastleAudio.sync('loop-two'));await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>bgmGraphCreations),1,'Track changes reuse the routed audio element');
 assert(Math.abs((await page.evaluate(()=>CastleAudio.bgmVolume))-.02)<.002);
 await page.evaluate(()=>CastleVoice.stop());await page.waitForTimeout(150);const rising=await page.evaluate(()=>bgmRms());assert(rising>spoken&&rising<baseline*.8,'Music recovers gradually');
 await page.waitForTimeout(550);assert(Math.abs((await page.evaluate(()=>bgmRms()))/baseline-1)<.03,'Music returns to the selected level');
 await page.click('#castle-voice-replay');await page.waitForTimeout(100);assert(Math.abs((await page.evaluate(()=>bgmRms()))/baseline-.05)<.005,'Replay ducks music again');
 await page.evaluate(()=>CastleAudio.setVolume(.8));await page.waitForTimeout(700);assert(Math.abs((await page.evaluate(()=>CastleAudio.bgmVolume))-.04)<.002,'Volume changes retain the dialogue ratio');
 await page.evaluate(()=>showText('没有人物开口的场景叙述。'));await page.waitForTimeout(700);assert(Math.abs((await page.evaluate(()=>CastleAudio.bgmVolume))-.8)<.002,'Unvoiced text restores music');
 assert.deepEqual(errors,[]);console.log('PASS: real HTTP BGM decoding, mobile ignored-volume compatibility, measured 5% dialogue duck, effect overlap, track reuse, gradual recovery, replay, volume changes and unvoiced narration.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();await new Promise(resolve=>server.close(resolve));});
