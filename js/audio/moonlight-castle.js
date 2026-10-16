'use strict';
const CastleAudio = (() => {
  let enabled = true, volume = .4, key = '', active = false, context = null, master = null, voices = new Set(), blocked = false, epoch = 0;
  const effects=new Map();
  let volumeFrame=0,bgmTarget=-1,dialoguePlaying=false;
  const audio = new Audio();audio.loop=true;audio.preload='none';audio.id='castleBgm';
  const tracks={'loop-one':'第一周目 · 古堡来客','loop-two':'第二周目 · 月光倒影','loop-three':'第三周目 · 最后的回信','wrong-end':'Wrong Ending','sunrise':'日出之后'};
  try {const p=JSON.parse(localStorage.getItem('hjm-moonlight-audio-v1'));if(p){enabled=p.enabled!==false;volume=Number.isFinite(p.volume)?Math.max(0,Math.min(1,p.volume)):.4;}} catch {}
  function paint() {
    const b=document.getElementById('castle-sound');if(!b)return;
    b.textContent=!enabled?'♪ 已静音':blocked?'♪ 点此重试':'♪ 声音';b.setAttribute('aria-pressed',String(enabled));
    b.setAttribute('aria-label',enabled?'关闭古堡全部声音':'开启古堡全部声音');
    document.getElementById('music-title').textContent=tracks[key]||'配乐将在进入后播放';
  }
  function mix(immediate=false){
    const next=volume*(dialoguePlaying ? .2 : voices.size ? .42 : 1);
    if(!immediate&&next===bgmTarget)return;
    bgmTarget=next;window.cancelAnimationFrame(volumeFrame);volumeFrame=0;
    if(immediate){audio.volume=next;return;}
    const from=audio.volume,start=performance.now(),duration=next<from?55:260;
    const step=now=>{const progress=Math.min(1,(now-start)/duration);audio.volume=Math.max(0,Math.min(1,from+(next-from)*progress));if(progress<1)volumeFrame=window.requestAnimationFrame(step);else volumeFrame=0;};
    volumeFrame=window.requestAnimationFrame(step);
  }
  function stopVoices(){epoch++;for(const v of voices){try{v.stop();}catch{}}voices.clear();mix(true);}
  function sync(next=key) {
    if(next!==key){key=next;audio.src='assets/audio/moonlight-castle/'+key+'.mp3';blocked=false;}
    mix();
    if(master)master.gain.value=volume;
    if(!active||!enabled||CastleClock.paused){audio.pause();stopVoices();paint();if(typeof CastleVoice!=='undefined')CastleVoice.sync();return;}
    if(!volume)stopVoices();
    if(audio.paused) audio.play().then(()=>{blocked=false;paint();}).catch(()=>{blocked=true;paint();});
    paint();
    if(typeof CastleVoice!=='undefined')CastleVoice.sync();
  }
  function preferences(){try{localStorage.setItem('hjm-moonlight-audio-v1',JSON.stringify({enabled,volume}));}catch{}}
  function toggle(){enabled=blocked?true:!enabled;blocked=false;preferences();sync();}
  function canPlay(){return active&&enabled&&volume>0&&!CastleClock.paused;}
  function play(build){
    if(!canPlay())return false;
    try {
      const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
      if(!context){
        context=new AC();master=context.createGain();master.gain.value=volume;
        const limiter=context.createDynamicsCompressor();limiter.threshold.value=-6;limiter.knee.value=6;limiter.ratio.value=6;limiter.attack.value=.003;limiter.release.value=.15;
        master.connect(limiter);limiter.connect(context.destination);
      }
      const token=epoch;
      const start=()=>{if(token===epoch&&canPlay())build();};
      if(context.state==='running')start();else context.resume().then(start).catch(()=>{});
      return true;
    }catch{return false;}
  }
  function track(source,output){
    voices.add(source);mix();source.onended=()=>{voices.delete(source);source.disconnect();output?.disconnect();mix();};
  }
  function tone(freq) {
    if(!Number.isFinite(freq)||freq<=0)return false;
    return play(()=>{
      const o=context.createOscillator(),g=context.createGain(),t=context.currentTime;
      o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.18,t+.015);g.gain.exponentialRampToValueAtTime(.001,t+.6);
      o.connect(g);g.connect(master);track(o,g);o.start(t);o.stop(t+.62);
    });
  }
  function effect(id,delay=0){
    if(!CastleSfx.ids.includes(id))return false;
    return play(()=>{
      if(!effects.has(id)){
        const samples=CastleSfx.render(id,context.sampleRate),buffer=context.createBuffer(1,samples.length,context.sampleRate);
        buffer.copyToChannel(samples,0);effects.set(id,buffer);
      }
      const source=context.createBufferSource(),gain=context.createGain();source.buffer=effects.get(id);gain.gain.value=1.15;
      source.connect(gain);gain.connect(master);track(source,gain);source.start(context.currentTime+Math.max(0,delay));
    });
  }
  return {sync,toggle,tone,effect,start(){active=true;sync();},stop(){active=false;audio.pause();stopVoices();if(typeof CastleVoice!=='undefined')CastleVoice.stop();},setVolume(value){if(!Number.isFinite(value))return;volume=Math.max(0,Math.min(1,value));preferences();sync();},dialogueActive(value){const next=!!value;if(next!==dialoguePlaying){dialoguePlaying=next;mix();}},get audible(){return canPlay();},get enabled(){return enabled;},get volume(){return volume;},audio};
})();
