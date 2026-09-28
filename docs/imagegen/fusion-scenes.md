# 融合线场景插图

## 源图与用途

- 基础源图：`assets/fusion/source/fusion-scenes-8up.png`
- 用户提供的篇章入口源图：`assets/fusion/source/fusion-original-8up.png`
- 逐剧情八合一源图：原有母图以及 `fusion-nodes-complete-01.png` 至 `fusion-nodes-complete-07.png`、`fusion-nodes-shared-fixes.png`。补全批次的审计、提示词与逐格映射见 `docs/imagegen/fusion-completion-2026-09-28.md`。
- 成图：`assets/fusion/scenes/`
- 生成方式：内置图像生成工具。所有人物以卡牌立绘为唯一形象基准；十元以 `assets/shiyuan-portrait-v2.webp`、大鹅以 `assets/goose-portrait.webp`、悦柔以 `assets/yuerou-portrait.png` 为准，Jerry、垃垃、笛杰、大羊和宝石同样以各自卡牌资源为准。
- 绑定目录：`js/data/fusion-art.js`。112 个剧情节点都有插图绑定；逐台词分页时持续显示当前剧情节点的方形镜头，到达节点时自动收藏。
- 三张篇章入口横幅直接从用户提供的原八合一图裁切，不使用正文方形镜头。

## 最终提示词

Use case: illustration-story. Asset type: eight story-scene illustrations for a browser visual novel. Create one clean 4-column by 2-row contact sheet containing exactly eight independent panels for a contemporary Chinese community orchestra story. Keep every face and key action inside a central square-safe area with generous headroom. Preserve Jerry（短乱黑发、矩形眼镜、黑色短袖、蓝色牛仔裤、日落色电吉他）、悦柔（用户立绘中的长发、彩色发辫、灰色户外外套与小提琴）、垃垃、笛杰与大羊的参考形象和乐器。风格为精致半写实动漫、电影感视觉小说 CG，暖琥珀灯与蓝色夜光，无文字、无对白框、无标志、无水印，人物不跨格，乐器结构正确。

## 裁切坐标

基础源图尺寸为 1672×941；正文从每格中央取方形安全区并放大。逐剧情源图为 1254×1254、1536×1024 或 1774×887，分别按四列两行取 304×304、376×376 或 430×430 方形安全区。

| 文件 | 坐标 | 剧情节点 |
|---|---:|---|
| `hill-arrival.jpg` | `228:228:302:0` | `rl / fs_00` |
| `chaotic-rehearsal.jpg` | `228:228:1142:0` | `rl / fs_02` |
| `one-microphone.jpg` | `228:228:302:239` | `rl / fs_03` |
| `moon-canon.jpg` | `228:228:1142:239` | `rl / fs_04` |
| `split-night.jpg` | `218:218:307:474` | `rl / fs_08` |
| `late-chat.jpg` | `218:218:1147:474` | `ep2 / f2_ll11` |
| `fusion-rehearsal.jpg` | `235:235:298:706` | `fm / m_ice` |
| `fusion-night.jpg` | `235:235:1138:706` | `fm / m_show` |

### v16 新增八合一映射

| 源图 | 第一行（从左到右） | 第二行（从左到右） |
|---|---|---|
| `fusion-nodes-v16-main.png` | `f2_m1`、`f2_m2`、`f2_m3`、`f2_m4` | `f2_llclose`、`g_ice`、`g_pre`、`g_post` |
| `fusion-nodes-v16-chat.png` | `f2_aq1`、`f2_aq2`、`f2_aq3`、`f2_slap` | `f2_bs1`、`f2_bs2`、`f2_bs3`、`f2_bsstop` |
| `fusion-nodes-identity-fixes.png` | `fs_07-v2`、`f2_llclose-v2`、`m_talk_ge-v2`、`m_sd_ge-v2` | `f2_yrask-v2`、`f2_yrdj-v2`、`f2_yrmv-v2`、`m_pre1-v2` |
| `fusion-nodes-jerry-viewpoint.png` | `f2_ll5-v3`、`f2_hermusic-v3`、`f2_ll6-v3`、`f2_ll7-v3` | `f2_ll7rage-v3`、`f2_chase-v3`、`f2_ll7b-v3`、`m_pre1-v3` |

`f2_cpgo` 与 `f2_aq1` 已在补全审计中生成独立镜头；融合线不再借用相邻节点图片，也不再按索引轮播通用旧图。

### 角色一致性复核（2026-09-27）

- 已逐格检查六张逐剧情八合一源图，核对角色卡牌、服装、发型、乐器和对白归属。
- `fs_07` 原图把十元画成长黑发黑衣角色，已替换为短棕色波波头、左侧金色星星发夹、米白针织开衫与橄榄绿裙的卡牌形象。
- `f2_llclose` 原图误用了十元，已替换为长深棕发、齐刘海、白色蝴蝶结、白衬衫与黑裙的垃垃形象。
- 大鹅、悦柔、笛杰与垃垃的高风险对话新增专属镜头，避免继续轮用可能出现错误人物的通用插图。
- 新人物插图必须先核对卡牌立绘，再检查面部、发型、标志性配饰、服装、性别、乐器与对白归属；任何一项不符不得接入。人物持琴时还必须检查琴弓、琴体、双手与接触关系，不使用悬浮或断裂乐器图。
- 融合线固定采用 Jerry 视角：源剧情中的“你”均指 Jerry。凡台词写明“你”在场，插图必须出现短乱黑发、矩形眼镜、黑色短袖与蓝色牛仔裤的 Jerry；不能只画对话对象，也不能用其他黑发男性代替。

### Jerry 视角修复提示词

使用内置图像生成工具生成严格四列两行的八合一视觉小说母图。所有格子都明确出现卡牌形象一致的 Jerry（短乱黑发、矩形眼镜、黑色短袖、蓝色牛仔裤）；垃垃固定为深棕长发、齐刘海、白色蝴蝶结、白衬衫与黑裙，不得混入悦柔的彩色发辫和灰色户外外套。八格依次表现：发送原创、讨论 city pop 小样、观察垃垃补三个声部、例会讲章程、垃垃饥饿离场、走廊追上垃垃、深夜微信回复、门外听爱尔兰民谣练习。人物不跨格，无文字与水印；小提琴、琴弓、手指和肢体结构正确。

使用 `scripts/crop-fusion-art.sh` 可从源图重建全部成图。
