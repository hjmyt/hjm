const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),folder='docs/imagegen/moonlight-castle/horror-v4';
const generation=JSON.parse(fs.readFileSync(path.join(root,folder,'generation-plan.json'),'utf8'));
const report=JSON.parse(fs.readFileSync(path.join(root,folder,'plan.json'),'utf8'));
const context={};vm.runInNewContext(fs.readFileSync(path.join(root,'js/data/moonlight-castle-story-art.js'),'utf8')+';globalThis.data=CASTLE_STORY_ART;',context);
const manifest=context.data;
assert.equal(generation.scenes.length,74);assert.equal(report.frames.length,74);
assert.equal(new Set(generation.scenes.map(s=>s.id)).size,74);
for(const frame of generation.scenes){
 const live=manifest.scenes[frame.id];assert(live,frame.id+' has a production binding');
 const png=fs.readFileSync(path.join(root,frame.source));
 assert.equal(png.subarray(1,4).toString(),'PNG');
 assert(png.readUInt32BE(16)>=1024&&png.readUInt32BE(20)>=768,frame.id+' is an individual HD original');
 assert(fs.statSync(path.join(root,live.asset)).size>20000,frame.id+' production WebP exists');
 assert.equal(live.source,frame.source);assert.equal(new Set(frame.visibleCast).size,frame.visibleCast.length);
 if(frame.visibleCast.length>2)assert(frame.groupException,frame.id+' has explicit physical group authorization');
 for(const ref of frame.references)assert(fs.existsSync(path.join(root,ref)),frame.id+' preserved reference '+ref);
 const prompt=fs.readFileSync(path.join(root,frame.promptFile),'utf8');
 for(const label of ['Context immediately before:','Visible named cast in the current physical location','Current story beat:','Context immediately after:','Only the explicitly listed visibleCast'])assert(prompt.includes(label),frame.id+' prompt context: '+label);
 const receipt=JSON.parse(fs.readFileSync(path.join(root,folder,'receipts',frame.id+'.json'),'utf8'));
 assert.equal(receipt.generation,'single-image');assert.equal(receipt.source,frame.source);
 const tracked=report.frames.find(s=>s.id===frame.id);assert.equal(tracked.generation,'single-image');
 assert.equal(tracked.sourceWidth,png.readUInt32BE(16));assert.equal(tracked.sourceHeight,png.readUInt32BE(20));
}
for(const [id,target]of Object.entries(report.aliases)){
 assert.equal(manifest.scenes[id].asset,manifest.scenes[target].asset);
 assert.equal(manifest.scenes[id].reuses,target,'Reuse is authored, never array-position inferred');
}
const cast=id=>Array.from(manifest.scenes[id].visibleCast);
assert.deepEqual(cast('study-loop2'),['qiqi']);assert.deepEqual(cast('study-loop3'),['qiqi']);
assert.deepEqual(cast('dining-loop3'),['bingbing']);assert.deepEqual(cast('tower-loop2'),[]);
assert.deepEqual(cast('hall-morning').sort(),['yeshiyang','tim','baoshi','feihong','bingbing','dijie','jerry','qiqi','shiyuan','lala'].sort());
assert.equal(manifest.scenes['hall-morning'].positions.length,10);
assert.deepEqual(Array.from(manifest.scenes['mirror-felix-reflection'].paintedCast),['felix']);
for(const id of ['dining-loop1','dining-loop2','dining-loop3','dining-loop3-portrait-reveal','dining-dawn','dining-dawn-talk-bingbing','bedroom-loop3'])assert.deepEqual(Array.from(manifest.scenes[id].paintedCast),['adrian','felix']);
assert.equal(manifest.scenes['dining-loop3-portrait-veiled'].geometryKey,manifest.scenes['dining-loop3-portrait-reveal'].geometryKey,'Portrait reveal keeps the same pan/zoom plane');
assert.equal(manifest.scenes['dining-loop3-portrait-veiled'].asset,manifest.scenes['dining-loop3'].asset);
// A new event camera must not leave invisible furniture from the old room
// covering a disappeared character or a transient ghost's face.
for(const id of ['study-loop2-talk-dijie','study-loop3-talk-dijie','dining-loop3-talk-servants','tower-loop2-talk-adrian','bedroom-loop2-mirror-reflection']){
 assert.deepEqual(Object.keys(manifest.scenes[id].objectRegions),[],id+' has no old-camera furniture');
 assert.equal(manifest.scenes[id].doors.length,0,id+' uses explicit return-to-room control');
}
const raised=manifest.scenes['hall-dawn-armor-raised'];
assert.equal(raised.positions.length,10,'Supporting the empty armor does not erase the morning cast');
assert(raised.objectRegions.armor.outline.every(([x])=>x>=60&&x<=71),'Raised armor targets its new central location, not the previous corner');
const spec=id=>generation.scenes.find(s=>s.id===id);
for(const [id,term]of [['hall-loop1','SQUARE PIANO'],['hall-loop3','BLUE'],['cellar-loop3','COLLAPSED'],['study-loop3','CRACKED BAMBOO FLUTE'],['bedroom-loop2','SHATTERED'],['hall-dawn-talk-shiyuan','BURNT BREAD'],['tower-dawn','AMBER']])assert((spec(id).beat+' '+(spec(id).layout||'')).includes(term),id+' has an explicit physical-state lock');
const html=fs.readFileSync(path.join(root,'moonlight-castle.html'),'utf8');
const order=['js/data/moonlight-castle.js','js/data/moonlight-castle-story-art.js','js/features/moonlight-castle-scene-art.js','js/features/moonlight-castle-game.js','js/features/moonlight-castle-ui.js'];
for(let i=1;i<order.length;i++)assert(html.indexOf(order[i])>html.indexOf(order[i-1]),'Classic script dependency order');
assert(!html.includes('exterior-exploration-v3.webp'));assert(!html.includes('hall-exploration-v3.webp'));
console.log('PASS: 74 independent HD source images, complete semantic source/production/prompt receipts, identity and group locks, explicit reuse and portrait geometry, no legacy entry art.');
