'use strict';

const FUSION_META = {
    rl: { title: '第一篇 · 入线篇', subtitle: '山丘之夜 · 要不要留下来——如果是你呢？', ends: ['fs_leave', 'fs_rush', 'fs_08'], asset: 'fusionChapterEntry', location: '山丘酒吧 · 初次留下' },
    ep2: { title: '第二篇 · 定人选与首排', subtitle: '定人选 · 首次例会 · 首次排练 · 垃垃线十二拍', ends: ['f2_end'], asset: 'fusionChapterDaily', location: '融合组成团 · 第一次排练' },
    fm: { title: '第三篇 · 融合主线', subtitle: '六次排练 · 微信支线 · 融合之夜 · 彩虹姐的尾声', ends: ['m_ep1', 'm_ep2', 'm_ep3'], asset: 'fusionChapterMain', location: '六次排练 · 正式登台' }
};
const FUSION_CHAT_POOL = [
    ['大羊', '大羊发来一段 46 秒语音，主题是「新歌的和弦走向帮我听听」，末尾突然问：「费翔老师，你说我这辈子能靠 SOLO 吃饭吗？🎸」'],
    ['老杜', '老杜给你推了三首冷门的融合爵士，附言：「周六的排练，你坐我旁边，我跟你说说萨克斯怎么跟电声共存。🎷」'],
    ['笛杰', '笛杰发来一段新写的旋律，末尾小声说：「第二版可能更好一点……你觉得呢？🎶」'],
    ['TIM', 'TIM 问了一个和声问题，顺便说单位最近不忙了，排练都能来。末尾加了个少见的表情：「🙏」'],
    ['悦柔', '悦柔发来九张雪山的照片和一条语音：「下次徒步你一起呀！山顶弹一首，绝了！🏔️🎻」'],
    ['十元', '十元连发五条消息，最后一条是：「今天对不起！！请你喝奶茶！三分糖去冰加珍珠！😭🧋」'],
    ['REK', 'REK 发来一段贝斯 slap 的语音，五秒，震得你手机发麻。配文：「新练的。帅不帅。😎」'],
    ['宝石', '宝石：「在吗？V我50，我帮你占卜本周运势。🔮」（他没有还过钱。）'],
    ['垃垃', '垃垃发来消息：「jerry 老师～今天的排练记录我整理好啦。📎」附件末尾写着：「第三页那个错音，是你。哈哈。😼」']
];
const FUSION_EP2_MAIN_QUEUE = ['f2_01', 'f2_m1', 'f2_m2', 'f2_m3', 'f2_m4', 'f2_end'];
const FUSION_EP2_LALA_QUEUE = ['f2_01', 'f2_ll1', 'f2_rec', 'f2_ll3', 'f2_ll4', 'f2_ll5', 'f2_hermusic', 'f2_ll6', 'f2_ll7', 'f2_ll8', 'f2_ll9', 'f2_ll10', 'f2_ll11', 'f2_end'];
const FUSION_FM_STORY_QUEUE = ['m_r2', 'm_r3', 'm_r4', 'm_r5', 'm_r6', 'm_pre1', 'm_pre2'];
const FUSION_FM_POOL_LINES = {
    '老杜': ['f2_ldp1', 'f2_ldp2', 'f2_ldp3', 'f2_ldnight'],
    '大羊': ['f2_dy1', 'f2_dy2', 'f2_dy3', 'f2_rocknight'],
    '笛杰': ['f2_dj1', 'f2_dj2', 'f2_dj3', 'f2_fusenight'],
    '阿齐': ['f2_aq1', 'f2_aq2', 'f2_aq3', 'f2_slap'],
    '宝石': ['f2_bs1', 'f2_bs2', 'f2_bs3']
};
const FUSION_FM_POOL = ['老杜', '大羊', '笛杰', '阿齐', '宝石', '垃垃', '十元'];
const FUSION_SPEAKERS = {
    '旁白': { name: '旁白', tag: '融合线 · 故事叙述', icon: 'album' },
    '你': { name: 'Jerry', tag: '现代音乐人 · 编曲', asset: 'avatarJerry' },
    'Jerry': { name: 'Jerry', tag: '现代音乐人 · 编曲', asset: 'avatarJerry' },
    'jerry': { name: 'Jerry', tag: '现代音乐人 · 编曲', asset: 'avatarJerry' },
    '垃垃': { name: '垃垃', tag: '小提琴手 · 乐团伙伴', asset: 'cardLala' },
    '老杜': { name: '老杜', tag: '萨克斯手 · 融合组伙伴', asset: 'cardLaoduAvatar' },
    '笛杰': { name: '笛杰', tag: '长笛 · 乐团伙伴', asset: 'cardDijie' },
    '大羊': { name: '大羊', tag: '吉他手 · 乐团伙伴', asset: 'cardDayang' },
    '大鹅': { name: '大鹅', tag: '钢琴与键盘 · 乐团伙伴', asset: 'cardGoose' },
    '悦柔': { name: '悦柔', tag: '小提琴手 · 融合组伙伴', asset: 'cardYuerouAvatar' },
    'TIM': { name: 'TIM', tag: '小提琴手 · 乐团伙伴', asset: 'cardTim' },
    '十元': { name: '十元', tag: '乐团团长 · 小提琴', asset: 'cardShiyuan' },
    '宝石': { name: '宝石', tag: '主唱 · 乐团伙伴', asset: 'cardBaoshi' },
    '阿齐': { name: '阿齐', tag: '贝斯手 · 融合组伙伴', icon: 'music' },
    '柠檬': { name: '柠檬', tag: '键盘手 · 乐团伙伴', asset: 'cardLemon' },
    'Bill': { name: 'Bill', tag: '鼓手 · 乐团伙伴', asset: 'cardBill' }
};
const FUSION_CARD_SPEAKER_IDS = Object.fromEntries(CARD_DEFS.flatMap(card => [card.name, ...(STORY_CARD_ALIASES[card.id] || [])].map(name => [name, card.id])));

