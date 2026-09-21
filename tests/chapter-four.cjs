const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
  const checks=await page.evaluate(async()=>{
   const out=[],check=(name,ok)=>{if(!ok)throw Error(name+' (scene '+state.chronicle.run.scene+')');out.push(name);};
   const click=async selector=>{await new Promise(r=>setTimeout(r,215));const b=document.querySelector(selector);if(!b||b.disabled)throw Error('Unavailable '+selector);b.click();};
   const choose=n=>click(`[data-cp-choice="${n}"]`);
   const reset=()=>{closeModal(false);state=freshState();state.sound=false;save();route('home');};
   const render=()=>{state.chronicle.run.rev++;renderGlobal();};
   const scene=(id,flags={},aff={})=>{reset();Object.assign(state.chronicle.run,{chapter:4,ch:4,name:'剧场测试',inst:'小提琴',scene:id,tech:15,level:3,gold:60,flags,aff:{...state.chronicle.run.aff,...aff}});save();route('chronicle');};
   const serialize=()=>{state=cleanState(JSON.parse(JSON.stringify(state)));save();route('chronicle');};
   reset();route('chronicle');check('Four distinct chapter tabs',document.querySelectorAll('.cp-chapter-tile').length===4&&document.querySelector('[data-cp-chapter="3"]').textContent.includes('星光530'));
   await click('[data-cp-action="switch-chapter"][data-cp-chapter="4"]');$('cpQuickName').value='剧场新人';await click('[data-cp-action="start-fourth"][data-cp-mode="quick"]');await choose(4);await choose(0);
   check('Fourth quick start matches source',state.chronicle.run.scene==='c4_intro'&&state.chronicle.run.tech===14&&state.chronicle.run.gold===60&&state.chronicle.run.level===3&&state.chronicle.run.aff.shiyuan===12);
   check('Yeshiyang follows the owner at introduction',state.cards.encounters.join()==='zhu,yeshiyang');
   check('Entry memory recorded',state.memories.includes('cp4_entry'));
   await choose(0);check('Dayang unlocks on mention, Baoshi remains locked',cardOwned('dayang')&&!cardOwned('baoshi'));
   await choose(2);check('Compromise gets twelve bars',state.chronicle.run.flags.yangCompromise===1&&$('cpStoryText').textContent.includes('再加四小节'));
   await choose(0);check('Baoshi and Feihong unlock at duet',cardOwned('baoshi')&&cardOwned('feihong')&&state.chronicle.run.flags.c4bao===1);
   check('New card images remain external assets',availableCardPool().filter(c=>['dayang','baoshi'].includes(c.id)).length===2&&ASSETS.cardBaoshi.startsWith('assets/'));
   await choose(1);await choose(0);check('Qiqi unlocks at proposal',cardOwned('qiqi'));
   await choose(1);await choose(0);await choose(0);
   check('Mainline arrives at weekly loop',state.chronicle.run.scene==='menu'&&state.chronicle.run.flags.baoOK===1&&state.chronicle.run.flags.qiHandled===1);
   showLalaJournal(4);check('Fourth notebook contains read choices',$('modalContent').textContent.includes('第四章 · 剧场之夜')&&$('modalContent').textContent.includes('再加四小节'));closeModal(false);
   await click('[data-cp-action="social"]');check('Met cast is available and absent cast hidden',!!document.querySelector('[data-cp-person="baoshi"]')&&!!document.querySelector('[data-cp-person="dayang"]')&&!document.querySelector('[data-cp-person="goose"]')&&!document.querySelector('[data-cp-person="bill"]')&&!document.querySelector('[data-cp-person="lemon"]'));
   await click('[data-cp-action="chat"][data-cp-person="baoshi"]');check('Fourth chapter chat uses new voice',$('cpStoryText').textContent.includes('蜂蜜茶'));await choose(0);
   await click('[data-cp-action="switch-chapter"][data-cp-chapter="1"]');await click('[data-cp-action="switch-chapter"][data-cp-chapter="4"]');serialize();check('Fourth progress and entry snapshot survive round trip',JSON.stringify(state.chronicle.run.flags).includes('yangCompromise')&&state.chronicle.chapter4Start.tech===14&&state.chronicle.slots[1].chapter===1);
   await click('[data-cp-action="restart"]');await click('[data-cp-action="confirm-restart"]');if(state.chronicle.run.scene==='zhu_offer'){await choose(4);await choose(0);}check('Restart restores entrance and retains cards',state.chronicle.run.scene==='c4_intro'&&state.chronicle.run.tech===14&&!state.chronicle.run.flags.yangCompromise&&cardOwned('baoshi'));
   for(const [stem,count,next] of [['prep',3,'c4_bao'],['bao',2,'c4_qiqi'],['qiqi',3,'c4_menu'],['jeal',3,'menu']])for(let i=0;i<count;i++){
    scene('c4_'+stem);await choose(i);check('Branch '+stem+i,state.chronicle.run.scene==='c4_'+stem+'_'+'abc'[i]);serialize();check('Branch save '+stem+i,state.chronicle.run.chapter===4&&state.chronicle.run.scene==='c4_'+stem+'_'+'abc'[i]);await choose(0);check('Branch rejoin '+stem+i,state.chronicle.run.scene===next);
   }
   scene('c4_qiqi');await choose(2);check('Accepted sponsorship adds fifty only',state.chronicle.run.gold===110&&!('discontent' in state.chronicle.run));
   scene('c4_qiqi');await choose(0);serialize();check('Refusal counter survives save',state.chronicle.run.flags.qHate===1&&state.chronicle.run.flags.qiHandled===1);
   for(const [roll,id] of [[.1,'c4_band_lemon'],[.3,'c4_band_zhou'],[.6,'c4_band_bao'],[.9,'practice_partner']]){
    scene('menu');const random=Math.random;Math.random=()=>roll;try{await click('[data-cp-action="ensemble"]');}finally{Math.random=random;}
    check('Weekly event '+id,state.chronicle.run.scene===id);
    if(id!=='practice_partner')for(let n=0;n<2;n++){
     if(n)scene(id);await choose(n);check(id+' response '+n,state.chronicle.run.scene.startsWith('b4_'));serialize();await choose(0);check(id+' returns '+n,state.chronicle.run.scene==='menu'&&state.chronicle.run.chapter===4);
    }
   }
   scene('c4_band_lemon');state.chronicle.run.gold=19;render();check('Insufficient funds disables borrowing',document.querySelector('[data-cp-choice="0"]').disabled);
   const b=document.querySelector('[data-cp-choice="0"]');b.disabled=false;await choose(0);check('Insufficient-funds guard resists stale DOM',state.chronicle.run.gold===19&&state.chronicle.run.scene==='c4_band_lemon');await choose(1);check('Can still refuse',state.chronicle.run.scene==='b4_lemon_b');
   scene('c4_band_lemon',{}, {lemon:7});await choose(0);check('Ten affinity is not BE',state.chronicle.run.aff.lemon===10&&!state.chronicle.run.ending);await choose(0);await click('[data-cp-action="social"]');await click('[data-cp-action="chat"][data-cp-person="lemon"]');
   check('Chat crossing threshold triggers BE immediately',state.chronicle.run.ending==='c4_lemon'&&state.chronicle.run.scene==='be_mianbei');serialize();await choose(0);check('Lemon ending can advance to title without a loop',state.chronicle.run.scene==='title5'&&state.chronicle.run.chapter===4);await click('[data-cp-action="restart"]');await click('[data-cp-action="confirm-restart"]');if(state.chronicle.run.scene==='zhu_offer'){await choose(4);await choose(0);}check('Lemon ending restart clears affinity',state.chronicle.run.aff.lemon===0&&state.chronicle.run.scene==='c4_intro');
   scene('c4_band_lemon',{}, {lemon:8});await choose(0);check('Borrowing also triggers threshold BE',state.chronicle.run.ending==='c4_lemon'&&state.chronicle.run.gold===40);
   scene('menu',{}, {azhe:11,dijie:11,tim:11});await click('[data-cp-action="end-week"]');check('Fourth jealousy keeps chapter identity',state.chronicle.run.scene==='c4_jeal');serialize();await choose(0);await choose(0);await click('[data-cp-action="end-week"]');check('Fourth jealousy occurs once',state.chronicle.run.chapter===4&&state.chronicle.run.scene==='menu');
   scene('menu',{}, {tim:70});await click('[data-cp-action="end-week"]');serialize();await click('[data-cp-action="end-week"]');check('Gossip counters persist without retired mechanics',state.chronicle.run.flags.qBack===2&&state.chronicle.run.aff.tim===60&&state.chronicle.run.tech===15&&!('discontent' in state.chronicle.run));
   scene('b_live');state.chronicle.run.week=6;state.chronicle.run.tech=14;render();check('Gate explicitly requires fifteen',$('cpStoryText').textContent.includes('不足 15'));await choose(0);check('Delaying advances a week and adds skill',state.chronicle.run.week===7&&state.chronicle.run.tech===16);
   for(const [flags,ending,bars,score,diff] of [[{qiHandled:1,baoOK:1,yangSolo:1,zhouSolo:1},'c4_he','十六小节',50,18],[{qiHandled:1,baoOK:1,yangCompromise:1},'c4_he','十二小节',50,21],[{qiHandled:1,baoOK:1},'c4_he','八小节',50,21],[{baoOK:1},'c4_te','',50,21],[{},'c4_fail','',10,21],[{qBack:2,qiHandled:1,baoOK:1},'c4_qiqi','',50,21],[{qHate:2},'c4_qiqi','',10,21]]){
    scene('b_live',flags);state.chronicle.run.week=6;render();await choose(0);check('Fourth stage difficulty '+JSON.stringify(flags),state.chronicle.run.live.diff===diff);await choose(0);
    Object.assign(state.chronicle.run.live,{scores:Array(5).fill(score/5),score,phase:'feedback'});render();await click('[data-cp-action="live-next"]');check('Stage outcome '+ending+' '+bars,state.chronicle.run.ending===ending&&state.chronicle.endings.includes(ending));
    if(bars)check('Ending matches chosen solo '+bars,$('cpStoryText').textContent.includes(bars));
    const rewards=JSON.stringify([state.coins,state.cards.tickets]);serialize();check('Ending prose survives save',!!$('cpStoryText')&&$('cpStoryText').textContent.length>40);await choose(0);check('Fifth teaser conceals hidden identity',state.chronicle.run.scene==='title5'&&$('cpMain').innerText.includes('夏天的形状')&&!$('cpMain').innerText.includes('宝石姬'));serialize();check('Reward claimed once '+ending,rewards===JSON.stringify([state.coins,state.cards.tickets]));
   }
   scene('c4_qiqi',{}, {shiyuan:98});await choose(0);check('Universal shadow ending stays fourth',state.chronicle.run.ending==='shadow'&&state.chronicle.run.scene==='be_shiyuan');await choose(0);check('Shadow links fourth title',state.chronicle.run.scene==='title5');
   scene('title4',{c3Met:1,taIn:1,qiSeen:1,qBack:1});Object.assign(state.chronicle.run,{chapter:3,ch:4,ending:'c3_he',tech:22,gold:99,level:4});state.chronicle.run.aff.xiaota=8;state.chronicle.endings=['c3_he'];save();route('chronicle');
   await click('[data-cp-action="switch-chapter"][data-cp-chapter="4"]');await click('[data-cp-action="start-fourth"][data-cp-mode="carry"]');check('Carry preserves growth and plot flags',state.chronicle.run.tech===22&&state.chronicle.run.gold===99&&state.chronicle.run.flags.qBack===1&&state.chronicle.run.flags.taIn===1&&state.chronicle.slots[3].ending==='c3_he');
   state.chronicle.run.flags.qBack=2;state.chronicle.run.flags.yangSolo=1;await click('[data-cp-action="restart"]');await click('[data-cp-action="confirm-restart"]');if(state.chronicle.run.scene==='zhu_offer'){await choose(4);await choose(0);}check('Restart restores inherited flags to entrance snapshot',state.chronicle.run.flags.qBack===1&&!state.chronicle.run.flags.yangSolo&&state.chronicle.run.tech===22);
   serialize();check('Fourth entrance snapshot survives serialization',state.chronicle.chapter4Start.flags.qBack===1);
   for(const [raw,ch,at] of [[{scene:'title4',ch:4},3,'title4'],[{scene:'title5',ch:5},4,'title5'],[{scene:'c4_bao',ch:4},4,'c4_bao'],[{scene:'b4_zhou_a',ch:4,flags:{zhouSolo:1}},4,'b4_zhou_a'],[{scene:'c3_jeal_a',ch:4,flags:{qiSeen:1}},4,'c4_jeal_a'],[{scene:'be_mianbei',ch:4,aff:{lemon:12}},4,'be_mianbei'],[{scene:'be_qiqi4',ch:5,flags:{qHate:2}},4,'be_qiqi4'],[{scene:'be_shiyuan',ch:4},4,'be_shiyuan']]){
    Chronicle.requestLegacy({name:'原版',inst:'弦乐',week:3,tech:15,aff:{yesiyang:7,dage:3},...raw});$('cpConfirmLegacy').click();check('Original import '+raw.scene,state.chronicle.run.chapter===ch&&state.chronicle.run.scene===at);
    if(raw.scene==='c4_bao')check('Original aliases and appearance flag normalized',state.chronicle.run.aff.yeshiyang===7&&state.chronicle.run.aff.goose===3&&state.chronicle.run.flags.c4bao===1);
   }
   scene('c4_intro');await click('[data-cp-action="gallery"]');check('Gallery conceals unread fourth endings',$('modalContent').textContent.includes('第四章 · 剧场之夜')&&!$('modalContent').textContent.includes('远方的机票'));closeModal(false);
   scene('c4_qiqi');save();return out;
  });
  await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}'});
  await page.evaluate(()=>$('toastStack').replaceChildren());await page.screenshot({path:'/tmp/hjm-four-desktop.png',fullPage:true});
  await page.reload();assert.equal(await page.evaluate(()=>state.chronicle.run.scene),'c4_qiqi');
  await page.evaluate(()=>route('chronicle'));await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Fourth chapter mobile overflow');
  await page.screenshot({path:'/tmp/hjm-four-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);console.log(`PASS: ${checks.length} fourth chapter checks, actual reload, mobile layout, no runtime errors.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
