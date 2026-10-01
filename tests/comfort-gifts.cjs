const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const http=require('node:http');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const pairs=[['feihong','baoshi_comfort','宝石的安慰'],['baoshi','feihong_comfort','飞鸿的安慰']];
(async()=>{
 const server=http.createServer((req,res)=>{const file=path.join(root,new URL(req.url,'http://local').pathname);fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.webm':'video/webm'})[path.extname(file)]||'application/octet-stream');res.end(data);});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(root,'index.html')).href);await page.locator('[data-music-enter-muted]').click();
 await page.evaluate(pairs=>{
  const check=(v,s)=>{if(!v)throw Error(s);};
  state=freshState();state.sound=false;state.cards.encounters=CARD_DEFS.map(c=>c.id);save();
  for(const c of CARD_DEFS){const found=effectiveGifts(c).filter(isComfortGift),pair=pairs.find(p=>p[0]===c.id);check(found.length===(pair?1:0),c.id+' recipient isolation');if(pair)check(found[0][0]===pair[1]&&found[0][1]===pair[2],c.id+' direction');}
  for(const [id,gift] of pairs){
   const other=id==='baoshi'?'feihong':'baoshi';state.affinity[id]=14;state.affinity[other]=7;state.coins=99;state.cards.daily.gifts[id]=0;goCard(id);chooseCardGift(gift);
   check($('cardFeedBtn').disabled,'insufficient disabled');feedCard();check(state.coins===99&&cardBond(id)===14&&!state.cards.daily.gifts[id],'insufficient no mutation');
   const xp=state.cards.collection[id].xp;state.coins=300;feedCard();GiftEffects.stop();
   check(state.coins===200&&cardBond(id)===44&&state.cards.daily.gifts[id]===1,'100/+30');check(cardBond(other)===7,'giver bond unchanged');
   check(state.cards.collection[id].xp===xp&&state.chronicle.run.aff[id]===44,'no XP and global sync');
   state.affinity[id]=90;feedCard();GiftEffects.stop();check(cardBond(id)===100&&state.coins===100,'cap100');
   state.affinity[id]=140;feedCard();GiftEffects.stop();check(cardBond(id)===140&&state.coins===0,'historic value retained, repeat paid');
   state.coins=100;state.cards.daily.gifts[id]=5;feedCard();check(state.coins===100&&state.cards.daily.gifts[id]===5,'daily guard');
   state.cards.daily.date='2000-01-01';feedCard();GiftEffects.stop();check(state.coins===0&&state.cards.daily.gifts[id]===1,'new day');
   state.coins=100;check(!purchaseComfortGift(other,gift)&&!giftEffectFor(other,gift),'wrong recipient rejected');
   state.cards.encounters=state.cards.encounters.filter(c=>c!==id);check(!purchaseComfortGift(id,gift)&&state.coins===100,'unowned rejected');state.cards.encounters.push(id);
  }
  state=freshState();state.sound=false;state.cards.encounters=CARD_DEFS.map(c=>c.id);state.coins=500;goCard('baoshi');chooseCardGift('feihong_comfort');save();
  const saved=localStorage.getItem(KEY),native=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw Error('simulated quota');};feedCard();Storage.prototype.setItem=native;
  check(state.coins===500&&cardBond('baoshi')===0&&!state.cards.daily.gifts.baoshi,'save failure rollback');check(localStorage.getItem(KEY)===saved&&!document.querySelector('.gift-performance'),'no effect or overwrite on failure');
  storageOK=true;feedCard();GiftEffects.stop();check(state.coins===400&&cardBond('baoshi')===30,'retry settles once');
 },pairs);
 await page.reload();assert.equal(await page.evaluate(()=>cardBond('baoshi')),30);assert.equal(await page.evaluate(()=>state.cards.daily.gifts.baoshi),1);
 await page.locator('[data-music-enter-muted]').click();await page.emulateMedia({reducedMotion:'no-preference'});
 // Real game presentation waits for the media, then the actual card receives the heart.
 await page.evaluate(()=>{state.coins=500;goCard('feihong');chooseCardGift('baoshi_comfort');feedCard();});
 assert.equal(await page.evaluate(()=>cardBond('feihong')),30);assert.equal(await page.locator('#cardFeeding .progress-fill').evaluate(e=>parseFloat(e.style.width)),0);
 await page.waitForFunction(()=>document.querySelector('.gift-encore-video')?.currentTime>4);
 await page.screenshot({path:'/tmp/hjm-comfort-game.png'});
 await page.waitForSelector('.is-ritual-delivered');
 const target=await page.locator('#view-card .character-cover').boundingBox(),halo=await page.locator('.gift-ritual-target').boundingBox();assert(Math.abs(target.x-halo.x)<1&&Math.abs(target.y-halo.y)<1);
 await page.waitForSelector('.gift-performance',{state:'detached'});await page.waitForFunction(()=>!document.querySelector('.is-bond-growing'));
 assert.equal(await page.locator('#cardFeeding .progress-fill').evaluate(e=>parseFloat(e.style.width)),30);assert.equal(await page.evaluate(()=>state.coins),400);
 for(const width of [1280,390])for(const [id,gift,name] of pairs){
  await page.setViewportSize({width,height:900});await page.goto(pathToFileURL(path.join(root,'previews/gift-effects.html')).href+'?effect='+gift);
  assert.equal(await page.locator('#character').inputValue(),id);assert.equal(await page.locator('#gift').inputValue(),gift);await page.locator('#replay').click();
  await page.waitForFunction(()=>document.querySelector('.gift-encore-video')?.currentTime>3);
  assert.equal(await page.locator('.gift-ritual-title span').textContent(),name);
  assert(await page.locator('.gift-encore-video').evaluate((v,gift)=>v.currentSrc.includes(gift.split('_')[0]+'-comfort-delivery')&&v.webkitAudioDecodedByteCount>0&&!v.muted,gift));
  const box=await page.locator('.gift-encore-video').boundingBox();assert(box.x>=-1&&box.y>=-1&&box.x+box.width<=width+1&&box.y+box.height<=901);
  await page.screenshot({path:`/tmp/hjm-${gift}-${width}.png`});
  if(width===1280){await page.waitForSelector('.is-ritual-delivered');await page.waitForSelector('.gift-performance',{state:'detached'});}else{await page.locator('.gift-dragon-skip').click();}
 }
 await page.locator('#stage-replay').click();await page.evaluate(()=>{window.lastVideo=document.querySelector('.gift-encore-video');gallerySound=false;});await page.waitForFunction(()=>lastVideo.muted);
 await page.keyboard.press('Escape');assert(await page.evaluate(()=>lastVideo.paused&&!lastVideo.hasAttribute('src')));
 await page.locator('#stage-replay').click();await page.locator('#stage-replay').click();assert.equal(await page.locator('.gift-encore-video').count(),1);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await page.locator('.gift-performance').count(),0);
 await page.goto(pathToFileURL(path.join(root,'previews/gift-effects.html')).href+'?effect=feihong_comfort');await page.locator('#replay').click();
 await page.evaluate(()=>document.querySelector('.gift-encore-video').dispatchEvent(new Event('error')));await page.waitForSelector('.gift-encore-poster:not([hidden])');await page.waitForSelector('.gift-performance',{state:'detached'});
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#stage-replay').click();assert.equal(await page.locator('.gift-encore-video').count(),0);assert.equal(await page.locator('.gift-comfort-art').count(),1);await page.evaluate(()=>GiftEffects.stop());
 // Both films decode real alpha and audible soundtrack over HTTP.
 await page.emulateMedia({reducedMotion:'no-preference'});
 for(const [,gift] of pairs){
  await page.goto(`http://127.0.0.1:${server.address().port}/previews/gift-effects.html?effect=${gift}`);await page.locator('#replay').click();
  await page.evaluate(async()=>{window.ac=new AudioContext();await ac.resume();window.m=ac.createAnalyser();m.fftSize=2048;ac.createMediaElementSource(document.querySelector('.gift-encore-video')).connect(m);m.connect(ac.destination);window.level=()=>{const a=new Float32Array(2048);m.getFloatTimeDomainData(a);return Math.max(...a.map(Math.abs));};});
  await page.waitForFunction(()=>level()>.001);await page.waitForFunction(()=>document.querySelector('.gift-encore-video').currentTime>1);
  assert.equal(await page.evaluate(()=>{const c=document.createElement('canvas');c.width=720;c.height=1280;const x=c.getContext('2d');x.drawImage(document.querySelector('.gift-encore-video'),0,0);return x.getImageData(20,20,1,1).data[3];}),0);
  await page.evaluate(()=>GiftEffects.stop());await page.waitForTimeout(100);assert(await page.evaluate(()=>level()<.0001));await page.evaluate(()=>ac.close());
 }
 assert.deepEqual(errors,[]);console.log('PASS: both comfort gifts, recipient isolation, 100/+30, cap/history/daily, save rollback/reload, game delivery/bond progress, file/HTTP alpha/audio, desktop/mobile, mute/skip/replay/background/fallback/reduced.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
