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
| `js/core/progression.js` | 全局乐团／乐队等级、成员归属、一次性升级里程碑、旧章节等级迁移与章节同步 |
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
| `js/audio/` | 剧情 BGM、Web Audio 合成音与节奏原曲播放；音频位于 `assets/bgm/` 和 `assets/audio/` |
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

卡牌原图仍由 `cardImage(card, usage)` 按 `cover`、`avatar`、`full` 选择安全构图；首页小卡、卡册列表和对白头像改由 `cardThumbnail` 选择 `assets/thumbs/` 下的 360、720、192 px 派生图，详情页继续使用原图。新增或替换人物图片后运行 `node scripts/build-card-thumbnails.cjs` 重建缩略图；Bill 的 SVG 占位卡保持矢量资源，不生成 WebP 派生图。

`js/cards/preload.js` 在人物进入对白、用户悬停、聚焦或按下卡牌入口时预加载完整立绘，并在快速网络的空闲时段按顺序预热其余人物；省流量和 2G/3G 环境会缩小范围。HTTP(S) 部署同时注册根目录 `sw.js`，以 stale-while-revalidate 持久缓存同源图片；`file://` 直开自动跳过 Service Worker。

首页 JS/CSS 引用包含 `?v=内容哈希`。修改后运行 `node scripts/version-assets.cjs` 更新引用，发布时同时上传首页与资源；`--check` 检查版本是否过期，architecture 回归也会执行此检查。参数不改变经典脚本的顺序或 `defer` 行为，不影响 file:// 加载及存档。首页自身的缓存需由部署端通过 `Cache-Control: no-cache` 控制，详见 README 的发布说明。

## 验证

- `node tests/architecture.cjs`：脚本语法、入口顺序、资源完整性、`file://` 与严格 MIME 的 HTTP 加载、刷新存档、桌面和手机布局。
- `node tests/economy.cjs`、`node tests/unified-bonds.cjs`：音符与羁绊规则。
- `node tests/progression-levels.cjs`：第一章乐队筹备、乐队／乐团成员归属、节奏舞台等级成长与里程碑防篡改。
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

音符余额、全部角色与团宠羁绊、全局乐团等级和全局乐队等级在运行时仍使用直接数值；角色羁绊只有一个全局对象，`state.affinity`、`chronicle.bonds` 与六章运行态的 `aff` 只是对同一对象的兼容引用，不维护章节羁绊副本。羊村线的 `chronicle.personal.routes.yangcun.aff` 是明确例外：它表示当前重读周目的剧情好感，只参与十二月分流，不是羁绊兼容引用。等级增长只通过 `progression.js` 的白名单里程碑结算，剧情选择、每章首次验收／正式演出、训练节点，以及节奏舞台首次取得某一评级分别去重。乐队成员固定为大鹅、小塔、大羊、宝石、雪子、飞鸿；阿喆、笛杰归乐团。

写入浏览器和导出备份时由 `js/core/state.js` 分别转为带随机数、字段绑定与完整性标记的轻量对称加密 `wallet`、`bondVault`、`levelVault`，并删除所有章节快照中的明文羁绊和等级字段；持久化羁绊只有一份 `bondVault`。`bondVault` 使用显式版本迁移：v1 可补齐后来加入的小杰、REK 与阿齐，v2 只可补齐后来加入的阿齐，当前 v3 要求角色表完整；迁移只初始化新增角色为 0，不影响原有角色羁绊。`levelVault` 同时校验等级和已领取里程碑，不能只删除领取记录后重复升级。新版浏览器存档使用独立键且只接受三组完整加密数据；旧键只用于首次读取历史本地存档，成功保存新版后会删除本项目旧键。每次成功保存前保留上一份可读浏览器备份；当前存档校验失败时优先恢复备份，同时单独保留故障原文。若没有可读备份则暂停所有自动保存，绝不以新档覆盖故障存档。外部文件导入同样必须包含三组有效加密数据。固定前端密钥只用于阻止直接编辑 JSON，不构成服务端级防作弊或真实资产保障。

