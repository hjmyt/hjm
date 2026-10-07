'use strict';

// Five exercises per chapter. Difficulty and phrases vary with the chapter.
const ChronicleTraining = {
  "1": [
    {
      "title": "视听练耳",
      "kind": "ear",
      "mentor": "kongge",
      "description": "听出括号里的音",
      "tune": "欢乐颂"
    },
    {
      "title": "旋律记忆",
      "kind": "memory",
      "mentor": "azhe",
      "description": "记住开场乐句",
      "tune": "欢乐颂"
    },
    {
      "title": "霓虹节奏",
      "kind": "pulse",
      "mentor": "dijie",
      "description": "四轨入门，点亮第一段连击",
      "tune": "欢乐颂"
    },
    {
      "title": "搭档接奏",
      "kind": "duet",
      "mentor": "lala",
      "description": "听见伙伴再进入",
      "tune": "欢乐颂"
    },
    {
      "title": "舞台彩排",
      "kind": "stage",
      "mentor": "shiyuan",
      "description": "商场前的完整彩排",
      "tune": "欢乐颂"
    }
  ],
  "2": [
    {
      "title": "视听练耳",
      "kind": "ear",
      "mentor": "kongge",
      "description": "听辨路演中的缺音",
      "tune": "路演组曲"
    },
    {
      "title": "旋律记忆",
      "kind": "memory",
      "mentor": "azhe",
      "description": "两条旋律的呼应",
      "tune": "路演组曲"
    },
    {
      "title": "霓虹节奏",
      "kind": "pulse",
      "mentor": "dijie",
      "description": "跟上切分，接住路演律动",
      "tune": "路演组曲"
    },
    {
      "title": "搭档接奏",
      "kind": "duet",
      "mentor": "lala",
      "description": "路演的接句",
      "tune": "路演组曲"
    },
    {
      "title": "舞台彩排",
      "kind": "stage",
      "mentor": "shiyuan",
      "description": "街头舞台走台",
      "tune": "路演组曲"
    }
  ],
  "3": [
    {
      "title": "视听练耳",
      "kind": "ear",
      "mentor": "kongge",
      "description": "补全返场的旋律",
      "tune": "530 组曲"
    },
    {
      "title": "旋律记忆",
      "kind": "memory",
      "mentor": "azhe",
      "description": "记住主歌与副歌",
      "tune": "530 组曲"
    },
    {
      "title": "霓虹节奏",
      "kind": "pulse",
      "mentor": "dijie",
      "description": "双键和弦，点燃专场",
      "tune": "530 组曲"
    },
    {
      "title": "搭档接奏",
      "kind": "duet",
      "mentor": "lala",
      "description": "替补鼓手的信号",
      "tune": "530 组曲"
    },
    {
      "title": "舞台彩排",
      "kind": "stage",
      "mentor": "shiyuan",
      "description": "专场串烧彩排",
      "tune": "530 组曲"
    }
  ],
  "4": [
    {
      "title": "视听练耳",
      "kind": "ear",
      "mentor": "kongge",
      "description": "听清剧场里的跳进",
      "tune": "剧场组曲"
    },
    {
      "title": "旋律记忆",
      "kind": "memory",
      "mentor": "azhe",
      "description": "独奏主题记忆",
      "tune": "剧场组曲"
    },
    {
      "title": "霓虹节奏",
      "kind": "pulse",
      "mentor": "dijie",
      "description": "交错音轨，追上剧场灯光",
      "tune": "剧场组曲"
    },
    {
      "title": "搭档接奏",
      "kind": "duet",
      "mentor": "lala",
      "description": "SOLO 之后接住伙伴",
      "tune": "剧场组曲"
    },
    {
      "title": "舞台彩排",
      "kind": "stage",
      "mentor": "shiyuan",
      "description": "剧场灯下走台",
      "tune": "剧场组曲"
    }
  ],
  "5": [
    {
      "title": "视听练耳",
      "kind": "ear",
      "mentor": "kongge",
      "description": "迎着风辨认旋律",
      "tune": "夏日组曲"
    },
    {
      "title": "旋律记忆",
      "kind": "memory",
      "mentor": "azhe",
      "description": "音乐节主题记忆",
      "tune": "夏日组曲"
    },
    {
      "title": "霓虹节奏",
      "kind": "pulse",
      "mentor": "dijie",
      "description": "加速连击，迎接音乐节",
      "tune": "夏日组曲"
    },
    {
      "title": "搭档接奏",
      "kind": "duet",
      "mentor": "lala",
      "description": "迎着风接奏",
      "tune": "夏日组曲"
    },
    {
      "title": "舞台彩排",
      "kind": "stage",
      "mentor": "shiyuan",
      "description": "夏日舞台连排",
      "tune": "夏日组曲"
    }
  ],
  "6": [
    {
      "title": "视听练耳",
      "kind": "ear",
      "mentor": "kongge",
      "description": "补全序曲的回响",
      "tune": "拾光选段"
    },
    {
      "title": "旋律记忆",
      "kind": "memory",
      "mentor": "azhe",
      "description": "拾光主题记忆",
      "tune": "拾光选段"
    },
    {
      "title": "霓虹节奏",
      "kind": "pulse",
      "mentor": "dijie",
      "description": "四轨冲刺，奏响开幕",
      "tune": "拾光选段"
    },
    {
      "title": "搭档接奏",
      "kind": "duet",
      "mentor": "lala",
      "description": "侧台的接奏信号",
      "tune": "拾光选段"
    },
    {
      "title": "舞台彩排",
      "kind": "stage",
      "mentor": "shiyuan",
      "description": "开幕前的完整彩排",
      "tune": "拾光选段"
    }
  ]
};

