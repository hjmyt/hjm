'use strict';

// Every fusion narrative scene owns a plot-specific illustration binding.
// Generated crops come from retained 8-up source sheets; generic rotation and
// adjacent-scene reuse are intentionally forbidden.
const FUSION_GENERATED_NODE_ART = new Set([
  'fs_01','fs_laodu','fs_dayang','fs_yuerou','fs_yrok','fs_yrno','fs_leave','fs_tim',
  'fs_yr2','fs_dj','fs_05','fs_06wait','fs_06','fs_rush','fs_07','f2_00',
  'f2_mine','f2_ll5','f2_hermusic','f2_ll6','f2_ll7','f2_ll7rage','f2_chase','f2_ll7b',
  'f2_m1','f2_m2','f2_m3','f2_m4','f2_llclose','g_ice','g_pre','g_post',
  'f2_aq1','f2_aq2','f2_aq3','f2_slap','f2_bs1','f2_bs2','f2_bs3','f2_bsstop',
  'f2_yrask','f2_yrdj','f2_yrmv','m_pre1','m_talk_ge','m_sd_ge',
  'f2_01','f2_ll1','f2_rec','f2_rec2','f2_ll3','f2_ll4','f2_ll7c','f2_ll8',
  'f2_ll9','f2_ll10','f2_ll11soft','f2_ll11b','f2_ll11c','f2_end','m_r2','m_r2a',
  'm_r3','m_r4','m_r4b','m_r5','m_r6','m_r6a','m_pre2','m_talk_ld',
  'm_talk_dy','m_talk_dj','m_talk_ll','m_sd_ld','m_sd_dy','m_sd_ll','m_sd_dj','m_show2',
  'm_ok','m_bad','m_perfect','f2_ldp1','f2_ldp2','f2_ldp2a','f2_ldp2b','f2_ldp3',
  'f2_ldp3a','f2_ldnight','f2_dy1','f2_dy2','f2_dy3','f2_rocknight','f2_dj1','f2_dj2',
  'f2_dj3','f2_fusenight','m_ep','m_ep1','m_ep2','m_ep3','f2_cpgo'
]);
// Use a new filename when a replacement changes a character's canonical look,
// so browsers cannot keep showing the old crop from their image cache.
const FUSION_NODE_ASSET_FILES = {
  fs_laodu: 'fs_laodu-v2.jpg',
  // Keep the scene focus on Shiyuan asking Jerry for help. The later group
  // entrance crop does not represent the opening pages of this node.
  fs_07: 'fs_07-v2.jpg',
  // This node spans Dayang's voice message, Old Du's call and Jerry writing
  // the roster; the original dedicated crop covers the complete event.
  f2_m1: 'f2_m1.jpg',
  f2_llclose: 'f2_llclose-v2.jpg',
  f2_yrask: 'f2_yrask-v2.jpg',
  f2_yrdj: 'f2_yrdj-v2.jpg',
  f2_yrmv: 'f2_yrmv-v2.jpg',
  m_pre1: 'm_pre1-v3.jpg',
  m_talk_ge: 'm_talk_ge-v2.jpg',
  m_sd_ge: 'm_sd_ge-v2.jpg',
  f2_ll5: 'f2_ll5-v3.jpg',
  f2_hermusic: 'f2_hermusic-v3.jpg',
  f2_ll6: 'f2_ll6-v3.jpg',
  f2_ll7: 'f2_ll7-v3.jpg',
  f2_ll7rage: 'f2_ll7rage-v4.jpg',
  f2_chase: 'f2_chase-v3.jpg',
  f2_ll7b: 'f2_ll7b-v3.jpg',
  f2_cpgo: 'f2_cpgo-v2.jpg',
  f2_aq1: 'f2_aq1-v2.jpg',
  m_r2: 'm_r2-v2.jpg',
  m_r2a: 'm_r2a-v2.jpg',
  m_talk_ld: 'm_talk_ld-v2.jpg',
  m_sd_ld: 'm_sd_ld-v2.jpg',
  f2_ldp1: 'f2_ldp1-v2.jpg',
  f2_ldp2: 'f2_ldp2-v2.jpg',
  f2_ldp2a: 'f2_ldp2a-v2.jpg',
  f2_ldp2b: 'f2_ldp2b-v2.jpg',
  f2_ldp3: 'f2_ldp3-v2.jpg',
  f2_ldp3a: 'f2_ldp3a-v2.jpg',
  f2_ldnight: 'f2_ldnight-v2.jpg'
};
const FUSION_LEGACY_ART = {
  fs_00: ['fusion_art_hill_arrival','fusionHillArrival','山丘酒吧 · 黄昏'],
  fs_02: ['fusion_art_chaotic_rehearsal','fusionChaoticRehearsal','山丘酒吧 · 排练厅'],
  fs_03: ['fusion_art_one_microphone','fusionOneMicrophone','山丘酒吧 · 舞台边'],
  fs_04: ['fusion_art_moon_canon','fusionMoonCanon','山丘酒吧 · 月夜'],
  fs_08: ['fusion_art_split_night','fusionSplitNight','山丘酒吧 · 黑板前'],
  f2_ll11: ['fusion_art_late_chat','fusionLateChat','深夜 · 编曲桌前'],
  m_ice: ['fusion_art_rehearsal','fusionRehearsal','山丘酒吧 · 融合排练'],
  m_show: ['fusion_art_night','fusionNight','山丘酒吧 · 正式舞台']
};
const FUSION_MEMORY_DETAILS = {
  f2_ldnight: {
    rule: '第三篇与老杜完成前三次专属聊天后，第 4 次聊天触发',
    text: '从 demo 的风格、SOLO 的句子，到西装场与小酒馆的格调，老杜始终似笑非笑、看破不说破。第三次聊完的周末，他换上西装约 Jerry 去小酒馆，从《Autumn Leaves》一路 JAM 到打烊，终于破例问出那句：你来哈基米，不是想带团，是想找个能说话的地方——找到了吗？'
  },
  f2_rocknight: {
    rule: '第三篇与大羊完成前三次专属聊天后，第 4 次聊天触发',
    text: '大羊总用抢话、绕弯和玩笑挡住真心，把“我的 SOLO 为什么不能是主角”藏在跑场无人听的失落后面。chewing gum 酒馆散场后的台阶上，两把吉他聊到后半夜；Jerry 帮他拆开“不甘心”和“不自信”，而他终于不再开玩笑，认真地说：再来一遍，这次你听着。'
  },
  f2_fusenight: {
    rule: '第三篇与笛杰完成前三次专属聊天后，第 4 次聊天触发',
    text: '从只看得懂简谱、追问《在水一方》是什么风格，到一点点学会五线谱与和声，笛杰始终温柔、坚持，也越来越敢说出自己的判断。融合音乐会后，toneso 的伙伴认可了他的演出，新专辑邀请他录制一首竹笛 feat.；简谱少年与爵士乐队由此互相推开了对方世界的门。'
  },
  f2_slap: {
    rule: '第三篇与阿齐完成前三次专属聊天后，第 4 次聊天触发',
    text: '“九点了，我要回东莞了”从阿齐的口头禅变成了全组下班铃；八点五十九收琴，是他对东莞的尊重。可演出返场时，台下齐喊“东莞”，这个练了九年 slap、永远准点的人难得一笑，把贝斯重新抱稳：九点了——加个班。'
  },
  f2_bsstop: {
    rule: '第三篇与宝石第 3 次专属聊天时，选择“客套安慰两句”',
    text: '宝石绕着飞鸿讲了三次：和声、柠檬水、扒谱，还有那句没能说完的“你觉得，飞鸿他——”。Jerry 客套地把一切归为朋友之间的寻常，宝石只回了一个“哦”，从此再也没有提起飞鸿；有些话错过那一次，就没有第二次了。选择“愿闻其详”则会正式解锁宝石×飞鸿 CP 线。'
  }
};
const FUSION_ART = Object.entries(FUSION_ROUTES).flatMap(([chapter, nodes]) => nodes.map((node, index) => {
  const legacy = FUSION_LEGACY_ART[node.id];
  let asset = legacy?.[1];
  if (FUSION_GENERATED_NODE_ART.has(node.id)) {
    asset = `fusionNode_${node.id}`;
    ASSETS[asset] = `assets/fusion/scenes/nodes/${FUSION_NODE_ASSET_FILES[node.id] || `${node.id}.jpg`}`;
  }
  if (!asset) {
    const choices = chapter === 'rl'
      ? ['fusionHillArrival','fusionChaoticRehearsal','fusionOneMicrophone','fusionMoonCanon','fusionSplitNight']
      : chapter === 'ep2'
        ? ['fusionLateChat','fusionMoonCanon','fusionChaoticRehearsal']
        : ['fusionRehearsal','fusionNight','fusionOneMicrophone'];
    asset = choices[index % choices.length];
  }
  return {
    id: legacy?.[0] || `fusion_art_${chapter}_${node.id}`,
    chapter,
    scene: node.id,
    title: node.title || `${chapter === 'rl' ? '入线篇' : chapter === 'ep2' ? '后宫日常' : '融合主线'} · ${String(index + 1).padStart(2, '0')}`,
    location: legacy?.[2] || (chapter === 'rl' ? '山丘酒吧 · 入线之夜' : chapter === 'ep2' ? '排练之后 · 日常回响' : '六次排练 · 融合舞台'),
    asset,
    rule: FUSION_MEMORY_DETAILS[node.id]?.rule,
    text: FUSION_MEMORY_DETAILS[node.id]?.text || `${node.title || '融合线场景'}的剧情插图。`
  };
}));
