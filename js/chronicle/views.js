'use strict';

// Private Chronicle feature. ctx contains live accessors to sibling features and controller state.
function createChronicleViews(ctx) {
    function speaker(who, label = '剧情进行中') {
        const p = ctx.person(who);
        return `<div class="cp-speaker" data-speaker="${ctx.E(who)}">${p.asset ? `<img src="${ASSETS[p.asset]}" alt="${p.name}的虚拟插画">` : `<span class="cp-speaker-symbol">${I(p.icon)}</span>`}<div><b>${ctx.E(p.name)}</b><small>${ctx.E(p.tag)}</small></div><span class="cp-scene-label">${ctx.E(label)}</span></div>`;
    }
    function sceneIntroHTML(copy) { return copy; }
    function dialogueHTML(d, label) {
        return d.parts.map((p, i) => `<section class="cp-dialogue-turn">${speaker(p.who, i ? '接着说' : label)}<div class="cp-text">${ctx.E(p.text.trim())}</div></section>`).join('');
    }
    function sceneFrameHTML(content) {
        const r = ctx.R(), art = chronicleSceneArt(r);
        const title = art?.title || ctx.weekPlan().title;
        const location = art?.location || ctx.chapterName();
        return `<article class="cp-novel ${art ? 'cp-novel-illustrated' : 'cp-novel-text-only'}" aria-label="正传故事" ${art ? `style="--scene-art:url('${new URL(ASSETS[art.asset], document.baseURI).href}')"` : ''}>
          <header class="cp-novel-top"><span>第 ${r.chapter} 章 · 第 ${r.week} 周</span><span>${ctx.E(location)}</span><div class="cp-novel-progress" aria-label="第 ${r.week} 周，共六周">${Array.from({length: 6}, (_, i) => `<i class="${i < r.week ? 'past' : ''}"></i>`).join('')}</div></header>
          <div class="cp-novel-body">
          ${art ? `<div class="cp-novel-visual"><div class="cp-novel-heading"><h3>${ctx.E(title)}</h3><button class="cp-memory-link" data-memory="${art.id}">${I('album')}已收入回忆 · 查看</button></div><figure class="cp-story-art cp-novel-art"><button data-memory="${art.id}" aria-label="查看回忆：${ctx.E(title)}"><img src="${ASSETS[art.asset]}" alt="${ctx.E(art.text)}" decoding="async"></button><figcaption>${ctx.E(location)}</figcaption></figure></div>` : ''}
          <div class="cp-novel-dialogue">${content}</div>
          </div>
        </article>`;
    }

    function actionButton(action, text, icon = 'arrow', cls = '', extra = '') {
        return `<button class="btn ${cls || 'secondary'}" data-cp-action="${action}" data-cp-rev="${ctx.R().rev}" ${extra}>${I(icon)}${text}</button>`;
    }
    function choicesHTML(d) { return `<div class="cp-choices">${d.choices.map((c, i) => `<button class="cp-choice" data-cp-choice="${i}" data-cp-rev="${ctx.R().rev}" ${c.disabled ? 'disabled' : ''}><span class="cp-option-n">${String(i + 1).padStart(2, '0')}</span><span>${ctx.E(c.text)}</span>${I('arrow')}</button>`).join('')}</div>`; }
    function startHTML() { return `<div class="cp-surface">${sceneIntroHTML(`${speaker('旁白', 'CHAPTER 01 · PROLOGUE')}<div class="cp-text">「哈基米乐团」——在山丘酒吧排练的成人兴趣乐团。\n今晚，是新人招募的日子。\n\n你就是那个推门而入的人。</div>`)}<div class="cp-form"><label for="cpName">写下你的名字</label><input id="cpName" class="text-input" maxlength="10" autocomplete="nickname" placeholder="大家怎么称呼你？" value="${ctx.E(ctx.R().name || (state.nickname === '乐团新人' ? '' : state.nickname).slice(0, 10))}"><label>带上你的乐器</label><div class="cp-instruments">${['弦乐', '管乐', '打击乐', '键盘 / 其他'].map(inst => `<button class="cp-inst ${ctx.selectedInstrument === inst ? 'selected' : ''}" data-cp-instrument="${inst}" aria-pressed="${ctx.selectedInstrument === inst}">${inst}</button>`).join('')}</div><label for="cpInstrument">自定义乐器 <span class="tiny">（可选，填写后优先使用）</span></label><input id="cpInstrument" class="text-input" maxlength="20" placeholder="例如：长笛、小提琴、钢琴" value="${ctx.E(ctx.R().inst)}"><div class="cp-input-error" id="cpInputError" role="status"></div>${actionButton('enroll', '推门，加入乐团', 'arrow', 'primary')}<div class="cp-rule-note">${I('album')}正传与卡册共用角色羁绊分，琴技按章节记录，音符全局共用。放心开启新的入团故事，原来的陪伴还在。完成章节里程碑，可获得卡册音符、邀请券和回忆；剧情中提到人物时，会自动获得对应人物卡。</div></div></div>`; }
    function weekAdvanceHTML() {
        const r = ctx.R(), left = Math.max(0, 6 - r.week), advanced = ctx.weekNotice?.run === r && ctx.weekNotice.to === r.week;
        return `<section class="cp-week-advance" aria-label="演出周进度"><div class="cp-week-progress-copy"><span class="cp-week-kicker">${left ? '本章日程 · 每周一种训练' : '演出周已到达'}</span><strong>${ctx.stageName()}</strong><span class="cp-week-count">${left ? `还有 <b>${left}</b> 周` : '现在可以继续剧情'}</span></div><ol class="cp-week-track" aria-label="当前第 ${r.week} 周">${Array.from({ length: 6 }, (_, i) => `<li class="${r.week === i + 1 ? 'current' : r.week > i + 1 ? 'done' : ''}" ${r.week === i + 1 ? 'aria-current="step"' : ''}><span></span>第 ${i + 1} 周<small>${ctx.E(ctx.weekPlan(r, i + 1).title)}</small></li>`).join('')}</ol><div class="cp-week-end"><div class="cp-week-message" role="status" aria-live="polite" aria-atomic="true"><strong>${advanced ? `${I('check')}已从第 ${ctx.weekNotice.from} 周进入第 ${r.week} 周` : `当前是第 ${r.week} 周`}</strong><p>${left ? (!ctx.pendingStory(r) ? '训练可以按需完成，也可以先进入下一周；已开放的项目随时可补练。' : '先读完待续的章节故事，再进入下一周；可选相遇不必全部完成。') : '演出剧情已开启，准备好后即可继续。'}</p></div>${left ? actionButton('end-week', r.week === 5 ? '进入第 6 周剧情' : '前往第 ' + (r.week + 1) + ' 周', 'arrow', 'primary', !ctx.pendingStory(r) ? '' : 'disabled') : actionButton('to-live', '继续演出剧情', 'music', 'primary')}</div></section>`;
    }
    function weeklyHTML() {
        const r = ctx.R();
        return `<div class="cp-surface"><div class="cp-overline" style="color:#a38b64">WEEK ${String(r.week).padStart(2, '0')} · YOUR REHEARSAL DAYS</div>${ctx.weekStoryHTML()}${ctx.sideStoriesHTML()}<h4 class="cp-free-time-title">自由安排</h4><div class="cp-actions-grid">${[
            ['practice', 'violin', '刻苦练琴', '10 音符 · 琴技 +2', state.coins < 10], ['ensemble', 'team', '空格的阶段验收', '免费检验合奏 · 不加琴技 · 失败也能继续', false], ['social', 'heart', '找人聊天', '每日陪伴 +1 · 也听听其他声部', false], ['earn', 'music', '演奏赚音符', '免费演奏 · 达到 C 可获得音符', false]
        ].map(([action, icon, title, sub, disabled]) => `<button class="cp-action-card" data-cp-action="${action}" data-cp-rev="${r.rev}" ${disabled ? 'disabled' : ''}>${I(icon)}<strong>${title}</strong><small>${sub}</small></button>`).join('')}</div>${weekAdvanceHTML()}<div class="cp-rule-note">${I('help')}先读连贯的章节故事，再逐周训练。训练、聊天不自动推进时间；第 6 周进入演出剧情，琴技达到 ${ctx.requiredTech()} 后可以上台。</div></div>`;
    }
    function socialHTML() { return `<div class="cp-surface">${speaker('lala', '周常 · 找人聊天')}<div class="cp-text">今晚，想听听谁的故事？</div><div class="cp-partners">${ctx.PERSON_IDS.filter(ctx.canChat).map(k => partnerHTML(k, 'chat')).join('')}</div><p class="cp-caption">首席空格专注技术考核，不参加日常聊天。飞鸿的聊天在乐团 Lv.2 开放。</p><div style="margin-top:18px">${actionButton('menu', '先回本周安排', 'back', 'ghost')}</div></div>`; }
    function partnerHTML(k, action) { const p = ctx.person(k); return `<button class="cp-partner" data-cp-action="${action}" data-cp-person="${k}" data-cp-rev="${ctx.R().rev}">${p.asset ? `<img src="${ASSETS[p.asset]}" alt="${p.name}的虚拟插画">` : `<span class="cp-partner-symbol">${I(p.icon)}</span>`}<span><strong>${p.name}</strong><small>${action === 'partner' ? '搭档' : '正传'}羁绊 ${ctx.R().aff[k] || 0}${action === 'chat' ? ' · 今日陪伴最多 +1' : ''}</small></span></button>`; }
    function practiceHTML() {
        const r = ctx.R(), b = r.battle;
        if (r.scene === 'practice_partner' || !b?.partner) {
            return `<div class="cp-surface">${sceneIntroHTML(`${speaker('kongge', '练习对决 · 选择搭档')}<h3>首席空格的${r.battle?.context === 'weekly' ? '阶段验收' : '入团摸底'}</h3><div class="cp-text">曲目《欢乐颂》难度 12。\n选择一位搭档，与你一起把这一段合上。</div>`)}<div class="cp-partners">${['lala', 'azhe', 'shiyuan', 'tim', 'yeshiyang', 'feihong', 'dijie'].map(k => partnerHTML(k, 'partner')).join('')}</div><div class="cp-rule-note">${I('team')}正传原有搭档保留，并新增 TIM、叶思阳、垃垃；不需要先抽到对应卡牌。这里使用<strong>全局羁绊分</strong>，与卡册同步。羁绊达到 3 后，搭档合奏得分更高。</div></div>`;
        }
        if (r.scene === 'practice_result') {
            return `<div class="cp-surface">${speaker('kongge', b.context === 'intro' ? '入团摸底 · 结果已记录' : '阶段验收 · 结果已记录')}<div class="cp-battle-result">${b.win ? 'PASSED' : 'TRY AGAIN'}</div><div class="cp-text">${b.win ? '（合上谱子）「合格。下周还来。」' : '「……回家把这几小节练二十遍。」\n考核失败，但路还长。'}</div><div class="cp-reward">${b.win ? '考核通过：乐团等级 +1；每日首次通过 +3 音符，不增加琴技。' : '这次没有考核奖励。摸底失败也能继续剧情，随后通过每周训练提高琴技。'}<br>当前琴技 ${r.tech} · 音符 ${state.coins} · 乐团 Lv.${r.level}</div>${actionButton('practice-continue', b.context === 'intro' ? '摸底结束，继续故事' : '回安排，训练提高琴技', 'arrow', 'primary')}<p class="cp-caption">结果已结算；刷新或返回页面不会重复领取奖励。</p></div>`;
        }
        const bond = r.aff[b.partner] || 0;
        return `<div class="cp-surface">${speaker(b.partner, '《欢乐颂》 · 合练对决')}<div class="cp-battle-board"><div class="cp-battle-top"><span>首席空格的考核 · 难度 12</span><span>ROUND ${String(b.round).padStart(2, '0')}</span></div><div class="cp-battle-pair"><div><small>我方状态</small><strong>${b.hp}</strong><div class="progress-track"><div class="progress-fill" style="width:${clamp(b.hp / b.maxHp * 100, 0, 100)}%"></div></div></div><span class="cp-versus">vs</span><div class="cp-pressure"><small>对面压力</small><strong>${b.pressure}</strong><div class="progress-track"><div class="progress-fill" style="width:${clamp(b.pressure / 14 * 100, 0, 100)}%"></div></div></div></div><div class="cp-battle-last">${ctx.E(b.last || '首席举起笔，准备记下你们的第一句。')}</div></div><div class="cp-choices">${[
            ['stable', '稳扎稳打', '稳定得分 3–5，免费参与'], ['risk', '全情投入', '50% 得分 8–11；50% 只得 1 分'], ['duet', ctx.person(b.partner).name + '合奏', `免费合奏 · ${bond >= 3 ? '预计得分 ' + (6 + bond) + '–' + (8 + bond) : '羁绊不足 3，本次得分 2'}`]
        ].map(([a, t, s], i) => `<button class="cp-choice" data-cp-action="battle" data-cp-battle="${a}" data-cp-rev="${r.rev}" ><span class="cp-option-n">0${i + 1}</span><span>${t}<small>${s}</small></span>${I(a === 'duet' ? 'team' : 'music')}</button>`).join('')}</div><p class="cp-caption">每回合对方消耗我方 2–5 状态。两方同时归零时，按附件规则判为考核失败。中途离开会保留当前回合。</p></div>`;
    }
    function liveResultHTML() {
        if (ctx.R().chapter >= 5)
            return ctx.lateTitleHTML();
        if (ctx.isFour())
            return ctx.fourthTitleHTML();
        if (ctx.isThree())
            return ctx.thirdTitleHTML();
        if (ctx.isTwo())
            return ctx.secondResultHTML();
        const r = ctx.R(), l = r.live, e = ctx.ENDINGS[r.ending];
        let t = r.ending === 'debut' ? '演出成功！商场经理当场递来合约——哈基米乐团，迈出了商业化的第一步！' : '演出平平，台下只响起礼貌的掌声。十元却说：「没关系，下次一定行！」';
        if (r.aff.feihong >= 5 && !r.flags.feiSide)
            t += '\n\n（飞鸿在散场时远远对你笑了。）';
        if (r.dark.feihong >= 2)
            t += '\n\n（……但飞鸿的眼神，有什么东西不一样了。）';
        return `<div class="cp-surface">${speaker(r.ending === 'debut' ? 'narrator' : 'shiyuan', '第一章 · 落幕')}<div class="cp-ending-hero"><div class="cp-overline">${e?.code || 'CHAPTER ONE'}</div><h3>${e?.title || '第一章结束'}</h3><div class="cp-battle-result" style="padding:8px">${l?.score ?? '—'} <span style="font-size:19px">/ ${l?.diff ?? '—'}</span></div><p class="cp-result-note">${l?.scores.map((s, i) => '第 ' + (i + 1) + ' 段 +' + s).join(' · ') || '旧存档未记录逐段得分'}</p></div><div class="cp-text">${ctx.E(t)}</div><div class="cp-reward">剧情中相遇的伙伴已加入卡册。结局与奖励已保存，重玩不重复领取。<br>每章首次完成：音符 +15 · 邀请券 +1；其他结局只收藏回忆 · 专属回忆</div>${actionButton('chapter-finish', '—— 第一章 · 完 ——', 'album', 'primary')}</div>`;
    }
    function titleHTML() {
        if (ctx.R().chapter >= 5)
            return ctx.lateTitleHTML();
        if (ctx.isFour())
            return ctx.fourthTitleHTML();
        if (ctx.isThree())
            return ctx.thirdTitleHTML();
        if (ctx.isTwo())
            return ctx.secondTitleHTML();
        const r = ctx.R(), e = ctx.ENDINGS[r.ending];
        return `<div class="cp-surface"><div class="cp-ending-hero">${I(e?.icon || 'album')}<div class="cp-overline">${e?.code || 'CHAPTER ONE · COMPLETE'}</div><h3>${e?.title || '第一章 · 已结束'}</h3><p class="cp-caption">${e ? ctx.E(e.text) : '这份旧版存档停留在结局页，没有保存完整演出结果。可以开启新周目继续体验。'}</p><p class="cp-caption">已相遇 ${state.cards.encounters.length} 位伙伴<br>第 ${r.week} 周 · 琴技 ${r.tech} · 乐团 Lv.${r.level}<br>本存档已收录 ${ctx.M().endings.length} / ${Object.keys(ctx.ENDINGS).length} 种结局</p></div><div class="cp-choices">${e ? `<button class="cp-choice gold" data-memory="${e.memory}"><span class="cp-option-n">01</span><span>去相册，重看这次落幕</span>${I('album')}</button>` : ''}${`<button class="cp-choice" data-cp-action="restart" data-cp-rev="${r.rev}"><span class="cp-option-n">${e ? '02' : '01'}</span><span>再来一周目<small>只重开正传，保留卡牌养成、结局图鉴与已领取奖励记录</small></span>${I('repeat')}</button>`}<button class="cp-choice" data-route="cards"><span class="cp-option-n">${e ? '03' : '02'}</span><span>回乐团卡册，继续陪伴伙伴</span>${I('cards')}</button></div><div class="cp-teaser"><strong>第二章 · 暗涌 <span class="label-tag">已开放</span></strong>山丘酒吧 / 哈基米之夜 / TIM 与阿喆 / 空格去留 / 独立路演。<br><button class="btn primary" style="margin-top:14px" data-cp-action="switch-chapter" data-cp-chapter="2">继续第二章 ${I('arrow')}</button></div></div>`;
    }
    function mainHTML() {
        const r = ctx.R();
        if (r.scene === 'training') return ctx.trainingHTML();
        if (r.scene === 'zhu_offer')
            return sceneFrameHTML(ctx.barMenuHTML());
        if (r.scene === 'shanqiu_closed')
            return `<div class="cp-surface">${ctx.closedBarHTML()}${actionButton('bar-continue', '带着这段回忆，继续第四章', 'arrow', 'primary')}</div>`;
        if (r.scene === 'start')
            return sceneFrameHTML(startHTML());
        if (r.scene === 'menu')
            return weeklyHTML();
        if (r.scene === 'chat_select')
            return socialHTML();
        if (r.scene.startsWith('practice_'))
            return r.scene === 'practice_partner' ? sceneFrameHTML(practiceHTML()) : practiceHTML();
        if (r.scene === 'live_play')
            return ctx.liveHTML();
        if (r.scene === 'live_result')
            return liveResultHTML();
        if (r.scene === 'title2' || r.scene === 'title3' || r.scene === 'title4' || r.scene === 'title5' || r.scene === 'title6' || r.scene === 'title7')
            return titleHTML();
        const d = ctx.dialogue();
        return d ? sceneFrameHTML(`<div id="cpStoryText">${dialogueHTML(d, r.scene.startsWith('be_') ? '结局已收录' : '第 ' + r.week + ' 周 · 正传')}</div>${choicesHTML(d)}${r.scene === 'b_live' && r.tech < ctx.requiredTech() ? `<div class="cp-training-gate">距离上台还差 <b>${ctx.requiredTech()-r.tech}</b> 琴技。训练完成 +2，优秀 +3；已报名项目免费继续。${actionButton('menu','去补练，查看训练项目','music','primary')}</div>` : ''}${r.chapter === 6 && ['b_live', 'c6_warn'].includes(r.scene) ? '<button class="btn secondary small cp-end-gate" data-cp-action="gallery">查看前期 HE 明细 →</button>' : ''}${r.scene === 'c2_night' ? '<p class="cp-caption">本章关键分支：弦乐组继续路演主线，流行组进入独立分支结局。可通过重开本章体验另一条路。</p>' : ''}${r.scene === 'c2_endweek' ? `<div class="cp-transfer-note">${ctx.secondProgress()} · 当前十元羁绊分 ${r.aff.shiyuan}</div>` : ''}${r.scene === 's_endweek' ? '<p class="cp-caption">这段排练已告一段落，回到本周安排可查看记录与下周预告。</p>' : ''}`) : `<div class="cp-surface"><h3>整理好谱页，再继续。</h3>${actionButton('menu', '回本周安排', 'back', 'primary')}</div>`;
    }
    function phaseText() {
        const r = ctx.R();
        if (r.ending || ['title2', 'title3', 'title4', 'title5', 'title6', 'title7'].includes(r.scene))
            return ctx.chapterName().split(' · ')[0] + '已落幕';
        if (r.scene.startsWith('live') || r.scene === 'b_live')
            return ctx.stageName();
        if (r.scene.startsWith('practice'))
            return '合练考核';
        if (['menu', 'chat_select', 'chat', 'gig', 'emo', 'c2_sponsor', 'c2_boundary', 'c2_bill'].includes(r.scene))
            return '自由周常';
        return r.chapter === 6 ? '《拾光》筹备' : r.chapter === 5 ? '音乐节筹备' : ctx.isFour() ? '剧场冲刺排练' : ctx.isThree() ? '星光530筹备' : ctx.isTwo() ? '哈基米之夜' : '入团初见';
    }
    function hudHTML() { const r = ctx.R(); return `<div class="cp-hud"><div><small>${I('stats')}正传琴技</small><strong>${r.tech}</strong></div><div><small>${I('music')}音符</small><strong>${state.coins}</strong></div><div><small>${I('team')}乐团等级</small><strong>${r.level}</strong></div></div>`; }
    function sidebarHTML() { const r = ctx.R(); return `<aside class="cp-sidebar"><section class="cp-sidepanel cp-goal"><h3>${I('crown')}${ctx.chapterName().split(' · ')[0]}目标</h3><div class="cp-goal-big">${Math.min(r.tech, ctx.requiredTech())} <small>/ ${ctx.requiredTech()} 琴技</small></div><p class="cp-goal-sub">第 6 周，赢下${ctx.stageName()}。<br>${r.chapter === 6 ? '前期演出 HE 与陪伴，都是开幕的底气。' : r.chapter === 5 ? '把本领练稳，再去回应她的心意。' : ctx.isFour() ? '把独奏与和声，一起带到灯光下。' : ctx.isThree() ? '筹备专场，也照顾身边的声音。' : ctx.isTwo() ? '选择自己的方向，找到合奏的支点。' : '音准之外，别忘了同伴。'}</p><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, r.tech / ctx.requiredTech() * 100)}%"></div></div><div class="cp-milestones">${(r.chapter >= 5 ? ctx.lateMilestones(r) : ctx.isFour() ? [[!!(r.flags.yangSolo || r.flags.yangCompromise || r.journal.some(e => e.scene === 'c4_prep' && e.choice)), '确认剧场节目单'], [!!r.flags.baoOK, '完成主唱与和声安排'], [r.week >= 6, '走到第 6 周的剧场'], [!!r.ending, '完成这一章的旅程']] : ctx.isThree() ? [[!!r.flags.c3Met, '星光530筹备启程'], [!!(r.flags.taIn || r.flags.billWait), '作出鼓位选择'], [r.week >= 6, '走到第 6 周的专场'], [!!r.ending, '完成这一章的旅程']] : ctx.isTwo() ? [[!!(r.flags.strGroup || r.flags.popGroup), '完成哈基米之夜分组'], [r.flags.konggeStay === 1, ctx.secondProgress()], [r.week >= 6, '走到第 6 周的独立路演'], [!!r.ending, '完成本章旅程']] : [[!['start', 's_door', 's_room', 's_look', 's_shi', 's_dream'].includes(r.scene), '带上乐器，完成入团初见'], [!!r.flags.practiceWin, '通过首席空格的考核'], [r.week >= 6, '走到第 6 周的商场舞台'], [r.ending === 'debut', '赢下第一场快闪演出']]).map(([done, t]) => `<span class="${done ? 'complete' : ''}">${I(done ? 'check' : 'music')}${t}</span>`).join('')}</div><p class="cp-caption">练琴和投喂共用音符。练琴消耗 10 音符，琴技 +2；余额不足可先免费演奏。</p></section><section class="cp-sidepanel"><h3>${I('heart')}全局羁绊分</h3><div class="cp-relations">${ctx.PERSON_IDS.map(k => { const p = ctx.person(k), val = r.aff[k] || 0; return `<div class="cp-relation">${p.asset ? `<img src="${ASSETS[p.asset]}" alt="${p.name}的虚拟头像">` : `<span class="cp-relation-icon">${I(p.icon)}</span>`}<div class="cp-relation-copy"><div><span>${p.name}</span><b>${val}</b></div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, val)}%"></div></div></div></div>`; }).join('')}</div><div class="cp-dark-chips"><span>飞鸿黑化 ${r.dark.feihong}</span><span>笛杰黑化 ${r.dark.dijie}</span></div></section><section class="cp-sidepanel cp-side-shortcuts"><h3>${I('album')}这一章，留给你的纪念</h3><p class="cp-caption" style="margin-top:0">已收录 ${chapterEndingIds(r.chapter).length} / ${ctx.endingKeys().length} 种本章结局。首次入团、首次考核合格与首次结局奖励都会存进卡册。</p><div style="margin-top:12px">${actionButton('gallery', '打开结局图鉴', 'album', 'secondary small')}</div></section></aside>`; }
    function journalHTML() { const lines = ctx.R().log; return `<details class="cp-log"><summary><span>排练手记 · 最近 ${lines.length} 条</span><span>${lines.length ? '展开记录' : '故事正要开始'}</span></summary><div class="cp-log-list">${lines.length ? lines.slice().reverse().map(l => `<div class="cp-log-entry ${l.warning ? 'warning' : ''}"><small>${ctx.chapterName(l.chapter).split(' · ')[0]} · 第 ${l.week} 周</small><span>${ctx.E(l.text)}</span></div>`).join('') : '这里会记录羁绊、考核与演出的变化。'}</div></details>`; }
    function render() {
        if(ctx.M().personal?.active){$('view-chronicle').innerHTML=chapterTabs()+ctx.personalHTML();return;}
        const r = ctx.R();
        const read = ctx.recordReadScene(), collected = collectChronicleArt(r);
        if (read || collected) save();
        if (collected) $('albumStat').textContent = `${MEMORIES.filter(m => memoryVisible(m.id)).length} / ${MEMORIES.length}`;
        const reading = !!ctx.dialogue() || ['start', 'practice_partner', 'training'].includes(r.scene);
        $('view-chronicle').innerHTML = `<div class="cp-switch"><button class="btn cp-current" data-route="chronicle">${I('album')}乐团正传</button><button class="btn ghost" data-route="story">${I('heart')}心动故事</button><span class="cp-switch-note">连贯故事 · 每周训练 · 一起走上舞台</span></div>${chapterTabs()}${endingOverviewHTML()}<div class="cp-layout ${reading ? 'cp-reading' : ''}"><div class="cp-maincol"><div class="cp-banner ${ctx.R().chapter >= 2 ? 'cp-banner-two' : ''}"><img class="cp-banner-portrait" src="${r.chapter === 6 ? ASSETS.cardZhu : ctx.isTwo() ? ASSETS.cardKongge : ASSETS.cardShiyuan}" alt="${r.chapter === 6 ? '朱老师' : ctx.isTwo() ? '空格' : '十元'}的虚拟立绘"><div class="cp-overline">ORCHESTRA CHRONICLES / CHAPTER ${String(ctx.R().chapter).padStart(2, '0')}</div><h2>${ctx.chapterName().split(' · ')[1]}</h2><p>${r.chapter === 6 ? '从山丘酒吧到剧场舞台，一部《拾光》，写下我们的第一季。<br>陪伴改谱 / 演出积累 / 音乐剧首演。' : r.chapter === 5 ? '夏日音乐节，去最大的户外舞台。<br>音乐节筹备 / 新的对手 / 十元的心意。' : ctx.isFour() ? '6月7日，鹭湖剧院。把每个声部带到灯光下。<br>独奏排练 / 主唱和声 / 赞助选择 / 剧场首演。' : ctx.isThree() ? '从排练室到满场荧光，把每一拍交给舞台。<br>专场筹备 / 幕间的心事 / 530 陶喆专场。' : ctx.isTwo() ? '当熟悉的合奏，走到分岔的路口。<br>山丘酒吧 / 哈基米之夜 / 一场独立路演。' : '从城市角落里的排练室，走向第一场真正的舞台。<br>这一次，你的选择也会改变合奏的方向。'}</p><div class="cp-banner-bottom"><div class="cp-days" aria-label="章节周数">${Array.from({ length: 6 }, (_, i) => `<span class="cp-day ${r.week === i + 1 ? 'active' : r.week > i + 1 ? 'past' : ''}">${i + 1}</span>`).join('')}${r.week > 6 ? `<span class="cp-day active">+${r.week - 6}</span>` : ''}</div><span class="cp-stage-tag">周目 ${ctx.M().runNo} · ${phaseText()}</span></div></div><div class="cp-controls"><div>${actionButton('help', '规则与说明', 'help', 'ghost')}${actionButton('restart', '重开' + ctx.chapterName().split(' · ')[0], 'repeat', 'ghost')}</div><span class="cp-saving"><i></i>章节进度自动保存</span></div>${hudHTML()}${window.StoryBgm?.controls() || ''}<div class="lala-notebook-shortcut">${I('album')}<span>乐团剧情原稿 · 垃垃</span><button class="btn ghost small" data-lala-action="journal">翻开垃垃手记</button></div>${lalaRecapHTML()}<div id="cpMain">${mainHTML()}</div>${journalHTML()}</div>${reading ? `<details class="cp-reader-details"><summary>乐团近况 · 羁绊与章节目标 ${I('arrow')}</summary>${sidebarHTML()}</details>` : sidebarHTML()}</div>`;
    }
    function refresh() {
        const r = ctx.R(), gate = $('chronicleHomeGate');
        if (gate) {
            gate.innerHTML = `<div class="cp-home-copy"><small>乐团编年史 / 六章正传 + 第七章个人线</small><h2>${r.chapter === 6 ? '开幕之夜，让《拾光》照见我们。' : r.chapter === 5 ? '夏天的形状，留给音乐和你。' : ctx.isFour() ? '剧场之夜，把合奏带到灯光下。' : ctx.isThree() ? '星光530，把真心带上舞台。' : ctx.isTwo() ? '山丘之夜，听见合奏的暗涌。' : '第一场演出之后，故事还在继续。'}</h2><p>${r.scene === 'start' ? '入团试炼 / 暗涌 / 星光530 / 剧场之夜 / 夏天的形状 / 开幕之夜' : `${ctx.E(r.name)} · 第 ${r.week} 周 · ${phaseText()} · 琴技 ${r.tech}`}</p></div><div class="cp-home-portraits"><img src="${ASSETS.cardTang}" alt="汤少虚拟立绘"><img src="${ASSETS.cardShiyuan}" alt="十元虚拟立绘"><img src="${ASSETS.cardDijie}" alt="笛杰虚拟立绘"></div><button class="btn" data-route="chronicle">${ctx.M().personal?.active ? '继续个人线' : r.scene === 'start' ? '开启入团试炼' : r.ending ? '查看本章结局' : '继续乐团正传'}${I('arrow')}</button>`;
        }
        if (currentView !== 'chronicle')
            return;
        const signature = [ctx.M().runNo, r.rev, r.scene, r.live?.phase || '', r.ending || '', LalaUI.recap ? 1 : 0, JSON.stringify(state.affinity), state.coins,ctx.M().personal?.active,ctx.M().personal?.rev].join(':');
        if (signature !== ctx.renderSignature || ctx.renderedRun !== r || !$('cpMain')) {
            // Training redraws on input and on asynchronous playback completion.
            // Replacing the DOM drops the browser's scroll anchor (notably on iOS).
            // Restore immediately, before paint; never schedule a later scroll that
            // could override the player's own scrolling or a subsequent navigation.
            const position = !ctx.M().personal?.active && ctx.renderedRun === r &&
                ctx.renderedScene === 'training' && r.scene === 'training' && $('cpMain')
                ? { left: window.scrollX, top: window.scrollY } : null;
            ctx.renderSignature = signature;
            ctx.renderedRun = r;
            ctx.renderedScene = r.scene;
            render();
            if (position) window.scrollTo({ ...position, behavior: 'instant' });
        }
        if(ctx.M().personal?.active){ctx.personalPreview();return;}
        if (r.scene === 'shanqiu_closed' && !r.bar.closureSeen && $('modalBackdrop').hidden)
            ctx.showBarClosure();
        const ending = ctx.ENDINGS[r.ending];
        if (r.scene === 'title' + (r.chapter + 1) && ending && r.previewedEnding !== r.ending && memoryVisible(ending.memory) && $('modalBackdrop').hidden) {
            r.previewedEnding = r.ending;
            save();
            showMemory(ending.memory);
        }
    }
    function endingType(id) { const code = ctx.ENDINGS[id]?.code || ''; return id === 'debut' || code.startsWith('HE') ? 'HE' : code.startsWith('BE') || code.startsWith('BAD') ? 'BE' : code.startsWith('TE') || code.startsWith('NORMAL') ? 'TE' : '分支'; }
    function collectedEndingIds(m = ctx.M()) { return [...new Set([...m.endings, ...Object.values(m.chapterEndings || {}).flat(), ...[m.run, ...Object.values(m.slots)].map(r => r.ending)].filter(id => Object.hasOwn(ctx.ENDINGS, id || '')))]; }
    function chapterEndingIds(ch, m = ctx.M()) {
        const recorded = new Set(m.chapterEndings?.[ch] || []);
        for (const id of collectedEndingIds(m))
            if (ctx.ENDINGS[id].chapter === ch)
                recorded.add(id);
        for (const r of [m.run, ...Object.values(m.slots)])
            if (r.chapter === ch && r.ending)
                recorded.add(r.ending);
        return ctx.endingKeys(ch).filter(id => recorded.has(id));
    }
    function endingBadges(ids) { return ['HE', 'TE', 'BE', '分支'].map(type => { const n = ids.filter(id => endingType(id) === type).length; return n ? `<span class="cp-end-badge" data-ending-type="${type}">${type} <b>${n}</b></span>` : ''; }).join(''); }
    function endingOverviewHTML() { return `<section class="cp-end-overview" aria-label="章节结局汇总"><div><strong>${I('album')}章节结局</strong><div class="cp-end-badges">${endingBadges(collectedEndingIds()) || '<span class="cp-caption">尚未收录结局</span>'}</div></div><button class="btn secondary small" data-cp-action="gallery">查看各章结局 ${I('arrow')}</button><p>第六章开幕准备：前五章演出 HE <b>${ctx.priorHeCount()} 章 / 至少 4 章</b> · ${ctx.priorHeCount() >= 4 ? '已达标' : '还差 ' + (4 - ctx.priorHeCount()) + ' 章'}<br>HE 圆满 · TE 普通 · BE 遗憾；按不同结局收藏，重玩不重复计数。</p></section>`; }
    function endingGalleryChapter(ch) {
        const ids = chapterEndingIds(ch), r = ctx.savedChapter(ctx.M(), ch), unlocked = ctx.chapterUnlocked(ch), he = ids.some(id => endingType(id) === 'HE');
        const status = !unlocked ? '未解锁' : r?.ending ? `本章存档：${endingType(r.ending)} · ${ctx.ENDINGS[r.ending].title}` : r?.legacyEnded ? '本章已结束 · 旧存档未记录结局类型' : r?.name ? '本章进行中' : ids.length ? '已收录结局 · 暂无本章进度' : '尚未开始';
        return `<section class="cp-end-chapter" data-ending-chapter="${ch}"><header><div><h3>${ctx.chapterName(ch)}</h3><p>${ctx.E(status)}</p></div><div class="cp-end-badges">${endingBadges(ids) || '<span class="cp-caption">暂无结局</span>'}</div></header>${ch <= 5 ? `<p class="cp-end-credit ${he ? 'complete' : ''}">${I(he ? 'check' : 'music')}${he ? '本章 HE 已计入开幕条件' : unlocked ? '本章 HE 尚未获得' : '解锁本章后可收集演出 HE'}</p>` : '<p class="cp-caption">第六章结局单独收藏，不计入前期演出 HE。</p>'}<div class="cp-end-earned">${ids.length ? ids.map(id => `<button class="cp-end-memory" data-memory="${ctx.ENDINGS[id].memory}"><span class="cp-end-badge" data-ending-type="${endingType(id)}">${endingType(id)}</span><span>${ctx.E(ctx.ENDINGS[id].title)}</span>${I('album')}</button>`).join('') : '<p class="cp-caption">完成剧情后，结局会记录在这里。</p>'}</div><details><summary>结局图鉴 · 已收录 ${ids.length} / ${ctx.endingKeys(ch).length}</summary><div class="cp-gallery">${ctx.endingKeys(ch).map(id => { const e = ctx.ENDINGS[id], done = ids.includes(id); return `<article class="cp-ending-tile ${done ? '' : 'locked'}">${I(done ? e.icon : 'lock')}<div class="eyebrow">${done ? endingType(id) : 'NOT YET RECORDED'}</div><h3>${done ? e.title : '未解锁结局'}</h3><p>${done ? e.text : '继续故事，发现新的结尾。'}</p></article>`; }).join('')}</div></details><button class="btn secondary small" data-cp-action="ending-chapter" data-cp-chapter="${ch}" ${unlocked ? '' : 'disabled'}>${unlocked ? '前往本章' : '完成前章后解锁'} ${I(unlocked ? 'arrow' : 'lock')}</button></section>`;
    }
    function gallery() {
        const ids = collectedEndingIds(), unassignedShadow = ids.includes('shadow') && ![1, 2, 3, 4].some(ch => chapterEndingIds(ch).includes('shadow'));
        openModal('章节结局 · HE / TE / BE', `${endingOverviewHTML()}<p class="cp-caption">第一章成功演出（原 GOOD END）按 HE 计入；普通结局按 TE 展示。每章演出 HE 最多贡献 1 章。补齐后可直接返回第六章继续，已收录的结局和全局羁绊都会保留。</p><div class="cp-end-chapters">${[1, 2, 3, 4, 5, 6].map(endingGalleryChapter).join('')}</div>${unassignedShadow ? '<section class="cp-end-chapter"><h3>早期存档 · 未注明章节</h3><p><span class="cp-end-badge" data-ending-type="BE">BE</span> 团长的影子</p><p class="cp-caption">已计入结局收藏。旧存档没有留下所属章节，不会重复显示为每章都获得。</p></section>' : ''}<div class="modal-foot">未解锁的结局名称与内容保持隐藏。重开本章可尝试其他结局，收藏不会减少。</div>`);
    }
    function help() {
        if (ctx.R().chapter >= 5) {
            openModal(ctx.chapterName() + ' · 规则', ctx.weeklyHelp() + ctx.lateRulesHTML() + '<p>' + ECONOMY_HELP + '</p><p>姓名和乐器沿用第一章。全局羁绊分只增加；重开不会清除卡牌、回忆或重复发放结局奖励。第五、六章不再点单。</p>');
            return;
        }
        if (ctx.isFour()) {
            openModal('第四章 · 剧场之夜', ctx.weeklyHelp() + ctx.fourthHelp());
            return;
        }
        if (ctx.isThree()) {
            openModal('第三章 · 星光530', ctx.weeklyHelp() + ctx.thirdHelp());
            return;
        }
        if (ctx.isTwo()) {
            openModal('乐团正传 · 第二章玩法', `<p>根据你提供的《第二章 · 暗涌》HTML 接入。正传与卡册共用全局羁绊分；人物卡牌与原有玩法保留。</p>${ctx.weeklyHelp()}${ctx.chapterTwoHelp()}`);
            return;
        }
        openModal('乐团正传 · 第一章玩法', `${ctx.weeklyHelp()}<p>${ECONOMY_HELP}</p><p>本章来自你提供的「第一章·入团试炼」HTML。保留原案人物关系、主要对白、三种合练行动、五段演出判定与三种结局。</p><div class="cp-rule-table"><strong>从哪里开始</strong><span>写名字、选乐器，跟随垃垃入团，见十元与首席空格。剧情进度到达哪位伙伴，哪位伙伴就自动加入卡册；剧情中的搭档不需要预先拥有卡牌。TIM 与叶思阳加入日常聊天及合练搭档。</span><strong>自由周常</strong><span>练琴：10 音符 / 琴技 +2；聊天：参与每日陪伴奖励，最多 +1；自由合练：选择搭档参加考核。演出邀约在开场剧情中连贯呈现，笛杰的心事在演出前出现。</span><strong>推进周数</strong><span>读完章节前段后，每周开放一种训练；未完成的训练可稍后补练。第 6 周开放快闪准备；琴技不足 12 时可延期加练，消耗 10 音符，实际增加一周及 2 琴技。</span><strong>练习对决</strong><span>初始状态 10 + 琴技，对面压力 14。稳扎稳打 3–5 分；全情投入有一半概率 8–11，否则 1。羁绊不足 3 时合奏得 2，否则得 6 + 羁绊 + 0–2。合奏免费，效果取决于搭档羁绊。对方每回合消耗我方 2–5 状态。</span><strong>快闪判定</strong><span>共 5 段。绿区宽 min(40,14 + 琴技)%，中央 35% 是 PERFECT +10，其他绿区 GOOD +6，区外 +2 且阿喆羁绊 +1。难度为 10 + 登台周数，得分达到难度即成功。无倒计时强迫；每段开始、下一段都由你确认。</span><strong>章节与卡册</strong><span>正传人物羁绊在所有章节全局共用，只增不减；切章、回看和重开不会重置。琴技按章节保存，音符全局共用，卡册养成另行保留。正传搭档无需抽卡。首次入团：邀请券 +1；首次考核合格：音符 +3（另有每日首次通过 +3）；每章首次完成：音符 +15 / 邀请券 +1。其他结局只收藏回忆。三种结局各有一张回忆。每个奖励只领一次，重开不重置领取记录。</span><strong>保存与重开</strong><span>对决回合、快闪分段、剧情节点均保存。切换页面或打开弹窗会暂停判定。重开本周目不清卡牌或结局；右上角设置可导出整个 V6.3 存档，也可导入 V4 存档或原正传 JSON 存档。</span></div><p class="cp-caption">结局与人物线索会随你的选择自然揭晓。</p><div class="modal-foot">「琴技」「黑化」等数值仅为附件虚构剧情机制，不是现实人物评价。完成第一章后解锁第二章《暗涌》，后续章节依次解锁，名字和乐器自动沿用。补充了原案缺失的垃垃日常聊天一句，以及明确的暂停、下一段和周数推进入口。</div>`);
    }
    function chapterTabs() { return `<div class="cp-chapters" aria-label="乐团正传章节">${[1, 2, 3, 4, 5, 6].map(ch => { const unlocked = ctx.chapterUnlocked(ch), ends = chapterEndingIds(ch); return `<button class="cp-chapter-tile ${!ctx.M().personal?.active && ctx.R().chapter === ch ? 'active' : ''} ${unlocked ? '' : 'locked'}" data-cp-action="switch-chapter" data-cp-chapter="${ch}" ${unlocked ? '' : 'disabled aria-disabled="true"'}><span>CHAPTER ${String(ch).padStart(2, '0')}</span><strong>${ctx.chapterName(ch).split(' · ')[1]}</strong><small>${!unlocked ? '完成第 ' + (ch - 1) + ' 章后解锁' : !ctx.M().personal?.active && ctx.R().chapter === ch ? '正在阅读' : ctx.M().slots[ch] ? '继续本章 · 进度保留' : ch === 1 ? '从入团开始' : '已解锁 · 继续故事'}</small>${ends.length ? `<span class="cp-end-badges">${endingBadges(ends)}</span>` : ''}${I(unlocked ? 'album' : 'lock')}</button>`; }).join('')}<button class="cp-chapter-tile ${ctx.M().personal?.active?'active':''} ${ctx.chapterComplete(6)?'':'locked'}" data-cp-action="personal-picker" ${ctx.chapterComplete(6)?'':'disabled'}><span>CHAPTER 07</span><strong>个人线</strong><small>${ctx.chapterComplete(6)?'选择角色 · 羁绊超过 35 分':'完成第六章后解锁'}</small>${I(ctx.chapterComplete(6)?'heart':'lock')}</button></div>`; }
    return { speaker, dialogueHTML, actionButton, choicesHTML, startHTML, weekAdvanceHTML, weeklyHTML, socialHTML, partnerHTML, practiceHTML, liveResultHTML, titleHTML, mainHTML, phaseText, hudHTML, sidebarHTML, journalHTML, render, refresh, endingType, collectedEndingIds, chapterEndingIds, endingBadges, endingOverviewHTML, endingGalleryChapter, gallery, help, chapterTabs };
}
