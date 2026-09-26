'use strict';

// Paid enrollment is global; attempt progress belongs to the chapter save.
// Timed playback is transient and always pauses safely on navigation/backgrounding.
function createChronicleTraining(ctx) {
    let playback = null, timer = 0, generation = 0;
    const pulse = createChroniclePulse({ active: () => currentView === 'chronicle' && ctx.R().scene === 'training' && session()?.phase === 'playing', complete: finishRound, pause: suspendTraining });
    const tones = [60, 62, 64, 67], labels = ['Do', 'Re', 'Mi', 'Sol'];
    const session = () => ctx.R().weekly.training[ctx.R().weekly.trainingWeek];
    const plan = () => ChronicleTraining[ctx.R().chapter][ctx.R().weekly.trainingWeek - 1];
    const key = (week = ctx.R().weekly.trainingWeek) => `${ctx.R().chapter}:${week}`;
    const receipt = (week = ctx.R().weekly.trainingWeek) => economy().training[key(week)];
    const ear = createChronicleEar({ session,
        chart: () => session()?.earChart || chronicleEarChart(ctx.R().chapter, session().round),
        active: () => currentView === 'chronicle' && ctx.R().scene === 'training' && ['playing','feedback','result'].includes(session()?.phase),
        changed: () => ctx.changed(), complete: finishRound, pause: suspendTraining });
    function cleanTraining(t, week = 0) {
        const phase = ['feedback','result'].includes(t.phase) ? t.phase : 'ready';
        const savedChart = t.earChart && Array.isArray(t.earChart.notes) && t.earChart.notes.length===8 &&
            t.earChart.notes.every((note,i)=>Number.isInteger(note) && (i===7 ? note===0 : note>=1&&note<=7)) &&
            Array.isArray(t.earChart.blanks) && t.earChart.blanks.length>=2 && t.earChart.blanks.length<=4 &&
            new Set(t.earChart.blanks).size===t.earChart.blanks.length &&
            t.earChart.blanks.every(i=>Number.isInteger(i)&&i>=0&&i<7) ?
            {notes:t.earChart.notes.slice(),blanks:[...new Set(t.earChart.blanks)].sort((a,b)=>a-b),bpm:ctx.nInt(t.earChart.bpm,62,40,160)} : null;
        const reviewChart = savedChart || (phase!=='ready' && week===1 ? legacyChronicleEarChart(ctx.R().chapter,ctx.nInt(t.round,0,0,2)) : null);
        return { round: ctx.nInt(t.round, 0, 0, 2), points: ctx.nInt(t.points, 0, 0, 300),
            phase,
            score: ctx.nInt(t.score, 0, 0, 100), step: 0, correct: 0,
            message: ctx.str(t.message, 160),
            ...(reviewChart?{earChart:reviewChart}:{}),
            answers: Object.fromEntries(Object.entries(phase!=='ready'&&t.answers && typeof t.answers==='object' ? t.answers : {}).filter(([i,n])=>/^[0-7]$/.test(i)&&Number.isInteger(n)&&n>=1&&n<=7)) };
    }
    function freshAttempt() { return {round:0,points:0,phase:'ready',score:0,step:0,correct:0,message:''}; }
    function exercise(t = session()) {
        const r=ctx.R(), p=plan();
        const kind=p.kind==='stage' ? ['rhythm','memory','pulse'][t.round] : p.kind;
        const seed=r.chapter*11+r.weekly.trainingWeek*7+t.round*3;
        const length=10;
        const notes=Array.from({length},(_,i)=>(seed*(i+1)+Math.floor(seed/(i+2))+i*i)%4);
        const beat=Math.max(620,900-r.chapter*35);
        return {kind,notes,beat,
            targets:kind==='duet' ? [2,6] : [0,1,2,3], total:kind==='duet'?8:4};
    }
    function stopPlayback() {
        pulse.stop(); ear.stop(); generation++; clearTimeout(timer); timer=0; playback=null;
        document.querySelectorAll('.cp-note-pad.active').forEach(e=>e.classList.remove('active'));
    }
    function suspendTraining() {
        const active=playback || (pulse.running() || ear.running() ? {run:ctx.R()} : null); stopPlayback();
        if (active && active.run===ctx.R() && ctx.R().scene==='training') {
            const t=session();
            if (t && ['playing','demo'].includes(t.phase)) {
                t.phase='ready';t.step=0;t.message='已暂停。重新开始本轮，不重复收费。';
                ctx.R().rev++;save();ctx.renderSignature='';
                if(currentView==='chronicle')ctx.refresh();
            }
            else if (t && ['feedback','result'].includes(t.phase)) {
                ctx.renderSignature='';if(currentView==='chronicle')ctx.refresh();
            }
        }
    }
    function startTraining(week) {
        const r=ctx.R();
        if (!['menu','b_live'].includes(r.scene) || r.ending || !Number.isInteger(week) || week<1 || week>Math.min(5,r.week)) return;
        stopPlayback();
        const k=key(week);
        if (!economy().training[k]?.paid) {
            if(state.coins<10){toast('报名需要 10 音符。可以先免费演奏赚音符。');return;}
            state.coins-=10;economy().training[k]={paid:true,gain:0};
            ctx.log(`第 ${week} 周训练报名：音符 −10；失败、中断可免费继续。`);
        }
        r.weekly.trainingWeek=week;
        r.weekly.training[week] ??= freshAttempt();
        r.scene='training';ctx.changed();
    }
    function finishRound(score, message) {
        stopPlayback();
        const t=session(); if(!t || !['playing','input'].includes(t.phase))return;
        t.score=Math.max(0,Math.min(100,Math.round(score)));t.points+=t.score;t.message=message;t.step=0;
        if(t.round<2)t.phase='feedback';
        else {
            t.phase='result';t.score=Math.round(t.points/3);
            const entry=receipt();
            if(t.score>=60 && entry?.paid && !entry.gain) {
                entry.gain=t.score>=90?3:2;
                ctx.R().tech+=entry.gain;
                ctx.log(`${plan().title}完成：琴技 +${entry.gain}；本章此项奖励已领取。`);
            }
        }
        ctx.changed();
    }
    function sound(note) {
        if(state.sound && audioCtx?.state==='running')toneAt(tones[note],audioCtx.currentTime,.18,.08,'fx','sine');
    }
    async function reviewEar() {
        const t=session(), r=ctx.R();
        if(!t || !['feedback','result'].includes(t.phase) || !receipt()?.paid)return;
        if(!state.sound){toast('请先开启右上角声音，再试听正确旋律。');return;}
        stopPlayback();const token=generation;
        playback={run:r,token,start:0};
        await ensureAudio();
        if(token!==generation || currentView!=='chronicle' || ctx.R()!==r || r.scene!=='training')return;
        if(audioCtx?.state!=='running' || !state.sound || document.hidden){suspendTraining();toast('声音尚未就绪，请开启声音后重试。');return;}
        playback=null;ear.start(true);
    }
    async function beginRound(replay = false) {
        const t=session();if(ctx.R().scene!=='training'||!t||!receipt()?.paid)return;
        if(t.phase!=='ready' && !(replay && exercise().kind==='ear' && t.phase==='input'))return;
        if(exercise().kind==='ear' && !state.sound){toast('请先开启右上角声音，再开始视听练耳。');return;}
        stopPlayback();
        const e=exercise(), r=ctx.R(), token=generation;
        if(e.kind==='ear' && !t.earChart) {
            const chart=chronicleEarChart(r.chapter,t.round);
            t.earChart={notes:chart.notes.slice(),blanks:chart.blanks.slice(),bpm:chart.bpm};
        }
        t.step=0;t.correct=0;t.phase=e.kind==='memory'?'demo':'playing';t.message='';
        ctx.changed();
        playback={run:r,token,start:0,last:-1,hits:[],extra:0};
        if(state.sound)await ensureAudio();
        if(token!==generation || currentView!=='chronicle' || ctx.R()!==r || r.scene!=='training')return;
        if(e.kind==='ear'){
            if(!state.sound || audioCtx?.state!=='running' || document.hidden){suspendTraining();toast('声音尚未就绪，请开启声音后重试。');return;}
            playback=null;ear.start();return;
        }
        if(e.kind==='pulse'){playback=null;pulse.start(r.chapter,t.round);return;}
        playback.start=performance.now()+1000;
        const tick=()=>{
            const play=playback;
            if(!play || token!==generation)return;
            if(document.hidden || currentView!=='chronicle' || ctx.R()!==r || r.scene!=='training') {suspendTraining();return;}
            const elapsed=performance.now()-play.start, beat=Math.floor(elapsed/e.beat);
            const count=e.kind==='memory'?e.notes.length:e.total;
            const status=$('cpTrainingStatus'), cursor=$('cpTrainingCursor');
            if(cursor)cursor.style.left=`${clamp(elapsed/(e.beat*count)*100,0,100)}%`;
            if(elapsed<0){if(status)status.textContent='准备，跟着亮起的提示……';}
            else if(beat<count && beat!==play.last){
                play.last=beat;
                if(e.kind==='memory') {
                    document.querySelectorAll('.cp-note-pad').forEach((pad,i)=>pad.classList.toggle('active',i===e.notes[beat]));
                    sound(e.notes[beat]);if(status)status.textContent=`示范 ${beat+1} / ${count} · ${labels[e.notes[beat]]}`;
                } else {
                    const mine=e.targets.includes(beat);sound(mine?0:2);
                    if(status)status.textContent=e.kind==='duet'?(mine?'轮到你！接上这一拍':beat%4===3?'休止，等下一句':'先听伙伴演奏'):`第 ${beat+1} 拍 · 点击`;
                    document.querySelectorAll('.cp-beat-cell').forEach((cell,i)=>cell.classList.toggle('active',i===beat));
                }
            }
            if(elapsed>=e.beat*count+300){
                if(e.kind==='memory'){stopPlayback();t.phase='input';t.step=0;ctx.changed();}
                else {
                    const score=(play.hits.reduce((sum,h)=>sum+h.points,0)-play.extra*15)/e.targets.length;
                    finishRound(score,`命中 ${play.hits.length} / ${e.targets.length} 拍${play.extra?'；多按 '+play.extra+' 次':''}。看准亮起的拍点再接入。`);
                }
                return;
            }
            timer=setTimeout(tick,35);
        };
        tick();
    }
    function trainingTap() {
        const t=session(), play=playback;
        if(ctx.R().scene!=='training'||!t||t.phase!=='playing'||!play?.start||play.run!==ctx.R())return;
        const e=exercise(), elapsed=performance.now()-play.start;
        let target=-1, error=Infinity;
        for(const beat of e.targets){const d=Math.abs(elapsed-beat*e.beat);if(d<error){error=d;target=beat;}}
        const windowMs=e.beat*.38;
        if(error<=windowMs && !play.hits.some(h=>h.beat===target)) {
            play.hits.push({beat:target,points:error<=e.beat*.22?100:70});
            if($('cpTrainingStatus'))$('cpTrainingStatus').textContent=error<=e.beat*.22?'稳稳接住了！':'接上了，再稳一点';
        } else play.extra++;
    }
    function answerTraining(value) {
        const t=session();if(ctx.R().scene!=='training'||!t||t.phase!=='input'||!Number.isInteger(value))return;
        const e=exercise();
        if(e.kind==='memory') {
            if(value<0||value>3||t.step>=e.notes.length)return;
            if(value===e.notes[t.step])t.correct=(t.correct||0)+1;
            sound(value);t.step++;
            if(t.step===e.notes.length)finishRound((t.correct||0)/e.notes.length*100,
                t.correct===e.notes.length?'完整记住了这一句。':`本轮答对 ${t.correct||0} / ${e.notes.length} 个音。正确顺序是 ${e.notes.map(n=>labels[n]).join(' → ')}。可以免费再练。`);
            else ctx.changed();
        }
    }
    function trainingAction(action,btn) {
        if(action==='training-start'){startTraining(Number(btn?.dataset.cpWeek));return;}
        if(ctx.R().scene!=='training')return;
        const t=session();
        if(action==='training-back'){suspendTraining();ctx.R().scene='menu';ctx.changed();return;}
        if(action==='training-begin')return beginRound();
        if(action.startsWith('training-ear-') && exercise().kind==='ear'){
            if(action==='training-ear-review')return reviewEar();
            if(action==='training-ear-stop'){stopPlayback();ctx.changed();return;}
            if(action==='training-ear-replay')return beginRound(true);
            return ear.action(action,btn);
        }
        if(action==='training-tap')return trainingTap();
        if(action==='training-answer')return answerTraining(Number(btn?.dataset.cpAnswer));
        if(action==='training-next' && t?.phase==='feedback') {stopPlayback();t.round++;t.phase='ready';t.message='';delete t.answers;delete t.selected;delete t.earChart;ctx.changed();}
        if(action==='training-retry' && t?.phase==='result') {
            stopPlayback();
            if(plan().kind==='ear')resetChronicleEarCharts(ctx.R().chapter);
            ctx.R().weekly.training[ctx.R().weekly.trainingWeek]=freshAttempt();ctx.changed();
        }
    }
    function trainingHubHTML() {
        const r=ctx.R(), missing=Math.max(0,ctx.requiredTech()-r.tech);
        return `<section class="cp-training-hub"><div class="cp-training-heading"><div><span class="cp-week-kicker">第 ${r.week} 周 · 练出自己的声音</span><h3>${r.week>=6?'登台前，最后检查一次':weekTitle(r)}</h3><p>每周解锁一种训练。完成 +2 琴技，优秀额外 +1；失败免费重试。</p></div><strong>${r.tech}<small> / ${ctx.requiredTech()} 琴技</small></strong></div><p class="cp-training-readiness">${missing?`距离${ctx.E(ctx.stageName())}还差 <b>${missing}</b> 琴技。可以补练已开放的项目，或花 10 音符加练 +2。`:'琴技已达到演出要求。可以继续练习，也可以按计划推进。'}</p><div class="cp-training-list">${ChronicleTraining[r.chapter].map((p,i)=>{
            const week=i+1, entry=receipt(week),locked=week>r.week;
            const status=locked?'第 '+week+' 周开放':entry?.gain?'已完成 · 琴技 +'+entry.gain:entry?.paid?'已报名 · 免费继续':'10 音符报名';
            return `<button class="cp-training-card ${week===r.week?'current':''}" data-cp-action="training-start" data-cp-week="${week}" data-cp-rev="${r.rev}" ${locked||!entry?.paid&&state.coins<10?'disabled':''}><span class="cp-training-number">0${week}</span><span><b>${ctx.E(p.title)}</b><small>${ctx.E(p.description)}</small><em>${status}</em></span>${I(locked?'lock':entry?.gain?'check':'arrow')}</button>`;
        }).join('')}</div><p class="cp-caption">每章每项奖励只领取一次；报名后退出、刷新或重开均可免费继续。${state.coins<10?'音符不足时，可在下方免费演奏赚音符。':''}</p></section>`;
    }
    function weekTitle(r){return ChronicleTraining[r.chapter][Math.min(4,r.week-1)].description;}
    function trainingHTML() {
        const r=ctx.R(), t=session();
        if(!t)return `<div class="cp-surface">${ctx.actionButton('training-back','回到训练安排','back')}</div>`;
        const p=plan(),e=exercise(),entry=receipt();
        const tips={ear:'看简谱、听旋律，补出括号中缺失的音。播放时逐拍高亮；听完用数字 1–7 填空，可重听、修改，填满后提交评分。',rhythm:'跟着四个拍点点击。亮起时按下按钮或空格键，连续三轮。',memory:'先看、听完整的 10 个音，再按顺序点回旋律；输入满 10 个音后统一评分，点错也可以继续。示范时音符同步亮起，静音也能练习。',pulse:'音符落到判定线时，按对应的 D / F / J / K 键；手机点下方音轨。两条轨道同时落下时一起按，连续命中积累连击。',duet:'先听伙伴的两拍，在「你」的位置接奏；休止拍不按键。'};
        let body='';
        if(t.phase==='result')body=`<div class="cp-training-result"><strong>${t.score}<small> / 100</small></strong><h3>${t.score>=90?'这一遍，很稳。':t.score>=60?'合上了，再往前一点。':'再来一遍，也没关系。'}</h3><p>${t.score>=60?(entry?.gain?'本项已领取琴技 +'+entry.gain+'。再次练习不重复领奖。':'本次为温习。'):'达到 60 分即可完成训练；90 分获得优秀评价。重试不再收费。'}</p>${e.kind==='ear'?ear.html(t,r.rev,true):`<p>${ctx.E(t.message)}</p>`}${ctx.actionButton('training-retry','免费再练一次','repeat','secondary')}${ctx.actionButton('training-back','回到本周安排','back','primary')}</div>`;
        else if(t.phase==='feedback')body=`<div class="cp-training-result"><h3>第 ${t.round+1} 轮 · ${t.score} 分</h3>${e.kind==='ear'?ear.html(t,r.rev,true):`<p>${ctx.E(t.message)}</p>`}${ctx.actionButton('training-next','下一轮','arrow','primary')}</div>`;
        else {
            body=`<p class="cp-training-instruction">${tips[e.kind]}</p><p id="cpTrainingStatus" class="cp-training-status" role="status" aria-live="polite">${t.phase==='input'?'轮到你了'+(e.kind==='memory'?` · 已输入 ${t.step} / ${e.notes.length} 个音`:''):ctx.E(t.message)||(t.phase==='playing'&&e.kind==='pulse'?'跟着节奏，让音符落在光线上。':'准备好后开始，本轮可以随时暂停。')}</p>`;
            if(e.kind==='memory')body+=`<div class="cp-note-pads">${labels.map((label,i)=>`<button class="cp-note-pad" data-cp-action="training-answer" data-cp-answer="${i}" data-cp-rev="${r.rev}" ${t.phase!=='input'?'disabled':''}><b>${label}</b><small>${['低','中低','中高','高'][i]}</small></button>`).join('')}</div>`;
            else if(e.kind==='ear')body+=ear.html(t,r.rev);
            else if(e.kind==='pulse')body+=pulse.html(r.chapter,t.round,t.phase==='playing');
            else body+=`<div class="cp-training-beats" data-beat-ms="${e.beat}">${Array.from({length:e.total},(_,i)=>`<span class="cp-beat-cell ${e.targets.includes(i)?'mine':''}">${e.kind==='duet'?(e.targets.includes(i)?'你':i%4===3?'休':'伴'):i+1}</span>`).join('')}</div><div class="cp-training-track"><i id="cpTrainingCursor"></i></div>${ctx.actionButton('training-tap','接住这一拍 · 空格 / 点击','music','primary cp-tap-button',t.phase==='playing'?'':'disabled')}`;
            if(t.phase==='ready')body+=ctx.actionButton('training-begin',e.kind==='ear'?'播放旋律':e.kind==='memory'?'播放示范':'开始本轮','music','primary');
        }
        return `<section class="cp-surface cp-training-player ${e.kind==='pulse'?'cp-training-pulse':e.kind==='ear'?'cp-training-ear':''}"><header><div><span class="cp-week-kicker">${ctx.E(p.tune)} · 第 ${r.weekly.trainingWeek} 周训练</span><h3>${ctx.E(p.title)}</h3></div>${ctx.actionButton('training-back','暂停，回安排','back','ghost small')}</header>${ctx.speaker(p.mentor,'练习搭档 · 不消耗羁绊')}<div class="cp-training-rounds">${[0,1,2].map(n=>`<span class="${n<=t.round?'active':''}">${p.kind==='stage'?['跟拍','记旋律','霓虹节奏'][n]:'第 '+(n+1)+' 轮'}</span>`).join('')}</div>${body}<p class="cp-caption">报名已支付 · 本次重试免费 · 60 分完成 +2 琴技 / 90 分 +3 · 每章每项一次</p></section>`;
    }
    function trainingKey(event) {
        if(ctx.R().scene!=='training')return false;
        if(exercise().kind==='ear' && /^[1-7]$/.test(event.key)){event.preventDefault();ear.answer(Number(event.key));return true;}
        if(exercise().kind!=='pulse')return false;
        const lane=['KeyD','KeyF','KeyJ','KeyK'].indexOf(event.code);
        if(lane<0)return false;
        event.preventDefault();pulse.hit(lane);return true;
    }
    function mountTraining() {
        const hit=event=>{
            const pad=event.target.closest('[data-training-lane]');
            if(!pad || pad.disabled || ctx.R().scene!=='training')return;
            // Pointerdown supports simultaneous touches; keyboard activation emits click only.
            if(event.type==='click' && event.detail!==0)return;
            if(event.type==='pointerdown')event.preventDefault();
            pulse.hit(Number(pad.dataset.trainingLane));
        };
        document.addEventListener('pointerdown',hit);
        document.addEventListener('click',hit);
    }
    return {cleanTraining,startTraining,trainingAction,trainingTap,trainingHTML,trainingHubHTML,suspendTraining,trainingKey,mountTraining};
}
