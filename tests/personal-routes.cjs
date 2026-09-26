const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
 const checks=await page.evaluate(async()=>{
  const out=[],P=()=>state.chronicle.personal,S=()=>P().routes[P().selected];
  const check=(name,ok)=>{if(!ok)throw Error(name+' at '+S()?.scene);out.push(name);};
  const wait=()=>new Promise(r=>setTimeout(r,215));
  const click=async selector=>{await wait();const b=document.querySelector(selector);if(!b||b.disabled)throw Error('Unavailable '+selector+' at '+S()?.scene);b.click();};
  const action=(name)=>click(`[data-cp-action="personal-${name}"]`);
  const pageToChoices=async()=>{while(document.querySelector('[data-cp-action="personal-page"]'))await action('page');};
  const choose=async n=>{await pageToChoices();return click(`[data-personal-choice="${n}"]`);};
  const forged=async(action,data={})=>{await wait();const b=document.createElement('button');b.dataset.cpAction=action;Object.assign(b.dataset,data);document.body.append(b);b.click();b.remove();};
  const setup=(bond=100,complete=true)=>{closeModal(false);state=freshState();state.sound=false;state.coins=100;state.chronicle.completedChapters=complete?[1,2,3,4,5,6]:[1,2,3,4,5];Object.assign(state.chronicle.run,{chapter:6,ch:6,name:'测试玩家',inst:'长笛',scene:'c6_intro',tech:24});for(const id of ['azhe','shiyuan'])applyBondValue(id,bond);save();route('chronicle');};
  const select=async id=>{await action('picker');await click(`[data-cp-person="${id}"]`);};
  const reload=()=>{closeModal(false);state=cleanState(JSON.parse(JSON.stringify(state)));save();route('chronicle');};
  const go=scene=>{closeModal(false);S().scene=scene;S().page=0;S().ending=null;P().rev++;renderGlobal();};
  const finish=async()=>{await choose(0);check('Ending auto preview '+S().ending,!$('modalBackdrop').hidden);closeModal(false);};
  for(const route of Object.values(PERSONAL_ROUTES))for(const n of route.nodes){
   check('Valid graph '+n.id,n.lines.length>0&&n.choices.length>0&&n.choices.every(c=>c.next===null||c.next==='CHK_COMFORT'||route.nodes.some(v=>v.id===c.next)));
   check('Explicit bond range '+n.id,n.choices.every(c=>[0,1,2,5].includes(c.bond)));
   check('Known personal speaker '+n.id,n.lines.every(l=>['narrator','player','bingbing','xuezi','rek','crowd',...ChronicleData.PERSON_IDS].includes(l.who)));
  }
  for(const route of Object.values(PERSONAL_ROUTES))for(const n of route.nodes){const turns=[];for(const l of n.lines){if(turns.at(-1)?.who===l.who)turns.at(-1).text+=' '+l.text;else turns.push({...l});}check('Every personal dialogue page has dedicated art '+route.id+':'+n.id,n.pageArt.length===Math.ceil(turns.length/2)&&n.pageArt.every(a=>a.asset&&a.memory));}
  setup(100,false);check('Chapter seven disabled before six',document.querySelector('[data-cp-action="personal-picker"]').disabled);
  await forged('personal-select',{cpPerson:'azhe'});check('Direct entry blocked before six',!P().active);
  setup(35);await action('picker');check('35 boundary stays locked',document.querySelector('[data-cp-person="azhe"]').disabled);
  await forged('personal-select',{cpPerson:'azhe'});check('Execution rechecks 35',!P().active);closeModal(false);
  setup(35);state.coins=9999;await action('picker');await click('[data-cp-action="personal-unlock"][data-cp-person="azhe"]');check('Insufficient direct unlock never charges',state.coins===9999&&!P().unlocks.azhe);closeModal(false);
  state.coins=10007;await action('picker');await click('[data-cp-action="personal-unlock"][data-cp-person="azhe"]');check('Ten-thousand-note unlock is exact and does not change bond',state.coins===7&&P().unlocks.azhe&&cardBond('azhe')===35);closeModal(false);reload();check('Paid personal unlock survives save cleaning',P().unlocks.azhe===true);await select('azhe');check('Paid unlock bypasses bond gate',P().active&&S().scene==='azhe_01');
  setup(0);state.coins=10000;await action('picker');await click('[data-cp-action="personal-unlock"][data-cp-person="baoshi_feihong"]');closeModal(false);await select('baoshi_feihong');check('Paid CP unlock bypasses special prerequisites',state.coins===0&&P().active&&S().scene==='cp_00'&&!state.chronicle.run.flags.feiSide);
  applyBondValue('azhe',36);await select('azhe');check('36 enters actual dialogue',S().scene==='azhe_01'&&P().active);
  check('Reading collects only actual scene',state.memories.includes('cp7_azhe_01')&&!state.memories.includes('cp7_azhe_01c'));
  const before=cardBond('azhe');await choose(0);check('Key choice adds global five',cardBond('azhe')===before+5&&S().scene==='azhe_01b');
  await action('hub');await action('duet');await choose(0);await action('duet');await choose(0);await action('chat');await choose(0);
  check('Daily companion shared cap',cardBond('azhe')===before+6&&state.bondProgress.daily.counts['companion:azhe']===1);
  await action('continue');check('Hub preserves branch',S().scene==='azhe_01b');
  const chapter=JSON.stringify({...state.chronicle.run,rev:0,aff:{}});applyBondValue('shiyuan',40);await select('shiyuan');await choose(0);const syScene=S().scene;
  await select('azhe');check('Character progress independent',S().scene==='azhe_01b'&&P().routes.shiyuan.scene===syScene);
  check('Sixth chapter stays intact',JSON.stringify({...state.chronicle.run,rev:0,aff:{}})===chapter);
  reload();check('Reload retains branch and chapter seven',P().active&&S().scene==='azhe_01b');
  await action('restart');await action('confirm-restart');await choose(0);check('Re-reading never farms bond',cardBond('azhe')===before+6);
  await action('hub');state.coins=9;P().rev++;renderGlobal();const tech=P().tech;await forged('personal-practice');check('Insufficient notes forbid practice',P().tech===tech&&state.coins===9);
  state.coins=10;P().rev++;renderGlobal();await action('practice');check('Paid practice cost and growth',state.coins===0&&P().tech===tech+2);
  const ended=[];
  for(const target of ['azhe_HE','azhe_TE','azhe_BE_note']){
   setup();await select('azhe');
   for(let step=0;step<45&&S().scene!==target;step++){
    const id=S().scene;if(id==='hub')throw Error('Unexpected blocked Azhe story');
    await choose(id==='azhe_06'&&target==='azhe_BE_note'?2:id==='azhe_07b'?(target==='azhe_TE'?0:1):0);
   }
   check('Full Azhe route reaches '+target,S().scene===target);const notes=state.coins,tickets=state.cards.tickets;await finish();
   check('First chapter-seven payout '+target,state.coins===notes+15&&state.cards.tickets===tickets+1);
   reload();check('Chapter seven receipt survives cleaner',state.economy.claimed['chapter:7']&&S().scene==='complete'&&$('modalBackdrop').hidden);
   await select('shiyuan');go('sy_BE_ge');await finish();check('Other character cannot repay chapter seven',state.coins===notes+15&&state.cards.tickets===tickets+1);ended.push(target);
  }
  // Complete source branches through UI: stable support path, three distinct invites, exam and career.
  setup();await select('shiyuan');await choose(0);await choose(1);check('First storm waits for invitations',S().scene==='hub');
  for(let i=1;i<=3;i++){
   if(S().scene!=='hub')await action('hub');await click(`[data-personal-event="sy_act${i}"]`);await choose(0);
  }
  check('Three invitations give preparation without bond farming',S().focus===3&&cardBond('shiyuan')===100);
  if(S().scene==='hub')await action('continue');
  const selections={sy_04:2,sy_pd_b:0,sy_juggle:1};
  for(let step=0;step<90&&S().scene!=='sy_HE';step++){
   const id=S().scene;if(id==='hub'){await action('continue');continue;}
   if(id==='sy_juggle'){await pageToChoices();$('cpPersonalReply').value='<img src=x>';}
   await choose(selections[id]??0);
  }
  check('Shiyuan full HE route reached',S().scene==='sy_HE');
  check('All exam flags and authored career',S().flags.q1&&S().flags.q2&&S().flags.q3&&S().flags.startup&&S().flags.pdHelp);
  check('Reply uses escaped text',!document.querySelector('#cpMain img[src="x"]'));
  const heRead=[...S().read];await finish();check('Only visited alternatives collected',!state.memories.includes('cp7_sy_q1_bad')&&state.memories.includes('cp7_sy_q1_ok'));
  // Question-specific feedback is correct, subsequent question does not repeat the old question.
  setup();await select('shiyuan');go('sy_q2');await choose(1);check('Question two incorrect feedback',S().scene==='sy_q2_bad'&&$('cpMain').textContent.includes('C、E、G'));await choose(0);await choose(0);check('Question two advances to third',S().scene==='sy_q3');
  for(const [id,flags,bond,expected] of [
   ['sy_10',{confessed:false,examHelp:true},100,'sy_TE'],
   ['sy_10',{},100,'sy_TE2'],
   ['sy_10',{},90,'sy_BE']
  ]){setup(bond);await select('shiyuan');S().flags=flags;go(id);await choose(0);check('Explicit confession resolves '+expected,S().scene===expected);}
  setup();await select('shiyuan');go('sy_10');await choose(1);check('Waiting is distinct ending',S().scene==='sy_10wait');await finish();
  setup();await select('shiyuan');go('sy_exam');await choose(1);await choose(0);check('Declining exam ends coherent branch',S().scene==='sy_TE2');
  setup(60);await select('shiyuan');go('sy_04c');await choose(0);check('Low bond breakfast has distinct encounter',S().scene==='sy_04c_ye');
  setup(100);await select('shiyuan');go('sy_04c');await choose(0);check('High bond breakfast reaches her',S().scene==='sy_04c_ok');
  setup(120);await select('azhe');await choose(0);reload();check('Historic bond above 100 preserved',cardBond('azhe')===120);
  setup();await select('azhe');const rev=P().rev;await choose(0);const current=S().scene;
  await forged('personal-choose',{personalRev:String(rev),personalChoice:'0'});check('Stale button cannot skip dialogue',S().scene===current);
  await forged('confirm-restart');check('Old chapter controls cannot reset six while personal active',P().active&&state.chronicle.run.scene==='c6_intro');
  go('azhe_HE');await finish();await action('restart');await action('confirm-restart');go('azhe_HE');await finish();check('Restart can show ending preview again',S().run===2);
  // Baoshi×Feihong uses story prerequisites rather than a character-bond gate.
  setup();Object.assign(state.chronicle.run,{level:6,flags:{feiSide:1,strGroup:1}});await select('shiyuan');S().flags.syFriend=true;P().rev++;renderGlobal();await select('baoshi_feihong');
  check('String group plus Shiyuan friendship enters CP route',P().selected==='baoshi_feihong'&&S().scene==='cp_00');
  check('Personal reader limits each page to two dialogue turns',document.querySelectorAll('.cp-dialogue-turn').length<=2);
  await choose(1);check('Low banner choice pauses at support hub',S().scene==='hub'&&S().score===11);await action('support');await action('continue');check('Listening support reaches next CP scene',S().scene==='cp_00b');
  check('Long personal scenes use continuation pages before choices',document.querySelectorAll('.cp-dialogue-turn').length<=2&&!!document.querySelector('[data-cp-action="personal-page"]')&&!document.querySelector('[data-personal-choice]'));
  await action('page');await action('hub');await action('continue');check('Pause and continue restore the same dialogue page',S().scene==='cp_00b'&&S().page===1&&document.querySelectorAll('.cp-dialogue-turn').length<=2);
  go('cp_00c');check('SOLO scene attributes first page to narrator and Dayang',[...document.querySelectorAll('.cp-speaker b')].map(e=>e.textContent).join('|')==='旁白|大羊');await action('page');check('SOLO scene attributes Baoshi and Feihong dialogue',document.querySelector('#cpMain').textContent.includes('宝石')&&document.querySelector('#cpMain').textContent.includes('飞鸿')&&!document.querySelector('#cpMain').textContent.includes('旁白'));
  S().score=200;S().flags={push1:true,push2:true,push3:true};go('cp_12b');await choose(0);check('Three assist flags resolve CP HE',S().scene==='cp_HE');
  const heImages=[];for(let i=0;i<6;i++){await wait();const img=document.querySelector('.cp-novel-art img');heImages.push(img?.getAttribute('src'));check('HE page art is visible '+(i+1),!!img&&img.complete&&img.naturalWidth>0&&img.getBoundingClientRect().width>0);if(i<5)await action('page');}
  check('HE uses six distinct page illustrations including the kiss',new Set(heImages).size===6&&heImages[3].endsWith('/cp_HE_page4.webp')&&state.memories.includes('cp7_cp_HE_page4'));
  await choose(0);check('CP ending completes with its generated memorial art',S().scene==='complete'&&!$('modalBackdrop').hidden&&state.memories.includes('cp7_cp_HE'));closeModal(false);
  setup();Object.assign(state.chronicle.run,{level:6,flags:{feiSide:1,baoFeiPractice:1,yangcun:1}});await action('picker');check('Yangcun band path stays independent from CP route',document.querySelector('[data-cp-person="baoshi_feihong"]').disabled&&document.querySelector('#modalContent').textContent.includes('羊村乐队线为独立路线'));closeModal(false);await forged('personal-select',{cpPerson:'baoshi_feihong'});check('Band path cannot directly enter CP route',!P().active);
  setup();Object.assign(state.chronicle.run,{level:6,flags:{feiSide:1,strGroup:1}});await select('shiyuan');S().flags.syFriend=true;P().rev++;renderGlobal();await select('baoshi_feihong');S().score=93;S().flags={cpReady:true,push1:true,push2:true,push3:true};S().done=Object.fromEntries(PERSONAL_ROUTES.baoshi_feihong.nodes.filter(n=>!n.sub&&!n.ending).map(n=>[n.id,true]));S().scene='hub';P().rev++;renderGlobal();check('Low final banner never falls into Yangcun placeholder',document.querySelector('#cpMain').textContent.includes('还差 2 点大旗值')&&!document.querySelector('#cpMain').textContent.includes('羊村线待续'));await action('support');check('Final support resolves CP ending',S().scene==='cp_HE');
  P().active=false;Object.assign(state.chronicle.run,{scene:'menu',level:5,flags:{feiSide:1,c4bao:1}});state.chronicle.run.rev++;renderGlobal();await click('[data-cp-action="ensemble"]');await click('[data-cp-action="partner"][data-cp-person="baoshi_feihong"]');
  const random=Math.random;Math.random=()=>0;while(state.chronicle.run.scene==='practice_turn')await click('[data-cp-action="battle"][data-cp-battle="stable"]');Math.random=random;
  check('Baoshi and Feihong duo rehearsal records route and raises band',state.chronicle.run.flags.baoFeiPractice&&state.chronicle.run.level===6);
  setup(100);await select('shiyuan');go('sy_i3');save();
  window.personalTest={setup,select,go};
  return out;
 });
 await page.reload();assert(await page.evaluate(()=>state.chronicle.personal.active&&state.chronicle.personal.routes.shiyuan.scene==='sy_i3'),'Actual browser refresh preserves progress');
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:1000});
  await page.evaluate(()=>{closeModal(false);route('chronicle');});
  await page.screenshot({path:'/tmp/hjm-personal-'+width+'.png',fullPage:true});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Personal reader overflow '+width+' doc='+await page.evaluate(()=>document.documentElement.scrollWidth)+' '+JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+.5).map(e=>({cls:e.className,right:e.getBoundingClientRect().right})).slice(0,40))));
  await page.screenshot({path:'/tmp/hjm-personal-'+width+'.png',fullPage:true});
 }
 const assets=await page.evaluate(()=>[...PERSONAL_NODES.filter(n=>n.asset).map(n=>ASSETS[n.asset]),...PERSONAL_PAGE_ART.map(a=>ASSETS[a.asset])]);
 assert.equal(new Set(assets).size,183,'Unique per-dialogue-page assets');
 if(!process.env.PERSONAL_SKIP_ART)for(const asset of assets)assert(fs.existsSync(path.resolve(__dirname,'..',asset)),asset);
 assert.deepEqual(errors,[],'Runtime errors');
 console.log(`PASS: ${checks.length} personal route graph/behavior checks, full HE/TE/BE paths, actual refresh and four widths.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