- `js/chronicle/ear.js`：视听练耳的简谱填空、音画同步与输入；题库在 `js/data/chronicle-training.js`，三轮结算和旧训练记录继续由 `training.js` 管理。

## 第七章 · 个人线

`js/data/personal-routes.js` 为独立剧情目录，由 `scripts/build-personal-routes.py` 从 `docs/story-sources/personal/` 的原稿与正式改编说明生成；HTML 原稿只作为文本解析，不运行其中的原型脚本。羊村原稿中的五月至十一月聊天池也由构建脚本提取为 `YANGCUN_CHAT`：每月正文结束后进入四次聊天机会，同时结算本周目好感和角色唯一的全局羁绊。好感随羊村线重开清零并可重新培养；全局羁绊使用永久键，同一聊天跨周目只结算一次。十一月聊天后按宝石＋飞鸿本周目好感合计值或最高角色本周目好感分流；两人好感合计达到 100 时永久解锁独立 CP 线，先保存羊村十二月分支，再弹窗让玩家选择留在羊村线或立即跳转，交互与融合线解锁一致。第二章乐队组选择会永久解锁第七章羊村线，但不会截断第二章。`js/chronicle/personal.js` 通过显式工厂接入正传控制器，样式在 `styles/chronicle-personal.css`。

六章的 `run`、`slots` 与原章节编号保持兼容。个人线保存在 `chronicle.personal`：当前角色与阅读状态、每角色独立的剧情节点、选择标记、已读场景、结局、相处记录，以及剧情来源的自然解锁记录 `storyUnlocks`。角色羁绊仍由全局 core 提供；阿喆、十元入口要求完成第六章且对应角色羁绊严格大于 35，宝石×飞鸿 CP 线还可由融合线关键聊天直接解锁并跳转。第七章奖励共用 `economy.claimed['chapter:7']`，不同个人线或结局不重复发放。

个人线插图按每个阅读节点单独绑定，回忆 ID 为 `cp7_<节点>`；只按实际已读记录收藏和补齐。8 合 1 原图在 `assets/chronicle/personal/source/`，提示词、清单与坐标在 `docs/imagegen/personal/`，运行 `python3 scripts/crop-personal-art.py` 重建全部裁图。

## 原曲节奏试玩

`js/audio/rhythm-recording.js` 在 synth 之前加载，以媒体元素支持 file/HTTP 原曲播放。`features/rhythm.js` 对录音曲目使用媒体时间同步落点与判定；合成曲目保持原时钟。谱面与片段元数据在 `data/tracks.js`，音频在 `assets/audio/rhythm/`，试玩制作记录见 `docs/rhythm-op-preview.md`。录音曲目以独立 ID 存最佳记录，旧曲索引键保持兼容。

## 网站背景音乐

`js/audio/story-bgm.js` 用同一个播放器管理网站背景音乐与原有剧情配乐。首页、卡册、角色详情、小屋和相册循环播放用户提供的《恋与哈基米（弦乐纯享版）》完整音频 `assets/bgm/love-hakimi-strings.mp3`；这些页面之间切换不重播。乐团剧情与心动故事继续使用原有选曲，训练和演出暂停；节奏舞台整页暂停背景音乐，离开后恢复对应页面的配乐。

每次加载页面都先显示独立欢迎入场层，不沿用上次入场选择跳过弹窗；用户点击「进入乐团」后在同一次可信手势中解锁并循环播放，也可选择「静音进入」。欢迎层不自动聚焦按钮，避免鼠标用户一进入就看到焦点框；键盘导航时仍保留全站焦点提示。保留已保存的配乐音量、总静音等偏好，页面后台暂停。普通页面的控制栏与剧情控制栏共用开关、音量及原有 `hjm-story-bgm-v1` 偏好；总声音关闭时暂停。保留 file:// 播放，单播放器避免重叠。音频按用户提供的原文件直接复制，无裁剪、无额外转码，时长约 154.85 秒，使用媒体 `loop` 循环；SHA-256：`5574c5589309260dde6dba5be6d697c10e41ecb2534ed0a1b4f0edab8af150c0`。

