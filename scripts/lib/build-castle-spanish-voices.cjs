'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
module.exports=function buildSpanish(sourcePlan,root){
 const doc=path.join(root,'docs/moonlight-castle/voices'),registry=JSON.parse(fs.readFileSync(path.join(root,'assets/characters/voices/registry.json')));
 const translations=JSON.parse(fs.readFileSync(path.join(doc,'spanish-v3/translations.json')));
 const retakePath=path.join(doc,'spanish-v3/retakes.json'),retakes=fs.existsSync(retakePath)?JSON.parse(fs.readFileSync(retakePath)).clips:{};
 // Restrained performances: fear and grief are played through pauses and
 // meaning, not maximum emotion strength, sobbing or caricatured voices.
 const moods={
  fear:[0,0,.03,.16,0,.04,.01,.46],panic:[0,0,.03,.24,0,.02,.02,.36],
  suspicion:[0,.01,0,.05,0,.03,.08,.48],mystery:[0,0,.03,.04,0,.07,.01,.48],
  grief:[.01,0,.18,0,0,.1,0,.36],choked:[.01,0,.22,.01,0,.07,0,.32],
  tender:[.08,0,.03,0,0,.03,.01,.50],relief:[.16,0,.01,0,0,.01,.04,.42],
  instruct:[.03,0,0,0,0,.01,.02,.56],playful:[.16,0,0,0,0,.01,.06,.42],
  threat:[0,.20,.02,.04,0,.04,0,.35],confess:[0,.03,.15,.03,0,.07,0,.38],
  resolve:[.03,.04,.04,0,0,.02,0,.50],surprise:[.04,0,.01,.02,0,0,.18,.40]
 };
 const durationFactors={fear:1.03,panic:.98,suspicion:1.02,mystery:1.03,grief:1.05,choked:1.05,tender:1.03,relief:1.01,instruct:1,playful:.99,threat:1.03,confess:1.04,resolve:1.01,surprise:1.02};
 const cast=Object.fromEntries(Object.entries(registry.characters).map(([id,p])=>{
  const ref=path.join(root,p.reference);if(!fs.existsSync(ref)||crypto.createHash('sha256').update(fs.readFileSync(ref)).digest('hex')!==p.sha256)throw Error('Reference missing/changed '+id);
  return[id,{name:p.name,reference:p.reference,metadata:'assets/characters/voices/'+id+'/metadata.json',referenceSha256:p.sha256,pitch:p.defaultPitchSemitones,style:p.actingPolicy,sourceKind:p.sourceKind}];
 }));
 const remap=new Map(),clips=sourcePlan.clips.map(source=>{
  const translation=translations.clips[source.id];
  if(!translation||translation.sourceZh!==source.text||translation.speaker!==source.speaker||translation.lineId!==source.lineId)throw Error('Stale/missing Spanish translation '+source.id);
  if(/[\u4e00-\u9fff<>]/.test(translation.textEs))throw Error('Non-Spanish text/stage direction '+source.id);
  const retake=retakes[source.id]||{},profile=cast[source.speaker],vector=retake.emotionVector||moods[source.emotion],durationFactor=retake.durationFactor||durationFactors[source.emotion],seed=retake.seed??102;if(!profile||!vector)throw Error('Unmapped speaker/emotion');
  const recipe={engine:'IndexTTS-2.5',lang:'ES',referenceSha256:profile.referenceSha256,text:translation.textEs,emotionVector:vector,durationFactor,seed,performanceVersion:'restrained-spanish-v3',...(retake.vocoderPeak?{vocoderPeak:retake.vocoderPeak}:{}),...(retake.renderOptions?{renderOptions:retake.renderOptions}:{})};
  const digest=crypto.createHash('sha256').update(JSON.stringify([source.lineId,source.quoteIndex,recipe])).digest('hex').slice(0,14),id=source.speaker+'-es-'+digest;
  remap.set(source.id,id);
  return{id,sourceClipId:source.id,lineId:source.lineId,quoteIndex:source.quoteIndex,speaker:source.speaker,sourceZh:source.text,text:translation.textEs,language:'es',emotion:source.emotion,emotionVector:vector,delivery:source.delivery,performance:'Natural Spanish, restrained and intelligible. Respond to the current story beat; no invented laughter, screaming, sobbing or stage directions. Preserve the provided voice timbre.',durationFactor,rate:1,seed,...(retake.vocoderPeak?{vocoderPeak:retake.vocoderPeak}:{}),...(retake.renderOptions?{renderOptions:retake.renderOptions}:{}),contextBefore:source.contextBefore,currentBeat:source.currentBeat,contextAfter:source.contextAfter,recipe,source:'assets/audio/moonlight-castle/voices/source/spanish-v3/'+id+'.wav'};
 });
 if(Object.keys(translations.clips).length!==sourcePlan.clips.length)throw Error('Unused/missing translation records');
 const lines=sourcePlan.lines.map(line=>({...line,clips:line.clips.map(id=>remap.get(id)),language:'es',spokenText:line.clips.map(id=>translations.clips[id].textEs).join(' ')}));
 const plan={version:3,engine:'IndexTTS-2.5',language:'es',performanceVersion:'restrained-spanish-v3',emotionOrder:sourcePlan.emotionOrder,registry:'assets/characters/voices/registry.json',cast,lines,clips};
 fs.writeFileSync(path.join(doc,'plan.json'),JSON.stringify(plan,null,2)+'\n');
 fs.writeFileSync(path.join(doc,'spanish-v3/catalog-zh.json'),JSON.stringify(sourcePlan,null,2)+'\n');
 fs.mkdirSync(path.join(root,'assets/audio/moonlight-castle/voices/source/spanish-v3'),{recursive:true});
 const priority=['talk.shiyuan.1.0.text','talk.servants.1.0.text','name.siyang.ask','name.bingbing.ask','name.qiqi.reveal','talk.dijie.1.0.text','talk.tim.1.0.text','talk.jerry.1.0.text','talk.lala.1.0.text','talk.adrian.1.3.text','special.mirror-soul'];
 const pending=clips.filter(c=>!fs.existsSync(path.join(root,c.source))).sort((a,b)=>{const ai=priority.indexOf(a.lineId),bi=priority.indexOf(b.lineId);return(ai<0?999:ai)-(bi<0?999:bi);});
 fs.writeFileSync(path.join(doc,'pending.jsonl'),pending.map(c=>JSON.stringify({id:c.id,voice:path.join(root,cast[c.speaker].reference),text:c.text,lang:'ES',output:path.join(root,c.source),emotion_vector:c.emotionVector,duration_factor:c.durationFactor})).join('\n')+'\n');
 console.log(JSON.stringify({version:3,engine:plan.engine,language:plan.language,lines:lines.length,clips:clips.length,characters:Object.keys(cast).length,pending:pending.length}));
};
