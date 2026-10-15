const {chromium}=require('playwright');
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
let browser;
(async()=>{
  browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
  const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../moonlight-castle.html')).href);
  await page.click('#start-btn');
  const box=page.locator('#dialogue-box');
  await page.waitForTimeout(180);
  let text=await box.textContent();
  assert(text.length>0&&text.length<25,'Initial room narration is progressively revealed');
  assert(await box.evaluate(node=>node.classList.contains('typing')));
  const line='月光照着古堡的走廊，你听见远处传来熟悉的琴声，蜡烛仍在缓缓燃烧。';
  await page.evaluate(line=>{showText(line);window.castleTestStart=CastleClock.now();},line);
  await page.waitForTimeout(260);
  const sample=await page.evaluate(()=>({text:document.getElementById('dialogue-box').textContent,time:CastleClock.now()-window.castleTestStart,save:JSON.parse(localStorage.getItem(CastleSave.key))}));
  assert(Math.abs(Array.from(sample.text).length-Math.floor(sample.time/28))<=2,'Original 28ms character cadence is retained');
  assert.equal(sample.save.dialogue,line,'Autosave preserves the complete line during animation');
  assert.equal(sample.save.notes.at(-1).text,line,'History records the complete line once');
  assert.equal(sample.save.notes.filter(note=>note.text===line).length,1);
  await page.locator('.castle-dock [data-castle-drawer=music]').tap();
  await page.evaluate(line=>showText(line.repeat(3)),line);
  await page.click('#pause-btn');await page.waitForTimeout(50);
  const paused=await box.textContent();await page.waitForTimeout(250);
  assert.equal(await box.textContent(),paused,'Narration pauses with the game');
  await page.click('#resume-btn');await page.waitForTimeout(150);
  await page.locator('[aria-label="收起设置"]').tap();
  assert((await box.textContent()).length>paused.length,'Narration resumes without skipping to the end');
  // A new action replaces the pending line instead of interleaving two timers.
  await page.evaluate(()=>showText('<b>门后</b><br>🕯️有人。',true));
  await page.waitForTimeout(120);
  assert(!/\uD800(?![\uDC00-\uDFFF])|[\uD800-\uDBFF]$/.test(await box.textContent()),'Emoji are never split into surrogate halves');
  await page.waitForFunction(()=>!document.getElementById('dialogue-box').classList.contains('typing'));
  assert.equal(await box.textContent(),'门后\n🕯️有人。');
  assert.equal(await box.locator('b').count(),0,'Authored tags stay out of the dialogue DOM');
  assert(await box.evaluate(node=>node.classList.contains('horror')));
  await page.waitForTimeout(250);assert.equal(await box.textContent(),'门后\n🕯️有人。','Old animation cannot append stale text');
  // Real room navigation replaces narration as well.
  await page.evaluate(()=>{showText('上一段尚未讲完的文字'.repeat(8));G.doors.study=true;CastleUI.sync();});
  await page.locator('#scene-doors [data-exit=study]').tap();
  assert.equal(await page.evaluate(()=>G.currentRoom),'study');
  await page.waitForTimeout(250);
  const room=await page.evaluate(()=>({visible:document.getElementById('dialogue-box').textContent,saved:JSON.parse(localStorage.getItem(CastleSave.key))}));
  assert(room.visible.length>0&&room.visible.length<room.saved.dialogue.length);
  assert(room.saved.dialogue.startsWith(room.visible));
  await page.reload();await page.click('#continue-btn');
  assert.equal(await box.textContent(),room.saved.dialogue,'Refreshing a partial line restores its full text');
  assert(!(await box.evaluate(node=>node.classList.contains('typing'))));
  await page.evaluate(line=>showText(line),line);
  await page.waitForTimeout(100);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  await page.waitForTimeout(50);const background=await box.textContent();
  await page.waitForTimeout(180);assert.equal(await box.textContent(),background,'Background narration stays paused');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
  await page.waitForTimeout(100);assert.equal(await box.textContent(),background,'Returning waits for manual resume');
  await page.click('#resume-btn');
  await page.waitForFunction(()=>!document.getElementById('dialogue-box').classList.contains('typing'));
  assert.equal(await box.textContent(),line);
  // Text wraps, the typing cursor disappears, and the conversation footer toggles;
  // none of these may resize or move the scene and its authored hit areas.
  for(const [width,height] of [[1440,1000],[844,390],[568,320],[390,844],[320,568]]){
    await page.setViewportSize({width,height});
    await page.evaluate(()=>{G.currentRoom='hall';CastleUI.action('npc','siyang');CastleDialogue.finish();});
    await page.waitForFunction(()=>document.getElementById('room-art').complete);
    await page.waitForTimeout(650);
    const samples=await page.evaluate(async()=>{
      const rects=()=>['scene-area','room-art','scene-hotspots','scene-doors','people-tray'].map(id=>{
        const r=document.getElementById(id).getBoundingClientRect();return [r.x,r.y,r.width,r.height];
      });
      const sizes=[rects()];
      showText('月光。\n'+('窗外的月光照亮走廊，远处的琴声一遍又一遍响起。\n').repeat(7));
      for(let i=0;i<24;i++){await new Promise(resolve=>setTimeout(resolve,60));sizes.push(rects());}
      CastleDialogue.finish();await new Promise(resolve=>setTimeout(resolve,60));sizes.push(rects());
      const box=document.getElementById('dialogue-box'),overflow=box.scrollHeight>box.clientHeight;
      box.scrollTop=box.scrollHeight;await new Promise(resolve=>setTimeout(resolve,60));sizes.push(rects());
      const scrolled=box.scrollTop>0;
      CastleUI.action('examine','candle');CastleDialogue.finish();
      await new Promise(resolve=>setTimeout(resolve,60));sizes.push(rects());
      return {sizes,overflow,scrolled};
    });
    assert(samples.overflow&&samples.scrolled,'Long text stays fully readable in its scroll area at '+width);
    for(const sample of samples.sizes)for(let i=0;i<sample.length;i++)for(let j=0;j<4;j++){
      assert(Math.abs(sample[i][j]-samples.sizes[0][i][j])<1,'Typing/scrolling/footer must not move scene geometry at '+width+' target '+i+' dimension '+j);
    }
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: 28ms typewriter, history/save, pause/background, room travel, plain text/emoji, refresh; scene geometry stays fixed through wrapping, completion, scrolling and footer changes in five viewports.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();});
