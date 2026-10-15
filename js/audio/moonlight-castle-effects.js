'use strict';
// Locally synthesized Foley and resonant strings: no downloads or extra media.
const CastleSfx = (() => {
  const durations = {'piano-unlock':2.5,unlock:.8,door:1.3,locked:.45,mechanism:1.05,glass:.9,'music-box':1.65,'tuning-wolf':1.5,'tuning-pure':1.5,'tuning-tritone':1.5};
  function render(id,rate) {
    if(!Object.hasOwn(durations,id))return null;
    const data=new Float32Array(Math.ceil(durations[id]*rate));
    let seed=173;
    const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
    function ring(start,length,freq,level,decay=5,inharmonic=0){
      const offset=Math.floor(start*rate),count=Math.min(Math.ceil(length*rate),data.length-offset);
      for(let i=0;i<count;i++){
        const t=i/rate,attack=Math.min(1,t/.004),tail=Math.min(1,(count-i)/(rate*.03));
        const wave=Math.sin(2*Math.PI*freq*t)+.35*Math.sin(2*Math.PI*freq*2.003*t)+inharmonic*Math.sin(2*Math.PI*freq*3.71*t);
        data[offset+i]+=level*attack*tail*Math.exp(-decay*t)*wave;
      }
    }
    function scrape(start,length,level,cutoff=1200){
      const offset=Math.floor(start*rate),count=Math.min(Math.ceil(length*rate),data.length-offset);
      let filtered=0;const blend=1-Math.exp(-2*Math.PI*cutoff/rate);
      for(let i=0;i<count;i++){
        const t=i/count;filtered+=blend*(noise()-filtered);
        data[offset+i]+=filtered*level*Math.sin(Math.PI*t)**2;
      }
    }
    function latch(start=0){
      // Two metal contacts, followed by the low sliding bolt.
      ring(start,.11,1850,.2,48,.35);scrape(start,.045,.32,5500);
      ring(start+.14,.13,1160,.16,35,.3);scrape(start+.14,.045,.26,4300);
      ring(start+.27,.29,105,.22,15,.15);scrape(start+.23,.18,.25,700);
    }
    if(id==='piano-unlock'){
      for(const [freq,level]of [[65.406,.3],[98,.12],[130.813,.17],[196,.07],[261.626,.06]])ring(0,2.35,freq,level,1.9,.12);
      scrape(0,.055,.17,2300);latch(.62);
    }else if(id==='unlock')latch();
    else if(id==='door'){
      ring(0,.22,82,.18,17,.15);
      // Slowly bending wood/hinge harmonics with irregular friction.
      for(let i=0;i<Math.floor(rate*1.05);i++){
        const t=i/rate,env=Math.sin(Math.PI*t/1.05)**2;
        const phase=2*Math.PI*(122*t+17*t*t+1.8*Math.sin(14*t));
        data[i]+=.15*env*(Math.sin(phase)+.28*Math.sin(phase*2.91));
      }
      scrape(.06,.95,.22,1100);ring(1.03,.25,68,.16,15,.1);
    }else if(id==='locked'){
      ring(0,.14,145,.16,28,.2);ring(.13,.16,172,.12,27,.25);scrape(.01,.25,.17,1600);
    }else if(id==='mechanism'){
      scrape(0,.52,.3,620);ring(.08,.45,78,.13,10,.1);latch(.36);
    }else if(id==='glass'){
      scrape(0,.12,.36,8500);
      for(const [i,freq]of [1870,2467,3311,4289,6123].entries())ring(.016*i,.55,freq,.12,12,.12);
      scrape(.1,.55,.1,6500);
    }else if(id==='music-box'){
      for(const [i,freq]of [523.25,659.25,783.99,1046.5].entries())ring(i*.24,.8,freq,.17,5,.28);
    }else{
      const upper={'tuning-wolf':622.25,'tuning-pure':622.5,'tuning-tritone':586.9}[id];
      ring(0,1.42,415,.2,2.8,.18);ring(0,1.42,id==='tuning-wolf'?upper+8:upper,.2,2.8,.18);
    }
    // Short room reflections, already included in the buffer so stop is atomic.
    const dry=data.slice();
    for(const [delay,gain]of [[.067,.14],[.113,.085],[.173,.045]]){
      const offset=Math.floor(delay*rate);for(let i=offset;i<data.length;i++)data[i]+=dry[i-offset]*gain;
    }
    let peak=0;for(const value of data)peak=Math.max(peak,Math.abs(value));
    const gain=peak>.72?.72/peak:1;
    for(let i=0;i<data.length;i++)data[i]*=gain*Math.min(1,(data.length-1-i)/(rate*.035));
    return data;
  }
  return {render,ids:Object.freeze(Object.keys(durations))};
})();
