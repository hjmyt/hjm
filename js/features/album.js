'use strict';

function unlock(id, notify = true) {
    if (state.memories.includes(id))
        return false;
    state.memories.push(id);
    const m = MEMORIES.find(x => x.id === id);
    if (notify && m)
        toast(`新回忆已收藏：${m.title}`, true);
    return true;
}
function memoryVisible(id) {
    if (!state.memories.includes(id))
        return false;
    const owner = CARD_DEFS.find(c => id === c.id || id.startsWith(c.id + '_'));
    if (owner && !cardOwned(owner.id))
        return false;
    if (id === 'zhu_night')
        return state.cards.zhuNight === true && hiddenSkillReady('zhu');
    if (id === 'qiqi_sisters')
        return hiddenSkillReady('qiqi');
    if (id === 'baoshi_secret')
        return hiddenSkillReady('baoshi');
    if (id === 'lemon_be')
        return sourceCast().lemon.ended;
    if (id.startsWith('tim_'))
        return hiddenSkillReady('tim', 'clue');
    if (id === 'kongge_career')
        return hiddenSkillReady('kongge', 'clue');
    if (id === 'tang_eye')
        return hiddenSkillReady('tang');
    if (id === 'shiyuan_moon')
        return hiddenSkillReady('shiyuan');
    if (id === 'dijie_gold')
        return hiddenSkillReady('dijie', 'legend');
    if (id === 'ye_invitation')
        return cardOwned('yeshiyang');
    return true;
}
function orderedAlbumMemories(filter = albumFilter) {
    const unlockOrder = new Map(state.memories.map((id, index) => [id, index]));
    return MEMORIES.map((memory, catalogIndex) => ({
        memory,
        catalogIndex,
        open: memoryVisible(memory.id)
    })).filter(item => filter === 'all' || item.open).sort((a, b) => {
        if (a.open !== b.open)
            return a.open ? -1 : 1;
        if (a.open)
            return (unlockOrder.get(a.memory.id) ?? Number.MAX_SAFE_INTEGER) - (unlockOrder.get(b.memory.id) ?? Number.MAX_SAFE_INTEGER);
        return a.catalogIndex - b.catalogIndex;
    });
}
function renderAlbum() {
    const list = orderedAlbumMemories();
    $('albumDescription').textContent = `已珍藏 ${MEMORIES.filter(m => memoryVisible(m.id)).length} / ${MEMORIES.length} 张回忆。我们记住的，都是小事。`;
    $('albumGrid').innerHTML = list.map(({ memory: m, open }) => {
        if (!open)
            return `<button class="memory-card locked" data-memory="${m.id}" aria-label="未解锁的回忆"><div class="chapter-lock-art">${I('lock')}</div><h3>未解锁的回忆</h3><p>在故事与相处中慢慢发现</p></button>`;
        const index = MEMORIES.indexOf(m) + 1;
        return `<button class="memory-card ${open ? '' : 'locked'}" data-memory="${m.id}" aria-label="${open ? '查看回忆' : '未解锁'}：${m.title}。${open ? m.sub : m.rule}"><div class="memory-index">NO. ${String(index).padStart(2, '0')}</div><div class="memory-img"><img loading="lazy" decoding="async" src="${ASSETS[m.asset]}" alt="${open ? m.title : '尚未解锁的回忆'}">${open ? '' : `<span class="lock-cover">${I('lock')}等待被点亮</span>`}</div><h3>${m.title}</h3><p>${open ? m.sub : m.rule}</p></button>`;
    }).join('') || '<div class="album-empty">还没有这类回忆，去和大家相遇吧。</div>';
    $$('[data-filter]').forEach(b => b.classList.toggle('active', b.dataset.filter === albumFilter));
}
function showMemory(id) {
    const m = MEMORIES.find(x => x.id === id);
    if (!m)
        return;
    if (!memoryVisible(id)) {
        toast('这段回忆尚未解锁，在故事与相处中慢慢发现吧。');
        return;
    }
    openModal('把这个瞬间，带回家', `<div class="photo-frame"><img src="${ASSETS[m.asset]}" alt="${m.title}"><h3>${m.title}</h3><p>LOVE &amp; HAKIMI · ${escapeHTML(state.nickname)} 的排练日记</p></div><p class="memory-description">${escapeHTML(m.text)}</p><div style="text-align:center"><button class="btn primary" id="saveMemoryPhoto">${I('download')}保存纪念图</button></div>`);
    $('saveMemoryPhoto').onclick = () => saveMemoryPhoto(m);
}
async function saveMemoryPhoto(m) {
    try {
        const img = new Image();
        img.src = ASSETS[m.asset];
        await img.decode();
        const w = 900, artH = clamp(Math.round(820 / (img.width / img.height)), 265, 1100), cv = document.createElement('canvas');
        cv.width = w;
        cv.height = artH + 246;
        const cx = cv.getContext('2d');
        cx.fillStyle = '#fffaf4';
        cx.fillRect(0, 0, w, cv.height);
        cx.fillStyle = '#eee1dd';
        cx.fillRect(39, 39, 822, artH + 2);
        const scale = Math.min(820 / img.width, artH / img.height);
        const drawW = img.width * scale, drawH = img.height * scale;
        cx.drawImage(img, 40 + (820 - drawW) / 2, 40 + (artH - drawH) / 2, drawW, drawH);
        cx.fillStyle = '#a56980';
        cx.font = '500 38px "Noto Serif CJK SC","Songti SC",serif';
        cx.fillText(m.title, 54, artH + 105);
        cx.fillStyle = '#96818a';
        cx.font = '18px sans-serif';
        cx.fillText(`${state.nickname} 的排练日记 · ${dateKey()}`, 56, artH + 145);
        cx.font = '15px Georgia';
        cx.fillText('LOVE & HAKIMI — A LITTLE MUSIC, A LITTLE LOVE', 56, artH + 187);
        cv.toBlob(blob => {
            if (!blob) {
                toast('生成纪念图失败，请重试。');
                return;
            }
            downloadBlob(blob, `恋与哈基米_${m.title}.png`);
            toast('纪念图已生成。', true);
        }, 'image/png');
    }
    catch (e) {
        toast('这次照片没有洗出来，再试一次吧。');
    }
}
