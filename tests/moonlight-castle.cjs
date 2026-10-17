const {clickObject,speakNpc}=require('./helpers/castle-objects.cjs');
const { chromium }=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),key='hjm-moonlight-castle-v1';
const html=fs.readFileSync(path.join(root,'moonlight-castle.html'),'utf8');
for(const match of html.matchAll(/(?:src|href)="((?:js|styles|assets)\/[^"?#]+)(?:\?[^"#]*)?"/g))assert(fs.existsSync(path.join(root,match[1])),match[1]);
assert(!/<style\b|<script>/.test(html),'No embedded business logic or styles');
const plan=JSON.parse(fs.readFileSync(path.join(root,'docs/imagegen/moonlight-castle/plan.json')));
assert.equal(plan.length,16);for(const cell of plan){assert(cell.visibleCast.length<=2);assert.equal(new Set(cell.visibleCast).size,cell.visibleCast.length);assert(fs.existsSync(path.join(root,cell.output)));}
assert.deepEqual(plan.find(c=>c.id==='dining-witnesses').visibleCast,['baoshi','feihong']);
const prompt=fs.readFileSync(path.join(root,'docs/imagegen/moonlight-castle/cast-prompt.txt'),'utf8');
for(const text of ['Before:','VisibleCast=','Beat:','After:','Only named entities'])assert(prompt.includes(text));
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404).end();return;}const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.mp3':'audio/mpeg','.svg':'image/svg+xml'};res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});fs.createReadStream(file).pipe(res);});
let browser;
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 const base='http://127.0.0.1:'+server.address().port+'/',url=base+'moonlight-castle.html';
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),p=await context.newPage(),errors=[],requests=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>requests.push(r.url()));
 await p.goto(base+'index.html');await p.locator('[data-music-enter-muted]').click();
 await p.locator('#moonlightPumpkin').click();assert((await p.locator('#modalContent').innerText()).includes('该线路是惊悚线，涉及密室逃脱内容，是否进入'));
 await p.waitForTimeout(250);await p.screenshot({path:'/tmp/hjm-castle-entry-desktop.png'});await p.locator('#castleEntryCancel').click();assert(!await p.locator('#modalBackdrop').isVisible());
 let mainSave=await p.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([k])=>!k.startsWith('hjm-moonlight'))));
 await p.click('#moonlightPumpkin');await p.locator('#modalContent a[href="moonlight-castle.html"]').click();await p.click('#start-btn');
 mainSave=await p.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([k])=>!k.startsWith('hjm-moonlight'))));
 await p.waitForFunction(()=>!CastleAudio.audio.paused);assert((await p.evaluate(()=>CastleAudio.audio.src)).includes('loop-one.mp3'));
 const nextDining=await p.evaluate(()=>CastleSceneArt.resolve(G,{room:'dining',baseOnly:true}).asset);
 if(!requests.some(r=>r.endsWith('/'+nextDining)))await p.waitForRequest(r=>r.url().endsWith('/'+nextDining),{timeout:5000});
 assert(requests.some(r=>r.endsWith('/'+nextDining)),'Next accessible semantic room image is preloaded from the unified hall');
 const inspect=async id=>clickObject(p,id);
 const exit=async id=>{await p.locator('.castle-dock [data-castle-drawer=map]').click();await p.locator('#castle-map-nodes [data-travel="'+id+'"]').click();};
 const close=async()=>{if(await p.locator('#modal-overlay.active').count())await p.click('#modal-close');};
 const use=async name=>{await p.locator('.castle-dock [data-castle-drawer=inventory]').click();const b=p.locator('.inv-slot').filter({has:p.locator('.name',{hasText:new RegExp('^'+name+'$')})});await b.click();await b.click();};
 const piano=async loop=>{await inspect('piano');for(const i of ({1:[0,2,4,6,1],2:[3,5,0,2,4],3:[4,6,1,3,5]})[loop])await p.locator('.piano-key:not(.black)').nth(i).click();};
 const books=async loop=>{await inspect('bookshelf');for(const i of ({1:[0,1,2,3,4],2:[2,1,0,3,4],3:[1,4,0,2,3]})[loop])await p.locator('[data-book="'+i+'"]').click();};
 const dresser=async password=>{await inspect('dresser');for(let i=0;i<4;i++)await p.locator('#p'+(i+1)).fill(password[i]);};
 const speak=async npc=>speakNpc(p,npc);
 const answer=async text=>{await p.waitForSelector('#castle-answer');await p.fill('#castle-answer',text);await p.locator('#castle-answer-form button').click();};
 console.log('Entry and audio passed');await inspect('candle');await inspect('tapestry');await piano(1);await exit('study');await books(1);await inspect('globe');await exit('music');await inspect('harpsichord');await p.locator('.puzzle-piece').filter({hasText:'G#-Eb'}).click();await exit('bedroom');await inspect('bed');await dresser('1147');await exit('music');await exit('study');await exit('hall');await exit('dining');await inspect('table');await inspect('portrait_dining');await inspect('mirror');
 console.log('Loop 1 room puzzles passed');
 // First-loop names are recovered by reading the corresponding actual clue.
 await use('古堡登记簿');await close();await exit('hall');await speak('siyang');await answer('塞巴斯蒂安');assert(await p.evaluate(()=>G.names.siyang));
 await exit('dining');await exit('cellar');await inspect('wine');await speak('lala');await answer('塞勒涅');
 for(let i=0;i<4;i++)await speak('lala');await answer('3');
 await exit('tower');await p.waitForSelector('#loop-transition.active');assert.equal(await p.evaluate(()=>G.loop),2);
 console.log('Loop 1 complete');
 // Refresh in an explicit transition preserves the continuation screen.
 await p.waitForTimeout(250);await p.reload();await p.click('#continue-btn');assert(await p.locator('#loop-transition').evaluate(n=>n.classList.contains('active')));await p.click('#loop-btn');
 await inspect('candle');await piano(2);await exit('study');await books(2);assert.equal(await p.evaluate(()=>G.flags.diary_count),2);
 await exit('hall');await exit('dining');await inspect('musicbox');assert(await p.evaluate(()=>hasItem('soul_fragment')));
 await use('焦信A');await p.waitForSelector('#modal-body button');await p.locator('#modal-body button').filter({hasText:'收起信件'}).click();await p.waitForSelector('#loop-transition.active');await p.click('#loop-btn');assert.equal(await p.evaluate(()=>G.loop),3);
 await inspect('candle');await piano(3);await exit('study');await books(3);assert.equal(await p.evaluate(()=>G.flags.diary_count),3);
 await use('安魂曲谱');await p.locator('#modal-body button').filter({hasText:'用羽毛笔补全乐章'}).click();await close();
 await exit('hall');await exit('dining');await inspect('table');await exit('cellar');await inspect('wine');await speak('lala');await speak('lala');await answer('8');await exit('tower');
 const finalFixture=await p.evaluate(()=>CastleUI.snapshot);fs.writeFileSync(path.join(root,'tests/fixtures/moonlight-castle-v1.json'),JSON.stringify(finalFixture,null,2)+'\n');
 await inspect('organ');await p.locator('#modal-body button').filter({hasText:'奏响'}).click();assert((await p.locator('#ending-title').innerText()).includes('永别'));
 assert((await p.evaluate(()=>CastleAudio.audio.src)).includes('sunrise.mp3'));await p.waitForTimeout(6500);assert(await p.locator('#ending-screen.active').count(),'Ending does not auto-dismiss');
 await p.screenshot({path:'/tmp/hjm-castle-ending-desktop.png'});await p.reload();await p.click('#continue-btn');assert(await p.locator('#ending-screen.active').count());await p.click('#sunrise-btn');assert(await p.evaluate(()=>G.sunrise&&G.nextMorning&&G.loop===4));
 assert.deepEqual(await p.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([k])=>!k.startsWith('hjm-moonlight')))),mainSave,'Main game save is unchanged by the episode');
 console.log('Full three-loop ending passed');
 // Three deterministic branches use the naturally reached pre-ending fixture.
 for(const movement of [1,2]){
   const c=await browser.newContext(),q=await c.newPage();await q.goto(url);const v=structuredClone(finalFixture);v.game.flags.diary_count=1;v.game.inventory=v.game.inventory.filter(id=>!['wine_bottle','ring','pocket_watch'].includes(id));v.game.flags.gave_final=movement===2;
   await q.evaluate(({key,v})=>localStorage.setItem(key,JSON.stringify(v)),{key,v});await q.reload();await q.click('#continue-btn');await clickObject(q,'organ');await q.locator('#modal-body button').filter({hasText:'奏响'}).click();assert.equal(await q.evaluate(()=>G.endingMovement),movement);await c.close();
 }
 // Reached v1 fixture exercises countdown, paused wall time, chase and wrong-end routing.
 await p.evaluate(v=>{localStorage.setItem(CastleSave.key,JSON.stringify(v));},finalFixture);await p.reload();await p.click('#continue-btn');
 await p.evaluate(()=>{G.loop=2;startCountdown();CastleUI.sync();});const remaining=await p.evaluate(()=>G.countdown.endTime-CastleClock.now());await p.click('#pause-btn');await p.waitForTimeout(800);assert(Math.abs((await p.evaluate(()=>G.countdown.endTime-CastleClock.now()))-remaining)<400);assert(await p.evaluate(()=>CastleAudio.audio.paused));await p.click('#resume-btn');
 await p.evaluate(()=>{stopCountdown();G.inventory=G.inventory.filter(id=>!['soul_fragment','candle'].includes(id));G.candleLit=false;triggerAdrian();chaseMode='hold';clearTimeout(chaseDeathTimer);chaseDeathTimer=setTimeout(dieByAdrian,5000);});
 await p.locator('#chase-btn').hover();await p.mouse.down();await p.waitForTimeout(2100);await p.mouse.up();assert(!await p.evaluate(()=>G.adrianChasing));
 await p.evaluate(()=>dieByAdrian());await p.waitForSelector('#we-screen.active');assert((await p.evaluate(()=>CastleAudio.audio.src)).includes('wrong-end.mp3'));
 await p.click('#overlay-sound');assert(await p.evaluate(()=>CastleAudio.audio.paused));
 // Corrupt current save recovers readable backup; corrupt-without-backup never writes.
 await p.goto(url);await p.evaluate(({key,v})=>{localStorage.setItem(key+'.backup',JSON.stringify(v));localStorage.setItem(key,'{broken');},{key,v:finalFixture});await p.reload();assert((await p.locator('#save-status').innerText()).includes('恢复'));assert.equal(await p.evaluate(key=>localStorage.getItem(key+'.damaged'),key),'{broken');
 await p.evaluate(key=>{localStorage.removeItem(key+'.backup');localStorage.setItem(key,'{unrecoverable');},key);await p.reload();assert(!await p.locator('#start-btn').isVisible());assert.equal(await p.evaluate(key=>localStorage.getItem(key),key),'{unrecoverable');
 await p.click('#new-game-btn');await p.click('#confirm-restart');await p.waitForSelector('#start-btn');assert.equal(await p.evaluate(key=>localStorage.getItem(key),key),null);
 // Import requires explicit confirmation; malformed imports leave the save untouched.
 await p.setInputFiles('#castle-import',{name:'v1.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(finalFixture))});await p.click('#confirm-import');await p.waitForSelector('#continue-btn');await p.click('#continue-btn');assert.equal(await p.evaluate(()=>G.currentRoom),'tower');
 await p.setInputFiles('#castle-import',{name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{oops')});await p.locator('#modal-body h3').filter({hasText:'无法读取'}).waitFor();assert((await p.locator('#modal-body').innerText()).includes('无法读取'));await close();
 // Mobile, tablet and file:// direct play all retain a single responsive layout.
 for(const width of [320,390,720,768,1440]){
   await p.setViewportSize({width,height:width<721?844:1000});await p.evaluate(()=>{closeModal();G.sunrise=false;G.nextMorning=false;G.loop=3;gotoRoom('dining');CastleUI.sync();});await speakNpc(p,'servants');
   await p.waitForFunction(()=>document.getElementById('room-art').complete);assert.equal(await p.locator('#room-art').getAttribute('src'),await p.evaluate(()=>CastleSceneArt.resolve(G).asset));
   const size=await p.evaluate(()=>({doc:document.documentElement.scrollWidth,view:innerWidth,images:[...document.querySelectorAll('#play-layout img')].filter(n=>!n.complete||!n.naturalWidth).map(n=>n.src)}));assert(size.doc<=size.view+1,'No overflow '+width);assert(await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1),'Single screen game '+width);assert.deepEqual(size.images,[]);
   await p.screenshot({path:'/tmp/hjm-castle-'+width+'.png',fullPage:true});
 }
 const filePage=await context.newPage();await filePage.goto(pathToFileURL(path.join(root,'moonlight-castle.html')).href);await filePage.click('#start-btn');await clickObject(filePage,'candle');assert(await filePage.evaluate(()=>hasItem('candle')));await filePage.close();
 assert.deepEqual(errors,[]);console.log('PASS: castle entry, full three-loop play, all endings, soundtrack, pause, save recovery/import, art/preload and responsive file/HTTP play.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
