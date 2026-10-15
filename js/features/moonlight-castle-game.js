'use strict';
// Original mechanics; presentation/persistence live in the companion controller.


const G = {
  currentRoom: 'hall',
  inventory: [],
  usedItems: new Set(),
  selectedItem: null,
  flags: {},
  loop: 1,
  loopTriggered: { 2:false, 3:false },
  doors: { study:false, music:false, bedroom:false, cellar:false, tower:false },
  puzzleSolved: { piano:false, bookshelf:false, dresser:false, wine:false, organ:false, mirror:false, harpsichord:false, flute:false },
  npcQuests: {
    siyang: { started:false, done:false },
    bingbing: { started:false, done:false },
    dijie: { started:false, done:false },
    qiqi: { started:false, done:false },
    tim: { started:false, done:false },
    jerry: { started:false, done:false },
    shiyuan: { started:false, done:false },
    lala: { started:false, done:false },
    adrian: { started:false, done:false, stage:0 }
  },
  moveCount: 0,
  candleLit: false,
  adrianChasing: false,
  roomVisitCount: {},
  countdown: { active:false, endTime:0, timerId:null, offeredKeepsake:false },
  names: { siyang:false, bingbing:false, dijie:false, qiqi:false, jerry:false, lala:false },
  nextMorning: false,
  soulProtected: false
};

// ====== 第一循环 · 寻名系统 ======
// 玩家要找到的不是他们现代的名字，而是两百年前在这座古堡里的真名。
// 真名找回后，名牌显示为「真名（现代名）」，暗示两世重叠。


function getNpcDisplayName(npc) {
  const p = NAME_PUZZLES[npc];
  if (!p) return { tim:'Tim爵士', shiyuan:'十元女仆', servants:'宝石&飞鸿', adrian:'艾德里安' }[npc] || npc;
  if (G.names[npc] || G.loop >= 2) return p.display;
  return p.alias;
}

function refreshNpcNames() {
  Object.keys(NAME_PUZZLES).forEach(npc => {
    const el = document.querySelector('#npc-' + npc + ' .npc-name');
    if (el) el.textContent = getNpcDisplayName(npc);
  });
}



let NPC_TALK_COUNT = {};

function startGame() {
  CastleUI.enter();
  refreshNpcNames();
  showText('大厅里，壁炉的余烬还在冒烟。盔甲静静地站在角落。远处传来风声……奇怪的是，同伴们的名字，你一个也叫不出口了——像是被这座古堡悄悄吞掉了。');
}

// Use the paused game clock, without running a full UI render/save per character.
const CastleDialogue = (() => {
  let fullText = '', frame = 0;
  const box = () => document.getElementById('dialogue-box');
  function finish() {
    window.cancelAnimationFrame(frame);
    frame = 0;
    box().textContent = fullText;
    box().classList.remove('typing');
    box().setAttribute('aria-busy', 'false');
  }
  function set(text, horror = false, animate = true) {
    window.cancelAnimationFrame(frame);
    frame = 0;
    fullText = text;
    const target = box();
    target.className = horror ? 'horror' : '';
    if (!animate || !text) { finish(); return; }
    const characters = Array.from(text), start = CastleClock.now();
    let visible = 0;
    target.textContent = '';
    target.classList.add('typing');
    target.setAttribute('aria-busy', 'true');
    function tick() {
      const count = Math.min(characters.length, Math.floor((CastleClock.now() - start) / 28));
      if (count !== visible) {
        visible = count;
        target.textContent = characters.slice(0, count).join('');
      }
      if (count === characters.length) finish();
      else frame = window.requestAnimationFrame(tick);
    }
    frame = window.requestAnimationFrame(tick);
  }
  return { set, finish, get text() { return fullText; } };
})();

function showText(text, horror) {
  // Authored formatting is converted to readable text; never display HTML markup.
  const template = document.createElement('div');
  template.innerHTML = String(text).replace(/<br\s*\/?\s*>/gi, '\n');
  CastleDialogue.set(template.textContent, !!horror);
  CastleUI.note(CastleDialogue.text, !!horror);
}

function addHorrorText(text) {
  setTimeout(() => showText(text, true), 500);
}

function openModal(html) {
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal-overlay').classList.add('active');
  document.getElementById('modal-close').focus();
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  document.getElementById('notes-btn')?.focus({preventScroll:true});
  pianoSequence = [];
  bookOrder = [];
  fluteSequence = [];
}
function maybeTriggerLoop3() {
  if (G.loop === 2 && hasItem('assembled_letter') && !G.loopTriggered[3]) {
    stopCountdown();
    if(G.flags.loop3_pending)return;
    G.flags.loop3_pending=true;
    setTimeout(() => triggerLoop3(), 3500);
  }
}

// ====== 信物禁锢倒计时 ======




function formatCountdown(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
}

function startCountdown() {
  stopCountdown();
  G.countdown.active = true;
  G.countdown.endTime = CastleClock.now() + COUNTDOWN_SECONDS * 1000;
  const ui = document.getElementById('countdown-ui');
  ui.classList.add('active');
  ui.classList.remove('urgent');
  document.getElementById('countdown-text').textContent = formatCountdown(COUNTDOWN_SECONDS);
  G.countdown.timerId = setInterval(() => {
    const remain = Math.max(0, Math.ceil((G.countdown.endTime - CastleClock.now()) / 1000));
    document.getElementById('countdown-text').textContent = formatCountdown(remain);
    if (remain <= 30) ui.classList.add('urgent');
    if (remain <= 0) {
      stopCountdown();
      onCountdownExpired();
    }
  }, 500);
}

function stopCountdown() {
  if (G.countdown.timerId) { clearInterval(G.countdown.timerId); G.countdown.timerId = null; }
  G.countdown.active = false;
  const ui = document.getElementById('countdown-ui');
  if (ui) ui.classList.remove('active', 'urgent');
}

function onCountdownExpired() {
  if (G.loop >= 3 || hasItem('assembled_letter')) return; // 已完成，兜底
  // 禁锢失效，艾德里安暴怒
  G.adrianChasing = false;
  clearTimeout(chaseDeathTimer); cancelAnimationFrame(chaseRAF);
  document.getElementById('chase-overlay').classList.remove('active');
  document.getElementById('scene-area').style.animation = '';
  showText('信物的温度褪去了。月光重新变得惨白——艾德里安不再认得你。', true);
  setTimeout(() => {
    document.getElementById('we-screen').classList.add('active');
  }, 1500);
}

function offerKeepsakeToAdrian() {
  const found = KEEPSAKES.find(id => hasItem(id));
  if (!found) {
    showText('艾德里安盯着你的掌心，血红色的眼睛眯了起来："空手而来？你连一件他的东西都没有带回来……那你也别想走了。"', true);
    return;
  }
  removeItem(found);
  markUsed(found);
  G.countdown.offeredKeepsake = true;
  startCountdown();
  const name = KEEPSAKE_NAMES[found];
  const lines = {
    ring: '艾德里安的指尖悬在戒指上方，迟迟不敢碰它。"内侧的刻痕……还和他焐热它的时候一样。"他的身影凝固了一瞬，"我用这点时间……换你把剩下的带回来。"',
    pocket_watch: '艾德里安盯着停在11:47的指针，久久没有说话。"时间停在那一刻，是因为我不敢往前走。"他闭上眼，"现在，换我给你争取一点时间。"',
    wine_bottle: '艾德里安接过酒瓶，指腹抚过标签上的年份。"1791年……我们相识的那一年。"他的声音低了下去，"这瓶酒先押在我这里——去把剩下的找齐，我替你挡住这座古堡。"',
    diary_page: '艾德里安看到那页日记时，整个灵魂都在发抖。"你找到了……我烧了三次都没烧成的东西。"他深吸一口气，"在我彻底失控之前——快去，把剩下的都找回来。"',
    silver_key: '艾德里安认出了那把钥匙。"音乐室的钥匙……他总说我弹琴的声音能把锁都震开。"他苦笑，"好，我用这点时间，换你继续找下去。"'
  };
  showText('你献出了「' + name + '」。' + lines[found] + '<br><br><span style="color:#cc6666;">⏳ 禁锢生效：在倒计时归零之前，找到并拼齐菲利克斯的信件，否则一切将无法挽回。</span>', true);
  showAchievement('信物禁锢', '艾德里安暂时平静了');
}
function showAchievement(title, desc) {
  const el = document.getElementById('achievement');
  document.getElementById('ach-title').textContent = title;
  document.getElementById('ach-desc').textContent = desc;
  el.classList.add('active');
  setTimeout(() => el.classList.remove('active'), 3000);
}

function addItem(id) {
  if (G.inventory.includes(id)) return;
  G.inventory.push(id);
  renderInventory();
}
function removeItem(id) {
  G.inventory = G.inventory.filter(i => i !== id);
  if (G.selectedItem === id) G.selectedItem = null;
  renderInventory();
}
function hasItem(id) {
  return G.inventory.includes(id);
}
function markUsed(id) {
  G.usedItems.add(id);
  renderInventory();
}
function selectItem(id) {
  if (G.selectedItem === id) {
    // Re-click: use / read the item
    useItem(id);
  } else {
    G.selectedItem = id;
    renderInventory();
    showText('已选中「' + ITEMS[id].name + '」。再次点击使用/查看，或点选场景中的人物与物品试试。');
  }
}
function showItemDetail(id) {
  const item = ITEMS[id];
  if (!item) return;
  const visual = item.detail && item.detail.startsWith('<div') ? item.detail : '<p style="text-align:center;font-size:48px;margin:10px 0;">' + item.icon + '</p><p style="color:#8a7a6a;font-size:13px;text-align:center;">' + item.detail + '</p>';
  openModal('<h3>' + item.name + '</h3>' + (id==='repaired_score'?CastleUI.modalArt('score'):'') + visual + '<p style="color:#8a7a6a;font-size:12px;text-align:center;margin-top:10px;">（选中状态下点击人物，可以把道具交给对方）</p>');
}
function renderInventory() {
  const el = document.getElementById('inventory');
  const signature=JSON.stringify([G.inventory,[...G.usedItems],G.selectedItem,ITEMS.diary_page.name]);
  if(el.dataset.signature===signature)return;
  el.dataset.signature=signature;
  el.innerHTML = '';
  G.inventory.forEach(id => {
    const item = ITEMS[id];
    if (!item) return;
    const slot = document.createElement('button');
    slot.type = 'button';
    slot.className = 'inv-slot' + (G.usedItems.has(id) ? ' used' : '') + (G.selectedItem === id ? ' selected' : '');
    slot.innerHTML = '<span class="icon">' + item.icon + '</span><span class="name">' + item.name + '</span>';
    slot.title = item.name + '：点击选中，再次点击使用或查看';
    slot.setAttribute('aria-pressed', String(G.selectedItem === id));
    slot.onclick = () => selectItem(id);
    el.appendChild(slot);
  });
  document.getElementById('inventory-count').textContent = G.inventory.length + ' 件';
  document.getElementById('inventory-empty').hidden = G.inventory.length > 0;
}

function roomName(room) {
  const names = { hall:'大厅', dining:'餐厅', study:'书房', music:'音乐室', bedroom:'卧室', cellar:'地下室', tower:'塔楼' };
  return names[room] || room;
}

function gotoRoom(room) {
  if (room === 'cellar' && !hasItem('candle')) {
    showText('地下室太黑了，什么都看不见。你需要一支蜡烛。', true);
    return;
  }
  if (G.adrianChasing) {
    showText('艾德里安就在附近……现在不能贸然行动！', true);
    return;
  }

  // Count visits per room per loop
  const visitKey = room + '_L' + G.loop;
  G.roomVisitCount[visitKey] = (G.roomVisitCount[visitKey] || 0) + 1;
  const visitCount = G.roomVisitCount[visitKey];

  document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));
  document.getElementById('scene-' + room).classList.add('active');
  G.currentRoom = room;
  G.moveCount++;

  // Room descriptions change based on loop and revisit count
  const desc = getRoomDescription(room, G.loop, visitCount);
  showText(desc);

  // Apply loop visual changes
  applyLoopVisuals(room, G.loop);

  // Countdown expiry also triggers if wandering (safety net)
  if (G.countdown.active && G.countdown.endTime && CastleClock.now() >= G.countdown.endTime) {
    stopCountdown(); onCountdownExpired(); return;
  }

  // Chase mechanic - only in Loop 2+ (suppressed while keepsake binds Adrian)
  if (G.loop >= 2 && G.loop < 4 && !G.countdown.active && G.moveCount > 4 && G.moveCount % 6 === 0 && room !== 'tower') {
    setTimeout(() => {
      if (!G.adrianChasing && !G.sunrise && !G.countdown.active && G.loop >= 2 && G.loop < 4) triggerAdrian();
    }, 2000);
  }

  maybeTriggerLoop3();
  updateQuestMarkers();
}