// A fresh two-bar C-major dictation set is generated once per page load. Keeping
// the generated chart in memory makes playback/replay stable while a reload gets
// a different question. Submitted charts are copied into the attempt save so its
// answer review remains truthful after a later reload.
const LegacyChronicleEarPhrases = [
    [[3,5,6,5,3,2,1,0],[1,2,3,5,3,2,1,0],[5,3,2,3,5,6,5,0]],
    [[1,3,5,3,2,4,2,0],[3,2,4,5,6,5,3,0],[5,6,4,2,3,2,1,0]],
    [[1,3,6,5,4,2,3,0],[3,5,7,6,5,3,2,0],[6,4,2,5,3,2,1,0]],
    [[1,4,3,6,5,2,3,0],[5,2,4,7,6,4,3,0],[3,6,2,5,7,4,1,0]],
    [[1,5,3,7,6,2,4,0],[6,3,5,2,7,4,3,0],[5,7,4,6,2,3,1,0]],
    [[3,7,5,2,6,4,1,0],[1,6,4,7,3,5,2,0],[7,4,6,2,5,3,1,0]]
];
const ChronicleEarChartCache = new Map();
function chronicleEarRandom(max) {
    if (globalThis.crypto?.getRandomValues) {
        const value = new Uint32Array(1); globalThis.crypto.getRandomValues(value);
        return value[0] % max;
    }
    return Math.floor(Math.random() * max);
}
function chronicleEarPrevious(key) {
    try { return sessionStorage.getItem(`hjm-ear-chart:${key}`) || ''; } catch (_) { return ''; }
}
function rememberChronicleEarChart(key, signature) {
    try { sessionStorage.setItem(`hjm-ear-chart:${key}`, signature); } catch (_) {}
}
function buildChronicleEarChart(chapter, round) {
    const difficulty = chapter - 1 + round;
    const maxLeap = Math.min(4, 2 + Math.floor(difficulty / 3));
    const notes = [1 + chronicleEarRandom(5)];
    while (notes.length < 6) {
        const current = notes.at(-1), candidates = [];
        for (let note = 1; note <= 7; note++) {
            const distance = Math.abs(note - current);
            if (distance >= 1 && distance <= maxLeap) candidates.push(note);
        }
        notes.push(candidates[chronicleEarRandom(candidates.length)]);
    }
    const cadence = [1, 3, 5].filter(note => Math.abs(note - notes.at(-1)) <= maxLeap + 1);
    notes.push(cadence[chronicleEarRandom(cadence.length)] || 1, 0);
    const blankCount = 2 + Math.min(2, Math.floor(difficulty / 3));
    const candidates = [1, 2, 3, 4, 5, 6];
    const blanks = [];
    while (blanks.length < blankCount) blanks.push(candidates.splice(chronicleEarRandom(candidates.length), 1)[0]);
    blanks.sort((a, b) => a - b);
    return { notes, blanks, bpm: 62 + (chapter - 1) * 3 + round * 2 };
}
function legacyChronicleEarChart(chapter, round) {
    const blanks = [[2,5,1,4],[1,4,2,5],[3,5,1,4]][round].slice(0, 2 + Math.min(2, Math.floor((chapter - 1 + round) / 3))).sort((a,b)=>a-b);
    return { notes: LegacyChronicleEarPhrases[chapter - 1][round].slice(), blanks, bpm: 62 + (chapter - 1) * 3 + round * 2 };
}
function chronicleEarChart(chapter, round) {
    chapter = Math.max(1, Math.min(6, Number(chapter) || 1));
    round = Math.max(0, Math.min(2, Number(round) || 0));
    const key = `${chapter}:${round}`;
    if (ChronicleEarChartCache.has(key)) return ChronicleEarChartCache.get(key);
    const previous = chronicleEarPrevious(key);
    let chart, signature = '';
    for (let attempt = 0; attempt < 12 && (!signature || signature === previous); attempt++) {
        chart = buildChronicleEarChart(chapter, round);
        signature = `${chart.notes.join(',')}|${chart.blanks.join(',')}`;
    }
    if (signature === previous) {
        for (let shift = 1; shift < 6 && signature === previous; shift++) {
            chart.blanks = chart.blanks.map(index => 1 + ((index - 1 + shift) % 6)).sort((a, b) => a - b);
            signature = `${chart.notes.join(',')}|${chart.blanks.join(',')}`;
        }
    }
    ChronicleEarChartCache.set(key, chart);
    rememberChronicleEarChart(key, signature);
    return chart;
}
function resetChronicleEarCharts(chapter) {
    chapter = Math.max(1, Math.min(6, Number(chapter) || 1));
    for (let round = 0; round < 3; round++) ChronicleEarChartCache.delete(`${chapter}:${round}`);
}
