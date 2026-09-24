# 项目结构

这是一个无需构建的静态浏览器游戏。`index.html` 仅保留页面结构与资源入口；运行逻辑、配置和样式按职责放在独立目录。可直接打开 `index.html`，也可用静态 HTTP 服务访问。

## 目录与修改入口

| 位置 | 职责 |
| --- | --- |
| `index.html` | 页面容器、导航、弹窗骨架；按依赖顺序加载样式与脚本 |
| `styles/` | 基础组件、卡册、正传、人物技能、章节补充、垃垃界面、主题、相册及正传阅读器 |
| `js/data/` | 图片路径、人物卡、角色故事、回忆、曲目、正传场景与结局目录 |
| `js/core/state.js` | 存档键、初始状态、旧档清洗、读取与保存；不在加载文件时读取存档 |
| `js/core/economy.js` | 音符规则、永久领奖记录、每日额度与迁移 |
| `js/core/bonds.js` | 羁绊规则、全局同步、增长与领取记录 |
| `js/core/utils.js` | DOM 查询、转义、范围约束、日期等基础工具 |
| `js/chronicle/index.js` | 正传控制器、共享运行状态、跨模块连接与公开接口 |
| `js/chronicle/chapters/` | 各章对白、分支与章节专属规则；第五、六章共用一个后期剧情模块 |
| `js/chronicle/persistence.js` | 正传存档清洗、原版导入、章节继承、切章和重开 |
| `js/chronicle/activities.js` | 周常、练琴、聊天、选项结算、合练考核 |
| `js/chronicle/performance.js` | 正传五段演出、暂停、判定和结局结算 |
| `js/chronicle/encounters.js` | 已读剧情、相遇识别、旧剧情解锁补齐与手记 |
| `js/chronicle/bar.js` | 山丘酒单、停业、请客等剧情流程 |
| `js/chronicle/views.js` | 正传页面、周常面板、结局图鉴和规则说明 |
| `js/cards/` | 卡册模型、卡牌存档、解锁、页面、培养操作、招募和演奏结算 |
| `js/cards/skills/` | 各组角色的独立技能与成长行为 |
| `js/features/` | 团宠、角色故事、相册、设置与导入导出、节奏游戏 |
| `js/audio/` | 剧情 BGM 与 Web Audio 合成音；音频文件仍在 `assets/bgm/` |
| `js/ui/` | 图标、弹窗、提示、导航和全局页面刷新 |
| `js/app/events.js` | 集中注册页面事件；仅由启动入口调用一次 |
| `js/app/bootstrap.js` | 唯一启动入口：读档 → 绑定事件 → 挂载正传 → 初始化并渲染 |
| `assets/` | 图片、音频等静态素材 |
| `tests/` | 浏览器回归；运行方式见 `tests/README.md` |

## 加载与模块边界

使用有序的经典脚本配合 `defer`：浏览器可以并行下载，按 HTML 中的顺序执行。这样保留 `file://` 直接打开能力，无需打包器、远端依赖或运行时 `fetch`。不要把任一脚本改成 `async`；`bootstrap.js` 始终最后加载。

加载阶段只声明函数、初始化静态目录和运行时控制变量。存档读取需要所有角色的清洗函数，因此必须由最终入口调用 `loadState()`。页面事件也在此时统一注册，避免各文件重复初始化。

应用层沿用已有的共享 `state` 和函数接口，以兼容本地存档与现有回归测试。文件边界按职责划分，并非每个文件都是 ES Module。纯配置放在 `data/`，经济和羁绊规则只在 `core/` 维护；功能代码通过这些入口修改状态。

正传模块使用显式工厂：`createChronicle…(ctx)` 返回该模块的接口。模块内部函数保持私有，跨模块依赖通过 `ctx` 访问；控制器提供实时访问器，使切章、重开或替换存档后不会捕获过期状态。新增正传函数时，在所属模块导出，并按需在 `chronicle/index.js` 中连接。不要把章节对白放回控制器。

`data/cards.js` 每个角色只定义一次，不再先写占位角色、后追加覆盖。调整卡牌基础设定改这里；实际投喂价格与羁绊收益由全局规则决定。

## 样式与资源

