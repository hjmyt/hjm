'use strict';

const PITCH_AUDITION_MARKUP = `<main class="shell">
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark" aria-hidden="true">♫</span>
        <span><strong>恋与哈基米 · 听音室</strong><small>空格考验 · 每次都有新旋律</small></span>
      </div>
      <div class="top-actions">
        <a class="ds-btn ds-btn--ghost" href="index.html">返回主游戏</a>
      </div>
    </header>

    <section class="hero section-changed">
      <div>
        <div class="eyebrow">PITCH AUDITION <span class="badge-changed">CHANGED</span></div>
        <h1>空格的音准考验</h1>
        <p>一段旋律里，只有一个音走偏。听出来，再亲手把它调回来。</p>
      </div>
      <div class="hero-score" aria-label="本局分数">
        <small>本局得分</small><strong id="totalScore">0</strong><span>/ 6 · <b id="questionBatch">新旋律</b></span>
      </div>
    </section>

    <div class="game-layout">
      <aside class="side-card">
        <div class="judge">
          <img src="assets/thumbs/avatars/192/kongge.webp" alt="首席空格头像">
          <div><strong>首席空格</strong><small>技术考核 · 音准测试</small></div>
        </div>
        <ol class="rule-list">
          <li>听旋律，找出走偏的那一个音。</li>
          <li>听听它偏高了，还是偏低了。</li>
          <li>转动旋钮，把它调回原来的音高。</li>
        </ol>
        <div class="side-note">每局三段新旋律；辨音、调音各 1 分，满分 6 分。</div>
        <a class="doc-link" href="index.html">返回主游戏 →</a>
      </aside>

      <section class="game-card" aria-live="polite">
        <div class="game-head">
          <div class="progress-copy">
            <span class="round-mark" id="roundMark">准备</span>
            <span><strong id="roundTitle">耳朵热身</strong><small id="roundSubtitle">完整体验约 3 分钟</small></span>
          </div>
          <div class="head-visual"><div class="soundwave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="steps" id="steps" aria-label="三题进度"><i class="step"></i><i class="step"></i><i class="step"></i></div></div>
        </div>
        <div id="gameRoot"></div>
      </section>
    </div>
  </main>`;

