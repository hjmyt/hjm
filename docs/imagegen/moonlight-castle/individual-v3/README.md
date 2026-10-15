# 独立高清场景 · 2026-10-16

按用户最新要求，使用内置 ImageGen（Image2）逐张生成九张完整高清图。当前游戏只使用本目录 `plan.json` 对应的独立 WebP，不使用八合一裁图，不把小图放大冒充高清。每张原图保存在 `assets/moonlight-castle/source/individual-v3/`；网页使用 `assets/moonlight-castle/*-exploration-v3.webp`。

## 原图与实际提示词

| 语义画面 | 在场人物 | 提示词 |
| --- | --- | --- |
| hall-exploration-v3 | 叶思阳、Tim | [hall-prompt.txt](hall-prompt.txt) |
| dining-exploration-v3 | 冰冰、宝石、飞鸿 | [dining-prompt.txt](dining-prompt.txt) |
| study-exploration-v3 | 笛杰、柒柒 | [study-prompt.txt](study-prompt.txt) |
| music-exploration-v3 | Jerry | [music-prompt.txt](music-prompt.txt) |
| bedroom-exploration-v3 | 十元 | [bedroom-prompt.txt](bedroom-prompt.txt) |
| cellar-exploration-v3 | 垃垃 | [cellar-prompt.txt](cellar-prompt.txt) |
| tower-exploration-v3 | 无可见人物，艾德里安使用对话入口 | [tower-prompt.txt](tower-prompt.txt) |
| dawn-exploration-v3 | 无可见人物 | [dawn-prompt.txt](dawn-prompt.txt) |
| exterior-exploration-v3 | 无人物 | [exterior-prompt.txt](exterior-prompt.txt) |

每个有名角色只使用本房间的 `*-references.png` 角色参考表。身份仍以正式完整角色卡为唯一基准，参考来源在上级 `character-references.json`。无人物场景不提供角色参考。

## 服装与在场核对

已逐张检查正式原图：大厅只出现叶思阳与 Tim，前者穿领结铜扣执事制服，后者穿银色骑士铠甲、空手、露头并保留眼镜；餐厅三位实际在场人物作为统一可点击房间的显式群像例外，冰冰白裙、宝石无眼镜黑衬衫、飞鸿眼镜白外衫／银链／黑手套；书房只出现笛杰与柒柒，竹笛和塔罗牌各归本人；音乐室只有 Jerry，黑短袖／牛仔裤／矩形眼镜，持小号；主卧只有十元，短发与花饰保留、黑白长袖女仆装和白围裙／发带；地下室只有垃垃，侧束发与浅色蝴蝶结、紫色袍、水晶球。塔楼、日出及外景无人。

所有当前提示词保留前文、当前在场人物、当页动作和后文，禁止场外角色入镜。曾尝试使用全员参考表的几张错误群像已剔除，未接入游戏。原八合一 v1／v2 只作为历史和构图参考，不能恢复为正式运行时图。

`plan.json` 保存独立源图、尺寸、正式文件、`visibleCast`、服装锁、群像例外和角色点击位置；`contact-sheet.png` 按房间顺序标注语义 ID 与在场人物。场景中的物品锚点和房门在 `js/data/moonlight-castle.js` 显式配置，调查和交谈保持同一幅画面。

## 重建与回归

```sh
node scripts/build-moonlight-castle-individual.cjs
node scripts/version-assets.cjs
node scripts/version-assets.cjs --check
node tests/moonlight-castle-unified.cjs
node tests/moonlight-castle.cjs
node tests/moonlight-castle-immersive.cjs
node tests/moonlight-castle-typewriter.cjs
```

编码使用等比缩放（只缩小、不放大）和 WebP quality 91；不裁人物和家具。联系表用于 QA，游戏不加载该表。
