const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),ctx={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'js/data/moonlight-castle.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'js/data/moonlight-castle-story-art.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'js/features/moonlight-castle-scene-art.js'),'utf8')+'\nglobalThis.manifest=CASTLE_STORY_ART;globalThis.api=CastleSceneArt;',ctx);
const expected={
 'object.musicbox.empty':['musicbox-empty','dining',[1,2,3,4]],'object.violin.empty':['violin-case-empty','music',[1,2,3,4]],
 'object.mirror.broken':['mirror-broken','dining',[1,2,3,4]],'object.mirror.reflection':['mirror-felix-reflection','dining',[2,3,4]],
 'object.musicbox.freed':['musicbox-soul-freed','dining',[2,3,4]],'adrian.soul-protection':['adrian-soul-protection','hall',[2,3]],'adrian.candle-repelled':['adrian-candle-repelled','hall',[2,3]]
};
const state=(room,loop)=>({currentRoom:room,loop,sunrise:false,nextMorning:false,flags:{}});
for(const [event,[base,room,loops]]of Object.entries(expected)){
 const assets=[];
 for(const loop of loops){
  const g=state(room,loop),phase=loop===4?'dawn':'loop'+loop,id=loop===2?base:base+'-'+phase,before=JSON.stringify(g);
  ctx.api.reset();ctx.api.event(event,g);const scene=ctx.api.resolve(g);
  assert.equal(scene.id,id,event+' selects its own '+phase+' image');assert.equal(ctx.manifest.scenes[id].phase,phase,'The actual asset metadata matches the current phase');
  assert.equal(JSON.stringify(g),before,'Looking up artwork does not mutate progress');assert(fs.existsSync(path.join(root,scene.asset)));assets.push(scene.asset);
  if(loop===4){const sunrise=state(room,3);sunrise.sunrise=true;ctx.api.event(event,sunrise);assert.equal(ctx.api.resolve(sunrise).id,id,'Sunrise flag wins over a legacy loop number');}
 }
 assert.equal(new Set(assets).size,assets.length,event+' never shares an illustration across loops');
}
for(const [room,text,base]of [['music','小提琴盒是空的。','violin-case-empty'],['dining','音乐盒已经空了。','musicbox-empty'],['dining','镜子已经碎了，碎片被你收走了。','mirror-broken'],['dining','灵魂残音在你掌心轻轻发烫。你忽然明白了——只要它还在你身边，艾德里安就不会真正伤害你。他不是不敢，是不忍：他不会伤害菲利克斯看着的人。','musicbox-soul-freed']]){
 const g=state(room,4);ctx.api.restore({dialogue:text,focusedNpc:null},g);assert.equal(ctx.api.resolve(g).id,base+'-dawn','A legacy save restores the current morning event, not its historical night art');
}
// Run a delayed encounter callback after travel/daybreak. It must neither
// replace the current narration nor reopen the old encounter camera.
const delayed=[],encounterScope={window:{},CastleAudio:{effect(){}},CastleVoice:{afterSpeech(fn){delayed.push(fn);}}};
vm.runInNewContext(fs.readFileSync(path.join(root,'js/data/moonlight-castle.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'js/data/moonlight-castle-story-art.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'js/features/moonlight-castle-scene-art.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'js/features/moonlight-castle-game.js'),'utf8')+'\nlet observed="";showText=(text,horror,event)=>{observed=text;CastleSceneArt.observe(text,G,event);};showAchievement=()=>{};globalThis.check={G,triggerAdrian,get text(){return observed;},set text(v){observed=v;},art:CastleSceneArt};',encounterScope);
for(const change of ['room','sunrise']){
 const t=encounterScope.check;Object.assign(t.G,{currentRoom:'hall',loop:2,sunrise:false,inventory:['soul_fragment']});t.art.resetSession();t.triggerAdrian();assert.equal(delayed.length,1);
 if(change==='room')t.G.currentRoom='music';else t.G.sunrise=true;
 t.art.reset();t.text='Current scene narration';delayed.shift()();assert.equal(t.text,'Current scene narration');assert.equal(t.art.beat,null,'Old protection dialogue cannot follow the player across '+change);
}
console.log('PASS: 22 phase-specific event bindings, distinct physical originals, sunrise precedence, unchanged state and old-daytime-save continuation.');
if(process.argv.includes('--static'))process.exit(0);
const {chromium}=require('playwright'),{installControlPoint,clickObject,returnToExploration}=require('./helpers/castle-objects.cjs');let browser;
(async()=>{
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await installControlPoint(page);
 await page.goto(pathToFileURL(path.join(root,'moonlight-castle.html')).href);await page.click('#start-btn');
 async function set(room,loop,items=[]){
  await page.evaluate(({room,loop,items})=>{CastleVoice.stop(true);closeModal();stopCountdown();CastleSceneArt.resetSession();G.currentRoom=room;G.loop=loop;G.sunrise=loop===4;G.nextMorning=loop===4;G.moveCount=0;G.adrianChasing=false;G.flags={};G.inventory=['candle',...items];CastleDialogue.set(getRoomDescription(room,loop,1),false,false);CastleUI.sync();},{room,loop,items});
  await page.waitForFunction(()=>{const n=document.getElementById('room-art');return n.complete&&n.naturalWidth>0;});
 }
 for(const loop of [1,2,3,4])for(const [room,item,items,base]of [
  ['music','violin_case',['bow'],'violin-case-empty'],['dining','musicbox',['soul_fragment'],'musicbox-empty'],['dining','mirror',['mirror_shard'],'mirror-broken']
 ]){
  await set(room,loop,items);await clickObject(page,item);const id=loop===2?base:base+'-'+(loop===4?'dawn':'loop'+loop);
  assert.equal(await page.locator('#scene-area').getAttribute('data-scene-id'),id,'Real object tap: '+item+' '+loop);
  await page.waitForFunction(()=>{const n=document.getElementById('room-art');return n.complete&&n.naturalWidth>0;});
  assert((await page.locator('#room-art').getAttribute('src')).includes('/'+id+'.webp'));
  if(loop===4){await page.evaluate(()=>CastleDialogue.finish());await page.waitForTimeout(650);await page.screenshot({path:'/tmp/hjm-castle-phase-'+item+'-dawn.png'});}
  await returnToExploration(page);assert.equal(await page.locator('#scene-area').getAttribute('data-scene-id'),room==='dining'&&loop===3?'dining-loop3-portrait-veiled':room+'-'+(loop===4?'dawn':'loop'+loop));
 }
 // The reported overlap came from Jerry/maid plates crossing the foreground
 // seated faces. Author face rectangles from the actual morning original,
 // independent of label coordinates; check every label, not only their owners.
 const faces={dijie:[25,47,32,56],qiqi:[9,44,16,54]};
 for(const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390},{width:1440,height:1000}])for(const raised of [false,true]){
  await page.setViewportSize(viewport);await set('hall',4);if(raised)await page.evaluate(()=>{G.flags.talk_tim_4_0=true;CastleUI.sync();});
  for(const overview of viewport.width<=1000?[false,true]:[false]){
   if(viewport.width<=1000&&await page.locator('#scene-overview').getAttribute('aria-pressed')!==String(overview))await page.click('#scene-overview');
   await page.waitForTimeout(80);
   const blockers=await page.evaluate(faces=>{
    const plane=document.getElementById('people-tray').getBoundingClientRect(),hits=[];
    for(const node of document.querySelectorAll('#people-tray [data-npc]')){
     const b=node.getBoundingClientRect();for(const [name,[x1,y1,x2,y2]]of Object.entries(faces)){
      const f={left:plane.x+x1/100*plane.width,right:plane.x+x2/100*plane.width,top:plane.y+y1/100*plane.height,bottom:plane.y+y2/100*plane.height};
      if(Math.min(b.right,f.right)-Math.max(b.left,f.left)>.5&&Math.min(b.bottom,f.bottom)-Math.max(b.top,f.top)>.5)hits.push(node.dataset.npc+' covers '+name);
     }
    }return hits;
   },faces);
   if(blockers.length)console.log(await page.evaluate(()=>{const p=document.getElementById('people-tray').getBoundingClientRect(),n=document.querySelector('#npc-jerry'),r=n.getBoundingClientRect(),c=getComputedStyle(n);return{plane:p.toJSON(),jerry:r.toJSON(),minHeight:c.minHeight,padding:c.padding,transform:c.transform,castY:n.style.getPropertyValue('--cast-y')};}));
   assert.deepEqual(blockers,[],JSON.stringify({viewport,raised,overview}));
   if(viewport.width===390&&!raised){await page.evaluate(()=>CastleDialogue.finish());await page.waitForTimeout(650);await page.screenshot({path:'/tmp/hjm-castle-morning-labels-'+(overview?'overview':'zoom')+'.png'});}
  }
 }
 assert.deepEqual(errors,[]);console.log('PASS: real empty-case/box/mirror taps in four phases, return to correct room, dawn screenshots, and no plate over Dijie/Qiqi faces in 14 morning phone/desktop/zoom/overview layouts.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();});
