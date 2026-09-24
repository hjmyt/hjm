'use strict';

// Private Chronicle feature. ctx contains live accessors to sibling features and controller state.
function createChroniclePersistence(ctx) {
    function freshRun() {
        return { weekly: ctx.freshWeeks(), chapter: 1, sourceMode: 'chapter1', events: { sponsor: null, boundary: null, bill: null }, name: '', inst: '', ch: 1, week: 1, tech: 5, level: 1,
            aff: Object.fromEntries(ctx.PERSON_IDS.map(k => [k, 0])), dark: { feihong: 0, dijie: 0 },
            bar: { order: null, returnTo: null, closed: false, closureSeen: false }, flags: {}, scene: 'start', rev: 0, log: [], journal: [], battle: null, live: null, chat: 'lala', ending: null, legacyEnded: false };
    }
    function fresh() { return { version: 2, runNo: 1, claimed: [], endings: [], chapterEndings: {}, completedChapters: [], bonds: Object.fromEntries(ctx.PERSON_IDS.map(k => [k, 0])), slots: {}, chapter2Start: null, chapter3Start: null, chapter4Start: null, chapter5Start: null, chapter6Start: null, run: freshRun() }; }
    // V6: retire the former relationship-penalty branch. Do not reset valid progress.
    // Old identifiers below are migration-only; unknown history entries are filtered by the catalogs.
    function isRetiredRun(a) {
        if (a.ending === 'alienated' || a.scene === 'be_alienated')
            return true;
        // Original chapter saves did not name their final ending. Its removed branch left
        // chapter=1, three warnings and non-reset affinity; the other bad ending resets it to zero.
        return a.scene === 'title2' && a.legacyEnded === true && !a.ending && ctx.nInt(a.ch, 1, 1, 2) === 1 &&
            ctx.nInt(a.warn) >= 3 && ctx.nInt(a.aff?.shiyuan) > 20 && !a.flags?.beShiyuan;
    }
    function isRetiredLog(text) { return /众叛亲离|团内有人不满|团内不满|关系警告/.test(text); }
    function cleanSingle(obj) {
        const d = fresh();
        if (!obj || typeof obj !== 'object')
            return d;
        d.runNo = ctx.nInt(obj.runNo, 1, 1, 99999);
        d.claimed = Array.isArray(obj.claimed) ? [...new Set(obj.claimed.filter(k => ctx.REWARD_IDS.includes(k)))] : [];
        d.endings = Array.isArray(obj.endings) ? [...new Set(obj.endings.filter(k => typeof k === 'string' && Object.hasOwn(ctx.ENDINGS, k)))] : [];
        // Permanent endings are also reward claims, preventing replay/import from granting twice.
        d.claimed = [...new Set([...d.claimed, ...d.endings])];
        const a = obj.run;
        if (!a || typeof a !== 'object')
            return d;
        const r = d.run;
        r.chapter = a.chapter === 6 || String(a.scene || '').startsWith('c6_') || a.scene === 'title7' || String(a.ending || '').startsWith('c6_') ? 6 : a.chapter === 5 || String(a.scene || '').startsWith('c5_') || a.scene === 'title6' || String(a.ending || '').startsWith('c5_') ? 5 : a.chapter === 4 || /^(c4_|b4_)/.test(String(a.scene || '')) || ['title5', 'be_mianbei', 'be_qiqi4'].includes(a.scene) || String(a.ending || '').startsWith('c4_') ? 4 : a.chapter === 3 || String(a.scene || '').startsWith('c3_') || String(a.scene || '').startsWith('band_') || a.scene === 'title4' || a.scene === 'be_qiqi' || String(a.ending || '').startsWith('c3_') ? 3 : a.chapter === 2 || String(a.scene || '').startsWith('c2_') || a.scene === 'title3' || String(a.ending || '').startsWith('c2_') ? 2 : 1;
        r.bar = { order: ctx.SHANQIU_DRINKS.some(d => d.id === a.bar?.order) || a.bar?.order === 'decline' ? a.bar.order : null, returnTo: ['s_dream', 's_first', 'c2_intro', 'c3_intro', 'c4_intro'].includes(a.bar?.returnTo) ? a.bar.returnTo : null, closed: r.chapter === 4 && a.bar?.closed === true, closureSeen: a.bar?.closureSeen === true };
        r.sourceMode = ['carry', 'quick', 'import', 'chapter1'].includes(a.sourceMode) ? a.sourceMode : r.chapter >= 2 ? 'import' : 'chapter1';
        for (const [k, values] of Object.entries({ sponsor: ['checked', 'accepted'], boundary: ['supported', 'watched'], bill: ['replacement', 'warning'] }))
            if (values.includes(a.events?.[k]))
                r.events[k] = a.events[k];
        r.name = ctx.str(a.name, 10);
        r.inst = ctx.str(a.inst, 20);
        r.ch = ctx.nInt(a.ch, r.chapter, 1, 7);
        r.week = ctx.nInt(a.week, 1, 1, 999);
        r.tech = ctx.nInt(a.tech, 5, 0, 9999);
        r.level = ctx.nInt(a.level, 1, 1, 99999);
        r.rev = ctx.nInt(a.rev, 0, 0, 99999999);
        for (const k of ctx.PERSON_IDS)
            r.aff[k] = ctx.nInt(a.aff?.[k], 0, 0, 99999);
        for (const k of ['feihong', 'dijie'])
            r.dark[k] = ctx.nInt(a.dark?.[k], 0, 0, 99999);
        for (const k of ctx.FLAG_KEYS)
            if (a.flags?.[k])
                r.flags[k] = 1;
        for (const key of ['qiWatch', 'qBack', 'qHate'])
            r.flags[key] = ctx.nInt(a.flags?.[key], 0, 0, 999);
        if (a.flags?.konggeStay === 1 || a.flags?.konggeStay === 'weak')
            r.flags.konggeStay = a.flags.konggeStay;
        if (r.flags.konggeStay === 1)
            r.flags.konggeLeave = 0;
        if (r.events.sponsor === null && (r.flags.sponsorWatch || r.flags.sponsorAccepted))
            r.events.sponsor = r.flags.sponsorWatch ? 'checked' : 'accepted';
        if (r.events.boundary === null && r.flags.boundarySet)
            r.events.boundary = 'supported';
        if (r.events.bill === null && (r.flags.billOut || r.flags.billWarn))
            r.events.bill = r.flags.billOut ? 'replacement' : 'warning';
        r.scene = ctx.SCENES.includes(a.scene) ? a.scene : 'start';
        if (r.scene === 'b_live2')
            r.scene = 'b_live';
        r.journal = Array.isArray(a.journal) ? a.journal.filter(e => e && typeof e.text === 'string' && ctx.SCENES.includes(e.scene)).slice(-60).map(e => ({ chapter: r.chapter, week: ctx.nInt(e.week, 1, 1, 999), scene: e.scene, who: ctx.PEOPLE[e.who] || ctx.STORY_VOICES[e.who] ? e.who : 'narrator', text: ctx.str(e.text, 1000), choice: typeof e.choice === 'string' ? ctx.str(e.choice, 160) : null })) : [];
        r.chat = ctx.PERSON_IDS.includes(a.chat) ? a.chat : 'lala';
        r.ending = Object.hasOwn(ctx.ENDINGS, a.ending || '') ? a.ending : null;
        r.legacyEnded = a.legacyEnded === true;
        if (Array.isArray(a.log))
            r.log = a.log.filter(x => x && typeof x.text === 'string' && !isRetiredLog(x.text)).slice(-70).map(x => ({ chapter: [1, 2, 3, 4, 5, 6].includes(x.chapter) ? x.chapter : r.chapter, week: ctx.nInt(x.week, 1, 1, 999), text: ctx.str(x.text, 220), warning: x.warning === true }));
        if (a.battle && typeof a.battle === 'object') {
            const b = a.battle;
            r.battle = { context: b.context === 'weekly' ? 'weekly' : 'intro', hp: ctx.nInt(b.hp, 15, 0, 10009), maxHp: ctx.nInt(b.maxHp, 15, 1, 10009), pressure: ctx.nInt(b.pressure, 14, 0, 14), round: ctx.nInt(b.round, 1, 1, 100), partner: ['shiyuan', 'azhe', 'dijie', 'feihong', 'tim', 'yeshiyang', 'lala'].includes(b.partner) ? b.partner : null, over: b.over === true, win: b.win === true, last: ctx.str(b.last, 300) };
        }
        if (a.live && typeof a.live === 'object') {
            const l = a.live, scores = Array.isArray(l.scores) ? l.scores.filter(n => [2, 6, 10].includes(n)).slice(0, 5) : [];
            r.live = { scores, score: scores.reduce((s, n) => s + n, 0), diff: ctx.nInt(l.diff, ctx.liveDifficulty(r), 1, 1011), pos: Number.isFinite(Number(l.pos)) ? clamp(Number(l.pos), 0, 100) : 0, dir: l.dir === -1 ? -1 : 1,
                phase: ['ready', 'paused', 'feedback', 'done'].includes(l.phase) ? l.phase : 'paused', last: ctx.str(l.last, 120), finished: l.finished === true, width: ctx.nInt(l.width, Math.min(40, 14 + r.tech), 14, 40) };
        }
        if (isRetiredRun(a) || a.scene === 'be_split' || a.ending === 'split') {
            r.scene = r.name.trim() ? 'menu' : 'start';
            r.ch = r.chapter;
            r.ending = null;
            r.legacyEnded = false;
            r.battle = null;
            r.live = null;
            r.journal = [];
            r.rev++;
            r.log.push({ week: r.week, text: r.scene === 'menu' ?
                    '剧情版本已更新，已回到本周安排；你的琴技、羁绊与养成进度已保留。' :
                    '剧情版本已更新，登记后即可继续入团故事。', warning: false });
            r.log = r.log.slice(-70);
        }
        if (!r.name.trim() && r.scene !== 'start') {
            r.scene = 'start';
            r.battle = null;
            r.live = null;
        }
        if (r.scene.startsWith('practice_')) {
            if (!r.battle)
                r.scene = 'practice_partner';
            else if (r.battle.over)
                r.scene = 'practice_result';
            else if (!r.battle.partner)
                r.scene = 'practice_partner';
        }
        if (r.scene === 'live_play' && !r.live)
            r.scene = 'b_live';
        if (r.scene === 'live_result' && !r.live)
            r.scene = 'b_live';
        if (r.ending && !['c5_he', 'c5_be', 'c5_fail', 'c6_he', 'c6_te', 'c6_be', 'live_result', 'be_shiyuan', 'title2', 'title3', 'title4', 'title5', 'title6', 'title7', 'c2_pop_end', 'c3_he', 'c3_te', 'c3_fail', 'be_qiqi', 'c4_he', 'c4_te', 'c4_fail', 'be_qiqi4', 'be_mianbei'].includes(r.scene))
            r.scene = 'title' + (r.chapter + 1);
        if (r.chapter >= 5 && ['zhu_offer', 'zhu_reply', 'shanqiu_closed'].includes(r.scene))
            r.scene = 'c' + r.chapter + '_intro';
        delete r.flags.beShiyuan;
        delete r.flags.lemonDanger;
        if (r.chapter >= 2 && r.scene === 'start' && r.name.trim())
            r.scene = 'c' + r.chapter + '_intro';
        if (r.scene === 'zhu_offer' && r.bar.order)
            r.scene = 'zhu_reply';
        if (r.chapter === 3 && r.name.trim())
            r.flags.c3Met = 1;
        if (r.chapter === 4 && r.name.trim() && (r.scene === 'c4_bao' || r.scene.startsWith('c4_bao_')))
            r.flags.c4bao = 1;
        if (r.chapter === 2 && !r.ending && r.scene === 'menu' && !r.flags.strGroup && !r.flags.popGroup)
            r.scene = 'c2_intro';
        r.weekly = ctx.cleanWeeks(a.weekly, r);
        return d;
    }
    function syncBonds(m = ctx.M(), affinity = null) {
        const records = [affinity, m.bonds, m.run.aff, ...Object.values(m.slots).map(r => r.aff), m.chapter2Start?.aff, m.chapter3Start?.aff, m.chapter4Start?.aff, m.chapter5Start?.aff, m.chapter6Start?.aff].filter(Boolean);
        const values = Object.fromEntries(CARD_DEFS.map(c => [c.id, Math.max(0, ...records.flatMap(a => [ctx.nInt(a[c.id], 0, 0, 99999), c.id === 'tang' ? ctx.nInt(a.tangshao, 0, 0, 99999) : 0]))]));
        const bonds = m.bonds || {};
        delete bonds.tangshao;
        Object.assign(bonds, values);
        Object.defineProperty(bonds, 'tangshao', { configurable: true, get() { return this.tang; }, set(v) { this.tang = v; } });
        m.bonds = bonds;
        m.run.aff = bonds;
        for (const r of Object.values(m.slots))
            r.aff = bonds;
        return bonds;
    }
    function confirmRestart() { ctx.suspend(); const ch = ctx.R().chapter; openModal('重新开始' + ctx.chapterName() + '？', `<p>${ch === 1 ? '重新登记，开启第一章的新周目。' : ctx.M()['chapter' + ch + 'Start'] ? '恢复进入本章时的琴技和等级，重新阅读并选择；全局羁绊保持当前值。' : '这份旧存档未保存本章起点，将使用基础体验档重新开始。'}<br>本章对白、演出分段和选择会重置；其他章节、已解锁人物、卡牌养成、猫咪、相册和已领取奖励全部保留。</p><div class="settings-actions"><button class="btn ghost" data-cp-action="cancel-restart">继续这段故事</button><button class="btn primary" data-cp-action="confirm-restart">确认重开当前章</button></div>`); }
    function restart() {
        ctx.suspend();
        const ch = ctx.R().chapter, name = ctx.R().name, inst = ctx.R().inst;
        ctx.M().runNo++;
        ctx.M().run = ch === 1 ? freshRun() : safeSnapshot(ctx.M()['chapter' + ch + 'Start'] || quickRun(ch, name, inst));
        ctx.R().name = name;
        ctx.R().inst = inst;
        ctx.R().weekly = ctx.freshWeeks();
        ctx.R().ending = null;
        ctx.R().legacyEnded = false;
        ctx.R().battle = null;
        ctx.R().live = null;
        if (ch > 1) {
            ctx.R().scene = 'c' + ch + '_intro';
            ctx.R().week = 1;
            ctx.R().journal = [];
            ctx.R().log = [];
            ctx.R().flags = ch >= 4 ? { ...ctx.R().flags } : ch === 3 ? { c3Met: 1 } : {};
            ctx.R().events = { sponsor: null, boundary: null, bill: null };
            ctx.log('回到' + ctx.chapterName() + '起点。');
        }
        if (ch > 1)
            ctx.beginBarChapter();
        closeModal(false);
        ctx.changed();
        route('chronicle');
        toast('当前章已重开，其他章节和已相遇的人物都保留。', true);
    }
    function sourceSaveDetected(obj) { return !!obj && typeof obj === 'object' && obj.version === undefined && typeof obj.scene === 'string' && obj.aff && Number.isFinite(Number(obj.week)) && Number.isFinite(Number(obj.tech)); }
    function legacy(obj) {
        const raw = { ...obj };
        raw.aff = { ...obj.aff, zhu: obj.aff?.zhu ?? obj.aff?.zhulaoshi ?? 0, tangshao: obj.aff?.tangshao ?? obj.aff?.tang ?? 0, yeshiyang: obj.aff?.yeshiyang ?? obj.aff?.yesiyang ?? 0, goose: obj.aff?.goose ?? obj.aff?.dage ?? 0 };
        raw.chapter = /^(c4_|b4_)/.test(obj.scene) || ['title5', 'be_qiqi4', 'be_mianbei'].includes(obj.scene) || (Number(obj.ch) >= 4 && !['title4', 'be_qiqi'].includes(obj.scene) && !String(obj.scene).startsWith('c3_') && !String(obj.scene).startsWith('band_')) ? 4 : String(obj.scene).startsWith('c3_') || String(obj.scene).startsWith('band_') || ['title4', 'be_qiqi'].includes(obj.scene) || (Number(obj.ch) >= 3 && !['title3', 'c2_pop_end', 'he_end', 'te_end', 'te_fail', 'be_split'].includes(obj.scene)) ? 3 : String(obj.scene).startsWith('c2_') || ['title3', 'he_end', 'te_end', 'te_fail', 'be_split'].includes(obj.scene) || (Number(obj.ch) >= 2 && obj.scene !== 'title2') ? 2 : 1;
        // The fourth standalone file reused chapter-three scene IDs for this event.
        if (Number(obj.ch) >= 4 && /^c3_jeal(?:_[abc])?$/.test(obj.scene)) {
            raw.chapter = 4;
            raw.scene = obj.scene.replace('c3_', 'c4_');
        }
        if (/^c6_/.test(obj.scene) || obj.scene === 'title7' || Number(obj.ch) >= 6 && !/^(c[2345]_|b4_|band_)/.test(obj.scene) && !['title3', 'title4', 'title5', 'title6', 'be_qiqi', 'be_qiqi4', 'be_mianbei', 'be_shiyuan'].includes(obj.scene))
            raw.chapter = 6;
        else if (/^c5_/.test(obj.scene) || obj.scene === 'title6' || Number(obj.ch) === 5 && !/^(c[234]_|b4_|band_)/.test(obj.scene) && !['title4', 'title5', 'be_qiqi', 'be_qiqi4', 'be_mianbei', 'be_shiyuan'].includes(obj.scene))
            raw.chapter = 5;
        if (['c5_he', 'c5_be', 'c5_fail', 'c6_he', 'c6_te', 'c6_be'].includes(obj.scene))
            raw.ending = obj.scene;
        raw.sourceMode = 'import';
        raw.flags = { ...obj.flags };
        if (obj.flags?.qiqiWatch)
            raw.flags.sponsorWatch = 1;
        if (obj.flags?.yuerouBlock)
            raw.flags.boundarySet = 1;
        const map = { b_practice: 'practice_partner', liveGo: 'b_live', b_live2: 'b_live', he_end: 'live_result', te_end: 'live_result', te_fail: 'live_result', c2_pop_end: 'c2_pop_end' };
        raw.scene = map[raw.scene] || raw.scene;
        if (['c4_he', 'c4_te', 'c4_fail'].includes(obj.scene))
            raw.ending = obj.scene;
        if (obj.scene === 'be_qiqi4')
            raw.ending = 'c4_qiqi';
        if (obj.scene === 'be_mianbei')
            raw.ending = 'c4_lemon';
        if (['c3_he', 'c3_te', 'c3_fail'].includes(obj.scene))
            raw.ending = obj.scene;
        if (obj.scene === 'be_qiqi')
            raw.ending = 'c3_qiqi';
        if (obj.scene === 'he_end')
            raw.ending = 'c2_dual';
        if (obj.scene === 'te_end')
            raw.ending = 'c2_solo';
        if (obj.scene === 'te_fail')
            raw.ending = 'c2_retry';
        if (obj.scene === 'c2_pop_end' || obj.scene === 'title3' && obj.flags?.popGroup)
            raw.ending = 'c2_street';
        raw.log = [{ chapter: raw.chapter, week: obj.week, text: '已导入附件原版正传存档。原版未保存的合练回合或路演分段，退回该场准备页重新开始。' }];
        if (['title2', 'title3', 'title4', 'title5', 'title6', 'title7'].includes(raw.scene))
            raw.legacyEnded = true;
        if (raw.scene === 'be_shiyuan')
            raw.ending = 'shadow';
        if (raw.ending && raw.scene === 'live_result')
            raw.scene = 'title3';
        const slots = { ...ctx.M().slots };
        slots[String(ctx.R().chapter)] = safeSnapshot(ctx.R());
        delete slots[String(raw.chapter)];
        return clean({ version: 2, runNo: ctx.M().runNo, claimed: ctx.M().claimed, endings: ctx.M().endings, chapterEndings: ctx.M().chapterEndings, completedChapters: ctx.M().completedChapters, bonds: ctx.M().bonds, run: raw, slots, chapter2Start: raw.chapter === 2 ? null : ctx.M().chapter2Start, chapter3Start: raw.chapter === 3 ? null : ctx.M().chapter3Start, chapter4Start: raw.chapter === 4 ? null : ctx.M().chapter4Start, chapter5Start: raw.chapter === 5 ? null : ctx.M().chapter5Start, chapter6Start: raw.chapter === 6 ? null : ctx.M().chapter6Start });
    }
    function requestLegacy(obj) {
        const converted = legacy(obj);
        openModal('导入附件原版的正传存档？', `<p>玩家：${ctx.E(converted.run.name)}<br>${ctx.chapterName(converted.run.chapter)} · 第 ${converted.run.week} 周 · 琴技 ${converted.run.tech}</p><p style="margin-top:12px">只替换对应章节，保留其他章节；不覆盖卡牌、猫咪或节奏进度。原版没有保存的回合和快闪分段，无法恢复到同一拍，会退回该场准备页。</p><div class="settings-actions"><button class="btn ghost" id="cpCancelLegacy">取消</button><button class="btn primary" id="cpConfirmLegacy">导入正传</button></div>`);
        $('cpCancelLegacy').onclick = () => closeModal();
        $('cpConfirmLegacy').onclick = () => {
            ctx.suspend();
            state.chronicle = converted;
            syncStoryCards(state, false, true);
            if (converted.run.chapter >= 2)
                ctx.reward('c' + converted.run.chapter + '_entry');
            if (converted.run.ending) {
                const id = converted.run.ending;
                if (!converted.endings.includes(id))
                    converted.endings.push(id);
                if (!converted.claimed.includes(id))
                    converted.claimed.push(id);
                unlock(ctx.ENDINGS[id].memory, false);
            }
            seedLegacyEconomy(state);
            save();
            ctx.renderSignature = '';
            closeModal();
            route('chronicle');
            toast('正传存档已导入，卡牌养成未改变。', true);
        };
    }
    function safeSnapshot(r) { return JSON.parse(JSON.stringify(r)); }
    function clean(obj) {
        const d = cleanSingle(obj);
        d.slots = {};
        for (const id of ['1', '2', '3', '4', '5', '6']) {
            const a = obj?.slots?.[id];
            if (a && typeof a === 'object') {
                const s = cleanSingle({ run: { ...a, chapter: Number(id) } }).run;
                if (s.name || s.scene === 'start')
                    d.slots[id] = s;
            }
        }
        delete d.slots[String(d.run.chapter)];
        for (const ch of [2, 3, 4, 5, 6]) {
            const seed = obj?.['chapter' + ch + 'Start'];
            d['chapter' + ch + 'Start'] = seed && typeof seed === 'object' ? cleanSingle({ run: { ...seed, chapter: ch, ending: null, scene: 'c' + ch + '_intro', battle: null, live: null } }).run : null;
        }
        d.chapterEndings = {};
        for (const ch of [1, 2, 3, 4, 5, 6]) {
            const ids = Array.isArray(obj?.chapterEndings?.[ch]) ? obj.chapterEndings[ch] : [];
            d.chapterEndings[ch] = [...new Set([...ids, ...d.endings.filter(id => ctx.ENDINGS[id].chapter === ch), ...[d.run, ...Object.values(d.slots)].filter(r => r.chapter === ch).map(r => r.ending)].filter(id => ctx.ENDINGS[id] && (ctx.ENDINGS[id].chapter === ch || id === 'shadow' && ch <= 4)))];
        }
        d.endings = ctx.collectedEndingIds(d);
        d.claimed = [...new Set([...d.claimed, ...d.endings])];
        d.completedChapters = [...new Set([...(Array.isArray(obj?.completedChapters) ? obj.completedChapters : []), ...d.endings.map(id => ctx.ENDINGS[id].chapter), ...[d.run, ...Object.values(d.slots)].filter(r => r.ending || r.legacyEnded).map(r => r.chapter)])].filter(ch => [1, 2, 3, 4, 5, 6].includes(ch));
        d.bonds = obj?.bonds || {};
        repairChapterCarry(d);
        if (!chapterUnlocked(d.run.chapter, d)) {
            const old = d.run;
            d.slots[old.chapter] = old;
            const ch = [1, 2, 3, 4, 5, 6].filter(ch => chapterUnlocked(ch, d) && d.slots[ch]).at(-1);
            d.run = d.slots[ch] || freshRun();
            delete d.slots[d.run.chapter];
            if (!d.run.name) {
                d.run.name = old.name;
                d.run.inst = old.inst;
            }
        }
        const first = d.run.chapter === 1 ? d.run : d.slots[1];
        if (first?.name)
            for (const r of [d.run, ...Object.values(d.slots), d.chapter2Start, d.chapter3Start, d.chapter4Start, d.chapter5Start, d.chapter6Start].filter(Boolean)) {
                r.name = first.name;
                r.inst = first.inst;
            }
        syncBonds(d);
        return d;
    }
    function chapterComplete(ch, m = ctx.M()) { return (m.completedChapters || []).includes(ch) || m.endings.some(id => ctx.ENDINGS[id]?.chapter === ch) || [m.run, ...Object.values(m.slots)].some(r => r.chapter === ch && (!!r.ending || r.legacyEnded)); }
    function chapterUnlocked(ch, m = ctx.M()) { return [1, 2, 3, 4, 5, 6].includes(ch) && Array.from({ length: ch - 1 }, (_, i) => i + 1).every(n => chapterComplete(n, m)); }
    // Rebase old direct-experience saves once, preserving gains/losses earned in that chapter.
    function repairChapterCarry(m) {
        for (const r of [m.run, ...Object.values(m.slots), ...Array.from({ length: 5 }, (_, i) => m['chapter' + (i + 2) + 'Start'])].filter(Boolean)) {
            delete r.gold;
            delete r.sta;
        }
        for (const ch of [2, 3, 4, 5, 6]) {
            const r = ctx.savedChapter(m, ch), prior = ctx.savedChapter(m, ch - 1);
            if (r?.sourceMode === 'quick' && prior?.name && chapterUnlocked(ch, m)) {
                const key = 'chapter' + ch + 'Start', base = m[key] || quickRun(ch, r.name, r.inst), seed = safeSnapshot(base);
                seed.sourceMode = 'carry';
                seed.name = prior.name;
                seed.inst = prior.inst;
                for (const k of ['tech', 'level']) {
                    r[k] = Math.max(k === 'level' ? 1 : 0, prior[k] + r[k] - base[k]);
                    seed[k] = prior[k];
                }
                seed.aff = { ...prior.aff }; // Global bonds merge historic maxima below; never subtract the old chapter baseline.
                for (const k of ['feihong', 'dijie']) {
                    r.dark[k] = Math.max(0, (prior.dark[k] || 0) + (r.dark[k] || 0) - (base.dark[k] || 0));
                    seed.dark[k] = prior.dark[k] || 0;
                }
                if (ch === 4) {
                    const flags = { ...prior.flags };
                    delete flags.beShiyuan;
                    const currentFlags = r.flags;
                    r.flags = { ...flags, ...currentFlags };
                    seed.flags = { ...flags, ...seed.flags };
                    for (const k of ['qBack', 'qHate', 'qiWatch']) {
                        r.flags[k] = Math.max(0, (flags[k] || 0) + (currentFlags[k] || 0) - (base.flags[k] || 0));
                        seed.flags[k] = flags[k] || 0;
                    }
                }
                r.sourceMode = 'carry';
                m[key] = seed;
                r.rev++;
            }
            ctx.normalizeFourthOpening(r, m);
            ctx.normalizeFourthOpening(m['chapter' + ch + 'Start'], m);
        }
    }
    function previousChapter(ch) { return ctx.R().chapter === ch - 1 ? ctx.R() : ctx.M().slots[ch - 1]; }
    function playerIdentity() { const first = ctx.R().chapter === 1 ? ctx.R() : ctx.M().slots[1]; return first?.name ? first : ctx.R(); }
    function canCarryChapter(ch) { return chapterUnlocked(ch) && !!previousChapter(ch)?.name; }
    function quickRun(ch, name, inst) {
        const r = freshRun();
        Object.assign(r, { chapter: ch, ch, name, inst, week: 1, scene: 'c' + ch + '_intro', sourceMode: 'quick', tech: ch === 4 ? 14 : ch === 3 ? 12 : 10, level: Math.min(ch, 3) });
        r.aff.shiyuan = ch === 4 ? 12 : ch === 3 ? 10 : 8;
        if (ch === 3)
            r.flags.c3Met = 1;
        return r;
    }
    function requestChapter(ch) {
        repairChapterCarry(ctx.M());
        syncBonds();
        if (![1, 2, 3, 4, 5, 6].includes(ch) || ch === ctx.R().chapter)
            return;
        if (!chapterUnlocked(ch)) {
            toast('先完成前面的章节，再继续这段故事。');
            return;
        }
        ctx.suspend();
        if (ctx.M().slots[ch]) {
            const identity = playerIdentity(), target = ctx.M().slots[ch];
            ctx.M().slots[ctx.R().chapter] = safeSnapshot(ctx.R());
            delete ctx.M().slots[ch];
            ctx.M().run = target;
            if (identity.name) {
                ctx.R().name = identity.name;
                ctx.R().inst = identity.inst;
            }
            ctx.changed();
            return;
        }
        if (ch === 1) {
            const identity = playerIdentity();
            ctx.M().slots[ctx.R().chapter] = safeSnapshot(ctx.R());
            ctx.M().run = freshRun();
            ctx.R().name = identity.name;
            ctx.R().inst = identity.inst;
            ctx.changed();
            return;
        }
        if (!canCarryChapter(ch))
            return;
        startChapter(ch, 'carry');
    }
    function startChapter(ch, mode) {
        if (![2, 3, 4, 5, 6].includes(ch) || ctx.R().chapter === ch || ctx.M().slots[ch] || mode !== 'carry' || !canCarryChapter(ch))
            return;
        const prior = previousChapter(ch), identity = playerIdentity();
        if (!identity.name)
            return;
        const r = quickRun(ch, identity.name, identity.inst);
        r.sourceMode = 'carry';
        r.tech = prior.tech;
        r.level = prior.level;
        r.aff = { ...freshRun().aff, ...prior.aff };
        r.dark = { ...prior.dark };
        if (ch >= 4) {
            r.flags = { ...prior.flags };
            delete r.flags.beShiyuan;
        }
        ctx.M().slots[ctx.R().chapter] = safeSnapshot(ctx.R());
        ctx.M().run = r;
        ctx.beginBarChapter();
        ctx.M()['chapter' + ch + 'Start'] = safeSnapshot(r);
        ctx.log('沿用第一章的名字和乐器，承接前章的琴技、等级与羁绊；新一章从第 1 周开始。');
        ctx.reward('c' + ch + '_entry');
        closeModal(false);
        ctx.changed();
        route('chronicle');
    }
    return { freshRun, fresh, isRetiredRun, isRetiredLog, cleanSingle, syncBonds, confirmRestart, restart, sourceSaveDetected, legacy, requestLegacy, safeSnapshot, clean, chapterComplete, chapterUnlocked, repairChapterCarry, previousChapter, playerIdentity, canCarryChapter, quickRun, requestChapter, startChapter };
}