function getRoomDescription(room, loop, visitCount) {
  // Cycle 1: surface level, mysterious only
  const c1 = {
    hall: visitCount === 1
      ? '大厅里，壁炉的余烬还在冒烟。盔甲静静地站在角落。远处传来风声……'
      : '你又回到了大厅。壁炉的火光摇曳，但比刚才暗了一些。',
    dining: visitCount === 1
      ? '餐厅的长桌上摆着未动的晚餐。肖像画中的人脸被划掉了。空气中有股霉味。'
      : '餐厅里，晚餐还是原样。但肖像画……好像比刚才更旧了。',
    study: visitCount === 1
      ? '书房里弥漫着旧书和松香的味道。书架上的书脊在烛光下泛着暗光。'
      : '书房很安静。但书架上……似乎有本书的位置变了。',
    music: visitCount === 1
      ? '音乐室里陈列着几百年前的乐器。大键琴的琴弦在月光下泛光。'
      : '音乐室的大键琴……琴弦在微微颤动。没有人碰它。',
    bedroom: visitCount === 1
      ? '卧室的四柱床帐幔低垂。梳妆台上积了一层薄灰。'
      : '卧室里还是那样安静。但床上的枕头……有人躺过的痕迹。',
    cellar: visitCount === 1
      ? '蜡烛照亮了地下室的一角。酒架上排列着标有年份的酒瓶。'
      : '地下室的酒味更浓了。深处的滴水声……节奏变了。',
    tower: visitCount === 1
      ? '塔楼顶部，月光倾泻而下。风琴静静地立在中央。'
      : '塔楼里月光依旧。但风琴的琴键上……有灰尘被拂过的痕迹。'
  };

  // Cycle 2: truth emerging, things are wrong
  const c2 = {
    hall: visitCount === 1
      ? '你回到了大厅，但壁炉的火已经灭了。挂毯上有一大片暗色的污渍，不像是水渍。盔甲……它的姿势变了。它刚才不是面对着门的。'
      : '大厅里，盔甲的影子投在墙上，像是一个举起手臂的人。',
    dining: visitCount === 1
      ? '餐厅里，长桌上的晚餐没有被动过——但它们已经腐烂了，像是放了好几个星期。肖像画中流血了，暗红色的液体顺着画框滴到地板上。'
      : '餐厅的肖像画还在流血。宝石和飞鸿缩在角落里，不肯抬头。',
    study: visitCount === 1
      ? '书房里，笛杰不见了。书架上多了一本书，封面上没有名字，只有一个记号：A&F。地上有脚印，从书架延伸到门口，然后消失了。'
      : '书房的书架上，那本A&F的书还在。翻开它，里面全是手写的乐谱。',
    music: visitCount === 1
      ? '音乐室里，大键琴的琴盖是开着的。琴弦在震动，发出微弱的声音——像是有人在很远的地方弹奏。小提琴盒也打开了，但里面是空的。'
      : '音乐室的大键琴又响了。这次你听到了一个旋律……是《月光奏鸣曲》的第一乐章。',
    bedroom: visitCount === 1
      ? '卧室的床上，枕头凹陷着，像是有人刚刚离开。梳妆台的镜子碎了，碎片散落在地上，每一片都映出不同的画面。'
      : '卧室里，碎镜片中的画面更清晰了——你看到了两个男人，他们紧紧抱在一起。',
    cellar: visitCount === 1
      ? '地下室的墙上出现了血手印，从地面一直延伸到天花板。垃垃的水晶球裂开了，里面是一片血雾。酒架上最老的那瓶酒——1791年——标签上多了一行字。'
      : '地下室的血手印更多了。它们似乎在指引你去某个地方。',
    tower: visitCount === 1
      ? '塔楼里，艾德里安不在。但风琴上放着一张乐谱，只写了一半。月光从窗户照进来，在地板上画出一个长方形——像是一扇门的形状。'
      : '塔楼的风琴上，那半张乐谱被风吹得沙沙作响。你不识字，但你能感觉到，这是一封情书。'
  };

  // Cycle 3: final truths revealed
  const c3 = {
    hall: '大厅里，盔甲倒在地上，手里攥着半张乐谱。壁炉的火重新燃起来了，但火焰是蓝色的。你知道，这是最后一次了。',
    dining: '餐厅里，肖像画恢复了原样——被划掉的脸重新出现了。那是菲利克斯。他在笑。宝石和飞鸿不见了，只在桌上留下了一张字条。',
    study: '书房里，笛杰的竹笛还挂在墙上，但笛身裂开了。书架上所有的书都打开了，每一页都写着同一个名字。',
    music: '音乐室里，大键琴和小提琴在自动演奏。两个声音交织在一起，像是两个人在对话。一个低沉，一个清亮。',
    bedroom: '卧室的四柱床上，放着两枚戒指。内侧都刻着A&F。梳妆台上的镜子完好如初，映出的不是这个房间，而是两百年前的那个冬夜。',
    cellar: '地下室的酒架倒塌了，露出后面的暗门。血手印汇聚成一条线，指向塔楼的方向。',
    tower: '塔楼顶部，艾德里安站在月光中。他不再可怕了。他只是一个等了两百年的人。'
  };

  // Sunrise mode (loop 4+)
  if (loop >= 4) {
    const sunrise = {
      hall: '大厅沐浴在晨光中，壁炉的火重新燃起来了，是温暖的橘黄色。盔甲倒在地上，手里攥着半张乐谱。空气中有淡淡的松香味。',
      dining: '餐厅的长桌上放着两套餐具，面对面。肖像画已经恢复了原样，两个年轻人微笑着看向彼此。桌上有一束新鲜的白玫瑰。',
      study: '书房里弥漫着咖啡和旧书的味道。笛杰的竹笛挂在墙上，不再裂开。书架上多了一本没有名字的书，封面画着两个手拉手的剪影。',
      music: '音乐室里，大键琴和小提琴静静陈列着。阳光透过彩绘玻璃，在地板上投下斑斓的光斑。你仿佛能听到遥远的合奏声。',
      bedroom: '卧室的四柱床上铺着干净的白色床单。梳妆台上的镜子完好如初，映出的是这个房间现在的样子——温暖而安静。',
      cellar: '地下室的酒架被扶正了，一瓶1791年的红酒摆在最显眼的位置。标签上被人新写了一句："致永远的友谊与爱情。"',
      tower: '塔楼顶部，阳光像瀑布一样倾泻而下。风琴上放着一本打开的乐谱，风吹过，纸张轻轻翻动。艾德里安站在窗边，微笑着。'
    };
    return sunrise[room] || '';
  }
  if (loop === 1) return c1[room] || '';
  if (loop === 2) return c2[room] || '';
  return c3[room] || '';
}

function applyLoopVisuals(room, loop) {
  // Show/hide blood stains, footprints etc based on loop
  const bloods = ['hall-blood','dining-blood','cellar-hand'];
  const prints = ['study-prints','bedroom-prints'];
  bloods.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = (loop >= 2) ? 'block' : 'none';
  });
  prints.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = (loop >= 2) ? 'block' : 'none';
  });

  // Update room titles
  const titles = {
    1: { hall:'🏰 大厅', dining:'🍷 餐厅', study:'📚 书房', music:'🎵 音乐室', bedroom:'🛏️ 主卧', cellar:'⚰️ 地下室', tower:'🌙 月光塔楼' },
    2: { hall:'🏰 大厅 · 倒影', dining:'🍷 餐厅 · 血痕', study:'📚 书房 · 足迹', music:'🎵 音乐室 · 回响', bedroom:'🛏️ 主卧 · 残影', cellar:'⚰️ 地下室 · 低语', tower:'🌙 塔楼 · 等待' },
    3: { hall:'🏰 大厅 · 终章', dining:'🍷 餐厅 · 宽恕', study:'📚 书房 · 真相', music:'🎵 音乐室 · 合奏', bedroom:'🛏️ 主卧 · 誓言', cellar:'⚰️ 地下室 · 归途', tower:'🌙 塔楼 · 日出' }
  };
  const t = titles[loop] && titles[loop][room];
  if (t) document.getElementById('title-' + room).textContent = t;
}

function triggerLoop2() {
  // Called when player enters tower with tower_key in loop 1
  if (G.loopTriggered[2]) return;
  stopCountdown();
  G.loop = 2;
  G.flags.loop2_pending=false;
  G.loopTriggered[2] = true;
  // Clear any pending chase
  clearTimeout(chaseDeathTimer); cancelAnimationFrame(chaseRAF);
  G.adrianChasing = false;
  document.getElementById('chase-overlay').classList.remove('active');
  document.getElementById('scene-area').style.animation = '';
  document.getElementById('loop-transition').classList.add('active');
  document.getElementById('loop-title').textContent = '⚰️ 你死了';
  document.getElementById('loop-text').innerHTML =
    '艾德里安的血红色眼睛在你面前放大。<br><br>' +
    '"你知道上一个走进这座塔楼的人是谁吗？"<br>' +
    '"是我的月光。我亲手把他关在了门外，又用两百年，把自己关进了门里。"<br><br>' +
    '然后一切陷入黑暗。<br><br>' +
    '……<br><br>' +
    '你猛然睁开眼睛。<br><br>' +
    '壁炉的火灭了。盔甲的姿势变了。<br>' +
    '有什么东西……不一样了。<br>' +
    '<span style="color:#6a5a4a;font-size:13px;">远处，风琴声又响了。这一次，你听出来了——那是一首没写完的情书。</span>';
  document.getElementById('loop-btn').style.display = 'inline-block';
  G.doors = { study:false, music:false, bedroom:false, cellar:false, tower:false };
  // Reset some puzzle states for loop 2
  G.puzzleSolved = { piano:false, bookshelf:false, dresser:false, wine:false, organ:false, mirror:false, harpsichord:false, flute:false };
  // Remove some items, keep key story items
  const keep = ['burnt_letter_a','burnt_letter_b','letter_c','letter_d','assembled_letter','registry','diary_page','wine_bottle','mirror_shard','tower_key'];
  G.inventory = G.inventory.filter(id => keep.includes(id));
  G.usedItems.clear();
  G.selectedItem = null;
  renderInventory();
  NPC_TALK_COUNT = {};
  // Reset answered flags for new loop
  G.flags['answered_lala'] = false;
  // Reset door visuals
  document.querySelectorAll('.door').forEach(d => d.classList.add('door-locked'));
}

function triggerLoop3() {
  if (G.loopTriggered[3]) return;
  stopCountdown();
  G.loop = 3;
  G.flags.loop3_pending=false;
  G.loopTriggered[3] = true;
  // Clear any pending chase
  clearTimeout(chaseDeathTimer); cancelAnimationFrame(chaseRAF);
  G.adrianChasing = false;
  document.getElementById('chase-overlay').classList.remove('active');
  document.getElementById('scene-area').style.animation = '';
  document.getElementById('loop-transition').classList.add('active');
  document.getElementById('loop-title').textContent = '🌅 真相';
  document.getElementById('loop-text').innerHTML =
    '四张信纸在你手中拼合。<br><br>' +
    '字迹清晰，墨迹犹新，像那个人刚刚搁下笔。<br><br>' +
    '你读完了它。读到一个灵魂在雪地里走了一夜，<br>' +
    '只为等一扇不会再开的门。<br><br>' +
    '然后你听见了——风琴的声音。<br><br>' +
    '不是幻觉。有人在弹。<br><br>' +
    '这一次，不是追捕。<br>' +
    '是等待。是有人把两百年的长夜折成一封信，<br>' +
    '等你替他把回信送回去。';
  document.getElementById('loop-btn').style.display = 'inline-block';
  G.doors = { study:false, music:false, bedroom:false, cellar:false, tower:false };
  G.puzzleSolved = { piano:false, bookshelf:false, dresser:false, wine:false, organ:false, mirror:false, harpsichord:false, flute:false };
  const keep = ['assembled_letter','soul_fragment','pocket_watch','ring','repaired_score','wine_bottle','tower_key','diary_page','duet_score'];
  G.inventory = G.inventory.filter(id => keep.includes(id));
  G.usedItems.clear();
  G.selectedItem = null;
  renderInventory();
  NPC_TALK_COUNT = {};
  // Reset answered flags for new loop
  G.flags['answered_lala'] = false;
  // Reset door visuals
  document.querySelectorAll('.door').forEach(d => d.classList.add('door-locked'));
}

function continueLoop() {
  document.getElementById('loop-transition').classList.remove('active');
  document.getElementById('loop-btn').style.display = 'none';
  gotoRoom('hall');
}

