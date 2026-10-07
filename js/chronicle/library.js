'use strict';

// Presentation-only navigation. Browsing the library never advances or collects a scene.
function preloadChronicleChapterAssets(chapter) {
    const art = chapter === 7
        ? CHAPTER_SEVEN.nodes.flatMap(node => (node.pageArt || []).map(item => item.asset && ASSETS[item.asset]))
        : CHRONICLE_ART.filter(item => item.chapter === chapter).map(item => ASSETS[item.asset]);
    scheduleStorySequencePreload([...art.filter(Boolean), ...storyAvatarPreloadSources(['avatarNarrator', 'avatarZhouNpc'])]);
}
function storyLibraryHeader(tab = 'main') {
    return `<header class="story-library-hero"><div><h1>乐团剧情</h1><span class="story-signature">Love &amp; Hakimi</span><p>发现所有故事线，在音乐的陪伴下，<br>与重要的你们一起走向更远的舞台。</p></div><span class="story-hero-note">音乐让我们<br>相遇，也让心靠得更近。</span></header><nav class="story-tabs" aria-label="故事分类">${[['main','正传'],['fusion','融合线'],['personal','个人线']].map(([id,label])=>`<button data-story-tab="${id}" aria-selected="${tab===id}" class="${tab===id?'active':''}">${label}</button>`).join('')}</nav>`;
}
function storyResumeCard({image, title, subtitle, action, label = '继续阅读'}) {
    return `<section class="story-resume"><img src="${image}" alt="" decoding="async"><div><small>继续上次阅读</small><h2>${escapeHTML(title)}</h2><p>${escapeHTML(subtitle)}</p></div><button class="btn primary" ${action}>${label}${I('arrow')}</button></section>`;
}
function createChronicleLibrary(ctx) {
    let screen = null, tab = 'main', selectedChapter = 1;
    const chapterArt = ch => ch===7 ? ASSETS[CHAPTER_SEVEN.nodes[0].pageArt[0].asset] : ASSETS[(CHRONICLE_ART.find(a=>a.chapter===ch)?.asset)] || ASSETS.chapter1Shanqiu;
    const saved = ch => ch===7 ? ctx.M().chapterSeven : ctx.savedChapter(ctx.M(),ch);
    const progress = ch => {
        const r=saved(ch);
        if(ch===7){const n=CHAPTER_SEVEN.nodes.find(n=>n.id===r?.scene);return `${n?.title||'序 · 山丘的午后'} · 第 ${(r?.page||0)+1} 页`;}
        return r?.name ? `第 ${r.week} 周 · ${r.ending?'结局已收录':'进度保留'}` : '从第一声招呼，开始我们的故事';
    };
    function openLibrary(nextTab='main') {
        ctx.suspend();screen='library';tab=nextTab;ctx.renderSignature='';
        if(currentView==='chronicle')ctx.render();
    }
    function closeLibrary() {screen=null;ctx.renderSignature='';}
    function toolbar() {
        const personal=ctx.M().personal?.active, seven=ctx.M().chapterSeven?.active;
        return `<div class="story-reader-toolbar"><button class="btn ghost" data-story-tab="${personal?'personal':'main'}">${I('back')}章节目录</button><span>${personal?'个人故事':seven?'第七章 · 后山丘时代':ctx.chapterName()+' · 第 '+ctx.R().week+' 周'}</span><button class="btn ghost" data-story-tools aria-label="阅读设置与更多">•••</button></div>`;
    }
    function tools() {
        const personal=ctx.M().personal?.active,seven=ctx.M().chapterSeven?.active,fusion=currentView==='fusion';
        const memory=document.querySelector('#view-chronicle .cp-memory-link, #view-fusion .cp-memory-link')?.dataset.memory;
        const memoryButton=memory?`<button class="btn secondary" data-memory="${escapeHTML(memory)}">${I('album')}查看当前场景回忆</button>`:'';
        const directory=fusion?`<button class="btn secondary" data-story-tab="fusion">融合线篇章目录</button>`:`<button class="btn secondary" data-story-tab="${personal?'personal':'main'}">章节目录</button>`;
        const restart=fusion&&state.fusion.chapter?`<button class="btn secondary" data-fusion-restart="${escapeHTML(state.fusion.chapter)}">${I('repeat')}重读本篇</button>`:!personal&&!seven?ctx.actionButton('help','规则与说明','help')+ctx.actionButton('gallery','结局图鉴','album')+ctx.actionButton('restart','重读本章','repeat'):'';
        openModal('故事与音乐',`<div class="story-tools">${memoryButton}${window.StoryBgm?.controls()||''}${directory}<button class="btn secondary" data-route="album">回忆相册</button><button class="btn secondary" data-route="story">心动故事</button>${restart}${fusion?'':'<button class="btn secondary" data-lala-action="journal">垃垃手记</button>'}</div>`);
    }
    function mainLibrary() {
        const current=ctx.M().chapterSeven?.active?7:ctx.R().chapter;
        const resume=saved(current),started=current===7?resume?.read?.length:resume?.name;
        return `${started?storyResumeCard({image:chapterArt(current),title:ctx.chapterName(current),subtitle:progress(current),action:`data-story-read="${current}"`}):''}<div class="story-section-title"><h2>章节一览</h2><p>每一段旋律，都是我们共同走过的时光。</p></div><div class="story-chapter-grid">${[1,2,3,4,5,6,7].map(ch=>{
            const unlocked=ctx.chapterUnlocked(ch),r=saved(ch),ids=ch===7?(r?.endings||[]):ctx.chapterEndingIds(ch);
            const badges=ch===7?['HE','TE','BE'].map(type=>{const n=ids.filter(id=>CHAPTER_SEVEN.nodes.find(n=>n.id===id)?.ending?.code===type).length;return n?`<span class="cp-end-badge" data-ending-type="${type}">${type} ${n}</span>`:'';}).join(''):ctx.endingBadges(ids);
            return `<button class="story-chapter ${current===ch&&started?'active':''}" data-story-detail="${ch}" ${unlocked?'':'disabled'} style="--chapter-art:url('${new URL(chapterArt(ch),document.baseURI).href}')"><span>CHAPTER ${String(ch).padStart(2,'0')}</span><h3>${ctx.chapterName(ch).split(' · ')[1]}</h3><p>${!unlocked?'完成第 '+(ch-1)+' 章后解锁':current===ch&&started?'正在阅读':r?.name||r?.read?.length?'继续本章 · 进度保留':'已解锁 · 开始故事'}</p><div class="cp-end-badges">${badges}</div>${I(unlocked?'album':'lock')}</button>`;
        }).join('')}</div><div class="story-library-footer"><button class="btn ghost" data-cp-action="gallery">结局图鉴 ${I('arrow')}</button><button class="btn ghost" data-route="story">心动故事 ${I('heart')}</button></div>`;
    }
    function personalLibrary() {
        const p=ctx.M().personal,r=p.routes[p.selected],config=PERSONAL_ROUTES[p.selected];
        return `${r&&config?storyResumeCard({image:ASSETS[config.asset],title:config.name+(config.id==='yangcun'?'线':config.id==='baoshi_feihong'?' CP 线':'个人线'),subtitle:config.tagline+' · 已读 '+r.read.length+' 个场景',action:`data-cp-action="personal-select" data-cp-person="${p.selected}"`}):''}<div class="story-section-title"><h2>个人线一览</h2><span class="story-signature">Personal</span></div><p class="story-info">个人线需对应角色羁绊超过 35 分；CP 线与羊村线保留各自剧情解锁条件。未解锁故事也可支付 350 音符永久开启。</p><div class="cp-personal-picker story-personal-list">${ctx.personalPickerRows()}</div>`;
    }
    function detail() {
        const ch=selectedChapter,r=saved(ch),arts=ch===7?CHAPTER_SEVEN.nodes.flatMap(n=>n.pageArt||[]).map(a=>({id:a.memory})):CHRONICLE_ART.filter(a=>a.chapter===ch);
        const unique=[...new Set(arts.map(a=>a.id))],collected=unique.filter(id=>state.memories.includes(id)).length,ends=ch===7?r?.endings?.length||0:ctx.chapterEndingIds(ch).length;
        return `<section class="story-detail"><div class="story-detail-hero" style="--chapter-art:url('${new URL(chapterArt(ch),document.baseURI).href}')"><button class="btn ghost" data-story-tab="main">${I('back')}章节一览</button><div><small>CHAPTER ${String(ch).padStart(2,'0')}</small><h1>${ctx.chapterName(ch)}</h1><p>${ch===7?'从《拾光》首演走向商业化，守住山丘，也守住创作者的名字。':'把每一次相遇与练习，写成属于我们的乐章。'}</p></div></div><div class="story-detail-panel"><p class="story-info">${I('album')} 已读至：${progress(ch)}</p><div class="story-detail-stats"><div><small>已收录插图</small><strong>${collected}<em> / ${unique.length}</em></strong></div><div><small>已收录结局</small><strong>${ends}</strong></div><div><small>${ch===7?'阅读次数':'已读片段'}</small><strong>${ch===7?r?.run||1:r?.journal?.length||0}</strong></div></div><button class="btn primary" data-story-read="${ch}">${I('arrow')}${r?.name||r?.read?.length?'继续阅读':'开始阅读'}</button>${(ch===7?r?.read?.length:r?.name)?`<button class="btn secondary" data-story-reread="${ch}">${I('repeat')}重读本章</button>`:''}${window.StoryBgm?.controls()||''}<p class="story-detail-note">不只是乐章，也是可以一起珍藏的心动回忆。</p></div></section>`;
    }
    function renderLibrary() {
        if(!screen)return false;
        $('view-chronicle').innerHTML=screen==='detail'?detail():`<section class="story-library">${storyLibraryHeader(tab)}${tab==='personal'?personalLibrary():mainLibrary()}</section>`;
        return true;
    }
    function read(ch,restart=false) {
        if(!ctx.chapterUnlocked(ch))return;
        preloadChronicleChapterAssets(ch);
        closeLibrary();ctx.requestChapter(ch);ctx.render();route('chronicle');
        if(restart){if(ch===7)ctx.sevenAction('chapter-seven-restart');else ctx.confirmRestart();}
        window.scrollTo({top:0,behavior:'instant'});
    }
    function libraryAction(d) {
        if(d.storyCancel!==undefined){closeModal(false);return true;}
        if(d.storyMore!==undefined){openModal('更多相遇',`<div class="story-tools"><button class="btn secondary" data-route="care">喵咪小屋</button><button class="btn secondary" data-route="pitch">空格考验</button><button class="btn secondary" data-route="album">回忆相册</button><button class="btn secondary" data-route="story">心动故事</button><button class="btn secondary" data-story-tools>音乐与阅读设置</button></div>`);return true;}

        if(d.storyTools!==undefined){tools();return true;}
        if(d.storyTab){
            closeModal(false);
            if(d.storyTab==='fusion'){
                if(!fusionAccessReady()){
                    openModal('山丘的邀请',`<div class="story-unlock story-invite"><div class="story-invite-summary"><img src="${cardImage(cardDef('jerry'),'cover')}" alt="Jerry"><div><span class="story-unlock-caption">FUSION ROUTE</span><h3>跟 Jerry 去山丘看看</h3><p>先与 Jerry 相遇，将他的羁绊提升至 21 分，再在他的个人页点击「去山丘看看」，即可开启融合线。</p></div></div><button class="btn primary" data-card-open="jerry">前往 Jerry 个人页 ${I('arrow')}</button></div>`);return true;
                }
                state.fusion.chapter=null;save();route('fusion');return true;
            }
            openLibrary(d.storyTab);route('chronicle');window.scrollTo({top:0,behavior:'instant'});return true;
        }
        if(d.storyDetail){const ch=Number(d.storyDetail);if(ctx.chapterUnlocked(ch)){selectedChapter=ch;screen='detail';ctx.suspend();ctx.render();window.scrollTo({top:0,behavior:'instant'});}return true;}
        if(d.storyRead||d.storyReread){read(Number(d.storyRead||d.storyReread),!!d.storyReread);return true;}
        return false;
    }
    return {openLibrary,closeLibrary,renderLibrary,libraryAction,storyToolbar:toolbar};
}
