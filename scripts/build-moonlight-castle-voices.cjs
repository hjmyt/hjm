// Explicit dialogue-to-speaker catalog. No runtime name/text speaker guessing.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'docs/moonlight-castle/voices');
const {moods,directions,retakes}=require('../docs/moonlight-castle/voices/acting-directions.cjs');
const refs='/Users/hxj/.agents/skills/indextts2-local-tts/assets/voice_refs';
const profiles={
 siyang:['叶思阳','男声_中性_稳定旁白_male003',0,'克制、沉着，像压低声音讲述秘密的青年执事'],
 tim:['Tim','男声_中性_稳定旁白_male002',-2,'稳重、坚定、可靠，守护者的青年男声'],
 dijie:['笛杰','男声_中性_自然旁白_male001',.4,'温和、清晰、有书卷气的青年男声'],
 jerry:['Jerry','男声_中性_稳定旁白_male004',.6,'明亮、轻松、自然，铜管乐手的青年男声'],
 baoshi:['宝石','男声_中性_沉稳内省_male005',.5,'柔软、含蓄、略带迟疑，青年男声'],
 feihong:['飞鸿','男声_中性_自然旁白_male001',-1.4,'清晰、利落、略带紧张，青年男声'],
 adrian:['艾德里安','男声_悲伤_孤独星空_male002',-1.3,'低沉、孤独、深情，压住两百年的悲伤'],
 felix:['菲利克斯','男声_中性_稳定旁白_male003',1.3,'温柔、明净、坚定，像在原谅爱人的青年男声'],
 bingbing:['冰冰','女声_中性_稳定旁白_female005',0,'轻柔、清冷、细腻，压低声音的青年女声'],
 shiyuan:['十元','女声_中性_稳定旁白_female002',0,'亲切、自然、细腻的青年女声'],
 qiqi:['柒柒','女声_中性_温和叙述_female001',-.6,'知性、从容、带一点神秘感的青年女声'],
 lala:['垃垃','女声_中性_城市纪实_female004',.4,'慵懒、神秘、略带俏皮的青年女声']
};
const cast=Object.fromEntries(Object.entries(profiles).map(([id,[name,ref,pitch,style]])=>[id,{name,reference:refs+'/'+ref+'/reference.wav',source:refs+'/'+ref+'/source.txt',pitch,style}]));
const scope={};const data=fs.readFileSync(path.join(root,'js/data/moonlight-castle.js'),'utf8'),game=fs.readFileSync(path.join(root,'js/features/moonlight-castle-game.js'),'utf8');
vm.runInNewContext(data+'\n'+game+'\n;globalThis.catalog={DIALOGUES,NAME_PUZZLES,KEEPSAKE_NAMES};',scope);
const {DIALOGUES,NAME_PUZZLES,KEEPSAKE_NAMES}=scope.catalog;
const normalize=text=>text.replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const quotes=text=>[...text.matchAll(/"([^"]+)"|“([^”]+)”/g)].map(m=>m[1]||m[2]);
const lines=[],clips=new Map();
const servants={1:{0:['baoshi','feihong'],1:['feihong']},2:{0:['baoshi'],1:['feihong']},3:{0:['baoshi']},4:{0:['feihong','feihong'],1:['feihong'],2:['baoshi','baoshi'],3:[null],4:['shiyuan']}};
function add(id,source,speaker,owners,override){
 const acting=directions[id];if(!acting)throw Error('Missing line-specific acting direction '+id);
 const spoken=override||quotes(normalize(source)),voices=owners||spoken.map(()=>speaker);
 if(spoken.length!==voices.length)throw Error('Speaker count mismatch '+id);
 const segments=[];
 for(let i=0;i<spoken.length;i++){
  if(!voices[i])continue;
  const emotion=acting.beatEmotions[i]||acting.emotion;
  if(!moods[emotion])throw Error('Unknown beat emotion '+id);
  segments.push({speaker:voices[i],text:spoken[i],emotion,quoteIndex:i});
 }
 const ids=[];
 for(const segment of segments){
  if(!cast[segment.speaker])throw Error('Unknown speaker '+segment.speaker);
  // Small inference chunks avoid long MPS memory peaks. Quotes remain unchanged.
  const sentences=segment.text.match(/[^。！？!?；;，,]+[。！？!?；;，,]?/g)||[segment.text];let chunk='';const chunks=[];
  for(const sentence of sentences){if(chunk&&chunk.length+sentence.length>85){chunks.push(chunk);chunk='';}chunk+=sentence;}if(chunk)chunks.push(chunk);
  for(let text of chunks){
   text=text.trim();if(!text)continue;
   const retake=retakes[id+':'+segment.quoteIndex],vector=retake?.vector||moods[segment.emotion],rate={fear:.97,panic:1.04,suspicion:.98,mystery:.96,grief:.94,choked:.95,tender:.98,relief:1,instruct:1,playful:1.04,threat:.96,confess:.95,resolve:1,surprise:1.02}[segment.emotion];
   const hashInput=[segment.speaker,text,vector,acting.delivery,id,'emotional-v2'];if(retake)hashInput.push(retake);
   const hash=crypto.createHash('sha256').update(JSON.stringify(hashInput)).digest('hex').slice(0,14),key=segment.speaker+'-'+hash;
   if(!clips.has(key))clips.set(key,{id:key,lineId:id,quoteIndex:segment.quoteIndex,speaker:segment.speaker,text,emotion:segment.emotion,emotionVector:vector,delivery:acting.delivery,rate,...(retake?{synthesisText:retake.text||text,retakeReason:retake.reason,renderOptions:{num_beams:3,temperature:.65,top_p:.7}}:{}),source:'assets/audio/moonlight-castle/voices/source/emotional-v2/'+key+'.wav'});
   ids.push(key);
  }
 }
 lines.push({id,source:normalize(source),acting,clips:ids});
}
for(const [npc,puzzle]of Object.entries(NAME_PUZZLES))for(const field of ['ask','reveal'])add('name.'+npc+'.'+field,puzzle[field],npc);
for(const [npc,loops]of Object.entries(DIALOGUES))for(const [loop,entries]of Object.entries(loops))entries.forEach((entry,index)=>{
 for(const field of ['text','giftText','rewardText','ansQuestion'])if(entry[field]){
  let owners=npc==='servants'?servants[loop]?.[index]:undefined;
  // This line reads the register after speaking; its inscription stays visual.
  if(npc==='siyang'&&loop==='4'&&index===0)owners=['siyang',null];
  add('talk.'+npc+'.'+loop+'.'+index+'.'+field,entry[field],npc,owners,field==='ansQuestion'?[entry[field]]:undefined);
 }
});
const tokens=/\/\/[^\n]*|\/\*[\s\S]*?\*\/|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)/g;
const literals=[...game.matchAll(tokens)].flatMap(m=>{if(!m[1])return [];try{return [vm.runInNewContext(m[1])];}catch{return [];}});
const special=[
 ['keepsake-refused','艾德里安盯着你的掌心','adrian'],
 ['protected','"是你……你一直在看着我们','adrian'],
 ['mirror-soul','你敲碎了一小块镜子。碎片中映出了一个穿礼服','felix'],
 ['organ-blocked','艾德里安挡住了风琴。','adrian'],
 ['keepsake-active','艾德里安的身影被一层淡淡的金光','adrian'],
 ['forgiven','艾德里安颤抖着接过信件','adrian'],
 ['requiem-ready','艾德里安小心地把信贴在胸口','adrian'],
 ['soul-fragment','菲利克斯的灵魂残音在你手中','felix'],
 ['chase-taunt-run','你躲过了他。黑暗中传来他低低的笑声','adrian'],
 ['chase-taunt-shadow','他的指尖擦过你的后颈，却抓了个空','adrian']
];
for(const[id,prefix,speaker]of special){const source=literals.find(s=>s.startsWith(prefix));if(!source)throw Error('Missing special '+id);add('special.'+id,source,speaker);}
const transitionSource=game.match(/function triggerLoop2\(\)[\s\S]*?getElementById\('loop-text'\)\.innerHTML\s*=([\s\S]*?);\n  document\.getElementById\('loop-btn'\)/)[1];
add('transition.loop2',vm.runInNewContext(transitionSource),'adrian');
const organIntro=literals.find(s=>s.startsWith('艾德里安的手指悬在琴键上方：'));
for(const [id,prefix]of Object.entries({farewell:'你带回了真相、补全的安魂曲',reunion:'你没有急着弹琴。你先让他读了那封信',diary:'你带来了他完整的日记——',ring:'你把刻着A&F的戒指和停在11:47的怀表'})){
 const reason=literals.find(s=>s.startsWith(prefix));if(!organIntro||!reason)throw Error('Missing organ branch '+id);
 add('organ.'+id,organIntro+' '+reason,'adrian');
}
const keepsakes={ring:'艾德里安的指尖悬在戒指上方',pocket_watch:'艾德里安盯着停在11:47',wine_bottle:'艾德里安接过酒瓶',diary_page:'艾德里安看到那页日记时',silver_key:'艾德里安认出了那把钥匙'};
const warning=literals.find(s=>s.startsWith('<br><br><span')&&s.includes('禁锢生效'));
if(!warning)throw Error('Missing keepsake warning');
for(const [id,prefix]of Object.entries(keepsakes)){
 const source=literals.find(s=>s.startsWith(prefix));if(!source)throw Error('Missing keepsake '+id);
 add('keepsake.'+id,'你献出了「'+KEEPSAKE_NAMES[id]+'」。'+source+warning,'adrian');
}
// Ending 1's "我知道" is a simile, not audible Felix dialogue. Ending 2's third
// quote is the player's response, not Felix speaking (the script says he is mute).
for(let movement=1;movement<=3;movement++){
 const prefix=['','第一乐章：悲怆','第二乐章：柔情','第三乐章：永别'][movement];
 const source=literals.find(s=>s.startsWith(prefix)&&s.length>100);
 add('ending.'+movement,source,'adrian',movement===1?['adrian','adrian',null,'adrian']:movement===2?['adrian','adrian',null,'adrian']:undefined);
}
for(let i=0;i<lines.length;i++){
 const line=lines[i],group=id=>id.split('.').slice(0,id.startsWith('name.')?2:3).join('.');
 const siblings=lines.filter(other=>group(other.id)===group(line.id)),index=siblings.indexOf(line);
 line.contextBefore=index>0?siblings[index-1].source:'玩家进入当前房间或本分支，尚未听到本句。';
 line.contextAfter=index<siblings.length-1?siblings[index+1].source:'玩家听完这句后可以继续交谈、提交线索或探索；不自动说出相邻分支。';
 if(line.id.startsWith('name.')){
  const reveal=line.id.endsWith('.reveal');
  line.contextBefore=reveal?'玩家已经找到此人的真名线索，并正确回答了两百年前的名字。':'第一周目，人物失去两百年前的真名，玩家第一次向此人询问。';
  line.contextAfter=reveal?'人物恢复真名与部分记忆，接下来愿意讲述古堡秘密。':'玩家需要探索房间里的真实线索，找到真名后再回来回答。';
 }
 if(line.id.startsWith('keepsake.')){line.contextBefore='第二周目，艾德里安将要失控；玩家主动献出菲利克斯的信物。';line.contextAfter='信物暂时压住古堡与伯爵，玩家进入限时寻信阶段。';}
 if(line.id.startsWith('ending.')){line.contextBefore='真相与灵魂已经带到风琴前，玩家完成了当前收集条件对应的安魂曲乐章。';line.contextAfter='灵魂获得不同程度的和解与解脱，画面停留至玩家主动进入日出探索。';}
 if(line.id.startsWith('transition.')){line.contextBefore='第一周目，玩家首次进入塔楼，艾德里安突然现身；这一夜即将重新开始。';line.contextAfter='黑暗过后玩家在第二周目苏醒，发现盔甲与壁炉发生了变化。';}
 if(line.id.startsWith('organ.')){line.contextBefore='第三周目，玩家已经补全乐谱，带着真相与灵魂到达风琴前；实际收集物决定当前乐章。';line.contextAfter='玩家主动奏响风琴后，进入本分支对应的安魂曲结局；此时尚未开始弹奏。';}
 for(const key of line.clips){const clip=clips.get(key);clip.contextBefore=line.contextBefore;clip.currentBeat=line.source;clip.contextAfter=line.contextAfter;}
}
const plan={version:2,engine:'IndexTTS2 local MPS, explicit per-line and per-utterance emotions',emotionOrder:['happy','angry','sad','afraid','disgusted','melancholic','surprised','calm'],cast,lines,clips:[...clips.values()]};
fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'plan.json'),JSON.stringify(plan,null,2)+'\n');
fs.mkdirSync(path.join(root,'assets/audio/moonlight-castle/voices/source/emotional-v2'),{recursive:true});
const priority=['talk.shiyuan.1.0.text','talk.adrian.1.3.text','talk.adrian.3.0.text','talk.adrian.4.0.text','name.siyang.ask','name.bingbing.reveal'];
const remaining=plan.clips.filter(c=>!fs.existsSync(path.join(root,c.source))).sort((a,b)=>{const ai=priority.indexOf(a.lineId),bi=priority.indexOf(b.lineId);return(ai<0?999:ai)-(bi<0?999:bi);});
const jobs=remaining.map(c=>({voice:cast[c.speaker].reference,text:c.synthesisText||c.text,output:path.join(root,c.source),emotion_vector:c.emotionVector,emotion_weight:1}));
fs.writeFileSync(path.join(dir,'pending.jsonl'),jobs.map(j=>JSON.stringify(j)).join('\n')+'\n');
console.log(JSON.stringify({lines:lines.length,clips:clips.size,characters:Object.keys(cast).length,spokenCharacters:plan.clips.reduce((n,c)=>n+c.text.length,0),pending:jobs.length}));
