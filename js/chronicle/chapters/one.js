'use strict';

// Private Chronicle feature. ctx contains live accessors to sibling features and controller state.
function createChronicleChaptersOne(ctx) {
    function bandStep(id, text) {
        const gain = claimBandMilestone(id);
        if (gain)
            ctx.log(`${text}：乐队提升到 Lv.${globalBandLevel()}。`);
    }
    function dialogue(run = ctx.R(), meta = state?.chronicle) {
        const weekly = ctx.weeklyDialogue(run);
        if (weekly) return weekly;
        const G = run;
        const bar = ctx.barDialogue(G);
        if (bar)
            return bar;
        if (G.chapter >= 5) {
            const d = ctx.lateChapterDialogue(G, meta);
            if (d)
                return d;
        }
        if (G.chapter === 4) {
            const d = ctx.chapterFourDialogue(G);
            if (d)
                return d;
        }
        if (G.chapter === 3) {
            const d = ctx.chapterThreeDialogue(G);
            if (d)
                return d;
        }
        if (G.chapter === 2) {
            const d = ctx.chapterTwoDialogue(G);
            if (d)
                return d;
        }
        switch (G.scene) {
            case 's_door': return ctx.D('lala', '山丘酒吧还没到营业高峰，吧台旁已经摆好了谱架。\n\n哦呀，新人？我是垃垃，拉二提的。三提需要补位时，也可以找我。', ctx.choice('自我介绍：我是' + G.name + '，' + G.inst + '。', 's_room', () => ctx.affUp('lala', 1)), ctx.choice('（拘谨地点头）', 's_room'), ctx.choice('请问，十元在吗？', 's_room', () => { G.flags.askShi = 1; ctx.affUp('shiyuan', 1); }));
            case 's_room': return ctx.D('lala', '来得正好，今晚排练。角落那个在拉《小星星》的，就是我们团长——十元。', ctx.choice('去跟十元打招呼', 's_shi'), ctx.choice('先四处看看', 's_look', () => { G.flags.look = 1; }));
            case 's_look': return ctx.D('lala', '眼光不错。那边翻谱比谁都快的是阿喆；谱架后面阴影里那位是笛杰，别盯着他看，会 emo；门口调试相机的是汤少——别被他拍到丑照。', ctx.choice('去找十元', 's_shi'));
            case 's_shi': return ctx.D('shiyuan', '（琴声停）哇，新面孔！你好你好——你是来加入我们的吗？没你不行！我们正好缺' + G.inst + '！', ctx.choice('「我加入。请多指教。」', 's_first', () => ctx.affUp('shiyuan', 2)), ctx.choice('「先说说，乐团的目标是什么？」', 's_dream', () => { ctx.affUp('shiyuan', 1); G.flags.ambition = 1; }));
            case 's_dream': return ctx.D('shiyuan', '（眼睛亮起来）商业化！让哈基米乐团站上真正的舞台！……虽然现在我连音准都不稳，嘿嘿。', ctx.choice('「我帮你。」', 's_first', () => { ctx.affUp('shiyuan', 3); G.flags.promise = 1; }), ctx.choice('「志向很远大。」', 's_first'));
            case 's_first': return ctx.D('kongge', '安静。（全团瞬间坐直）新人，报上乐器。……好，' + G.inst + '，坐第三排。今晚先过一遍《欢乐颂》，让我听听你的水平。', ctx.choice('（开始排练）', 'practice_partner', () => ctx.initPractice('intro')));
            case 'after_practice': return G.battle?.win ?
                ctx.D('kongge', [ctx.spoken('kongge', '排练结束。首席空格点了点头：「还行，能跟上。」'), ctx.spoken('dijie', '笛杰小声说：「刚才那段……我可以帮你做个节拍器程序。」')], ctx.choice('继续', 's_conflict')) :
                ctx.D('azhe', '排练结束。首席空格指了指需要回去再练的几个小节。\n阿喆凑过来：「翻谱跟不上可以叫我，我一秒一页。」', ctx.choice('继续', 's_conflict'));
            case 's_conflict': return G.level < 2 ? ctx.D('narrator', '（门口两个主唱人选擦肩而过——飞鸿和雪子，都是来帮忙的酱油角色。等乐团上了轨道，他们的故事才会开始。）', ctx.choice('（记住了这两个人）', 's_endweek')) :
                ctx.D('feihong', '（排练散场，门口传来争执声）……我知道我音准不如人，但主唱的位置，请再考虑一下。（对面是雪子——飞鸿的情敌，也是另一个主唱人选）', ctx.choice('站出来替飞鸿说话', 's_fei1', () => { ctx.affUp('feihong', 3); G.flags.feiSide = 1; }), ctx.choice('静观其变', 's_fei2', () => ctx.darkUp('feihong', 1)));
            case 's_fei1': return ctx.D('feihong', '（愣住，然后冲你深深鞠躬）谢谢……我叫飞鸿。你的恩情，我用和声还。', ctx.choice('「一起加油吧。」', 's_endweek', () => ctx.affUp('feihong', 2)), ctx.choice('（拍拍他的肩）', 's_endweek', () => ctx.affUp('feihong', 1)));
            case 's_fei2': return ctx.D('feihong', '（他看到了你，眼神暗了一下，没说什么，转身走了。）', ctx.choice('……', 's_endweek'));
            case 'c1_band_offer': return ctx.D('baoshi', '散场后，宝石拿着一段没有做完的 Demo 找到飞鸿。主旋律和和声都在，鼓、贝斯、吉他和键盘暂时还是导轨。\n\n飞鸿低声说：「主唱的位置已经够乱了。我的和声先删掉吧，别再给大家添麻烦。」\n宝石把耳机摘下来：「我找你录这首歌，不是为了让你随时把位置让出去。」', ctx.choice('「别拆。既然最初是两个人的版本，就把它做完。」', 'menu', () => bandStep('band:c1:formation-choice', '支持宝石与飞鸿保留乐队方案')), ctx.choice('「先按乐团总谱排，Demo 以后再说。」', 'menu'), ctx.choice('「你们先把真正介意的事说清楚。」', 'menu'));
            case 'c1_band_commit': return ctx.D('feihong', '宝石把两支话筒并排架好，飞鸿却站在监听室门口没有进去。\n\n「我怕最后还是拖他后腿。」\n宝石隔着玻璃回了一句：「那就一起把不好听的地方改掉。别替我决定要不要你。」', ctx.choice('请他们以主唱与和声的完整编制试排', 'menu', () => bandStep('band:c1:commit-choice', '两人决定共同完成乐队 Demo')), ctx.choice('建议宝石先录独唱版本', 'menu'), ctx.choice('建议飞鸿只留下临时参考音轨', 'menu'));
            case 'c1_band_rehearsal': return ctx.D('narrator', '第一遍副歌结束，两个声部的音都对，却挤在同一个拍点上。宝石的主旋律刚抬头，飞鸿的和声已经盖了上来。\n\n你坐在监听台前，需要指出下一遍最该调整的位置。', ctx.choice('让飞鸿的和声晚半拍进入，给主旋律留下空间', 'menu', () => bandStep('band:c1:rehearsal', '宝石与飞鸿完成首次双声部合练')), ctx.choice('把两个声部都再唱响一点', 'c1_band_rehearsal_retry'), ctx.choice('删掉和声，只保留宝石的主旋律', 'c1_band_rehearsal_retry'));
            case 'c1_band_rehearsal_retry': return ctx.D('baoshi', '宝石按下暂停：「不是谁唱得更响的问题。主旋律和和声需要先后呼吸，才不会互相挡住。」\n\n飞鸿把副歌倒回开头，等着你重新给出监听意见。', ctx.choice('让和声晚半拍进入，再在尾音处合上', 'menu', () => bandStep('band:c1:rehearsal', '宝石与飞鸿完成首次双声部合练')));
            case 'c1_band_arrangement': return ctx.D('baoshi', '双声部已经合稳，桌上留下三个版本：并回乐团总谱的管弦版、两边各退一步的融合版，以及保留鼓组、贝斯、吉他和键盘导轨的乐队版。\n\n这份 Demo 会决定他们接下来要走的方向。', ctx.choice('保留乐队版，让主唱与和声站在节奏声部中央', 'menu', () => bandStep('band:c1:arrangement', '乐队版 Demo 编曲完成')), ctx.choice('改成乐团总谱版本', 'menu'), ctx.choice('采用融合版本，暂不成立独立乐队方案', 'menu'));
            case 'c1_band_qualification': return ctx.D('feihong', 'Demo 已经完成。朱老师听完，只留下一句话：「录音里能修，台上不能。把这一版带去节奏舞台，完整唱下来再谈组队。」\n\n资格试演由宝石主唱、飞鸿和声；其他声部继续使用 Demo 导轨。把两人加入编队，完整演奏达到 C，即可让乐队成长到 Lv.6。', ctx.choice('收好 Demo，准备资格试演', 'menu'));
            case 's_endweek': return ctx.D('narrator', `第 ${G.week} 周的传说，开始了。这周想怎么过？`, ctx.choice('进入本周安排', 'menu'));
            case 'gig': return ctx.D('shiyuan', '十元宣布：接到活了！商场快闪演出，第 6 周！赢了就有第一笔商演费！', ctx.choice('「交给我们。」', 'menu', () => { G.flags.gig = 1; ctx.affUp('shiyuan', 2); }), ctx.choice('「先排练再说。」', 'menu', () => { G.flags.gig = 1; }));
            case 'emo': return ctx.D('dijie', '合奏时有人连续进错拍……笛杰默默放下了笛子，眼神开始下雨。', ctx.choice('过去安慰笛杰', 'menu', () => { ctx.affUp('dijie', 2); ctx.darkUp('dijie', -1); }), ctx.choice('继续排练', 'menu', () => ctx.darkUp('dijie', 1)));
            case 'chat': {
                const lines = { tim: 'TIM 把谱架往中间挪了挪：「白天打卡，晚上练琴。这一页，我们一起看。」', yeshiyang: '叶思阳把节目单放下，递给你一杯水：「忙完合作条款，也该听听你的想法。」', shiyuan: '十元拉着你说了一小时乐团梦想，临走塞给你一颗糖：「没你不行！」', azhe: '阿喆给你演示了 0.3 秒翻谱，然后问：「你也喜欢陶喆吗？」', dijie: '笛杰和你聊了很久代码与长笛，走之前说：「今天……不 emo。」', feihong: '飞鸿给你唱了一段和声，高音飘到 high C：「这段，以后给你留着。」', tangshao: '汤少举起相机：「别动。」快门响后他说：「这张，只有我能拍出来。」', lala: '垃垃翻着乐团的旧记事本，给你讲了一段第一次排练的趣事：「这些日子，总要有人记得。」' };
                if (G.chapter >= 2)
                    lines.tim = 'TIM 给你带了国企茶室的茶叶：「别熬太晚，明天还要打卡……不是，排练。」';
                if (G.chapter === 3) {
                    lines.yeshiyang = '叶思阳递来温水，先问了十元的情况，才轮到你自己：「辛苦了。」';
                    lines.qiqi = '柒柒拉着你坐下，往你手里塞了块饼干：「多吃点，练琴的人不能饿着。」';
                }
                return ctx.D(G.chat, lines[G.chat] || '他向你点了点头，示意下次排练见。', ctx.choice('（开心）回到本周安排', 'menu'));
            }
            case 'b_live': return G.tech >= ctx.requiredTech(G) ? ctx.D('narrator', `第 ${G.week} 周。万事俱备——这场演出，是哈基米乐团商业化的第一块砖。`, ctx.choice('出战商场快闪', 'live_intro', ctx.initLive)) :
                ctx.D('kongge', `第 ${G.week} 周。琴技只有 ${G.tech}……首席空格摇头：「这样上台会翻车的。」\n\n琴技不足 ${ctx.requiredTech(G)}，演出延期练习。`, ctx.extraPracticeChoice(), ctx.choice('返回自由安排，调整状态', 'menu'));
            case 'live_intro': return ctx.D('shiyuan', '商场快闪，开始了。台下人越来越多——轮到你的' + G.inst + ' solo 了！', ctx.choice('深呼吸，上！', 'live_play'));
            case 'be_shiyuan': return ctx.D('narrator', '（你把所有时间都花在讨好团长上。）十元的笑容依旧，但你听见身后传来乐手收拾谱架的声音——没人再愿意和你合奏。音准 32 的《小星星》，你陪她拉了一千遍；而乐团的排练，你缺席了整整一个月。\n\n这一周目走到了结尾，已建立的全局羁绊仍然保留。', ctx.choice('BE · 团长的影子', 'title2'));
            default: return null;
        }
    }
    return { dialogue };
}
