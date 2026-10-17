const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),plan=JSON.parse(fs.readFileSync(path.join(root,'docs/imagegen/moonlight-castle/horror-v4/plan.json'))),scope={};
vm.runInNewContext(fs.readFileSync(path.join(root,'js/data/moonlight-castle.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'js/data/moonlight-castle-story-art.js'),'utf8')+';globalThis.art=CASTLE_OVERLAY_ART;globalThis.scenes=CASTLE_STORY_ART.scenes;',scope);
const outcomeKeys=['loop2','loop3','wrong','chase','ending1','ending2','ending3','score'];
const expectedIds={loop2:'loop-death',loop3:'loop-truth',wrong:'wrong-ending',chase:'pursuit',ending1:'ending-grief',ending2:'ending-tenderness',ending3:'ending-farewell',score:'score-restored'};
const expectedCast={loop2:['adrian'],loop3:[],wrong:['adrian'],chase:['adrian'],ending1:['adrian'],ending2:['adrian','felix'],ending3:['adrian','felix'],score:[]};
assert.equal(plan.version,4);
const outcomes=outcomeKeys.map(key=>({key,scene:plan.frames.find(frame=>frame.id===expectedIds[key])}));
assert(outcomes.every(row=>row.scene),'All eight production outcome pictures were generated');assert.equal(new Set(outcomes.map(({scene})=>scene.source)).size,8);
for(const {key,scene} of outcomes){
 const entry=scope.art[key],manifest=scope.scenes[scene.id];assert.equal(entry.id,expectedIds[key]);assert.equal(entry.asset,scene.asset);assert.equal(manifest.asset,entry.asset);
 assert(entry.asset.startsWith('assets/moonlight-castle/horror-v4/'),'Production outcomes use the new dark character-aware CGs');
 assert.equal(scene.generation,'single-image');assert(scene.sourceWidth>=1024&&scene.sourceHeight>=768);assert.deepEqual(scene.visibleCast,expectedCast[key]);assert.deepEqual([...manifest.visibleCast],expectedCast[key]);
 for(const file of [scene.source,scene.asset,scene.prompt])assert(fs.existsSync(path.join(root,file)));
 const prompt=fs.readFileSync(path.join(root,scene.prompt),'utf8');for(const phrase of ['Context immediately before:','Visible named cast in the current physical location','Current story beat:','Context immediately after:','Only the explicitly listed visibleCast'])assert(prompt.includes(phrase),scene.id+' '+phrase);
}
assert.equal(new Set(['ending1','ending2','ending3'].map(key=>scope.art[key].asset)).size,3,'Each movement has its own illustration');
let browser;
(async()=>{
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));await page.goto(pathToFileURL(path.join(root,'moonlight-castle.html')).href);await page.click('#start-btn');
 const set=async(key)=>{
  await page.evaluate(key=>{
   closeModal();stopCountdown();clearTimeout(chaseDeathTimer);cancelAnimationFrame(chaseRAF);G.adrianChasing=false;G.sunrise=false;
   document.querySelectorAll('.full-overlay').forEach(n=>n.classList.remove('active'));
   if(key==='loop2'){G.loopTriggered[2]=false;triggerLoop2();}
   if(key==='loop3'){G.loopTriggered[3]=false;triggerLoop3();}
   if(key==='wrong')document.getElementById('we-screen').classList.add('active');
   if(key.startsWith('ending')){G.puzzleSolved.organ=false;playOrgan(Number(key.slice(-1)));}
   CastleUI.sync();
  },key);
 };
 const surfaces=[['loop2','#loop-transition','#loop-art','#loop-btn'],['loop3','#loop-transition','#loop-art','#loop-btn'],['wrong','#we-screen','#wrong-art','#retry-btn'],...[1,2,3].map(n=>['ending'+n,'#ending-screen','#ending-art','#sunrise-btn'])];
 for(const[width,height]of[[1440,1000],[844,390],[568,320],[390,844],[320,568]]){
  await page.setViewportSize({width,height});
  for(const[key,selector,img,button]of surfaces){
   await set(key);await page.locator(img).evaluate(node=>node.decode());
   const entry=scope.art[key];assert.equal(await page.locator(img).getAttribute('data-art-id'),entry.id);assert((await page.locator(img).getAttribute('src')).endsWith(entry.asset));
   assert.equal(await page.locator(img).getAttribute('fetchpriority'),'high');
   const layout=await page.locator(selector).evaluate(node=>{const image=node.querySelector('figure img'),r=image.getBoundingClientRect();return{width:node.clientWidth,scrollWidth:node.scrollWidth,image:r.toJSON(),text:node.querySelector('.overlay-card').textContent};});
   assert(layout.scrollWidth<=layout.width+1,key+' no horizontal overflow at '+width);assert(layout.image.width>90&&layout.image.height>90,key+' illustration remains visible at '+width);
   await page.locator(button).scrollIntoViewIfNeeded();const target=await page.locator(button).evaluate(node=>{const r=node.getBoundingClientRect();return{rect:r.toJSON(),hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')===node};});
   assert(target.hit&&target.rect.top>=0&&target.rect.bottom<=height+1,key+' final action is reachable at '+width);
   assert(layout.text.includes(key==='loop2'?'有什么东西':key==='loop3'?'回信送回去':key==='wrong'?'没有逃过':'月光奏鸣曲'),'Original complete narration retained');
   const background=await page.locator(img).boundingBox();assert(Math.abs(background.x)<1&&Math.abs(background.y)<1&&Math.abs(background.width-width)<1&&Math.abs(background.height-height)<1,'CG fills the screen behind independently scrolling text');
   if(width===844||width===390){await page.locator(selector).evaluate(node=>node.querySelector('.overlay-card').scrollTop=0);await page.screenshot({path:'/tmp/hjm-castle-outcome-'+key+'-'+width+'.png'});}
  }
 }
 // The existing v1 fields select the same scene again on continuation.
 await set('ending3');await page.locator('#sunrise-btn').scrollIntoViewIfNeeded();
 const scroll=await page.locator('#ending-screen .overlay-card').evaluate(node=>node.scrollTop);await page.evaluate(()=>CastleUI.sync());assert.equal(await page.locator('#ending-screen .overlay-card').evaluate(node=>node.scrollTop),scroll,'Routine redraw preserves reading position');
 await set('wrong');await set('ending3');assert.equal(await page.locator('#ending-screen .overlay-card').evaluate(node=>node.scrollTop),0,'New narrative visit starts at its title');
 for(const key of ['loop2','loop3','wrong','ending1','ending2','ending3']){
  await set(key);await page.evaluate(()=>{CastleUI.mark();CastleUI.persist();});await page.reload();await page.click('#continue-btn');
  const img=key.startsWith('ending')?'#ending-art':key==='wrong'?'#wrong-art':'#loop-art';await page.locator(img).evaluate(node=>node.decode());assert.equal(await page.locator(img).getAttribute('data-art-id'),scope.art[key].id,'Restore semantic art '+key);
 }
 await set('loop3');await page.click('#loop-btn');await page.evaluate(()=>{G.loop=3;G.inventory=[];G.candleLit=false;G.soulProtected=false;pickChaseMode=()=> 'hold';triggerAdrian();CastleUI.sync();});
 await page.locator('#chase-art').evaluate(node=>node.decode());assert.equal(await page.locator('#chase-art').getAttribute('data-art-id'),'pursuit');
 assert(requests.some(url=>url.endsWith('/'+scope.art.wrong.asset)),'Wrong outcome is available while pursuit is active');
 await page.evaluate(()=>CastleUI.pause(true));assert(await page.locator('#pause-art').getAttribute('src'));await page.click('#resume-btn');
 await page.evaluate(()=>{clearTimeout(chaseDeathTimer);cancelAnimationFrame(chaseRAF);G.adrianChasing=false;document.getElementById('chase-overlay').classList.remove('active');G.inventory=['assembled_letter'];useItem('assembled_letter');});
 assert.equal(await page.locator('.modal-story-art').getAttribute('data-art-id'),'loop-truth');await page.click('#modal-close');
 await page.evaluate(()=>{G.inventory=['requiem','quill'];completeRequiem();});assert.equal(await page.locator('.modal-story-art').getAttribute('data-art-id'),'score-restored');
 await page.click('#modal-close');
 // Preload only the actually selected ending, using the execution-layer inventory rules.
 await page.evaluate(()=>{G.currentRoom='tower';G.loop=3;G.puzzleSolved.organ=false;G.flags.diary_count=0;G.flags.gave_final=false;G.inventory=['assembled_letter','repaired_score','soul_fragment'];examine('organ');});
 await page.waitForTimeout(100);assert(requests.some(url=>url.endsWith('/'+scope.art.ending1.asset)));
 assert.deepEqual(errors,[]);console.log('PASS: 8 independent semantic CGs, both loops/WE/three endings across five layouts, complete text/actions, v1 continuation, chase/pause, letters/score and selected-ending preload.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();});
