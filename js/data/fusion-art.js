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
    text: `${node.title || '融合线场景'}的剧情插图。`
  };
}));
