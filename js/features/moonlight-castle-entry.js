'use strict';

function bindMoonlightCastleEntry() {
    const pumpkin = document.getElementById('moonlightPumpkin');
    if (!pumpkin) return;
    pumpkin.addEventListener('click', () => {
        openModal('月光古堡 · 万圣节彩蛋', '<div class="castle-entry-warning"><span aria-hidden="true">🎃</span><p>该线路是惊悚线，涉及密室逃脱内容，是否进入？</p><small>包含阴森场景、循环剧情与限时追逐。支持手机游玩，探索进度自动保留。</small><div><button class="btn secondary" id="castleEntryCancel">暂不进入</button><a class="btn" href="moonlight-castle.html">进入月光古堡 →</a></div></div>');
        document.getElementById('castleEntryCancel').addEventListener('click', closeModal);
    });
}
