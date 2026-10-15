# 月光古堡过场与结局配图

2026-10-16 使用内置 Image2 逐张生成八张 1448×1086 独立原图，补齐死亡转场、真相转场、追逐、Wrong Ending、三个乐章结局与安魂曲补全。源文件保存在 `assets/moonlight-castle/source/outcomes-v1/`，正式 WebP 为 `assets/moonlight-castle/overlay-*-v1.webp`。

完整提示词为本目录的 `*-prompt.txt`，`plan.json` 记录稳定语义 ID、前后文、当前剧情、`visibleCast`、来源和输出路径。`contact-sheet.png` 为核对联系表。艾德里安与菲利克斯尚无正式人物卡，八张图均以环境、蜡烛、纸页、魂光表现事件，`visibleCast: []`，不生成替代人物脸。

| 执行状态 | 语义图 ID | 画面 |
| --- | --- | --- |
| 第二周目转场 | loop-death | 熄灭的蜡烛、红月塔楼 |
| 第三周目转场／拼合信件 | loop-truth | 四片焦信拼合、金色接缝 |
| 追捕失败 | wrong-ending | 封闭的门、熄灭的烛火 |
| 追逐进行中 | pursuit | 可逃离的走廊与开启的门 |
| 第一乐章结局 | ending-grief | 空琴凳上的孤独蓝色魂光 |
| 第二乐章结局 | ending-tenderness | 相遇的蓝金两束魂光 |
| 第三乐章结局 | ending-farewell | 日出中的蓝金光柱 |
| 修复乐谱／完整曲谱详情／风琴演奏 | score-restored | 三页完整乐谱、羽毛笔与信物 |

信件和乐谱弹窗显式复用对应物件语义图；暂停页使用当前实际房间图。全屏过场与结局使用铺满的 CG 背景，文字和按钮叠在渐暗区域；正文独立滚动，背景保持固定，切换事件时从标题开始。横屏追逐保留触摸操作空间，竖屏允许完整阅读所有原文。

重建：`node scripts/build-moonlight-castle-outcomes.cjs`（需要 sharp）。脚本仅编码独立原图和生成 QA 联系表，不从八合一放大。代码映射位于 `CASTLE_OVERLAY_ART`；按已有周目、阶段和乐章选择，不新增存档字段。通过公共 `scheduleStoryImagePreload()` 预载实际下一事件或已选乐章图。

回归：`node tests/moonlight-castle-outcomes.cjs` 覆盖八张图的语义与来源、五种横竖屏尺寸、全文和按钮可达、背景固定、事件滚动位置、旧 v1 存档继续、暂停与追逐、信件和乐谱弹窗。
