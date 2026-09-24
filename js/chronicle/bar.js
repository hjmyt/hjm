'use strict';

// Private Chronicle feature. ctx contains live accessors to sibling features and controller state.
function createChronicleBar(ctx) {
    function savedChapter(m, ch) { return m.run.chapter === ch ? m.run : m.slots[ch]; }
    function shouldCloseBar(m = ctx.M()) { return [1, 2, 3].every(ch => savedChapter(m, ch)?.bar?.order === 'decline'); }
    function normalizeFourthOpening(r, m) {
        if (!r || r.chapter !== 4 || !['zhu_offer', 'zhu_reply', 'shanqiu_closed', 'c4_intro'].includes(r.scene))
            return;
        r.bar.closed = shouldCloseBar(m);
        r.bar.returnTo = 'c4_intro';
        if (!r.bar.closed) {
            r.scene = 'c4_intro';
            return;
        }
        if (!r.bar.closureSeen) {
            r.scene = 'shanqiu_closed';
            return;
        }
        if (!r.bar.order)
            r.scene = 'zhu_offer';
        else if (r.scene === 'zhu_offer' || r.scene === 'shanqiu_closed')
            r.scene = 'zhu_reply';
    }
    function beginBarChapter() { const r = ctx.R(); r.bar = { order: null, returnTo: 'c' + r.chapter + '_intro', closed: false, closureSeen: false }; r.scene = r.chapter >= 4 ? 'c' + r.chapter + '_intro' : 'zhu_offer'; normalizeFourthOpening(r, ctx.M()); }
    function barDialogue(r) {
        if (r.scene === 'shanqiu_closed')
            return ctx.D('zhu', '山丘酒吧，停业了。前三章，朱老师递来的酒单都被轻轻推了回来。现在，谱架收进纸箱，椅子倒扣在桌上。朱老师把钥匙放下：「场地没了，戏还得写。剧场见。」');
        if (r.scene === 'zhu_offer' && (r.chapter < 4 || r.chapter === 4 && r.bar.closed && r.bar.closureSeen))
            return ctx.D('zhu', r.bar.closed ? '朱老师在剧院门口拎着最后一箱饮料，还是那句：「要不要来一杯？」\n「这次我请。店关了，朋友还在。」' : r.chapter === 1 ? '十元刚打过招呼，吧台后的朱老师就探过头来。\n「我是山丘的老板，这里也是你们的排练场地。要不要来一杯？」\n他擦了擦手，递给你一份酒单。' : '章节开始前，朱老师又从吧台后探出头，递来那份熟悉的酒单。\n「新一章了。要不要来一杯？」', ...ctx.SHANQIU_DRINKS.map(d => ({ ...ctx.choice(d.name + ' · ' + (r.bar.closed ? '这次我请' : d.cost + ' 音符'), 'zhu_reply', () => orderDrink(d.id)), disabled: !!r.bar.order || (!r.bar.closed && (state?.coins ?? 0) < d.cost) })), ctx.choice('谢谢，我不渴', 'zhu_reply', () => orderDrink('decline')));
        if (r.scene === 'chat' && r.chat === 'zhu' && r.chapter !== 6)
            return ctx.D('zhu', '朱老师把改了又改的谱子摊开：「这里的和弦……先别管。你听这句旋律，是不是还挺好听？」', ctx.choice('听他把这一句哼完', 'menu'));
        if (r.scene === 'zhu_reply') {
            const d = ctx.SHANQIU_DRINKS.find(x => x.id === r.bar.order);
            return ctx.D('zhu', d ? d.reply + '\n\n本章酒单羁绊奖励最多 +1，重玩不重复。' : '「好，谱架给你留着。」朱老师收回酒单，笑了笑，没有再劝。', ctx.choice('收好这次相遇，继续剧情', r.bar.returnTo || (r.chapter === 1 ? 's_first' : 'c' + r.chapter + '_intro')));
        }
        return null;
    }
    function orderDrink(id) {
        const r = ctx.R();
        if (r.chapter >= 4 && !(r.chapter === 4 && r.bar.closed && r.bar.closureSeen) || r.scene !== 'zhu_offer' || r.bar.order)
            return;
        const d = ctx.SHANQIU_DRINKS.find(x => x.id === id);
        if (!d && id !== 'decline' || d && !r.bar.closed && state.coins < d.cost)
            return;
        r.bar.order = id;
        if (d) {
            if (!r.bar.closed)
                state.coins -= d.cost;
            const gained = ctx.affUp('zhu', d.bond);
            ctx.log('山丘酒单：' + d.name + ' · ' + (r.bar.closed ? '朱老师请客' : d.cost + ' 音符') + ' · 朱老师羁绊分 +' + gained + '。');
        }
        else
            ctx.log('面对朱老师的酒单，你说：「谢谢，我不渴。」');
    }
    function barMenuHTML() { const r = ctx.R(), d = barDialogue(r), art = ''; return `<section class="cp-surface shanqiu-menu ${art ? 'cp-illustrated' : ''}">${art}<div class="cp-illustrated-copy">${ctx.speaker('zhu', r.bar.closed ? '停业之后 · 朱老师请客' : '每章一次 · 山丘酒单')}<div id="cpStoryText" class="cp-text">${ctx.E(d.text)}</div><div class="shanqiu-menu-head"><span>SHANQIU · 一杯，一段合奏</span><b>${r.bar.closed ? '今晚，朱老师请客' : '可用音符 ' + state.coins + ' ♪'}</b></div><div class="shanqiu-drinks">${ctx.SHANQIU_DRINKS.map((drink, i) => `<button class="shanqiu-drink" data-cp-choice="${i}" data-cp-rev="${r.rev}" ${r.bar.order || (!r.bar.closed && state.coins < drink.cost) ? 'disabled' : ''}><span class="shanqiu-drink-no">0${i + 1}</span><span><strong>${drink.name}</strong><small>${drink.note} · 标价 ¥${drink.price}</small></span><b>${r.bar.closed ? '请客' : drink.cost + ' ♪'}</b></button>`).join('')}</div><p class="cp-caption">${r.bar.closed ? '这是一次免费的剧情请客，不属于卡册投喂。本章首次接受心意羁绊分 +1，重玩不重复。' : '每章可点一杯，花费账户音符，全局余额同步扣减。音符不足时可先去演奏或读故事，也可以礼貌谢绝。本章首次点单羁绊分 +1，重玩不重复。'}</p><button class="btn ghost" data-cp-choice="4" data-cp-rev="${r.rev}" ${r.bar.order ? 'disabled' : ''}>谢谢，我不渴</button></div></section>`; }
    function closedBarHTML() { return `<div class="shanqiu-farewell"><img src="${ASSETS.shanqiuClosed}" alt="山丘酒吧停业后，倒扣的椅子与收起的谱架"><span class="eyebrow">CHAPTER 04 · 山丘的最后一盏灯</span><h3>山丘酒吧，停业了。</h3><p>前三章，朱老师递来的酒单，都被轻轻推了回来。<br>那间替大家留着灯的酒吧，最终没能撑到下一场演出。</p><p>谱架收进纸箱，椅子倒扣在桌上。<br>他擦完最后一个杯子，把钥匙放在吧台。</p><blockquote>「场地没了，戏还得写。<br>走吧，剧场见。」</blockquote></div>`; }
    function showBarClosure() { openModal('山丘的最后一盏灯', closedBarHTML() + `<button class="btn primary" data-cp-action="bar-continue">收好这段回忆，继续第四章 ${I('arrow')}</button>`); }
    return { savedChapter, shouldCloseBar, normalizeFourthOpening, beginBarChapter, barDialogue, orderDrink, barMenuHTML, closedBarHTML, showBarClosure };
}