function createPitchAuditionGame(mount,{ styleHref = 'styles/game-pitch-audition.css' } = {}) {
    const shadow = mount.shadowRoot || mount.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<link rel="stylesheet" href="${styleHref}"><div class="game-surface embedded">${PITCH_AUDITION_MARKUP}</div>`;
    const root = shadow;
    const lifecycle = new AbortController();

      const $ = selector => root.querySelector(selector);
      const gameRoot = $('#gameRoot');
      const embedded = true;
      const NOTE_FREQUENCIES = {1:261.626,2:293.665,3:329.628,4:349.228,5:391.995,6:440,7:493.883};
      const NOTE_NAMES = {1:'C',2:'D',3:'E',4:'F',5:'G',6:'A',7:'B'};
      const TONE_WAVEFORM = 'sine';
      const MASTER_GAIN = 1;
      const REFERENCE_PITCHES = [440,442];
      const OFFSET_RANGES = [[8,12],[6,10],[4.5,8]];
      const QUESTION_HISTORY_KEY = 'pitch-audition-v3-question-history';
      const DAILY_KEY = 'pitch-audition-game-notes-daily';
      const DAILY_CAPS = {simple:20,hard:60};
      function localDateKey() { const day = new Date(); return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`; }
      function standaloneDailyEarned() {
        try {
          const saved = JSON.parse(localStorage.getItem(DAILY_KEY) || '{}');
          if (saved.date !== localDateKey()) return {simple:0,hard:0};
          return Object.fromEntries(['simple','hard'].map(mode => [mode,Math.max(0,Math.min(DAILY_CAPS[mode],Math.floor(Number(saved[mode]) || 0)))]));
        } catch { return {simple:0,hard:0}; }
      }
      function randomUnit() {
        if (window.crypto?.getRandomValues) {
          const value = new Uint32Array(1);
          window.crypto.getRandomValues(value);
          return value[0] / 4294967296;
        }
        return Math.random();
      }
      function randomInt(min,max) { return Math.floor(randomUnit() * (max - min + 1)) + min; }
      function pick(values) { return values[randomInt(0,values.length - 1)]; }
      function shuffle(values) {
        const result = values.slice();
        for (let index = result.length - 1; index > 0; index--) {
          const swap = randomInt(0,index);
          [result[index],result[swap]] = [result[swap],result[index]];
        }
        return result;
      }
      function generateMelody() {
        for (let attempt = 0; attempt < 80; attempt++) {
          const notes = [randomInt(1,7)];
          while (notes.length < 6) {
            const current = notes[notes.length - 1];
            let candidates = [-3,-2,-1,-1,1,1,2,3].map(step => current + step).filter(note => note >= 1 && note <= 7);
            if (notes.length > 1) {
              const nonEcho = candidates.filter(note => note !== notes[notes.length - 2]);
              if (nonEcho.length) candidates = nonEcho;
            }
            notes.push(pick(candidates));
          }
          if (new Set(notes).size >= 4) return notes;
        }
        return [1,3,2,5,4,6];
      }
      function generateRandomRounds() {
        const labels = ['随机辨音','变化旋律','细微偏差'];
        const wrongPositions = shuffle([0,1,2,3,4,5]).slice(0,3);
        const usedMelodies = new Set();
        return labels.map((label,index) => {
          let notes, melodyKey;
          do { notes = generateMelody(); melodyKey = notes.join(''); } while (usedMelodies.has(melodyKey));
          usedMelodies.add(melodyKey);
          const [minimum,maximum] = OFFSET_RANGES[index];
          const magnitude = Math.round((minimum + randomUnit() * (maximum - minimum)) * 4) / 4;
          return {notes,wrongIndex:wrongPositions[index],offset:(randomUnit() < .5 ? -1 : 1) * magnitude,referenceHz:pick(REFERENCE_PITCHES),label};
        });
      }
      function signatureOf(set) { return set.map(round => `${round.notes.join('')}-${round.wrongIndex}-${round.offset.toFixed(2)}-${round.referenceHz}`).join('|'); }
      function questionIdOf(signature) {
        let hash = 2166136261;
        for (let index = 0; index < signature.length; index++) hash = Math.imul(hash ^ signature.charCodeAt(index),16777619);
        return (hash >>> 0).toString(36).toUpperCase().padStart(7,'0').slice(-7);
      }
      function createQuestionSet() {
        let history = [];
        try { history = JSON.parse(localStorage.getItem(QUESTION_HISTORY_KEY) || '[]'); } catch { history = []; }
        if (!Array.isArray(history)) history = [];
        let generated, signature, attempts = 0;
        do { generated = generateRandomRounds(); signature = signatureOf(generated); attempts++; } while (history.includes(signature) && attempts < 1000);
        history = [signature,...history.filter(item => item !== signature)].slice(0,12);
        try { localStorage.setItem(QUESTION_HISTORY_KEY,JSON.stringify(history)); } catch { }
        return {rounds:generated,signature,id:questionIdOf(signature)};
      }
      const questionSet = createQuestionSet();
      const rounds = questionSet.rounds;
      const questionSignature = questionSet.signature;
      const questionId = questionSet.id;
      const state = {screen:'intro', mode:'simple', dailyEarned:embedded ? {simple:0,hard:0} : standaloneDailyEarned(), dailyCaps:{...DAILY_CAPS}, rulesReady:!embedded, round:0, score:0, payout:0, selected:null, direction:null, adjustment:0, answers:[], playing:false,audioStatus:'点击播放即可启用声音'};
      let audioContext = null, audioOutput = null, audioUnavailable = false, audioBlocked = false, synthAudioBridge = null, bridgeIdleTimer = 0, audioStarts = 0, highlightTimers = [], dragActive = false, externalSoundEnabled = true;
      const activeNodes = new Set();
      const iosAudio = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      function escapeHTML(value) { return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
      function roundData() { return rounds[state.round]; }
      function noteLabel(note) { return `${note}（${NOTE_NAMES[note]}）`; }
      function frequencyForNote(note,referenceHz = 440) { return NOTE_FREQUENCIES[note] * referenceHz / 440; }
      function pitchBadgesHTML(scoreLabel) { return `<div class="stage-badges"><span class="pitch-reference"><small>本题标准音</small><strong>A = ${roundData().referenceHz} Hz</strong></span><span class="stage-chip">${scoreLabel}</span></div>`; }
      function directionOf(offset) { return offset > 0 ? 'high' : 'low'; }
      function directionLabel(direction) { return direction === 'high' ? '偏高' : '偏低'; }
      function setHeader() {
        const intro = state.screen === 'intro', finish = state.screen === 'finish';
        $('#roundMark').textContent = intro ? '准备' : finish ? '完成' : `${state.round + 1}/3`;
        $('#roundTitle').textContent = intro ? '开始之前' : finish ? '考验结束' : roundData().label;
        $('#roundSubtitle').textContent = intro ? '三段新旋律 · 约 3 分钟' : finish ? `本局 ${state.score} / 6 分` : state.screen === 'identify' ? '先找出走调的音' : state.screen === 'tune' ? '再把它调回来' : '这一段听得如何';
        $('#totalScore').textContent = state.score;
        $('#questionBatch').textContent = `#${questionId}`;
        [...$('#steps').children].forEach((step,index) => {
          step.className = `step${index < state.round || finish ? ' done' : index === state.round && !intro ? ' current' : ''}`;
        });
      }
      function introHTML() {
        const simpleEarned = state.rulesReady ? state.dailyEarned.simple : '…';
        const hardEarned = state.rulesReady ? state.dailyEarned.hard : '…';
        const remaining = Math.max(0,state.dailyCaps[state.mode] - state.dailyEarned[state.mode]);
        const message = !state.rulesReady ? '正在读取今天的音符收益…' : !remaining ? '本模式今日音符已领满，仍可继续练习，明天恢复收益。' : '';
        return `<div class="intro-panel game-body"><div class="intro-content">
          <div class="intro-icon" aria-hidden="true">♬</div>
          <div class="intro-session">新旋律已就位 <code>#${questionId}</code></div>
          <h2>哪一个音，走偏了？</h2>
          <p>每局三段新旋律。听出位置与高低，再用旋钮把音调回来。</p>
          <div class="intro-meta" aria-label="本局规则概览"><span><strong>3 段</strong>新旋律</span><span><strong>6 个音</strong>每段</span><span><strong>±3 Hz</strong>调准范围</span><span><strong>耳朵</strong>就是答案</span></div>
          <div class="mode-picker" aria-label="选择考验难度">
            <button class="mode-option${state.mode === 'simple' ? ' selected' : ''}" type="button" data-mode="simple" aria-pressed="${state.mode === 'simple'}" ${!state.rulesReady ? 'disabled' : ''}><span class="mode-option-head"><strong>简单模式</strong><em>6 ♪</em></span><small>能听标准旋律与正确音<br>1 分换 1 音符</small><small class="mode-quota">今日 ${simpleEarned} / ${state.dailyCaps.simple} 音符 · 可反复练习</small></button>
            <button class="mode-option${state.mode === 'hard' ? ' selected' : ''}" type="button" data-mode="hard" aria-pressed="${state.mode === 'hard'}"><span class="mode-option-head"><strong>困难模式</strong><em>12 ♪</em></span><small>只听 A 音、考核旋律和当前音<br>1 分换 2 音符</small><small class="mode-quota">今日 ${hardEarned} / ${state.dailyCaps.hard} 音符 · 可反复练习</small></button>
          </div>
          <p class="mode-message" role="status">${message}</p>
          <button class="ds-btn ds-btn--primary" type="button" data-action="start" aria-label="开始${state.mode === 'hard' ? '困难' : '简单'}模式" ${!state.rulesReady ? 'disabled' : ''}>开始听音</button>
        </div></div>`;
      }
      function noteButtons(readonly = false) {
        return `<div class="score-staff" aria-label="六音旋律">${roundData().notes.map((note,index) => `<button class="note-choice${state.selected === index ? ' selected' : ''}${readonly && index === roundData().wrongIndex ? ' revealed' : ''}" type="button" data-note-index="${index}" ${readonly ? 'disabled' : ''} aria-pressed="${state.selected === index}" aria-label="第 ${index + 1} 音，${noteLabel(note)}"><span class="note-index">第 ${index + 1} 音</span><span class="note-value">${note}<small>（${NOTE_NAMES[note]}）</small></span></button>`).join('')}</div>`;
      }
      function audioPanel(tune = false) {
        return `<div class="audio-panel${state.mode === 'hard' ? ' is-hard' : ''}"><div class="audio-status"><span>${escapeHTML(state.audioStatus)}</span><span class="volume-meter" aria-label="播放音量"><i></i><i></i><i></i><i></i><i></i><i></i></span></div>${state.mode === 'simple' ? `<button class="ds-btn ds-btn--secondary" type="button" data-audio="standard">▶ ${tune ? '听正确音' : '听标准旋律'}</button>` : ''}<button class="ds-btn ds-btn--primary" type="button" data-audio="exam">▶ ${tune ? '听当前音' : '听考核旋律'}</button><button class="ds-btn ds-btn--ghost" type="button" data-audio="a4">♪ A 标准音 · ${roundData().referenceHz} Hz</button></div>`;
      }
      function identifyHTML() {
        return `<div class="game-body"><div class="stage-title"><div><h2>听出走调的那一音</h2><p>${state.mode === 'hard' ? '听考核旋律，选位置，再判断高低。' : '两段旋律可以反复听。选位置，再判断高低。'}</p></div>${pitchBadgesHTML('辨音 · 1 分')}</div>${audioPanel()}${noteButtons()}<div class="direction-group" aria-label="判断偏差方向"><button class="direction${state.direction === 'high' ? ' selected' : ''}" type="button" data-direction="high" aria-pressed="${state.direction === 'high'}"><strong>↑ 偏高了</strong><small>比原音更尖</small></button><button class="direction${state.direction === 'low' ? ' selected' : ''}" type="button" data-direction="low" aria-pressed="${state.direction === 'low'}"><strong>↓ 偏低了</strong><small>比原音更沉</small></button></div><div class="action-row"><button class="ds-btn ds-btn--ghost" type="button" data-action="restart">换一组旋律</button><button class="ds-btn ds-btn--primary" type="button" data-action="identify-submit" ${state.selected === null || !state.direction ? 'disabled' : ''}>确定，去调音</button></div></div>`;
      }
      function tuneHTML() {
        const answer = state.answers[state.round];
        const correct = answer.identify;
        const angle = state.adjustment / 16 * 135;
        const targetNote = roundData().notes[roundData().wrongIndex];
        const comparison = state.mode === 'hard' ? '参考 A 标准音，反复听当前音，慢慢把它调回去。' : '可以先听正确音，再听当前音，慢慢把它调回去。';
        return `<div class="game-body">
          <div class="stage-title"><div><h2>把第 ${roundData().wrongIndex + 1} 音调回 ${noteLabel(targetNote)}</h2><p>转动旋钮，让这个音回到原来的位置。</p></div>${pitchBadgesHTML('调音 · 1 分')}</div>
          <div class="feedback ${correct ? 'success' : 'warning'}"><span aria-hidden="true">${correct ? '✓' : '!'}</span><div><strong>${correct ? '找对了，先得 1 分。' : '刚才没有找对，调音仍有机会。'}</strong><p>第 ${roundData().wrongIndex + 1} 音原本${directionLabel(directionOf(roundData().offset))}，目标是 ${noteLabel(targetNote)}。</p></div></div>
          <div class="tune-stage">
            <div class="tune-copy"><h3>听一听，再动手。</h3><p>${comparison}</p>${audioPanel(true)}<div class="listening-hint"><span aria-hidden="true">♪</span><span>每次调整后都能重听；方向键也可以微调。</span></div></div>
            <div class="knob-wrap"><div class="knob-scale"><div class="knob" id="pitchKnob" role="slider" tabindex="0" aria-label="把第 ${roundData().wrongIndex + 1} 音调回 ${noteLabel(targetNote)}" aria-valuemin="-16" aria-valuemax="16" aria-valuenow="${state.adjustment}" style="--knob-angle:${angle}deg"></div><span class="knob-label low">偏低</span><span class="knob-label center">${noteLabel(targetNote)}</span><span class="knob-label high">偏高</span></div><div class="nudge-row"><button type="button" data-nudge="-0.5" aria-label="向低微调">−</button><button type="button" data-nudge="0.5" aria-label="向高微调">＋</button></div></div>
          </div>
          <div class="action-row"><button class="ds-btn ds-btn--ghost" type="button" data-action="tune-reset">旋钮归零</button><button class="ds-btn ds-btn--primary" type="button" data-action="tune-submit">确认调音</button></div>
        </div>`;
      }
      function roundResultHTML() {
        const answer = state.answers[state.round];
        const roundScore = Number(answer.identify) + Number(answer.tuned);
        return `<div class="result-panel game-body"><div><div class="result-orbit"><span><strong>${roundScore}</strong><small>/ 2 分</small></span></div><h2>${roundScore === 2 ? '听准了，也调准了。' : roundScore === 1 ? '已经抓住一半了。' : '没关系，再听一遍会更清楚。'}</h2><p>最终与标准音相差 <strong>${answer.finalError.toFixed(2)} Hz</strong>。${answer.tuned ? '在允许的 ±3 Hz 内，调音通过。' : '超过允许的 ±3 Hz，本题调音分未获得。'}</p><div class="round-summary"><article><strong>${answer.identify ? '✓' : '—'}</strong><small>识别错音</small></article><article><strong>${answer.tuned ? '✓' : '—'}</strong><small>调准音高</small></article><article><strong>${directionLabel(directionOf(roundData().offset))}</strong><small>原始偏差</small></article></div><button class="ds-btn ds-btn--primary" type="button" data-action="next">${state.round === rounds.length - 1 ? '查看最终结果' : '进入下一题'}</button></div></div>`;
      }
      function finishHTML() {
        const copy = state.score >= 6 ? '空格难得地点了点头：耳朵和手都很稳。' : state.score >= 4 ? '空格把笔收起来：能听出来，再多练几次会更准。' : '空格没有催你：音准不是猜出来的，是一次次听出来的。';
        const modeLabel = state.mode === 'hard' ? '困难' : '简单';
        const multiplier = state.mode === 'hard' ? 2 : 1;
        const rawPayout = state.score * multiplier;
        const earned = state.dailyEarned[state.mode];
        const cap = state.dailyCaps[state.mode];
        const actualPayout = embedded ? null : state.payout;
        const capped = actualPayout !== null && actualPayout < rawPayout;
        const note = embedded ? '正在按今日剩余额度结算…' : capped ? actualPayout ? `今日额度只剩 ${actualPayout} 音符，已按剩余额度发放。` : '今日该模式音符已领满，本局继续计入练习成绩。' : `结算完成，今天还可获得 ${Math.max(0,cap - earned)} 音符。`;
        return `<div class="result-panel final-result game-body"><div class="result-content"><div class="result-orbit"><span><strong>${state.score}</strong><small>/ 6 分</small></span></div><h2>${state.score >= 6 ? '全音准通过' : state.score >= 4 ? '考核合格' : '再试一次'}</h2><p class="result-copy">${copy}</p><div class="reward-card"><div class="reward-earned"><span class="reward-mode">${modeLabel}模式</span><strong><span id="resultRewardAmount">${actualPayout ?? '…'}</span></strong><small>本局音符</small></div><div class="reward-progress"><div class="reward-progress-head"><span>今日该模式</span><strong id="resultDailyValue">${earned} / ${cap}</strong></div><div class="reward-track" aria-hidden="true"><span id="resultDailyBar" style="width:${cap ? Math.min(100,earned / cap * 100) : 0}%"></span></div><p class="reward-rule">${state.score} 分 × ${multiplier} · 基础奖励 ${rawPayout} 音符</p></div><p class="settlement-note${capped ? ' is-capped' : ''}" id="embeddedPayout" role="status">${note}</p></div><div class="round-summary">${state.answers.map((answer,index) => `<article><strong>${Number(answer.identify) + Number(answer.tuned)} / 2</strong><small>第 ${index + 1} 题 · ${escapeHTML(rounds[index].label)}</small></article>`).join('')}</div><button class="ds-btn ds-btn--primary" type="button" data-action="restart">重新挑战</button></div></div>`;
      }
      function render() {
        stopAudio();
        setHeader();
        gameRoot.dataset.stage = state.screen;
        gameRoot.innerHTML = state.screen === 'intro' ? introHTML() : state.screen === 'identify' ? identifyHTML() : state.screen === 'tune' ? tuneHTML() : state.screen === 'round-result' ? roundResultHTML() : finishHTML();
        if (state.screen === 'tune') bindKnob();
      }
      function focusCurrentStage() {
        if (embedded) {
          window.parent.postMessage({type:'hjm-pitch-focus'},'*');
        }
        else if (window.matchMedia('(max-width:640px)').matches)
          root.querySelector('.game-card')?.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth'});
      }
      function updateAudioStatus(message) {
        state.audioStatus = message;
        const label = root.querySelector('.audio-status span:first-child');
        if (label) label.textContent = message;
      }
      function configureAudioSession() {
        try {
          if (navigator.audioSession) {
            navigator.audioSession.type = 'playback';
            return navigator.audioSession.type === 'playback';
          }
        } catch {}
        return false;
      }
      function stopAudioBridge() {
        clearTimeout(bridgeIdleTimer);
        if (synthAudioBridge) synthAudioBridge.pause();
      }
      function releaseAudioBridge() {
        clearTimeout(bridgeIdleTimer);
        if (!activeNodes.size && !audioStarts) bridgeIdleTimer = setTimeout(stopAudioBridge,500);
      }
      function unlockSynthAudio() {
        if (configureAudioSession() || !iosAudio) return;
        if (!synthAudioBridge) {
          synthAudioBridge = new Audio('assets/audio/silence.wav');
          synthAudioBridge.loop = true;
          synthAudioBridge.preload = 'none';
          synthAudioBridge.setAttribute('playsinline','');
        }
        clearTimeout(bridgeIdleTimer);
        synthAudioBridge.play().catch(error => {
          if (error.name !== 'AbortError' && !document.hidden) {
            audioBlocked = true;
            updateAudioStatus('声音未启动，请再点一次；也可关闭手机静音模式');
          }
        });
      }
      async function ensureAudio() {
        if (!externalSoundEnabled) { updateAudioStatus('游戏声音已关闭，请点击上方声音按钮开启'); return null; }
        if (audioUnavailable) return null;
        audioStarts++;
        unlockSynthAudio();
        try {
          if (!audioContext || audioContext.state === 'closed') {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) {
              audioUnavailable = true;
              updateAudioStatus('当前浏览器不支持声音');
              alert('当前浏览器不支持 Web Audio，无法进行听音测试。');
              return null;
            }
            audioContext = new AC();
            audioOutput = audioContext.createGain();
            audioOutput.gain.value = MASTER_GAIN;
            const compressor = audioContext.createDynamicsCompressor();
            compressor.threshold.value = -14;
            compressor.knee.value = 18;
            compressor.ratio.value = 6;
            compressor.attack.value = .003;
            compressor.release.value = .18;
            audioOutput.connect(compressor); compressor.connect(audioContext.destination);
            audioContext.onstatechange = () => {
              if (audioContext.state === 'running') updateAudioStatus('声音已启用');
              else if (!document.hidden) updateAudioStatus('声音已暂停，请再次点击播放');
            };
          }
          if (audioContext.state !== 'running') {
            let timer;
            try {
              await Promise.race([
                audioContext.resume(),
                new Promise((_,reject) => { timer = setTimeout(() => reject(new Error('Audio resume timed out')),4000); })
              ]);
            } finally { clearTimeout(timer); }
          }
          if (audioContext.state !== 'running') throw new Error('Audio is not running');
          audioBlocked = false;
          updateAudioStatus('声音已启用');
          return audioContext;
        } catch {
          audioBlocked = true;
          stopAudioBridge();
          updateAudioStatus('声音暂未启动，请再点一次重试');
          return null;
        } finally {
          audioStarts--;
          releaseAudioBridge();
        }
      }
      function stopAudio() {
        highlightTimers.forEach(clearTimeout); highlightTimers = [];
        activeNodes.forEach(node => { try { node.stop(); } catch {} }); activeNodes.clear();
        releaseAudioBridge();
        root.querySelectorAll('.note-choice.playing').forEach(node => node.classList.remove('playing'));
        root.querySelector('.game-card')?.classList.remove('audio-active');
        state.playing = false;
      }
      function scheduleTone(frequency, when, duration = .5) {
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        gain.gain.setValueAtTime(.0001,when);
        gain.gain.exponentialRampToValueAtTime(.32,when + .025);
        gain.gain.exponentialRampToValueAtTime(.15,when + duration * .68);
        gain.gain.exponentialRampToValueAtTime(.0001,when + duration);
        filter.type = 'lowpass'; filter.frequency.value = 1800; filter.Q.value = .7;
        gain.connect(filter); filter.connect(audioOutput);
        const oscillator = audioContext.createOscillator();
        oscillator.type = TONE_WAVEFORM;
        oscillator.frequency.value = frequency;
        oscillator.connect(gain); activeNodes.add(oscillator); clearTimeout(bridgeIdleTimer);
        oscillator.onended = () => {
          activeNodes.delete(oscillator); oscillator.disconnect(); gain.disconnect(); filter.disconnect(); releaseAudioBridge();
        };
        oscillator.start(when); oscillator.stop(when + duration + .03);
      }
      async function play(kind) {
        if (!['a4','exam','standard'].includes(kind) || (kind === 'standard' && state.mode === 'hard') || !['identify','tune'].includes(state.screen)) return;
        stopAudio();
        if (!await ensureAudio()) return;
        const data = roundData();
        root.querySelector('.game-card')?.classList.add('audio-active');
        if (kind === 'a4') { scheduleTone(data.referenceHz,audioContext.currentTime + .02,.9); highlightTimers.push(setTimeout(() => root.querySelector('.game-card')?.classList.remove('audio-active'),980)); return; }
        if (state.screen === 'tune') {
          const base = frequencyForNote(data.notes[data.wrongIndex],data.referenceHz);
          scheduleTone(kind === 'standard' ? base : base + data.offset + state.adjustment,audioContext.currentTime + .02,1.05);
          highlightTimers.push(setTimeout(() => root.querySelector('.game-card')?.classList.remove('audio-active'),1130));
          return;
        }
        state.playing = true;
        const start = audioContext.currentTime + .06, gap = .62;
        data.notes.forEach((note,index) => {
          const base = frequencyForNote(note,data.referenceHz), frequency = kind === 'exam' && index === data.wrongIndex ? base + data.offset : base;
          scheduleTone(frequency,start + index * gap,.48);
          highlightTimers.push(setTimeout(() => {
            root.querySelectorAll('.note-choice').forEach(node => node.classList.toggle('playing',Number(node.dataset.noteIndex) === index));
          },Math.max(0,(start - audioContext.currentTime + index * gap) * 1000)));
        });
        highlightTimers.push(setTimeout(() => { root.querySelectorAll('.note-choice.playing').forEach(node => node.classList.remove('playing')); root.querySelector('.game-card')?.classList.remove('audio-active'); state.playing = false; },(start - audioContext.currentTime + data.notes.length * gap) * 1000));
      }
      function startGame() {
        if (!state.rulesReady || state.screen !== 'intro') return;
        Object.assign(state,{screen:'identify',round:0,score:0,selected:null,direction:null,adjustment:0,answers:[]});
        render();
        if (embedded) window.parent.postMessage({type:'hjm-pitch-start',challenge:'pitch',id:questionId,mode:state.mode},'*');
        requestAnimationFrame(focusCurrentStage);
      }
      function submitIdentify() {
        if (state.selected === null || !state.direction) return;
        const identify = state.selected === roundData().wrongIndex && state.direction === directionOf(roundData().offset);
        state.answers[state.round] = {identify,tuned:false,selected:state.selected,direction:state.direction,finalError:Math.abs(roundData().offset)};
        if (identify) state.score++;
        state.screen = 'tune'; state.adjustment = 0; render();
        requestAnimationFrame(focusCurrentStage);
      }
      function submitTune() {
        const finalError = Math.abs(roundData().offset + state.adjustment), tuned = finalError <= 3;
        Object.assign(state.answers[state.round],{tuned,finalError,adjustment:state.adjustment});
        if (tuned) state.score++;
        state.screen = 'round-result'; render();
        requestAnimationFrame(focusCurrentStage);
      }
      function nextRound() {
        if (state.round >= rounds.length - 1) state.screen = 'finish';
        else { state.round++; state.screen = 'identify'; state.selected = null; state.direction = null; state.adjustment = 0; }
        if (!embedded && state.screen === 'finish') {
          state.payout = Math.min(state.score * (state.mode === 'hard' ? 2 : 1),Math.max(0,state.dailyCaps[state.mode] - state.dailyEarned[state.mode]));
          state.dailyEarned[state.mode] += state.payout;
          try { localStorage.setItem(DAILY_KEY,JSON.stringify({date:localDateKey(),...state.dailyEarned})); } catch {}
        }
        render();
        requestAnimationFrame(focusCurrentStage);
        if (embedded && state.screen === 'finish') window.parent.postMessage({type:'hjm-pitch-complete',challenge:'pitch',id:questionId,mode:state.mode,score:state.score,rounds,answers:state.answers},'*');
      }
      function setAdjustment(value) {
        state.adjustment = Math.max(-16,Math.min(16,Math.round(value * 4) / 4));
        const knob = $('#pitchKnob');
        if (knob) { knob.style.setProperty('--knob-angle',`${state.adjustment / 16 * 135}deg`); knob.setAttribute('aria-valuenow',state.adjustment); }
      }
      function pointerAdjustment(event, knob) {
        const rect = knob.getBoundingClientRect(), x = event.clientX - (rect.left + rect.width / 2), y = event.clientY - (rect.top + rect.height / 2);
        let degrees = Math.atan2(y,x) * 180 / Math.PI + 90;
        if (degrees > 180) degrees -= 360;
        setAdjustment(Math.max(-135,Math.min(135,degrees)) / 135 * 16);
      }
      function bindKnob() {
        const knob = $('#pitchKnob');
        knob.addEventListener('pointerdown',event => { dragActive = true; knob.setPointerCapture(event.pointerId); pointerAdjustment(event,knob); });
        knob.addEventListener('pointermove',event => { if (dragActive) pointerAdjustment(event,knob); });
        knob.addEventListener('pointerup',() => { dragActive = false; });
        knob.addEventListener('pointercancel',() => { dragActive = false; });
        knob.addEventListener('keydown',event => {
          if (['ArrowLeft','ArrowDown','ArrowRight','ArrowUp','Home'].includes(event.key)) event.preventDefault();
          if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') setAdjustment(state.adjustment - .25);
          if (event.key === 'ArrowRight' || event.key === 'ArrowUp') setAdjustment(state.adjustment + .25);
          if (event.key === 'Home') setAdjustment(0);
        });
      }
      gameRoot.addEventListener('click',event => {
        const mode = event.target.closest('[data-mode]');
        if (mode && state.screen === 'intro' && !mode.disabled) { state.mode = mode.dataset.mode; render(); return; }
        const note = event.target.closest('[data-note-index]');
        if (note && state.screen === 'identify') { state.selected = Number(note.dataset.noteIndex); render(); return; }
        const direction = event.target.closest('[data-direction]');
        if (direction) { state.direction = direction.dataset.direction; render(); return; }
        const audio = event.target.closest('[data-audio]');
        if (audio) { play(audio.dataset.audio); return; }
        const nudge = event.target.closest('[data-nudge]');
        if (nudge) { setAdjustment(state.adjustment + Number(nudge.dataset.nudge)); return; }
        const action = event.target.closest('[data-action]')?.dataset.action;
        if (action === 'restart') { if (embedded) window.parent.postMessage({type:'hjm-pitch-restart'},'*'); }
        else if (action === 'start') startGame();
        else if (action === 'identify-submit') submitIdentify();
        else if (action === 'tune-submit') submitTune();
        else if (action === 'tune-reset') setAdjustment(0);
        else if (action === 'next') nextRound();
      });
      document.addEventListener('visibilitychange',() => {
        if (document.hidden) stopAudio();
        else if (audioContext && audioContext.state !== 'running') updateAudioStatus('声音已暂停，请点击播放恢复');
      },{signal:lifecycle.signal});
      window.addEventListener('pageshow',() => { if (audioContext && audioContext.state !== 'running') updateAudioStatus('点击播放以恢复声音'); },{signal:lifecycle.signal});
      window.addEventListener('pagehide',() => { stopAudio(); stopAudioBridge(); },{signal:lifecycle.signal});
      if (embedded) {
        window.addEventListener('message',event => {
          if (event.source !== window.parent) return;
          if (event.data?.type === 'hjm-pitch-settled') {
            const note = root.getElementById('embeddedPayout');
            if (event.data.ok === true) {
              const payout = Math.max(0,Math.floor(Number(event.data.payout) || 0));
              const rawPayout = Math.max(0,Math.floor(Number(event.data.rawPayout) || 0));
              const earned = Math.max(0,Math.floor(Number(event.data.dailyEarned) || 0));
              const cap = Math.max(0,Math.floor(Number(event.data.dailyCap) || 0));
              const amount = root.getElementById('resultRewardAmount');
              const daily = root.getElementById('resultDailyValue');
              const bar = root.getElementById('resultDailyBar');
              if (amount) amount.textContent = String(payout);
              if (daily) daily.textContent = `${earned} / ${cap}`;
              if (bar) bar.style.width = `${cap ? Math.min(100,earned / cap * 100) : 0}%`;
              if (note) {
                const capped = payout < rawPayout;
                note.classList.toggle('is-capped',capped);
                note.textContent = capped ? payout ? `今日额度只剩 ${payout} 音符，已按剩余额度发放。` : '今日该模式音符已领满，本局继续计入练习成绩。' : `结算完成，今天还可获得 ${Math.max(0,cap - earned)} 音符。`;
              }
            } else if (note) {
              note.classList.add('is-capped');
              note.textContent = String(event.data.text || '结算失败，请稍后重试。');
            }
          } else if (event.data?.type === 'hjm-pitch-rules') {
            for (const mode of ['simple','hard']) {
              state.dailyCaps[mode] = Math.max(0,Math.floor(Number(event.data.dailyCaps?.[mode]) || DAILY_CAPS[mode]));
              state.dailyEarned[mode] = Math.max(0,Math.min(state.dailyCaps[mode],Math.floor(Number(event.data.dailyEarned?.[mode]) || 0)));
            }
            state.rulesReady = true;
            if (state.screen === 'intro') render();
          } else if (event.data?.type === 'hjm-pitch-sound') {
            externalSoundEnabled = event.data.enabled === true;
            if (!externalSoundEnabled) { stopAudio(); stopAudioBridge(); updateAudioStatus('游戏声音已关闭，请点击上方声音按钮开启'); }
            else updateAudioStatus('点击播放即可启用声音');
          }
        },{signal:lifecycle.signal});
      }
      const api = {state,rounds,questionSignature,questionId,generateRandomRounds,signatureOf,frequencyForNote,noteLabel,setAdjustment,startGame,submitIdentify,submitTune,nextRound,play,audioSettings:() => ({waveform:TONE_WAVEFORM,voiceCount:1,masterGain:audioOutput?.gain.value ?? MASTER_GAIN,peakGain:.32,sustainGain:.15,referenceHz:roundData().referenceHz,contextState:audioContext?.state ?? null,audioStatus:state.audioStatus,iosAudio,bridgeCreated:!!synthAudioBridge,bridgePlaying:!!synthAudioBridge && !synthAudioBridge.paused,audioSessionType:navigator.audioSession?.type ?? null})};
      api.destroy=()=>{lifecycle.abort();stopAudio();stopAudioBridge();shadow.replaceChildren();if(window.__pitchAudition===api)delete window.__pitchAudition;};
      window.__pitchAudition=api;
      render();
      return api;
    
}

window.createPitchAuditionGame = createPitchAuditionGame;
