const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const runtimeSource=fs.readFileSync(path.join(root,'js/features/moonlight-castle-scene-art.js'),'utf8');
const dataSource=fs.readFileSync(path.join(root,'js/data/moonlight-castle.js'),'utf8');
const manifestPath=path.join(root,'js/data/moonlight-castle-story-art.js');
const resolverOnly=process.argv.includes('--resolver-only');
const phases=['loop1','loop2','loop3','dawn'],rooms=['hall','dining','study','music','bedroom','cellar','tower'];
// These expectations come from the authored room descriptions, independently
// of the resolver. In particular an absent musician must not be painted merely
// because his dialogue/puzzle remains available to an older save.
const fixture={version:1,scenes:{}};
const baseCasts={hall:['yeshiyang','tim'],dining:['bingbing','baoshi','feihong'],study:['dijie','qiqi'],music:['jerry'],bedroom:['shiyuan'],cellar:['lala'],tower:['adrian']};
for(const room of rooms)for(const phase of phases){
 const cast=[...baseCasts[room]].filter(id=>!(room==='study'&&['loop2','loop3'].includes(phase)&&id==='dijie')&&!(room==='dining'&&phase==='loop3'&&['baoshi','feihong'].includes(id))&&!(room==='tower'&&phase==='loop2'&&id==='adrian'));
 const id=room+'-'+phase;fixture.scenes[id]={id,asset:id+'.webp',visibleCast:cast,positions:cast.map((id,i)=>({id,x:20+i*25,y:50})),objectRegions:{},doors:[]};
}
for(const [id,cast]of Object.entries({
 'hall-morning':['yeshiyang','tim','baoshi','feihong','bingbing','dijie','jerry','qiqi','shiyuan','lala'],
 'hall-dawn-armor-raised':['yeshiyang','tim','baoshi','feihong','bingbing','dijie','jerry','qiqi','shiyuan','lala'],
 'study-loop2-talk-dijie':['dijie','qiqi'],'study-loop3-talk-dijie':['dijie','qiqi'],
 'dining-loop3-talk-servants':['baoshi','feihong'],'tower-loop2-talk-adrian':['adrian'],
 'dining-loop3-portrait-veiled':['bingbing'],'dining-loop3-portrait-reveal':['bingbing'],
 'hall-loop2-examine-armor':['yeshiyang','tim']
}))fixture.scenes[id]={id,asset:id+'.webp',visibleCast:cast,positions:[],objectRegions:{},doors:[]};
for(const id of ['musicbox-loop1-refused','musicbox-soul-freed','musicbox-empty','mirror-broken','mirror-felix-reflection','violin-case-empty','bedroom-loop2-mirror-reflection','adrian-bound-ring','adrian-bound-pocket-watch','adrian-bound-wine','adrian-bound-diary','adrian-bound-key','adrian-bound','adrian-final-letter','adrian-final-letter-to-organ','adrian-blocks-organ','adrian-soul-protection','adrian-candle-repelled','hall-dawn-talk-servants','hall-dawn-talk-shiyuan','dining-dawn-talk-bingbing'])fixture.scenes[id]={id,asset:id+'.webp',visibleCast:[],positions:[],objectRegions:{},doors:[]};
function scopeFor(manifest){
 const context={window:{}};
 vm.runInNewContext(dataSource+'\nconst CASTLE_STORY_ART='+JSON.stringify(manifest)+';\n'+runtimeSource+'\nglobalThis.api=CastleSceneArt;globalThis.rooms=CASTLE_ROOMS;',context);
 return context;
}
const clone=value=>JSON.parse(JSON.stringify(value));
const scope=scopeFor(fixture),api=scope.api;
function state(room='hall',loop=1){return{currentRoom:room,loop,sunrise:false,nextMorning:false,flags:{},inventory:[]};}
const cameraFixture=clone(fixture);delete cameraFixture.scenes['musicbox-empty'].objectRegions;delete cameraFixture.scenes['musicbox-empty'].doors;
const newCamera=scopeFor(cameraFixture).api;newCamera.event('object.musicbox.empty',state('dining',2));
assert.deepEqual(clone(newCamera.resolve(state('dining',2)).objectRegions),{});assert.deepEqual(clone(newCamera.resolve(state('dining',2)).doors),[],'An event close-up with no geometry never inherits old room click regions');
for(const room of rooms)for(let loop=1;loop<=4;loop++){
 const g=state(room,loop),before=clone(g),scene=api.resolve(g);
 assert.equal(scene.phase,phases[loop-1]);assert.equal(scene.room,room);
 assert.deepEqual(clone(g),before,'Resolving artwork has no progression, inventory or save effects');
}
for(const loop of [2,3]){
 const g=state('study',loop);api.reset();assert(!api.resolve(g).visibleCast.includes('dijie'));
 assert(api.contacts(g).includes('dijie'),'The musician remains reachable for old puzzles');
 api.talk('dijie',g);assert.equal(api.resolve(g).id,'study-loop'+loop+'-talk-dijie');assert(api.resolve(g).visibleCast.includes('dijie'));assert(api.resolve(g).isEvent,'Fallback dialogue manifestations expose a return-to-exploration action');
 api.reset();assert(!api.resolve(g).isEvent);assert(!api.resolve(g).visibleCast.includes('dijie'),'Returning to exploration clears the transient manifestation');api.talk('dijie',g);
 api.examine('bookshelf',g);assert(!api.resolve(g).visibleCast.includes('dijie'),'Investigation returns to the actual absence');
}
const dining=state('dining',3);api.reset();assert(!api.isPresent('servants',dining));api.talk('servants',dining);assert(api.isPresent('servants',dining));api.reset();assert(!api.isPresent('servants',dining));
api.examine('portrait_dining',dining);assert.equal(api.resolve(dining).id,'dining-loop3-portrait-reveal');assert.equal(api.reveal(dining).from.id,'dining-loop3-portrait-veiled');
assert.equal(dining.flags.portrait_revealed_loop3,true);assert(api.consumeRevealAnimation(dining));assert(!api.consumeRevealAnimation(dining),'The first-click animation is consumed only once');
api.examine('portrait_dining',dining);assert(!api.consumeRevealAnimation(dining),'Repeated inspection does not replay the first reveal');
const oldPortrait=state('dining',3);oldPortrait.flags.read_portrait_name=true;api.restore({dialogue:'古堡旧档里的普通调查旁白。'},oldPortrait);
assert.equal(api.resolve(oldPortrait).id,'dining-loop3-portrait-veiled');assert.equal(oldPortrait.flags.portrait_revealed_loop3,undefined,'Prior-loop portrait reading cannot reveal third-loop faces');
const awayPortrait=clone(dining);awayPortrait.currentRoom='study';api.restore({dialogue:'书房里，笛杰的竹笛还挂在墙上，但笛身裂开了。'},awayPortrait);awayPortrait.currentRoom='dining';
assert.equal(api.resolve(awayPortrait).id,'dining-loop3-portrait-reveal');assert(!api.consumeRevealAnimation(awayPortrait),'A revealed painting stays revealed after leaving, saving and restoring elsewhere');
const g2=state('dining',2);api.examine('portrait_dining',g2);assert.equal(api.reveal(g2),null,'Earlier cycles never prematurely reveal the reincarnated faces');
const tower=state('tower',2);api.reset();assert(!api.isPresent('adrian',tower));assert(api.contacts(tower).includes('adrian'));api.talk('adrian',tower);assert(api.isPresent('adrian',tower));assert(api.resolve(tower).isEvent);api.reset();assert(!api.isPresent('adrian',tower));assert(!api.resolve(tower).isEvent);
const morning=state('hall',4);morning.nextMorning=true;api.reset();assert.equal(api.resolve(morning).id,'hall-morning');assert.equal(api.resolve(morning).visibleCast.length,10);assert.equal(api.contacts(morning).length,9);morning.flags.talk_tim_4_0=true;assert.equal(api.resolve(morning).id,'hall-dawn-armor-raised');api.talk('tim',morning);assert.equal(api.resolve(morning).id,'hall-dawn-armor-raised');assert(!api.resolve(morning).isEvent,'The persistent raised-armor base is not mistaken for a temporary conversation');
const catalog=clone(api.dialogueCatalog()),source=catalog.find(row=>row.id==='talk.dijie.2.0.text');
assert(source);assert.equal(new Set(catalog.map(row=>row.id)).size,catalog.length);
const restoreState=state('study',2),saved={focusedNpc:'dijie',dialogue:source.text};const before=clone(saved);api.restore(saved,restoreState);assert.equal(api.resolve(restoreState).id,'study-loop2-talk-dijie');assert.equal(api.beat.id,source.id);assert.deepEqual(saved,before);
api.restore({focusedNpc:'dijie',dialogue:'笛杰提到了宝石、飞鸿、Jerry和艾德里安。'},restoreState);assert.equal(api.beat,null,'Names in unregistered prose never infer a scene or cast');
// Exercise the actual investigation branch independently of browser rendering.
// Replacing only presentation functions makes a missing/duplicate key award or
// an accidental new save flag observable here.
const gameScope={window:{},CastleAudio:{effect(){}}};
vm.runInNewContext(dataSource+'\nconst CASTLE_STORY_ART='+JSON.stringify(fixture)+';\n'+runtimeSource+'\n'+fs.readFileSync(path.join(root,'js/features/moonlight-castle-game.js'),'utf8')+'\nlet observedNarration="";showText=text=>{observedNarration=text;};renderInventory=()=>{};showAchievement=()=>{};globalThis.test={G,examine,get narration(){return observedNarration;},art:CastleSceneArt};',gameScope);
gameScope.test.G.loop=3;gameScope.test.examine('armor');
assert(gameScope.test.narration.includes('倒在地上')&&gameScope.test.narration.includes('半张乐谱'));assert(!gameScope.test.narration.includes('面向墙壁'));
assert.equal(gameScope.test.art.resolve(gameScope.test.G).id,'hall-loop3');assert.deepEqual(clone(gameScope.test.G.inventory),['brass_key']);assert.deepEqual(clone(gameScope.test.G.flags),{});
gameScope.test.examine('armor');assert.deepEqual(clone(gameScope.test.G.inventory),['brass_key']);assert(gameScope.test.narration.includes('仍倒在地上'));
for(const row of api.eventCatalog()){
 const g=state(row.room||'hall',row.loops[0]),before=clone(g);api.observe(row.text,g,row.id);
 assert(api.resolve(g).isEvent,row.id+' is an explicit action frame');
 const selected=api.resolve(g).id;assert(!selected.includes('exploration-v3'));
 api.restore({dialogue:row.text,focusedNpc:null},g);assert.equal(api.resolve(g).id,selected,row.id+' restores using existing dialogue');
 assert.deepEqual(clone(g),before,'Artwork event resolution never changes the game save');
 api.reset();assert(!api.resolve(g).isEvent,'Returning to exploration clears only the momentary camera');
}
if(!resolverOnly){
 assert(fs.existsSync(manifestPath),'The production semantic manifest is required');
 const manifestScope={};vm.runInNewContext(fs.readFileSync(manifestPath,'utf8')+';globalThis.manifest=CASTLE_STORY_ART;',manifestScope);
 const manifest=clone(manifestScope.manifest),live=scopeFor(manifest).api;
 for(const room of rooms)for(let loop=1;loop<=4;loop++){
  const g=state(room,loop),scene=live.resolve(g);assert(scene.asset.includes('/horror-v4/'),'All four phases use re-authored images: '+room+' '+loop);
  assert(fs.existsSync(path.join(root,scene.asset)),scene.id+' artwork exists');
  assert(manifest.scenes[scene.id].objectRegions,scene.id+' owns explicit object geometry');assert(manifest.scenes[scene.id].doors,scene.id+' owns explicit door anchors');
  for(const [target]of scope.rooms[room].targets){const region=scene.objectRegions[target];assert(region?.outline?.length>=3,scene.id+' '+target);for(const point of region.outline)assert(point.every(n=>n>=0&&n<=100));}
 }
 for(const loop of [2,3])assert(!live.resolve(state('study',loop)).visibleCast.includes('dijie'));
 assert(!live.isPresent('servants',state('dining',3)));assert(!live.isPresent('adrian',state('tower',2)));
 const sunrise=state('hall',4);sunrise.nextMorning=true;assert.deepEqual([...live.resolve(sunrise).visibleCast].sort(),[...fixture.scenes['hall-morning'].visibleCast].sort());
}
console.log('PASS: explicit four-phase room routing, absent-cast echo access, temporary conversation manifestations, portrait reveal, 10-person dawn, exact dialogue restore and no save mutation.');
if(resolverOnly||process.argv.includes('--static'))process.exit(0);
const {chromium}=require('playwright'),{clickObject,installControlPoint}=require('./helpers/castle-objects.cjs');
let browser;
(async()=>{
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await installControlPoint(page);await page.goto(pathToFileURL(path.join(root,'moonlight-castle.html')).href);await page.click('#start-btn');
 const set=async(room,loop)=>{
  await page.evaluate(({room,loop})=>{closeModal();CastleVoice.stop(true);stopCountdown();CastleSceneArt.resetSession();G.currentRoom=room;G.loop=loop;G.moveCount=0;G.adrianChasing=false;G.nextMorning=false;G.sunrise=false;G.inventory=['candle'];G.flags={};CastleDialogue.set(getRoomDescription(room,loop,1),false,false);CastleUI.sync();},{room,loop});
  await page.waitForFunction(()=>document.getElementById('room-art').complete&&document.getElementById('room-art').naturalWidth>0);
 };
 await set('hall',3);await clickObject(page,'armor');
 assert.equal(await page.locator('#scene-area').getAttribute('data-scene-id'),'hall-loop3');
 assert(await page.evaluate(()=>CastleDialogue.text.includes('倒在地上')&&CastleDialogue.text.includes('半张乐谱')&&!CastleDialogue.text.includes('面向墙壁')),'Third-loop investigation agrees with the fallen armor and half-score');
 assert.deepEqual(await page.evaluate(()=>G.inventory),['candle','brass_key'],'The same brass key is awarded, without an extra reward or progression field');
 await clickObject(page,'armor');assert.deepEqual(await page.evaluate(()=>G.inventory),['candle','brass_key']);
 for(const loop of [2,3]){
  await set('study',loop);assert.equal(await page.locator('#people-tray [data-npc=dijie]').count(),0);
  assert.equal(await page.locator('#explore-people [data-npc=dijie]').getAttribute('data-remote-npc'),'true');
  await page.evaluate(()=>CastleUI.setDrawer('explore'));await page.locator('#explore-people [data-npc=dijie]').click();
  assert.equal(await page.locator('#scene-area').getAttribute('data-scene-id'),'study-loop'+loop+'-talk-dijie');assert.equal(await page.locator('#people-tray [data-npc=dijie]').count(),1);
  assert(await page.locator('#scene-return').isVisible(),'Transient echo conversations always expose a return button');
  await page.evaluate(()=>CastleUI.setDrawer('explore'));assert.equal(await page.locator('#people-tray [data-npc=dijie]').count(),0,'Opening Explore clears the temporary manifestation');await page.evaluate(()=>CastleUI.setDrawer(null));
  await clickObject(page,'bookshelf');await page.evaluate(()=>{closeModal();CastleUI.sync();});assert.equal(await page.locator('#people-tray [data-npc=dijie]').count(),0);
 }
 await set('dining',3);assert.equal(await page.locator('#people-tray [data-npc=servants]').count(),0);
 if(await page.locator('#scene-overview').getAttribute('aria-pressed')==='false')await page.click('#scene-overview');
 const dimensions=()=>page.locator('#room-art').evaluate(n=>{const r=n.getBoundingClientRect();return[r.width,r.height];});const initial=await dimensions(),initialSource=await page.locator('#room-art').getAttribute('src');
 await clickObject(page,'portrait_dining');assert.equal(await page.locator('#scene-area').getAttribute('data-scene-id'),'dining-loop3-portrait-reveal');
 await page.waitForTimeout(1700);assert.equal(await page.locator('#room-art').getAttribute('src'),initialSource,'The veiled room pixels remain unchanged outside the painting');
 assert.equal(await page.locator('#castle-portrait-reveal').getAttribute('data-revealed'),'true');assert.equal(await page.locator('#castle-portrait-reveal').evaluate(n=>getComputedStyle(n).opacity),'1');
 assert.equal(await page.locator('#castle-portrait-reveal').evaluate(n=>n.style.clipPath),await page.evaluate(()=>{const region=CastleSceneArt.reveal(G).from.objectRegions.portrait_dining;const node=document.createElement('div');node.style.clipPath='polygon('+region.outline.map(([x,y])=>x+'% '+y+'%').join(',')+')';return node.style.clipPath;}),'Only the authored portrait polygon is composited');
 assert.deepEqual(await dimensions(),initial,'Revealing faces does not resize the camera');
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
  await page.setViewportSize(viewport);
  const aligned=await page.evaluate(()=>{
   const overlay=document.getElementById('castle-portrait-reveal').getBoundingClientRect(),plane=document.getElementById('scene-hotspots').getBoundingClientRect();
   return ['x','y','width','height'].every(key=>Math.abs(overlay[key]-plane[key])<1);
  });
  assert(aligned,'The portrait clip uses the actual image plane, including desktop letterboxing at '+viewport.width);
  assert.equal(await page.locator('#room-art').evaluate(n=>getComputedStyle(n).animationName),'none','Portrait-only reveal does not animate the whole room');
 }
 await page.locator('#scene-zoom-in').click();const zoomed=await dimensions();await page.evaluate(()=>CastleUI.action('examine','portrait_dining'));assert.deepEqual(await dimensions(),zoomed,'Repeated portrait investigation preserves the user zoom');
 await page.evaluate(()=>{const snapshot=CastleUI.snapshot;CastleSave.write(snapshot);});await page.reload();await page.click('#continue-btn');
 assert.equal(await page.locator('#scene-area').getAttribute('data-scene-id'),'dining-loop3-portrait-reveal','Old save fields restore the current portrait event');
 assert.equal(await page.locator('#castle-portrait-reveal').getAttribute('data-animate'),'false','Restoration displays the face immediately without replaying the animation');
 await page.evaluate(()=>{G.currentRoom='study';CastleSceneArt.reset();CastleUI.sync();CastleSave.write(CastleUI.snapshot);});await page.reload();await page.click('#continue-btn');
 await page.evaluate(()=>{G.currentRoom='dining';CastleSceneArt.reset();CastleUI.sync();});assert.equal(await page.locator('#castle-portrait-reveal').getAttribute('data-animate'),'false','Leaving and restoring another room preserves the learned painting state');
 await set('dining',3);await page.evaluate(()=>{G.flags.read_portrait_name=true;CastleSave.write(CastleUI.snapshot);});await page.reload();await page.click('#continue-btn');
 assert.equal(await page.locator('#castle-portrait-reveal').count(),0,'A legacy earlier-loop portrait flag cannot skip the new reveal');
 await set('hall',4);await page.evaluate(()=>{G.sunrise=true;G.nextMorning=true;CastleUI.sync();});assert.equal(await page.locator('#scene-area').getAttribute('data-scene-id'),'hall-morning');assert.equal(await page.locator('#people-tray [data-npc]').count(),9);
 await page.evaluate(()=>CastleUI.action('npc','servants'));assert.equal(await page.locator('#scene-area').getAttribute('data-scene-id'),'hall-dawn-talk-servants');
 await page.locator('#scene-return').click();assert.equal(await page.locator('#people-tray [data-npc]').count(),9,'A focused morning conversation leaves the full party present on return');
 await page.evaluate(()=>CastleUI.action('npc','shiyuan'));assert.equal(await page.locator('#scene-area').getAttribute('data-scene-id'),'hall-dawn-talk-shiyuan');
 await page.locator('#scene-return').click();await page.evaluate(()=>CastleUI.action('npc','bingbing'));assert.equal(await page.locator('#scene-area').getAttribute('data-scene-id'),'dining-dawn-talk-bingbing');
 await set('dining',2);await page.evaluate(()=>G.inventory.push('mirror_shard'));await clickObject(page,'musicbox');
 assert.equal(await page.locator('#scene-area').getAttribute('data-scene-id'),'musicbox-soul-freed');assert(await page.evaluate(()=>hasItem('soul_fragment')));
 await clickObject(page,'musicbox');assert.equal(await page.locator('#scene-area').getAttribute('data-scene-id'),'musicbox-empty');
 await set('dining',2);await clickObject(page,'mirror');assert.equal(await page.locator('#scene-area').getAttribute('data-scene-id'),'mirror-felix-reflection');assert(await page.evaluate(()=>hasItem('mirror_shard')));
 await set('tower',2);assert.equal(await page.locator('#people-tray [data-npc=adrian]').count(),0);await page.evaluate(()=>CastleUI.setDrawer('explore'));await page.locator('#explore-people [data-npc=adrian]').click();assert.equal(await page.locator('#scene-area').getAttribute('data-scene-id'),'tower-loop2-talk-adrian');
 await set('tower',2);await page.evaluate(()=>{G.inventory.push('ring');CastleUI.action('npc','adrian');});assert.equal(await page.locator('#scene-area').getAttribute('data-scene-id'),'adrian-bound-ring');assert(await page.evaluate(()=>G.countdown.active&&!hasItem('ring')),'Artwork does not replace the actual keepsake/countdown mechanics');
 assert.deepEqual(errors,[]);console.log('PASS: real mobile echo buttons, investigation reset, same-plane portrait fade and save restore, full morning cast and absent tower host.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();});
