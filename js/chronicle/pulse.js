'use strict';

// Four-lane rhythm game. Audio and falling notes share one monotonic timeline.
// Only the enclosing training controller persists progress and grants rewards.
function createChroniclePulse({ active, complete, pause }) {
    const keys = ['D', 'F', 'J', 'K'], colors = ['#6ce8ff', '#a99aff', '#ff91c6', '#ffce83'];
    let play = null, frame = 0;
    const nodes = new Set();
    function chart(chapter, round) {
        const bpm = 96 + chapter * 4 + round * 6, beat = 60000 / bpm;
        const phrase = [0, 1, 2, 1, 3, 2, 0, 2, 1, 3, 2, 0, 3, 1, 2, 3];
        const notes = [];
        for (let i = 0; i < 16; i++) {
            const lane = (phrase[(i + chapter - 1) % 16] + round) % 4;
            notes.push({ at: i * beat, lane });
            if (i % 2 === 1 || round > 0 && i % 4 === 0)
                notes.push({ at: (i + .5) * beat, lane: (lane + 1 + chapter % 2) % 4 });
            if (chapter >= 3 && round > 0 && i % 4 === 2)
                notes.push({ at: i * beat, lane: (lane + 2) % 4 });
        }
        notes.sort((a, b) => a.at - b.at || a.lane - b.lane);
        return { bpm, beat, notes, end: 16 * beat, travel: Math.max(1200, 1900 - chapter * 45 - round * 80) };
    }
    function stop() {
        cancelAnimationFrame(frame); frame = 0; play = null;
        for (const node of nodes) { try { node.stop(); } catch (_) {} }
        nodes.clear();
    }
    function voice(midi, when, length, volume, wave = 'sine', kick = false) {
        if (!state.sound || audioCtx?.state !== 'running' || !audioMaster) return;
        const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        const start = Math.max(audioCtx.currentTime, when);
        osc.type = wave;
        osc.frequency.setValueAtTime(440 * 2 ** ((midi - 69) / 12), start);
        if (kick) osc.frequency.exponentialRampToValueAtTime(38, start + .1);
        gain.gain.setValueAtTime(.001, start);
        gain.gain.linearRampToValueAtTime(volume, start + .008);
        gain.gain.exponentialRampToValueAtTime(.001, start + length);
        osc.connect(gain); gain.connect(audioMaster); nodes.add(osc);
        osc.onended = () => { nodes.delete(osc); osc.disconnect(); gain.disconnect(); };
        osc.start(start); osc.stop(start + length + .02);
    }
    function score(p) { return Math.max(0, Math.round((p.points - p.extra * 35) / p.chart.notes.length)); }
    function judge(p, text, lane, points) {
        p.combo = points ? p.combo + 1 : 0; p.best = Math.max(p.best, p.combo);
        const label = $('cpPulseJudge');
        if (label) { label.textContent = text; label.dataset.rating = points === 100 ? 'perfect' : points ? 'good' : 'miss'; }
        p.judgeUntil = performance.now() + 550;
        if (lane >= 0) p.flashes[lane] = performance.now() + 140;
    }
    function hit(lane) {
        const p = play;
        if (!p || !active() || !Number.isInteger(lane) || lane < 0 || lane > 3) return;
        const elapsed = performance.now() - p.start;
        if (elapsed < -180 || elapsed > p.chart.end + 200) return;
        const note = p.notes.filter(n => n.lane === lane && !n.done)
            .sort((a, b) => Math.abs(a.at - elapsed) - Math.abs(b.at - elapsed))[0];
        const error = note ? Math.abs(note.at - elapsed) : Infinity;
        if (error <= 180) {
            const points = error <= 65 ? 100 : error <= 120 ? 80 : 50;
            note.done = true; note.el.hidden = true; p.points += points; p.hit++;
            judge(p, points === 100 ? 'PERFECT · 精准' : points === 80 ? 'GREAT · 很稳' : 'GOOD · 接住了', lane, points);
        } else { p.extra++; judge(p, '空拍 · 看准再按', lane, 0); }
        updateHUD(p);
    }
    function updateHUD(p) {
        if ($('cpPulseCombo')) $('cpPulseCombo').textContent = p.combo;
        if ($('cpPulseScore')) $('cpPulseScore').textContent = score(p).toString().padStart(3, '0');
        if ($('cpPulseBest')) $('cpPulseBest').textContent = p.best;
    }
    function start(chapter, round) {
        stop();
        const c = chart(chapter, round), lead = c.travel + 500;
        const board = $('cpPulseField'); if (!board) return;
        const p = play = { chart: c, start: performance.now() + lead,
            audioStart: (audioCtx?.currentTime || 0) + lead / 1000,
            notes: c.notes.map((n, i) => ({ ...n, el: board.querySelector(`[data-note="${i}"]`), done: false })),
            points: 0, extra: 0, combo: 0, best: 0, hit: 0, flashes: [0, 0, 0, 0], judgeUntil: 0, soundNote: 0, soundBeat: 0 };
        const tick = () => {
            if (play !== p) return;
            if (document.hidden || !active()) { pause(); return; }
            const now = performance.now(), elapsed = now - p.start, h = board.clientHeight, line = h - 26;
            for (const note of p.notes) {
                if (!note.done && elapsed > note.at + 180) {
                    note.done = true; note.el.hidden = true; judge(p, 'MISS · 漏拍', note.lane, 0);
                }
                if (!note.done) {
                    const y = line - (note.at - elapsed) / c.travel * line;
                    note.el.style.transform = `translateY(${y}px)`;
                    note.el.style.visibility = y >= -16 && y < h ? 'visible' : 'hidden';
                }
            }
            // Short lookahead schedules sound precisely without tying pitch to frame rate.
            while (p.soundNote < c.notes.length && c.notes[p.soundNote].at <= elapsed + 100) {
                const n = c.notes[p.soundNote++];
                if (n.at >= elapsed - 100) voice([60, 62, 64, 67][n.lane] + (chapter % 3) * 2, p.audioStart + n.at / 1000, .19, .075, 'triangle');
            }
            while (p.soundBeat < 16 && p.soundBeat * c.beat <= elapsed + 100) {
                const b = p.soundBeat++, at = b * c.beat;
                if (at >= elapsed - 100) {
                    voice(43, p.audioStart + at / 1000, .13, .12, 'sine', true);
                    if (b % 2 === 0) voice([36, 41, 43, 38][Math.floor(b / 4)] + (chapter % 3) * 2, p.audioStart + at / 1000, .3, .08, 'triangle');
                }
            }
            board.style.setProperty('--beat-offset', `${(Math.max(0, elapsed) / c.beat * 64) % 64}px`);
            board.querySelectorAll('.cp-pulse-lane').forEach((lane, i) => lane.classList.toggle('hit', now < p.flashes[i]));
            const countdown = $('cpPulseCountdown');
            if (countdown) { countdown.hidden = elapsed >= 0; countdown.textContent = Math.max(1, Math.ceil(-elapsed / 650)); }
            if ($('cpPulseProgress')) $('cpPulseProgress').style.width = `${clamp(elapsed / c.end * 100, 0, 100)}%`;
            if ($('cpPulseJudge') && now > p.judgeUntil) $('cpPulseJudge').textContent = '';
            updateHUD(p);
            if (elapsed > c.end + 250) {
                const result = score(p), message = `命中 ${p.hit}/${p.notes.length} · 最高连击 ${p.best}${p.extra ? ` · 空拍 ${p.extra} 次` : ''}。`;
                complete(result, message); return;
            }
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
    }
    function html(chapter, round, playing) {
        const c = chart(chapter, round);
        return `<div class="cp-pulse" aria-label="霓虹节奏四轨音游"><div class="cp-pulse-hud"><span><small>SCORE / 得分</small><b id="cpPulseScore">000</b></span><span class="cp-pulse-combo"><b id="cpPulseCombo">0</b><small>COMBO / 连击</small></span><span><small>${c.bpm} BPM · 第 ${round + 1} 乐段</small><b><span id="cpPulseBest">0</span><em> 最高连击</em></b></span></div><div class="cp-pulse-progress"><i id="cpPulseProgress"></i></div><div class="cp-pulse-field" id="cpPulseField" data-bpm="${c.bpm}" data-lead="${c.travel + 500}" data-end="${c.end}">${keys.map((key, lane) => `<div class="cp-pulse-lane" style="--lane-color:${colors[lane]}"><div class="cp-pulse-notes">${c.notes.map((n, i) => n.lane === lane ? `<i class="cp-pulse-note" data-note="${i}" data-at="${n.at}" data-lane="${lane}" style="visibility:hidden"></i>` : '').join('')}</div><span class="cp-pulse-target"></span></div>`).join('')}<div class="cp-pulse-countdown" id="cpPulseCountdown" ${playing ? '' : 'hidden'}>3</div>${playing ? '' : '<div class="cp-pulse-ready"><span>FEEL THE PULSE</span><b>把每一拍，落在光里</b><small>音符落到光线时，击打对应轨道</small></div>'}<div class="cp-pulse-judge" id="cpPulseJudge" aria-live="off"></div></div><div class="cp-pulse-keys">${keys.map((key, lane) => `<button type="button" data-training-lane="${lane}" style="--lane-color:${colors[lane]}" aria-label="第 ${lane + 1} 轨，${key} 键" ${playing ? '' : 'disabled'}><b>${key}</b><small>${['低音','律动','旋律','高音'][lane]}</small></button>`).join('')}</div><div class="cp-pulse-legend"><span>精准 ±65ms</span><span>键盘 D F J K / 点击下方音轨</span><span>空拍会扣分</span></div></div>`;
    }
    return { start, stop, hit, html, running: () => !!play };
}
