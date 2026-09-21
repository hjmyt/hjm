# 浏览器回归检查

使用 Node.js 与 Playwright Chromium。可通过 `PLAYWRIGHT_CHROMIUM_EXECUTABLE` 指定本机 Chromium 可执行文件。

- `node tests/chapter-unlocks.cjs`：对话解锁、招募、旧存档、移动端。
- `node tests/chapter-three.cjs`：第二章补充、第三章分支与结局、章节切换、导入、柒柒技能。
- `node tests/source-cards.cjs`：新卡稀有度、小周成长、羁绊隐藏、柠檬结局、小塔救场、持久化、图片相对路径与加载。

测试使用独立浏览器上下文，不操作玩家现有浏览器存档。
