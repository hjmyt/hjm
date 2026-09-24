'use strict';

function cardSkillSummary() { const p = state.cards.prepared; return p ? `${cardDef(p.id).activeName}${p.target ? ' → ' + cardDef(p.target).name : ''}已准备 · 与编队合计最多 +2 ♪` : '还可以准备一项主动技能'; }

function teamSlots(ids = state.cards.team, editable = true) {
    return Array.from({ length: 3 }, (_, i) => {
        const id = ids[i], c = cardDef(id);
        if (!c)
            return `<button class="team-slot" ${editable ? 'data-card-team-pick' : 'disabled'} aria-label="空编队位置，选择一位角色">＋</button>`;
        return `<button class="team-slot" ${editable ? `data-card-team="${c.id}"` : 'disabled'} title="${c.name}${editable ? ' · 点击移出编队' : ''}" aria-label="${c.name}${editable ? '，移出编队' : ''}"><img src="${ASSETS[c.asset]}" alt="${c.name}">${editable ? '<span class="remove-member" aria-hidden="true">×</span>' : ''}<span class="team-shortname">${c.name}</span></button>`;
    }).join('');
}

function renderHomeCards() {
    const c = cardDef(state.cards.selected) || CARD_DEFS[0], god = c.id === 'tang' && state.cards.form === 'god';
    const hasCards = availableCardPool().length > 0;
    const feature = $('homeFeature');
    feature.className = `card home-feature ${!hasCards ? 'is-chapter-invitation' : ''} ${god ? 'is-god' : ''} `;
    feature.innerHTML = `<img class="feature-art" src="${ASSETS[c.asset]}" alt="${c.name}的卡牌插画"><div class="feature-body"><div class="feature-kicker">ORCHESTRA COLLECTION · 乐团篇</div><span class="feature-rarity">${cardRarity(c)}</span><h2 class="feature-title">${c.id === 'tang' && god ? '汤少<span style="font-size:.55em;letter-spacing:2px"> · 汤神</span>' : c.name}</h2><div class="feature-role">${c.role} · ${c.tag.split(' · ')[0]}</div><p class="feature-quote">${c.quote}<br><span style="font-size:10px;opacity:.6">下一次合奏，也想和你一起。</span></p><div class="feature-stars">${cardStars(c)}</div><div class="feature-buttons"><button class="btn primary" data-card-open="${c.id}">${I('cards')}查看卡牌</button><button class="btn secondary" data-card-feed-open="${c.id}">${I('gift')}投喂</button><button class="btn secondary" data-card-story="${c.id}">${I('heart')}相遇</button></div><div class="feature-meta">当前陪伴<span>Lv.${cardLevel(c.id)} / ♡ ${cardBond(c.id)}</span></div></div>`;
    if (!hasCards) {
        feature.setAttribute('aria-label', '第一章人物邀请');
        feature.innerHTML = `<div class="chapter-invitation-copy"><span class="chapter-invitation-label">${I('album')}第一章 · 入团试炼</span><h2>故事的第一页，<br>留了你的位置。</h2><p>从一声招呼，到并肩合奏。<br>剧情里提到的伙伴，会自动加入你的卡册。</p><button class="btn primary" data-route="chronicle">${state.chronicle.run.name ? '继续这段故事' : '推门，走进故事'}${I('arrow')}</button><span class="chapter-invitation-note">${I('lock', 'sm')}随剧情相遇 · 自动解锁</span></div><div class="chapter-invitation-art" aria-hidden="true"><div class="invitation-portrait portrait-kongge"><img src="${ASSETS.cardLala}" alt=""><span>垃垃<small>二提 · 三提补位</small></span></div><div class="invitation-portrait portrait-tim"><img src="${ASSETS.cardShiyuan}" alt=""><span>十元<small>乐团团长</small></span></div></div>`;
    }
    else
        feature.setAttribute('aria-label', '当前陪伴角色');
    $('homeRoster').innerHTML = CARD_DEFS.map(x => `<button class="mini-character ${x.id === 'tang' ? 'is-hidden-edition' : ''} ${x.id === c.id ? 'selected' : ''} ${cardOwned(x.id) ? '' : 'locked'}" data-card-select="${x.id}" aria-label="${cardOwned(x.id) ? '选择' : '查看未拥有卡牌'}：${x.name}"><img src="${ASSETS[x.asset]}" alt="${x.name}" loading="lazy"><span class="mini-rarity">${cardRarity(x)}${x.id === 'tang' ? ' · 隐藏' : ''}</span>${state.cards.team.includes(x.id) ? '<span class="mini-team">编队</span>' : ''}${cardOwned(x.id) ? '' : `<span class="mini-lock">${I('lock')}</span>`}<span class="mini-name">${x.name}<small>${x.role} · ${cardOwned(x.id) ? `Lv.${cardLevel(x.id)}` : chapterLockText(x.id)}</small></span></button>`).join('');
    const count = CARD_DEFS.filter(c => cardOwned(c.id)).length;
    $('homeCollectionCount').textContent = `已相遇 ${count} / ${CARD_DEFS.length} · 点击小卡，切换陪伴`;
    $('cardEvent').innerHTML = `${I('album')}<span class="home-premiere-copy"><strong>相遇，就在故事推进时</strong><small>剧情提到谁，谁就加入卡册 · 无需等到章节结束</small></span><button class="btn" data-route="chronicle">继续剧情${I('arrow')}</button>`;
}