// UI, map routing and preloading consult the same execution requirements.
function castleDoorAccess(room) {
  const rule=CASTLE_DOOR_RULES[room];
  const open=['hall','dining'].includes(room)||!!G.doors[room];
  const keyReady=!!rule&&hasItem(rule.key);
  const dark=(room==='cellar'||room==='tower'&&G.currentRoom==='cellar')&&!hasItem('candle');
  return {open,allowed:!dark&&(open||keyReady),status:dark?'需要蜡烛':open?'已解锁':keyReady?'可用钥匙开启':rule?'需要'+ITEMS[rule.key].name:'尚未开启'};
}
function tryDoor(room) {
  if (room === 'tower' && G.currentRoom === 'cellar' && !hasItem('candle')) {
    showText('地下室太黑了，你摸不到通往塔楼的门。', true); return;
  }
  const access=castleDoorAccess(room);
  if(!access.allowed){CastleAudio.effect('locked');showText(access.status+'。',access.status==='需要蜡烛');return;}
  if (G.doors[room]) { gotoRoom(room); return; }
  const req = CASTLE_DOOR_RULES[room];
  if (req && hasItem(req.key)) {
    G.doors[room] = true;
    CastleAudio.effect('unlock');
    document.querySelectorAll('[onclick*="tryDoor(\'' + room + '\')"]').forEach(el => {
      if (el.classList.contains('door-locked')) el.classList.remove('door-locked');
    });
    removeItem(req.key);
    markUsed(req.key);
    showText(req.text);
    showAchievement('新区域解锁', '进入了' + roomName(room));
    if (room === 'tower' && G.loop === 1) {
      G.flags.loop2_pending=true;
      setTimeout(() => triggerLoop2(), 1500);
    }
  } else {
    CastleAudio.effect('locked');
    showText('门锁着。需要找到对应的钥匙。');
  }
}

let chaseDeathTimer = null;
let chaseHoldStart = 0;
let chaseMode = null;
let chasePattern = [];
let chaseTaps = 0;
let chaseProgress = 0;
let chaseRAF = null;

// ====== 升级追逐战：三种按法，艾德里安越来越强 ======


function pickChaseMode() {
  const pool = G.loop === 2 ? ['hold','rhythm'] : ['hold','rhythm','mash'];
  return pool[Math.floor(Math.random() * pool.length)];
}

function triggerAdrian() {
  // 灵魂残音庇护：艾德里安不会伤害菲利克斯看着的人
  if (hasItem('soul_fragment')) {
    showText('艾德里安的身影从黑暗中逼近——他掌心的血光几乎触到你的咽喉。突然，你怀里的灵魂残音亮了。他的手指停在半空，剧烈地颤抖起来。', true);
    setTimeout(() => {
      showText('"是你……你一直在看着我们，对吗？"艾德里安踉跄后退，血红色的眼睛里第一次有了别的颜色。他退进黑暗里，声音飘过来："我不会伤害他看着的人。走吧——趁我还记得。"', true);
    }, 2200);
    showAchievement('灵魂庇护', '菲利克斯替你挡下了他');
    return;
  }
  if (hasItem('candle') && G.candleLit) {
    showText('艾德里安的身影在走廊尽头一闪而过。蜡烛的火光让他无法靠近。', true);
    return;
  }
  G.adrianChasing = true;
  chaseMode = pickChaseMode();
  chasePattern = [];
  chaseTaps = 0;
  chaseProgress = 0;
  const m = CHASE_MODES[chaseMode];
  document.getElementById('chase-overlay').classList.add('active');
  document.getElementById('scene-area').style.animation = 'flicker 0.5s infinite';
  document.getElementById('chase-bar').style.width = '0%';
  document.getElementById('chase-btn').textContent = m.btn;
  document.querySelector('#chase-overlay h2').textContent = m.icon + ' 艾德里安来了——' + m.title;
  document.querySelector('#chase-overlay .chase-card > p').innerHTML = '血红色的眼睛在黑暗中凝视着你……<br>' + m.desc;
  document.getElementById('chase-timer').textContent = m.hint + '（限时 ' + (m.timeLimit/1000) + ' 秒）';

  G.chaseDeadline = CastleClock.now() + m.timeLimit;
  chaseDeathTimer = setTimeout(() => { dieByAdrian(); }, m.timeLimit);
}

function chaseProgressUpdate(pct) {
  chaseProgress = pct;
  document.getElementById('chase-bar').style.width = Math.min(100, pct) + '%';
  if (pct >= 100) {
    clearTimeout(chaseDeathTimer);
    cancelAnimationFrame(chaseRAF);
    evadeAdrian();
  }
}

function startHoldBreath(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (!G.adrianChasing) return;
  const btn = document.getElementById('chase-btn');
  if (btn.classList.contains('holding')) return;
  btn.classList.add('holding');
  chaseHoldStart = CastleClock.now();

  if (chaseMode === 'mash') {
    // 连点模式：每次按下+1
    chaseTaps++;
    chaseProgressUpdate((chaseTaps / 15) * 100);
    document.getElementById('chase-timer').textContent = '快跑！' + chaseTaps + ' / 15';
    return;
  }
  if (chaseMode === 'rhythm') {
    document.getElementById('chase-timer').textContent = '……（记下这一按的时长）';
    return;
  }
  // hold 模式
  document.getElementById('chase-timer').textContent = '屏息中……不要松手！';
  function updateBar() {
    if (!G.adrianChasing || !btn.classList.contains('holding') || chaseMode !== 'hold') return;
    const elapsed = CastleClock.now() - chaseHoldStart;
    const pct = Math.min(100, (elapsed / 2000) * 100);
    document.getElementById('chase-bar').style.width = pct + '%';
    if (pct < 100) { chaseRAF = requestAnimationFrame(updateBar); }
    else { clearTimeout(chaseDeathTimer); evadeAdrian(); }
  }
  chaseRAF = requestAnimationFrame(updateBar);
}

function endHoldBreath(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (!G.adrianChasing) return;
  const btn = document.getElementById('chase-btn');
  if (!btn.classList.contains('holding')) return;
  btn.classList.remove('holding');
  cancelAnimationFrame(chaseRAF);
  const dur = CastleClock.now() - chaseHoldStart;

  if (chaseMode === 'mash') return; // 连点只看按下次数
  if (chaseMode === 'rhythm') {
    chasePattern.push(dur >= 400 ? 'L' : 'S');
    document.getElementById('chase-timer').textContent = '节奏：' + chasePattern.join('·');
    if (chasePattern.length >= 3) {
      const pat = chasePattern.slice(-3).join('');
      if (pat === 'LSS') {
        chaseProgressUpdate(100);
      } else {
        clearTimeout(chaseDeathTimer);
        dieByAdrian();
      }
    } else {
      chaseProgressUpdate(chasePattern.length * 25);
    }
    return;
  }
  // hold 模式
  if (dur < 2000) {
    clearTimeout(chaseDeathTimer);
    dieByAdrian();
  }
}

function dieByAdrian() {
  G.adrianChasing = false;
  document.getElementById('chase-overlay').classList.remove('active');
  document.getElementById('scene-area').style.animation = '';
  document.getElementById('chase-bar').style.width = '0%';
  document.getElementById('chase-btn').classList.remove('holding');

  if (G.loop === 1) {
    // Fallback - shouldn't happen since chase is disabled in loop 1
    showText('艾德里安的血红色眼睛在你面前放大。你感觉到冰冷的手指扼住了你的咽喉……', true);
    setTimeout(() => triggerLoop2(), 2000);
  } else {
    // Loop 2+: Wrong Ending
    setTimeout(() => {
      document.getElementById('we-screen').classList.add('active');
    }, 800);
  }
}

function evadeAdrian() {
  G.adrianChasing = false;
  document.getElementById('chase-overlay').classList.remove('active');
  document.getElementById('scene-area').style.animation = '';
  document.getElementById('chase-bar').style.width = '0%';
  document.getElementById('chase-btn').classList.remove('holding');
  const taunts = [
    '你躲过了他。黑暗中传来他低低的笑声："跑得不错。但古堡是我的。"',
    '你屏住呼吸，躲在阴影中。艾德里安的脚步声渐渐远去……但下一次，他不会这么慢了。',
    '他的指尖擦过你的后颈，却抓了个空。走廊深处传来一声叹息："又一个会跑的。有意思。"'
  ];
  showText(taunts[Math.floor(Math.random() * taunts.length)], true);
}

function updateQuestMarkers() {
  // Refresh quest markers each time
  document.querySelectorAll('.npc-quest').forEach(el => el.classList.remove('npc-quest'));
  // NPCs with started-but-unfinished quests keep their pulse
  ['tim','jerry','dijie','lala'].forEach(n => {
    const q = G.npcQuests[n];
    const el = document.getElementById('npc-' + n);
    if (q && q.started && !q.done && el) el.classList.add('npc-quest');
  });
  if (G.loop < 2 || G.loop >= 4) return;
  if (G.currentRoom === 'hall' && hasItem('burnt_letter_a') && !G.flags.gave_letter_a && !G.flags.gift_siyang_burnt_letter_a) {
    document.getElementById('npc-siyang')?.classList.add('npc-quest');
  }
  if (G.currentRoom === 'dining' && hasItem('burnt_letter_b') && !G.flags.gave_letter_b && !G.flags.gift_bingbing_burnt_letter_b) {
    document.getElementById('npc-bingbing')?.classList.add('npc-quest');
  }
}

