'use strict';

const RHYTHM_AUDITION_MARKUP = `<main class="shell">
    <section class="hero"><div><div class="eyebrow">RHYTHM DICTATION · 随机节奏</div><h1>节奏听写</h1><p>看见节奏就打出来，听见节奏就写下来。每局四个阶段、每阶段随机两小节。</p></div><div class="hero-score"><strong id="heroScore">0</strong><small>/ 4 分</small></div></section>
    <section class="game-card" aria-live="polite">
      <header class="game-head"><span class="stage-mark" id="stageMark">准备</span><span><strong id="stageTitle">节奏热身</strong><small id="stageSubtitle">四个阶段 · 三种练法</small></span><span class="progress" id="progress" aria-label="四阶段进度"><i></i><i></i><i></i><i></i></span></header>
      <div id="gameRoot"></div>
    </section>
  </main>`;

function createRhythmAuditionGame(mount,{ styleHref = 'styles/game-rhythm-audition.css' } = {}) {
    const shadow = mount.shadowRoot || mount.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<link rel="stylesheet" href="${styleHref}"><div class="game-surface embedded">${RHYTHM_AUDITION_MARKUP}</div>`;
    const root = shadow;
    const lifecycle = new AbortController();

      'use strict';
      const embedded = true;
      const $ = selector => root.querySelector(selector);
      const DAILY_CAPS = {simple:20,medium:30,hard:60};
      const MASTER_OUTPUT_GAIN = 1;
      const VOICE_BANK = RHYTHM_AUDITION_VOICES;
      const SCORE_RHYTHM_VOICE = VOICE_BANK.profiles.rhythm;
      const AUDIO_VOICES = Object.freeze({
        countIn:VOICE_BANK.profiles.countIn,
        countInAccent:VOICE_BANK.profiles.countInAccent,
        metronome:VOICE_BANK.profiles.metronome,
        userTap:SCORE_RHYTHM_VOICE,
        scoreRhythm:SCORE_RHYTHM_VOICE
      });
      const {meters:METERS,tokens:TOKENS,timing,availableTokens,makeStage,targetOnsets,holdTargets,holdReleaseWindow,tapAnalysis}=RhythmAuditionRules;
      // Reference: a high click on beat one, clear lower clicks on other beats.
      // Secondary accents stay in the ordinary timbre; weak beats remain audible.
      const METRONOME_ACCENTS=Object.freeze({strong:{gain:1,sample:'accent',label:'强'},secondary:{gain:.96,sample:'normal',label:'次强'},weak:{gain:.9,sample:'normal',label:'弱'}});
      const STAGE_INFO = [
        {title:'基础拍号',desc:'4/4、2/4 · 全音符、二分、四分与八分'},
        {title:'十六分变奏',desc:'十六分组合、切分、延音线与三连音'},
        {title:'复合拍号',desc:'加入 6/8、3/4 与 3/8'},
        {title:'休止与留白',desc:'加入四分、八分与十六分休止符'}
      ];
      const state = {screen:'intro',mode:'simple',stage:0,score:0,answers:[],dailyEarned:{simple:0,medium:0,hard:0},dailyCaps:{...DAILY_CAPS},rulesReady:!embedded,activeMeasure:0,composed:[[],[]],taps:[],holds:[],payout:null,audioStatus:'点击播放即可启用声音',retrying:false,retryTempo:null,retryCount:0,lastReviewTempo:null};
      let audioContext = null, audioOutput = null, audioBuffers = null, audioLimiter = null, externalSoundEnabled = true, audioBridge = null, performanceStart = 0, timers = [], activeNodes = new Set(), lastDirectTapAt = -Infinity, lastPlayback = null;
      const iosAudio = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const supportsPointerInput = 'PointerEvent' in window;
      let activePress=null,holdFrame=null;

      function randomUnit() { if (crypto?.getRandomValues) { const value = new Uint32Array(1); crypto.getRandomValues(value); return value[0] / 4294967296; } return Math.random(); }
      const stages = [1,2,3,4].map(stage=>makeStage(stage,randomUnit));
      function hashId(value) { let hash = 2166136261; for (const char of value) hash = Math.imul(hash ^ char.charCodeAt(0),16777619); return (hash >>> 0).toString(36).toUpperCase().padStart(7,'0').slice(-7); }
      const questionId = hashId(JSON.stringify(stages) + randomUnit());
      function stageData() { return stages[state.stage]; }
      function defaultRetryTempo() { return Math.max(40,stageData().tempo-12); }
      function activeStageData() { return state.retrying ? {...stageData(),tempo:state.retryTempo||defaultRetryTempo()} : stageData(); }
      function reviewStageData() { const answer=state.answers[state.stage]; return state.screen==='feedback'&&!answer?.passed&&state.retryTempo?{...stageData(),tempo:state.retryTempo}:stageData(); }
      function tokenUnits(sequence) { return sequence.reduce((sum,id) => sum + TOKENS[id].units,0); }
      function escapeHTML(value) { return String(value).replace(/[&<>"']/g,char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
      function progressHeader() {
        $('#heroScore').textContent = state.score;
        $('#stageMark').textContent = state.screen === 'intro' ? '准备' : state.screen === 'finish' ? '完成' : `${state.stage + 1}/4`;
        $('#stageTitle').textContent = state.screen === 'intro' ? '节奏热身' : state.screen === 'finish' ? '四阶段完成' : STAGE_INFO[state.stage].title;
        $('#stageSubtitle').textContent = state.screen === 'intro' ? '四个阶段 · 三种练法' : state.screen === 'finish' ? `本局 ${state.score} / 4 分` : STAGE_INFO[state.stage].desc;
        [...$('#progress').children].forEach((item,index) => item.className = index < state.stage || state.screen === 'finish' ? 'done' : index === state.stage && state.screen !== 'intro' ? 'current' : '');
      }
      function noteSVG(x,y,filled=true,stem=true,status='correct') {
        const error=status==='error',color=error?'#d92d20':'#111';
        return `<g data-note-status="${status}">${error?`<circle cx="${x}" cy="${y}" r="11" fill="#fee4e2"/>`:''}<ellipse cx="${x}" cy="${y}" rx="6" ry="4" transform="rotate(-18 ${x} ${y})" fill="${filled ? color:'white'}" stroke="${color}" stroke-width="2"/>${stem ? `<path d="M${x+5} ${y}v-33" stroke="${color}" stroke-width="2.4"/>`:''}</g>`;
      }
      function restSVG(x,id,compact=false) {
        if (id === 'quarter-rest') return `<svg viewBox="0 0 32 52" aria-label="四分休止符"><path d="M12 4l10 12-8 9 8 10-10 13 4-13-8-10 8-9-8-12" fill="#111"/></svg>`;
        return `<svg viewBox="0 0 32 52" aria-label="${TOKENS[id].label}"><circle cx="11" cy="15" r="5" fill="#111"/>${id==='sixteenth-rest'?'<circle cx="8" cy="28" r="5" fill="#111"/><path d="M11 28c6 0 9-3 11-7" fill="none" stroke="#111" stroke-width="4"/>':''}<path d="M14 15c8-1 10-5 10-10L14 46" fill="none" stroke="#111" stroke-width="4" stroke-linecap="round"/></svg>`;
      }
      function scoreRestSVG(x,id,y=110) {
        return id === 'quarter-rest'
          ? `<g data-rest="quarter-rest" aria-label="四分休止符" transform="translate(${x-12} ${y-35}) scale(.78)"><path d="M12 4l10 12-8 9 8 10-10 13 4-13-8-10 8-9-8-12" fill="#111"/></g>`
          : `<g data-rest="${id}" aria-label="${TOKENS[id].label}" transform="translate(${x-12} ${y-34}) scale(.78)"><circle cx="11" cy="15" r="5" fill="#111"/>${id==='sixteenth-rest'?'<circle cx="8" cy="28" r="5" fill="#111"/><path d="M11 28c6 0 9-3 11-7" fill="none" stroke="#111" stroke-width="4"/>':''}<path d="M14 15c8-1 10-5 10-10L14 46" fill="none" stroke="#111" stroke-width="4" stroke-linecap="round"/></g>`;
      }
      function noteOffsets(token) {
        let cursor=0;
        return token.durations.map(duration=>{const onset=cursor;cursor+=duration;return onset;});
      }
      function beamSVG(notes,y,shared=false) {
        const top=y-33;
        if(notes.length===1){
          const note=notes[0]; let svg='';
          for(let level=0;level<note.level;level++)svg+=`<path data-eighth-flag="true" d="M${note.x+5} ${top+level*8}q18 8 2 22" fill="none" stroke="#111" stroke-width="3"/>`;
          return svg;
        }
        let svg=`<path ${shared?'data-cross-token-beam="true" ':''}d="M${notes[0].x+5} ${top}L${notes.at(-1).x+5} ${top}" stroke="#111" stroke-width="5"/>`;
        for(let index=0;index<notes.length;index++){
          if(notes[index].level<2)continue;
          const start=index;
          while(index+1<notes.length&&notes[index+1].level>=2)index++;
          if(index>start)svg+=`<path d="M${notes[start].x+5} ${top+8}L${notes[index].x+5} ${top+8}" stroke="#111" stroke-width="4"/>`;
          else {const direction=index===notes.length-1?-1:1;svg+=`<path d="M${notes[index].x+5} ${top+8}h${direction*12}" stroke="#111" stroke-width="4"/>`;}
        }
        return svg;
      }
      function rhythmGlyphSVG(id,xs,y=110,statuses=[],options={}) {
        const top=y-33,token=TOKENS[id];
        let svg=`<g data-rhythm="${id}" aria-label="${token.label}">`;
        xs.forEach((x,index)=>svg+=noteSVG(x,y,token.durations[index]<8,id!=='whole',statuses[index]||'correct'));
        if(!options.suppressBeams&&token.levels.some(Boolean))svg+=beamSVG(xs.map((x,index)=>({x,level:token.levels[index]})),y);
        (token.dots||[]).forEach(index=>{svg+=`<circle cx="${xs[index]+10}" cy="${y-1}" r="2.2" fill="#111"/>`;});
        (token.ties||[]).forEach(index=>{svg+=`<path data-tie="true" aria-label="延音线，后一个音不重敲" d="M${xs[index]+3} ${y+10}Q${(xs[index]+xs[index+1])/2} ${y+25} ${xs[index+1]-3} ${y+10}" fill="none" stroke="#111" stroke-width="1.8"/>`;});
        if(token.tuplet){
          svg+=`<path d="M${xs[0]+5} ${top-12}v-6H${xs[2]+5}v6" fill="none" stroke="#111" stroke-width="1.5"/><rect x="${(xs[0]+xs[2])/2-8}" y="${top-28}" width="16" height="16" fill="#fff"/><text x="${(xs[0]+xs[2])/2}" y="${top-15}" text-anchor="middle" font-size="14" font-weight="700">3</text>`;
        }
        svg+='</g>'; return svg;
      }
      function tokenPreviewSVG(id) {
        if(id.endsWith('rest'))return restSVG(0,id,true);
        const token=TOKENS[id],xs=token.durations.length===1?[50]:noteOffsets(token).map(onset=>14+(onset+.5)/token.units*72);
        return `<svg viewBox="0 -16 100 80" role="img" aria-label="${token.label}">${rhythmGlyphSVG(id,xs,48)}</svg>`;
      }
      function scoreLayout() {
        const stacked=window.matchMedia('(max-width:700px)').matches;
        return stacked
          ? {stacked,width:400,height:276,startX:74,measureWidth:292,lineStart:42,lineEnd:366,staffYs:[36,158]}
          : {stacked,width:760,height:190,startX:90,measureWidth:320,lineStart:58,lineEnd:730,staffYs:[68,68]};
      }
      function scorePointForUnit(data,unit,layout=scoreLayout()) {
        const measureUnits=METERS[data.meter].units,measureIndex=Math.max(0,Math.min(1,Math.floor(unit/measureUnits))),within=Math.max(0,Math.min(measureUnits,unit-measureIndex*measureUnits)),measureStart=layout.startX+(layout.stacked?0:measureIndex*layout.measureWidth);
        return {x:measureStart+within/measureUnits*layout.measureWidth,y:layout.staffYs[measureIndex]-16};
      }
      function notationSVG(data,sequences=data.measures,review={}) {
        const layout=scoreLayout(),{width,height,measureWidth,startX}=layout;
        const errorIndices=new Set(review.errorTargetIndices||[]); let noteIndex=0;
        let svg = `<svg viewBox="0 0 ${width} ${height}" data-score-layout="${layout.stacked?'stacked':'inline'}" role="img" aria-label="${data.meter} 拍，两小节节奏谱"><rect width="${width}" height="${height}" fill="#fff"/>`;
        const [top,bottom] = data.meter.split('/');
        layout.staffYs.forEach((staffY,index)=>{
          if(!layout.stacked&&index>0)return;
          for(let line=0;line<5;line++)svg+=`<path d="M${layout.lineStart} ${staffY+line*14}H${layout.lineEnd}" stroke="#8a8a8a" stroke-width="1"/>`;
          svg+=`<text x="${layout.lineStart+8}" y="${staffY+23}" font-size="24" font-weight="700">${top}</text><text x="${layout.lineStart+8}" y="${staffY+48}" font-size="24" font-weight="700">${bottom}</text>`;
        });
        sequences.forEach((measure,measureIndex) => {
          let cursor = 0; const meter=METERS[data.meter],staffY=layout.staffYs[measureIndex],noteY=staffY+42,measureStart=startX+(layout.stacked?0:measureIndex*measureWidth);
          const items=measure.map((id,index)=>{
            const token=TOKENS[id],tokenStart=measureStart+cursor/meter.units*measureWidth,tokenWidth=token.units/meter.units*measureWidth;
            const offsets=token.durations?noteOffsets(token):[];
            const item={id,index,token,cursor,tokenStart,tokenWidth,offsets,xs:offsets.map(onset=>tokenStart+(onset+.5)/token.units*tokenWidth)};
            cursor+=token.units;
            return item;
          });
          items.forEach(item => {
            const {id,token,tokenStart,tokenWidth,xs}=item;
            if (!token.onsets.length) svg += scoreRestSVG(tokenStart+tokenWidth/2,id,noteY);
            else {
              const statuses=[];
              xs.forEach((x,index)=>statuses.push(token.ties?.includes(index-1)?statuses[index-1]:errorIndices.has(noteIndex++)?'error':'correct'));
              svg+=rhythmGlyphSVG(id,xs,noteY,statuses,{suppressBeams:true});
              if(review.showHolds){
                token.durations.forEach((duration,index)=>{
                  if(token.ties?.includes(index-1))return;
                  let length=duration,next=index;
                  while(token.ties?.includes(next)){next++;length+=token.durations[next];}
                  if(next>index||length>meter.pulse+1e-7){
                    const endX=Math.min(measureStart+measureWidth-4,tokenStart+(item.offsets[index]+length)/meter.units*measureWidth),x=xs[index];
                    svg+=`<g data-hold-mark="true" aria-label="长按 ${Number((length/meter.pulse).toFixed(2))} 拍"><path d="M${x} ${noteY+28}H${endX}" stroke="var(--brand-color)" stroke-width="3" stroke-linecap="round"/><text x="${x}" y="${noteY+42}" fill="var(--brand-color)" font-size="10">长按 ${Number((length/meter.pulse).toFixed(2))} 拍</text></g>`;
                  }
                });
              }
            }
          });
          const notes=items.flatMap(item=>item.xs.length?item.xs.map((x,index)=>({x,level:item.token.levels[index],unit:item.cursor+item.offsets[index],end:item.cursor+item.offsets[index]+item.token.durations[index],tokenIndex:item.index,tuplet:item.token.tuplet?item.index:null})): [{level:0}]);
          for(let index=0;index<notes.length;){
            const first=notes[index];
            if(!first.level){index++;continue;}
            const group=Math.floor((first.unit+1e-7)/meter.beamUnits),run=[first];let next=index+1;
            while(next<notes.length&&notes[next].level&&notes[next].tuplet===first.tuplet&&Math.floor((notes[next].unit+1e-7)/meter.beamUnits)===group&&Math.abs(notes[next].unit-run.at(-1).end)<1e-7){run.push(notes[next]);next++;}
            svg+=beamSVG(run,noteY,new Set(run.map(note=>note.tokenIndex)).size>1);
            index=next;
          }
          svg += `<path d="M${measureStart+measureWidth} ${staffY}v56" stroke="#111" stroke-width="2"/>`;
          svg += `<text x="${measureStart+8}" y="${staffY+104}" fill="#777" font-size="11">第 ${measureIndex+1} 小节</text>`;
        });
        (review.extraUnits||[]).forEach(unit=>{const point=scorePointForUnit(data,unit,layout);svg+=`<g data-extra-hit="true" aria-label="多敲的拍点"><circle cx="${point.x}" cy="${point.y}" r="9" fill="#fee4e2"/><path d="M${point.x-4} ${point.y-4}l8 8m0-8l-8 8" stroke="#d92d20" stroke-width="2.4" stroke-linecap="round"/></g>`;});
        svg += '</svg>'; return svg;
      }
      function introHTML() {
        const startLabel = state.mode === 'hard' ? '节奏听写' : '看谱击打';
        return `<div class="game-body intro"><div class="intro-content"><div class="intro-icon">♬</div><h2>把节拍听进身体里</h2><p>四个阶段逐步加入拍号、十六分变奏与休止符。每阶段通过得 1 分。</p><div class="stage-map">${STAGE_INFO.map((item,index) => `<article><b>阶段 ${index+1}</b><span>${item.desc}</span></article>`).join('')}</div><div class="mode-picker"><button class="mode${state.mode === 'simple' ? ' selected':''}" data-mode="simple"><span class="mode-head"><strong>简单 · 带示范</strong><em>4 ♪</em></span><small>看随机谱，可先试听正确节奏<br>每 1 分得 1 音符</small><small class="quota">今日 ${state.dailyEarned.simple} / ${state.dailyCaps.simple}</small></button><button class="mode${state.mode === 'medium' ? ' selected':''}" data-mode="medium"><span class="mode-head"><strong>中级 · 独立击打</strong><em>4 ♪</em></span><small>看随机谱，不能试听正确节奏<br>每 1 分得 1 音符</small><small class="quota">今日 ${state.dailyEarned.medium} / ${state.dailyCaps.medium}</small></button><button class="mode${state.mode === 'hard' ? ' selected':''}" data-mode="hard"><span class="mode-head"><strong>困难 · 听写</strong><em>8 ♪</em></span><small>只听随机节奏，再写出两小节<br>每 1 分得 2 音符</small><small class="quota">今日 ${state.dailyEarned.hard} / ${state.dailyCaps.hard}</small></button></div><button class="btn primary block" data-action="start" ${state.rulesReady ? '':'disabled'}>开始${startLabel}</button></div></div>`;
      }
      function countInDescription(data=activeStageData()) { const info=timing(data);return `${data.meter} 一小节预备（${info.countInBeats} 拍），${info.beatLabel}为一拍${data.meter==='6/8'?'，按 3＋3 分组':''}`; }
      function stageHeading(action) { const data = activeStageData(),info=timing(data); return `<div class="stage-top"><div class="stage-copy"><h2>${action}</h2><p>${STAGE_INFO[state.stage].desc}。本阶段随机生成两小节。${state.retrying?'<strong class="practice-note">本次为失败后的练习重试，通过不补分。</strong>':''}</p></div><div class="stage-labels"><span class="chip">${data.meter} 拍</span><span class="chip" title="${info.beatLabel}为一拍">${info.beatSymbol} = ${data.tempo} BPM${state.retrying?' · 重试':''}</span><span class="chip">阶段 ${state.stage+1}</span></div></div>`; }
      function holdHelpHTML() {
        const holds=holdTargets(activeStageData()).filter(event=>event.required);
        return `<div class="hold-help" id="holdHelp"><strong>${holds.length?'本题有长按音':'点按与长按'}</strong><span>短音点一下；长音看到“可以松开”就抬手，给下一音留出时间，不必等到音符完全结束。两拍及以上的长音，最后一拍按过一半即可松开；短延音仍需持续按住。延音线连接的两个音不重复敲。休止符不按，三连音分别敲三下。</span><small>${timing(activeStageData()).beatLabel}为一拍；手机按住按钮，电脑可按住空格键。末尾松手判定已放宽，下一音仍需按拍。</small></div>`;
      }
      function simpleReadyHTML() { const info=timing(activeStageData());return `<div class="game-body rhythm-ready">${stageHeading('看准谱面，跟着节拍打出来') }<div class="score-sheet">${notationSVG(stageData(),stageData().measures,{showHolds:true})}</div>${holdHelpHTML()}<div class="audio-strip"><span>${countInDescription()}。${state.mode === 'simple' ? '试听正文只播放谱面节奏，不再叠加节拍器。' : '中级模式独立看谱击打。'} 正式击打的节拍器：${info.accents.map(accent=>METRONOME_ACCENTS[accent].label).join('·')}。</span><div class="audio-actions">${state.mode === 'simple' ? '<output class="listen-countdown" data-listen-countdown aria-live="polite" hidden></output><button class="btn" data-action="preview">▶ 试听正确节奏</button>' : ''}<button class="btn primary" data-action="perform">${info.countInBeats} 拍预备 · 开始</button></div></div></div>`; }
      function simplePlayHTML() { const info=timing(activeStageData());return `<div class="game-body rhythm-play">${stageHeading('现在，跟着节拍击打') }<div class="score-sheet">${notationSVG(stageData(),stageData().measures,{showHolds:true})}</div>${holdHelpHTML()}<div class="count-panel"><div><strong id="countValue">${info.countInBeats}</strong><small id="countLabel">${countInDescription()}</small></div></div><button class="tap-pad" data-action="tap" aria-describedby="holdHelp" disabled><strong data-tap-title>点按短音 · 按住长音</strong><small data-hold-status>长按音：看到“可以松开”时松开</small><span class="hold-progress" aria-hidden="true"><i data-hold-progress></i></span><small>节拍器：${info.accents.map(accent=>METRONOME_ACCENTS[accent].label).join('·')} · 支持空格键</small></button></div>`; }
      function hardListenHTML() { return `<div class="game-body">${stageHeading('先听两小节，再把它写下来') }<div class="score-empty"><div><strong>谱面已遮住</strong><br><small>${countInDescription()}，再记住两小节的疏密与休止</small></div></div><div class="audio-strip"><span>${escapeHTML(state.audioStatus)}；预备拍跟随题目拍号和速度，正文不叠加节拍器。</span><div class="audio-actions"><output class="listen-countdown" data-listen-countdown aria-live="polite" hidden></output><button class="btn primary" data-action="listen">播放考核节奏</button></div></div><button class="btn block" data-action="write">我记住了，开始写谱</button></div>`; }
      function paletteHTML() { return availableTokens(state.stage+1,stageData().meter).map(id => `<button class="token" data-token="${id}">${tokenPreviewSVG(id)}<small>${TOKENS[id].label}</small></button>`).join(''); }
      function hardWriteHTML() {
        const data = stageData(), complete = state.composed.every(measure => tokenUnits(measure) === METERS[data.meter].units);
        return `<div class="game-body">${stageHeading('把听到的节奏写进两小节') }<div class="measure-tabs"><button class="measure-tab${state.activeMeasure === 0 ? ' active':''}" data-measure="0">第 1 小节 · ${Number((tokenUnits(state.composed[0])/METERS[data.meter].pulse).toFixed(2))}/${METERS[data.meter].beats} 拍</button><button class="measure-tab${state.activeMeasure === 1 ? ' active':''}" data-measure="1">第 2 小节 · ${Number((tokenUnits(state.composed[1])/METERS[data.meter].pulse).toFixed(2))}/${METERS[data.meter].beats} 拍</button></div><div class="write-layout"><div><div class="score-sheet">${notationSVG(data,state.composed)}</div><div class="write-actions"><button class="btn ghost" data-action="undo">撤销一个</button><button class="btn ghost" data-action="clear">清空本小节</button><button class="btn primary" data-action="submit-write" ${complete ? '':'disabled'}>提交两小节</button></div></div><aside class="palette"><h3>选择节奏型</h3>${paletteHTML()}</aside></div><div class="audio-strip"><span>${countInDescription()}。标 3 的三个音均匀分配，延音线后的音不重敲；休止符留空。忘记了可以重听，正文不叠加节拍器。</span><div class="audio-actions"><output class="listen-countdown" data-listen-countdown aria-live="polite" hidden></output><button class="btn" data-action="listen">重听节奏</button></div></div></div>`;
      }
      function compareOnsets(reference,attempted) {
        const used=new Set(),missing=[],extra=[];
        reference.forEach((value,index)=>{const match=attempted.findIndex((candidate,candidateIndex)=>!used.has(candidateIndex)&&Math.abs(candidate-value)<1e-7);if(match<0)missing.push(index);else used.add(match);});
        attempted.forEach((value,index)=>{if(!used.has(index))extra.push(index);});
        return {missing,extra};
      }
      function feedbackScores(answer,data) {
        const legend='<span><i></i>漏敲／偏差／长按时值不对</span><span><b>×</b>多敲</span>';
        if(state.mode!=='hard'){
          const taps=Array.isArray(answer.evidence?.taps)?answer.evidence.taps:[],analysisData=Number.isFinite(answer.practiceTempo)?{...data,tempo:answer.practiceTempo}:data,analysis=tapAnalysis(analysisData,taps,answer.evidence?.holds||[]),errorTargetIndices=[...new Set(analysis.matches.map((match,index)=>match.tapIndex<0||match.error>.08?index:-1).filter(index=>index>=0).concat(analysis.holdErrors))],extraUnits=taps.map((value,index)=>analysis.used.has(index)?null:value/analysis.secondsPerUnit).filter(Number.isFinite),hasErrors=errorTargetIndices.length||extraUnits.length;
          return `<div class="score-review-title"><span>正确节奏与本次击打</span>${hasErrors?`<span class="score-review-legend">${legend}</span>`:''}</div><div class="score-sheet">${notationSVG(data,data.measures,{errorTargetIndices,extraUnits,showHolds:true})}</div>`;
        }
        const composed=Array.isArray(answer.evidence?.composed)?answer.evidence.composed:[[],[]],referenceOnsets=targetOnsets(data),attemptedOnsets=targetOnsets(data,composed),comparison=compareOnsets(referenceOnsets,attemptedOnsets);
        if(answer.passed)return `<div class="score-review-title"><span>正确节奏 · 与你的答案一致</span></div><div class="score-sheet">${notationSVG(data)}</div>`;
        return `<div class="score-review-title"><span>正确节奏</span>${comparison.missing.length?'<span class="score-review-legend"><span><i></i>你遗漏的发音点</span></span>':''}</div><div class="score-sheet">${notationSVG(data,data.measures,{errorTargetIndices:comparison.missing})}</div><div class="score-review-title"><span>你的答案</span>${comparison.extra.length?'<span class="score-review-legend"><span><i></i>多写或位置错误</span></span>':''}</div><div class="score-sheet">${notationSVG(data,composed,{errorTargetIndices:comparison.extra})}</div>`;
      }
      function retryPanelHTML() {
        const original=stageData().tempo,min=Math.max(40,original-36),value=state.retryTempo||defaultRetryTempo();
        return `<section class="retry-panel"><div><strong>放慢一点，再把同一道题打准</strong><span>拖动速度后可不限次数重试。重试通过只解锁下一阶段，不补发本阶段分数或音符。</span></div><label class="retry-tempo"><span>练习速度 <output data-retry-tempo-output>${value}</output> BPM</span><input type="range" min="${min}" max="${original}" step="2" value="${value}" data-retry-tempo aria-label="失败重试速度"></label><button class="btn retry" data-action="retry">↻ 再试一次</button></section>`;
      }
      function feedbackHTML() {
        const answer = state.answers[state.stage], data = stageData();
        const practicePassed=!answer.passed&&answer.practicePassed===true,displayAnswer=answer.practiceEvidence?{...answer,passed:practicePassed,detail:answer.practiceDetail,evidence:answer.practiceEvidence}:answer;
        const heading=answer.passed?'这一关，节奏对上了':practicePassed?'重试成功，可以继续了':'差一点，先看看正确节奏';
        const message=answer.passed?'阶段通过，获得 1 分。':practicePassed?'练习重试成功，本阶段仍为 0 分。':'本阶段暂未得分。';
        const detail=practicePassed?`已在 ${answer.practiceTempo} BPM 下打准；首次挑战结果已锁定，不补发分数或音符。`:displayAnswer.detail;
        const failed=!answer.passed&&!practicePassed,reviewLabel=failed?`▶ 以 ${state.retryTempo||defaultRetryTempo()} BPM 播放正确节奏`:'▶ 播放正确节奏',nextLabel=failed?(state.stage===3?'跳过，查看本局结果':'跳过，进入下一阶段'):(state.stage===3?'查看本局结果':'进入下一阶段');
        return `<div class="game-body">${stageHeading(heading)}<div class="feedback ${answer.passed||practicePassed?'pass':'fail'}"><b>${answer.passed||practicePassed?'✓':'!'}</b><div><strong>${message}</strong><span>${detail}</span></div></div>${feedbackScores(displayAnswer,data)}${failed?retryPanelHTML():''}<div class="review-actions"><output class="listen-countdown" data-listen-countdown aria-live="polite" hidden></output><button class="btn" data-action="review">${reviewLabel}</button><button class="btn primary" data-action="next">${nextLabel}</button></div></div>`;
      }
      function finishHTML() {
        const multiplier = state.mode === 'hard' ? 2 : 1, raw = state.score * multiplier, payout = state.payout;
        const modeLabel = state.mode === 'hard' ? '困难' : state.mode === 'medium' ? '中级' : '简单';
        return `<div class="game-body final"><div class="final-content"><div class="result-ring"><span><strong>${state.score}</strong><small>/ 4 分</small></span></div><h2>${state.score === 4 ? '四阶段全部通过':'本轮节奏训练完成'}</h2><p>谱面会变，拍号会变，但稳定的内拍会留下来。</p><div class="reward"><div class="reward-amount"><strong id="resultRewardAmount">${payout ?? '…'}</strong><small>本局音符</small></div><p><strong>${modeLabel}模式 · ${state.score} 分 × ${multiplier}</strong><br><span id="resultDailyValue">今日 ${state.dailyEarned[state.mode]} / ${state.dailyCaps[state.mode]} 音符</span><br><span id="embeddedPayout">${embedded ? '正在按今日剩余额度结算…':`本局基础奖励 ${raw} 音符`}</span></p></div><button class="btn primary block" data-action="restart">重新挑战</button></div></div>`;
      }
      function render() {
        progressHeader();
        const html = state.screen === 'intro' ? introHTML() : state.screen === 'simple-ready' ? simpleReadyHTML() : state.screen === 'simple-play' ? simplePlayHTML() : state.screen === 'hard-listen' ? hardListenHTML() : state.screen === 'hard-write' ? hardWriteHTML() : state.screen === 'feedback' ? feedbackHTML() : finishHTML();
        $('#gameRoot').innerHTML = html; reportHeight();
      }
      function reportHeight() {}
      function focusStage() { if (embedded) parent.postMessage({type:'hjm-pitch-focus'},'*'); }
      function stopAudio() { releasePress(null,true); timers.forEach(clearTimeout); timers=[]; activeNodes.forEach(node => { try { node.stop(); } catch {} }); activeNodes.clear(); if (audioBridge) audioBridge.pause(); }
      function unlockIOS() { if (!iosAudio) return; try { if (navigator.audioSession) navigator.audioSession.type='playback'; } catch {} if (!audioBridge) { audioBridge = new Audio('assets/audio/silence.wav'); audioBridge.loop=true; audioBridge.setAttribute('playsinline',''); } audioBridge.play().catch(() => {}); }
      async function ensureAudio() {
        if (!externalSoundEnabled) { state.audioStatus='游戏声音已关闭，请先开启声音'; render(); return null; }
        unlockIOS();
        try {
          if (!audioContext || audioContext.state === 'closed') {
            const AC = window.AudioContext || window.webkitAudioContext; if (!AC) throw new Error('no audio');
            audioContext = new AC();
            const chain=VOICE_BANK.createOutput(audioContext);audioOutput=chain.output;audioLimiter=chain.limiter;
            audioBuffers=VOICE_BANK.createBuffers(audioContext);
          }
          if (audioContext.state !== 'running') await audioContext.resume();
          state.audioStatus='声音已启用'; return audioContext;
        } catch { state.audioStatus='声音暂未启动，请再点一次'; render(); return null; }
      }
      function sampledHit(name,when,gainLevel=1) {
        const source=VOICE_BANK.play(audioContext,audioBuffers,name,when,gainLevel,audioOutput),cleanup=source.onended;
        activeNodes.add(source);
        source.onended=()=>{activeNodes.delete(source);cleanup();};
        return source;
      }
      function metronomeTone(when,accent='weak') {
        const level=METRONOME_ACCENTS[accent];
        lastPlayback?.clicks.push({when,accent,gain:level.gain,sample:level.sample,phase:'performance'});
        sampledHit(level.sample,when,level.gain);
      }
      function countInTone(when,accent='weak') {
        const voice=accent==='strong'?AUDIO_VOICES.countInAccent:AUDIO_VOICES.countIn;
        const gain=METRONOME_ACCENTS[accent].gain;
        lastPlayback?.clicks.push({when,accent,gain,sample:voice.sample,phase:'count-in'});
        sampledHit(voice.sample,when,gain);
      }
      function userTapTone(when) {
        scoreRhythmTone(when);
      }
      function scoreRhythmTone(when) {
        const voice=AUDIO_VOICES.scoreRhythm;
        sampledHit(voice.sample,when,voice.gain);
      }
      function scheduleCountIn(data,start) { const info=timing(data);for (let index=0; index<info.countInBeats; index++) countInTone(start+index*info.beatSeconds,info.accents[index]); }
      function scheduleRhythm(data,start) { const {secondsPerUnit,totalUnits}=timing(data); RhythmAuditionRules.soundEvents(data).forEach(event=>{const when=start+event.unit*secondsPerUnit;lastPlayback.notes.push({...event,when,soundDuration:AUDIO_VOICES.scoreRhythm.duration});scoreRhythmTone(when);}); return {secondsPerUnit,totalUnits}; }
      function showListeningCountIn(data,start) {
        const {beatSeconds,countInBeats:count,accents}=timing(data);
        const output=$('[data-listen-countdown]'); if(!output)return;
        output.hidden=false; output.textContent=String(count);
        for(let index=0;index<count;index++)timers.push(setTimeout(()=>{const current=$('[data-listen-countdown]');if(current){current.hidden=false;current.textContent=String(count-index);current.dataset.accent=accents[index];current.title=`预备第 ${index+1} 拍 · ${METRONOME_ACCENTS[accents[index]].label}`;}},Math.max(0,(start-audioContext.currentTime+index*beatSeconds)*1000)));
        timers.push(setTimeout(()=>{const current=$('[data-listen-countdown]');if(current)current.textContent='开始';},Math.max(0,(start-audioContext.currentTime+count*beatSeconds)*1000)));
        timers.push(setTimeout(()=>{const current=$('[data-listen-countdown]');if(current)current.hidden=true;},Math.max(0,(start-audioContext.currentTime+(count+.55)*beatSeconds)*1000)));
      }
      function scheduleListening(data) {
        const info=timing(data),{beatSeconds}=info,start=audioContext.currentTime+.08,rhythmStart=start+info.countInSeconds;
        lastPlayback={kind:'listening',meter:data.meter,tempo:data.tempo,start,rhythmStart,clicks:[],notes:[],...info};
        scheduleCountIn(data,start); showListeningCountIn(data,start);
        const scheduled=scheduleRhythm(data,rhythmStart);
        return {...scheduled,beatSeconds,start,rhythmStart};
      }
      async function previewCorrectRhythm() {
        if (state.mode !== 'simple' || state.screen !== 'simple-ready') return;
        stopAudio(); if (!await ensureAudio()) return;
        const data=activeStageData(),scheduled=scheduleListening(data);
        state.audioStatus='正在试听：一小节预备后只播放正确节奏';
        timers.push(setTimeout(()=>{state.audioStatus='试听完成，可以再次播放或开始击打';},Math.max(0,(scheduled.rhythmStart-audioContext.currentTime+scheduled.totalUnits*scheduled.secondsPerUnit+.2)*1000)));
      }
      async function beginSimple() {
        stopAudio(); if (!await ensureAudio()) return; state.screen='simple-play'; state.taps=[]; state.holds=[]; render();
        const data=activeStageData(),info=timing(data),{beatSeconds,secondsPerUnit,totalUnits,countInBeats,accents}=info,start=audioContext.currentTime+.08;
        performanceStart=start+info.countInSeconds;
        lastPlayback={kind:'performance',meter:data.meter,tempo:data.tempo,start,rhythmStart:performanceStart,clicks:[],notes:[],...info};
        scheduleCountIn(data,start);
        for(let beat=0;beat<countInBeats*2;beat++){
          const beatIndex=beat%countInBeats,accent=accents[beatIndex],when=performanceStart+beat*beatSeconds;
          metronomeTone(when,accent);
          timers.push(setTimeout(()=>{const value=$('#countValue'),label=$('#countLabel');if(value)value.textContent=beat===0?'开始':String(beatIndex+1);if(label)label.textContent=`正式第 ${Math.floor(beat/countInBeats)+1} 小节 · ${METRONOME_ACCENTS[accent].label}拍`;},Math.max(0,(when-audioContext.currentTime)*1000)));
        }
        for(let index=0;index<countInBeats;index++) timers.push(setTimeout(()=>{ const value=$('#countValue'),label=$('#countLabel'); if(value) value.textContent=String(countInBeats-index);if(label)label.textContent=`预备第 ${index+1} 拍 · ${METRONOME_ACCENTS[accents[index]].label}`; },Math.max(0,(start-audioContext.currentTime+index*beatSeconds)*1000)));
        timers.push(setTimeout(()=>{const pad=$('[data-action="tap"]'),label=$('#countLabel');if(pad)pad.disabled=false;if(label)label.textContent='准备落下第一拍';},Math.max(0,(performanceStart-audioContext.currentTime-.14)*1000)));
        timers.push(setTimeout(()=>{const pad=$('[data-action="tap"]');if(pad)pad.disabled=false;},Math.max(0,(performanceStart-audioContext.currentTime)*1000)));
        timers.push(setTimeout(finishSimple,Math.max(0,(performanceStart-audioContext.currentTime+totalUnits*secondsPerUnit+.35)*1000)));
      }
      function tapLatencyCompensation() {
        if(!audioContext)return 0;
        const reported=Math.max(Number(audioContext.outputLatency)||0,Number(audioContext.baseLatency)||0);
        return Math.min(.18,Math.max(0,reported,iosAudio ? .045 : 0));
      }
      function pressPad(source) {
        if(activePress||state.screen!=='simple-play'||!externalSoundEnabled||audioContext?.state!=='running'||audioContext.currentTime<performanceStart-.14)return false;
        const compensation=tapLatencyCompensation(),start=audioContext.currentTime-compensation-performanceStart,data=activeStageData();
        const target=holdTargets(data).filter(event=>event.required&&Math.abs(event.start-start)<=.11).sort((a,b)=>Math.abs(a.start-start)-Math.abs(b.start-start))[0];
        activePress={source,tapIndex:state.taps.length,start,compensation,target,releaseWindow:target?holdReleaseWindow(target,start):null};
        state.taps.push(start);userTapTone(audioContext.currentTime);
        const pad=$('[data-action="tap"]');pad?.classList.add('hit');pad?.setAttribute('aria-pressed','true');
        updateHoldProgress();return true;
      }
      function updateHoldProgress() {
        if(!activePress)return;
        const {target,compensation,releaseWindow}=activePress,title=$('[data-tap-title]'),status=$('[data-hold-status]'),bar=$('[data-hold-progress]');
        if(target){
          const now=audioContext.currentTime-compensation-performanceStart,remaining=releaseWindow.earliestEnd-now,progress=Math.max(0,Math.min(1,(now-target.start)/(releaseWindow.earliestEnd-target.start)));
          if(title)title.textContent=remaining<=0?'可以松开':'保持按住';
          if(status)status.textContent=now>releaseWindow.latestEnd?'已经超时，请松开':remaining<=0?'现在抬手，下一音仍按原来的节拍击打':`长按 ${Number(target.beats.toFixed(2))} 拍 · 再保持 ${Math.max(0,remaining/timing(activeStageData()).beatSeconds).toFixed(1)} 拍即可松开`;
          if(bar)bar.style.width=`${progress*100}%`;
          holdFrame=requestAnimationFrame(updateHoldProgress);
        }else{
          if(title)title.textContent='短音点按';if(status)status.textContent='松开，准备下一个音';if(bar)bar.style.width='0%';
        }
      }
      function releasePress(source,cancelled=false) {
        if(!activePress||(source!==null&&source!==activePress.source))return;
        const press=activePress;activePress=null;
        if(holdFrame!==null)cancelAnimationFrame(holdFrame);holdFrame=null;
        const end=Math.max(press.start,audioContext.currentTime-press.compensation-performanceStart);
        state.holds.push({tapIndex:press.tapIndex,end,cancelled});
        // Suppress the compatibility click after a long pointer or keyboard press.
        lastDirectTapAt=performance.now();
        const pad=$('[data-action="tap"]'),title=$('[data-tap-title]'),status=$('[data-hold-status]');
        pad?.classList.remove('hit');pad?.setAttribute('aria-pressed','false');
        if(title)title.textContent='点按短音 · 按住长音';
        if(status)status.textContent=cancelled?'操作已中断，本次长按不计为完成':press.target?end<press.releaseWindow.earliestEnd-1e-7?'松开太早，下次等“可以松开”提示':end>press.releaseWindow.latestEnd+1e-7?'松开晚了，看到提示后准备下一音':'长按完成，准备下一音':'长按音：看到“可以松开”时松开';
      }
      function directTap(event) {
        const pad=event.target.closest?.('[data-action="tap"]'); if(!pad||pad.disabled)return;
        if(event.type==='pointerdown'&&event.button!==0)return;
        event.preventDefault();lastDirectTapAt=performance.now();
        const id=event.type==='pointerdown'?`pointer:${event.pointerId}`:`touch:${event.changedTouches[0].identifier}`;
        if(pressPad(id)&&event.type==='pointerdown'){try{pad.setPointerCapture(event.pointerId);}catch{}}
      }
      function evaluateTaps() {
        const analysis=tapAnalysis(activeStageData(),state.taps,state.holds);
        return {passed:analysis.passed,detail:`命中 ${analysis.matched} / ${analysis.targets.length} 个节奏点${analysis.matched ? `，平均偏差 ${Math.round(analysis.averageError*1000)} ms`:''}${analysis.holdMatches.length?`；长按完成 ${analysis.holdMatches.length-analysis.holdErrors.length} / ${analysis.holdMatches.length} 个（末尾松手已放宽，看到“可以松开”即可抬手；过早、超时或未松开不通过）`:''}；通过需命中至少 90%，且多敲、漏敲各不超过 1 个。`,evidence:{taps:state.taps.slice(),holds:state.holds.map(hold=>({...hold}))}};
      }
      function finishSimple() { if(state.screen!=='simple-play')return; stopAudio(); completeStage(evaluateTaps()); }
      async function listenHard() {
        stopAudio(); if (!await ensureAudio()) return; const data=activeStageData(); state.audioStatus='正在播放：一小节预备后进入两小节'; render(); const scheduled=scheduleListening(data);
        timers.push(setTimeout(()=>{state.audioStatus='播放完成，可以写谱或再次重听'; if(state.screen==='hard-listen'||state.screen==='hard-write')render();},Math.max(0,(scheduled.rhythmStart-audioContext.currentTime+scheduled.totalUnits*scheduled.secondsPerUnit+.2)*1000)));
      }
      async function reviewCorrectRhythm() {
        if (state.screen !== 'feedback') return;
        stopAudio(); if (!await ensureAudio()) return;
        const button=$('[data-action="review"]'); if(button){button.disabled=true;button.textContent='正在播放正确节奏…';}
        const data=reviewStageData(); state.lastReviewTempo=data.tempo; const scheduled=scheduleListening(data);
        timers.push(setTimeout(()=>{const current=$('[data-action="review"]');if(state.screen==='feedback'&&current){current.disabled=false;const answer=state.answers[state.stage];current.textContent=!answer?.passed&&state.retryTempo?`▶ 以 ${state.retryTempo} BPM 再听一次`:'▶ 再听一次正确节奏';}},Math.max(0,(scheduled.rhythmStart-audioContext.currentTime+scheduled.totalUnits*scheduled.secondsPerUnit+.2)*1000)));
      }
      function addToken(id) { const data=stageData(), measure=state.composed[state.activeMeasure], capacity=METERS[data.meter].units, token=TOKENS[id]; if(!token||tokenUnits(measure)+token.units>capacity)return; measure.push(id); if(tokenUnits(measure)===capacity&&state.activeMeasure===0)state.activeMeasure=1; render(); }
      function submitWrite(forced) { const data=stageData(); if(!state.composed.every(measure=>tokenUnits(measure)===METERS[data.meter].units))return; const exact=RhythmAuditionRules.sameOnsets(data,state.composed); completeStage({passed:forced === undefined ? exact:!!forced,detail:exact?'两小节的发音位置与播放完全一致。':'发音或休止位置与播放不一致；正确谱面如下。',evidence:{composed:state.composed.map(measure=>measure.slice())}}); }
      function completeStage(result) {
        if(state.retrying){
          const answer=state.answers[state.stage];
          answer.practicePassed=!!result.passed; answer.practiceEvidence=result.evidence; answer.practiceDetail=result.detail; answer.practiceTempo=state.retryTempo||defaultRetryTempo(); answer.retryCount=state.retryCount;
          state.retrying=false;
        }else{
          if(result.passed)state.score++;
          state.answers[state.stage]={stage:state.stage+1,passed:result.passed,detail:result.detail,evidence:result.evidence,retryCount:0};
          if(!result.passed)state.retryTempo=defaultRetryTempo();
        }
        state.screen='feedback'; render(); focusStage();
      }
      function retryStage() { const answer=state.answers[state.stage]; if(!answer||answer.passed||answer.practicePassed)return; stopAudio(); state.retrying=true; state.retryCount=(answer.retryCount||0)+1; state.activeMeasure=0; state.composed=[[],[]]; state.taps=[]; state.screen=state.mode==='hard'?'hard-listen':'simple-ready'; render(); focusStage(); }
      function nextStage() { stopAudio(); if(state.stage===3){state.screen='finish'; render(); if(embedded)parent.postMessage({type:'hjm-pitch-complete',challenge:'rhythm',id:questionId,mode:state.mode,score:state.score,stages,answers:state.answers},'*'); return;} state.stage++; state.activeMeasure=0; state.composed=[[],[]]; state.retrying=false; state.retryTempo=null; state.retryCount=0; state.screen=state.mode==='hard'?'hard-listen':'simple-ready'; render(); focusStage(); }
      function startGame() { if(!state.rulesReady)return; Object.assign(state,{stage:0,score:0,answers:[],activeMeasure:0,composed:[[],[]],retrying:false,retryTempo:null,retryCount:0,screen:state.mode==='hard'?'hard-listen':'simple-ready'}); render(); if(embedded)parent.postMessage({type:'hjm-pitch-start',challenge:'rhythm',id:questionId,mode:state.mode},'*'); focusStage(); }
      $('#gameRoot').addEventListener('click',event=>{
        const mode=event.target.closest('[data-mode]'); if(mode&&state.screen==='intro'){state.mode=mode.dataset.mode;render();return;}
        const measure=event.target.closest('[data-measure]'); if(measure){state.activeMeasure=Number(measure.dataset.measure);render();return;}
        const token=event.target.closest('[data-token]'); if(token){addToken(token.dataset.token);return;}
        const action=event.target.closest('[data-action]')?.dataset.action;
        if(action==='start')startGame(); else if(action==='preview')previewCorrectRhythm(); else if(action==='perform')beginSimple(); else if(action==='tap'){if(performance.now()-lastDirectTapAt>350&&pressPad('click'))releasePress('click');} else if(action==='listen')listenHard(); else if(action==='review')reviewCorrectRhythm(); else if(action==='retry')retryStage(); else if(action==='write'){state.screen='hard-write';render();focusStage();} else if(action==='undo'){state.composed[state.activeMeasure].pop();render();} else if(action==='clear'){state.composed[state.activeMeasure]=[];render();} else if(action==='submit-write')submitWrite(); else if(action==='next')nextStage(); else if(action==='restart'){if(embedded)parent.postMessage({type:'hjm-pitch-restart',challenge:'rhythm'},'*');}
      });
      $('#gameRoot').addEventListener('input',event=>{const slider=event.target.closest?.('[data-retry-tempo]');if(!slider)return;state.retryTempo=Math.max(Number(slider.min),Math.min(Number(slider.max),Number(slider.value)));const output=$('[data-retry-tempo-output]');if(output)output.textContent=String(state.retryTempo);const review=$('[data-action="review"]');if(review&&!review.disabled)review.textContent=`▶ 以 ${state.retryTempo} BPM 播放正确节奏`;});
      if(supportsPointerInput){
        $('#gameRoot').addEventListener('pointerdown',directTap);
        window.addEventListener('pointerup',event=>releasePress(`pointer:${event.pointerId}`),{signal:lifecycle.signal});
        window.addEventListener('pointercancel',event=>releasePress(`pointer:${event.pointerId}`,true),{signal:lifecycle.signal});
        $('#gameRoot').addEventListener('lostpointercapture',event=>releasePress(`pointer:${event.pointerId}`,true));
      }else{
        $('#gameRoot').addEventListener('touchstart',directTap,{passive:false});
        for(const type of ['touchend','touchcancel'])window.addEventListener(type,event=>{for(const touch of event.changedTouches)releasePress(`touch:${touch.identifier}`,type==='touchcancel');},{signal:lifecycle.signal});
        $('#gameRoot').addEventListener('mousedown',event=>{if(!('ontouchstart' in window)&&event.button===0){const pad=event.target.closest?.('[data-action="tap"]');if(pad&&!pad.disabled){event.preventDefault();pressPad('mouse');}}});
        window.addEventListener('mouseup',()=>releasePress('mouse'),{signal:lifecycle.signal});
      }
      $('#gameRoot').addEventListener('contextmenu',event=>{if(event.target.closest?.('[data-action="tap"]'))event.preventDefault();});
      document.addEventListener('keydown',event=>{if(event.code==='Space'&&state.screen==='simple-play'){event.preventDefault();if(!event.repeat){lastDirectTapAt=performance.now();pressPad('keyboard');}}},{signal:lifecycle.signal});
      document.addEventListener('keyup',event=>{if(event.code==='Space'&&state.screen==='simple-play'){event.preventDefault();releasePress('keyboard');}},{signal:lifecycle.signal});
      window.addEventListener('blur',()=>releasePress(null,true),{signal:lifecycle.signal});
      document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAudio();},{signal:lifecycle.signal}); window.addEventListener('pagehide',stopAudio,{signal:lifecycle.signal});
      if(embedded){
        window.addEventListener('message',event=>{if(event.source!==parent)return; const data=event.data;
          if(data?.type==='hjm-pitch-rules'){for(const mode of ['simple','medium','hard']){state.dailyCaps[mode]=Math.max(0,Math.floor(Number(data.dailyCaps?.[mode])||DAILY_CAPS[mode]));state.dailyEarned[mode]=Math.max(0,Math.min(state.dailyCaps[mode],Math.floor(Number(data.dailyEarned?.[mode])||0)));}state.rulesReady=true;if(state.screen==='intro')render();}
          else if(data?.type==='hjm-pitch-sound'){externalSoundEnabled=data.enabled===true;if(!externalSoundEnabled){stopAudio();state.audioStatus='游戏声音已关闭，请先开启声音';}else state.audioStatus='点击播放即可启用声音';if(state.screen==='hard-listen'||state.screen==='hard-write')render();}
          else if(data?.type==='hjm-pitch-settled'){const amount=$('#resultRewardAmount'),daily=$('#resultDailyValue'),note=$('#embeddedPayout');if(data.ok){state.payout=Math.max(0,Math.floor(Number(data.payout)||0));state.dailyEarned[state.mode]=Math.max(0,Math.floor(Number(data.dailyEarned)||0));if(amount)amount.textContent=state.payout;if(daily)daily.textContent=`今日 ${state.dailyEarned[state.mode]} / ${data.dailyCap} 音符`;if(note)note.textContent=state.payout<Number(data.rawPayout)?state.payout?'今日额度不足，已按剩余额度发放。':'今日额度已满，本局作为练习保留。':`结算完成，今天还可获得 ${Math.max(0,data.dailyCap-state.dailyEarned[state.mode])} 音符。`;}else if(note)note.textContent=String(data.text||'结算失败，请稍后重试。');reportHeight();}
        },{signal:lifecycle.signal});
      }
      const api={state,stages,questionId,TOKENS,METERS,AUDIO_VOICES,METRONOME_ACCENTS,timing,targetOnsets,notationSVG,startGame,beginSimple,previewCorrectRhythm,finishSimple,listenHard,reviewCorrectRhythm,submitWrite,retryStage,
        playbackSnapshot:()=>lastPlayback?JSON.parse(JSON.stringify(lastPlayback)):null,
        evaluateTapEvidence(taps,holds=[]){state.taps=taps.slice();state.holds=holds.map(hold=>({...hold}));return evaluateTaps();},
        completeStageForTest(passed=true){
          if(state.mode!=='hard'){
            if(state.screen==='simple-ready'){state.screen='simple-play';render();}
            const data=activeStageData(),{secondsPerUnit}=timing(data);
            releasePress(null,true);state.taps=passed?targetOnsets(data).map(unit=>unit*secondsPerUnit):[];state.holds=passed?holdTargets(data).filter(event=>event.required).map(event=>({tapIndex:event.index,end:event.end})):[];finishSimple();
          }else{
            if(state.screen!=='hard-write')state.screen='hard-write';
            state.composed=passed?stageData().measures.map(items=>items.slice()):[[],[]];
            if(passed)submitWrite();else completeStage({passed:false,detail:'测试判定：节奏听写未通过。',evidence:{composed:[[],[]]}});
          }
        },
        nextStage,retrySettings:()=>({active:state.retrying,tempo:state.retryTempo,originalTempo:stageData().tempo,count:state.retryCount,reviewTempo:reviewStageData().tempo,lastReviewTempo:state.lastReviewTempo}),
        audioSettings:()=>({voices:AUDIO_VOICES,accents:METRONOME_ACCENTS,countInDistinct:true,metronomePreservesDynamics:true,sampledReference:true,pitchGlide:false,tapMatchesScore:AUDIO_VOICES.userTap===AUDIO_VOICES.scoreRhythm,listeningHasContinuousMetronome:false,tapInputEvent:supportsPointerInput?'pointerdown':'touchstart',tapLatencyCompensation:tapLatencyCompensation(),masterGain:audioOutput?.gain.value??MASTER_OUTPUT_GAIN,limiterThreshold:audioLimiter?.threshold.value??-1,contextState:audioContext?.state??null,iosAudio})};
      api.destroy=()=>{lifecycle.abort();stopAudio();shadow.replaceChildren();if(window.__rhythmAudition===api)delete window.__rhythmAudition;};
      window.__rhythmAudition=api;
      render();
      return api;
    
}

window.createRhythmAuditionGame = createRhythmAuditionGame;
