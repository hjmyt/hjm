'use strict';

// Chapter seven keeps one independent attempt per character, alongside the six chapter saves.
// Relationships and rewards always use the global core ledgers.
function createChroniclePersonal(ctx) {
    const preloadedPersonalArt = new Map();
    const routes = Object.values(PERSONAL_ROUTES);
    const getNode = (id, scene) => PERSONAL_ROUTES[id]?.nodes.find(n => n.id === scene);
    const freshRoute = id => ({scene:PERSONAL_ROUTES[id]?.entry||(id==='azhe'?'azhe_01':'sy_01'),page:0,flags:{},done:{},resume:null,resumePage:0,read:[],ending:null,endings:[],run:1,duets:0,chatIndex:0,focus:0,score:id==='baoshi_feihong'?10:0,previewed:null,reply:''});
    const freshPersonal = () => ({active:false,selected:null,rev:0,tech:20,unlocks:{},routes:{}});
    const P = () => ctx.M().personal || (ctx.M().personal=freshPersonal());
    const S = () => P().routes[P().selected];
    const config = () => PERSONAL_ROUTES[P().selected];
    const unlocked = () => ctx.chapterComplete(6);
    const chapterRuns = () => [ctx.M().run,...Object.values(ctx.M().slots||{}),ctx.M().chapter2Start,ctx.M().chapter3Start,ctx.M().chapter4Start,ctx.M().chapter5Start,ctx.M().chapter6Start].filter(Boolean);
    const historicFlag = key => chapterRuns().some(r=>!!r.flags?.[key]);
    const bandLevel = () => Math.max(1,...chapterRuns().map(r=>Number(r.level)||1));
    const cpFriendPath = () => historicFlag('strGroup') && !!P().routes.shiyuan?.flags?.syFriend;
    const cpStoryStarted = () => !!P().routes.baoshi_feihong && (P().routes.baoshi_feihong.read.some(id=>id.startsWith('cp_'))||P().routes.baoshi_feihong.endings.length>0);
    const paidUnlock = id => P().unlocks?.[id]===true;
    const admitted = id => !!PERSONAL_ROUTES[id] && unlocked() && (paidUnlock(id)||(id==='baoshi_feihong'?cpStoryStarted()||(historicFlag('feiSide')&&bandLevel()>=6&&cpFriendPath()):cardBond(id)>35));
    const esc = ctx.E;
    function cleanPersonal(raw) {
        const p=freshPersonal();if(!raw || typeof raw!=='object')return p;
        p.selected=Object.hasOwn(PERSONAL_ROUTES,raw.selected||'')?raw.selected:null;
        p.active=raw.active===true && !!p.selected;
        p.rev=ctx.nInt(raw.rev,0,0,99999999);p.tech=ctx.nInt(raw.tech,20,0,9999);
        p.unlocks=Object.fromEntries(routes.filter(r=>raw.unlocks?.[r.id]===true||raw.unlocks?.[r.id]===1).map(r=>[r.id,true]));
        for(const r of routes){
            const a=raw.routes?.[r.id];if(!a || typeof a!=='object')continue;
            const s=freshRoute(r.id), ids=new Set(r.nodes.map(n=>n.id));
            const flagIds=new Set(r.nodes.flatMap(n=>n.choices.flatMap(c=>c.flags)).concat(['acts2','cpReady']));
            s.flags=Object.fromEntries([...flagIds].filter(k=>a.flags?.[k]===true||a.flags?.[k]===1).map(k=>[k,true]));
            s.done=Object.fromEntries([...ids].filter(k=>a.done?.[k]===true||a.done?.[k]===1).map(k=>[k,true]));
            s.read=Array.isArray(a.read)?[...new Set(a.read.filter(k=>ids.has(k)))]:[];
            s.endings=Array.isArray(a.endings)?[...new Set(a.endings.filter(k=>getNode(r.id,k)?.ending))]:[];
            s.ending=getNode(r.id,a.ending)?.ending?a.ending:null;
            if(s.ending&&!s.endings.includes(s.ending))s.endings.push(s.ending);
            s.resume=ids.has(a.resume)?a.resume:null;s.resumePage=ctx.nInt(a.resumePage,0,0,9999);
            s.scene=ids.has(a.scene)||a.scene==='hub'||a.scene==='complete'?a.scene:s.scene;
            if(r.id==='baoshi_feihong'&&s.scene==='yc_hold'){s.scene='hub';s.resume=null;s.resumePage=0;}
            s.page=ctx.nInt(a.page,0,0,9999);
            if(s.scene==='complete'&&!s.ending)s.scene='hub';
            s.run=ctx.nInt(a.run,1,1,99999);s.duets=ctx.nInt(a.duets,0,0,9999);s.chatIndex=ctx.nInt(a.chatIndex,0,0,9999);
            s.focus=ctx.nInt(a.focus,0,0,3);s.score=ctx.nInt(a.score,r.id==='baoshi_feihong'?10:0,0,9999);s.previewed=a.previewed===s.ending?s.ending:null;s.reply=ctx.str(a.reply,20);
            p.routes[r.id]=s;
        }
        if(!p.routes[p.selected])p.active=false;
        return p;
    }
    function changed() {P().rev++;ctx.changed();}
    function button(action,text,extra='',cls='secondary') {return `<button class="btn ${cls}" data-cp-action="personal-${action}" data-personal-rev="${P().rev}" ${extra}>${text}</button>`;}
    function picker() {
        if(!unlocked()){toast('完成第六章后，才可以进入第七章个人线。');return;}
        openModal('第七章 · 选择你的故事线',`<p class="cp-caption">阿喆、十元线需对应角色羁绊超过 35 分；宝石×飞鸿是特殊 CP 线，按第一章选择、乐团等级与前置分流判定。未满足对应条件时，也可支付 10000 音符永久解锁该路线；付费解锁不改动羁绊和正传选择。</p><div class="cp-personal-picker">${routes.map(r=>{
            const cp=r.id==='baoshi_feihong',bond=cp?0:cardBond(r.id),s=P().routes[r.id],open=admitted(r.id);
            const purchased=paidUnlock(r.id),cpStatus=purchased?'已支付 10000 音符永久解锁':cpStoryStarted()?(s?.ending?'结局已收录 · 可重读':'已有进度 · 继续故事'):!historicFlag('feiSide')?'需第一章替飞鸿解围':bandLevel()<6?`乐团 Lv.${bandLevel()} / 6 · 可与乐团成员合练升级`:!cpFriendPath()?'需弦乐组＋十元友情分流；羊村乐队线为独立路线':'前置已解锁 · 开启 CP 线';
            const status=cp?cpStatus:purchased?'已支付 10000 音符永久解锁':`羁绊 ${bond} · ${bond<=35?'还差 '+(36-bond)+' 分可进入':s?.ending?'结局已收藏 · 可继续或重读':s?'已有进度 · 继续故事':'已解锁 · 开启故事'}`;
            return `<div class="cp-personal-pick-row"><button class="cp-personal-pick ${open?'':'locked'}" data-cp-action="personal-select" data-cp-person="${r.id}" ${open?'':'disabled aria-disabled="true"'}><img src="${ASSETS[r.asset]}" alt="${r.name}"><span><b>${r.name}${cp?' CP 线':'个人线'}</b><em>${r.tagline}</em><small>${status}</small></span>${I(open?'arrow':'lock')}</button>${open?'':`<button class="btn secondary cp-personal-unlock" data-cp-action="personal-unlock" data-cp-person="${r.id}">支付 10000 音符直接解锁 <small>当前 ${state.coins}</small></button>`}</div>`;
        }).join('')}</div><p class="cp-caption">其他角色的个人线将陆续开放。</p>`);
    }
    function purchaseUnlock(id) {
        if(!unlocked()||!PERSONAL_ROUTES[id])return;
        if(paidUnlock(id)||admitted(id)){toast('这条故事线已经解锁。');picker();return;}
        if(state.coins<10000){toast(`直接解锁需要 10000 音符，当前只有 ${state.coins}。`);return;}
        state.coins-=10000;P().unlocks[id]=true;changed();toast(`已永久解锁${PERSONAL_ROUTES[id].name}故事线，音符 −10000。`,true);picker();
    }
    function select(id) {
        if(!admitted(id)){toast(unlocked()?(id==='baoshi_feihong'?'宝石×飞鸿线的前置条件还没有满足。':'该角色的羁绊需要超过 35 分才能进入。'):'请先完成第六章。');return;}
        ctx.suspend();const p=P();p.selected=id;p.active=true;
        p.routes[id]??=freshRoute(id);
        if(!Object.keys(p.routes).some(k=>k!==id))p.tech=Math.max(p.tech,ctx.R().tech);
        closeModal(false);changed();route('chronicle');
    }
    function nextMain() {
        const s=S(),id=P().selected;
        if(s.resume&&getNode(id,s.resume))return {node:getNode(id,s.resume),locked:false,reason:''};
        for(const n of config().nodes){
            if(n.sub||s.done[n.id])continue;
            // Conditional side arcs are skipped when the story's actual branch did not establish them.
            if(n.need.flags.some(group=>!group.some(f=>s.flags[f]))){
                if(n.id==='sy_rumor1')return {node:n,locked:true,reason:'先赴两场不同的邀约，让故事继续。'};
                continue;
            }
            const needed=n.need.bond;
            const score=n.need.score||0,locked=id==='baoshi_feihong'?s.score<score:cardBond(id)<needed;
            return {node:n,locked,reason:id==='baoshi_feihong'?`下一幕需要大旗值 ${score}，当前 ${s.score}。大旗值只记录本线助攻，不是新货币或羁绊。`:`下一段故事需要羁绊 ${needed}，当前 ${cardBond(id)}。日常相处与卡册培养都会累积到这里。`};
        }
        return null;
    }
    function move(scene,page=0) {if(scene==='hub'||getNode(P().selected,scene)){S().scene=scene;S().page=page;if(S().resume===scene){S().resume=null;S().resumePage=0;}}}
    function advance() {const n=nextMain();move(n&&!n.locked?n.node.id:'hub');}
    function finish(n) {
        const s=S();s.ending=n.id;if(!s.endings.includes(n.id))s.endings.push(n.id);
        s.scene='complete';if(n.memory)unlock(n.memory,false);
        const first=!economy().claimed['chapter:7'];claimEconomy('chapter:7',15);if(first)state.cards.tickets++;
    }
    function choose(index) {
        const s=S(),n=getNode(P().selected,s.scene),c=n?.choices[index];
        if(!c || s.ending || !Number.isInteger(index)||s.page<dialoguePages(n).length-1)return;
        // Node-level claim keys survive retries and alternate choices. No displayed option rewards.
        if(n.companion)(n.id==='azhe_duet'?rewardPerformanceBond(P().selected):grantBond(P().selected,1,{daily:true}));
        else if(P().selected!=='baoshi_feihong'&&c.bond>0)grantBond(P().selected,c.bond,{key:`plot:7:${P().selected}:${n.id}`});
        if(P().selected==='baoshi_feihong'&&c.score)s.score+=c.score;
        for(const flag of c.flags)s.flags[flag]=true;
        s.done[n.id]=true;
        if(n.ending){finish(n);changed();return;}
        if(n.placeholder){move('hub');changed();return;}
        if(n.resolveCpEnding){s.flags.cpReady=true;move(s.score>=95?(['push1','push2','push3','push4'].filter(f=>s.flags[f]).length>=3?'cp_HE':'cp_BE'):'hub');changed();return;}
        if(n.id.startsWith('sy_act')){
            const count=['sy_act1','sy_act2','sy_act3'].filter(id=>s.done[id]).length;
            s.flags.acts2=count>=2;s.focus=Math.min(3,Math.max(s.focus,count));
        }
        if(n.id==='sy_juggle' && c.next==='sy_reply')s.reply=($('cpPersonalReply')?.value.trim()||'一起向前冲！').slice(0,20);
        if(n.id==='sy_10'&&c.flags.includes('confessed')){
            const f=s.flags,he=cardBond('shiyuan')>=95&&f.soul&&f.pdHelp&&f.examHelp&&f.q1&&f.q2&&f.q3&&s.focus>=3&&f.startup;
            move(cardBond('shiyuan')<95?'sy_BE':he?'sy_HE':f.examHelp?'sy_TE':'sy_TE2');
        }else if(c.next==='CHK_COMFORT')move(cardBond('shiyuan')>=65?'sy_04c_ok':'sy_04c_ye');
        else if(c.next)move(c.next);
        else if(n.companion)move('hub');
        else advance();
        changed();
    }
    function restart() {
        const old=S(),fresh=freshRoute(P().selected);fresh.run=old.run+1;fresh.endings=[...old.endings];
        P().routes[P().selected]=fresh;closeModal(false);changed();
    }
    function personalAction(action,btn) {
        const kind=action.replace(/^personal-/,'');
        if(kind==='picker'){picker();return;}
        if(kind==='select'){select(btn?.dataset.cpPerson);return;}
        if(kind==='unlock'){purchaseUnlock(btn?.dataset.cpPerson);return;}
        if(kind==='leave'){P().active=false;closeModal(false);changed();return;}
        if(!P().active||!admitted(P().selected)||!S())return;
        if(btn?.dataset.personalRev!==undefined&&Number(btn.dataset.personalRev)!==P().rev)return;
        const s=S();
        if(kind==='choose'){choose(Number(btn?.dataset.personalChoice));return;}
        if(kind==='page'){
            const pages=dialoguePages(getNode(P().selected,s.scene));
            if(s.page<pages.length-1){s.page++;changed();}
            return;
        }
        if(kind==='hub'){if(!s.ending){if(getNode(P().selected,s.scene)){s.resume=s.scene;s.resumePage=s.page;}move('hub');}changed();return;}
        if(kind==='continue'){
            if(s.scene!=='hub')return;
            const resume=s.resume,resumePage=s.resumePage,n=nextMain();if(n&&!n.locked){move(n.node.id,n.node.id===resume?resumePage:0);changed();}return;
        }
        if(kind==='restart'){
            openModal('重新阅读'+config().name+'个人线？',`<p>重选这条线的剧情。全局羁绊、相册、已收藏结局与领奖记录都会保留；另一位角色的进度不受影响。</p><div class="settings-actions">${button('confirm-restart','从头阅读','','primary')}</div>`);return;
        }
        if(kind==='confirm-restart'){restart();return;}
        if(s.scene!=='hub'||s.ending)return;
        if(kind==='practice'){
            if(state.coins<10){toast('练琴需要 10 音符，可先免费演奏赚取音符。');return;}
            state.coins-=10;P().tech+=2;s.focus=Math.min(3,s.focus+1);changed();return;
        }
        if(kind==='duet' && P().selected==='azhe'){s.duets++;move('azhe_duet');changed();return;}
        if(kind==='chat' && P().selected==='azhe' && s.duets>=2){move(['azhe_chat_food','azhe_chat_care','azhe_chat_tape','azhe_chat_duet'][s.chatIndex++%4]);changed();return;}
        if(kind==='invite' && P().selected==='shiyuan'){
            const id=btn?.dataset.personalEvent;
            if(['sy_act1','sy_act2','sy_act3'].includes(id)&&!s.done[id]){move(id);changed();}return;
        }
        if(kind==='confess' && P().selected==='shiyuan' && s.done.sy_06done && !s.done.sy_10){move('sy_10');changed();}
        if(kind==='support' && P().selected==='baoshi_feihong'){s.score+=2;if(s.flags.cpReady&&s.score>=95)move(['push1','push2','push3','push4'].filter(f=>s.flags[f]).length>=3?'cp_HE':'cp_BE');changed();}
        if(kind==='resolve' && P().selected==='baoshi_feihong'&&s.flags.cpReady&&s.score>=95){move(['push1','push2','push3','push4'].filter(f=>s.flags[f]).length>=3?'cp_HE':'cp_BE');changed();}
    }
    function character(who) {
        if(who==='bingbing')return {name:'冰冰',tag:'大提琴 · 女明星般的亮眼气质',icon:'music'};
        if(who==='xuezi')return {name:'雪子',tag:'键盘手 · 山丘的男性老友',icon:'music'};
        if(who==='rek')return {name:'REK',tag:'贝斯手 · 乐团成员',icon:'music'};
        if(who==='ta')return {name:'大塔',tag:'乐团成员',icon:'music'};
        if(who==='player')return {name:ctx.R().name||'你',tag:'你的回应',icon:'heart'};
        return ctx.person(who);
    }
    function copy(text) {return text.replace(/\{\{inst\}\}/g,ctx.R().inst||'小提琴').replace(/\{\{reply\}\}/g,S().reply||'一起向前冲！');}
    function dialogueTurns(n) {
        const turns=[];
        for(const line of n?.lines||[]){
            if(turns.at(-1)?.who===line.who)turns.at(-1).text+='\n\n'+line.text;
            else turns.push({...line});
        }
        return turns;
    }
    function dialoguePages(n) {
        const turns=dialogueTurns(n),pages=[];
        for(let i=0;i<turns.length;i+=2)pages.push(turns.slice(i,i+2));
        return pages.length?pages:[[]];
    }
    function currentArt(n,page) {return n.pageArt?.[page]||{asset:n.asset,memory:n.memory,text:n.artText};}
    function preloadUpcomingArt(n,page) {
        const candidates=[];
        if(n?.pageArt?.[page+1])candidates.push(n.pageArt[page+1]);
        for (const choice of n?.choices || []) {
            const next = typeof choice.next === 'string' ? getNode(P().selected,choice.next) : null;
            if(next)candidates.push(currentArt(next,0));
        }
        for(const art of candidates){
            const src = art?.asset ? ASSETS[art.asset] : null;
            if (!src || preloadedPersonalArt.has(src)) continue;
            const image=new Image();image.decoding='async';image.src=src;preloadedPersonalArt.set(src,image);
        }
    }
    function artHTML(n,page) {
        const art=currentArt(n,page);if(!art.asset)return '';
        const src=ASSETS[art.asset];
        return `<div class="cp-novel-visual"><div class="cp-novel-heading"><h3>${esc(n.title)}</h3><button class="cp-memory-link" data-memory="${art.memory}">${I('album')}本页已收入回忆 · 查看</button></div><figure class="cp-story-art cp-novel-art"><button data-memory="${art.memory}" aria-label="查看回忆：${esc(n.title)}"><img src="${src}" alt="${esc(art.text||n.artText)}" width="440" height="440" decoding="async" fetchpriority="high"></button><figcaption>${config().name}${P().selected==='baoshi_feihong'?' CP 线':'个人线'} · ${esc(n.title)}${(n.pageArt?.length||0)>1?` · ${page+1}/${n.pageArt.length}`:''}</figcaption></figure></div>`;
    }
    function sceneHTML(n) {
        const s=S();
        if(!s.read.includes(n.id)){
            s.read.push(n.id);markDaily('story');save();
        }
        const pages=dialoguePages(n),page=Math.min(s.page,pages.length-1),last=page===pages.length-1;
        preloadUpcomingArt(n,page);
        if(s.page!==page){s.page=page;save();}
        const art=currentArt(n,page),src=art.asset?ASSETS[art.asset]:null;
        if(art.memory&&!state.memories.includes(art.memory)){unlock(art.memory,false);$('albumStat').textContent=`${MEMORIES.filter(m=>memoryVisible(m.id)).length} / ${MEMORIES.length}`;}
        const parts=pages[page].map(l=>{const p=character(l.who);return `<section class="cp-dialogue-turn"><div class="cp-speaker">${p.asset?`<img src="${ASSETS[p.asset]}" alt="${esc(p.name)}">`:`<span class="cp-speaker-symbol">${I(p.icon||'music')}</span>`}<div><b>${esc(p.name)}</b><small>${esc(p.tag||'此刻的故事')}</small></div></div><div class="cp-text">${esc(copy(l.text))}</div></section>`;}).join('');
        const choices=last?n.choices.map((c,i)=>`<button class="cp-choice" data-cp-action="personal-choose" data-personal-choice="${i}" data-personal-rev="${P().rev}"><span class="cp-option-n">${String(i+1).padStart(2,'0')}</span><span>${esc(copy(c.text))}</span>${I('arrow')}</button>`).join(''):`<button class="cp-choice" data-cp-action="personal-page" data-personal-rev="${P().rev}"><span class="cp-option-n">${String(page+1).padStart(2,'0')}</span><span>继续阅读<small>下一页 · ${page+2} / ${pages.length}</small></span>${I('arrow')}</button>`;
        const illustrated=src?` cp-novel-illustrated`:'';const style=src?` style="--scene-art:url('${new URL(src,document.baseURI).href}')"`:'';
        return `<article class="cp-novel cp-personal-novel${illustrated}"${style}><header class="cp-novel-top"><span>第七章 · ${config().name}${P().selected==='baoshi_feihong'?' CP 线':'个人线'}</span><span>${esc(n.title)}${pages.length>1?` · ${page+1}/${pages.length}`:''}</span></header><div class="cp-novel-body">${artHTML(n,page)}<div class="cp-novel-dialogue">${parts}${last&&n.id==='sy_juggle'?'<label class="cp-personal-reply">回复她的动态（可选，20 字内）<input class="text-input" id="cpPersonalReply" maxlength="20" placeholder="一起向前冲！"></label>':''}<div class="cp-choices">${choices}</div></div></div></article>`;
    }
    function hubHTML() {
        const s=S(),n=nextMain(),id=P().selected;
        if(id==='baoshi_feihong'){
            const resolving=s.flags.cpReady&&!s.ending,needsScore=resolving&&s.score<95;
            const note=n?esc(n.locked?n.reason:'新的故事已经准备好。'):resolving?(needsScore?`主线已经走到最后一幕。还差 ${95-s.score} 点大旗值即可结算本线结局。`:'助攻已经到位，可以进入本线结局。'):'本线当前剧情已经读完；可以重读或切换其他故事线。';
            const primary=n?button('continue','继续 · '+esc(n.node.title),n.locked?'disabled':'','primary'):resolving&&!needsScore?button('resolve','进入宝石×飞鸿结局','','primary'):'';
            const support=n?.locked||needsScore?button('support','继续助攻 · 大旗 +2','','primary'):'';
            return `<section class="cp-surface"><span class="cp-week-kicker">宝石×飞鸿 · 助攻间歇</span><h3>${config().tagline}</h3><p class="cp-caption">${note}</p><div class="cp-personal-hub-actions">${primary}${support}${button('picker','切换故事线')}</div><p class="cp-caption">大旗值 ${s.score} · 乐团 Lv.${bandLevel()}。大旗值只用于本线结局判定，不是可消费资源。羊村是第二章乐队组的独立路线，不属于本 CP 线。</p></section>`;
        }
        return `<section class="cp-surface"><span class="cp-week-kicker">故事之间 · 留一点时间相处</span><h3>${config().tagline}</h3><p class="cp-caption">${n?esc(n.locked?n.reason:'新的故事已经准备好。'):'这一刻，先陪彼此待一会儿。'}</p><div class="cp-personal-hub-actions">${button('continue',n?'继续 · '+esc(n.node.title):'暂无待续剧情',!n||n.locked?'disabled':'','primary')}${id==='azhe'?button('duet','和阿喆合奏一场')+button('chat','找阿喆聊天',s.duets<2?'disabled':''):['商场商演','小乐队排练','老乐手小聚'].map((title,i)=>button('invite',(s.done['sy_act'+(i+1)]?'已赴约 · ':'赴约 · ')+title,`data-personal-event="sy_act${i+1}" ${s.done['sy_act'+(i+1)]?'disabled':''}`)).join('')}${button('practice','刻苦练琴 · 10 音符 / 琴技 +2',state.coins<10?'disabled':'')}<button class="btn secondary" data-route="cards">去卡册陪伴与投喂</button><button class="btn secondary" data-route="rhythm">免费演奏赚音符</button>${id==='shiyuan'&&s.done.sy_06done&&!s.done.sy_10?button('confess','今晚，想向她表达心意'):''}</div><p class="cp-caption">${id==='azhe'?`已合奏 ${s.duets} 场；两场后可聊天。每次合奏羁绊 +1，每日最多 10 次；合奏额度不占用聊天陪伴额度。`:`已赴约 ${['sy_act1','sy_act2','sy_act3'].filter(k=>s.done[k]).length} / 3 场 · 事业准备 ${s.focus} / 3。练琴和不同邀约积累事业准备，不直接刷取羁绊。`}<br>琴技 ${P().tech} · 音符 ${state.coins}。剧情奖励按节点只结算一次，重读不重复领取。</p></section>`;
    }
    function completionHTML() {
        const s=S(),n=getNode(P().selected,s.ending);
        const art=n.asset&&n.memory?`<button data-memory="${n.memory}" class="cp-personal-ending-art"><img src="${ASSETS[n.asset]}" alt="${esc(n.title)}"></button>`:'';
        return `<section class="cp-surface cp-personal-complete"><div class="cp-ending-hero"><span class="cp-overline">${n.ending} · PERSONAL STORY</span><h3>${esc(n.title)}</h3><p>这段故事已经完成，进度与结局已保存。</p></div>${art}<p class="cp-caption">第七章首次完成奖励 15 音符、1 张邀请券；更换故事线或结局不叠加领取。</p><div class="cp-personal-hub-actions">${button('picker','选择另一条故事线','','primary')}${button('restart','从头重选这条线')}${button('leave','返回六章正传')}</div></section>`;
    }
    function personalHTML() {
        if(!admitted(P().selected))return `<section class="cp-surface"><h3>第七章 · 个人线</h3><p>完成第六章，且对应角色羁绊超过 35 分后可进入。</p>${button('picker','选择角色')}${button('leave','返回正传')}</section>`;
        const s=S();const n=getNode(P().selected,s.scene);
        const cp=P().selected==='baoshi_feihong',record=cp?`大旗值 ${s.score} · 乐团 Lv.${bandLevel()}`:`全局羁绊 ${cardBond(P().selected)}`;
        return `<section class="cp-personal"><header class="cp-personal-heading"><div><span class="cp-week-kicker">CHAPTER 07 · YOUR STORY TOGETHER</span><h2>${config().name}${cp?' CP 线':'个人线'}</h2><p>${config().tagline}</p></div>${button('picker','切换故事线')}</header><div class="cp-personal-toolbar">${s.scene!=='hub'&&!s.ending?button('hub','暂歇，回到相处安排'):''}${button('restart','重读本线')}${button('leave','返回正传')}<span>自动保存 · 第 ${s.run} 次阅读</span></div>${window.StoryBgm?.controls()||''}<details class="cp-personal-details"><summary>${record} · 展开本线记录</summary><p>已读 ${s.read.length} 个场景；已收录 ${s.endings.length} / ${config().nodes.filter(n=>n.ending).length} 种结局。切换故事线和页面会保留各自进度。</p><div class="cp-personal-memories">${s.endings.map(id=>{const n=getNode(P().selected,id);return n.memory?`<button class="btn ghost" data-memory="${n.memory}">${esc(n.title)}</button>`:`<span class="label-tag">${esc(n.title)}</span>`;}).join('')}</div></details><div id="cpMain">${s.scene==='complete'&&s.ending?completionHTML():n?sceneHTML(n):hubHTML()}</div></section>`;
    }
    function personalPreview() {
        const s=S();if(!P().active||!s||s.scene!=='complete'||!s.ending||s.previewed===s.ending||!$('modalBackdrop').hidden)return;
        const memory=getNode(P().selected,s.ending).memory;s.previewed=s.ending;save();if(memory)showMemory(memory);
    }
    return {freshPersonal,cleanPersonal,personalAction,personalHTML,personalPreview};
}
