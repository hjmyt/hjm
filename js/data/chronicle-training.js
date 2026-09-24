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

// Original two-bar C-major phrases, one beat per number; 0 extends the preceding note.
const ChronicleEarPhrases = [
    [[3,5,6,5,3,2,1,0],[1,2,3,5,3,2,1,0],[5,3,2,3,5,6,5,0]],
    [[1,3,5,3,2,4,2,0],[3,2,4,5,6,5,3,0],[5,6,4,2,3,2,1,0]],
    [[1,3,6,5,4,2,3,0],[3,5,7,6,5,3,2,0],[6,4,2,5,3,2,1,0]],
    [[1,4,3,6,5,2,3,0],[5,2,4,7,6,4,3,0],[3,6,2,5,7,4,1,0]],
    [[1,5,3,7,6,2,4,0],[6,3,5,2,7,4,3,0],[5,7,4,6,2,3,1,0]],
    [[3,7,5,2,6,4,1,0],[1,6,4,7,3,5,2,0],[7,4,6,2,5,3,1,0]]
];
function chronicleEarChart(chapter, round) {
    const blanks = [[2,5,1,4],[1,4,2,5],[3,5,1,4]][round].slice(0, 2 + Math.min(2, Math.floor((chapter - 1 + round) / 3))).sort((a,b)=>a-b);
    return { notes: ChronicleEarPhrases[chapter - 1][round], blanks, bpm: 62 + (chapter - 1) * 3 + round * 2 };
}
