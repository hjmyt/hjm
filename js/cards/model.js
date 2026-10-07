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
const CardUI = { filter: '全部', sort: 'chapter', tab: 'detail', gift: null, response: null, detailId: null, returnTo: 'cards', jerryPair: 'dijie' };
const cardDef = id => CARD_DEFS.find(c => c.id === id);
// Full-body art, card covers, and small avatars have different safe areas.
// Dedicated crops take precedence so responsive containers cannot cut off a face.
const cardAssetKey = (card, usage = 'cover') => usage === 'full' ? card.asset : usage === 'avatar' ? (card.avatarAsset || card.coverAsset || card.asset) : (card.coverAsset || card.asset);
const cardImage = (card, usage = 'cover') => ASSETS[cardAssetKey(card, usage)];
const cardByAsset = asset => CARD_DEFS.find(card => [card.asset, card.coverAsset, card.avatarAsset].includes(asset));
const cardThumbnail = (card, usage = 'cover', width = usage === 'avatar' ? 192 : 360) => {
    if (!card?.id || card.placeholder)
        return cardImage(card, usage);
    const folder = usage === 'avatar' ? 'avatars' : 'cards';
    return `assets/thumbs/${folder}/${width}/${card.id}.webp${card.imageVersion ? `?v=${encodeURIComponent(card.imageVersion)}` : ''}`;
};
const cardThumbnailByAsset = (asset, usage = 'avatar', width = usage === 'avatar' ? 192 : 360) => {
    const card = cardByAsset(asset);
    return card ? cardThumbnail(card, usage, width) : ASSETS[asset];
};
function dialogueAvatarHTML({ card = null, asset = null, name = '', icon = 'music', alt = '' }) {
    card ||= cardByAsset(asset);
    if (!asset && !card)
        return `<span class="cp-speaker-symbol">${I(icon)}</span>`;
    const src = card ? cardThumbnail(card, 'avatar') : cardThumbnailByAsset(asset);
    if (card)
        preloadCardFull(card.id, 'high');
    const image = `<img src="${src}" alt="${escapeHTML(alt || `${name}的虚拟插画`)}" decoding="async">`;
    if (!card)
        return image;
    return `<button type="button" class="cp-speaker-avatar" data-dialogue-card="${card.id}" aria-label="查看${escapeHTML(card.name)}的人物卡牌" title="点击查看人物卡牌">${image}</button>`;
}
const cardRarity = c => c.id === 'xiaozhou' && sourceCast().xiaozhou.solos >= 3 ? 'SR' : c.rarity;
const cardStarCount = c => c.id === 'xiaozhou' && sourceCast().xiaozhou.solos >= 3 ? 3 : c.stars;
const cardOwned = id => cardAvailable(id) && !!state.cards.collection[id]?.owned;
const cardLevel = id => Math.min(60, 1 + Math.floor((state.cards.collection[id]?.xp || 0) / 60));
const cardBond = id => state.affinity[id] || 0;
const cardName = c => c.id === 'tang' && state.cards.form === 'god' ? '汤少 · 汤神' : c.name;
const cardDark = () => state.cards.blackUntil > Date.now();
const cardStars = c => c.placeholder ? '设定待补充' : '★'.repeat(cardStarCount(c)) + ((c.newMember || c.sourceSet || c.profileOnlySkills || c.id === 'qiqi') && cardStarCount(c) < 5 ? '<span style="opacity:.25">' + '★'.repeat(5 - cardStarCount(c)) + '</span>' : '');
function normalGiftGain(gift, index, gifts) {
    const rawGain = Number(gift[4]) || 0;
    const configuredGains = gifts.map(item => Number(item[4]) || 0);
    // New card definitions may declare the unified tiers directly. Keep the
    // legacy value conversion below for older cards whose fifth field stored a
    // relative gift value instead of the actual bond gain.
    if (configuredGains.length === 3 && configuredGains.every((gain, i) => gain === [1, 5, 10][i]))
        return rawGain;
    // Older cards already carry relative gift values. Newer cards whose
    // placeholder values are identical progress from everyday to premium.
    if (gifts.every(item => (Number(item[4]) || 0) <= 1)) {
        const position = gifts.length <= 1 ? 0 : index / (gifts.length - 1);
        return position >= .8 ? 10 : position >= .35 ? 5 : 1;
    }
    return rawGain >= 13 ? 10 : rawGain >= 10 ? 5 : 1;
}
const cardGifts = c => {
    const gifts = c.gifts || DEFAULT_GIFTS;
    const comfort = COMFORT_GIFTS[c.id];
    return gifts.map((g, index) => {
        const gain = normalGiftGain(g, index, gifts);
        return [g[0], g[1], g[2], gain * BOND_RULES.notesPerBond, gain, g[5]];
    }).filter(g => !(c.id === 'zhu' && g[0] === 'night' && (!state.cards.zhuNight || !hiddenSkillReady('zhu'))) && !(c.id === 'baoshi' && g[0] === 'dress' && !hiddenSkillReady('baoshi'))).concat(c.placeholder ? [] : [...(comfort ? [[comfort.id, comfort.name, 'heart', BOND_RULES.comfortGiftCost, BOND_RULES.comfortGiftGain, 0]] : []), ...(c.id === 'qiqi' ? [[QIQI_TRANSFORMATION_GIFT.id, QIQI_TRANSFORMATION_GIFT.name, 'star', BOND_RULES.qiqiGiftCost, BOND_RULES.qiqiGiftGain, 0]] : []), ...(c.id === 'kongge' ? [[KONGGE_NOODLE_GIFT.id, KONGGE_NOODLE_GIFT.name, 'food', BOND_RULES.konggeNoodleGiftCost, BOND_RULES.konggeNoodleGiftGain, 0], [KONGGE_BEEF_BALLS_GIFT.id, KONGGE_BEEF_BALLS_GIFT.name, 'food', BOND_RULES.konggeBeefBallsGiftCost, BOND_RULES.konggeBeefBallsGiftGain, 0]] : []), ...(c.id === 'tim' ? [[TIM_TRANSFORMATION_GIFT.id, TIM_TRANSFORMATION_GIFT.name, 'star', BOND_RULES.timTransformationGiftCost, BOND_RULES.timTransformationGiftGain, 0]] : []), ['heartfelt_encore', '心动安可', 'music', BOND_RULES.encoreGiftCost, BOND_RULES.encoreGiftGain, 0], ['full_bond', '满心礼盒', 'gift', BOND_RULES.fullGiftCost, 0, 0]]);
};
const isEncoreGift = g => g?.[0] === 'heartfelt_encore';
const isComfortGift = g => !!g && Object.values(COMFORT_GIFTS).some(item => item.id === g[0]);
const isQiqiTransformationGift = g => g?.[0] === QIQI_TRANSFORMATION_GIFT.id;
const isKonggeNoodleGift = g => g?.[0] === KONGGE_NOODLE_GIFT.id;
const isKonggeBeefBallsGift = g => g?.[0] === KONGGE_BEEF_BALLS_GIFT.id;
const isTimTransformationGift = g => g?.[0] === TIM_TRANSFORMATION_GIFT.id;
const isFullBondGift = g => g?.[0] === 'full_bond';
function giftChoiceDisabled(c, g, used) {
    return !isFullBondGift(g) && used >= BOND_RULES.giftsPerDay;
}
function giftFeedDisabled(c, g, used) {
    return !g || giftChoiceDisabled(c, g, used) || state.coins < g[3];
}
function giftEffectText(g) {
    return isFullBondGift(g) ? '羁绊直达 100 · 不限每日次数' : `羁绊分 +${g[4]}`;
}
function cardGiftHint(c, g, used) {
    if (g && !isFullBondGift(g) && used >= BOND_RULES.giftsPerDay)
        return '今日普通投喂已满五次；满心礼盒仍可使用。';
    if (!g)
        return '选择一份心意，再点击投喂。满心礼盒消耗 350 音符，羁绊直达 100，满分后仍可投喂但不再增加羁绊，不占普通投喂次数。';
    if (isEncoreGift(g) || isComfortGift(g) || isQiqiTransformationGift(g) || isKonggeNoodleGift(g) || isKonggeBeefBallsGift(g) || isTimTransformationGift(g)) return `${g[1]}：${g[3]} 音符，羁绊 +${g[4]}（最高 100），占用今日 1 次投喂；满分后仍会扣款，不再增加羁绊。` + (state.coins < g[3] ? '音符不足。' : '');
    return (isFullBondGift(g) ? '消耗 350 音符，羁绊直接提升到 100，满分后仍可投喂但不再增加羁绊，不占用、不受每日五次限制。' : `这份心意：${g[3]} 音符、羁绊分 +${g[4]}、经验 +${g[5]}。`) + (state.coins < g[3] ? '音符不足，先读故事或完成演奏吧。' : '');
}
function renderGiftChoices(c, gifts, used) {
    return gifts.map(g => `<button class="gift-choice ${isFullBondGift(g) ? 'full-bond-gift' : ''} ${CardUI.gift === g[0] ? 'selected' : ''}" data-card-gift="${g[0]}" aria-pressed="${CardUI.gift === g[0]}" ${giftChoiceDisabled(c, g, used) ? 'disabled' : ''}>${I(g[2])}<span>${g[1]}</span><small>${g[3]} ♪ · ${giftEffectText(g)}</small></button>`).join('');
}
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
function rewardPerformanceBond(id) { return grantBond(id, 1, { daily: 'performance' }); }
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
        if (ids.includes('jerry') && hiddenSkillReady('jerry'))
            amount *= 2;
        else if (expansion().dijie.emo)
            amount = Math.floor(amount * .7);
    }
    if (id === 'lala' && ids.includes('jerry') && hiddenSkillReady('jerry'))
        amount *= 2;
    if (state.cards.prepared?.id === 'shiyuan' && state.cards.prepared.target === id)
        amount = Math.ceil(amount * 1.25);
    if (state.cards.prepared?.id === 'kongge' && state.cards.prepared.target === id && sourceRhythm(id) >= 85)
        amount = Math.ceil(amount * 1.3);
    return amount;
}
function teamBonus(ids = state.cards.team) { const total = ids.reduce((sum, id) => sum + cardBonus(id, ids), 0); return ids.includes('shiyuan') ? Math.ceil(total * 1.3) : total; }
