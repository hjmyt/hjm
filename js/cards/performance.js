'use strict';

function isWangTeacherLate(now = new Date()) { return now.getHours() >= 20; }
function sammyFlutePenaltyActive(ids = state.cards.team) { return ids.includes('sammy') && ids.some(id => id !== 'sammy' && cardDef(id)?.role?.includes('竹笛')); }
function cardDisplayStat(c, key) {
    const raw = c?.stats?.find(([name]) => name === key)?.[1];
    if (typeof raw !== 'number') return raw;
    let value = c.id === 'jerry' ? raw : c.sourceSet ? sourceStat(c, key, raw) : newStat(c, Math.min(100, raw + Math.floor(cardLevel(c.id) / 5)));
    const cap = Number(c.statCaps?.[key]);
    if (typeof value === 'number' && Number.isFinite(cap)) value = Math.min(cap, value);
    return value;
}
function wangTeacherPitchBoosts(ids = state.cards.team) {
    if (!ids.includes('wanglaoshi')) return [];
    return ids.filter(id => id !== 'wanglaoshi').map(id => {
        const card = cardDef(id), before = cardDisplayStat(card, '音准'), cap = Number(card?.statCaps?.音准);
        if (typeof before !== 'number' || before >= 70) return null;
        const after = Number.isFinite(cap) ? Math.min(cap, before + 15) : before + 15;
        return after > before ? { id, before, after, boost: after - before } : null;
    }).filter(Boolean);
}
function wangTeacherStableScore(base, variance = 0) { return Math.round(base * clamp(1 + variance, .975, 1.025)); }
function sammyStableOffset(offset) { return game.cardRun?.sammy ? offset * game.cardRun.sammy.timingOffsetMultiplier : offset; }
function sammyPreservesCombo(random = Math.random) {
    const skill = game.cardRun?.sammy;
    if (!skill || random() >= .25) return false;
    skill.comboSaves++;
    return true;
}

function captureCardRun() {
    const ids = [...state.cards.team], hasSammy = ids.includes('sammy');
    return { sourceSnapshot: { xiaota: ids.includes('xiaota'), rescued: false, beats: 0, assists: 0, manualHits: 0, dayangOnline: sourceCast().dayang.online, xiaozhouPraised: sourceCast().xiaozhou.praised }, qiqiStage: ids.includes('qiqi') ? { charm: 15, sisters: ids.includes('shiyuan') } : null, lalaCover: lalaState().cover, lalaCoverBonus: lalaCoverBonus(), lalaJianpuBonus: lalaJianpuBonus(), ids, passive: teamBonus(), prepared: state.cards.prepared ? { ...state.cards.prepared } : null, tang: ids.includes('tang'), orange: ids.includes('orange'), mobius: ids.includes('mobius') ? { perfectStreak: 0, hotUntil: -Infinity, activations: 0, bonusScore: 0 } : null, ria: ids.includes('ria') ? { compensated: false, baseScore: 0, bonusScore: 0 } : null, bingbingIntp: ids.includes('bingbing_intp') ? { people: Math.min(4, ids.length + 1), multiplier: [.05, .1, .15][Math.max(0, Math.min(2, ids.length - 1))], teamTechnique: 22, judgementWidth: ids.includes('kongge') ? .08 : 0, bonusScore: 0 } : null, wanglaoshi: ids.includes('wanglaoshi') ? { pitchBoosts: wangTeacherPitchBoosts(ids), stableRange: 5, latePenalty: isWangTeacherLate() ? 10 : 0 } : null, sammy: hasSammy ? { timingOffsetMultiplier: .5, comboSaves: 0, flutePenalty: sammyFlutePenaltyActive(ids) ? 5 : 0 } : null, credited: false, bondGains: [], missStreak: 0, emoTriggered: false, timSafe: ids.includes('tim'), konggeGood: state.cards.prepared?.id === 'kongge' && sourceRhythm(state.cards.prepared.target) >= 85 };
}

function mobiusScoreBonus(base, at = game.elapsed) {
    const skill = game.cardRun?.mobius;
    if (!skill || at >= skill.hotUntil)
        return 0;
    const bonus = Math.round(base * .15);
    skill.bonusScore += bonus;
    return bonus;
}