function renderRhythmTeam() {
    const locked = ['starting', 'running', 'countdown', 'paused'].includes(game.status) && game.cardRun;
    const run = locked ? game.cardRun : null, ids = run ? run.ids : state.cards.team;
    const plus = economy().daily.rhythm >= 3 ? 0 : Math.min(2, run ? run.passive + (run.prepared?.amount || 0) : teamBonus() + (state.cards.prepared?.amount || 0));
    $('rhythmTeam').classList.toggle('is-solo', !ids.length);
    $('rhythmTeam').innerHTML = `${ids.length ? `<div class="team-lineup">${teamSlots(ids, false)}</div>` : `<div class="rhythm-solo-mark">${I('music')}</div>`}<div class="rhythm-team-text"><strong>${locked ? '本场阵容已就位' : ids.length ? '和伙伴一起登台' : '先来一场独奏练习'}${ids.length ? `<span class="rhythm-bonus">奖励 +${plus} ♪</span>` : ''}</strong><small>今日已完成 ${economy().daily.rhythm} 场达标演奏。前 3 场：C/B/A/S 奖励 3/4/5/6 音符，编队与技能最多另 +2；之后每场共 1 音符。须完整演奏达到 C（45%），演奏免费。</small></div><button class="btn ghost small" data-route="${availableCardPool().length ? 'cards' : 'chronicle'}">${I(availableCardPool().length ? 'team' : 'album')}${locked ? '查看编队' : availableCardPool().length ? '调整编队' : '去相遇'}</button>`;
}

function renderCardGlobals() {
    ensureCardDay();
    $('cardCount').textContent = `${CARD_DEFS.filter(c => cardOwned(c.id)).length} / ${CARD_DEFS.length}`;
    renderHomeCards();
    renderRhythmTeam();
    if (currentView === 'cards')
        renderCards();
    if (currentView === 'card')
        renderCardPage();
}

