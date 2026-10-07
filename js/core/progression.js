'use strict';

const BAND_MEMBER_IDS = Object.freeze(['goose', 'xiaota', 'dayang', 'rek', 'baoshi', 'xuezi', 'feihong']);
const ORCHESTRA_MEMBER_IDS = Object.freeze(['tang', 'azhe', 'shiyuan', 'lala', 'tim', 'yeshiyang', 'kongge', 'dijie', 'qiqi', 'lemon', 'xiaozhou', 'bill', 'bingbing']);
const LEVEL_RANKS = Object.freeze(['C', 'B', 'A', 'S']);
const LEVEL_MILESTONE_IDS = Object.freeze([
    'band:c1:formation-choice', 'band:c1:commit-choice', 'band:c1:rehearsal', 'band:c1:arrangement', 'band:c1:qualification',
    'band:c2:yangcun-roster', 'band:c2:yangcun-arrangement',
    ...Array.from({ length: 6 }, (_, index) => `orchestra:chapter:${index + 1}:assessment`),
    'orchestra:chapter:1:training-three',
    ...Array.from({ length: 6 }, (_, index) => `orchestra:chapter:${index + 1}:training-all`),
    ...Array.from({ length: 6 }, (_, index) => `orchestra:chapter:${index + 1}:performance`),
    ...Array.from({ length: 6 }, (_, index) => `band:chapter:${index + 1}:performance`),
    ...['band', 'orchestra'].flatMap(group => LEVEL_RANKS.map(rank => `${group}:rhythm:${rank.toLowerCase()}`))
]);
const LEVEL_MILESTONE_SET = new Set(LEVEL_MILESTONE_IDS);

function allChronicleRuns(chronicle) {
    if (!chronicle || typeof chronicle !== 'object')
        return [];
    return [chronicle.run, ...Object.values(chronicle.slots || {}), ...[2, 3, 4, 5, 6].map(ch => chronicle['chapter' + ch + 'Start'])].filter(Boolean);
}
function freshProgression() { return { version: 3, orchestraLevel: 1, bandLevel: 1, claimed: {} }; }
function cleanProgression(raw, chronicle) {
    const levels = allChronicleRuns(chronicle).map(run => Number(run.level)).filter(Number.isFinite);
    const legacy = Math.max(1, ...levels.map(level => Math.min(99999, Math.floor(level))));
    const number = (value, fallback, min = 1) => Number.isFinite(Number(value)) ? clamp(Math.floor(Number(value)), min, 99999) : fallback;
    return {
        version: 3,
        orchestraLevel: Math.max(legacy, number(raw?.orchestraLevel, legacy)),
        // Version 1 briefly reused orchestra activities for band growth. Reset that
        // accidental value once; later versions keep band growth independent.
        bandLevel: Number(raw?.version) >= 2 ? number(raw?.bandLevel, 1) : 1,
        claimed: Object.fromEntries(Object.entries(raw?.claimed || {}).filter(([id, value]) => value === true && LEVEL_MILESTONE_SET.has(id)))
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
function raiseBandLevel(amount = 1) {
    const p = syncGlobalLevels(state), gain = clamp(Math.floor(Number(amount) || 0), 0, 99999 - p.bandLevel);
    p.bandLevel += gain;
    return gain;
}
function levelMilestoneClaimed(id, source = state) { return syncGlobalLevels(source).claimed[id] === true; }
function claimLevelMilestone(group, id, amount = 1) {
    if (!['band', 'orchestra'].includes(group) || !LEVEL_MILESTONE_SET.has(id) || levelMilestoneClaimed(id))
        return 0;
    const p = syncGlobalLevels(state);
    p.claimed[id] = true;
    return group === 'band' ? raiseBandLevel(amount) : raiseOrchestraLevel(amount);
}
function claimBandMilestone(id, amount = 1) { return claimLevelMilestone('band', id, amount); }
function claimOrchestraMilestone(id, amount = 1) { return claimLevelMilestone('orchestra', id, amount); }
function memberLevelGroup(id) {
    if (BAND_MEMBER_IDS.includes(id)) return 'band';
    if (ORCHESTRA_MEMBER_IDS.includes(id)) return 'orchestra';
    return null;
}
function claimRhythmLevelMilestones(ids, rank, excludedGroups = []) {
    if (!LEVEL_RANKS.includes(rank)) return [];
    const groups = [...new Set(ids.map(memberLevelGroup).filter(group => group && !excludedGroups.includes(group)))], gains = [];
    for (const group of groups) {
        const gain = claimLevelMilestone(group, `${group}:rhythm:${rank.toLowerCase()}`);
        if (gain) gains.push({ group, gain, rank });
    }
    return gains;
}
