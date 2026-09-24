'use strict';

function renderGlobal() {
    syncUnifiedBonds(state);
    syncStoryCards();
    ensureDaily();
    $('coinStat').textContent = state.coins;
    $('albumStat').textContent = `${MEMORIES.filter(m => memoryVisible(m.id)).length} / ${MEMORIES.length}`;
    $('homeAlbumText').textContent = `已珍藏 ${MEMORIES.filter(m => memoryVisible(m.id)).length} 张乐团回忆`;
    $('greeting').textContent = currentView === 'cards' ? '让每一段故事，带来一位新的合奏伙伴。' : currentView === 'rhythm' ? '选一首喜欢的曲子，让猫爪落在你的节拍上。' : `欢迎回来，${state.nickname}。你的专属座位，一直为你留着。`;
    $('soundBtn').innerHTML = I(state.sound ? 'sound' : 'mute');
    $('soundBtn').setAttribute('aria-label', state.sound ? '声音已开启，点击关闭' : '声音已关闭，点击开启');
    $('soundBtn').title = state.sound ? '声音已开启' : '声音已关闭';
    renderAudioStatus();
    $('giftLink').innerHTML = (state.gift ? '礼物已收好' : '拆开礼物') + I('arrow');
    renderPet();
    renderDaily();
    if (currentView === 'story' && !storySession)
        renderCharacters();
    if (currentView === 'album')
        renderAlbum();
    renderCardGlobals();
    Chronicle.refresh();
    syncStoryMusic();
}
function syncStoryMusic() {
    const r = state.chronicle.run;
    if (currentView === 'story' && !$('storyMusicControls').firstChild)
        $('storyMusicControls').innerHTML = window.StoryBgm?.controls() || '';
    window.StoryBgm?.sync({ view: currentView, sound: state.sound, character: storySession?.id, chapter: r.chapter, scene: currentView === 'chronicle' ? r.scene : '', ending: currentView === 'chronicle' ? r.ending : null, closed: !!r.bar?.closed });
}
function renderDaily() { const labels = [['pet', '陪猫咪玩一次'], ['story', '读一段故事'], ['rhythm', '完整演奏达到 C']]; $('dailyItems').innerHTML = labels.map(([k, t]) => `<span class="task ${state.daily[k] ? 'done' : ''}"><span class="task-dot">${state.daily[k] ? I('check') : ''}</span>${t}</span>`).join(''); const all = labels.every(([k]) => state.daily[k]); $('dailyClaim').disabled = !all || state.daily.claimed; $('dailyClaim').textContent = state.daily.claimed ? '今日礼物已领取' : '10 ♪ + 1 邀请券'; }
function markDaily(k) { ensureDaily(); state.daily[k] = true; }
function route(name) {
    if (!['home', 'cards', 'card', 'care', 'story', 'chronicle', 'rhythm', 'album'].includes(name))
        return;
    if (currentView === 'chronicle' && name !== 'chronicle')
        Chronicle.suspend();
    if (currentView === 'rhythm' && name !== 'rhythm' && ['running', 'countdown'].includes(game.status))
        pauseGame();
    const previousView = currentView;
    if (name === 'chronicle' && previousView !== 'chronicle')
        LalaUI.recap = hiddenSkillReady('lala') && lalaState().autoRecap && !!state.chronicle.run.name && state.chronicle.run.scene !== 'start';
    currentView = name;
    document.body.dataset.view = name;
    $$('.view').forEach(v => v.hidden = v.id !== `view-${name}`);
    $$('.nav-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.route === (name === 'card' ? 'cards' : name === 'story' ? 'chronicle' : name));
        if (b.dataset.route === (name === 'card' ? 'cards' : name === 'story' ? 'chronicle' : name))
            b.setAttribute('aria-current', 'page');
        else
            b.removeAttribute('aria-current');
    });
    const titles = { chronicle: '从排练室到剧场，写下我们的正传。', cards: '乐团卡册', card: '和你，在同一个频率相遇。', home: '今天，也来合奏一点快乐。', care: '有人等你，也有猫等你。', story: '每一次相遇，都有回响。', rhythm: '节奏舞台', album: '那些小瞬间，都在这里。' };
    $('pageTitle').textContent = titles[name];
    if (name === 'story' && !storySession)
        renderCharacters();
    if (name === 'album')
        renderAlbum();
    if (name === 'rhythm') {
        updateBest();
        requestAnimationFrame(() => { resizeCanvas(); renderGameOverlay(); ensureGameLoop(); });
    }
    renderGlobal();
    window.scrollTo({ top: 0, behavior: 'instant' });
}
