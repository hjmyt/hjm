const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
 const result=await page.evaluate(()=>{
  const checks=[],check=(name,ok)=>{if(!ok)throw Error(name);checks.push(name);};
  const scene=(ch,id,extra={})=>{closeModal(false);state=freshState();state.sound=false;state.chronicle.completedChapters=[1,2,3];Object.assign(state.chronicle.run,{chapter:ch,ch,name:'对话检查',inst:'长笛',scene:id,tech:20,level:3,...extra});save();route('chronicle');LalaUI.recap=false;};
  const voices=()=>[...document.querySelectorAll('#cpMain [data-speaker]')].map(e=>e.dataset.speaker).join(',');
  const expected={
   1:{s_door:'lala',s_room:'lala',s_look:'lala',s_shi:'shiyuan',s_dream:'shiyuan',s_first:'kongge',s_conflict:'feihong',s_fei1:'feihong',s_fei2:'feihong',s_endweek:'narrator',gig:'shiyuan',emo:'dijie',live_intro:'shiyuan',be_shiyuan:'narrator'},
   2:{c2_intro:'narrator',c2_bar:'narrator',c2_tim:'tim',c2_tim_a:'tim,tangshao',c2_tim_b:'tim',c2_tim_c:'tim',c2_night_pre:'jerry',c2_night:'narrator',c2_str:'narrator',c2_pop_end:'xiaojie',c2_head:'crowd,azhe',c2_head_a:'azhe',c2_head_b:'tim',c2_head_c:'azhe',c2_kong:'kongge',c2_kong_a:'kongge',c2_kong_b:'kongge',c2_kong_c:'kongge',c2_endweek:'narrator',c2_sponsor:'narrator',c2_boundary:'tim',c2_bill:'shiyuan',live_intro:'shiyuan',be_shiyuan:'narrator'},
   3:{c3_intro:'qiqi',c3_prep:'narrator',c3_prep_a:'lemon',c3_prep_b:'xiaozhou',c3_prep_c:'narrator',c3_ge:'narrator',c3_ge_a:'shiyuan',c3_ge_b:'goose',c3_ge_c:'narrator',c3_bill:'shiyuan',c3_bill_a:'shiyuan',c3_bill_b:'bill,shiyuan',c3_menu:'narrator',c3_jeal:'qiqi',c3_jeal_a:'shiyuan',c3_jeal_b:'qiqi',c3_jeal_c:'qiqi',c3_band_q:'qiqi',c3_band_zhou:'xiaozhou',c3_band_bill:'shiyuan',band_q_a:'qiqi',band_q_b:'narrator',band_zhou_a:'xiaozhou',band_zhou_b:'xiaozhou',band_bill_a:'shiyuan',band_bill_b:'kongge',c3_he:'qiqi',c3_te:'narrator',c3_fail:'shiyuan',be_qiqi:'narrator',live_intro:'shiyuan',be_shiyuan:'narrator'},
   4:{c4_intro:'yeshiyang',c4_prep:'dayang',c4_prep_a:'dayang',c4_prep_b:'dayang',c4_prep_c:'shiyuan',c4_bao:'feihong,baoshi',c4_bao_a:'baoshi',c4_bao_b:'feihong',c4_qiqi:'qiqi',c4_qiqi_a:'shiyuan,qiqi',c4_qiqi_b:'qiqi',c4_qiqi_c:'lala',c4_menu:'narrator',c4_jeal:'qiqi',c4_jeal_a:'shiyuan',c4_jeal_b:'qiqi',c4_jeal_c:'qiqi',c4_band_lemon:'lemon',c4_band_zhou:'xiaozhou',c4_band_bao:'baoshi',b4_lemon_a:'lemon',b4_lemon_b:'lemon',b4_zhou_a:'xiaozhou',b4_zhou_b:'xiaozhou',b4_bao_a:'baoshi',b4_bao_b:'baoshi',c4_he:'narrator',c4_te:'narrator',c4_fail:'shiyuan',be_qiqi4:'narrator',be_mianbei:'narrator',live_intro:'shiyuan',be_shiyuan:'narrator'}
  };
  for(const [ch,cases] of Object.entries(expected))for(const [id,wanted] of Object.entries(cases)){
   scene(+ch,id);check(ch+':'+id+' speakers '+wanted,voices()===wanted);
   for(const el of document.querySelectorAll('#cpMain [data-speaker]')){
    const id=el.dataset.speaker,c=cardDef(id==='tangshao'?'tang':id),img=el.querySelector('img');
    check(ch+':'+id+' correct portrait',c?img?.getAttribute('src')===ASSETS[c.asset]:!img);
   }
   const e=state.chronicle.run.journal.at(-1),text=e.text;check(ch+':'+id+' journal names',Chronicle.journalSpeaker({...e,who:'lala'},state.chronicle.run)===[...document.querySelectorAll('#cpMain [data-speaker] b')].map(e=>e.textContent).join(' / '));check('Journal content unchanged',e.text===text);
  }
  for(let ch=1;ch<=4;ch++){
   for(const win of [false,true]){scene(ch,'after_practice',{battle:{win}});check(ch+' practice '+win,voices()===(ch===1?win?'kongge,dijie':'azhe':ch===2?win?'tim':'azhe':'kongge'));}
   for(const tech of [0,30]){scene(ch,'b_live',{tech});check(ch+' stage gate '+tech,voices()===(tech?'narrator':'kongge'));}
   for(const c of CARD_DEFS.filter(c=>!['orange'].includes(c.id))){const id=c.id==='tang'?'tangshao':c.id;scene(ch,'chat',{chat:id});check(ch+' chat '+id,voices()===id);}
  }
  scene(2,'c2_kong_c',{flags:{konggeStay:1}});check('Successful joint discussion','shiyuan,kongge'===voices());
  scene(4,'c4_prep');const old=state.chronicle.run.journal.at(-1);old.who='lala';const before=JSON.stringify(state.chronicle);
  check('Old journal corrects Dayang',Chronicle.journalSpeaker(old,state.chronicle.run)==='大羊');check('Reading attribution does not change progress',JSON.stringify(state.chronicle)===before);
  showLalaJournal(4);check('Notebook displays corrected label',document.querySelector('.lala-journal-dialogue b').textContent==='大羊');check('Export displays corrected label',lalaJournalText(state.chronicle.run).includes('第 1 周 · 大羊'));closeModal(false);
  check('Guests not inserted into card pool',!CARD_DEFS.some(c=>['jerry','xiaojie','narrator','crowd'].includes(c.id)));
  save();return {count:checks.length,scenes:Object.values(expected).reduce((n,v)=>n+Object.keys(v).length,0)};
 });
 await page.reload();await page.evaluate(()=>route('chronicle'));assert.equal(await page.locator('#cpMain [data-speaker]').first().getAttribute('data-speaker'),'dayang');
 await page.locator('#cpMain').screenshot({path:'/tmp/hjm-dayang-speaker.png'});
 await page.setViewportSize({width:390,height:844});
 for(const [ch,id] of [[1,'after_practice'],[2,'c2_tim_a'],[2,'c2_head'],[2,'c2_kong_c'],[3,'c3_bill_b'],[4,'c4_bao'],[4,'c4_qiqi_a']]){
  await page.evaluate(([ch,id])=>{Object.assign(state.chronicle.run,{chapter:ch,ch,scene:id,battle:{win:true},flags:{konggeStay:1},rev:state.chronicle.run.rev+1});renderGlobal();},[ch,id]);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),id+' mobile overflow');
 }
 await page.locator('#cpMain').screenshot({path:'/tmp/hjm-multiple-speakers-mobile.png'});
 assert.deepEqual(errors,[]);console.log(`PASS: ${result.count} attribution checks across ${result.scenes} authored scenes, dynamic branches, all character chats, journal, reload and mobile.`);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
