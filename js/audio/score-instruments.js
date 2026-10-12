'use strict';

// Prefer local sampled instruments; synthesis remains a loading-failure fallback.
const ScoreInstrumentAudio = (() => {
    const profiles = {
        violin: {primary:'sawtooth',color:'triangle',harmonic:2,cutoff:3100,attack:.055,release:.14,vibrato:5.5,depth:9,peak:.12,sustain:.105},
        viola: {primary:'sawtooth',color:'triangle',harmonic:2,cutoff:2200,attack:.07,release:.16,vibrato:5.1,depth:8,peak:.12,sustain:.105},
        cello: {primary:'sawtooth',color:'sine',harmonic:2,cutoff:1550,attack:.085,release:.19,vibrato:4.7,depth:10,peak:.13,sustain:.115},
        contrabass: {primary:'sawtooth',color:'sine',harmonic:2,cutoff:950,attack:.095,release:.2,vibrato:4.2,depth:5,peak:.14,sustain:.12},
        flute: {primary:'sine',color:'sine',harmonic:2,cutoff:5500,attack:.045,release:.10,vibrato:5.4,depth:7,peak:.16,sustain:.145},
        recorder: {primary:'sine',color:'triangle',harmonic:3,cutoff:3800,attack:.025,release:.08,vibrato:5,depth:1,peak:.15,sustain:.13},
        'bamboo-flute': {primary:'sine',color:'triangle',harmonic:2,cutoff:4600,attack:.03,release:.1,vibrato:5.7,depth:10,peak:.15,sustain:.13},
        oboe: {primary:'square',color:'sawtooth',harmonic:2,cutoff:2800,attack:.035,release:.09,vibrato:5.6,depth:5,peak:.085,sustain:.075},
        'alto-saxophone': {primary:'sawtooth',color:'square',harmonic:2,cutoff:1900,attack:.04,release:.12,vibrato:5,depth:8,peak:.11,sustain:.095}
    };
    Object.values(profiles).forEach(Object.freeze);Object.freeze(profiles);
    const voice = instrument => profiles[instrument] || profiles.violin;
    function play(context, output, instrument, hz, when, duration, volume=.12, register=n=>n){
        const sampled=ScoreSampleBank.play(context,output,instrument,hz,when,duration,volume,register);
        if(sampled)return sampled;
        const v=voice(instrument), start=Math.max(context.currentTime+.002,when), length=duration===null?null:Math.max(.025,duration);
        const attack=length===null?v.attack:Math.min(v.attack,length*.3), scale=volume/.12;
        const main=register(context.createOscillator()), color=register(context.createOscillator()), vibrato=register(context.createOscillator());
        const gain=context.createGain(), blend=context.createGain(), depth=context.createGain(), filter=context.createBiquadFilter();
        main.type=v.primary;color.type=v.color;main.frequency.value=hz;color.frequency.value=hz*v.harmonic;
        blend.gain.value=.18;filter.type='lowpass';filter.frequency.value=v.cutoff;filter.Q.value=.65;
        vibrato.frequency.value=v.vibrato;depth.gain.setValueAtTime(0,start);depth.gain.linearRampToValueAtTime(v.depth,start+.25);
        vibrato.connect(depth);depth.connect(main.detune);depth.connect(color.detune);
        main.connect(filter);color.connect(blend).connect(filter);filter.connect(gain).connect(output);
        gain.gain.setValueAtTime(.0001,start);gain.gain.linearRampToValueAtTime(v.peak*scale,start+attack);
        gain.gain.linearRampToValueAtTime(v.sustain*scale,start+attack*1.5);
        let released=false,remaining=3;
        const nodes=[main,color,vibrato];
        for(const node of nodes){node.addEventListener('ended',()=>{node.disconnect();if(--remaining===0)for(const n of [gain,blend,depth,filter])n.disconnect();},{once:true});node.start(start);}
        function release(at=context.currentTime){
            if(released)return;released=true;at=Math.max(start+attack*1.5,at);
            gain.gain.cancelScheduledValues(at);gain.gain.setValueAtTime(v.sustain*scale,at);gain.gain.exponentialRampToValueAtTime(.0001,at+v.release);
            nodes.forEach(n=>n.stop(at+v.release+.01));
        }
        if(length!==null)release(start+length);
        return {release};
    }
    return Object.freeze({voice,play,profiles,prepare:ScoreSampleBank.prepare,ready:ScoreSampleBank.ready});
})();
