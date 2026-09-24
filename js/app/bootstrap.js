'use strict';

// Single entry point. Loading/cleaning a save may call any feature's migration helpers.
loadState();
bindAppEvents();
Chronicle.mount();
// Cards follow reached dialogue, including chapter supplements.
generateChart();
updateTrackUI();
renderGameOverlay();
renderCharacters();
renderGlobal();
save();
if (!storageOK)
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
