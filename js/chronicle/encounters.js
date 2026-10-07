'use strict';

// Private Chronicle feature. ctx contains live accessors to sibling features and controller state.
function createChronicleEncounters(ctx) {
    function journalSpeaker(entry, run) {
        // Re-resolve old attribution without replacing saved text, choices or story progress.
        const sample = { ...run, scene: entry.scene, chat: entry.scene === 'chat' ? entry.who : run.chat, battle: { win: /首席空格点了点头|TIM 拍了拍/.test(entry.text) } };
        if (entry.scene === 'c2_kong_c')
            sample.flags = { ...run.flags, konggeStay: entry.text.includes('下不为例') ? 1 : 'weak' };
        const d = ctx.dialogue(sample), voices = d ? [...new Set(d.parts.map(p => p.who))] : [entry.who];
        return voices.map(k => ctx.person(k).name).join(' / ');
    }
    function sceneEncounterIds(run, meta = state?.chronicle) {
        if (!run || run.scene === 'start')
            return [];
        const d = ctx.dialogue(run, meta), ids = d ? d.parts.flatMap(p => mentionedStoryCards(p.text, p.who)) : [];
        if (run.scene.startsWith('practice_'))
            ids.push('kongge');
        if (run.battle?.partner && ['practice_turn', 'practice_result', 'after_practice'].includes(run.scene))
            ids.push(...mentionedStoryCards(run.battle.last || '', run.battle.partner));
        if (run.scene === 'chat_select')
            ids.push('lala');
        if (run.scene === 'live_play')
            ids.push('shiyuan', ...mentionedStoryCards(run.live?.last || ''));
        if (['live_result', 'title2', 'title3', 'title4', 'title5', 'title6', 'title7'].includes(run.scene))
            ids.push('lala', ...mentionedStoryCards(ctx.ENDINGS[run.ending]?.text || ''));
        return ids;
    }
    function legacyEncounterIds(run, meta = state?.chronicle) {
        if (!run || run.scene === 'start')
            return [];
        const ids = [], visit = scene => {
            const sample = { ...run, scene, battle: null };
            if (run.chapter === 5 && scene === 'c5_intro') {
                sample.aff = { ...run.aff, shiyuan: run.ending === 'c5_wind' ? 0 : run.scene === 'c5_intro' ? run.aff.shiyuan : Math.max(80, run.aff.shiyuan || 0) };
            }
            ids.push(...sceneEncounterIds(sample, meta));
        };
        if (run.chapter >= 5) {
            const path = run.chapter === 6 ? ['c6_intro', 'c6_zhu', 'c6_warn', 'c6_menu'] : ['c5_intro', 'c5_rival', 'c5_menu'];
            let i = path.indexOf(run.scene);
            if (i < 0)
                i = run.ending === 'c5_wind' ? 0 : path.length - 1;
            for (let n = 0; n <= i; n++)
                visit(path[n]);
        }
        else if (run.chapter === 4) {
            const path = ['c4_intro', 'c4_prep', 'c4_bao', 'c4_qiqi', 'c4_menu'];
            let i = path.indexOf(run.scene.replace(/_[abc]$/, ''));
            if (i < 0 && (['menu', 'chat', 'chat_select', 'b_live', 'live_intro', 'live_play', 'live_result', 'title5', 'c4_he', 'c4_te', 'c4_fail', 'be_qiqi4', 'be_mianbei'].includes(run.scene) || /^(b4_|c4_band_|c4_jeal|practice_)/.test(run.scene)))
                i = 4;
            for (let n = 0; n <= i; n++)
                visit(path[n]);
        }
        else if (run.chapter === 3) {
            const path = ['c3_intro', 'c3_prep', 'c3_ge', 'c3_bill', 'c3_menu'];
            let i = path.indexOf(run.scene);
            if (/^c3_(prep|ge|bill)_[abc]$/.test(run.scene))
                i = path.indexOf(run.scene.replace(/_[abc]$/, ''));
            if (i < 0 && ['menu', 'chat', 'chat_select', 'b_live', 'live_intro', 'live_play', 'live_result', 'title4', 'c3_he', 'c3_te', 'c3_fail', 'be_qiqi'].includes(run.scene))
                i = 4;
            if (i < 0 && (run.scene.startsWith('band_') || run.scene.startsWith('c3_band') || run.scene.startsWith('practice_') || run.scene.startsWith('c3_jeal')))
                i = 4;
            for (let n = 0; n <= i; n++)
                visit(path[n]);
            if (run.flags?.taIn)
                visit('c3_bill_a');
        }
        else if (run.chapter === 2) {
            const path = ['c2_intro', 'c2_bar', 'c2_tim', 'c2_night_pre', 'c2_night', 'c2_str', 'c2_head', 'c2_kong', 'c2_endweek'];
            let index = path.indexOf(run.scene.replace(/_(a|b|c)$/, ''));
            if (run.scene === 'c2_pop_end' || run.ending === 'c2_street' || run.flags?.popGroup)
                index = 4;
            else if (index < 0 && run.flags?.strGroup)
                index = 8;
            else if (index < 0 && ['c2_dual', 'c2_solo', 'c2_retry'].includes(run.ending))
                index = 8;
            for (let i = 0; i <= index; i++)
                visit(path[i]);
        }
        else {
            const path = ['s_door', 's_room', 's_shi', 's_first', 's_conflict', 's_endweek'];
            let index = path.indexOf(run.scene);
            if (run.scene === 's_look')
                index = 1;
            else if (run.scene === 's_dream')
                index = 2;
            else if (run.scene.startsWith('practice_') || run.scene === 'after_practice')
                index = 3;
            else if (['s_fei1', 's_fei2'].includes(run.scene))
                index = 4;
            else if (['menu', 'chat_select', 'chat', 'gig', 'emo', 'b_live', 'live_intro', 'live_play', 'live_result', 'title2'].includes(run.scene))
                index = 5;
            for (let i = 0; i <= index; i++)
                visit(path[i]);
            if (run.flags?.look)
                visit('s_look');
        }
        return ids;
    }
    function encounterIds(chronicle, recoverLegacy = false) {
        if (!chronicle)
            return [];
        const ids = [], runs = [...Object.values(chronicle.slots || {}), chronicle.run].filter(Boolean).sort((a, b) => a.chapter - b.chapter);
        for (const run of runs) {
            if (recoverLegacy)
                ids.push(...legacyEncounterIds(run, chronicle));
            for (const entry of run.journal || [])
                ids.push(...mentionedStoryCards(entry.text + ' ' + (entry.choice || ''), entry.who));
            ids.push(...sceneEncounterIds(run, chronicle));
        }
        if (recoverLegacy) {
            // A finished chapter proves only its mandatory path, never an optional branch.
            for (const ending of chronicle.endings || []) {
                const ch = ctx.ENDINGS[ending]?.chapter;
                if (ch)
                    ids.push(...legacyEncounterIds({ ...ctx.freshRun(), chapter: ch, scene: 'title' + (ch + 1), ending }, chronicle));
            }
        }
        return [...new Set(ids)].filter(id => CARD_DEFS.some(c => c.id === id));
    }
    function recordReadScene(selected = null) {
        const d = ctx.dialogue();
        if (!d || typeof d.text !== 'string')
            return false;
        const r = ctx.R();
        if (!Array.isArray(r.journal))
            r.journal = [];
        let e = r.journal[r.journal.length - 1];
        if (!e || e.scene !== r.scene || e.week !== r.week || e.text !== d.text.slice(0, 1000)) {
            e = { chapter: r.chapter, week: r.week, scene: r.scene, who: d.who, text: d.text.slice(0, 1000), choice: null };
            r.journal.push(e);
            r.journal = r.journal.slice(-60);
            if (selected)
                e.choice = selected.slice(0, 160);
            return true;
        }
        if (selected && e.choice !== selected.slice(0, 160)) {
            e.choice = selected.slice(0, 160);
            return true;
        }
        return false;
    }
    return { journalSpeaker, sceneEncounterIds, legacyEncounterIds, encounterIds, recordReadScene };
}
