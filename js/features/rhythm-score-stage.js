'use strict';

// Score songs are registered after ScoreAuditionRules, before bootstrap/save cleaning.
const RhythmScoreStage = (() => {
    const LANE_REST=.35;
    const midi = pitch => { const [, letter, accidental, octave] = /^([A-G])([#b]?)(-?\d+)$/.exec(pitch); return (Number(octave)+1)*12+{C:0,D:2,E:4,F:5,G:7,A:9,B:11}[letter]+(accidental==='#'?1:accidental==='b'?-1:0); };
    function makeTrack(songId,id,name,prefix,version){
        const source=ScoreAuditionRules.visibleScores.filter(s=>s.songId===songId);
        const parts = source.map(s => {
            const events = ScoreAuditionRules.soundingEvents(s).map(e => ({...e,pitch:midi(e.pitch)+(s.transposeSemitones||0)}));
            const pitches = [...new Set(events.map(e=>e.pitch))].sort((a,b)=>a-b);
            const occupied = [0,0,0,0];
            const notes = events.map(e => {
                const time = 1+e.beat*60/s.tempo, duration=e.duration*60/s.tempo;
                const hold = e.tied || e.duration>=1-1e-7;
                const preferred=Math.min(3,Math.floor(pitches.indexOf(e.pitch)*4/pitches.length));
                const lane=[0,1,2,3].sort((a,b)=>(occupied[a]>time?100:0)+Math.abs(a-preferred)-((occupied[b]>time?100:0)+Math.abs(b-preferred)))[0];
                occupied[lane]=time+(hold?duration+LANE_REST:.1);
                return {time,lane,duration:0,pitch:e.pitch,beats:e.duration};
            });
            return {id:s.partId,name:s.part,instrument:s.instrument,events,notes,tempo:s.tempo,duration:ScoreAuditionRules.timing(s).phraseSeconds+2};
        });
        const scoreIds=Object.fromEntries(parts.flatMap(p=>['gentle','normal'].map(mode=>[`${p.id}_${mode}`,`${prefix}-${p.id}-taps-v1`])));
        return {id,name:`${name} · 分声部`,desc:'按空格考验原谱接住旋律；每个音在起音时点按一次。可选择总谱或单声部乐器伴奏。',gentle:source[0].tempo,normal:source[0].tempo,countInEnd:1,scoreParts:parts,scoreIds,legacyScoreIds:parts.flatMap(p=>Array.from({length:Number(version.slice(1))},(_,i)=>`${prefix}-${p.id}-holds-v${i+1}`))};
    }
    const wedding=makeTrack('jay-wedding-song','jay-wedding-stage','周杰伦婚礼曲','jay-wedding','v2');
    const waltz=makeTrack('second-waltz','second-waltz-stage','第二圆舞曲','second-waltz','v1');
    const spirited=makeTrack('spirited-away','spirited-away-stage','千与千寻','spirited-away','v1');
    // Replace in place so all other song indices and historical best keys stay stable.
    const retiredIndex=TRACKS.findIndex(t=>t.id==='qian-yu-qian-xun'), retired=TRACKS[retiredIndex];
    spirited.legacyScoreIds=[...spirited.legacyScoreIds,retired.id,retired.scoreId,...Object.values(retired.scoreIds||{}),...(retired.legacyScoreIds||[])];
    TRACKS[retiredIndex]=spirited;
    const dandelion=makeTrack('dandelion-promise','dandelion-promise-stage','蒲公英的约定','dandelion-promise','v0');
    const dandelionIndex=TRACKS.findIndex(t=>t.id==='pu-gong-ying-de-yue-ding'), oldDandelion=TRACKS[dandelionIndex];
    dandelion.legacyScoreIds=[oldDandelion.id,oldDandelion.scoreId,...Object.values(oldDandelion.scoreIds||{}),...(oldDandelion.legacyScoreIds||[])];
    TRACKS[dandelionIndex]=dandelion;
    const sea=makeTrack('ting-hai','ting-hai-stage','听海','ting-hai','v0');
    TRACKS.push(wedding,waltz,sea);
    const tracks=[wedding,waltz,spirited,dandelion,sea], selection=new Map();
    let accompaniment='full';
    const track=()=>TRACKS[game.track];
    const active=()=>tracks.includes(track());
    const parts=()=>track().scoreParts;
    const part=()=>parts().find(p=>p.id===selection.get(track().id))||parts()[0];
    const busy=()=>['starting','countdown','running','paused'].includes(game.status);
    function generate(){
        $('rhythmPhraseStatus').textContent='';
        game.notes=part().notes.map(n=>({...n,hit:false,missed:false}));
        game.duration=part().duration;
    }
    function ui(){
        $('rhythmScoreControls').hidden=!active();
        if(!active())return;
        const select=$('rhythmScorePart');
        if(select.dataset.track!==track().id){
            select.innerHTML=parts().map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
            select.dataset.track=track().id;
        }
        select.value=part().id;
        $('rhythmScoreBacking').querySelector('[value=full]').textContent=`${parts().length} 声部总谱乐器伴奏`;
        $('rhythmScoreBacking').value=accompaniment;
        $('rhythmScorePart').disabled=$('rhythmScoreBacking').disabled=busy();
        const sampled=ScoreInstrumentAudio.ready(audioCtx,(accompaniment==='full'?parts():[part()]).map(p=>p.instrument));
        $('trackKind').textContent=sampled?'乐谱旋律 · Musyng Kite 采样':'乐谱旋律 · 乐器伴奏';
        $('gameTrackLabel').textContent=`${track().name} · ${part().name}`;
        $('audioStatus').textContent=state.sound?`♪ ${accompaniment==='full'?`${parts().length} 声部总谱`:part().name}${sampled?'采样伴奏':'合成伴奏（采样未载入）'}`:'静音中 · 可点右上角开启';
        $('rhythmScoreHint').textContent=`总谱伴奏会突出当前所选声部。D/F/J/K 跟随旋律点按；长音也只需在起音时按一下。两档保留同一旋律，困难判定更严格。${part().notes[0].time>1?`开头休止 ${part().events[0].beat} 拍，伴奏先行。`:''}`;
    }
    function bind(){
        const select=$('trackSelect');
        for(const t of tracks){
            const index=TRACKS.indexOf(t);
            let option=select.querySelector(`option[value="${index}"]`);
            if(!option){option=document.createElement('option');option.value=String(index);select.append(option);}
            const number=[...select.options].indexOf(option)+1;
            option.textContent=`${String(number).padStart(2,'0')}　${t.name}`;
        }
        $('rhythmScorePart').onchange=e=>{if(busy()){ui();return;}selection.set(track().id,parts().some(p=>p.id===e.target.value)?e.target.value:parts()[0].id);game.mode='gentle';stopGame(true);};
        $('rhythmScoreBacking').onchange=e=>{if(busy()){ui();return;}accompaniment=e.target.value==='part'?'part':'full';stopGame(true);};
    }
    async function prepare(){
        audioStarts++;clearTimeout(bridgeIdleTimer);
        try{return await ScoreInstrumentAudio.prepare(audioCtx,(accompaniment==='full'?parts():[part()]).map(p=>p.instrument));}
        finally{audioStarts--;releaseAudioBridge();}
    }
    function schedule(origin,now){
        const lead=part(), selected=accompaniment==='full'?parts():[lead];
        for(const p of selected)for(const e of p.events){
            const start=origin+1+e.beat*60/p.tempo,end=start+e.duration*60/p.tempo;
            if(end<=now+.005)continue;
            // Keep the played part foregrounded even against six accompanying parts.
            // Recreate the still-sounding remainder when continuing mid-note.
            scoreInstrumentAt(e.pitch,Math.max(now+.005,start),end-Math.max(now,start),p.id===lead.id?.22:.022,p.instrument);
        }
    }
    function frame(){
        if(!active())return;
        const next=game.notes.find(n=>!n.hit&&!n.missed);
        $('rhythmPhraseStatus').textContent=next&&next.time-game.elapsed>2?`休止 · ${Math.ceil(next.time-game.elapsed)} 秒后进入旋律`:'';
    }
    function drawHint(w,h){
        if(!active()||game.status!=='running')return;
        const next=game.notes.find(n=>!n.hit&&!n.missed);
        const text=next&&next.time-game.elapsed>2?`本声部休止 · ${Math.ceil(next.time-game.elapsed)} 秒后进入`:'';
        if(!text)return;
        ctx.save();ctx.font='14px sans-serif';ctx.fillStyle='#795c78';ctx.textAlign='center';ctx.fillText(text,w/2,28);ctx.restore();
    }
    return {active,part,generate,ui,bind,prepare,schedule,frame,drawHint,key:()=>track().scoreIds[`${part().id}_${game.mode}`]};
})();
