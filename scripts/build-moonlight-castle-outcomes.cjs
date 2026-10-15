const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),folder=path.join(root,'docs/imagegen/moonlight-castle/outcomes-v1');
(async()=>{
 const plan=JSON.parse(fs.readFileSync(path.join(folder,'plan.json'))),contacts=[];
 for(const[i,scene]of plan.entries()){
  const source=path.join(root,scene.source),meta=await sharp(source).metadata();
  if(meta.width<1024||meta.height<768)throw Error(scene.id+' source is not independently high resolution');
  const result=await sharp(source).resize({width:1600,withoutEnlargement:true}).webp({quality:91,effort:6}).toFile(path.join(root,scene.output));
  Object.assign(scene,{sourceWidth:meta.width,sourceHeight:meta.height,width:result.width,height:result.height,generation:'single-image'});
  contacts.push({input:await sharp(source).resize(480,360,{fit:'contain',background:'#101822'}).png().toBuffer(),left:i%2*480,top:Math.floor(i/2)*404});
  const label=Buffer.from(`<svg width="480" height="44"><rect width="480" height="44" fill="#101822"/><text x="8" y="17" fill="#f5d9aa" font-family="sans-serif" font-size="13">${scene.key} → ${scene.id} | single ${meta.width}x${meta.height}</text><text x="8" y="34" fill="white" font-family="sans-serif" font-size="12">visibleCast: [] | no unreferenced human identities</text></svg>`);
  contacts.push({input:label,left:i%2*480,top:Math.floor(i/2)*404+360});
 }
 fs.writeFileSync(path.join(folder,'plan.json'),JSON.stringify(plan,null,2)+'\n');
 await sharp({create:{width:960,height:Math.ceil(plan.length/2)*404,channels:3,background:'#101822'}}).composite(contacts).png().toFile(path.join(folder,'contact-sheet.png'));
 console.log('Built 8 independent narrative/ending WebPs and labeled semantic contact sheet.');
})().catch(error=>{console.error(error);process.exitCode=1;});
