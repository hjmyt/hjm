'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

(async()=>{
    const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
    try{
        for(const fallback of [false,true]){
            const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[];
            page.on('pageerror',error=>errors.push(error.message));
            await page.addInitScript(fallback=>{
                const Native=window.AudioContext;
                window.AudioContext=class extends Native{constructor(...args){super(...args);window.__holdContext=this;}};
                if(fallback)delete window.PointerEvent;
            },fallback);
            await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href+'#pitch-rhythm');
            await page.locator('[data-music-enter-muted]').click();
            const mount=page.locator('#pitchGameMount');
            await mount.locator('[data-action="start"]').waitFor();
            await page.evaluate(()=>{state.sound=true;PitchAudition.syncSound();});
            await page.waitForTimeout(50);
            const verification=await page.evaluate(()=>{
                const stages=[1,2,3,4].map(stage=>({stage,meter:'2/4',tempo:84,measures:[['half'],['half']]}));
                const answers=stages.map(stage=>({stage:stage.stage,passed:true,evidence:{taps:RhythmAuditionRules.holdTargets(stage).map(event=>event.start),holds:RhythmAuditionRules.holdTargets(stage).map(event=>({tapIndex:event.index,end:event.end}))}}));
                const valid=PitchAudition.validRhythmResult(stages,answers,4,'simple');
                const missing=structuredClone(answers);missing[0].evidence.holds=[];
                const duplicate=structuredClone(answers);duplicate[0].evidence.holds.push(duplicate[0].evidence.holds[0]);
                const invalid=structuredClone(answers);invalid[0].evidence.holds[0].end=NaN;
                const early=structuredClone(answers);early.forEach(answer=>answer.evidence.holds.forEach(hold=>hold.end-=.35));
                const tooEarly=structuredClone(answers);tooEarly[0].evidence.holds[0].end-=.6;
                return {valid,early:PitchAudition.validRhythmResult(stages,early,4,'simple'),tooEarly:PitchAudition.validRhythmResult(stages,tooEarly,4,'simple'),missing:PitchAudition.validRhythmResult(stages,missing,4,'simple'),duplicate:PitchAudition.validRhythmResult(stages,duplicate,4,'simple'),invalid:PitchAudition.validRhythmResult(stages,invalid,4,'simple')};
            });
            assert.deepEqual(verification,{valid:true,early:true,tooEarly:false,missing:false,duplicate:false,invalid:false},'Main controller accepts the shared early-release window but still rejects short or forged holds before awarding notes');
            async function start(meter,measures,tempo=180){
                await page.evaluate(async({meter,measures,tempo})=>{
                    const game=window.__rhythmAudition;
                    game.stages[0]={stage:1,meter,tempo,measures};game.state.mode='simple';game.startGame();
                    await game.beginSimple();
                },{meter,measures,tempo});
            }
            async function at(seconds){
                await page.waitForFunction(seconds=>{
                    const game=window.__rhythmAudition,plan=game.playbackSnapshot();
                    return window.__holdContext.currentTime-game.audioSettings().tapLatencyCompensation>=plan.rhythmStart+seconds;
                },seconds,{polling:'raf'});
                // Keep synthetic input deterministic even if an old enable timer is delayed.
                await mount.locator('[data-action="tap"]').evaluate(button=>button.disabled=false);
            }
            async function gesture(type,id=1){
                await mount.locator('[data-action="tap"]').evaluate((button,{type,id,fallback})=>{
                    if(fallback){
                        const touch=new Touch({identifier:id,target:button,clientX:100,clientY:100});
                        button.dispatchEvent(new TouchEvent(type==='down'?'touchstart':type==='up'?'touchend':'touchcancel',{bubbles:true,composed:true,cancelable:true,changedTouches:[touch],touches:type==='down'?[touch]:[]}));
                    }else button.dispatchEvent(new PointerEvent(type==='down'?'pointerdown':type==='up'?'pointerup':'pointercancel',{bubbles:true,composed:true,cancelable:true,pointerId:id,pointerType:'touch',button:0}));
                },{type,id,fallback});
            }
            await start('2/4',[['half'],['half']]);
            assert.match(await mount.locator('#holdHelp').textContent(),/最后一拍按过一半.*短延音仍需持续按住.*延音线/);
            assert.equal(await mount.locator('[data-hold-mark]').count(),2);
            await at(0);await gesture('down');
            await gesture('down',2);await gesture('up',2);
            assert.equal(await page.evaluate(()=>window.__rhythmAudition.state.taps.length),1,'Another finger neither repeats nor releases the active hold');
            assert.equal(await mount.locator('[data-action="tap"]').getAttribute('aria-pressed'),'true');
            await at(.2);
            assert((await mount.locator('[data-hold-progress]').evaluate(node=>parseFloat(node.style.width)))>0,'Hold progress follows the same audio clock');
            await page.screenshot({path:`/tmp/hjm-rhythm-hold-${fallback?'touch':'pointer'}.png`,fullPage:true});
            await at(2/3);await gesture('up');await gesture('down');
            await at(4/3);await gesture('up');
            await mount.locator('[data-action="tap"]').evaluate(button=>button.click());
            assert.equal(await page.evaluate(()=>window.__rhythmAudition.state.taps.length),2,'Long press release does not trigger a duplicate compatibility click');
            await page.evaluate(()=>window.__rhythmAudition.finishSimple());
            assert.equal(await page.evaluate(()=>window.__rhythmAudition.state.score),1,'Two real long gestures pass and score once');
            assert.match(await mount.locator('.feedback.pass').textContent(),/长按完成 2 \/ 2/);

            await start('2/4',[['tied-eighths','quarter'],['eighth-pair','quarter']]);
            assert.match(await mount.locator('#holdHelp').textContent(),/可以松开.*下一音/);
            await at(0);await gesture('down');
            await page.waitForFunction(()=>document.querySelector('#pitchGameMount').shadowRoot.querySelector('[data-tap-title]')?.textContent==='可以松开',{},{polling:'raf'});
            assert.equal(await mount.locator('[data-hold-progress]').evaluate(node=>parseFloat(node.style.width)),100,'Progress fills at the permitted handoff time, not the exact score end');
            await gesture('up');
            const earlyEnd=await page.evaluate(()=>window.__rhythmAudition.state.holds[0].end);
            assert(earlyEnd<1/3,'Mobile cue allows release before the next note begins');
            assert.match(await mount.locator('[data-hold-status]').textContent(),/长按完成/);
            for(const time of [1/3,2/3,5/6,1]){await at(time);await gesture('down');await gesture('up');}
            assert.equal(await page.evaluate(()=>window.__rhythmAudition.state.taps.length),5,'A new press immediately after early release is never blocked by compatibility-click suppression');
            await page.evaluate(()=>window.__rhythmAudition.finishSimple());
            assert.equal(await page.evaluate(()=>window.__rhythmAudition.state.score),1,'Early-release tie and all following attacks pass together');
            assert.match(await mount.locator('.feedback.pass').textContent(),/末尾松手已放宽/);

            await start('2/4',[['half'],['half']],84);
            await at(0);await gesture('down');
            await page.waitForFunction(()=>document.querySelector('#pitchGameMount').shadowRoot.querySelector('[data-tap-title]')?.textContent==='可以松开',{},{polling:'raf'});
            await gesture('up');
            assert(await page.evaluate(()=>window.__rhythmAudition.state.holds[0].end<2*60/84-.25),'Slow half note can release well before the old 180 ms limit');
            await at(2*60/84);await gesture('down');
            await at(4*60/84+.2);await gesture('up');
            await page.evaluate(()=>window.__rhythmAudition.finishSimple());
            assert.equal(await page.evaluate(()=>window.__rhythmAudition.state.score),1,'Early handoff and a slightly late final release both pass with real mobile input');

            await start('2/4',[['tied-eighths','quarter'],['half']]);
            await at(0);await gesture('down');await at(.07);await gesture('up');
            await page.evaluate(()=>window.__rhythmAudition.finishSimple());
            assert.equal(await page.evaluate(()=>window.__rhythmAudition.state.score),0);
            assert(await mount.locator('[data-note-status="error"]').count()>0,'Early release marks the tied notes red');
            await mount.locator('[data-action="retry"]').click();
            await page.evaluate(()=>window.__rhythmAudition.completeStageForTest(true));
            assert.equal(await page.evaluate(()=>window.__rhythmAudition.state.score),0,'Retry with correct holds never restores points');

            await start('2/4',[['half'],['half']]);
            await at(0);await gesture('down');await at(.15);await gesture('cancel');
            assert.equal(await page.evaluate(()=>window.__rhythmAudition.state.holds[0].cancelled),true);
            assert.equal(await mount.locator('[data-action="tap"]').getAttribute('aria-pressed'),'false');
            await page.evaluate(()=>window.__rhythmAudition.finishSimple());
            assert.equal(await page.evaluate(()=>window.__rhythmAudition.state.score),0);

            await start('4/4',[['whole'],['whole']]);
            await at(0);await page.keyboard.down('Space');await page.keyboard.down('Space');
            assert.equal(await page.evaluate(()=>window.__rhythmAudition.state.taps.length),1,'Space autorepeat cannot create new attacks');
            await at(4/3);await page.keyboard.up('Space');await page.keyboard.down('Space');
            await at(8/3);await page.keyboard.up('Space');
            await page.evaluate(()=>window.__rhythmAudition.finishSimple());
            assert.equal(await page.evaluate(()=>window.__rhythmAudition.state.score),1,'Whole notes can be held with Space');

            await start('2/4',[['half'],['half']]);await at(0);await gesture('down');
            const balance=await page.evaluate(()=>state.coins);
            await page.locator('.nav-btn[data-route="rhythm"]').first().click();
            assert.equal(await page.evaluate(()=>typeof window.__rhythmAudition),'undefined','Navigation destroys the hold timer and listeners');
            await page.keyboard.up('Space');
            assert.equal(await page.evaluate(()=>state.coins),balance,'Interrupted long hold never settles rewards');
            assert.deepEqual(errors,[]);
            await page.close();
        }
        console.log('rhythm audition holds browser ok: pointer/touch, Space, progress, early release, cancellation, retries and navigation');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
