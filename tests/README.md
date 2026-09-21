# 浏览器回归检查

使用 Node.js 与 Playwright Chromium。可通过 `PLAYWRIGHT_CHROMIUM_EXECUTABLE` 指定本机 Chromium 可执行文件。

- `node tests/chapter-unlocks.cjs`：对话解锁、招募、旧存档、移动端。
- `node tests/chapter-three.cjs`：第二章补充、第三章分支与结局、章节切换、导入、柒柒技能。
- `node tests/chapter-four.cjs`：第四章主线与回应、人物按剧情解锁、周常、剧场门槛与结局、继承/重开、原版存档兼容、隐藏预告与移动端。
- `node tests/source-cards.cjs`：新卡稀有度、小周成长、羁绊隐藏、柠檬结局、小塔救场、持久化、图片相对路径与加载。
- `node tests/zhu-bar.cjs`：朱老师登场、初始 100 音符、酒单扣费与羁绊、余额不足、章节记录、山丘停业与弹窗、隐藏调酒、祖卡笛救场、存档刷新与移动端。

测试使用独立浏览器上下文，不操作玩家现有浏览器存档。
