'use strict';

const ECONOMY_RULES = Object.freeze({ start: 30, practice: 10, gift: 10, story: 3, daily: 10, bonusCap: 2, fullRuns: 3 });
// C / B / A / S. Song and difficulty premiums are base rewards, separate from
// the existing shared +2 cap for team and active skills.
const RHYTHM_REWARDS = Object.freeze({
    standard: Object.freeze({ gentle: Object.freeze([3, 4, 5, 6]), normal: Object.freeze([4, 5, 6, 7]) }),
    op: Object.freeze({ gentle: Object.freeze([5, 6, 7, 8]), normal: Object.freeze([7, 8, 9, 10]) })
});
function rhythmBaseRewards(trackId, mode = 'gentle') {
    const table = trackId === 'love-hakimi-op-preview-v1' ? RHYTHM_REWARDS.op : RHYTHM_REWARDS.standard;
    return table[mode === 'normal' ? 'normal' : 'gentle'];
}
const ECONOMY_HELP = '音符全局共用。普通练琴 10 音符 → 琴技 +2；周训练报名 10 音符，60 分完成 +2 / 90 分 +3，失败免费重试，每章每项一次；普通投喂 10 音符 → 羁绊分 +1，每日三次；满心礼盒 10000 音符 → 羁绊直达 100，不占用、不受每日三次限制。完整演奏达到 C（45%）才获得音符：C/B/A/S：其他曲目简单 3/4/5/6、困难 4/5/6/7；OP 简单 5/6/7/8、困难 7/8/9/10。编队与技能合计最多另 +2；每天前 3 场达标正常奖励，之后每场总共 1 音符。演奏免费，未达标不扣音符。';
function freshEconomy() { return { version: 1, claimed: {}, training: {}, giftCards: {}, daily: { date: dateKey(), rhythm: 0, claims: {} } }; }
function cleanEconomy(obj) {
    const d = freshEconomy();
    if (!obj || typeof obj !== 'object')
        return d;
    for (const [k, v] of Object.entries(obj.claimed || {}))
        if (v === true && /^(chapter:[1-7]|plot:[1-6]:[a-z0-9_]+|tech:[1-6]:[a-z0-9_]+|audition)$/.test(k))
            d.claimed[k] = true;
    for (const [key, item] of Object.entries(obj.training || {})) {
        if (/^[1-6]:[1-5]$/.test(key) && item?.paid === true)
            d.training[key] = { paid: true, gain: [2, 3].includes(item.gain) ? item.gain : 0 };
    }
    for (const [id, receipt] of Object.entries(obj.giftCards || {})) {
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id) &&
            Number.isSafeInteger(receipt?.notes) && receipt.notes >= 1 && receipt.notes <= 1000000 &&
            Number.isSafeInteger(receipt.redeemedAt) && receipt.redeemedAt > 0 && /^[0-9a-f]{16}$/.test(receipt.kid))
            d.giftCards[id] = { notes: receipt.notes, redeemedAt: receipt.redeemedAt, kid: receipt.kid };
    }
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
    if (Object.values(d.chronicle.personal?.routes || {}).some(r => r.endings?.length))
        d.economy.claimed['chapter:7'] = true;
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
    state.economy.training ??= {};
    state.economy.giftCards ??= {};
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
function rhythmPayout(raw, trackId, mode = 'gentle') {
    if (!Number.isFinite(raw) || raw < 45) return { base: 0, bonus: false };
    const e = economy(), early = e.daily.rhythm < ECONOMY_RULES.fullRuns;
    const rewards = rhythmBaseRewards(trackId, mode);
    e.daily.rhythm++;
    return { base: early ? rewards[raw >= 95 ? 3 : raw >= 85 ? 2 : raw >= 70 ? 1 : 0] : 1, bonus: early };
}
