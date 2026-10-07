'use strict';
let previewAudio = null, previewOutput = null, previewSound = true;
const previewAudioOptions = {
    enabled: () => previewSound,
    getAudio: async () => {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) { document.getElementById('sound-note').textContent = '浏览器不支持音效，仍可预览动画'; return null; }
        if (!previewAudio || previewAudio.state === 'closed') {
            previewAudio = new AC(); previewOutput = previewAudio.createGain();
            previewOutput.gain.value = .28; previewOutput.connect(previewAudio.destination);
        }
        try {
            if (navigator.audioSession) navigator.audioSession.type = 'playback';
            await previewAudio.resume();
        } catch { document.getElementById('sound-note').textContent = '音频未启动，请再次点击播放'; return null; }
        return { context: previewAudio, output: previewOutput };
    }
};
document.getElementById('sound-toggle').addEventListener('click', event => {
    previewSound = !previewSound;
    event.currentTarget.textContent = `音效：${previewSound ? '开' : '关'}`;
    event.currentTarget.setAttribute('aria-pressed', String(previewSound));
    if (previewOutput) previewOutput.gain.setTargetAtTime(previewSound ? .28 : 0, previewAudio.currentTime, .015);
});
document.getElementById('replay').addEventListener('click', () => {
    PawGift.play({ target: document.getElementById('recipient'), name: 'Jerry', origin: document.getElementById('replay'), audio: previewAudioOptions });
});
