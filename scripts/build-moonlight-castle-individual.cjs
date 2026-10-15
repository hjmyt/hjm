const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),folder=path.join(root,'docs/imagegen/moonlight-castle/individual-v3');
const context={};vm.runInNewContext(fs.readFileSync(path.join(root,'js/data/moonlight-castle.js'),'utf8')+';globalThis.art=CASTLE_ART;globalThis.costumes=CASTLE_COSTUMES;',context);
(async()=>{
  const plan=[],contacts=[];
  for(const [i,room]of ['hall','dining','study','music','bedroom','cellar','tower','dawn','exterior'].entries()){
    const id=room+'-exploration-v3',source='assets/moonlight-castle/source/individual-v3/'+room+'.png',file=path.join(root,source);
    const meta=await sharp(file).metadata(),output='assets/moonlight-castle/'+id+'.webp';
    if(meta.width<1024||meta.height<768)throw Error('Individual source too small: '+room);
    // Encode the original single image. Never upscale an atlas crop or crop a face.
    const result=await sharp(file).resize({width:1600,withoutEnlargement:true}).webp({quality:91,effort:6}).toFile(path.join(root,output));
    const authored=context.art[id]||{visibleCast:[],positions:[]};
    plan.push({id,room,source,output,width:result.width,height:result.height,sourceWidth:meta.width,sourceHeight:meta.height,visibleCast:authored.visibleCast,groupException:authored.groupException||null,positions:authored.positions,costumes:Object.fromEntries(authored.visibleCast.map(id=>[id,context.costumes[id]])),prompt:'docs/imagegen/moonlight-castle/individual-v3/'+room+'-prompt.txt',generation:'single-image',referenceBoard:authored.visibleCast.length?'docs/imagegen/moonlight-castle/individual-v3/'+room+'-references.png':null});
    contacts.push({input:await sharp(file).resize(480,360,{fit:'contain',background:'#101822'}).png().toBuffer(),left:i%2*480,top:Math.floor(i/2)*404});
    const label=Buffer.from(`<svg width="480" height="44"><rect width="480" height="44" fill="#101822"/><text x="8" y="16" fill="#f5d9aa" font-family="sans-serif" font-size="13">${id} | single ${meta.width}x${meta.height}</text><text x="8" y="34" fill="white" font-family="sans-serif" font-size="12">visibleCast: ${authored.visibleCast.join(', ')||'empty'}</text></svg>`);
    contacts.push({input:label,left:i%2*480,top:Math.floor(i/2)*404+360});
  }
  fs.writeFileSync(path.join(folder,'plan.json'),JSON.stringify(plan,null,2)+'\n');
  await sharp({create:{width:960,height:Math.ceil(plan.length/2)*404,channels:3,background:'#101822'}}).composite(contacts).png().toFile(path.join(folder,'contact-sheet.png'));
  console.log('Built 9 independent high-resolution WebPs with source/semantic/costume mapping.');
})().catch(error=>{console.error(error);process.exitCode=1;});
