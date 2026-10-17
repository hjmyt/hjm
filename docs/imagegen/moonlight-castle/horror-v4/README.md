# 月光古堡：逐周目恐怖氛围重绘 v4

2026-10-17。正式资源为 74 张单独 Image2 高清生成图，不使用八合一裁切。原始 PNG 全部保存在 `assets/moonlight-castle/source/horror-v4/`，正式 WebP 总计 23,854,972 字节，位于 `assets/moonlight-castle/horror-v4/`。历史素材保留以便核对。

## 可重建的制作记录

- `generation-plan.json`：74 张的语义 ID、前后文、真实在场人物、画中人物、服装、参考与提示词。
- `prompts/`、`receipts/`：逐张实际提示词与 Image2 来源回执。纠错图另存 `*-correction.txt`，对应首次尝试原图也保留。
- `references/reference-boards.json`：十人晨间群像参考板的正式角色源图、SHA 与机械裁切坐标；参考板只作身份输入，最终群像单独生成。
- `story-audit.json` / `.md`：独立通读原文的 28 个房间状态、34 类关键事件、136 条对白／赠物／问答／寻名绑定。
- `geometry-overrides.json`：最终逐图物体轮廓、人物姓名牌及房门坐标；`geometry-reviewed-*.json` 保留独立审查建议。
- `plan.json`：74 张正式尺寸、字节数、路径、角色集合，以及八条明确复用映射。
- `contact-sheet.png`：按剧情制作顺序标有语义 ID 与人物集合的联系表。
- `visual-review-stage*.md`：独立审查 agent 对原图与剧情状态的逐项记录。

## 构建

```sh
node scripts/build-moonlight-castle-horror.cjs
node scripts/version-assets.cjs
node scripts/version-assets.cjs --check
node tests/moonlight-castle-horror-art.cjs
node tests/moonlight-castle-story-art.cjs
node tests/moonlight-castle-event-phases.cjs
```

需要 Node.js 的 sharp 与浏览器回归使用的 Playwright。构建只对独立原图等比编码，不生成新图、不放大旧裁图。脚本写回运行清单 `js/data/moonlight-castle-story-art.js`；执行层 `CastleSceneArt` 通过周目、结构化对白 ID 与明确动作 ID 解析，不从人名字符串推断现场人物。

## 本次验收

已通过 architecture、economy、unified-bonds、image-cache-static、moonlight-castle-horror-art，以及古堡 story-art、object-regions、unified、完整主流程、outcomes、immersive、typewriter、panorama、sound、voices、ducking 回归。覆盖旧 v1 继续与损坏恢复、三轮真实谜题、三结局、74 张语义资源、十人晨间群像、第三周目局部画像淡入、失踪者回声与返回探索、整物点击、手机等比拖动／缩放、字幕不抖动及西语配音压低 BGM。

浏览器测试使用隔离上下文，未修改玩家实际存档；主流程测试会生成的 fixture 已逐字恢复。自动化的手机模拟不代替 iPhone 真机验收。

## 阶段事件补图与名牌修正

新增 15 张独立 Image2 原图，为七种可跨阶段触发的事件配置 22 个明确阶段绑定；首次三周目和日出事件独立使用自己的背景、道具状态与光线。`scripts/plan-moonlight-castle-event-phases.cjs` 可单独重建补图计划，也由主计划脚本自动调用。最终运行清单含 `eventPhaseBindings`，无对应阶段时返回当前房间，禁止借旧图。

新回归实际点击四阶段的琴盒、音乐盒、碎镜，验证返回正确房间、旧日出存档恢复、sunrise 标记优先级和阶段间图片不同；同时检查两套晨间群像的14种横竖屏／全景／放大组合，每一张名牌都不覆盖笛杰、柒柒面部。蓝魂庇护的延时回调另验证换房和日出后不会串场。新15张由主 agent 逐张查看；原59张独立审查范围见 `visual-review-final.md`，不将两者混记。
