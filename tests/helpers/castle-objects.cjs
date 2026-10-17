// Search only the actual browser hit area, including CSS polygon clipping and
// overlapping foreground objects. Never dispatch a synthetic investigation.
function visibleControlPoint(node){
  const r=node.getBoundingClientRect();
  const candidates=[[.5,.5]];
  if(node.classList.contains('object-region'))for(let y=1;y<12;y++)for(let x=1;x<12;x++)candidates.push([x/12,y/12]);
  for(const [u,v] of candidates){
    const x=r.x+r.width*u,y=r.y+r.height*v;
    if(document.elementFromPoint(x,y)?.closest('button')===node)return{x,y};
  }
  return null;
}
async function installControlPoint(page){await page.addInitScript({content:'window.castleControlPoint='+visibleControlPoint.toString()});}
async function returnToExploration(page){
 const back=page.locator('#scene-return');if(await back.isVisible())await back.click();
 await page.waitForFunction(()=>{const image=document.getElementById('room-art');return image.complete&&image.naturalWidth>0;});
}
async function clickObject(page,id){
  await returnToExploration(page);
  const overview=page.locator('#scene-overview');
  if(await overview.isVisible()&&await overview.getAttribute('aria-pressed')==='false')await overview.click();
  const target=page.locator('#scene-hotspots [data-examine="'+id+'"]');
  const point=await target.evaluate(visibleControlPoint);
  if(!point)throw Error('No visible physical click area for '+id);
  const touch=await page.evaluate(()=>matchMedia('(pointer:coarse)').matches);
  if(touch)await page.touchscreen.tap(point.x,point.y);else await page.mouse.click(point.x,point.y);
}
async function speakNpc(page,id){
 const physical=page.locator('#people-tray [data-npc="'+id+'"]');
 if(await physical.count()){await physical.click();return;}
 const control=page.locator('.castle-dock [data-castle-drawer=explore]');
 if(await control.getAttribute('aria-expanded')!=='true')await control.click();
 await page.locator('#explore-people [data-npc="'+id+'"]').click();
}
module.exports={visibleControlPoint,installControlPoint,clickObject,returnToExploration,speakNpc};
