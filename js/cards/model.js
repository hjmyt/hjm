'use strict';

// Pinned positions always take precedence over secondary sorting, within the current filter.
function compareCollection(a, b, mode = 'rarity') {
    if (a.id === b.id)
        return 0;
    if (mode === 'chapter') {
        const order = id => { const i = state.cards.encounters.indexOf(id); return i < 0 ? CARD_DEFS.length : i; };
        return order(a.id) - order(b.id) || COLLECTION_ORDER.indexOf(a.id) - COLLECTION_ORDER.indexOf(b.id);
    }
    if (a.id === 'tang')
        return -1;
    if (b.id === 'tang')
        return 1;
    if (a.id === 'dijie')
        return 1;
    if (b.id === 'dijie')
        return -1;
    const rarity = { UR: 4, SSR: 3, SR: 2, R: 1, 待定: 0 };
    const diff = mode === 'bond' ? cardBond(b.id) - cardBond(a.id) : mode === 'level' ? cardLevel(b.id) - cardLevel(a.id) : rarity[cardRarity(b)] - rarity[cardRarity(a)];
    return diff || COLLECTION_ORDER.indexOf(a.id) - COLLECTION_ORDER.indexOf(b.id);
}
// ---- Card collection, affection, recruiting, and real rhythm reward integration ----
const CardUI = { filter: '全部', sort: 'chapter', tab: 'detail', gift: null, response: null, detailId: null, returnTo: 'cards' };
const cardDef = id => CARD_DEFS.find(c => c.id === id);
const cardRarity = c => c.id === 'xiaozhou' && sourceCast().xiaozhou.solos >= 3 ? 'SR' : c.rarity;
const cardStarCount = c => c.id === 'xiaozhou' && sourceCast().xiaozhou.solos >= 3 ? 3 : c.stars;
const cardOwned = id => cardAvailable(id) && !!state.cards.collection[id]?.owned;
const cardLevel = id => Math.min(60, 1 + Math.floor((state.cards.collection[id]?.xp || 0) / 60));
const cardBond = id => state.affinity[id] || 0;
const cardName = c => c.id === 'tang' && state.cards.form === 'god' ? '汤少 · 汤神' : c.name;
const cardDark = () => state.cards.blackUntil > Date.now();
const cardStars = c => c.placeholder ? '设定待补充' : '★'.repeat(cardStarCount(c)) + ((c.newMember || c.sourceSet || c.id === 'qiqi') && cardStarCount(c) < 5 ? '<span style="opacity:.25">' + '★'.repeat(5 - cardStarCount(c)) + '</span>' : '');
const cardGifts = c => (c.gifts || DEFAULT_GIFTS).map(g => [g[0], g[1], g[2], BOND_RULES.giftCost, BOND_RULES.giftGain, g[5]]).filter(g => !(c.id === 'zhu' && g[0] === 'night' && (!state.cards.zhuNight || !hiddenSkillReady('zhu'))) && !(c.id === 'baoshi' && g[0] === 'dress' && !hiddenSkillReady('baoshi')));
function ensureCardDay() {
    if (state.cards.daily.date !== dateKey())
        state.cards.daily = { date: dateKey(), gifts: {}, eye: false };
    const x = expansion();
    if (x.daily.date !== dateKey())
        x.daily = { date: dateKey(), script: false, greet: false };
}
function addCardXP(id, amount) {
    const v = state.cards.collection[id];
    if (!v?.owned)
        return false;
    const before = cardLevel(id);
    v.xp = clamp(v.xp + amount, 0, 3540);
    return cardLevel(id) > before;
}
function rewardCompanionBond(id) { return grantBond(id, 1, { daily: true }); }
function cardBonus(id, ids = state.cards.team) {
    const c = cardDef(id);
    if (!c)
        return 0;
    let base = c.id === 'tang' ? (state.cards.form === 'god' ? 4 : 2) : c.bonus;
    let amount = base + Math.floor(cardLevel(id) / 10) + (id === 'feihong' && cardDark() ? 3 : 0);
    if (id === 'lala')
        amount += lalaCoverBonus(ids) + lalaJianpuBonus(ids);
    if (id === 'dijie') {
        if (dijieGolden())
            amount = Math.ceil(amount * 1.5);
        if (expansion().dijie.emo)
            amount = Math.floor(amount * .7);
    }
    if (state.cards.prepared?.id === 'shiyuan' && state.cards.prepared.target === id)
        amount = Math.ceil(amount * 1.25);
    if (state.cards.prepared?.id === 'kongge' && state.cards.prepared.target === id && sourceRhythm(id) >= 85)
        amount = Math.ceil(amount * 1.3);
    return amount;
}
function teamBonus(ids = state.cards.team) { const total = ids.reduce((sum, id) => sum + cardBonus(id, ids), 0); return ids.includes('shiyuan') ? Math.ceil(total * 1.3) : total; }
