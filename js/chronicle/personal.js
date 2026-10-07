'use strict';

// Chapter seven keeps one independent attempt per character, alongside the six chapter saves.
// Relationships and rewards always use the global core ledgers.
function createChroniclePersonal(ctx) {
    let embraceVisitShown = false;
    const resetPersonalPreview = () => { embraceVisitShown = false; };
    const routes = Object.values(PERSONAL_ROUTES);
    const yangcunChatCast = [
        ['goose','大鹅'],['dayang','大羊'],['xiaota','小塔'],['rek','REK'],
        ['baoshi','宝石'],['feihong','飞鸿'],['xiaozhou','小周']
    ];
    const yangcunName = Object.fromEntries(yangcunChatCast);
    const yangcunId = Object.fromEntries(yangcunChatCast.map(([id,name])=>[name,id]));
    const yangcunNextMonth = ['yc_jun1','yc_jul1','yc_aug1','yc_sep1','yc_oct1','yc_nov1'];
    const getNode = (id, scene) => PERSONAL_ROUTES[id]?.nodes.find(n => n.id === scene);
    const freshRoute = id => ({scene:PERSONAL_ROUTES[id]?.entry||(id==='azhe'?'azhe_01':'sy_01'),page:0,flags:{},done:{},resume:null,resumePage:0,read:[],ending:null,endings:[],run:1,duets:0,chatIndex:0,focus:0,score:id==='baoshi_feihong'?10:0,dang:0,previewed:null,reply:'',month:0,aff:{},chatSpent:{},chatContacts:{},chatSeen:{},chatReactions:{},chatMessage:null});
    const freshPersonal = () => ({active:false,selected:null,rev:0,tech:20,unlocks:{},storyUnlocks:{},routes:{}});
    const P = () => ctx.M().personal || (ctx.M().personal=freshPersonal());
    const S = () => P().routes[P().selected];
    const config = () => PERSONAL_ROUTES[P().selected];
    const chapterRuns = () => [ctx.M().run,...Object.values(ctx.M().slots||{}),ctx.M().chapter2Start,ctx.M().chapter3Start,ctx.M().chapter4Start,ctx.M().chapter5Start,ctx.M().chapter6Start].filter(Boolean);
    const historicFlag = key => chapterRuns().some(r=>!!r.flags?.[key]);
    const bandLevel = () => globalBandLevel();
    const cpFriendPath = () => historicFlag('strGroup') && !!P().routes.shiyuan?.flags?.syFriend;
    const cpStoryStarted = () => !!P().routes.baoshi_feihong && (P().routes.baoshi_feihong.read.some(id=>id.startsWith('cp_'))||P().routes.baoshi_feihong.endings.length>0);
    const paidUnlock = id => P().unlocks?.[id]===true;
    const fusionCpUnlocked = () => P().storyUnlocks?.baoshi_feihong===true;
    const yangcunStoryUnlocked = () => P().storyUnlocks?.yangcun===true||historicFlag('yangcun');
    const admitted = id => !!PERSONAL_ROUTES[id] && (id==='baoshi_feihong'&&fusionCpUnlocked() || id==='yangcun'&&yangcunStoryUnlocked() || paidUnlock(id)||(id==='baoshi_feihong'?cpStoryStarted()||(historicFlag('feiSide')&&bandLevel()>=6&&cpFriendPath()):id==='yangcun'?false:cardBond(id)>35));
    const esc = ctx.E;
    function inferYangcunMonth(raw) {
        if(Number.isFinite(Number(raw?.month)))return ctx.nInt(raw.month,0,0,6);
        const scene=String(raw?.scene||''),order=[['yc_dec',6],['yc_cp',6],['yc_ge',6],['yc_dy',6],['yc_aq',6],['yc_ta',6],['yc_zhou',6],['yc_nov',6],['yc_oct',5],['yc_sep',4],['yc_aug',3],['yc_jul',2],['yc_jun',1]];
        return order.find(([prefix])=>scene.startsWith(prefix))?.[1]||0;
    }
    function cleanPersonal(raw) {
        const p=freshPersonal();if(!raw || typeof raw!=='object')return p;
        p.selected=Object.hasOwn(PERSONAL_ROUTES,raw.selected||'')?raw.selected:null;
        p.active=raw.active===true && !!p.selected;
        p.rev=ctx.nInt(raw.rev,0,0,99999999);p.tech=ctx.nInt(raw.tech,20,0,9999);
        p.unlocks=Object.fromEntries(routes.filter(r=>raw.unlocks?.[r.id]===true||raw.unlocks?.[r.id]===1).map(r=>[r.id,true]));
        p.storyUnlocks=Object.fromEntries(routes.filter(r=>raw.storyUnlocks?.[r.id]===true||raw.storyUnlocks?.[r.id]===1).map(r=>[r.id,true]));
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
            s.scene=ids.has(a.scene)||a.scene==='hub'||a.scene==='complete'||(r.id==='yangcun'&&a.scene==='chat')?a.scene:s.scene;
            if(r.id==='baoshi_feihong'&&s.scene==='yc_hold'){s.scene='hub';s.resume=null;s.resumePage=0;}
            s.page=ctx.nInt(a.page,0,0,9999);
            if(s.scene==='complete'&&!s.ending)s.scene='hub';
            s.run=ctx.nInt(a.run,1,1,99999);s.duets=ctx.nInt(a.duets,0,0,9999);s.chatIndex=ctx.nInt(a.chatIndex,0,0,9999);
            s.focus=ctx.nInt(a.focus,0,0,3);s.score=ctx.nInt(a.score,r.id==='baoshi_feihong'?10:0,-9999,9999);s.dang=ctx.nInt(a.dang,0,-9999,9999);s.previewed=a.previewed===s.ending?s.ending:null;s.reply=ctx.str(a.reply,20);
            if(r.id==='yangcun'){
                s.month=inferYangcunMonth(a);
                s.aff=Object.fromEntries(yangcunChatCast.map(([id])=>[id,ctx.nInt(a.aff?.[id],0,0,99999)]).filter(([,value])=>value));
                s.chatSpent=Object.fromEntries(Array.from({length:7},(_,i)=>[i,ctx.nInt(a.chatSpent?.[i],0,0,4)]).filter(([,count])=>count));
                s.chatContacts=Object.fromEntries(yangcunChatCast.filter(([id])=>a.chatContacts?.[id]===true||a.chatContacts?.[id]===1).map(([id])=>[id,true]));
                for(const [id] of yangcunChatCast){
                    if(Array.isArray(a.chatSeen?.[id]))s.chatSeen[id]=[...new Set(a.chatSeen[id].map(text=>ctx.str(text,500)).filter(Boolean))].slice(-80);
                    if(Array.isArray(a.chatReactions?.[id]))s.chatReactions[id]=[...new Set(a.chatReactions[id].map(flag=>ctx.str(flag,40)).filter(Boolean))].slice(-30);
                }
                if(a.chatMessage&&yangcunName[a.chatMessage.id])s.chatMessage={id:a.chatMessage.id,text:ctx.str(a.chatMessage.text,700),note:ctx.str(a.chatMessage.note,100),added:a.chatMessage.added===true};
            }
            p.routes[r.id]=s;
        }
        if(!p.routes[p.selected])p.active=false;
        return p;
    }
    function changed(focusDialogue=false) {P().rev++;ctx.changed();if(focusDialogue)focusStoryDialogue('#cpMain');}
    function focusPersonalStory() {
        if(currentView!=='chronicle'||!matchMedia('(max-width: 720px)').matches)return;
        if($('cpMain')?.querySelector('.cp-novel-dialogue'))focusStoryDialogue('#cpMain');
        else requestAnimationFrame(()=>$('cpMain')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}));
    }
    function button(action,text,extra='',cls='secondary') {return `<button class="btn ${cls}" data-cp-action="personal-${action}" data-personal-rev="${P().rev}" ${extra}>${text}</button>`;}
    function personalPickerRows() { return routes.map(r=>{
            const cp=r.id==='baoshi_feihong',yc=r.id==='yangcun',bond=cp||yc?0:cardBond(r.id),s=P().routes[r.id],open=admitted(r.id);
            const purchased=paidUnlock(r.id),cpStatus=fusionCpUnlocked()?'特殊剧情已解锁 · 开启 CP 线':purchased?'已付费永久解锁':cpStoryStarted()?(s?.ending?'结局已收录 · 可重读':'已有进度 · 继续故事'):!historicFlag('feiSide')?'需第一章替飞鸿解围；或在羊村线将两人本周目好感合计升至 100':bandLevel()<6?`乐队 Lv.${bandLevel()} / 6；或在羊村线将两人本周目好感合计升至 100`:!cpFriendPath()?'需弦乐组＋十元友情分流；也可由羊村线好感分流解锁':'前置已解锁 · 开启 CP 线';
            const ycStatus=yangcunStoryUnlocked()?'第二章乐队组已解锁 · 开启羊村线':purchased?'已付费永久解锁':'需第二章达到乐队 Lv.6 并选择羊村';
            const status=cp?cpStatus:yc?ycStatus:purchased?'已付费永久解锁':`羁绊 ${bond} · ${bond<=35?'还差 '+(36-bond)+' 分可进入':s?.ending?'结局已收藏 · 可继续或重读':s?'已有进度 · 继续故事':'已解锁 · 开启故事'}`;
            const canPurchase=!open,affordable=state.coins>=ECONOMY_RULES.personalRouteUnlock;
            return `<div class="cp-personal-pick-row"><button class="cp-personal-pick ${open?'':'locked'}" data-cp-action="personal-select" data-cp-person="${r.id}" ${open?'':'disabled aria-disabled="true"'}><img src="${ASSETS[r.asset]}" alt="${r.name}"><span><b>${r.name}${cp?' CP 线':yc?'线':'个人线'}</b><em>${r.tagline}</em><small>${status}</small></span>${I(open?'arrow':'lock')}</button>${canPurchase?`<button class="btn secondary cp-personal-unlock" data-cp-action="personal-unlock" data-cp-person="${r.id}" ${affordable?'':'disabled aria-disabled="true"'}>支付 ${ECONOMY_RULES.personalRouteUnlock} 音符直接解锁 <small>当前 ${state.coins}</small></button>`:''}</div>`;
        }).join(''); }
    function picker() {
        openModal('选择你的个人故事',`<p class="cp-caption">个人线需对应角色羁绊超过 35 分；宝石×飞鸿可由融合线关键聊天，或羊村线本周目好感分流解锁；羊村线可由第二章乐队组解锁。所有未解锁故事线均可支付 ${ECONOMY_RULES.personalRouteUnlock} 音符永久开启。</p><div class="cp-personal-picker">${personalPickerRows()}</div><p class="cp-caption">其他角色的个人线将陆续开放。</p>`);
    }
    function confirmUnlock(id) {
        const r=PERSONAL_ROUTES[id];if(!r||admitted(id))return;
        const price=ECONOMY_RULES.personalRouteUnlock;
        openModal('解锁个人线',`<div class="story-unlock"><span class="story-signature">Love &amp; Hakimi</span><p class="story-unlock-caption">让更多故事，在音乐中相遇</p><div class="story-unlock-summary"><img src="${ASSETS[r.asset]}" alt="${esc(r.name)}"><div><h3>${esc(r.name)}${id==='yangcun'?'线':id==='baoshi_feihong'?' CP 线':'个人线'}</h3><p>支付音符即可永久开启这条故事线，解锁后可体验完整剧情。</p></div></div><p class="story-info">也可以通过角色羁绊或专属剧情达成免费解锁条件。</p><strong class="story-unlock-price">♪ ${price} 音符 · 永久开启</strong><p>当前拥有：${state.coins} 音符</p><div class="settings-actions"><button class="btn secondary" data-story-cancel>取消</button><button class="btn primary" data-cp-action="personal-unlock-confirm" data-cp-person="${id}" ${state.coins<price?'disabled':''}>${state.coins<price?'音符不足':'确认解锁'}</button></div></div>`);
    }
    function purchaseUnlock(id) {
        if(!PERSONAL_ROUTES[id])return;
        if(paidUnlock(id)||admitted(id)){toast('这条故事线已经解锁。');picker();return;}
        if(state.coins<ECONOMY_RULES.personalRouteUnlock){toast(`直接解锁需要 ${ECONOMY_RULES.personalRouteUnlock} 音符，当前只有 ${state.coins}。`);return;}
        const beforeCoins=state.coins,beforeUnlock=P().unlocks[id];
        state.coins-=ECONOMY_RULES.personalRouteUnlock;P().unlocks[id]=true;
        if(!save()){state.coins=beforeCoins;if(beforeUnlock===undefined)delete P().unlocks[id];else P().unlocks[id]=beforeUnlock;toast('保存失败，未扣除音符，请先恢复存档。');return;}
        changed();toast(`已永久解锁${PERSONAL_ROUTES[id].name}故事线，音符 −${ECONOMY_RULES.personalRouteUnlock}。`,true);closeModal(false);ctx.render();
    }
    function select(id) {
        if(!admitted(id)){toast(id==='baoshi_feihong'?'宝石×飞鸿线的前置条件还没有满足。':id==='yangcun'?`羊村线需要第二章乐队组前置，或支付 ${ECONOMY_RULES.personalRouteUnlock} 音符解锁。`:'该角色的羁绊需要超过 35 分才能进入。');return;}
        const routeConfig=PERSONAL_ROUTES[id],art=(routeConfig?.nodes||[]).flatMap(node=>[
            ...(node.pageArt||[]).map(item=>item.asset&&ASSETS[item.asset]),
            node.asset&&ASSETS[node.asset]
        ]).filter(Boolean);
        scheduleStorySequencePreload([...art,...storyAvatarPreloadSources(['cardXueziAvatar','avatarNarrator'])]);
        ctx.closeLibrary();ctx.suspend();const p=P();p.selected=id;p.active=true;ctx.M().chapterSeven.active=false;
        p.routes[id]??=freshRoute(id);
        if(!Object.keys(p.routes).some(k=>k!==id))p.tech=Math.max(p.tech,ctx.R().tech);
        closeModal(false);changed();route('chronicle');focusPersonalStory();
    }
    function unlockFusionCp() {
        const first=!fusionCpUnlocked();
        if(first){P().storyUnlocks.baoshi_feihong=true;changed();}
        return first;
    }
    function enterFusionCp() {
        unlockFusionCp();
        select('baoshi_feihong');
    }
    function offerYangcunCp() {
        move('yc_cp1');
        const first=unlockFusionCp();
        if(!first)changed(true);
        openModal(first?'宝石×飞鸿 CP 线已解锁':'宝石×飞鸿 CP 线', `<p>${first?'本周目中宝石与飞鸿的好感合计达到 100，这条独立 CP 故事线已经永久开启。':'这条独立 CP 故事线已经开启，可以随时继续。'}</p><p style="margin-top:12px">羊村线进度已经保存。你可以留在羊村线继续十二月的原剧情分支，也可以现在跳转到独立的宝石×飞鸿 CP 篇章；稍后也能从章节列表末尾的「个人故事」进入。</p><div class="settings-actions"><button class="btn secondary" data-fusion-cp-later>继续羊村线</button><button class="btn primary" data-fusion-cp-enter>进入 CP 篇章 ${I('arrow')}</button></div>`);
    }
    function unlockYangcun() {
        const first=!P().storyUnlocks?.yangcun;
        if(first)P().storyUnlocks.yangcun=true;
        return first;
    }
    function offerYangcun() {
        openModal('羊村线已解锁', `<p>你在第二章选择了乐队组，羊村线已经永久开启。第二章进度会停在当前节点，不会丢失。</p><p style="margin-top:12px">现在可以直接跳转阅读羊村线，也可以稍后从章节列表末尾的「个人故事」进入。</p><div class="settings-actions"><button class="btn secondary" data-yangcun-later>继续第二章</button><button class="btn primary" data-yangcun-enter>进入羊村线 ${I('arrow')}</button></div>`);
    }
    function enterYangcun() {
        unlockYangcun();
        select('yangcun');
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
    function move(scene,page=0) {if(scene==='hub'||P().selected==='yangcun'&&scene==='chat'||getNode(P().selected,scene)){S().scene=scene;S().page=page;if(S().resume===scene){S().resume=null;S().resumePage=0;}}}
    function advance() {const n=nextMain();move(n&&!n.locked?n.node.id:'hub');}
    function finish(n) {
        const s=S();s.ending=n.id;if(!s.endings.includes(n.id))s.endings.push(n.id);
        s.scene='complete';if(n.memory)unlock(n.memory,false);
        const first=!economy().claimed['personal:first-ending'];claimEconomy('personal:first-ending',15);if(first)state.cards.tickets++;
    }
    const yangcunFlagScore={mayTry:6,geBlock:3,geSave:4,junTell:2,junStay:4,junWarn:3,taLike:4,jbA:8,jbB:5,yrA:8,yrB:5,hqA:7,hqB:4,cpPush:8,gePost:6,rainSave:8,sepOk:6,standTA:10,standSoft:5,splitNo:40,splitYes:-100,oct1:4,oct2:4,oct3:4,oct4:4,prFix:10,prCold:-5,novAll:8};
    const yangcunWxFlags={wx_ge:'goose',wx_dy:'dayang',wx_ta:'xiaota',wx_aq:'rek',wx_ba:'baoshi',wx_fh:'feihong',wx_zhou:'xiaozhou'};
    function syncYangcunContacts() {
        const s=S();if(P().selected!=='yangcun'||!s)return;
        if(s.flags.wx_all)for(const [id] of yangcunChatCast)if(id!=='xiaozhou')s.chatContacts[id]=true;
        for(const [flag,id] of Object.entries(yangcunWxFlags))if(s.flags[flag])s.chatContacts[id]=true;
    }
    function yangcunChatAvailable(list) {
        const s=S();return (list||[]).filter(item=>(item.m===undefined||s.month>=item.m)&&(!item.f||s.flags[item.f]));
    }
    function randomItem(list) {return list[Math.floor(Math.random()*list.length)];}
    function nextYangcunChat(id) {
        const s=S(),name=yangcunName[id],seen=s.chatSeen[id]||(s.chatSeen[id]=[]),seenReactions=s.chatReactions[id]||(s.chatReactions[id]=[]);
        const reactions=(YANGCUN_CHAT.reactionLines[name]||[]).filter(item=>s.flags[item.f]&&!seenReactions.includes(item.f));
        if(reactions.length){const item=randomItem(reactions);seenReactions.push(item.f);return {text:item.t,note:'剧情回响',aff:0,dang:0,score:0};}
        const events=yangcunChatAvailable(YANGCUN_CHAT.randomEvents[name]).filter(item=>!seen.includes(item.t));
        if(events.length&&Math.random()<.4){const item=randomItem(events);seen.push(item.t);return {text:item.t,note:'随机事件',aff:item.aff||0,dang:item.dang||0,score:item.score||0};}
        const regular=yangcunChatAvailable(YANGCUN_CHAT.chatLines[name]).concat(yangcunChatAvailable(YANGCUN_CHAT.monthLines[name]));
        let available=regular.filter(item=>!seen.includes(item.t));
        if(!available.length){
            const continuation=(YANGCUN_CHAT.continuationLines[name]||[]).filter(text=>!seen.includes(text));
            if(continuation.length)available=continuation.map(t=>({t}));
            else{s.chatSeen[id]=[];available=regular.length?regular:[{t:'聊了几句。'}];}
        }
        const item=randomItem(available);(s.chatSeen[id]||(s.chatSeen[id]=[])).push(item.t);
        return {text:item.t,note:'本月聊天',aff:0,dang:0,score:0};
    }
    function openYangcunChat() {const s=S();syncYangcunContacts();s.scene='chat';s.page=0;s.chatMessage=null;}
    function addYangcunContact(id) {
        const s=S(),name=yangcunName[id];if(!name||s.chatContacts[id]||id==='xiaozhou'&&s.month<4)return;
        s.chatContacts[id]=true;s.aff[id]=(s.aff[id]||0)+2;
        const gained=grantBond(id,2,{key:`plot:personal:yangcun:wx:${id}`});
        s.chatMessage={id,text:YANGCUN_CHAT.addLines[name]||`你添加了${name}的微信。`,note:`已添加微信 · 好感 +2 · ${gained?`羁绊 +${gained}`:'羁绊奖励已领取'}`,added:true};changed(true);
    }
    function chatYangcun(id) {
        const s=S(),spent=s.chatSpent[s.month]||0;if(!yangcunName[id]||!s.chatContacts[id]||spent>=4||id==='xiaozhou'&&s.month<4)return;
        const result=nextYangcunChat(id),slot=spent;s.chatSpent[s.month]=slot+1;
        const affection=5+result.aff;s.aff[id]=(s.aff[id]||0)+affection;
        const gained=grantBond(id,5,{key:`plot:personal:yangcun:chat:${s.month}:${slot}`});
        s.dang+=result.dang;s.score+=result.score;
        const extras=[`好感 +${affection}`,gained?`羁绊 +${gained}`:'羁绊奖励已领取',result.dang?`担当 +${result.dang}`:'',result.score?`乐队积分 +${result.score}`:''].filter(Boolean).join(' · ');
        s.chatMessage={id,text:result.text,note:`${result.note} · ${extras}`,added:false};changed(true);
    }
    function nextYangcunMonth() {
        const s=S();s.chatMessage=null;
        if(s.month<6){const next=yangcunNextMonth[s.month];s.month++;move(next);}
        else if((s.aff.baoshi||0)+(s.aff.feihong||0)>=100){offerYangcunCp();return;}
        else move(yangcunDecemberScene());
        changed(true);
    }
    function yangcunDecemberScene() {
        const candidates=[['goose','yc_ge1'],['dayang','yc_dy1'],['xiaota','yc_ta1'],['rek','yc_aq1'],['baoshi',null],['feihong',null],['xiaozhou','yc_zhou1']]
            .map(([id,scene])=>({id,scene,aff:S().aff[id]||0}));
        const best=candidates.reduce((winner,item)=>item.aff>winner.aff?item:winner,candidates[0]);
        return best.aff>50&&best.scene?best.scene:(S().flags.splitYes?'yc_dec_band2':'yc_dec_band');
    }
    function resolveYangcunNext(n,c) {
        if(c.next==='NEXT')return 'chat';
        if(c.next==='yc_nov2_auto')return S().flags.splitYes?'yc_nov2b':'yc_nov2';
        if(c.next==='yc_dec_band_auto')return S().flags.splitYes?'yc_dec_band2':'yc_dec_band';
        if(c.next==='RESULT')return S().score>=95?'yc_end1':S().score>=90?'yc_end2':S().score>=80?'yc_end3':'yc_end4';
        return c.next;
    }
    function choose(index) {
        const s=S(),n=getNode(P().selected,s.scene),c=n?.choices[index];
        if(!c || s.ending || !Number.isInteger(index)||s.page<dialoguePages(n).length-1)return;
        // Node-level claim keys survive retries and alternate choices. No displayed option rewards.
        if(n.companion)(n.id==='azhe_duet'?rewardPerformanceBond(P().selected):grantBond(P().selected,1,{daily:true}));
        else if(P().selected!=='baoshi_feihong'&&c.bond>0)grantBond(P().selected,c.bond,{key:`plot:personal:${P().selected}:${n.id}`});
        if(['baoshi_feihong','yangcun'].includes(P().selected)&&c.score)s.score+=c.score;
        if(P().selected==='yangcun'&&c.dang)s.dang+=c.dang;
        if(P().selected==='yangcun')for(const [name,amount] of Object.entries(c.aff||{})){const id=yangcunId[name];if(id)s.aff[id]=Math.max(0,(s.aff[id]||0)+amount);}
        for(const flag of c.flags){
            s.flags[flag]=true;
            if(P().selected==='yangcun'&&yangcunFlagScore[flag])s.score+=yangcunFlagScore[flag];
            if(P().selected==='yangcun'&&flag==='geHold')s.aff.goose=(s.aff.goose||0)+10;
        }
        s.done[n.id]=true;
        if(n.ending){finish(n);changed(true);return;}
        if(n.placeholder){move('hub');changed(true);return;}
        if(n.resolveCpEnding){s.flags.cpReady=true;move(s.score>=95?(['push1','push2','push3','push4'].filter(f=>s.flags[f]).length>=3?'cp_HE':'cp_BE'):'hub');changed(true);return;}
        if(n.id.startsWith('sy_act')){
            const count=['sy_act1','sy_act2','sy_act3'].filter(id=>s.done[id]).length;
            s.flags.acts2=count>=2;s.focus=Math.min(3,Math.max(s.focus,count));
        }
        if(n.id==='sy_juggle' && c.next==='sy_reply')s.reply=($('cpPersonalReply')?.value.trim()||'一起向前冲！').slice(0,20);
        if(P().selected==='yangcun'){
            const next=resolveYangcunNext(n,c);if(next==='chat')openYangcunChat();else move(next);
        }
        else if(n.id==='sy_10'&&c.flags.includes('confessed')){
            const f=s.flags,he=cardBond('shiyuan')>=95&&f.soul&&f.pdHelp&&f.examHelp&&f.q1&&f.q2&&f.q3&&s.focus>=3&&f.startup;
            move(cardBond('shiyuan')<95?'sy_BE':he?'sy_HE':f.examHelp?'sy_TE':'sy_TE2');
        }else if(c.next==='CHK_COMFORT')move(cardBond('shiyuan')>=65?'sy_04c_ok':'sy_04c_ye');
        else if(c.next)move(c.next);
        else if(n.companion)move('hub');
        else advance();
        changed(true);
    }
    function restart() {
        const old=S(),fresh=freshRoute(P().selected);fresh.run=old.run+1;fresh.endings=[...old.endings];
        P().routes[P().selected]=fresh;closeModal(false);changed();
    }
    function personalAction(action,btn) {
        const kind=action.replace(/^personal-/,'');
        if(kind==='picker'){picker();return;}
        if(kind==='select'){select(btn?.dataset.cpPerson);return;}
        if(kind==='unlock'){confirmUnlock(btn?.dataset.cpPerson);return;}
        if(kind==='unlock-confirm'){purchaseUnlock(btn?.dataset.cpPerson);return;}
        if(kind==='leave'){P().active=false;closeModal(false);changed();return;}
        if(!P().active||!admitted(P().selected)||!S())return;
        if(btn?.dataset.personalRev!==undefined&&Number(btn.dataset.personalRev)!==P().rev)return;
        const s=S();
        if(kind==='cinematic'){if(cinematicReached())showEmbrace();return;}
        if(kind==='yc-add'){addYangcunContact(btn?.dataset.personalChat);return;}
        if(kind==='yc-chat'){chatYangcun(btn?.dataset.personalChat);return;}
        if(kind==='yc-chat-back'){s.chatMessage=null;changed(true);return;}
        if(kind==='yc-next'){nextYangcunMonth();return;}
        if(kind==='choose'){choose(Number(btn?.dataset.personalChoice));return;}
        if(kind==='page'){
            const pages=dialoguePages(getNode(P().selected,s.scene));
            if(s.page<pages.length-1){s.page++;changed(true);}
            return;
        }
        if(kind==='page-prev'){
            if(s.page>0){s.page--;changed(true);}
            return;
        }
        if(kind==='hub'){if(!s.ending){if(getNode(P().selected,s.scene)){s.resume=s.scene;s.resumePage=s.page;}move('hub');}changed();return;}
        if(kind==='continue'){
            if(s.scene!=='hub')return;
            const resume=s.resume,resumePage=s.resumePage,n=nextMain();if(n&&!n.locked){move(n.node.id,n.node.id===resume?resumePage:0);changed();}return;
        }
        if(kind==='restart'){
            openModal('重新阅读'+config().name+'个人线？',`<p>重选这条线的剧情。${P().selected==='yangcun'?'本周目好感、月份和聊天次数会清零；':' '}全局羁绊、相册、已收藏结局与领奖记录都会保留；另一条故事线的进度不受影响。</p><div class="settings-actions">${button('confirm-restart','从头阅读','','primary')}</div>`);return;
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
        if(who==='bingbing')return {name:'冰冰',tag:'大提琴 · 全团女神',icon:'music',card:'bingbing'};
        if(who==='xuezi')return {name:'雪子',tag:'键盘手 · 山丘的男性老友',icon:'music',asset:'cardXueziAvatar'};
        if(who==='rek')return {name:'REK',tag:'贝斯手 · 乐队成员',icon:'music',asset:'cardRekAvatar'};
        if(who==='ta')return {name:'大塔',tag:'乐团成员',icon:'music'};
        // Personal routes keep their original anonymous second-person viewpoint.
        // Jerry is the fixed player identity only inside the standalone Fusion line.
        if(who==='player')return {name:'你',tag:'你的回应',icon:'heart'};
        return ctx.person(who);
    }
    function copy(text) {return text.replace(/\{\{inst\}\}/g,ctx.R().inst||'小提琴').replace(/\{\{reply\}\}/g,S().reply||'一起向前冲！');}
    function dialogueTurns(n) {
        if(config()?.preserveTurns)return (n?.lines||[]).map(line=>({...line}));
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
    function encounterPersonalCard(id) {
        const card=cardDef(id),entry=state.cards.collection[id];
        if(!card||!entry||entry.owned)return;
        if(!cardAvailable(id))state.cards.encounters.push(id);
        entry.owned=true;entry.copies=Math.max(1,entry.copies);save();
        toast(`剧情相遇 · ${card.name}已加入卡册`,true);
    }
    function preloadUpcomingArt(n,page) {
        const candidates=[];
        if(n?.pageArt?.[page+1])candidates.push(n.pageArt[page+1]);
        for (const choice of n?.choices || []) {
            const next = typeof choice.next === 'string' ? getNode(P().selected,choice.next) : null;
            if(next)candidates.push(currentArt(next,0));
        }
        scheduleStoryImagePreload(candidates.map(art=>art?.asset&&ASSETS[art.asset]).filter(Boolean));
    }
    function yangcunChatHTML() {
        const s=S();syncYangcunContacts();const month=Math.min(6,s.month),spent=s.chatSpent[month]||0,left=Math.max(0,4-spent),label=YANGCUN_CHAT.poolLabels[month]||'深夜';
        if(s.chatMessage){
            const p=ctx.person(s.chatMessage.id),card=cardDef(s.chatMessage.id),asset=card?cardThumbnail(card,'avatar'):null;
            return `<article class="cp-novel cp-yc-chat"><header class="cp-novel-top"><span>个人故事 · 羊村线</span><span>${esc(label)} · 微信</span></header><div class="cp-yc-chat-body cp-novel-dialogue"><div class="cp-speaker">${dialogueAvatarHTML({card, name:p.name, icon:'heart'})}<div><b>${esc(p.name)}</b><small>${s.chatMessage.added?'新的联系人':'本月聊天'}</small></div></div><div class="cp-text">${esc(s.chatMessage.text)}</div><p class="cp-yc-chat-result">${esc(s.chatMessage.note)}</p><div class="cp-choices"><button class="cp-choice" data-cp-action="personal-yc-chat-back" data-personal-rev="${P().rev}"><span class="cp-option-n">←</span><span>回到通讯录<small>本月还可聊 ${left} 次</small></span>${I('arrow')}</button></div></div></article>`;
        }
        const contacts=yangcunChatCast.filter(([id])=>id!=='xiaozhou'||month>=4).map(([id,name])=>{
            const card=cardDef(id),asset=card?cardThumbnail(card,'avatar'):null,added=s.chatContacts[id];
            return `<button class="cp-yc-contact ${added?'':'not-added'}" data-cp-action="personal-${added?'yc-chat':'yc-add'}" data-personal-chat="${id}" data-personal-rev="${P().rev}" ${added&&left===0?'disabled':''}>${asset?`<img src="${asset}" alt="${esc(name)}">`:`<span class="cp-speaker-symbol">${I('music')}</span>`}<span><b>${esc(name)}</b><small>${added?`本周目好感 ${s.aff[id]||0} · 全局羁绊 ${cardBond(id)}${left?' · 点击聊天':' · 本月次数已用完'}`:'＋ 添加微信'}</small></span>${I(added?'arrow':'plus')}</button>`;
        }).join('');
        return `<article class="cp-novel cp-yc-chat"><header class="cp-novel-top"><span>个人故事 · 羊村线</span><span>${esc(label)} · 微信</span></header><div class="cp-yc-chat-body cp-novel-dialogue"><div class="cp-yc-chat-heading"><div><span class="cp-week-kicker">MONTHLY CONTACTS</span><h3>今晚找谁聊天？</h3><p>本月有四次聊天机会，同时增加本周目好感与全局羁绊。重开后好感清零，羁绊奖励不重复。</p></div><strong>${left}<small> / 4 次</small></strong></div><div class="cp-yc-contact-grid">${contacts}</div><div class="cp-choices"><button class="cp-choice" data-cp-action="personal-yc-next" data-personal-rev="${P().rev}"><span class="cp-option-n">→</span><span>${month<6?'结束本月，进入下个月':'聊完了，看看十二月的答案'}<small>${spent<4?`也可以保留剩余 ${left} 次机会`:'本月四次聊天已完成'}</small></span>${I('arrow')}</button></div></div></article>`;
    }
    function artHTML(n,page) {
        const art=currentArt(n,page);if(!art.asset)return '';
        const src=ASSETS[art.asset];
        return `<div class="cp-novel-visual"><div class="cp-novel-heading"><h3>${esc(n.title)}</h3><button class="cp-memory-link" data-memory="${art.memory}">${I('album')}本页已收入回忆 · 查看</button></div><figure class="cp-story-art cp-novel-art"><button data-memory="${art.memory}" aria-label="查看回忆：${esc(n.title)}"><img src="${src}" alt="${esc(art.text||n.artText)}" width="440" height="440" decoding="async" fetchpriority="high"></button><figcaption>${config().name}${P().selected==='baoshi_feihong'?' CP 线':P().selected==='yangcun'?'线':'个人线'} · ${esc(n.title)}${(n.pageArt?.length||0)>1?` · ${page+1}/${n.pageArt.length}`:''}</figcaption></figure></div>`;
    }
    function sceneHTML(n) {
        const s=S();
        if(!s.read.includes(n.id)){
            s.read.push(n.id);markDaily('story');save();
        }
        const pages=dialoguePages(n),page=Math.min(s.page,pages.length-1),last=page===pages.length-1;
        if(P().selected==='yangcun'&&pages[page].some(line=>line.who==='rek'||mentionedStoryCards(line.text,line.who).includes('rek')))encounterPersonalCard('rek');
        if(pages[page].some(line=>mentionedStoryCards(line.text,line.who).includes('bingbing')))encounterPersonalCard('bingbing');
        preloadUpcomingArt(n,page);
        if(s.page!==page){s.page=page;save();}
        const art=currentArt(n,page),src=art.asset?ASSETS[art.asset]:null;
        if(art.memory&&!state.memories.includes(art.memory))unlock(art.memory,false);
        const parts=pages[page].map(l=>{const p=character(l.who);return `<section class="cp-dialogue-turn"><div class="cp-speaker">${dialogueAvatarHTML({card:cardDef(p.card),asset:p.asset,name:p.name,icon:p.icon||'music'})}<div><b>${esc(p.name)}</b><small>${esc(p.tag||'此刻的故事')}</small></div></div><div class="cp-text">${esc(copy(l.text))}</div></section>`;}).join('');
        const visibleChoices=P().selected==='yangcun'&&['yc_cp5a','yc_cp5b','yc_cp5c'].includes(n.id)?n.choices.filter(c=>!c.next||!s.done[c.next]):n.choices;
        const choices=last?(visibleChoices.length?visibleChoices:n.choices.slice(-1)).map((c)=>{const i=n.choices.indexOf(c);return `<button class="cp-choice" data-cp-action="personal-choose" data-personal-choice="${i}" data-personal-rev="${P().rev}"><span class="cp-option-n">${String(i+1).padStart(2,'0')}</span><span>${esc(copy(c.text))}</span>${I('arrow')}</button>`;}).join(''):`${page>0?`<button class="cp-choice cp-page-prev" data-cp-action="personal-page-prev" data-personal-rev="${P().rev}">${I('back')}<span>上一页</span></button>`:''}<button class="cp-choice cp-page-next" data-cp-action="personal-page" data-personal-rev="${P().rev}"><span>下一页<small>${page+2} / ${pages.length}</small></span>${I('arrow')}</button>`;
        const illustrated=src?` cp-novel-illustrated`:'';const style=src?` style="--scene-art:url('${new URL(src,document.baseURI).href}')"`:'';
        return `<article class="cp-novel cp-personal-novel${illustrated}" data-personal-route="${esc(P().selected)}"${style}><header class="cp-novel-top"><span>个人故事 · ${config().name}${P().selected==='baoshi_feihong'?' CP 线':P().selected==='yangcun'?'线':'个人线'}</span><span>${esc(n.title)}${pages.length>1?` · ${page+1}/${pages.length}`:''}</span></header><div class="cp-novel-body">${artHTML(n,page)}<div class="cp-novel-dialogue">${parts}${last&&n.id==='sy_juggle'?'<label class="cp-personal-reply">回复她的动态（可选，20 字内）<input class="text-input" id="cpPersonalReply" maxlength="20" placeholder="一起向前冲！"></label>':''}<div class="cp-choices${last?'':' cp-reader-next'}">${choices}</div>${n.id===CP_HE_CINEMATIC.scene&&page>=CP_HE_CINEMATIC.page?button('cinematic','重看摩天轮拥抱','','ghost'):''}</div></div></article>`;
    }
    function hubSurface(id,kicker,title,note,actions,footer) {
        const asset=ASSETS[config().asset]||ASSETS[getNode(id,config().entry)?.asset]||'assets/story/piano-cat-hero.jpg';
        const sub=title===config().tagline?`${config().name}${id==='baoshi_feihong'?' CP 线':id==='yangcun'?'线':'个人线'} · 第 ${S().run} 次阅读`:config().tagline;
        return `<section class="cp-surface cp-personal-hub" data-personal-hub="${esc(id)}"><div class="cp-personal-hub-visual"><img src="${asset}" alt="${esc(config().name)}故事线主视觉" decoding="async"><div><span class="cp-week-kicker">${kicker}</span><h3>${esc(title)}</h3><p>${esc(sub)}</p></div></div><div class="cp-personal-hub-sheet"><p class="cp-personal-hub-note">${note}</p><div class="cp-personal-hub-actions">${actions}</div><p class="cp-personal-hub-meta">${footer}</p></div></section>`;
    }
    function hubHTML() {
        const s=S(),n=nextMain(),id=P().selected;
        if(id==='baoshi_feihong'){
            const resolving=s.flags.cpReady&&!s.ending,needsScore=resolving&&s.score<95;
            const note=n?esc(n.locked?n.reason:'新的故事已经准备好。'):resolving?(needsScore?`主线已经走到最后一幕。还差 ${95-s.score} 点大旗值即可结算本线结局。`:'助攻已经到位，可以进入本线结局。'):'本线当前剧情已经读完；可以重读或切换其他故事线。';
            const primary=n?button('continue','继续 · '+esc(n.node.title),n.locked?'disabled':'','primary'):resolving&&!needsScore?button('resolve','进入宝石×飞鸿结局','','primary'):'';
            const support=n?.locked||needsScore?button('support','继续助攻 · 大旗 +2','','primary'):'';
            return hubSurface(id,'BAOSHI × FEIHONG · CP STORY','两个人的声音，正在靠近',note,`${primary}${support}${button('picker','切换故事线')}`,`大旗值 ${s.score} · 乐队 Lv.${bandLevel()}<br>大旗值只用于本线结局判定，不是可消费资源。`);
        }
        if(id==='yangcun'){
            const note=n?esc(n.locked?n.reason:'下一段乐队故事已经准备好。'):'这支乐队的故事已经读完；可以重读或切换其他故事线。';
            return hubSurface(id,'YANGCUN · BAND STORY','从五月，一起走到十二月',note,`${n?button('continue','继续 · '+esc(n.node.title),n.locked?'disabled':'','primary'):''}${button('picker','切换故事线')}`,`乐队积分 ${s.score} · 担当值 ${s.dang} · 乐队 Lv.${bandLevel()}。`);
        }
        const note=n?esc(n.locked?n.reason:'新的故事已经准备好。'):'这一刻，先陪彼此待一会儿。';
        const actions=`${button('continue',n?'继续 · '+esc(n.node.title):'暂无待续剧情',!n||n.locked?'disabled':'','primary')}${id==='azhe'?button('duet','和阿喆合奏一场')+button('chat','找阿喆聊天',s.duets<2?'disabled':''):['商场商演','小乐队排练','老乐手小聚'].map((title,i)=>button('invite',(s.done['sy_act'+(i+1)]?'已赴约 · ':'赴约 · ')+title,`data-personal-event="sy_act${i+1}" ${s.done['sy_act'+(i+1)]?'disabled':''}`)).join('')}${button('practice','刻苦练琴 · 10 音符 / 琴技 +2',state.coins<10?'disabled':'')}<button class="btn secondary" data-route="cards">去卡册陪伴与投喂</button><button class="btn secondary" data-route="rhythm">免费演奏赚音符</button>${id==='shiyuan'&&s.done.sy_06done&&!s.done.sy_10?button('confess','今晚，想向她表达心意'):''}`;
        const footer=id==='azhe'?`已合奏 ${s.duets} 场；两场后可聊天。每次合奏羁绊 +1，每日最多 10 次。`:`已赴约 ${['sy_act1','sy_act2','sy_act3'].filter(k=>s.done[k]).length} / 3 场 · 事业准备 ${s.focus} / 3。不同邀约积累事业准备。`;
        return hubSurface(id,'PERSONAL STORY · 留一点时间相处',id==='azhe'?'翻过这一页，星光还在':'把光源，也牵进光里',note,actions,`${footer}<br>琴技 ${P().tech} · 音符 ${state.coins}。剧情奖励按节点只结算一次。`);
    }
    function completionHTML() {
        const s=S(),n=getNode(P().selected,s.ending);
        const art=n.asset&&n.memory?`<button data-memory="${n.memory}" class="cp-personal-ending-art"><img src="${ASSETS[n.asset]}" alt="${esc(n.title)}"></button>`:'';
        return `<section class="cp-surface cp-personal-complete"><div class="cp-ending-hero"><span class="cp-overline">${n.ending} · PERSONAL STORY</span><h3>${esc(n.title)}</h3><p>这段故事已经完成，进度与结局已保存。</p></div>${art}${P().selected===CP_HE_CINEMATIC.route&&s.ending===CP_HE_CINEMATIC.scene?button('cinematic','重看摩天轮拥抱','','secondary'):''}<p class="cp-caption">个人故事首次完成奖励 15 音符、1 张邀请券；更换故事线或结局不叠加领取。</p><div class="cp-personal-hub-actions">${button('picker','选择另一条故事线','','primary')}${button('restart','从头重选这条线')}${button('leave','返回章节目录')}</div></section>`;
    }
    function yangcunAffectionHTML(s) {
        const items=yangcunChatCast.map(([id,name])=>`<span class="cp-yc-affection" data-yc-affection="${id}"><b>${esc(name)}</b><strong>${s.aff[id]||0}</strong></span>`).join('');
        return `<div class="cp-yc-affection-panel"><div class="cp-yc-affection-heading"><b>本周目角色好感</b></div><div class="cp-yc-affection-grid">${items}</div></div>`;
    }
    function personalHTML() {
        if(!admitted(P().selected))return `<section class="cp-surface"><h3>个人故事 · 个人线</h3><p>满足对应路线的羁绊或剧情条件，或支付 ${ECONOMY_RULES.personalRouteUnlock} 音符解锁后可进入。</p>${button('picker','选择角色')}${button('leave','返回正传')}</section>`;
        const s=S();const n=getNode(P().selected,s.scene);
        const cp=P().selected==='baoshi_feihong',yc=P().selected==='yangcun';
        const ycLeader=yc?yangcunChatCast.reduce((best,[id,name])=>(s.aff[id]||0)>(s.aff[best.id]||0)?{id,name}:best,{id:yangcunChatCast[0][0],name:yangcunChatCast[0][1]}):null;
        const record=cp?`大旗值 ${s.score} · 乐队 Lv.${bandLevel()}`:yc?`最高好感：${ycLeader.name} ${s.aff[ycLeader.id]||0}`:`全局羁绊 ${cardBond(P().selected)}`;
        return `<section class="cp-personal"><header class="cp-personal-heading"><div><span class="cp-week-kicker">PERSONAL STORIES · YOUR STORY TOGETHER</span><h2>${config().name}${cp?' CP 线':yc?'线':'个人线'}</h2><p>${config().tagline}</p></div>${button('picker','切换故事线')}</header><div class="cp-personal-toolbar">${s.scene!=='hub'&&!s.ending?button('hub','暂歇，回到相处安排'):''}${button('restart','重读本线')}${button('leave','返回正传')}<span>自动保存 · 第 ${s.run} 次阅读</span></div>${window.StoryBgm?.controls()||''}<details class="cp-personal-details"><summary>${record} · ${yc?'展开好感明细':'展开本线记录'}</summary>${yc?yangcunAffectionHTML(s):''}<p>已读 ${s.read.length} 个场景；已收录 ${s.endings.length} / ${config().nodes.filter(n=>n.ending).length} 种结局。切换故事线和页面会保留各自进度。</p><div class="cp-personal-memories">${s.endings.map(id=>{const n=getNode(P().selected,id);return n.memory?`<button class="btn ghost" data-memory="${n.memory}">${esc(n.title)}</button>`:`<span class="label-tag">${esc(n.title)}</span>`;}).join('')}</div></details><div id="cpMain">${s.scene==='complete'&&s.ending?completionHTML():yc&&s.scene==='chat'?yangcunChatHTML():n?sceneHTML(n):hubHTML()}</div></section>`;
    }
    function cinematicReached() {
        const s=S();return P().active&&P().selected===CP_HE_CINEMATIC.route&&s&&
            (s.scene===CP_HE_CINEMATIC.scene&&s.page>=CP_HE_CINEMATIC.page||s.ending===CP_HE_CINEMATIC.scene);
    }
    function showEmbrace() {
        let dispose=()=>{};
        openModal(CP_HE_CINEMATIC.title,'',()=>{dispose();$('modalBackdrop').querySelector('.modal').classList.remove('story-cinematic-modal');});
        $('modalBackdrop').querySelector('.modal').classList.add('story-cinematic-modal');
        dispose=StoryCinematic.mount($('modalContent'),{src:ASSETS[CP_HE_CINEMATIC.asset],videoSrc:CP_HE_CINEMATIC.video,musicHTML:window.StoryBgm?.controls()||'',onClose:()=>closeModal()});
        syncStoryMusic();
    }
    function personalPreview() {
        const s=S();
        const embraceEnding=P().active&&P().selected===CP_HE_CINEMATIC.route&&s?.scene==='complete'&&s.ending===CP_HE_CINEMATIC.scene;
        if(!embraceEnding)resetPersonalPreview();
        if(!P().active||!s||s.scene!=='complete'||!s.ending||!$('modalBackdrop').hidden)return;
        if(embraceEnding){
            // Only suppress ordinary rerenders during this visit, never a later entry.
            if(embraceVisitShown)return;
            embraceVisitShown=true;
            if(s.previewed!==s.ending){s.previewed=s.ending;save();}
            showEmbrace();
            return;
        }
        if(s.previewed===s.ending)return;
        const memory=getNode(P().selected,s.ending).memory;
        s.previewed=s.ending;save();
        if(memory)showMemory(memory);
    }
    return {personalPickerRows,freshPersonal,cleanPersonal,personalAction,personalHTML,personalPreview,resetPersonalPreview,unlockFusionCp,enterFusionCp,unlockYangcun,offerYangcun,enterYangcun};
}
