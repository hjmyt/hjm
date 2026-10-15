const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
let browser;
(async()=>{
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto(pathToFileURL(path.resolve(__dirname,'../moonlight-castle.html')).href);await page.click('#start-btn');
 await page.waitForTimeout(650);
 const geometry=()=>page.evaluate(()=>{
  const rect=id=>document.getElementById(id).getBoundingClientRect().toJSON(),image=document.getElementById('room-art');
  return {image:rect('room-art'),targets:rect('scene-hotspots'),doors:rect('scene-doors'),people:document.querySelector('.people-panel').getBoundingClientRect().toJSON(),dialogue:document.querySelector('.dialogue-panel').getBoundingClientRect().toJSON(),ratio:image.naturalWidth/image.naturalHeight,notes:CastleUI.snapshot.notes.length,pan:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--castle-pan-x')),panY:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--castle-pan-y'))};
 });
 const initial=await geometry();assert(Math.abs(initial.image.width/initial.image.height-initial.ratio)<.001);
 assert(initial.image.width>390&&initial.image.height>450,'Large portrait image preserves its natural proportions');
 assert(initial.image.y<=initial.dialogue.y&&initial.image.bottom>=initial.dialogue.bottom,'Subtitles overlay the actual image');
 // A real touch swipe beginning on a character must pan all planes, not talk.
 const npc=await page.locator('#npc-siyang').boundingBox(),start={x:npc.x+npc.width/2,y:npc.y+npc.height/2};
 const cdp=await context.newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});
 for(let i=1;i<=5;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+i*20,y:start.y-i*12}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(100);
 const moved=await geometry();assert(moved.pan>60,'Touch swipe actually pans');assert.equal(moved.notes,initial.notes,'Dragging across a character never triggers dialogue');
 for(const plane of ['image','targets','doors','people'])assert(Math.abs((moved[plane].x-initial[plane].x)-moved.pan)<1,plane+' follows the exact same pan');
 assert(moved.panY < -40,'Vertical dragging actually moves the scene');
 for(const plane of ['image','targets','doors','people'])assert(Math.abs((moved[plane].y-initial[plane].y)-moved.panY)<1,plane+' follows the exact vertical pan');
 await page.waitForTimeout(1100);assert.equal((await geometry()).pan,moved.pan,'Routine redraw preserves the view');
 await page.locator('#npc-siyang').tap();assert((await page.locator('#speaker-name').textContent()).includes('执事'),'Stationary tap still talks');
 const beforePinch=await geometry();
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:140,y:230},{id:2,x:240,y:230}]});
 for(let i=1;i<=5;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:140-i*6,y:230},{id:2,x:240+i*6,y:230}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 const pinched=await geometry();assert(pinched.image.width>beforePinch.image.width*1.4,'Real two-finger pinch enlarges the image');
 assert(Math.abs(pinched.image.width/pinched.image.height-pinched.ratio)<.001,'Pinch never distorts characters');
 assert.equal(pinched.notes,beforePinch.notes,'Pinching never triggers dialogue or investigation');
 await page.click('#scene-zoom-out');assert((await geometry()).image.width<pinched.image.width,'Zoom out button works');
 await page.click('#scene-zoom-in');assert((await geometry()).image.width>pinched.image.width*.95,'Zoom in button works');
 await page.click('#scene-overview');await page.click('#scene-overview');
 // Each authored control must be physically reachable at the centre or edges.
 for(const [width,height] of [[390,844],[320,568]]){
  await page.setViewportSize({width,height});
  for(const room of ['hall','dining','study','music','bedroom','cellar','tower']){
   await page.evaluate(room=>{G.currentRoom=room;CastleUI.sync();},room);await page.waitForTimeout(80);
   const reachable=new Set();
   const sample=async()=>{
    for(const id of await page.evaluate(()=>[...document.querySelectorAll('#scene-hotspots button,#people-tray button,#scene-doors button')].flatMap((node,i)=>{const r=node.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return document.elementFromPoint(x,y)?.closest('button')===node?[i]:[];})))reachable.add(id);
   };
   const scan=async()=>{const from=height*.55,to=Math.max(100,height*.15);await sample();await page.mouse.move(width/2,from);await page.mouse.down();await page.mouse.move(width/2,to,{steps:4});await page.mouse.up();await sample();await page.mouse.move(width/2,to);await page.mouse.down();await page.mouse.move(width/2,from,{steps:4});await page.mouse.up();await sample();};
   for(let i=0;i<8&&!await page.locator('#scene-pan-left').isDisabled();i++)await page.click('#scene-pan-left');await scan();
   for(let i=0;i<8&&!await page.locator('#scene-pan-right').isDisabled();i++){await page.click('#scene-pan-right');await scan();}
   const labels=await page.locator('#scene-hotspots button,#people-tray button,#scene-doors button').allTextContents();assert.deepEqual(labels.filter((label,i)=>!reachable.has(i)),[],room+' all controls reachable by panning at '+width);
  }
 }
 await page.click('#scene-overview');assert(await page.locator('#scene-pan-left').isDisabled()&&await page.locator('#scene-pan-right').isDisabled());
 const overview=await geometry();assert(overview.image.width<=320&&Math.abs(overview.image.width/overview.image.height-overview.ratio)<.001,'Overview retains the entire undistorted composition');
 await page.setViewportSize({width:844,height:390});await page.waitForTimeout(80);
 assert(await page.locator('#scene-pan-controls').isVisible(),'Landscape retains camera controls');
 await page.setViewportSize({width:1440,height:1000});await page.waitForTimeout(80);
 assert(!await page.locator('#scene-pan-controls').isVisible());assert.equal(await page.locator('.main-column > .people-panel').count(),1,'Desktop restores the shared cast plane');
 assert.deepEqual(errors,[]);console.log('PASS: original proportions, subtitle overlay, actual 2D touch drag and pinch, zoom buttons, no accidental actions, four planes aligned, redraw stability, all room controls reachable, overview and desktop restoration.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();});
