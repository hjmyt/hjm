'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'js/audio/rhythm-audition-voices.js'),'utf8');
const context=vm.createContext({atob:value=>Buffer.from(value,'base64').toString('binary')});
vm.runInContext(source+';globalThis.voices=RHYTHM_AUDITION_VOICES;',context);
const voices=context.voices;
const buffers=voices.createBuffers({createBuffer(channels,frames,sampleRate){
    assert.equal(channels,1);assert.equal(sampleRate,44100);
    const samples=new Float32Array(frames);
    return {duration:frames/sampleRate,getChannelData:()=>samples};
}});

function rms(samples){return Math.sqrt(samples.reduce((sum,value)=>sum+value*value,0)/samples.length);}
function dominantFrequency(samples){
    const size=16384,real=new Float64Array(size),imag=new Float64Array(size);
    samples.slice(0,size).forEach((value,index)=>real[index]=value*(.5-.5*Math.cos(2*Math.PI*index/(Math.min(size,samples.length)-1))));
    for(let i=1,j=0;i<size;i++){
        let bit=size>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;
        if(i<j)[real[i],real[j]]=[real[j],real[i]];
    }
    for(let length=2;length<=size;length*=2){
        const angle=-2*Math.PI/length;
        for(let start=0;start<size;start+=length)for(let offset=0;offset<length/2;offset++){
            const a=start+offset,b=a+length/2,cos=Math.cos(angle*offset),sin=Math.sin(angle*offset);
            const re=real[b]*cos-imag[b]*sin,im=real[b]*sin+imag[b]*cos;
            real[b]=real[a]-re;imag[b]=imag[a]-im;real[a]+=re;imag[a]+=im;
        }
    }
    let best=0,power=0;
    for(let index=1;index<size/2;index++){const current=real[index]**2+imag[index]**2;if(current>power){best=index;power=current;}}
    return best*44100/size;
}
for(const [name,buffer] of Object.entries(buffers)){
    const samples=buffer.getChannelData(0),peak=Math.max(...samples.map(Math.abs));
    assert(peak>.92&&peak<.95,`${name} is normalized near full scale without clipping`);
    assert.equal(samples[0],0);assert.equal(samples.at(-1),0);
    assert(Math.abs(samples.reduce((sum,value)=>sum+value,0)/samples.length)<.005,`${name} has no significant DC offset`);
    if(!name.startsWith('countIn'))assert(rms(samples.slice(0,882))>rms(samples.slice(-882))*4,`${name} has natural percussive decay, not an oscillator plateau`);
}
const peaks=Object.fromEntries(Object.entries(buffers).map(([name,buffer])=>[name,dominantFrequency(buffer.getChannelData(0))]));
assert(peaks.accent>2300&&peaks.accent<2500,'Accent matches the recorded high click');
assert(peaks.normal>650&&peaks.normal<800,'Ordinary beat matches the recorded low click');
assert(peaks.tap>1000&&peaks.tap<1200,'Player/score sample is distinct from both metronome pitches');
assert(peaks.countIn>1600&&peaks.countIn<1700,'Pre-roll restores the former 1680 Hz metallic cue');
assert(peaks.countInAccent>1900&&peaks.countInAccent<2000,'Pre-roll retains its raised first-beat cue');
assert.equal(buffers.countIn.duration,.09);
assert.equal(buffers.countInAccent.duration,.09);
assert.equal(voices.profiles.countIn.waveform,'legacy-metallic');
assert.notEqual(voices.profiles.countIn.sample,voices.profiles.metronome.sample,'Pre-roll and formal metronome use separate sounds');
assert.equal(voices.profiles.rhythm.sample,'tap');
assert(!source.includes('fetch('),'Click bank works from file:// with no asynchronous audio download');

(async()=>{
    const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
    try{
        const page=await browser.newPage();
        await page.goto(pathToFileURL(path.join(root,'index.html')).href);
        async function render(includeOverlap){return page.evaluate(async includeOverlap=>{
            const rate=44100,context=new OfflineAudioContext(1,rate*12,rate),bank=RHYTHM_AUDITION_VOICES,buffers=bank.createBuffers(context);
            const {output,guard}=bank.createOutput(context);
            for(const value of [-.9,-.5,0,.5,.9]){
                const index=Math.round((value+1)/2*(guard.curve.length-1));
                if(Math.abs(guard.curve[index]-value)>.0003)throw Error('Peak guard changed an ordinary sample');
            }
            const beat=60/95,levels=[1,.9,.96,.9];
            for(let index=0;index<4;index++)bank.play(context,buffers,index===0?'countInAccent':'countIn',.1+index*beat,levels[index],output);
            const formalStart=.1+beat*4;
            for(let index=0;index<4;index++)bank.play(context,buffers,index===0?'accent':'normal',formalStart+index*beat,levels[index],output);
            const start=formalStart+beat*4;
            for(const unit of [0,1,1.5,2,3,3.5,4,4.5,5,6,6.5,7])bank.play(context,buffers,'tap',start+unit*beat,1,output);
            // Include overlapping reference clicks/player feedback in the last measure.
            const overlapStart=10;
            for(let index=0;includeOverlap&&index<2;index++){
                bank.play(context,buffers,index===0?'accent':'normal',overlapStart+index*beat,levels[index],output);
                bank.play(context,buffers,'tap',overlapStart+index*beat,1,output);
            }
            const audio=await context.startRendering();return Array.from(audio.getChannelData(0));
        },includeOverlap);}
        const rendered=await render(true);
        assert(rendered.every(Number.isFinite),'Rendered sample output is finite');
        const peak=rendered.reduce((maximum,value)=>Math.max(maximum,Math.abs(value)),0);
        assert(peak<=1,`Overlapping beats stay within digital full scale: ${peak}`);
        const preview=await render(false),wav=Buffer.alloc(44+preview.length*2),rate=44100;
        wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(rendered.length*2,40);
        preview.forEach((value,index)=>wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,value))*32767),44+index*2));
        fs.writeFileSync('/tmp/hjm-rhythm-voices-preview.wav',wav);
        console.log(`rhythm audition voices ok: reference PCM, ${JSON.stringify(peaks)}, decay, near-full-scale peaks and overlap peak ${peak.toFixed(3)}`);
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
