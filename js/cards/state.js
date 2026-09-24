'use strict';

function freshCards() { return { edition: 7, zhuNight: false, sourceCast: freshSourceCast(), qiqi: freshQiqi(), lala: freshLala(), trio: freshTrio(), expansion: freshExpansion(), tickets: 3, pulls: 0, pity: 0, encounterVersion: 1, encounters: [], selected: null, team: [], form: 'normal', prepared: null, blackUntil: 0, collection: Object.fromEntries(CARD_DEFS.map(c => [c.id, { owned: false, xp: 0, copies: 0 }])), daily: { date: dateKey(), gifts: {}, eye: false }, history: [] }; }
function cleanCards(input) {
    const d = freshCards();
    if (!input || typeof input !== 'object') {
        d.encounterVersion = 0;
        return d;
    }
    d.zhuNight = input.zhuNight === true;
    d.qiqi = cleanQiqi(input.qiqi);
    d.sourceCast = cleanSourceCast(input.sourceCast);
    d.encounterVersion = input.encounterVersion === 1 ? 1 : 0;
    d.encounters = Array.isArray(input.encounters) ? [...new Set(input.encounters.filter(id => CARD_DEFS.some(c => c.id === id)))] : [];
    const num = (n, max = 999999) => Number.isFinite(Number(n)) ? clamp(Math.floor(Number(n)), 0, max) : 0;
    for (const k of ['tickets', 'pulls', 'pity'])
        d[k] = num(input[k], k === 'pity' ? 9 : 999999);
    for (const c of CARD_DEFS) {
        const v = input.collection?.[c.id];
        if (v && typeof v === 'object') {
            d.collection[c.id] = { owned: v.owned === true, xp: num(v.xp, 3540), copies: num(v.copies, 999999) };
            if (d.collection[c.id].owned)
                d.collection[c.id].copies = Math.max(1, d.collection[c.id].copies);
        }
    }
    const valid = id => CARD_DEFS.some(c => c.id === id) && d.collection[id].owned;
    d.selected = valid(input.selected) ? input.selected : (CARD_DEFS.find(c => valid(c.id))?.id || 'azhe');
    if (Array.isArray(input.team)) {
        const retained = [...new Set(input.team.filter(valid))].slice(0, 3);
        // Preserve intentionally empty lineups; replace a lineup only if every member was removed.
        d.team = input.team.length > 0 && retained.length === 0 ? d.team.filter(valid) : retained;
    }
    d.form = input.form === 'god' ? 'god' : 'normal';
    d.blackUntil = Math.min(num(input.blackUntil, Date.now() + 180000), Date.now() + 180000);
    const prep = input.prepared, c = CARD_DEFS.find(c => c.id === prep?.id);
    if (c && c.active && d.team.includes(c.id))
        d.prepared = { id: c.id, amount: c.id === 'xiaozhou' ? c.active * (d.sourceCast.xiaozhou.praised ? 2 : d.sourceCast.xiaozhou.compared ? .5 : 1) : c.id === 'dayang' ? c.active + (d.sourceCast.dayang.online ? 4 : 0) : c.active, token: num(prep.token, 9999999999999) };
    if (input.daily?.date === dateKey()) {
        d.daily.eye = input.daily.eye === true;
        for (const c of CARD_DEFS) {
            const count = num(input.daily.gifts?.[c.id], 3);
            if (count)
                d.daily.gifts[c.id] = count;
        }
    }
    d.trio = cleanTrio(input.trio);
    d.lala = cleanLala(input.lala);
    const ext = input.expansion;
    if (ext && typeof ext === 'object') {
        d.expansion.dijie.instrument = num(ext.dijie?.instrument, 7);
        d.expansion.dijie.emo = ext.dijie?.emo === true;
        d.expansion.dijie.mood = num(ext.dijie?.mood, 100);
        d.expansion.dijie.perfectConcerts = num(ext.dijie?.perfectConcerts, 100000);
        d.expansion.azhe.tickets = num(ext.azhe?.tickets, 99);
        d.expansion.azhe.applauseMs = Math.min(29999, num(ext.azhe?.applauseMs, 30000));
        d.expansion.azhe.encores = num(ext.azhe?.encores, 100000);
        d.expansion.shiyuan.happiness = num(ext.shiyuan?.happiness, 100);
        if (ext.daily?.date === dateKey()) {
            d.expansion.daily.script = ext.daily.script === true;
            d.expansion.daily.greet = ext.daily.greet === true;
        }
    }
    if (d.prepared?.id === 'shiyuan' && d.team.includes(input.prepared?.target) && input.prepared.target !== 'shiyuan')
        d.prepared.target = input.prepared.target;
    else if (d.prepared?.id === 'shiyuan')
        d.prepared = null;
    if (d.prepared?.id === 'kongge') {
        const t = input.prepared?.target;
        if (d.team.includes(t) && t !== 'kongge' && sourceRhythm(t) !== null)
            d.prepared.target = t;
        else
            d.prepared = null;
    }
    if (Array.isArray(input.history))
        d.history = input.history.filter(v => v && CARD_DEFS.some(c => c.id === v.id)).slice(0, 20).map(v => ({ id: v.id, new: v.new === true, at: num(v.at, 9999999999999) }));
    return d;
}