const FUSION_NODE_VOICE = {
    fs_laodu: '老杜', fs_dayang: '大羊', fs_yuerou: '悦柔', fs_yrok: '悦柔', fs_yrno: '悦柔', fs_yr2: '悦柔', fs_dj: '笛杰', fs_tim: 'TIM',
    f2_dy1: '大羊', f2_dy10: '大羊', f2_ld1: '老杜', f2_ld10: '老杜', f2_dj10: '笛杰', f2_yrask: '悦柔', f2_yrdj: '悦柔', f2_yrmv: '悦柔',
    m_r2a: '老杜', m_r6a: '大鹅', m_talk_ld: '老杜', m_talk_dy: '大羊', m_talk_ge: '大鹅', m_talk_dj: '笛杰', m_talk_ll: '垃垃',
    m_sd_ld: '老杜', m_sd_dy: '大羊', m_sd_dj: '笛杰', m_sd_ll: '垃垃', m_ep: '彩虹姐', m_ep1: '彩虹姐', m_ep2: '十元', m_ep3: '大鹅'
};
const FUSION_KNOWN_VOICES = ['彩虹姐', '悦柔', '老杜', '大羊', '笛杰', '垃垃', '十元', '宝石', '柠檬', 'Bill', 'TIM', 'REK', '大鹅', '阿齐', 'Jerry', 'jerry', '你'];

// Source paragraphs are intentionally atomic, but some mix narration with a
// character action or a sent message. These reviewed overrides identify the
// paragraph's actual focus without splitting complete sentences across cards.
const FUSION_LINE_SPEAKER_OVERRIDES = {
    fs_yrno: [['你婉拒了', 'Jerry']],
    fs_tim: [['TIM 见你过来', 'TIM']],
    fs_yr2: [['悦柔见你过来', '悦柔']],
    fs_05: [['排练第一轮结束', '垃垃']],
    fs_07: [['十元抬起头', '十元']],
    f2_m1: [['你花了一个星期', 'Jerry']],
    f2_llclose: [['第二天的排练照常进行', '垃垃']],
    f2_ll1: [['垃垃回得很快', '垃垃']],
    f2_ll3: [['面试完弦乐手', '垃垃']],
    f2_ll5: [['这次她过了很久才回', '垃垃']],
    f2_ll8: [['十元跑前跑后地解释', '十元'], ['这时候，垃垃', '垃垃']],
    m_r4: [['十元提议换人', '十元']],
    m_r4b: [['垃垃还站在那里', '垃垃']],
    m_pre1: [['演出前一周，垃垃', '垃垃'], ['她练了一遍又一遍', '垃垃']],
    m_talk_ll: [['垃垃把你的稿子', '垃垃'], ['四十分钟后', '垃垃']],
    m_show2: [['台下坐了四百个人。十元', '十元']],
    m_perfect: [['最后一首歌，十元', '十元']],
    f2_ldp1: [['第一次课后，老杜', '老杜']],
    f2_ldnight: [['第三次聊完的周末，老杜', '老杜']],
    f2_bs1: [['宝石跟你聊天', '宝石']],
    f2_bs2: [['宝石开始绕圈', '宝石']],
    f2_cpgo: [['宝石抬起头', '宝石']],
    m_ep2: [['你私信十元', 'Jerry']]
};

