'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const context=vm.createContext({});
for (const file of ['js/data/rhythm-audition.js','js/features/rhythm-audition-rules.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
const rules=vm.runInContext('RhythmAuditionRules',context);
const plain=value=>JSON.parse(JSON.stringify(value));
const near=(actual,expected)=>assert(Math.abs(actual-expected)<1e-7,`${actual} should equal ${expected}`);
let seed=617923;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const seen=new Set();
for(let iteration=0;iteration<500;iteration++)for(let stage=1;stage<=4;stage++){
    const data=rules.makeStage(stage,random),meter=rules.meters[data.meter];
    assert(rules.validMeasures(data,data.measures),'Every question fills exactly two measures');
    for (const measure of data.measures) {
        let cursor=0;
        for (const id of measure) {
            seen.add(id);
            assert(rules.availableTokens(stage,data.meter).includes(id),`${id} must be available in the dictation palette`);
            const token=rules.tokens[id];
            if (data.meter.endsWith('/4')) {
                if(token.units>=4)near(cursor%4,0);
                else assert(Math.floor(cursor/4)===Math.floor((cursor+token.units-1e-7)/4),'Rest and note fragments stay inside a complete beat group');
                if (token.units>=8)near(cursor%8,0);
            } else if(data.meter==='6/8')assert(Math.floor(cursor/6)===Math.floor((cursor+token.units-1e-7)/6),'Compound patterns do not spill across dotted-quarter groups');
            cursor+=token.units;
        }
        assert(measure.some(id=>rules.tokens[id].onsets.length),'Every measure contains a sounding rhythm');
    }
    if(stage===2){assert(data.measures.flat().includes('triplet'));assert(data.measures.flat().includes('tied-syncopation'));}
    if(stage===4)assert(data.measures.flat().some(id=>id.endsWith('rest')),'Rest stage always exercises a rest');
    const {secondsPerUnit}=rules.timing(data),targets=rules.targetOnsets(data).map(unit=>unit*secondsPerUnit);
    assert.deepEqual(plain(rules.soundEvents(data).map(event=>event.unit)),plain(rules.targetOnsets(data)),'Audio events match the scoring onsets including all tuplets and ties');
    const holds=rules.holdTargets(data).filter(event=>event.required).map(event=>({tapIndex:event.index,end:event.end}));
    assert(rules.tapAnalysis(data,targets,holds).passed,'Meter-aware perfect taps and holds pass both game and settlement rules');
    assert(!rules.tapAnalysis(data,[]).passed,'No taps never pass');
    assert(!rules.tapAnalysis(data,targets.concat(Array.from({length:10},(_,index)=>(index+.2)*secondsPerUnit))).passed,'Extra taps cannot farm rewards');
}
for(const id of ['whole','half','triplet','tied-syncopation','quarter-rest','eighth-rest','sixteenth-rest'])assert(seen.has(id),`Random questions cover ${id}`);

for(const [meter,beats,pulse,accents] of [
    ['4/4',4,4,['strong','weak','secondary','weak']],
    ['2/4',2,4,['strong','weak']],
    ['3/4',3,4,['strong','weak','weak']],
    ['3/8',3,2,['strong','weak','weak']],
    ['6/8',6,2,['strong','weak','weak','secondary','weak','weak']]
]){
    const data={meter,tempo:60},timing=rules.timing(data);
    assert.equal(timing.countInBeats,beats);
    assert.deepEqual(plain(timing.accents),accents);
    near(timing.secondsPerUnit,1/pulse);
    near(timing.countInSeconds,timing.measureSeconds);
    near(timing.beatSeconds,1);
    near(rules.timing({...data,tempo:40}).secondsPerUnit,timing.secondsPerUnit*1.5);
}
// User video: 6/8 at 75 BPM counts six eighth-note clicks, about 0.8 s apart.
for(const [meter,measures,onsets,barSeconds,pulse,beams] of [
    ['6/8',[Array(6).fill('eighth'),Array(6).fill('eighth')],[0,.8,1.6,2.4,3.2,4],4.8,2,6],
    ['3/4',[Array(6).fill('eighth'),Array(6).fill('eighth')],[0,.4,.8,1.2,1.6,2],2.4,4,4],
    ['3/8',[Array(3).fill('eighth'),Array(3).fill('eighth')],[0,.8,1.6],2.4,2,6]
]){
    const data={meter,tempo:75,measures},clock=rules.timing(data);
    assert.equal(rules.meters[meter].pulse,pulse);
    assert.equal(rules.meters[meter].beamUnits,beams,'Click unit does not change notation grouping');
    near(clock.measureSeconds,barSeconds);
    const actual=rules.soundEvents(data).slice(0,onsets.length).map(event=>event.unit*clock.secondsPerUnit);
    actual.forEach((time,index)=>near(time,onsets[index]));
    near(clock.countInSeconds,barSeconds);
}
const sixEightHold=rules.holdTargets({meter:'6/8',tempo:75,measures:[['dotted-quarter','quarter','eighth'],['dotted-quarter','dotted-quarter']]});
assert.equal(sixEightHold[0].beats,3,'Dotted quarter is three eighth-note training pulses');
assert.equal(sixEightHold[1].beats,2,'Quarter lasts two eighth-note training pulses');
assert(sixEightHold[0].required&&sixEightHold[1].required,'Both sustained values must be held');
assert(!sixEightHold[2].required,'An eighth note remains a single short tap');
const tied={meter:'4/4',tempo:84,measures:[['tied-syncopation','quarter','quarter'],['tied-eighths','quarter','half']]};
assert.deepEqual(plain(rules.targetOnsets(tied)),[0,2,6,8,12,16,20,24],'Tie continuation does not create an extra attack');
assert.equal(rules.soundEvents(tied).find(event=>event.unit===2).duration,4,'Tied eighths sustain for their combined duration');
assert(rules.sameOnsets({meter:'2/4',measures:[['triplet','quarter'],['quarter','quarter']]},[['triplet','quarter'],['quarter','quarter']]),'Tuplet float subdivisions compare with tolerance');
assert(rules.sameOnsets({meter:'2/4',measures:[['tied-eighths','quarter'],['quarter','quarter']]},[['quarter','quarter'],['quarter','quarter']]),'Equivalent sustained durations are accepted');
assert(!rules.validMeasures({meter:'4/4'},[['unknown'],['quarter']]),'Unknown tokens are rejected without throwing');
assert(!rules.validMeasures({meter:'7/8'},[[],[]]),'Unsupported meters are rejected');
console.log('rhythm audition rules ok: 2,000 grouped questions, meter timing, accents, ties and strict scoring');

for(const data of [
    {meter:'4/4',tempo:84,measures:[['whole'],['half','quarter','quarter']]},
    {meter:'2/4',tempo:84,measures:[['tied-eighths','quarter'],['half']]},
    {meter:'3/8',tempo:76,measures:[['dotted-quarter'],['quarter','eighth']]},
    {meter:'6/8',tempo:76,measures:[['tied-eighths','eighth','dotted-quarter'],['dotted-quarter','quarter','eighth']]},
    tied
])for(const tempo of [40,60,84,180]){
    const fixture={...data,tempo},events=rules.holdTargets(fixture),taps=events.map(event=>event.start),holds=events.filter(event=>event.required).map(event=>({tapIndex:event.index,end:event.end}));
    assert(rules.validMeasures(fixture,fixture.measures));
    assert(holds.length>0);
    assert(rules.tapAnalysis(fixture,taps,holds).passed,'Release at the exact score end passes in each meter and BPM');
    assert(!rules.tapAnalysis(fixture,taps).passed,'Accurate onsets without required hold evidence cannot pass');
    assert(!rules.tapAnalysis(fixture,taps,holds.map((hold,index)=>index?hold:{...hold,cancelled:true})).passed,'Cancelled or still-held gesture never passes');
    assert(!rules.tapAnalysis(fixture,taps,holds.slice(1)).passed,'A single missing long press fails even with otherwise perfect taps');
    const earlyHolds=events.filter(event=>event.required).map(event=>({tapIndex:event.index,end:rules.holdReleaseWindow(event,taps[event.index]).earliestEnd}));
    assert(rules.tapAnalysis(fixture,taps,earlyHolds).passed,'Shared early-release cue accepts handoff in every meter and BPM');
    for(const event of events.filter(event=>event.required)){
        const window=rules.holdReleaseWindow(event,taps[event.index]);
        assert(window.earlyReleaseTolerance<=rules.timing(fixture).beatSeconds*.5+1e-7);
        assert(window.minimumHeldSeconds>=(event.end-event.start)*.65-1e-7,'Fast ties cannot become brief taps');
        if(event.beats>=2)near(window.earlyReleaseTolerance,rules.timing(fixture).beatSeconds*.5);
        assert(rules.tapAnalysis(fixture,taps,earlyHolds.map(hold=>hold.tapIndex===event.index?{...hold,end:window.latestEnd}:hold)).passed,'Small late releases also pass at the shared window boundary');
        const tooEarly=earlyHolds.map(hold=>hold.tapIndex===event.index?{...hold,end:window.earliestEnd-.001}:hold);
        assert(!rules.tapAnalysis(fixture,taps,tooEarly).passed,'Release before the shared window is still rejected');
        const tooLate=earlyHolds.map(hold=>hold.tapIndex===event.index?{...hold,end:window.latestEnd+.001}:hold);
        assert(!rules.tapAnalysis(fixture,taps,tooLate).passed,'Release after the relaxed window is still rejected');
    }
}
const handoff={meter:'2/4',tempo:84,measures:[['eighth-two-sixteenth','triplet'],['tied-syncopation']]};
const handoffEvents=rules.holdTargets(handoff),handoffTaps=handoffEvents.map(event=>event.start),handoffHolds=handoffEvents.filter(event=>event.required).map(event=>({tapIndex:event.index,end:event.end-.15}));
assert.equal(handoffEvents.length,9,'Regression reproduces the nine attacks in the user screenshot');
assert(rules.tapAnalysis(handoff,handoffTaps,handoffHolds).passed,'150 ms lift-to-press gap after the tie permits the following eighth');
assert(!rules.tapAnalysis(handoff,handoffTaps.map((time,index)=>index===8?time-.15:time),handoffHolds).passed,'Early release does not move the next note earlier');
const lateDownEvents=rules.holdTargets({meter:'2/4',tempo:180,measures:[['tied-eighths','quarter'],['quarter','quarter']]});
const lateWindow=rules.holdReleaseWindow(lateDownEvents[0],lateDownEvents[0].start+.1);
near(lateWindow.earliestEnd,.1+(1/3)*.65);
assert(lateWindow.earliestEnd>rules.holdReleaseWindow(lateDownEvents[0]).earliestEnd,'A late down does not bypass the minimum held duration');
const triplets={meter:'2/4',tempo:84,measures:[['triplet','quarter'],['triplet','quarter']]};
assert(!rules.holdTargets(triplets).some(event=>event.required),'Tuplets are separate taps, never long holds');
const fastTie={meter:'4/4',tempo:180,measures:[['tied-eighths','quarter','half'],['half','quarter','quarter']]};
const fastEvents=rules.holdTargets(fastTie),fastHolds=fastEvents.filter(event=>event.required).map(event=>({tapIndex:event.index,end:event.end}));
assert(rules.tapAnalysis(fastTie,fastEvents.map(event=>event.start),fastHolds.map((hold,index)=>index?hold:{...hold,end:hold.end-.1})).passed,'A short tie has a relaxed but bounded release window');
assert(!rules.tapAnalysis(fastTie,fastEvents.map(event=>event.start),fastHolds.map(hold=>({...hold,end:hold.end-.2}))).passed,'Fast ties cannot lose most of their duration');
assert(!rules.tapAnalysis(fastTie,fastEvents.map((event,index)=>event.start+(index===0?.1:0)),fastHolds.map((hold,index)=>index?hold:{...hold,end:.2})).passed,'Late press plus early release still requires a real sustained gesture');
const relaxedLong={meter:'4/4',tempo:84,measures:[['whole'],['half','quarter','quarter']]};
const relaxedEvents=rules.holdTargets(relaxedLong),relaxedTaps=relaxedEvents.map(event=>event.start);
const relaxedHolds=relaxedEvents.filter(event=>event.required).map(event=>({tapIndex:event.index,end:event.end-.35}));
assert(rules.tapAnalysis(relaxedLong,relaxedTaps,relaxedHolds).passed,'350 ms early release for slow long notes now passes instead of requiring the last beat in full');
assert(!rules.tapAnalysis(relaxedLong,relaxedTaps.map((value,index)=>index===1?value-.2:value),relaxedHolds).passed,'Relaxed release does not relax the following onset');
console.log('rhythm audition holds ok: tied notes, whole/half notes, compound meters, release timing and cancellation');