function examine(item) {
  if (G.adrianChasing) { showText('艾德里安就在附近……现在不能分心！', true); return; }

  // ========== 大厅物品 ==========
  if (item === 'piano') {
    if (G.puzzleSolved.piano) {
      if (G.loop >= 4 && !hasItem('broken_string')) {
        showText('钢琴的琴弦有一根是断的。断口参差不齐——是被人用剪刀剪断的。你取下这根羊肠弦，它曾在某个冬夜发出过最后一个音。');
        addItem('broken_string'); return;
      }
      showText(G.loop === 1 ? '钢琴已经弹过了。琴键上还留着你的指温。' : G.loop >= 4 ? '钢琴沐浴在晨光中，琴键上有一朵小小的干花。' : '钢琴的琴键在月光下泛着惨白的光。琴盖内侧刻着一行小字："给F，我的月光。——A"');
      return;
    }
    const pp = pianoPuzzle();
    openModal('<h3>破损的钢琴</h3><p>这是一架19世纪的方形钢琴。中央的音区还算完整，但<b>琴键上没有标记任何音名</b>。</p><p>' + pp.source + '：</p>' +
      '<div style="text-align:center;font-size:28px;letter-spacing:12px;color:#c8b89a;margin:20px 0;font-weight:bold;">' + pp.letters + '</div>' +
      '<p style="color:#8a7a6a;font-size:13px;">' + pp.hint + '</p>' +
      renderPianoNoLabels() +
      '<p id="piano-hint" style="text-align:center;color:#8a7a6a;margin-top:10px;"></p>');
    return;
  }

  if (item === 'armor') {
    if (G.loop >= 4 && !hasItem('cufflinks')) {
      showText('盔甲倒在地上，右手攥成了拳。你轻轻掰开——里面躺着一对银袖扣，扣面上刻着交叉的琴弓与笔。内侧有一行几乎磨平的字："写给他的第一千个清晨。"');
      addItem('cufflinks'); return;
    }
    if (hasItem('brass_key')) { showText('盔甲手中空无一物。你已经拿走了钥匙。'); return; }
    if (G.loop >= 2) {
      showText('盔甲的姿势变了。它不再面向门口，而是面向墙壁——面向一幅被划掉的肖像。它的手伸向前方，像是在挽留什么。');
      addItem('brass_key'); showAchievement('获得道具', '黄铜钥匙');
      return;
    }
    if (hasItem('bow')) {
      showText('你用Tim的琴弓挑开盔甲指缝间的机关。咔哒一声，一把黄铜钥匙掉了出来——琴弓的弓毛断了几根，像完成了使命的剑。');
      addItem('brass_key'); markUsed('bow'); removeItem('bow'); showAchievement('获得道具', '黄铜钥匙');
      return;
    }
    showText('盔甲的手中似乎握着什么，但被锁住了。旁边刻着一行字："以音为剑，以弦为锋。"也许……需要某种"剑"？');
    return;
  }

  if (item === 'tapestry') {
    if (G.loop >= 4 && !hasItem('sketch')) {
      showText('挂毯后面露出一幅铅笔素描——是一个年轻人拉小提琴的侧影。笔法温柔，每一笔都像是在抚摸。背面写着："我的月光，我的叛徒，我的唯一。——A"');
      addItem('sketch'); return;
    }
    if (G.loop === 1) {
      if (hasItem('burnt_letter_a')) { showText('挂毯上的字母在烛光下泛着暗红：' + pianoPuzzle().letters + '。'); return; }
      showText('你掀开挂毯一角，壁炉的灰烬中露出半张烧焦的信纸。');
      addItem('burnt_letter_a'); showAchievement('获得道具', '焦信A');
    } else {
      showText('挂毯上的暗红色污渍……不是绣上去的。你凑近闻了闻，是铁锈味。污渍重新排列成了新的字母：' + pianoPuzzle().letters + '。挂毯背面有人用指甲刻了一行字："他不是我杀的。是我放他走的。"');
      if (!hasItem('burnt_letter_a')) { addItem('burnt_letter_a'); showAchievement('获得道具', '焦信A'); }
    }
    return;
  }

  if (item === 'candle') {
    if (hasItem('candle')) { showText('你已经有一支蜡烛了。'); return; }
    showText('你取走了一支白蜡烛。火光在黑暗中显得格外温暖，但也让阴影变得更加浓重。');
    addItem('candle'); G.candleLit = true;
    return;
  }

  // ========== 餐厅物品 ==========
  if (item === 'table') {
    if (G.loop >= 4 && !hasItem('dried_flower')) {
      showText('长餐桌的抽屉里，有一朵压干的白玫瑰，夹在一张乐谱的扉页里。花瓣已经脆了，但还能闻到淡淡的香气。标签上写着："第一次演奏会，他送我的。——F"');
      addItem('dried_flower'); return;
    }
    if (hasItem('iron_key')) {
      showText(G.loop === 1 ? '长餐桌上摆着未动的晚餐。一个高脚杯底部刻着一行小字："酒的密码，是死亡的年份。"' : G.loop >= 4 ? '长餐桌上放着两套餐具，面对面。桌上有一束新鲜的白玫瑰。' : '长餐桌上的晚餐腐烂了。但餐具的摆放……像是两个人在共进晚餐。');
      return;
    }
    showText('你检查长餐桌的抽屉，里面有一把铁钥匙，还有一张折叠的纸——是古堡登记簿的残页。');
    addItem('iron_key'); addItem('registry'); showAchievement('获得道具', '铁钥匙与登记簿');
    return;
  }

  if (item === 'portrait_dining') {
    if (G.loop >= 4 && !hasItem('masquerade_mask')) {
      showText('肖像画后面掉出一只威尼斯风格的银色半脸面具，边缘镶嵌着小颗水晶。内侧用铅笔写着："1823年圣诞舞会上，他戴着这个向我走来。——A"');
      addItem('masquerade_mask'); return;
    }
    if (hasItem('burnt_letter_b')) {
      const extra = G.loop >= 2 && G.loop < 4 ? '肖像画的流血停止了。被划掉的脸……边缘开始变得清晰。那是菲利克斯。他在笑，像是隔着两百年的灰尘，对你一个人笑。' : G.loop >= 4 ? '肖像画恢复了原样，两个年轻人微笑着看向彼此。画框背面刻着："A & F —— 吾爱，1823年冬。"' : '肖像画中有两个人。但其中一个的脸被刀划掉了。画框背面用刀刻着："A & F —— 吾爱，1823年冬。"画框角落还有一行褪色的赠语："Isabella —— 吾之小妹，愿月光宽恕你我。"';
      showText(extra);
      G.flags.read_portrait_name = true;
      if (G.loop === 1 && !G.names.bingbing) { G.flags.nameclue_bingbing = true; setTimeout(() => showText('画框角落的赠语写着："Isabella——吾之小妹。"餐厅里那位白裙女子，似乎对这个名字有反应……'), 400); }
      return;
    }
    showText('你翻开肖像画，画框背面的暗格里藏着半张烧焦的信纸。暗格内侧刻着两行字："A & F —— 吾爱，1823年冬。"下面还有一行小一些的："Isabella —— 吾之小妹，愿月光宽恕你我。"');
    addItem('burnt_letter_b'); G.flags.read_portrait_name = true;
    if (G.loop === 1 && !G.names.bingbing) { G.flags.nameclue_bingbing = true; }
    showAchievement('获得道具', '焦信B');
    return;
  }

  if (item === 'musicbox') {
    if (hasItem('soul_fragment')) { showText('音乐盒已经空了。'); return; }
    if (!hasItem('mirror_shard')) {
      openModal('<h3>音乐盒</h3><p>一个精致的音乐盒，但发条锈死了。盒盖上刻着一行字：</p><p><b>"打开我的不是钥匙，是光。"</b></p><p>音乐盒旁边有一面镜子，也许可以用什么东西反射光线？</p>');
      return;
    }
    CastleAudio.effect('music-box');
    if (G.loop === 1) {
      showText('你用碎镜片反射烛光，照进了音乐盒的缝隙。盒盖弹开，一道柔和的蓝光飘了出来——但它只是轻轻碰了碰你的手背，又缩了回去。像是认出了你不是它要等的人。');
    } else {
      showText('你用碎镜片反射烛光，照进了音乐盒的缝隙。盒盖弹开，一道柔和的蓝光飘了出来——那是菲利克斯的灵魂残音，被封印了两百年。它绕着你转了三圈，最后安静地落在你掌心，像一只终于找到归途的鸟。');
      addItem('soul_fragment');
      showAchievement('灵魂解救', '菲利克斯的残音');
      setTimeout(() => showText('灵魂残音在你掌心轻轻发烫。你忽然明白了——只要它还在你身边，艾德里安就不会真正伤害你。他不是不敢，是不忍：他不会伤害菲利克斯看着的人。'), 2500);
    }
    return;
  }

  if (item === 'mirror') {
    if (hasItem('mirror_shard')) { showText('镜子已经碎了，碎片被你收走了。'); return; }
    CastleAudio.effect('glass');
    showText(G.loop === 1 ? '你敲碎了一小块镜子。碎片中……映出的不是你的脸。' : '你敲碎了一小块镜子。碎片中映出了一个穿礼服的年轻人，他微笑着说："帮我把信带给他。告诉他，门外的雪不冷——真正冷的，是他一个人守着的那架琴。"');
    addItem('mirror_shard');
    return;
  }

  // ========== 书房物品 ==========
  if (item === 'bookshelf') {
    if (G.puzzleSolved.bookshelf) {
      if (G.loop >= 4 && !hasItem('silk_handkerchief')) {
        showText('书架的暗格深处，有一块叠得整整齐齐的丝绸手帕。绣着梅花和竹子，角落用金线绣着A&F。这是菲利克斯的随身之物，艾德里安一直藏在这里。');
        addItem('silk_handkerchief'); return;
      }
      showText('书架的暗格已经打开，里面空空如也。'); return;
    }
    const mode = Math.min(G.loop, 3);
    const intros = {
      1: '书架上有五本厚重的乐谱集，凌乱地排列着。书脊上积了薄薄一层灰，但每一本都被人反复翻阅过。',
      2: '循环改变了一切——书脊上的调名淡了，浮现金色的<b>年份</b>，像五块墓碑。',
      3: '这一次，书脊上浮现的是<b>速度标记</b>。像有人要求你，用一个故事该有的节奏，把它重新讲完。'
    };
    const hints = {
      1: '这些书在等待某种顺序……按<b>调号的升号数量</b>，从少到多。',
      2: '按<b>成曲年份</b>排列：从最早，到最晚。',
      3: '按<b>速度标记</b>排列：从最慢，到最快。'
    };
    openModal('<h3>神秘书架</h3><p>' + intros[mode] + '</p>' +
      '<p style="color:#8a7a6a;font-size:13px;">' + hints[mode] + '</p>' +
      renderBookshelfItems(mode));
    return;
  }

  if (item === 'globe') {
    if (G.loop >= 4 && !hasItem('travel_notes')) {
      showText('地球仪的底座里，藏着一本薄薄的笔记。菲利克斯的旅行计划，写满了对东方的向往。最后一页贴着一张 silk road 的草图，边缘写着："如果他能一起去，沙漠也会变成花园。"');
      addItem('travel_notes'); return;
    }
    if (hasItem('rose_key')) { showText('地球仪上标注着各个音乐重镇。你转动它，底座传来轻微的咔哒声。暗格内侧贴着一张剧团海报的残片："著名占卜师薇薇安女士，万圣节特邀演出——让水晶球替你说话。"');
      if (G.loop === 1 && !G.names.qiqi) { G.flags.nameclue_qiqi = true; setTimeout(() => showText('海报残片上的名字——"薇薇安女士"。书房里那位戏服占卜者听到这个名字，或许会想起什么。'), 400); }
      return; }
    showText('你转动地球仪，底座弹开一个小暗格。里面有一把刻着玫瑰花纹的钥匙，还有一支音叉。暗格内侧还贴着一张褪色的剧团海报残片："著名占卜师薇薇安女士，万圣节特邀演出——让水晶球替你说话。"');
    CastleAudio.effect('mechanism');
    addItem('rose_key'); addItem('tuning_fork'); showAchievement('获得道具', '玫瑰钥匙与音叉');
    if (G.loop === 1 && !G.names.qiqi) { G.flags.nameclue_qiqi = true; }
    return;
  }

  if (item === 'flute_stand') {
    if (G.puzzleSolved.flute) { showText('竹笛已经吹奏过了。笛身的裂纹里透出一点微光。底座上刻着赠语："赠林先生——愿五声入西风。伯爵手书。"');
      if (G.loop === 1 && !G.names.dijie) { G.flags.nameclue_dijie = true; setTimeout(() => showText('笛架上的赠语——"赠林先生"。书房里那位竹笛乐师，听到这个姓氏会有反应吧。'), 400); }
      return; }
    const fp = FLUTE_PUZZLES[Math.min(G.loop, 3)];
    openModal('<h3>竹笛架</h3><p>一支竹笛挂在墙上。底座上刻着一行赠语：<b>"赠林先生——愿五声入西风。伯爵手书。"</b>旁边还刻着：</p>' +
      '<p>"这支笛子……让古堡在震动。但普通的曲子没用，必须是<b>五声音阶</b>。"</p>' +
      '<div class="bamboo-tubes">' +
      '<button type="button" class="bamboo-tube" onclick="window.playFlute(2)">角</button>' +
      '<button type="button" class="bamboo-tube" onclick="window.playFlute(4)">羽</button>' +
      '<button type="button" class="bamboo-tube" onclick="window.playFlute(0)">宫</button>' +
      '<button type="button" class="bamboo-tube" onclick="window.playFlute(1)">商</button>' +
      '<button type="button" class="bamboo-tube" onclick="window.playFlute(3)">徵</button>' +
      '</div>' +
      '<p style="color:#8a7a6a;font-size:13px;">' + fp.hint + '</p>' +
      '<p id="flute-hint" style="text-align:center;color:#8a7a6a;"></p>');
    if (G.loop === 1 && !G.names.dijie) { G.flags.nameclue_dijie = true; }
    return;
  }

  // ========== 音乐室物品 ==========
  if (item === 'harpsichord') {
    if (G.puzzleSolved.harpsichord) {
      if (G.loop >= 4 && !hasItem('music_box_part')) {
        showText('大键琴的共鸣箱深处，卡着一个精密的齿轮。比现在的八音盒零件小很多。齿轮上刻着："致菲利克斯，愿音乐永远陪伴你。——A，1822"');
        addItem('music_box_part'); return;
      }
      showText('大键琴已经调好了。'); return;
    }
    if (!hasItem('tuning_fork')) { showText('大键琴走调了。谱架上别着一张褪色的名片："塞西尔 · 铜管与调律——让每个音程都诚实。"需要A=415Hz的音叉才能校准。');
      if (G.loop === 1 && !G.names.jerry) { G.flags.nameclue_jerry = true; setTimeout(() => showText('名片上的名字——"塞西尔"。音乐室里那位铜管乐手，听到这个名字也许会回过神来。'), 400); }
      return; }
    const hp = HARP_PUZZLES[Math.min(G.loop, 3)];
    let opts = '';
    hp.options.forEach(o => {
      opts += '<button type="button" class="puzzle-piece" onclick="window.selectWolf(this,\'' + o + '\')">' + o + '<br><span style="font-size:11px;color:#8a7a6a;">' + hp.label + '</span></button>';
    });
    openModal('<h3>巴洛克大键琴</h3><p>' + hp.intro + '</p>' +
      '<p style="color:#8a7a6a;font-size:12px;">谱架上别着一张褪色的名片："塞西尔 · 铜管与调律——让每个音程都诚实。"</p>' +
      '<div class="puzzle-pieces">' + opts + '</div>' +
      '<p id="wolf-hint" style="text-align:center;color:#8a7a6a;"></p>');
    if (G.loop === 1 && !G.names.jerry) { G.flags.nameclue_jerry = true; }
    return;
  }

  if (item === 'violin_case') {
    if (hasItem('bow')) { showText('小提琴盒是空的。'); return; }
    if (G.loop === 1 && !G.npcQuests.tim.started) { showText('一把精致的小提琴盒，但锁着。上面刻着："我的剑，用马尾编成。"'); return; }
    if (G.loop >= 2 && G.usedItems.has('bow')) {
      showText('琴盒里又躺着一把琴弓——循环把它送了回来。弓毛完好，像从未断过。');
      addItem('bow'); showAchievement('获得道具', '琴弓（复得）');
      return;
    }
    showText('琴盒咔哒一声开了。里面是一把古老的琴弓。');
    CastleAudio.effect('unlock');
    addItem('bow'); G.npcQuests.tim.done = true; showAchievement('获得道具', '琴弓');
    return;
  }

  // ========== 卧室物品 ==========
  if (item === 'bed') {
    if (G.loop >= 4 && !hasItem('love_poem')) {
      showText('床垫下藏着一张从某本书上撕下的纸，上面抄着歌德的诗句："谁若想在厄运时得到援助，就应在平日待人以宽。"字迹是艾德里安的，最后一个字洇开了，像是一滴眼泪。');
      addItem('love_poem'); return;
    }
    if (hasItem('letter_c')) { showText('床幔后面什么都没有了。'); return; }
    showText('你掀开床幔，在床垫缝隙中发现了一张泛黄的信纸。');
    addItem('letter_c'); showAchievement('获得道具', '信C');
    return;
  }

  if (item === 'dresser') {
    if (G.puzzleSolved.dresser) { showText('梳妆台的抽屉开着，里面空空如也。'); return; }
    const dp = DRESSER_PUZZLES[Math.min(G.loop, 3)];
    openModal('<h3>珠宝盒</h3><p>梳妆台上有一个精致的珠宝盒，需要四位数密码。</p>' +
      '<p>提示：' + dp.hint + '</p>' +
      '<p style="color:#8a7a6a;font-size:12px;">' + dp.sub + '</p>' +
      '<div class="password-input">' +
      '<input type="text" inputmode="numeric" pattern="[0-9]" aria-label="密码数字" maxlength="1" id="p1" oninput="window.nextPass(1)">' +
      '<input type="text" inputmode="numeric" pattern="[0-9]" aria-label="密码数字" maxlength="1" id="p2" oninput="window.nextPass(2)">' +
      '<input type="text" inputmode="numeric" pattern="[0-9]" aria-label="密码数字" maxlength="1" id="p3" oninput="window.nextPass(3)">' +
      '<input type="text" inputmode="numeric" pattern="[0-9]" aria-label="密码数字" maxlength="1" id="p4" oninput="window.checkDresserPass()">' +
      '</div>');
    setTimeout(() => { const p1 = document.getElementById('p1'); if (p1) p1.focus(); }, 100);
    return;
  }

  // ========== 地下室物品 ==========
  if (item === 'wine') {
    if (!hasItem('candle')) { showText('地下室太黑了，酒架上的标签完全看不清。', true); return; }
    if (hasItem('wine_bottle')) { showText('酒架上积满了灰尘。1791年的那瓶已经被你取走了。瓶塞内侧烙着一行小字："满月之夜，由塞勒涅女士执杯占卜。"'); return; }
    showText('蜡烛照亮了酒架。最老的那瓶酒——1791年。标签上写着："天才与美酒都不能久存。"瓶塞内侧还烙着一行小字："满月之夜，由塞勒涅女士执杯占卜。"');
    addItem('wine_bottle');
    if (G.loop === 1 && !G.names.lala) { G.flags.nameclue_lala = true; setTimeout(() => showText('瓶塞上的名字——"塞勒涅女士"。地下室里那位紫袍女巫，听到这个名字会想起满月之夜的。'), 400); }
    return;
  }

  // ========== 塔楼物品 ==========
  if (item === 'organ') {
    if (G.loop >= 4 && !hasItem('star_chart')) {
      showText('你爬上琴凳，推开塔楼高窗的窗框——月光倾泻的窗台上，压着一张手绘星图。月光倾洒处用朱砂圈出了织女星。角落写着："那晚我们在塔楼看星星。他说东方传说里，这对星星一年只能见一面。我说，那我们替他们天天见。——A"');
      addItem('star_chart'); showAchievement('隐藏发现', '星图残页');
      return;
    }
    if (!hasItem('assembled_letter')) { showText('风琴静静地立在月光下。你需要找到真相，才能演奏最后的安魂曲。'); return; }
    if (G.loop === 2) { showText('风琴安静地立在月光下。但琴盖是锁着的——上面写着："先把真相带到塔楼，再来弹我。"你需要先破解所有房间，拼齐菲利克斯的信件。'); return; }
    if (!hasItem('repaired_score')) { showText('你带来了真相，但安魂曲还没有补全。'); return; }
    if (!hasItem('soul_fragment')) { showText('艾德里安挡住了风琴。"你以为一封信就能打动我吗？我要的是他……把他的灵魂带来。"', true); return; }
    if (G.puzzleSolved.organ) { showText('风琴已经奏响过了。余音还留在月光里。'); return; }

    // ====== 结局不由你选择，而由你一路带来了什么决定 ======
    let movement = 1;
    let reason = '你带回了真相、补全的安魂曲，和他的灵魂残音——这是最少的行李，刚好够一场告别。';
    let reasonTitle = '第一乐章：悲怆的慢板';
    if ((G.flags.diary_count || 0) >= 3 && hasItem('wine_bottle')) {
      movement = 3;
      reasonTitle = '第三乐章：永别的急板';
      reason = '你带来了他完整的日记——三页残页拼出的、两百年没敢寄出的忏悔；还有1791年的酒——他们相遇的那一年。艾德里安看着这两样东西，笑了，又哭了："原来你把我们的一生都带来了。那最后一章，就不是永别——是重逢。"';
    } else if (G.flags.gave_final) {
      movement = 2;
      reasonTitle = '第二乐章：柔情的小快板';
      reason = '你没有急着弹琴。你先让他读了那封信，让他在琴声响起之前，就和掌心的蓝光重逢过了一次。有些告别，在第一个音符落下之前，就已经完成了。';
    } else if (hasItem('ring') && hasItem('pocket_watch')) {
      movement = 2;
      reasonTitle = '第二乐章：柔情的小快板';
      reason = '你把刻着A&F的戒指和停在11:47的怀表，轻轻放在了琴键旁。誓言与凝固的时间都到齐了——艾德里安看了一眼，声音低下去："他都留着……原来他也都留着。"';
    }
    scheduleStoryImagePreload([CASTLE_OVERLAY_ART['ending'+movement].asset]);
    openModal('<h3>月光风琴</h3>' + CastleUI.modalArt('score') + '<p>补全的乐谱《致菲利克斯的安魂曲》摆在谱架上。菲利克斯的灵魂残音从你掌心升起，安静地落在艾德里安的肩头。</p>' +
      '<p>艾德里安的手指悬在琴键上方："两百年了，我每晚都弹前两章。第三乐章……我不敢弹。但今晚不一样——今晚，月光在听。"</p>' +
      '<div class="memory-content"><p style="color:#8a9ac8;font-size:12px;margin-bottom:8px;">♪ 你一路带来的东西，决定了这首曲子的走向：</p><p>' + reason + '</p></div>' +
      '<p style="text-align:center;color:#c8b89a;">即将奏响：<b>' + reasonTitle + '</b></p>' +
      '<button class="game-btn" data-ending-movement="' + movement + '" onclick="closeModal();window.playOrgan(' + movement + ')">奏响《致菲利克斯的安魂曲》</button>');
    return;
  }
}

