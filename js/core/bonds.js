'use strict';

const BOND_RULES = Object.freeze({ hidden: 35, notesPerBond: 5, giftCost: 5, giftGain: 1, giftGains: Object.freeze([1, 5, 10]), maxSingleGain: 10, giftsPerDay: 5, dailyCompanion: 1, dailyPerformance: 10, fullGiftCost: 350, encoreGiftCost: 200, encoreGiftGain: 50, comfortGiftCost: 100, comfortGiftGain: 30, qiqiGiftCost: 50, qiqiGiftGain: 10, konggeNoodleGiftCost: 25, konggeNoodleGiftGain: 5, konggeBeefBallsGiftCost: 10, konggeBeefBallsGiftGain: 2, timTransformationGiftCost: 50, timTransformationGiftGain: 10 });
function freshBondProgress() { return { version: 1, claimed: {}, daily: { date: dateKey(), counts: {} } }; }
function cleanBondProgress(raw) {
    const d = freshBondProgress();
    if (raw?.claimed && typeof raw.claimed === 'object')
        for (const [key, v] of Object.entries(raw.claimed))
            if (v === true && /^(plot|story|special):[a-zA-Z0-9_:.-]{1,140}$/.test(key))
                d.claimed[key] = true;
    if (raw?.daily?.date === dateKey())
        for (const [key, v] of Object.entries(raw.daily.counts || {}))
            if (/^(companion|performance|catGift):[a-z0-9]+$/.test(key) && Number.isFinite(v)) {
                const limit = key.startsWith('performance:') ? BOND_RULES.dailyPerformance : key.startsWith('catGift:') ? BOND_RULES.giftsPerDay : BOND_RULES.dailyCompanion;
                d.daily.counts[key] = clamp(Math.floor(v), 0, limit);
            }
    return d;
}
function bondProgress() {
    const p = state.bondProgress || (state.bondProgress = freshBondProgress());
    if (p.daily.date !== dateKey())
        p.daily = { date: dateKey(), counts: {} };
    return p;
}
function syncUnifiedBonds(source) { source.affinity = Chronicle.syncBonds(source.chronicle, source.affinity); }
function grantBond(id, amount, { key = null, daily = false } = {}) {
    if (id === 'tangshao')
        id = 'tang';
    if (id !== 'cat' && !CARD_DEFS.some(c => c.id === id) || !Number.isFinite(amount) || amount <= 0)
        return 0;
    const p = bondProgress(), dailyType = daily === 'performance' ? 'performance' : 'companion', dailyKey = dailyType + ':' + id;
    const dailyLimit = dailyType === 'performance' ? BOND_RULES.dailyPerformance : BOND_RULES.dailyCompanion;
    if (key && p.claimed[key] || daily && (p.daily.counts[dailyKey] || 0) >= dailyLimit)
        return 0;
    if (key)
        p.claimed[key] = true;
    if (daily) {
        p.daily.counts[dailyKey] = (p.daily.counts[dailyKey] || 0) + 1;
        amount = 1;
    }
    const before = id === 'cat' ? state.cat.aff : state.affinity[id] || 0;
    // 100 is the normal cap. Imported historic values above it are retained, never reduced.
    const after = Math.max(before, Math.min(100, before + Math.min(BOND_RULES.maxSingleGain, Math.floor(amount))));
    return applyBondValue(id, after);
}
// Explicit paid special gifts bypass the ordinary per-interaction growth limit.
function purchaseFullBond(id) {
    if (!cardOwned(id) || cardDef(id)?.placeholder || state.coins < BOND_RULES.fullGiftCost)
        return 0;
    if (id === 'lemon' && sourceCast().lemon.ended)
        return 0;
    state.coins -= BOND_RULES.fullGiftCost;
    applyBondValue(id, Math.max(100, cardBond(id)));
    return true;
}
function purchaseHeartfeltEncore(id) {
    return purchasePaidBondGift(id, BOND_RULES.encoreGiftCost, BOND_RULES.encoreGiftGain);
}
function purchaseComfortGift(id, giftId) {
    if (COMFORT_GIFTS[id]?.id !== giftId) return false;
    return purchasePaidBondGift(id, BOND_RULES.comfortGiftCost, BOND_RULES.comfortGiftGain);
}
function purchaseQiqiTransformationGift(id, giftId) {
    if (id !== 'qiqi' || giftId !== QIQI_TRANSFORMATION_GIFT.id) return false;
    return purchasePaidBondGift(id, BOND_RULES.qiqiGiftCost, BOND_RULES.qiqiGiftGain);
}
function purchaseKonggeNoodleGift(id, giftId) {
    if (id !== 'kongge' || giftId !== KONGGE_NOODLE_GIFT.id) return false;
    return purchasePaidBondGift(id, BOND_RULES.konggeNoodleGiftCost, BOND_RULES.konggeNoodleGiftGain);
}
function purchaseKonggeBeefBallsGift(id, giftId) {
    if (id !== 'kongge' || giftId !== KONGGE_BEEF_BALLS_GIFT.id) return false;
    return purchasePaidBondGift(id, BOND_RULES.konggeBeefBallsGiftCost, BOND_RULES.konggeBeefBallsGiftGain);
}
function purchaseTimTransformationGift(id, giftId) {
    if (id !== 'tim' || giftId !== TIM_TRANSFORMATION_GIFT.id) return false;
    return purchasePaidBondGift(id, BOND_RULES.timTransformationGiftCost, BOND_RULES.timTransformationGiftGain);
}
function purchasePaidBondGift(id, cost, gain) {
    ensureCardDay();
    if (!storageOK || !cardOwned(id) || cardDef(id)?.placeholder || state.coins < cost)
        return false;
    if (id === 'lemon' && sourceCast().lemon.ended) return false;
    const used = state.cards.daily.gifts[id] || 0;
    if (used >= BOND_RULES.giftsPerDay) return false;
    state.coins -= cost;
    state.cards.daily.gifts[id] = used + 1;
    const before = cardBond(id);
    applyBondValue(id, Math.max(before, Math.min(100, before + gain)));
    return true;
}
function applyBondValue(id, after) {
    const before = id === 'cat' ? state.cat.aff : state.affinity[id] || 0;
    if (id === 'cat')
        state.cat.aff = after;
    else
        state.affinity[id] = after;
    if (id === 'kongge' && after >= 35 && trio().kongge.career)
        unlock('kongge_career');
    if (id === 'qiqi' && after >= 35 && qiqiState().sisters)
        unlock('qiqi_sisters');
    if (id === 'dijie' && after >= 35 && expansion().dijie.perfectConcerts >= 100)
        unlock('dijie_gold');
    if (id !== 'cat' && before < BOND_RULES.hidden && after >= BOND_RULES.hidden)
        toast(`${CARD_DEFS.find(c => c.id === id).name}羁绊分达到 35 · 隐藏技能门槛已达成`, true);
    if (id !== 'cat' && typeof Chronicle !== 'undefined')
        Chronicle.onBondChanged?.(id, before, after);
    return after - before;
}
