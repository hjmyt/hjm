'use strict';

function mentionedStoryCards(text = '', who = '') {
    const speaker = who === 'tangshao' ? 'tang' : who;
    text = text.replaceAll('柠檬气泡水', '气泡水'); // Drink names are not character appearances.
    return CARD_DEFS.filter(c => c.id === speaker || STORY_CARD_ALIASES[c.id].some(name => name === 'TIM' ? /\bTIM\b/i.test(text) : name.toLowerCase() === 'bill' ? /\bBill\b/i.test(text) : text.includes(name))).map(c => c.id);
}
function cardAvailable(id, source = state) { return source.cards.encounters.includes(id); }
function chapterLockText() { return '剧情提到这位伙伴时自动解锁'; }
function syncStoryCards(source = state, notify = false, recoverLegacy = false) {
    const cards = source.cards, newIds = [];
    const discovered = Chronicle.encounterIds(source.chronicle, recoverLegacy || cards.encounterVersion !== 1);
    cards.encounterVersion = 1;
    for (const id of discovered)
        if (!cards.encounters.includes(id)) {
            cards.encounters.push(id);
            newIds.push(id);
        }
    for (const id of cards.encounters) {
        const v = cards.collection[id];
        if (v) {
            v.owned = true;
            v.copies = Math.max(1, v.copies);
        }
    }
    cards.team = cards.team.filter(id => !(id === 'lemon' && source.cards.sourceCast?.lemon.ended) && cardAvailable(id, source) && !CARD_DEFS.find(c => c.id === id)?.placeholder && cards.collection[id]?.owned);
    if (cards.prepared && (!cards.team.includes(cards.prepared.id) || (cards.prepared.target && !cards.team.includes(cards.prepared.target))))
        cards.prepared = null;
    if ((source.affinity?.tang || 0) < 35)
        cards.form = 'normal';
    if ((source.affinity?.feihong || 0) < 35)
        cards.blackUntil = 0;
    if (!cardAvailable(cards.selected, source))
        cards.selected = cards.encounters[0] || null;
    if (notify && newIds.length)
        toast(`剧情相遇 · ${newIds.map(id => CARD_DEFS.find(c => c.id === id).name).join('、')}已加入卡册`, true);
    return newIds;
}
function availableCardPool() { return CARD_DEFS.filter(c => !c.placeholder && cardAvailable(c.id)); }
function hiddenSkillReady(id, kind = 'skill') {
    if (!cardOwned(id) || cardBond(id) < BOND_RULES.hidden)
        return false;
    if (id === 'lemon')
        return sourceCast().lemon.ended;
    if (id === 'qiqi')
        return qiqiState().sisters;
    if (id === 'kongge' && kind === 'clue')
        return trio().kongge.career;
    if (id === 'dijie' && kind === 'legend')
        return dijieGolden();
    if (id === 'azhe')
        return expansion().azhe.tickets > 0 || expansion().azhe.encores > 0;
    return true;
}
function hiddenSkillHint(id, kind = 'skill') {
    const base = `羁绊分 ${cardBond(id)} / 35${cardBond(id) < 35 ? '，还差 ' + (35 - cardBond(id)) + ' 分' : '，分数门槛已达成'}。`;
    if (id === 'qiqi')
        return base + '还需与十元同队完成一场有命中的演奏。';
    if (id === 'kongge' && kind === 'clue')
        return base + '还需与十元同队完成一首 C 或以上演奏。';
    if (id === 'dijie' && kind === 'legend')
        return base + '还需携带他累计完成 100 场全 PERFECT 演奏。';
    if (id === 'azhe')
        return base + '还需带他完成一场有命中的节奏演奏。';
    if (id === 'lemon')
        return base + '人物线故事随关键选择揭晓。';
    return base + '达到门槛后可开启隐藏内容。';
}
function hiddenSkillBlock(id, html, kind = 'skill') {
    const ready = hiddenSkillReady(id, kind), label = kind === 'clue' ? '未公开的故事' : '隐藏技能';
    return ready ? `<details class="skill-item hidden-skill"><summary>${I('sparkles')}${label} · 已解锁，点击查看</summary>${html}</details>` : `<article class="skill-item hidden-skill locked"><div class="skill-heading">${I('lock')}<h4>${label}</h4><span class="skill-tag">未解锁</span></div><p>${hiddenSkillHint(id, kind)}</p><button class="btn ghost small" disabled>条件未满足</button></article>`;
}
function concealCardSkills(html, c) {
    const template = document.createElement('template');
    template.innerHTML = html;
    for (const item of template.content.querySelectorAll('.skill-item.exp-special, .skill-item:has(.skill-tag.special)')) {
        const title = item.querySelector('h4')?.textContent || '';
        const kind = title.includes('事业线') || c.id === 'tim' ? 'clue' : title.includes('完美演奏') ? 'legend' : 'skill';
        item.outerHTML = hiddenSkillBlock(c.id, item.outerHTML, kind);
    }
    return template.innerHTML;
}
function renderZhuSecret() {
    if (!hiddenSkillReady('zhu') || !state.cards.zhuNight)
        return `<article class="skill-item hidden-skill locked"><div class="skill-heading">${I('lock')}<h4>隐藏技能</h4><span class="skill-tag">${hiddenSkillReady('zhu') ? '可解锁' : '未解锁'}</span></div><p>羁绊分达到 35 后，亲自揭开吧台后的故事。</p><button class="btn secondary small" data-zhu-reveal ${hiddenSkillReady('zhu') ? '' : 'disabled'}>${hiddenSkillReady('zhu') ? '解锁隐藏技能' : '条件未满足'}</button></article>`;
    return `<details class="skill-item hidden-skill" ${CardUI.zhuOpened ? 'open' : ''}><summary>${I('sparkles')}隐藏技能 · 已解锁，点击查看</summary><h4>深夜吧台 · 调酒</h4><p>打烊后的山丘，吧台是他的另一个舞台。shaker 摇出的节奏比他的指挥稳一百倍——招牌「拾光」入口先是苦，回甘却很长。多少乐手的心事与梦想，是在他的吧台前被一杯酒接住的。他不劝，只听。</p><p class="cp-caption">调酒 96 已揭晓；投喂新增「打烊后的一杯拾光」——投喂消耗 10 音符。</p></details>`;
}