function renderCards() {
    let list = CARD_DEFS.filter(c => CardUI.filter === '全部' || c.group === CardUI.filter);
    list = list.slice().sort((a, b) => compareCollection(a, b, CardUI.sort));
    $('view-cards').innerHTML = `<div class="screen-head cards-head"><div class="collection-context"><span>${I('cards')}相遇进度 <b>${CARD_DEFS.filter(c => cardOwned(c.id)).length}<small> / ${CARD_DEFS.length}</small></b></span><p>剧情提到这位伙伴，就会自动加入卡册。</p></div><div class="collection-head-actions"><span class="tiny">${I('ticket', 'sm')} 邀请券 <b>${state.cards.tickets}</b></span><button class="btn ghost small" data-card-help>${I('help')}玩法</button><button class="btn primary" data-card-recruit>${I('sparkles')}邀请团员</button></div></div>
 <div class="cards-team"><div class="team-description"><strong>本次上台的伙伴 <span style="color:#8fa3c5;font-weight:400">${state.cards.team.length}/3</span></strong><small>${state.cards.team.length ? '点击头像可移出编队' : '解锁伙伴后，邀他们一起登台'}</small></div><div class="team-lineup">${teamSlots()}</div><div class="team-benefit">全队加成上限 <b>+${Math.min(2, teamBonus())}</b> ♪<small>${cardSkillSummary()}</small></div><button class="btn primary" data-route="rhythm">${I('music')}一起演奏</button></div>
 <div class="cards-toolbar"><div class="card-filters" aria-label="按声部分组">${['全部', '主唱', '管乐', '弦乐', '键盘', '打击乐', '幕后', '团宠'].map(f => `<button class="filter-btn ${CardUI.filter === f ? 'active' : ''}" data-card-filter="${f}" aria-pressed="${CardUI.filter === f}">${f}</button>`).join('')}</div><label class="card-sort">${list.length} 张 · 章节相遇 <select id="cardSort" aria-label="卡牌排序"><option value="chapter" ${CardUI.sort === 'chapter' ? 'selected' : ''}>相遇顺序</option><option value="rarity" ${CardUI.sort === 'rarity' ? 'selected' : ''}>稀有度优先</option><option value="bond" ${CardUI.sort === 'bond' ? 'selected' : ''}>羁绊分优先</option><option value="level" ${CardUI.sort === 'level' ? 'selected' : ''}>等级优先</option></select></label></div>
 <div class="collection-grid">${list.map(c => {
        if (!cardAvailable(c.id))
            return `<article class="collect-card locked chapter-locked"><button class="collect-art-button" data-route="chronicle" aria-label="${c.name}尚未解锁，继续剧情相遇"><img src="${ASSETS[c.asset]}" alt="${c.name}的未解锁卡牌" loading="lazy"><span class="collect-rarity">${cardRarity(c)}${c.id === 'tang' ? '<small>隐藏</small>' : ''}</span><span class="locked-message">${I('lock')}<span>等待故事里的初见</span></span></button><div class="collect-info"><h3>${c.name}</h3><p>${chapterLockText(c.id)}</p><button class="btn secondary" data-route="chronicle">继续剧情 ${I('arrow')}</button></div></article>`;
        if (c.placeholder)
            return `<article class="collect-card pending-card"><button class="collect-art-button" data-card-open="${c.id}"><img src="${ASSETS[c.asset]}" alt="${c.name}占位卡"><span class="collect-status">已相遇</span></button><div class="collect-info"><h3>${c.name}</h3><p>人物档案 · 敬请期待</p><button class="btn secondary" data-card-open="${c.id}">查看卡位 ${I('arrow')}</button></div></article>`;
        const own = cardOwned(c.id), inTeam = state.cards.team.includes(c.id);
        return `<article class="collect-card rarity-${cardRarity(c).toLowerCase()} ${c.id === 'tang' ? 'is-hidden-edition' : ''} ${c.added ? 'new-member' : ''} ${own ? '' : 'locked'} ${c.id === state.cards.selected ? 'selected' : ''}"><button class="collect-art-button" data-card-open="${c.id}" aria-label="查看${c.name}的${cardRarity(c)}卡牌"><img src="${ASSETS[c.asset]}" alt="${c.name}" loading="lazy"><span class="collect-rarity">${cardRarity(c)}${c.id === 'tang' ? '<small>隐藏 · 置顶</small>' : c.id === 'dijie' ? '<small>固定最后</small>' : c.added ? '<small>乐团限定</small>' : ''}</span><span class="collect-status">${!own ? '未相遇' : inTeam ? '上台中' : '已相遇'}</span>${own ? '' : `<span class="locked-message">${I('lock')}等待一封邀请</span>`}<div class="collect-art-info"><h3>${c.name}</h3><div class="collect-role">${I(c.icon)}${c.role} · ${c.id === 'tang' ? '隐藏款' : c.tag.split(' · ')[0]}</div></div></button><div class="collect-info"><div class="collect-meta"><span class="stars">${cardStars(c)}</span><span class="heart-text">${I('heart')}${cardBond(c.id)} · Lv.${cardLevel(c.id)}</span></div><p class="collect-quote">${c.subtitle}</p><div class="collect-actions"><button class="btn ${own ? 'secondary' : 'primary'}" ${own ? `data-card-open="${c.id}"` : 'data-card-recruit'}>${own ? '查看详情' : '前往邀请'}${I('arrow')}</button>${own ? `<button class="btn ghost icon-only" data-card-team="${c.id}" aria-label="${inTeam ? '移出' : '加入'}${c.name}${inTeam ? '的编队位置' : '到编队'}" title="${inTeam ? '移出编队' : '加入编队'}">${I(inTeam ? 'check' : 'team')}</button>` : ''}</div></div></article>`;
    }).join('') || '<div class="collection-empty">这个声部还没有角色。</div>'}</div>
 <div class="collection-footnote">${I('heart')}<span>乐团伙伴与橘猫，随故事逐一相遇。Bill 的档案待补充；占位人物不参与招募与编队。尚未在剧情相遇的人物保持锁定，相遇后加入招募池。所有邀请仅使用游戏积分。</span></div>`;
    $('cardSort').onchange = e => { CardUI.sort = e.target.value; renderCards(); };
}

