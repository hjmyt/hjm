const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const http=require('node:http');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{const file=path.join(root,new URL(req.url,'http://local').pathname);fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.mp4':'video/mp4','.webm':'video/webm'})[path.extname(file)]||'application/octet-stream');res.end(data);});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(root,'index.html')).href);
 await page.locator('[data-music-enter-muted]').click();
 const count=await page.evaluate(()=>{
  const check=(v,label)=>{if(!v)throw Error(label);};let count=0;
  state=freshState();state.sound=false;state.cards.encounters=CARD_DEFS.map(c=>c.id);save();
  for(const c of CARD_DEFS.filter(c=>!c.placeholder)){
   state.coins=199;state.affinity[c.id]=14;state.cards.daily.gifts[c.id]=0;goCard(c.id);chooseCardGift('heartfelt_encore');
   check(document.querySelector('[data-card-gift="heartfelt_encore"]')&&$('cardFeedBtn').disabled,c.id+' visible, insufficient');
   const xp=state.cards.collection[c.id].xp;feedCard();check(state.coins===199&&cardBond(c.id)===14&&!state.cards.daily.gifts[c.id],c.id+' insufficient safe');
   state.coins=400;feedCard();check(state.coins===200&&cardBond(c.id)===64&&state.cards.daily.gifts[c.id]===1,c.id+' +50 at 200');
   check(state.cards.collection[c.id].xp===xp,c.id+' no extra XP');
   check(state.chronicle.run.aff[c.id]===64,c.id+' global sync');
   feedCard();check(state.coins===0&&cardBond(c.id)===100&&state.cards.daily.gifts[c.id]===2,c.id+' cap100');
   state.coins=400;state.cards.daily.gifts[c.id]=5;feedCard();check(state.coins===400&&state.cards.daily.gifts[c.id]===5,c.id+' daily guard');
   count++;
  }
  GiftEffects.stop();
  state.affinity.lala=140;state.cards.daily.gifts.lala=0;state.coins=200;goCard('lala');chooseCardGift('heartfelt_encore');feedCard();check(cardBond('lala')===140&&state.coins===0,'historic values');
  state.cards.encounters=state.cards.encounters.filter(id=>id!=='tim');state.coins=200;check(!purchaseHeartfeltEncore('tim')&&state.coins===200,'unowned');
  for(const c of CARD_DEFS.filter(c=>c.placeholder))check(!effectiveGifts(c).some(g=>g[0]==='heartfelt_encore'),'placeholder');
  state=freshState();state.sound=false;state.cards.encounters=CARD_DEFS.map(c=>c.id);state.coins=500;goCard('shiyuan');chooseCardGift('heartfelt_encore');
  const saved=localStorage.getItem(KEY),native=Storage.prototype.setItem;
  Storage.prototype.setItem=function(){throw new Error('simulated quota');};feedCard();Storage.prototype.setItem=native;
  check(state.coins===500&&cardBond('shiyuan')===0&&!state.cards.daily.gifts.shiyuan,'failed save rollback');
  check(localStorage.getItem(KEY)===saved&&!document.querySelector('.gift-performance'),'failed save leaves original untouched');
  storageOK=true;feedCard();check(state.coins===300&&cardBond('shiyuan')===50,'retry once');GiftEffects.stop();
  const old=cleanState(JSON.parse(localStorage.getItem(KEY)));check(old&&old.affinity.shiyuan===50,'existing save structure');
  return count;
 });
 await page.reload();assert.equal(await page.evaluate(()=>cardBond('shiyuan')),50);assert.equal(await page.evaluate(()=>state.cards.daily.gifts.shiyuan),1);
 await page.locator('[data-music-enter-muted]').click();
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.evaluate(()=>{state=freshState();state.sound=false;state.coins=400;state.cards.encounters=CARD_DEFS.map(c=>c.id);state.affinity.shiyuan=14;goCard('shiyuan');chooseCardGift('heartfelt_encore');feedCard();});
 assert.equal(await page.evaluate(()=>cardBond('shiyuan')),64);
 assert.equal(await page.locator('#cardFeeding .progress-fill').evaluate(e=>parseFloat(e.style.width)),14);
 await page.waitForFunction(()=>document.querySelector('.gift-encore-video')?.currentTime>4);
 await page.screenshot({path:'/tmp/hjm-encore-game.png'});
 await page.waitForFunction(()=>document.querySelector('.is-ritual-delivered'));
 const anchor=await page.locator('#view-card .character-cover').boundingBox(),halo=await page.locator('.gift-ritual-target').boundingBox();
 assert(Math.abs(anchor.x-halo.x)<1 && Math.abs(anchor.y-halo.y)<1,'Delivery attaches to the actual game character');
 await page.waitForFunction(()=>document.querySelector('.is-bond-growing'));
 await page.waitForFunction(()=>!document.querySelector('.is-bond-growing'));
 assert.equal(await page.locator('#cardFeeding .progress-fill').evaluate(e=>parseFloat(e.style.width)),64);
 assert.equal(await page.evaluate(()=>state.coins),200);
 await page.setViewportSize({width:390,height:844});await page.goto(pathToFileURL(path.join(root,'index.html')).href);await page.locator('[data-music-enter-muted]').click();
 await page.evaluate(()=>{state=freshState();state.sound=false;state.coins=250;state.cards.encounters=CARD_DEFS.map(c=>c.id);save();goCard('shiyuan');chooseCardGift('heartfelt_encore');feedCard();});
 await page.waitForFunction(()=>document.querySelector('.gift-encore-video')?.currentTime>4);await page.screenshot({path:'/tmp/hjm-encore-game-390.png'});
 assert(await page.locator('.gift-performance').evaluate(e=>e.classList.contains('is-gift-full-background')),'Live phone page receives blended full-scene gift');
 const phoneBounds=await page.locator('.gift-encore-video').boundingBox();assert(phoneBounds.x>=0&&phoneBounds.y>=0&&phoneBounds.x+phoneBounds.width<=391&&phoneBounds.y+phoneBounds.height<=845,'Full-scene footage stays in phone viewport');await page.evaluate(()=>GiftEffects.stop());
 for(const width of [1280,390]){
  await page.setViewportSize({width,height:900});await page.goto(pathToFileURL(path.join(root,'previews/gift-effects.html')).href+'?effect=encore');
  assert.equal(await page.locator('#gift').inputValue(),'heartfelt_encore');await page.locator('#replay').click();
  await page.waitForFunction(()=>document.querySelector('.gift-encore-video')?.currentTime>1.25);
  assert.equal(await page.locator('.gift-ritual-box').count(),1);await page.screenshot({path:`/tmp/hjm-encore-box-${width}.png`});
  await page.waitForFunction(()=>document.querySelector('.gift-encore-video')?.currentTime>4);
  assert(await page.locator('.gift-encore-video').evaluate(v=>v.currentSrc.endsWith('.mp4')),'Uses compressed full-scene delivery video');
  assert(await page.locator('.gift-performance').evaluate(e=>e.classList.contains('is-gift-full-background')),'Scene footage uses integrated full-background compositing');
  assert(await page.locator('.gift-encore-video').evaluate(v=>v.videoWidth===480&&v.webkitAudioDecodedByteCount>0&&!v.muted));
  const bounds=await page.locator('.gift-encore-video').boundingBox();assert(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=width+1&&bounds.y+bounds.height<=901);
  await page.screenshot({path:`/tmp/hjm-encore-${width}.png`});
  await page.waitForSelector('.is-encore-delivery',{timeout:10000});await page.waitForSelector('.gift-performance',{state:'detached',timeout:4000});
 }
 await page.locator('#stage-replay').click();await page.waitForFunction(()=>document.querySelector('.gift-encore-video')?.currentTime>.2);
 await page.evaluate(()=>{window.lastVideo=document.querySelector('.gift-encore-video');gallerySound=false;});await page.waitForFunction(()=>lastVideo.muted);
 await page.locator('.gift-dragon-skip').click();assert(await page.evaluate(()=>lastVideo.paused&&!lastVideo.hasAttribute('src')));
 await page.locator('#stage-replay').click();await page.keyboard.press('Escape');assert.equal(await page.locator('.gift-performance').count(),0);
 await page.locator('#stage-replay').click();await page.locator('#stage-replay').click();assert.equal(await page.locator('.gift-encore-video').count(),1);await page.evaluate(()=>GiftEffects.stop());
 await page.locator('#stage-replay').click();await page.evaluate(()=>document.querySelector('.gift-encore-video').dispatchEvent(new Event('error')));await page.waitForSelector('.gift-encore-poster:not([hidden])');await page.waitForSelector('.gift-performance',{state:'detached'});
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#stage-replay').click();assert.equal(await page.locator('.gift-encore-video').count(),0);await page.evaluate(()=>GiftEffects.stop());
 // HTTP soundtrack is real decoded audio; preview never changes game storage.
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(`http://127.0.0.1:${server.address().port}/previews/gift-effects.html?effect=encore`);await page.locator('#replay').click();
 await page.evaluate(async()=>{window.ac=new AudioContext();await ac.resume();window.m=ac.createAnalyser();m.fftSize=2048;ac.createMediaElementSource(document.querySelector('.gift-encore-video')).connect(m);m.connect(ac.destination);window.level=()=>{const a=new Float32Array(2048);m.getFloatTimeDomainData(a);return Math.max(...a.map(Math.abs));};});
 await page.waitForFunction(()=>level()>.001);
 const alpha=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=720;c.height=1280;const x=c.getContext('2d');x.drawImage(document.querySelector('.gift-encore-video'),0,0);return x.getImageData(0,0,1,1).data[3];});assert.equal(alpha,255,'Full scene video retains its generated background and is blended by game effects');
 await page.evaluate(()=>GiftEffects.stop());await page.waitForTimeout(100);assert(await page.evaluate(()=>level()<.0001));await page.evaluate(()=>ac.close());
 assert.deepEqual(errors,[]);console.log(`PASS: ${count} recipients, 200/+50, cap/history, daily/insufficient/unowned/placeholder, save rollback/reload, file/HTTP audio, full playback, desktop/mobile, mute/skip/replay/failure/reduced motion.`);
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
