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
async function clickObject(page,id){
  const overview=page.locator('#scene-overview');
  if(await overview.isVisible()&&await overview.getAttribute('aria-pressed')==='false')await overview.click();
  const target=page.locator('#scene-hotspots [data-examine="'+id+'"]');
  const point=await target.evaluate(visibleControlPoint);
  if(!point)throw Error('No visible physical click area for '+id);
  const touch=await page.evaluate(()=>matchMedia('(pointer:coarse)').matches);
  if(touch)await page.touchscreen.tap(point.x,point.y);else await page.mouse.click(point.x,point.y);
}
module.exports={visibleControlPoint,installControlPoint,clickObject};