function renderCardPage() {
    const c = cardDef(CardUI.detailId || state.cards.selected) || CARD_DEFS[0];
    if (!cardAvailable(c.id)) {
        $('view-card').innerHTML = `<section class="profile-panel"><h3>${I('lock')}人物尚未解锁</h3><p>${chapterLockText(c.id)}</p><button class="btn primary" data-route="chronicle">继续剧情</button></section>`;
        return;
    }
    const own = cardOwned(c.id), v = state.cards.collection[c.id], lv = cardLevel(c.id), bond = cardBond(c.id), god = c.id === 'tang' && state.cards.form === 'god', dark = c.id === 'feihong' && cardDark();
    if (c.placeholder) {
        $('view-card').innerHTML = `<div class="detail-topbar"><button class="btn ghost small" data-card-back>${I('back')}返回卡册</button><span class="label-tag">已相遇 · 档案待补充</span></div><section class="pending-profile"><img src="${ASSETS[c.asset]}" alt="${c.name}人物卡占位"><div><span class="eyebrow">A PLACE IN OUR STORY</span><h2>${c.name}</h2><p>你已经在剧情中与这位伙伴相遇。<br>人物介绍、属性、技能和投喂内容，敬请期待。</p><span class="label-tag">卡位已保留</span><button class="btn primary" data-route="chronicle">继续故事 ${I('arrow')}</button></div></section>`;
        return;
    }
    const page = $('view-card');
    page.classList.toggle('is-god', god);
    page.classList.toggle('is-darkened', dark);
    page.classList.toggle('is-golden-dijie', c.id === 'dijie' && dijieGolden());
    page.classList.toggle('is-emo', c.id === 'dijie' && expansion().dijie.emo);
    page.dataset.person = c.id;
    page.innerHTML = `<div class="detail-topbar"><button class="btn ghost small" data-card-back>${I('back')}返回${CardUI.returnTo === 'home' ? '排练室' : '卡册'}</button><span class="tiny">NO. ${String(CARD_DEFS.indexOf(c) + 1).padStart(3, '0')} · ${cardRarity(c)} · ${own ? '已珍藏' : '未相遇'}</span><button class="btn ghost small" data-card-help>${I('help')}玩法</button></div>
 <div class="detail-layout"><article class="character-cover "><img class="cover-art" src="${ASSETS[c.asset]}" alt="${c.name}卡牌插画"><div class="cover-top"><div class="cover-rarity">${cardRarity(c)}<small>${c.id === 'tang' ? 'HIDDEN EDITION' : 'ORCHESTRA · MEMBER'}</small></div><span class="cover-tag">${c.id === 'kongge' ? (hiddenSkillReady('kongge') ? konggeForm() : '一提首席') : dark ? '好好先生暂时下线' : c.tag.split(' · ')[0]}</span></div><div class="cover-content"><div class="cover-name">${c.id === 'tang' && god ? '汤少 <small>· 汤神</small>' : c.name}</div><div class="cover-sub">${c.role} · ${c.id === 'tang' ? '全团摄像头' : c.tag.split(' · ')[1] || '你的排练搭档'}</div><div class="cover-signature">MUSIC BRINGS US CLOSER</div><blockquote>“${c.quote}”</blockquote><div class="cover-bottom-stats"><span class="stars">${cardStars(c)}</span><span><b>${lv}</b> / 60 级</span><span>♡ ${bond}</span></div><div class="cover-actions">${own ? `<button class="btn cover-main" data-card-team="${c.id}">${I(state.cards.team.includes(c.id) ? 'check' : 'team')}${state.cards.team.includes(c.id) ? '已在编队' : '加入编队'}</button><button class="btn" data-card-story="${c.id}">${I('heart')}${state.completed.includes(c.id) ? '重温相遇' : c.id === 'kongge' ? '角色日常' : c.id === 'tim' ? '角色日常' : c.id === 'lala' ? '排练日常' : c.chronicleOnly ? '乐团正传' : '心动故事'}</button>` : `<button class="btn cover-main" data-card-recruit>${I('ticket')}邀请这位伙伴</button>`}</div>${c.id === 'tang' && hiddenSkillReady('tang') ? `<button class="cover-form" data-card-form>${I('repeat')}切换形态 · ${god ? '汤神 → 汤少' : '汤少 → 汤神'}</button>` : ''}</div></article>
 <div class="profile-stack">${own ? `<div class="profile-tabs" role="tablist" aria-label="角色详情"><button class="${CardUI.tab === 'detail' ? 'active' : ''}" data-card-tab="detail" role="tab" aria-selected="${CardUI.tab === 'detail'}">详情 · 技能与投喂</button><button class="${CardUI.tab === 'bond' ? 'active' : ''}" data-card-tab="bond" role="tab" aria-selected="${CardUI.tab === 'bond'}">${'羁绊分'} · ${bond}/100</button></div>` : ''}
 ${own ? bondSummary(c.id) : ''}
 ${!own ? `<div class="locked-detail"><section class="profile-panel"><div class="eyebrow">A NEW MEETING IS WAITING</div><h3>他也在等你的邀请。</h3><p>${c.id === 'tang' ? '第一封邀请固定获得 SSR 汤少，同时开启「汤少 / 汤神」双形态。' : '第二封邀请固定获得 R 飞鸿，并开启「三分钟黑化 / 橘猫安抚」互动。'}<br>新篇已附赠 3 张邀请券，不需要真实付款。</p><button class="btn primary" data-card-recruit>${I('sparkles')}拆开邀请函</button></section></div>` : ''}
 ${concealCardSkills(CardUI.tab === 'bond' && own ? renderBondContent(c) : renderDetailContent(c, own), c)}
 </div></div>`;
}

