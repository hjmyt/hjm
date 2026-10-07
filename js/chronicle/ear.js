'use strict';

// Numbered-score dictation. Playback is transient; the training controller owns rewards.
function createChronicleEar({ session, chart, changed, complete, pause, active }) {
    const names = ['Do','Re','Mi','Fa','Sol','La','Si'], midi = [60,62,64,65,67,69,71];
    let play = null, frame = 0;
    const voices = new Set();
    function stop() {
        cancelAnimationFrame(frame); frame = 0; play = null;
        for (const node of voices) { try { node.stop(); } catch (_) {} }
        voices.clear();
    }
    function voice(note, when, duration) {
        const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = 'triangle'; osc.frequency.value = 440 * 2 ** ((midi[note - 1] - 69) / 12);
        gain.gain.setValueAtTime(.001, when);
        gain.gain.linearRampToValueAtTime(.99, when + .015);
        gain.gain.exponentialRampToValueAtTime(.001, when + duration);
        osc.connect(gain); gain.connect(audioMaster); voices.add(osc); synthNodes.add(osc); clearTimeout(bridgeIdleTimer);
        osc.onended = () => { voices.delete(osc); synthNodes.delete(osc); osc.disconnect(); gain.disconnect(); releaseAudioBridge(); };
        osc.start(when); osc.stop(when + duration + .02);
    }
    function start(review = false) {
        stop();
        const c = chart(), t = session(), beat = 60 / c.bpm;
        if (!review) { t.answers ??= {}; t.selected = c.blanks.find(i => !t.answers[i]) ?? c.blanks[0]; }
        const p = play = { start: audioCtx.currentTime + .6, last: null, review };
        if (review) changed();
        c.notes.forEach((note, i) => { if (note) voice(note, p.start + i * beat, beat * (c.notes[i + 1] === 0 ? 1.85 : .85)); });
        const tick = () => {
            if (play !== p) return;
            if (!active() || document.hidden || !state.sound || audioCtx.state !== 'running') { pause(); return; }
            const index = Math.floor((audioCtx.currentTime - p.start) / beat);
            if (index !== p.last) {
                p.last = index;
                document.querySelectorAll('[data-ear-note]').forEach(el => el.classList.toggle('sounding', Number(el.dataset.earNote) === index));
                const status = $('cpTrainingStatus');
                if (status) status.textContent = index < 0 ? '准备听完整的两小节……' : `正在播放 · 第 ${Math.min(8,index + 1)} / 8 拍`;
            }
            if (index >= 8) {
                stop();
                if (!review) { t.phase = 'input'; t.message = '点击括号选位置，再用 1–7 填音；可以反复听、修改后提交。'; }
                changed(); return;
            }
            frame = requestAnimationFrame(tick);
        };
        tick();
    }
    function answer(value) {
        const t = session(), c = chart();
        if (t?.phase !== 'input' || !Number.isInteger(value) || value < 1 || value > 7 || !c.blanks.includes(t.selected)) return;
        t.answers ??= {}; t.answers[t.selected] = value;
        t.selected = c.blanks.find(i => !t.answers[i]) ?? t.selected;
        changed();
    }
    function action(action, btn) {
        const t = session(), c = chart();
        if (t?.phase !== 'input') return;
        if (action === 'training-ear-select') {
            const index = Number(btn?.dataset.earIndex);
            if (c.blanks.includes(index)) { t.selected = index; changed(); }
        }
        if (action === 'training-ear-answer') answer(Number(btn?.dataset.cpAnswer));
        if (action === 'training-ear-submit' && c.blanks.every(i => t.answers?.[i])) {
            const correct = c.blanks.filter(i => t.answers[i] === c.notes[i]).length;
            const review = c.blanks.map(i => `第 ${i + 1} 拍：你填 ${t.answers[i]}，正确 ${c.notes[i]}`).join('；');
            complete(correct / c.blanks.length * 100, `答对 ${correct} / ${c.blanks.length} 个缺音。${review}。`);
        }
    }
    function html(t, rev, review = false) {
        const c = chart(), input = !review && t.phase === 'input';
        return `<div class="cp-ear ${review?'cp-ear-review':''}"><div class="cp-ear-meta"><b>1 = C <span>4/4</span></b><span>♩ = ${c.bpm} · ${c.blanks.length} 个缺音</span></div><h4>${review?`第 ${t.round+1} 轮 · 正确简谱`:'听出括号里的音'}</h4><p class="cp-ear-subtitle">${review?'括号内为正确答案；下方对照你的填写。可播放旋律，逐拍确认。':'跟着光标听旋律，把留白补完整。'}</p><div class="cp-ear-score" aria-label="${review?'答案':'两小节'}简谱">${[0,1].map(bar=>`<div class="cp-ear-bar">${c.notes.slice(bar*4,bar*4+4).map((note,j)=>{
            const i=bar*4+j, blank=c.blanks.includes(i);
            if (review && blank) {
                const answer=t.answers?.[i], correct=answer===note;
                return `<span class="cp-ear-note cp-ear-revealed ${answer?(correct?'correct':'incorrect'):''}" data-ear-note="${i}" aria-label="第 ${i+1} 拍，正确 ${note}${answer?'，你填 '+answer:''}"><span class="cp-ear-pitch"><span class="cp-ear-bracket">(</span><b>${note}</b><span class="cp-ear-bracket">)</span></span><small>${answer?(correct?'✓ 答对':'你填 '+answer+' · 错音'):'正确答案'}</small></span>`;
            }
            return blank ? `<button class="cp-ear-note cp-ear-blank ${input&&t.selected===i?'selected':''}" data-ear-note="${i}" data-cp-action="training-ear-select" data-ear-index="${i}" data-cp-rev="${rev}" aria-label="第 ${i+1} 拍，${t.answers?.[i]?'已填 '+t.answers[i]:'待填'}" aria-pressed="${input&&t.selected===i}" ${input?'':'disabled'}><span class="cp-ear-bracket">(</span><b>${t.answers?.[i]||'·'}</b><span class="cp-ear-bracket">)</span></button>` : `<span class="cp-ear-note" data-ear-note="${i}">${note||'−'}</span>`;
        }).join('')}</div>`).join('')}</div>${review?`<p id="cpTrainingStatus" class="cp-ear-review-status" role="status" aria-live="polite">${play?'准备听正确旋律……':'看着完整简谱，再听一次确认音高。'}</p><div class="cp-ear-actions"><button class="btn secondary" data-cp-action="${play?'training-ear-stop':'training-ear-review'}" data-cp-rev="${rev}">${play?'停止试听':'播放正确旋律'}</button></div>`:`<div class="cp-ear-answer-label">${input ? `正在填写第 ${t.selected+1} 拍 · 已填 ${c.blanks.filter(i=>t.answers?.[i]).length} / ${c.blanks.length}` : '听完后，用下方数字填音'} </div><div class="cp-ear-keys">${names.map((name,i)=>`<button data-cp-action="training-ear-answer" data-cp-answer="${i+1}" data-cp-rev="${rev}" ${input?'':'disabled'} aria-label="${i+1} ${name}"><b>${i+1}</b><small>${name}</small></button>`).join('')}</div><div class="cp-ear-actions">${input?`<button class="btn secondary" data-cp-action="training-ear-replay" data-cp-rev="${rev}">再听一遍</button><button class="btn primary" data-cp-action="training-ear-submit" data-cp-rev="${rev}" ${c.blanks.every(i=>t.answers?.[i])?'':'disabled'}>提交本轮</button>`:''}</div>`}<p class="cp-ear-hint">${state.sound?'C 大调 · 数字 1–7 对应 Do–Si · 长横线表示延长一拍':'当前已静音，请先开启右上角声音，再开始练耳。'}</p></div>`;
    }
    return { start, stop, running: () => !!play, answer, action, html };
}
