'use strict';

// Private Chronicle feature. ctx contains live accessors to sibling features and controller state.
function createChronicleChaptersFiveSix(ctx) {
    // Chapters V–VI use the same journal, global bonds and idempotent ending rewards.
    function priorHeCount(m = state?.chronicle) {
        if (!m)
            return 0;
        return [1, 2, 3, 4, 5].filter(ch => ctx.chapterEndingIds(ch, m).some(id => ctx.endingType(id) === 'HE')).length;
    }
    function lateMilestones(r) { return r.chapter === 5 ? [[r.aff.shiyuan >= 80, `十元羁绊分 ${r.aff.shiyuan}/80`], [r.tech >= 20, `音乐节对决琴技 ${r.tech}/20`], [r.level >= 5, `乐团等级 ${r.level}/5（演出获胜也会升级）`], [!!r.ending, '走完这个夏天']] : [[r.aff.zhu >= 10, `朱老师羁绊分 ${r.aff.zhu}/10`], [priorHeCount() >= 4, `前期演出 HE ${priorHeCount()}/4`], [r.tech >= 20, `首演琴技 ${r.tech}/20`], [!!r.ending, '走到《拾光》的落幕']]; }
    function lateRulesHTML() { return ctx.R().chapter === 5 ? '<p>十元羁绊分达到 80，进入音乐节故事线。上台需要琴技 18；演出获胜后，琴技达到 20、乐团等级达到 5、十元羁绊分达到 80，才能赢下这次对决。可通过练琴、合练和聊天准备。</p>' : `<p>首演需要琴技 20。朱老师羁绊分达到 10，且前五章累计至少四章演出 HE，剧本才能完成；首演获胜则迎来圆满开幕。</p><p>当前前期演出 HE：${priorHeCount()}/4。第一章成功演出计入；每章最多计一次，同一结局重玩不会重复累计。可返回已解锁章节补齐，已获得的羁绊与结局保留。</p>`; }
    function lateChapterDialogue(G, meta) {
        const done = id => ctx.choice('收好这一幕，继续', 'title' + (G.chapter + 1), () => ctx.ending(id));
        switch (G.scene) {
            case 'c5_intro': return G.aff.shiyuan < 80 ? ctx.D('narrator', '第五章 · 夏天的形状。\n\n夏日音乐节的邀请送到了乐团，十元在排练室转了三圈。可你望向她的目光，还没有到达那条线的彼岸。\n\n十元羁绊需达到 80，才能进入她的故事线。', ctx.choice('—— TE · 夏天的风 ——', 'title6', () => ctx.ending('c5_wind'))) : ctx.D('huangyx', '第五章 · 夏天的形状。\n\n夏日音乐节，十元要带着哈基米站上最大的户外舞台。招商会上，一个戴眼镜的斯文男人把全场方案扫了一遍，指出三个漏洞，然后当场给出替代方案。他转身看向十元，声音放低：「场地方是我朋友。你只管上台，剩下的一切——我兜底。」\n\n他叫黄奕兴，中大硕士，创业公司 CEO，十元的多年好友。他的目光在她身上停留的秒数，超过了普通朋友。', ctx.choice('迎上去自我介绍', 'c5_rival', () => { G.flags.c5Met = 1; }));
            case 'c5_rival': return ctx.D('tangshao', '散场后汤少调出了他相机里的素材，罕见地严肃：「我的评估——智商 EX，资源 96，执行力 95，说唱……A。对十元的认真程度——EX。」\n他顿了顿：「你想赢他，只有一条路：音乐节当天，站到她身边去，站得比任何人都稳。」\n\n赢过他的条件：琴技 ≥20 · 乐团等级 ≥5 · 十元羁绊 ≥80 · 音乐节演出获胜。', ctx.choice('「我接受挑战。」', 'c5_menu'));
            case 'c5_menu': return ctx.D('narrator', '音乐节倒计时。每一个百分点，都要自己挣回来。', ctx.choice('进入本周安排', 'menu'));
            case 'c5_he': return ctx.D('shiyuan', [ctx.spoken('shiyuan', '音乐节最后一首歌，十元站在光里，忽然对着话筒说：「这首歌，送给那个总是站在我身后的人。没你不行——这次，不是口头禅。」'), ctx.spoken('huangyx', '全场欢呼里，黄奕兴在台下鼓掌，笑容得体。散场后他走到你们面前，把一份文件递给十元：「场地尾款结清了，以后不用再找我兜底。」\n然后他向你伸出手：「她交给你了。兜底这份工作，以后归你。」')], done('c5_he'));
            case 'c5_be': return ctx.D('narrator', [ctx.spoken('narrator', '两年后。你以乐团成员的身份，坐在婚宴舞台的侧席。婚礼进行曲响起，十元穿着婚纱，挽着黄奕兴，从通道那头走来。'), ctx.spoken('shiyuan', `经过你身边时，她停下来，轻声说：「谢谢你，${G.name}。乐团就拜托你了。」`), ctx.spoken('narrator', '你笑了笑，琴弓没有停。你终究没能站上她身边的位置——但好歹，在她人生最重要的这一天，你的琴声没有走音。')], done('c5_be'));
            case 'c5_fail': return ctx.D('narrator', '音乐节中段，大风刮跑了谱架，也刮乱了节拍。观众很宽容，十元很坚强，可你知道有些东西不一样了。散场后黄奕兴把外套披在十元肩上，动作熟练得像排练过千百次。', done('c5_fail'));
            case 'c5_band_y': return ctx.D('huangyx', '排练室外，黄奕兴送来功能饮料和一份排练时间表，纸条上写着：「按这个节奏表练，效率提升 40%。——Y」', ctx.choice('参考他的时间表 · 首次琴技 +2', 'menu', () => { ctx.plotTech(2); }), ctx.choice('坚持和十元商量好的节奏', 'menu', () => ctx.affUp('shiyuan', 1)));
            case 'c5_band_bao': return ctx.D('baoshi', '宝石提着纸袋偷偷溜进排练室，袋口露出一截布料。他慌忙按住：「这、这是给朋友的裙子……不，衣服！」', ctx.choice('替他保密', 'menu', () => { ctx.affUp('baoshi', 2); G.flags.baoGirl = 1; }), ctx.choice('假装只是路过', 'menu'));
            case 'c6_intro': return ctx.D('zhu', '第六章 · 开幕之夜。\n\n音乐剧《拾光》，立项成功。朱老师——音乐剧博士在读、本项目的主导人——站在排练室中央，捧出一摞手写总谱，眼睛里全是光。弦乐组翻开第一页，集体沉默：谱上的旋律美得不像话，但和弦标记……对不上任何一本教材。\n\n「别管和弦，」朱老师理直气壮，「听我哼，跟着感觉走。」', ctx.choice('接过总谱', 'c6_zhu', () => { G.flags.c6Met = 1; }));
            case 'c6_zhu': return ctx.D('zhu', '首演筹备的第二周。朱老师几乎住在了琴房，咖啡杯摞成塔，稿子改到第七版。有天深夜你路过，看见他对着空谱纸发呆，小声嘀咕：「为什么这里……就是写不下去呢……」', ctx.choice('进去陪他改谱', 'c6_warn', () => ctx.affUp('zhu', 3)), ctx.choice('帮他校对和声', 'c6_warn', () => { ctx.affUp('zhu', 3); ctx.plotTech(1); }), ctx.choice('不打扰，回去睡觉', 'c6_warn'));
            case 'c6_warn': return ctx.D('lala', `垃垃把你拉到一边：「跟你说件事。朱老师这个人，写歌靠天分，撑项目靠心气——他的心气，是需要人捧着的。前期 ${priorHeCount(meta)} 场演出 HE，是你和乐团挣来的底气；但这份稿子能不能写出来……」她看了眼琴房的方向，「得有人陪他走到最后。」\n\n音乐剧顺利开幕的条件：朱老师羁绊 ≥10 · 前期演出 HE ≥4 · 首演获胜。\n前期 HE 按不同章节计数，第一章成功演出也计入。`, ctx.choice('「我明白了。」', 'c6_menu'));
            case 'c6_menu': return ctx.D('narrator', '首演倒计时。多去琴房走走，总谱是不会自己写完的。', ctx.choice('进入本周安排', 'menu'));
            case 'c6_band_zhu': return ctx.D('zhu', '音乐剧的小号手临时请假，朱老师默默从包里掏出一支卡祖笛，认真吹起了小号声部。全团憋笑憋到内伤，但音居然一个没错。', ctx.choice('「老师，收我为徒吧。」', 'menu', () => ctx.affUp('zhu', 2)), ctx.choice('偷偷录下来 · 首次琴技 +1', 'menu', () => { ctx.plotTech(1); }));
            case 'c6_band_q': return ctx.D('qiqi', '柒柒又来探班，给朱老师带了燕窝：「写稿子辛苦啦，有什么需要跟姐说。」朱老师感动得不行，垃垃在旁边欲言又止。', ctx.choice('婉拒她的深入介入', 'menu', () => ctx.affUp('lala', 1)), ctx.choice('静观其变', 'menu'));
            case 'c6_be': return ctx.D('zhu', '首演前一周。朱老师把最后一版手稿收进了抽屉，对大家深深鞠了一躬：「对不起。稿子写不动了……是我没撑住。」\n\n那天晚上的排练室格外安静。海报印好了，票卖出去了，可音乐剧的每一个音符，都还锁在他的抽屉里。', done('c6_be'));
            case 'c6_he': return ctx.D('narrator', '首演之夜，剧场满座。音乐剧《拾光》开幕的瞬间，灯光像慢动作的流星雨。朱老师站在侧幕，跟着台上的旋律小声哼唱——手里还握着那支卡祖笛，生怕哪个声部掉了队。\n\n谢幕时，十元把朱老师推到台前。他手足无措地鞠了一躬，眼镜都滑到了鼻尖。全场掌声经久不息。', done('c6_he'));
            case 'c6_te': return ctx.D('narrator', '首演总体顺利——只有一个声部在第三幕乱了四十秒，朱老师在侧幕急出了满头汗，差点吹起卡祖笛。观众没有察觉，可你知道，这部音乐剧还欠一次完美。', done('c6_te'));
            case 'chat':
                if (G.chat === 'huangyx')
                    return ctx.D('huangyx', '黄奕兴推了推眼镜，递来一份合作方案：「音乐节的事，交给我兜底。对她好点。」', ctx.choice('收好方案，回去排练', 'menu'));
                if (G.chapter === 6 && G.chat === 'zhu')
                    return ctx.D('zhu', '朱老师顶着黑眼圈把一沓手稿塞给你：「帮、帮我看看这个和弦……算了你别看了，听我哼就行。」', ctx.choice('陪他把这一句唱完', 'menu'));
                return ctx.chapterFourDialogue(G);
            case 'b_live':
                if (G.chapter === 6 && (G.aff.zhu < 10 || priorHeCount(meta) < 4))
                    return ctx.D('narrator', `首演临近，总谱还没写完。\n朱老师羁绊分 ${G.aff.zhu}/10 · 前期演出 HE ${priorHeCount(meta)}/4。\n可以回到本周安排继续陪伴他，也可以返回前章补齐演出 HE；如果按当前准备继续，将无法开幕。`, ctx.choice('继续这次首演安排', 'c6_be', () => ctx.ending('c6_be')), ctx.choice('再准备一下', 'menu'));
                return G.tech >= ctx.requiredTech(G) ? ctx.D('narrator', `第 ${G.week} 周。${ctx.stageName(G)}，大幕即将拉开。`, ctx.choice('准备登台', 'live_intro', ctx.initLive), ctx.choice('再准备一下', 'menu')) : ctx.D('kongge', `琴技 ${G.tech}，首席空格摇头：「先把这一段练稳。」\n上台需要琴技 ${ctx.requiredTech(G)}。`, ctx.extraPracticeChoice(), ctx.choice('返回本周安排', 'menu'));
            case 'live_intro': return ctx.D('shiyuan', G.chapter === 6 ? '《拾光》开幕！这一晚，我们把两年的路，唱给所有人听！' : '夏日音乐节！最大的户外舞台——站到我身边来，一起把这一首弹完！', ctx.choice('深呼吸，上！', 'live_play'));
        }
        return null;
    }
    function lateTitleHTML() { const r = ctx.R(), e = ctx.ENDINGS[r.ending]; return `<div class="cp-surface"><div class="cp-ending-hero">${I(e?.icon || 'album')}<div class="cp-overline">${e?.code || 'CHAPTER COMPLETE'}</div><h3>${ctx.E(e?.title || ctx.chapterName() + ' · 完')}</h3><p class="cp-caption">${ctx.E(e?.text || '这一章的旅程已经保存。')}</p>${r.live ? `<p class="cp-caption">演出得分 ${r.live.score} / 难度 ${r.live.diff}</p>` : ''}</div><div class="cp-choices">${e ? `<button class="cp-choice gold" data-memory="${e.memory}"><span>重看这次落幕<small>人物、回忆与结局奖励已保存</small></span>${I('album')}</button>` : ''}${r.chapter === 5 ? '<button class="btn primary" data-cp-action="switch-chapter" data-cp-chapter="6">继续第六章 · 开幕之夜 →</button>' : '<div class="cp-teaser"><strong>正传第一季 · 完</strong>从山丘酒吧到剧场舞台，我们走完了第一程。<br>外传《哈基米学园》——平行世界的纯恋爱故事，敬请期待。</div>'}${ctx.actionButton('restart', '从本章起点重选', 'repeat', 'secondary')}<button class="btn secondary" data-cp-action="switch-chapter" data-cp-chapter="${r.chapter - 1}">返回前一章</button><button class="btn secondary" data-route="cards">看看相遇的伙伴</button></div></div>`; }
    return { priorHeCount, lateMilestones, lateRulesHTML, lateChapterDialogue, lateTitleHTML };
}