function showCardsHelp() {
    openModal('与故事一起，慢慢相遇', `<div class="card-help-table"><strong>剧情相遇</strong><span>读到人物出场，或当前对白提到这个人，就会立即获得对应人物卡并加入招募池，无需等到章节结束。已选回应与实际合练搭档也会记录相遇；人物列表、玩法说明和未经历分支不会提前解锁。尚未提到的人物保持锁定。档案待补充的人物先保留卡位，暂不参与招募与编队。</span><strong>邀请与成长</strong><span>仅能邀请已在剧情中相遇的人物，重复卡增加 40 经验。1 张邀请券邀请一次；券不足时每次消耗 12 音符。可在招募页查看当前概率。</span><strong>隐藏技能</strong><span>羁绊分达到 35 才能开启隐藏技能；角色专属事件条件仍需满足。条件满足前仅显示锁定入口，不公开技能名称、效果与故事线索。条件满足后，点击展开查看。人物档案与特殊故事需要在相处中发现。</span><strong>养成与编队</strong><span>每次投喂消耗 10 音符，羁绊分 +1，每人每日最多 3 次；聊天、演奏等陪伴每日合计最多 +1 分，关键剧情可额外 +5，同一节点不重复奖励。最多 3 人编队，每场可准备一项主动技能。${ECONOMY_HELP}</span><strong>进度保存</strong><span>剧情相遇跨章节、跨周目保留，重复遇见不会重复发卡。旧存档保留养成数据，并按已读对白、当前节点和能够确认的必经剧情补齐人物；未经历的可选分支不提前解锁。</span></div>`);
}

