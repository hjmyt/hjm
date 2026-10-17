// Add independent event artwork for each reachable physical phase. Safe to rerun.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dir='docs/imagegen/moonlight-castle/horror-v4';
const file=path.join(root,dir,'generation-plan.json'),plan=JSON.parse(fs.readFileSync(file,'utf8'));
const groups={
 'object.musicbox.empty':{base:'musicbox-empty',room:'dining',phases:['loop1','loop2','loop3','dawn']},
 'object.violin.empty':{base:'violin-case-empty',room:'music',phases:['loop1','loop2','loop3','dawn']},
 'object.mirror.broken':{base:'mirror-broken',room:'dining',phases:['loop1','loop2','loop3','dawn']},
 'object.mirror.reflection':{base:'mirror-felix-reflection',room:'dining',phases:['loop2','loop3','dawn']},
 'object.musicbox.freed':{base:'musicbox-soul-freed',room:'dining',phases:['loop2','loop3','dawn']},
 'adrian.soul-protection':{base:'adrian-soul-protection',room:'tower',phases:['loop2','loop3']},
 'adrian.candle-repelled':{base:'adrian-candle-repelled',room:'tower',phases:['loop2','loop3']}
};
const bindings={};
const details={
 'object.musicbox.empty':'The same ornate black/gold music box is OPEN and EMPTY on its burgundy runner. Show coherent gold mechanism and velvet lining, absolutely NO blue soul light or miniature person.',
 'object.violin.empty':'The same long antique black/gold violin CASE is OPEN and COMPLETELY EMPTY after the bow was taken. Burgundy velvet lining and coherent hinges, no violin or bow inside. The violin, if visible in the far background, stays OUTSIDE the case and follows the supplied current-room reference.',
 'object.mirror.broken':'The same dining mirror is BROKEN, with one missing piece and jagged shards reflecting CURRENT room light/furniture only. No face in the mirror, no people anywhere in this close-up.',
 'object.mirror.reflection':'The jagged dining mirror shard contains ONLY historic FELIX smiling softly: Feihong card identity, BLACK hair, rectangular glasses, plum nineteenth-century court coat and ivory cravat. His face is confined INSIDE the reflection, never a physical person outside the shard.',
 'object.musicbox.freed':'The same black/gold music box is OPEN. One small BLUE soul mote leaves the coherent gold mechanism and gently settles above an anonymous open palm at frame edge; no human face or body, no added jewelry.',
 'adrian.soul-protection':'Adrian (Baoshi exact fluffy BLACK hair, soft adult male face, NO glasses, black ornate nineteenth-century court coat) reaches toward viewer, red-lit fingers STOPPED by a small BLUE soul glow in foreground. Recognition, conflicted grief; no gore. Generic dark interior corridor, no tower organ because this event can occur en route.',
 'adrian.candle-repelled':'A lit white wax candle held at frame edge repels a DISTANT Adrian (Baoshi face, fluffy BLACK hair, NO glasses, ornate black court coat) into a dark CORRIDOR doorway. Small distant red eyes, retreating posture. No tower organ or other room-specific props.'
};
for(const [event,g]of Object.entries(groups)){
 const base=plan.scenes.find(s=>s.id===g.base);if(!base)throw Error('Missing event '+g.base);
 bindings[event]={};base.phase='loop2';base.eventPhase='loop2';base.eventKey=event;
 for(const phase of g.phases){
  const id=phase==='loop2'?g.base:g.base+'-'+phase;bindings[event][phase]=id;if(phase==='loop2')continue;
  const dawn=phase==='dawn',encounter=event.startsWith('adrian.');
  const parent=encounter?g.base:g.room+'-'+phase;
  const references=['assets/moonlight-castle/source/horror-v4/'+parent+'.png'];
  if(parent!==g.base)references.push(base.source);
  if(event==='object.mirror.reflection')references.push(plan.refs.feihong);
  const beat=details[event]+(encounter?' Third-loop corridor. All same-period identity locks remain.':dawn?' This is AFTER SUNRISE: warm clean daylight and calm restored furnishings, no blood, rotten food, night moon or horror shadows.':phase==='loop1'?' FIRST LOOP: untouched dinner or initial music-room furnishing; no rotten fruit, blood-tear aftermath or restored morning objects.':'THIRD LOOP: current room state only. If music room appears in blurred background the harpsichord is open and the self-playing violin stays OUTSIDE the case. No daytime sunlight.');
  const cast=encounter?['adrian']:[],painted=event==='object.mirror.reflection'?['felix']:[];
  const prompt=[
   'Use case: illustration-story. Asset: a single independent high-resolution 4:3 game event illustration, never a collage. Painted anime visual novel style matching the references. No UI, captions, labels or watermark.',
   dawn?'Lighting: MORNING SUNLIGHT, warm golden rays, clean restored castle after the night. Never copy moonlight or blood from the old event reference.':'Lighting: very dark blue-black castle night with thin moonlight and sparse candle highlights, no daylight.',
   'Input image 1 is the CURRENT PHASE room and lighting reference. '+(references.length>1?'Input image 2 preserves only the object design/event action; replace all its old-phase background and lighting.':''),
   'Context immediately before: The player explores '+g.room+' during '+phase+' and investigates this object or encounters Adrian. Remain in this exact phase.',
   'Visible named cast in the current physical location (visibleCast): '+(cast.join(', ')||'NONE')+'.',
   'Only the explicitly listed visibleCast may appear physically. All companions in a room reference remain OFF CAMERA in this tight close-up. Painted/reflected identities only: '+(painted.join(', ')||'none')+'.',
   'Current story beat: '+beat,
   encounter?'Preserve exact count face and costume from the first reference.': 'Composition: true tight object close-up. Crop away the distant wall painting and all character bodies, so this does not reveal any portrait early or import old-room people. Preserve matching table wood, runner, box/mirror design from references.',
   'Context immediately after: Player reads the unchanged event subtitle and returns to the SAME '+phase+' room. No time travel or narrative advancement.'
  ].join('\n\n');
  const s={id,room:g.room,phase,eventPhase:phase,eventKey:event,event:true,parent,visibleCast:cast,paintedCast:painted,groupException:null,beat,contextBefore:'Investigate '+g.room+' in '+phase,contextAfter:'Return to '+g.room+' in '+phase,source:'assets/moonlight-castle/source/horror-v4/'+id+'.png',asset:'assets/moonlight-castle/horror-v4/'+id+'.webp',promptFile:dir+'/prompts/'+id+'.txt',references,prompt};
  const at=plan.scenes.findIndex(v=>v.id===id);if(at<0)plan.scenes.push(s);else plan.scenes[at]=s;
  fs.writeFileSync(path.join(root,s.promptFile),prompt+'\n');
 }
}
plan.eventPhaseBindings=bindings;
fs.writeFileSync(file,JSON.stringify(plan,null,2)+'\n');
console.log('Phase-aware plan: '+plan.scenes.length+' independent images; '+Object.keys(bindings).length+' cross-phase event families.');
