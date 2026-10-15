const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),folder=path.join(root,'docs/imagegen/moonlight-castle/unified-v2');
const cells=[
  {room:'hall',visibleCast:['yeshiyang','tim']},
  {room:'dining',visibleCast:['bingbing','baoshi','feihong'],groupException:'同一餐厅内三位实际在场人物与可调查物品同时可见，按用户要求的统一探索场景显式设置群像例外'},
  {room:'study',visibleCast:['dijie','qiqi']},
  {room:'music',visibleCast:['jerry']},
  {room:'bedroom',visibleCast:['shiyuan']},
  {room:'cellar',visibleCast:['lala']},
  {room:'tower',visibleCast:[]},
  {room:'dawn',visibleCast:[]}
];
(async()=>{
  const source='assets/moonlight-castle/source/unified-v2.png',file=path.join(root,source),meta=await sharp(file).metadata();
  const width=meta.width/2,height=meta.height/4;
  if(!Number.isInteger(width)||!Number.isInteger(height))throw Error('Atlas must have a regular 2x4 grid');
  const plan=cells.map((cell,i)=>({...cell,id:cell.room+'-unified-v2',source,cell:i+1,rect:{left:i%2*width+2,top:Math.floor(i/2)*height+2,width:width-4,height:height-4},output:'assets/moonlight-castle/'+cell.room+'-unified-v2.webp',width:960,height:720}));
  // Labeled in reading order for continuity review before producing final crops.
  const contacts=[];
  for(const [i,cell]of plan.entries()){
    contacts.push({input:await sharp(file).extract(cell.rect).resize(480,360).png().toBuffer(),left:i%2*480,top:Math.floor(i/2)*402});
    const label=Buffer.from(`<svg width="480" height="42"><rect width="480" height="42" fill="#101822"/><text x="8" y="16" fill="#f5d9aa" font-family="sans-serif" font-size="13">${cell.id} | unified-v2 #${cell.cell}</text><text x="8" y="33" fill="white" font-family="sans-serif" font-size="12">visibleCast: ${cell.visibleCast.join(', ')||'empty'}</text></svg>`);
    contacts.push({input:label,left:i%2*480,top:Math.floor(i/2)*402+360});
  }
  await sharp({create:{width:960,height:1608,channels:3,background:'#101822'}}).composite(contacts).png().toFile(path.join(folder,'contact-sheet.png'));
  fs.writeFileSync(path.join(folder,'plan.json'),JSON.stringify(plan,null,2)+'\n');
  for(const cell of plan)await sharp(file).extract(cell.rect).resize(cell.width,cell.height).webp({quality:85}).toFile(path.join(root,cell.output));
  console.log('Built 8 unified scene WebPs, semantic plan and labeled contact sheet.');
})().catch(error=>{console.error(error);process.exitCode=1;});