function renderDetailContent(c, own) {
    if (c.id === 'lala')
        return renderLalaDetail(c, own);
    if (c.newMember)
        return renderTrioDetail(c, own);
    if (c.added)
        return renderExpansionDetail(c, own);
    const lv = cardLevel(c.id), v = state.cards.collection[c.id], gifts = cardGifts(c), used = state.cards.daily.gifts[c.id] || 0, bond = cardBond(c.id), selected = gifts.find(g => g[0] === CardUI.gift), inTeam = state.cards.team.includes(c.id), queued = state.cards.prepared?.id === c.id;
    const info = c.sourceSet ? renderSourceInfo(c) : `<section class="profile-panel"><h3 class="panel-title">${I('cards')}基本资料 <span class="tiny">${c.tag}</span></h3><dl class="profile-info"><dt>身份</dt><dd>${c.identity}</dd><dt>位置</dt><dd>${c.seat}</dd><dt>擅长</dt><dd>${c.specialty}</dd>${c.crush ? `<dt>暗恋</dt><dd>${c.crush}</dd>` : ''}${c.id === 'qiqi' ? '<dt>外形</dt><dd>旗袍 · 中式盘发</dd><dt>反差</dt><dd>旗袍与失真音墙同框</dd>' : `<dt>情敌</dt><dd>${c.rival}</dd>`}${c.id === 'tang' && hiddenSkillReady('tang') ? `<dt>当前形态</dt><dd>${state.cards.form === 'god' ? '汤神 · 隐藏摄影之神' : '汤少 · 逗比青年'}</dd>` : ''}</dl><p class="info-bio">${c.bio}</p></section>`;
    const attrs = `<section class="profile-panel"><h3 class="panel-title">${I('stats')}${c.id === 'tang' ? '评级面板' : '属性面板'}<span class="tiny">Lv.${lv} · ${own ? '已相遇' : '等待相遇'}</span></h3>${c.id === 'tang' ? `<div class="grade-panel">${[['摄影', 'EX'], ['人像', 'S+'], ['出片率', 'S'], ['硬盘储量', '数十T']].map(([k, v]) => `<div class="grade-cell"><small>${k}</small><strong>${v}</strong></div>`).join('')}</div>` : `<div class="profile-stats">${c.stats.map(([k, v]) => { const val = c.sourceSet ? sourceStat(c, k, v) : newStat(c, Math.min(100, v + Math.floor(lv / 5))); return `<div class="profile-stat"><div class="profile-stat-head"><span>${k}</span><strong>${val}</strong></div><div class="progress-track"><div class="progress-fill" style="width:${val === '??' ? 0 : typeof val === 'number' ? Math.min(100, val) : 100}%"></div></div></div>`; }).join('')}</div>`}<p class="stat-caption">${c.id === 'tang' && !hiddenSkillReady('tang') ? '镜头里记录着每一次合奏。' : c.statnote}<small>属性是角色展示数值；演出实际奖励以下方技能为准。</small></p></section>`;
    let skills = `<section class="profile-panel"><h3 class="panel-title">${I('sparkles')}技能<span class="tiny">${inTeam ? `全队加成合计最多 +2 ♪` : '加入编队后生效'}</span></h3><div class="skill-list"><article class="skill-item"><div class="skill-heading">${I(c.id === 'orange' ? 'paw' : c.icon)}<h4>${c.activeName}</h4><span class="skill-tag">主动技</span>${queued ? '<span class="skill-state">已准备</span>' : ''}</div><p>${c.activeText}</p>${own ? `<button class="btn secondary small" ${c.id === 'orange' ? 'data-card-soothe' : `data-card-skill="${c.id}"`}>${I(c.id === 'orange' ? 'hand' : 'bolt')}${c.id === 'orange' ? '让橘猫蹭蹭' : queued ? '取消准备' : `准备技能`}</button>` : ''}</article><article class="skill-item"><div class="skill-heading">${I('bolt')}<h4>${c.passiveName}</h4><span class="skill-tag passive">被动</span></div><p>${c.id === 'tang' && !hiddenSkillReady('tang') ? '入队参与全队加成，达标时合计最多 +2 音符；全队每场另得 5 经验。' : c.passiveText}</p></article>`;
    if (c.id === 'tang')
        skills += `<article class="skill-item"><div class="skill-heading">${I('eye')}<h4>荷鲁斯之眼</h4><span class="skill-tag special">神技</span></div><p>以意念调取影像片段——半神般的存在。汤神形态下，可解锁隐藏回忆「荷鲁斯之眼」，参与每日陪伴奖励，最多 +1 分。</p>${own ? `<button class="btn secondary small" data-card-eye ${state.cards.form !== 'god' || state.cards.daily.eye ? 'disabled' : ''}>${I('eye')}${state.cards.daily.eye ? '今天的高光已记录' : state.cards.form !== 'god' ? '请先切换为汤神' : '开启隐藏镜头'}</button>` : ''}</article>`;
    else if (c.id === 'feihong')
        skills += `<article class="skill-item"><div class="skill-heading">${I('bolt')}<h4>黑化 · 三分钟</h4><span class="skill-tag special">触发技</span></div><p>发现乐手另找主唱时，好好先生暂时下线。试玩中可主动触发 3 分钟黑化；期间开演增强个人加成，全队与技能仍合计最多 +2 音符。橘猫蹭一下就能提前结束。</p>${own ? `<div class="skill-controls"><button class="btn secondary small" data-card-dark ${cardDark() ? 'disabled' : ''}>${I('bolt')}${cardDark() ? '黑化中' : '模拟触发黑化'}</button><button class="btn ghost small" data-card-soothe>${I('paw')}橘猫来蹭蹭</button></div><span class="black-clock" data-black-clock>${cardDark() ? `好好先生回归倒计时 ${formatTime((state.cards.blackUntil - Date.now()) / 1000)}` : '橘猫正在旁边监督'}</span>` : ''}</article>`;
    skills += '</div></section>';
    if (c.id === 'qiqi')
        skills = renderQiqiSkills();
    if (c.sourceSet)
        skills = renderSourceSkills(c);
    if (!own)
        return info + attrs + skills;
    const feed = `<section class="profile-panel" id="cardFeeding"><h3 class="panel-title">${I('gift')}投喂 · ${c.giftTitle || (c.id === 'qiqi' ? '大姐姐的下午茶' : (c.id === 'orange' ? '给它' : '给他') + '一份小心意')}<span class="tiny">普通投喂剩余 ${Math.max(0, 3 - used)}/3</span></h3>${CardUI.response ? `<div class="feed-response" role="status">${escapeHTML(CardUI.response)}</div>` : ''}<div class="gift-grid">${renderGiftChoices(c, gifts, used)}</div><div class="feeding-bottom"><div class="feeding-progress"><div class="progress-label"><span>羁绊分</span><span>${bond} / 100</span></div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, bond)}%"></div></div></div><button class="btn primary" id="cardFeedBtn" data-card-feed ${giftFeedDisabled(c, selected, used) ? 'disabled' : ''}>${I('heart')}投喂${selected ? ` ${selected[3]} ♪` : ''}</button></div><p class="feed-hint" id="cardGiftHint">${cardGiftHint(c, selected, used)}</p><div class="growth-strip"><div class="growth-copy">Lv.${lv} · ${lv === 60 ? '已满级' : `经验 ${v.xp % 60} / 60`}<small>合奏获得经验；每 60 经验提升 1 级，最高 60 级。</small></div><button class="btn secondary small" data-card-train="${c.id}" ${lv === 60 || state.coins < 8 ? 'disabled' : ''}>${I('stats')}练习 +30 经验 · 8 ♪</button></div></section>`;
    const cat = `<section class="profile-panel"><div class="companion-strip"><button class="companion-picture" ${c.id === 'orange' ? 'data-route="care"' : 'data-card-soothe'} aria-label="${c.id === 'orange' ? '去探望灰白哈基米' : '轻轻拍拍橘猫'}"><img src="${ASSETS[c.id === 'orange' ? 'cat' : 'cardOrange']}" alt="${c.id === 'orange' ? '灰白哈基米' : '橘猫哈基米'}"></button><div class="companion-copy"><h4>${c.id === 'orange' ? '另一个等你回家的伙伴' : '随行 · 橘猫哈基米'}</h4><p>${c.id === 'orange' ? '喵咪小屋的灰白团宠，保留着你们原来的回忆。' : '常驻排练室监工。点一下橘猫，看看好好先生有没有需要它出场。'}</p><button class="text-btn" ${c.id === 'orange' ? 'data-route="care"' : 'data-card-open="orange"'}>${c.id === 'orange' ? '去喵咪小屋' : '查看团宠卡牌'}</button></div></div></section>`;
    return info + attrs + skills + feed + cat;
}

