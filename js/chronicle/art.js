'use strict';

function chronicleSceneArt(run, meta = state?.chronicle) {
    const openingReady = () => run.chapter !== 6 || (run.aff.zhu >= 10 && Chronicle.priorHeCount(meta) >= 4);
    const matches = {
        practiceWin: () => run.battle?.win === true,
        practiceFail: () => run.battle?.win === false,
        conflict: () => run.level >= 2,
        stageReady: () => run.tech >= 12,
        summerReady: () => run.aff.shiyuan >= 80,
        summerUnready: () => run.aff.shiyuan < 80,
        incidentalMeeting: () => run.level < 2,
        performanceReady: () => openingReady() && run.tech >= Chronicle.requiredTech(run),
        performanceUnready: () => openingReady() && run.tech < Chronicle.requiredTech(run),
        openingIncomplete: () => !openingReady(),
        konggeStays: () => run.flags.konggeStay === 1,
        konggeUndecided: () => run.flags.konggeStay !== 1,
        approachFirst: () => (run.weekly.approach ?? 0) === 0,
        approachSecond: () => run.weekly.approach === 1
    };
    return CHRONICLE_ART.find(a => a.chapter === run.chapter && a.scene === run.scene && (!a.condition || matches[a.condition]?.())) || null;
}

function collectChronicleArt(run) {
    const art = chronicleSceneArt(run);
    return art ? unlock(art.id, false) : false;
}

// Only actual journal entries establish previously seen scenes. Week number alone
// never unlocks artwork, and old journals cannot prove conditional branch images.
function restoreChronicleArt(saved) {
    const seen = new Set(saved.memories);
    for (const run of [saved.chronicle.run, ...Object.values(saved.chronicle.slots)]) {
        for (const entry of run.journal || []) {
            for (const art of CHRONICLE_ART) {
                if (art.newMemory && !art.condition && art.chapter === run.chapter && art.scene === entry.scene)
                    seen.add(art.id);
            }
        }
    }
    for (const [id, route] of Object.entries(saved.chronicle.personal?.routes || {})) {
        for (const node of PERSONAL_ROUTES[id]?.nodes || []) {
            if (route.read?.includes(node.id)) seen.add(node.memory);
        }
    }
    saved.memories = [...seen];
}
