const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'assets/moonlight-castle');
const atlases = {
  'environments-v1': ['exterior', 'hall', 'dining', 'study', 'music', 'bedroom', 'cellar', 'tower'],
  'cast-v1': ['hall-conversation', 'dining-isabella', 'dining-witnesses', 'study-conversation', 'music-cecil', 'bedroom-conversation', 'cellar-selene', 'dawn-requiem']
};
const casts = [['yeshiyang','tim'],['bingbing'],['baoshi','feihong'],['dijie','qiqi'],['jerry'],['shiyuan'],['lala'],[]];
(async () => {
  const plan = [], contacts = [];
  for (const [atlas, ids] of Object.entries(atlases)) {
    const source = path.join(dir, 'source', atlas + '.png');
    const meta = await sharp(source).metadata(), width = Math.floor(meta.width / 2), height = Math.floor(meta.height / 4);
    for (let i = 0; i < ids.length; i++) {
      // The cast atlas has authored separators at these exact source rows.
      const rows = atlas === 'cast-v1' ? [0,365,724,1089,1536] : [0,height,height*2,height*3,meta.height];
      const row = Math.floor(i/2);
      const ends = atlas === 'cast-v1' ? [363,721,1087,1536] : rows.slice(1);
      const rect = {left: i % 2 * width, top: rows[row], width, height:ends[row]-rows[row]};
      // Inner 2px remove the generated contact-sheet separators without changing semantics.
      const extract = {left:rect.left + 2,top:rect.top + 2,width:width-4,height:rect.height-4};
      await sharp(source).extract(extract).resize(960,720).webp({quality:84}).toFile(path.join(dir, ids[i] + '.webp'));
      const visibleCast = atlas === 'cast-v1' ? casts[i] : [];
      plan.push({id:ids[i],source:'assets/moonlight-castle/source/'+atlas+'.png',cell:i+1,rect:extract,visibleCast,output:'assets/moonlight-castle/'+ids[i]+'.webp',width:960,height:720});
      const tile = await sharp(source).extract(extract).resize(400,300).png().toBuffer();
      const index = plan.length - 1;
      contacts.push({input:tile,left:index%4*400,top:Math.floor(index/4)*336});
      const label=Buffer.from(`<svg width="400" height="36"><rect width="400" height="36" fill="#101822"/><text x="8" y="15" fill="#f5d9aa" font-family="sans-serif" font-size="12">${ids[i]} | ${atlas} #${i+1}</text><text x="8" y="30" fill="white" font-family="sans-serif" font-size="11">cast: ${visibleCast.join(', ')||'empty'}</text></svg>`);
      contacts.push({input:label,left:index%4*400,top:Math.floor(index/4)*336+300});
    }
  }
  fs.writeFileSync(path.join(root,'docs/imagegen/moonlight-castle/plan.json'),JSON.stringify(plan,null,2)+'\n');
  await sharp({create:{width:1600,height:1344,channels:3,background:'#101822'}}).composite(contacts).png().toFile(path.join(root,'docs/imagegen/moonlight-castle/contact-sheet.png'));
  console.log('Built 16 WebP scenes and labeled continuity contact sheet.');
})();
