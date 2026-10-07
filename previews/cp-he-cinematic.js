'use strict';
const previewHost = document.getElementById('cinematic-preview');
const previewMusic = new Audio('assets/bgm/baoshi-feihong-ferris-wheel.mp3');
previewMusic.preload = 'none'; previewMusic.loop = true; previewMusic.volume = .32;
let disposeCinematic = () => {}, previewMusicEnabled = false;
function updatePreviewMusic() {
    const button = previewHost.querySelector('[data-preview-music]');
    if (button) { button.textContent = previewMusicEnabled ? '暂停配乐' : '播放附件配乐'; button.setAttribute('aria-pressed', String(previewMusicEnabled)); }
}
function showCinematicPreview() {
    disposeCinematic();
    disposeCinematic = StoryCinematic.mount(previewHost, {
        src: ASSETS.personal_cp_HE_page5,
        videoSrc: CP_HE_CINEMATIC.video,
        musicHTML: '<div class="preview-audio"><button data-preview-music aria-pressed="false">播放附件配乐</button><label>音量 <input data-preview-volume type="range" min="0" max="100" value="32" aria-label="预览配乐音量"></label></div>',
        onClose: () => {
            previewMusic.pause(); previewMusicEnabled = false; disposeCinematic();
            previewHost.innerHTML = '<section class="preview-finished"><h1>那个拥抱，胜过万语千言。</h1><p>演出预览结束 · 未读取或修改游戏存档</p><button data-preview-open>再看一次</button></section>';
        }
    });
    previewHost.querySelector('[data-preview-volume]').value = Math.round(previewMusic.volume * 100);
    updatePreviewMusic();
}
previewHost.addEventListener('click', async event => {
    if (event.target.closest('[data-preview-open]')) showCinematicPreview();
    if (event.target.closest('[data-preview-music]')) {
        previewMusicEnabled = !previewMusicEnabled;
        if (previewMusicEnabled) {
            try { await previewMusic.play(); } catch { previewMusicEnabled = false; }
        } else previewMusic.pause();
        updatePreviewMusic();
    }
});
previewHost.addEventListener('input', event => { if (event.target.matches('[data-preview-volume]')) previewMusic.volume = Number(event.target.value) / 100; });
document.addEventListener('visibilitychange', () => {
    if (document.hidden) previewMusic.pause();
    else if (previewMusicEnabled) previewMusic.play().catch(() => { previewMusicEnabled = false; updatePreviewMusic(); });
});
window.addEventListener('pagehide', () => previewMusic.pause());
showCinematicPreview();