首次用户操作若同时触发切页，媒体播放请求可能先于音频音量节点初始化。`StoryBgm.unlock()` 在允许播放时立即恢复输出音量，避免播放请求尚未完成时新增节点保持零音量；回归通过刷新后直接点击／触摸进入剧情并检测音量节点后的信号覆盖该路径。

节奏舞台新增录音目录 `js/data/tracks-extra.js` 紧接 `tracks.js` 加载，仅追加曲目；完整原曲、打击谱生成与验证说明见 `docs/rhythm-extra-tracks.md`。原有曲目索引、OP 默认与成绩键不变。

### 投喂猫爪动效

`js/ui/paw-gift.js` 与 `styles/paw-gift.css` 提供纯展示的猫爪送心；卡册普通投喂保存成功后播放，导航、滚动、窗口变化或切入后台时清理。重复触发只保留最新一次，遵循系统减少动态效果设置，不写入存档或参与奖励结算。`previews/paw-gift.html` 可直接打开并免费重复预览，复用同一动效模块。

猫爪音效在 `js/audio/paw-gift.js` 合成软弹、飞行和送达铃音，通过调用方注入的音频输出与静音状态播放。游戏复用主音频通道及 iOS 合成音频节点追踪，独立预览有音效开关；取消动效同时停止已排程音频，减少动态效果模式仅播放短确认音。

宝石与飞鸿 2026-10 的三种人物图片使用 `assets/characters/`，原件保存在其 `source/`。`cards.js` 的可选 `imageVersion` 给派生缩略图附加缓存版本；完整图和剧情裁切使用新文件名。个人线资源注册保留 `assets.js` 显式配置的图片路径，然后才回退到默认命名，不改变回忆 ID 或存档。八合一重建工具为 `scripts/crop-baoshi-feihong-art.py`，原有四类裁切入口也会在末尾应用该版本。

### 摩天轮 HE 大屏演出

`js/data/story-cinematics.js` 显式绑定宝石×飞鸿 `cp_HE` 拥抱配图与结局；`js/ui/story-cinematic.js` 和 `styles/story-cinematic.css` 负责完整构图、单次视频、光点、文字入场及手动关闭／重看。演出视频为用户提供的 960×720、约 10 秒 MP4，已在文件层去掉原音轨，同时设置 muted 和 playsinline；单次播放结束后展示原拥抱插图，保持到手动关闭，重看按钮可重新播放。后台暂停，返回时未播完则继续、已播完则保持图片，关闭释放资源。配乐仍由独立的 StoryBgm 播放。使用现有模态框，保留 Escape、焦点约束、减少动态效果和后台暂停。`js/chronicle/personal.js` 负责触发及权限校验，`StoryBgm` 在该页及后续 HE 页使用用户提供的完整配乐，复用唯一播放器；退出路线恢复相应背景音乐。

演出在 `cp_HE` 最后一页确认完成、进入 `complete` 结局页时自动弹出；拥抱阅读页和结局页提供手动重看。每次进入该 HE 结局页都自动弹出，包括同一周目切回和刷新；运行时标记只防止关闭后的普通重绘再次弹出，导航时清除。保留原有 `previewed` 记录供兼容，但该 HE 不以它限制展示；其他结局沿用每周目一次。不新增存档字段或版本，保留结局、收藏与奖励。上一版本结构夹具来自提交 `740338e`，见 `tests/fixtures/personal-v1-cp-he.json`，验证原记录保持兼容。

高清图使用新人物立绘，资源索引和提示词见 `docs/imagegen/personal/cp-he-cinematic.json` / `.md`。独立预览 `previews/cp-he-cinematic.html` 复用视觉模块，不读取或修改游戏存档。

读档同时保留由特殊剧情提前解锁的 CP／羊村线激活状态；常规个人线仍需第六章前置。否则原有通用的“第六章未完成则退出个人线”判断会使早期解锁线路在刷新时意外返回正传。
