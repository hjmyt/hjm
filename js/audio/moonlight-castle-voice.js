'use strict';
const CastleVoice = (() => {
  const player=new Audio();player.id='castleVoice';player.preload='none';
  let enabled=true,level=1,line=null,pending=false,blocked=false,epoch=0,sequence=0,starting=false,inModal=false;
  const continuations=new Set();
  try{const saved=JSON.parse(localStorage.getItem('hjm-moonlight-voice-v1'));if(saved){enabled=saved.enabled!==false;level=Number.isFinite(saved.volume)?Math.max(0,Math.min(1,saved.volume)):1;}}catch{}
  const normalize=text=>String(text).replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
  function paint(){
    const toggle=document.getElementById('castle-voice-toggle');
    for(const id of ['castle-voice-replay','overlay-voice-replay','modal-voice-replay']){const replay=document.getElementById(id);if(replay){replay.hidden=!line;replay.textContent=blocked?'↻ 重试配音':'▶ 重听';replay.setAttribute('aria-label',blocked?'重试本句配音':line?.language==='es'?'重听本句西班牙语配音':'重听本句配音');}}
    if(toggle){toggle.setAttribute('aria-pressed',String(enabled));toggle.textContent=enabled?'西语配音：开启':'西语配音：关闭';}
    const volume=document.getElementById('castle-voice-volume');if(volume&&document.activeElement!==volume)volume.value=Math.round(level*100);
  }
  function duck(value){CastleAudio.dialogueActive(value);}
  function stop(clear=false){epoch++;if(clear){sequence++;continuations.clear();}starting=false;pending=false;player.pause();try{player.currentTime=0;}catch{}duck(false);if(clear){line=null;inModal=false;}blocked=false;paint();}
  function sync(){
    player.volume=Math.min(1,CastleAudio.volume*2)*level;
    if(!pending||!line||!enabled||!level||!CastleAudio.audible||blocked){player.pause();duck(false);paint();return;}
    if(!player.paused){duck(true);return;}
    if(starting)return;
    const token=epoch;starting=true;duck(true);
    player.play().then(()=>{
      if(token!==epoch)return;
      starting=false;
      if(pending&&enabled&&level&&CastleAudio.audible){duck(true);blocked=false;}else{player.pause();duck(false);}
      paint();
    }).catch(()=>{if(token!==epoch)return;starting=false;blocked=true;duck(false);paint();});
  }
  function remember(text,autoplay=false){
    sequence++;continuations.clear();stop();inModal=false;line=CASTLE_VOICE_LINES[normalize(text)]||null;
    player.lang=line?.language||'es';
    if(line&&autoplay){player.src=line.asset;pending=true;sync();}paint();
  }
  function replay(){if(!line)return;const current=line;stop();line=current;if(!enabled){enabled=true;preferences();}player.src=line.asset;pending=true;sync();}
  function preferences(){try{localStorage.setItem('hjm-moonlight-voice-v1',JSON.stringify({enabled,volume:level}));}catch{}}
  function afterSpeech(callback,minimum){
    const token={sequence};continuations.add(token);
    const check=()=>{
      if(token.sequence!==sequence){continuations.delete(token);return;}
      // Wait for actual playback, including buffering and explicit replay. The
      // paused castle clock also holds this continuation in the background.
      if(pending&&enabled&&level&&CastleAudio.audible&&!blocked){CastleClock.later(check,250);return;}
      continuations.delete(token);callback();
    };
    CastleClock.later(check,minimum);
  }
  player.addEventListener('ended',()=>{if(!player.ended)return;pending=false;duck(false);paint();});
  player.addEventListener('error',()=>{if(!pending||!player.error)return;blocked=true;starting=false;player.pause();duck(false);paint();});
  window.addEventListener('pagehide',()=>stop());
  return {
    speak(text,modal=false){remember(text,true);inModal=modal&&!!line;},remember,stop,sync,replay,player,
    closeModal(){if(inModal)stop(true);},
    afterSpeech,
    toggle(){enabled=!enabled;preferences();if(!enabled)stop();else paint();},
    setVolume(value){if(!Number.isFinite(value))return;level=Math.max(0,Math.min(1,value));preferences();sync();},
    get enabled(){return enabled;},get volume(){return level;},get current(){return line;},
    get busy(){return continuations.size>0||pending&&enabled&&level&&CastleAudio.audible&&!blocked;}
  };
})();
