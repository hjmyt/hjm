'use strict';

// Private Chronicle feature. ctx contains live accessors to sibling features and controller state.
function createChroniclePerformance(ctx) {
    function initLive() { ctx.R().live = { scores: [], score: 0, diff: ctx.liveDifficulty(), pos: 0, dir: 1, phase: 'ready', last: '', finished: false, width: Math.min(40, 14 + ctx.R().tech) }; ctx.log(`${ctx.stageName()}就位：5 段演奏，本场难度 ${ctx.liveDifficulty()}。`); }
    function liveHTML() {
        const l = ctx.R().live;
        if (!l)
            return `<div class="cp-surface"><h3>先做好登台准备</h3>${ctx.actionButton('to-live', '查看快闪准备', 'music', 'primary')}</div>`;
        return `<div class="cp-surface">${ctx.speaker('shiyuan', `${ctx.stageName()} · 第 ${Math.min(5, l.scores.length + 1)} / 5 段`)}<div class="cp-live-score"><div><strong>${l.score}</strong><small> / 难度 ${l.diff}</small></div><div class="cp-live-dots">${Array.from({ length: 5 }, (_, i) => `<span class="cp-live-dot ${i < l.scores.length ? 'done' : ''}">${i < l.scores.length ? '+' + l.scores[i] : '0' + (i + 1)}</span>`).join('')}</div></div><div class="cp-text">${l.phase === 'feedback' ? '这一段，已经落在掌声里。' : '在光标滑进绿区时，按下判定。\n琴技越高，绿区越宽。'}</div><div class="cp-slider-wrap"><div class="cp-slider" id="cpSlider" aria-label="演出判定条，光标进入绿区时点击判定"><div class="cp-zone" style="left:${50 - l.width / 2}%;width:${l.width}%"></div><div class="cp-slider-center"></div><div class="cp-marker" id="cpMarker" style="left:${l.pos}%"></div></div><div class="cp-slider-scale"><span>0</span><span>PERFECT 区</span><span>100</span></div></div>${l.phase === 'paused' ? '<div class="cp-paused">已暂停。离开页面不会替你判定，也不会丢失已完成的分段。</div>' : ''}<div class="cp-judge" role="status">${l.phase === 'feedback' ? ctx.E(l.last) : l.phase === 'playing' ? '看准绿色中央，轻轻按下。' : '深色绿区 PERFECT +10 · 浅色绿区 GOOD +6'}</div><div class="cp-live-actions">${l.phase === 'playing' ? ctx.actionButton('live-hit', '判定！', 'music', 'primary') + ctx.actionButton('live-pause', '暂停', 'pause', 'ghost') : l.phase === 'feedback' ? ctx.actionButton('live-next', l.scores.length >= 5 ? '查看演出结果' : '下一段', 'arrow', 'primary') : ctx.actionButton('live-resume', l.phase === 'paused' ? '继续这一段' : '开始这一段', 'play', 'primary')}</div><div class="cp-live-guide">${l.phase === 'playing' ? '电脑：空格判定 · Esc 暂停 / 手机：点击「判定！」' : '每段只结算一次，五段结束后统计总分。'}<br>绿区宽度 ${l.width}% · 失误也可得 2 分，阿喆羁绊分 +1。</div></div>`;
    }
    function startLiveMotion() {
        const l = ctx.R().live;
        if (ctx.R().scene !== 'live_play' || !l || l.finished || !['ready', 'paused'].includes(l.phase) || currentView !== 'chronicle')
            return;
        l.phase = 'playing';
        ctx.lastFrame = performance.now();
        ctx.lastCheckpoint = ctx.lastFrame;
        ctx.changed();
        cancelAnimationFrame(ctx.raf);
        ctx.raf = requestAnimationFrame(tick);
    }
    function tick(now) {
        ctx.raf = 0;
        const l = ctx.R().live;
        if (currentView !== 'chronicle' || document.hidden || !l || l.phase !== 'playing')
            return;
        const dt = Math.max(0, Math.min(80, now - ctx.lastFrame));
        ctx.lastFrame = now;
        let p = l.pos + l.dir * dt * .09;
        if (p > 100) {
            p = 200 - p;
            l.dir = -1;
        }
        else if (p < 0) {
            p = -p;
            l.dir = 1;
        }
        l.pos = clamp(p, 0, 100);
        const el = $('cpMarker');
        if (el)
            el.style.left = `${l.pos}%`;
        if (now - ctx.lastCheckpoint > 1000) {
            ctx.lastCheckpoint = now;
            save();
        }
        ctx.raf = requestAnimationFrame(tick);
    }
    function suspend() {
        cancelAnimationFrame(ctx.raf);
        ctx.raf = 0;
        const l = ctx.R()?.live;
        if (l?.phase === 'playing') {
            l.phase = 'paused';
            ctx.R().rev++;
            save();
            ctx.renderSignature = '';
            if (currentView === 'chronicle')
                ctx.refresh();
        }
    }
    function liveHit() {
        const l = ctx.R().live;
        if (ctx.R().scene !== 'live_play' || !l || l.phase !== 'playing' || l.finished || l.scores.length >= 5)
            return;
        // Mark the round closed before modifying any scores. Double click and keyboard repeat cannot score twice.
        l.phase = 'feedback';
        cancelAnimationFrame(ctx.raf);
        ctx.raf = 0;
        const distance = Math.abs(l.pos - 50), half = l.width / 2;
        let score, message;
        if (distance <= half * .35) {
            score = 10;
            message = 'PERFECT！台下炸了！';
        }
        else if (distance <= half) {
            score = 6;
            message = 'GOOD，稳住了。';
        }
        else {
            score = 2;
            message = '呲了……阿喆默默帮你翻了谱。';
            grantBond('azhe', 1, { daily: true });
        }
        l.scores.push(score);
        l.score = l.scores.reduce((a, b) => a + b, 0);
        l.last = `${message}（+${score}）`;
        ctx.log(`${ctx.stageName()}第 ${l.scores.length} 段：${l.last}`);
        if (ctx.checkEnding()) {
            l.finished = true;
            l.phase = 'done';
        }
        ctx.changed();
        if (state.sound)
            playPetSound(score === 10 ? 'play' : 'pet');
    }
    function nextLive() {
        const l = ctx.R().live;
        if (ctx.R().scene !== 'live_play' || !l || l.phase !== 'feedback')
            return;
        if (l.scores.length >= 5) {
            finishLive();
            return;
        }
        l.phase = 'ready';
        l.pos = 0;
        l.dir = 1;
        l.last = '';
        ctx.changed();
    }
    function finishLive() {
        const r = ctx.R(), l = r.live;
        if (!l || l.scores.length < 5 || l.finished)
            return;
        l.finished = true;
        l.phase = 'done';
        const win = l.score >= l.diff;
        if (win)
            r.level++;
        if (r.chapter >= 5) {
            ctx.ending(r.chapter === 6 ? (win ? 'c6_he' : 'c6_te') : !win ? 'c5_fail' : r.tech >= 20 && r.level >= 5 && r.aff.shiyuan >= 80 ? 'c5_he' : 'c5_be');
            r.scene = r.ending;
            markDaily('story');
            ctx.changed();
            return;
        }
        ctx.ending(ctx.isFour() ? ((r.flags.qHate || 0) >= 2 || (r.flags.qBack || 0) >= 2 ? 'c4_qiqi' : !win ? 'c4_fail' : r.flags.qiHandled && r.flags.baoOK ? 'c4_he' : 'c4_te') : ctx.isThree() ? ((r.flags.qBack || 0) >= 2 ? 'c3_qiqi' : !win ? 'c3_fail' : !r.flags.qBack && (r.flags.stayShi || r.flags.geTalk) && (r.flags.qiSeen || !r.flags.qiJealous) ? 'c3_he' : 'c3_te') : ctx.isTwo() ? (win ? (r.flags.konggeStay === 1 && r.aff.shiyuan >= 10 ? 'c2_dual' : 'c2_solo') : 'c2_retry') : (win ? 'debut' : 'ordinary'));
        r.scene = ctx.isFour() ? ({ 'c4_qiqi': 'be_qiqi4' }[r.ending] || r.ending) : ctx.isThree() ? ({ 'c3_qiqi': 'be_qiqi' }[r.ending] || r.ending) : 'live_result';
        markDaily('story');
        ctx.changed();
    }
    return { initLive, liveHTML, startLiveMotion, tick, suspend, liveHit, nextLive, finishLive };
}
