'use strict';

/* New-member rules: source card settings stay intact; game adaptations are explicit in the UI.
   No real photos, network access, global social penalties, or paid resources. */
function freshTrio() { return { version: 1, tim: { route: null }, ye: { closed: false, invitation: false }, kongge: { satiety: 20, satisfaction: 0, career: false }, energy: Object.fromEntries(CARD_DEFS.map(c => [c.id, 100])), daily: { date: dateKey(), practice: false } }; }
function cleanTrio(o) {
    const d = freshTrio();
    if (!o || typeof o !== 'object')
        return d;
    const num = (x, f = 0) => Number.isFinite(Number(x)) ? clamp(Math.floor(Number(x)), 0, 100) : f;
    d.tim.route = ['friend', 'distance'].includes(o.tim?.route) ? o.tim.route : null;
    d.ye.closed = o.ye?.closed === true;
    d.ye.invitation = o.ye?.invitation === true;
    d.kongge.satiety = num(o.kongge?.satiety, 20);
    d.kongge.satisfaction = num(o.kongge?.satisfaction);
    d.kongge.career = o.kongge?.career === true;
    for (const c of CARD_DEFS)
        d.energy[c.id] = num(o.energy?.[c.id], 100);
    if (o.daily?.date === dateKey())
        d.daily.practice = o.daily.practice === true;
    return d;
}
function trio() {
    const t = state.cards.trio || (state.cards.trio = freshTrio());
    if (t.daily.date !== dateKey())
        t.daily = { date: dateKey(), practice: false };
    return t;
}
function sourceRhythm(id) { const c = CARD_DEFS.find(c => c.id === id), v = c?.stats?.find(([k]) => k === '节奏')?.[1]; return typeof v === 'number' ? v : null; }
function konggeForm() { return trio().kongge.satiety >= 60 ? '慈祥的格老' : '严厉的首席'; }
function trioEnergy(id) { return trio().energy[id] ?? 100; }
function trioAddEnergy(id, n) { trio().energy[id] = clamp(trioEnergy(id) + n, 0, 100); }
function syncYeBoundary() {
    if (cardBond('shiyuan') < 0)
        trio().ye.closed = true;
    return !trio().ye.closed;
}
function onTrioGift(c, g) {
    const x = trio();
    if (c.id === 'yeshiyang' && g[0] === 'lozenge')
        rewardCompanionBond('shiyuan');
    if (c.id === 'kongge') {
        x.kongge.satisfaction = clamp(x.kongge.satisfaction + g[4], 0, 100);
        x.kongge.satiety = clamp(x.kongge.satiety + (g[0] === 'fries' ? 35 : g[0] === 'icecream' ? 45 : 0), 0, 100);
    }
    trioAddEnergy(c.id, 10);
}
function onTrioPerformance(run) {
    const x = trio(), messages = [];
    for (const id of run.ids)
        trioAddEnergy(id, -10);
    if (run.prepared?.id === 'yeshiyang') {
        const twice = run.ids.includes('shiyuan'), gain = twice ? 60 : 30;
        for (const id of run.ids)
            if (id !== 'yeshiyang')
                trioAddEnergy(id, gain);
        rewardCompanionBond('yeshiyang');
        messages.push('关怀补给：队友精力 +' + gain + '（上限内）');
    }
    if (run.prepared?.id === 'kongge') {
        if (run.konggeGood)
            messages.push('乐句设计：搭档展示属性与个人基础奖励 +30%');
        else if (run.prepared.target) {
            const t = run.prepared.target;
            x.energy[t] = Math.floor(trioEnergy(t) / 2);
            messages.push(cardDef(t).name + '本次心态波动：剩余合奏精力减半');
        }
    }
    if (run.ids.includes('kongge')) {
        x.kongge.satiety = Math.max(0, x.kongge.satiety - 10);
        const rate = game.notes.length ? game.score / (game.notes.length * 1000) : 0;
        if (run.ids.includes('shiyuan') && rate >= .45) {
            x.kongge.career = true;
            if (hiddenSkillReady('kongge', 'clue') && unlock('kongge_career'))
                messages.push('事业线 HE 纪念已点亮');
        }
    }
    run.trioReport = messages.join(' · ');
}
function trioProgress(label, value) { return `<div class="trio-profile-value"><span>${label}</span><strong>${value} / 100</strong></div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, value)}%"></div></div>`; }
function trioSourceStats(c) {
    return c.stats.map(([k, raw]) => {
        let display = raw, width = typeof raw === 'number' ? raw : 100;
        if (c.id === 'tim' && k === '羁绊分') {
            display = width = cardBond('tim');
        }
        else if (typeof raw === 'number') {
            display = newStat(c, raw);
            width = display;
        }
        return `<div class="profile-stat"><div class="profile-stat-head"><span>${k}</span><strong>${display}</strong></div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, width)}%"></div></div></div>`;
    }).join('');
}
function renderTrioDetail(c, own) {
    const x = trio(), inTeam = state.cards.team.includes(c.id), queued = state.cards.prepared?.id === c.id;
    const info = c.sourceSet ? renderSourceInfo(c) : `<section class="profile-panel"><h3 class="panel-title">${I('cards')}基本资料<span class="tiny">${c.tag}</span></h3><dl class="profile-info">${c.infoFields.filter(([a]) => !['感情线', '攻略条件'].includes(a)).map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl><p class="info-bio">${c.bio}</p><div class="fiction-label">${I('sparkles', 'sm')}虚拟人物立绘 · 趣味角色设定</div><button class="text-btn" data-trio-art="${c.id}">查看角色立绘</button></section>`;
    let status = '';
    if (c.id === 'tim')
        status = `<div class="trio-state cool"><b>${inTeam ? '安心已就位' : '安心，来自一位靠谱的搭档'}</b><small>与笛杰同队开演时，连续 MISS 的 emo 触发阈值由 5 次提升为 8 次。自动生效，不占主动技能位。</small></div>`;
    if (c.id === 'yeshiyang')
        status = `<div class="trio-state"><b>${syncYeBoundary() ? '关系线开放 · 先真诚对待彼此' : '关系线已关闭 · 保持普通同事距离'}</b><small>十元当前羁绊分 ${cardBond('shiyuan')}/100 · 卡牌、投喂与合奏技能不因关系线关闭而删除。</small></div>`;
    if (c.id === 'kongge' && hiddenSkillReady('kongge'))
        status = `<div class="trio-state"><b>${konggeForm()}</b><small>当前饱食度 ${x.kongge.satiety}/100 · 满 60 进入慈祥状态，未满 60 为严厉状态。</small>${trioProgress('饱食度', x.kongge.satiety)}<div class="trio-inline-actions"><button class="btn ghost small ${x.kongge.satiety >= 60 ? 'trio-selection' : ''}" data-trio-form="kind">慈祥的格老 · 预览</button><button class="btn ghost small ${x.kongge.satiety < 60 ? 'trio-selection' : ''}" data-trio-form="strict">严厉的首席 · 预览</button></div></div>`;
    const attrs = `<section class="profile-panel"><h3 class="panel-title">${I('stats')}属性面板<span class="tiny">原卡设定 · Lv.${cardLevel(c.id)}</span></h3>${status}<div class="profile-stats">${trioSourceStats(c)}</div><p class="stat-caption">${c.statnote}<small>保留原卡基础数值与评级；TIM 使用全局羁绊分。鼓励与乐句设计加成只在准备期间叠加显示，不改写基础属性。</small></p></section>`;
    const prepare = own ? `<button class="btn secondary small" data-card-skill="${c.id}">${I('bolt')}${queued ? '取消技能准备' : c.id === 'kongge' ? '选择搭档 · 准备音乐处理' : '准备技能 · +' + c.active + ' ♪'}</button>` : '';
    let skills = '';
    if (c.id === 'tim') {
        skills += skillBlock(c.activeName, '主动技', c.activeText, '入队自动提供「安心」，将同队笛杰的连续 MISS 阈值从 5 提至 ceil(5×1.5)=8。另可准备一次察言观色：下场完整演奏达标，参与全队加成（合计最多 +2 音符）。这里的安全评估是游戏演示，不识别现实人物。', prepare, false, '进入新场合时自动');
        skills += skillBlock('隐秘档案 · 有女朋友', '解锁条件', '羁绊分达到 35 后，解锁感情线真相。可选择「渐行渐远」或「普通朋友」，没有第三条。', '礼物按标注增加羁绊分；完成有手动命中的合奏，TIM 羁绊分 +1，每天最多 10 次，不占聊天与技能陪伴额度。达到条件后才能打开档案。', own ? `<div class="trio-inline-actions"><button class="btn primary small" data-trio-archive="open" ${cardBond('tim') < 35 ? 'disabled' : ''}>${cardBond('tim') < 35 ? '羁绊 ' + cardBond('tim') + '/35 · 待解锁' : '正式打开档案'}</button><button class="btn ghost small" data-route="rhythm">去节奏舞台合奏</button></div>` : '', true);
    }
    else if (c.id === 'yeshiyang') {
        skills += skillBlock(c.activeName, '主动技', c.activeText, '准备后，在下一场完整节奏演奏结算：达标时参与全队加成（合计最多 +2 音符），其他同队伙伴恢复 30 点合奏精力，叶思阳参与每日陪伴奖励（合计最多 +1 分）。十元同队时恢复 60 点精力，羁绊奖励不翻倍。精力上限 100，不改变原有音游命中或生命值。', prepare, false, '无');
        skills += skillBlock(c.passiveName, '被动', c.passiveText, '保留商务挡箭牌设定，并提供匿名合作案例的风险对比演示：80 → 40。当前游戏不接真实合作、不设商业风险扣款，也不因读条款扣角色羁绊分。', own ? '<button class="btn ghost small" data-trio-contract>查看商务挡箭牌演示</button>' : '');
        skills += skillBlock('攻略限制 · 十元锚点', '锁定机制', c.anchorText, '本版不新增负羁绊分选项。若导入十元负羁绊分或已锁线的旧存档，会保留关闭状态；日常与合奏仍可使用。新增邀约在叶思阳羁绊分 60 且未锁线时开放。条件演示不改变存档。', own ? `<div class="trio-inline-actions"><button class="btn ghost small" data-trio-anchor>查看关系条件</button><button class="btn secondary small" data-trio-invite ${cardBond(c.id) < 60 || x.ye.closed ? 'disabled' : ''}>${x.ye.closed ? '关系线关闭' : cardBond(c.id) < 60 ? '60 羁绊分解锁邀约' : x.ye.invitation ? '重温专属邀约' : '接受副团长的邀约'}</button></div>` : '', true);
    }
    else {
        skills += skillBlock(c.activeName, '主动技', c.activeText, '选择同队、已标注「节奏」数值的搭档。≥85：准备期间展示属性与个人基础音符奖励 +30%；<85：结算时该搭档剩余合奏精力减半。两种情况均参与全队加成（达标时合计最多 +2 音符），不改谱面或准确率。原卡未提供节奏的伙伴不猜数值。', `<div class="trio-inline-actions"><button class="btn ghost small" data-trio-music-preview="good">节奏 ≥85 · 加成预览</button><button class="btn ghost small" data-trio-music-preview="low">节奏 <85 · 反噬预览</button></div>${prepare}`, false, '无');
        skills += skillBlock('首席的两种状态', '状态', c.passiveText, '薯条增加 35 饱食度，冰淇淋增加 45；递谱子只提升满足度。真实节奏合奏后饱食度 −10，下面四拍练习完成后 −5，不会因离线变饿。形态预览不修改饱食度。严厉练习绿区 16%、四拍全中合格；慈祥绿区 34%、四拍中三拍合格。', own ? '<button class="btn secondary small" data-trio-practice>参加首席的四拍练习</button>' : '', true);
        skills += skillBlock('事业线 · 技术与光同在', '无恋爱线', '只有事业线；HE 需要空格与十元同在。', '空格、十元同时入队，完成一首达到 C 或以上的节奏演奏，即可点亮事业线 HE 纪念。不替代或改写乐团正传结局；四拍练习不计入此条件。', `<div class="trio-state"><b>${x.kongge.career ? '事业线 HE 纪念已点亮' : '等待一场技术与光同在的合奏'}</b><small>当前编队：${state.cards.team.map(id => cardDef(id).name).join('、') || '尚未编队'}</small>${x.kongge.career ? '<button class="btn ghost small" data-memory="kongge_career">查看事业线纪念</button>' : ''}</div>`, true);
    }
    const skillpanel = `<section class="profile-panel"><h3 class="panel-title">${I('sparkles')}技能<span class="tiny">${inTeam ? '全队加成合计最多 +2 ♪' : '加入编队后生效'}</span></h3><p class="source-game-note">${ECONOMY_HELP} 蓝色「本版交互」说明可触发的效果。</p><div class="skill-list">${skills}</div></section>`;
    return info + attrs + skillpanel + (own ? trioFeeding(c) : '');
}
function trioFeeding(c) {
    const x = trio(), gifts = effectiveGifts(c), used = state.cards.daily.gifts[c.id] || 0, g = gifts.find(g => g[0] === CardUI.gift), bond = cardBond(c.id), value = c.id === 'tim' ? cardBond('tim') : c.id === 'kongge' ? x.kongge.satisfaction : bond;
    const hints = c.id === 'tim' ? '所有礼物消耗 10 音符，羁绊分 +1；「一起合奏一场」是礼物互动，不代替完整节奏演奏，也不累计完美场次。' : c.id === 'kongge' ? '薯条 +35 饱食度；冰淇淋 +45；递谱子不增加饱食度。满足度与饱食度分别记录。' : '润喉糖会转交十元，让十元参与每日陪伴奖励（合计最多 +1）。';
    return `<section class="profile-panel" id="cardFeeding"><h3 class="panel-title">${I('gift')}投喂 · ${c.feedingStyle}<span class="tiny">普通投喂剩余 ${Math.max(0, 3 - used)}/3</span></h3>${CardUI.response ? `<div class="feed-response" role="status">${escapeHTML(CardUI.response)}</div>` : ''}<div class="gift-grid">${renderGiftChoices(c, gifts, used)}</div><div class="feeding-bottom"><div class="feeding-progress">${trioProgress('羁绊分', bond)}</div><button class="btn primary" id="cardFeedBtn" data-card-feed ${giftFeedDisabled(c, g, used) ? 'disabled' : ''}>${I('heart')}投喂${g ? ' ' + g[3] + ' ♪' : ''}</button></div><p class="feed-hint" id="cardGiftHint">${cardGiftHint(c, g, used)}</p><p class="trio-tiny-rule">${hints}<br>礼物价格与养成奖励为本版游戏数值，不涉及真实购买。</p><div class="trio-state cool"><b>合奏精力</b><div class="trio-energy-row">${[...new Set([c.id, ...state.cards.team])].map(id => `<span>${cardDef(id).name}<strong>${trioEnergy(id)}/100</strong></span>`).join('')}</div><small>新增的本地状态：每场有命中的演奏消耗 10 点；普通投喂个人 +10。关怀可补充、首席的低节奏反噬会减少。降到 0 仍可继续玩，不扣琴技或原成绩。</small></div><div class="growth-strip"><div class="growth-copy">Lv.${cardLevel(c.id)} / 60 · 羁绊分 ${bond}/100<small>每 60 经验升级；每日普通投喂三次；满心礼盒不限。</small></div><button class="btn ghost small" data-card-train="${c.id}" ${state.coins < 8 || cardLevel(c.id) >= 60 ? 'disabled' : ''}>短练习 · 8 ♪</button></div></section>`;
}
function renderTrioBond(c) {
    const x = trio(), ch = CHARACTERS.find(a => a.id === c.id), bond = cardBond(c.id);
    let panel = '';
    if (c.id === 'tim')
        panel = `<h3 class="panel-title">${I('album')}羁绊分与关系边界</h3>${trioProgress('羁绊分', cardBond('tim'))}<p class="trio-tiny-rule">正传、卡册与演奏共用同一份羁绊分。${x.tim.route ? '已选择：' + (x.tim.route === 'friend' ? '普通朋友' : '渐行渐远') : '羁绊分达到 35 后正式开启档案，仅有普通朋友或渐行渐远两条走向。'}</p><div class="trio-inline-actions"><button class="btn secondary" data-trio-archive="open" ${cardBond('tim') < 35 ? 'disabled' : ''}>正式打开档案</button></div>`;
    else if (c.id === 'yeshiyang')
        panel = `<h3 class="panel-title">${I('heart')}副团长也在等待回应</h3>${trioProgress('羁绊分', bond)}<p class="trio-tiny-rule">${syncYeBoundary() ? '关系线开放，60 羁绊分解锁本版新增的专属邀约。' : '关系线已关闭；保留普通乐团互动和全部养成。'}十元羁绊分 ${cardBond('shiyuan')}/100。</p><button class="btn secondary" data-trio-invite ${bond < 60 || x.ye.closed ? 'disabled' : ''}>${x.ye.invitation ? '重温邀约' : '接受邀约'}</button>`;
    else
        panel = `<h3 class="panel-title">${I('violin')}事业线 · 不设恋爱路线</h3>${trioProgress('合奏默契', bond)}<p class="trio-tiny-rule">空格与十元同队，完成一首 C 或以上演奏，点亮事业线 HE 纪念。${x.kongge.career ? '你已完成这场合奏。' : '目前尚未解锁。'}</p><button class="btn secondary" ${x.kongge.career ? 'data-memory="kongge_career"' : 'data-route="rhythm"'}>${x.kongge.career ? '查看纪念' : '去节奏舞台'}</button>`;
    if (c.id === 'tim' || c.id === 'kongge')
        panel = hiddenSkillBlock(c.id, panel, 'clue');
    return `<section class="profile-panel">${panel}<div class="trio-inline-actions"><button class="btn ghost" data-card-tab="detail">返回技能与投喂</button><button class="btn ghost" data-card-bond-memory ${bond < 20 ? 'disabled' : ''}>${bond < 20 ? '20 羁绊分解锁羁绊纪念' : '收藏羁绊纪念'}</button></div></section><section class="profile-panel"><div class="eyebrow">ORCHESTRA DAYS</div><h3 style="margin:12px 0">${ch?.chapter || '故事，正在正传里继续'}</h3><p>${ch?.quote || c.bio}</p><button class="btn secondary" style="margin-top:16px" data-card-story="${c.id}">${state.completed.includes(c.id) ? '重温角色日常' : '翻开角色日常'}</button><p class="trio-tiny-rule">首次读完：15 音符、2 羁绊分、30 经验与专属回忆；重读不重复领奖。角色日常不替代特殊关系线的解锁条件。</p></section>`;
}
function showTimArchive() {
    if (!hiddenSkillReady('tim', 'clue')) {
        toast('这段故事尚未解锁，继续一起合奏吧。');
        return;
    }
    unlock('tim_archive');
    save();
    renderGlobal();
    const t = trio().tim, r = t.route;
    openModal('TIM 的隐秘档案', `<span class="label-tag">羁绊分 ${cardBond('tim')}/100</span><p class="trio-archive-text">“有件事，我想先说清楚。”\n“我有女朋友，她不在团里。我们感情很稳定。”\n\n他把琴放稳，认真地看着你。\n一场合奏的默契，不等于另一种关系的承诺。</p><p>${cardDef('tim').passiveText}</p>${r ? `<div class="trio-state"><b>已选择：${r === 'friend' ? '普通朋友' : '渐行渐远'}</b><small>${r === 'friend' ? '保留舒服的合奏友谊，尊重彼此生活。' : '把时间留给自己，排练时仍然礼貌相处。'}</small></div><button class="btn secondary" data-memory="tim_${r}">查看这段关系的纪念</button>` : `<div class="trio-route-choice"><button class="btn secondary" data-trio-tim-route="friend">普通朋友 · 合奏继续</button><button class="btn ghost" data-trio-tim-route="distance">渐行渐远 · 留些距离</button></div><p class="trio-tiny-rule">选择会记录在本存档，不清空卡牌或羁绊分。</p>`}`);
}
function chooseTimRoute(route) {
    if (!['friend', 'distance'].includes(route) || !cardOwned('tim') || cardBond('tim') < 35 || trio().tim.route)
        return;
    openModal('确认这段关系的走向？', `<p>${route === 'friend' ? '保留普通朋友与合奏搭档的关系。' : '把更多时间留给自己，与 TIM 渐行渐远。'}不扣除羁绊分，不移除角色，也没有第三条恋爱线。</p><div class="trio-inline-actions"><button class="btn primary" data-trio-tim-confirm="${route}">确认选择</button><button class="btn ghost" data-trio-archive="open">返回档案</button></div>`);
}
function confirmTimRoute(route) {
    if (!cardOwned('tim'))
        return;
    if (!['friend', 'distance'].includes(route) || cardBond('tim') < 35 || trio().tim.route)
        return;
    trio().tim.route = route;
    unlock('tim_' + route);
    save();
    renderGlobal();
    showTimArchive(false);
}
function showContract() { openModal('商务挡箭牌 · 匿名案例演示', `<p>演示合作书：演出费用未写清、无限期独家冠名、允许对方单方面改期。这里不指向任何真实个人或公司。</p><div class="trio-rule-pairs"><div><small>演示：审核前风险指数</small><b>80</b><small>条款尚未确认</small></div><div><small>技能设定：风险 −50%</small><b>40</b><small>80 × 50% = 40</small></div></div><p>叶思阳把付款节点、冠名期限与变更确认重新标出：“先把约定写清楚，再决定要不要合作。”</p><p class="trio-tiny-rule">纯游戏设定预览，不执行合同、不扣音符、不提供真实法律判断，也不发放可重复刷取的奖励。</p>`); }
function showYeAnchor() {
    if (!hiddenSkillReady('yeshiyang')) {
        toast(hiddenSkillHint('yeshiyang'));
        return;
    }
    const open = syncYeBoundary();
    openModal('十元锚点 · 关系条件', `<div class="trio-state"><b>${open ? '当前关系线开放' : '当前关系线已关闭'}</b><small>十元羁绊分 ${cardBond('shiyuan')}/100 · 叶思阳羁绊分 ${cardBond('yeshiyang')}/100</small></div><p>${cardDef('yeshiyang').anchorText}</p><div class="trio-rule-pairs"><div><small>条件示例一（预览）</small><b>≥ 0</b><small>十元不讨厌你，关系线可继续。</small></div><div><small>条件示例二（预览）</small><b>−1</b><small>会关闭叶思阳的关系线，不影响卡牌归属。</small></div></div><p class="trio-tiny-rule">当前版本不提供扣成负羁绊分的操作，演示不会改存档。导入带负羁绊分或锁线标记的存档时，保留原关系边界，不增加群体惩罚。</p>`);
}
function showYeInvitation() {
    if (!cardOwned('yeshiyang') || cardBond('yeshiyang') < 60 || !syncYeBoundary())
        return;
    const first = !trio().ye.invitation;
    trio().ye.invitation = true;
    unlock('ye_invitation');
    save();
    renderGlobal();
    openModal('留给副团长的十分钟', `<p class="trio-archive-text">节目单、谱架和水杯都安排好了。\n叶思阳却没有像往常那样马上离开。\n\n“今天，可以留十分钟给我吗？”\n“不是谈排练，也不是对账。”\n\n他把另一张椅子往你身边挪近一点。\n“这一次，我想听听你。”</p><div class="trio-state"><b>${first ? '专属邀约已收藏' : '重温邀约'}</b><small>这是一段本版新增的虚构互动，不涉及现实人物关系；重读不重复领奖。</small></div><button class="btn secondary" data-memory="ye_invitation">把这一刻收进相册</button>`);
}
function showKonggePreview(good) { openModal(good ? '音乐处理 · 高节奏搭档预览' : '音乐处理 · 低节奏搭档预览', `<span class="label-tag">只预览 · 不消耗技能或精力</span><p class="trio-archive-text">${good ? '“句子的方向对了，再把这里的呼吸连起来。”\n节奏 ≥85：展示属性 +30%，演出气场翻倍。' : '“先数清楚拍子，再谈乐句。”\n节奏 <85：首席皱眉，搭档心态 -50%。'}</p><p>${good ? '实际准备时，搭档展示属性和个人基础音符奖励 +30%，向上取整。' : '实际结算时，搭档当时的合奏精力减半，向下取整。投喂或关怀可以恢复。'}两种情况均参与全队加成，达标时合计最多 +2 音符。不扣琴技、羁绊分或原有节奏成绩。</p>`); }
function showKonggeForm(kind) {
    if (!hiddenSkillReady('kongge'))
        return;
    const gentle = kind === 'kind';
    openModal((gentle ? '慈祥的格老' : '严厉的首席') + ' · 形态预览', `<p class="trio-archive-text">${gentle ? '“薯条放这儿，大家先休息一下。”\n眉头舒展开以后，他把练习的速度也放慢了一点。' : '“先别急。刚才这句，再练二十遍。”\n首席的笔停在谱上，等你重新起弓。'}</p><p>四拍练习：${gentle ? '绿区 34%，四拍命中至少三拍即合格。' : '绿区 16%，四拍全部命中才合格。'}</p><div class="trio-state"><b>实际当前：${konggeForm()}</b><small>饱食度 ${trio().kongge.satiety}/100；预览不切换真实状态。薯条和冰淇淋使饱食度达到 60，即进入慈祥状态。</small></div><button class="btn secondary" data-card-feed-open="kongge">给首席准备补给</button>`);
}
function prepareKongge() {
    if (!cardOwned('kongge'))
        return;
    if (!state.cards.team.includes('kongge')) {
        toast('先把空格加入编队，再选择搭档。');
        return;
    }
    if (state.cards.prepared?.id === 'kongge') {
        state.cards.prepared = null;
        save();
        renderGlobal();
        toast('音乐处理已取消准备。');
        return;
    }
    const others = state.cards.team.filter(id => id !== 'kongge');
    openModal('首席的乐句设计 · 选择搭档', `<p>根据原卡标注的节奏判断，不用其他属性替代节奏。准备会替换当前主动技能。</p><div class="replace-list">${others.map(id => { const c = cardDef(id), r = sourceRhythm(id); return `<button class="replace-option" data-trio-kongge-target="${id}" ${r === null ? 'disabled' : ''}><img src="${ASSETS[c.asset]}" alt="${c.name}的虚拟立绘"><span><strong>${c.name} · ${r === null ? '未标注节奏' : '节奏 ' + r}</strong><small>${r === null ? '原卡未提供，无法判断效果' : r >= 85 ? '加成：展示属性与个人基础奖励 +30%' : '注意：结算时剩余合奏精力减半'}</small></span>${I(r !== null && r >= 85 ? 'sparkles' : 'music')}</button>`; }).join('') || '<p>先在编队里加入另一位伙伴。</p>'}</div><p class="trio-tiny-rule">阿喆 88、TIM 88 可获得正向加成；十元 35、叶思阳 80 会触发心态波动。两种预览不会修改进度。</p><button class="btn ghost small" data-route="cards">返回编队</button>`);
}
function chooseKonggeTarget(id) {
    if (!state.cards.team.includes('kongge') || !state.cards.team.includes(id) || id === 'kongge' || sourceRhythm(id) === null)
        return;
    state.cards.prepared = { id: 'kongge', target: id, amount: 7, token: Date.now() };
    save();
    closeModal();
    renderGlobal();
    toast('首席为' + cardDef(id).name + '准备了乐句设计：' + (sourceRhythm(id) >= 85 ? '属性与个人基础奖励 +30%' : '注意下场结算心态波动'), sourceRhythm(id) >= 85);
}
function mountTrioNotice() {
    const anchor = $('cardEvent');
    if (!anchor || $('trioNotice'))
        return;
    const el = document.createElement('div');
    el.id = 'trioNotice';
    el.className = 'trio-notice';
    el.innerHTML = `<div class="trio-notice-head"><strong>弦乐新席 · 三位伙伴已到场</strong><small>V6 · 虚拟立绘 / 专属互动 / 自动解锁</small></div><div class="trio-new-grid">${[['tim', '国企人的下班合奏'], ['yeshiyang', '副团长的关怀'], ['kongge', '首席的四拍练习']].map(([id, sub]) => { const c = cardDef(id); return `<button class="trio-new-card" data-card-open="${id}"><img src="${ASSETS[c.asset]}" alt="${c.name}的虚拟立绘"><span><b>${c.name} <small style="display:inline">${cardRarity(c)}</small></b><small>${sub}</small></span></button>`; }).join('')}</div>`;
    anchor.insertAdjacentElement('afterend', el);
}
let ChiefTrial = null;
function stopChiefTrial() {
    if (ChiefTrial) {
        cancelAnimationFrame(ChiefTrial.raf);
        ChiefTrial.closed = true;
        ChiefTrial = null;
    }
}
function startChiefTrial() {
    if (!hiddenSkillReady('kongge', 'skill')) {
        toast('隐藏技能尚未解锁。');
        return;
    }
    if (!cardOwned('kongge'))
        return;
    const gentle = trio().kongge.satiety >= 60;
    openModal('首席的四拍练习', `<span class="label-tag">${gentle ? '慈祥的格老' : '严厉的首席'} · ${gentle ? '三拍命中即合格' : '四拍全中才合格'}</span><p style="margin-top:12px">点击开始，让标记进入绿区后按「落弓」。这是独立小练习，不改正传考核，也不累计笛杰的完美演奏场次。</p><div class="chief-trial-dots" id="chiefDots"></div><div class="chief-trial-meter"><div class="chief-trial-zone" style="left:${50 - (gentle ? 34 : 16) / 2}%;width:${gentle ? 34 : 16}%"></div><div class="chief-trial-center"></div><div class="chief-trial-needle" id="chiefNeedle"></div></div><p id="chiefTrialText" class="chief-trial-text" role="status">准备好后，再落下第一弓。</p><button class="btn primary chief-trial-button" data-trio-trial id="chiefTrialButton">开始第一拍</button><p class="trio-tiny-rule">绿区宽度 ${gentle ? 34 : 16}%。点击按钮或按空格；切到后台暂停。关闭弹窗会放弃未完成的练习，不扣奖励。当天首次合格：空格 +30 经验、+5 音符，并参与每日陪伴奖励（合计最多 +1）。完整练习后饱食度 −5。</p>`, stopChiefTrial);
    ChiefTrial = { phase: 'ready', pos: 0, dir: 1, width: gentle ? 34 : 16, target: gentle ? 3 : 4, hits: [], raf: 0, last: 0, closed: false };
    renderChiefTrial();
}
function renderChiefTrial() {
    const t = ChiefTrial;
    if (!t || t.closed || !$('chiefDots'))
        return;
    $('chiefDots').innerHTML = Array.from({ length: 4 }, (_, i) => `<span class="chief-trial-dot ${i < t.hits.length ? (t.hits[i] ? 'done' : 'miss') : ''}">${i < t.hits.length ? (t.hits[i] ? '✓' : '·') : i + 1}</span>`).join('');
    const labels = { ready: '开始第 ' + (t.hits.length + 1) + ' 拍', playing: '落弓！', paused: '继续这一拍', feedback: t.hits.length >= 4 ? '查看练习结果' : '下一拍', done: '本次练习已完成' };
    const b = $('chiefTrialButton');
    b.textContent = labels[t.phase];
    b.disabled = t.phase === 'done';
}
function chiefTick(now) {
    const t = ChiefTrial;
    if (!t || t.closed || t.phase !== 'playing')
        return;
    const dt = Math.max(0, Math.min(64, now - t.last));
    t.last = now;
    let p = t.pos + t.dir * dt * .062;
    if (p > 100) {
        p = 200 - p;
        t.dir = -1;
    }
    if (p < 0) {
        p = -p;
        t.dir = 1;
    }
    t.pos = clamp(p, 0, 100);
    const needle = $('chiefNeedle');
    if (needle)
        needle.style.left = t.pos + '%';
    t.raf = requestAnimationFrame(chiefTick);
}
function pauseChiefTrial() {
    const t = ChiefTrial;
    if (t?.phase === 'playing') {
        cancelAnimationFrame(t.raf);
        t.phase = 'paused';
        renderChiefTrial();
        if ($('chiefTrialText'))
            $('chiefTrialText').textContent = '已暂停，当前拍子等你回来。';
    }
}
function actChiefTrial() {
    const t = ChiefTrial;
    if (!t || t.closed)
        return;
    if (t.phase === 'ready' || t.phase === 'paused') {
        t.phase = 'playing';
        t.last = performance.now();
        if ($('chiefTrialText'))
            $('chiefTrialText').textContent = '看准绿区，再按落弓。';
        renderChiefTrial();
        t.raf = requestAnimationFrame(chiefTick);
        return;
    }
    if (t.phase === 'playing') {
        t.phase = 'feedback';
        cancelAnimationFrame(t.raf);
        const good = Math.abs(t.pos - 50) <= t.width / 2;
        t.hits.push(good);
        $('chiefTrialText').textContent = good ? '这一拍合上了。先听完，再继续。' : '这一拍稍微偏了一点。下一拍重新听。';
        renderChiefTrial();
        return;
    }
    if (t.phase !== 'feedback')
        return;
    if (t.hits.length < 4) {
        t.phase = 'ready';
        t.pos = 0;
        t.dir = 1;
        $('chiefNeedle').style.left = '0%';
        renderChiefTrial();
        return;
    }
    t.phase = 'done';
    const count = t.hits.filter(Boolean).length, win = count >= t.target, x = trio(), first = win && !x.daily.practice;
    x.kongge.satiety = Math.max(0, x.kongge.satiety - 5);
    if (first) {
        x.daily.practice = true;
        addCardXP('kongge', 30);
        rewardCompanionBond('kongge');
        state.coins += 5;
    }
    save();
    renderGlobal();
    $('chiefTrialText').textContent = (win ? '“合格。这一次，我听见你进步了。”' : '“先别急，慢慢数拍子，再来一次。”') + ' 命中 ' + count + '/4。' + (first ? '经验 +30 · 音符 +5 · 已结算每日陪伴奖励。' : win ? '今天的首次合格奖励已经领取。' : '没有扣除羁绊分或琴技。');
    renderChiefTrial();
}
