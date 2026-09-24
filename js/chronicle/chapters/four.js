'use strict';

// Private Chronicle feature. ctx contains live accessors to sibling features and controller state.
function createChronicleChaptersFour(ctx) {
    function chapterFourDialogue(G) {
        switch (G.scene) {
            case "c4_jeal": return ctx.D("qiqi", "（柒柒挽着你的手，笑得温柔：「妹妹，明天陪我去做脸吧，别总跟那群男生混在一起呀。」——这句话传进十元耳朵时，已经变了味道。）", ctx.choice("当晚就去找十元解释", "c4_jeal_a", () => { ctx.affUp("shiyuan", 2); G.flags.qiSeen = 1; }), ctx.choice("不解释，身正不怕影斜", "c4_jeal_b", () => { ctx.affUp("shiyuan", -2); }), ctx.choice("婉拒柒柒的邀请", "c4_jeal_c", () => { ctx.affUp("qiqi", 1); }));
            case "c4_jeal_a": return ctx.D("shiyuan", "（你当晚就去了琴房，把事情原原本本说了一遍。十元听完，眨眨眼：「就这事？我还以为……」她突然笑了，捶了你一下）「下次直接跟我说，不许让别人转达。没你不行，记得吗？」", ctx.choice("「记得。」", "menu"));
            case "c4_jeal_b": return ctx.D('qiqi', "（你没去解释。第二天排练，十元照旧冲你笑，只是那笑容里多了零点五秒的迟疑。柒柒挽着你的手更紧了些：「妹妹，走，做脸去。」镜子里，她笑得温柔极了。", ctx.choice("（继续）", "menu"));
            case "c4_jeal_c": return ctx.D("qiqi", "（你婉拒了。柒柒也不恼，轻轻捏了捏你的手：「那下次哦，不许推。」她转身走开，旗袍的盘扣在灯光下闪了一下。你心里那点说不清的异样，被她温柔的笑盖了过去。", ctx.choice("（继续）", "menu"));
            case "c4_intro": return ctx.D("yeshiyang", "第四章 · 剧场之夜。\n\n6月7日，鹭湖剧院，哈基米乐团的第一场剧场演出。叶思阳把一沓合同轻轻放在桌上：「场地、灯光、票务都谈好了。大家只管练琴，剩下的交给我。」他说话的时候，先把温水递给了坐在最边上的你。", ctx.choice("（接过温水）", "c4_prep"));
            case "c4_prep": return ctx.D('dayang', "排练进入冲刺期。大羊盯着节目单看了三天：「为什么我的 SOLO 只有八小节？」（据说他手机里存了四十个版本的候选 SOLO，全是网上「参考」的。）", ctx.choice("提议把他的 SOLO 扩成十六小节", "c4_prep_a", () => { ctx.affUp("dayang", 2); G.flags.yangSolo = 1; }), ctx.choice("按节目单来，保证整体", "c4_prep_b", () => { ctx.affUp("lala", 1); }), ctx.choice("让他自己跟十元谈", "c4_prep_c", () => { G.flags.yangCompromise = 1; }));
            case "c4_bao": return ctx.D("feihong", [ctx.spoken("feihong", "（主唱宝石第一次站上剧场舞台排练，紧张得同一句歌词唱了七遍。散场后，你看见飞鸿抱着谱子走过去：「我……我帮你唱和声吧，你跟着我的声音走。」"), ctx.spoken("baoshi", "宝石眼睛一亮：「真的吗！你真好！」（飞鸿的耳朵，红到了脖子根。）")], ctx.choice("鼓励宝石：你的声音天生属于舞台", "c4_bao_a", () => { ctx.affUp("baoshi", 2); G.flags.baoOK = 1; }), ctx.choice("帮他们重新排了声部", "c4_bao_b", () => { G.flags.baoOK = 1; ctx.affUp("feihong", 1); }));
            case "c4_qiqi": return ctx.D("qiqi", "（演出前一周，柒柒端着咖啡找到十元，笑着递上一份提案：「剧场演出费用不小吧？姐姐可以全额赞助——只要在海报上，加上我的名字。」她的旗袍在灯光下很好看，笑容也很好看。", ctx.choice("建议十元婉拒：名字属于全体团员", "c4_qiqi_a", () => { ctx.affUp("shiyuan", 2); G.flags.qiHandled = 1; G.flags.qHate = (G.flags.qHate || 0) + 1; }), ctx.choice("交给叶思阳去谈", "c4_qiqi_b", () => { ctx.affUp("yeshiyang", 2); G.flags.qiHandled = 1; }), ctx.choice("接受赞助，先渡过难关", "c4_qiqi_c", () => { ctx.plotNotes(5); }));
            case "c4_menu": return ctx.D("narrator", "6.7 就在下周。节目单与赞助安排已定，最后再把自己的声部练稳。", ctx.choice("进入本周安排", "menu"));
            case "be_mianbei": return ctx.D("narrator", "（柠檬说要带你去海外看更大的舞台，热情地帮你订了机票。临走前你回头望了一眼排练室——灯还亮着，十元在窗边说「等你回来」。）\n\n有些地方没有舞台，只有围墙。\n\n—— BE · 远方的机票 ——", ctx.choice("……", "title5", () => { G.ch = 5; }));
            case "be_qiqi4": return ctx.D("narrator", "（演出前三天，团里流传起一些话：谁靠关系上的节目单，谁收了谁的好处。没有人站出来承认，也没有人真正相信——可排练室的空气，一点一点冷了下去。6月7日那天，剧场的大门没有打开。）", ctx.choice("BE · 没等到的观众", "title5", () => { G.ch = 5; }));
            case "c4_he": return ctx.D("narrator", "6月7日，鹭湖剧院，满场。\n\n宝石的少年音落下第一秒，全场安静；小塔的鼓点推起第一排的心跳；大羊的__SOLO_BARS__ SOLO 弹得连他自己都愣住——这回他没看手机。返场时，十元拉着全员鞠躬，叶思阳在侧幕笑着鼓掌，眼里有光。".replace('__SOLO_BARS__', G.flags.yangSolo ? '十六小节' : G.flags.yangCompromise ? '十二小节' : '八小节'), ctx.choice("—— HE · 6.7 满场星光 ——", "title5", () => { G.ch = 5; }));
            case "c4_te": return ctx.D("narrator", "6月7日，演出顺利结束了。掌声是真的，只是谢幕时你望向侧幕——柒柒不在，宝石在找飞鸿，而大羊偷偷看了三次手机。\n\n有些星光亮过了，有些心事还悬着。", ctx.choice("—— TE · 谢幕后 ——", "title5", () => { G.ch = 5; }));
            case "c4_fail": return ctx.D('shiyuan', "剧场很大，大到第一声失误会被无限放大。演出中段乱掉的段落没有找回来，观众礼貌地鼓了掌。散场后十元坐在空座位上发了很久的呆，然后说：「下次，我们再来。」", ctx.choice("—— TE · 空了一半的剧场 ——", "title5", () => { G.ch = 5; }));
            case "c4_prep_a": return ctx.D("dayang", "（大羊盯着修改后的节目单看了很久，咳嗽一声：「十六小节……咳，算你有眼光。我练一个绝的给你看。」（他转身走后，你听见他小声给吉他调音，比平时认真十倍。", ctx.choice("（继续）", "c4_bao"));
            case "c4_prep_b": return ctx.D('dayang', "（大羊撇撇嘴没说什么。但那天排练，他的 SOLO 一句没出错——用实力说话的人，嘴上可以不饶人。", ctx.choice("（继续）", "c4_bao"));
            case "c4_prep_c": return ctx.D('shiyuan', "（你让他自己去谈。十元听完大羊的要求，笑着说：「再加四小节，剩下的留给别人发光。」大羊愣了愣，居然接受了。", ctx.choice("（继续）", "c4_bao"));
            case "c4_bao_a": return ctx.D("baoshi", "（宝石用力点头，眼睛亮晶晶的：「嗯！我会把第一句唱得特别干净，干净到……干净到像刚洗过的天空！」（他想的比喻很怪，但你莫名听懂了。", ctx.choice("「加油，舞台属于你。」", "c4_qiqi"));
            case "c4_bao_b": return ctx.D("feihong", "（你帮他们把声部重新排了。飞鸿看着新谱子，小声对你说：「谢谢。」顿了顿又补了一句，「他紧张的时候，眼睛会到处找……找我。我站他旁边就行。」", ctx.choice("（继续）", "c4_qiqi"));
            case "c4_qiqi_a": return ctx.D("shiyuan", [ctx.spoken("shiyuan", "（十元婉拒得很温柔：「柒柒姐，心意我们领了。但海报上每一个名字，都是一起扛过排练的人。」"), ctx.spoken("qiqi", "柒柒笑了，替十元理了理衣领：「好，听你的。」（她转身时，旗袍的盘扣在灯下闪了一下，你看不清她的表情。")], ctx.choice("（继续）", "c4_menu"));
            case "c4_qiqi_b": return ctx.D('qiqi', "（叶思阳接过提案，用三个小时把赞助拆成了「鸣谢单位」的形式：钱照收，名字只出现在致谢页最后一行。柒柒看完合同，笑了一声：「叶副团，真是……滴水不漏。」", ctx.choice("（继续）", "c4_menu"));
            case "c4_qiqi_c": return ctx.D("lala", "（赞助谈成了，排练室的咖啡变好了，可垃垃把海报看了很久：「总觉得，欠了不该欠的人。」", ctx.choice("（继续）", "c4_menu"));
            case "b4_lemon_a": return ctx.D("lemon", "（柠檬收下钱，帽檐压低：「够意思。下个月，双倍还你。」（下个月他没有还，但你收到一条语音：「兄弟，再借点？」", ctx.choice("（继续）", "menu"));
            case "b4_lemon_b": return ctx.D("lemon", "（柠檬撇撇嘴：「行吧，不借就不借。」他转身走了，帽子后面的眼神，你看不见。", ctx.choice("（继续）", "menu"));
            case "b4_zhou_a": return ctx.D("xiaozhou", "（小周深吸一口气，在空剧场弹了第一遍独奏。弹到一半断了，他自己笑起来：「再来。」那天你们练到了保安来催。", ctx.choice("（继续）", "menu"));
            case "b4_zhou_b": return ctx.D("xiaozhou", "（小周看着自己的手，小声：「星海的手型……真的够用吗？」你没有回答，只是把他的谱子翻到下一页。", ctx.choice("（继续）", "menu"));
            case "b4_bao_a": return ctx.D("baoshi", "（宝石听完你的话，认真地想了想：「那我把鸡皮疙瘩也唱进去。」（？？？但他第二天真的做到了。", ctx.choice("（继续）", "menu"));
            case "b4_bao_b": return ctx.D("baoshi", "（三遍练完，宝石递给你半瓶蜂蜜水：「润嗓的。你陪我练，也辛苦了。」", ctx.choice("（继续）", "menu"));
            case 'c4_band_lemon': return ctx.D('lemon', '柠檬压低帽檐凑过来：「兄弟，最近手头有点紧，借点？下个月肯定还。」他又递来一张远方的机票：「要不跟我出国挣大钱？」', { ...ctx.choice(state.coins < 20 ? '音符不足 20，暂时无法借出' : '借他 20 音符 · 首次羁绊分 +2', 'b4_lemon_a', () => {
                    if (state.coins < 20)
                        return;
                    state.coins -= 20;
                    ctx.affUp('lemon', 3);
                }), disabled: state.coins < 20 }, ctx.choice('婉拒 · 羁绊保持不变', 'b4_lemon_b'), ctx.choice('接受出国邀请 · 将结束本章人物线', 'be_mianbei', () => {
                G.flags.lemonDanger = 1;
                sourceCast().lemon.ended = true;
                state.cards.team = state.cards.team.filter(id => id !== 'lemon');
                if (state.cards.prepared?.id === 'lemon')
                    state.cards.prepared = null;
                unlock('lemon_be');
            }));
            case 'c4_band_zhou': return ctx.D('xiaozhou', '小周被安排了剧场演出的独奏段落，紧张得手指冰凉：「如果我搞砸了怎么办……」', ctx.choice('「搞砸了我陪你练到会。」', 'b4_zhou_a', () => { ctx.affUp('xiaozhou', 2); G.flags.zhouSolo = 1; }), ctx.choice('「相信星海的手型。」', 'b4_zhou_b', () => ctx.affUp('xiaozhou', 1)));
            case 'c4_band_bao': return ctx.D('baoshi', '宝石在空剧场练嗓，回声把他的声音托得很远。他冲你挥手：「你来啦！刚才那句，我唱得好吗？」', ctx.choice('「好到起鸡皮疙瘩。」', 'b4_bao_a', () => ctx.affUp('baoshi', 2)), ctx.choice('陪他再练三遍', 'b4_bao_b', () => { ctx.plotTech(1); ctx.affUp('baoshi', 1); }));
            case 'chat': {
                const lines = { shiyuan: '十元拉着你说了一小时乐团梦想，临走塞给你一颗糖：「没你不行！」', azhe: '阿喆给你演示了 0.3 秒翻谱，然后问：「你也喜欢陶喆吗？」', dijie: '笛杰和你聊了很久长笛，走之前说：「今天……不 emo。」', feihong: '飞鸿给你唱了一段和声，高音飘到 high C：「这段，以后给你留着。」', tangshao: '汤少举起相机：「别动。」快门响后他说：「这张，只有我能拍出来。」', tim: 'TIM 给你带了国企茶室的茶叶：「别熬太晚，明天还要打卡……不是，排练。」', yeshiyang: '叶思阳递来温水，先问了十元的情况，才轮到你自己：「辛苦了。」', qiqi: '柒柒拉着你坐下，往你手里塞了块饼干：「多吃点，练琴的人不能饿着。」', baoshi: '宝石捧着蜂蜜茶看你：「你今天……听起来有点累。要不要听我唱一段？」', xiaota: '小塔给你看了新手串：「第二十九串。你送的，戴着踏实。」', dayang: '大羊把 C 位让给你三分钟：「别多想，就是让你试试。」', xiaozhou: '小周小声说：「下周的独奏……你会来听吗？」', lemon: '柠檬压低帽檐，凑过来：「兄弟，最近手头有点紧……」', lala: '垃垃翻开剧场排练手记：「每个人的这一句，都要好好记下来。」' };
                return ctx.D(G.chat, lines[G.chat] || '排练间隙，你们约好下一次一起合奏。', ctx.choice('（继续）回到本周安排', 'menu'));
            }
            case 'b_live': return G.tech >= 15 ? ctx.D('narrator', `第 ${G.week} 周。6月7日，鹭湖剧院，大幕即将拉开。`, ctx.choice('出战剧场之夜', 'live_intro', ctx.initLive)) : ctx.D('kongge', `琴技 ${G.tech}，首席空格摇头：「这水平上会翻车。」\n琴技不足 15，先把这一段练稳。`, ctx.extraPracticeChoice(), ctx.choice('返回本周安排', 'menu'));
            case 'live_intro': return ctx.D('shiyuan', '剧场之夜！满场的灯光像星星掉进了观众席——上吧！', ctx.choice('上！', 'live_play'));
            case 'after_practice': return ctx.D('kongge', '空格合上谱子，示意大家休息。剧场里的每一个声部，正在慢慢合到一起。', ctx.choice('继续剧场筹备', 'menu'));
            case 'be_shiyuan': return ctx.D('narrator', '你把所有的目光都给了团长，却渐渐错过了其他伙伴的声音。\n\n这一周目走到了结尾，已建立的全局羁绊仍然保留。', ctx.choice('BE · 团长的影子', 'title5'));
            default: return null;
        }
    }
    function fourthTitleHTML() { const r = ctx.R(), e = ctx.ENDINGS[r.ending]; return `<div class="cp-surface"><div class="cp-ending-hero">${I(e?.icon || 'album')}<div class="cp-overline">${e?.code || 'CHAPTER IV · COMPLETE'}</div><h3>${e?.title || '剧场之夜 · 已结束'}</h3><p class="cp-caption">${ctx.E(e?.text || '这一章已落幕，你的旅程已经保存。')}</p>${r.live ? `<p class="cp-caption">剧场得分 ${r.live.score} / 难度 ${r.live.diff}</p>` : ''}</div><div class="cp-choices">${e ? `<button class="cp-choice gold" data-memory="${e.memory}"><span>重看这次落幕<small>人物、回忆与结局奖励已保存</small></span>${I('album')}</button>` : ''}${ctx.actionButton('restart', '从第四章起点重选', 'repeat', 'secondary')}<button class="btn secondary" data-cp-action="switch-chapter" data-cp-chapter="3">回到第三章 ${I('back')}</button><button class="btn primary" data-route="cards">看看相遇的伙伴 ${I('cards')}</button></div><div class="cp-teaser"><strong>第五章 · 夏天的形状 <span class="label-tag">已开放</span></strong>夏日音乐节的邀请，和新的相遇。<br><button class="btn primary" style="margin-top:14px" data-cp-action="switch-chapter" data-cp-chapter="5">继续第五章 ${I('arrow')}</button></div></div>`; }
    function fourthHelp() { return `<p>${ECONOMY_HELP}</p><div class="cp-rule-table"><strong>剧场冲刺</strong><span>6月7日，鹭湖剧院。走过大羊的 SOLO、宝石与飞鸿的和声、柒柒的赞助提案。读到人物时立即获得卡片。</span><strong>排练间隙</strong><span>独奏安排在章节前段连贯呈现；借款与练嗓按剧情进度开放为可选相遇，自由合练进入首席考核。借款需要至少 20 音符；普通借款或投喂不会触发人物线结局；选择接受出国邀请才会结束本章人物线。</span><strong>6.7 剧场之夜</strong><span>第 6 周可登台，琴技至少 15。五段演奏，每段 PERFECT +10、GOOD +6、区外 +2。难度为 15 + 登台周数；支持小周独奏 −2，扩展大羊 SOLO −1。演奏分数、声部安排与本章关系事件共同影响结局。</span><strong>承接与重选</strong><span>完成第三章后解锁，自动承接前章成长和已发生事件。六章分别保存；重开第四章恢复入口快照，保留其他章节、人物和回忆。原有隐藏档案仍需满足条件后主动展开。</span></div>`; }
    return { chapterFourDialogue, fourthTitleHTML, fourthHelp };
}
