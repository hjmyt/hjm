'use strict';

const ScoreSampleBank = (() => {
    const encoded=new Map(), loading=new Map(), contexts=new WeakMap();
    const base=new URL('../../',document.currentScript.src);
    function register(id,notes){if(SCORE_SAMPLE_MANIFEST[id])encoded.set(id,notes);}
    function load(id){
        if(encoded.has(id))return Promise.resolve(encoded.get(id));
        if(loading.has(id))return loading.get(id);
        const info=SCORE_SAMPLE_MANIFEST[id];
        if(!info)return Promise.reject(Error('No sampled instrument: '+id));
        const promise=new Promise((resolve,reject)=>{
            const script=document.createElement('script');let timer;
            const done=error=>{clearTimeout(timer);script.remove();error?reject(error):resolve(encoded.get(id));};
            script.src=new URL(info.path+'?v='+info.version,base).href;
            script.onload=()=>done(encoded.has(id)?null:Error('Invalid sample bank'));
            script.onerror=()=>done(Error('Instrument load failed'));
            timer=setTimeout(()=>done(Error('Instrument load timed out')),15000);
            document.head.append(script);
        }).catch(error=>{loading.delete(id);throw error;});
        loading.set(id,promise);return promise;
    }
    function cache(context){if(!contexts.has(context))contexts.set(context,new Map());return contexts.get(context);}
    function compact(context,source){
        // Keep the attack; crossfade a sustained region for arbitrarily long score notes.
        const rate=24000, end=Math.min(1.65,source.duration-.1), start=Math.min(.65,end*.4), fade=.08;
        const out=context.createBuffer(1,Math.floor(end*rate),rate), data=out.getChannelData(0);
        const channels=Array.from({length:source.numberOfChannels},(_,i)=>source.getChannelData(i));
        const read=t=>{const at=Math.min(source.length-2,t*source.sampleRate),i=Math.floor(at),f=at-i;return channels.reduce((sum,c)=>sum+c[i]*(1-f)+c[i+1]*f,0)/channels.length;};
        for(let i=0;i<data.length;i++){
            const t=i/rate,blend=Math.max(0,(t-(end-fade))/fade);
            data[i]=read(t)*(1-blend)+read(start-fade+Math.max(0,t-end+fade))*blend;
        }
        let energy=0,peak=0;for(const v of data){energy+=v*v;peak=Math.max(peak,Math.abs(v));}
        const scale=Math.min(3,.18/Math.max(.001,Math.sqrt(energy/data.length)),.9/Math.max(.001,peak));
        for(let i=0;i<data.length;i++)data[i]*=scale;
        return {buffer:out,loopStart:start,loopEnd:data.length/rate};
    }
    async function prepare(context,instruments){
        if(!context)return false;
        const entries=cache(context);
        const results=await Promise.all([...new Set(instruments)].map(async id=>{
            if(!SCORE_SAMPLE_MANIFEST[id])return false;
            let item=entries.get(id);
            if(!item){
                item={notes:null,promise:null};entries.set(id,item);
                item.promise=(async()=>{
                    const raw=await load(id),notes=new Map();
                    // Decode sequentially to bound temporary memory on phones.
                    for(const [key,value] of Object.entries(raw)){
                        const bytes=Uint8Array.from(atob(value),c=>c.charCodeAt(0));
                        const decoded=await context.decodeAudioData(bytes.buffer);
                        notes.set(Number(key),compact(context,decoded));
                    }
                    item.notes=notes;return true;
                })().catch(()=>{entries.delete(id);return false;});
            }
            return item.promise;
        }));
        return results.every(Boolean);
    }
    function ready(context,instruments){return !!context&&instruments.every(id=>cache(context).get(id)?.notes);}
    function play(context,output,instrument,hz,when,duration,volume,register){
        const notes=cache(context).get(instrument)?.notes;if(!notes)return null;
        const midi=69+12*Math.log2(hz/440),root=[...notes.keys()].reduce((a,b)=>Math.abs(a-midi)<Math.abs(b-midi)?a:b),sample=notes.get(root);
        const source=register(context.createBufferSource()),gain=context.createGain(),start=Math.max(context.currentTime+.002,when);
        source.buffer=sample.buffer;source.playbackRate.value=2**((midi-root)/12);source.loop=true;source.loopStart=sample.loopStart;source.loopEnd=sample.loopEnd;
        const level=volume/.12*.65;
        gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(level,start+.006);
        source.connect(gain).connect(output);source.addEventListener('ended',()=>{source.disconnect();gain.disconnect();},{once:true});source.start(start);
        let released=false;
        function release(at=context.currentTime){if(released)return;released=true;at=Math.max(start+.01,at);gain.gain.cancelScheduledValues(at);gain.gain.setValueAtTime(level,at);gain.gain.exponentialRampToValueAtTime(.0001,at+.1);source.stop(at+.11);}
        if(duration!==null)release(start+Math.max(.025,duration));
        return {release,sampled:true};
    }
    return Object.freeze({register,prepare,ready,play});
})();
