'use strict';

// Chapter seven keeps one independent attempt per character, alongside the six chapter saves.
// Relationships and rewards always use the global core ledgers.
function createChroniclePersonal(ctx) {
    const routes = Object.values(PERSONAL_ROUTES);
    const getNode = (id, scene) => PERSONAL_ROUTES[id]?.nodes.find(n => n.id === scene);
    const freshRoute = id => ({scene:id==='azhe'?'azhe_01':'sy_01',flags:{},done:{},resume:null,read:[],ending:null,endings:[],run:1,duets:0,chatIndex:0,focus:0,previewed:null,reply:''});
    const freshPersonal = () => ({active:false,selected:null,rev:0,tech:20,routes:{}});
    const P = () => ctx.M().personal || (ctx.M().personal=freshPersonal());
    const S = () => P().routes[P().selected];
    const config = () => PERSONAL_ROUTES[P().selected];
    const unlocked = () => ctx.chapterComplete(6);
    const admitted = id => !!PERSONAL_ROUTES[id] && unlocked() && cardBond(id)>35;
    const esc = ctx.E;
    function cleanPersonal(raw) {
        const p=freshPersonal();if(!raw || typeof raw!=='object')return p;
        p.selected=Object.hasOwn(PERSONAL_ROUTES,raw.selected||'')?raw.selected:null;
        p.active=raw.active===true && !!p.selected;
        p.rev=ctx.nInt(raw.rev,0,0,99999999);p.tech=ctx.nInt(raw.tech,20,0,9999);
        for(const r of routes){
            const a=raw.routes?.[r.id];if(!a || typeof a!=='object')continue;
            const s=freshRoute(r.id), ids=new Set(r.nodes.map(n=>n.id));
            const flagIds=new Set(r.nodes.flatMap(n=>n.choices.flatMap(c=>c.flags)).concat(['acts2']));
            s.flags=Object.fromEntries([...flagIds].filter(k=>a.flags?.[k]===true||a.flags?.[k]===1).map(k=>[k,true]));
            s.done=Object.fromEntries([...ids].filter(k=>a.done?.[k]===true||a.done?.[k]===1).map(k=>[k,true]));
            s.read=Array.isArray(a.read)?[...new Set(a.read.filter(k=>ids.has(k)))]:[];
            s.endings=Array.isArray(a.endings)?[...new Set(a.endings.filter(k=>getNode(r.id,k)?.ending))]:[];
            s.ending=getNode(r.id,a.ending)?.ending?a.ending:null;
            if(s.ending&&!s.endings.includes(s.ending))s.endings.push(s.ending);
            s.resume=ids.has(a.resume)?a.resume:null;
            s.scene=ids.has(a.scene)||a.scene==='hub'||a.scene==='complete'?a.scene:s.scene;
            if(s.scene==='complete'&&!s.ending)s.scene='hub';
            s.run=ctx.nInt(a.run,1,1,99999);s.duets=ctx.nInt(a.duets,0,0,9999);s.chatIndex=ctx.nInt(a.chatIndex,0,0,9999);
            s.focus=ctx.nInt(a.focus,0,0,3);s.previewed=a.previewed===s.ending?s.ending:null;s.reply=ctx.str(a.reply,20);
            p.routes[r.id]=s;
        }
        if(!p.routes[p.selected])p.active=false;
        return p;
    }
    function changed() {P().rev++;ctx.changed();}
    function button(action,text,extra='',cls='secondary') {return `<button class="btn ${cls}" data-cp-action="personal-${action}" data-personal-rev="${P().rev}" ${extra}>${text}</button>`;}
    function picker() {
        if(!unlocked()){toast('完成第六章后，才可以进入第七章个人线。');return;}
        openModal('第七章 · 选择你的个人线',`<p class="cp-caption">这一次，故事只写你和一个人。角色羁绊需超过 35 分（至少 36 分）；每条线独立保存，可以随时切换续读。</p><div class="cp-personal-picker">${routes.map(r=>{
            const bond=cardBond(r.id),s=P().routes[r.id];
            return `<button class="cp-personal-pick ${bond>35?'':'locked'}" data-cp-action="personal-select" data-cp-person="${r.id}" ${bond>35?'':'disabled aria-disabled="true"'}><img src="${ASSETS[r.asset]}" alt="${r.name}"><span><b>${r.name}个人线</b><em>${r.tagline}</em><small>羁绊 ${bond} · ${bond<=35?'还差 '+(36-bond)+' 分可进入':s?.ending?'结局已收藏 · 可继续或重读':s?'已有进度 · 继续故事':'已解锁 · 开启故事'}</small></span>${I(bond>35?'arrow':'lock')}</button>`;
        }).join('')}</div><p class="cp-caption">其他角色的个人线将陆续开放。</p>`);
    }
    function select(id) {
        if(!admitted(id)){toast(unlocked()?'该角色的羁绊需要超过 35 分才能进入。':'请先完成第六章。');return;}
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
            return {node:n,locked:cardBond(id)<needed,reason:`下一段故事需要羁绊 ${needed}，当前 ${cardBond(id)}。日常相处与卡册培养都会累积到这里。`};
        }
        return null;
    }
    function move(scene) {if(scene==='hub'||getNode(P().selected,scene)){S().scene=scene;if(S().resume===scene)S().resume=null;}}
    function advance() {const n=nextMain();move(n&&!n.locked?n.node.id:'hub');}
    function finish(n) {
        const s=S();s.ending=n.id;if(!s.endings.includes(n.id))s.endings.push(n.id);
        s.scene='complete';unlock(n.memory,false);
        const first=!economy().claimed['chapter:7'];claimEconomy('chapter:7',15);if(first)state.cards.tickets++;
    }
    function choose(index) {
        const s=S(),n=getNode(P().selected,s.scene),c=n?.choices[index];
        if(!c || s.ending || !Number.isInteger(index))return;
        // Node-level claim keys survive retries and alternate choices. No displayed option rewards.
        if(n.companion)grantBond(P().selected,1,{daily:true});
        else if(c.bond>0)grantBond(P().selected,c.bond,{key:`plot:7:${P().selected}:${n.id}`});
        for(const flag of c.flags)s.flags[flag]=true;
        s.done[n.id]=true;
        if(n.ending){finish(n);changed();return;}
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
        if(kind==='leave'){P().active=false;closeModal(false);changed();return;}
        if(!P().active||!admitted(P().selected)||!S())return;
        if(btn?.dataset.personalRev!==undefined&&Number(btn.dataset.personalRev)!==P().rev)return;
        const s=S();
        if(kind==='choose'){choose(Number(btn?.dataset.personalChoice));return;}
        if(kind==='hub'){if(!s.ending){if(getNode(P().selected,s.scene))s.resume=s.scene;move('hub');}changed();return;}
        if(kind==='continue'){
            if(s.scene!=='hub')return;
            const n=nextMain();if(n&&!n.locked){move(n.node.id);changed();}return;
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
    }
    function character(who) {
        if(who==='bingbing')return {name:'冰冰',tag:'大提琴 · 女明星般的亮眼气质',icon:'music'};
        if(who==='player')return {name:ctx.R().name||'你',tag:'你的回应',icon:'heart'};
        return ctx.person(who);
    }
    function copy(text) {return text.replace(/\{\{inst\}\}/g,ctx.R().inst||'小提琴').replace(/\{\{reply\}\}/g,S().reply||'一起向前冲！');}
    function artHTML(n) {
        const src=ASSETS[n.asset];
        return `<div class="cp-novel-visual"><div class="cp-novel-heading"><h3>${esc(n.title)}</h3><button class="cp-memory-link" data-memory="${n.memory}">${I('album')}已收入回忆 · 查看</button></div><figure class="cp-story-art cp-novel-art"><button data-memory="${n.memory}" aria-label="查看回忆：${esc(n.title)}"><img src="${src}" alt="${esc(n.artText)}" decoding="async"></button><figcaption>${config().name}个人线 · ${esc(n.title)}</figcaption></figure></div>`;
    }
    function sceneHTML(n) {
        const s=S(),src=ASSETS[n.asset];
        if(!s.read.includes(n.id)){
            s.read.push(n.id);unlock(n.memory,false);markDaily('story');save();
            $('albumStat').textContent=`${MEMORIES.filter(m=>memoryVisible(m.id)).length} / ${MEMORIES.length}`;
        }
        const turns=[];
        for(const line of n.lines){
            if(turns.at(-1)?.who===line.who)turns.at(-1).text+='\n\n'+line.text;
            else turns.push({...line});
        }
        const parts=turns.map(l=>{const p=character(l.who);return `<section class="cp-dialogue-turn"><div class="cp-speaker">${p.asset?`<img src="${ASSETS[p.asset]}" alt="${esc(p.name)}">`:`<span class="cp-speaker-symbol">${I(p.icon||'music')}</span>`}<div><b>${esc(p.name)}</b><small>${esc(p.tag||'此刻的故事')}</small></div></div><div class="cp-text">${esc(copy(l.text))}</div></section>`;}).join('');
        const choices=n.choices.map((c,i)=>`<button class="cp-choice" data-cp-action="personal-choose" data-personal-choice="${i}" data-personal-rev="${P().rev}"><span class="cp-option-n">${String(i+1).padStart(2,'0')}</span><span>${esc(copy(c.text))}</span>${I('arrow')}</button>`).join('');
        return `<article class="cp-novel cp-novel-illustrated cp-personal-novel" style="--scene-art:url('${new URL(src,document.baseURI).href}')"><header class="cp-novel-top"><span>第七章 · ${config().name}个人线</span><span>${esc(n.title)}</span></header><div class="cp-novel-body">${artHTML(n)}<div class="cp-novel-dialogue">${parts}${n.id==='sy_juggle'?'<label class="cp-personal-reply">回复她的动态（可选，20 字内）<input class="text-input" id="cpPersonalReply" maxlength="20" placeholder="一起向前冲！"></label>':''}<div class="cp-choices">${choices}</div></div></div></article>`;
    }
    function hubHTML() {
        const s=S(),n=nextMain(),id=P().selected;
        return `<section class="cp-surface"><span class="cp-week-kicker">故事之间 · 留一点时间相处</span><h3>${config().tagline}</h3><p class="cp-caption">${n?esc(n.locked?n.reason:'新的故事已经准备好。'):'这一刻，先陪彼此待一会儿。'}</p><div class="cp-personal-hub-actions">${button('continue',n?'继续 · '+esc(n.node.title):'暂无待续剧情',!n||n.locked?'disabled':'','primary')}${id==='azhe'?button('duet','和阿喆合奏一场')+button('chat','找阿喆聊天',s.duets<2?'disabled':''):['商场商演','小乐队排练','老乐手小聚'].map((title,i)=>button('invite',(s.done['sy_act'+(i+1)]?'已赴约 · ':'赴约 · ')+title,`data-personal-event="sy_act${i+1}" ${s.done['sy_act'+(i+1)]?'disabled':''}`)).join('')}${button('practice','刻苦练琴 · 10 音符 / 琴技 +2',state.coins<10?'disabled':'')}<button class="btn secondary" data-route="cards">去卡册陪伴与投喂</button><button class="btn secondary" data-route="rhythm">免费演奏赚音符</button>${id==='shiyuan'&&s.done.sy_06done&&!s.done.sy_10?button('confess','今晚，想向她表达心意'):''}</div><p class="cp-caption">${id==='azhe'?`已合奏 ${s.duets} 场；两场后可聊天。聊天与合奏共享每角色每日 +1 羁绊的陪伴额度。`:`已赴约 ${['sy_act1','sy_act2','sy_act3'].filter(k=>s.done[k]).length} / 3 场 · 事业准备 ${s.focus} / 3。练琴和不同邀约积累事业准备，不直接刷取羁绊。`}<br>琴技 ${P().tech} · 音符 ${state.coins}。剧情奖励按节点只结算一次，重读不重复领取。</p></section>`;
    }
    function completionHTML() {
        const s=S(),n=getNode(P().selected,s.ending);
        return `<section class="cp-surface cp-personal-complete"><div class="cp-ending-hero"><span class="cp-overline">${n.ending} · PERSONAL STORY</span><h3>${esc(n.title)}</h3><p>这段故事，已经写进回忆。</p></div><button data-memory="${n.memory}" class="cp-personal-ending-art"><img src="${ASSETS[n.asset]}" alt="${esc(n.title)}"></button><p class="cp-caption">第七章首次完成奖励 15 音符、1 张邀请券；更换个人线或结局不叠加领取。</p><div class="cp-personal-hub-actions">${button('picker','选择另一条个人线','','primary')}${button('restart','从头重选这条线')}${button('leave','返回六章正传')}</div></section>`;
    }
    function personalHTML() {
        if(!admitted(P().selected))return `<section class="cp-surface"><h3>第七章 · 个人线</h3><p>完成第六章，且对应角色羁绊超过 35 分后可进入。</p>${button('picker','选择角色')}${button('leave','返回正传')}</section>`;
        const s=S();const n=getNode(P().selected,s.scene);
        return `<section class="cp-personal"><header class="cp-personal-heading"><div><span class="cp-week-kicker">CHAPTER 07 · YOUR STORY TOGETHER</span><h2>${config().name}个人线</h2><p>${config().tagline}</p></div>${button('picker','切换角色')}</header><div class="cp-personal-toolbar">${s.scene!=='hub'&&!s.ending?button('hub','暂歇，回到相处安排'):''}${button('restart','重读本线')}${button('leave','返回正传')}<span>自动保存 · 第 ${s.run} 次阅读</span></div>${window.StoryBgm?.controls()||''}<details class="cp-personal-details"><summary>全局羁绊 ${cardBond(P().selected)} · 展开个人线记录</summary><p>已读 ${s.read.length} 个场景；已收录 ${s.endings.length} / ${config().nodes.filter(n=>n.ending).length} 种结局。切换角色和页面保留各自进度。</p><div class="cp-personal-memories">${s.endings.map(id=>{const n=getNode(P().selected,id);return `<button class="btn ghost" data-memory="${n.memory}">${esc(n.title)}</button>`;}).join('')}</div></details><div id="cpMain">${s.scene==='complete'&&s.ending?completionHTML():n?sceneHTML(n):hubHTML()}</div></section>`;
    }
    function personalPreview() {
        const s=S();if(!P().active||!s||s.scene!=='complete'||!s.ending||s.previewed===s.ending||!$('modalBackdrop').hidden)return;
        s.previewed=s.ending;save();showMemory(getNode(P().selected,s.ending).memory);
    }
    return {freshPersonal,cleanPersonal,personalAction,personalHTML,personalPreview};
}
