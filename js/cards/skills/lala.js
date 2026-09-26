'use strict';

/* Lala extension / V6.2. Uses only the current, validated local save.
   Journal content is recorded from displayed scenes; no future scene is read here. */
function freshLala() { return { version: 2, cover: 'second', transcribed: false, autoRecap: true }; }
function cleanLala(input) {
    const d = freshLala();
    if (!input || typeof input !== 'object')
        return d;
    if (['second', 'third'].includes(input.cover))
        d.cover = input.cover;
    d.transcribed = input.transcribed === true;
    d.autoRecap = input.autoRecap !== false;
    return d;
}
function lalaState() { return state.cards.lala || (state.cards.lala = freshLala()); }
const LalaUI = { recap: false, journalChapter: null };
function lalaSectionName(section = lalaState().cover) { return { second: '二提本位', third: '三提补位' }[section] || '二提本位'; }
function lalaCoverBonus(ids = state.cards.team, section = lalaState().cover) {
    if (!ids.includes('lala') || section !== 'third')
        return 0;
    return ids.some(id => id !== 'lala' && cardDef(id)?.violinSeat === section) ? 0 : 2;
}
function lalaJianpuBonus(ids = state.cards.team) { return ids.includes('lala') && ids.includes('dijie') && lalaState().transcribed ? 2 : 0; }
function lalaEntryHTML() {
    return `<section class="lala-entry"><img src="${ASSETS.cardLala}" alt="垃垃的可爱虚拟头像"><div><span class="eyebrow">NEW · OUR STORYTELLER</span><h3>垃垃，正式加入卡册。</h3><p>二提 · 三提补位 · 乐团剧情原稿提供者</p></div><div class="lala-actions"><button class="btn primary small" data-card-open="lala">${I('violin')}认识垃垃</button><button class="btn ghost small" data-lala-action="journal">${I('album')}垃垃手记</button></div></section>`;
}
function mountLalaEntry() {
    if (!$('lalaHomeEntry')) {
        const e = document.createElement('div');
        e.id = 'lalaHomeEntry';
        e.innerHTML = lalaEntryHTML();
        $('homeFeature')?.parentNode.insertBefore(e, $('homeFeature'));
    }
}
function renderLalaDetail(c, own) {
    const ls = lalaState(), bond = cardBond('lala'), inTeam = state.cards.team.includes('lala');
    const fields = c.infoFields.map(([k, v]) => `<dt>${escapeHTML(k)}</dt><dd>${escapeHTML(v)}</dd>`).join('');
    const info = c.sourceSet ? renderSourceInfo(c) : `<section class="profile-panel"><h3 class="panel-title">${I('violin')}基本资料<span class="tiny">${cardRarity(c)} · 二提 / 三提补位</span></h3><dl class="profile-info">${fields}</dl><p class="info-bio">${escapeHTML(c.bio)}</p><div class="lala-credit">${I('album', 'sm')}乐团正传剧情原稿：垃垃</div><button class="text-btn" data-trio-art="lala">查看可爱虚拟头像</button></section>`;
    const stats = c.stats.map(([k, raw]) => { const value = newStat(c, raw); return `<div class="profile-stat"><div class="profile-stat-head"><span>${k}</span><strong>${value}${raw === 100 ? ' <small>· MAX</small>' : ''}</strong></div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, value)}%"></div></div></div>`; }).join('');
    const attrs = `<section class="profile-panel"><h3 class="panel-title">${I('stats')}属性面板<span class="tiny">音乐素养 · 满格热爱</span></h3><div class="profile-stats">${stats}</div><p class="stat-caption">${escapeHTML(c.statnote)}</p></section>`;
    const skills = `<section class="profile-panel"><h3 class="panel-title">${I('sparkles')}技能<span class="tiny">记录与陪伴，不占演奏主动位</span></h3><div class="skill-list">${skillBlock('乐团编年史', '主动技', c.activeText, '按章节整理已读对白、已选回应、本周行动和羁绊分。随时翻看，不消耗音符，不读取未经历的剧情。', `<button class="btn secondary small" data-lala-action="journal">${I('album')}翻开垃垃手记</button>`, false, '无') +
        skillBlock('全局旁白', '被动', c.passiveText, '第一章与第二章中的垃垃已同步使用这张可爱头像。关键对白会写入手记；入队参与全队加成，达标时合计最多 +2 音符。', '', false) +
        skillBlock('续章引路', '神技', '暂别排练室，再回来时，她会贴心梳理已经走过的故事，让每一次重逢都能自然接上下一章。', '重新进入「乐团剧情」时，依据本地存档展示「上回说到……」。仅回顾已发生的节点，不替你做决定。', `<button class="btn secondary small" data-lala-action="recap">${I('heart')}看看上回说到哪里</button><button class="btn ghost small" data-lala-action="toggle-recap" aria-pressed="${ls.autoRecap}">${ls.autoRecap ? '自动回顾：已开启' : '自动回顾：已关闭'}</button>`, true)}</div></section>`;
    const music = `<section class="profile-panel"><h3 class="panel-title">${I('violin')}音乐协作<span class="tiny">${inTeam ? '本场个人加成 +' + cardBonus('lala') + ' ♪' : '入队后参与演奏结算'}</span></h3><div class="lala-music-box"><h4>简谱相助</h4><p>把五线谱整理成笛杰熟悉的简谱，连拍子也标得清清楚楚。她让不同乐器的伙伴，都能轻松加入同一段旋律。</p><button class="btn secondary small" data-lala-action="score">${I('music')}${ls.transcribed ? '翻看那张简谱' : '一起整理一张简谱'}</button><small>这是内置的两小节示例，不是任意乐谱自动转换器。首次收好：两人各 +2 羁绊分、+10 经验；之后同队演奏基础奖励另 +2 ♪。</small></div><div class="lala-music-box"><h4>快速补位</h4><p>二提是她的本位；三提需要补位时，她也能迅速接过乐谱，让和声完整落在每一拍。</p><div class="lala-section-picker" aria-label="选择垃垃本场声部">${['second', 'third'].map(s => `<button class="btn ghost small ${s === ls.cover ? 'lala-selected' : ''}" data-lala-cover="${s}" aria-pressed="${s === ls.cover}">${lalaSectionName(s)}</button>`).join('')}</div><small>三提在当前编队缺席时，选择补位可让基础奖励另 +2 ♪。所有加成在开演时锁定；不改原音游的音色、谱面或判定。</small><p class="lala-section-state">当前：${lalaSectionName()}${inTeam ? ' · ' + (lalaCoverBonus() ? '补位加成 +2 ♪' : '本位演奏') : ' · 加入编队后生效'}${lalaJianpuBonus() ? ' · 简谱协作 +2 ♪' : ''}</p></div></section>`;
    return info + attrs + skills + music + (own ? lalaFeeding(c) : '');
}
function lalaFeeding(c) {
    const gifts = effectiveGifts(c), used = state.cards.daily.gifts.lala || 0, g = gifts.find(g => g[0] === CardUI.gift), bond = cardBond('lala'), lv = cardLevel('lala');
    return `<section class="profile-panel" id="cardFeeding"><h3 class="panel-title">${I('gift')}投喂 · 排练后的休息站<span class="tiny">普通投喂剩余 ${Math.max(0, 3 - used)}/3</span></h3>${CardUI.response ? `<div class="feed-response" role="status">${escapeHTML(CardUI.response)}</div>` : ''}<div class="gift-grid">${renderGiftChoices(c, gifts, used)}</div><div class="feeding-bottom"><div class="feeding-progress">${trioProgress('羁绊分', bond)}</div><button class="btn primary" id="cardFeedBtn" data-card-feed ${giftFeedDisabled(c, g, used) ? 'disabled' : ''}>${I('heart')}投喂${g ? ' ' + g[3] + ' ♪' : ''}</button></div><p class="feed-hint" id="cardGiftHint">${cardGiftHint(c, g, used)}</p><p class="stat-caption">她拉好二提，也随时准备为三提补位；哪里需要一个声部，她就稳稳接上。</p><div class="growth-strip"><div class="growth-copy">Lv.${lv} / 60 · 羁绊分 ${bond}/100<small>每 60 经验升 1 级；礼物内容为游戏设定。</small></div><button class="btn ghost small" data-card-train="lala" ${state.coins < 8 || lv >= 60 ? 'disabled' : ''}>${I('violin')}短练习 · 8 ♪</button></div></section>`;
}
function renderLalaBond() {
    const bond = cardBond('lala'), ch = CHARACTERS.find(c => c.id === 'lala');
    return `<section class="profile-panel"><h3 class="panel-title">${I('heart')}把每一次信任，都拉进合奏里</h3>${trioProgress('羁绊分', bond)}<div>${[[0, '认识彼此', '她替你留好谱位，也认真听你介绍自己的乐器。'], [20, '安心同行', '排练的细节有人照应，属于大家的回忆有人收藏。'], [35, '更多发现', '达到隐藏技能门槛，满足角色附加条件即可开启。'], [50, '默契搭档', '一张简谱、一段和声，都是心照不宣的配合。'], [80, '把故事写在一起', '台上一起演奏，台下一起把热爱的日子记下来。']].map(([n, t, d]) => `<div class="bond-milestone ${bond >= n ? 'unlocked' : ''}"><span class="milestone-icon">${I(bond >= n ? 'check' : 'lock')}</span><div><strong>${t} · ${n} 羁绊分</strong><p>${d}</p></div></div>`).join('')}</div><div class="bond-actions"><button class="btn primary" data-card-tab="detail">${I('gift')}送她一份心意</button><button class="btn secondary" data-card-bond-memory ${bond < 20 ? 'disabled' : ''}>${I('album')}收藏羁绊纪念</button></div><p class="stat-caption">每个角色一份羁绊分，正传、日常与卡册同步；信任是相处的表达。</p></section><section class="profile-panel bond-story-panel"><span class="eyebrow">A PAGE OF WARM HARMONY</span><h3>${ch?.chapter || '故事，正在正传里继续'}</h3><p>${ch?.quote || c.bio}</p><button class="btn secondary" data-card-story="lala">${I('violin')}${state.completed.includes('lala') ? '重温这页排练日常' : '翻开这页排练日常'}</button><p class="card-dialogue-note">根据已确认的人设扩写的互动片段；首次读完：15 音符、2 羁绊分与专属回忆。</p></section>`;
}
function setLalaCover(section) {
    if (!cardOwned('lala') || !['second', 'third'].includes(section))
        return;
    lalaState().cover = section;
    save();
    renderGlobal();
    toast('垃垃已准备' + lalaSectionName(section) + '。' + (['starting', 'running', 'countdown', 'paused'].includes(game.status) ? '当前演奏不变，从下一场生效。' : '下一场开演时锁定声部。'), true);
}
function lalaScoreSVG() {
    const ns = [['E', 4], ['F', 4], ['G', 4], ['E', 4], ['F', 4], ['G', 4], ['A', 4], ['G', 4]];
    const ys = { E: 74, F: 69, G: 64, A: 59 };
    return `<svg class="lala-score-svg" viewBox="0 0 600 122" role="img" aria-label="C大调，四四拍，两个小节：E F G E，F G A G；全部为四分音符"><rect width="600" height="122" rx="12" fill="#fffdf7"/>${[34, 44, 54, 64, 74].map(y => `<path d="M20 ${y}H578" stroke="#8b827a" stroke-width="1"/>`).join('')}<text x="23" y="75" font-size="58" font-family="serif">𝄞</text><text x="76" y="50" font-size="22" font-family="serif">4</text><text x="76" y="70" font-size="22" font-family="serif">4</text>${ns.map(([n, o], i) => { let x = 120 + i * 56 + (i > 3 ? 10 : 0), y = ys[n]; return `<ellipse cx="${x}" cy="${y}" rx="7" ry="4.8" transform="rotate(-18 ${x} ${y})" fill="#57494d"/><path d="M${x + 6} ${y}V${y - 30}" stroke="#57494d" stroke-width="2"/>`; }).join('')}<path d="M320 34V74 M573 34V74 M578 34V74" stroke="#57494d" stroke-width="1.7"/><text x="20" y="111" font-size="13" fill="#817276">五线谱示例 · 四分音符</text></svg>`;
}
function showLalaScore() {
    if (['running', 'countdown'].includes(game.status))
        pauseGame();
    const done = lalaState().transcribed;
    openModal('垃垃的简谱小课堂', `<div class="lala-modal-head"><img src="${ASSETS.cardLala}" alt="垃垃的虚拟头像"><div><span class="eyebrow">A LITTLE HELP, A FULLER HARMONY</span><h3>换一种记谱，一样能好好合奏。</h3><p>“先跟着我数四拍，再把这一句吹出来。”</p></div></div><p>内置练习示例：C 大调，4/4 拍。每个音一拍；两种记谱表达的是同一段旋律。</p>${lalaScoreSVG()}<div class="lala-number-score"><span>1 = C　4/4</span><strong>3　4　5　3　│　4　5　6　5　‖</strong><small>每个数字都是一拍，先慢慢数，再连成一句。</small></div><p>她把乐谱上的旋律写成笛杰熟悉的数字，再一起核对音高与节奏。对她而言，音乐素养不只用来拉好自己的声部，也能让伙伴更有底气。</p><div class="lala-actions" style="margin-top:18px"><button class="btn primary" data-lala-action="keep-score" ${done ? 'disabled' : ''}>${I('check')}${done ? '这张简谱已经收好' : '收好这张简谱'}</button><button class="btn ghost" data-lala-action="score-audio">${I('play')}听听这两小节</button></div><div class="modal-foot">首次收好：垃垃羁绊分 +2、笛杰羁绊分 +2，两人各 +10 经验；解锁「谱上的温柔」。之后两人同队完成有命中的演奏，参与全队加成，达标时合计最多 +2 音符。不是任意乐谱自动转写功能。</div>`);
}
function keepLalaScore() {
    if (!cardOwned('lala') || lalaState().transcribed)
        return;
    lalaState().transcribed = true;
    grantBond('lala', 2, { key: 'special:lala-score:lala' });
    grantBond('dijie', 2, { key: 'special:lala-score:dijie' });
    addCardXP('lala', 10);
    addCardXP('dijie', 10);
    unlock('lala_score');
    save();
    renderGlobal();
    showLalaScore();
    toast('简谱已收好 · 两人羁绊分 +2、经验 +10', true);
}
let lalaAudioBusy = false;
async function playLalaScore() {
    if (lalaAudioBusy || !state.sound) {
        if (!state.sound)
            toast('声音已关闭，可在右上角打开。');
        return;
    }
    lalaAudioBusy = true;
    const ac = await ensureAudio();
    if (!ac) {
        lalaAudioBusy = false;
        return;
    }
    [64, 65, 67, 64, 65, 67, 69, 67].forEach((n, i) => toneAt(n, ac.currentTime + .08 + i * .45, .32, .09, 'preview', 'triangle'));
    setTimeout(() => { lalaAudioBusy = false; }, 3900);
}
function lalaRun(ch = state.chronicle.run.chapter) { return state.chronicle.run.chapter === ch ? state.chronicle.run : state.chronicle.slots?.[String(ch)] || null; }
function lalaChapterTitle(ch) { return ch === 6 ? '第六章 · 开幕之夜' : ch === 5 ? '第五章 · 夏天的形状' : ch === 4 ? '第四章 · 剧场之夜' : ch === 3 ? '第三章 · 星光530' : ch === 2 ? '第二章 · 暗涌' : '第一章 · 入团试炼'; }
function lalaSceneLabel(r) {
    if (!r)
        return '等待写下第一句';
    const names = { c5_intro: '音乐节的邀请', c5_rival: '新的对手', c5_menu: '夏日倒计时', c5_he: '音乐节之后', c5_be: '两年后', c5_fail: '风吹过舞台', c5_band_y: '一份排练计划', c5_band_bao: '排练室的纸袋', title6: '第五章结尾', c6_intro: '《拾光》立项', c6_zhu: '深夜琴房', c6_warn: '开幕的底气', c6_menu: '首演倒计时', c6_be: '未能开幕', c6_he: '首演谢幕', c6_te: '第三幕的四十秒', c6_band_zhu: '卡祖笛救场', c6_band_q: '排练探班', title7: '第一季结尾', zhu_offer: "山丘酒单", zhu_reply: "吧台前的回应", shanqiu_closed: "山丘的最后一盏灯", "c4_jeal": "剧场之夜 · 排练片段", "c4_jeal_a": "剧场之夜 · 排练片段", "c4_jeal_b": "剧场之夜 · 排练片段", "c4_jeal_c": "剧场之夜 · 排练片段", "c4_intro": "剧场之夜 · 剧院初见", "c4_prep": "剧场之夜 · 节目单", "c4_bao": "剧场之夜 · 主唱与和声", "c4_qiqi": "剧场之夜 · 赞助提案", "c4_menu": "剧场之夜 · 冲刺排练", "be_mianbei": "剧场之夜 · 排练片段", "be_qiqi4": "剧场之夜 · 排练片段", "c4_he": "剧场之夜 · 排练片段", "c4_te": "剧场之夜 · 排练片段", "c4_fail": "剧场之夜 · 排练片段", "c4_prep_a": "剧场之夜 · 排练片段", "c4_prep_b": "剧场之夜 · 排练片段", "c4_prep_c": "剧场之夜 · 排练片段", "c4_bao_a": "剧场之夜 · 排练片段", "c4_bao_b": "剧场之夜 · 排练片段", "c4_qiqi_a": "剧场之夜 · 排练片段", "c4_qiqi_b": "剧场之夜 · 排练片段", "c4_qiqi_c": "剧场之夜 · 排练片段", "b4_lemon_a": "剧场之夜 · 排练片段", "b4_lemon_b": "剧场之夜 · 排练片段", "b4_zhou_a": "剧场之夜 · 排练片段", "b4_zhou_b": "剧场之夜 · 排练片段", "b4_bao_a": "剧场之夜 · 排练片段", "b4_bao_b": "剧场之夜 · 排练片段", "title5": "剧场之夜 · 本章结尾", "c4_band_lemon": "剧场之夜 · 排练片段", "c4_band_zhou": "剧场之夜 · 排练片段", "c4_band_bao": "剧场之夜 · 排练片段", "c2_tim_a": "选择后的回应", "c2_tim_b": "选择后的回应", "c2_tim_c": "选择后的回应", "c2_head_a": "选择后的回应", "c2_head_b": "选择后的回应", "c2_head_c": "选择后的回应", "c2_kong_a": "选择后的回应", "c2_kong_b": "选择后的回应", "c2_kong_c": "选择后的回应", "c3_intro": "专场官宣的晚上", "c3_prep": "专场筹备", "c3_ge": "琴房里的心事", "c3_bill": "鼓位的选择", "c3_menu": "专场倒计时", "c3_jeal": "幕间的邀约", "be_qiqi": "星光530 · 幕间片段", "c3_he": "星光530 · 幕间片段", "c3_te": "星光530 · 幕间片段", "c3_fail": "星光530 · 幕间片段", "c3_prep_a": "星光530 · 幕间片段", "c3_prep_b": "星光530 · 幕间片段", "c3_prep_c": "星光530 · 幕间片段", "c3_ge_a": "星光530 · 幕间片段", "c3_ge_b": "星光530 · 幕间片段", "c3_ge_c": "星光530 · 幕间片段", "c3_bill_a": "星光530 · 幕间片段", "c3_bill_b": "星光530 · 幕间片段", "c3_jeal_a": "星光530 · 幕间片段", "c3_jeal_b": "星光530 · 幕间片段", "c3_jeal_c": "星光530 · 幕间片段", "band_q_a": "星光530 · 幕间片段", "band_q_b": "星光530 · 幕间片段", "band_zhou_a": "星光530 · 幕间片段", "band_zhou_b": "星光530 · 幕间片段", "band_bill_a": "星光530 · 幕间片段", "band_bill_b": "星光530 · 幕间片段", "c3_band_q": "排练后的聚餐", "c3_band_zhou": "谱页的插曲", "c3_band_bill": "鼓位与加练", "title4": "第三章结尾", start: '入团登记', s_door: '排练室门口的初见', s_room: '认识排练室', s_look: '先看看大家', s_shi: '和十元打招呼', s_dream: '聊聊乐团的梦想', s_first: '首席的初次见面', after_practice: '排练之后', s_conflict: '散场时的相遇', s_fei1: '听见飞鸿的回应', s_fei2: '排练散场', s_endweek: '这一周的开始', menu: '本周自由安排', chat_select: '选择今晚的聊天伙伴', chat: '排练间隙的聊天', gig: '收到演出邀请', emo: '合奏间隙', practice_partner: '选择合练搭档', practice_turn: '合练第 ' + (r.battle?.round || 1) + ' 回合', practice_result: '本次合练结果', b_live: '演出准备', live_intro: '准备登台', live_play: '路演第 ' + Math.min(5, (r.live?.scores?.length || 0) + 1) + ' 段', live_result: '本章演出落幕', be_shiyuan: '本周目已落幕', title2: '第一章结尾', title3: '第二章结尾', c2_intro: '山丘酒吧的灯', c2_bar: '山丘酒吧的排练', c2_tim: 'TIM 到场', c2_night_pre: '哈基米之夜', c2_night: '黑板前的选择', c2_str: '加入弦乐组', c2_pop_end: '流行组的故事', c2_head: '排练间隙的头像插曲', c2_kong: '楼梯间的谈话', c2_endweek: '新的本周安排', c2_sponsor: '赞助提议', c2_boundary: '工作时间的消息', c2_bill: '缺席的鼓手' };
    return names[r.scene] || '继续这段排练日常';
}
function lalaSummary(r) {
    if (!r || !r.name)
        return ['故事尚未开始。带上你的乐器，先去排练室认识大家吧。'];
    const lines = [`${r.name} · ${r.inst} · 第 ${r.week} 周，目前停在「${lalaSceneLabel(r)}」。`, `琴技 ${r.tech} · 音符 ${state.coins} · 乐团 Lv.${r.level}。`];
    if (r.flags?.strGroup)
        lines.push('已选择弦乐组，继续这一边的合奏。');
    if (r.flags?.popGroup)
        lines.push('已选择流行组，这一周目的方向已经记下。');
    if (r.flags?.konggeStay === 1)
        lines.push('楼梯间的谈话结果：空格明确留下。');
    else if (r.flags?.konggeLeave)
        lines.push('楼梯间的谈话结果：你支持空格离开。');
    else if (r.flags?.konggeStay === 'weak')
        lines.push('楼梯间的谈话结果：空格仍在考虑，尚未确定留下。');
    const events = { sponsor: { checked: '赞助提议：选择慎重核对。', accepted: '赞助提议：接受了支持。' }, boundary: { supported: '工作时间的消息：选择帮助 TIM 表达边界。', watched: '工作时间的消息：选择旁观。' }, bill: { replacement: '鼓手缺席：建议寻找替补。', warning: '鼓手缺席：决定再给一次机会。' } };
    for (const k of Object.keys(events))
        if (events[k][r.events?.[k]])
            lines.push(events[k][r.events[k]]);
    if (r.battle && r.scene.startsWith('practice_')) {
        const p = cardDef(r.battle.partner);
        lines.push(`本次合练${p ? '搭档：' + p.name : '尚待选择搭档'}；${r.battle.over ? r.battle.win ? '已合格。' : '这一遍已经完成，下次继续练习。' : '回合进度已保留。'}`);
    }
    if (r.live && ['c5_he', 'c5_be', 'c5_fail', 'c6_he', 'c6_te', 'c6_be', 'live_play', 'live_result', 'title2', 'title3', 'title4', 'title5', 'title6', 'title7', 'c3_he', 'c3_te', 'c3_fail', 'be_qiqi', 'c4_he', 'c4_te', 'c4_fail', 'be_qiqi4', 'be_mianbei'].includes(r.scene))
        lines.push(`这场演出已完成 ${r.live.scores.length}/5 段，累计 ${r.live.score} 分。`);
    if (r.chapter === 4) {
        if (r.flags?.yangSolo)
            lines.push('节目单：大羊获得十六小节 SOLO。');
        else if (r.flags?.yangCompromise)
            lines.push('节目单：大羊与十元商定十二小节 SOLO。');
        if (r.flags?.baoOK)
            lines.push('声部安排：宝石与飞鸿已经准备好配合。');
        if (r.flags?.qiHandled)
            lines.push('赞助提案已妥善处理。');
        if (r.flags?.zhouSolo)
            lines.push('你答应陪小周练好他的剧场独奏。');
    }
    if (r.bar?.order) {
        const drinks = { lemon: '柠檬气泡水', martini: '马天尼', mojito: '莫吉托', 'long-island': '长岛冰茶', decline: '谢谢，我不渴' };
        lines.push('山丘酒单：' + drinks[r.bar.order] + '。');
    }
    if (r.bar?.closed)
        lines.push('这一章，山丘酒吧停业了。');
    const ends = { c5_wind: '夏天的风', c5_he: '夏天的形状', c5_be: '婚礼上的十元', c5_fail: '风吹过的舞台', c6_he: '开幕之夜', c6_te: '差四十秒的完美', c6_be: '没有开幕的夜晚', debut: '第一笔合约', ordinary: '下一次一定行', shadow: '团长的影子', c2_street: '街头卖唱', c2_dual: '双核', c2_solo: '独奏者', c2_retry: '翻车与重来', c3_he: '舞台与真心', c3_te: '专场之夜', c3_fail: '安可之前', c3_qiqi: '温柔的刀', c4_he: "6.7 满场星光", c4_te: "谢幕后", c4_fail: "空了一半的剧场", c4_qiqi: "没等到的观众", c4_lemon: "远方的机票" };
    if (ends[r.ending])
        lines.push('本周目已收录结局：「' + ends[r.ending] + '」。');
    return lines;
}
function lalaRecapHTML() {
    if (!hiddenSkillReady('lala') || !LalaUI.recap || !lalaState().autoRecap)
        return '';
    const r = state.chronicle.run;
    if (!r.name || r.scene === 'start')
        return '';
    return `<section class="lala-recap" aria-label="垃垃的续章引路"><img src="${ASSETS.cardLala}" alt="垃垃虚拟头像"><div><span class="eyebrow">续章引路 · 上回说到……</span><h3>欢迎回来，故事就在这里等你。</h3><p>${lalaSummary(r).slice(0, 4).map(escapeHTML).join('<br>')}</p><div class="lala-actions"><button class="btn secondary small" data-lala-action="journal">查看完整手记</button><button class="btn ghost small" data-lala-action="dismiss-recap">接着往下读</button></div></div></section>`;
}
function lalaJournalText(r) {
    const lines = ['垃垃手记 · ' + lalaChapterTitle(r?.chapter || 1), '乐团正传剧情原稿：垃垃', '仅整理本地已发生的剧情，不含未读分支。', '', ...lalaSummary(r), '', '—— 已读片段 ——'];
    for (const e of r?.journal || []) {
        lines.push(`第 ${e.week} 周 · ${Chronicle.journalSpeaker(e, r)}`);
        lines.push(e.text);
        if (e.choice)
            lines.push('你的回应：' + e.choice);
        lines.push('');
    }
    lines.push('—— 最近行动 ——');
    for (const e of r?.log || [])
        lines.push(`第 ${e.week} 周：${e.text}`);
    return lines.join('\n');
}
function showLalaJournal(ch = state.chronicle.run.chapter, recapOnly = false) {
    if (recapOnly && !hiddenSkillReady('lala')) {
        toast(hiddenSkillHint('lala'));
        return;
    }
    if (['running', 'countdown'].includes(game.status))
        pauseGame();
    ch = [1, 2, 3, 4, 5, 6].includes(ch) ? ch : 1;
    LalaUI.journalChapter = ch;
    const r = lalaRun(ch), E = escapeHTML;
    const tabs = `<div class="lala-journal-tabs">${[1, 2, 3, 4, 5, 6].map(n => `<button class="btn ghost small ${n === ch ? 'lala-selected' : ''}" data-lala-journal="${n}" ${!lalaRun(n) ? 'disabled' : ''}>${lalaChapterTitle(n)}</button>`).join('')}</div>`;
    const head = `<div class="lala-modal-head"><img src="${ASSETS.cardLala}" alt="垃垃虚拟头像"><div><span class="eyebrow">${recapOnly ? '续章引路 · 上回说到……' : 'ORCHESTRA NOTEBOOK'}</span><h3>${lalaChapterTitle(ch)}</h3><p>把走过的每一页，好好收在这里。</p></div></div>`;
    const summary = `<div class="lala-notebook-summary">${lalaSummary(r).map(t => `<p>${E(t)}</p>`).join('')}</div>`;
    const rel = r ? Object.entries(r.aff || {}).filter(([, n]) => n > 0).map(([id, n]) => `<span>${E(id === 'tangshao' ? '汤少' : cardDef(id)?.name || id)} <b>${n}</b></span>`).join('') : '';
    const journal = (r?.journal || []).slice().reverse();
    const entries = journal.map(e => `<details class="lala-journal-item"><summary><span>第 ${e.week} 周</span>${E(lalaSceneLabel({ ...r, scene: e.scene }))}</summary><div class="lala-journal-dialogue"><b>${E(Chronicle.journalSpeaker(e, r))}</b><p>${E(e.text).replace(/\n/g, '<br>')}</p>${e.choice ? `<div class="lala-choice-record">你的回应：${E(e.choice)}</div>` : '<small>这一页已打开，等待你的回应。</small>'}</div></details>`).join('');
    const logs = (r?.log || []).slice(-12).reverse().map(e => `<div class="lala-action-line"><span>第 ${e.week} 周</span><p>${E(e.text)}</p></div>`).join('');
    const body = recapOnly ? '' : `${rel ? `<h3>已经建立的羁绊分</h3><div class="lala-relations">${rel}</div>` : ''}<h3>已读片段 <small>最近 ${journal.length}/60 页 · 点击展开</small></h3>${entries || '<p class="lala-empty">这里还没有逐句手记。旧版没有保存的对白不会补写；从本次继续阅读起，她会记录你实际读过的片段。原来的周次、事件和选择进度仍保留。</p>'}${logs ? `<h3>最近的排练与选择</h3><div class="lala-action-log">${logs}</div>` : ''}`;
    openModal(recapOnly ? '续章引路 · 上回说到……' : '垃垃手记', head + tabs + summary + body + `<div class="lala-actions" style="margin-top:18px"><button class="btn primary" data-lala-action="continue">${I('arrow')}回到当前正传</button>${r?.name ? '<button class="btn ghost" data-lala-action="export-journal">' + I('download') + '保存手记</button>' : ''}${recapOnly ? '<button class="btn ghost" data-lala-action="journal">完整手记</button>' : ''}</div><div class="modal-foot">剧情原稿由垃垃提供。回顾依据本地存档整理，不调用外部模型、不读取未经历的分支，也不改变本周安排。每章保留最近 60 个对白片段；重开当前章会开启新的手记，卡牌与已收藏回忆仍保留。</div>`);
}
function onLalaPerformance(run) {
    if (!run.ids.includes('lala'))
        return;
    const messages = [];
    if (run.lalaCoverBonus) {
        unlock('lala_cover');
        messages.push(lalaSectionName(run.lalaCover) + ' +2 ♪');
    }
    if (run.lalaJianpuBonus)
        messages.push('与笛杰的简谱协作 +2 ♪');
    run.lalaReport = messages.length ? '垃垃的协作奖励已计入总加成：' + messages.join(' · ') : '垃垃与你完成了这一场合奏，信任与经验已同步。';
}
