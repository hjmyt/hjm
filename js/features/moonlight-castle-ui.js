'use strict';
const CastleUI = (() => {
  let started=false, focusedNpc=null, renderedPeople='', lastArt='', lastPreload='', restoring=false;
  let drawer=null, chasePointer=null, lastNarrativeView='';
  let scenePan=0,scenePanY=0,scenePanLimit=0,scenePanYLimit=0,scenePanKey='',sceneOverview=false,sceneZoom=1,sceneZoomMin=.25,panPointer=null,suppressSceneClickUntil=0;
  const scenePointers=new Map();
  let notes=[], hints={}, elapsedBase=0, enteredAt=0, saveTimer=0, loaded=null, dirty=false, suppressSave=false;
  const el=id=>document.getElementById(id);
  const painted={};
  function paint(id,html){if(painted[id]===html)return;painted[id]=html;el(id).innerHTML=html;}
  const art=id=>'assets/moonlight-castle/'+id+'.webp';
  function outcomeArt(id,key){
    const image=el(id),entry=CASTLE_OVERLAY_ART[key];
    if(!image||!entry||image.dataset.artId===entry.id)return;
    image.dataset.artId=entry.id;image.src=entry.asset;image.alt=entry.alt;
    image.closest('figure').style.setProperty('--outcome-art','url("'+entry.asset+'")');
  }
  function modalArt(key){
    const entry=CASTLE_OVERLAY_ART[key];if(!entry)return '';
    return '<figure class="modal-story-art" data-art-id="'+entry.id+'"><img src="'+entry.asset+'" alt="'+escapeHTML(entry.alt)+'" fetchpriority="high"></figure>';
  }
  function phase(){return el('we-screen').classList.contains('active')?'wrong':el('ending-screen').classList.contains('active')?'ending':el('loop-transition').classList.contains('active')?'transition':'playing';}
  function elapsed(){return elapsedBase+(started?Math.max(0,CastleClock.now()-enteredAt):0);}
  function snapshot(){
    const game=JSON.parse(JSON.stringify({...G,usedItems:[...G.usedItems],countdown:{...G.countdown,timerId:null,remaining:G.countdown.active?Math.max(0,G.countdown.endTime-CastleClock.now()):0}}));
    return {version:1,game,phase:phase(),notes,hints,elapsed:elapsed(),mode:'scene',focusedNpc,dialogue:CastleDialogue.text,transition:{title:el('loop-title').textContent,text:el('loop-text').innerText},chase:G.adrianChasing?{mode:chaseMode,remaining:Math.max(0,(G.chaseDeadline||CastleClock.now()+5000)-CastleClock.now())}:null};
  }
  function persist(){
    if(!started||restoring||!dirty||suppressSave)return;
    dirty=false;
    if(!CastleSave.write(snapshot())) status('自动保存暂停。请导出进度后再关闭页面；现有存档不会被覆盖。',true);
  }
  function mark(){dirty=true;window.clearTimeout(saveTimer);saveTimer=window.setTimeout(persist,120);}
  function status(text,error=false){el('save-status').hidden=false;el('save-status').textContent=text;el('save-status').classList.toggle('error',error);}
  function note(text,horror){
    if(!started||restoring)return;
    const last=notes.at(-1);
    if(last?.text!==text){notes.push({text,room:CASTLE_ROOMS[G.currentRoom].name,loop:G.loop,horror});notes=notes.slice(-160);renderNotes();}
    mark();
  }
  function renderNotes(){
    el('notes-count').textContent=notes.length+' 条';
    paint('recent-notes',notes.slice(-3).reverse().map(n=>'<li><small>'+escapeHTML(n.room)+'</small>'+escapeHTML(n.text.slice(0,95))+(n.text.length>95?'…':'')+'</li>').join('')||'<li class="empty-note">调查物品后，线索会留在这里。</li>');
  }
  function avatar(npc){
    if(npc==='servants')return ['baoshi','feihong'].map(id=>'<img src="'+cardImage(cardDef(id),'avatar')+'" alt="'+escapeHTML(cardDef(id).name)+'">').join('');
    const card=cardDef(CASTLE_NPC_CARDS[npc]);return card?'<img src="'+cardImage(card,'avatar')+'" alt="">':'<span aria-hidden="true">☽</span>';
  }
  function castPosition(npc){
    const cast=CASTLE_ART[imageFor()]?.positions||[];
    const entry=cast.find(p=>p.id===CASTLE_NPC_CARDS[npc]);
    return entry||{x:50,y:45};
  }
  function frameLayout(){
    const area=el('scene-area');if(!area||!started)return;
    // Keep one set of controls and listeners when switching between phone and
    // desktop layouts. On phones they live in Settings, leaving the scene free.
    const toolsHome=window.matchMedia('(max-width:1000px)').matches?el('settings-game-tools'):document.querySelector('.castle-header');
    for(const node of [document.querySelector('.header-status'),el('castle-tools')]){
      if(node.parentElement!==toolsHome)toolsHome.append(node);
    }
    const dialogue=document.querySelector('.dialogue-panel').getBoundingClientRect();
    const container=el('game-container').getBoundingClientRect();
    document.documentElement.style.setProperty('--castle-scene-bottom',Math.max(0,container.bottom-dialogue.top+10)+'px');
    const box=area.getBoundingClientRect(),image=el('room-art'),ratio=image.naturalWidth/image.naturalHeight||4/3;
    const mobile=window.matchMedia('(max-width:1000px)').matches;
    const key=imageFor()+':'+box.width+':'+box.height+':'+mobile;
    if(key!==scenePanKey){scenePanKey=key;scenePan=scenePanY=0;sceneZoom=1;sceneOverview=false;panPointer=null;scenePointers.clear();}
    document.body.dataset.castleOverview=String(mobile&&sceneOverview);
    const overviewTop=mobile?64:0;
    const safeHeight=Math.max(64,(mobile&&sceneOverview?box.height-16:Math.min(box.height,dialogue.top-box.top-16))-overviewTop);
    const overviewHeight=Math.min(box.width/ratio,safeHeight);
    const defaultHeight=Math.max(box.height,box.width/ratio);
    sceneZoomMin=overviewHeight/defaultHeight;
    sceneZoom=Math.max(sceneZoomMin,Math.min(3,sceneZoom));
    const height=mobile?(sceneOverview?overviewHeight:defaultHeight*sceneZoom):Math.min(box.width/ratio,box.height);
    const width=height*ratio,centerY=mobile&&sceneOverview?overviewTop+safeHeight/2:box.height/2;
    scenePanLimit=mobile?Math.max(0,(width-box.width)/2):0;
    const subtitleClearance=Math.max(Math.min(box.height*.25,220),container.bottom-dialogue.top+16);
    scenePanYLimit=mobile&&!sceneOverview?Math.max(0,(height-box.height)/2)+subtitleClearance:0;
    const people=document.querySelector('.people-panel'),peopleHome=mobile?area:document.querySelector('.main-column');
    if(people.parentElement!==peopleHome)peopleHome.append(people);
    document.documentElement.style.setProperty('--castle-art-width',width+'px');
    document.documentElement.style.setProperty('--castle-art-height',height+'px');
    document.documentElement.style.setProperty('--castle-art-center-x',box.left+box.width/2+'px');
    document.documentElement.style.setProperty('--castle-art-center',box.top+box.height/2+'px');
    document.documentElement.style.setProperty('--castle-art-local-center-y',centerY+'px');
    el('scene-pan-controls').hidden=!mobile;
    el('scene-pan-tip').hidden=!mobile;
    el('scene-pan-tip').textContent=sceneOverview?'全景浏览 · 点击人物或物品继续':'拖动查看 · 双指缩放';
    el('scene-overview').textContent=sceneOverview?'放大':'全景';
    el('scene-overview').setAttribute('aria-label',sceneOverview?'放大场景':'查看完整场景');
    el('scene-overview').setAttribute('aria-pressed',String(sceneOverview));
    el('scene-zoom-in').disabled=!sceneOverview&&sceneZoom>=3;
    el('scene-zoom-out').disabled=sceneOverview||sceneZoom<=sceneZoomMin+.001;
    paintPan();
  }
  function paintPan(){
    scenePan=Math.max(-scenePanLimit,Math.min(scenePanLimit,scenePan));
    scenePanY=Math.max(-scenePanYLimit,Math.min(scenePanYLimit,scenePanY));
    document.documentElement.style.setProperty('--castle-pan-x',scenePan+'px');
    document.documentElement.style.setProperty('--castle-pan-y',scenePanY+'px');
    el('scene-pan-left').disabled=scenePan>=scenePanLimit-1;
    el('scene-pan-right').disabled=scenePan<=-scenePanLimit+1;
  }
  function viewZoom(){return sceneOverview?sceneZoomMin:sceneZoom;}
  function zoomScene(value){sceneOverview=false;sceneZoom=Math.max(sceneZoomMin,Math.min(3,value));frameLayout();}
  function setDrawer(name=null){
    drawer=drawer===name?null:name;
    document.body.dataset.castleDrawer=drawer||'';
    document.querySelectorAll('[data-castle-drawer]').forEach(b=>b.setAttribute('aria-expanded',String(b.dataset.castleDrawer===drawer)));
    if(drawer==='inventory')el('inventory').querySelector('button')?.focus({preventScroll:true});
  }
  function renderPeople(){
    const room=CASTLE_ROOMS[G.currentRoom],ids=G.nextMorning&&G.currentRoom==='hall'?['siyang','tim','servants','bingbing','dijie','jerry']:room.cast;
    el('people-tray').parentElement.classList.toggle('morning-cast',G.nextMorning&&G.currentRoom==='hall');
    const key=G.currentRoom+':'+ids.join(',')+':'+imageFor();
    if(key!==renderedPeople){
      renderedPeople=key;
      el('people-tray').innerHTML=ids.map(id=>'<button type="button" class="npc" id="npc-'+id+'" data-npc="'+id+'"><span class="npc-avatar">'+avatar(id)+'</span><span class="npc-name">'+escapeHTML(getNpcDisplayName(id))+'</span><span class="npc-talk">交谈 ↗</span></button>').join('');
    }
    for(const button of el('people-tray').querySelectorAll('[data-npc]')){
      const npc=button.dataset.npc,cast=CASTLE_ART[imageFor()]?.visibleCast||[];
      const position=castPosition(npc);
      button.style.setProperty('--cast-x',position.x+'%');
      button.style.setProperty('--cast-y',position.y+'%');
      button.classList.toggle('offscreen',npc==='servants'?!cast.includes('baoshi'):!cast.includes(CASTLE_NPC_CARDS[npc]));
    }
    refreshNpcNames();
    // Keep scene nameplates compact; the full identity stays in dialogue/roster.
    for(const button of el('people-tray').querySelectorAll('[data-npc]')){
      const id=button.dataset.npc,name=getNpcDisplayName(id),puzzle=NAME_PUZZLES[id];
      button.querySelector('.npc-name').textContent=puzzle&&(G.names[id]||G.loop>=2)?puzzle.real:name;
      button.setAttribute('aria-label',name+'，点击交谈');button.title=name;
    }
    paint('explore-people',ids.map(id=>'<button type="button" data-npc="'+id+'"><span>♧</span>'+escapeHTML(getNpcDisplayName(id))+'<small>交谈 ↗</small></button>').join(''));
  }
  function imageFor(){
    if(G.sunrise&&G.currentRoom==='tower')return 'dawn-exploration-v3';
    // Morning visitors use a roster; the room composition stays unchanged.
    return CASTLE_ROOMS[G.currentRoom].art;
  }
  function nextImages(){
    const room=CASTLE_ROOMS[G.currentRoom],targets=[];
    for(const exit of room.exits){if(canEnter(exit))targets.push(CASTLE_ROOMS[exit].art||exit);}
    const images=targets.filter(Boolean).map(art);
    if(G.loop===1&&G.flags.loop2_pending)images.push(CASTLE_OVERLAY_ART.loop2.asset);
    if(G.loop===2&&hasItem('assembled_letter'))images.push(CASTLE_OVERLAY_ART.loop3.asset);
    if(G.adrianChasing||G.countdown.active&&G.countdown.endTime-CastleClock.now()<30000)images.push(CASTLE_OVERLAY_ART.wrong.asset);
    const movement=el('modal-overlay').classList.contains('active')?el('modal-body').querySelector('[data-ending-movement]')?.dataset.endingMovement:null;
    if(['1','2','3'].includes(movement))images.push(CASTLE_OVERLAY_ART['ending'+movement].asset);
    return [...new Set(images)];
  }
  function canEnter(room){return castleDoorAccess(room).allowed;}
  function pathToRoom(target){
    if(target===G.currentRoom||!canEnter(target))return null;
    const queue=[[G.currentRoom]],seen=new Set([G.currentRoom]);
    while(queue.length){
      const path=queue.shift(),last=path.at(-1);
      for(const next of CASTLE_ROOMS[last].exits){
        if(seen.has(next)||!canEnter(next))continue;
        // The first visit to the tower starts a new cycle; it is not a corridor.
        if(last==='tower'&&G.loop===1)continue;
        const route=[...path,next];if(next===target)return route.slice(1);
        seen.add(next);queue.push(route);
      }
    }
    return null;
  }
  function mapNode(id,room){
    const current=id===G.currentRoom,route=pathToRoom(id),access=castleDoorAccess(id);
    const state=current?'current':route?'visited':'locked';
    const hint=current?'你在这里':route?route.length===1?(access.open?'点击进入':'用钥匙开启'):'经'+CASTLE_ROOMS[route[0]].name+'前往':access.allowed?'尚未连通':access.status;
    return '<button type="button" class="map-node '+state+'" data-travel="'+id+'" '+(!route?'disabled ':'')+(current?'aria-current="location" ':'')+'aria-label="'+escapeHTML(room.name+' · '+hint)+'"><i></i><span>'+escapeHTML(room.name)+'</span><small>'+escapeHTML(hint)+'</small></button>';
  }
  function renderDoors(){
    const doors=CASTLE_SCENE_DOORS[G.currentRoom]||[];
    const symbol='<svg viewBox="0 0 32 42" aria-hidden="true"><path d="M5 39V13a11 11 0 0 1 22 0v26M2 39h28M10 35V14a6 6 0 0 1 12 0v21"/><circle cx="19" cy="25" r="1"/></svg>';
    paint('scene-doors',doors.map(door=>{
      const access=castleDoorAccess(door.room),x=door.x,y=door.y;
      const side=x<30?'left':x>70?'right':'center';
      return '<button type="button" class="scene-door '+(access.allowed?'available':'locked')+' '+(access.open?'unlocked':'')+'" data-exit="'+door.room+'" data-side="'+side+'" style="left:'+x+'%;top:'+y+'%" aria-label="'+escapeHTML(door.label+' · '+access.status+(access.allowed?'，点击进入':''))+'">'+symbol+'<span><strong>'+escapeHTML(door.label)+'</strong><small>'+escapeHTML(access.allowed?(access.open?'点击进入':'用钥匙开启'):access.status)+'</small></span></button>';
    }).join(''));
  }
  function travelTo(target){
    const path=pathToRoom(target);if(!path)return;
    for(const next of path){
      action('exit',next);
      if(G.currentRoom!==next||G.adrianChasing||CastleClock.paused||phase()!=='playing')break;
    }
  }
  function renderScene(){
    const room=CASTLE_ROOMS[G.currentRoom],image=imageFor();
    el('room-heading').textContent=room.name;el('room-kicker').textContent=G.sunrise?'AFTER THE SUNRISE':room.subtitle;
    if(image!==lastArt){lastArt=image;el('room-art').src=art(image);el('atmosphere-art').src=art(image);
      el('scene-area').classList.remove('scene-arrival');void el('scene-area').offsetWidth;el('scene-area').classList.add('scene-arrival');el('room-art').alt=room.name+' · '+(CASTLE_ART[image]?.visibleCast.map(id=>cardDef(id)?.name||id).join('、')||'古堡环境')+' · 人物与物品同场探索';
    }
    const preload=nextImages();
    if(preload.join('|')!==lastPreload){lastPreload=preload.join('|');scheduleStoryImagePreload(preload);}
    document.body.dataset.castleRoom=G.currentRoom;
    el('dialogue-next').hidden=!focusedNpc;
    el('dock-item-count').textContent=G.inventory.length;
    paint('castle-map-nodes',Object.entries(CASTLE_ROOMS).map(([id,r])=>mapNode(id,r)).join(''));
    renderDoors();
    frameLayout();
    paint('scene-hotspots',room.targets.map(([id,name,x,y])=>'<button type="button" class="hotspot" data-examine="'+id+'" style="left:'+x+'%;top:'+y+'%" aria-label="调查'+name+'"><i></i><span>'+name+'</span></button>').join(''));
    paint('object-tray',room.targets.map(([id,name],i)=>'<button type="button" data-examine="'+id+'"><small>'+String(i+1).padStart(2,'0')+'</small>'+name+'<span>⌕</span></button>').join(''));
    el('scene-caption').textContent=G.sunrise&&G.currentRoom==='tower'?'第一缕晨光，终于落在琴键上':'点击人物交谈，点击烛光标记调查';
    paint('room-exits',room.exits.map(exit=>'<button type="button" data-exit="'+exit+'"><span>'+(['hall','dining'].includes(exit)||G.doors[exit]?'↗':'♙')+'</span><div><small>'+(['hall','dining'].includes(exit)||G.doors[exit]?'前往':'寻找钥匙')+'</small>'+CASTLE_ROOMS[exit].name+'</div><span>→</span></button>').join(''));
  }
  function sync(){
    if(!started)return;
    renderPeople();updateQuestMarkers();renderScene();renderNotes();renderInventory();
    document.body.dataset.castleLoop=String(G.loop);
    el('loop-label').textContent=G.sunrise?'日出之后':['','第一周目 · 寻名','第二周目 · 倒影','第三周目 · 回信'][G.loop];
    const seconds=Math.floor(elapsed()/1000);el('elapsed').textContent=[Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(v=>String(v).padStart(2,'0')).join(':');
    const p=phase();
    document.body.dataset.castlePhase=p;
    document.body.dataset.castleChase=String(G.adrianChasing);
    if(p==='transition')outcomeArt('loop-art',G.loop===2?'loop2':'loop3');
    if(p==='wrong')outcomeArt('wrong-art','wrong');
    if(p==='ending')outcomeArt('ending-art','ending'+G.endingMovement);
    if(G.adrianChasing)outcomeArt('chase-art','chase');
    const view=p==='transition'?'loop'+G.loop:p==='ending'?'ending'+G.endingMovement:p==='wrong'?'wrong':G.adrianChasing?'chase':'';
    if(view!==lastNarrativeView){
      lastNarrativeView=view;
      const surface=p==='transition'?'loop-transition':p==='ending'?'ending-screen':p==='wrong'?'we-screen':G.adrianChasing?'chase-overlay':null;
      if(surface)el(surface).querySelector('.overlay-card').scrollTop=0;
    }
    el('overlay-sound').textContent=CastleAudio.enabled?'♪ 静音':'♪ 开启声音';
    el('overlay-sound').setAttribute('aria-pressed',String(CastleAudio.enabled));CastleAudio.sync(p==='wrong'?'wrong-end':G.sunrise||p==='ending'?'sunrise':['','loop-one','loop-two','loop-three'][G.loop]);
    // A terminal screen stops threats and the countdown; the music continues.
    if(p==='wrong'||p==='ending'){clearTimeout(chaseDeathTimer);cancelAnimationFrame(chaseRAF);stopCountdown();G.adrianChasing=false;el('chase-overlay').classList.remove('active');}
    mark();
  }
  function enter(saved=null){
    started=true;document.body.classList.add('is-playing');el('title-screen').hidden=true;el('play-layout').hidden=false;
    CastleClock.release('title');enteredAt=CastleClock.now();
    if(saved){
      restoring=true;
      for(const field of ['doors','puzzleSolved','npcQuests','names','loopTriggered','countdown']) saved.game[field]={...G[field],...saved.game[field]};
      Object.assign(G,saved.game);G.usedItems=new Set(saved.game.usedItems);G.selectedItem=G.inventory.includes(G.selectedItem)?G.selectedItem:null;
      notes=saved.notes;hints=saved.hints||{};elapsedBase=saved.elapsed;focusedNpc=saved.focusedNpc||null;
      const remaining=saved.game.countdown.remaining;G.countdown.timerId=null;
      if(G.countdown.active){startCountdown();G.countdown.endTime=CastleClock.now()+remaining;}
      if(saved.phase==='transition'){
        el('loop-title').textContent=saved.transition?.title||'循环再次开始';el('loop-text').textContent=saved.transition?.text||'回到大厅，继续寻找真相。';el('loop-transition').classList.add('active');el('loop-btn').style.display='inline-block';
      }
      if(saved.phase==='ending'){G.puzzleSolved.organ=false;playOrgan(G.endingMovement);}
      if(saved.phase==='wrong')el('we-screen').classList.add('active');
      CastleDialogue.set(saved.dialogue||getRoomDescription(G.currentRoom,G.loop,1),false,false);
      if(saved.chase&&saved.phase==='playing'){
        G.adrianChasing=false;G.candleLit=false;triggerAdrian();
        if(G.adrianChasing){clearTimeout(chaseDeathTimer);G.chaseDeadline=CastleClock.now()+saved.chase.remaining;chaseDeathTimer=setTimeout(dieByAdrian,saved.chase.remaining);}
      }
      if(saved.phase==='playing'&&G.loop===1&&G.flags.loop2_pending)setTimeout(triggerLoop2,500);
      if(saved.phase==='playing'&&G.loop===2&&hasItem('assembled_letter')){G.flags.loop3_pending=false;maybeTriggerLoop3();}
      restoring=false;
    }
    CastleAudio.start();sync();persist();
  }
  function action(kind,value){
    if(CastleClock.paused||phase()!=='playing'||el('modal-overlay').classList.contains('active'))return;
    if(sceneOverview&&['npc','examine'].includes(kind)){sceneOverview=false;sceneZoom=1;scenePan=scenePanY=0;}
    if(kind==='examine'){setDrawer(null);focusedNpc=null;el('speaker-name').textContent='场景调查';examine(value);}
    if(kind==='npc'){setDrawer(null);focusedNpc=value;el('speaker-name').textContent=getNpcDisplayName(value);talk(value);}
    if(kind==='exit'){
      if(!CASTLE_ROOMS[G.currentRoom].exits.includes(value))return;
      setDrawer(null);
      const before=G.currentRoom,wasOpen=castleDoorAccess(value).open;
      if(['hall','dining'].includes(value)||G.doors[value])gotoRoom(value);else tryDoor(value);
      if(G.doors[value]&&G.currentRoom===before&&value!=='tower')gotoRoom(value);
      if(value==='tower'&&G.doors.tower&&G.loop!==1&&G.currentRoom===before)gotoRoom(value);
      if(G.currentRoom!==before){CastleAudio.effect('door',wasOpen?0:.3);focusedNpc=null;el('speaker-name').textContent='场景调查';}
    }
    sync();
  }
  function ask(question,answer){
    openModal('<h3>被遗忘的答案</h3><p>'+escapeHTML(question)+'</p><form id="castle-answer-form"><label class="answer-label">你的答案<input id="castle-answer" autocomplete="off" maxlength="80" required></label><button class="game-btn primary" type="submit">确认答案 →</button></form>');
    el('castle-answer').focus();el('castle-answer-form').onsubmit=e=>{e.preventDefault();const value=el('castle-answer').value.trim();if(!value)return;closeModal();answer(value);sync();};
  }
  function showNotes(){openModal('<h3>探索手记</h3><p>只记录你亲自看过的线索与对话。</p><ol class="full-notes">'+notes.map(n=>'<li><small>第'+n.loop+'周目 · '+escapeHTML(n.room)+'</small><p>'+escapeHTML(n.text).replace(/\n/g,'<br>')+'</p></li>').join('')+'</ol>');}
  function hint(){
    const room=G.currentRoom,k=G.loop+':'+room,count=hints[k]||0;hints[k]=count+1;
    const p=PIANO_PUZZLES[Math.min(G.loop,3)],book=BOOK_ORDERS[Math.min(G.loop,3)],flute=FLUTE_PUZZLES[Math.min(G.loop,3)];
    const table={hall:['先拿蜡烛，再查看挂毯与钢琴。','钢琴从左到右的白键为 C D E F G A B。','本轮依次按白键：'+p.seq.map(i=>i+1).join(' → ')+'，书房就会开启。'],dining:['桌子抽屉、肖像背面，都值得查看。','镜片可以把烛光反射进音乐盒。第二周目之后，试着解救灵魂。','查看餐桌取得铁钥匙和登记簿，再查看肖像、镜子、音乐盒。'],study:['书架谜题会在每次循环改变。地球仪里有另一个房间的钥匙。','按书架给出的调号／年份／速度线索排序。别忘了竹笛。','本轮书本顺序：'+book.map(i=>BOOKS[i].title).join(' → ')+'；竹笛顺序：'+flute.seq.map(i=>['宫','商','角','徵','羽'][i]).join(' → ')+'。'],music:['地球仪里的音叉，可以校准大键琴。','查看大键琴并按本轮题目寻找正确音程。','本轮答案：'+HARP_PUZZLES[Math.min(G.loop,3)].answer+'。小提琴盒里有琴弓。'],bedroom:['床幔里有信纸，梳妆台上藏着一只珠宝盒。','珠宝盒密码与本轮音乐线索有关。','本轮珠宝盒密码：'+DRESSER_PUZZLES[Math.min(G.loop,3)].pass+'。'],cellar:['蜡烛会照亮酒标，最古老的酒里也藏着名字。','在第一周目找回女巫的名字后，继续与她交谈，回答音乐问题。','女巫真名是塞勒涅。本轮音乐题答案：'+({1:'3',2:'7',3:'8',4:'8'})[G.loop]+'。'],tower:['乐章由你带来的线索决定，不需要直接选择结局。','集齐四封信，在背包里拼合；用羽毛笔补全安魂曲，并带来音乐盒中的灵魂。','三次循环各取一页日记，保留1791年葡萄酒，再演奏风琴，会听到最后的乐章。']};
    openModal('<h3>一点烛光</h3><p>'+escapeHTML((table[room]||table.hall)[Math.min(count,2)])+'</p><p class="panel-help">第 '+(count+1)+' 次提示 · 免费</p>');mark();
  }
  function cancelHeldInput(){
    scenePointers.clear();panPointer=null;
    if(!G.adrianChasing)return;
    const button=el('chase-btn');
    if(!button.classList.contains('holding'))return;
    button.classList.remove('holding');chasePointer=null;cancelAnimationFrame(chaseRAF);
    // A browser/app switch cancels touch. Give that interrupted gesture its
    // time back, so backgrounding cannot turn a cancelled touch into death.
    const remaining=Math.max(0,(G.chaseDeadline||CastleClock.now())-CastleClock.now());
    const held=Math.max(0,CastleClock.now()-chaseHoldStart);
    clearTimeout(chaseDeathTimer);G.chaseDeadline=CastleClock.now()+remaining+held;
    chaseDeathTimer=setTimeout(dieByAdrian,remaining+held);
  }
  function pause(value){
    if(value){
      cancelHeldInput();CastleClock.hold('manual');el('pause-overlay').classList.add('active');
      const image=el('pause-art'),asset=art(imageFor());image.src=asset;image.alt=CASTLE_ROOMS[G.currentRoom].name+' · 暂停中的探索现场';image.closest('figure').style.setProperty('--outcome-art','url("'+asset+'")');el('pause-overlay').querySelector('.overlay-card').scrollTop=0;
      persist();
    }else{CastleClock.release('manual');el('pause-overlay').classList.remove('active');}
    el('play-layout').inert=value;CastleAudio.sync();if(!value)sync();
  }
  function exportSave(fault=false){
    const text=fault?CastleSave.fault:JSON.stringify(snapshot(),null,2),blob=new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=fault?'月光古堡-故障原文.json':'月光古堡-探索进度.json';a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function importSave(file){
    if(!file)return;
    file.text().then(raw=>{
      let parsed;try{parsed=CastleSave.valid(raw);}catch{openModal('<h3>无法读取这份进度</h3><p>请选择有效的月光古堡 JSON 导出文件。当前存档保持原样。</p>');return;}
      openModal('<h3>恢复古堡进度？</h3><p>将恢复到第 '+parsed.game.loop+' 周目 · '+escapeHTML(CASTLE_ROOMS[parsed.game.currentRoom].name)+'。这会替换当前古堡进度。</p><button class="game-btn primary" id="confirm-import">确认恢复这份进度</button>');
      el('confirm-import').onclick=()=>{if(CastleSave.replace(parsed)){suppressSave=true;location.reload();}else status('恢复失败；原有进度仍已保留，请检查浏览器存储空间。',true);};
    }).catch(()=>status('无法读取这个文件，请重新选择。',true));
  }
  function confirmRestart(){
    openModal('<h3>重新点亮蜡烛？</h3><p>这会清除本次古堡探索、背包与手记，回到第一周目。乐团存档不会受到影响。</p><button class="game-btn primary" id="confirm-restart">确认重新开始</button>');
    el('confirm-restart').onclick=()=>{if(CastleSave.reset()){suppressSave=true;location.reload();}else status('无法清除古堡进度，请先导出。',true);};
  }
  function init(){
    loaded=CastleSave.load();
    if(loaded?.recovered){const raw=document.createElement('button');raw.textContent='导出故障原文';raw.className='text-button';raw.onclick=()=>exportSave(true);el('title-screen').querySelector('.title-actions').append(raw);}
    if(loaded?.error){status(loaded.error+'；原始记录已保留，自动保存已暂停。请导出故障原文，或明确选择重新开始。',true);el('start-btn').hidden=true;el('new-game-btn').hidden=false;const exportButton=document.createElement('button');exportButton.className='game-btn';exportButton.textContent='导出故障原文';exportButton.onclick=()=>exportSave(true);el('title-screen').querySelector('.title-actions').append(exportButton);}
    else if(loaded){el('start-btn').hidden=true;el('continue-btn').hidden=false;el('new-game-btn').hidden=false;if(loaded.recovered)status('已自动恢复上一份可读古堡进度，故障原文仍可导出。');}
    document.querySelectorAll('[data-castle-import]').forEach(b=>b.onclick=()=>el('castle-import').click());el('castle-import').onchange=e=>{importSave(e.target.files[0]);e.target.value='';};
    el('fullscreen-btn').onclick=async()=>{
      try{if(document.fullscreenElement){await document.exitFullscreen();return;}await document.documentElement.requestFullscreen?.();await screen.orientation?.lock?.('landscape').catch(()=>{});}catch{}frameLayout();
    };
    el('dismiss-orientation').onclick=()=>el('orientation-tip').hidden=true;
    el('dialogue-next').onclick=()=>{if(focusedNpc)action('npc',focusedNpc);};
    window.addEventListener('resize',frameLayout);window.addEventListener('orientationchange',()=>window.setTimeout(frameLayout,150));
    el('room-art').addEventListener('load',frameLayout);
    el('scene-overview').onclick=()=>{sceneOverview=!sceneOverview;scenePan=scenePanY=0;sceneZoom=1;frameLayout();};
    el('scene-zoom-in').onclick=()=>zoomScene(viewZoom()*1.25);
    el('scene-zoom-out').onclick=()=>zoomScene(viewZoom()/1.25);
    el('scene-pan-left').onclick=()=>{scenePan+=el('scene-area').clientWidth*.65;paintPan();};
    el('scene-pan-right').onclick=()=>{scenePan-=el('scene-area').clientWidth*.65;paintPan();};
    const scene=el('scene-area');
    scene.addEventListener('dragstart',e=>e.preventDefault());
    const beginPan=()=>{
      const points=[...scenePointers.values()],box=scene.getBoundingClientRect();
      if(points.length>=2){const [a,b]=points,center=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--castle-art-local-center-y'))||box.height/2;panPointer={pinch:true,distance:Math.hypot(a.x-b.x,a.y-b.y),zoom:viewZoom(),x:(a.x+b.x)/2-box.left-box.width/2,y:(a.y+b.y)/2-box.top-box.height/2,start:scenePan,startY:scenePanY+center-box.height/2,moved:true};}
      else if(points.length)panPointer={x:points[0].x,y:points[0].y,start:scenePan,startY:scenePanY,moved:false};
      else panPointer=null;
    };
    scene.addEventListener('pointerdown',e=>{
      if(!window.matchMedia('(max-width:1000px)').matches||e.button!==0)return;
      scenePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});beginPan();
      if(scenePointers.size>=2){suppressSceneClickUntil=performance.now()+500;for(const id of scenePointers.keys())scene.setPointerCapture(id);}
    });
    scene.addEventListener('pointermove',e=>{
      if(!panPointer||!scenePointers.has(e.pointerId))return;
      scenePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(panPointer.pinch){
        const [a,b]=[...scenePointers.values()],box=scene.getBoundingClientRect(),start=panPointer;
        zoomScene(start.zoom*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,start.distance));
        const scale=viewZoom()/start.zoom;
        scenePan=(a.x+b.x)/2-box.left-box.width/2-(start.x-start.start)*scale;
        scenePanY=(a.y+b.y)/2-box.top-box.height/2-(start.y-start.startY)*scale;
        paintPan();e.preventDefault();
      }else{
        const dx=e.clientX-panPointer.x,dy=e.clientY-panPointer.y;
        if(!panPointer.moved&&Math.hypot(dx,dy)>8){panPointer.moved=true;scene.setPointerCapture(e.pointerId);}
        if(panPointer.moved){e.preventDefault();scenePan=panPointer.start+dx;scenePanY=panPointer.startY+dy;paintPan();}
      }
    });
    const endPan=e=>{if(!scenePointers.has(e.pointerId))return;const moved=panPointer?.moved;if(moved)suppressSceneClickUntil=performance.now()+500;scenePointers.delete(e.pointerId);beginPan();if(moved&&panPointer)panPointer.moved=true;};
    scene.addEventListener('pointerup',endPan);scene.addEventListener('pointercancel',endPan);
    scene.addEventListener('click',e=>{if(performance.now()<suppressSceneClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
    new ResizeObserver(frameLayout).observe(document.querySelector('.dialogue-panel'));
    el('start-btn').onclick=startGame;el('continue-btn').onclick=()=>enter(loaded);el('new-game-btn').onclick=confirmRestart;
    el('castle-volume').value=CastleAudio.volume*100;el('castle-volume').oninput=e=>CastleAudio.setVolume(Number(e.target.value)/100);
    el('castle-sound').onclick=()=>{CastleAudio.toggle();sync();};el('overlay-sound').onclick=()=>{CastleAudio.toggle();sync();};el('pause-btn').onclick=()=>pause(true);el('resume-btn').onclick=()=>pause(false);
    el('modal-close').onclick=closeModal;el('notes-btn').onclick=showNotes;el('hint-btn').onclick=hint;
    el('deselect-btn').onclick=()=>{G.selectedItem=null;renderInventory();mark();};el('export-btn').onclick=()=>exportSave();el('restart-btn').onclick=confirmRestart;el('retry-btn').onclick=confirmRestart;
    el('sunrise-btn').onclick=()=>{el('ending-screen').classList.remove('active');enterSunriseMode();sync();};
    el('loop-btn').onclick=()=>{closeModal();continueLoop();focusedNpc=null;sync();};
    el('reveal-btn').onclick=()=>{const b=el('reveal-btn'),on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));el('scene-hotspots').classList.toggle('muted-markers',!on);};
    document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;if(b.dataset.examine)action('examine',b.dataset.examine);if(b.dataset.npc)action('npc',b.dataset.npc);if(b.dataset.exit)action('exit',b.dataset.exit);if(b.dataset.travel)travelTo(b.dataset.travel);if(b.dataset.castleDrawer)setDrawer(b.dataset.castleDrawer);if(b.hasAttribute('data-close-drawer'))setDrawer(null);if(started)mark();});
    const chaseButton=el('chase-btn');
    chaseButton.addEventListener('pointerdown',e=>{if(chasePointer!==null||CastleClock.paused)return;chasePointer=e.pointerId;chaseButton.setPointerCapture(e.pointerId);startHoldBreath(e);mark();});
    const release=e=>{if(chasePointer!==e.pointerId)return;chasePointer=null;if(CastleClock.paused){chaseButton.classList.remove('holding');return;}endHoldBreath(e);sync();};chaseButton.addEventListener('pointerup',release);chaseButton.addEventListener('pointercancel',release);
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'){if(drawer)setDrawer(null);else if(el('modal-overlay').classList.contains('active'))closeModal();else if(started)pause(!el('pause-overlay').classList.contains('active'));}
      if(e.code==='Space'&&G.adrianChasing&&!e.repeat&&!CastleClock.paused){e.preventDefault();startHoldBreath(e);}
      if(e.key==='Tab')trapFocus(e);
    });
    document.addEventListener('keyup',e=>{if(e.code==='Space'&&G.adrianChasing&&!CastleClock.paused){endHoldBreath(e);sync();}});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelHeldInput();CastleClock.hold('background');mark();persist();CastleAudio.sync();}else{CastleClock.release('background');if(started)pause(true);}});
    window.addEventListener('blur',()=>{if(started&&G.adrianChasing)pause(true);});
    window.addEventListener('pagehide',()=>{mark();persist();CastleDialogue.finish();CastleAudio.stop();});
    window.addEventListener('pageshow',()=>{if(started){pause(true);CastleAudio.start();}});
    window.setInterval(()=>{if(started&&!CastleClock.paused){sync();}},1000);
    CastleAudio.sync();
  }
  function trapFocus(event){
    const modal=el('modal-overlay').classList.contains('active')?el('modal-overlay'):[el('pause-overlay'),el('we-screen'),el('ending-screen'),el('loop-transition'),el('chase-overlay')].find(n=>n.classList.contains('active'));
    if(!modal)return;
    const buttons=[...modal.querySelectorAll('button,a,input')].filter(n=>!n.hidden&&!n.disabled),first=buttons[0],last=buttons.at(-1);
    if(event.shiftKey&&(document.activeElement===first||!modal.contains(document.activeElement))){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&(document.activeElement===last||!modal.contains(document.activeElement))){event.preventDefault();first?.focus();}
  }
  return {init,enter,sync,setDrawer,note,ask,action,persist,exportSave,mark,pause,modalArt,get snapshot(){return snapshot();}};
})();
window.CastleUI=CastleUI;
