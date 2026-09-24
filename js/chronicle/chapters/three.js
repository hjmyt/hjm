'use strict';

// Private Chronicle feature. ctx contains live accessors to sibling features and controller state.
function createChronicleChaptersThree(ctx) {
    function supplementalDialogue(G) {
        switch (G.scene) {
            case 'c2_tim_a': return ctx.D("tim", [ctx.spoken("tim", "（TIM 耳根微红，瞥了汤少一眼又迅速移开：「别闹，我们就是……志同道合。」"), ctx.spoken("tangshao", "汤少举着相机，笑得意味深长：「懂的都懂。」腐女们发出满足的叹息。")], ctx.choice('（继续）', 'c2_night_pre'));
            case 'c2_tim_b': return ctx.D('tim', '（你岔开话题，问起国企的茶室。TIM 如蒙大赦，滔滔不绝讲了十分钟茶道，讲完才反应过来，冲你感激地点点头：「谢了，兄弟。」', ctx.choice('（继续）', 'c2_night_pre'));
            case 'c2_tim_c': return ctx.D('tim', '（你抱着琴安静旁观。TIM 被起哄得手足无措，最后高高举起了工牌：「各位，已有女友的是汤少！」全场爆笑，汤少差点把相机摔了。', ctx.choice('（继续）', 'c2_night_pre'));
            case 'c2_head_a': return ctx.D('azhe', '（你在楼梯间找到阿喆。他抱着琴，看你来了，别别扭扭地开口）「我又没生气。就是……算了。」（过了一会儿，他小声说）「谢谢你过来。其实你没来的时候，我看了三次门口。」', ctx.choice('「下次我早点来。」', 'c2_kong', () => { ctx.affUp("azhe", 1); }));
            case 'c2_head_b': return ctx.D('tim', '（你打趣 TIM，他挑眉：「工作需要，工牌头像，庄重。」说完他自己也笑了，拍了拍阿喆的肩）「走了，练琴。」阿喆抱着琴跟上去，嘴角是翘的。', ctx.choice('（继续）', 'c2_kong'));
            case 'c2_head_c': return ctx.D('azhe', '（你没过去。那天晚上的合奏，阿喆的声部准得惊人——把所有没人接的话，都拉进琴里了。', ctx.choice('（继续）', 'c2_kong'));
            case 'c2_kong_a': return ctx.D('kongge', G.flags.konggeStay === 1 ? '（你认真地看着他：「十元需要你，我们也需要你。」空格沉默了很久，久到楼梯间的声控灯灭了。灯再亮的时候，他点了点头：「……再陪你们走一段。」' : "（楼梯间的灯亮了又暗。）空格想了很久，最后说：「让我再想想。琴还要练，很多话也还没说开。」他没有给出明确的承诺。", ctx.choice('（松了口气）', 'c2_endweek', () => { ctx.affUp("kongge", 1); }));
            case 'c2_kong_b': return ctx.D('kongge', '（他笑了，那笑意里有点你读不懂的东西）「难得有人不说『为了梦想』。」他背起琴，「好，那我就去看看，外面的天有多大。」（他走出去两步，又回头）「替我跟十元说声……算了，不用说了。」', ctx.choice('（目送他离开）', 'c2_endweek'));
            case 'c2_kong_c': return ctx.D(G.flags.konggeStay === 1 ? 'shiyuan' : 'kongge', G.flags.konggeStay === 1 ? [ctx.spoken('shiyuan', "（你把十元拉来了。她听完，安静了很久，然后深深鞠了一躬：「首席，留下来，我们一起把音拉准。」"), ctx.spoken('kongge', "空格看着这个音准都不稳、腰弯得笔直的团长，叹了口气，伸手揉了揉她的头发：「……下不为例。」")] : "十元认真听完，向空格鞠了一躬。他沉默了一会儿：「我明白……但让我再想想。」这次谈话留下了希望，还没有得到明确的答案。", ctx.choice('（这一幕记了很久）', 'c2_endweek', () => { ctx.affUp("kongge", 1); }));
            case 'c3_intro': return ctx.D('qiqi', '第三章 · 星光530。\n\n530 陶喆专场官宣的那个晚上，排练室门口多了一袋手作饼干。柒柒——银行客户经理，新来的电吉他——笑着给每个人发：「练琴辛苦啦，周末我请大家吃饭，女生做脸我包了。」她抱起电吉他试了一段 solo，整个排练室都安静了。', ctx.choice('（接过饼干）', 'c3_prep'));
            case 'c3_prep': return ctx.D('narrator', '筹备期总是兵荒马乱。键盘手柠檬的排练状态让人头疼——不是忘谱，就是把报名接龙填成「围观」。小周坐在旁边，欲言又止。', ctx.choice('委婉提醒柠檬', 'c3_prep_a', () => { G.flags.lemonSoft = 1; ctx.affUp("shiyuan", 1); }), ctx.choice('私下请小周多带带他', 'c3_prep_b', () => { G.flags.zhouHelp = 1; ctx.affUp("lala", 1); }), ctx.choice('先专注自己的声部', 'c3_prep_c'));
            case 'c3_ge': return ctx.D('narrator', '专场前两周，十元的状态不太对——琴练得凶，饭吃得少。你后来才知道，垃垃去找大鹅谈过一次话，话没说开，反而传了出去。再后来，大鹅悄悄退了群。', ctx.choice('去琴房陪十元', 'c3_ge_a', () => { ctx.affUp("shiyuan", 3); G.flags.stayShi = 1; }), ctx.choice('去找大鹅聊聊', 'c3_ge_b', () => { G.flags.geTalk = 1; ctx.affUp("lala", 1); }), ctx.choice('专心准备专场', 'c3_ge_c', () => { ctx.affUp("shiyuan", -1); }));
            case 'c3_bill': return ctx.D('shiyuan', '（演出前一周，鼓手 Bill 又联系不上了。排练室里的空气一点点绷紧。）十元攥着手机，强撑着笑：「没事，我们再想办法。」', ctx.choice('建议让小塔试试鼓', 'c3_bill_a', () => { G.flags.taIn = 1; ctx.affUp("shiyuan", 2); }), ctx.choice('再等等 Bill', 'c3_bill_b', () => { G.flags.billWait = 1; }));
            case 'c3_menu': return ctx.D('narrator', '专场就在下周。最后的排练时间，留给还没合稳的那一段。', ctx.choice('进入本周安排', 'menu'));
            case 'c3_jeal': return ctx.D('qiqi', '（柒柒挽着你的手，笑得温柔：「妹妹，明天陪我去做脸吧，别总跟那群男生混在一起呀。」——这句话传进十元耳朵时，已经变了味道。）', ctx.choice('当晚就去找十元解释', 'c3_jeal_a', () => { ctx.affUp("shiyuan", 2); G.flags.qiSeen = 1; }), ctx.choice('不解释，身正不怕影斜', 'c3_jeal_b', () => { ctx.affUp("shiyuan", -2); }), ctx.choice('婉拒柒柒的邀请', 'c3_jeal_c', () => { ctx.affUp("qiqi", 1); }));
            case 'be_qiqi': return ctx.D('narrator', '一些话在团里流传了很久，谁也说不清从哪开始。等你察觉时，排练室里的空气已经不一样了——大家还在笑，只是笑完之后，会各自沉默。专场取消了，饼干也再没有人带。', ctx.choice('BE · 温柔的刀', 'title4'));
            case 'c3_he': return ctx.D('qiqi', G.flags.taIn ? '530 专场，满场荧光。十元在台上发光，空格的节奏稳得像心跳，小塔的鼓炸开第一排——返场三次。\n\n庆功宴上，柒柒笑着举杯：「为你们骄傲。」你也笑了。有些心事，你还不完全懂，但你选择先相信眼前的人。' : "530 专场，满场荧光。十元在台上发光，空格的节奏稳得像心跳，合奏的声音涌向第一排——返场三次。\n\n庆功宴上，柒柒笑着举杯：「为你们骄傲。」你也笑了。有些心事，你还不完全懂，但你选择先相信眼前的人。", ctx.choice('—— HE · 舞台与真心 ——', 'title4'));
            case 'c3_te': return ctx.D('narrator', '专场成功了，掌声很真，合约也很真。只是庆功宴散场时，柒柒轻轻抱了抱十元，在她耳边说了一句话。十元笑着，却在你看不见的地方，轻轻叹了口气。', ctx.choice('—— TE · 专场之夜 ——', 'title4'));
            case 'c3_fail': return ctx.D('shiyuan', '专场中段出了状况，台下礼貌地安静。十元鞠了一躬说「下次见」，可你知道，有些机会不会等人。', ctx.choice('—— TE · 安可之前 ——', 'title4'));
            case 'c3_prep_a': return ctx.D('lemon', '（你排练后走过去，斟酌着开口：「柠檬，刚才第三段，要不要一起再过一遍？」柠檬愣了一下，挠头：「啊……哦哦，好啊。」那天下午，你们把那一小节磨了十遍。虽然下周他还是填了「围观」，但至少那一小节，他记住了。', ctx.choice('（继续）', 'c3_ge'));
            case 'c3_prep_b': return ctx.D('xiaozhou', '（散场后你找到小周：「要不要我陪你把谱子顺一遍？两个人快一点。」小周抬起头，眼睛亮了一下，又低下头去：「……嗯，谢谢。」那晚你们顺到很晚，出门时他小声说：「有人一起练琴，真好。」', ctx.choice('（继续）', 'c3_ge'));
            case 'c3_prep_c': return ctx.D('narrator', '（你把谱架转回自己的声部，戴上弱音器，把小节的每个音抠到天黑。等你抬头，排练室只剩你一个人，和窗外很好看的晚霞。', ctx.choice('（继续）', 'c3_ge'));
            case 'c3_ge_a': return ctx.D('shiyuan', '（你推开琴房的门，没说话，搬了把椅子在她旁边坐下。十元拉着拉着，声音慢了下来，最后停了。）「……你也会觉得，我什么都想抓住，很贪心吧。」（她吸了吸鼻子，冲你笑）「没关系，专场办完，我请你们吃大餐。没你不行。」', ctx.choice('「我在。」', 'c3_bill', () => { ctx.affUp("shiyuan", 1); }));
            case 'c3_ge_b': return ctx.D('goose', '（你在琴行门口堵到大鹅。他听完你来意，沉默了很久：「我只是……想赶紧把专场做完。」他最终还是没有回来，但走之前，他把所有键盘分谱整整齐齐发给了你，备注只有两个字：「加油。」', ctx.choice('（收下谱子）', 'c3_bill'));
            case 'c3_ge_c': return ctx.D('narrator', '（你没去琴房。有些结要当事人自己解，你能做的是让专场无懈可击。那晚你练到手指发麻，梦里都是节拍器的声音。', ctx.choice('（继续）', 'c3_bill'));
            case 'c3_bill_a': return ctx.D('shiyuan', '（小塔抱着鼓槌试了一段，第一拍落下，整个排练室都抬起了头——稳得像心跳。）十元捂着嘴笑出声：「就他了！」（她转过头对你说）「你救场的样子，特别帅。」', ctx.choice('「那就这么定。」', 'c3_menu'));
            case 'c3_bill_b': return ctx.D("bill", [ctx.spoken("bill", "（演出前三天，Bill 发来一条消息：「抱歉，我去不了了。」附赠一个笑脸。"), ctx.spoken("shiyuan", "十元盯着屏幕看了十秒，然后把手机扣在桌上，深吸一口气：「没事。我们重新排。」那晚，排练室的灯亮到凌晨两点。")], ctx.choice('（陪她重排）', 'c3_menu', () => { ctx.affUp("shiyuan", 1); }));
            case 'c3_jeal_a': return ctx.D('shiyuan', '（你当晚就去了琴房，把事情原原本本说了一遍。十元听完，眨眨眼：「就这事？我还以为……」她突然笑了，捶了你一下）「下次直接跟我说，不许让别人转达。没你不行，记得吗？」', ctx.choice('「记得。」', 'menu'));
            case 'c3_jeal_b': return ctx.D('qiqi', '（你没去解释。第二天排练，十元照旧冲你笑，只是那笑容里多了零点五秒的迟疑。柒柒挽着你的手更紧了些：「妹妹，走，做脸去。」镜子里，她笑得温柔极了。', ctx.choice('（继续）', 'menu'));
            case 'c3_jeal_c': return ctx.D('qiqi', '（你婉拒了。柒柒也不恼，轻轻捏了捏你的手：「那下次哦，不许推。」她转身走开，旗袍的盘扣在灯光下闪了一下。你心里那点说不清的异样，被她温柔的笑盖了过去。', ctx.choice('（继续）', 'menu'));
            case 'band_q_a': return ctx.D('qiqi', '（那顿饭吃得很热闹。散场时柒柒挨个给大家打车，还把打包的点心塞到你手里：「给，明天的早餐。」你道了谢，她摆摆手，旗袍的袖子轻轻晃：「客气什么，都是一家人。」', ctx.choice('（继续）', 'menu'));
            case 'band_q_b': return ctx.D('narrator', '（你留了个心眼。席间柒柒给每个人都夹了菜、都递了话，话题总是绕回别人的私事——谁最近缺钱，谁和谁走得近，谁对十元有意见。她记得一切，也收纳一切。', ctx.choice('（把观察记在心上）', 'menu'));
            case 'band_zhou_a': return ctx.D('xiaozhou', '（你们把谱子一页页重新整理，用铅笔标好指法。小周捧着整理好的谱子，像捧着什么失而复得的东西：「谢谢你……我请你喝奶茶。」', ctx.choice('「一杯珍珠，谢啦。」', 'menu', () => { ctx.affUp("xiaozhou", 1); }));
            case 'band_zhou_b': return ctx.D('xiaozhou', '（你在天台找到小周，陪他坐了一会儿。他吸着鼻子说没事，过了一会儿又说：「谱子没了可以再买，就是……有点委屈。」你递了张纸给他，他破涕为笑。', ctx.choice('（拍拍他的肩）', 'menu'));
            case 'band_bill_a': return ctx.D('shiyuan', '（你们合到很晚。十元拉错了一个音，自己先笑了：「重来！」然后她看着你说）「不知道为什么，有你在，我就敢犯错。」', ctx.choice('「尽管犯，有我兜底。」', 'menu', () => { ctx.affUp("shiyuan", 1); }));
            case 'band_bill_b': return ctx.D('kongge', '（你没说话，把弱音器装上，把自己的声部磨了一遍又一遍。散场时首席空格路过，难得地点了点头：「这句，有点意思。」', ctx.choice('（继续）', 'menu'));
            default: return null;
        }
    }
    function chapterThreeDialogue(G) {
        const extra = supplementalDialogue(G);
        if (extra)
            return extra;
        switch (G.scene) {
            case 'c3_band_q': return ctx.D('qiqi', '柒柒订了一桌饭，说是给专场攒劲。席间她给每个女生都夹了菜，讲了很多银行里有趣的客人，一桌人笑作一团。', ctx.choice('（吃得开心）', 'band_q_a', () => ctx.affUp('qiqi', 2)), ctx.choice('留心观察', 'band_q_b', () => { G.flags.qiWatch = (G.flags.qiWatch || 0) + 1; }));
            case 'c3_band_zhou': return ctx.D('xiaozhou', '（小周的谱子被柠檬拿去「参考」，还回来时上面画满了不相干的记号。小周抱着谱子，眼睛有点红。）', ctx.choice('帮小周重新整理', 'band_zhou_a', () => { ctx.affUp('xiaozhou', 1); G.flags.zhouHelp = 1; }), ctx.choice('安慰小周几句', 'band_zhou_b', () => ctx.affUp('xiaozhou', 1)));
            case 'c3_band_bill': return ctx.D('shiyuan', G.flags.taIn ? '（Bill 还是没来。十元对着空空的鼓位发了会儿呆，然后转过头笑：「没关系，我们有小塔。」）' : '（Bill 还是没来。十元对着空空的鼓位发了会儿呆，然后转过头笑：「没关系，我们重新排。」）', ctx.choice('陪十元加练', 'band_bill_a', () => ctx.affUp('shiyuan', 2)), ctx.choice('默默把自己的声部磨好', 'band_bill_b', () => { ctx.plotTech(1); }));
            case 'after_practice': return ctx.D('kongge', '空格把谱子合上，点了点头。专场又近了一点，今晚的练习先到这里。', ctx.choice('继续筹备', 'menu'));
            case 'b_live': return G.tech >= 14 ? ctx.D('narrator', `第 ${G.week} 周。530 陶喆专场，票已经卖出去了——上场吧。`, ctx.choice('出战 530 专场', 'live_intro', ctx.initLive)) : ctx.D('kongge', `琴技 ${G.tech}，首席空格摇头：「这水平上会翻车。」\n琴技不足 14，先把这一段练稳。`, ctx.extraPracticeChoice(), ctx.choice('返回本周安排', 'menu'));
            case 'live_intro': return ctx.D('shiyuan', '530 专场！台下坐满了人，朱老师、垃垃、TIM 都在侧幕——上吧！', ctx.choice('上！', 'live_play'));
            case 'be_shiyuan': return ctx.D('narrator', '（你把所有的目光都给了团长。）十元的笑容依旧明亮，可某一天你回过头，身后已经没有了合奏的人。\n\n这一周目走到了结尾，已建立的全局羁绊仍然保留。', ctx.choice('BE · 团长的影子', 'title4'));
            default: return null;
        }
    }
    function thirdTitleHTML() { const r = ctx.R(), e = ctx.ENDINGS[r.ending]; return `<div class="cp-surface"><div class="cp-ending-hero">${I(e?.icon || 'album')}<div class="cp-overline">${e?.code || 'CHAPTER III · COMPLETE'}</div><h3>${e?.title || '星光530 · 已结束'}</h3><p class="cp-caption">${ctx.E(e?.text || '这一章已落幕，你的旅程已经保存。')}</p>${r.live ? `<p class="cp-caption">专场得分 ${r.live.score} / 难度 ${r.live.diff}</p>` : ''}</div><div class="cp-choices">${e ? `<button class="cp-choice gold" data-memory="${e.memory}"><span>收藏这次落幕<small>剧情、人物与结局奖励已保存，重玩不重复领奖</small></span>${I('album')}</button>` : ''}${ctx.actionButton('restart', '从第三章起点重选', 'repeat', 'secondary')}<button class="btn secondary" data-cp-action="switch-chapter" data-cp-chapter="2">回到第二章 ${I('back')}</button><button class="btn primary" data-route="cards">看看相遇的伙伴 ${I('cards')}</button></div><div class="cp-teaser"><strong>第四章 · 剧场之夜 <span class="label-tag">已开放</span></strong>6月7日，鹭湖剧院。独奏、和声与赞助提案，都将在舞台上得到回应。<br><button class="btn primary" style="margin-top:14px" data-cp-action="switch-chapter" data-cp-chapter="4">继续第四章 ${I('arrow')}</button></div></div>`; }
    function thirdHelp() { return `<p>${ECONOMY_HELP}</p><div class="cp-rule-table"><strong>专场筹备</strong><span>认识柒柒，走过柠檬与小周的筹备插曲、大鹅的离开和鼓位选择。做出回应后，还可以读到每个选择的后续对白。</span><strong>周常行动</strong><span>练琴消耗 10 音符，琴技 +2；音符不足可先免费演奏。谱页事件在章节前段连贯呈现，鼓位安排在第 5 周；聚餐和加练可从相遇卡进入，自由合练进入首席考核。聊天提升羁绊分，点击前往下一周推进时间。</span><strong>幕间的心事</strong><span>人物关系会影响幕间事件。若长期只关注一人，也会听到团内的议论；结束本周时会记录发生的变化。请留意已读对白和排练手记。</span><strong>530 专场</strong><span>第 6 周登台，琴技至少 14。五段演奏，PERFECT +10、GOOD +6、区外 +2。难度为 14 + 登台周数；小塔加入 −2，等待 Bill +2。分段可以暂停与继续，结局会依据演奏和本章选择确定。</span><strong>章节存档</strong><span>完成第二章后解锁，自动沿用第一章的名字与乐器并承接前章进度。六章分别保存，重开只恢复本章入口。人物首次在已读剧情中被提到就自动加入卡册，回忆与奖励每项只领取一次。</span></div>`; }
    return { supplementalDialogue, chapterThreeDialogue, thirdTitleHTML, thirdHelp };
}