function fusionRun(key = state.fusion.chapter) { return state.fusion.runs[key]; }
function fusionNode(key, id) { return FUSION_ROUTES[key].find(node => node.id === id); }
function nextFusionChapterKey(key) {
    const chapters = Object.keys(FUSION_META), index = chapters.indexOf(key);
    return index >= 0 ? chapters[index + 1] || null : null;
}
function fusionUnlocked(key) {
    if (cardBond('jerry') <= 20)
        return false;
    if (key === 'rl')
        return true;
    if (key === 'ep2')
        return state.fusion.runs.rl.ended && state.fusion.runs.rl.ending === 'fs_08';
    return fusionUnlocked('ep2') && state.fusion.runs.ep2.ended;
}
function openFusion() {
    if (!cardOwned('jerry') || cardBond('jerry') <= 20) {
        toast(`Jerry 羁绊分需要严格大于 20；当前 ${cardBond('jerry')}。`);
        return;
    }
    state.fusion.chapter = null;
    save();
    route('fusion');
}
function enterFusionChapter(key) {
    if (!fusionUnlocked(key)) {
        toast(key === 'rl' ? 'Jerry 羁绊分需要严格大于 20。' : '请先完成上一篇。');
        return;
    }
    state.fusion.chapter = key;
    const run = fusionRun(key);
    if (!run.current && !run.ended)
        run.current = FUSION_ROUTES[key][0].id;
    save();
    renderFusion();
    syncStoryMusic();
}
function fusionSpeakerClass(who) {
    return who === '旁白' ? 'narrator' : 'character';
}
function fusionSceneArt(key, id) { return FUSION_ART.find(art => art.chapter === key && art.scene === id) || null; }
function fusionQuoteSpeaker(node, prefix = '') {
    const anotherPersonTakesTurn = /(?:他|她)[^。！？「」]{0,30}(?:说|问|答|回复|回了|开口|喊|想了想|补(?:了)?一句)[^。！？「」]{0,12}[：:]?$/.test(prefix);
    if (!anotherPersonTakesTurn && /(?:你|自己)(?:统一)?(?:回(?:复|了)|答|问|说|开口|听见)/.test(prefix))
        return 'Jerry';
    for (const name of FUSION_KNOWN_VOICES)
        if (!(anotherPersonTakesTurn && name === '你') && prefix.lastIndexOf(name) >= 0)
            return name === '你' || name.toLowerCase() === 'jerry' ? 'Jerry' : name;
    if (/^f2_(?:ll|rec|mine|hermusic|chase)/.test(node.id) || /^m_(?:talk_ll|sd_ll)/.test(node.id)) return '垃垃';
    if (/^f2_ld/.test(node.id) || /^m_(?:talk_ld|sd_ld)/.test(node.id)) return '老杜';
    if (/^f2_(?:dy|rock)/.test(node.id) || /^m_(?:talk_dy|sd_dy)/.test(node.id)) return '大羊';
    if (/^f2_(?:dj|fuse)/.test(node.id) || /^m_(?:talk_dj|sd_dj)/.test(node.id)) return '笛杰';
    if (/^f2_yr/.test(node.id)) return '悦柔';
    if (/^f2_(?:aq|slap)/.test(node.id)) return '阿齐';
    if (/^f2_bs/.test(node.id)) return '宝石';
    return FUSION_NODE_VOICE[node.id] || '旁白';
}
function fusionEmbeddedQuoteSpeaker(node, text) {
    const open = text.indexOf('「');
    if (open < 0)
        return null;
    const close = text.indexOf('」', open + 1), prefix = text.slice(0, open).trim(), suffix = close < 0 ? '' : text.slice(close + 1).trim();
    // Quoted titles, emoji captions and isolated terms stay with the viewpoint
    // narration. A quote is treated as speech only when the prose introduces an
    // utterance, or when the whole line itself starts with dialogue.
    const introducedSpeech = !prefix
        || /[：:]$/.test(prefix)
        || /(?:说(?:了|道)?|问|答|回复|回了|喊|开口|私聊|配文|附言|补(?:了)?一句|小声|语音|点评|核心思想是|唯一的要求是)[^。！？「」]{0,24}$/.test(prefix)
        || (/^(?:了?一声|地说)/.test(suffix) && FUSION_KNOWN_VOICES.some(name => prefix.endsWith(name)));
    if (!introducedSpeech)
        return null;
    const speaker = fusionQuoteSpeaker(node, prefix);
    return speaker === '旁白' ? null : speaker;
}
function fusionReviewedLineSpeaker(node, text) {
    const match = (FUSION_LINE_SPEAKER_OVERRIDES[node.id] || []).find(([prefix]) => text.startsWith(prefix));
    return match?.[1] || null;
}
function fusionLineTurns(node, line) {
    // The source HTML already marks true speaker changes as separate lines.  Do not
    // reinterpret every Chinese quote as a new turn: quotes also appear inside
    // complete narration sentences as titles, emoji captions and recalled speech.
    // Splitting those strings produced dangling fragments such as “秒换成” on one
    // page and “的表情包” on the next.  A source line is therefore the atomic unit.
    const text = line.text.trim();
    // The fusion trilogy is played from Jerry's viewpoint, but a narrator line
    // may introduce another character's direct speech. Attribute that complete
    // paragraph to the actual speaker before applying the second-person fallback.
    const explicitJerryReply = node.id === 'fs_06wait' && text === '「借一步说话。」';
    const reviewedSpeaker = line.who === '旁白' ? fusionReviewedLineSpeaker(node, text) : null;
    const embeddedSpeaker = line.who === '旁白' ? fusionEmbeddedQuoteSpeaker(node, text) : null;
    const who = line.who === '你' || explicitJerryReply ? 'Jerry' : reviewedSpeaker || embeddedSpeaker || (line.who === '旁白' && /你/.test(text) ? 'Jerry' : line.who);
    return [{ who, text }];
}
function fusionStoryLines(node) {
    const lines = node.lines.slice();
    if (node.id === 'fs_yr2' && fusionRun('rl').flags.yrYes)
        lines.push({ who: '悦柔', text: '「回头把 demo 发你，你一定要听！」' });
    return lines;
}
function fusionPages(node) {
    const turns = fusionStoryLines(node)
        .filter(line => !/(本线前置|后宫支线预留|后宫总览|好感进度已存档)/.test(line.text))
        .flatMap(line => fusionLineTurns(node, line));
    const pages = [];
    for (const turn of turns) {
        const last = pages.at(-1), speakers = new Set(last?.map(item => item.who) || []);
        speakers.add(turn.who);
        if (!last || last.length >= 2 || speakers.size > 2)
            pages.push([turn]);
        else
            last.push(turn);
    }
    return pages;
}
function fusionEncounterSpeaker(who) {
    const id = FUSION_CARD_SPEAKER_IDS[who];
    if (!id || cardOwned(id))
        return;
    if (!cardAvailable(id))
        state.cards.encounters.push(id);
    state.cards.collection[id].owned = true;
    state.cards.collection[id].copies = Math.max(1, state.cards.collection[id].copies);
    save();
    toast(`剧情相遇 · ${cardDef(id).name}已加入卡册`, true);
}
function fusionSpeakerHTML(who, label) {
    const card = cardDef(FUSION_CARD_SPEAKER_IDS[who]);
    const person = FUSION_SPEAKERS[who] || (card ? { name: card.name, tag: `${card.role} · 乐团伙伴`, asset: card.asset } : { name: who, tag: '山丘乐手 · 融合线', icon: 'music' });
    return `<div class="cp-speaker" data-speaker="${escapeHTML(who)}">${person.asset ? `<img src="${ASSETS[person.asset]}" alt="${escapeHTML(person.name)}的虚拟插画">` : `<span class="cp-speaker-symbol">${I(person.icon)}</span>`}<div><b>${escapeHTML(person.name)}</b><small>${escapeHTML(person.tag)}</small></div><span class="cp-scene-label">${escapeHTML(label)}</span></div>`;
}
function fusionDialogueHTML(turns, meta) {
    for (const turn of turns)
        fusionEncounterSpeaker(turn.who);
    return turns.map((line, index) => `<section class="cp-dialogue-turn ${fusionSpeakerClass(line.who)}">${fusionSpeakerHTML(line.who, index ? '回应' : meta.title)}<div class="cp-text">${escapeHTML(line.text.trim())}</div></section>`).join('');
}
function fusionChoiceOwnerHTML() {
    return `<div class="fusion-choice-owner"><img src="${ASSETS.avatarJerry}" alt="Jerry 的头像"><span><b>Jerry</b><small>选择回应</small></span></div>`;
}
function fusionChoicesHTML(node, page, pageCount) {
    if (page < pageCount - 1)
        return `<div class="cp-choices fusion-choices"><button class="cp-choice" data-fusion-page-next><span class="cp-option-n">${String(page + 1).padStart(2, '0')}</span><span>继续</span>${I('arrow')}</button></div>`;
    const choices = node.choices.length ? node.choices : [{ text: '（继续）' }];
    return `${fusionChoiceOwnerHTML()}<div class="cp-choices fusion-choices">${choices.map((choice, index) => `<button class="cp-choice" data-fusion-choice="${index}"><span class="cp-option-n">${String(index + 1).padStart(2, '0')}</span><span>${escapeHTML(choice.text)}</span>${I('arrow')}</button>`).join('')}</div>`;
}
function fusionProgressDots(key, run) {
    const main = FUSION_ROUTES[key].filter(node => !node.sub), read = main.filter(node => run.done.includes(node.id)).length;
    const filled = Math.min(6, Math.max(1, Math.ceil((read + 1) / Math.max(1, main.length) * 6)));
    return Array.from({ length: 6 }, (_, i) => `<i class="${i < filled ? 'past' : ''}"></i>`).join('');
}
function fusionSceneHTML(key, node) {
    const run = fusionRun(key), meta = FUSION_META[key], pages = fusionPages(node), page = clamp(run.page || 0, 0, Math.max(0, pages.length - 1)), art = fusionSceneArt(key, node.id);
    run.page = page;
    // Entering a character's scene counts as meeting them even when its first page
    // is a narration lead-in and their explicit dialogue appears on page two.
    node.lines.forEach(line => fusionEncounterSpeaker(line.who));
    if (art && unlock(art.id, false)) {
        save();
        $('albumStat').textContent = `${MEMORIES.filter(memory => memoryVisible(memory.id)).length} / ${MEMORIES.length}`;
    }
    const artStyle = art ? ` style="--scene-art:url('${new URL(ASSETS[art.asset], document.baseURI).href}')"` : '';
    return `<article class="cp-novel ${art ? 'cp-novel-illustrated' : 'cp-novel-text-only'}" aria-label="融合线故事"${artStyle}>
      <header class="cp-novel-top"><span>${escapeHTML(meta.title)}</span><span>${escapeHTML(art?.location || '山丘酒吧')}</span><div class="cp-novel-progress" aria-label="本篇阅读进度">${fusionProgressDots(key, run)}</div></header>
      <div class="cp-novel-body">
        ${art ? `<div class="cp-novel-visual"><div class="cp-novel-heading"><h3>${escapeHTML(node.title || art.title)}</h3><button class="cp-memory-link" data-memory="${art.id}">${I('album')}已收入回忆 · 查看</button></div><figure class="cp-story-art cp-novel-art"><button data-memory="${art.id}" aria-label="查看回忆：${escapeHTML(art.title)}"><img src="${ASSETS[art.asset]}" alt="${escapeHTML(art.text)}" width="832" height="235" decoding="async" fetchpriority="high"></button><figcaption>${escapeHTML(art.location)}</figcaption></figure></div>` : `<div class="cp-novel-heading"><h3>${escapeHTML(node.title || meta.title)}</h3></div>`}
        <div class="cp-novel-dialogue fusion-reader"><div class="fusion-page-count">${page + 1} / ${pages.length}</div><div class="fusion-lines">${fusionDialogueHTML(pages[page] || [], meta)}</div>${fusionChoicesHTML(node, page, pages.length)}</div>
      </div>
    </article>`;
}
function fusionBannerHTML(key = null) {
    const index = key ? Object.keys(FUSION_META).indexOf(key) : -1, meta = key ? FUSION_META[key] : null;
    return `<div class="cp-banner fusion-banner"><img class="cp-banner-portrait" src="${ASSETS.cardJerry}" alt="Jerry 的人物立绘"><div class="cp-overline">ORCHESTRA CHRONICLES / FUSION ROUTE</div><h2>${meta ? meta.title.split(' · ')[1] : '融合线'}</h2><p>${meta ? escapeHTML(meta.subtitle) : '从山丘酒吧的一次推门开始，听见流行、弦乐与管乐真正合到一起。'}<br>${meta ? escapeHTML(meta.location) : '完整三部曲 · 场景插图 · 分篇配乐。'}</p><div class="cp-banner-bottom"><div class="cp-days" aria-label="融合线三篇">${Object.keys(FUSION_META).map((chapter, i) => `<span class="cp-day ${i === index ? 'active' : fusionRun(chapter).ended ? 'past' : ''}">${i + 1}</span>`).join('')}</div><span class="cp-stage-tag">${meta ? '本篇自动存档' : 'Jerry 视角 · 完整三部曲'}</span></div></div>`;
}
function fusionHudHTML(key = null) {
    const read = key ? fusionRun(key).done.length : Object.values(state.fusion.runs).reduce((sum, run) => sum + run.done.length, 0);
    const ended = Object.values(state.fusion.runs).filter(run => run.ended).length;
    return `<div class="cp-hud"><div><small>${I('heart')}Jerry 羁绊分</small><strong>${cardBond('jerry')}</strong></div><div><small>${I('album')}已读节点</small><strong>${read}</strong></div><div><small>${I('check')}完成篇章</small><strong>${ended}<span> / 3</span></strong></div></div>`;
}
function fusionControlsHTML(inChapter = false) {
    return `<div class="cp-controls"><div><button class="btn ghost" ${inChapter ? 'data-fusion-home' : 'data-card-open="jerry"'}>${I('back')}${inChapter ? '篇章选择' : '返回 Jerry 卡牌'}</button>${inChapter ? `<button class="btn ghost" data-fusion-restart="${state.fusion.chapter}">${I('repeat')}重开本篇</button>` : ''}</div><span class="cp-saving"><i></i>融合线进度自动保存</span></div>`;
}
function fusionSideHTML(key) {
    const run = key ? fusionRun(key) : null, collected = FUSION_ART.filter(art => state.memories.includes(art.id)).length;
    return `<aside class="cp-sidebar fusion-sidebar"><section class="cp-sidepanel cp-goal"><h3>${I('crown')}融合线目标</h3><div class="cp-goal-big">${run ? run.done.length : Object.values(state.fusion.runs).reduce((sum, item) => sum + item.done.length, 0)} <small>个节点已读</small></div><p class="cp-goal-sub">从入线、日常到正式登台，选择会留在各篇存档中。</p><div class="cp-milestones">${Object.entries(FUSION_META).map(([chapter, meta]) => `<span class="${fusionRun(chapter).ended ? 'complete' : ''}">${I(fusionRun(chapter).ended ? 'check' : fusionUnlocked(chapter) ? 'music' : 'lock')}${meta.title}</span>`).join('')}</div></section><section class="cp-sidepanel"><h3>${I('album')}融合回忆</h3><div class="cp-goal-big">${collected} <small>/ ${FUSION_ART.length} 幅场景</small></div><p class="cp-caption">读到对应剧情时自动收藏；相册详情与剧情使用同一张图。</p></section><section class="cp-sidepanel"><h3>${I('music')}本篇配乐</h3><p class="cp-caption">与正传共用配乐开关、音量和切页暂停。进入不同篇章时自动切换情绪主题。</p></section></aside>`;
}
function fusionPageHTML(key, main, reading = false) {
    return `<div class="fusion-shell"><div class="cp-switch"><button class="btn cp-current" data-fusion-home>${I('music')}融合线</button><button class="btn ghost" data-route="chronicle">${I('album')}乐团正传</button><button class="btn ghost" data-route="story">${I('heart')}心动故事</button><span class="cp-switch-note">场景插图 · 分篇配乐 · 选择自动保存</span></div><div class="cp-layout ${reading ? 'cp-reading' : ''}"><div class="cp-maincol">${fusionBannerHTML(key)}${fusionControlsHTML(!!key)}${fusionHudHTML(key)}${window.StoryBgm?.controls() || ''}<div class="lala-notebook-shortcut fusion-route-note">${I('album')}<span>${key ? FUSION_META[key].title : 'Jerry 的融合三部曲'}</span><small>${key ? '选择与结局留在当前存档' : '完成前一篇，开启下一篇'}</small></div><div id="fusionMain">${main}</div></div>${reading ? `<details class="cp-reader-details"><summary>融合线近况 · 篇章与回忆 ${I('arrow')}</summary>${fusionSideHTML(key)}</details>` : fusionSideHTML(key)}</div></div>`;
}
function renderFusionHub() {
    const rows = Object.entries(FUSION_META).map(([key, meta]) => {
        const unlocked = fusionUnlocked(key), run = fusionRun(key);
        const status = !unlocked && key === 'ep2' && fusionRun('rl').ended && fusionRun('rl').ending !== 'fs_08'
            ? '第一篇 BE · 尚未开放'
            : run.ended ? '已完成' : run.current ? '进行中' : unlocked ? '可阅读' : '尚未开放';
        return `<button class="fusion-chapter ${unlocked ? '' : 'locked'}" data-fusion-chapter="${key}" ${unlocked ? '' : 'disabled'}><img src="${ASSETS[meta.asset]}" alt="" aria-hidden="true"><span><small>${status}</small><strong>${meta.title}</strong><em>${meta.subtitle}</em></span>${I(unlocked ? 'arrow' : 'lock')}</button>`;
    }).join('');
    $('view-fusion').innerHTML = fusionPageHTML(null, `<div class="fusion-chapters">${rows}</div>`);
}
function renderFusion() {
    if (currentView !== 'fusion')
        return;
    const key = state.fusion.chapter;
    if (!key) {
        renderFusionHub();
        return;
    }
    const run = fusionRun(key), meta = FUSION_META[key];
    if (run.ended) {
        const ending = fusionNode(key, run.ending);
        const nextKey = nextFusionChapterKey(key);
        const canContinue = nextKey && fusionUnlocked(nextKey);
        const endingCopy = key === 'rl' && run.ending === 'fs_08'
            ? '你把一个流行音乐人的夜晚，活成了哈基米的历史转折点。'
            : key === 'rl'
                ? '这一篇走向了 BE，第二篇不会开启。重新开始本篇，走到「分组之夜」后才能继续。'
                : '这一篇已经走到结尾，选择与旗标均已保存。';
        $('view-fusion').innerHTML = fusionPageHTML(key, `<article class="cp-surface fusion-ending"><span class="eyebrow">ROUTE COMPLETE</span><h2>${escapeHTML(ending?.title || meta.title + ' · 已完结')}</h2><p>${endingCopy}</p><div class="fusion-ending-actions"><button class="btn secondary" data-fusion-restart="${key}">${I('repeat')}重新开始本篇</button>${canContinue ? `<button class="btn primary" data-fusion-next-chapter="${nextKey}">进入下一篇章${I('arrow')}</button>` : `<button class="btn primary" data-fusion-home>返回篇章选择${I('arrow')}</button>`}</div></article>`);
        return;
    }
    if (key === 'ep2' && run.flags.chatHub) {
        renderFusionChats();
        return;
    }
    if (key === 'fm' && run.flags.poolHub) {
        renderFusionPool();
        return;
    }
    const node = fusionNode(key, run.current) || FUSION_ROUTES[key][0];
    run.current = node.id;
    save();
    $('view-fusion').innerHTML = fusionPageHTML(key, fusionSceneHTML(key, node), true);
}
function finishFusion(key, ending) {
    const run = fusionRun(key);
    run.ended = true;
    run.ending = ending;
    run.flags.chatHub = false;
    save();
    renderFusion();
    syncStoryMusic();
}
function nextFusionMain(key) {
    const run = fusionRun(key);
    if (key === 'ep2') {
        const lalaConsistent = run.flags.llPath && (!run.chatTotal || (run.chats['垃垃'] || 0) === run.chatTotal);
        if (run.flags.llPath && !run.flags.llClosed && !lalaConsistent) {
            run.flags.llClosed = true;
            ['f2_ll4', 'f2_ll5', 'f2_hermusic'].forEach(id => { if (!run.done.includes(id)) run.done.push(id); });
            return showFusionNode(key, 'f2_llclose');
        }
        const queue = run.flags.llPath && !run.flags.llClosed ? FUSION_EP2_LALA_QUEUE : FUSION_EP2_MAIN_QUEUE;
        for (const id of queue) {
            if (run.done.includes(id)) continue;
            if (run.flags.llPath && ['f2_ll4', 'f2_ll5', 'f2_hermusic'].includes(id) && run.lastChat !== '垃垃') {
                run.done.push(id);
                continue;
            }
            return showFusionNode(key, id);
        }
        return finishFusion(key, 'f2_end');
    }
    if (key === 'fm') {
        const nextId = FUSION_FM_STORY_QUEUE.find(id => !run.done.includes(id));
        return showFusionNode(key, nextId || 'g_pre');
    }
    const next = FUSION_ROUTES[key].find(node => !node.sub && !run.done.includes(node.id) && (key !== 'fm' || !['m_ok', 'm_bad', 'm_perfect'].includes(node.id)));
    if (next)
        showFusionNode(key, next.id);
    else
        finishFusion(key, run.current);
}
function showFusionNode(key, id) {
    const node = fusionNode(key, id);
    if (!node)
        return nextFusionMain(key);
    const run = fusionRun(key);
    run.current = id;
    run.page = 0;
    run.flags.chatHub = false;
    run.flags.poolHub = false;
    save();
    renderFusion();
}
function fusionResult() {
    const run = fusionRun('fm');
    const required = ['iceOK', 'tenYuanOK', 'comfortOK', 'agreeOK', 'helpLL', 'backupOK', 'agreeGE', 'practiceLL', 'draftLL'];
    const bad = ['comfortNo', 'changeNo', 'helpLLNo', 'backupNo', 'rageGE', 'practiceNo'].filter(flag => run.flags[flag]).length >= 2 || run.flags.rageGE;
    showFusionNode('fm', bad ? 'm_bad' : required.every(flag => run.flags[flag]) ? 'm_perfect' : 'm_ok');
}
function chooseFusion(index) {
    const key = state.fusion.chapter, run = fusionRun(key), node = fusionNode(key, run.current);
    if (!node || run.ended)
        return;
    const pages = fusionPages(node);
    if ((run.page || 0) < pages.length - 1)
        return continueFusionPage();
    if (!run.done.includes(node.id))
        run.done.push(node.id);
    const choice = node.choices[index] || { score: 0, flags: [], next: null };
    run.score += choice.score || 0;
    for (const flag of choice.flags || [])
        run.flags[flag] = true;
    if (node.id === 'f2_ll1')
        run.flags.llPath = true;
    save();
    if (FUSION_META[key].ends.includes(node.id))
        return finishFusion(key, node.id);
    if (choice.next === 'RESULT')
        return fusionResult();
    if (key === 'fm' && choice.next === 'm_result')
        return fusionResult();
    if (choice.next === 'LLJUDGE') {
        const lalaOnly = run.chatTotal > 0 && (run.chats['垃垃'] || 0) === run.chatTotal;
        return showFusionNode(key, run.flags.llPath && lalaOnly ? 'f2_ll11' : 'f2_ll11soft');
    }
    if (key === 'ep2' && choice.next === 'f2_mX') {
        run.flags.llClosed = true;
        return nextFusionMain('ep2');
    }
    if (key === 'ep2' && choice.next === 'NEXT')
        return openFusionChats();
    if (key === 'fm' && choice.next === 'POOL')
        return openFusionPool('story');
    if (key === 'fm' && choice.next === 'PREPOOL')
        return openFusionPool('pre');
    if (key === 'fm' && choice.next === 'POSTPOOL')
        return openFusionPool('post');
    if (key === 'fm' && choice.next === 'NEXT')
        return openFusionPool(run.poolStage || 'story');
    if (key === 'fm' && ['m_ok', 'm_bad', 'm_perfect'].includes(node.id) && choice.next === 'm_ep')
        return showFusionNode('fm', 'g_post');
    if (choice.next)
        return showFusionNode(key, choice.next);
    if (key === 'fm' && node.id === 'f2_cpgo')
        return openFusionPool(run.poolStage || 'pre');
    if (key === 'ep2')
        return openFusionChats();
    nextFusionMain(key);
}
function continueFusionPage() {
    const key = state.fusion.chapter, run = fusionRun(key), node = fusionNode(key, run.current);
    if (!node)
        return;
    run.page = clamp((run.page || 0) + 1, 0, Math.max(0, fusionPages(node).length - 1));
    save();
    renderFusion();
}
function openFusionChats() {
    const run = fusionRun('ep2');
    run.flags.chatHub = true;
    save();
    renderFusion();
}
function renderFusionChats(message = null) {
    const run = fusionRun('ep2');
    const content = `<article class="cp-novel cp-novel-text-only" aria-label="融合线微信日常"><header class="cp-novel-top"><span>${FUSION_META.ep2.title}</span><span>微信通讯录 · 夜晚</span><div class="cp-novel-progress">${fusionProgressDots('ep2', run)}</div></header><div class="cp-novel-body"><div class="cp-novel-heading"><h3>一天过去了，Jerry 看着微信通讯录——</h3></div><div class="cp-novel-dialogue fusion-reader fusion-chat">${message ? `${fusionSpeakerHTML(message[0], '今晚的消息')}<div class="fusion-message"><p>${escapeHTML(message[1])}</p></div>${fusionChoiceOwnerHTML()}<div class="cp-choices fusion-choices"><button class="cp-choice" data-fusion-next-main><span class="cp-option-n">01</span><span>（道了晚安，继续明天）</span>${I('arrow')}</button></div>` : `<p>今晚，跟谁聊聊？聊天次数只用于推进本篇事件，不是独立羁绊或好感数值。</p><div class="fusion-chat-grid">${FUSION_CHAT_POOL.map(([name], index) => `<button class="cp-choice" data-fusion-chat="${name}"><span class="cp-option-n">${String(index + 1).padStart(2, '0')}</span><span>${escapeHTML(name)}<small>已聊 ${run.chats[name] || 0} 次</small></span>${I('arrow')}</button>`).join('')}</div>`}</div></div></article>`;
    $('view-fusion').innerHTML = fusionPageHTML('ep2', content, true);
}
function fusionChat(name) {
    if (state.fusion.chapter === 'fm')
        return fusionPoolChat(name);
    const run = fusionRun('ep2'), message = FUSION_CHAT_POOL.find(item => item[0] === name);
    if (!message)
        return;
    run.chats[name] = (run.chats[name] || 0) + 1;
    run.chatTotal++;
    run.lastChat = name;
    // The source story schedules YueRou's arrangement request after the first
    // chat of chapter two. Talking to YueRou herself still counts as that first
    // chat; excluding her here made the whole branch silently disappear.
    if (state.fusion.runs.rl.flags.yrYes && !run.flags.yrAsked)
        run.flags.yrPending = true;
    save();
    renderFusionChats(message);
}
function continueFusionMain() {
    const key = state.fusion.chapter, run = fusionRun(key);
    if (key === 'fm')
        return openFusionPool(run.poolStage || 'story');
    // Show the request only after the selected chat has been read. The
    // chatTotal fallback repairs saves created while the old YueRou exclusion
    // was active, without exposing the branch to players who did not add her.
    if (state.fusion.runs.rl.flags.yrYes && !run.flags.yrAsked && (run.flags.yrPending || run.chatTotal > 0)) {
        run.flags.yrPending = false;
        run.flags.yrAsked = true;
        save();
        return showFusionNode('ep2', 'f2_yrask');
    }
    // Accepting the arrangement request leads to the next-day micro-film
    // invitation after one more chat/day. This was present in the supplied
    // script but previously had no route back into the integrated reader.
    if (run.flags.yrOK && run.done.includes('f2_yrask') && !run.done.includes('f2_yrmv') && run.chatTotal > 1)
        return showFusionNode('ep2', 'f2_yrmv');
    run.flags.chatHub = false;
    save();
    nextFusionMain('ep2');
}
function openFusionPool(stage) {
    const run = fusionRun('fm');
    run.poolStage = stage;
    run.flags.poolHub = true;
    save();
    renderFusion();
}
function renderFusionPool(message = null) {
    const run = fusionRun('fm'), stage = run.poolStage || 'story';
    const label = stage === 'pre' ? '演出前夜 · 微信' : stage === 'post' ? '演出后的深夜 · 微信' : '排练结束 · 微信';
    const content = `<article class="cp-novel cp-novel-text-only" aria-label="融合主线微信支线"><header class="cp-novel-top"><span>${FUSION_META.fm.title}</span><span>${label}</span><div class="cp-novel-progress">${fusionProgressDots('fm', run)}</div></header><div class="cp-novel-body"><div class="cp-novel-heading"><h3>${message ? '今晚的消息' : '今晚，跟谁聊聊？'}</h3></div><div class="cp-novel-dialogue fusion-reader fusion-chat">${message ? `${fusionSpeakerHTML(message[0], label)}<div class="fusion-message"><p>${escapeHTML(message[1])}</p></div>${fusionChoiceOwnerHTML()}<div class="cp-choices fusion-choices"><button class="cp-choice" data-fusion-next-main><span class="cp-option-n">01</span><span>（回到通讯录）</span>${I('arrow')}</button></div>` : `<p>这些聊天属于第三篇的排练与演出支线；每位角色的专属事件会按聊天次数依次出现。</p><div class="fusion-chat-grid">${FUSION_FM_POOL.map((name, index) => `<button class="cp-choice" data-fusion-chat="${name}"><span class="cp-option-n">${String(index + 1).padStart(2, '0')}</span><span>${escapeHTML(name)}<small>已聊 ${run.chats[name] || 0} 次</small></span>${I('arrow')}</button>`).join('')}</div><div class="fusion-pool-actions"><button class="cp-choice" data-fusion-pool-end><span class="cp-option-n">→</span><span>${stage === 'pre' ? '（睡吧，明天登台）' : stage === 'post' ? '（尘埃落定）' : '（结束聊天，继续排练）'}</span>${I('arrow')}</button></div>`}</div></div></article>`;
    $('view-fusion').innerHTML = fusionPageHTML('fm', content, true);
}
function fusionPoolChat(name) {
    const run = fusionRun('fm'), lines = FUSION_FM_POOL_LINES[name] || [];
    run.chats[name] = (run.chats[name] || 0) + 1;
    run.chatTotal++;
    run.lastChat = name;
    const seen = run.seen[name] || 0;
    const limit = run.poolStage === 'story' ? 2 : run.poolStage === 'pre' ? lines.length : 0;
    if (seen < Math.min(limit, lines.length)) {
        run.seen[name] = seen + 1;
        save();
        return showFusionNode('fm', lines[seen]);
    }
    const fallback = name === '垃垃'
        ? '垃垃：「演出辛苦了。早点休息。」'
        : name === '十元'
            ? '十元发来一串 😭😭😭，然后说：「我请你喝一个月的奶茶！🧋」'
            : `${name}跟你聊了聊最近的排练。`;
    save();
    renderFusionPool([name, fallback]);
}
function finishFusionPool() {
    const run = fusionRun('fm'), stage = run.poolStage || 'story';
    run.flags.poolHub = false;
    save();
    if (stage === 'story')
        return nextFusionMain('fm');
    if (stage === 'pre')
        return showFusionNode('fm', 'm_show');
    showFusionNode('fm', 'm_ep');
}
function restartFusionChapter(key) {
    state.fusion.runs[key] = freshFusionRun();
    state.fusion.chapter = key;
    save();
    enterFusionChapter(key);
}
