'use strict';

function freshQiqi() { return { nextPartyAt: 0, mood: {}, cared: [], sisters: false, fan: 0, presence: 0, lastStage: null }; }
function cleanQiqi(o) {
    const d = freshQiqi();
    if (!o || typeof o !== 'object')
        return d;
    const n = (v, max) => Number.isFinite(Number(v)) ? clamp(Math.floor(Number(v)), 0, max) : 0;
    d.nextPartyAt = n(o.nextPartyAt, Date.now() + 7 * 86400000);
    for (const c of CARD_DEFS)
        if (o.mood?.[c.id] !== undefined)
            d.mood[c.id] = n(o.mood[c.id], 100);
    d.cared = Array.isArray(o.cared) ? [...new Set(o.cared.filter(id => ['qiqi', 'shiyuan', 'lala'].includes(id)))] : [];
    d.sisters = o.sisters === true;
    d.fan = n(o.fan, 100);
    d.presence = n(o.presence, 100);
    if (o.lastStage && Array.isArray(o.lastStage.ids))
        d.lastStage = { ids: [...new Set(o.lastStage.ids.filter(id => CARD_DEFS.some(c => c.id === id)))].slice(0, 3), charm: 15 };
    return d;
}
function qiqiState() { return state.cards.qiqi || (state.cards.qiqi = freshQiqi()); }
function hostQiqiParty() {
    if (!cardOwned('qiqi') || !state.cards.team.includes('qiqi')) {
        toast('先把柒柒加入编队，再张罗饭局。');
        return;
    }
    const q = qiqiState();
    if (Date.now() < q.nextPartyAt) {
        toast('这周的饭局已经张罗过了。');
        return;
    }
    q.nextPartyAt = Date.now() + 7 * 86400000;
    for (const id of state.cards.team) {
        q.mood[id] = Math.min(100, (q.mood[id] ?? 50) + 30);
        if (['qiqi', 'shiyuan', 'lala'].includes(id) && !q.cared.includes(id))
            q.cared.push(id);
    }
    save();
    renderGlobal();
    toast('饭局张罗好了 · 到场伙伴心情 +30（上限 100）', true);
}
function renderQiqiSkills() {
    const q = qiqiState(), ready = Date.now() >= q.nextPartyAt, inTeam = state.cards.team.includes('qiqi');
    const party = skillBlock('饭局张罗', '主动技', '订餐厅、订做脸、记住忌口与喜好。到场全员心情 +30，女性成员额外获得「被照顾」状态。她只听，很少说。', '当前编队即到场成员；心情上限 100，冷却 7 天，刷新页面不会重置。', `<button class="btn secondary small" data-qiqi-party ${!ready || !inTeam ? 'disabled' : ''}>${!inTeam ? '先加入编队' : ready ? '张罗这周的饭局' : '下次饭局 · ' + new Date(q.nextPartyAt).toLocaleDateString('zh-CN')}</button>`, false, '一周');
    const passive = skillBlock('旗袍与失真', '被动', '中式盘发配电吉他的反差登场，观众注意力强制转移。演出开场时全团魅力 +15。', '携带柒柒登台时记录本场全队魅力 +15；入队参与全队加成，达标时合计最多 +2 音符。');
    const bond = hiddenSkillBlock('qiqi', `<div class="skill-heading"><h4>好姐妹</h4><span class="skill-tag">羁绊</span></div><p>与十元同屏时触发「姐妹同框」：十元吸粉 +10，柒柒存在感 +5。两个人笑得越像，弹幕磕得越真。</p><div class="exp-rule">柒柒与十元同队完成有命中的演奏后结算；吸粉与存在感各自上限 100。</div>`);
    const mood = Object.entries(q.mood).filter(([id]) => cardOwned(id)).map(([id, v]) => `<span>${cardDef(id).name} · 心情 ${v}${q.cared.includes(id) ? ' · 被照顾' : ''}</span>`).join('');
    return `<section class="profile-panel"><h3 class="panel-title">${I('sparkles')}技能与合奏状态</h3><div class="skill-list">${party}${passive}${bond}</div>${mood ? `<div class="qiqi-state">${mood}</div>` : ''}${q.lastStage ? `<p class="stat-caption">最近合奏：${q.lastStage.ids.map(id => cardDef(id).name).join('、')} · 魅力 +15</p>` : ''}${q.sisters ? `<p class="stat-caption">十元吸粉 ${q.fan} / 100 · 柒柒存在感 ${q.presence} / 100</p>` : ''}<p class="stat-caption">心情、魅力、吸粉与存在感记录角色状态；节奏判定仍由你的演奏决定。</p></section>`;
}
function onQiqiPerformance(run) {
    if (!run.qiqiStage)
        return;
    const q = qiqiState();
    q.lastStage = { ids: [...run.ids], charm: 15 };
    if (run.qiqiStage.sisters) {
        q.sisters = true;
        if (!hiddenSkillReady('qiqi'))
            return;
        q.fan = Math.min(100, q.fan + 10);
        q.presence = Math.min(100, q.presence + 5);
        unlock('qiqi_sisters');
    }
}