let pianoSequence = [];
// 每个循环的钢琴旋律不同：挂毯上的字母会随循环改变

function pianoPuzzle() { return PIANO_PUZZLES[Math.min(G.loop, 3)]; }

function renderPianoNoLabels() {
  let html = '<div class="piano-keys">';
  const blacks = [1, 1, 0, 1, 1, 1, 0];
  for (let i = 0; i < 7; i++) {
    html += '<button type="button" class="piano-key" aria-label="钢琴白键" onclick="window.playPianoKey(' + i + ')"></button>';
    if (blacks[i]) {
      html += '<button type="button" class="piano-key black" aria-label="钢琴黑键" onclick="window.playPianoBlack(' + i + ')"></button>';
    }
  }
  html += '</div>';
  return html;
}
function playPianoKey(idx) {
  if(G.puzzleSolved.piano)return;
  CastleAudio.tone([261.63,293.66,329.63,349.23,392,440,493.88][idx]);
  pianoSequence.push(idx);
  const hint = document.getElementById('piano-hint');
  if (hint) hint.textContent = '已按下 ' + pianoSequence.length + ' 个白键...';
  if (pianoSequence.length >= 5) {
    const last5 = pianoSequence.slice(-5);
    if (last5.join(',') === pianoPuzzle().seq.join(',')) {
      G.puzzleSolved.piano = true;
      closeModal();
      showText('钢琴发出一声低沉的共鸣。书房的方向传来门锁开启的声音！');
      CastleAudio.effect('piano-unlock');
      G.doors.study = true;
      document.getElementById('door-study').classList.remove('door-locked');
      showAchievement('谜题解开', '钢琴旋律开启了书房');
      CastleUI.sync();
    } else {
      pianoSequence = [];
      if (hint) hint.textContent = '不对……旋律中断了。';
    }
  }
}
function playPianoBlack(idx) {
  CastleAudio.tone([277.18,311.13,369.99,415.30,466.16,554.37,622.25][idx]);
  const hint = document.getElementById('piano-hint');
  pianoSequence = [];
  if (hint) hint.textContent = '黑键的声音……让墙壁震动了一下。旋律中断了。';
}

let bookOrder = [];
// 五本书的元数据：每个循环按不同规则排序


// 循环1按升号数量(C<G<D<A<E)；循环2按年份(1680<1720<1787<1791<1845)；循环3按速度(Adagio<Andante<Moderato<Allegro<Presto)


function renderBookshelfItems(mode) {
  let html = '<div class="sort-items">';
  BOOK_DISPLAY.forEach(id => {
    const b = BOOKS.find(x => x.id === id);
    let sub = '';
    if (mode === 2) sub = '<br><span style="font-size:11px;color:#8a7a6a;">成曲于 ' + b.year + ' 年</span>';
    if (mode === 3) sub = '<br><span style="font-size:11px;color:#8a7a6a;">' + b.tempo + '</span>';
    html += '<button type="button" class="sort-item" data-book="' + id + '" onclick="window.bookClicked(this)">' + b.icon + ' ' + b.title + sub + '</button>';
  });
  return html + '</div><p id="puzzle-feedback" role="status"></p>';
}
function collectDiaryPage() {
  G.flags.diary_count = Math.min(3, (G.flags.diary_count || 0) + 1);
  const n = G.flags.diary_count;
  addItem('diary_page');
  const names = { 1:'日记残页·一', 2:'日记残页·二', 3:'完整的日记' };
  const details = {
    1: '艾德里安的日记残页（第一页，共三页）。写于菲利克斯离开的那个雪夜。纸页的边缘有烧焦的痕迹——还有两页，散佚在别的循环里。',
    2: '艾德里安的日记残页（已集齐两页）。字迹从工整到潦草，墨水深浅不一。还差最后一页。',
    3: '三页残页拼合成的完整日记。从那个雪夜，到他把自己的灵魂卖给黑夜。最后一行写着："我一直很想念他，仿佛那些漫漫长夜，就是用来想念他的。"'
  };
  ITEMS.diary_page.name = names[n];
  ITEMS.diary_page.detail = details[n];
  renderInventory();
  if (n === 3) showAchievement('日记补全', '两百年的忏悔，终于完整了');
}
function bookClicked(el) {
  const idx = parseInt(el.dataset.book);
  if (bookOrder.includes(idx) || G.puzzleSolved.bookshelf) return;
  bookOrder.push(idx);
  el.classList.add('placed');
  if (bookOrder.length >= 5) {
    const mode = Math.min(G.loop, 3);
    if (bookOrder.join(',') === BOOK_ORDERS[mode].join(',')) {
      G.puzzleSolved.bookshelf = true;
      closeModal();
      collectDiaryPage();
      showText('书架后方的暗格咔哒一声弹开。里面躺着一把银钥匙、一张残缺的乐谱、一支羽毛笔——还有一页被摩挲得发软的日记（第' + G.flags.diary_count + '页，共三页）。');
      CastleAudio.effect('mechanism');
      addItem('silver_key'); addItem('requiem'); addItem('quill');
      showAchievement('谜题解开', '书架机关打开');
    } else {
      bookOrder = [];
      document.querySelectorAll('.sort-item').forEach(e => e.classList.remove('placed'));
      document.getElementById('puzzle-feedback').textContent = BOOK_FAIL_HINTS[mode];
    }
  }
}

let fluteSequence = [];
// 每个循环的五声音阶旋律不同

function playFlute(idx) {
  CastleAudio.tone([523.25,587.33,659.25,783.99,880][idx]);
  fluteSequence.push(idx);
  const hint = document.getElementById('flute-hint');
  if (hint) hint.textContent = '已吹奏：' + fluteSequence.length + ' / 5';
  if (fluteSequence.length >= 5) {
    const fp = FLUTE_PUZZLES[Math.min(G.loop, 3)];
    if (fluteSequence.join(',') === fp.seq.join(',')) {
      G.puzzleSolved.flute = true;
      closeModal();
      showText('竹笛发出清越的五声音阶。古堡的震动停止了。');
      G.npcQuests.dijie.done = true;
      showAchievement('谜题解开', '五声音阶');
    } else {
      fluteSequence = [];
      if (hint) hint.textContent = '不对……再读一遍墙上的刻痕。';
    }
  }
}

// 每个循环的音程谜题不同：狼五度 → 纯净五度 → 魔鬼三全音