function bingbingIntpScoreBonus(base) {
    const skill = game.cardRun?.bingbingIntp;
    if (!skill)
        return 0;
    const bonus = Math.round(base * skill.multiplier);
    skill.bonusScore += bonus;
    return bonus;
}

function onMobiusJudgement(label, at = game.elapsed) {
    const skill = game.cardRun?.mobius;
    if (!skill)
        return;
    if (label !== 'PERFECT') {
        skill.perfectStreak = 0;
        return;
    }
    skill.perfectStreak++;
    if (skill.perfectStreak < 10)
        return;
    skill.perfectStreak = 0;
    skill.hotUntil = Math.max(skill.hotUntil, at + 5);
    skill.activations++;
    const slot = document.querySelector('#rhythmTeam [data-card-member="mobius"]');
    if (slot) {
        slot.classList.remove('mobius-wave');
        void slot.offsetWidth;
        slot.classList.add('mobius-wave');
        setTimeout(() => slot.classList.remove('mobius-wave'), 900);
    }
    toast('Mobius · 热舞！接下来 5 秒得分 +15%', true);
}

function applyRiaCompensation(complete, hits, accuracy) {
    const skill = game.cardRun?.ria;
    if (!skill || skill.compensated || !complete || hits <= 0 || accuracy >= 80)
        return 0;
    skill.compensated = true;
    skill.baseScore = game.score;
    skill.bonusScore = Math.round(game.score * .2);
    game.score += skill.bonusScore;
    return skill.bonusScore;
}
function awardCardPerformance(hits) {
    const run = game.cardRun;
    if (!run || run.credited || hits <= 0)
        return 0;
    run.credited = true;
    const extra = game.coinBonusEligible === true ? Math.min(ECONOMY_RULES.bonusCap, run.passive + (run.prepared?.amount || 0)) : 0;
    game.coinBonusEligible = false;
    state.coins += extra;
    for (const id of run.ids) {
        addCardXP(id, 20 + (run.tang ? 5 : 0));
        if (rewardPerformanceBond(id))
            run.bondGains.push(id);
    }
    if (run.prepared?.id === 'azhe') {
        const at = run.ids.indexOf('azhe');
        for (const n of [at - 1, at + 1])
            if (run.ids[n])
                rewardCompanionBond(run.ids[n]);
    }
    if (run.ids.includes('azhe'))
        expansion().azhe.tickets = Math.min(99, expansion().azhe.tickets + 1);
    if (run.ids.includes('shiyuan')) {
        fanWave();
        expansion().shiyuan.happiness = clamp(expansion().shiyuan.happiness + 3, 0, 100);
    }
    if (run.ids.includes('dijie') && !(run.sourceSnapshot?.assists) && game.notes.length > 0 && game.perfect === game.notes.length && game.miss === 0 && game.good === 0 && game.nice === 0) {
        const before = dijieGolden();
        expansion().dijie.perfectConcerts++;
        toast(`笛杰 · 完美演奏 ${expansion().dijie.perfectConcerts}/100`, true);
        if (!before && dijieGolden()) {
            unlock('dijie_gold');
            toast('金色笛杰已觉醒 · 展示属性 +50%', true);
        }
    }
    onTrioPerformance(run);
    onLalaPerformance(run);
    onQiqiPerformance(run);
    onSourcePerformance(run);
    if (run.prepared && state.cards.prepared?.token === run.prepared.token)
        state.cards.prepared = null;
    if (run.ids.length === 3)
        unlock('card_band');
    return extra;
}

// One roll per captured performance; rerenders and repeated finish calls cannot reroll.
function applyBingbingScore(complete, hits, random = Math.random) {
    const run = game.cardRun;
    if (!run || run.bingbingRolled || !complete || hits <= 0) return;
    run.bingbingRolled = true;
    if (run.prepared?.id !== 'bingbing' || !run.ids.includes('bingbing') || !cardOwned('bingbing')) return;
    run.bingbingBurst = random() < .35;
    if (run.bingbingBurst) {
        run.bingbingBaseScore = game.score;
        game.score *= 2;
    }
}
