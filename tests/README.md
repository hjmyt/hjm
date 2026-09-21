# 浏览器回归检查

使用 Node.js 与 Playwright Chromium。可通过 `PLAYWRIGHT_CHROMIUM_EXECUTABLE` 指定本机 Chromium 可执行文件。

- `node tests/chapter-unlocks.cjs`：对话解锁、招募、旧存档、移动端。
- `node tests/chapter-three.cjs`：第二章补充、第三章分支与结局、章节切换、导入、柒柒技能。
- `node tests/chapter-four.cjs`：第四章主线与回应、人物按剧情解锁、周常、剧场门槛与结局、继承/重开、原版存档兼容、隐藏预告与移动端。
- `node tests/source-cards.cjs`：新卡稀有度、小周成长、羁绊隐藏、柠檬结局、小塔救场、持久化、图片相对路径与加载。
- `node tests/zhu-bar.cjs`：朱老师登场、初始 100 音符、酒单扣费与羁绊、余额不足、章节记录、山丘停业与弹窗、隐藏调酒、祖卡笛救场、存档刷新与移动端。

- `node tests/chapter-order.cjs`：依次解锁、越级入口防护、第一章身份继承、重玩保持解锁、旧跳章存档保留、刷新及移动端。

章节内容测试使用已完成前章的存档夹具；首次玩家的真实入口限制由 chapter-order 单独覆盖。

- `node tests/fourth-transition.cjs`：旧第四章基础档修复、全局羁绊、停业后免费请客、未停业直接进入剧场、刷新不重复结算、迁移幂等。
- `node tests/global-bonds.cjs`：全局最高值合并、跨章节共享、聊天累计、去除扣减与归零、重开/导入/刷新保留。

测试使用独立浏览器上下文，不操作玩家现有浏览器存档。

- `node tests/dialogue-speakers.cjs`：四章 103 个对白节点、动态胜负与演出门槛、角色聊天、多人分段、头像映射、旧手记归属、刷新和手机布局。

- `node tests/story-bgm.cjs`：本地 HTTP 下七首真实音频播放与信号、对白连续播放、跨章切曲、独立／总静音、音量保存、后台与节奏游戏暂停、播放限制／加载失败重试、手机布局。
- `node tests/audio-startup.cjs`：全新页面首次点猫／直接进入节奏舞台，不依赖故事 BGM；媒体播放通道设置顺序、真实合成音信号、音频中断／重试、静音、后台和旧 iOS 兼容音频的释放。使用 Chromium 模拟 iOS 状态，不能替代 iPhone 真机验证。
