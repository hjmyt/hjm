'use strict';

// Rhythm game Web Audio: original synthesized melodies. Story BGM is managed separately.
let audioCtx = null, audioMaster = null, audioUnavailable = false, audioBlocked = false, synthAudioBridge = null, bridgeIdleTimer = 0, audioStarts = 0;
const iosAudio = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const songNodes = new Set(), synthNodes = new Set();
function configureAudioSession() {
    // WebKit defaults synthesized audio to the ambient/ringer channel.
    try {
        if (navigator.audioSession) {
            navigator.audioSession.type = 'playback';
            return navigator.audioSession.type === 'playback';
        }
    }
    catch { }
    return false;
}
function stopAudioBridge() { clearTimeout(bridgeIdleTimer); synthAudioBridge?.pause(); }
function releaseAudioBridge() {
    clearTimeout(bridgeIdleTimer);
    if (!synthNodes.size && !audioStarts)
        bridgeIdleTimer = setTimeout(stopAudioBridge, 500);
}
function unlockSynthAudio() {
    if (!state.sound || configureAudioSession() || !iosAudio)
        return;
    // Older iOS has no AudioSession API. An unmuted silent media element opens
    // the same media route as story BGM, without fetching or playing a story track.
    if (!synthAudioBridge) {
        synthAudioBridge = new Audio('assets/audio/silence.wav');
        synthAudioBridge.loop = true;
        synthAudioBridge.preload = 'none';
        synthAudioBridge.setAttribute('playsinline', '');
    }
    clearTimeout(bridgeIdleTimer);
    synthAudioBridge.play().catch(e => {
        if (e.name !== 'AbortError' && state.sound && !document.hidden)
            toast('音频未能启动，请再点一次；旧版 iPhone 可先关闭静音模式。');
    });
}
function renderAudioStatus() {
    RhythmRecording.syncSound();
    $('audioStatus').textContent = !state.sound ? '静音中 · 可点右上角开启' : TRACKS[game.track].audio ? '♪ OP 原曲 · 31 秒试玩' : audioUnavailable ? '浏览器不支持合成音频' : audioBlocked ? '音频暂停 · 点击开始或继续重试' : '♪ 原创合成音色';
}
async function ensureAudio() {
    if (audioUnavailable)
        return null;
    audioStarts++;
    unlockSynthAudio();
    try {
        if (!audioCtx || audioCtx.state === 'closed') {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) {
                audioUnavailable = true;
                renderAudioStatus();
                toast('这个浏览器无法播放合成音频，仍可以无声游玩。');
                return null;
            }
            audioCtx = new AC();
            audioMaster = audioCtx.createGain();
            audioMaster.gain.value = state.sound ? 0.28 : 0;
            const compressor = audioCtx.createDynamicsCompressor();
            audioMaster.connect(compressor);
            compressor.connect(audioCtx.destination);
            audioCtx.onstatechange = () => {
                if (audioCtx.state !== 'running' && ['running', 'countdown'].includes(game.status)) {
                    audioBlocked = true;
                    pauseGame();
                    renderAudioStatus();
                }
            };
        }
        // iOS also reports "interrupted" after calls, backgrounding or route changes.
        if (audioCtx.state !== 'running') {
            let timer;
            try {
                await Promise.race([audioCtx.resume(), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Audio resume timed out')), 4000); })]);
            }
            finally {
                clearTimeout(timer);
            }
        }
        if (audioCtx.state !== 'running')
            throw new Error('Audio is not running');
        audioBlocked = false;
        renderAudioStatus();
        return audioCtx;
    }
    catch (e) {
        audioBlocked = true;
        stopAudioBridge();
        renderAudioStatus();
        toast('音频暂未启动，请再点一次重试。');
        return null;
    }
    finally {
        audioStarts--;
        releaseAudioBridge();
    }
}
function toneAt(midi, when, duration, volume = .12, group = 'song', wave = 'triangle') {
    if (!audioCtx || !audioMaster)
        return;
    const t = Math.max(audioCtx.currentTime + .002, when), gain = audioCtx.createGain();
    gain.gain.setValueAtTime(.0001, t);
    gain.gain.exponentialRampToValueAtTime(Math.max(.001, volume), t + .016);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002, volume * .48), t + .13);
    gain.gain.exponentialRampToValueAtTime(.0001, t + Math.max(.17, duration) + .22);
    gain.connect(audioMaster);
    const osc = audioCtx.createOscillator();
    osc.type = wave;
    osc.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
    osc.connect(gain);
    if (group === 'song')
        songNodes.add(osc);
    synthNodes.add(osc);
    clearTimeout(bridgeIdleTimer);
    osc.onended = () => { songNodes.delete(osc); synthNodes.delete(osc); osc.disconnect(); gain.disconnect(); releaseAudioBridge(); };
    osc.start(t);
    osc.stop(t + Math.max(.18, duration) + .26);
}
function stopSongAudio(keepOutput = false) {
    if (!keepOutput) RhythmRecording.pause();
    if (!keepOutput && ![...synthNodes].some(n => !songNodes.has(n)))
        stopAudioBridge();
    for (const n of songNodes) {
        try {
            n.stop();
        }
        catch (e) { }
    }
    songNodes.clear();
}
async function playPetSound(action) {
    if (!state.sound)
        return;
    const a = await ensureAudio();
    if (!a)
        return;
    const pitches = action === 'earn' ? [67, 64] : action === 'feed' ? [76, 79, 84] : action === 'play' ? [76, 81, 84] : [79, 83];
    pitches.forEach((p, i) => toneAt(p, a.currentTime + i * .095, .14, .065, 'fx', 'sine'));
}
