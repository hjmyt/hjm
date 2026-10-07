'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const near=(actual,expected)=>assert(Math.abs(actual-expected)<1e-6,`${actual} should equal ${expected}`);

(async()=>{
    const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
    try {
        const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
        page.on('pageerror',error=>errors.push(error.message));
        // Audit actual sample scheduling and gains, not just the planned timestamps.
        await page.addInitScript(()=>{
            window.__sampleAudit=[];
            window.__sampleStopAudit=[];
            const original=AudioContext.prototype.createBufferSource;
            AudioContext.prototype.createBufferSource=function(){
                const source=original.call(this),start=source.start.bind(source),connect=source.connect.bind(source),stop=source.stop.bind(source);
                let gainNode;
                source.connect=node=>{
                    gainNode=node;
                    return connect(node);
                };
                source.start=when=>{window.__sampleAudit.push({when,duration:source.buffer?.duration,rate:source.playbackRate.value,gains:gainNode?.__gainAudit||[]});return start(when);};
                source.stop=when=>{window.__sampleStopAudit.push({when,duration:source.buffer?.duration});return stop(when);};
                return source;
            };
            const createGain=AudioContext.prototype.createGain;
            AudioContext.prototype.createGain=function(){
                const node=createGain.call(this);node.__gainAudit=[];
                for(const method of ['setValueAtTime','exponentialRampToValueAtTime']){
                    const original=node.gain[method].bind(node.gain);
                    node.gain[method]=(value,time)=>{node.__gainAudit.push({value,time});return original(value,time);};
                }
                return node;
            };
        });
        await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href+'#pitch-rhythm');
        await page.locator('[data-music-enter-muted]').click();
        const mount=page.locator('#pitchGameMount');
        await mount.locator('[data-action="start"]').waitFor();
        await page.evaluate(()=>{state.sound=true;PitchAudition.syncSound();});
        await page.waitForTimeout(50);
        const fixtures=[
            {meter:'4/4',beats:4,beatUnits:4,accents:['strong','weak','secondary','weak'],measure:['quarter','eighth-pair','quarter','eighth-pair']},
            {meter:'2/4',beats:2,beatUnits:4,accents:['strong','weak'],measure:['quarter','eighth-pair']},
            {meter:'3/4',beats:3,beatUnits:4,accents:['strong','weak','weak'],measure:['quarter','eighth-pair','quarter']},
            {meter:'3/8',beats:3,beatUnits:2,accents:['strong','weak','weak'],measure:['eighth','eighth','eighth']},
            {meter:'6/8',beats:6,beatUnits:2,accents:['strong','weak','weak','secondary','weak','weak'],measure:['eighth','eighth','eighth','quarter','eighth']}
        ];
        for (const fixture of fixtures) {
            await page.evaluate(fixture=>{
                const game=window.__rhythmAudition;
                game.stages[0]={stage:1,meter:fixture.meter,tempo:60,measures:[fixture.measure.slice(),fixture.measure.slice()]};
                game.state.mode='simple';game.startGame();
            },fixture);
            assert.match(await mount.locator('[data-action="perform"]').textContent(),new RegExp(`${fixture.beats} 拍预备`));
            await page.evaluate(async()=>{window.__sampleAudit=[];await window.__rhythmAudition.previewCorrectRhythm();});
            const listening=await page.evaluate(()=>({plan:window.__rhythmAudition.playbackSnapshot(),samples:window.__sampleAudit,settings:window.__rhythmAudition.audioSettings()}));
            assert.equal(await mount.locator('[data-listen-countdown]').textContent(),String(fixture.beats));
            assert.equal(listening.plan.clicks.length,fixture.beats,'Only one pre-roll measure is played during listening');
            assert.deepEqual(listening.plan.clicks.map(click=>click.accent),fixture.accents);
            assert(listening.plan.clicks.every(click=>click.phase==='count-in'&&click.sample.startsWith('countIn')),'All listening pre-roll beats use the legacy metallic cue');
            assert.equal(listening.settings.countInDistinct,true);
            listening.samples.slice(0,fixture.beats).forEach(sound=>near(sound.duration,listening.settings.voices.countIn.duration));
            near(listening.plan.rhythmStart-listening.plan.start,fixture.beats);
            near(listening.plan.secondsPerUnit,1/fixture.beatUnits);
            assert.equal(listening.samples.length,fixture.beats+listening.plan.notes.length,'Actual listening contains no metronome during the score');
            const scoreSounds=listening.samples.filter(note=>Math.abs(note.duration-listening.settings.voices.scoreRhythm.duration)<1e-6);
            assert.equal(scoreSounds.length,listening.plan.notes.length);
            scoreSounds.forEach((sound,index)=>near(sound.when,listening.plan.notes[index].when));
            assert(listening.plan.notes.some((note,index)=>index&&Math.abs(note.when-listening.plan.notes[index-1].when-.5)>1e-6)||fixture.meter==='3/8');
            await page.evaluate(async()=>{window.__sampleAudit=[];await window.__rhythmAudition.beginSimple();});
            const performance=await page.evaluate(()=>({plan:window.__rhythmAudition.playbackSnapshot(),samples:window.__sampleAudit}));
            assert.equal(performance.plan.clicks.length,fixture.beats*3,'Pre-roll and two performed measures share a beat grid');
            assert.deepEqual(performance.plan.clicks.map(click=>click.accent),Array.from({length:3},()=>fixture.accents).flat());
            performance.plan.clicks.forEach((click,index)=>near(click.when,performance.plan.start+index));
            assert(performance.plan.clicks.slice(0,fixture.beats).every(click=>click.phase==='count-in'&&click.sample.startsWith('countIn')));
            assert(performance.plan.clicks.slice(fixture.beats).every(click=>click.phase==='performance'&&!click.sample.startsWith('countIn')),'Formal beats switch to the recorded voice exactly at the first performed beat');
            const strong=performance.samples[fixture.beats],weak=performance.samples[fixture.beats+1];
            assert(strong.duration>weak.duration,'High reference accent preserves its distinct recorded decay');
            const strongGain=Math.max(...strong.gains.map(event=>event.value)),weakGain=Math.max(...weak.gains.map(event=>event.value));
            assert(strongGain>weakGain&&strongGain/weakGain<1.2,'Weak beats remain clearly audible; timbre carries the primary accent');
            assert.equal(performance.samples.length,fixture.beats*3,'Performance plays pre-roll cues then only the reference metronome before user taps');
            assert(performance.samples.every(sample=>sample.rate===1),'BPM changes schedule, not sample pitch');
            await page.evaluate(()=>window.__rhythmAudition.finishSimple());
        }
        // Same written eighths must not turn 6/8 into 3/4. Audit both notation
        // group boundaries and the actual sample clock against the 75 BPM video.
        for(const fixture of [
            {meter:'6/8',beats:6,length:6,beams:4,barSeconds:4.8,spacing:.8,symbol:'♪',accents:['strong','weak','weak','secondary','weak','weak']},
            {meter:'3/4',beats:3,length:6,beams:6,barSeconds:2.4,spacing:.4,symbol:'♩',accents:['strong','weak','weak']},
            {meter:'3/8',beats:3,length:3,beams:2,barSeconds:2.4,spacing:.8,symbol:'♪',accents:['strong','weak','weak']}
        ]){
            await page.evaluate(fixture=>{
                const game=window.__rhythmAudition,measure=Array(fixture.length).fill('eighth');
                game.stages[0]={stage:1,meter:fixture.meter,tempo:75,measures:[measure,measure.slice()]};
                game.state.mode='simple';game.startGame();
            },fixture);
            assert.equal(await mount.locator('[data-cross-token-beam]').count(),fixture.beams,'Beam groups preserve 3+3, 2+2+2 or the complete 3/8 measure');
            assert.match(await mount.locator('.stage-labels').textContent(),new RegExp(`${fixture.symbol} = 75 BPM`));
            if(fixture.meter==='6/8'){
                assert.match(await mount.locator('.audio-strip').textContent(),/6 拍.*八分音符.*3＋3/);
                await mount.locator('.game-card').screenshot({path:'/tmp/hjm-rhythm-six-eight-mobile.png'});
            }
            await page.evaluate(async()=>{window.__sampleAudit=[];await window.__rhythmAudition.previewCorrectRhythm();});
            const listening=await page.evaluate(()=>({plan:window.__rhythmAudition.playbackSnapshot(),samples:window.__sampleAudit}));
            near(listening.plan.rhythmStart-listening.plan.start,fixture.barSeconds);
            assert.equal(listening.plan.clicks.length,fixture.beats);
            listening.plan.clicks.forEach((click,index)=>near(click.when-listening.plan.start,index*.8));
            listening.plan.notes.forEach((note,index)=>near(note.when-listening.plan.rhythmStart,index*fixture.spacing));
            listening.samples.slice(fixture.beats).forEach((sample,index)=>near(sample.when,listening.plan.notes[index].when));
            await page.evaluate(async()=>{window.__sampleAudit=[];await window.__rhythmAudition.beginSimple();});
            const formal=await page.evaluate(()=>({plan:window.__rhythmAudition.playbackSnapshot(),samples:window.__sampleAudit}));
            assert.deepEqual(formal.plan.clicks.map(click=>click.accent),Array(3).fill(fixture.accents).flat());
            formal.plan.clicks.forEach((click,index)=>near(click.when-formal.plan.start,index*.8));
            formal.samples.forEach((sample,index)=>near(sample.when,formal.plan.clicks[index].when));
            await page.evaluate(()=>window.__rhythmAudition.finishSimple());
            await page.evaluate(async()=>{window.__rhythmAudition.state.retryTempo=40;await window.__rhythmAudition.reviewCorrectRhythm();});
            const slowReview=await page.evaluate(()=>window.__rhythmAudition.playbackSnapshot());
            assert.equal(slowReview.tempo,40);
            near(slowReview.rhythmStart-slowReview.start,fixture.beats*1.5);
            slowReview.notes.forEach((note,index)=>near(note.when-slowReview.rhythmStart,index*fixture.spacing*75/40));
            await page.evaluate(async()=>{window.__rhythmAudition.retryStage();await window.__rhythmAudition.beginSimple();});
            const slowRetry=await page.evaluate(()=>window.__rhythmAudition.playbackSnapshot());
            slowRetry.clicks.forEach((click,index)=>near(click.when-slowRetry.start,index*1.5));
            near(slowRetry.rhythmStart-slowRetry.start,fixture.beats*1.5);
            await page.evaluate(()=>window.__rhythmAudition.finishSimple());
            assert.equal(await page.evaluate(()=>window.__rhythmAudition.state.score),0,'Slow retries never restore the failed stage point');
        }
        // At the actual phase boundary the UI says "开始", without shifting beat one.
        await page.evaluate(async()=>{
            const game=window.__rhythmAudition;
            game.stages[0]={stage:1,meter:'2/4',tempo:180,measures:[['quarter','quarter'],['quarter','quarter']]};
            game.state.mode='medium';game.startGame();await game.beginSimple();
        });
        await page.waitForFunction(()=>document.querySelector('#pitchGameMount').shadowRoot.querySelector('#countValue')?.textContent==='开始');
        assert.match(await mount.locator('#countLabel').textContent(),/正式第 1 小节 · 强拍/);
        await page.evaluate(()=>window.__rhythmAudition.finishSimple());
        await page.evaluate(()=>{
            const game=window.__rhythmAudition;
            game.state.mode='hard';game.startGame();
            game.completeStageForTest(true);game.nextStage();
        });
        await mount.locator('[data-action="listen"]').click();
        const hardListening=await page.evaluate(()=>window.__rhythmAudition.playbackSnapshot());
        assert(hardListening.clicks.every(click=>click.phase==='count-in'&&click.sample.startsWith('countIn')),'Hard dictation uses the same distinct pre-roll sound');
        await mount.locator('[data-action="write"]').click();
        for(const id of ['half','triplet','tied-eighths','tied-syncopation'])assert.equal(await mount.locator(`[data-token="${id}"]`).count(),1,`${id} is available for advanced dictation`);
        assert(await mount.locator('[data-token="triplet"] svg').evaluate(svg=>svg.textContent.includes('3')));
        assert.equal(await mount.locator('[data-token="tied-eighths"] [data-tie]').count(),1,'Tie palette displays its actual curve');
        await page.evaluate(()=>{
            const game=window.__rhythmAudition;
            game.completeStageForTest(true);game.nextStage();
            game.completeStageForTest(true);
            game.stages[3]={stage:4,meter:'4/4',tempo:84,measures:[['tied-syncopation','quarter-rest','quarter'],['triplet','quarter','quarter-rest','eighth-pair']]};
            game.nextStage();
        });
        await mount.locator('[data-action="write"]').click();
        for(const id of ['quarter-rest','eighth-rest','sixteenth-rest'])assert.equal(await mount.locator(`[data-token="${id}"] svg`).count(),1,`${id} has a visible vector icon in dictation`);
        for(const id of ['tied-syncopation','quarter-rest','quarter','triplet','quarter','quarter-rest','eighth-pair'])await mount.locator(`[data-token="${id}"]`).click();
        assert.equal(await mount.locator('.score-sheet [data-tie]').count(),1);
        assert.equal(await mount.locator('.score-sheet [data-rest]').count(),2);
        assert.match(await mount.locator('.score-sheet svg').textContent(),/3/);
        await mount.locator('[data-action="submit-write"]').click();
        assert.match(await mount.locator('.feedback.pass').textContent(),/阶段通过/);
        await mount.locator('[data-action="review"]').click();
        const review=await page.evaluate(()=>window.__rhythmAudition.playbackSnapshot());
        assert(review.clicks.every(click=>click.phase==='count-in'&&click.sample.startsWith('countIn')),'Review uses only metallic pre-roll, no metronome over the correct rhythm');
        assert.deepEqual(review.notes.map(note=>note.unit),[0,2,6,12,16,16+4/3,16+8/3,20,28,30],'Ties have no repeated attack and rests create silent gaps');
        assert(review.notes.find(note=>note.unit===2).tied,'Tied percussion is one strike, not a long buzzing oscillator');
        assert(review.notes.find(note=>note.unit===2).soundDuration<.1,'Tied percussion retains the natural short recorded decay');
        near(review.notes[5].when-review.notes[4].when,60/84/3);
        near(review.notes[6].when-review.notes[5].when,60/84/3);
        await mount.locator('.game-card').screenshot({path:'/tmp/hjm-rhythm-musical-mobile.png'});
        // Stop every scheduled sample on mute, never schedule while muted,
        // and release the sample player when leaving the tab.
        await page.evaluate(()=>{window.__sampleStopAudit=[];state.sound=false;PitchAudition.syncSound();});
        await page.waitForFunction(()=>window.__sampleStopAudit.length>0);
        const beforeMutedReplay=await page.evaluate(()=>window.__sampleAudit.length);
        await page.evaluate(()=>window.__rhythmAudition.reviewCorrectRhythm());
        assert.equal(await page.evaluate(()=>window.__sampleAudit.length),beforeMutedReplay,'Muted replay schedules no sampled sound');
        await page.evaluate(()=>{state.sound=true;PitchAudition.syncSound();});
        await page.waitForTimeout(30);
        await page.evaluate(()=>window.__rhythmAudition.reviewCorrectRhythm());
        assert(await page.evaluate(count=>window.__sampleAudit.length>count,beforeMutedReplay),'Unmuting restores reference audio');
        await page.evaluate(()=>{window.__sampleStopAudit=[];route('home');});
        assert(await page.evaluate(()=>window.__sampleStopAudit.length>0),'Leaving challenge stops scheduled samples');
        assert.equal(await page.evaluate(()=>!!window.__rhythmAudition),false,'Leaving challenge releases its component');
        assert.deepEqual(errors,[]);
        console.log('rhythm audition musical ok: five meter clocks, actual reference accents, rests, ties, tuplets, dictation, mute and navigation cleanup');
    } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