function renderBondContent(c) {
    if (c.id === 'lala')
        return renderLalaBond();
    if (c.newMember)
        return renderTrioBond(c);
    const bond = cardBond(c.id), done = state.completed.includes(c.id), ch = CHARACTERS.find(x => x.id === c.id);
    return `<section class="profile-panel"><h3 class="panel-title">${I('heart')}你们的频率，正在靠近。</h3><div class="bond-big"><strong>${bond}</strong><span>/ 100 羁绊分</span></div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, bond)}%"></div></div><div style="margin-top:14px">${[[0, '初次相遇', '从一声招呼，到同一张谱。随时可以阅读心动故事。'], [20, '越来越熟悉', '羁绊分到达 20，即可领取羁绊纪念；只领取一次。'], [35, '更多发现', '达到隐藏技能门槛，满足角色附加条件即可开启。'], [50, '默契搭档', '你的座位，还没开口就有人帮你留好。'], [80, '频率相同的人', '不必急着说什么，已经听得懂彼此。']].map(([n, t, d]) => `<div class="bond-milestone ${bond >= n ? 'unlocked' : ''}"><span class="milestone-icon">${I(bond >= n ? 'check' : 'lock')}</span><div><strong>${t} · ${n} 羁绊分</strong><p>${d}</p></div></div>`).join('')}</div><div class="bond-actions"><button class="btn primary" data-card-tab="detail">${I('gift')}去投喂</button><button class="btn secondary" data-card-bond-memory ${bond < 20 ? 'disabled' : ''}>${I('album')}${state.memories.includes('card_bond') ? '查看羁绊纪念' : bond < 20 ? '20 羁绊分解锁纪念' : '收藏羁绊纪念'}</button></div><p class="stat-caption">羁绊分 35 解锁隐藏技能门槛；50 / 80 是展示称号，不额外影响判定。角色的故事羁绊分与卡册完全共用。</p></section><section class="profile-panel bond-story-panel"><div class="eyebrow">${done ? 'A STORY TO RETURN TO' : 'YOUR NEXT LITTLE MOMENT'}</div><h3 style="margin-top:10px">${ch?.chapter || '故事，正在正传里继续'}</h3><p>${ch?.quote || c.bio}</p><button class="btn secondary" data-card-story="${c.id}">${I('heart')}${c.chronicleOnly ? '继续乐团正传' : done ? '再读一遍' : '翻开这次相遇'}${I('arrow')}</button><p class="card-dialogue-note">${c.chronicleOnly ? '人物的故事随正传推进，已读片段保存在垃垃手记。' : done ? '这段故事已收藏，重读可体验另一条回应，不重复发放奖励。' : '首次读完：15 音符、2 羁绊分和一张回忆。'}</p></section>`;
}
