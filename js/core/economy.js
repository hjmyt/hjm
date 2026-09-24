'use strict';

const ECONOMY_RULES = Object.freeze({ start: 30, practice: 10, gift: 10, story: 3, daily: 10, bonusCap: 2, fullRuns: 3 });
const ECONOMY_HELP = '音符全局共用。练琴 10 音符 → 琴技 +2；投喂 10 音符 → 羁绊分 +1。完整演奏达到 C（45%）才获得音符：C/B/A/S 为 3/4/5/6，编队与技能合计最多另 +2；每天前 3 场达标正常奖励，之后每场总共 1 音符。演奏免费，未达标不扣音符。';
function freshEconomy() { return { version: 1, claimed: {}, daily: { date: dateKey(), rhythm: 0, claims: {} } }; }
function cleanEconomy(obj) {
    const d = freshEconomy();
    if (!obj || typeof obj !== 'object')
        return d;
    for (const [k, v] of Object.entries(obj.claimed || {}))
        if (v === true && /^(chapter:[1-6]|plot:[1-6]:[a-z0-9_]+|tech:[1-6]:[a-z0-9_]+|audition)$/.test(k))
            d.claimed[k] = true;
    if (obj.daily?.date === dateKey()) {
        d.daily.rhythm = Math.max(0, Math.min(99999, Math.floor(Number(obj.daily.rhythm) || 0)));
        for (const k of ['battle', 'encore'])
            if (obj.daily.claims?.[k] === true)
                d.daily.claims[k] = true;
    }
    return d;
}
function seedLegacyEconomy(d) {
    for (const id of d.chronicle.claimed) {
        const ch = id === 'debut' || id === 'ordinary' ? 1 : Number(/^c([1-6])_/.exec(id)?.[1]);
        if (ch && d.chronicle.endings.includes(id))
            d.economy.claimed['chapter:' + ch] = true;
    }
    for (const ch of d.chronicle.completedChapters || [])
        d.economy.claimed['chapter:' + ch] = true;
    if (d.chronicle.claimed.includes('audition'))
        d.economy.claimed.audition = true;
    for (const r of [d.chronicle.run, ...Object.values(d.chronicle.slots)]) {
        for (const e of r.journal || [])
            if (e.choice) {
                d.economy.claimed[`tech:${r.chapter}:${e.scene}`] = true;
                d.economy.claimed[`plot:${r.chapter}:${e.scene}`] = true;
            }
        if (r.events?.sponsor === 'accepted')
            d.economy.claimed['plot:2:c2_sponsor'] = true;
    }
}
function economy() {
    state.economy ??= freshEconomy();
    if (state.economy.daily.date !== dateKey())
        state.economy.daily = freshEconomy().daily;
    return state.economy;
}
function claimEconomy(key, amount, { daily = false } = {}) {
    const e = economy(), claims = daily ? e.daily.claims : e.claimed;
    if (claims[key])
        return 0;
    claims[key] = true;
    state.coins += amount;
    return amount;
}
function rhythmPayout(raw) { const e = economy(); const early = e.daily.rhythm < ECONOMY_RULES.fullRuns; e.daily.rhythm++; return { base: early ? (raw >= 95 ? 6 : raw >= 85 ? 5 : raw >= 70 ? 4 : 3) : 1, bonus: early }; }
