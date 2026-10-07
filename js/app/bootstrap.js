'use strict';

// Single entry point. Loading/cleaning a save may call any feature's migration helpers.
loadState();
bindAppEvents();
bindAppAnchors();
Chronicle.mount();
// Cards follow reached dialogue, including chapter supplements.
generateChart();
updateTrackUI();
renderGameOverlay();
renderCharacters();
renderGlobal();
applyAppAnchor();
registerImageServiceWorker();
scheduleCardImageWarmup();
save();
if (storageLoadError)
    setTimeout(() => openModal(storageOK ? '已恢复上一份存档' : '存档保护已启动', `<p>${escapeHTML(storageLoadError)}</p>${storageOK ? '<p style="margin-top:12px">恢复的数据已经重新保存；建议现在从设置导出一份备份。</p>' : '<p style="margin-top:12px">在问题解决前，本页面不会写入或覆盖浏览器中的存档。</p>'}`), 500);
else if (!storageOK)
    setTimeout(() => toast('当前环境可能限制自动保存；设置里可以导出存档。'), 900);
// Refresh the daily checklist when crossing midnight without altering other progress.
setInterval(() => {
    const before = state.daily.date;
    ensureDaily();
    if (before !== state.daily.date) {
        save();
        renderGlobal();
    }
}, 60000);