function selectWolf(el, interval) {
  const hp = HARP_PUZZLES[Math.min(G.loop, 3)];
  if (interval === hp.answer) {
    G.puzzleSolved.harpsichord = true;
    CastleAudio.effect({1:'tuning-wolf',2:'tuning-pure',3:'tuning-tritone'}[Math.min(G.loop,3)]);
    closeModal();
    showText(G.loop === 1 ? '大键琴发出一声刺耳的"狼嚎"，然后所有音都校准了。'
      : G.loop === 2 ? '那个五度纯净得像一滴水。其余琴弦自动归位，音准了。'
      : '三全音响起的瞬间，烛火全部变成了蓝色——然后恢复平静。魔鬼被点名了，就失去了力量。');
    if (G.loop === 3 && hasItem('tuning_fork')) {
      removeItem('tuning_fork'); markUsed('tuning_fork');
      addItem('duet_score');
      setTimeout(() => showText('你用音叉抵住共鸣箱，三全音的余震里，琴腹深处滑出一页泛黄的乐谱——《相遇变奏曲》，A&F合奏。这是艾德里安两百年都没敢翻开的那一页。'), 1200);
      showAchievement('隐藏发现', '相遇变奏曲');
    }
    showAchievement('谜题解开', G.loop === 1 ? '找到了狼五度' : G.loop === 2 ? '找到了纯净五度' : '找到了魔鬼音程');
    G.npcQuests.jerry.done = true;
  } else {
    const wh = document.getElementById('wolf-hint');
    if (wh) wh.textContent = '大键琴的声音平稳，不是这个。';
  }
}

// 每个循环的珠宝盒密码不同，线索藏在不同的道具里

function nextPass(n) {
  const next = document.getElementById('p' + (n+1));
  if (next) next.focus();
}
function checkDresserPass() {
  const p1 = document.getElementById('p1').value;
  const p2 = document.getElementById('p2').value;
  const p3 = document.getElementById('p3').value;
  const p4 = document.getElementById('p4').value;
  const pass = p1+p2+p3+p4;
  const dp = DRESSER_PUZZLES[Math.min(G.loop, 3)];
  if (pass === dp.pass) {
    G.puzzleSolved.dresser = true;
    closeModal();
    showText('珠宝盒咔哒一声打开。里面有一枚怀表、一枚戒指、和一张信件残片。');
    CastleAudio.effect('unlock');
    addItem('pocket_watch'); addItem('ring'); addItem('letter_d');
    showAchievement('谜题解开', '怀表停在11:47');
  } else if (pass.length === 4) {
    showText('密码不对，珠宝盒纹丝不动。提示：' + dp.hint.replace(/<[^>]+>/g, ''));
    ['p1','p2','p3','p4'].forEach(id => { const el = document.getElementById(id); if (el) el.value=''; });
    const first = document.getElementById('p1'); if (first) first.focus();
  }
}

function checkLetters() {
  const hasAll = hasItem('burnt_letter_a') && hasItem('burnt_letter_b') && hasItem('letter_c') && hasItem('letter_d');
  if (hasAll && !hasItem('assembled_letter')) {
    showText('四张信件残片在你手中微微发热……它们可以拼合在一起！');
    setTimeout(() => {
      openModal('<h3>拼合信件</h3>' + CastleUI.modalArt('loop3') + '<p>四张残信拼合在一起，字迹逐渐清晰……</p>' +
        '<div class="letter-content">' +
        '<p><b>致我永远的艾德里安：</b></p>' +
        '<p>当你读到这封信时，我已经离开了。但不是背叛——我从未背叛过你。</p>' +
        '<p>那封信是伪造的。你母亲模仿了我的笔迹。我不怪她——她只是想把你留在她认为安全的世界里。她只是不知道，我的世界里，安全的地方只有一个：你身边。</p>' +
        '<p>我本想当面解释，但你锁上了门。暴风雪中，我在门外站了很久。我把耳朵贴在门上，听见你在里面弹琴，弹的是我们第一次见面时的那首曲子。你弹错了三个音。你从来不弹错的。</p>' +
        '<p>那一刻我就不生气了。因为我知道，门那边的你，比我更疼。</p>' +
        '<p>但我要你知道：我原谅你。我原谅你的愤怒，原谅你的骄傲，原谅你关上的那扇门。</p>' +
        '<p>因为在那扇门关上之前，你让我听到了世界上最美的音乐。</p>' +
        '<p>我听说你把自己关进了永恒的黑夜。别这样。我把月光留给你了——那是我一个人的月光，现在，分你一半。</p>' +
        '<p style="text-align:right;">永远属于你的，<br>菲利克斯</p>' +
        '<p style="font-size:12px;color:#8a7a6a;margin-top:15px;">P.S. 安魂曲第三乐章在你书桌的暗格里。请你……把它弹完。这一次，换我在门外听。你听，我就在月光里。</p>' +
        '</div>' +
        `<button class="game-btn" onclick="closeModal();addItem('assembled_letter');removeItem('burnt_letter_a');removeItem('burnt_letter_b');removeItem('letter_c');removeItem('letter_d');markUsed('burnt_letter_a');markUsed('burnt_letter_b');markUsed('letter_c');markUsed('letter_d');showAchievement('真相大白','菲利克斯从未背叛');showText('你擦干眼泪，将完整的信折好，贴近心口收好。');maybeTriggerLoop3();">收起信件</button>`);
    }, 500);
  }
}

function completeRequiem() {
  addItem('repaired_score');
  removeItem('quill'); removeItem('requiem');
  markUsed('quill'); markUsed('requiem');
  showAchievement('乐谱补全', '安魂曲修复完成');
  openModal('<h3>补全的安魂曲</h3>' + CastleUI.modalArt('score') + '<div class="letter-content">' +
    '<p><b>《致菲利克斯的安魂曲》</b></p>' +
    '<p>第一乐章：Adagio sostenuto（持续的慢板）</p>' +
    '<p>第二乐章：Allegretto（小快板）<span style="color:#8a7a6a;">——刚补上的，墨水还没干透</span></p>' +
    '<p>第三乐章：Presto agitato（激动的急板）<span style="color:#8a7a6a;">——笔迹颤抖，像是边写边哭</span></p>' +
    '<p style="margin-top:15px;color:#c8b89a;font-style:italic;">曲谱的最后写着："给F，我的月光。——A"</p>' +
    '</div>');
}

function playOrgan(movement) {
  if (G.puzzleSolved.organ) return;
  G.puzzleSolved.organ = true;
  G.endingMovement = movement;
  stopCountdown();
  closeModal();
  const endings = {
    1: {
      title: '🌙 月光奏鸣曲 · 悲怆',
      text: '第一乐章：悲怆的慢板。<br><br>风琴发出低沉而缓慢的音符，像一个人把两百年的话，一句一句，轻轻放回另一个人的掌心。<br><br>菲利克斯的灵魂残音飘向艾德里安，在他身边环绕。艾德里安伸出手，试图触碰那道蓝光，但他的手指穿了过去。<br><br>"他……原谅我了？"<br><br>艾德里安的灵魂开始颤抖。血红色的眼睛渐渐褪去颜色，变回了原本的蓝色。他跪倒在地，发出一声撕心裂肺的哭喊——那是两百年来，他第一次哭泣。<br><br>"菲利克斯……对不起。我一直很想念你。仿佛那些漫漫长夜，就是用来想念你的。"<br><br>蓝光轻轻落在他的肩头，像一只手，像一句"我知道"。<br><br>古堡的墙壁开始震动，但不是恐惧的震动——是解脱。艾德里安的身影逐渐变得透明，他看向窗外，天边泛起了一丝鱼肚白。<br><br><b>"我在这古堡里留了一件宝藏。不是金银，是那个冬夜之后，我再也没有见过的——日出。现在，我把它还给自己，也还给他。"</b><br><br>晨光从塔楼窗户倾泻而入，照亮了积灰的琴键。那是两百年后的第一缕阳光。'
    },
    2: {
      title: '🌅 月光奏鸣曲 · 柔情',
      text: '第二乐章：柔情的小快板。<br><br>风琴奏出温柔而轻盈的旋律，像壁炉旁那个冬夜，火光落在拉琴人的侧脸上。<br><br>菲利克斯的灵魂残音化作一个淡淡的人影，站在艾德里安面前。艾德里安怔住了，像一个在门外等了两百年、终于听见门开了的人。<br><br>"原来……你一直在等我。"<br><br>人影笑了。虽然没有声音，但艾德里安读懂了那句唇语：你弹错了三个音。你从来不弹错的。<br><br>艾德里安的灵魂逐渐变得透明而明亮。他伸出的手，终于和菲利克斯的幻影交叠在一起——虽然只是一瞬间，但那一瞬间，比两百年的永恒还要长。<br><br>"告诉我……现在的世界，还有月光吗？"<br><br><b>"有。而且从今以后，每天的日出，我们都一起看。"</b><br><br>"那太好了。这一次，换我不松手了。"<br><br>两个灵魂一同化为无数音符，飘向窗外的晨光。天亮了。'
    },
    3: {
      title: '☀️ 月光奏鸣曲 · 永别',
      text: '第三乐章：永别的急板。<br><br>风琴爆发出激烈而悲壮的音符——那是菲利克斯在雪夜里写完的最后一页，是他在生命最后一刻，也要替爱人补全的旋律。<br><br>菲利克斯的灵魂残音化作一道耀眼的光柱，直冲艾德里安而去。艾德里安没有躲避，他张开双臂，迎接了这道光——像两百年前他就该做的那样，把门打开。<br><br>"菲利克斯！"<br><br>他的喊声震动了整座古堡。然后，他安静了。<br><br>艾德里安对着光柱深深鞠了一躬，血红色的眼睛终于闭上了。当他再次睁开眼睛时，里面只剩下平静。<br><br>"你说得对。月光分我一半就够了——剩下的一半，我们一起去看日出。"<br><br>天亮了。你站在塔楼上，看着第一缕阳光越过古堡的尖顶。<br><br>那是艾德里安和菲利克斯，一起看到的第一个日出。<br><br>从此以后，每到满月，塔楼的风琴声依然会响起。但听过的人说，那首曲子有了第四乐章——名字叫做《重逢》。'
    }
  };
  const end = endings[movement];
  document.getElementById('ending-title').textContent = end.title;
  document.getElementById('ending-text').innerHTML = end.text;
  document.getElementById('ending-screen').classList.add('active');
  CastleUI.sync();
}

function enterSunriseMode() {
  G.sunrise = true;
  G.loop = 4; // Sunrise loop
  stopCountdown();
  // Remove all chase overlays
  G.adrianChasing = false;
  document.getElementById('chase-overlay').classList.remove('active');
  document.getElementById('scene-area').style.animation = '';
  document.getElementById('we-screen').classList.remove('active');
  // Change all room titles
  const sunriseTitles = {
    hall:'🏰 大厅 · 日出', dining:'🍷 餐厅 · 晨曦', study:'📚 书房 · 暖阳',
    music:'🎵 音乐室 · 余音', bedroom:'🛏️ 主卧 · 安息', cellar:'⚰️ 地下室 · 沉淀', tower:'🌙 塔楼 · 新生'
  };
  Object.keys(sunriseTitles).forEach(room => {
    const el = document.getElementById('title-' + room);
    if (el) el.textContent = sunriseTitles[room];
  });
  // Hide blood stains
  ['hall-blood','dining-blood','cellar-hand'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  // Unlock all doors
  G.doors = { study:true, music:true, bedroom:true, cellar:true, tower:true };
  document.querySelectorAll('.door').forEach(d => d.classList.remove('door-locked'));
  // Adrian becomes peaceful
  const adrianAvatar = document.querySelector('#npc-adrian .npc-avatar');
  if (adrianAvatar) {
    adrianAvatar.style.borderColor = '#c8b89a';
    adrianAvatar.style.boxShadow = '0 0 25px #c8b89a40';
    adrianAvatar.textContent = '🌅';
  }
  const adrianName = document.querySelector('#npc-adrian .npc-name');
  if (adrianName) {
    adrianName.textContent = '艾德里安';
    adrianName.style.color = '#c8b89a';
  }
  showText('天亮了。晨光穿过塔楼的窗户，将两百年来的尘埃照得闪闪发亮。古堡不再阴森，它只是……很老，老得装满了故事。艾德里安站在风琴旁微笑着，他身边的空气里，隐约漂浮着另一道温暖的轮廓。还有很多秘密，藏在这座古老的城堡里。');
  showAchievement('结局达成', '日出之后，古堡自由探索');
  gotoRoom('tower');
  nextMorning();
}

// ====== 次日清晨：主角团苏醒 ======
function nextMorning() {
  if (G.nextMorning) return;
  G.nextMorning = true;
  ['npc-siyang','npc-tim','npc-servants','npc-bingbing','npc-dijie','npc-qiqi','npc-jerry','npc-shiyuan','npc-lala'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  });
  refreshNpcNames();
  const pos = [
    ['npc-siyang',{bottom:'20%',left:'20%'}], ['npc-tim',{bottom:'20%',right:'20%'}],
    ['npc-dijie',{bottom:'34%',left:'38%'}], ['npc-jerry',{bottom:'34%',right:'34%'}],
    ['npc-bingbing',{bottom:'20%',left:'44%'}], ['npc-servants',{bottom:'8%',left:'46%'}]
  ];
  pos.forEach(([id, style]) => {
    const el = document.getElementById(id);
    if (el) Object.assign(el.style, style);
  });
  showText('一阵清脆的鸟鸣。你睁开眼睛——你躺在大厅的长椅上，身上盖着一件不属于自己的外套。阳光已经洒满了整个房间。你的同伴们横七竖八地睡在壁炉边，一个接一个地醒来。');
  showAchievement('次日清晨', '哈基米乐团，全员到齐');
  gotoRoom('hall');
}



