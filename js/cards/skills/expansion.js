'use strict';

function freshExpansion() { return { dijie: { instrument: 0, emo: false, mood: 0, perfectConcerts: 0 }, azhe: { tickets: 0, applauseMs: 0, encores: 0 }, shiyuan: { happiness: 0 }, daily: { date: dateKey(), script: false, greet: false } }; }
/* ---------- Special character skills; all effects stay local ---------- */
function expansion() { return state.cards.expansion || (state.cards.expansion = freshExpansion()); }
function dijieGolden() { return cardBond('dijie') >= 35 && expansion().dijie.perfectConcerts >= 100; }
function effectiveGifts(c) { return cardGifts(c); }
function fanWave() {
    for (const c of CARD_DEFS)
        if (cardOwned(c.id))
            rewardCompanionBond(c.id);
}
function newStat(c, v) {
    let n = v;
    if (c.id === 'dijie' && dijieGolden())
        n *= 1.5;
    if (state.cards.prepared?.id === 'shiyuan' && state.cards.prepared.target === c.id)
        n *= 1.25;
    if (state.cards.prepared?.id === 'kongge' && state.cards.prepared.target === c.id && sourceRhythm(c.id) >= 85)
        n *= 1.3;
    return Math.round(n * 10) / 10;
}
function skillBlock(name, tag, source, rule, controls = '', special = false, cooldown = '') {
    return `<article class="skill-item ${special ? 'exp-special' : ''}"><div class="skill-heading">${I(special ? 'sparkles' : 'music')}<h4>${name}</h4><span class="skill-tag ${special ? 'special' : ''}">${tag}</span>${cooldown ? `<small class="cooldown-text">冷却：${cooldown}</small>` : ''}</div><p>${source}</p><div class="exp-rule"><span>本版交互</span>${rule}</div>${controls ? `<div class="exp-controls">${controls}</div>` : ''}</article>`;
}
function renderExpansionDetail(c, own) {
    const x = expansion(), inTeam = state.cards.team.includes(c.id), queued = state.cards.prepared?.id === c.id, lv = cardLevel(c.id);
    const info = c.sourceSet ? renderSourceInfo(c) : `<section class="profile-panel"><h3 class="panel-title">${I('cards')}基本资料<span class="tiny">${c.tag}</span></h3><dl class="profile-info">${c.infoFields.filter(([a]) => !['感情线', '攻略条件'].includes(a)).map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl><p class="info-bio">${c.bio}</p><div class="fiction-label">${I('sparkles', 'sm')}虚拟人物立绘 · 趣味角色设定</div></section>`;
    let status = '';
    if (c.id === 'dijie')
        status = `<div class="state-banner ${x.dijie.emo ? 'emo-banner' : dijieGolden() ? 'gold-banner' : ''}">${I(x.dijie.emo ? 'moon' : dijieGolden() ? 'crown' : 'flute')}<span><b>${x.dijie.emo ? 'emo 的笛杰' : dijieGolden() ? '金色笛杰' : '安静待机中'}</b><small>${x.dijie.emo ? '气场 −30% · 下次开演的个人基础奖励减少 30% · 投喂恢复；羁绊分固定 +1' : dijieGolden() ? '金色传说已点亮 · 基础展示属性 +50%' : '社交电量节能模式 · 可以试试「七调笛库」'}</small></span></div>`;
    if (c.id === 'shiyuan')
        status = `<div class="state-banner light-banner">${I('sun')}<span><b>快乐小狗 · 全团光源</b><small>${inTeam ? '已入队：团队音符基础加成 ×1.3，向上取整' : '入队即可点亮光源，给合奏加一点鼓励。'}</small></span></div>`;
    const attrs = `<section class="profile-panel"><h3 class="panel-title">${I('stats')}属性面板<span class="tiny">原始设定 · Lv.${lv}</span></h3>${status}<div class="profile-stats">${c.stats.map(([k, v]) => { const val = newStat(c, v); return `<div class="profile-stat ${val > 100 ? 'over-range' : ''}"><div class="profile-stat-head"><span>${k}</span><strong>${val}${val > 100 ? '<em>突破</em>' : k === '吸粉能力' ? '<em>MAX</em>' : ''}</strong></div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, val)}%"></div></div></div>`; }).join('')}</div><p class="stat-caption">${c.statnote}<small>保留原卡基础数值；超过 100 时只封顶进度条，不截断数值。金色形态／鼓励会另外加成，等级不改写这些基础设定。</small></p></section>`;
    const prepare = own ? `<button class="btn secondary small" data-card-skill="${c.id}">${I('bolt')}${queued ? '取消准备' : c.id === 'shiyuan' ? '选择一位乐手鼓励' : `准备技能`}</button>` : '';
    let blocks = '';
    if (c.id === 'azhe') {
        blocks += skillBlock(c.activeName, '主动技', c.activeText, '入队并准备后，下场完整演奏达标，参与全队加成（合计最多 +2 音符）；结算时，编队中左右相邻伙伴参与每日陪伴奖励（每角色合计最多 +1 分）。每场最多一次。', prepare, false, '一个乐章');
        blocks += skillBlock(c.passiveName, '被动', c.passiveText, `每次带阿喆完成有命中的演奏，可进入一次掌声互动。在弹窗前台累计 30 秒，触发华彩安可：每日首次 +2 音符（之后不再发音符）、阿喆 +30 经验，并收藏回忆。当前可安可 ${x.azhe.tickets} 次。`, own ? `<button class="btn secondary small" data-azhe-applause ${x.azhe.tickets ? '' : 'disabled'}>${I('hand')}${x.azhe.tickets ? '为他送上掌声' : '先带阿喆完成一场演奏'}</button>` : '', true);
    }
    else if (c.id === 'dijie') {
        blocks += skillBlock(c.activeName, '主动技', c.activeText, '点击切换七支竹笛与长笛，试听一声本地合成提示音；准备技能后，下场完整演奏达标，参与全队加成（合计最多 +2 音符）。不自动替玩家命中音符。', `${own ? `<div class="instrument-rack" aria-label="笛库切换">${Array.from({ length: 8 }, (_, i) => `<button class="instrument-choice ${x.dijie.instrument === i ? 'active' : ''}" data-dijie-instrument="${i}" aria-pressed="${x.dijie.instrument === i}">${I('flute')}<span>${i === 7 ? '长笛' : '竹笛 ' + (i + 1)}</span></button>`).join('')}</div><p class="instrument-note">当前：${x.dijie.instrument === 7 ? '长笛' : '第 ' + (x.dijie.instrument + 1) + ' 支竹笛'} · 编号用于展示，不指定原图未提供的调号；提示音不是乐器采样。</p>` : ''}${prepare}`, false, '无');
        blocks += skillBlock(c.passiveName, '身份技', c.passiveText, '生成一张游戏内排练单，列出当前编队与练习安排。每日首次运行，当前成员各 +10 经验。不连接真实日历，不运行外部脚本。', own ? `<button class="btn secondary small" data-dijie-script>${I('settings')}${x.daily.script ? '查看排练单 · 今日已运行' : '运行排练脚本'}</button>` : '', true);
        blocks += skillBlock('错误磁场', 'Debuff', '当乐团有人连续出错次数过多时触发「emo 的笛杰」：气场 -30%，进入谱架阴影里自闭，需要投喂恢复。', '本版在笛杰入队、单场连续 MISS 5 次后触发；命中会重置连错计数。emo 使后续开演的个人基础音符奖励减少 30%。任意投喂可解除，羁绊分固定 +1，经验和心情按礼物原值结算。演示按钮只切换状态，不增加完美次数。', own ? `<button class="btn ghost small" data-dijie-emo-demo ${x.dijie.emo ? 'disabled' : ''}>${I('moon')}${x.dijie.emo ? 'emo 中 · 去投喂恢复' : '演示：连续错音触发 emo'}</button>` : '');
        blocks += skillBlock('完美演奏 ×100', '金色传说', '累计完美演奏 100 次后触发「金色笛杰」：全属性 +50%，长笛泛音自带圣光，摄像机之眼升级为环绕机位。', '须携带笛杰完成整首、全音符 PERFECT，才计为 1 次完美演奏；不是单个 PERFECT 音符，也不是普通 S 评级。羁绊分达到 35 且累计 100 次后点亮金色形态，并解锁纪念。', `<div class="legend-progress"><div><strong>${Math.min(100, x.dijie.perfectConcerts)}<small> / 100 场</small></strong><span>${dijieGolden() ? '金色传说已觉醒' : '完美演奏进行中'}</span></div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, x.dijie.perfectConcerts)}%"></div></div></div>`, true);
    }
    else {
        blocks += skillBlock(c.passiveName, '被动', c.passiveText, '入队即生效：本场编队的基础音符奖励增加 30%，向上取整。加成在开演时锁定，不改节奏判定、分数或生命值。', '');
        blocks += skillBlock(c.activeName, '主动技', c.activeText, '选择编队中的另一位乐手，解除其 emo（如有）；准备期间，该角色的展示属性与个人基础音符奖励 +25%，下场完整演奏达标后，全队加成合计最多 +2 音符。演奏后消耗鼓励。不要求现实加班三小时。', prepare, false, '一句夸奖');
        blocks += skillBlock('吸粉 Max', '被动', '每次排练、演出、哪怕只是路过琴房，全团羁绊分自动上涨。观众席里有她的照片就能多卖三成票。', '十元在编队时，演奏、短练习或每日招呼可触发陪伴奖励；每角色每天与聊天等合计最多 +1 分。没有真实照片展示或售票功能。', own ? `<button class="btn secondary small" data-shiyuan-greet ${x.daily.greet ? 'disabled' : ''}>${I('heart')}${x.daily.greet ? '今天已经打过招呼' : '路过琴房 · 和大家打招呼'}</button>` : '');
        blocks += skillBlock('隐藏技能 · 白月光', '光环', '她拿起琴弓的瞬间，全团自觉调音、屏住呼吸——拉了音准 32 的《小星星》，也被全体起立鼓掌。', '点击进入琴房片段，听一小段浏览器合成的《小星星》；首次解锁白月光专属回忆。重复可以重温，但不重复领奖。', own ? `<button class="btn secondary small" data-shiyuan-play>${I('play')}听她演奏小星星</button>` : '', true);
    }
    const skills = `<section class="profile-panel"><h3 class="panel-title">${I('sparkles')}技能<span class="tiny">${inTeam ? `当前全队加成合计最多 +2 ♪` : '加入编队后生效'}</span></h3><p class="source-game-note">${ECONOMY_HELP} 上方文案为角色设定；蓝色「本版交互」说明实际效果。</p><div class="skill-list">${blocks}</div></section>`;
    return info + attrs + skills + (own ? expansionFeeding(c) : '');
}
function expansionFeeding(c) {
    const x = expansion(), gifts = effectiveGifts(c), used = state.cards.daily.gifts[c.id] || 0, selected = gifts.find(g => g[0] === CardUI.gift), bond = cardBond(c.id), v = state.cards.collection[c.id], lv = cardLevel(c.id);
    const value = c.id === 'dijie' ? x.dijie.mood : c.id === 'shiyuan' ? x.shiyuan.happiness : bond;
    const isDouble = c.id === 'dijie' && x.dijie.emo;
    return `<section class="profile-panel" id="cardFeeding"><h3 class="panel-title">${I('gift')}投喂 · ${c.feedingStyle}<span class="tiny">普通投喂剩余 ${Math.max(0, 3 - used)}/3</span></h3>${isDouble ? '<div class="double-gift">emo 恢复中 · 普通投喂可恢复心情，收到后解除 Debuff</div>' : ''}${CardUI.response ? `<div class="feed-response" role="status">${escapeHTML(CardUI.response)}</div>` : ''}<div class="gift-grid">${renderGiftChoices(c, gifts, used)}</div><div class="feeding-bottom"><div class="feeding-progress"><div class="progress-label"><span>羁绊分</span><span>${bond} / 100</span></div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, bond)}%"></div></div></div><button class="btn primary" id="cardFeedBtn" data-card-feed ${giftFeedDisabled(c, selected, used) ? 'disabled' : ''}>${I('heart')}投喂${selected ? ' ' + selected[3] + ' ♪' : ''}</button></div><p class="feed-hint" id="cardGiftHint">${cardGiftHint(c, selected, used)}</p><div class="growth-strip"><div class="growth-copy">Lv.${lv} / 60 · ${lv >= 60 ? '已满级' : `距离升级 ${60 - v.xp % 60} 经验`}<small>短练习：8 音符 → 30 经验；等级影响演出奖励，不改写原始属性。</small></div><button class="btn ghost small" data-card-train="${c.id}" ${lv >= 60 || state.coins < 8 ? 'disabled' : ''}>${I('music')}短练习 8 ♪</button></div></section>`;
}
function onExpansionMiss() {
    const run = game.cardRun;
    if (!run || !run.ids.includes('dijie'))
        return;
    run.missStreak = (run.missStreak || 0) + 1;
    if (run.missStreak >= (run.timSafe ? 8 : 5) && !run.emoTriggered) {
        run.emoTriggered = true;
        expansion().dijie.emo = true;
        save();
        toast('连续错音触发「emo 的笛杰」· 演奏后投喂可恢复，羁绊分固定 +1。');
    }
}
async function switchDijieInstrument(i) {
    if (!cardOwned('dijie') || !Number.isInteger(i) || i < 0 || i > 7)
        return;
    expansion().dijie.instrument = i;
    save();
    renderCardGlobals();
    if (state.sound) {
        const a = await ensureAudio();
        if (a)
            toneAt([72, 74, 76, 77, 79, 81, 83, 84][i], a.currentTime, .6, .09, 'fx', 'sine');
    }
}
function demoDijieEmo() {
    if (!cardOwned('dijie'))
        return;
    expansion().dijie.emo = true;
    save();
    renderGlobal();
    toast('演示：笛杰躲进了谱架的阴影。给他一份投喂吧。');
}
function runRehearsalScript() {
    if (!hiddenSkillReady('dijie', 'skill')) {
        toast('隐藏技能尚未解锁。');
        return;
    }
    if (!cardOwned('dijie'))
        return;
    ensureCardDay();
    const x = expansion(), first = !x.daily.script;
    if (first) {
        x.daily.script = true;
        for (const id of state.cards.team)
            addCardXP(id, 10);
        save();
        renderGlobal();
    }
    openModal('笛杰的排练脚本', `<div class="script-terminal"><span>LOCAL REHEARSAL PLANNER</span><p>&gt; 检查谱架、节拍器与空调……完成<br>&gt; 当前编队：${state.cards.team.map(id => cardDef(id).name).join('、') || '尚未编队'}<br>&gt; 生成排练单……完成</p></div><div class="local-schedule"><div><b>00′–05′</b><span>调音与热身</span></div><div><b>05′–15′</b><span>分声部练习 · 慢速对拍</span></div><div><b>15′–20′</b><span>休息 · 补水 · 恢复社交电量</span></div><div><b>20′–30′</b><span>合奏与收尾 · 再听一次彼此</span></div></div><p>${first ? '今日首次运行：当前编队各 +10 经验。' : '今天的奖励已领取，可随时回来查看。'}</p><div class="modal-foot">本版原创的游戏内排练单。时间为相对练习分钟数，不是真实预约；不会访问日历、设备或执行外部程序。</div>`);
}
function startPraise() {
    if (!cardOwned('shiyuan'))
        return;
    if (!state.cards.team.includes('shiyuan')) {
        toast('先把十元加入编队，再给伙伴一句鼓励。');
        return;
    }
    if (state.cards.prepared?.id === 'shiyuan') {
        state.cards.prepared = null;
        save();
        renderGlobal();
        toast('这句鼓励先收好，主动技能已取消准备。');
        return;
    }
    const others = state.cards.team.filter(id => id !== 'shiyuan');
    if (!others.length) {
        toast('编队里还需要至少另一位伙伴，才能指定鼓励对象。');
        return;
    }
    openModal('十元：这一次，没你不行！', `<p>选择一位同队伙伴。该角色展示属性和个人基础音符奖励 +25%，直到下一次有命中的演奏结算；emo 会立即解除。会替换已准备的主动技能。</p><div class="replace-list">${others.map(id => { const c = cardDef(id); return `<button class="replace-option" data-shiyuan-target="${id}"><img src="${ASSETS[c.asset]}" alt="${c.name}的虚拟立绘"><span><strong>${c.name}</strong><small>${id === 'dijie' && expansion().dijie.emo ? '恢复 emo + ' : ''}没你不行 · 下场的鼓励对象</small></span>${I('heart')}</button>`; }).join('')}</div>`);
}
function assignPraise(id) {
    if (!state.cards.team.includes('shiyuan') || !state.cards.team.includes(id) || id === 'shiyuan')
        return;
    state.cards.prepared = { id: 'shiyuan', amount: cardDef('shiyuan').active, target: id, token: Date.now() };
    if (id === 'dijie') {
        expansion().dijie.emo = false;
        expansion().dijie.mood = 100;
    }
    save();
    closeModal();
    renderGlobal();
    toast(`十元对${cardDef(id).name}说：「没你不行！」下场鼓励已准备。`, true);
}
function greetShiyuan() {
    if (!cardOwned('shiyuan'))
        return;
    ensureCardDay();
    if (expansion().daily.greet)
        return;
    expansion().daily.greet = true;
    fanWave();
    expansion().shiyuan.happiness = clamp(expansion().shiyuan.happiness + 5, 0, 100);
    save();
    renderGlobal();
    toast('她从琴房探出头：「你们都太棒啦！」全体已相遇伙伴参与每日陪伴奖励。', true);
    playPetSound('pet');
}
async function playShiyuanMoon() {
    if (!hiddenSkillReady('shiyuan', 'skill')) {
        toast('隐藏技能尚未解锁。');
        return;
    }
    if (!cardOwned('shiyuan'))
        return;
    if (['running', 'countdown'].includes(game.status))
        pauseGame();
    const first = unlock('shiyuan_moon');
    save();
    renderGlobal();
    openModal('白月光 · 第一遍的小星星', `<div class="moon-scene"><img src="${ASSETS.cardShiyuan}" alt="十元的女性虚拟立绘"><div><span>琴房的灯，为每一种努力亮着</span><h3>「我再拉一遍，<br>你听听有没有进步？」</h3></div></div><p style="margin-top:16px">她认真地举起琴弓，大家也跟着安静下来。最后一个音落下，掌声先替她亮起。</p><div class="feed-response">${first ? '白月光回忆已珍藏' : '这次是重温，不会重复发放奖励。'}</div><p class="instrument-note">${state.sound ? '正在播放一小段本地合成的《小星星》旋律；不是人物真人录音，也不是小提琴采样。' : '当前静音。可在页面右上角开启声音，再次重温。'}</p><button class="btn secondary" data-card-close>把这一刻收好</button>`);
    if (state.sound) {
        const a = await ensureAudio();
        if (a && state.sound)
            [72, 72, 79, 79, 81, 81, 79, 77, 77, 76, 76, 74, 74, 72].forEach((n, i) => toneAt(n, a.currentTime + i * .35, i === 6 || i === 13 ? .52 : .24, .065, 'fx', 'triangle'));
    }
}
function startAzheApplause() {
    if (!hiddenSkillReady('azhe')) {
        toast(hiddenSkillHint('azhe'));
        return;
    }
    const x = expansion().azhe;
    if (!x.tickets) {
        toast('先带阿喆完成一场有命中的节奏演奏，再送上掌声。');
        return;
    }
    if (['running', 'countdown'].includes(game.status))
        pauseGame();
    let timer = null, last = performance.now(), closed = false;
    const cleanup = () => {
        closed = true;
        if (timer)
            clearInterval(timer);
        save();
    };
    openModal('再为阿喆，鼓掌一会儿', `<div class="encore-scene">${I('violin')}<div class="eyebrow">A LITTLE ENCORE FOR YOU</div><h3>掌声还在，琴弓就不放下。</h3><strong id="encoreClock">${Math.floor(x.applauseMs / 1000)}<small> / 30 秒</small></strong><div class="progress-track"><div class="progress-fill" id="encoreFill" style="width:${x.applauseMs / 300}%"></div></div><p>留在这个弹窗前台，掌声就会继续。<br>关闭或切到后台会暂停计时，已累计时间会保留。</p><button class="btn primary" id="applauseBegin">${I('hand')}开始掌声</button><div id="encoreMessage" role="status"></div></div>`, cleanup);
    $('applauseBegin').onclick = () => {
        $('applauseBegin').disabled = true;
        $('applauseBegin').textContent = '掌声持续中…';
        last = performance.now();
        timer = setInterval(() => {
            if (closed || !$('encoreClock')) {
                clearInterval(timer);
                return;
            }
            const now = performance.now(), delta = Math.min(500, Math.max(0, now - last));
            last = now;
            if (document.hidden)
                return;
            x.applauseMs = Math.min(30000, x.applauseMs + delta);
            $('encoreClock').innerHTML = `${Math.floor(x.applauseMs / 1000)}<small> / 30 秒</small>`;
            $('encoreFill').style.width = `${x.applauseMs / 300}%`;
            if (x.applauseMs >= 30000) {
                clearInterval(timer);
                x.applauseMs = 0;
                x.tickets = Math.max(0, x.tickets - 1);
                x.encores++;
                const earned = claimEconomy('encore', 2, { daily: true });
                addCardXP('azhe', 30);
                unlock('azhe_encore');
                save();
                renderGlobal();
                $('encoreMessage').innerHTML = `<div class="feed-response">华彩安可已触发！指挥回头注视了一次。<br>音符 +${earned}（每日首次 +2） · 阿喆经验 +30 · 回忆已珍藏</div>`;
                $('applauseBegin').textContent = '安可完成 · 谢谢你的掌声';
                playPetSound('play');
            }
        }, 120);
    };
}
