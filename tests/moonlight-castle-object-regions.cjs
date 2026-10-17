const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {clickObject}=require('./helpers/castle-objects.cjs');
// The production art owns newly audited outlines. Probe a spread of points on
// every surface with an independent point-in-polygon calculation, then compare
// the browser's actual clipping/stacking and transformed hit target. Portraits,
// tabletop props and new collapsed furniture no longer use old image coordinates.
const rooms=['hall','dining','study','music','bedroom','cellar','tower'];
let browser;
(async()=>{
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve(__dirname,'../moonlight-castle.html')).href);await page.click('#start-btn');
 const failures=[];
 for(const [width,height] of [[1440,1000],[844,390],[390,844],[320,568]]){
  await page.setViewportSize({width,height});
  for(const room of rooms){
   await page.evaluate(room=>{closeModal();G.currentRoom=room;G.loop=1;G.moveCount=0;G.sunrise=false;G.adrianChasing=false;CastleUI.sync();},room);
   await page.waitForFunction(()=>{const i=document.getElementById('room-art');return i.complete&&i.naturalWidth>0;});
   if(width<=1000&&await page.locator('#scene-overview').getAttribute('aria-pressed')==='false')await page.click('#scene-overview');
   const result=await page.evaluate(()=>{
    const plane=document.getElementById('scene-hotspots').getBoundingClientRect(),regions=CastleSceneArt.resolve(G).objectRegions;
    const inside=(x,y,points)=>{let hit=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [xi,yi]=points[i],[xj,yj]=points[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)hit=!hit;}return hit;};
    const hits=[],coverage={};
    for(const [id,region]of Object.entries(regions)){
     const polygon=region.outline,left=Math.min(...polygon.map(p=>p[0])),right=Math.max(...polygon.map(p=>p[0])),top=Math.min(...polygon.map(p=>p[1])),bottom=Math.max(...polygon.map(p=>p[1]));coverage[id]=0;
     for(let row=1;row<8;row++)for(let col=1;col<8;col++){
      const x=left+(right-left)*col/8,y=top+(bottom-top)*row/8;if(!inside(x,y,polygon))continue;
      const topRegion=Object.entries(regions).filter(([,r])=>inside(x,y,r.outline)).sort((a,b)=>(b[1].layer||1)-(a[1].layer||1))[0][0];
      const button=document.elementFromPoint(plane.x+plane.width*x/100,plane.y+plane.height*y/100)?.closest('button');
      if(button?.dataset.npc||button?.dataset.exit)continue;
      const actual=button?.dataset.examine;hits.push({id:topRegion,x,y,actual});if(actual===id)coverage[id]++;
     }
    }
    const clean=[...document.querySelectorAll('#scene-hotspots button')].every(n=>{const s=getComputedStyle(n);return n.childElementCount===0&&n.textContent===''&&s.backgroundColor==='rgba(0, 0, 0, 0)'&&s.boxShadow==='none'&&s.transform==='none'&&s.animationName==='none';});
    return {hits,coverage,clean,ids:[...document.querySelectorAll('#scene-hotspots button')].map(n=>n.dataset.examine),expected:CASTLE_ROOMS[G.currentRoom].targets.map(t=>t[0]),regions:Object.keys(regions)};
   });
   assert(result.clean,'Objects have no permanent dots, labels, background or animation');
   assert.deepEqual(result.ids.sort(),result.expected.sort());assert.deepEqual(result.ids.sort(),result.regions.sort());
   for(const [id,count]of Object.entries(result.coverage))assert(count>=1,room+' '+width+' '+id+' retains an exposed physical surface');
   for(const point of result.hits)if(point.id!==point.actual)failures.push({room,width,...point});
   if((width===390||width===1440)&&['hall','dining','cellar'].includes(room))await page.screenshot({path:'/tmp/hjm-castle-object-regions-'+room+'-'+width+'.png'});
  }
 }
 assert.deepEqual(failures,[],'Visible object surfaces, not just their former marker centres, receive input');
 assert.equal(await page.locator('#reveal-btn,#scene-hotspots i,#scene-hotspots span,#object-tray').count(),0,'No marker toggle or object answer list');
 // Sunrise has its own organ composition and remains investigable.
 await page.evaluate(()=>{G.currentRoom='tower';G.sunrise=true;CastleUI.sync();});
 if(await page.locator('#scene-overview').getAttribute('aria-pressed')==='false')await page.click('#scene-overview');
 await clickObject(page,'organ');await page.evaluate(()=>{closeModal();CastleUI.sync();});
 // Choose blank masonry using the browser's complete visible hit stack, then
 // verify an actual tap does not activate an object behind the background.
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>{G.currentRoom='cellar';G.loop=1;G.sunrise=false;G.nextMorning=false;CastleSceneArt.resetSession();CastleUI.sync();window.examined=[];const original=examine;examine=id=>{window.examined.push(id);original(id);};});
 if(await page.locator('#scene-overview').getAttribute('aria-pressed')==='false')await page.click('#scene-overview');
 const blank=await page.evaluate(()=>{const area=document.getElementById('scene-area').getBoundingClientRect();for(let y=80;y<area.height-100;y+=20)for(let x=20;x<area.width-20;x+=20){const px=area.x+x,py=area.y+y,node=document.elementFromPoint(px,py);if(node&&!node.closest('button')&&['room-art','scene-area','scene-hotspots'].includes(node.id))return{x:px,y:py};}return null;});
 assert(blank,'The scene retains genuinely non-interactive scenery');await page.touchscreen.tap(blank.x,blank.y);assert.deepEqual(await page.evaluate(()=>window.examined),[]);
 // Real swipe begins on the rack, followed by pinch; neither may activate a prop.
 await page.click('#scene-overview');
 const cdp=await context.newCDPSession(page),start=await page.locator('#scene-hotspots [data-examine=wine]').evaluate(require('./helpers/castle-objects.cjs').visibleControlPoint);assert(start,'Wine rack can begin a drag');
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});
 for(let i=1;i<=4;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+20*i,y:start.y+8*i}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert.deepEqual(await page.evaluate(()=>window.examined),[],'Dragging an invisible object region does not investigate');
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:140,y:230},{id:2,x:240,y:230}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:110,y:215},{id:2,x:270,y:245}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(550);
 assert.deepEqual(await page.evaluate(()=>window.examined),[]);
 // At enlarged size, click a shelf surface away from the former marker.
 let q=await page.locator('#scene-hotspots [data-examine=wine]').evaluate(require('./helpers/castle-objects.cjs').visibleControlPoint);
 for(let i=0;i<6&&!q;i++){await page.click('#scene-pan-left');q=await page.locator('#scene-hotspots [data-examine=wine]').evaluate(require('./helpers/castle-objects.cjs').visibleControlPoint);}
 assert(q,'Zoomed and dragged wine rack has an exposed physical surface');await page.touchscreen.tap(q.x,q.y);assert.deepEqual(await page.evaluate(()=>window.examined),['wine'],'Scaled and translated rack still receives physical clicks');
 await page.evaluate(()=>{closeModal();G.currentRoom='dining';CastleUI.sync();});
 await clickObject(page,'musicbox');assert.equal(await page.evaluate(()=>window.examined.at(-1)),'musicbox','A real tap opens the box, not the table');
 assert(await page.locator('#modal-overlay.active').isVisible());
 assert.deepEqual(errors,[]);console.log('PASS: 18 object silhouettes in seven rooms and dawn; full object surfaces, small prop priority, no hints/click-through, desktop/mobile layouts, real scaled taps and touch drag/pinch isolation.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();});
