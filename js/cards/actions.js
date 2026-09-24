'use strict';

function goCard(id, feed = false) {
    const c = cardDef(id);
    if (!c)
        return;
    if (!cardAvailable(id)) {
        toast(chapterLockText(id));
        return;
    }
    if (!$('modalBackdrop').hidden)
        closeModal(false);
    CardUI.returnTo = currentView === 'home' ? 'home' : currentView === 'card' ? CardUI.returnTo : 'cards';
    CardUI.detailId = id;
    CardUI.tab = 'detail';
    CardUI.gift = null;
    CardUI.response = null;
    if (cardOwned(id) && !c.placeholder) {
        state.cards.selected = id;
        save();
    }
    route('card');
    if (feed)
        requestAnimationFrame(() => $('cardFeeding')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
}

function selectCard(id) {
    if (!cardDef(id))
        return;
    if (cardDef(id).placeholder) {
        goCard(id);
        return;
    }
    if (!cardOwned(id)) {
        goCard(id);
        return;
    }
    state.cards.selected = id;
    save();
    renderCardGlobals();
    toast(`${cardDef(id).name}来陪你排练了。`, true);
}

function chooseCardGift(key) {
    const c = cardDef(CardUI.detailId || state.cards.selected);
    if (!c)
        return;
    const selected = effectiveGifts(c).find(g => g[0] === key);
    if (!selected)
        return;
    CardUI.gift = key;
    $$('[data-card-gift]').forEach(b => { b.classList.toggle('selected', b.dataset.cardGift === key); b.setAttribute('aria-pressed', b.dataset.cardGift === key ? 'true' : 'false'); });
    const used = state.cards.daily.gifts[c.id] || 0, b = $('cardFeedBtn');
    if (b) {
        b.disabled = used >= 3 || state.coins < selected[3];
        b.innerHTML = I('heart') + `投喂 ${selected[3]} ♪`;
    }
    if ($('cardGiftHint'))
        $('cardGiftHint').textContent = `这份心意：${'羁绊分'} +${selected[4]}、经验 +${selected[5]}。${state.coins < selected[3] ? '音符不足，先读故事或完成演奏吧。' : ''}`;
}

function feedCard() {
    ensureCardDay();
    const c = cardDef(CardUI.detailId || state.cards.selected);
    if (!c || !cardOwned(c.id))
        return;
    if (c.id === 'lemon' && sourceCast().lemon.ended) {
        showLemonEnding();
        return;
    }
    const gifts = effectiveGifts(c), index = gifts.findIndex(g => g[0] === CardUI.gift), g = gifts[index];
    if (!g) {
        toast('先选一份礼物，再投喂吧。');
        return;
    }
    const used = state.cards.daily.gifts[c.id] || 0;
    if (used >= BOND_RULES.giftsPerDay) {
        toast('今天已收到了三份心意，明天再来吧。');
        return;
    }
    if (state.coins < g[3]) {
        toast('音符不够啦，读故事或演奏就能获得。');
        return;
    }
    const btn = $('cardFeedBtn');
    if (btn)
        heartBurst(btn, 6);
    state.coins -= g[3];
    state.cards.daily.gifts[c.id] = used + 1;
    const before = cardBond(c.id), xpBefore = state.cards.collection[c.id].xp;
    grantBond(c.id, g[4]);
    const grew = addCardXP(c.id, g[5]);
    if (c.id === 'feihong' && g[0] === 'cat' && cardDark())
        state.cards.blackUntil = 0;
    if (c.id === 'dijie') {
        expansion().dijie.mood = clamp(expansion().dijie.mood + g[4], 0, 100);
        expansion().dijie.emo = false;
    }
    if (c.id === 'shiyuan')
        expansion().shiyuan.happiness = clamp(expansion().shiyuan.happiness + g[4], 0, 100);
    onTrioGift(c, g);
    onSourceGift(c, g);
    CardUI.response = c.thanks?.[index] || ['“谢谢，你也记得照顾好自己。”', '“下次排练，就用这一份。”', '“要不要坐下来，一起吃？”', '“它好像很喜欢你呢。”'][index];
    save();
    renderGlobal();
    toast(`心意收到 · ${'羁绊分'} +${cardBond(c.id) - before} · 经验 +${state.cards.collection[c.id].xp - xpBefore}${grew ? ` · 升到 Lv.${cardLevel(c.id)}！` : ''}`, true);
    playPetSound('feed');
}

function trainCard(id) {
    if (!cardOwned(id) || cardLevel(id) >= 60)
        return;
    if (state.coins < 8) {
        toast('练习需要 8 音符。');
        return;
    }
    state.coins -= 8;
    const xpBefore = state.cards.collection[id].xp, grew = addCardXP(id, 30);
    if (state.cards.team.includes('shiyuan'))
        fanWave();
    save();
    renderGlobal();
    toast(`${cardDef(id).name}完成了短练习 · 经验 +${state.cards.collection[id].xp - xpBefore}${grew ? ` · Lv.${cardLevel(id)}！` : ''}`, true);
}

function toggleTeam(id) {
    const c = cardDef(id);
    if (id === 'lemon' && sourceCast().lemon.ended) {
        toast('柠檬的人物线已结束，其他旅程仍可继续。');
        return;
    }
    if (c?.placeholder) {
        toast('这位伙伴的设定还在准备中，敬请期待。');
        return;
    }
    if (!c || !cardOwned(id)) {
        toast('先邀请这位伙伴吧。');
        return;
    }
    const team = state.cards.team, index = team.indexOf(id);
    if (index >= 0) {
        team.splice(index, 1);
        if (state.cards.prepared?.id === id || state.cards.prepared?.target === id)
            state.cards.prepared = null;
        save();
        renderGlobal();
        toast(`${c.name}先在台下休息一会儿。`);
        return;
    }
    if (team.length >= 3) {
        openModal('这一次，换谁上台？', `<p>编队最多 3 位。选择一位替换为 <strong>${c.name}</strong>，只是轮换，不会丢失角色或羁绊分。</p><div class="replace-list">${team.map(old => { const x = cardDef(old); return `<button class="replace-option" data-card-replace-old="${old}" data-card-replace-new="${id}"><img src="${ASSETS[x.asset]}" alt="${x.name}"><span><strong>${x.name} → ${c.name}</strong><small>${x.role} · 参与全队加成，合计最多 +2 ♪</small></span>${I('repeat')}</button>`; }).join('')}</div>`);
        return;
    }
    team.push(id);
    save();
    renderGlobal();
    toast(`${c.name}已加入编队。`, true);
}

function replaceTeam(oldId, newId) {
    if (!cardOwned(newId) || state.cards.team.includes(newId))
        return;
    const i = state.cards.team.indexOf(oldId);
    if (i < 0)
        return;
    state.cards.team[i] = newId;
    if (state.cards.prepared?.id === oldId || state.cards.prepared?.target === oldId)
        state.cards.prepared = null;
    save();
    closeModal();
    renderGlobal();
    toast(`${cardDef(newId).name}已替换${cardDef(oldId).name}上台。`, true);
}

function prepareCardSkill(id) {
    if (cardDef(id)?.sourceSet)
        return prepareSourceSkill(id);
    if (id === 'lala')
        return showLalaJournal();
    if (id === 'kongge')
        return prepareKongge();
    if (id === 'shiyuan')
        return startPraise();
    const c = cardDef(id);
    if (!c || !c.active || !cardOwned(id))
        return;
    if (!state.cards.team.includes(id)) {
        toast('请先把这位伙伴加入编队，再准备技能。');
        return;
    }
    if (state.cards.prepared?.id === id) {
        state.cards.prepared = null;
        toast('主动技能已取消准备。');
    }
    else {
        state.cards.prepared = { id, amount: c.active, token: Date.now() };
        toast(`${c.activeName}已准备 · 下场达标演奏参与全队加成，合计最多 +2 ♪`, true);
    }
    save();
    renderGlobal();
}

function switchTangForm() {
    if (!hiddenSkillReady('tang', 'skill')) {
        toast('隐藏技能尚未解锁。');
        return;
    }
    if (!cardOwned('tang'))
        return;
    state.cards.form = state.cards.form === 'god' ? 'normal' : 'god';
    save();
    renderGlobal();
    toast(state.cards.form === 'god' ? '汤神上线 · 金色隐藏形态 · 基础入队加成 +4 ♪' : '汤少回来啦 · 自拍杆模式 · 基础入队加成 +2 ♪', true);
    playPetSound('play');
}

function triggerBlack() {
    if (!hiddenSkillReady('feihong', 'skill')) {
        toast('隐藏技能尚未解锁。');
        return;
    }
    if (!cardOwned('feihong'))
        return;
    if (cardDark()) {
        toast('黑化已经在生效。');
        return;
    }
    state.cards.blackUntil = Date.now() + 180000;
    save();
    renderGlobal();
    toast('好好先生暂时下线 · 三分钟内开演，飞鸿加成再 +3 ♪');
}

function sootheOrange() {
    if (cardDark()) {
        state.cards.blackUntil = 0;
        save();
        renderGlobal();
        toast('橘猫跳上谱架，蹭了一下。黑化解除，好好先生回来啦。', true);
    }
    else
        toast('橘猫蹭了蹭你的手：今天不用我救场，那就先贴贴吧。', true);
    playPetSound('pet');
}

function useEye() {
    if (!hiddenSkillReady('tang', 'skill')) {
        toast('隐藏技能尚未解锁。');
        return;
    }
    ensureCardDay();
    if (!cardOwned('tang') || state.cards.form !== 'god') {
        toast('只有汤神形态可以开启隐藏镜头。');
        return;
    }
    if (state.cards.daily.eye) {
        toast('今天的高光已经收好了，明天再来。');
        return;
    }
    state.cards.daily.eye = true;
    rewardCompanionBond('tang');
    unlock('tang_eye');
    save();
    renderGlobal();
    showMemory('tang_eye');
    toast('荷鲁斯之眼已开启 · 汤少每日陪伴最多 +1', true);
}

function openCardStory(id) {
    if (cardDef(id)?.chronicleOnly) {
        route('chronicle');
        return;
    }
    if (cardDef(id)?.placeholder) {
        goCard(id);
        return;
    }
    if (!cardOwned(id)) {
        toast('先在乐团剧情中与这位伙伴相遇，再翻开角色日常。');
        return;
    }
    if (!$('modalBackdrop').hidden)
        closeModal();
    route('story');
    beginStory(id);
}

function showBondMemory() {
    const id = CardUI.detailId || state.cards.selected;
    if (cardBond(id) < 20)
        return;
    unlock('card_bond');
    save();
    renderGlobal();
    showMemory('card_bond');
}
