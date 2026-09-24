'use strict';

function createChronicleWeeks(ctx) {
    const optional = {
        2: [{ scene: 'c2_boundary', week: 2, title: 'TIM 的手机', person: 'tim' }],
        3: [{ scene: 'c3_band_q', week: 2, title: '一顿筹备聚餐', person: 'qiqi' }, { scene: 'c3_band_bill', week: 5, title: '陪十元再合一遍', person: 'shiyuan' }],
        4: [{ scene: 'c4_band_lemon', week: 2, title: '柠檬的借款', person: 'lemon' }, { scene: 'c4_band_bao', week: 3, title: '空剧场里练嗓', person: 'baoshi' }]
    };
    const openingWeeks = { 1: [1, 2, 4], 2: [1, 2, 4], 3: [1, 2, 4, 5], 4: [1, 2, 3, 5], 5: [1, 2], 6: [1, 2] };
    // Most authored scenes run continuously before training. Late events retain their timing.
    const front = {1:[1,2,3,4],2:[1,2,3,4],3:[1,2,3],4:[1,2,3,4],5:[1,2,3,4],6:[1,2,3,4]};
    function freshWeeks() { return { version: 2, done: [], active: 1, side: [], recaps: {}, approach: null, training: {}, trainingWeek: 1 }; }
    function weekPlan(r = ctx.R(), week = r.week) {
        return week >= 6 ? {title:ctx.stageName(r),description:'带着练习与选择，走上正式舞台。'} : ChronicleTraining[r.chapter][Math.max(0,week-1)];
    }
    function sceneWeek(scene, r) {
        const direct = ChronicleWeeks[r.chapter].findIndex(p => p.scene === scene);
        if (direct >= 0) return direct + 1;
        if (['start', 'zhu_offer', 'zhu_reply', 'shanqiu_closed'].includes(scene)) return 1;
        if (r.chapter === 1) {
            if (/^s_(door|room|look|shi|dream)$/.test(scene)) return 1;
            if (scene === 'after_practice' || scene.startsWith('practice_') && r.battle?.context !== 'weekly') return 2;
            if (/^s_(fei|endweek)/.test(scene)) return 4;
        }
        const prefixes = { 2: [['c2_tim', 1], ['c2_night', 1], ['c2_bar', 1], ['c2_str', 1], ['c2_head', 2], ['c2_kong', 4], ['c2_endweek', 4]], 3: [['c3_prep', 2], ['band_zhou', 3], ['c3_ge', 4], ['c3_bill', 5], ['c3_menu', 5]], 4: [['c4_prep', 2], ['c4_bao', 3], ['b4_zhou', 4], ['c4_qiqi', 5], ['c4_menu', 5]], 5: [['c5_menu', 2]], 6: [['c6_warn', 2], ['c6_menu', 2]] };
        return (prefixes[r.chapter] || []).find(([prefix]) => scene.startsWith(prefix))?.[1] || 0;
    }
    function cleanWeeks(saved, r) {
        const w = freshWeeks(), valid = n => Number.isInteger(n) && n >= 1 && n <= 5;
        if ([1,2].includes(saved?.version)) {
            w.done = [...new Set((Array.isArray(saved.done) ? saved.done : []).filter(valid))];
            w.active = valid(saved.active) && !w.done.includes(saved.active) ? saved.active : 0;
            w.side = [...new Set((Array.isArray(saved.side) ? saved.side : []).filter(s => (optional[r.chapter] || []).some(e => e.scene === s)))];
            for (const n of w.done) w.recaps[n] = ctx.str(saved.recaps?.[n], 420) || '这段故事已记录。';
            w.approach = [0,1].includes(saved.approach) ? saved.approach : null;
            w.trainingWeek = valid(saved.trainingWeek) ? saved.trainingWeek : Math.min(5,r.week);
            for (let n=1;n<=5;n++) {
                const t = saved.training?.[n];
                if (t && typeof t === 'object') w.training[n] = ctx.cleanTraining(t);
            }
            return w;
        }
        const at = sceneWeek(r.scene, r);
        w.active = at && at < 6 ? at : 0;
        // Old uninterrupted runs already read the opening chain. Never rewind their week or scene.
        const afterOpening = !at && !['start','zhu_offer','zhu_reply'].includes(r.scene);
        w.done = [...new Set([...Array.from({length:Math.min(5,r.week-1)},(_,i)=>i+1), ...(afterOpening ? openingWeeks[r.chapter] : [])])].filter(n=>n!==w.active);
        for (const entry of r.journal) {
            if (!entry.choice) continue;
            const n = ChronicleWeeks[r.chapter].findIndex(p=>p.scene===entry.scene)+1;
            if (valid(n) && n!==w.active && !w.done.includes(n)) w.done.push(n);
            if ((optional[r.chapter]||[]).some(e=>e.scene===entry.scene)) w.side.push(entry.scene);
        }
        for (const n of w.done) w.recaps[n]='旧存档中的故事与选择已保留。';
        return w;
    }
    function pendingStory(r = ctx.R()) {
        return front[r.chapter].find(n=>!r.weekly.done.includes(n)) ||
            [1,2,3,4,5].find(n=>!front[r.chapter].includes(n) && n<=r.week && !r.weekly.done.includes(n)) || 0;
    }
    function completeWeek() {
        const r=ctx.R(), w=r.weekly, n=w.active;
        if (!n || w.done.includes(n)) return;
        w.done.push(n); w.active=0;
        w.recaps[n]=r.journal.filter(e=>e.choice).slice(-2).map(e=>e.choice).join(' → ') || '这段故事已记录。';
        ctx.log('剧情已记录：'+ChronicleWeeks[r.chapter][n-1].title+'。');
    }
    function storyTransition(next) {
        const r=ctx.R();
        if (!r.weekly || r.weekly.version!==2) r.weekly=cleanWeeks(r.weekly,r);
        if (r.ending) {r.weekly.active=0;r.scene=next;return;}
        if (next==='menu' && /^c[34]_jeal_[abc]$/.test(r.scene)) {
            r.scene='menu'; if(pendingStory(r) || r.week>=6) enterWeekStory(); return;
        }
        // Free activities and previously completed story replays follow their own dialogue.
        if (!r.weekly.active) {r.scene=next;return;}
        const n=ChronicleWeeks[r.chapter].findIndex(p=>p.scene===next)+1;
        if (next==='menu' || n && n!==r.weekly.active) completeWeek();
        if (n && n<6 && (front[r.chapter].includes(n) || n<=r.week) && !r.weekly.done.includes(n)) {
            r.weekly.active=n; r.scene=next;
        } else if (next==='menu' || n) {
            r.scene='menu';
            if (pendingStory(r)) enterWeekStory();
        } else r.scene=next;
    }
    function enterWeekStory() {
        const r=ctx.R();
        if (r.scene!=='menu' || r.ending) return;
        const n=pendingStory(r);
        if (n) {r.weekly.active=n;r.scene=ChronicleWeeks[r.chapter][n-1].scene;}
        else if (r.week>=6) r.scene='b_live';
        else return;
        return true;
    }
    function startWeekStory() {if (enterWeekStory()) ctx.changed();}
    function sideEvents() {
        const r = ctx.R();
        return (optional[r.chapter] || []).filter(e => r.week >= e.week && cardOwned(ctx.PEOPLE[e.person].card));
    }
    function startSide(scene) {
        const r = ctx.R();
        if (r.scene !== 'menu' || r.ending || !sideEvents().some(e => e.scene === scene) || r.weekly.side.includes(scene)) return;
        r.weekly.side.push(scene);
        r.scene = scene;
        ctx.changed();
    }
    function weeklyDialogue(r = ctx.R()) {
        const musical = r.chapter === 6;
        if (r.scene === 'weekly_prep') {
            const options = musical ? ['先连一遍进场与换幕', '先合最后一幕与谢幕'] : ['先核对每首歌的起拍', '先走一遍转场与返场'];
            return ctx.D('lala', musical ? '最后一次连排，垃垃把《拾光》的谱页铺在桌上。朱老师还在侧台试音，大家等着同一个开始的信号。\n「今天先把最担心的一段接起来吧。你想从哪里开始？」' : '出发前，垃垃把节目单摊在琴盒上。台上的音乐之外，还有进场、换曲和返场时的衔接。\n「这些地方平时容易略过去。今天你想先和大家确认哪一段？」', ...options.map((text, i) => ctx.choice(text, 'weekly_reply', () => { r.weekly.approach = i; })));
        }
        if (r.scene === 'weekly_reply') {
            const lines = musical ? ['你在谱页上圈出换幕的位置。大家约好先看侧台的手势，再一起入场；朱老师把最后一处提示写进了总谱。', '你陪大家从最后一幕合起，等尾音落稳再转身谢幕。垃垃在手记里添了一行：「最后一拍，也要一起。」'] : ['你逐首确认起拍的人与信号。十元抬起琴弓，大家等同一次呼吸再进来；节目单上的问号被一个个划掉。', '你们把换曲和返场走了一遍，约好谁留在台前、谁递出下一份谱。散场时，大家终于能把注意力放回音乐本身。'];
            return ctx.D('narrator', lines[r.weekly.approach ?? 0] + '\n\n这次安排已记入本周手记。剩下的时间，可以自由练琴或陪伴伙伴。', ctx.choice('收好节目单，准备出发', 'menu'));
        }
        return null;
    }
    function weekStoryHTML() {
        const r=ctx.R(), n=pendingStory(r);
        return (n ? `<section class="cp-week-story"><span class="cp-week-kicker">${front[r.chapter].includes(n)?'章节剧情':'排练间隙的故事'}</span><h3>${ctx.E(ChronicleWeeks[r.chapter][n-1].title)}</h3><p>接着上次的选择读下去，完整经历这一段故事。</p>${ctx.actionButton('week-story','继续故事','arrow','primary')}</section>` : '') + ctx.trainingHubHTML();
    }
    function sideStoriesHTML() {
        const events = sideEvents();
        if (!events.length) return '';
        return `<section class="cp-week-sides"><h4>排练间隙 · 可选相遇</h4><div>${events.map(e => { const done = ctx.R().weekly.side.includes(e.scene); return ctx.actionButton('week-side', ctx.E(e.title) + (done ? ' · 已记录' : ''), done ? 'check' : 'heart', 'ghost', `data-cp-event="${e.scene}" ${done ? 'disabled' : ''}`); }).join('')}</div><p class="cp-caption">这些相遇可以晚些再看，不影响进入下一周。</p></section>`;
    }
    function illustrationHTML() {
        const art = chronicleSceneArt(ctx.R());
        return art ? `<figure class="cp-story-art"><img src="${ASSETS[art.asset]}" alt="${ctx.E(art.text)}" decoding="async"><figcaption>${ctx.E(art.location)}</figcaption></figure>` : '';
    }
    function weeklyHelp() { return '<p>先连贯阅读章节剧情，再进入五周训练与相处；临近演出的事件按时出现，第六周登台。每周一种训练：跟拍、记旋律、找错拍、接奏和彩排。首次报名 10 音符，完成训练琴技 +2，优秀额外 +1；失败、中断可免费继续，每章每项只奖励一次。普通加练仍为 10 音符 / 琴技 +2。已开放的训练可在演出前补练。摸底失败不阻断剧情；不足的琴技会在训练页明确提示。</p>'; }
    return {freshWeeks,cleanWeeks,weekPlan,pendingStory,storyTransition,enterWeekStory,startWeekStory,sideEvents,startSide,weeklyDialogue,weekStoryHTML,sideStoriesHTML,illustrationHTML,weeklyHelp};
}
