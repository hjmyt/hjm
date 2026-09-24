'use strict';

function recruitCost(n) { const tickets = Math.min(state.cards.tickets, n); return { tickets, coins: (n - tickets) * 12 }; }

function costLabel(n) { const p = recruitCost(n); return [p.tickets ? `${p.tickets} 张邀请券` : '', p.coins ? `${p.coins} 音符` : ''].filter(Boolean).join(' + '); }

function showRecruit() {
    const pool = availableCardPool();
    if (!pool.length) {
        openModal('人物卡池尚未开放', `<p>开启乐团剧情，读到第一位伙伴出场时，就会自动获得人物卡并开启邀请。</p><p>邀请券会保留，未解锁人物不会进入卡池。</p><button class="btn primary" data-route="chronicle">开始乐团剧情 ${I('arrow')}</button>`);
        return;
    }
    const groups = ['UR', 'SSR', 'SR', 'R'].filter(r => pool.some(c => cardRarity(c) === r)), weights = { UR: 1, SSR: 9, SR: 70, R: 20 }, sum = groups.reduce((n, r) => n + weights[r], 0);
    openModal('邀请已相遇的伙伴', `<p>当前卡池：${pool.map(c => c.name).join("、")}。随着剧情提到更多伙伴，卡池会自动扩充。</p><div class="summon-resources">${I('ticket')}邀请券 <b>${state.cards.tickets}</b>${I('music')}音符 <b>${state.coins}</b></div><div class="summon-actions">${[1, 5].map(n => `<button class="btn primary" data-card-draw="${n}" ${state.coins < recruitCost(n).coins ? 'disabled' : ''}>邀请 ${n} 次<small>${costLabel(n)}</small></button>`).join('')}</div><details class="summon-rules"><summary>当前卡池规则与概率</summary><p>${groups.map(r => r + ' ' + (weights[r] / sum * 100).toFixed(1) + '%').join(' / ')}。仅在已解锁稀有度之间按权重分配，各稀有度内均匀抽取。池内有 SSR 时，第 10 次未出 SSR 的邀请必得 SSR；池内没有 SSR 时保留保底计数。</p><p>剧情首次提到人物时，直接获得对应人物卡，无需抽取。重复邀请增加 40 经验；1 张券邀请一次，不足时每次 12 音符。没有真实付费。</p></details>`);
}

function randomCardFrom(list) { return list[Math.floor(Math.random() * list.length)]; }

function drawOneCard() {
    const d = state.cards, pool = availableCardPool();
    if (!pool.length)
        return null;
    const ssr = pool.filter(c => ['SSR', 'UR'].includes(cardRarity(c)));
    let c;
    if (d.pity >= 9 && ssr.length)
        c = randomCardFrom(ssr);
    else {
        const weights = { UR: 1, SSR: 9, SR: 70, R: 20 }, groups = Object.keys(weights).filter(r => pool.some(c => cardRarity(c) === r));
        let roll = Math.random() * groups.reduce((n, r) => n + weights[r], 0);
        const rarity = groups.find(r => (roll -= weights[r]) < 0) || groups[groups.length - 1];
        c = randomCardFrom(pool.filter(c => cardRarity(c) === rarity));
    }
    const v = d.collection[c.id], isNew = !v.owned;
    v.owned = true;
    v.copies++;
    d.pulls++;
    d.pity = ['SSR', 'UR'].includes(cardRarity(c)) ? 0 : Math.min(9, d.pity + 1);
    if (isNew)
        d.selected = c.id;
    else {
        addCardXP(c.id, 40);
    }
    const result = { id: c.id, new: isNew, at: Date.now() };
    d.history.unshift(result);
    d.history = d.history.slice(0, 20);
    return result;
}

function recruitCards(n) {
    if (![1, 5].includes(n))
        return;
    if (!availableCardPool().length) {
        showRecruit();
        return;
    }
    const pay = recruitCost(n);
    if (state.coins < pay.coins) {
        toast('音符不够，先读故事或演奏一曲吧。');
        return;
    }
    state.cards.tickets -= pay.tickets;
    state.coins -= pay.coins;
    const results = Array.from({ length: n }, drawOneCard);
    // Persist the result before displaying animation, so closing the page never loses a draw.
    save();
    renderGlobal();
    const newCount = results.filter(r => r.new).length, focus = results.find(r => r.new)?.id || results[0].id;
    openModal(newCount ? '新的伙伴，已经到场。' : '重逢，也是一种成长。', `<div class="result-caption">${newCount ? `新增 ${newCount} 位伙伴，已收进你的乐团卡册。` : '这一次的心意，化作了经验与默契。'}<br><small>点击卡牌，可以查看详情。</small></div><div class="draw-results ${n === 1 ? 'single' : ''}">${results.map((r, i) => { const c = cardDef(r.id); return `<button class="draw-card rarity-${cardRarity(c).toLowerCase()}" style="--i:${i}" data-card-open="${c.id}" aria-label="${r.new ? '新获得' : '重复获得'}${c.name}"><img src="${ASSETS[c.asset]}" alt="${c.name}"><span class="draw-rarity">${cardRarity(c)}</span><span class="draw-new">${r.new ? 'NEW' : '重逢'}</span><span class="draw-name">${c.name}${c.id === 'tang' ? ' · 汤神' : ''}<small>${r.new ? '角色与专属故事已解锁' : '+40 经验'}</small></span></button>`; }).join('')}</div><div class="result-actions"><button class="btn primary" data-card-open="${focus}">${I('cards')}查看卡牌</button><button class="btn secondary" data-card-recruit>${I('ticket')}继续邀请</button><button class="btn ghost" data-card-close>收好这次相遇</button></div>`);
    $('modalBackdrop').querySelector('.modal').classList.add('summon-modal');
    playPetSound('play');
}