function talk(npc) {
  if (G.currentRoom === 'cellar' && !hasItem('candle')) {
    showText('地下室太黑了，你分不清面前是谁。', true); return;
  }
  if (G.adrianChasing) {
    showText('艾德里安就在附近……现在不能分心！', true); return;
  }

  const data = DIALOGUES[npc];
  if (!data) return;

  // ====== 第一循环 · 寻名 ======
  if (G.loop === 1 && NAME_PUZZLES[npc] && !G.names[npc]) {
    const p = NAME_PUZZLES[npc];
    if (!G.flags['nameclue_' + npc]) {
      showText(p.ask);
      return;
    }
    CastleUI.ask('TA 的名字是……？', ans => {
      const norm = ans.trim().toLowerCase();
      if (p.answers.some(a => norm === a.toLowerCase())) {
        G.names[npc] = true; refreshNpcNames(); showText(p.reveal); showAchievement('名字找回', p.real);
      } else showText('这个名字没有唤醒 TA。再看看线索：' + p.clueText);
    });
    return;
  }

  const loopData = data[G.loop] || data[1];

  // ====== 艾德里安的信物禁锢（第二循环核心机制） ======
  if (npc === 'adrian' && G.loop === 2) {
    if (!G.countdown.offeredKeepsake) {
      offerKeepsakeToAdrian();
      return;
    }
    if (G.countdown.active) {
      showText('艾德里安的身影被一层淡淡的金光笼罩着，像一尊暂时安静的雕像。他的声音直接在你脑海里响起："别管我……时间不多，去找他的信。"');
      return;
    }
  }
  if (npc === 'adrian' && G.loop >= 3 && G.countdown.active) {
    // 循环切换后兜底：停止倒计时
    stopCountdown();
  }

  // Check for item gift first
  if (G.selectedItem) {
    const entry = loopData.find(e => e.accepts === G.selectedItem && !G.flags['gift_' + npc + '_' + G.selectedItem]);
    if (entry) {
      G.flags['gift_' + npc + '_' + G.selectedItem] = true;
      markUsed(G.selectedItem);
      G.selectedItem = null;
      renderInventory();
      showText(entry.giftText);
      if (entry.unlock) G.flags[entry.unlock] = true;
      if (entry.reward) {
        addItem(entry.reward);
        showAchievement('获得道具', ITEMS[entry.reward].name);
        G.npcQuests.lala.done = true;
      }
      return;
    }
    // If selected item doesn't match any accepts, show hint
    const hasAccepts = loopData.some(e => e.accepts);
    if (hasAccepts) {
      showText('（你试着把「' + ITEMS[G.selectedItem].name + '」递过去，但' + (npc==='siyang'?'叶思阳':npc==='bingbing'?'冰冰':npc==='dijie'?'笛杰':npc==='tim'?'Tim':npc==='jerry'?'Jerry':npc==='shiyuan'?'十元':npc==='lala'?'垃垃':npc) + '摇了摇头，似乎不想要这个。）');
      return;
    }
  }

  // Special: Adrian in loop 3 checks for assembled_letter + soul_fragment
  if (npc === 'adrian' && G.loop === 3) {
    if (hasItem('assembled_letter') && hasItem('soul_fragment') && !G.flags.gave_final) {
      G.flags.gave_final = true;
      stopCountdown();
      showText('艾德里安颤抖着接过信件和灵魂残音。他的手指穿过蓝光，但他仿佛能读到每一个字。两行眼泪无声地滑下来："……他原谅我了。两百年了，他早就原谅我了。他只是在等我……亲口问一句。"');
      setTimeout(() => {
        showText('艾德里安小心地把信贴在胸口，走向风琴："这首曲子……我们还没有写完。但这一次，他会听到的。这一次，我弹给他听，也弹给日出听。"');
      }, 3500);
      return;
    }
  }

  // Check for answer question (lala)
  const entry = loopData.find((e, idx) => {
    if (e.once && G.flags['talk_' + npc + '_' + G.loop + '_' + idx]) return false;
    if (e.checkAnswer && !G.flags['answered_' + npc]) return true;
    return !e.checkAnswer;
  });

  if (!entry) {
    showText('（没有更多对话了）'); return;
  }

  if (entry.check && !hasItem(entry.check)) {
    showText('他还不想听你说这些。也许你需要找到更多线索。'); return;
  }
  if (entry.check2 && !hasItem(entry.check2)) {
    showText('他还不想听你说这些。也许你需要找到更多线索。'); return;
  }

  showText(entry.text, entry.horror);

  // Mark as spoken
  const idx = loopData.indexOf(entry);
  G.flags['talk_' + npc + '_' + G.loop + '_' + idx] = true;

  if (entry.flag) G.flags[entry.flag] = true;
  if (entry.quest) {
    G.npcQuests[npc].started = true;
    const el = document.getElementById('npc-' + npc);
    if (el) el.classList.add('npc-quest');
  }

  // Handle checkAnswer
  if (entry.checkAnswer) {
    setTimeout(() => {
      CastleUI.ask(entry.ansQuestion || '请输入答案：', ans => {
      const norm = (ans || '').trim();
      const ok = norm === entry.checkAnswer
        || (entry.checkAnswer === '3' && ['3个','三','三个','叁'].includes(norm))
        || (entry.checkAnswer === '7' && ['7个','七','七个','柒'].includes(norm))
        || (entry.checkAnswer === '8' && ['8个','八','八个','捌'].includes(norm));
      if (ans && ok) {
        G.flags['answered_' + npc] = true;
        G.npcQuests[npc].done = true;
        if (entry.reward) {
          addItem(entry.reward);
          showAchievement('任务完成', ITEMS[entry.reward].name);
        }
        if (entry.rewardText) showText(entry.rewardText);
      } else {
        showText('不对。再想想。');
      }
      });
    }, 500);
  }

  // Trigger loop 3 when assembled_letter is obtained
  maybeTriggerLoop3();
}

function useItem(id) {
  if (id.startsWith('burnt_letter') || id === 'letter_c' || id === 'letter_d') {
    readLetter(id); checkLetters(); return;
  }
  if (id === 'assembled_letter') {
    openModal('<h3>完整的信</h3>' + CastleUI.modalArt('loop3') + '<div class="letter-content">' +
      '<p><b>致我永远的艾德里安：</b></p>' +
      '<p>当你读到这封信时，我已经离开了。但不是背叛——我从未背叛过你。</p>' +
      '<p>那封信是伪造的。你母亲模仿了我的笔迹。我不怪她——她只是想把你留在她认为安全的世界里。她只是不知道，我的世界里，安全的地方只有一个：你身边。</p>' +
      '<p>我本想当面解释，但你锁上了门。暴风雪中，我在门外站了很久。我把耳朵贴在门上，听见你在里面弹琴，弹的是我们第一次见面时的那首曲子。你弹错了三个音。你从来不弹错的。</p>' +
      '<p>那一刻我就不生气了。因为我知道，门那边的你，比我更疼。</p>' +
      '<p>但我要你知道：我原谅你。我原谅你的愤怒，原谅你的骄傲，原谅你关上的那扇门。</p>' +
      '<p>因为在那扇门关上之前，你让我听到了世界上最美的音乐。</p>' +
      '<p>我听说你把自己关进了永恒的黑夜。别这样。我把月光留给你了——那是我一个人的月光，现在，分你一半。</p>' +
      '<p style="text-align:right;">永远属于你的，<br>菲利克斯</p>' +
      '<p style="font-size:12px;color:#8a7a6a;margin-top:15px;">P.S. 安魂曲第三乐章在你书桌的暗格里。请你……把它弹完。这一次，换我在门外听。你听，我就在月光里。</p>' +
      '</div>');
    return;
  }
  if (id === 'diary_page') {
    const n = Math.max(1, G.flags.diary_count || 1);
    const pages = [
      '<p><b>【残页·一】1823年12月23日</b></p>' +
      '<p>我把那封信给他看。他什么都没说，只是看着我。他的眼神很平静——平静得像月光落在雪上。我宁可他哭，宁可他喊。可他只是看着我，像在看一个陌生人。</p>' +
      '<p>我锁上了门。他在门外站了很久。我隔着门板听见他的呼吸，隔着一场暴风雪听见他的心。然后脚步声消失在风雪里。</p>' +
      '<p><b>1823年12月24日</b></p>' +
      '<p>他们找到了他。手里攥着半张乐谱——是《月光奏鸣曲》的第三乐章。他替我把它写完了。他到最后一刻都在替我把曲子写完。</p>' +
      '<p>我把他抱回来，放在壁炉旁他最喜欢的位置上。我守着弹了一整夜的琴。我想，也许弹到日出，他就会像平时那样，皱着眉说：「艾德里安，第二小节又弹错了。」</p>' +
      '<p>天亮了。他没有。</p>',
      '<p><b>【残页·二】1824年1月</b></p>' +
      '<p>我不再作曲了。没有他，音乐失去了意义。我把所有的谱子锁进书房，只留了一把钥匙挂在胸口——可他再也回不来了，我锁住的不是谱子，是我自己。</p>' +
      '<p>母亲昨天又来了。她问我为什么还不振作。我看着她，突然很想笑——她赢得了这场战争，可她的战利品，是一个再也不会笑的的儿子。</p>',
      '<p><b>【残页·三】1824年3月</b></p>' +
      '<p>我早就知道菲利克斯不会背叛我。我只是不敢承认：毁掉我们的不是那封信，是我的懦弱。世界容不下我们的爱，而我没有胆量替它腾出地方。</p>' +
      '<p>所以今夜之后，我把灵魂卖给黑夜。我要让这座古堡只剩下月光——那是他的东西。我要替他看着它，直到有人把他的原谅带回来。</p>' +
      '<p style="color:#c8b89a;font-style:italic;margin-top:10px;">我一直很想念他。仿佛那些漫漫长夜，就是用来想念他的。</p>'
    ];
    let body = '';
    for (let i = 0; i < n && i < 3; i++) body += pages[i];
    if (n < 3) body += '<p style="color:#8a7a6a;font-size:12px;margin-top:12px;">【日记还不完整：' + n + '/3 ——也许每个循环的书架深处，都藏着一页】</p>';
    openModal('<h3>' + ITEMS.diary_page.name + '</h3><div class="letter-content">' + body + '</div>');
    return;
  }
  if (id === 'candle') {
    if (G.currentRoom === 'cellar') {
      showText('蜡烛照亮了地下室的角落。酒架上的标签隐约可见。');
    } else if (G.currentRoom === 'tower') {
      showText('你在塔楼点燃蜡烛，火光与月光交织。');
    } else {
      showText('一支白蜡烛，火光微微摇曳。在黑暗的地方也许能派上用场。');
    }
    return;
  }
  if (id === 'requiem') {
    if (hasItem('quill') && !hasItem('repaired_score')) {
      openModal('<h3>《致菲利克斯的安魂曲》</h3><div class="letter-content">' +
        '<p><b>第一乐章：Adagio sostenuto</b></p>' +
        '<p>第二乐章：<span style="color:#cc4444;">[缺失——被墨水污损，只能辨认出几个音符的轮廓]</span></p>' +
        '<p>第三乐章：<span style="color:#cc4444;">[缺失——页面被撕去，只留下不规则的纸边]</span></p>' +
        '<p style="margin-top:15px;color:#c8b89a;">你拿起羽毛笔，笔尖触到空白处时，墨水自己流淌了出来——</p>' +
        '<p style="color:#8a7a6a;font-style:italic;">仿佛有人在两百年前的那个冬夜，就已经蘸好了这滴墨水，只等一个永远不会到来的明天。</p>' +
        '</div>' +
        '<button class="game-btn" onclick="closeModal();window.completeRequiem()">用羽毛笔补全乐章</button>');
    } else {
      openModal('<h3>《致菲利克斯的安魂曲》</h3><div class="letter-content">' +
        '<p><b>第一乐章：Adagio sostenuto（持续的慢板）</b></p>' +
        '<p>第二乐章：[缺失——被墨水污损]</p>' +
        '<p>第三乐章：[缺失——页面被撕去]</p>' +
        '<p style="margin-top:15px;color:#8a7a6a;">乐谱边缘写着一行小字：<br>"没有羽毛的笔，写不完没有他的曲。"</p>' +
        '<p style="color:#8a7a6a;">也许需要找到一支羽毛笔……</p>' +
        '</div>');
    }
    return;
  }
  if (id === 'quill') {
    if (hasItem('requiem') && !hasItem('repaired_score')) {
      openModal('<h3>羽毛笔</h3><div class="letter-content">' +
        '<p>一支鹅毛笔，笔尖还蘸着干涸的墨水。你把它靠近安魂曲谱的空白处——</p>' +
        '<p style="color:#c8b89a;font-style:italic;">笔尖触到纸面的瞬间，墨水自己流淌了出来，像是有生命一般，在五线谱上蜿蜒、汇聚、成形……</p>' +
        '</div>' +
        '<button class="game-btn" onclick="closeModal();window.completeRequiem()">补全乐章</button>');
    } else if (!hasItem('requiem')) {
      showText('一支鹅毛笔，笔尖还蘸着干涸的墨水。它需要一张空白的乐谱才能施展魔法。');
    } else {
      showText('羽毛笔已经用完了它的墨水。但乐谱上，缺失的部分已经被填满了。');
    }
    return;
  }
  if (id === 'pocket_watch') {
    showText('怀表停在11:47。那是菲利克斯离开古堡的时间，也是艾德里安锁上门的时间。指针凝固了两百年——可你听，凑近了，表芯里还有极轻极轻的一声"嗒"。像是有什么东西，一直没有彻底停下。');
    return;
  }
  if (id === 'ring') {
    showText('戒指内侧刻着 A & F。艾德里安与菲利克斯。两百年前，他们曾以此为誓——一个用音乐，一个用灵魂。戒圈被体温焐过无数次，到现在还是温的。');
    return;
  }
  if (id === 'wine_bottle') {
    showText('1791年的葡萄酒。莫扎特去世的年份，也是艾德里安与菲利克斯相识的年份。标签背面还有一行更小的字："等花开的时候，我们一起喝。"');
    return;
  }
  if (id === 'registry') {
    openModal('<h3>古堡登记簿</h3><div class="letter-content burnt">' +
      '<p><b>艾德里安古堡 · 宾客登记簿</b></p>' +
      '<p>1823年11月 - 冯·施特恩贝格伯爵</p>' +
      '<p>1823年11月 - 艾德里安夫人</p>' +
      '<p>1823年12月 - ████████（被墨水涂黑）</p>' +
      '<p style="color:#8a7a6a;margin-top:10px;">涂黑的名字只露出了最后一个字母：X</p>' +
      '<p style="color:#c8b89a;margin-top:10px;">管家栏写着一行娟秀的小字："管家塞巴斯蒂安，侍奉艾德里安家族二十七年。"</p>' +
      '</div>');
    if (G.loop === 1 && !G.names.siyang) { G.flags.nameclue_siyang = true; setTimeout(() => showText('你记住了登记簿上的名字："管家塞巴斯蒂安，侍奉艾德里安家族二十七年。"——大厅里那位戴领结的执事，听到这个名字会有反应吗？'), 400); }
    return;
  }
  if (id === 'mirror_shard') {
    if (G.currentRoom === 'dining') {
      showText('你用碎镜片反射烛光，照进了音乐盒的缝隙。');
      return;
    }
    showText('镜子碎片中……有时映出的是你自己的脸，有时是一个你不认识的年轻人。');
    return;
  }
  if (id === 'soul_fragment') {
    showText('菲利克斯的灵魂残音在你手中微微发光，温暖而柔和。恍惚间你听见一个很轻的声音说："请把他带回来。也请……把我带回到他身边。"');
    return;
  }
  if (id === 'tower_key') {
    showText('塔楼钥匙冰冷刺骨。垃垃说，它是用1791年的琴弦熔铸的。');
    return;
  }
  showItemDetail(id);
}

