'use strict';

// Challenge components mount directly into this tab. The main game owns
// selection, lifecycle, lineup, currency, bond limits and save transactions.
const PitchAudition = (() => {
    const mount = $('pitchGameMount');
    const status = $('pitchRewardStatus');
    const sources = {
        pitch: { factory: createPitchAuditionGame, style: 'pitchAuditionGameStyle', label: '音准辨音' },
        rhythm: { factory: createRhythmAuditionGame, style: 'rhythmAuditionGameStyle', label: '节奏听写' }
    };
    const settledQuestionIds = new Set();
    let activeChallenge = 'pitch';
    let run = null;
    let game = null;
    let focusTimer = null;

    function renderChallengeNav() {
        document.querySelectorAll('[data-pitch-challenge]').forEach(button => {
            const active = button.dataset.pitchChallenge === activeChallenge;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
        });
    }

    function loadChallenge(challenge, { force = false } = {}) {
        if (!sources[challenge] || (!force && challenge === activeChallenge && game)) return;
        game?.destroy?.();
        game = null;
        mount.replaceChildren();
        activeChallenge = challenge;
        run = null;
        status.hidden = true;
        status.textContent = '';
        const styleHref = $(sources[challenge].style)?.href;
        game = sources[challenge].factory(mount, { styleHref });
        renderChallengeNav();
        renderTeam();
        syncSound();
        syncRules();
    }

    function focusQuestion() {
        clearTimeout(focusTimer);
        focusTimer = setTimeout(() => {
            focusTimer = null;
            if (currentView !== 'pitch') return;
            const top = window.scrollY + mount.getBoundingClientRect().top - 12;
            window.scrollTo({ top: Math.max(0, top), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        }, 100);
    }

    function dailyCap(mode) {
        return mode === 'hard' ? ECONOMY_RULES.pitchHardDaily : mode === 'medium' ? ECONOMY_RULES.pitchMediumDaily : ECONOMY_RULES.pitchSimpleDaily;
    }

    function notesRemaining(mode) {
        return Math.max(0, dailyCap(mode) - economy().daily.pitchNotes[mode]);
    }

    function syncRules() {
        if (currentView === 'pitch' && game)
            window.postMessage({ type: 'hjm-pitch-rules', dailyEarned: { ...economy().daily.pitchNotes }, dailyCaps: { simple: dailyCap('simple'), medium: dailyCap('medium'), hard: dailyCap('hard') } }, '*');
    }

    function renderTeam() {
        const ids = run?.ids || state.cards.team;
        const el = $('pitchTeam');
        el.classList.toggle('is-solo', !ids.length);
        el.innerHTML = `${ids.length ? `<div class="team-lineup">${teamSlots(ids, false)}</div>` : `<div class="rhythm-solo-mark">${I('music')}</div>`}<div class="rhythm-team-text"><strong>${run ? '本局编队已就位' : ids.length ? '和伙伴一起练耳' : '先来一场独奏练习'}</strong><small>与节奏舞台共用编队与合奏羁绊额度，每角色每天最多 10 次。简单今日 ${economy().daily.pitchNotes.simple} / ${dailyCap('simple')} 音符；节奏中级今日 ${economy().daily.pitchNotes.medium} / ${dailyCap('medium')} 音符；困难今日 ${economy().daily.pitchNotes.hard} / ${dailyCap('hard')} 音符。简单／中级每分 1 音符，困难每分 2 音符；达到各自上限后仍可练习。得分至少 1 分时，编队伙伴羁绊各 +1。</small></div><button class="btn ghost small" data-route="${availableCardPool().length ? 'cards' : 'chronicle'}">${I(availableCardPool().length ? 'team' : 'album')}${availableCardPool().length ? '调整编队' : '去相遇'}</button>`;
        const mobileSummary = document.createElement('span');
        mobileSummary.className = 'pitch-mobile-summary';
        mobileSummary.textContent = `今日音符：简单 ${economy().daily.pitchNotes.simple} / ${dailyCap('simple')}，中级 ${economy().daily.pitchNotes.medium} / ${dailyCap('medium')}，困难 ${economy().daily.pitchNotes.hard} / ${dailyCap('hard')}。`;
        el.querySelector('.rhythm-team-text').append(mobileSummary);
        syncRules();
    }

    function open(challenge = activeChallenge) {
        if (sources[challenge]) activeChallenge = challenge;
        run = null;
        status.hidden = true;
        status.textContent = '';
        renderTeam();
        loadChallenge(activeChallenge, { force: true });
    }

    function close() {
        clearTimeout(focusTimer);
        focusTimer = null;
        game?.destroy?.();
        game = null;
        mount.replaceChildren();
        run = null;
    }

    function syncSound() {
        if (currentView === 'pitch' && game)
            window.postMessage({ type: 'hjm-pitch-sound', enabled: !!state.sound }, '*');
    }

    function validPitchResult(rounds, answers, score) {
        if (!Array.isArray(rounds) || rounds.length !== 3 || !Array.isArray(answers) || answers.length !== 3 || !Number.isInteger(score) || score < 0 || score > 6)
            return false;
        let points = 0;
        for (let i = 0; i < 3; i++) {
            const round = rounds[i], answer = answers[i];
            if (!Array.isArray(round?.notes) || round.notes.length !== 6 || !round.notes.every(n => Number.isInteger(n) && n >= 1 && n <= 7) || !Number.isInteger(round.wrongIndex) || round.wrongIndex < 0 || round.wrongIndex > 5 || !Number.isFinite(round.offset) || Math.abs(round.offset) < 4 || Math.abs(round.offset) > 12 || ![440, 442].includes(round.referenceHz)) return false;
            if (!answer || !Number.isInteger(answer.selected) || answer.selected < 0 || answer.selected > 5 || !['high', 'low'].includes(answer.direction) || !Number.isFinite(answer.adjustment) || Math.abs(answer.adjustment) > 16 || !Number.isFinite(answer.finalError)) return false;
            const identify = answer.selected === round.wrongIndex && answer.direction === (round.offset > 0 ? 'high' : 'low');
            const finalError = Math.abs(round.offset + answer.adjustment), tuned = finalError <= 3;
            if (answer.identify !== identify || answer.tuned !== tuned || Math.abs(answer.finalError - finalError) > .001) return false;
            points += Number(identify) + Number(tuned);
        }
        return points === score;
    }

    function validRhythmResult(stages, answers, score, mode) {
        const rules=RhythmAuditionRules;
        if (!['simple', 'medium', 'hard'].includes(mode) || !Array.isArray(stages) || stages.length !== 4 || !Array.isArray(answers) || answers.length !== 4 || !Number.isInteger(score) || score < 0 || score > 4) return false;
        let points = 0;
        for (let index = 0; index < 4; index++) {
            const stage = stages[index], answer = answers[index];
            if (stage?.stage !== index + 1 || !Number.isFinite(stage.tempo) || stage.tempo < 40 || stage.tempo > 180 || !rules.validMeasures(stage,stage.measures)) return false;
            if (!answer || typeof answer.passed !== 'boolean' || answer.stage !== index + 1) return false;
            let passed;
            if (mode !== 'hard') {
                const taps = answer.evidence?.taps;
                if (!Array.isArray(taps) || taps.length > 128 || !taps.every(value => Number.isFinite(value) && value >= -.5 && value <= 30)) return false;
                const holds = answer.evidence?.holds ?? [];
                if (!Array.isArray(holds) || holds.length > taps.length || new Set(holds.map(hold=>hold?.tapIndex)).size !== holds.length || !holds.every(hold=>hold && Number.isInteger(hold.tapIndex) && hold.tapIndex >= 0 && hold.tapIndex < taps.length && Number.isFinite(hold.end) && hold.end >= taps[hold.tapIndex] && hold.end <= 30 && (hold.cancelled === undefined || typeof hold.cancelled === 'boolean'))) return false;
                passed = rules.tapAnalysis(stage,taps,holds).passed;
            } else {
                const composed = answer.evidence?.composed;
                if (!rules.validMeasures(stage,composed)) return false;
                passed = rules.sameOnsets(stage,composed);
            }
            if (answer.passed !== passed) return false;
            if (answer.passed) points++;
        }
        return points === score;
    }

    function settle(message) {
        const valid = run?.challenge === 'rhythm' ? validRhythmResult(message.stages, message.answers, message.score, run.mode) : validPitchResult(message.rounds, message.answers, message.score);
        if (!run || run.settled || settledQuestionIds.has(message.id) || message.id !== run.id || message.challenge !== run.challenge || !valid) return;
        if (!storageOK) {
            status.textContent = '存档暂时无法保存，请先恢复存档后再挑战。';
            status.hidden = false;
            window.postMessage({ type: 'hjm-pitch-settled', text: status.textContent }, '*');
            return;
        }
        const snapshot = JSON.parse(JSON.stringify(state));
        if (message.mode !== run.mode) return;
        const rawPayout = message.score * (run.mode === 'hard' ? 2 : 1);
        const payout = Math.min(rawPayout, notesRemaining(run.mode));
        economy().daily.pitchNotes[run.mode] += payout;
        state.coins += payout;
        const gained = [];
        if (message.score > 0)
            for (const id of run.ids)
                if (rewardPerformanceBond(id)) gained.push(cardDef(id)?.name || id);
        if (!save()) {
            state = snapshot;
            syncUnifiedBonds(state);
            syncGlobalLevels(state);
            status.textContent = '本次结算保存失败，音符和羁绊已撤回。请检查存档后重试。';
            status.hidden = false;
            window.postMessage({ type: 'hjm-pitch-settled', text: status.textContent }, '*');
            renderGlobal();
            return;
        }
        run.settled = true;
        settledQuestionIds.add(message.id);
        const modeLabel = run.mode === 'hard' ? '困难' : run.mode === 'medium' ? '中级' : '简单';
        status.textContent = `${sources[run.challenge].label} · ${modeLabel}模式 ${message.score} 分，本局获得 ${payout} 音符${payout < rawPayout ? '（今日该模式音符额度已达上限）' : ''}；今日已获得 ${economy().daily.pitchNotes[run.mode]} / ${dailyCap(run.mode)} 音符${gained.length ? `；${gained.join('、')}羁绊分各 +1` : message.score > 0 && run.ids.length ? '；编队伙伴今日合奏羁绊已达上限' : ''}。`;
        status.hidden = true;
        window.postMessage({ type: 'hjm-pitch-settled', ok: true, text: status.textContent, payout, rawPayout, dailyEarned: economy().daily.pitchNotes[run.mode], dailyCap: dailyCap(run.mode) }, '*');
        syncRules();
        renderGlobal();
        toast(payout ? `${sources[run.challenge].label}完成 · ${payout} 音符` : `${sources[run.challenge].label}完成 · 今日该模式音符已满`, true);
    }

    function onMessage(event) {
        if (event.source !== window || currentView !== 'pitch' || (location.protocol !== 'file:' && event.origin !== location.origin)) return;
        const message = event.data;
        if (!message || typeof message !== 'object') return;
        if (message.type === 'hjm-pitch-focus' && window.matchMedia('(max-width: 700px)').matches) {
            focusQuestion();
        } else if (message.type === 'hjm-pitch-restart' && (!message.challenge || message.challenge === activeChallenge)) {
            run = null;
            status.hidden = true;
            status.textContent = '';
            loadChallenge(activeChallenge, { force: true });
        } else if (message.type === 'hjm-pitch-start' && message.challenge === activeChallenge && typeof message.id === 'string' && /^[A-Z0-9]{7}$/.test(message.id) && (message.challenge === 'rhythm' ? ['simple', 'medium', 'hard'] : ['simple', 'hard']).includes(message.mode)) {
            if (settledQuestionIds.has(message.id)) return;
            run = { challenge: message.challenge, id: message.id, mode: message.mode, ids: [...state.cards.team], settled: false };
            renderTeam();
        } else if (message.type === 'hjm-pitch-complete') {
            settle(message);
        }
    }

    document.querySelectorAll('[data-pitch-challenge]').forEach(button => button.addEventListener('click', () => {
        const challenge = button.dataset.pitchChallenge;
        loadChallenge(challenge);
        setAppAnchor(challenge === 'rhythm' ? 'pitch-rhythm' : 'pitch-tone');
    }));
    window.addEventListener('message', onMessage);
    return { open, close, renderTeam, syncSound, syncRules, loadChallenge, validPitchResult, validRhythmResult };
})();
