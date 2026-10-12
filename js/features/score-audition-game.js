'use strict';

const SCORE_AUDITION_MARKUP = `<main class="shell">
  <section class="hero"><div><div class="eyebrow">TRUE SCORE · MUSICXML 真谱</div><h1>真谱演奏</h1><p>选择乐曲与声部，按真实器乐分谱完成整首击打。</p></div><div class="hero-score"><strong id="heroScore">0</strong><small>/ 4 段</small></div></section>
  <section class="game-card" aria-live="polite">
    <header class="game-head"><span class="stage-mark" id="stageMark">准备</span><span><strong id="stageTitle">选择真谱</strong><small id="stageSubtitle">乐曲 · 声部</small></span><span class="progress" id="progress" aria-label="四段进度"><i></i><i></i><i></i><i></i></span></header>
    <div id="gameRoot"></div>
  </section>
</main>`;

function createScoreAuditionGame(mount, { styleHref = 'styles/game-score-audition.css' } = {}) {
    const shadow = mount.shadowRoot || mount.attachShadow({ mode: 'open' });
    const baseStyleHref = document.getElementById('rhythmAuditionGameStyle')?.href || 'styles/game-rhythm-audition.css';
    shadow.innerHTML = `<link rel="stylesheet" href="${baseStyleHref}"><link rel="stylesheet" href="${styleHref}"><div class="game-surface embedded">${SCORE_AUDITION_MARKUP}</div>`;
    const root = shadow, lifecycle = new AbortController(), $ = selector => root.querySelector(selector);
    const selectionKey = 'hjm-score-audition-selection-v1';
    const cachedScore = (() => {
        try {
            const saved = JSON.parse(localStorage.getItem(selectionKey) || 'null');
            const candidate = ScoreAuditionRules.scoreById(saved?.scoreId);
            return candidate?.hidden === true ? null : candidate;
        } catch { return null; }
    })();
    let score = cachedScore || ScoreAuditionRules.score;
    const state = { screen: 'intro', songId: score.songId, scoreId: score.id, mode: 'simple', tempo: Math.round(score.tempo), skipLeadingRests: true, page: 0, followStartSystem: 0, scrollTargetSystem: 0, scrollAnimating: false, currentMeasure: 0, countIn: null, countInHistory: [], taps: [], analysis: null, payout: null, lastTapPitch: null, lastTapDuration: 0, soundingPitch: null, dailyEarned: { simple: 0, medium: 0, hard: 0 }, dailyCaps: { simple: 20, medium: 30, hard: 60 }, rulesReady: false, audioStatus: '点击后启用声音' };
    const hashId = value => { let hash = 2166136261; for (const char of value) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619); return (hash >>> 0).toString(36).toUpperCase().padStart(7, '0').slice(-7); };
    const randomUnit = () => { const value = new Uint32Array(1); crypto.getRandomValues(value); return value[0] / 4294967296; };
    let questionId = hashId(`${score.id}:${randomUnit()}`);
    let audioContext = null, output = null, externalSoundEnabled = true, performanceStart = 0, activeNodes = new Set(), activeTapVoices = [], activeTapGates = new Set(), timers = [], playFrame = 0, scrollTimer = 0, tapVoiceToken = 0, lastDirectTapAt = -Infinity, lastPlayback = null;

    const pageSize = () => matchMedia('(max-width:700px)').matches ? 6 : 12;
    const measuresPerSystem = () => pageSize() / 3;
    const sourcePhrase = () => ScoreAuditionRules.phrase(state.mode, state.tempo, score.id);
    const leadingSilentCount = () => ScoreAuditionRules.leadingSilentMeasures(score);
    const skippedLeadingCount = () => state.skipLeadingRests ? leadingSilentCount() : 0;
    const phrase = () => ScoreAuditionRules.playablePhrase(sourcePhrase(), state.skipLeadingRests);
    const displayMeasures = () => phrase()?.measures || score.measures;
    const totalSystems = () => Math.ceil(displayMeasures().length / measuresPerSystem());
    const totalPages = () => Math.ceil(displayMeasures().length / pageSize());
    const clampPage = page => Math.max(0, Math.min(totalPages() - 1, page));
    const followStartForMeasure = measure => Math.max(0, Math.min(totalSystems() - 3, Math.floor(measure / measuresPerSystem()) - 1));
    const normalizeTempo = value => Math.max(ScoreAuditionRules.tempoRange.min, Math.min(ScoreAuditionRules.tempoRange.max, Math.round(Number(value) || score.tempo)));
    const tempoPercent = () => Math.round(state.tempo / score.tempo * 100);
    const tempoText = () => `${state.tempo} BPM · ${state.tempo === score.tempo ? '原速' : `${tempoPercent()}%`}`;
    const countInSequence = () => {
        const beats = ScoreAuditionRules.timing(phrase()).countInBeats;
        return Array.from({ length: beats }, (_, index) => beats - index).join('、');
    };
    const songs = [...new Map(ScoreAuditionRules.visibleScores.map(candidate => [candidate.songId, { id: candidate.songId, title: candidate.songTitle || candidate.title }])).values()];
    const partsForSong = songId => ScoreAuditionRules.visibleScores.filter(candidate => candidate.songId === songId);
    function persistScoreSelection() {
        try { localStorage.setItem(selectionKey, JSON.stringify({ version: 1, songId: score.songId, scoreId: score.id })); } catch {}
    }
    function selectScore(scoreId) {
        const next = ScoreAuditionRules.scoreById(scoreId);
        if (!next || next.hidden === true) return false;
        score = next; state.songId = next.songId; state.scoreId = next.id; state.tempo = Math.round(next.tempo); state.skipLeadingRests = true; state.page = 0; state.currentMeasure = 0; state.followStartSystem = 0; state.scrollTargetSystem = 0; state.analysis = null; state.payout = null; questionId = hashId(`${score.id}:${randomUnit()}`); persistScoreSelection(); return true;
    }
    const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    const noteIndex = pitch => {
        const match = /^([A-G])(?:#|b)?(\d)$/.exec(pitch), steps = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
        return match ? Number(match[2]) * 7 + steps[match[1]] : 4 * 7 + 2;
    };
    const midi = pitch => {
        const match = /^([A-G])([#b]?)(\d)$/.exec(pitch), semitones = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
        if (!match) return 69;
        return (Number(match[3]) + 1) * 12 + semitones[match[1]] + (match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0);
    };
    const soundingPitch = pitch => {
        const shift = Number(score.transposeSemitones) || 0;
        if (!shift) return pitch;
        const value = midi(pitch) + shift, names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        return `${names[(value % 12 + 12) % 12]}${Math.floor(value / 12) - 1}`;
    };
    const frequency = pitch => 440 * Math.pow(2, (midi(pitch) - 69) / 12);
    const durationLabel = duration => duration === 4 ? '全音符' : duration === 3 ? '附点二分音符' : duration === 2 ? '二分音符' : duration === 1 ? '四分音符' : duration === .5 ? '八分音符' : Math.abs(duration - 1 / 3) < .001 ? '八分三连音' : '十六分音符';

    function noteGlyph(item, x, staffBottom, color, beamInfo = null) {
        const staffBottomPitch = score.clef === 'bass' ? 'G2' : score.clef === 'alto' ? 'F3' : 'E4', y = staffBottom - (noteIndex(item.pitch) - noteIndex(staffBottomPitch)) * 6;
        const hollow = item.duration >= 2, stemDown = beamInfo?.stemDown ?? y < staffBottom - 18, stemX = stemDown ? x - 5 : x + 5, stemEnd = beamInfo?.stemEnd ?? (stemDown ? y + 32 : y - 32);
        let svg = `<g data-pitch="${item.pitch}" data-duration="${item.duration}" aria-label="${item.pitch} ${durationLabel(item.duration)}">`;
        for (let ledger = staffBottom + 12; ledger <= y + 1; ledger += 12) svg += `<path d="M${x - 10} ${ledger}h20" class="ledger"/>`;
        for (let ledger = staffBottom - 60; ledger >= y - 1; ledger -= 12) svg += `<path d="M${x - 10} ${ledger}h20" class="ledger"/>`;
        const accidental = item.pitch.includes('#') ? '♯' : item.pitch.includes('b') ? '♭' : '';
        if (accidental) svg += `<text x="${x - 17}" y="${y + 6}" class="accidental">${accidental}</text>`;
        svg += `<ellipse cx="${x}" cy="${y}" rx="6" ry="4.4" transform="rotate(-18 ${x} ${y})" fill="${hollow ? '#fff' : color}" stroke="${color}" stroke-width="2"/>`;
        if (item.duration < 4) {
            svg += `<path d="M${stemX} ${y}V${stemEnd}" stroke="${color}" stroke-width="2.3"/>`;
            if (item.duration < 1 && !beamInfo) {
                const dir = stemDown ? -1 : 1, flagY = stemEnd;
                svg += `<path data-score-flag="true" d="M${stemX} ${flagY}q${12 * dir} ${8 * (stemDown ? -1 : 1)} ${4 * dir} ${20 * (stemDown ? -1 : 1)}" fill="none" stroke="${color}" stroke-width="2.6"/>`;
                if (item.duration <= .25) svg += `<path data-score-flag-level="2" d="M${stemX} ${flagY + (stemDown ? -7 : 7)}q${12 * dir} ${8 * (stemDown ? -1 : 1)} ${4 * dir} ${20 * (stemDown ? -1 : 1)}" fill="none" stroke="${color}" stroke-width="2.6"/>`;
            }
        }
        if (item.duration === 3 || item.dots) svg += `<circle cx="${x + 11}" cy="${y}" r="2.2" fill="${color}"/>`;
        svg += `</g>`;
        return { svg, y, stemX, stemEnd, stemDown, beamId: beamInfo?.id ?? null, duration: item.duration, at: item.at };
    }

    function restGlyph(item, x, staffBottom, color) {
        const y = staffBottom - 24;
        if (item.measureRest || item.duration >= 4) return `<g data-rest="whole" data-measure-rest="${item.measureRest === true}"><rect x="${x - 7}" y="${y - 1}" width="14" height="5" fill="${color}"/></g>`;
        if (item.duration >= 2) return `<g data-rest="half"><rect x="${x - 7}" y="${y - 5}" width="14" height="5" fill="${color}"/></g>`;
        if (item.duration >= 1) return `<g data-rest="quarter"><path d="M${x - 3} ${y - 18}l8 10-7 8 7 9-9 12 3-12-7-8 7-8-6-9" fill="${color}"/></g>`;
        return `<g data-rest="${item.duration === .5 ? 'eighth' : 'sixteenth'}"><circle cx="${x - 3}" cy="${y - 9}" r="4" fill="${color}"/>${item.duration < .5 ? `<circle cx="${x - 6}" cy="${y + 3}" r="4" fill="${color}"/>` : ''}<path d="M${x} ${y - 9}q10 0 11-9L${x + 2} ${y + 18}" fill="none" stroke="${color}" stroke-width="3.4" stroke-linecap="round"/></g>`;
    }

    function scoreSVG(page = state.page, analysis = state.analysis, currentMeasure = ['preview', 'playing'].includes(state.screen) ? state.currentMeasure : -1) {
        const measures = displayMeasures(), size = pageSize(), following = ['preview', 'playing'].includes(state.screen), perSystem = measuresPerSystem(), start = following ? state.followStartSystem * perSystem : clampPage(page) * size, renderSize = following && state.scrollAnimating ? size + perSystem : size, subset = measures.slice(start, start + renderSize), width = 980, systemHeight = 150, systems = Math.ceil(subset.length / perSystem), height = 3 * systemHeight + 12;
        const firstMeasure = subset[0]?.number ?? start + 1, lastMeasure = subset[subset.length - 1]?.number ?? firstMeasure;
        let svg = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHTML(score.title)} ${score.part}，第 ${firstMeasure} 至 ${lastMeasure} 小节" data-score-page="${page + 1}" data-score-start-measure="${firstMeasure}"><g class="score-systems-track">`;
        for (let system = 0; system < systems; system++) {
            const row = subset.slice(system * perSystem, (system + 1) * perSystem), staffBottom = system * systemHeight + 102, left = 68, right = width - 18, measureWidth = (right - left) / row.length, systemPositions = [];
            svg += `<g data-score-system="${Math.floor(start / perSystem) + system}">`;
            for (let line = 0; line < 5; line++) svg += `<path d="M${left} ${staffBottom - line * 12}H${right}" class="staff-line"/>`;
            const clefGlyph = score.clef === 'bass' ? '𝄢' : score.clef === 'alto' ? '𝄡' : '𝄞';
            svg += `<text x="${left + 2}" y="${staffBottom - (score.clef === 'bass' ? 18 : score.clef === 'alto' ? 11 : 5)}" class="clef ${score.clef === 'bass' ? 'clef-bass' : score.clef === 'alto' ? 'clef-alto' : ''}">${clefGlyph}</text>`;
            row.forEach((measure, localIndex) => {
                const globalIndex = start + system * perSystem + localIndex, x0 = left + localIndex * measureWidth, contentLeft = x0 + (localIndex === 0 ? 49 : 14), contentWidth = measureWidth - (localIndex === 0 ? 58 : 23), status = analysis?.measures?.[globalIndex], active = globalIndex === currentMeasure;
                const color = status ? status.passed ? '#059465' : '#d54941' : '#111';
                if (active) svg += `<rect x="${x0 + 1}" y="${staffBottom - 70}" width="${measureWidth - 2}" height="90" rx="7" class="active-measure"/>`;
                if (status) svg += `<rect x="${x0 + 1}" y="${staffBottom + 11}" width="${measureWidth - 2}" height="5" rx="2.5" fill="${color}" opacity=".72"/>`;
                svg += `<text x="${x0 + 5}" y="${staffBottom - 57}" class="measure-number">${measure.number}</text>`;
                if (localIndex === 0) { const [meterBeats, meterType] = score.meter.split('/'); svg += `<text x="${left + 35}" y="${staffBottom - 29}" class="time-signature"><tspan x="${left + 35}" dy="0">${meterBeats}</tspan><tspan x="${left + 35}" dy="18">${meterType}</tspan></text>`; }
                const positions = [], beamGroups = [], beamByItem = new Map();
                let beamRun = [];
                const flushBeam = () => { if (beamRun.length >= 2) beamGroups.push(beamRun); beamRun = []; };
                measure.items.forEach(item => {
                    if (item.beam === 'begin') { flushBeam(); beamRun = [item]; }
                    else if (item.beam === 'continue') beamRun.push(item);
                    else if (item.beam === 'end') { beamRun.push(item); flushBeam(); }
                    else flushBeam();
                });
                flushBeam();
                beamGroups.forEach((group, beamIndex) => {
                    const staffBottomPitch = score.clef === 'bass' ? 'G2' : score.clef === 'alto' ? 'F3' : 'E4', ys = group.map(item => staffBottom - (noteIndex(item.pitch) - noteIndex(staffBottomPitch)) * 6), stemDown = ys.reduce((sum, value) => sum + value, 0) / ys.length < staffBottom - 18, stemEnd = stemDown ? Math.max(...ys) + 34 : Math.min(...ys) - 34;
                    group.forEach(item => beamByItem.set(item, { id: beamIndex, stemDown, stemEnd }));
                });
                measure.items.forEach(item => {
                    const x = contentLeft + (item.at / measure.beats) * contentWidth + Math.min(8, contentWidth * .04);
                    if (item.rest) svg += restGlyph(item, x, staffBottom, color);
                    else { const glyph = noteGlyph(item, x, staffBottom, color, beamByItem.get(item)), entry = { item, x, y: glyph.y, color, measureNumber: measure.number, globalIndex, ...glyph }; svg += glyph.svg; positions.push(entry); systemPositions.push(entry); }
                });
                beamGroups.forEach((group, beamIndex) => {
                    const notes = positions.filter(position => position.beamId === beamIndex), first = notes[0], last = notes.at(-1);
                    if (!first || !last) return;
                    svg += `<path d="M${first.stemX} ${first.stemEnd}L${last.stemX} ${last.stemEnd}" stroke="${color}" stroke-width="5.2" stroke-linecap="butt" data-score-beam="true" data-score-beam-measure="${measure.number}"/>`;
                    const sixteenths = notes.filter(note => note.duration <= .25);
                    for (let index = 0; index < sixteenths.length; index++) {
                        const current = sixteenths[index], next = sixteenths[index + 1], connected = next && Math.abs(current.at + current.duration - next.at) < 1e-7;
                        const direction = current.stemDown ? 1 : -1, y = current.stemEnd + direction * 7, endX = connected ? next.stemX : current.stemX + (current === last ? -10 : 10);
                        svg += `<path d="M${current.stemX} ${y}L${endX} ${y}" stroke="${color}" stroke-width="4.2" data-score-beam-level="2"/>`;
                        if (connected) index++;
                    }
                });
                svg += `<path d="M${x0 + measureWidth} ${staffBottom - 48}V${staffBottom}" class="bar-line"/>`;
            });
            systemPositions.forEach((entry, index) => {
                if (entry.item.tie?.includes('start')) {
                    const next = systemPositions.slice(index + 1).find(candidate => candidate.item.pitch === entry.item.pitch && candidate.item.tie?.includes('stop'));
                    const endX = next?.x || right - 4, endY = next?.y || entry.y, continuation = next ? '' : ' data-tie-continuation="outgoing"';
                    svg += `<path d="M${entry.x + 4} ${entry.y + 8}Q${(entry.x + endX) / 2} ${Math.max(entry.y, endY) + 18} ${endX - 4} ${endY + 8}" fill="none" stroke="${entry.color}" stroke-width="1.7" data-tie="true" data-tie-from-measure="${entry.measureNumber}" data-tie-to-measure="${next?.measureNumber || ''}"${continuation}/>`;
                }
                if (entry.item.tie?.includes('stop')) {
                    const previous = systemPositions.slice(0, index).reverse().find(candidate => candidate.item.pitch === entry.item.pitch && candidate.item.tie?.includes('start'));
                    if (!previous) {
                        const startX = Math.max(left + 46, entry.x - 34);
                        svg += `<path d="M${startX} ${entry.y + 8}Q${(startX + entry.x) / 2} ${entry.y + 20} ${entry.x - 4} ${entry.y + 8}" fill="none" stroke="${entry.color}" stroke-width="1.7" data-tie="true" data-tie-continuation="incoming" data-tie-from-measure="" data-tie-to-measure="${entry.measureNumber}"/>`;
                    }
                }
            });
            svg += `</g>`;
        }
        return `${svg}</g></svg>`;
    }

    function progressHeader() {
        $('#heroScore').textContent = state.analysis?.score || 0;
        $('#stageMark').textContent = state.screen === 'intro' ? '准备' : state.screen === 'result' ? '完成' : state.screen === 'playing' ? '演奏' : state.screen === 'preview' ? '示范' : '全谱';
        $('#stageTitle').textContent = `${score.title} · ${score.part}`;
        $('#stageSubtitle').textContent = `${score.sourceMeasures} · ${score.meter} · ♩=${state.tempo}${state.tempo === score.tempo ? ' 原速' : ` · ${tempoPercent()}%`}`;
        [...$('#progress').children].forEach((item, index) => item.className = state.analysis?.sections?.[index]?.passed ? 'done' : ['preview', 'playing'].includes(state.screen) && index === Math.min(3, Math.floor(state.currentMeasure * 4 / displayMeasures().length)) ? 'current' : '');
    }

    function pager() {
        const measures = displayMeasures(), rangeText = (start, count) => {
            const first = measures[start], last = measures[Math.min(measures.length - 1, start + count - 1)];
            return first && last ? `小节 ${first.number}–${last.number}` : '';
        };
        if (['preview', 'playing'].includes(state.screen)) {
            const visibleSystem = state.scrollAnimating ? state.scrollTargetSystem : state.followStartSystem, start = visibleSystem * measuresPerSystem();
            return `<div class="score-pager score-follow-pager"><span aria-hidden="true"></span><strong>自动跟谱 <small>当前显示${rangeText(start, pageSize())} · 三行预读</small></strong><span aria-hidden="true"></span></div>`;
        }
        const start = state.page * pageSize();
        return `<div class="score-pager"><button class="btn ghost" data-action="prev-page" ${state.page === 0 ? 'disabled' : ''}>上一页</button><strong>第 ${state.page + 1} / ${totalPages()} 页 <small>${rangeText(start, pageSize())}</small></strong><button class="btn ghost" data-action="next-page" ${state.page >= totalPages() - 1 ? 'disabled' : ''}>下一页</button></div>`;
    }

    function countInPanel(kind) {
        if (state.countIn === null) return '';
        const clock = ScoreAuditionRules.timing(phrase());
        return `<div class="true-score-countdown" data-score-countdown data-accent="${state.countIn === clock.countInBeats ? 'strong' : 'weak'}"><span><strong>${kind === 'preview' ? '示范预备拍' : '演奏预备拍'}</strong><small>${score.meter} · ${clock.countInBeats} 拍预备 · 跟随 ${state.tempo} BPM</small></span><b data-score-countdown-value aria-live="assertive">${state.countIn}</b></div>`;
    }

    function renderIntro() {
        const modes = ['simple', 'medium', 'hard'].map(mode => {
            const spec = score.modes[mode];
            return `<button class="mode ${state.mode === mode ? 'selected' : ''}" data-mode="${mode}"><span class="mode-head"><strong>${spec.label} · ${spec.preview ? '带全谱示范' : mode === 'hard' ? '严格完整击打' : '独立演奏'}</strong><em>${mode === 'hard' ? '8 ♪' : '4 ♪'}</em></span><small>${spec.description}</small><small class="quota">今日 ${state.dailyEarned[mode]} / ${state.dailyCaps[mode]}</small></button>`;
        }).join('');
        const arrow = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>', check = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8l3 3 7-7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        const selectControl = (kind, label, value, options) => {
            const current = options.find(option => option.value === value) || options[0], nativeAttribute = kind === 'song' ? 'data-score-song' : 'data-score-part';
            const optionMarkup = options.map((option, index) => `<button type="button" id="score-${kind}-option-${index}" class="score-select-option ${option.value === value ? 'selected' : ''}" role="option" aria-selected="${option.value === value}" data-score-select-option="${kind}" data-value="${escapeHTML(option.value)}"><span>${escapeHTML(option.label)}</span><i>${check}</i></button>`).join('');
            const nativeOptions = options.map(option => `<option value="${escapeHTML(option.value)}" ${option.value === value ? 'selected' : ''}>${escapeHTML(option.label)}</option>`).join('');
            return `<div class="score-source-field"><span class="score-source-label" id="score-${kind}-label">${label}</span><div class="score-select" data-score-select="${kind}"><button type="button" class="score-select-trigger" data-score-select-trigger="${kind}" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="score-${kind}-label score-${kind}-value"><span id="score-${kind}-value">${escapeHTML(current?.label || '')}</span><i>${arrow}</i></button><div class="score-select-popup" role="listbox" aria-labelledby="score-${kind}-label">${optionMarkup}</div><select class="score-native-select" ${nativeAttribute} tabindex="-1" aria-hidden="true">${nativeOptions}</select></div></div>`;
        };
        const songControl = selectControl('song', '乐曲', state.songId, songs.map(song => ({ value:song.id, label:song.title }))), partControl = selectControl('part', '声部', score.id, partsForSong(state.songId).map(candidate => ({ value:candidate.id, label:candidate.part })));
        return `<div class="game-body intro true-score-intro"><div class="intro-content"><div class="score-intro-heading"><div class="intro-icon" aria-hidden="true">𝄞</div><div><h2>选择真谱</h2><p>先选择乐曲与声部，再选择考核难度。每个声部都使用完整 MusicXML 分谱。</p></div></div><section class="score-choice-panel" aria-label="选择乐曲与声部"><div class="score-source-selectors">${songControl}${partControl}</div><div class="score-selection-meta"><div class="selected-score-summary"><small>当前分谱</small><strong>${score.title} · ${score.part}</strong><span>${score.sourceMeasures} · ${score.meter} · ♩=${score.tempo}</span></div><div class="source-badge">MusicXML 4.0 · 已校验 ${score.measures.length} 小节</div></div></section><div class="score-mode-heading"><strong>选择难度</strong><span>简单可听示范，中级与困难直接演奏</span></div><div class="mode-picker">${modes}</div><button class="btn primary block" data-action="start" ${state.rulesReady ? '' : 'disabled'}>打开全谱</button><p><a href="assets/audio/soundfonts/musyng-kite/LICENSE.html" target="_blank" rel="noopener">Musyng Kite · 音源来源与授权</a></p></div></div>`;
    }

    function leadingRestControl() {
        const count = leadingSilentCount();
        if (!count) return '';
        const firstPlayed = score.measures[count]?.number || count + 1, enabled = state.skipLeadingRests;
        return `<section class="score-leading-rests" aria-label="开头空小节设置"><span><strong>省略开头空小节</strong><small>${enabled ? `已跳过原谱第 1–${count} 小节，从第 ${firstPlayed} 小节开始；原小节号保持不变。` : `当前保留原谱第 1–${count} 小节的完整空拍。`}</small></span><button type="button" class="score-rest-toggle ${enabled ? 'active' : ''}" role="switch" aria-checked="${enabled}" data-action="toggle-leading-rests"><i aria-hidden="true"></i><b>${enabled ? '已省略' : '完整保留'}</b></button></section>`;
    }

    function renderReady() {
        const spec = score.modes[state.mode], clock = ScoreAuditionRules.timing(phrase()), presets = [...new Set([ScoreAuditionRules.tempoRange.min, Math.round(score.tempo * .75), Math.round(score.tempo), ScoreAuditionRules.tempoRange.max])].map(normalizeTempo).map(tempo => `<button type="button" class="score-tempo-preset ${state.tempo === tempo ? 'active' : ''}" data-score-tempo-preset="${tempo}" aria-pressed="${state.tempo === tempo}">${tempo === score.tempo ? '原速' : `${Math.round(tempo / score.tempo * 100)}%`}</button>`).join('');
        return `<div class="game-body true-score-ready"><div class="stage-top"><div class="stage-copy"><h2>${spec.label} · 全谱演奏</h2><p>${spec.description}。成绩按 4 个乐段结算；每次点按依次播放下一个有声起拍，延音线续音不重复敲，声音会按谱面时值自动播放完整。</p></div><div class="stage-labels"><span class="chip">${score.meter}</span><span class="chip" data-selected-tempo>♩=${state.tempo}</span><span class="chip" data-score-duration>约 ${Math.ceil(clock.phraseSeconds)} 秒</span></div></div><section class="score-tempo-panel" aria-label="演奏速度"><div class="score-tempo-copy"><strong>选择演奏速度</strong><small>示范、节拍器、滚谱、点按判定与发声时值会同步调整；音高保持不变。</small></div><label class="score-tempo-slider"><input type="range" min="${ScoreAuditionRules.tempoRange.min}" max="${ScoreAuditionRules.tempoRange.max}" step="1" value="${state.tempo}" data-score-tempo aria-label="演奏速度 BPM"><output data-score-tempo-output aria-live="polite">${tempoText()}</output></label><div class="score-tempo-presets" aria-label="常用速度">${presets}</div></section>${leadingRestControl()}${pager()}<div class="score-sheet true-score-sheet">${scoreSVG()}</div><div class="audio-strip"><span>${spec.preview ? `示范包含演奏范围内的全谱音高、时值与按 ${score.meter} 拍号进行的 ${clock.countInBeats} 拍预备拍；每屏显示三行并自动向上滚动。` : `本难度不提供正确示范；可按每页三行查看当前 ${displayMeasures().length} 小节。`}</span><div class="audio-actions"><button class="btn ghost" data-action="restart">返回难度</button>${spec.preview ? '<button class="btn ghost" data-action="preview">▶ 播放全谱示范</button>' : ''}<button class="btn primary" data-action="perform">开始全谱击打</button></div></div></div>`;
    }

    function renderPlaying() {
        const measures = displayMeasures(), progress = Math.min(100, ((state.currentMeasure + 1) / measures.length) * 100), current = measures[state.currentMeasure]?.number || score.measures.length;
        return `<div class="game-body true-score-playing"><div class="performance-status"><strong>正在演奏 · 第 ${current} / ${score.measures.length} 小节</strong><span>${state.taps.length} 次击打</span><i><b style="width:${progress}%"></b></i></div>${countInPanel('playing')}${pager()}<div class="score-sheet true-score-sheet score-follow-sheet ${state.scrollAnimating ? 'score-scroll-up' : ''}">${scoreSVG()}</div><button class="tap-pad" data-action="tap" aria-label="按当前真谱节奏点按" ${state.countIn === null ? '' : 'disabled'}><strong data-tap-title>${state.countIn === null ? '按谱点按' : '等待预备拍'}</strong><small data-tap-status>${state.countIn === null ? '每次点按播放下一个起音；短音会清晰收束' : `${countInSequence()} 结束后再开始击打`}</small></button></div>`;
    }

    function renderPreview() {
        const measures = displayMeasures(), progress = Math.min(100, ((state.currentMeasure + 1) / measures.length) * 100), current = measures[state.currentMeasure]?.number || score.measures.length;
        return `<div class="game-body true-score-preview"><div class="performance-status preview-status"><strong>示范播放 · 第 ${current} / ${score.measures.length} 小节</strong><span>旋律 + 全程节拍器</span><i><b style="width:${progress}%"></b></i></div>${countInPanel('preview')}${pager()}<div class="score-sheet true-score-sheet score-follow-sheet ${state.scrollAnimating ? 'score-scroll-up' : ''}">${scoreSVG()}</div><div class="audio-strip"><span>先按 ${countInSequence()} 完成一小节预备拍；绿色小节框随后移动。进入第三行时谱面向上滚动，并从底部提前带出下一行。</span><div class="audio-actions"><button class="btn ghost" data-action="stop-preview">停止示范</button><button class="btn primary" data-action="perform">停止示范并开始考核</button></div></div></div>`;
    }

    function renderResult() {
        const analysis = state.analysis, sections = analysis.sections.map(section => `<article class="section-result ${section.passed ? 'pass' : 'fail'}"><b>${section.index}</b><span>小节 ${section.startMeasure}–${section.endMeasure}</span><strong>${section.passedMeasures} / ${section.totalMeasures} 小节</strong></article>`).join('');
        return `<div class="game-body final true-score-result"><div class="final-content"><div class="result-ring"><div><strong>${analysis.score}</strong><small>/ 4 段</small></div></div><h2>${analysis.score === 4 ? '整首稳稳接住了' : '全谱已经留下你的演奏记录'}</h2><p>绿色为通过小节，红色为需要再练的小节；只校验每个有声起拍的点按时机。</p><div class="section-results">${sections}</div>${pager()}<div class="score-sheet true-score-sheet result-score">${scoreSVG()}</div><div class="reward"><div class="reward-amount"><strong><span id="resultRewardAmount">${state.payout ?? analysis.score * (state.mode === 'hard' ? 2 : 1)}</span> ♪</strong><small>本局音符</small></div><p><strong id="resultDailyValue">正在结算…</strong><br><span id="embeddedPayout">逐小节判定已完成；乐段得分用于音符结算。</span></p></div><button class="btn primary block" data-action="restart">再选一次难度</button></div></div>`;
    }

    function render() {
        progressHeader();
        $('#gameRoot').innerHTML = state.screen === 'intro' ? renderIntro() : state.screen === 'ready' ? renderReady() : state.screen === 'preview' ? renderPreview() : state.screen === 'playing' ? renderPlaying() : renderResult();
        if(state.samplesLoading){for(const button of $('#gameRoot').querySelectorAll('[data-action="preview"], [data-action="perform"]')){button.disabled=true;button.textContent='正在载入乐器采样…';}}
        if(state.sampleStatus){const label=document.createElement('p');label.className='audio-strip';label.textContent=state.sampleStatus;$('#gameRoot').append(label);}

    }

    function ensureAudio() {
        if (!externalSoundEnabled) { state.audioStatus = '游戏声音已关闭，请先开启声音'; return false; }
        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtor) return false;
        if (!audioContext) {
            audioContext = new AudioCtor(); output = audioContext.createGain(); output.gain.value = 1;
            const compressor = audioContext.createDynamicsCompressor();
            compressor.threshold.value = -6; compressor.knee.value = 6; compressor.ratio.value = 12;
            compressor.attack.value = .003; compressor.release.value = .12;
            output.connect(compressor); compressor.connect(audioContext.destination);
        }
        if (audioContext.state === 'suspended') audioContext.resume();
        return true;
    }
    function track(node) { activeNodes.add(node); node.addEventListener?.('ended', () => activeNodes.delete(node), { once: true }); return node; }
    function clickTone(when, accent = false) {
        const osc = track(audioContext.createOscillator()), gain = audioContext.createGain(); osc.frequency.value = accent ? 1180 : 820; osc.type = 'square'; gain.gain.setValueAtTime(0, when); gain.gain.linearRampToValueAtTime(accent ? .16 : .1, when + .003); gain.gain.exponentialRampToValueAtTime(.001, when + .055); osc.connect(gain).connect(output); osc.start(when); osc.stop(when + .06);
    }
    function scoreTone(event, when, beatSeconds) {
        ScoreInstrumentAudio.play(audioContext,output,score.instrument,frequency(soundingPitch(event.pitch)),when,event.duration*beatSeconds,.12,track);
    }
    function attackAtTime(elapsed) {
        const data = phrase(), events = ScoreAuditionRules.tapTargets(data);
        let best = null, distance = Infinity;
        for (const event of events) {
            const current = Math.abs(event.start - elapsed);
            if (current < distance) { best = event; distance = current; }
        }
        if (!best?.pitch) return null;
        const beatSeconds = ScoreAuditionRules.timing(data).beatSeconds;
        return { ...best, pitch: soundingPitch(best.pitch), duration: best.duration * beatSeconds, notes: (best.notes || [best]).map(note => ({ ...note, pitch: soundingPitch(note.pitch), duration: note.duration * beatSeconds })) };
    }
    function attackAtIndex(index) {
        const data = phrase(), target = ScoreAuditionRules.tapTargets(data)[index];
        if (!target?.pitch) return null;
        const beatSeconds = ScoreAuditionRules.timing(data).beatSeconds;
        return { ...target, pitch: soundingPitch(target.pitch), duration: target.duration * beatSeconds, notes: (target.notes || [target]).map(note => ({ ...note, pitch: soundingPitch(note.pitch), duration: note.duration * beatSeconds })) };
    }
    const pitchAtTime = elapsed => attackAtTime(elapsed)?.pitch || null;
    function stopTapVoices() {
        tapVoiceToken++;
        activeTapVoices.forEach(voice => { try { voice.release(.008); } catch {} });
        activeTapVoices = [];
        state.soundingPitch = null;
    }
    function createTapVoice(note, volume) {
        const gate = audioContext.createGain(); gate.gain.value = 1; gate.connect(output); activeTapGates.add(gate);
        const source = ScoreInstrumentAudio.play(audioContext,gate,score.instrument,frequency(note.pitch),audioContext.currentTime,null,volume,track);
        let released = false;
        return { release(fade = Math.max(.012, Math.min(.035, note.duration * .18))) {
            if (released) return; released = true;
            const now = audioContext.currentTime, tail = Math.max(.006, fade);
            gate.gain.cancelScheduledValues(now); gate.gain.setValueAtTime(Math.max(.0001, gate.gain.value), now); gate.gain.exponentialRampToValueAtTime(.0001, now + tail);
            source?.release(now);
            timers.push(setTimeout(() => { try { gate.disconnect(); } catch {} activeTapGates.delete(gate); }, (tail + .11) * 1000));
        } };
    }
    function startTapTone(attack) {
        if (!attack?.pitch || !audioContext || audioContext.state !== 'running') return null;
        stopTapVoices();
        const token = ++tapVoiceToken, notes = attack.notes?.length ? attack.notes : [attack], duration = Math.max(...notes.map(note => note.duration));
        state.lastTapPitch = attack.pitch; state.lastTapDuration = duration; state.soundingPitch = attack.pitch;
        activeTapVoices = notes.map(note => createTapVoice(note,.12 / Math.sqrt(notes.length)));
        notes.forEach((note, index) => timers.push(setTimeout(() => { if (tapVoiceToken === token) activeTapVoices[index]?.release(); }, note.duration * 1000)));
        timers.push(setTimeout(() => { if (tapVoiceToken === token) { activeTapVoices = []; state.soundingPitch = null; } }, (duration + .12) * 1000));
        return attack;
    }

    let sampleLoadToken=0;
    function clearRuntime() { sampleLoadToken++; stopTapVoices(); state.samplesLoading=false; timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(playFrame); playFrame = 0; state.countIn = null; for (const node of activeNodes) { try { node.stop(); } catch {} try { node.disconnect(); } catch {} } activeNodes.clear(); for (const gate of activeTapGates) { try { gate.disconnect(); } catch {} } activeTapGates.clear(); }
    function stopAudio() { clearRuntime(); }
    function scheduleCountIn(start, timing) { for (let beat = 0; beat < timing.countInBeats; beat++) clickTone(start + beat * timing.countInBeatSeconds, beat === 0); }
    function scheduleVisualCountIn(start, timing) {
        state.countIn = timing.countInBeats; state.countInHistory = [timing.countInBeats];
        for (let index = 1; index < timing.countInBeats; index++) timers.push(setTimeout(() => {
            const value = timing.countInBeats - index; state.countIn = value; state.countInHistory.push(value);
            const panel = $('[data-score-countdown]'), outputValue = $('[data-score-countdown-value]');
            if (panel) panel.dataset.accent = value === timing.countInBeats ? 'strong' : 'weak';
            if (outputValue) outputValue.textContent = String(value);
        }, Math.max(0, (start - audioContext.currentTime + index * timing.countInBeatSeconds) * 1000)));
        timers.push(setTimeout(() => {
            state.countIn = null;
            const panel = $('[data-score-countdown]'), pad = $('[data-action="tap"]'), title = $('[data-tap-title]'), status = $('[data-tap-status]');
            if (panel) panel.hidden = true;
            if (pad) pad.disabled = false;
            if (title) title.textContent = '按谱点按';
            if (status) status.textContent = '每次点按播放下一个起音；短音会清晰收束';
        }, Math.max(0, (start - audioContext.currentTime + timing.countInSeconds) * 1000)));
    }

    async function preview() {
        if (!score.modes[state.mode].preview || !ensureAudio()) return;
        stopAudio();
        const token=sampleLoadToken;
        state.samplesLoading=true;state.sampleStatus='正在载入 Musyng Kite 乐器采样…';render();
        const sampled=await ScoreInstrumentAudio.prepare(audioContext,[score.instrument]);
        if(token!==sampleLoadToken || !externalSoundEnabled)return;
        state.samplesLoading=false;state.sampleStatus=sampled?'Musyng Kite · 乐器采样':'采样未能载入，暂用合成音色；下次播放将重试。';
        const data = phrase(), timing = ScoreAuditionRules.timing(data), start = audioContext.currentTime + .08, musicStart = start + timing.countInSeconds;
        performanceStart = musicStart; state.currentMeasure = 0; state.page = 0; state.followStartSystem = 0; state.scrollTargetSystem = 0; state.scrollAnimating = false; state.screen = 'preview'; state.audioStatus = '正在播放全谱示范';
        scheduleCountIn(start, timing); scheduleVisualCountIn(start, timing);
        ScoreAuditionRules.metronomeBeats(data).forEach(beat => clickTone(musicStart + beat.beat * timing.beatSeconds, beat.accent));
        const noteEvents = ScoreAuditionRules.soundingEvents(data); noteEvents.forEach(event => scoreTone(event, musicStart + event.beat * timing.beatSeconds, timing.beatSeconds));
        lastPlayback = { kind: 'preview', scoreId: score.id, instrument: score.instrument, tempo: data.tempo, beatSeconds: timing.beatSeconds, countInBeatSeconds: timing.countInBeatSeconds, countInSeconds: timing.countInSeconds, countInClicks: timing.countInBeats, skippedLeadingMeasures: skippedLeadingCount(), playedMeasures: data.measures.length, metronomeClicks: timing.phraseBeats, noteEvents: noteEvents.length, start, musicStart };
        render(); playFrame = requestAnimationFrame(updatePlayback);
        timers.push(setTimeout(() => { if (state.screen !== 'preview') return; stopAudio(); state.audioStatus = '全谱示范播放完成'; state.screen = 'ready'; render(); }, (timing.countInSeconds + timing.phraseSeconds + .2) * 1000));
    }

    function syncPlaybackPosition(elapsed) {
        const data = phrase(), timing = ScoreAuditionRules.timing(data), beat = Math.max(0, elapsed) / timing.beatSeconds, measure = Math.max(0, Math.min(data.measures.length - 1, ScoreAuditionRules.measureAtBeat(data, beat)));
        if (measure !== state.currentMeasure) {
            state.currentMeasure = measure;
            const targetSystem = followStartForMeasure(measure);
            if (targetSystem !== state.followStartSystem) {
                clearTimeout(scrollTimer); state.scrollTargetSystem = targetSystem; state.scrollAnimating = true; render();
                scrollTimer = setTimeout(() => {
                    if (!['preview', 'playing'].includes(state.screen)) return;
                    state.followStartSystem = targetSystem; state.scrollTargetSystem = targetSystem; state.scrollAnimating = false; render();
                }, 430);
            } else render();
        }
        return measure;
    }
    function updatePlayback() {
        if (!['preview', 'playing'].includes(state.screen) || !audioContext) return;
        syncPlaybackPosition(audioContext.currentTime - performanceStart);
        playFrame = requestAnimationFrame(updatePlayback);
    }

    async function beginPerformance() {
        if (!ensureAudio()) return;
        stopAudio();
        const token=sampleLoadToken;
        state.samplesLoading=true;state.sampleStatus='正在载入 Musyng Kite 乐器采样…';render();
        const sampled=await ScoreInstrumentAudio.prepare(audioContext,[score.instrument]);
        if(token!==sampleLoadToken || !externalSoundEnabled)return;
        state.samplesLoading=false;state.sampleStatus=sampled?'Musyng Kite · 乐器采样':'采样未能载入，暂用合成音色；下次播放将重试。';
        const data = phrase(), timing = ScoreAuditionRules.timing(data), start = audioContext.currentTime + .08;
        performanceStart = start + timing.countInSeconds; state.taps = []; state.lastTapPitch = null; state.currentMeasure = 0; state.page = 0; state.followStartSystem = 0; state.scrollTargetSystem = 0; state.scrollAnimating = false; state.screen = 'playing'; scheduleVisualCountIn(start, timing); render(); scheduleCountIn(start, timing);
        ScoreAuditionRules.metronomeBeats(data).forEach(beat => clickTone(performanceStart + beat.beat * timing.beatSeconds, beat.accent));
        lastPlayback = { kind: 'performance', scoreId: score.id, instrument: score.instrument, tempo: data.tempo, beatSeconds: timing.beatSeconds, countInBeatSeconds: timing.countInBeatSeconds, countInSeconds: timing.countInSeconds, countInClicks: timing.countInBeats, skippedLeadingMeasures: skippedLeadingCount(), playedMeasures: data.measures.length, metronomeClicks: timing.phraseBeats, noteEvents: 0, start, musicStart: performanceStart };
        playFrame = requestAnimationFrame(updatePlayback);
        timers.push(setTimeout(finishPerformance, (timing.countInSeconds + timing.phraseSeconds + .45) * 1000));
    }
    function recordTap() {
        if (state.screen !== 'playing' || state.countIn !== null || !audioContext || audioContext.currentTime < performanceStart) return false;
        const elapsed = audioContext.currentTime - performanceStart, attack = attackAtIndex(state.taps.length);
        startTapTone(attack);
        state.taps.push(elapsed); if (lastPlayback) { lastPlayback.lastTapPitch = attack?.pitch || null; lastPlayback.lastTapDuration = attack?.duration || 0; }
        const pad = $('[data-action="tap"]');
        pad?.classList.add('hit');
        timers.push(setTimeout(() => pad?.classList.remove('hit'), 90));
        return true;
    }
    function finishPerformance(forcedTaps = null) {
        if (state.screen !== 'playing') return;
        if (forcedTaps) state.taps = forcedTaps.slice();
        stopAudio(); clearTimeout(scrollTimer); state.countIn = null; state.scrollAnimating = false; state.analysis = ScoreAuditionRules.analyze(phrase(), state.taps); state.page = 0; state.screen = 'result'; render();
        parent.postMessage({ type: 'hjm-pitch-complete', challenge: 'score', id: questionId, mode: state.mode, score: state.analysis.score, scoreId: score.id, evidence: { tempo: state.tempo, skipLeadingRests: state.skipLeadingRests && leadingSilentCount() > 0, taps: state.taps.slice() } }, '*');
    }
    function startGame() { if (!state.rulesReady) return; state.analysis = null; state.payout = null; state.page = 0; state.screen = 'ready'; render(); parent.postMessage({ type: 'hjm-pitch-start', challenge: 'score', id: questionId, mode: state.mode, scoreId: score.id }, '*'); parent.postMessage({ type: 'hjm-pitch-focus', challenge: 'score' }, '*'); }

    function closeScoreSelect(focusKind = null) {
        root.querySelectorAll('[data-score-select].open').forEach(select => {
            select.classList.remove('open');
            select.querySelector('[data-score-select-trigger]')?.setAttribute('aria-expanded', 'false');
        });
        if (focusKind) root.querySelector(`[data-score-select-trigger="${focusKind}"]`)?.focus();
    }
    function openScoreSelect(kind, focusOption = false) {
        const select = root.querySelector(`[data-score-select="${kind}"]`), trigger = select?.querySelector('[data-score-select-trigger]');
        if (!select || !trigger) return;
        closeScoreSelect(); select.classList.add('open'); trigger.setAttribute('aria-expanded', 'true');
        if (focusOption) (select.querySelector('.score-select-option.selected') || select.querySelector('.score-select-option'))?.focus();
    }
    function chooseScoreSelect(kind, value) {
        if (kind === 'song') { const first = partsForSong(value)[0]; if (first) selectScore(first.id); }
        else selectScore(value);
        render(); requestAnimationFrame(() => root.querySelector(`[data-score-select-trigger="${kind}"]`)?.focus());
    }

    $('#gameRoot').addEventListener('click', event => {
        const selectTrigger = event.target.closest('[data-score-select-trigger]');
        if (selectTrigger && state.screen === 'intro') { const kind = selectTrigger.dataset.scoreSelectTrigger, isOpen = selectTrigger.closest('[data-score-select]').classList.contains('open'); if (isOpen) closeScoreSelect(kind); else openScoreSelect(kind); return; }
        const selectOption = event.target.closest('[data-score-select-option]');
        if (selectOption && state.screen === 'intro') { chooseScoreSelect(selectOption.dataset.scoreSelectOption, selectOption.dataset.value); return; }
        closeScoreSelect();
        const mode = event.target.closest('[data-mode]'); if (mode && state.screen === 'intro') { state.mode = mode.dataset.mode; render(); return; }
        const tempoPreset = event.target.closest('[data-score-tempo-preset]'); if (tempoPreset && state.screen === 'ready') { state.tempo = normalizeTempo(tempoPreset.dataset.scoreTempoPreset); render(); return; }
        const action = event.target.closest('[data-action]')?.dataset.action;
        if (action === 'start') startGame(); else if (action === 'toggle-leading-rests' && state.screen === 'ready') { state.skipLeadingRests = !state.skipLeadingRests; state.page = 0; state.currentMeasure = 0; state.followStartSystem = 0; state.scrollTargetSystem = 0; render(); } else if (action === 'preview') preview(); else if (action === 'stop-preview') { stopAudio(); state.screen = 'ready'; render(); } else if (action === 'perform') beginPerformance(); else if (action === 'tap' && performance.now() - lastDirectTapAt > 300) recordTap(); else if (action === 'prev-page') { state.page = clampPage(state.page - 1); render(); } else if (action === 'next-page') { state.page = clampPage(state.page + 1); render(); } else if (action === 'restart') parent.postMessage({ type: 'hjm-pitch-restart', challenge: 'score' }, '*');
    });
    $('#gameRoot').addEventListener('change', event => {
        if (state.screen !== 'intro') return;
        const songSelect = event.target.closest('[data-score-song]'), partSelect = event.target.closest('[data-score-part]');
        if (songSelect) { const first = partsForSong(songSelect.value)[0]; if (first) selectScore(first.id); render(); }
        else if (partSelect && selectScore(partSelect.value)) render();
    });
    $('#gameRoot').addEventListener('keydown', event => {
        if (state.screen !== 'intro') return;
        const trigger = event.target.closest('[data-score-select-trigger]'), option = event.target.closest('[data-score-select-option]');
        if (trigger && ['ArrowDown','ArrowUp'].includes(event.key)) { event.preventDefault(); openScoreSelect(trigger.dataset.scoreSelectTrigger, true); return; }
        if (!option) { if (event.key === 'Escape') closeScoreSelect(); return; }
        const options = [...option.closest('[role="listbox"]').querySelectorAll('[data-score-select-option]')], index = options.indexOf(option);
        if (event.key === 'Escape') { event.preventDefault(); closeScoreSelect(option.dataset.scoreSelectOption); }
        else if (event.key === 'ArrowDown') { event.preventDefault(); options[(index + 1) % options.length]?.focus(); }
        else if (event.key === 'ArrowUp') { event.preventDefault(); options[(index - 1 + options.length) % options.length]?.focus(); }
        else if (event.key === 'Home') { event.preventDefault(); options[0]?.focus(); }
        else if (event.key === 'End') { event.preventDefault(); options.at(-1)?.focus(); }
    });
    $('#gameRoot').addEventListener('input', event => {
        const input = event.target.closest('[data-score-tempo]');
        if (!input || state.screen !== 'ready') return;
        state.tempo = normalizeTempo(input.value); input.value = String(state.tempo);
        const output = $('[data-score-tempo-output]'), tempoChip = $('[data-selected-tempo]'), durationChip = $('[data-score-duration]');
        if (output) output.textContent = tempoText();
        if (tempoChip) tempoChip.textContent = `♩=${state.tempo}`;
        if (durationChip) durationChip.textContent = `约 ${Math.ceil(ScoreAuditionRules.timing(phrase()).phraseSeconds)} 秒`;
        $('#stageSubtitle').textContent = `${score.sourceMeasures} · ${score.meter} · ♩=${state.tempo}${state.tempo === score.tempo ? ' 原速' : ` · ${tempoPercent()}%`}`;
        root.querySelectorAll('[data-score-tempo-preset]').forEach(button => { const active = Number(button.dataset.scoreTempoPreset) === state.tempo; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
    });
    $('#gameRoot').addEventListener('pointerdown', event => { const pad = event.target.closest('[data-action="tap"]'); if (!pad || event.button !== 0) return; event.preventDefault(); lastDirectTapAt = performance.now(); recordTap(); });
    document.addEventListener('keydown', event => { if (event.code === 'Space' && state.screen === 'playing') { event.preventDefault(); if (!event.repeat) { lastDirectTapAt = performance.now(); recordTap(); } } }, { signal: lifecycle.signal });
    document.addEventListener('pointerdown', event => { if (!event.composedPath().includes(mount)) closeScoreSelect(); }, { signal: lifecycle.signal });
    document.addEventListener('visibilitychange', () => { if (document.hidden && state.screen !== 'result') { const loading=state.samplesLoading;stopAudio();if(loading){state.sampleStatus='准备已暂停，请重新播放。';render();} } }, { signal: lifecycle.signal });
    window.addEventListener('pagehide', stopAudio, { signal: lifecycle.signal });
    window.addEventListener('resize', () => { if (['preview', 'playing'].includes(state.screen)) { state.followStartSystem = followStartForMeasure(state.currentMeasure); state.scrollTargetSystem = state.followStartSystem; state.scrollAnimating = false; } else state.page = clampPage(state.page); render(); }, { signal: lifecycle.signal });
    window.addEventListener('message', event => {
        if (event.source !== parent) return; const data = event.data;
        if (data?.type === 'hjm-pitch-rules') { for (const mode of ['simple', 'medium', 'hard']) { state.dailyCaps[mode] = Math.max(0, Number(data.dailyCaps?.[mode]) || state.dailyCaps[mode]); state.dailyEarned[mode] = Math.max(0, Number(data.dailyEarned?.[mode]) || 0); } state.rulesReady = true; render(); }
        else if (data?.type === 'hjm-pitch-sound') { externalSoundEnabled = data.enabled === true; if (!externalSoundEnabled) {const loading=state.samplesLoading;stopAudio();if(loading){state.sampleStatus='声音已关闭；开启后可重新播放。';render();}} }
        else if (data?.type === 'hjm-pitch-settled' && state.screen === 'result') { const amount = $('#resultRewardAmount'), daily = $('#resultDailyValue'), note = $('#embeddedPayout'); if (data.ok) { state.payout = Number(data.payout) || 0; if (amount) amount.textContent = state.payout; if (daily) daily.textContent = `今日 ${data.dailyEarned} / ${data.dailyCap} 音符`; if (note) note.textContent = state.payout < Number(data.rawPayout) ? '已按今日剩余额度发放；全谱成绩完整保留。' : '结算完成，逐小节结果可继续翻页复盘。'; } else if (note) note.textContent = String(data.text || '结算失败，请稍后重试。'); }
    }, { signal: lifecycle.signal });

    const api = { state, get score() { return score; }, get questionId() { return questionId; }, scoreSVG, startGame, beginPerformance, preview, finishPerformance, phrase, attackAtTime, attackAtIndex, pitchAtTime, activeTapVoiceCount: () => activeTapVoices.length, analyze: taps => ScoreAuditionRules.analyze(phrase(), taps), playbackSnapshot: () => lastPlayback ? { ...lastPlayback, countInSequence: state.countInHistory.slice() } : null, syncPlaybackForTest(measure) { cancelAnimationFrame(playFrame); playFrame = 0; const data = phrase(), next = Math.max(0, Math.min(data.measures.length - 1, measure)), starts = ScoreAuditionRules.measureStarts(data).starts; state.currentMeasure = Math.max(0, next - 1); syncPlaybackPosition(starts[next] * ScoreAuditionRules.timing(data).beatSeconds); }, recordTapForTest(elapsed) { if (!audioContext) return false; performanceStart = audioContext.currentTime - elapsed; state.countIn = null; state.screen = 'playing'; return recordTap(); }, completeForTest(perfect = true) { if (state.screen === 'intro') startGame(); if (state.screen === 'ready') { state.screen = 'playing'; render(); } const data = phrase(), targets = ScoreAuditionRules.tapTargets(data), taps = perfect ? targets.map(event => event.start) : []; finishPerformance(taps); } };
    api.destroy = () => { lifecycle.abort(); stopAudio(); clearTimeout(scrollTimer); shadow.replaceChildren(); if (window.__scoreAudition === api) delete window.__scoreAudition; };
    window.__scoreAudition = api; render(); return api;
}

window.createScoreAuditionGame = createScoreAuditionGame;
