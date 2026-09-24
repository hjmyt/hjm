'use strict';

function freshSourceCast() { return { performances: 0, xiaozhou: { confidence: 45, solos: 0, praised: false, compared: false }, lemon: { ended: false, lastChallenge: -1, result: '' }, dayang: { online: true }, baoshi: { purity: 0 } }; }
function cleanSourceCast(o) {
    const d = freshSourceCast();
    if (!o || typeof o !== 'object')
        return d;
    const n = (v, max, f = 0) => Number.isFinite(Number(v)) ? clamp(Math.floor(Number(v)), 0, max) : f;
    d.performances = n(o.performances, 999999);
    d.xiaozhou.confidence = n(o.xiaozhou?.confidence, 100, 45);
    d.xiaozhou.solos = n(o.xiaozhou?.solos, 3);
    d.xiaozhou.praised = o.xiaozhou?.praised === true;
    d.xiaozhou.compared = o.xiaozhou?.compared === true;
    d.lemon.ended = o.lemon?.ended === true;
    d.lemon.lastChallenge = Number.isInteger(o.lemon?.lastChallenge) ? clamp(o.lemon.lastChallenge, -1, d.performances) : -1;
    d.lemon.result = typeof o.lemon?.result === 'string' ? o.lemon.result.slice(0, 120) : '';
    d.dayang.online = o.dayang?.online !== false;
    d.baoshi.purity = n(o.baoshi?.purity, 100);
    return d;
}
function sourceCast() { return state.cards.sourceCast || (state.cards.sourceCast = freshSourceCast()); }
function sourceStat(c, k, v) {
    if (c.id === 'zhu' && k === '调酒')
        return hiddenSkillReady('zhu') && state.cards.zhuNight === true ? 96 : '??';
    return c.id === 'xiaozhou' && k === '自信' ? sourceCast().xiaozhou.confidence : v;
}
function renderSourceInfo(c) { return `<section class="profile-panel"><h3 class="panel-title">${I('cards')}基本资料 <span class="tiny">${c.tag}</span></h3><dl class="profile-info"><dt>身份</dt><dd>${c.identity}</dd>${c.info.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl><p class="info-bio">${c.bio}</p></section>`; }
function prepareSourceSkill(id) {
    const c = cardDef(id);
    if (!c?.sourceSet || !cardOwned(id))
        return;
    if (id === 'lemon') {
        showLemonChallenge();
        return;
    }
    if (!state.cards.team.includes(id)) {
        toast('先邀请这位伙伴加入编队。');
        return;
    }
    if (state.cards.prepared?.id === id) {
        state.cards.prepared = null;
        save();
        renderGlobal();
        return;
    }
    const x = sourceCast(), amount = id === 'xiaozhou' ? c.active * (x.xiaozhou.praised ? 2 : x.xiaozhou.compared ? .5 : 1) : id === 'dayang' ? c.active + (x.dayang.online ? 4 : 0) : c.active;
    state.cards.prepared = { id, amount, token: Date.now() };
    save();
    renderGlobal();
    toast(`${c.activeName}已准备，下一场有命中的演奏结算。`, true);
}
function sourceSkillAmount(id) { const c = cardDef(id), x = sourceCast(); return id === 'xiaozhou' ? c.active * (x.xiaozhou.praised ? 2 : x.xiaozhou.compared ? .5 : 1) : id === 'dayang' ? c.active + (x.dayang.online ? 4 : 0) : c.active; }
function renderSourceSkills(c) {
    const x = sourceCast(), owned = cardOwned(c.id), queued = state.cards.prepared?.id === c.id;
    const amount = sourceSkillAmount(c.id), ended = c.id === 'lemon' && x.lemon.ended;
    const button = ended ? '<button class="btn ghost small" data-source-action="lemon-ending">查看人物线结局</button>' : `<button class="btn secondary small" data-card-skill="${c.id}" ${!owned ? 'disabled' : ''}>${c.id === 'lemon' ? '选择一位乐手' : queued ? '取消准备' : c.id === 'xiaota' ? '准备救场 · 本场一次' : `准备技能`}</button>`;
    const rules = { huangyx: '准备后，下场完整达标演奏参与全队加成（合计最多 +2 音符），每场结算一次。', zhu: '准备后，下场完整达标演奏参与全队加成（合计最多 +2 音符）；每场结算一次。', xiaozhou: `下场完整达标演奏参与全队加成（合计最多 +2 音符）。投喂「认真的夸奖」可使本次技能翻倍；被柠檬比较后，本次技能减半。结束一场后恢复。`, lemon: '选择已相遇的乐手与回应方式，每完成一场演奏可再发动一次；不改变他人的节奏判定。', xiaota: '准备后，本场第一次漏拍必定被接成 GOOD；完整演奏达标时参与全队加成（合计最多 +2 音符）。', dayang: `本场即兴按${x.dayang.online ? '有网 93' : '离线 72'}展示，达标后参与全队加成（合计最多 +2 音符）；曲库状态可在卡片里切换。`, baoshi: '准备后，完整演奏时，达标则参与全队加成（合计最多 +2 音符），心灵净化进度 +50%（上限 100%）。', goose: '准备后，下场完整达标演奏参与全队加成（合计最多 +2 音符）。新的正传重逢剧情仍待后续章节。' };
    const passiveRules = { huangyx: '入队参与全队加成，达标时合计最多 +2 音符；赢单率为人物设定，不改变节奏判定。', zhu: '入队参与全队加成，达标时合计最多 +2 音符。', xiaozhou: `已完成独立演出 ${x.xiaozhou.solos}/3；自信 ${x.xiaozhou.confidence}/100。需完成整首且有主动命中，大鹅不在同队。`, lemon: x.lemon.result || '帽子领域常驻；这份自信不会提高实际音准或节奏。', xiaota: '漏拍时有 70% 概率由鼓点接成 NICE，救场主动技优先；连续接住三拍后可解除队内笛杰的 emo。自动接拍不计为 PERFECT。', dayang: '有网时即兴 93，离线时即兴 72；切换状态后需重新准备技能。', baoshi: `携带宝石完成有命中的演奏，其他同队伙伴参与每日陪伴奖励；净化进度 ${x.baoshi.purity}%。`, goose: '退群是正传中的已发生情节；已收藏的卡片与养成仍然保留。' };
    let html = skillBlock(c.activeName, '主动技', c.activeText, rules[c.id], button, false, c.id === 'lemon' ? '每次排练' : c.id === 'xiaota' ? '一场演出' : c.id === 'dayang' ? '一首曲子' : '无');
    html += skillBlock(c.passiveName, c.id === 'huangyx' ? '反差技' : c.id === 'xiaozhou' ? '成长技' : c.id === 'goose' ? '剧情技' : '被动', c.passiveText, passiveRules[c.id], c.id === 'dayang' ? `<button class="btn ghost small" data-source-action="cloud">切换为${x.dayang.online ? '离线' : '有网'}练习</button>` : '');
    if (c.id === 'huangyx')
        html += skillBlock('情敌的体面', '对决', '面对竞争者从不打压，只会把条件摆上桌：「你配得上她，就来拿。」输掉的时候，他真的会祝福——然后把悲伤换算成工作时长。', '在第五章中，按音乐节表现与琴技、等级、十元羁绊推进对决。');
    if (c.id === 'zhu')
        html += skillBlock('卡祖笛小号', '救场技', '任何缺失的声部，他都能用卡祖笛顶上。音准 surprisingly 全对。乐手们憋笑憋出内伤，但没人能否认那确实救了场。', '队中没有管乐角色时，首次漏拍由卡祖笛接成 NICE，每场一次。自动接拍不算主动命中。') + renderZhuSecret();
    if (c.id === 'lemon')
        html += `<div class="source-warning">羁绊成长不会结束人物线。涉及远行的决定，请在剧情中谨慎选择。</div>` + hiddenSkillBlock('lemon', '<h4>危险羁绊 · BE 缅北直通车</h4><p>他会热情邀请你「出国挣大钱」，下飞机的地方没有键盘，只有围墙。保持距离，各生欢喜。</p>');
    if (c.id === 'baoshi')
        html += hiddenSkillBlock('baoshi', '<h4>隐藏身份 · 宝石姬</h4><p>柜子的最深处，挂着一个他亲手打理的衣橱。某些夜晚，他会以「宝石姬」的身份站上另一个舞台——台下的人疯狂尖叫，台上的「她」笑得比谁都自在。少年音配裙子，是他藏得最深的秘密，也是最真的自己。</p><button class="btn secondary small" data-source-action="baoshi-memory">收藏这一面的舞台</button>');
    return `<section class="profile-panel"><h3 class="panel-title">${I('sparkles')}技能</h3><div class="skill-list">${html}</div></section>`;
}
function onSourceGift(c, g) {
    if (c.id === 'xiaozhou') {
        const x = sourceCast().xiaozhou;
        x.confidence = Math.min(100, x.confidence + g[4]);
        if (g[0] === 'praise') {
            x.praised = true;
            x.compared = false;
        }
    }
}
function showLemonEnding() {
    if (!sourceCast().lemon.ended)
        return;
    openModal('BE · 缅北直通车', '<p>那句「出国挣大钱」的邀请，最后停在一扇围墙后的门前。没有键盘，也没有舞台。</p><p>柠檬的人物线已结束。其他人物、乐团正传与养成进度都保留，可以继续你的旅程。</p><button class="btn primary" data-card-close>回到乐团</button>');
}
function showLemonChallenge() {
    if (!cardOwned('lemon') || sourceCast().lemon.ended)
        return;
    const x = sourceCast();
    if (x.lemon.lastChallenge === x.performances) {
        toast('这次排练已经说过了，演奏结束后再来。');
        return;
    }
    const targets = CARD_DEFS.filter(c => !c.placeholder && c.id !== 'lemon' && cardOwned(c.id));
    openModal('毕竟我比你强一点', `<p>选择对话的乐手，以及对方的回应。</p><div class="source-targets">${targets.map(c => `<div><strong>${c.name}</strong><button class="btn secondary small" data-lemon-target="${c.id}" data-lemon-response="serious">认真比一段</button><button class="btn ghost small" data-lemon-target="${c.id}" data-lemon-response="ignore">不理会他</button></div>`).join('') || '<p>先在剧情中遇见另一位伙伴。</p>'}</div>`);
}
function resolveLemonChallenge(id, response) {
    const x = sourceCast();
    if (!cardOwned('lemon') || x.lemon.ended || x.lemon.lastChallenge === x.performances || !cardOwned(id) || id === 'lemon' || cardDef(id).placeholder || !['serious', 'ignore'].includes(response))
        return;
    x.lemon.lastChallenge = x.performances;
    x.lemon.result = response === 'serious' ? `${cardDef(id).name}认真弹完，柠檬输了，却又压低了帽檐。` : `${cardDef(id).name}没有理会，柠檬默认自己赢了。`;
    if (id === 'xiaozhou') {
        x.xiaozhou.compared = true;
        x.xiaozhou.praised = false;
    }
    save();
    openModal('排练间隙', `<p>${escapeHTML(x.lemon.result)}</p>`);
    renderGlobal();
}
function onXiaotaBeat() {
    const r = game.cardRun;
    if (!r?.sourceSnapshot?.xiaota)
        return;
    r.sourceSnapshot.beats++;
    if (r.sourceSnapshot.beats >= 3 && r.ids.includes('dijie') && expansion().dijie.emo) {
        expansion().dijie.emo = false;
        expansion().dijie.mood = Math.min(100, expansion().dijie.mood + 10);
        r.sourceSnapshot.beats = 0;
    }
}
function settleLateNote(note, now) {
    const r = game.cardRun, x = r?.sourceSnapshot;
    let label = null, rescuer = '小塔';
    if (x?.xiaota) {
        if (r.prepared?.id === 'xiaota' && !x.rescued) {
            x.rescued = true;
            label = 'GOOD';
        }
        else if (Math.random() < .7)
            label = 'NICE';
    }
    if (!label && x && r.ids.includes('zhu') && !r.ids.some(id => cardDef(id)?.group === '管乐') && !x.zhuRescued) {
        x.zhuRescued = true;
        label = 'NICE';
        rescuer = '朱老师';
    }
    if (label) {
        note.hit = true;
        x.assists++;
        if (label === 'GOOD') {
            game.good++;
            game.score += 700;
        }
        else {
            game.nice++;
            game.score += 400;
        }
        game.combo++;
        game.maxCombo = Math.max(game.maxCombo, game.combo);
        r.missStreak = 0;
        onXiaotaBeat();
        game.judgement = { text: rescuer + ' · ' + label, at: now, lane: note.lane };
    }
    else {
        note.missed = true;
        game.miss++;
        onExpansionMiss();
        game.combo = 0;
        if (x)
            x.beats = 0;
        game.judgement = { text: 'MISS', at: now, lane: note.lane };
    }
    updateGameStats();
}
function onSourcePerformance(run) {
    const x = sourceCast(), messages = [];
    x.performances++;
    if (run.ids.includes('xiaozhou') && !run.ids.includes('goose')) {
        const z = x.xiaozhou, before = z.solos;
        z.solos = Math.min(3, z.solos + 1);
        z.confidence = Math.min(100, z.confidence + 10);
        messages.push('小周独立演出 ' + z.solos + '/3 · 自信 +10');
        if (before < 3 && z.solos === 3) {
            unlock('xiaozhou_sr');
            messages.push('小周永久进化 SR');
        }
    }
    if (run.ids.includes('xiaozhou')) {
        x.xiaozhou.praised = false;
        x.xiaozhou.compared = false;
    }
    if (run.ids.includes('baoshi')) {
        for (const id of run.ids)
            if (id !== 'baoshi')
                rewardCompanionBond(id);
        if (run.prepared?.id === 'baoshi')
            x.baoshi.purity = Math.min(100, x.baoshi.purity + 50);
        messages.push('宝石的天然呆领域 · 队友参与每日陪伴奖励');
    }
    if (run.sourceSnapshot?.assists)
        messages.push('伙伴接住 ' + run.sourceSnapshot.assists + ' 次漏拍');
    run.sourceReport = messages.join(' · ');
}
