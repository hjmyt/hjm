'use strict';

const RhythmAuditionRules = (() => {
    const { meters, tokens, basic, advanced, rests, compound, compoundRests } = RHYTHM_AUDITION_DATA;
    const pick = (list,random) => list[Math.floor(random()*list.length)];
    const tokenUnits = sequence => sequence.reduce((sum,id)=>sum+tokens[id].units,0);
    function timing(data) {
        const meter=meters[data.meter],beatSeconds=60/data.tempo,secondsPerUnit=beatSeconds/meter.pulse;
        return { beatSeconds,secondsPerUnit,countInBeats:meter.beats,countInSeconds:meter.beats*beatSeconds,measureSeconds:meter.units*secondsPerUnit,totalUnits:meter.units*2,beatLabel:meter.beatLabel,beatSymbol:meter.beatSymbol,accents:meter.accents };
    }
    function targetOnsets(data,measures=data.measures) {
        const result=[];
        measures.forEach((measure,index)=>{
            let cursor=index*meters[data.meter].units;
            measure.forEach(id=>{tokens[id].onsets.forEach(onset=>result.push(cursor+onset));cursor+=tokens[id].units;});
        });
        return result;
    }
    function sameOnsets(data,attempt) {
        const reference=targetOnsets(data),actual=targetOnsets(data,attempt);
        return reference.length===actual.length&&reference.every((value,index)=>Math.abs(value-actual[index])<1e-7);
    }
    function soundEvents(data) {
        const events=[];
        data.measures.forEach((measure,measureIndex)=>{
            let cursor=measureIndex*meters[data.meter].units;
            measure.forEach(id=>{
                const token=tokens[id];let offset=0;
                (token.durations||[]).forEach((duration,index)=>{
                    if(!token.ties?.includes(index-1)){
                        let length=duration,next=index;
                        while(token.ties?.includes(next)){next++;length+=token.durations[next];}
                        events.push({unit:cursor+offset,duration:length,tied:next>index});
                    }
                    offset+=duration;
                });
                cursor+=token.units;
            });
        });
        return events;
    }
    // A tie is one continuous gesture, even when its total is only one beat.
    function holdTargets(data) {
        const {secondsPerUnit}=timing(data),pulse=meters[data.meter].pulse;
        return soundEvents(data).map((event,index)=>({...event,index,start:event.unit*secondsPerUnit,end:(event.unit+event.duration)*secondsPerUnit,beats:event.duration/pulse,required:event.tied||event.duration>pulse+1e-7}));
    }
    function availableTokens(stage,meter) {
        const result=['quarter','eighth','eighth-pair'];
        if (meters[meter].units>=8) result.unshift('half');
        if (meter==='4/4') result.unshift('whole');
        if (['6/8','3/8'].includes(meter)) result.push('dotted-quarter');
        if (stage>=2) result.push('sixteenth','four-sixteenth','eighth-two-sixteenth','two-sixteenth-eighth','syncopation','triplet','dotted-eighth-sixteenth','sixteenth-dotted-eighth','tied-eighths');
        if (stage>=2&&meters[meter].units>=8&&meter!=='6/8') result.push('tied-syncopation');
        if (stage>=4) result.push('quarter-rest','eighth-rest','sixteenth-rest');
        return result;
    }
    function fillMeasure(stage,meter,random=Math.random,required=null) {
        const spec=meters[meter],result=[];
        if (meter==='3/8') {
            if (!required&&random()<.2) return ['dotted-quarter'];
            for (let beat=0;beat<3;beat++) {
                const options=stage>=4?[['eighth'],['sixteenth','sixteenth'],['eighth-rest'],['sixteenth-rest','sixteenth']]:[['eighth'],['sixteenth','sixteenth']];
                result.push(...(required==='rest'&&beat===0?['eighth-rest']:pick(options,random)));
            }
        } else if (meter==='6/8') {
            for (let beat=0;beat<2;beat++) result.push(...(required==='rest'&&beat===0?pick(compoundRests,random):pick(stage>=4?compound.concat(compoundRests):compound,random)));
        } else {
            const beats=spec.units/4,forcedBeat=required==='triplet'?Math.floor(random()*beats):-1;
            if (required==='tie') result.push('tied-syncopation');
            if (!required&&meter==='4/4'&&stage===1&&random()<.08) return ['whole'];
            for (let beat=tokenUnits(result)/4;beat<beats;beat++) {
                if (beat===forcedBeat) { result.push('triplet');continue; }
                if (required==='rest'&&beat===0) { result.push(...pick(rests,random));continue; }
                // Long values begin on beat boundaries; all short patterns fill a whole beat.
                if (!required&&beat%2===0&&beat+2<=beats&&random()<.15) { result.push('half');beat++;continue; }
                result.push(...pick(stage===1?basic:stage>=4?advanced.concat(rests):advanced,random));
            }
        }
        // Never generate a completely silent measure.
        if (!result.some(id=>tokens[id].onsets.length)) {
            const index=result.findIndex(id=>id==='eighth-rest'||id==='quarter-rest');
            if (index>=0) result[index]=result[index]==='eighth-rest'?'eighth':'quarter';
        }
        return result;
    }
    function makeStage(stage,random=Math.random) {
        const meter=pick(stage<=2?['4/4','2/4']:stage===3?['6/8','3/4','3/8']:['4/4','2/4','3/4','6/8','3/8'],random);
        const required=stage===2?['triplet','tie']:stage===4?['rest',null]:[null,null];
        return { stage,meter,tempo:stage<3?84:76,measures:required.map(feature=>fillMeasure(stage,meter,random,feature)) };
    }
    function validMeasures(data,measures) {
        return !!meters[data?.meter]&&Array.isArray(measures)&&measures.length===2&&measures.every(sequence=>Array.isArray(sequence)&&sequence.length<=64&&sequence.every(id=>Object.hasOwn(tokens,id))&&tokenUnits(sequence)===meters[data.meter].units);
    }
    // Sustained notes can release halfway through the last beat, regardless of BPM.
    // Short ties still require 65% of their duration; onset accuracy is unchanged.
    // Share these bounds with the pad cue and the settlement validator.
    function holdReleaseWindow(event,tapStart=event.start) {
        const seconds=event.end-event.start,beatSeconds=seconds/event.beats;
        const earlyReleaseTolerance=Math.min(beatSeconds*.5,seconds*.35),lateReleaseTolerance=Math.min(.3,beatSeconds*.4,seconds*.35);
        const minimumHeldSeconds=seconds-earlyReleaseTolerance;
        return {earlyReleaseTolerance,lateReleaseTolerance,minimumHeldSeconds,earliestEnd:Math.max(event.end-earlyReleaseTolerance,tapStart+minimumHeldSeconds),latestEnd:event.end+lateReleaseTolerance};
    }
    function tapAnalysis(data,taps=[],holds=[]) {
        const {secondsPerUnit}=timing(data),targets=targetOnsets(data).map(unit=>unit*secondsPerUnit),used=new Set(),matches=[];
        let matched=0,totalError=0;
        targets.forEach(target=>{
            let best=-1,error=Infinity;
            taps.forEach((value,index)=>{const distance=Math.abs(value-target);if(!used.has(index)&&distance<error){best=index;error=distance;}});
            if (best>=0&&error<=.11) { used.add(best);matched++;totalError+=error;matches.push({tapIndex:best,error}); }
            else matches.push({tapIndex:-1,error:Infinity});
        });
        const accuracy=targets.length?matched/targets.length:0,extras=taps.length-matched,missed=targets.length-matched,averageError=matched?totalError/matched:Infinity;
        const holdMatches=holdTargets(data).filter(event=>event.required).map(event=>{
            const match=matches[event.index],release=holds.find(hold=>hold.tapIndex===match.tapIndex);
            const window=holdReleaseWindow(event,match.tapIndex>=0?taps[match.tapIndex]:event.start),endError=release?release.end-event.end:Infinity;
            const heldDuration=release?release.end-taps[match.tapIndex]:0;
            return {...event,...window,endError,heldDuration,passed:match.tapIndex>=0&&!!release&&!release.cancelled&&release.end>=window.earliestEnd-1e-7&&release.end<=window.latestEnd+1e-7};
        });
        const holdErrors=holdMatches.filter(hold=>!hold.passed).map(hold=>hold.index);
        return {secondsPerUnit,targets,used,matches,matched,accuracy,extras,missed,averageError,holdMatches,holdErrors,passed:accuracy>=.9&&extras<=1&&missed<=1&&averageError<=.08&&!holdErrors.length};
    }
    return Object.freeze({ meters,tokens,timing,targetOnsets,sameOnsets,soundEvents,holdTargets,holdReleaseWindow,availableTokens,fillMeasure,makeStage,validMeasures,tapAnalysis });
})();