function readLetter(id) {
  const contents = {
    burnt_letter_a: '<p>【笔迹鉴定：这是艾德里安的字，却在模仿菲利克斯的口吻——他替一个再也回不来的人，写了一封绝交信给自己】</p><p>……我永远无法原谅你对我做的一切。你以为一段旋律就能赎回一个灵魂吗？不，艾德里安，你错了。</p><p>从今以后，你的曲子我一句都不会再听。你的月光，我一眼都不会再看……</p><p style="color:#8a7a6a;">【后续被烧毁。纸灰上残留着反复涂抹的痕迹——他写了很多遍，又一遍遍烧掉。最底下有一层没烧尽的字：「对不起，我替他写的这些话，没有一句是他会说出口的。」】</p>',
    burnt_letter_b: '<p>【菲利克斯的笔迹，写于离开古堡的那个雪夜】</p><p>……那个冬夜，月光很亮。我数着自己的脚步声，一步，一步，替你留着追上来的时间。雪没过膝盖，我走得很慢——我这一生，都没有走得那么慢过。</p><p>我知道，只要你追出来，只要你喊一声我的名字，我就会回头。我会原谅你的一切。</p><p>可你没有。</p><p>月光把我的影子拉得很长，只有它，送了我一路。</p><p>月光奏鸣曲第三乐章，我已经写完了……</p><p style="color:#8a7a6a;">【此处烧焦】</p>',
    letter_c: '<p>亲爱的艾德里安：</p><p>我没有投靠冯·施特恩贝格。那封信不是我写的。</p><p>我认得你母亲的笔迹。她一直在找机会拆散我们——她只是不懂，有些东西是拆不散的。</p><p>但我不怪她。她只是想保护你，以她自己的方式。就像你锁上那扇门，也是想保护你自己，以你的方式。</p><p>我只希望有一天你能明白：我从来没有怀疑过你的爱。哪怕一次都没有。</p>',
    letter_d: '<p>我永远不会背叛你。</p><p>这句话我写了很多遍，每一遍都是真心的。</p><p>第一遍写在乐谱的空白处，第二遍写在窗玻璃的雾气上，第三遍写在雪地里——写到第四遍时，月亮已经偏西了。</p><p>如果你还是不信……那就让时间证明吧。</p><p>我会一直等你。在月光下等你。哪怕月光之外，我一无所有。</p><p>——F</p>'
  };
  openModal('<h3>信件</h3><div class="letter-content burnt">' + (contents[id] || '') + '</div>');
}

// ====== 次日清晨：主角团的对话（日出后，loop 4+） ======
DIALOGUES.servants[4] = [
  { text:'飞鸿揉着眼睛坐起来，头发乱得像鸟窝："……我做了一个好长好长的梦。梦见我在这座古堡里走了两百年，一直找不到出口。"他忽然凑近你，压低声音，"但奇怪的是——梦里有个人一直牵着我的手。"', once:true },
  { text:'他转头看向身边还在打哈欠的宝石，耳根忽然红了。"说出来你们别笑……我梦见宝石是我上辈子的恋人。我们在月光下走散了，我找了整整一辈子。"', once:true },
  { text:'宝石迷迷糊糊地睁开眼："……我也梦见你了。我梦见我等你回来，等了很久很久。"他顿了顿，"然后你真的回来了。带着一身雪。"', once:true },
  { text:'两个人对视了一眼，谁都没有说话。壁炉的火光跳了一下。<br><br>你注意到，他们的手还牵在一起——大概从"梦"里，就没有松开过。', once:true },
  { text:'（十元从厨房探出头："醒了就过来帮忙！团建早餐还做不做了？"）', once:false }
];
DIALOGUES.siyang[4] = [
  { text:'叶思阳整了整领结，把登记簿递给你看："奇怪……上面那行被涂黑的名字，现在能看清了。"登记簿上，1823年12月那一栏清清楚楚地写着：<b>菲利克斯</b>。旁边多了一行新的字迹，像是刚刚写上去的："——欢迎回家。"', once:true },
  { text:'"对了，"他忽然想起什么，"昨晚上我好像不是管家……我是说，在梦里。我穿着两百年前的制服，站在壁炉边，替两位主人挡了一夜的门。"他笑了笑，"也许我们每个人都曾是这座古堡的一部分。"', once:false }
];
DIALOGUES.dijie[4] = [
  { text:'笛杰把竹笛横在膝上，试了试音："裂开的笛子自己长好了。你听——"他吹了一段五声音阶，清越得像山泉，"这曲子是我梦里的伯爵教我的。他说，等他们重逢那天，要我吹这个。"', once:true },
  { text:'"他最后还问了我一句话。"笛杰收起笛子，"\'今晚的月色真美\'——用你们东方的话，是不是还有别的意思？"你还没来得及回答，他自己先笑了，"我想我懂了。"', once:false }
];
DIALOGUES.jerry[4] = [
  { text:'Jerry举着音叉敲了敲，声音清亮得不像话："你猜怎么着？我耳朵里那些重叠的杂音全没了。现在我只听得见一个声音——大键琴和小提琴的合奏，从塔楼传下来，没停过。"', once:true },
  { text:'"对了，我在梦里把那架大键琴调好了。纯律，中音律，十二平均律，全试了一遍。"他眨眨眼，"你猜最后用的是哪种？——都不是。伯爵说，他和他爱人的音程，不需要律制来定义。"', once:false }
];
DIALOGUES.bingbing[4] = [
  { text:'冰冰站在肖像画前，画中的两个年轻人微笑着看向彼此。她伸手摸了摸画框，指尖沾了一点金粉："我叫伊莎贝拉。在梦里，我叫了两百年。"她转过头，眼睛亮晶晶的，"现在我终于可以说——表哥，我不怪你了。从来都没有。"', once:true },
  { text:'"我在画里看着他们两百年，够本了。"她提起裙摆向你行了个礼，"谢谢你把我们所有人的名字，一个一个找了回来。"', once:false }
];
DIALOGUES.qiqi[4] = [
  { text:'柒柒把塔罗牌收进袖子里，冲你眨眨眼："最后一张牌，我今早翻开了——<b>太阳</b>。正位。预言彻底翻篇了。"', once:true },
  { text:'"你知道吗，麦克白要是能重来一次，也许会选择不相信预言。"她望向窗外，"幸好，这座古堡里的故事，有一个比预言更固执的人——一个愿意原谅两百年的菲利克斯。"', once:false }
];
DIALOGUES.tim[4] = [
  { text:'Tim把盔甲扶起来，拍了拍上面的灰："两百年了，它终于可以休息了。"他把手里的琴弓递给你，"这个你留着。不是作为武器——作为纪念。以音为剑的人，已经把剑放下了。"', once:true },
  { text:'"我守护这座古堡，不是因为职责。"他望向塔楼的方向，"是因为总有人要替他们记得，这里有过一场多好的爱情。现在……你们所有人都替我记得了。"', once:false }
];
DIALOGUES.lala[4] = [
  { text:'垃垃的水晶球彻底透明了，像一颗普通的玻璃珠："我的水晶球空了。不是坏了——是里面装的执念，全都散了。"她把它抛给你，"拿着玩吧，就当是个纪念品。"', once:true },
  { text:'"下次团建别找这种地方了。"她打了个哈欠，"不过……也挺好的。有些故事，总得有人听完。"', once:false }
];
DIALOGUES.shiyuan[4] = [
  { text:'十元系着围裙从厨房出来，手里端着一盘烤糊的面包："都醒了？正好——谁来说说，为什么厨房里的面粉少了半袋，餐桌上多了两套餐具？"她顿了顿，声音软下来，"……算了。先吃饭吧。"', once:true },
  { text:'"我在梦里当了女仆，天天给两位主人送早餐。"她把面包塞给你，"有一天的早餐，他们在面包上用果酱画了两个字母。A，和F。"她笑了，"你说巧不巧，今早的餐桌上，也有。"', once:false }
];

// ====== 收集模式：11 件纪念品图鉴 ======


function checkCollection() {
  const got = COLLECTIBLES.filter(id => G.flags['collected_' + id] || hasItem(id) || G.usedItems.has(id));
  if (got.length === COLLECTIBLES.length && !G.flags.collection_done) {
    G.flags.collection_done = true;
    setTimeout(() => {
      showAchievement('收藏大师', '集齐了古堡里的全部 11 件纪念品');
      showText('你把所有纪念品摆在一起——琴弦、手帕、素描、星图、袖扣、情诗、面具、干花、旅行笔记、八音盒零件，还有那页《相遇变奏曲》。<br><br>塔楼的风琴声忽然变了调子。这一次，是一首你从没听过的曲子。轻快，明亮，像两个人在阳光里跳舞。<br><br>你听出来了——这是第四乐章之后，他们自己写的第五乐章。<br><br>名字叫做《谢谢》。');
    }, 800);
  }
}
const _addItemOrig = addItem;
addItem = function(id) {
  _addItemOrig(id);
  if (COLLECTIBLES.includes(id)) G.flags['collected_' + id] = true;
  checkCollection();
};

