const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),url=pathToFileURL(path.join(root,'moonlight-castle.html')).href,fixture=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/moonlight-castle-v1.json')));
let b;
(async()=>{
 b=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 const c=await b.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(url);
 const original=fs.readFileSync(path.join(root,'docs/moonlight-castle/source/prototype.html'),'utf8').split('<b style="color:#cc8888;">前情提要</b><br><br>')[1].split('</p>')[0];
 const normalize=text=>text.replace(/<[^>]*>/g,'').replace(/\s+/g,'');
 assert.equal(normalize(await p.locator('#prologue-text').innerText()),normalize(original),'The complete original prologue is preserved');
 assert((await p.locator('.title-quote').innerText()).includes('我一直很想念他'));
 for(const [width,height]of[[1440,1000],[844,390],[568,320],[390,844],[320,568]]){
  await p.setViewportSize({width,height});await p.evaluate(()=>document.getElementById('title-screen').scrollTop=0);
  const cover=await p.evaluate(()=>{const heading=document.getElementById('prologue-heading'),text=document.getElementById('prologue-text'),start=document.getElementById('start-btn');return{top:heading.getBoundingClientRect().top,bottom:heading.getBoundingClientRect().bottom,collapsed:!!heading.closest('details'),readable:text.scrollHeight<=text.clientHeight+1,entryAfterText:start.getBoundingClientRect().top>=text.getBoundingClientRect().bottom};});
  assert(!cover.collapsed&&cover.top<height&&cover.bottom>0,'Prologue is prominent without expanding it at '+width);
  assert(cover.readable&&cover.entryAfterText,'Full prologue precedes entry without a clipped inner reader at '+width);
  await p.screenshot({path:'/tmp/hjm-castle-prologue-'+width+'.png'});
  const coverBackground=await p.locator('.castle-cover-backdrop').boundingBox();
  await p.evaluate(()=>{const screen=document.getElementById('title-screen');screen.scrollTop=screen.scrollHeight;});
  const scrolled=await p.evaluate(()=>{const screen=document.getElementById('title-screen'),background=document.querySelector('.castle-cover-backdrop'),img=background.querySelector('img');return{screen:screen.getBoundingClientRect().toJSON(),background:background.getBoundingClientRect().toJSON(),image:img.getBoundingClientRect().toJSON(),loaded:img.complete&&img.naturalWidth>0};});
  assert(scrolled.loaded&&Math.abs(scrolled.background.y-coverBackground.y)<1,'Cover background stays fixed while the complete prologue scrolls at '+width);
  assert(scrolled.image.top<=scrolled.screen.top+1&&scrolled.image.bottom>=scrolled.screen.bottom-1,'Artwork covers the viewport through the end of the prologue at '+width);
  await p.screenshot({path:'/tmp/hjm-castle-prologue-bottom-'+width+'.png'});
 }
 await p.setViewportSize({width:844,height:390});await p.click('#start-btn');
 assert(!await p.locator('.castle-header').isVisible(),'Phone gameplay hides the title header');
 await p.locator('.castle-dock [data-castle-drawer=music]').tap();
 for(const id of ['loop-label','elapsed','fullscreen-btn','castle-sound','pause-btn','return-home']){
  assert(await p.locator('#settings-game-tools #'+id).isVisible(),'Phone Settings retains '+id);
  assert.equal(await p.locator('#'+id).count(),1,'Only one control instance '+id);
 }
 await p.evaluate(()=>{CastleAudio.audio.play=()=>Promise.resolve();CastleAudio.sync();});await p.waitForFunction(()=>!document.getElementById('castle-sound').textContent.includes('点此重试'));
 const sound=await p.evaluate(()=>CastleAudio.enabled);await p.click('#castle-sound');assert.equal(await p.evaluate(()=>CastleAudio.enabled),!sound);await p.click('#castle-sound');
 await p.evaluate(()=>{document.documentElement.requestFullscreen=async()=>{window.castleFullscreenRequested=true;};});
 await p.click('#fullscreen-btn');assert(await p.evaluate(()=>window.castleFullscreenRequested),'Settings fullscreen uses the existing action');
 await p.click('#pause-btn');assert(await p.locator('#pause-overlay.active').isVisible());await p.click('#resume-btn');
 assert.equal(await p.locator('#return-home').getAttribute('href'),'index.html#home');
 await p.locator('[aria-label="收起设置"]').tap();
 const assertFrame=async()=>{const n=await p.evaluate(()=>({w:innerWidth,h:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,npcs:[...document.querySelectorAll('.npc')].map(n=>{let r=n.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};}),dock:document.querySelector('.castle-dock').getBoundingClientRect().toJSON(),dialogue:document.getElementById('dialogue-box').getBoundingClientRect().toJSON()}));assert(n.sw<=n.w+1&&n.sh<=n.h+1);for(const r of n.npcs)assert(r.x>=0&&r.y>=0&&r.x+r.w<=n.w&&r.y+r.h<=n.h,'Actor nameplate in viewport');assert(n.dock.right<=n.w&&n.dock.bottom<=n.h,'Dock in viewport');assert(n.dialogue.bottom<=n.h,'Dialogue in viewport');};
 for(const[width,height]of[[844,390],[568,320],[390,844],[320,568],[1440,1000]]){
  await p.setViewportSize({width,height});await p.waitForTimeout(100);if(width<=1000&&await p.locator('#scene-overview').getAttribute('aria-pressed')==='false')await p.click('#scene-overview');await assertFrame();await p.screenshot({path:'/tmp/hjm-castle-immersive-'+width+'.png'});
  const layout=await p.evaluate(()=>({container:document.getElementById('game-container').getBoundingClientRect().toJSON(),scene:document.getElementById('scene-area').getBoundingClientRect().toJSON(),parent:document.getElementById('castle-tools').parentElement.id,header:getComputedStyle(document.querySelector('.castle-header')).display}));
  if(width<=1000){assert.equal(layout.header,'none');assert.equal(layout.parent,'settings-game-tools');assert.equal(layout.container.top,0);assert.equal(layout.container.height,height);assert.equal(layout.scene.top,0,'Scene reclaims the old header and room-title bands');}
  else{assert.notEqual(layout.header,'none');assert.equal(await p.locator('.castle-header #castle-tools').count(),1,'Desktop restores the same controls to its header');}
 }
 await p.setViewportSize({width:844,height:390});await p.locator('.castle-dock [data-castle-drawer=explore]').tap();await p.locator('#object-tray [data-examine=candle]').tap();assert(await p.evaluate(()=>hasItem('candle')));await p.locator('.castle-dock [data-castle-drawer=inventory]').tap();await p.locator('.inv-slot').tap();assert.equal(await p.evaluate(()=>G.selectedItem),'candle');await p.locator('[aria-label="收起背包"]').tap();
 // A map tile is an actual room entry; physical doors appear immediately on unlock.
 await p.locator('.castle-dock [data-castle-drawer=map]').tap();
 assert(await p.locator('#castle-map-nodes [data-travel=study]').isDisabled(),'Locked study cannot be entered from the map');
 await p.locator('[aria-label="收起地图"]').tap();
 await p.locator('.castle-dock [data-castle-drawer=explore]').tap();await p.locator('#object-tray [data-examine=piano]').tap();
 for(const i of [0,2,4,6,1])await p.locator('.piano-key:not(.black)').nth(i).tap();
 const studyDoor=p.locator('#scene-doors [data-exit=study]');
 assert(await studyDoor.isVisible());assert((await studyDoor.getAttribute('class')).includes('unlocked'));
 await p.waitForTimeout(200);await p.reload();await p.click('#continue-btn');
 assert(await p.locator('#scene-doors .unlocked[data-exit=study]').isVisible(),'Unlocked door survives refresh');
 await p.screenshot({path:'/tmp/hjm-castle-study-door-844.png'});
 await p.locator('#scene-doors [data-exit=study]').tap();assert.equal(await p.evaluate(()=>G.currentRoom),'study');
 await p.locator('#scene-doors [data-exit=hall]').tap();
 
 assert(await p.locator('#scene-doors .unlocked[data-exit=study]').isVisible(),'Room doors remain available alongside characters and objects');
 await p.locator('.castle-dock [data-castle-drawer=map]').tap();assert(await p.locator('#castle-map-drawer').isVisible());
 await p.screenshot({path:'/tmp/hjm-castle-map-844.png'});
 await p.locator('#castle-map-nodes [data-travel=study]').tap();assert.equal(await p.evaluate(()=>G.currentRoom),'study');assert(!await p.locator('#castle-map-drawer').isVisible());
 const beforeTravel=await p.evaluate(()=>G.moveCount);
 await p.locator('.castle-dock [data-castle-drawer=map]').tap();await p.locator('#castle-map-nodes [data-travel=dining]').tap();
 assert.equal(await p.evaluate(()=>G.currentRoom),'dining');assert.equal(await p.evaluate(()=>G.moveCount),beforeTravel+2,'Distant map entries traverse connected rooms instead of bypassing doors');
 assert(!await p.locator('#castle-map-drawer').isVisible());
 const cdp=await c.newCDPSession(p),touch=async(type,point)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:point?[{x:point.x,y:point.y}]:[]});
 const chase=async mode=>{await p.evaluate(mode=>{G.loop=3;G.inventory=[];G.candleLit=false;G.sunrise=false;pickChaseMode=()=>mode;triggerAdrian();CastleUI.sync();},mode);const r=await p.locator('#chase-btn').boundingBox();return{x:r.x+r.width/2,y:r.y+r.height/2};};
 let point=await chase('hold');await touch('touchStart',point);await p.waitForTimeout(2100);await touch('touchEnd');assert(!await p.evaluate(()=>G.adrianChasing),'Touch hold succeeds');
 point=await chase('rhythm');await touch('touchStart',point);await p.waitForTimeout(500);await touch('touchEnd');await p.touchscreen.tap(point.x,point.y);await p.touchscreen.tap(point.x,point.y);assert(!await p.evaluate(()=>G.adrianChasing),'Long-short-short touch succeeds');
 point=await chase('mash');for(let i=0;i<15;i++)await p.touchscreen.tap(point.x,point.y);assert(!await p.evaluate(()=>G.adrianChasing),'Touch taps are counted exactly once');
 point=await chase('hold');await touch('touchStart',point);await p.waitForTimeout(350);await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await touch('touchCancel');await p.waitForTimeout(500);assert(await p.evaluate(()=>G.adrianChasing),'Background touch cancellation does not kill player');await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});assert(await p.locator('#pause-overlay.active').count());await p.click('#resume-btn');point=await p.locator('#chase-btn').boundingBox();point={x:point.x+point.width/2,y:point.y+point.height/2};await touch('touchStart',point);await p.waitForTimeout(2100);await touch('touchEnd');assert(!await p.evaluate(()=>G.adrianChasing));
 // Active import and reset must suppress the exiting instance's autosave.
 const imported=structuredClone(fixture);imported.game.currentRoom='music';await p.setInputFiles('#castle-import',{name:'old-v1.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(imported))});await p.click('#confirm-import');await p.waitForSelector('#continue-btn');await p.click('#continue-btn');assert.equal(await p.evaluate(()=>G.currentRoom),'music');await p.locator('.castle-dock [data-castle-drawer=music]').tap();await p.click('#restart-btn');await p.click('#confirm-restart');await p.waitForSelector('#start-btn');assert.equal(await p.evaluate(()=>localStorage.getItem(CastleSave.key)),null);
 assert.deepEqual(errors,[]);console.log('PASS: cinematic single-screen portrait/landscape layouts, touch investigation/drawers, all three chase gestures, background cancellation, active import/reset.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await b?.close();});
