'use strict';

const game = { status: 'idle', track: Math.max(0, TRACKS.findIndex(t => t.default)), mode: 'gentle', notes: [], melodyEvents: [], duration: 45, startAt: 0, elapsed: 0, score: 0, combo: 0, maxCombo: 0, perfect: 0, good: 0, nice: 0, miss: 0, raf: 0, lastUi: 0, flashes: [0, 0, 0, 0], judgement: null, result: null, countdownLabel: null, width: 500, height: 404, startToken: 0 };
const canvas = $('rhythmCanvas'), ctx = canvas.getContext('2d');
function gameKey() { return `${TRACKS[game.track].scoreId || TRACKS[game.track].id || game.track}_${game.mode}`; }
// Chart-relative time is negative during the original recording prelude.
// Countdown ends before this audible lead-in; notes retain their MIDI timing.
function gameLeadIn() { return TRACKS[game.track].leadIn ?? 2.5; }
function gameCountdownRemaining() { return Math.max(1, Math.ceil(-game.elapsed - gameLeadIn())); }
function gameTime(now = performance.now()) {
    return TRACKS[game.track].audio ? RhythmRecording.time() : (now - game.startAt) / 1000;
}
function generateChart() {
    const t = TRACKS[game.track], b = 60 / t[game.mode], ns = [];
    game.melodyEvents = [];
    if (t.audio) {
        game.notes = t.charts[game.mode].map(([time, lane]) => ({ time, lane, hit: false, missed: false }));
        game.duration = t.duration;
        return;
    }
    for (let i = 0; i < 64; i++) {
        const pitch = t.melody[i], time = 1 + i * b;
        game.melodyEvents.push({ pitch, time, duration: b * .76 });
        if (i % 8 !== 7)
            ns.push({ time, lane: (i + Math.floor(i / 4)) % 4, pitch, hit: false, missed: false });
        if (game.mode === 'normal' && i % 4 === 1)
            ns.push({ time: time + b * .5, lane: (i + Math.floor(i / 4) + 2) % 4, pitch: pitch + ((i % 8 === 1) ? 2 : -2), hit: false, missed: false });
    }
    game.notes = ns.sort((a, b) => a.time - b.time);
    game.duration = 64 * b + 2;
}
function updateTrackUI() {
    const t = TRACKS[game.track];
    $('trackName').textContent = t.name;
    $('trackDesc').textContent = t.desc;
    $('trackKind').textContent = t.audio ? '原曲录音 · 试玩' : '原创合成小曲';
    $('trackBpm').textContent = `${t[game.mode]} BPM`;
    $('trackDuration').textContent = `约 ${Math.round(game.duration + (t.audioPrelude || 0))} 秒`;
    $('gameTrackLabel').textContent = t.name;
    $('trackSelect').value = String(game.track);
    $$('[data-mode]').forEach(b => {
        b.classList.toggle('active', b.dataset.mode === game.mode);
        b.textContent = b.dataset.mode === 'gentle' ? '初见 · 简单' : '合奏 · 困难';
    });
    updateBest();
    updateGameStats();
    renderAudioStatus();
}
function updateBest() { const best = state.best[gameKey()]; $('bestScore').textContent = best ? best.score.toLocaleString() : 0; $('bestRank').textContent = best ? `${best.rank} 评级 · ${best.accuracy}% 准确率` : '这首歌，还在等你的第一次演奏'; }
function formatTime(t) { t = Math.max(0, Math.floor(t)); return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; }
function updateGameStats() { $('gameScore').textContent = String(game.score).padStart(6, '0'); $('gameCombo').textContent = game.combo; $('gameMaxCombo').textContent = game.maxCombo; $('perfectCount').textContent = game.perfect; $('goodCount').textContent = game.good; $('niceCount').textContent = game.nice; $('missCount').textContent = game.miss; $('gameTime').textContent = `${formatTime(game.elapsed + (TRACKS[game.track].audioPrelude || 0))} / ${formatTime(game.duration + (TRACKS[game.track].audioPrelude || 0))}`; }
function syncGameControls() { const active = ['starting', 'countdown', 'running', 'paused'].includes(game.status); $('trackSelect').disabled = active; $$('[data-mode]').forEach(b => b.disabled = active); $('record').classList.toggle('playing', ['running', 'countdown'].includes(game.status)); $('pauseGame').disabled = !['running', 'countdown', 'paused'].includes(game.status); $('pauseGame').innerHTML = I(game.status === 'paused' ? 'play' : 'pause'); $('pauseGame').setAttribute('aria-label', game.status === 'paused' ? '继续演奏' : '暂停演奏'); const labels = { starting: '正在准备…', countdown: '暂停演奏', running: '暂停演奏', paused: '继续演奏', finished: '再演一遍', idle: '开始演奏' }; $('startGame').innerHTML = I(['running', 'countdown'].includes(game.status) ? 'pause' : 'play') + labels[game.status]; $('startGame').disabled = game.status === 'starting'; }
function renderGameOverlay() {
    const e = $('gameOverlay');
    syncGameControls();
    if (game.status === 'running') {
        e.hidden = true;
        return;
    }
    e.hidden = false;
    if (game.status === 'idle') {
        e.innerHTML = `${I('paw', 'lg')}<h3>准备好，接住心动了吗？</h3><p>当猫爪落到横线<br>按下 D · F · J · K，或点击下方琴键</p><button class="btn primary" data-game="start">${I('play')}开始这次合奏</button>`;
    }
    else if (game.status === 'starting') {
        e.innerHTML = `${I('music', 'lg')}<h3>正在整理乐谱…</h3>`;
    }
    else if (game.status === 'countdown') {
        e.style.background = '#f0e8f135';
        e.style.backdropFilter = 'blur(1px)';
        const n = gameCountdownRemaining();
        e.innerHTML = `<div class="countdown-num">${n}</div><p>把手放在 D · F · J · K 上</p>`;
        game.countdownLabel = n;
    }
    else if (game.status === 'paused') {
        e.innerHTML = `${I('moon', 'lg')}<h3>休息一拍，也没关系。</h3><p>你的旋律停在这里，等你回来。<br>点击继续，或按 Esc。</p><button class="btn primary" data-game="resume">${I('play')}继续演奏</button>`;
    }
    else if (game.status === 'finished') {
        const r = game.result;
        e.innerHTML = `<div class="eyebrow">OUR LITTLE ENCORE</div><h3 class="result-rank">${r.rank}</h3><h3 style="font-size:18px;margin-top:8px">${r.accuracy >= 85 ? '这一次，我们很有默契。' : r.accuracy >= 45 ? '你认真演奏的样子，很好看。' : '每一首合奏，都从第一拍开始。'}</h3><div class="result-stats"><div><strong>${game.score}</strong><span>本次得分</span></div><div><strong>${r.accuracy}%</strong><span>准确率</span></div><div><strong>${game.maxCombo}</strong><span>最高连击</span></div></div><p style="margin:0 0 17px">${r.reward ? `收获 ${r.reward} 音符 · ${r.newBest ? '刷新个人最佳！' : '谢谢你的认真演奏。'}` : '完整演奏达到 C（45%）即可获得音符，试试简单模式再来一次。'}</p>${r.cardBonus ? `<p class="result-extra">其中编队加成 +${r.cardBonus} ♪ · 成员经验与羁绊分已同步</p>` : ''}${game.cardRun?.trioReport ? '<p class="result-extra">' + escapeHTML(game.cardRun.trioReport) + '</p>' : ''}${game.cardRun?.sourceReport ? `<p class="result-extra">${escapeHTML(game.cardRun.sourceReport)}</p>` : ''}${game.cardRun?.lalaReport ? `<p class="result-extra">${escapeHTML(game.cardRun.lalaReport)}</p>` : ''}${game.cardRun?.ids.includes('azhe') && game.cardRun?.credited ? '<button class="btn secondary small" data-azhe-applause style="margin-bottom:8px">为阿喆送上掌声 · 华彩安可</button>' : ''}<div class="result-buttons"><button class="btn primary small" data-game="start">${I('repeat')}再演一遍</button><button class="btn secondary small" data-route="home">回排练室</button></div>`;
    }
    if (game.status !== 'countdown') {
        e.style.background = '';
        e.style.backdropFilter = '';
    }
}
function scheduleSong() {
    if (TRACKS[game.track].audio)
        return;
    if (!audioCtx)
        return;
    stopSongAudio(true);
    const origin = audioCtx.currentTime + (game.startAt - performance.now()) / 1000, now = audioCtx.currentTime;
    for (const n of game.melodyEvents) {
        if (origin + n.time < now + .004)
            continue;
        toneAt(n.pitch, origin + n.time, n.duration, .15, 'song', 'triangle');
        toneAt(n.pitch + 12, origin + n.time, n.duration * .48, .028, 'song', 'sine');
    }
    const t = TRACKS[game.track], beat = 60 / t[game.mode];
    t.chords.forEach(([root, third], bar) => {
        const at = origin + 1 + bar * 4 * beat;
        if (at >= now + .004) {
            toneAt(root, at, beat * 2.5, .16, 'song', 'sine');
            [root + 12, root + 12 + third, root + 19].forEach((p, j) => toneAt(p, at + beat * (.5 + j * .5), beat * 1.3, .058, 'song', 'sine'));
        }
    });
    // Soft count-in clicks only for the countdown that has not yet elapsed.
    for (const d of [-2, -1, 0].map(t => t - gameLeadIn()))
        if (origin + d >= now + .005)
            toneAt(d === -gameLeadIn() ? 84 : 79, origin + d, .06, .08, 'song', 'sine');
}
async function startGame() {
    if (game.status === 'starting')
        return;
    if (game.status === 'running' || game.status === 'countdown') {
        pauseGame();
        return;
    }
    if (game.status === 'paused') {
        resumeGame();
        return;
    }
    stopSongAudio();
    game.startToken++;
    const token = game.startToken;
    game.status = 'starting';
    renderGameOverlay();
    const a = await ensureAudio();
    if (token !== game.startToken)
        return;
    if (!a && state.sound && !audioUnavailable) {
        game.status = 'idle';
        renderGameOverlay();
        return;
    }
    if (TRACKS[game.track].audio) {
        try {
            await RhythmRecording.start(TRACKS[game.track]);
        } catch {
            if (token === game.startToken) {
                game.status = 'idle';
                renderGameOverlay();
                toast('歌曲未能播放，请检查音频后点开始重试。');
            }
            return;
        }
        if (token !== game.startToken) return;
    }
    generateChart();
    const preparation = (TRACKS[game.track].countIn ?? 3) + gameLeadIn();
    Object.assign(game, { elapsed: -preparation, score: 0, combo: 0, maxCombo: 0, perfect: 0, good: 0, nice: 0, miss: 0, flashes: [0, 0, 0, 0], judgement: null, result: null, status: 'countdown', startAt: performance.now() + preparation * 1000, countdownLabel: 3 });
    game.cardRun = captureCardRun();
    renderRhythmTeam();
    if (audioMaster)
        audioMaster.gain.setTargetAtTime(state.sound ? 0.28 : 0, audioCtx.currentTime, .02);
    scheduleSong();
    renderGameOverlay();
    updateGameStats();
    ensureGameLoop();
    if (currentView !== 'rhythm' || document.hidden)
        pauseGame();
    else if (innerWidth <= 720)
        document.querySelector('.stage-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function pauseGame() {
    if (!['running', 'countdown'].includes(game.status))
        return;
    game.elapsed = gameTime();
    game.status = 'paused';
    stopSongAudio();
    renderGameOverlay();
}
async function resumeGame() {
    if (game.status !== 'paused')
        return;
    const token = ++game.startToken;
    const a = await ensureAudio();
    if (token !== game.startToken || game.status !== 'paused')
        return;
    if (!a && state.sound && !audioUnavailable)
        return;
    if (TRACKS[game.track].audio) {
        try {
            await RhythmRecording.resume();
        } catch {
            if (token === game.startToken)
                toast('歌曲暂未恢复，请再点一次继续，或从头再来。');
            return;
        }
        if (token !== game.startToken || game.status !== 'paused') return;
    }
    game.startAt = performance.now() - game.elapsed * 1000;
    game.status = game.elapsed < -gameLeadIn() ? 'countdown' : 'running';
    scheduleSong();
    renderGameOverlay();
    ensureGameLoop();
    if (currentView !== 'rhythm' || document.hidden)
        pauseGame();
    else if (innerWidth <= 720)
        document.querySelector('.stage-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function stopGame(reset = false) {
    game.startToken++;
    stopSongAudio();
    RhythmRecording.reset();
    game.status = 'idle';
    game.elapsed = 0;
    game.cardRun = null;
    if (reset) {
        game.score = 0;
        game.combo = 0;
        game.maxCombo = 0;
        game.perfect = 0;
        game.good = 0;
        game.nice = 0;
        game.miss = 0;
        game.result = null;
        game.judgement = null;
        generateChart();
    }
    updateTrackUI();
    renderGameOverlay();
    renderRhythmTeam();
}
function finishGame() {
    if (!['running', 'countdown'].includes(game.status))
        return;
    const complete = game.status === 'running' && game.duration > 0 && game.elapsed >= game.duration;
    game.status = 'finished';
    stopSongAudio();
    const hits = game.perfect + game.good + game.nice - (game.cardRun?.sourceSnapshot?.assists || 0), raw = game.notes.length ? game.score / (game.notes.length * 1000) * 100 : 0, accuracy = Math.round(raw), rank = raw >= 95 ? 'S' : raw >= 85 ? 'A' : raw >= 70 ? 'B' : raw >= 45 ? 'C' : 'D';
    const qualified = complete && hits > 0 && raw >= 45, payout = qualified ? rhythmPayout(raw, TRACKS[game.track].id, game.mode) : { base: 0, bonus: false };
    game.coinBonusEligible = qualified && payout.bonus;
    const previous = state.best[gameKey()], newBest = complete && hits > 0 && game.score > (previous?.score || 0);
    if (newBest)
        state.best[gameKey()] = { score: game.score, accuracy, rank, combo: game.maxCombo };
    state.coins += payout.base;
    if (qualified) {
        markDaily('rhythm');
        unlock('stage');
    }
    const cardBonusReward = complete ? awardCardPerformance(hits) : 0;
    game.result = { accuracy, rank, reward: payout.base + cardBonusReward, newBest, cardBonus: cardBonusReward };
    save();
    renderGlobal();
    updateBest();
    updateGameStats();
    renderGameOverlay();
}
function hitLane(lane) {
    if (currentView !== 'rhythm' || !$('modalBackdrop').hidden)
        return;
    const now = performance.now();
    game.flashes[lane] = now;
    const btn = document.querySelector(`[data-lane="${lane}"]`);
    btn?.classList.add('pressed');
    setTimeout(() => btn?.classList.remove('pressed'), 120);
    if (game.status !== 'running')
        return;
    const time = gameTime(now), windowSize = game.mode === 'gentle' ? .24 : .19;
    let nearest = null, dist = Infinity;
    for (const note of game.notes) {
        if (note.lane !== lane || note.hit || note.missed)
            continue;
        const d = Math.abs(note.time - time);
        if (d < dist && d <= windowSize) {
            nearest = note;
            dist = d;
        }
    }
    if (!nearest)
        return;
    nearest.hit = true;
    if (game.cardRun?.sourceSnapshot) {
        game.cardRun.sourceSnapshot.manualHits++;
        onXiaotaBeat();
    }
    if (game.cardRun)
        game.cardRun.missStreak = 0;
    let label;
    if (dist <= .075) {
        game.perfect++;
        game.score += 1000;
        label = 'PERFECT';
    }
    else if (dist <= .145) {
        game.good++;
        game.score += 700;
        label = 'GOOD';
    }
    else {
        game.nice++;
        game.score += 400;
        label = 'NICE';
    }
    game.combo++;
    game.maxCombo = Math.max(game.maxCombo, game.combo);
    game.judgement = { text: label, at: now, lane };
    updateGameStats();
}
function resizeCanvas() {
    const rect = $('canvasArea').getBoundingClientRect();
    if (!rect.width)
        return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    game.width = rect.width;
    game.height = rect.height;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawGame(performance.now());
}
function drawPaw(x, y, size, fill) { ctx.save(); ctx.translate(x, y); ctx.scale(size / 22, size / 22); ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(0, 4.5, 6.7, 5.2, 0, 0, Math.PI * 2); ctx.fill(); [[-7, -3, 2.35, 3.1, -.35], [-2.7, -7, 2.25, 3.15, -.06], [2.7, -7, 2.25, 3.15, .06], [7, -3, 2.35, 3.1, .35]].forEach(([a, b, rx, ry, r]) => { ctx.beginPath(); ctx.ellipse(a, b, rx, ry, r, 0, Math.PI * 2); ctx.fill(); }); ctx.restore(); }
function drawGame(now) {
    const w = game.width, h = game.height;
    if (!w || !h)
        return;
    ctx.clearRect(0, 0, w, h);
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#e7dde9');
    bg.addColorStop(.6, '#eee2ea');
    bg.addColorStop(1, '#f6e5eb');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    const laneW = w / 4, lineY = h - 59, approach = game.mode === 'gentle' ? 2.5 : 1.95;
    for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i % 2 ? '#ffffff25' : '#c7acc713';
        ctx.fillRect(i * laneW, 0, laneW, h);
        ctx.strokeStyle = '#ba9fb530';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(i * laneW, 0);
        ctx.lineTo(i * laneW, h);
        ctx.stroke();
        const fade = Math.max(0, 1 - (now - game.flashes[i]) / 210);
        if (fade) {
            const glow = ctx.createLinearGradient(0, h, 0, 0);
            glow.addColorStop(0, `rgba(192,130,174,${fade * .38})`);
            glow.addColorStop(.8, 'rgba(200,150,195,0)');
            ctx.fillStyle = glow;
            ctx.fillRect(i * laneW, 0, laneW, h);
        }
    }
    for (let i = 0; i < 15; i++) {
        const x = (i * 89 + 27) % w, y = (i * 53 + 32) % (h - 75);
        ctx.globalAlpha = .2 + (i % 3) * .1;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, y, i % 3 === 0 ? 2 : 1.2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#ab87a58a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, lineY);
    ctx.lineTo(w, lineY);
    ctx.stroke();
    ctx.fillStyle = '#ffffff70';
    ctx.fillRect(0, lineY - 2, w, 1);
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc((i + .5) * laneW, lineY, 22, 0, Math.PI * 2);
        ctx.fillStyle = '#fff6';
        ctx.fill();
        ctx.strokeStyle = '#b38aaf60';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        drawPaw((i + .5) * laneW, lineY, 20, '#ba99b680');
        ctx.fillStyle = '#ad91a7';
        ctx.font = '9px Georgia';
        ctx.textAlign = 'center';
        ctx.fillText(['D', 'F', 'J', 'K'][i], (i + .5) * laneW, h - 14);
    }
    const time = game.elapsed;
    const visible = game.status === 'running' || (game.status === 'paused' && time >= -gameLeadIn()) ? game.notes : [];
    visible.forEach(n => {
        if (n.hit || n.missed)
            return;
        const y = lineY - (n.time - time) * (lineY + 34) / approach;
        if (y < -35 || y > h + 30)
            return;
        const x = (n.lane + .5) * laneW, r = laneW < 90 ? 20 : 24;
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = n.lane % 2 ? '#b687b161' : '#cd97ad80';
        const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
        g.addColorStop(0, n.lane % 2 ? '#c8a7d0' : '#e3b0bf');
        g.addColorStop(1, n.lane % 2 ? '#b18ebc' : '#c78ca4');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#fff7';
        ctx.lineWidth = 2;
        ctx.stroke();
        drawPaw(x, y, r * 1.05, '#fff7f6');
        ctx.restore();
    });
    if (game.judgement) {
        const age = (now - game.judgement.at) / 1000;
        if (age < .62) {
            ctx.globalAlpha = Math.max(0, 1 - age / .62);
            ctx.textAlign = 'center';
            ctx.font = `500 ${w < 400 ? 24 : 29}px Georgia`;
            ctx.fillStyle = game.judgement.text === 'MISS' ? '#a18a9c' : '#a66690';
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 9;
            ctx.fillText(game.judgement.text, w / 2, h * .46 - age * 17);
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }
    }
}
function gameFrame(now) {
    game.raf = 0;
    if (currentView !== 'rhythm')
        return;
    if (['running', 'countdown'].includes(game.status)) {
        game.elapsed = gameTime(now);
        if (game.status === 'countdown') {
            if (game.elapsed >= -gameLeadIn()) {
                game.status = 'running';
                renderGameOverlay();
            }
            else if (gameCountdownRemaining() !== game.countdownLabel)
                renderGameOverlay();
        }
        if (game.status === 'running') {
            const late = game.mode === 'gentle' ? .24 : .19;
            for (const n of game.notes) {
                if (!n.hit && !n.missed && game.elapsed - n.time > late) {
                    settleLateNote(n, now);
                }
            }
            if (game.elapsed >= game.duration)
                finishGame();
        }
    }
    if (now - game.lastUi > 180) {
        updateGameStats();
        game.lastUi = now;
    }
    drawGame(now);
    game.raf = requestAnimationFrame(gameFrame);
}
function ensureGameLoop() {
    if (!game.raf && currentView === 'rhythm')
        game.raf = requestAnimationFrame(gameFrame);
}
