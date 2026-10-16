const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),doc=path.join(root,'docs/moonlight-castle/voices');
const plan=JSON.parse(fs.readFileSync(path.join(doc,'plan.json'))),report=JSON.parse(fs.readFileSync(path.join(doc,'audio-report.json')));
assert.equal(plan.version,2);assert.equal(Object.keys(plan.cast).length,12);assert(report.complete,'The emotional voice build must be complete before delivery');assert.deepEqual(report.missing,[]);
const scope={};vm.runInNewContext(fs.readFileSync(path.join(root,'js/data/moonlight-castle-voices.js'),'utf8')+';globalThis.lines=CASTLE_VOICE_LINES;',scope);
const entries=scope.lines,clips=new Map(plan.clips.map(clip=>[clip.id,clip]));
for(const clip of plan.clips){
 assert(clip.source.includes('/emotional-v2/'),'Flat pilot takes never enter the current build');
 assert(fs.existsSync(path.join(root,clip.source)));assert.equal(clip.emotionVector.length,8);assert(clip.emotionVector.every(value=>Number.isFinite(value)&&value>=0));
 for(const field of ['contextBefore','currentBeat','contextAfter','delivery','emotion'])assert(clip[field]?.length,clip.id+' '+field);
 assert(!/[<>]/.test(clip.text),'No HTML or stage directions in synthesized speech');
}
for(const line of plan.lines){
 if(!line.clips.length){assert(!entries[line.source]);continue;}
 const entry=entries[line.source];assert(entry,line.id+' is packaged');assert.equal(entry.id,line.id);assert(fs.existsSync(path.join(root,entry.asset)));assert(entry.duration>.25);assert(entry.asset.endsWith('.mp3'));
 const speakers=[...new Set(line.clips.map(id=>clips.get(id).speaker))];assert.deepEqual([...entry.speakers],speakers,line.id+' explicit speakers');
}
const line=id=>plan.lines.find(line=>line.id===id),emotion=id=>line(id).clips.map(id=>clips.get(id).emotion);
assert.deepEqual([...entries[line('talk.servants.1.0.text').source].speakers],['baoshi','feihong']);
assert(!line('talk.servants.4.3.text').clips.length,'The word dream in narration is not dialogue');
assert.deepEqual(emotion('talk.adrian.1.3.text'),['threat']);assert(emotion('talk.adrian.3.0.text').includes('choked'));assert.deepEqual(emotion('talk.adrian.4.0.text'),['relief']);
assert.deepEqual(emotion('talk.shiyuan.1.0.text'),['fear']);
assert(!line('ending.2').clips.some(id=>clips.get(id).speaker==='felix'),'Scripted silent lip movements are not invented audible dialogue');
let browser;
(async()=>{
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{
  const states=new WeakMap();window.castleVoiceEvents=[];
  function state(audio){if(!states.has(audio)){const s={paused:true,ended:false,time:0};states.set(audio,s);Object.defineProperties(audio,{paused:{get:()=>s.paused},ended:{get:()=>s.ended},currentTime:{get:()=>s.time,set:value=>s.time=value}});}return states.get(audio);}
  HTMLMediaElement.prototype.play=function(){const s=state(this);if(this.id==='castleVoice'&&window.failNextCastleVoice){window.failNextCastleVoice=false;return Promise.reject(new DOMException('Test autoplay rejection','NotAllowedError'));}s.paused=false;s.ended=false;if(this.id==='castleVoice')castleVoiceEvents.push({src:this.getAttribute('src'),volume:this.volume,time:this.currentTime});return Promise.resolve();};
  HTMLMediaElement.prototype.pause=function(){state(this).paused=true;};
  window.finishCastleVoice=audio=>{const s=state(audio);s.paused=true;s.ended=true;audio.dispatchEvent(new Event('ended'));};
 });
 const url=pathToFileURL(path.join(root,'moonlight-castle.html')).href;
 await page.goto(url);await page.click('#start-btn');assert.equal(await page.evaluate(()=>castleVoiceEvents.length),0,'Unvoiced narration never starts a character clip');
 await page.locator('#npc-siyang').click();
 await page.waitForFunction(()=>castleVoiceEvents.length===1);
 assert.equal(await page.evaluate(()=>castleVoiceEvents.at(-1).src),entries[line('name.siyang.ask').source].asset);
 await page.waitForTimeout(100);assert(Math.abs((await page.evaluate(()=>CastleAudio.audio.volume))-.08)<.015,'BGM ducks to 20% while the actor speaks');
 assert.equal(await page.evaluate(()=>CastleVoice.player.volume),.8,'Voice is clearly above the ducked BGM at the default mix');
 await page.evaluate(()=>CastleVoice.player.currentTime=1.25);
 await page.click('#pause-btn');assert(await page.evaluate(()=>CastleVoice.player.paused));
 await page.click('#resume-btn');assert.equal(await page.evaluate(()=>castleVoiceEvents.at(-1).time),1.25,'Resume continues the current utterance');
 const other=line('name.bingbing.ask');await page.evaluate(text=>showText(text),other.source);
 assert.equal(await page.evaluate(()=>castleVoiceEvents.at(-1).src),entries[other.source].asset);assert.equal(await page.evaluate(()=>castleVoiceEvents.at(-1).time),0,'New dialogue replaces rather than overlaps');
 await page.click('#castle-voice-replay');assert.equal(await page.evaluate(()=>castleVoiceEvents.at(-1).time),0);
 const count=await page.evaluate(()=>castleVoiceEvents.length);await page.evaluate(()=>CastleUI.sync());assert.equal(await page.evaluate(()=>castleVoiceEvents.length),count,'Redraw never replays speech');
 await page.evaluate(()=>finishCastleVoice(CastleVoice.player));await page.waitForTimeout(300);assert(Math.abs((await page.evaluate(()=>CastleAudio.audio.volume))-.4)<.015,'BGM returns after speech');
 await page.evaluate(text=>{window.failNextCastleVoice=true;showText(text);},other.source);
 await page.waitForFunction(()=>document.getElementById('castle-voice-replay').textContent.includes('重试'));
 assert(Math.abs((await page.evaluate(()=>CastleAudio.audio.volume))-.4)<.015,'Blocked playback never leaves music ducked');
 await page.click('#castle-voice-replay');assert.equal(await page.locator('#castle-voice-replay').textContent(),'▶ 重听');
 await page.evaluate(()=>{window.castleFollowups=0;CastleVoice.afterSpeech(()=>castleFollowups++,100);});
 await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>castleFollowups),0,'Automatic follow-up waits for actual audio completion');
 await page.evaluate(()=>finishCastleVoice(CastleVoice.player));await page.waitForFunction(()=>castleFollowups===1);
 await page.evaluate(text=>{showText(text);CastleVoice.afterSpeech(()=>castleFollowups++,100);showText('换了场景。');},other.source);
 await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>castleFollowups),1,'Changing dialogue cancels its pending automatic follow-up');
 await page.evaluate(()=>showText('没有配音的场景叙述。'));assert.equal(await page.evaluate(()=>CastleVoice.current),null);assert(await page.locator('#castle-voice-replay').isHidden());
 await page.evaluate(text=>showText(text),other.source);await page.click('#castle-sound');assert(await page.evaluate(()=>CastleVoice.player.paused),'Global mute includes dialogue');await page.click('#castle-sound');
 await page.evaluate(()=>CastleAudio.setVolume(0));assert(await page.evaluate(()=>CastleVoice.player.paused));await page.evaluate(()=>CastleAudio.setVolume(.4));
 await page.setViewportSize({width:390,height:844});await page.locator('.castle-dock [data-castle-drawer=music]').click();
 await page.click('#castle-voice-toggle');assert.equal(await page.evaluate(()=>CastleVoice.enabled),false);assert(await page.evaluate(()=>CastleVoice.player.paused));
 await page.click('#castle-voice-toggle');await page.locator('[aria-label="收起设置"]').click();await page.click('#castle-voice-replay');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});assert(await page.evaluate(()=>CastleVoice.player.paused));
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});assert(await page.locator('#pause-overlay.active').isVisible());await page.click('#resume-btn');
 await page.evaluate(()=>{CastleUI.mark();CastleUI.persist();});await page.reload();await page.click('#continue-btn');assert.equal(await page.evaluate(()=>castleVoiceEvents.length),0,'Saved dialogue does not autoplay on continuation');
 assert(await page.locator('#castle-voice-replay').isVisible());await page.click('#castle-voice-replay');assert.equal(await page.evaluate(()=>castleVoiceEvents.length),1,'Saved dialogue can be explicitly replayed');
 await page.evaluate(()=>{G.loop=1;talk('servants');});assert.equal(await page.evaluate(()=>CastleVoice.current.id),'talk.servants.1.0.text','Both servants share the scene but keep separate recorded speakers');
 await page.evaluate(()=>{G.loop=2;G.inventory=['ring'];G.countdown.offeredKeepsake=false;offerKeepsakeToAdrian();});assert.equal(await page.evaluate(()=>CastleVoice.current.id),'keepsake.ring','Constructed keepsake text uses the exact authored voice mapping');
 for(const branch of ['farewell','ring','reunion','diary']){
  await page.evaluate(branch=>{stopCountdown();G.loop=3;G.currentRoom='tower';G.inventory=['assembled_letter','repaired_score','soul_fragment'];G.puzzleSolved.organ=false;G.flags.gave_final=branch==='reunion';G.flags.diary_count=branch==='diary'?3:0;if(branch==='ring')G.inventory.push('ring','pocket_watch');if(branch==='diary')G.inventory.push('wine_bottle');examine('organ');},branch);
  assert.equal(await page.evaluate(()=>CastleVoice.current.id),'organ.'+branch,'Actual organ branch has matching emotional speech');
  assert(await page.locator('#modal-voice-replay').isVisible());await page.click('#modal-close');assert(await page.evaluate(()=>CastleVoice.player.paused),'Closing a spoken modal also cancels its voice');
 }
 await page.evaluate(()=>{G.loop=1;G.currentRoom='cellar';G.inventory=['candle'];G.names.lala=false;for(let i=0;i<4;i++)delete G.flags['talk_lala_1_'+i];delete G.flags.answered_lala;examine('wine');talk('lala');});
 await page.fill('#castle-answer','塞勒涅');await page.locator('#castle-answer-form button').click();
 await page.evaluate(()=>{for(let i=0;i<4;i++)talk('lala');finishCastleVoice(CastleVoice.player);});
 await page.waitForSelector('#modal-overlay.active #castle-answer');assert.equal(await page.evaluate(()=>CastleVoice.current.id),'talk.lala.1.3.ansQuestion','Delayed bottle clue cannot interrupt a newer conversation or suppress its question');
 await page.click('#modal-close');
 await page.evaluate(()=>{G.loop=3;G.inventory=['candle','soul_fragment'];G.moveCount=5;for(let i=0;i<2;i++)delete G.flags['talk_lala_3_'+i];delete G.flags.answered_lala;gotoRoom('cellar');CastleUI.sync();CastleUI.action('npc','lala');CastleUI.action('npc','lala');});
 await page.waitForTimeout(2200);assert.equal(await page.evaluate(()=>CastleVoice.current.id),'talk.lala.3.1.text','Queued encounters do not take over an unfinished character conversation');
 await page.evaluate(()=>finishCastleVoice(CastleVoice.player));await page.waitForSelector('#modal-overlay.active #castle-answer');assert.equal(await page.evaluate(()=>CastleVoice.current.id),'talk.lala.3.1.ansQuestion','Pending question gets priority after speech ends');
 await page.evaluate(()=>finishCastleVoice(CastleVoice.player));await page.waitForTimeout(350);assert(await page.locator('#modal-overlay.active #castle-answer').isVisible(),'An encounter also waits while the player answers');
 await page.fill('#castle-answer','8');await page.locator('#castle-answer-form button').click();await page.evaluate(()=>finishCastleVoice(CastleVoice.player));await page.waitForFunction(()=>CastleVoice.current?.id==='special.protected');
 await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));assert(await page.evaluate(()=>CastleVoice.player.paused));
 await page.evaluate(()=>{CastleAudio.start();G.loop=1;G.loopTriggered[2]=false;triggerLoop2();CastleUI.sync();CastleUI.persist();});
 assert.equal(await page.evaluate(()=>CastleVoice.current.id),'transition.loop2','First tower encounter includes the count’s actual spoken lines');
 await page.reload();await page.click('#continue-btn');assert.equal(await page.evaluate(()=>castleVoiceEvents.length),0,'Transition restoration is silent');
 assert(await page.locator('#overlay-voice-replay').isVisible());await page.click('#overlay-voice-replay');assert.equal(await page.evaluate(()=>castleVoiceEvents.length),1);
 await page.click('#loop-btn');assert(await page.evaluate(()=>CastleVoice.player.paused),'Moving on from the transition stops its speech');
 await page.evaluate(()=>{G.loop=3;G.inventory=['candle','soul_fragment'];G.moveCount=5;gotoRoom('cellar');G.puzzleSolved.organ=false;playOrgan(1);});
 await page.waitForTimeout(2200);await page.evaluate(()=>finishCastleVoice(CastleVoice.player));await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>CastleVoice.current.id),'ending.1','Queued encounters are cancelled once an ending opens');
 await page.evaluate(()=>{CastleUI.mark();CastleUI.persist();});
 await page.reload();await page.click('#continue-btn');assert.equal(await page.evaluate(()=>castleVoiceEvents.length),0,'Ending restoration never briefly autoplays the saved speech');
 assert(await page.locator('#overlay-voice-replay').isVisible());await page.click('#overlay-voice-replay');assert.equal(await page.evaluate(()=>castleVoiceEvents.length),1);
 assert.deepEqual(errors,[]);console.log('PASS: complete emotional voice corpus, explicit cast/context/moods, auto playback, replacement/replay, voice/BGM mix, volume/mute, pause/background and silent save continuation.');
 await context.close();
 // Use the browser decoder and real local media once, independently of the
 // deterministic playback fixture above. This catches corrupt MP3 delivery.
 const live=await browser.newContext(),actual=await live.newPage();await actual.goto(url);await actual.click('#start-btn');await actual.locator('#npc-siyang').click();
 await actual.waitForFunction(()=>CastleVoice.player.currentTime>.1&&!CastleVoice.player.paused);
 assert(await actual.evaluate(()=>Number.isFinite(CastleVoice.player.duration)&&CastleVoice.player.duration>1));
 await actual.evaluate(()=>CastleDialogue.finish());await actual.screenshot({path:'/tmp/hjm-castle-voice-desktop.png'});
 await actual.setViewportSize({width:390,height:844});await actual.waitForTimeout(200);
 assert(await actual.locator('#castle-voice-replay').isVisible());
 const controls=await actual.evaluate(()=>{const a=document.getElementById('castle-voice-replay').getBoundingClientRect(),b=document.getElementById('notes-btn').getBoundingClientRect();return{voiceRight:a.right,notesLeft:b.left};});assert(controls.voiceRight<=controls.notesLeft+1,'Mobile replay and history controls do not overlap');
 await actual.screenshot({path:'/tmp/hjm-castle-voice-mobile.png'});
 await actual.evaluate(()=>CastleAudio.stop());assert(await actual.evaluate(()=>CastleVoice.player.paused));await live.close();
 console.log('PASS: real local MP3 decoder and user-gesture playback.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();});
