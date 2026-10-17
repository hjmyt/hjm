const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),folder='docs/imagegen/moonlight-castle/horror-v4';
const plan=JSON.parse(fs.readFileSync(path.join(root,folder,'generation-plan.json'),'utf8'));
const audit=JSON.parse(fs.readFileSync(path.join(root,folder,'story-audit.json'),'utf8'));
const R=(x,y,w,h,layer=1)=>({outline:[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],layer});
// Percent coordinates belong to the original image plane, never the viewport.
// New image geometry is independently authored rather than inherited from v3.
const geometry={
 hall:{objectRegions:{piano:R(0,48,34,39),armor:R(86,31,14,45),tapestry:R(32,0,36,34),candle:R(4,47,6,16,3)},doors:[{room:'study',label:'书房门',x:10,y:30},{room:'dining',label:'餐厅门',x:84,y:30}],positions:[{id:'yeshiyang',x:43,y:61},{id:'tim',x:65,y:61}]},
 dining:{objectRegions:{table:{outline:[[0,46],[40,51],[86,65],[87,76],[49,84],[10,73],[0,66]],layer:1},portrait_dining:R(21,0,24,33),musicbox:R(42,62,13,12,3),mirror:R(89,0,11,51)},doors:[{room:'hall',label:'返回大厅',x:7,y:25},{room:'cellar',label:'地下室暗门',x:69,y:87}],positions:[{id:'bingbing',x:49,y:50},{id:'baoshi',x:66,y:55},{id:'feihong',x:82,y:55}]},
 study:{objectRegions:{bookshelf:{outline:[[18,0],[69,0],[69,22],[57,22],[54,37],[31,38],[30,61],[18,61]],layer:1},globe:R(79,35,21,34),flute_stand:R(3,52,25,35,3)},doors:[{room:'hall',label:'返回大厅',x:8,y:26},{room:'music',label:'音乐室门',x:95,y:26}],positions:[{id:'dijie',x:41,y:61},{id:'qiqi',x:65,y:61}]},
 music:{objectRegions:{harpsichord:{outline:[[58,52],[76,50],[78,30],[87,29],[95,42],[100,43],[100,68],[89,72],[88,86],[84,86],[83,70],[65,64],[64,80],[60,80]],layer:1},violin_case:R(1,48,28,17,2)},doors:[{room:'study',label:'返回书房',x:8,y:27},{room:'bedroom',label:'主卧房门',x:93,y:27}],positions:[{id:'jerry',x:47,y:60}]},
 bedroom:{objectRegions:{bed:{outline:[[15,0],[70,0],[70,18],[66,18],[65,35],[48,35],[48,76],[19,72],[15,60]],layer:1},dresser:R(71,20,29,60)},doors:[{room:'music',label:'返回音乐室',x:7,y:26}],positions:[{id:'shiyuan',x:57,y:61}]},
 cellar:{objectRegions:{wine:{outline:[[27,13],[60,13],[61,27],[50,28],[48,40],[46,68],[27,68]],layer:1}},doors:[{room:'dining',label:'返回餐厅',x:8,y:25},{room:'tower',label:'塔楼楼梯',x:88,y:25}],positions:[{id:'lala',x:60,y:61}]},
 tower:{objectRegions:{organ:{outline:[[8,53],[15,51],[15,23],[25,15],[31,0],[42,0],[46,19],[52,38],[52,55],[57,56],[57,78],[49,80],[48,66],[30,64],[29,80],[10,80]],layer:1}},doors:[{room:'cellar',label:'返回地下室',x:94,y:27}],positions:[{id:'adrian',x:66,y:60},{id:'felix',x:77,y:60}]},
 exterior:{objectRegions:{},doors:[],positions:[]}
};
const overridesPath=path.join(root,folder,'geometry-overrides.json');
const overrides=fs.existsSync(overridesPath)?JSON.parse(fs.readFileSync(overridesPath,'utf8')):{};
const alias={
 'hall-dawn':'hall-morning','dining-loop3-portrait-veiled':'dining-loop3',
 'adrian-bound-ring':'adrian-bound','adrian-bound-pocket-watch':'adrian-bound','adrian-bound-wine':'adrian-bound','adrian-bound-diary':'adrian-bound','adrian-bound-key':'adrian-bound',
 'adrian-final-letter-to-organ':'adrian-final-letter'
};
async function main(){
 const scenes={},report=[],contacts=[];
 const partial=process.argv.includes('--partial');
 for(const s of plan.scenes){
  const file=path.join(root,s.source);
  if(!fs.existsSync(file)){if(partial)continue;throw Error('Missing generated source: '+s.id);}
  const meta=await sharp(file).metadata();if(meta.width<1024||meta.height<768)throw Error('Not an independent HD original: '+s.id);
  fs.mkdirSync(path.dirname(path.join(root,s.asset)),{recursive:true});
  const encoded=await sharp(file).resize({width:1600,withoutEnlargement:true}).webp({quality:89,effort:6}).toFile(path.join(root,s.asset));
  const fullRoom=!s.event||['hall-loop2-examine-armor','hall-dawn-armor-raised','dining-loop3-portrait-reveal','study-loop2-talk-dijie','study-loop3-talk-dijie','dining-loop3-talk-servants','tower-loop2-talk-adrian','bedroom-loop2-mirror-reflection'].includes(s.id);
  const geo=JSON.parse(JSON.stringify(fullRoom?geometry[s.room]:{objectRegions:{},doors:[],positions:s.visibleCast.map((id,i)=>({id,x:s.visibleCast.length===1?50:35+30*i,y:63}))}));
  if(s.id==='hall-loop3')geo.objectRegions.armor=R(83,75,17,22);
  if(['hall-morning','hall-dawn-armor-raised'].includes(s.id))geo.positions=s.visibleCast.map((id,i)=>({id,x:7+i*9.5,y:64}));
  if(s.id==='hall-morning')geo.objectRegions.armor=R(86,73,14,24);
  if(s.id==='cellar-loop3')geo.objectRegions.wine=R(22,50,32,36);
  if(s.id==='bedroom-loop3')geo.positions=[{id:'shiyuan',x:53,y:60}];
  const custom=overrides[s.id]||{};
  const sameCamera=fullRoom&&s.parent&&s.parent!=='old-exterior'&&(s.event||s.id==='dining-loop3-portrait-reveal');
  const geometryKey=sameCamera?(scenes[s.parent]?.geometryKey||s.parent):s.id;
  scenes[s.id]={id:s.id,asset:s.asset,room:s.room,phase:s.phase,visibleCast:s.visibleCast,paintedCast:s.paintedCast,groupException:s.groupException,positions:geo.positions.filter(p=>s.visibleCast.includes(p.id)),objectRegions:geo.objectRegions,doors:geo.doors,isEvent:!!s.event&&!fullRoom,geometryKey,alt:s.beat,source:s.source,prompt:s.promptFile,storyBeat:s.beat,...custom};
  report.push({id:s.id,source:s.source,asset:s.asset,prompt:s.promptFile,visibleCast:s.visibleCast,paintedCast:s.paintedCast,groupException:s.groupException,sourceWidth:meta.width,sourceHeight:meta.height,width:encoded.width,height:encoded.height,bytes:encoded.size,generation:'single-image',references:s.references});
  const n=report.length-1,w=400,h=300,gap=56;
  contacts.push({input:await sharp(file).resize(w,h,{fit:'contain',background:'#080d12'}).png().toBuffer(),left:n%3*w,top:Math.floor(n/3)*(h+gap)});
  const escape=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  contacts.push({input:Buffer.from(`<svg width="400" height="56"><rect width="400" height="56" fill="#080d12"/><text x="7" y="19" fill="#e6c78c" font-size="12" font-family="sans-serif">${escape(s.id)}</text><text x="7" y="36" fill="white" font-size="10" font-family="sans-serif">cast: ${escape(s.visibleCast.join(',')||'none')}</text><text x="7" y="50" fill="#99aac0" font-size="10" font-family="sans-serif">painted: ${escape(s.paintedCast.join(',')||'none')}</text></svg>`),left:n%3*w,top:Math.floor(n/3)*(h+gap)+h});
 }
 for(const [id,target]of Object.entries(alias))if(scenes[target])scenes[id]={...scenes[target],id,reuses:target,geometryKey:target};
 // The alias is a repaired image of the same physical painting, not a new shot.
 if(scenes['dining-loop3-portrait-reveal'])scenes['dining-loop3-portrait-reveal'].isEvent=false;
 const payload={version:4,eventPhaseBindings:plan.eventPhaseBindings||{},scenes};
 fs.writeFileSync(path.join(root,'js/data/moonlight-castle-story-art.js'),"'use strict';\n// Authored physical scene states; regenerated with scripts/build-moonlight-castle-horror.cjs.\nconst CASTLE_STORY_ART = "+JSON.stringify(payload,null,2)+';\n');
 fs.writeFileSync(path.join(root,folder,'plan.json'),JSON.stringify({version:4,frames:report,aliases:alias,eventPhaseBindings:plan.eventPhaseBindings||{},dialogueBindings:audit.dialogueBindings},null,2)+'\n');
 if(report.length)await sharp({create:{width:1200,height:Math.ceil(report.length/3)*356,channels:3,background:'#080d12'}}).composite(contacts).png().toFile(path.join(root,folder,'contact-sheet.png'));
 console.log(JSON.stringify({images:report.length,aliases:Object.keys(alias).length,bytes:report.reduce((n,s)=>n+s.bytes,0),partial}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
