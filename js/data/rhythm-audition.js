'use strict';

// One unit is a sixteenth note. BPM always refers to the displayed beat unit.
const RHYTHM_AUDITION_DATA = (() => {
    const meters = {
        '4/4': { units:16, pulse:4, beats:4, beamUnits:4, beatLabel:'四分音符', beatSymbol:'♩', accents:['strong','weak','secondary','weak'] },
        '2/4': { units:8, pulse:4, beats:2, beamUnits:4, beatLabel:'四分音符', beatSymbol:'♩', accents:['strong','weak'] },
        '3/4': { units:12, pulse:4, beats:3, beamUnits:4, beatLabel:'四分音符', beatSymbol:'♩', accents:['strong','weak','weak'] },
        // Training/metronome counts six eighth-note pulses, as in the user video.
        // Musical grouping is still compound duple (3 + 3), not three quarters.
        '6/8': { units:12, pulse:2, beats:6, beamUnits:6, beatLabel:'八分音符', beatSymbol:'♪', accents:['strong','weak','weak','secondary','weak','weak'] },
        '3/8': { units:6, pulse:2, beats:3, beamUnits:6, beatLabel:'八分音符', beatSymbol:'♪', accents:['strong','weak','weak'] }
    };
    const tokens = {
        whole:{ units:16, onsets:[0], durations:[16], levels:[0], label:'全音符' },
        half:{ units:8, onsets:[0], durations:[8], levels:[0], label:'二分音符' },
        quarter:{ units:4, onsets:[0], durations:[4], levels:[0], label:'四分音符' },
        'dotted-quarter':{ units:6, onsets:[0], durations:[6], levels:[0], dots:[0], label:'附点四分' },
        eighth:{ units:2, onsets:[0], durations:[2], levels:[1], label:'八分音符' },
        sixteenth:{ units:1, onsets:[0], durations:[1], levels:[2], label:'十六分音符' },
        'eighth-pair':{ units:4, onsets:[0,2], durations:[2,2], levels:[1,1], label:'两个八分' },
        'four-sixteenth':{ units:4, onsets:[0,1,2,3], durations:[1,1,1,1], levels:[2,2,2,2], label:'四个十六分' },
        'eighth-two-sixteenth':{ units:4, onsets:[0,2,3], durations:[2,1,1], levels:[1,2,2], label:'前八后十六' },
        'two-sixteenth-eighth':{ units:4, onsets:[0,1,2], durations:[1,1,2], levels:[2,2,1], label:'前十六后八' },
        syncopation:{ units:4, onsets:[0,1,3], durations:[1,2,1], levels:[2,1,2], label:'十六切分' },
        triplet:{ units:4, onsets:[0,4/3,8/3], durations:[4/3,4/3,4/3], levels:[1,1,1], tuplet:3, label:'八分三连音' },
        'dotted-eighth-sixteenth':{ units:4, onsets:[0,3], durations:[3,1], levels:[1,2], dots:[0], label:'附点八分后十六' },
        'sixteenth-dotted-eighth':{ units:4, onsets:[0,1], durations:[1,3], levels:[2,1], dots:[1], label:'十六后附点八分' },
        'tied-eighths':{ units:4, onsets:[0], durations:[2,2], levels:[1,1], ties:[0], label:'八分延音线' },
        'tied-syncopation':{ units:8, onsets:[0,2,6], durations:[2,2,2,2], levels:[1,1,1,1], ties:[1], label:'跨拍切分 · 延音线' },
        'quarter-rest':{ units:4, onsets:[], label:'四分休止' },
        'eighth-rest':{ units:2, onsets:[], label:'八分休止' },
        'sixteenth-rest':{ units:1, onsets:[], label:'十六分休止' }
    };
    const basic = [['quarter'],['eighth-pair']];
    const advanced = basic.concat([['four-sixteenth'],['eighth-two-sixteenth'],['two-sixteenth-eighth'],['syncopation'],['triplet'],['dotted-eighth-sixteenth'],['sixteenth-dotted-eighth'],['tied-eighths']]);
    const rests = [['quarter-rest'],['eighth-rest','eighth'],['eighth','eighth-rest'],['eighth-rest','sixteenth','sixteenth'],['sixteenth','sixteenth-rest','eighth']];
    const compound = [['dotted-quarter'],['quarter','eighth'],['eighth','quarter'],['eighth','eighth','eighth'],['eighth-two-sixteenth','eighth'],['two-sixteenth-eighth','eighth'],['eighth','eighth-two-sixteenth'],['tied-eighths','eighth']];
    const compoundRests = [['quarter-rest','eighth'],['eighth','quarter-rest'],['eighth-rest','eighth','eighth'],['eighth','eighth-rest','eighth'],['eighth','eighth','eighth-rest']];
    for (const meter of Object.values(meters)) { Object.freeze(meter.accents); Object.freeze(meter); }
    for (const token of Object.values(tokens)) { for (const value of Object.values(token)) if (Array.isArray(value)) Object.freeze(value); Object.freeze(token); }
    return Object.freeze({ meters:Object.freeze(meters), tokens:Object.freeze(tokens), basic, advanced, rests, compound, compoundRests });
})();
