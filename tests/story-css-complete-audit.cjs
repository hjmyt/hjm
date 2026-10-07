const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
  await page.locator('[data-music-enter-muted]').click();
  await page.evaluate(()=>{
   window.__cssReset=()=>{state=freshState();state.sound=false;Chronicle.closeLibrary();route('chronicle');};
   window.__cssPersonalRun=scene=>({scene,page:0,flags:{},done:{},resume:null,resumePage:0,read:[],ending:null,endings:[],run:1,duets:2,chatIndex:0,focus:0,score:10,dang:0,previewed:null,reply:'',month:0,aff:{},chatSpent:{},chatContacts:{},chatSeen:{},chatReactions:{},chatMessage:null});
   window.__cssFusion=()=>{state=freshState();state.sound=false;state.cards.encounters.push('jerry');state.cards.collection.jerry.owned=true;state.affinity.jerry=25;syncUnifiedBonds(state);state.fusion.invited=true;};
  });

  const cases=[
   ['library-main',()=>{state=freshState();state.sound=false;route('chronicle');Chronicle.openLibrary('main');},'.story-library'],
   ['library-personal',()=>{state=freshState();state.sound=false;state.coins=420;route('chronicle');Chronicle.openLibrary('personal');},'.story-personal-list'],
   ['library-fusion',()=>{__cssFusion();route('fusion');renderFusion();},'.fusion-chapters'],
   ['enrollment',()=>{__cssReset();state.chronicle.run.scene='start';state.chronicle.run.rev++;renderGlobal();},'.cp-form'],
   ['week-dashboard',()=>{__cssReset();Object.assign(state.chronicle.run,{scene:'menu',name:'小音'});state.chronicle.run.rev++;renderGlobal();},'.story-week'],
   ['contacts',()=>{__cssReset();Object.assign(state.chronicle.run,{scene:'chat_select',name:'小音'});state.chronicle.run.rev++;renderGlobal();},'.story-contacts'],
   ['illustrated-reader',()=>{__cssReset();Object.assign(state.chronicle.run,{scene:'s_room',name:'小音',inst:'小提琴'});state.chronicle.run.rev++;renderGlobal();},'.cp-novel-illustrated'],
   ['text-zhu',()=>{__cssReset();const run=state.chronicle.run;Object.assign(run,{chapter:2,ch:2,name:'小音',scene:'zhu_reply',week:1});run.bar={closed:false,order:'decline',returnTo:'c2_intro',closureSeen:false};run.rev++;renderGlobal();},'.cp-novel-text-only'],
   ['text-yangcun',()=>{__cssReset();const run=state.chronicle.run;Object.assign(run,{chapter:2,ch:2,name:'小音',scene:'c2_yangcun',week:1});run.flags.bandGroup=1;run.flags.yangcun=1;run.rev++;renderGlobal();},'.cp-novel-text-only'],
   ['partner-picker',()=>{__cssReset();const run=state.chronicle.run;Object.assign(run,{scene:'practice_partner',name:'小音'});run.battle=null;run.rev++;renderGlobal();},'.cp-partner-picker'],
   ['shanqiu-menu',()=>{__cssReset();const run=state.chronicle.run;Object.assign(run,{scene:'zhu_offer',name:'小音'});run.bar={closed:false,order:null};run.rev++;renderGlobal();},'.shanqiu-menu'],
   ['shanqiu-menu-no-art',()=>{__cssReset();const run=state.chronicle.run;Object.assign(run,{chapter:4,ch:4,scene:'zhu_offer',name:'小音',week:1});run.bar={closed:true,order:null,returnTo:'c4_intro',closureSeen:true};run.rev++;renderGlobal();},'.shanqiu-menu'],
   ['training',()=>{__cssReset();const run=state.chronicle.run;Object.assign(run,{scene:'training',name:'小音'});run.weekly.trainingWeek=1;run.weekly.training[1]={round:0,points:0,phase:'ready',score:0,step:0,correct:0,message:''};economy().training['1:1']={paid:true,gain:0};run.rev++;renderGlobal();},'.cp-training-player'],
   ['battle',()=>{__cssReset();const run=state.chronicle.run;Object.assign(run,{scene:'practice_turn',name:'小音'});run.battle={context:'weekly',partner:'lala',round:1,hp:12,maxHp:12,pressure:10,over:false,last:'首席举起笔，准备记下你们的第一句。'};run.rev++;renderGlobal();},'.cp-battle-board'],
   ['performance',()=>{__cssReset();const run=state.chronicle.run;Object.assign(run,{scene:'live_play',name:'小音'});run.live={scores:[10,6],score:16,diff:35,pos:48,dir:1,phase:'ready',last:'',finished:false,width:24};run.rev++;renderGlobal();},'.cp-live-score'],
   ['performance-result',()=>{__cssReset();const run=state.chronicle.run;Object.assign(run,{chapter:2,ch:2,scene:'live_result',name:'小音',ending:'c2_dual',week:6,tech:18,level:5});run.live={scores:[6,10,10,10,10],score:46,diff:18};run.rev++;renderGlobal();},'.cp-surface:has(>.cp-speaker):has(>.cp-ending-hero)'],
   ['main-ending',()=>{__cssReset();state.chronicle.completedChapters=[1,2,3,4,5,6];Object.assign(state.chronicle.run,{chapter:6,ch:6,name:'小音',inst:'小提琴',scene:'title7',ending:'c6_he',week:6,tech:24,level:6,live:{scores:[10,10,10,10,10],score:50,diff:24}});state.chronicle.endings=['c6_he'];renderGlobal();},'.cp-ending-hero'],
   ['personal-hub',()=>{__cssReset();const p=state.chronicle.personal;p.active=true;p.selected='azhe';p.unlocks.azhe=true;p.routes.azhe=__cssPersonalRun('hub');renderGlobal();},'.cp-personal-hub'],
   ['personal-reader',()=>{__cssReset();const p=state.chronicle.personal;p.active=true;p.selected='azhe';p.unlocks.azhe=true;p.routes.azhe=__cssPersonalRun('azhe_01');renderGlobal();},'.cp-personal-novel'],
   ['personal-ending',()=>{__cssReset();const p=state.chronicle.personal;p.active=true;p.selected='azhe';p.unlocks.azhe=true;p.routes.azhe=__cssPersonalRun('complete');p.routes.azhe.ending='azhe_HE';p.routes.azhe.endings=['azhe_HE'];renderGlobal();},'.cp-personal-complete'],
   ['yangcun-chat',()=>{__cssReset();const p=state.chronicle.personal;p.active=true;p.selected='yangcun';p.storyUnlocks.yangcun=true;p.routes.yangcun=__cssPersonalRun('chat');p.routes.yangcun.chatContacts={goose:true,dayang:true,xiaota:true,rek:true,baoshi:true,feihong:true};renderGlobal();},'.cp-yc-chat'],
   ['chapter-seven-reader',()=>{__cssReset();state.chronicle.completedChapters=[1,2,3,4,5,6];state.chronicle.chapterSeven={active:true,scene:'q_start',page:0,flags:{},done:{},read:[],ending:null,endings:[],run:1,unity:0,qiqi:0,azhe:0,rev:0,previewed:null};renderGlobal();},'.cp-chapter-seven .cp-novel'],
   ['chapter-seven-ending',()=>{__cssReset();state.chronicle.completedChapters=[1,2,3,4,5,6,7];state.chronicle.chapterSeven={active:true,scene:'q_badloan',page:0,flags:{},done:{q_badloan:true},read:[],ending:'q_badloan',endings:['q_badloan'],run:1,unity:0,qiqi:0,azhe:0,rev:1,previewed:'q_badloan'};renderGlobal();},'.cp-personal-complete'],
   ['fusion-reader',()=>{__cssFusion();state.fusion.chapter='rl';route('fusion');renderFusion();},'#fusionMain .cp-novel'],
   ['fusion-ep2-chat',()=>{__cssFusion();state.fusion.chapter='ep2';state.fusion.runs.ep2.flags.chatHub=true;route('fusion');renderFusion();},'#fusionMain .cp-novel-chat'],
   ['fusion-fm-chat',()=>{__cssFusion();state.fusion.chapter='fm';state.fusion.runs.fm.flags.poolHub=true;route('fusion');renderFusion();},'#fusionMain .cp-novel-chat'],
   ['fusion-ending',()=>{__cssFusion();state.fusion.chapter='rl';Object.assign(state.fusion.runs.rl,{ended:true,ending:'fs_08',done:['fs_01','fs_02','fs_08'],chatTotal:2,read:['fs_01']});route('fusion');renderFusion();},'.fusion-ending']
  ];
  const viewports=[[320,568],[390,844],[768,1100],[901,1000],[1440,1000]];
  let checks=0;

  for(const [width,height] of viewports){
   await page.setViewportSize({width,height});
   for(const [name,setup,selector] of cases){
    await page.evaluate(setup);
    await page.locator(selector).waitFor();
    await page.evaluate(()=>{document.querySelectorAll('#toastStack .toast').forEach(node=>node.remove());scrollTo({top:0,behavior:'instant'});});
    await page.waitForFunction(()=>[...document.querySelectorAll('.view:not([hidden]) img')].every(img=>img.complete));
    const audit=await page.evaluate(({selector,name})=>{
     const target=document.querySelector(selector),rect=target.getBoundingClientRect(),nav=document.querySelector('.main-nav'),navRect=nav.getBoundingClientRect(),toolbar=document.querySelector('.view:not([hidden]) .story-reader-toolbar');
     const visible=node=>{const s=getComputedStyle(node),r=node.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>0&&r.width>0&&r.height>0;};
     const rgba=value=>{const match=value.match(/rgba?\(([^)]+)\)/);if(!match)return null;const values=match[1].split(/[ ,/]+/).filter(Boolean).map(Number);return {r:values[0],g:values[1],b:values[2],a:values[3]??1};};
     const luminance=color=>{const values=[color.r,color.g,color.b].map(value=>{const n=value/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;});return values[0]*.2126+values[1]*.7152+values[2]*.0722;};
     const contrast=(foreground,background)=>{const fg=rgba(foreground),raw=rgba(background);if(!fg||!raw)return null;const bg={r:raw.r*raw.a+255*(1-raw.a),g:raw.g*raw.a+255*(1-raw.a),b:raw.b*raw.a+255*(1-raw.a)};const a=luminance(fg),b=luminance(bg);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);};
     const broken=[...document.querySelectorAll('.view:not([hidden]) img')].filter(img=>visible(img)&&(!img.complete||!img.naturalWidth)).map(img=>img.alt||img.src);
     const stage=document.querySelector('.view:not([hidden]) .cp-novel'),dialogue=stage?.querySelector('.cp-novel-dialogue'),art=stage?.querySelector('.cp-novel-art img'),copy=dialogue?.querySelector('.cp-text');
     const stageRect=stage?.getBoundingClientRect(),dialogueRect=dialogue?.getBoundingClientRect(),artRect=art?.getBoundingClientRect();
     const toolbarStyle=toolbar?getComputedStyle(toolbar):null,toolbarRect=toolbar?.getBoundingClientRect();
     const mainEnding=document.querySelector('#cpMain>.cp-surface:has(>.cp-ending-hero[style])'),fusionEnding=document.querySelector('#fusionMain>.fusion-ending'),ending=mainEnding||fusionEnding,endingVisual=mainEnding?.querySelector(':scope > .cp-ending-hero')||fusionEnding?.querySelector('.fusion-ending-visual');
     const endingRect=ending?.getBoundingClientRect(),endingVisualRect=endingVisual?.getBoundingClientRect();
     const menu=document.querySelector('.shanqiu-menu'),decline=menu?.querySelector('.shanqiu-decline'),caption=menu?.querySelector('.cp-caption');
     const chat=stage?.querySelector('.fusion-chat'),chatHeading=chat?.querySelector('.fusion-chat-heading h3'),chatRect=chat?.getBoundingClientRect(),lastChatChoice=chat?.querySelector('.fusion-chat-grid .cp-choice:last-child');
     if(chat)chat.scrollTop=chat.scrollHeight;
     const lastChatBottom=lastChatChoice?.getBoundingClientRect().bottom,chatScrollRange=chat?chat.scrollHeight-chat.clientHeight:0;
     if(chat)chat.scrollTop=0;
     return {
      name,viewport:{width:innerWidth,height:innerHeight},target:{left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,width:rect.width,height:rect.height},
      documentWidth:document.documentElement.scrollWidth,nav:{display:getComputedStyle(nav).display,position:getComputedStyle(nav).position,top:navRect.top,bottom:navRect.bottom},broken,
      toolbar:toolbar&&visible(toolbar)?{height:toolbarRect.height,top:toolbarRect.top,bottom:toolbarRect.bottom,background:toolbarStyle.backgroundColor}:null,
      stage:stage&&visible(stage)?{position:getComputedStyle(stage).position,top:stageRect.top,bottom:stageRect.bottom,height:stageRect.height,illustrated:stage.classList.contains('cp-novel-illustrated'),dialogue:dialogueRect&&{top:dialogueRect.top,bottom:dialogueRect.bottom,left:dialogueRect.left,right:dialogueRect.right,maxHeight:getComputedStyle(dialogue).maxHeight,scrolls:dialogue.scrollHeight>dialogue.clientHeight+1},art:artRect&&{top:artRect.top,bottom:artRect.bottom},bodyOverflow:getComputedStyle(document.body).overflow,bodyOverflowX:getComputedStyle(document.body).overflowX,bodyOverflowY:getComputedStyle(document.body).overflowY,bodyView:document.body.dataset.view,lockSelectorMatch:document.body.matches('body:is([data-view="chronicle"],[data-view="fusion"]):has(.cp-novel-text-only):not(:has(.cp-novel-text-only .cp-form))'),copyContrast:copy?contrast(getComputedStyle(copy).color,getComputedStyle(dialogue).backgroundColor):null}:null,
      ending:ending?{bottom:endingRect.bottom,visualTop:endingVisualRect.top,visualBottom:endingVisualRect.bottom,toolbarOverlap:toolbarRect?Math.min(toolbarRect.bottom,endingVisualRect.bottom)-Math.max(toolbarRect.top,endingVisualRect.top):0}:null,
      chat:chat?{top:chatRect.top,bottom:chatRect.bottom,headingContrast:chatHeading?contrast(getComputedStyle(chatHeading).color,getComputedStyle(chat).backgroundColor):null,headingLines:chatHeading?chatHeading.getBoundingClientRect().height/parseFloat(getComputedStyle(chatHeading).lineHeight):null,scrollRange:chatScrollRange,lastChoiceReachable:!lastChatChoice||lastChatBottom<=chatRect.bottom-48}:null,
      menu:menu?(()=>{const panel=menu.closest('.cp-novel-dialogue'),panelRect=panel.getBoundingClientRect(),data={rows:menu.querySelectorAll('.shanqiu-drink').length,panelTop:panelRect.top,panelBottom:panelRect.bottom,menuBackground:getComputedStyle(menu).backgroundColor,menuBorder:getComputedStyle(menu).borderTopWidth,declineBottom:decline?.getBoundingClientRect().bottom,captionBottom:caption?.getBoundingClientRect().bottom,panelScrolls:panel.scrollHeight>panel.clientHeight+1,gap:menu.querySelector('.shanqiu-menu-head')?.getBoundingClientRect().top-menu.querySelector('.cp-text')?.getBoundingClientRect().bottom};panel.scrollTop=panel.scrollHeight;data.lastReachable=caption.getBoundingClientRect().bottom<=panelRect.bottom-8;panel.scrollTop=0;return data;})():null
     };
    },{selector,name});
    assert(audit.documentWidth<=width+1,`${name} has no horizontal overflow at ${width}×${height}: ${JSON.stringify(audit)}`);
    assert(audit.target.left>=-1&&audit.target.right<=width+1&&audit.target.top<height,`${name} starts inside ${width}×${height}: ${JSON.stringify(audit)}`);
    assert.deepEqual(audit.broken,[],`${name} has no broken visible image at ${width}×${height}`);
    if(width<=900&&audit.nav.display==='none'){assert(audit.target.top<height,`${name} reader remains visible after hiding navigation`);}
    else if(width<=900){assert.equal(audit.nav.position,'fixed',`${name} keeps the seven-item navigation fixed outside reading at ${width}px`);assert(Math.abs(audit.nav.bottom-height)<=1,`${name} navigation touches the viewport bottom at ${width}px`);}
    else assert.notEqual(audit.nav.position,'fixed',`${name} uses the desktop header navigation at ${width}px`);
    if(audit.toolbar){assert(audit.toolbar.height<=(width<=900?60:72),`${name} toolbar remains compact: ${JSON.stringify(audit.toolbar)}`);assert.equal(audit.toolbar.background,'rgba(0, 0, 0, 0)',`${name} toolbar has no detached full-width card`);}
    if(audit.stage&&width<=900&&name!=='yangcun-chat'){assert.equal(audit.stage.position,'fixed',`${name} reader stays on one screen at ${width}px`);assert(audit.stage.bottom<=height+1&&audit.stage.bottom>=height-1,`${name} reader fills the viewport after navigation is hidden: ${JSON.stringify(audit)}`);assert.equal(audit.stage.bodyOverflow,'hidden',`${name} reader locks document scrolling`);if(audit.stage.dialogue){assert(audit.stage.dialogue.left>=-1&&audit.stage.dialogue.right<=width+1&&audit.stage.dialogue.bottom<=audit.stage.bottom+1,`${name} dialogue remains inside its stage: ${JSON.stringify(audit.stage.dialogue)}`);if(audit.stage.illustrated&&!audit.menu)assert.equal(audit.stage.dialogue.maxHeight,'76%',`${name} uses the larger dialogue height after hiding navigation`);assert(audit.stage.copyContrast===null||audit.stage.copyContrast>=4.5,`${name} dialogue copy keeps readable contrast: ${JSON.stringify(audit.stage)}`);}if(audit.stage.art&&name.includes('reader'))assert(audit.stage.dialogue.top<audit.stage.art.bottom,`${name} dialogue overlays the scene rather than leaving a blank band`);}
    if(audit.ending&&audit.toolbar)assert(audit.ending.toolbarOverlap>=28,`${name} toolbar is integrated with the ending visual: ${JSON.stringify(audit.ending)}`);
    if(audit.chat&&width<=900){assert.equal(audit.nav.display,'none',`${name} uses the whole reader viewport`);assert(audit.chat.top<=height*.23&&audit.chat.bottom>=height-16,`${name} contact sheet uses the space above the bottom edge: ${JSON.stringify(audit.chat)}`);assert(audit.chat.headingContrast>=4.5,`${name} heading stays readable on the sheet: ${JSON.stringify(audit.chat)}`);if(width<=390)assert(audit.chat.scrollRange>=48,`${name} has room to swipe the last contact clear of mobile browser controls: ${JSON.stringify(audit.chat)}`);if(width>=390)assert(audit.chat.headingLines<1.2,`${name} heading fits one line at standard phone widths: ${JSON.stringify(audit.chat)}`);assert(audit.chat.lastChoiceReachable,`${name} final contact clears the bottom edge after scrolling: ${JSON.stringify(audit.chat)}`);}
    if(name==='fusion-ep2-chat'&&width===390)await page.screenshot({path:'/tmp/hjm-fusion-chat-mobile.png'});
    if(audit.menu){assert.equal(audit.menu.rows,5,`${name} renders four drinks plus the numbered refusal option`);assert(audit.menu.gap>=8,`${name} separates story copy from the menu header: ${JSON.stringify(audit.menu)}`);if(width<=900){assert(audit.menu.panelBottom>=height-20,`${name} menu reaches the reader bottom: ${JSON.stringify(audit.menu)}`);assert(audit.menu.lastReachable,`${name} can scroll to the final choice and rules at ${width}×${height}: ${JSON.stringify(audit.menu)}`);if(name==='shanqiu-menu-no-art'){assert(audit.menu.panelTop<=height*.2,`${name} uses the upper space for the unillustrated menu: ${JSON.stringify(audit.menu)}`);assert.equal(audit.menu.menuBackground,'rgba(0, 0, 0, 0)',`${name} avoids a nested menu card`);assert.equal(audit.menu.menuBorder,'0px',`${name} avoids a nested menu border`);}if(height>=800){assert(!audit.menu.panelScrolls,`${name} shows all five choices without dragging at normal phone heights: ${JSON.stringify(audit.menu)}`);assert(audit.menu.captionBottom<=height+1&&audit.menu.declineBottom<=height+1,`${name} keeps menu rules and option 05 inside the viewport: ${JSON.stringify(audit.menu)}`);}}}
    checks++;
   }
  }
  const touchPage=await browser.newPage({viewport:{width:320,height:568},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  await touchPage.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
  await touchPage.locator('[data-music-enter-muted]').click();
  const touchClient=await touchPage.context().newCDPSession(touchPage);
  for(const height of [480,568]){
   await touchPage.setViewportSize({width:320,height});
   await touchPage.evaluate(()=>{state=freshState();state.sound=false;state.cards.encounters.push('jerry');state.cards.collection.jerry.owned=true;state.affinity.jerry=25;syncUnifiedBonds(state);state.fusion.invited=true;state.fusion.chapter='ep2';state.fusion.runs.ep2.flags.chatHub=true;route('fusion');renderFusion();});
   for(let swipeCount=0;swipeCount<2;swipeCount++){
    await touchClient.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:160,y:height-94}]});
    for(let y=height-130;y>=138;y-=42){await touchClient.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:160,y}]});await touchPage.waitForTimeout(18);}
    await touchClient.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   }
   await touchPage.waitForTimeout(250);
   const swipe=await touchPage.evaluate(()=>{const sheet=document.querySelector('.fusion-chat'),last=sheet.querySelector('.fusion-chat-grid .cp-choice:last-child'),sheetRect=sheet.getBoundingClientRect(),lastRect=last.getBoundingClientRect();return {scrollTop:sheet.scrollTop,lastBottom:lastRect.bottom,sheetBottom:sheetRect.bottom,lastName:last.dataset.fusionChat};});
   assert(swipe.scrollTop>40,`finger swipe scrolls the contact sheet on a 320×${height} phone: ${JSON.stringify(swipe)}`);
   assert(swipe.lastBottom<=swipe.sheetBottom-48,`last contact clears the mobile browser toolbar after swiping on 320×${height}: ${JSON.stringify(swipe)}`);
   await touchPage.locator('.fusion-chat-grid .cp-choice:last-child').tap();
   assert.equal(await touchPage.evaluate(name=>state.fusion.runs.ep2.chats[name],swipe.lastName),1,`last contact remains tappable after swiping on 320×${height}`);
  }
  await touchPage.close();
  assert.deepEqual(errors,[]);
  console.log(`PASS story CSS complete audit: ${checks} state/viewport combinations across 27 story surfaces and five responsive widths, plus 320×480/568 touch scrolling.`);
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
