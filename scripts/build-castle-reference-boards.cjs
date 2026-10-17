// Mechanical reference contact sheets only. Never generate, retouch or morph
// the official card faces; Index/Image models consume these as identity refs.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const root=path.resolve(__dirname,'..');
const destination='docs/imagegen/moonlight-castle/horror-v4/references';
const groups=[
 {id:'cast-a',cast:[
  {id:'yeshiyang',name:'叶思阳 / Sebastian',source:'assets/characters/yeshiyang-black-full-2026-10.webp'},
  {id:'tim',name:'Tim',source:'assets/characters/tim-full-2026-10.webp'},
  {id:'baoshi',name:'宝石 / Baoshi',source:'assets/characters/baoshi-full-2026-10.webp'},
  {id:'feihong',name:'飞鸿 / Feihong',source:'assets/characters/feihong-full-2026-10.webp'},
  {id:'bingbing',name:'冰冰 / Isabella',source:'assets/characters/bingbing-full-2026-10.webp'}
 ]},
 {id:'cast-b',cast:[
  {id:'dijie',name:'笛杰 / Mr Lin',source:'assets/dijie-portrait-v2.webp'},
  {id:'jerry',name:'Jerry / Cecil',source:'assets/jerry-portrait.webp'},
  {id:'qiqi',name:'柒柒 / Vivian',source:'assets/qiqi-portrait.webp'},
  {id:'shiyuan',name:'十元 / Shiyuan',source:'assets/shiyuan-portrait-v2.webp'},
  {id:'lala',name:'垃垃 / Selene',source:'assets/characters/lala-full-2026-10.webp'}
 ]}
];
const panel={width:480,imageHeight:560,labelHeight:58,gap:8};
// These three full cards show a more distant figure. Narrow their crop window
// mechanically to match the other head sizes while retaining hair and chin.
const cropOverrides={
 yeshiyang:{left:250,top:20,width:600,height:700},
 jerry:{left:280,top:0,width:500,height:620},
 lala:{left:250,top:0,width:650,height:760}
};
const escape=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
async function build(){
 fs.mkdirSync(path.join(root,destination),{recursive:true});
 const manifest={version:1,purpose:'10 official identities split across two Image2 reference files; card outfits are not castle costume instructions',method:'sharp extract + proportional resize/contain + composite; no AI editing, face restoration, smoothing, recoloring or morphing',generatedAt:'2026-10-17',boards:[]};
 for(const group of groups){
  const width=group.cast.length*panel.width+(group.cast.length-1)*panel.gap,height=panel.imageHeight+panel.labelHeight,layers=[],slots=[];
  for(const [index,character]of group.cast.entries()){
   const file=path.join(root,character.source),metadata=await sharp(file).metadata();
   if(!metadata.width||!metadata.height)throw Error('Unreadable official reference: '+character.id);
   // Retain the upper 58% and central 75% of the original full card. All ten
   // sources place the complete head inside this explicitly recorded window.
   const cropWidth=Math.floor(metadata.width*.75),cropHeight=Math.floor(metadata.height*.58);
   const crop=cropOverrides[character.id]||{left:Math.floor((metadata.width-cropWidth)/2),top:0,width:cropWidth,height:cropHeight};
   const image=await sharp(file).extract(crop).resize(panel.width,panel.imageHeight,{fit:'contain',background:'#080d12',kernel:'lanczos3'}).png().toBuffer();
   const left=index*(panel.width+panel.gap),top=0;
   layers.push({input:image,left,top});
   const label=Buffer.from('<svg width="'+panel.width+'" height="'+panel.labelHeight+'"><rect width="100%" height="100%" fill="#101925"/><text x="14" y="23" fill="#f2d8a3" font-size="19" font-family="sans-serif">'+escape(character.name)+'</text><text x="14" y="45" fill="#a5b2c2" font-size="14" font-family="sans-serif">'+escape(character.id)+' · IDENTITY ONLY</text></svg>');
   layers.push({input:label,left,top:panel.imageHeight});
   slots.push({...character,sourceWidth:metadata.width,sourceHeight:metadata.height,sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),crop,slot:{left,top,width:panel.width,height:panel.imageHeight},label:{left,top:panel.imageHeight,width:panel.width,height:panel.labelHeight},transform:'crop, uniform proportional scale, letterbox; source RGB untouched'});
  }
  const output=destination+'/'+group.id+'.png';
  await sharp({create:{width,height,channels:3,background:'#080d12'}}).composite(layers).png({compressionLevel:9}).toFile(path.join(root,output));
  manifest.boards.push({id:group.id,output,width,height,slots});
 }
 fs.writeFileSync(path.join(root,destination,'reference-boards.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log(JSON.stringify(manifest.boards.map(board=>({id:board.id,output:board.output,cast:board.slots.map(slot=>slot.id),width:board.width,height:board.height})),null,2));
}
build().catch(error=>{console.error(error);process.exitCode=1;});
