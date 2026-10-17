const {clickObject,installControlPoint}=require('./helpers/castle-objects.cjs');
const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),plan=JSON.parse(fs.readFileSync(path.join(root,'docs/imagegen/moonlight-castle/individual-v3/plan.json')));
assert.equal(plan.length,9);assert.equal(new Set(plan.map(scene=>scene.source)).size,9,'Each room and cover uses its own generated source');
for(const scene of plan){
  assert.equal(scene.generation,'single-image');assert(scene.sourceWidth>=1024&&scene.sourceHeight>=768);
  assert(fs.existsSync(path.join(root,scene.source))&&fs.existsSync(path.join(root,scene.output)));
  assert(!scene.rect&&!scene.cell,'Production images are not atlas crops');
  assert(scene.visibleCast.length<=2||scene.id==='dining-exploration-v3'&&scene.groupException);
  assert.equal(new Set(scene.visibleCast).size,scene.visibleCast.length);
  assert.deepEqual(Object.keys(scene.costumes).sort(),[...scene.visibleCast].sort());
  const prompt=fs.readFileSync(path.join(root,scene.prompt),'utf8');
  for(const label of ['Context immediately before:','Visible named cast in the current physical location:','Current story beat:','Context immediately after:','Only visibleCast may appear'])assert(prompt.includes(label),scene.id+' '+label);
  // No offscreen character's detailed costume lock can expand the physical cast.
  for(const id of ['yeshiyang','tim','bingbing','baoshi','feihong','dijie','qiqi','jerry','shiyuan','lala'])if(!scene.visibleCast.includes(id))assert(!prompt.includes('\n'+id+':'),scene.id+' offscreen lock '+id);
}
const costumes=Object.assign({},...plan.map(scene=>scene.costumes));
assert(costumes.shiyuan.outfit.includes('女仆'));assert(costumes.tim.outfit.includes('铠甲'));assert(costumes.yeshiyang.outfit.includes('领结'));assert(costumes.lala.outfit.includes('紫色'));assert(costumes.jerry.outfit.includes('小号'));
let browser;
(async()=>{
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await installControlPoint(page);await page.goto(pathToFileURL(path.join(root,'moonlight-castle.html')).href);await page.click('#start-btn');
 assert.equal(await page.locator('[data-scene-mode]').count(),0,'No investigation/people mode switch remains');
 const rooms=plan.filter(scene=>!['dawn','exterior'].includes(scene.room)).map(scene=>scene.room);
 const failures=[];
 for(const [width,height]of [[1440,1000],[844,390],[568,320],[390,844],[320,568]]){
  await page.setViewportSize({width,height});
  for(const room of rooms){
   await page.evaluate(room=>{closeModal();G.loop=1;G.moveCount=0;G.adrianChasing=false;G.sunrise=false;G.nextMorning=false;G.inventory=['candle'];Object.keys(G.names).forEach(id=>G.names[id]=true);G.currentRoom=room;showText('烛光照亮了房间。');CastleUI.sync();},room);
   await page.waitForFunction(()=>{const img=document.getElementById('room-art');return img.complete&&img.naturalWidth>1000;});await page.waitForTimeout(70);
   const readScene=()=>page.evaluate(()=>{
    const image=document.getElementById('room-art'),dialogue=document.querySelector('.dialogue-panel').getBoundingClientRect();
    const controls=[...document.querySelectorAll('#scene-hotspots button,#people-tray button,#scene-doors button')].map(node=>{const r=node.getBoundingClientRect(),point=window.castleControlPoint(node);return{label:node.getAttribute('aria-label')||node.textContent,x:r.x,y:r.y,right:r.right,bottom:r.bottom,hit:!!point};});
    return{dialogueHidden:getComputedStyle(document.querySelector('.dialogue-panel')).visibility==='hidden',ratio:image.naturalWidth/image.naturalHeight,source:image.getAttribute('src'),expectedSource:CastleSceneArt.resolve(G).asset,image:image.getBoundingClientRect().toJSON(),stage:document.getElementById('scene-area').getBoundingClientRect().toJSON(),hotspots:document.getElementById('scene-hotspots').getBoundingClientRect().toJSON(),dialogue:dialogue.toJSON(),controls,overflows:document.documentElement.scrollWidth>innerWidth+1||document.documentElement.scrollHeight>innerHeight+1};
   });
   let state=await readScene();
   assert.equal(state.source,state.expectedSource);assert(state.source.includes('/horror-v4/'));assert(!state.overflows);
   if(width<=1000){
    if(await page.locator('#scene-overview').getAttribute('aria-pressed')==='true'){await page.click('#scene-overview');state=await readScene();}
    assert(Math.abs(state.image.width/state.image.height-state.ratio)<.001,'Portrait never distorts the source aspect ratio at '+width);
    assert(Math.abs(state.image.height-Math.max(state.stage.height,state.stage.width/state.ratio))<1,'Mobile scene fills the background behind subtitles');
    for(const field of ['x','y','width','height'])assert(Math.abs(state.image[field]-state.hotspots[field])<1,'Portrait hotspot plane follows the proportional artwork '+field);
    if(width===390||width===844){await page.waitForTimeout(550);await page.screenshot({path:'/tmp/hjm-castle-panorama-'+room+'-'+width+'.png'});}
    await page.click('#scene-overview');state=await readScene();
   }
   for(const control of state.controls){const d=state.dialogue,clear=state.dialogueHidden||control.right<=d.left||control.x>=d.right||control.bottom<=d.top||control.y>=d.bottom;if(!(control.x>=-1&&control.y>=0&&control.right<=width+1&&control.bottom<=height&&clear))failures.push(room+' '+width+' control clear of dialogue: '+JSON.stringify(control));if(!control.hit)failures.push(room+' '+width+' physical click area: '+JSON.stringify(control));}
   if(width===844||width===390)await page.screenshot({path:'/tmp/hjm-castle-unified-'+room+'-'+width+'.png'});
  }
 }
 assert.deepEqual(failures,[]);
 await page.setViewportSize({width:844,height:390});await page.evaluate(()=>{G.currentRoom='bedroom';CastleUI.sync();});await page.waitForTimeout(100);
 const source=await page.locator('#room-art').getAttribute('src');
 await clickObject(page,'bed');assert.equal(await page.locator('#room-art').getAttribute('src'),source,'Investigation retains characters in the same scene');
 await page.locator('#people-tray [data-npc=shiyuan]').tap();assert.equal(await page.locator('#room-art').getAttribute('src'),source,'Conversation retains investigative objects');
 await page.locator('.castle-dock [data-castle-drawer=explore]').tap();assert(await page.locator('#explore-people [data-npc=shiyuan]').isVisible());assert.equal(await page.locator('#object-tray').count(),0,'Exploration drawer does not reveal undiscovered objects');
 await page.locator('[aria-label=收起探索]').tap();await clickObject(page,'dresser');assert(await page.locator('#modal-overlay.active').isVisible());
 await page.evaluate(()=>{closeModal();const old=CastleUI.snapshot;old.mode='objects';CastleSave.write(old);});
 await page.reload();await page.click('#continue-btn');
 assert(await page.locator('#people-tray [data-npc=shiyuan]').isVisible(),'Old investigation-mode saves restore the unified scene');
 assert(await page.locator('#scene-hotspots [data-examine=bed]').isVisible());
 assert.equal(await page.locator('#room-art').getAttribute('src'),await page.evaluate(()=>CastleSceneArt.resolve(G).asset));
 assert.deepEqual(errors,[]);console.log('PASS: 9 independent sources, cast/costume locks, unified interactions, seven rooms in five viewports, proportional portrait panorama and complete overview with matching object silhouettes and usable touch targets clear of dialogue.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();});
