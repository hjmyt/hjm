'use strict';

// Official chapter seven is a source-driven visual novel kept separate from the
// six weekly-training runs and from the independent personal-story collection.
function createChronicleSeven(ctx) {
    const nodeMap = new Map(CHAPTER_SEVEN.nodes.map(node => [node.id, node]));
    const endingIds = CHAPTER_SEVEN.nodes.filter(node => node.ending).map(node => node.id);
    const S = () => ctx.M().chapterSeven || (ctx.M().chapterSeven = freshSeven());
    const node = () => nodeMap.get(S().scene);
    const esc = ctx.E;
    const freshSeven = () => ({ active: false, scene: CHAPTER_SEVEN.entry, page: 0, flags: {}, done: {}, read: [], ending: null, endings: [], run: 1, unity: 0, qiqi: 0, azhe: 0, rev: 0, previewed: null });

    function cleanSeven(raw) {
        const s = freshSeven();
        if (!raw || typeof raw !== 'object') return s;
        const ids = new Set(CHAPTER_SEVEN.nodes.map(item => item.id));
        s.active = raw.active === true;
        s.scene = ids.has(raw.scene) ? raw.scene : CHAPTER_SEVEN.entry;
        s.page = ctx.nInt(raw.page, 0, 0, Math.max(0, pages(nodeMap.get(s.scene)).length - 1));
        s.flags = Object.fromEntries(Object.entries(raw.flags || {}).filter(([key, value]) => value === true || value === 1).map(([key]) => [ctx.str(key, 40), true]));
        s.done = Object.fromEntries([...ids].filter(id => raw.done?.[id] === true || raw.done?.[id] === 1).map(id => [id, true]));
        s.read = Array.isArray(raw.read) ? [...new Set(raw.read.filter(id => ids.has(id)))] : [];
        s.endings = Array.isArray(raw.endings) ? [...new Set(raw.endings.filter(id => endingIds.includes(id)))] : [];
        s.ending = endingIds.includes(raw.ending) ? raw.ending : null;
        if (s.ending && !s.endings.includes(s.ending)) s.endings.push(s.ending);
        s.run = ctx.nInt(raw.run, 1, 1, 99999);
        s.unity = ctx.nInt(raw.unity, 0, -9999, 9999);
        s.qiqi = ctx.nInt(raw.qiqi, 0, 0, 9999);
        s.azhe = ctx.nInt(raw.azhe, 0, 0, 9999);
        s.rev = ctx.nInt(raw.rev, 0, 0, 99999999);
        s.previewed = s.ending && raw.previewed === s.ending ? s.ending : null;
        if (s.ending) s.active = raw.active === true;
        return s;
    }
    function changed(focus = false) { S().rev++; ctx.changed(); if (focus) focusStoryDialogue('#cpMain'); }
    function enterSeven() {
        if (!ctx.chapterUnlocked(7)) { toast('先完成第六章，再继续第七章。'); return; }
        ctx.suspend();
        ctx.M().personal.active = false;
        S().active = true;
        closeModal(false); changed(); route('chronicle');
    }
    function leaveSeven() { S().active = false; changed(); }
    function pages(item) {
        const result = [];
        let dialogue = [];
        const flushDialogue = () => {
            if (!dialogue.length) return;
            result.push(dialogue);
            dialogue = [];
        };
        for (const line of item?.lines || []) {
            if (line.who === 'narrator') {
                flushDialogue();
                result.push([{ ...line }]);
                continue;
            }
            dialogue.push({ ...line });
            if (dialogue.length === 2) flushDialogue();
        }
        flushDialogue();
        return result.length ? result : [[]];
    }
    function pageArt(item, page) {
        const art = item?.pageArt || [];
        if (!art.length) return null;
        return art[Math.min(art.length - 1, Math.max(0, page))];
    }
    function character(who) {
        if (who === 'narrator') return {name:'旁白',tag:'第七章 · 后山丘时代',icon:'album',asset:'avatarNarrator'};
        if (who === 'bingbing') return {name:'冰冰',tag:'全团女神 · 弦乐演奏者',card:'bingbing',icon:'music'};
        if (who === 'zhou') return {name:'周总',tag:'周氏文化产业集团',asset:'avatarZhouNpc',icon:'team'};
        if (who === 'boy') return {name:'男生',tag:'路演现场',icon:'team'};
        return ctx.person(who);
    }
    function encounterBingbing(lines) {
        if (!lines.some(line => line.who === 'bingbing' || line.text.includes('冰冰'))) return;
        const card = cardDef('bingbing'), entry = state.cards.collection.bingbing;
        if (!card || !entry || entry.owned) return;
        if (!cardAvailable('bingbing')) state.cards.encounters.push('bingbing');
        entry.owned = true; entry.copies = Math.max(1, entry.copies); save();
        toast(`剧情相遇 · ${card.name}已加入卡册`, true);
    }
    function applyFlags(choice) {
        for (const flag of choice.flags || []) {
            if (flag.startsWith('unity')) { S().unity += Number.parseInt(flag.slice(5), 10) || 0; continue; }
            S().flags[flag] = true;
            if (['q01','q01a'].includes(flag)) S().qiqi += 2;
            if (flag === 'q01b') S().qiqi += 5;
            if (flag === 'q02a') S().qiqi += 3;
            if (flag === 'q02b') S().qiqi += 1;
            if (flag === 'qSoul1') S().qiqi += 8;
            if (flag === 'qSoul2') S().qiqi += 10;
            if (flag === 'qSoul3') S().qiqi += 12;
            if (flag === 'qSoul4') S().qiqi += 15;
            if (flag === 'qExpose') S().qiqi += 5;
            if (['qClue1','qClue2','qClue3'].includes(flag)) S().qiqi += 5;
            if (flag === 'redeemed') S().qiqi += 20;
            if (flag === 'azRoad') S().azhe += 1;
        }
    }
    function finish(item) {
        const s = S(); s.ending = item.id; s.done[item.id] = true;
        if (!s.endings.includes(item.id)) s.endings.push(item.id);
        if (!ctx.M().completedChapters.includes(7)) ctx.M().completedChapters.push(7);
        const first = !economy().claimed['chapter:7'];
        claimEconomy('chapter:7', 15); if (first) state.cards.tickets++;
    }
    function choose(index) {
        const s = S(), item = node(), choice = item?.choices[index];
        if (!choice || s.ending || s.page < pages(item).length - 1) return;
        applyFlags(choice); s.done[item.id] = true;
        if (item.ending) { finish(item); changed(true); return; }
        let next = choice.next;
        if (next === 'IF') {
            const all = s.flags.qClue1 && s.flags.qClue2 && s.flags.qClue3;
            const soul = s.flags.qSoul1 && s.flags.qSoul2 && s.flags.qSoul3 && s.flags.qSoul4;
            next = !all ? 'q_judge' : !soul ? 'q_pseudoHE_path' : 'q_redemption';
        }
        if (nodeMap.has(next)) { s.scene = next; s.page = 0; }
        changed(true);
    }
    function restart() {
        const old = S(), next = freshSeven();
        next.active = true; next.run = old.run + 1; next.endings = [...old.endings];
        ctx.M().chapterSeven = next; closeModal(false); changed();
    }
    function sevenAction(action, btn) {
        if (action === 'chapter-seven-enter') { enterSeven(); return; }
        if (!S().active) return;
        if (btn?.dataset.sevenRev !== undefined && Number(btn.dataset.sevenRev) !== S().rev) return;
        if (action === 'chapter-seven-leave') { leaveSeven(); return; }
        if (action === 'chapter-seven-page') {
            if (S().page < pages(node()).length - 1) { S().page++; changed(true); }
            return;
        }
        if (action === 'chapter-seven-choose') { choose(Number(btn?.dataset.sevenChoice)); return; }
        if (action === 'chapter-seven-restart') {
            openModal('重新阅读第七章？', `<p>本章剧情选择与内部线索会从头开始。全局羁绊、卡牌、相册、已收录结局和首次完成奖励记录都会保留。</p><div class="settings-actions"><button class="btn primary" data-cp-action="chapter-seven-confirm-restart" data-seven-rev="${S().rev}">从头阅读</button></div>`); return;
        }
        if (action === 'chapter-seven-confirm-restart') restart();
    }
    function turnHTML(line) {
        const p = character(line.who), card = p.card ? cardDef(p.card) : cardDef(p.card || '');
        return `<section class="cp-dialogue-turn"><div class="cp-speaker">${dialogueAvatarHTML({card,asset:p.asset,name:p.name,icon:p.icon||'music'})}<div><b>${esc(p.name)}</b><small>${esc(p.tag||'此刻的故事')}</small></div></div><div class="cp-text">${esc(line.text)}</div></section>`;
    }
    function completionHTML(item) {
        const art = item.pageArt.at(-1), src = art?.asset ? ASSETS[art.asset] : null;
        return `<section class="cp-surface cp-personal-complete"><div class="cp-ending-hero"><span class="cp-overline">${item.ending.code} · CHAPTER 07 COMPLETE</span><h3>${esc(item.ending.name)}</h3><p>第七章结局已保存。${economy().claimed['chapter:7']?'首次完成奖励记录已写入存档。':''}</p></div>${src?`<button data-memory="${art.memory}" class="cp-personal-ending-art"><img src="${src}" alt="${esc(art.text)}"></button>`:''}<p class="cp-caption">第七章首次完成奖励 15 音符、1 张邀请券；重读或更换结局不重复领取。</p><div class="cp-personal-hub-actions"><button class="btn primary" data-cp-action="chapter-seven-restart" data-seven-rev="${S().rev}">从头重选第七章</button><button class="btn secondary" data-cp-action="chapter-seven-leave" data-seven-rev="${S().rev}">返回章节目录</button><button class="btn secondary" data-cp-action="personal-picker">去个人故事</button></div></section>`;
    }
    function sevenHTML() {
        const s = S(), item = node();
        if (!item) return '';
        if (s.ending) return `<section class="cp-personal"><header class="cp-personal-heading"><div><span class="cp-week-kicker">CHAPTER 07 · AFTER THE PREMIERE</span><h2>第七章 · 后山丘时代</h2><p>当首演落幕，山丘真正的考验才刚刚开始。</p></div></header><div id="cpMain">${completionHTML(item)}</div></section>`;
        const storyPages = pages(item), page = Math.min(s.page, storyPages.length - 1), lines = storyPages[page], last = page === storyPages.length - 1;
        if (!s.read.includes(item.id)) { s.read.push(item.id); markDaily('story'); save(); }
        encounterBingbing(lines);
        const art = pageArt(item, page), src = art?.asset ? ASSETS[art.asset] : null;
        if (art?.memory && !state.memories.includes(art.memory)) unlock(art.memory, false);
        const controls = last ? item.choices.map((choice,index)=>`<button class="cp-choice" data-cp-action="chapter-seven-choose" data-seven-choice="${index}" data-seven-rev="${s.rev}"><span class="cp-option-n">${String(index+1).padStart(2,'0')}</span><span>${esc(choice.text)}</span>${I('arrow')}</button>`).join('') : `<button class="cp-choice" data-cp-action="chapter-seven-page" data-seven-rev="${s.rev}"><span class="cp-option-n">${String(page+1).padStart(2,'0')}</span><span>下一页<small>${page+2} / ${storyPages.length}</small></span>${I('arrow')}</button>`;
        return `<section class="cp-personal cp-chapter-seven"><header class="cp-personal-heading"><div><span class="cp-week-kicker">CHAPTER 07 · AFTER THE PREMIERE</span><h2>第七章 · 后山丘时代</h2><p>从《拾光》首演走向商业化，守住山丘，也守住创作者的名字。</p></div><button class="btn secondary" data-cp-action="chapter-seven-leave" data-seven-rev="${s.rev}">返回章节目录</button></header><div class="cp-personal-toolbar"><button class="btn secondary" data-cp-action="chapter-seven-restart" data-seven-rev="${s.rev}">重读第七章</button><span>自动保存 · 第 ${s.run} 次阅读 · 已收录 ${s.endings.length}/${endingIds.length} 个结局</span></div>${window.StoryBgm?.controls()||''}<div id="cpMain"><article class="cp-novel cp-personal-novel ${src?'cp-novel-illustrated':''}" ${src?`style="--scene-art:url('${new URL(src,document.baseURI).href}')"`:''}><header class="cp-novel-top"><span>第七章 · 后山丘时代</span><span>${esc(item.title)} · ${page+1}/${storyPages.length}</span></header><div class="cp-novel-body">${src?`<div class="cp-novel-visual"><div class="cp-novel-heading"><h3>${esc(item.title)}</h3><button class="cp-memory-link" data-memory="${art.memory}">${I('album')}本页已收入回忆 · 查看</button></div><figure class="cp-story-art cp-novel-art"><button data-memory="${art.memory}"><img src="${src}" alt="${esc(art.text)}" width="440" height="440" decoding="async" fetchpriority="high"></button><figcaption>第七章 · 后山丘时代</figcaption></figure></div>`:''}<div class="cp-novel-dialogue">${lines.map(turnHTML).join('')}<div class="cp-choices">${controls}</div></div></div></article></div></section>`;
    }
    return { freshSeven, cleanSeven, enterSeven, sevenAction, sevenHTML };
}
