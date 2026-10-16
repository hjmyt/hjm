'use strict';
// Locally synthesized Foley and resonant strings: no downloads or extra media.
const CastleSfx = (() => {
  const durations = {'piano-unlock':2.5,unlock:.8,door:1.3,locked:.45,mechanism:1.05,glass:.9,'music-box':1.65,'tuning-wolf':1.5,'tuning-pure':1.5,'tuning-tritone':1.5,
    'touch-piano':.65,'touch-metal':.38,'touch-cloth':.42,'touch-flame':.5,
    'touch-wood':.36,'touch-clockwork':.55,'touch-glass':.48,'touch-paper':.46,
    'touch-flute':.6,'touch-harpsichord':.7,'touch-wine':.58,'touch-organ':.85};
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
    if(id==='touch-piano'){
      ring(0,.6,130.81,.3,6,.16);ring(.015,.5,196,.12,7,.1);scrape(0,.045,.25,1400);
    }else if(id==='touch-metal'){
      ring(0,.34,640,.24,13,.5);ring(.025,.3,1177,.15,15,.3);scrape(0,.07,.25,4600);
    }else if(id==='touch-cloth'){
      scrape(0,.23,.75,2400);scrape(.15,.23,.5,3600);
    }else if(id==='touch-flame'){
      scrape(0,.3,.7,1500);scrape(.17,.22,.45,4800);ring(.02,.15,180,.1,20);
    }else if(id==='touch-wood'){
      ring(0,.2,155,.32,21,.15);ring(.075,.22,228,.22,20,.2);scrape(0,.22,.36,900);
    }else if(id==='touch-clockwork'){
      scrape(0,.3,.4,900);ring(.035,.19,820,.22,27,.25);ring(.18,.23,1090,.18,23,.25);
    }else if(id==='touch-glass'){
      ring(0,.42,1670,.23,10,.1);ring(.015,.4,2470,.14,12,.2);scrape(0,.035,.22,4800);
    }else if(id==='touch-paper'){
      scrape(0,.16,.7,4200);scrape(.12,.19,.65,2300);scrape(.28,.13,.5,5500);
    }else if(id==='touch-flute'){
      ring(0,.5,523.25,.26,7,.02);ring(.01,.44,1046.5,.045,9);scrape(0,.2,.2,1300);
    }else if(id==='touch-harpsichord'){
      ring(0,.64,207.65,.27,7,.6);ring(.012,.5,415.3,.1,9,.3);scrape(0,.035,.22,5000);
    }else if(id==='touch-wine'){
      ring(0,.45,740,.23,10,.3);ring(.06,.45,1180,.17,12,.2);scrape(.02,.28,.34,650);
    }else if(id==='touch-organ'){
      ring(0,.78,98,.28,4,.1);ring(.015,.75,196,.15,5,.06);scrape(0,.3,.19,700);
    }else if(id==='piano-unlock'){
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
