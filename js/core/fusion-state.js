'use strict';

function freshFusionRun() {
    return { current: null, page: 0, done: [], flags: {}, score: 0, ended: false, ending: null, chats: {}, chatTotal: 0, seen: {}, lastChat: null, poolStage: null };
}
function freshFusion() {
    return { version: 1, chapter: null, runs: { rl: freshFusionRun(), ep2: freshFusionRun(), fm: freshFusionRun() } };
}
function cleanFusion(raw) {
    const clean = freshFusion();
    if (!raw || typeof raw !== 'object')
        return clean;
    const ids = new Set(Object.values(FUSION_ROUTES).flat().map(node => node.id));
    for (const key of Object.keys(clean.runs)) {
        const source = raw.runs?.[key];
        if (!source || typeof source !== 'object')
            continue;
        const run = clean.runs[key];
        run.current = ids.has(source.current) ? source.current : null;
        run.page = Number.isFinite(Number(source.page)) ? clamp(Math.floor(Number(source.page)), 0, 999) : 0;
        run.done = Array.isArray(source.done) ? [...new Set(source.done.filter(id => ids.has(id)))] : [];
        if (source.flags && typeof source.flags === 'object')
            for (const [flag, value] of Object.entries(source.flags))
                if (/^[a-zA-Z0-9_]{1,40}$/.test(flag) && value === true)
                    run.flags[flag] = true;
        run.score = Number.isFinite(Number(source.score)) ? clamp(Math.floor(Number(source.score)), -999, 999) : 0;
        run.ended = source.ended === true;
        run.ending = typeof source.ending === 'string' && ids.has(source.ending) ? source.ending : null;
        if (source.chats && typeof source.chats === 'object')
            for (const [name, count] of Object.entries(source.chats))
                if (typeof name === 'string' && Number.isFinite(Number(count)))
                    run.chats[name.slice(0, 12)] = clamp(Math.floor(Number(count)), 0, 99);
        run.chatTotal = Number.isFinite(Number(source.chatTotal)) ? clamp(Math.floor(Number(source.chatTotal)), 0, 999) : 0;
        if (source.seen && typeof source.seen === 'object')
            for (const [name, count] of Object.entries(source.seen))
                if (typeof name === 'string' && Number.isFinite(Number(count)))
                    run.seen[name.slice(0, 12)] = clamp(Math.floor(Number(count)), 0, 99);
        run.lastChat = typeof source.lastChat === 'string' ? source.lastChat.slice(0, 12) : null;
        run.poolStage = ['story', 'pre', 'post'].includes(source.poolStage) ? source.poolStage : null;
    }
    clean.chapter = ['rl', 'ep2', 'fm'].includes(raw.chapter) ? raw.chapter : null;
    return clean;
}
