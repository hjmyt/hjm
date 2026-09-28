# 融合线插图补全审计（2026-09-28）

## 审计结论

- 剧情数据共 112 条节点记录、109 个不同剧情 ID（悦柔 3 个微信节点在第二、三篇为同一事件）。
- 原绑定中 54 个节点仍按序轮用通用旧图，另有 `f2_cpgo`、`f2_aq1` 借用相邻节点图片。
- 本轮生成 8 张新的四列两行母图：54 个通用图缺口、2 个相邻借图缺口、8 个 QA 备用格。
- 修复后除原本已有专属八合一格子的节点外，所有缺口均改为剧情专属格；代码不再包含通用轮播或相邻节点借图。

## 统一生成约束

Use case: illustration-story. Asset type: 8-up source sheet for a Chinese browser visual novel. Create exactly one clean 4-column by 2-row contact sheet with exactly eight independent panels separated by straight thin white gutters. Never subdivide a panel or use diagonal separators. Contemporary Chinese community orchestra, refined semi-realistic anime visual-novel CG, cinematic warm amber rehearsal/bar lighting with blue night accents. No text, captions, speech bubbles, logos or watermark. No subject crosses a gutter. Keep faces, hands, phones and instruments in each panel's central square-safe area with generous headroom. Correct anatomy and instrument construction.

Jerry 固定为短乱黑发、矩形眼镜、黑色上衣、蓝色牛仔裤的男性现代音乐人；垃垃固定为深棕长发、齐刘海、白色蝴蝶结、白衬衫、黑裙的小提琴手；十元固定为短棕色波波头、金色星星发夹、米白针织开衫、橄榄绿裙的小提琴手。大羊、笛杰、大鹅、宝石均以仓库卡牌立绘为参考图。

## 母图与剧情格

| 母图 | 第一行（从左到右） | 第二行（从左到右） |
|---|---|---|
| `fusion-nodes-complete-01.png` | `f2_01` 首个电话、`f2_ll1` 邀垃垃协助、`f2_rec` 推荐三人、`f2_rec2` Jerry 自己决定 | `f2_ll3` 对名单、`f2_ll4` 听获奖曲、`f2_ll7c` 微信回复、`f2_ll8` 缺键盘 |
| `fusion-nodes-complete-02.png` | `f2_ll9` 垃垃睡着、`f2_ll10` 夜路反思、`f2_ll11soft` 温和回复、`f2_ll11b` 离婚玩笑 | `f2_ll11c` 对话沉底、`f2_end` 第二篇落幕、`m_r2` 萨克斯缺席、`m_r2a` 三个未接电话 |
| `fusion-nodes-complete-03.png` | `m_r3` 鼓凳空缺与小杰出错、`m_r4` 换人与垃垃要声音、`m_r4b` 等待答复、`m_r5` 调音与 Rap | `m_r6` Jerry 缺席、`m_r6a` 大鹅退群、`m_pre2` 对稿前、`m_talk_ld` 老杜看稿 |
| `fusion-nodes-complete-04.png` | `m_talk_dy` 大羊看稿、`m_talk_dj` 笛杰看稿、`m_talk_ll` 垃垃改稿、`m_sd_ld` 老杜后台 | `m_sd_dy` 大羊后台、`m_sd_ll` 垃垃后台、`m_sd_dj` 笛杰后台、`m_show2` 十元迈入舞台 |
| `fusion-nodes-complete-05.png` | `m_ok` 成功、`m_bad` 翻车、`m_perfect` 哈基米之歌、`f2_ldp1` 老杜听 demo | `f2_ldp2` solo 如说话、`f2_ldp2a` 听自己、`f2_ldp2b` 满不是错、`f2_ldp3` 场合与格调 |
| `fusion-nodes-complete-06.png` | `f2_ldp3a` 今晚在哈基米、`f2_ldnight` 管乐之夜、`f2_dy1` 四十六秒语音、`f2_dy2` 无人听的跑场 | `f2_dy3` 玩笑挡真心、`f2_rocknight` 台阶双吉他、`f2_dj1` 在水一方、`f2_dj2` 两种谱语言 |
| `fusion-nodes-complete-07.png` | `f2_dj3` 念专业评价、`f2_fusenight` 录音棚突破、`m_ep` 彩虹姐消息、`m_ep1` 决裂 | `m_ep2` 好聚好散、`m_ep3` 大鹅转达、空排练室 QA、Jerry 笔记本 QA |
| `fusion-nodes-shared-fixes.png` | `f2_cpgo` Jerry 坐下倾听宝石、`f2_aq1` 九点收贝斯、空键盘 QA、空萨克斯位 QA | 首个电话 QA、侧幕成功 QA、垃垃手机 QA、空山丘 QA |

## 裁切规则

- 1536×1024 母图：按四列两行切格，从每格中央安全区取 376×376，输出 752×752 JPG。
- 1254×1254 母图：按四列两行切格，从每格中央安全区取 304×304，输出 608×608 JPG。
- 所有裁切由 `scripts/crop-fusion-art.sh` 重建；源图不得删除。

## 参考图

- `assets/jerry-portrait.png`
- `assets/cardLala.webp`
- `assets/shiyuan-portrait-v2.webp`
- `assets/dayang-portrait.webp`
- `assets/dijie-portrait-v2.webp`
- `assets/goose-portrait.webp`
- `assets/baoshi-portrait.webp`
- `assets/lemon-portrait.webp`

生成方式：Codex 内置 imagegen。每张母图独立调用，提示词由统一约束加上表中八个具体剧情动作组成。
