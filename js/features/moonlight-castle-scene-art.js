'use strict';
// Physical scene state is authored separately from dialogue. Mentions of a
// name never decide who is present. Transient camera beats are deliberately
// outside G. The portrait's one learned visual state uses the existing flags
// dictionary; older saves omit that key and keep the unrevealed painting.
const CastleSceneArt = (() => {
  const morningNpcs = Object.freeze(['siyang','tim','servants','bingbing','dijie','jerry','qiqi','shiyuan','lala']);
  const portraitTexts = Object.freeze([
    '肖像画的流血停止了。被划掉的脸……边缘开始变得清晰。那是菲利克斯。他在笑，像是隔着两百年的灰尘，对你一个人笑。',
    '你翻开肖像画，画框背面的暗格里藏着半张烧焦的信纸。暗格内侧刻着两行字："A & F —— 吾爱，1823年冬。"下面还有一行小一些的："Isabella —— 吾之小妹，愿月光宽恕你我。"'
  ]);
  const eventScenes=Object.freeze({
    'object.musicbox.refused':'musicbox-loop1-refused','object.musicbox.freed':'musicbox-soul-freed','object.musicbox.empty':'musicbox-empty',
    'object.mirror.broken':'mirror-broken','object.mirror.reflection':'mirror-felix-reflection','object.violin.empty':'violin-case-empty','bedroom.mirror-reflection':'bedroom-loop2-mirror-reflection',
    'adrian.keepsake.ring':'adrian-bound-ring','adrian.keepsake.pocket_watch':'adrian-bound-pocket-watch','adrian.keepsake.wine_bottle':'adrian-bound-wine','adrian.keepsake.diary_page':'adrian-bound-diary','adrian.keepsake.silver_key':'adrian-bound-key',
    'adrian.bound':'adrian-bound','adrian.final-letter':'adrian-final-letter','adrian.final-letter-to-organ':'adrian-final-letter-to-organ',
    'adrian.blocks-organ':'adrian-blocks-organ','adrian.soul-protection':'adrian-soul-protection','adrian.candle-repelled':'adrian-candle-repelled'
  });
  const dialogueScenes=Object.freeze({
    'talk.dijie.3.0.text':'study-loop3-talk-dijie','talk.servants.3.0.text':'dining-loop3-talk-servants',
    'talk.servants.4.0.text':'hall-dawn-talk-servants','talk.servants.4.1.text':'hall-dawn-talk-servants','talk.servants.4.2.text':'hall-dawn-talk-servants','talk.servants.4.3.text':'hall-dawn-talk-servants',
    'talk.servants.4.4.text':'hall-dawn-talk-shiyuan','talk.shiyuan.4.0.text':'hall-dawn-talk-shiyuan','talk.shiyuan.4.1.text':'hall-dawn-talk-shiyuan',
    'talk.bingbing.4.0.text':'dining-dawn-talk-bingbing','talk.bingbing.4.1.text':'dining-dawn-talk-bingbing'
  });
  // Exact authored event sources retained for v1 save restoration.
  const eventTextRows=Object.freeze([
  {
    id:'bedroom.mirror-reflection',room:'bedroom',loops:[2],
    text:'卧室里，碎镜片中的画面更清晰了——你看到了两个男人，他们紧紧抱在一起。'
  },
  {
    "id": "adrian.soul-protection",
    "text": "艾德里安的身影从黑暗中逼近——他掌心的血光几乎触到你的咽喉。突然，你怀里的灵魂残音亮了。他的手指停在半空，剧烈地颤抖起来。",
    "loops": [
      2,
      3
    ]
  },
  {
    "id": "adrian.soul-protection",
    "text": "\"是你……你一直在看着我们，对吗？\"艾德里安踉跄后退，血红色的眼睛里第一次有了别的颜色。他退进黑暗里，声音飘过来：\"我不会伤害他看着的人。走吧——趁我还记得。\"",
    "loops": [
      2,
      3
    ]
  },
  {
    "id": "adrian.candle-repelled",
    "text": "艾德里安的身影在走廊尽头一闪而过。蜡烛的火光让他无法靠近。",
    "loops": [
      2,
      3
    ]
  },
  {
    "id": "object.musicbox.empty",
    "text": "音乐盒已经空了。",
    "room": "dining",
    "loops": [
      1,
      2,
      3,
      4
    ]
  },
  {
    "id": "object.musicbox.refused",
    "text": "你用碎镜片反射烛光，照进了音乐盒的缝隙。盒盖弹开，一道柔和的蓝光飘了出来——但它只是轻轻碰了碰你的手背，又缩了回去。像是认出了你不是它要等的人。",
    "room": "dining",
    "loops": [
      1
    ]
  },
  {
    "id": "object.musicbox.freed",
    "text": "你用碎镜片反射烛光，照进了音乐盒的缝隙。盒盖弹开，一道柔和的蓝光飘了出来——那是菲利克斯的灵魂残音，被封印了两百年。它绕着你转了三圈，最后安静地落在你掌心，像一只终于找到归途的鸟。",
    "room": "dining",
    "loops": [
      2,
      3,
      4
    ]
  },
  {
    "id": "object.musicbox.freed",
    "text": "灵魂残音在你掌心轻轻发烫。你忽然明白了——只要它还在你身边，艾德里安就不会真正伤害你。他不是不敢，是不忍：他不会伤害菲利克斯看着的人。",
    "room": "dining",
    "loops": [
      2,
      3,
      4
    ]
  },
  {
    "id": "object.mirror.broken",
    "text": "镜子已经碎了，碎片被你收走了。",
    "room": "dining",
    "loops": [
      1,
      2,
      3,
      4
    ]
  },
  {
    "id": "object.violin.empty",
    "text": "小提琴盒是空的。",
    "room": "music",
    "loops": [
      1,
      2,
      3,
      4
    ]
  },
  {
    "id": "adrian.blocks-organ",
    "text": "艾德里安挡住了风琴。\"你以为一封信就能打动我吗？我要的是他……把他的灵魂带来。\"",
    "room": "tower",
    "loops": [
      3
    ]
  },
  {
    "id": "adrian.bound",
    "text": "艾德里安的身影被一层淡淡的金光笼罩着，像一尊暂时安静的雕像。他的声音直接在你脑海里响起：\"别管我……时间不多，去找他的信。\"",
    "room": "tower",
    "loops": [
      2
    ]
  },
  {
    "id": "adrian.final-letter",
    "text": "艾德里安颤抖着接过信件和灵魂残音。他的手指穿过蓝光，但他仿佛能读到每一个字。两行眼泪无声地滑下来：\"……他原谅我了。两百年了，他早就原谅我了。他只是在等我……亲口问一句。\"",
    "room": "tower",
    "loops": [
      3
    ]
  },
  {
    "id": "adrian.final-letter-to-organ",
    "text": "艾德里安小心地把信贴在胸口，走向风琴：\"这首曲子……我们还没有写完。但这一次，他会听到的。这一次，我弹给他听，也弹给日出听。\"",
    "room": "tower",
    "loops": [
      3
    ]
  },
  {
    "id": "object.mirror.broken",
    "text": "你敲碎了一小块镜子。碎片中……映出的不是你的脸。",
    "room": "dining",
    "loops": [
      1,
      2,
      3,
      4
    ]
  },
  {
    "id": "object.mirror.reflection",
    "text": "你敲碎了一小块镜子。碎片中映出了一个穿礼服的年轻人，他微笑着说：\"帮我把信带给他。告诉他，门外的雪不冷——真正冷的，是他一个人守着的那架琴。\"",
    "room": "dining",
    "loops": [
      2,
      3,
      4
    ]
  },
  {
    "id": "adrian.keepsake.ring",
    "text": "你献出了「戒指」。艾德里安的指尖悬在戒指上方，迟迟不敢碰它。\"内侧的刻痕……还和他焐热它的时候一样。\"他的身影凝固了一瞬，\"我用这点时间……换你把剩下的带回来。\"<br><br><span style=\"color:#cc6666;\">⏳ 禁锢生效：在倒计时归零之前，找到并拼齐菲利克斯的信件，否则一切将无法挽回。</span>",
    "room": "tower",
    "loops": [
      2
    ]
  },
  {
    "id": "adrian.keepsake.pocket_watch",
    "text": "你献出了「怀表」。艾德里安盯着停在11:47的指针，久久没有说话。\"时间停在那一刻，是因为我不敢往前走。\"他闭上眼，\"现在，换我给你争取一点时间。\"<br><br><span style=\"color:#cc6666;\">⏳ 禁锢生效：在倒计时归零之前，找到并拼齐菲利克斯的信件，否则一切将无法挽回。</span>",
    "room": "tower",
    "loops": [
      2
    ]
  },
  {
    "id": "adrian.keepsake.wine_bottle",
    "text": "你献出了「陈年葡萄酒」。艾德里安接过酒瓶，指腹抚过标签上的年份。\"1791年……我们相识的那一年。\"他的声音低了下去，\"这瓶酒先押在我这里——去把剩下的找齐，我替你挡住这座古堡。\"<br><br><span style=\"color:#cc6666;\">⏳ 禁锢生效：在倒计时归零之前，找到并拼齐菲利克斯的信件，否则一切将无法挽回。</span>",
    "room": "tower",
    "loops": [
      2
    ]
  },
  {
    "id": "adrian.keepsake.diary_page",
    "text": "你献出了「日记残页」。艾德里安看到那页日记时，整个灵魂都在发抖。\"你找到了……我烧了三次都没烧成的东西。\"他深吸一口气，\"在我彻底失控之前——快去，把剩下的都找回来。\"<br><br><span style=\"color:#cc6666;\">⏳ 禁锢生效：在倒计时归零之前，找到并拼齐菲利克斯的信件，否则一切将无法挽回。</span>",
    "room": "tower",
    "loops": [
      2
    ]
  },
  {
    "id": "adrian.keepsake.silver_key",
    "text": "你献出了「银钥匙」。艾德里安认出了那把钥匙。\"音乐室的钥匙……他总说我弹琴的声音能把锁都震开。\"他苦笑，\"好，我用这点时间，换你继续找下去。\"<br><br><span style=\"color:#cc6666;\">⏳ 禁锢生效：在倒计时归零之前，找到并拼齐菲利克斯的信件，否则一切将无法挽回。</span>",
    "room": "tower",
    "loops": [
      2
    ]
  }
]);
  let camera = null;
  const pendingPortraitAnimations = new Set();
  function phase(state) { return state.sunrise || state.loop >= 4 ? 'dawn' : 'loop' + state.loop; }
  function token(state) { return state.currentRoom + ':' + phase(state); }
  function scenes() { return typeof CASTLE_STORY_ART === 'undefined' ? {} : CASTLE_STORY_ART.scenes; }
  function entry(id) { const value=scenes()[id]; return value ? { ...value, id: value.id || id } : null; }
  function legacy(state) {
    const id=state.sunrise&&state.currentRoom==='tower'?'dawn-exploration-v3':CASTLE_ROOMS[state.currentRoom].art;
    const old=CASTLE_ART[id]||{};
    return {id,asset:'assets/moonlight-castle/'+id+'.webp',room:state.currentRoom,phase:phase(state),...old,
      objectRegions:CASTLE_OBJECT_REGIONS[id]||{},doors:CASTLE_SCENE_DOORS[state.currentRoom]||[]};
  }
  function baseId(state) {
    if(state.nextMorning&&state.currentRoom==='hall')return 'hall-morning';
    if(state.currentRoom==='dining'&&phase(state)==='loop3')return state.flags?.portrait_revealed_loop3?'dining-loop3-portrait-reveal':'dining-loop3-portrait-veiled';
    return state.currentRoom+'-'+phase(state);
  }
  function currentCamera(state) { return camera?.token===token(state)?camera:null; }
  function resolve(state, options={}) {
    const room=options.room||state.currentRoom, target=room===state.currentRoom?state:{...state,currentRoom:room};
    const beat=options.baseOnly?null:currentCamera(target);
    let id=baseId(target);
    if(target.currentRoom==='hall'&&phase(target)==='dawn'&&target.flags?.talk_tim_4_0&&entry('hall-dawn-armor-raised'))id='hall-dawn-armor-raised';
    const physicalBaseId=id;
    if(beat?.kind==='talk') {
      const talkId=room+'-'+phase(target)+'-talk-'+beat.npc;
      if(entry(talkId))id=talkId;
    }
    if(beat?.sceneId&&entry(beat.sceneId))id=beat.sceneId;
    if(beat?.kind==='examine'&&beat.object==='armor'&&target.loop===2&&entry('hall-loop2-examine-armor'))id='hall-loop2-examine-armor';
    if(beat?.kind==='examine'&&beat.object==='portrait_dining'&&target.currentRoom==='dining'&&target.loop===3&&entry('dining-loop3-portrait-reveal'))id='dining-loop3-portrait-reveal';
    const selected=entry(id)||entry(room+'-'+phase(target))||legacy(target);
    const transientTalk=beat?.kind==='talk'&&id!==physicalBaseId;
    const isEvent=!!(beat?.kind==='event'||beat?.artEvent||transientTalk);
    return {...selected,room:selected.room||room,phase:phase(target),semanticId:id,beatId:beat?.id||null,
      isEvent,
      geometryKey:selected.geometryKey||(isEvent?'event:'+id:room+':'+phase(target)),
      // Legacy geometry is supplied only by legacy(). A new camera missing
      // geometry must stay non-interactive rather than inherit an old room's
      // silhouettes over an unrelated close-up.
      objectRegions:selected.objectRegions||{},
      doors:selected.doors||[]};
  }
  function contacts(state) { return state.nextMorning&&state.currentRoom==='hall'?[...morningNpcs]:[...CASTLE_ROOMS[state.currentRoom].cast]; }
  function castIds(npc) { return npc==='servants'?['baoshi','feihong']:[CASTLE_NPC_CARDS[npc]||npc]; }
  function isPresent(npc, state, scene=resolve(state)) {
    return castIds(npc).some(id=>(scene.visibleCast||[]).includes(id));
  }
  function reset() { camera=null; }
  function resetSession() { reset();pendingPortraitAnimations.clear(); }
  function talk(npc,state) {
    camera={token:token(state),kind:'talk',npc,id:'talk.'+npc+'.'+Math.min(state.loop,4)};
  }
  function event(id,state) {
    const family=typeof CASTLE_STORY_ART==='undefined'?null:CASTLE_STORY_ART.eventPhaseBindings?.[id];
    // A physical object/event uses its own current-phase illustration. Missing
    // variants return to the current room; never borrow a prior loop's image.
    const sceneId=family?family[phase(state)]:(eventScenes[id]||id);
    camera=sceneId?{token:token(state),kind:'event',id,sceneId}:null;
  }
  function examine(object,state) {
    camera={token:token(state),kind:'examine',object,id:'examine.'+object+'.'+Math.min(state.loop,4)};
    if(object==='portrait_dining'&&state.currentRoom==='dining'&&state.loop===3){
      if(!state.flags.portrait_revealed_loop3)pendingPortraitAnimations.add(token(state));
      state.flags.portrait_revealed_loop3=true;
    }
  }
  function plain(text) {
    return String(text||'').replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
  }
  // Complete authored dialogue catalog: structural owner + cycle + source row
  // gives a stable ID. Equality is only used to restore the current camera
  // from the old saved dialogue string; it never infers cast from prose.
  function dialogueCatalog() {
    const rows=[];
    for(const [npc,cycles] of Object.entries(DIALOGUES))for(const [cycle,items] of Object.entries(cycles))items.forEach((item,index)=>{
      for(const field of ['text','giftText','rewardText','ansQuestion'])if(item[field])rows.push({id:'talk.'+npc+'.'+cycle+'.'+index+'.'+field,text:plain(item[field]),npc,cycle:Number(cycle)});
    });
    for(const [npc,puzzle] of Object.entries(NAME_PUZZLES))for(const field of ['ask','reveal'])if(puzzle[field])rows.push({id:'name.'+npc+'.'+field,text:plain(puzzle[field]),npc,cycle:1});
    return rows;
  }
  function observe(text,state,explicitId=null) {
    if(explicitId){event(explicitId,state);return;}
    const beat=currentCamera(state);if(!beat||beat.kind!=='talk')return;
    const match=dialogueCatalog().find(row=>row.cycle===Math.min(state.loop,4)&&row.npc===beat.npc&&row.text===plain(text));
    if(match){beat.id=match.id;beat.sceneId=dialogueScenes[match.id]||null;beat.artEvent=!!beat.sceneId;}
  }
  function restore(saved,state) {
    resetSession();
    const current=plain(saved?.dialogue);
    const match=dialogueCatalog().find(row=>row.cycle===Math.min(state.loop,4)&&row.npc===saved?.focusedNpc&&row.text===current);
    if(match&&contacts(state).includes(match.npc)){talk(match.npc,state);observe(current,state);}
    if(state.currentRoom==='dining'&&state.loop===3&&portraitTexts.some(text=>plain(text)===current)){
      examine('portrait_dining',state);pendingPortraitAnimations.delete(token(state));
    }
    const eventRow=eventTextRows.find(row=>(!row.room||row.room===state.currentRoom)&&row.loops.includes(Math.min(state.loop,4))&&plain(row.text)===current);
    if(eventRow)event(eventRow.id,state);
  }
  function reveal(state) {
    if(state.currentRoom!=='dining'||state.loop!==3||!state.flags?.portrait_revealed_loop3)return null;
    const from=entry('dining-loop3-portrait-veiled'),to=entry('dining-loop3-portrait-reveal');
    return from&&to?{from,to}:null;
  }
  function consumeRevealAnimation(state){return pendingPortraitAnimations.delete(token(state));}
  return {phase,resolve,contacts,castIds,isPresent,reset,resetSession,talk,event,examine,observe,restore,reveal,consumeRevealAnimation,dialogueCatalog,
    eventCatalog:()=>eventTextRows.map(row=>({...row})),
    get beat(){return camera?{...camera}:null;}};
})();
window.CastleSceneArt=CastleSceneArt;
