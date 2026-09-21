const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
 const checks=await page.evaluate(async()=>{
  const out=[],check=(name,ok)=>{if(!ok)throw Error(name+' (scene '+state.chronicle.run.scene+')');out.push(name);};
  const click=async selector=>{await new Promise(r=>setTimeout(r,215));const b=document.querySelector(selector);if(!b||b.disabled)throw Error('Unavailable '+selector);b.click();};
  const choose=n=>click(`[data-cp-choice="${n}"]`);
  const reset=()=>{closeModal(false);state=freshState();state.sound=false;save();route('home');};
  const scene=(ch,id,flags={},aff={})=>{reset();Object.assign(state.chronicle.run,{chapter:ch,ch,name:'测试',inst:'小提琴',scene:id,flags:{...(ch===3?{c3Met:1}:{}),...flags},aff:{...state.chronicle.run.aff,...aff}});save();route('chronicle');};
  reset();route('chronicle');check('Four chapter entrances',document.querySelectorAll('.cp-chapter-tile').length===4);
  await click('[data-cp-action="switch-chapter"][data-cp-chapter="3"]');$('cpQuickName').value='新伙伴';await click('[data-cp-action="start-third"][data-cp-mode="quick"]');await choose(4);await choose(0);
  check('Third chapter quick start uses supplied stats',state.chronicle.run.chapter===3&&state.chronicle.run.scene==='c3_intro'&&state.chronicle.run.tech===12&&state.chronicle.run.level===3&&state.chronicle.run.gold===50);
  check('Qiqi follows the owner at introduction',state.cards.encounters.join()==='zhu,qiqi');
  check('Qiqi source rarity and stats preserved',cardDef('qiqi').rarity==='SR'&&cardDef('qiqi').stars===3&&cardDef('qiqi').stats.map(x=>x[1]).join()==='73,78,85,99');
  await choose(0);check('Lemon and Xiaozhou placeholders unlock when mentioned',cardOwned('lemon')&&cardOwned('xiaozhou')&&!cardOwned('goose')&&!cardOwned('xiaota'));
  const reading=state.chronicle.run.scene;goCard('lemon');check('Lemon source card replaces placeholder',$('view-card').innerText.includes('帽子领域'));
  check('Bill placeholder stays out of recruit pool',availableCardPool().every(c=>!c.placeholder));
  route('chronicle');check('Card navigation preserves story progress',state.chronicle.run.scene===reading);
  await choose(1);check('Prep choice opens its follow-up',state.chronicle.run.scene==='c3_prep_b'&&$('cpStoryText').textContent.includes('有人一起练琴'));
  await choose(0);check('Goose unlocks at actual mention',cardOwned('goose')&&!cardOwned('bill'));
  await choose(0);await choose(0);check('Bill mention unlocks placeholder; unselected Xiaota option does not',state.chronicle.run.scene==='c3_bill'&&cardOwned('bill')&&!cardOwned('xiaota'));
  goCard('bill');check('Bill has a true placeholder',$('view-card').innerText.includes('敬请期待')&&!$('view-card').querySelector('[data-card-team]'));route('chronicle');
  await choose(0);check('Xiaota unlocks after selection and follow-up',state.chronicle.run.scene==='c3_bill_a'&&cardOwned('xiaota')&&state.chronicle.run.flags.taIn===1);
  await choose(0);await choose(0);check('Third chapter main path reaches weekly actions',state.chronicle.run.scene==='menu');
  const third=JSON.stringify(state.chronicle.run);await click('[data-cp-action="switch-chapter"][data-cp-chapter="1"]');await click('[data-cp-action="switch-chapter"][data-cp-chapter="3"]');check('Chapter switching retains third-chapter exact state',state.chronicle.run.scene==='menu'&&state.chronicle.run.flags.taIn===1&&state.chronicle.slots['1'].chapter===1);
  const full=cleanState(JSON.parse(JSON.stringify(state)));check('Save validation retains all chapter slots and entrance snapshot',full.chronicle.run.chapter===3&&full.chronicle.chapter3Start.tech===12&&full.chronicle.slots['1'].chapter===1);
  showLalaJournal(3);check('Notebook supports third chapter',$('modalContent').innerText.includes('第三章 · 星光530')&&$('modalContent').textContent.includes('小周'));closeModal(false);
  const known=[...state.cards.encounters];await click('[data-cp-action="restart"]');await click('[data-cp-action="confirm-restart"]');if(state.chronicle.run.scene==='zhu_offer'){await choose(4);await choose(0);}check('Restart restores third entrance but keeps cards and other chapters',state.chronicle.run.scene==='c3_intro'&&state.chronicle.run.tech===12&&known.every(cardOwned)&&!!state.chronicle.slots['1']);
  for(const [stem,next] of [['tim','c2_night_pre'],['head','c2_kong'],['kong','c2_endweek']])for(let i=0;i<3;i++){
   scene(2,'c2_'+stem,{strGroup:1},{shiyuan:10});await choose(i);check(`Second chapter ${stem} branch ${i+1} opens new dialogue`,state.chronicle.run.scene==='c2_'+stem+'_'+'abc'[i]);
   state=cleanState(JSON.parse(JSON.stringify(state)));route('chronicle');check(`Second chapter ${stem} branch ${i+1} survives save`,state.chronicle.run.scene==='c2_'+stem+'_'+'abc'[i]);await choose(0);check(`Second chapter ${stem} branch ${i+1} rejoins`,state.chronicle.run.scene===next);
  }
  scene(2,'c2_kong',{strGroup:1},{shiyuan:0});await choose(0);check('Weak stay response agrees with outcome',state.chronicle.run.flags.konggeStay==='weak'&&$('cpStoryText').textContent.includes('没有给出明确的承诺'));
  for(const stem of ['prep','ge','jeal'])for(let i=0;i<3;i++){
   scene(3,'c3_'+stem);await choose(i);check(`Third chapter ${stem} branch ${i+1}`,state.chronicle.run.scene==='c3_'+stem+'_'+'abc'[i]);await choose(0);check(`Third chapter ${stem} follow-up returns`,state.chronicle.run.scene===({prep:'c3_ge',ge:'c3_bill',jeal:'menu'}[stem]));
  }
  scene(3,'c3_bill');await choose(1);check('Bill waiting branch recorded',state.chronicle.run.flags.billWait===1&&state.chronicle.run.scene==='c3_bill_b');await choose(0);await choose(0);check('Waiting branch reaches weekly loop',state.chronicle.run.scene==='menu');
  for(const [roll,id] of [[.1,'c3_band_q'],[.4,'c3_band_zhou'],[.7,'c3_band_bill'],[.9,'practice_partner']]){
   scene(3,'menu');const random=Math.random;Math.random=()=>roll;try{await click('[data-cp-action="ensemble"]');}finally{Math.random=random;}check('Third chapter ensemble event '+id,state.chronicle.run.scene===id);
   if(id!=='practice_partner')for(let n=0;n<2;n++){if(n)scene(3,id);await choose(n);check(id+' follow-up '+n,state.chronicle.run.scene.startsWith('band_'));await choose(0);check(id+' return '+n,state.chronicle.run.scene==='menu');}
  }
  scene(3,'menu',{}, {azhe:11,dijie:11,tim:11});await click('[data-cp-action="end-week"]');check('Three friendships trigger one jealousy event',state.chronicle.run.scene==='c3_jeal'&&state.chronicle.run.flags.qiJealous===1);await choose(0);await choose(0);await click('[data-cp-action="end-week"]');check('Jealousy event does not repeat',state.chronicle.run.scene==='menu');
  scene(3,'menu',{}, {tim:70});await click('[data-cp-action="end-week"]');check('Third chapter gossip updates correct counters',state.chronicle.run.flags.qBack===1&&state.chronicle.run.aff.tim===65);state=cleanState(JSON.parse(JSON.stringify(state)));route('chronicle');await click('[data-cp-action="end-week"]');check('Gossip count survives save and increments',state.chronicle.run.flags.qBack===2);
  for(const [flags,expected,diff] of [[{taIn:1,stayShi:1},'c3_he',18],[{billWait:1},'c3_te',22],[{qiJealous:1,stayShi:1},'c3_te',20],[{taIn:1,stayShi:1,qiJealous:1,qiSeen:1},'c3_he',18],[{qBack:2},'c3_qiqi',20]]){
   scene(3,'b_live',flags);state.chronicle.run.tech=14;state.chronicle.run.week=6;state.chronicle.run.rev++;renderGlobal();await choose(0);check('Concert difficulty '+expected+' '+JSON.stringify(flags),state.chronicle.run.live.diff===diff);await choose(0);
   Object.assign(state.chronicle.run.live,{scores:[10,10,10,10,10],score:50,phase:'feedback'});state.chronicle.run.rev++;renderGlobal();await click('[data-cp-action="live-next"]');check('Concert ending '+expected,state.chronicle.run.ending===expected&&state.chronicle.endings.includes(expected));
   check('Ending prose is rendered',!!$('cpStoryText')&&$('cpStoryText').textContent.length>30);const rewards=JSON.stringify([state.coins,state.cards.tickets]);await choose(0);check('Third chapter finale stays at proper chapter',state.chronicle.run.scene==='title4'&&$('cpMain').innerText.includes('第四章 · 剧场之夜'));
   state=cleanState(JSON.parse(JSON.stringify(state)));save();route('chronicle');check('Reload does not duplicate ending rewards',rewards===JSON.stringify([state.coins,state.cards.tickets]));
  }
  scene(3,'live_play');state.chronicle.run.live={scores:[2,2,2,2,2],score:10,diff:20,phase:'feedback',width:28,pos:0,dir:1,finished:false};state.chronicle.run.rev++;renderGlobal();await click('[data-cp-action="live-next"]');check('Low score gets failure ending',state.chronicle.run.ending==='c3_fail');
  scene(2,'title3',{strGroup:1});Object.assign(state.chronicle.run,{ending:'c2_retry',ch:3,tech:17,gold:93,level:4});state.chronicle.run.aff.tim=12;state.chronicle.endings=['c2_retry'];save();route('chronicle');await click('[data-cp-action="switch-chapter"][data-cp-chapter="3"]');await click('[data-cp-action="start-third"][data-cp-mode="carry"]');check('Second chapter failure can continue with inherited growth',state.chronicle.run.chapter===3&&state.chronicle.run.tech===17&&state.chronicle.run.gold===93&&state.chronicle.run.aff.tim===12&&state.chronicle.run.week===1&&state.chronicle.slots['2'].ending==='c2_retry');
  // Source-format migration must not confuse ch=3 (chapter-two title) with chapter-three progress.
  for(const [raw,ch,at] of [[{scene:'title3',ch:3,flags:{strGroup:1}},2,'title3'],[{scene:'c3_prep_b',ch:3,flags:{zhouHelp:1}},3,'c3_prep_b'],[{scene:'be_qiqi',ch:4,flags:{qBack:2}},3,'be_qiqi']]){
   Chronicle.requestLegacy({name:'原版',inst:'弦乐',week:3,tech:12,aff:{yesiyang:7},...raw});$('cpConfirmLegacy').click();check('Legacy import '+raw.scene,state.chronicle.run.chapter===ch&&state.chronicle.run.scene===at&&state.chronicle.run.aff.yeshiyang===7);
  }
  scene(3,'c3_ge');state.cards.encounters.push('qiqi');save();state.cards.team=['qiqi','shiyuan'];goCard('qiqi');check('Qiqi hidden bond is absent before condition',!$('view-card').innerHTML.includes('姐妹同框')&&!$('view-card').innerHTML.includes('好姐妹'));
  hostQiqiParty();check('Qiqi party changes mood and cared state',qiqiState().mood.qiqi===80&&qiqiState().mood.shiyuan===80&&qiqiState().cared.includes('shiyuan'));const stamp=JSON.stringify(qiqiState());hostQiqiParty();check('Qiqi weekly cooldown blocks repeat',stamp===JSON.stringify(qiqiState()));
  game.cardRun=captureCardRun();game.notes=[];const reward=awardCardPerformance(1);check('Qiqi concert records charm and bond',qiqiState().lastStage.charm===15&&qiqiState().sisters&&qiqiState().fan===10&&qiqiState().presence===5);awardCardPerformance(1);check('Qiqi effects settle once',qiqiState().fan===10&&qiqiState().presence===5);
  goCard('qiqi');check('Unlocked Qiqi skill remains collapsed',$('view-card').innerHTML.includes('好姐妹')&&!$('view-card').innerText.includes('好姐妹'));
  state=cleanState(JSON.parse(JSON.stringify(state)));check('Qiqi state survives save',qiqiState().sisters&&qiqiState().mood.qiqi===80&&qiqiState().nextPartyAt>Date.now());
  goCard('qiqi');CardUI.tab='bond';renderCardPage();check('Qiqi bond page works',$('view-card').innerText.includes('点心盒里的休止符'));
  openCardStory('qiqi');check('Qiqi personal story works',!!storySession&&$('storyText').textContent.includes('手作点心'));exitStory();
  save();goCard('qiqi');return out;
 });
 await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}'});
 await page.screenshot({path:'/tmp/hjm-qiqi-desktop.png'});
 await page.reload();assert(await page.evaluate(()=>qiqiState().sisters),'Qiqi survives actual reload');
 await page.evaluate(()=>goCard('qiqi'));await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Qiqi mobile overflow');await page.screenshot({path:'/tmp/hjm-qiqi-mobile.png'});
 await page.evaluate(()=>{state.chronicle.run.chapter=3;state.chronicle.run.scene='c3_prep';state.chronicle.run.ending=null;state.chronicle.run.rev++;route('chronicle');});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Third chapter mobile overflow');await page.screenshot({path:'/tmp/hjm-third-mobile.png'});
 await page.evaluate(()=>{state.cards.encounters.push('bill');save();goCard('bill');});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Placeholder mobile overflow');await page.screenshot({path:'/tmp/hjm-placeholder-mobile.png'});
 assert.deepEqual(errors,[]);console.log(`PASS: ${checks.length} chapter/content/skill checks, import/export, mobile layouts, no runtime errors.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
