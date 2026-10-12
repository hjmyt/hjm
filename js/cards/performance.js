'use strict';

function isWangTeacherLate(now = new Date()) { return now.getHours() >= 20; }
function sammyFlutePenaltyActive(ids = state.cards.team) { return ids.includes('sammy') && ids.some(id => id !== 'sammy' && cardDef(id)?.role?.includes('竹笛')); }
function cardDisplayStat(c, key) {
    const raw = c?.stats?.find(([name]) => name === key)?.[1];
    if (typeof raw !== 'number') return raw;
    let value = c.id === 'jerry' ? raw : c.sourceSet ? sourceStat(c, key, raw) : newStat(c, Math.min(100, raw + Math.floor(cardLevel(c.id) / 5)));
    if (key === '节奏' && jiukuangkuangRhythmBoosts().some(item => item.id === c.id))
        value = Math.min(100, value + 10);
    if (key === '技巧' && liaSisterTechniqueBoosts().some(item => item.id === c.id))
        value = Math.min(100, value + 5);
    if (key === '音准' && zentaViolinPitchBoosts(game.cardRun?.ids || state.cards.team).some(item => item.id === c.id))
        value = Math.min(100, value + 10);
    if (c.id === 'zouzou' && game.cardRun?.zouzou?.autoJoined)
        value = Math.round(Math.min(115, value * 1.15));
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
function cardIsFemale(card) {
    if (!card) return false;
    if (card.pronoun === '她') return true;
    return (card.profileFields || []).some(([key, value]) => key === '档案' && /^女(?:\s|·)/.test(String(value)));
}
function zentaViolinPitchBoosts(ids = state.cards.team) {
    if (!ids.includes('zenta')) return [];
    return ids.filter(id => id !== 'zenta' && cardDef(id)?.role?.includes('小提琴')).map(id => ({ id, boost: 10 }));
}
function liaPolkaEnergyBoosts(ids = state.cards.team) {
    if (!ids.includes('lia')) return [];
    const partners = ids.filter(id => id !== 'lia' && cardDef(id)?.traits?.includes('波尔卡前成员'));
    return partners.length ? ['lia', ...partners].map(id => ({ id, boost: 25 })) : [];
}
function liaSisterTechniqueBoosts(ids = state.cards.team) {
    if (!ids.includes('lia')) return [];
    return ids.filter(id => id !== 'lia' && cardIsFemale(cardDef(id))).map(id => ({ id, boost: 5 }));
}
function liaVoiceEasterEgg(ids = state.cards.team, random = Math.random) {
    const targets = liaSisterTechniqueBoosts(ids);
    if (!targets.length || random() >= .2) return null;
    const id = targets[0].id, name = cardDef(id)?.name || '队友';
    const address = id === 'lala' ? '老大' : id === 'shiyuan' ? '十元姐' : name;
    return { id, line: `${address}，今天也一起加油呀~ ( ´ ▽ \` )ﾉ` };
}
function applyLiaOpeningEnergy(run = game.cardRun) {
    if (!run?.lia || run.lia.energyApplied) return [];
    run.lia.energyApplied = true;
    for (const item of run.lia.polkaEnergy) {
        item.before = trioEnergy(item.id);
        trioAddEnergy(item.id, item.boost);
        item.after = trioEnergy(item.id);
    }
    if (run.lia.polkaEnergy.length) save();
    return run.lia.polkaEnergy;
}
function tryLiaNaturalRescue() {
    const skill = game.cardRun?.lia;
    if (!skill || skill.rescues >= 3) return false;
    skill.rescues++;
    toast('Lia：“咦？刚才那个不算吗？”', true);
    return true;
}
function tryWinnieObservation(random = Math.random) {
    const skill = game.cardRun?.winnie;
    if (!skill)
        return false;
    ensureCardDay();
    if (state.cards.daily.winnieAssists >= 5 || random() >= .3)
        return false;
    state.cards.daily.winnieAssists++;
    skill.observationAssists++;
    save();
    return true;
}
function jiukuangkuangRhythmBoosts(ids = state.cards.team) {
    if (!ids.includes('jiukuangkuang')) return [];
    const partners = ids.filter(id => id !== 'jiukuangkuang' && cardDef(id)?.traits?.includes('二次元'));
    return partners.length ? ['jiukuangkuang', ...partners].map(id => ({ id, boost: 10 })) : [];
}
function tryJiukuangkuangRescue(random = Math.random) {
    const skill = game.cardRun?.jiukuangkuang;
    if (!skill || random() >= skill.missToGoodChance) return false;
    skill.rescues++;
    return true;
}
function jiukuangkuangAutoHold(note, at = game.elapsed) {
    const skill = game.cardRun?.jiukuangkuang;
    const holdLength = Math.max(Number(note?.duration) || 0, Number(note?.beats) || 0);
    if (!skill?.prepared || holdLength <= 1) return false;
    if (at >= skill.cooldownUntil) {
        skill.activeUntil = at + 10;
        skill.cooldownUntil = at + 60;
        skill.activations++;
        toast('酒狂狂 · 理智爆发！长按音符自动保持 10 秒', true);
    }
    if (at > skill.activeUntil) return false;
    skill.autoHolds++;
    return true;
}
function updateFugeFocus(complete, hits) {
    const progress = state.cards.fuge || (state.cards.fuge = { streak: 0 }), run = game.cardRun;
    if (!run?.ids.includes('fuge') || !complete || hits <= 0) {
        progress.streak = 0;
        if (run?.fuge) run.fuge.focusStack = 0;
        return 0;
    }
    progress.streak = Math.min(5, progress.streak + 1);
    run.fuge.focusStack = progress.streak;
    return progress.streak;
}

function zouzouPerformanceLineup(ids = state.cards.team) {
    const lineup = [...new Set(ids.filter(id => cardDef(id)))].slice(0, 3);
    const autoJoined = cardOwned('zouzou') && !lineup.includes('zouzou') && lineup.length < 3;
    if (autoJoined)
        lineup.push('zouzou');
    return { ids: lineup, autoJoined };
}
function zouzouHasCello(ids = game.cardRun?.ids || state.cards.team) {
    return ids.some(id => id !== 'zouzou' && cardDef(id)?.role?.includes('大提琴'));
}
function zouzouTubaActive(at = game.elapsed) {
    const skill = game.cardRun?.zouzou;
    return Boolean(skill && at < skill.activeUntil);
}
function zouzouScoreBonus(base, at = game.elapsed) {
    const skill = game.cardRun?.zouzou;
    if (!skill || at >= skill.activeUntil)
        return 0;
    const bonus = Math.round(base * .4);
    skill.bonusScore += bonus;
    return bonus;
}
function zentaScoreBonus(base) {
    const skill = game.cardRun?.zenta;
    if (!skill || game.cardRun.ids.length < 2)
        return 0;
    const bonus = Math.round(base * .12);
    skill.bonusScore += bonus;
    return bonus;
}
function jinsangPerformanceRoll(ids = state.cards.team, random = Math.random) {
    if (!ids.includes('jinsang'))
        return null;
    const progress = state.cards.jinsang || (state.cards.jinsang = { highlightBonus: 0 });
    const highlightChance = Math.min(.5, .2 + (progress.highlightBonus || 0) / 100);
    const roll = random();
    const event = roll < .2 ? 'crash' : roll < .2 + highlightChance ? 'highlight' : 'neutral';
    const kongge = ids.includes('kongge');
    const simultaneousHighlight = event === 'highlight' && kongge && random() < .2;
    const beforeBonus = progress.highlightBonus || 0;
    if (event === 'crash')
        progress.highlightBonus = Math.min(30, beforeBonus + 5);
    return { event, highlightChance, nextHighlightChance: Math.min(.5, .2 + progress.highlightBonus / 100), kongge, simultaneousHighlight, bonusScore: 0 };
}
function jinsangScoreBonus(base) {
    const skill = game.cardRun?.jinsang;
    if (!skill)
        return 0;
    let multiplier = skill.event === 'crash' ? -.15 : skill.event === 'highlight' ? .6 : 0;
    if (skill.kongge)
        multiplier -= .05;
    if (skill.simultaneousHighlight)
        multiplier += 1;
    const bonus = Math.round(base * multiplier);
    skill.bonusScore += bonus;
    return bonus;
}
function showJinsangPerformanceCue(run = game.cardRun) {
    const skill = run?.jinsang;
    if (!skill || skill.event === 'neutral')
        return;
    const existing = document.querySelector('.jinsang-performance-cue');
    if (existing)
        existing.remove();
    const cue = document.createElement('div');
    cue.className = `jinsang-performance-cue is-${skill.event}`;
    cue.setAttribute('role', 'status');
    cue.innerHTML = `<div><img src="${cardImage(cardDef('jinsang'), 'avatar')}" alt=""><strong>${skill.event === 'crash' ? '叮——翻车！' : skill.simultaneousHighlight ? '双人高光！' : '高光！'}</strong><span>${skill.event === 'crash' ? `本场得分 -15% · 下首高光 ${Math.round(skill.nextHighlightChance * 100)}%` : skill.simultaneousHighlight ? '金桑 × 空格 · 全队额外 +100%' : '本场得分 +60%'}</span></div>`;
    document.body.append(cue);
    document.querySelector('#rhythmTeam [data-card-member="jinsang"]')?.classList.add(skill.event === 'highlight' ? 'jinsang-highlight' : 'jinsang-crash');
    if (skill.event === 'crash' && state.sound && audioCtx?.state === 'running') {
        toneAt(88, audioCtx.currentTime + .01, .12, .13, 'fx', 'sine');
        toneAt(95, audioCtx.currentTime + .08, .18, .08, 'fx', 'sine');
    }
    setTimeout(() => cue.remove(), 1500);
}
function onZouzouJudgement(label) {
    const skill = game.cardRun?.zouzou;
    if (!skill || !['PERFECT', 'GOOD', 'NICE'].includes(label))
        return 0;
    const gain = label === 'PERFECT' ? 10 : label === 'GOOD' ? 7 : 4;
    skill.energy = Math.min(100, skill.energy + gain);
    updateZouzouTubaUI();
    return gain;
}
function activateZouzouTuba(at = game.elapsed) {
    const skill = game.cardRun?.zouzou;
    if (!skill || game.status !== 'running')
        return false;
    if (skill.energy < 100) {
        toast(`TUBA 能量 ${skill.energy}% · 满能量后可以释放`);
        return false;
    }
    if (at < skill.cooldownUntil) {
        toast(`TUBA 冷却中 · 还需 ${Math.ceil(skill.cooldownUntil - at)} 秒`);
        return false;
    }
    const duration = zouzouHasCello(game.cardRun.ids) ? 15 : 12;
    skill.energy = 0;
    skill.activeUntil = at + duration;
    skill.cooldownUntil = at + 120;
    skill.activations++;
    skill.lastDuration = duration;
    updateZouzouTubaUI();
    toast(`奏奏 · TUBA！全队 ${duration} 秒得分 +40%`, true);
    return true;
}

function captureCardRun(random = Math.random, lineup = state.cards.team, options = {}) {
    const ids = [...lineup], hasSammy = ids.includes('sammy'), jinsang = jinsangPerformanceRoll(ids, random);
    return { sourceSnapshot: { xiaota: ids.includes('xiaota'), rescued: false, beats: 0, assists: 0, manualHits: 0, dayangOnline: sourceCast().dayang.online, xiaozhouPraised: sourceCast().xiaozhou.praised }, qiqiStage: ids.includes('qiqi') ? { charm: 15, sisters: ids.includes('shiyuan') } : null, lalaCover: lalaState().cover, lalaCoverBonus: lalaCoverBonus(), lalaJianpuBonus: lalaJianpuBonus(), ids, passive: teamBonus(ids), prepared: state.cards.prepared ? { ...state.cards.prepared } : null, tang: ids.includes('tang'), orange: ids.includes('orange'), mobius: ids.includes('mobius') ? { perfectStreak: 0, hotUntil: -Infinity, activations: 0, bonusScore: 0 } : null, ria: ids.includes('ria') ? { compensated: false, baseScore: 0, bonusScore: 0 } : null, bingbingIntp: ids.includes('bingbing_intp') ? { people: Math.min(4, ids.length + 1), multiplier: [.05, .1, .15][Math.max(0, Math.min(2, ids.length - 1))], teamTechnique: 22, judgementWidth: ids.includes('kongge') ? .08 : 0, bonusScore: 0 } : null, wanglaoshi: ids.includes('wanglaoshi') ? { pitchBoosts: wangTeacherPitchBoosts(ids), stableRange: 5, latePenalty: isWangTeacherLate() ? 10 : 0 } : null, sammy: hasSammy ? { timingOffsetMultiplier: .5, comboSaves: 0, flutePenalty: sammyFlutePenaltyActive(ids) ? 5 : 0 } : null, winnie: ids.includes('winnie') ? { prepared: state.cards.prepared?.id === 'winnie', burstAt: 30, multiplier: .3, activated: false, bonusScore: 0, observationAssists: 0 } : null, jiukuangkuang: ids.includes('jiukuangkuang') ? { judgementWidth: .12, missToGoodChance: .08, prepared: state.cards.prepared?.id === 'jiukuangkuang', activeUntil: -Infinity, cooldownUntil: -Infinity, activations: 0, autoHolds: 0, rescues: 0, rhythmBoosts: jiukuangkuangRhythmBoosts(ids) } : null, fuge: ids.includes('fuge') ? { focusStack: state.cards.fuge?.streak || 0, xpGains: [] } : null, lia: ids.includes('lia') ? { rescues: 0, polkaEnergy: liaPolkaEnergyBoosts(ids), sisterTechnique: liaSisterTechniqueBoosts(ids), voice: liaVoiceEasterEgg(ids, random), energyApplied: false } : null, zouzou: ids.includes('zouzou') ? { autoJoined: options.zouzouAutoJoined === true, statBoost: options.zouzouAutoJoined === true ? 15 : 0, energy: 50, activeUntil: -Infinity, cooldownUntil: -Infinity, activations: 0, lastDuration: 0, bonusScore: 0 } : null, zenta: ids.includes('zenta') ? { teammateMultiplier: .12, pitchBoosts: zentaViolinPitchBoosts(ids), energyRestores: [], bonusScore: 0 } : null, jinsang, credited: false, bondGains: [], missStreak: 0, emoTriggered: false, timSafe: ids.includes('tim'), konggeGood: state.cards.prepared?.id === 'kongge' && sourceRhythm(state.cards.prepared.target) >= 85 };
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

function winnieScoreBonus(base, at = game.elapsed) {
    const skill = game.cardRun?.winnie;
    if (!skill?.prepared || at < skill.burstAt)
        return 0;
    if (!skill.activated) {
        skill.activated = true;
        toast('Winnie · 隐忍解除，全属性 +30%', true);
    }
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
        const beforeXP = state.cards.collection[id]?.xp || 0;
        addCardXP(id, 20 + (run.tang ? 5 : 0), { performance: true, focusStack: run.fuge?.focusStack || 0, team: run.ids });
        if (run.fuge)
            run.fuge.xpGains.push({ id, amount: (state.cards.collection[id]?.xp || 0) - beforeXP });
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
