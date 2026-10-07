'use strict';

const ECONOMY_RULES = Object.freeze({ start: 30, practice: 10, gift: 5, story: 3, daily: 10, bonusCap: 2, fullRuns: 3, pitchSimpleDaily: 20, pitchMediumDaily: 30, pitchHardDaily: 60, cardUnlock: 50, cardUnlockBond: 3, personalRouteUnlock: 350 });

// Reuse permanent card ownership and the existing bond reward ledger. No new save fields.
function purchaseCardUnlock(id) {
    const c = cardDef(id);
    if (!c || c.placeholder) return { ok: false, reason: '这位伙伴的档案待补充，暂不支持音符解锁。' };
    if (cardAvailable(id))
        return { ok: false, reason: '这位伙伴已解锁，无需再次消耗音符。' };
    if (!storageOK) return { ok: false, reason: '存档暂时无法保存，请先恢复保存后再解锁。' };
    if (state.coins < ECONOMY_RULES.cardUnlock)
        return { ok: false, reason: `音符不足，还差 ${ECONOMY_RULES.cardUnlock - state.coins} 音符；可免费演奏赚取。` };
    const snapshot = JSON.parse(JSON.stringify(state));
    state.coins -= ECONOMY_RULES.cardUnlock;
    state.cards.encounters.push(id);
    state.cards.collection[id].owned = true;
    state.cards.collection[id].copies = Math.max(1, state.cards.collection[id].copies);
    const gain = grantBond(id, ECONOMY_RULES.cardUnlockBond, { key: `special:card-unlock:${id}` });
    if (!save()) {
        state = snapshot;
        syncUnifiedBonds(state);
        syncGlobalLevels(state);
        return { ok: false, reason: '保存失败，本次解锁、扣款与羁绊增长已撤回。' };
    }
    return { ok: true, gain };
}
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
const ECONOMY_HELP = '音符全局共用。普通练琴 10 音符 → 琴技 +2；五项周训练免费，有分 +1、60 分完成累计 +2、90 分累计 +3；每章每项最多 +3，重试只补差额；普通投喂按每 5 音符增加 1 羁绊分，礼物分为 5 / 25 / 50 音符，对应 +1 / +5 / +10，每角色每日五次；心动安可 200 音符 → 羁绊 +50（最高 100），占用每日一次投喂；满心礼盒每次 350 音符 → 羁绊直达 100，满分后仍可投喂但不再增加羁绊，不占用、不受每日五次限制。与伙伴完成一场有手动命中的合奏，编队角色羁绊分各 +1；合奏额度独立计算，每角色每日最多 10 次。完整演奏达到 C（45%）才获得音符：C/B/A/S：其他曲目简单 3/4/5/6、困难 4/5/6/7；OP 简单 5/6/7/8、困难 7/8/9/10。编队与技能合计最多另 +2；每天前 3 场达标正常奖励，之后每场总共 1 音符。空格考验包含音准辨音与节奏听写：音准辨音每局随机三题、满分 6 分；节奏听写每局四阶段、满分 4 分。节奏简单模式可看谱并试听正确节奏，每分 1 音符、每天最多 20 音符；节奏中级模式看谱击打但不能试听正确节奏，每分 1 音符、每天最多 30 音符；困难模式听节奏写谱，每分 2 音符、每天最多 60 音符。音准辨音继续使用简单 20／困难 60 的对应额度。各模式均可无限次挑战，触及当日上限后仍可练习但不再获得该模式音符，次日分别重置。完成且至少得 1 分时，同一编队成员各得 1 羁绊分，共用合奏每日 10 次额度。演奏和考验免费。';
function freshEconomy() { return { version: 4, claimed: {}, training: {}, giftCards: {}, daily: { date: dateKey(), rhythm: 0, pitchNotes: { simple: 0, medium: 0, hard: 0 }, claims: {} } }; }
function cleanEconomy(obj) {
    const d = freshEconomy();
    if (!obj || typeof obj !== 'object')
        return d;
    for (const [k, v] of Object.entries(obj.claimed || {}))
        if (v === true && /^(chapter:[1-7]|personal:first-ending|plot:(?:[1-6]|personal):[a-z0-9_:]+|tech:[1-6]:[a-z0-9_]+|audition)$/.test(k))
            d.claimed[k] = true;
    // `paid` is the historic field name. It now means the free training has
    // been opened and remains unchanged so old saves keep their progress.
    for (const [key, item] of Object.entries(obj.training || {})) {
        if (/^[1-6]:[1-5]$/.test(key) && item?.paid === true)
            d.training[key] = { paid: true, gain: [1, 2, 3].includes(item.gain) ? item.gain : 0 };
    }
    for (const [id, receipt] of Object.entries(obj.giftCards || {})) {
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id) &&
            Number.isSafeInteger(receipt?.notes) && receipt.notes >= 1 && receipt.notes <= 1000000 &&
            Number.isSafeInteger(receipt.redeemedAt) && receipt.redeemedAt > 0 && /^[0-9a-f]{16}$/.test(receipt.kid))
            d.giftCards[id] = { notes: receipt.notes, redeemedAt: receipt.redeemedAt, kid: receipt.kid };
    }
    if (obj.daily?.date === dateKey()) {
        d.daily.rhythm = Math.max(0, Math.min(99999, Math.floor(Number(obj.daily.rhythm) || 0)));
        // v1/v2 only recorded simple run count, not actual notes. v3 had only
        // simple/hard counters; preserve them and initialize medium at zero.
        for (const mode of ['simple', 'medium', 'hard']) {
            const cap = mode === 'simple' ? ECONOMY_RULES.pitchSimpleDaily : mode === 'medium' ? ECONOMY_RULES.pitchMediumDaily : ECONOMY_RULES.pitchHardDaily;
            d.daily.pitchNotes[mode] = Math.max(0, Math.min(cap, Math.floor(Number(obj.daily.pitchNotes?.[mode]) || 0)));
        }
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
    if (Object.values(d.chronicle.personal?.routes || {}).some(r => r.endings?.length)) {
        d.economy.claimed['personal:first-ending'] = true;
        if (!d.chronicle.chapterSeven?.endings?.length)
            delete d.economy.claimed['chapter:7'];
    }
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
    state.economy.daily ??= freshEconomy().daily;
    if (state.economy.daily.date !== dateKey())
        state.economy.daily = freshEconomy().daily;
    state.economy.daily.pitchNotes ??= { simple: 0, medium: 0, hard: 0 };
    state.economy.daily.pitchNotes.medium ??= 0;
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
