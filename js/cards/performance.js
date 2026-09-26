'use strict';

function captureCardRun() { return { sourceSnapshot: { xiaota: state.cards.team.includes('xiaota'), rescued: false, beats: 0, assists: 0, manualHits: 0, dayangOnline: sourceCast().dayang.online, xiaozhouPraised: sourceCast().xiaozhou.praised }, qiqiStage: state.cards.team.includes('qiqi') ? { charm: 15, sisters: state.cards.team.includes('shiyuan') } : null, lalaCover: lalaState().cover, lalaCoverBonus: lalaCoverBonus(), lalaJianpuBonus: lalaJianpuBonus(), ids: [...state.cards.team], passive: teamBonus(), prepared: state.cards.prepared ? { ...state.cards.prepared } : null, tang: state.cards.team.includes('tang'), orange: state.cards.team.includes('orange'), credited: false, bondGains: [], missStreak: 0, emoTriggered: false, timSafe: state.cards.team.includes('tim'), konggeGood: state.cards.prepared?.id === 'kongge' && sourceRhythm(state.cards.prepared.target) >= 85 }; }
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
