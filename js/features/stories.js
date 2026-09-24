'use strict';

const fillStory = s => s.replaceAll('{player}', state.nickname).replaceAll('{cat}', state.catName);
function beginStory(id) {
    if (!cardOwned(id)) {
        showRecruit();
        return;
    }
    const c = CHARACTERS.find(c => c.id === id);
    if (!c)
        return;
    const p = state.storyProgress[id];
    storySession = { id, index: p?.index || 0, choice: p?.choice ?? null };
    if (storySession.index >= 3 && storySession.choice === null)
        storySession.index = 2;
    $('storySelect').hidden = true;
    $('storyPlayer').hidden = false;
    renderStory();
    $('storyPlayer').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function renderStory() {
    if (!storySession)
        return;
    const s = storySession, c = CHARACTERS.find(c => c.id === s.id), d = STORIES[s.id];
    $('storyPortrait').src = ASSETS[c.asset];
    $('storyPortrait').alt = c.name;
    $('storyLocation').textContent = c.location;
    $('storySceneTitle').innerHTML = c.scene.split('\n').map(escapeHTML).join('<br>') + `<small>${c.eng}</small>`;
    const narrator = [0, 2, 4, 6].includes(s.index);
    $('speaker').innerHTML = narrator ? `旁白 <small>慢慢听，慢慢靠近</small>` : `${c.name}<small>${c.instrument} · ${c.chapter}</small>`;
    const lines = [d.intro, d.hello, d.question, d.responses[s.choice ?? 0], d.bridge, d.ending, d.final];
    $('storyText').textContent = fillStory(lines[s.index]);
    $('storyProgress').innerHTML = lines.map((_, i) => `<span class="${i <= s.index ? 'past' : ''}"></span>`).join('');
    $('storyOptions').hidden = s.index !== 2;
    $('storyNextLine').hidden = s.index === 2;
    if (s.index === 2)
        $('storyOptions').innerHTML = d.choices.map((t, i) => `<button class="choice-btn" data-choice="${i}">${I('heart')}${t}</button>`).join('');
    $('storyNext').innerHTML = (s.index === 6 ? '收藏这次相遇' : '继续') + I(s.index === 6 ? 'album' : 'arrow');
    $('storyTip').textContent = s.index === 6 ? (state.completed.includes(s.id) ? '重温故事不会重复发放奖励。' : '首次完成：15 音符 + 2 羁绊分 + 专属回忆') : '每一次相遇，都值得认真听见。';
    state.storyProgress[s.id] = { index: s.index, choice: s.choice };
    save();
    syncStoryMusic();
}
function chooseStory(n) {
    if (!storySession || storySession.index !== 2)
        return;
    storySession.choice = n === 1 ? 1 : 0;
    storySession.index = 3;
    renderStory();
}
function nextStory() {
    if (!storySession)
        return;
    if (storySession.index === 2)
        return;
    if (storySession.index < 6) {
        storySession.index++;
        renderStory();
        return;
    }
    const id = storySession.id, first = !state.completed.includes(id);
    if (first) {
        state.completed.push(id);
        state.coins += ECONOMY_RULES.story;
        grantBond(id, 2, { key: 'story:' + id });
        addCardXP(id, 30);
        unlock(id);
        toast('一段故事读完啦 · 音符 +3 · 羁绊分 +2', true);
    }
    else
        toast('熟悉的故事，也有新的心动。');
    markDaily('story');
    delete state.storyProgress[id];
    storySession = null;
    save();
    $('storyPlayer').hidden = true;
    $('storySelect').hidden = false;
    renderGlobal();
    renderCharacters();
    $('view-story').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function exitStory() { storySession = null; $('storyPlayer').hidden = true; $('storySelect').hidden = false; renderCharacters(); renderGlobal(); }
function renderCharacters() {
    $('storyCount').textContent = `已完成 ${state.completed.length} / ${CHARACTERS.length}`;
    $('characterGrid').innerHTML = CHARACTERS.map(c => {
        if (!cardAvailable(c.id))
            return `<article class="char-card locked-story"><div class="chapter-lock-art">${I('lock')}</div><div class="char-info"><h3>${c.name}</h3><p>${chapterLockText(c.id)}</p><button class="btn secondary" data-route="chronicle">继续剧情</button></div></article>`;
        const done = state.completed.includes(c.id), prog = state.storyProgress[c.id], own = cardOwned(c.id), cd = cardDef(c.id);
        return `<article class="char-card ${own ? '' : 'locked-story'}"><div class="char-art"><img src="${ASSETS[c.asset]}" alt="${c.name}"><span class="char-instrument">${I(cd?.icon || 'music', 'sm')} ${c.instrument}</span><span class="char-aff">${own ? '♡ ' + cardBond(c.id) : '等待邀请'}</span></div><div class="char-info"><h3>${c.name}</h3><p>${c.quote}</p><button class="btn ${done ? 'secondary' : 'primary'}" ${own ? `data-character="${c.id}"` : 'data-card-recruit'}>${!own ? '先邀请，再相遇' : done ? '重温这次相遇' : prog ? '继续这次相遇' : '和 TA 相遇'}${I('arrow')}</button><button class="story-card-entry" data-card-open="${c.id}">${I('cards')}查看${cardRarity(cd)}卡牌 · 技能与投喂</button><div class="char-chapter">${done ? '已珍藏 · ' : ''}${c.chapter}</div></div></article>`;
    }).join('');
}
