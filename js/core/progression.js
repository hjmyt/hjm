'use strict';

function allChronicleRuns(chronicle) {
    if (!chronicle || typeof chronicle !== 'object')
        return [];
    return [chronicle.run, ...Object.values(chronicle.slots || {}), ...[2, 3, 4, 5, 6].map(ch => chronicle['chapter' + ch + 'Start'])].filter(Boolean);
}
function freshProgression() { return { version: 2, orchestraLevel: 1, bandLevel: 1 }; }
function cleanProgression(raw, chronicle) {
    const levels = allChronicleRuns(chronicle).map(run => Number(run.level)).filter(Number.isFinite);
    const legacy = Math.max(1, ...levels.map(level => Math.min(99999, Math.floor(level))));
    const number = (value, fallback, min = 1) => Number.isFinite(Number(value)) ? clamp(Math.floor(Number(value)), min, 99999) : fallback;
    return {
        version: 2,
        orchestraLevel: Math.max(legacy, number(raw?.orchestraLevel, legacy)),
        // Version 1 briefly reused orchestra activities for band growth. Reset that
        // accidental value once; version 2 keeps band growth entirely independent.
        bandLevel: Number(raw?.version) >= 2 ? number(raw?.bandLevel, 1) : 1
    };
}
function syncGlobalLevels(source = state) {
    // Save cleaning reconstructs reached dialogue before the cleaned object is
    // assigned to the live `state`. Dialogue previews only need a safe baseline
    // during that short migration window.
    if (!source)
        return freshProgression();
    source.progression = cleanProgression(source.progression, source.chronicle);
    for (const run of allChronicleRuns(source.chronicle))
        run.level = source.progression.orchestraLevel;
    return source.progression;
}
function globalOrchestraLevel(source = state) { return syncGlobalLevels(source).orchestraLevel; }
function globalBandLevel(source = state) { return syncGlobalLevels(source).bandLevel; }
function raiseOrchestraLevel(amount = 1) {
    const p = syncGlobalLevels(state), gain = clamp(Math.floor(Number(amount) || 0), 0, 99999 - p.orchestraLevel);
    p.orchestraLevel += gain;
    syncGlobalLevels(state);
    return gain;
}
