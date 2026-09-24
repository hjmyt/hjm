'use strict';

// Private Chronicle feature. ctx contains live accessors to sibling features and controller state.
function createChronicleChaptersTwo(ctx) {
    function projectEvent(id) {
        ctx.startSide('c2_' + id);
    }

    function resolveEvent(id, value, fx) {
        if (ctx.R().events[id])
            return;
        ctx.R().events[id] = value;
        fx?.();
        ctx.log(`支线已记录：${{ sponsor: '赞助提议', boundary: '工作时间的消息', bill: '缺席的鼓手' }[id]}。`);
    }
    function chapterTwoDialogue(run = ctx.R()) {
        const G = run, extra = ctx.supplementalDialogue(G);
        if (extra)
            return extra;
        switch (G.scene) {
            case 'c2_intro': return ctx.D('narrator', '第二章 · 暗涌。\n\n山丘酒吧，「以排代演」的第三个星期。流行歌的和弦撞上了弦乐四重奏，鼓手在找拍子，长笛在找调，朱老师站在吧台边，脸色比谱架还黑。欧老师的檄文在群里刷了屏：《我们是在排练，还是在团建？》', ctx.choice('（推门进去）', 'c2_bar'));
            case 'c2_bar': return ctx.D('narrator', '你挤进人堆。十元抱着琴在流行组和弦乐组之间来回救火，嗓子已经哑了；阿喆以 0.3 秒一页的速度给两边翻谱，翻出了残影；笛杰缩在谱架后面，眼神开始下雨。\n\nTIM 拎着琴盒推门进来，工牌还没摘——国企打卡完直接赶过来的。他刚在汤少旁边站定，团里的腐女们眼睛「唰」地亮了。', ctx.choice('（看过去）', 'c2_tim'));
            case 'c2_tim': return ctx.D('tim', '「大家好，TIM，一提。白天在单位……晚上过来练琴。」', ctx.choice('跟着腐女磕一口 TimTom', 'c2_tim_a', () => { ctx.affUp('tangshao', 2); ctx.affUp('tim', 1); G.flags.fujoshi = 1; }), ctx.choice('帮 TIM 解围', 'c2_tim_b', () => { ctx.affUp('tim', 2); ctx.affUp('tangshao', 1); }), ctx.choice('纯围观', 'c2_tim_c'));
            case 'c2_night_pre': return ctx.D('jerry', '那晚，音乐人 Jerry 自己来到了山丘酒吧。他只看了一场排练就给出诊断：「一锅烩，必死。要分组。」\n\n黑板被分成两半——左边写着「弦乐组」，右边写着「流行组」。朱老师沉默良久，点了点头。史称：哈基米之夜。', ctx.choice('（站到黑板前）', 'c2_night', () => ctx.reward('c2_night')));
            case 'c2_night': return ctx.D('narrator', '全团的目光落在你身上。去哪边？', ctx.choice('弦乐组', 'c2_str', () => { G.flags.strGroup = 1; G.flags.popGroup = 0; ctx.log('选择弦乐组，继续音乐剧与独立路演方向。'); }), ctx.choice('流行组', 'c2_pop_end', () => { G.flags.popGroup = 1; G.flags.strGroup = 0; ctx.ending('c2_street'); }));
            case 'c2_str': return ctx.D('narrator', '你站到了弦乐组一边。垃垃看了你一眼，没有说话，但你感觉有什么东西被悄悄放进了心里。\n\n后来的路还很长。音乐剧、路演、越来越大的舞台——都从这个小小的角落，开始生长。', ctx.choice('（跟上垃垃）', 'c2_head'));
            case 'c2_pop_end': return ctx.D('xiaojie', '你站到了流行组一边。小杰拍了拍你的肩：「兄弟，一起把歌唱好。」\n\n——三个月后，弦乐组越走越远，音乐剧、路演，灯光越来越亮。流行组的人渐渐聚不齐了，排练室的钥匙还挂在小杰腰上。周末的商圈门口，有时还能听见他的音箱在响。\n\n某天你在天桥上路过，往琴盒里放了十块钱。他冲你笑了笑，没说话。', ctx.choice('—— 结局 · 街头卖唱 ——', 'title3'));
            case 'c2_head': return ctx.D("crowd", [ctx.spoken("crowd", "（排练间隙，腐女们又围住了 TIM）「你和阿喆用的是情侣头像吧！！」TIM 当场掏出手机——十秒，换头像、退群聊、一条龙，暴力拆 CP。"), ctx.spoken("azhe", "\n\n阿喆抱着琴坐在角落里，小声嘀咕：「……换那么快干嘛，我也没说什么。」")], ctx.choice('过去安慰阿喆', 'c2_head_a', () => { ctx.affUp('azhe', 2); G.flags.azeCare = 1; }), ctx.choice('打趣 TIM：情头挺配', 'c2_head_b', () => { ctx.affUp('tim', 1); ctx.affUp('azhe', 1); G.flags.azeJealous = 1; }), ctx.choice('不管，练自己的琴', 'c2_head_c'));
            case 'c2_kong': return ctx.D('kongge', '（首席空格把你叫到楼梯间）「外面商演队开三倍价挖我，音乐剧那边也在要我。说句实话，团里的水平……你自己也听见了。」他看着你，「你觉得我该留吗？」', ctx.choice('劝留下：十元需要你', 'c2_kong_a', () => { G.flags.konggeStay = G.aff.shiyuan >= 8 ? 1 : 'weak'; G.flags.konggeLeave = 0; ctx.affUp('kongge', 1); ctx.log(G.flags.konggeStay === 1 ? '空格沉默很久，点了点头。已确定留下。' : '空格：「她连音准都没稳……让我想想。」仍在犹豫。'); ctx.reward('c2_choice'); }), ctx.choice('支持他去飞', 'c2_kong_b', () => { G.flags.konggeLeave = 1; G.flags.konggeStay = 0; ctx.affUp('kongge', 2); ctx.log('你支持空格去更大的舞台，已记录离开决定。'); ctx.reward('c2_choice'); }), ctx.choice('拉十元一起来谈', 'c2_kong_c', () => {
                G.flags.konggeLeave = 0;
                if (G.aff.shiyuan >= 6) {
                    G.flags.konggeStay = 1;
                    ctx.affUp('shiyuan', 1);
                    ctx.affUp('kongge', 1);
                    ctx.log('十元认真听完，空格叹了口气：「……再陪你们走一段。」已确定留下。');
                }
                else {
                    G.flags.konggeStay = 'weak';
                    ctx.log('你与十元的默契还不足以促成这次谈话；空格仍在犹豫。');
                }
                ctx.affUp('kongge', 1);
                ctx.reward('c2_choice');
            }));
            case 'c2_endweek': return ctx.D('narrator', '格局已定。这个月怎么过？', ctx.choice('进入本周安排', 'menu'));
            case 'c2_sponsor': return ctx.D('narrator', '一位赞助方带着一份厚厚的心意找上朱老师，想支持音乐剧。朱老师笑得很客气，垃垃站在一旁，久久没有说话。', ctx.choice('劝朱老师慎重', 'menu', () => resolveEvent('sponsor', 'checked', () => { ctx.affUp('lala', 2); G.flags.sponsorWatch = 1; })), ctx.choice('有钱不赚白不赚', 'menu', () => resolveEvent('sponsor', 'accepted', () => { ctx.plotNotes(5); G.flags.sponsorAccepted = 1; })));
            case 'c2_boundary': return ctx.D('tim', 'TIM 盯着手机，有些困扰：「那位团外联系人又加我了……上班时间，十七条消息。」', ctx.choice('提醒他保持距离', 'menu', () => resolveEvent('boundary', 'supported', () => { ctx.affUp('tim', 2); G.flags.boundarySet = 1; })), ctx.choice('看戏', 'menu', () => resolveEvent('boundary', 'watched', () => ctx.affUp('tim', -1))));
            case 'c2_bill': return ctx.D('shiyuan', '鼓手 Bill 又翘排练了。十元在琴房门口转了三圈：「他说……他有事。」', ctx.choice('建议立刻找替补', 'menu', () => resolveEvent('bill', 'replacement', () => { ctx.affUp('shiyuan', 2); G.flags.billOut = 1; })), ctx.choice('再给他一次机会', 'menu', () => resolveEvent('bill', 'warning', () => { G.flags.billWarn = 1; })));
            case 'after_practice': return ctx.D(G.battle?.win ? 'tim' : 'azhe', G.battle?.win ? '空格把笔收好。TIM 拍了拍你的谱角：「刚才那一段，比上一遍齐了。」\n\n合练结束，回到第二章的本周安排。' : '空格指出了需要再练的几个小节。阿喆替你折好谱角，示意别急。\n\n合练结束，回到第二章的本周安排。', ctx.choice('继续本周安排', 'menu'));
            case 'b_live': return G.tech >= 14 ? ctx.D('narrator', `第 ${G.week} 周。音乐剧立项在即，乐团必须靠路演证明独立的价值。`, ctx.choice('出战路演', 'live_intro', ctx.initLive)) : ctx.D('kongge', `琴技 ${G.tech}，首席空格摇头：「这水平上会翻车。」\n\n琴技不足 14，先加练。`, ctx.extraPracticeChoice(), ctx.choice('回到本周安排', 'menu'));
            case 'live_intro': return ctx.D('shiyuan', '独立后的第一场路演——台下站着商场经理和朱老师。这一次，没有退路了！', ctx.choice('上！', 'live_play'));
            case 'be_shiyuan': return ctx.D('narrator', '（你把所有的目光都给了团长。）十元的笑容依旧明亮，可某一天你回过头，身后已经没有了合奏的人。\n\n这一周目走到了结尾，已建立的全局羁绊仍然保留。', ctx.choice('BE · 团长的影子', 'title3'));
            default: return null;
        }
    }
    function secondProgress() { const f = ctx.R().flags; return f.konggeStay === 1 ? '空格已确定留下' : f.konggeLeave ? '支持空格离开' : f.konggeStay === 'weak' ? '空格仍在犹豫' : '空格去留尚未决定'; }
    function eventBoard() { return ctx.sideStoriesHTML(); }
    function secondOutcomeText() {
        const r = ctx.R();
        if (r.ending === 'c2_dual')
            return '路演大成功！商场的合约、朱老师音乐剧的席位，一起涌向了这个刚从母体独立出来的小团。十元在台上发光，空格在她身后托住全团——双核，缺一不可。' + (r.flags.azeJealous ? '\n\n至于阿喆——他后来换了和 TIM 同款不同色的头像，被腐女们发现了新大陆。' : '') + '\n\n—— HE · 双核 ——';
        if (r.ending === 'c2_retry')
            return '路演翻车了。台下礼貌的掌声像雨点一样凉。但十元攥着拳说：「再来！下次一定行！」\n\n—— TE · 翻车与重来 ——\n这一章已经结束。可以继续第三章找回场子，也可以从本章起点重新尝试。';
        if (r.ending === 'c2_solo')
            return '路演成功了，但 ' + (r.flags.konggeStay === 1 ? '空格虽然答应留下，十元与同伴的默契却还没能真正连成一体。十元一个人撑着整个团，笑容还在，只是琴房的灯，熄得越来越晚。' : r.flags.konggeStay === 'weak' ? '空格那天没有给出明确的承诺。十元一个人撑着整个团，笑容还在，只是琴房的灯，熄得越来越晚。' : '空格还是走了。琴房里最准的那个音，从此空着。') + '\n\n—— TE · 独奏者 ——\n十元与空格必须同在，才是真正的完美。';
        return ctx.ENDINGS[r.ending]?.text || '这个章节已经落幕。';
    }
    function secondResultHTML() { const r = ctx.R(), l = r.live, e = ctx.ENDINGS[r.ending]; return `<div class="cp-surface">${ctx.speaker(r.ending === 'c2_retry' ? 'shiyuan' : 'narrator', '第二章 · 独立路演落幕')}<div class="cp-ending-hero"><div class="cp-overline">${e?.code || 'CHAPTER TWO'}</div><h3>${e?.title || '路演结束'}</h3><div class="cp-battle-result" style="padding:8px">${l?.score ?? '—'} <span style="font-size:19px">/ ${l?.diff ?? '—'}</span></div><p class="cp-result-note">${l?.scores.map((s, i) => '第 ' + (i + 1) + ' 段 +' + s).join(' · ') || '导入的旧存档没有逐段成绩'}</p></div><div class="cp-text">${ctx.E(secondOutcomeText())}</div><div class="cp-reward">剧情中相遇的伙伴已加入卡册。结局与回忆已保存。每章首次完成：15 音符与 1 张邀请券；其他结局只收藏回忆，不重复领奖。</div>${ctx.actionButton('chapter-finish', '—— 第二章 · 完 ——', 'album', 'primary')}</div>`; }
    function secondTitleHTML() { const r = ctx.R(), e = ctx.ENDINGS[r.ending]; return `<div class="cp-surface"><div class="cp-ending-hero">${I(e?.icon || 'album')}<div class="cp-overline">${e?.code || 'CHAPTER TWO · COMPLETE'}</div><h3>${e?.title || '第二章 · 已结束'}</h3><p class="cp-caption">${ctx.E(e?.text || '旧存档未记录具体结局；章节已停留在落幕页。')}</p></div><div class="cp-choices">${e ? `<button class="cp-choice gold" data-memory="${e.memory}"><span class="cp-option-n">01</span><span>收藏这次落幕<small>回忆与结局图鉴均已同步</small></span>${I('album')}</button>` : ''}<button class="cp-choice" data-cp-action="restart" data-cp-rev="${r.rev}"><span class="cp-option-n">02</span><span>从第二章起点重选<small>恢复本章入口快照，保留第一章、卡牌养成和结局图鉴</small></span>${I('repeat')}</button><button class="cp-choice" data-cp-action="switch-chapter" data-cp-chapter="1"><span class="cp-option-n">03</span><span>回第一章<small>第二章当前结局仍然保留</small></span>${I('back')}</button><button class="cp-choice" data-route="cards"><span class="cp-option-n">04</span><span>回到乐团卡册</span>${I('cards')}</button></div><div class="cp-teaser"><strong>第三章 · 星光530 <span class="label-tag">已开放</span></strong>专场筹备 / 新伙伴 / 幕间心事 / 满场荧光。<br><button class="btn primary" style="margin-top:14px" data-cp-action="switch-chapter" data-cp-chapter="3">继续第三章 ${I('arrow')}</button></div></div>`; }
    function chapterTwoHelp() { return `<p>${ECONOMY_HELP}</p><div class="cp-rule-table"><strong>章节衔接</strong><span>第一章结束后解锁第二章，沿用入团登记并继承琴技、等级、羁绊与黑化值；第二章周数从 1 开始。六章依次解锁、分别保存，点击顶部已解锁章节卡即可来回切换。</span><strong>原案主线</strong><span>山丘酒吧 → TIM 到场 → 哈基米之夜 → 弦乐／流行分组 → 头像风波 → 空格去留。流行组进入「街头卖唱」分支结局；弦乐组进入自由安排与独立路演。</span><strong>周常与三条支线</strong><span>练琴消耗 10 音符，琴技 +2；音符不足可先免费演奏。合作提议和 Bill 缺席安排在第 3、5 周主线；TIM 工作时间消息在第 2 周起作为可选相遇开放。每个赞助节点的音符跨重开只领取一次；事件每周目可重新选择，之后可查看记录；已处理事件再次抽中时改为合练。</span><strong>路演</strong><span>第 6 周开放，需琴技 14。难度 12 + 登台周数，共 5 段，最高 50 分。判定与第一章相同：PERFECT +10、GOOD +6、区外 +2。延期加练实际推进一周；没有强制倒计时。</span><strong>存档与重选</strong><span>保存对白节点、决策、事件、合练回合、路演每段及光标位置。离开页面／打开弹窗会暂停，不会自动判定。重开第二章只恢复本章起点，第一章不动；结局奖励与回忆跨周目保留。</span><strong>本版适配说明</strong><span>沿用先前的删改，不接回团内不满、羁绊差距扣琴技及排斥／分裂类结局。赞助与私聊角色使用「赞助方」「团外联系人」代称。三个事件的其余选择与数值保留；第三章的专场剧情与本章分别保存。补全了附件缺失的周常返回和合练收尾。</span></div><p class="cp-caption">结局与人物线索会随你的选择自然揭晓。</p>`; }
    return { projectEvent, resolveEvent, chapterTwoDialogue, secondProgress, eventBoard, secondOutcomeText, secondResultHTML, secondTitleHTML, chapterTwoHelp };
}