样式加载顺序为 `base → cards → chronicle → character-skills → chronicle-chapters → lala → theme → chronicle-weeks → album → chronicle-reader → chronicle-training`，保留原有覆盖关系。组件样式在所属文件维护，通用主题与最终响应式调整在 `theme.css`；不要随意调整链接顺序。

JS 中的图片和音频路径仍相对于页面根目录。CSS 的 `url()` 相对于样式文件，后续新增时注意使用 `../assets/…`。发布或复制时需同时带上 `index.html`、`js/`、`styles/`、`assets/`。

## 验证

- `node tests/architecture.cjs`：脚本语法、入口顺序、资源完整性、`file://` 与严格 MIME 的 HTTP 加载、刷新存档、桌面和手机布局。
- `node tests/economy.cjs`、`node tests/unified-bonds.cjs`：音符与羁绊规则。
- 其余章节、卡牌、音频回归见测试目录说明。

本次拆分保持存档键与存档格式不变，未引入新的经济或剧情规则。

### 连贯叙事与周训练

`js/data/chronicle-weeks.js` 保留既有剧情块 ID，用于连贯开场、晚期事件与旧按周存档迁移。`js/chronicle/weeks.js` 处理这些边界；章节 `weekly.version=2` 将已读块与实际周数分离。

`js/data/chronicle-training.js` 定义每章五种训练主题。`js/chronicle/training.js` 实现三轮评分、报名、进度、音画提示与暂停。`economy.training[章节:周次]` 保存全局付款与收益，`weekly.training` 保存局部尝试。计时器只存在于当前页面，读档会回到本轮准备阶段；不能依靠浏览器后台时间结算成绩。

重开时从原章节起点加回已结算的本章训练收益，报名不退、奖励不重复。`Chronicle.suspend` 同时暂停演出和训练；`StoryBgm` 在训练场景暂停背景音乐。

`js/data/chronicle-art.js` 定义章节、场景、条件、标题和插图映射，先于 `data/memories.js` 加载；`js/chronicle/art.js` 负责到达收藏和已读手记迁移。场景素材在 `assets/chronicle/scenes/`，生成记录在 `docs/imagegen/chronicle/`。

`tests/weekly-stories.cjs` 检查连贯开场及晚期事件；`tests/chronicle-training.cjs` 覆盖真实练习、付款去重、暂停、续练和成长；`tests/chronicle-art.cjs` 覆盖配图与收藏。

- `js/chronicle/pulse.js`：霓虹节奏四轨谱面、音画时间轴、判定与场景；由 `training.js` 调用，奖励仍走统一训练记录。

礼品卡：`js/data/gift-keys.js` 仅保存公钥；`js/features/gift-cards.js` 负责验签、兑换与表单，记录由 `js/core/economy.js` 清理和持久化；`scripts/gift-card.cjs` 在网站外保存私钥并本地签发。详见 `docs/gift-cards.md`。

- `js/chronicle/ear.js`：视听练耳的简谱填空、音画同步与输入；题库在 `js/data/chronicle-training.js`，三轮结算和旧训练记录继续由 `training.js` 管理。

## 第七章 · 个人线

`js/data/personal-routes.js` 为独立剧情目录，由 `scripts/build-personal-routes.py` 从 `docs/story-sources/personal/` 内的两份原稿提取；HTML 原稿只作为文本解析，不运行其中的原型脚本。`js/chronicle/personal.js` 通过显式工厂接入正传控制器，样式在 `styles/chronicle-personal.css`。

六章的 `run`、`slots` 与原章节编号保持兼容。个人线保存在 `chronicle.personal`：当前角色与阅读状态、每角色独立的剧情节点、选择标记、已读场景、结局和相处记录。角色羁绊仍由全局 core 提供，进入条件为完成第六章且对应角色羁绊严格大于 35。第七章奖励共用 `economy.claimed['chapter:7']`，不同个人线或结局不重复发放。

个人线插图按每个阅读节点单独绑定，回忆 ID 为 `cp7_<节点>`；只按实际已读记录收藏和补齐。8 合 1 原图在 `assets/chronicle/personal/source/`，提示词、清单与坐标在 `docs/imagegen/personal/`，运行 `python3 scripts/crop-personal-art.py` 重建全部裁图。
