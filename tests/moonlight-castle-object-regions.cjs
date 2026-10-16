const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {clickObject}=require('./helpers/castle-objects.cjs');
// Independently selected points on the drawn objects, including their extremities.
// Music box points intentionally overlap the table's broad outline.
const samples={
 hall:{piano:[[16,56],[26,48],[29,64]],armor:[[92,35],[94,63],[95,70]],tapestry:[[43,6],[62,17],[53,27]],candle:[[7,51],[8,63]]},
 dining:{table:[[9,60],[28,73],[74,73]],portrait_dining:[[32,16],[35,25]],musicbox:[[44,66],[53,68],[49,72]],mirror:[[93,15],[96,38]]},
 study:{bookshelf:[[22,13],[26,43],[57,6]],flute_stand:[[10,60],[25,80]],globe:[[87,43],[95,53],[89,66]]},
 music:{harpsichord:[[83,38],[69,56],[86,82]],violin_case:[[7,55],[23,61]]},
 bedroom:{bed:[[35,12],[26,51],[42,61]],dresser:[[94,28],[85,52],[98,68]]},
 cellar:{wine:[[34,25],[35,53],[64,25],[69,40]]},
 tower:{organ:[[36,11],[23,35],[39,59],[16,72]]}
};
let browser;
(async()=>{
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve(__dirname,'../moonlight-castle.html')).href);await page.click('#start-btn');
 const failures=[];
 for(const [width,height] of [[1440,1000],[844,390],[390,844],[320,568]]){
  await page.setViewportSize({width,height});
  for(const room of Object.keys(samples)){
   await page.evaluate(room=>{closeModal();G.currentRoom=room;G.loop=1;G.moveCount=0;G.sunrise=false;G.adrianChasing=false;CastleUI.sync();},room);
   await page.waitForFunction(()=>{const i=document.getElementById('room-art');return i.complete&&i.naturalWidth>0;});
   if(width<=1000&&await page.locator('#scene-overview').getAttribute('aria-pressed')==='false')await page.click('#scene-overview');
   const result=await page.evaluate(samples=>{
    const plane=document.getElementById('scene-hotspots').getBoundingClientRect();
    const hits=Object.entries(samples).flatMap(([id,points])=>points.map(([x,y])=>({id,x,y,actual:document.elementFromPoint(plane.x+plane.width*x/100,plane.y+plane.height*y/100)?.closest('button')?.dataset.examine})));
    const clean=[...document.querySelectorAll('#scene-hotspots button')].every(n=>{const s=getComputedStyle(n);return n.childElementCount===0&&n.textContent===''&&s.backgroundColor==='rgba(0, 0, 0, 0)'&&s.boxShadow==='none'&&s.transform==='none'&&s.animationName==='none';});
    return {hits,clean,ids:[...document.querySelectorAll('#scene-hotspots button')].map(n=>n.dataset.examine),expected:CASTLE_ROOMS[G.currentRoom].targets.map(t=>t[0]),regions:Object.keys(CASTLE_OBJECT_REGIONS[document.getElementById('room-art').src.split('/').pop().split('.')[0]])};
   },samples[room]);
   assert(result.clean,'Objects have no permanent dots, labels, background or animation');
   assert.deepEqual(result.ids.sort(),result.expected.sort());assert.deepEqual(result.ids.sort(),result.regions.sort());
   for(const point of result.hits)if(point.id!==point.actual)failures.push({room,width,...point});
   if((width===390||width===1440)&&['hall','dining','cellar'].includes(room))await page.screenshot({path:'/tmp/hjm-castle-object-regions-'+room+'-'+width+'.png'});
  }
 }
 assert.deepEqual(failures,[],'Visible object surfaces, not just their former marker centres, receive input');
 assert.equal(await page.locator('#reveal-btn,#scene-hotspots i,#scene-hotspots span,#object-tray').count(),0,'No marker toggle or object answer list');
 // Sunrise has its own organ composition and remains investigable.
 await page.evaluate(()=>{G.currentRoom='tower';G.sunrise=true;CastleUI.sync();});
 if(await page.locator('#scene-overview').getAttribute('aria-pressed')==='false')await page.click('#scene-overview');
 assert.equal(await page.evaluate(()=>{const p=document.getElementById('scene-hotspots').getBoundingClientRect();return document.elementFromPoint(p.x+p.width*.39,p.y+p.height*.59)?.dataset.examine;}),'organ');
 // Blank masonry and the character in front of the wine rack do not investigate it.
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>{G.currentRoom='cellar';G.sunrise=false;CastleUI.sync();window.examined=[];const original=examine;examine=id=>{window.examined.push(id);original(id);};});
 if(await page.locator('#scene-overview').getAttribute('aria-pressed')==='false')await page.click('#scene-overview');
 const point=async(x,y)=>page.locator('#scene-hotspots').evaluate((n,{x,y})=>{const r=n.getBoundingClientRect();return{x:r.x+r.width*x/100,y:r.y+r.height*y/100};},{x,y});
 for(const p of [[22,28],[51,34],[81,85]]){const q=await point(...p);await page.touchscreen.tap(q.x,q.y);}
 assert.deepEqual(await page.evaluate(()=>window.examined),[],'No click-through on characters or unrelated scenery');
 // Real swipe begins on the rack, followed by pinch; neither may activate a prop.
 await page.click('#scene-overview');
 const cdp=await context.newCDPSession(page),start=await point(35,39);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});
 for(let i=1;i<=4;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+20*i,y:start.y+8*i}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert.deepEqual(await page.evaluate(()=>window.examined),[],'Dragging an invisible object region does not investigate');
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:140,y:230},{id:2,x:240,y:230}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:110,y:215},{id:2,x:270,y:245}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(550);
 assert.deepEqual(await page.evaluate(()=>window.examined),[]);
 // At enlarged size, click a shelf surface away from the former marker.
 let q=await point(65,27);
 for(let i=0;i<6&&(q.x<20||q.x>370);i++){await page.click(q.x>370?'#scene-pan-right':'#scene-pan-left');q=await point(65,27);}
 await page.touchscreen.tap(q.x,q.y);assert.deepEqual(await page.evaluate(()=>window.examined),['wine'],'Scaled and translated rack still receives the exact physical click');
 await page.evaluate(()=>{closeModal();G.currentRoom='dining';CastleUI.sync();});
 await clickObject(page,'musicbox');assert.equal(await page.evaluate(()=>window.examined.at(-1)),'musicbox','A real tap opens the box, not the table');
 assert(await page.locator('#modal-overlay.active').isVisible());
 assert.deepEqual(errors,[]);console.log('PASS: 18 object silhouettes in seven rooms and dawn; full object surfaces, small prop priority, no hints/click-through, desktop/mobile layouts, real scaled taps and touch drag/pinch isolation.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();});
