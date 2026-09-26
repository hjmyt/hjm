'use strict';

const KEY = 'love_hakimi_cards_save_v61';
const V6_KEY = 'love_hakimi_cards_save_v6';
const V53_KEY = 'love_hakimi_cards_save_v53';
const V5_KEY = 'love_hakimi_cards_save_v5';
const V4_KEY = 'love_hakimi_cards_save_v4';
const PREVIOUS_KEY = 'love_hakimi_cards_save_v2';
const LEGACY_KEY = 'love_hakimi_save_v1';
function freshState() { const d = { version: 1, economy: freshEconomy(), bondProgress: freshBondProgress(), created: Date.now(), nickname: '乐团新人', catName: '哈基米', coins: ECONOMY_RULES.start, cat: { aff: 0, hunger: 76, mood: 84, energy: 72, pets: 0 }, completed: [], memories: ['first'], affinity: Object.fromEntries(CARD_DEFS.map(c => [c.id, 0])), best: {}, storyProgress: {}, daily: { date: dateKey(), pet: false, story: false, rhythm: false, claimed: false }, gift: false, sound: true, cards: freshCards(), chronicle: Chronicle.fresh() }; syncUnifiedBonds(d); return d; }
function cleanState(obj) {
    if (!obj || typeof obj !== 'object' || obj.version !== 1)
        throw new Error('存档格式不正确');
    const d = freshState(), number = (x, def, min = 0, max = 99999999) => Number.isFinite(Number(x)) ? clamp(Math.round(Number(x)), min, max) : def;
    d.created = number(obj.created, d.created, 946684800000, Date.now());
    d.nickname = typeof obj.nickname === 'string' && obj.nickname.trim() ? obj.nickname.trim().slice(0, 12) : d.nickname;
    d.catName = typeof obj.catName === 'string' && obj.catName.trim() ? obj.catName.trim().slice(0, 10) : d.catName;
    d.coins = number(obj.coins, d.coins);
    d.economy = cleanEconomy(obj.economy);
    d.bondProgress = cleanBondProgress(obj.bondProgress);
    for (const k of ['aff', 'hunger', 'mood', 'energy'])
        d.cat[k] = number(obj.cat?.[k], d.cat[k], 0, 100);
    d.cat.pets = number(obj.cat?.pets, 0);
    d.completed = Array.isArray(obj.completed) ? [...new Set(obj.completed.filter(x => CHARACTERS.some(c => c.id === x)))] : [];
    d.memories = Array.isArray(obj.memories) ? [...new Set(['first', ...obj.memories.filter(x => MEMORIES.some(m => m.id === x))])] : ['first'];
    for (const c of CARD_DEFS)
        d.affinity[c.id] = number(obj.affinity?.[c.id], 0, 0, 99999);
    const bestKeys = new Set(TRACKS.flatMap((track, index) => [track.id || index, track.scoreId, ...(track.legacyScoreIds || [])].filter(id => id !== undefined).flatMap(id => ['gentle', 'normal'].map(mode => `${id}_${mode}`))));
    if (obj.best && typeof obj.best === 'object')
        for (const [k, v] of Object.entries(obj.best)) {
            if (bestKeys.has(k) && v && typeof v === 'object')
                d.best[k] = { score: number(v.score, 0), accuracy: number(v.accuracy, 0, 0, 100), combo: number(v.combo, 0, 0, 200), rank: ['S', 'A', 'B', 'C', 'D'].includes(v.rank) ? v.rank : 'D' };
        }
    if (obj.storyProgress && typeof obj.storyProgress === 'object')
        for (const c of CHARACTERS) {
            const v = obj.storyProgress[c.id];
            if (v && typeof v === 'object')
                d.storyProgress[c.id] = { index: number(v.index, 0, 0, 6), choice: v.choice === 0 ? 0 : v.choice === 1 ? 1 : null };
        }
    if (obj.daily?.date === dateKey())
        for (const k of ['pet', 'story', 'rhythm', 'claimed'])
            d.daily[k] = obj.daily[k] === true;
    d.gift = obj.gift === true;
    d.sound = obj.sound !== false;
    d.cards = cleanCards(obj.cards);
    d.chronicle = Chronicle.clean(obj.chronicle);
    if (!obj.economy)
        seedLegacyEconomy(d);
    // TIM's old independent meter is merged once, never summed or used as a second source again.
    d.affinity.tim = Math.max(d.affinity.tim, number(obj.cards?.trio?.tim?.performance, 0, 0, 100));
    delete d.cards.trio.tim.performance;
    syncUnifiedBonds(d);
    // Seed claims from actual legacy journals and completed stories, preserving replay protection.
    if (!obj.bondProgress) {
        for (const r of [d.chronicle.run, ...Object.values(d.chronicle.slots)])
            for (const e of r.journal || [])
                if (e.choice)
                    for (const c of CARD_DEFS)
                        d.bondProgress.claimed[`plot:${r.chapter}:${e.scene}:${c.id}`] = true;
        for (const id of d.completed)
            d.bondProgress.claimed['story:' + id] = true;
    }
    syncStoryCards(d);
    restoreChronicleArt(d);
    if (Number(obj.affinity?.shiyuan) < 0 || Number(obj.chronicle?.run?.aff?.shiyuan) < 0)
        d.cards.trio.ye.closed = true;
    return d;
}
let storageOK = true, state;
function loadState() {
    try {
        const saved = localStorage.getItem(KEY) || localStorage.getItem(V6_KEY) || localStorage.getItem(V53_KEY) || localStorage.getItem(V5_KEY) || localStorage.getItem(V4_KEY) || localStorage.getItem(PREVIOUS_KEY) || localStorage.getItem(LEGACY_KEY);
        state = saved ? cleanState(JSON.parse(saved)) : freshState();
    }
    catch (e) {
        state = freshState();
        storageOK = false;
    }
}
let currentView = 'home', albumFilter = 'all', modalPreviousFocus = null, modalOnClose = null, lastPetAction = -1000, lastRest = 0, storySession = null;
function save() {
    syncUnifiedBonds(state);
    syncStoryCards();
    try {
        localStorage.setItem(KEY, JSON.stringify(state));
        storageOK = true;
    }
    catch (e) {
        if (storageOK)
            toast('浏览器暂不允许保存；可在设置里导出存档。');
        storageOK = false;
    }
}
function ensureDaily() {
    if (state.daily.date !== dateKey())
        state.daily = { date: dateKey(), pet: false, story: false, rhythm: false, claimed: false };
}
