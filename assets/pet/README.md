# 三猫音乐小窝 · 2026-10-15

用户确认橘猫、白猫和灰猫是三只分别养成的小猫，各自保存名字、羁绊、饱腹、心情、精力、摸摸次数和陪伴时间。共用全局音符钱包，每只猫有独立的每日投喂五次额度及每日免费陪伴 +1 羁绊额度。

橘猫默认叫「哈基米」，佩戴奶白蝴蝶结；白猫默认叫「棉花糖」，趴着翘起蓬松尾巴；灰猫默认叫「小主唱」，佩戴耳机和蓝领带、手持麦克风。参考图只做完整缩放和格式压缩，不裁切。

## 最新素材与重建

| 用户素材 | 保留原件 | 游戏资源 |
| --- | --- | --- |
| 图 1 · 白猫 | `source/hakimi-rest-trio-202610.png` | `hakimi-rest-trio-202610.webp` |
| 图 2 · 灰猫主唱 | `source/hakimi-music-trio-202610.png` | `hakimi-music-trio-202610.webp` |
| 图 3 · 橘猫 | `source/hakimi-bow-trio-202610.png` | `hakimi-bow-trio-202610.webp` |
| 视频 (3) · 三猫同台 | `source/hakimi-companion-trio-202610.mp4` | `hakimi-companion-trio-202610.mp4` |
| 新视频第零帧 | 视频原件 | `hakimi-companion-poster-trio-202610.webp` |

运行 `python3 scripts/build-pet-assets.py`（Pillow + ffmpeg）重建最新版。视频保留完整约 10.04 秒与 16:9 构图，交付为 960×540 H.264 faststart MP4，约 2 MiB；静音交付避免循环原声与背景配乐叠加，source 中保留原音轨。旧素材仍保留，不覆盖历史原件。新文件名避开旧缓存。

## 展示与玩法

- `js/data/pet.js` 是三只猫的唯一目录，绑定稳定角色 ID、羁绊 ID、图片与专属回忆键。图片入口在 `js/data/assets.js`。
- 小屋上方的三猫选择器同时显示名字和羁绊。选择成功后保存当前猫；首页小猫、详情、状态、名字输入和拍照都读取当前选中的猫。
- 静态照片按 contain 保留耳朵、尾巴、爪爪与麦克风。触摸照片只对选中的猫执行照顾。
- 新视频放在猫咪小屋最上方、猫咪选择与养成区域之前的独立「三只猫的小小舞台」展示区；没有照顾按钮，不增加羁绊、货币、收藏或次数。进入小屋时按需播放；手动暂停、切页、后台和减少动态效果时停止。失败回退海报并可重试。
- 摸摸与逗猫共用各猫每日 +1 额度；喂食为 5 音符 / +1 羁绊，每只猫每天最多五次；逗猫 −10 精力，休息免费 +25 精力。十秒休息冷却各猫独立。保存失败恢复全部本次扣款、状态、成长、领取记录或改名／选择。

## 显式存档升级与保护

`js/core/pet-house.js` 在 bonds / state 之前加载，管理新档、清洗、选择和命名。新增 `petHouse.version: 1`，保存白猫和灰猫的独立记录及当前选择。橘猫继续使用原有 `cat` / `catName` / `bond:cat` / `catGift:cat` / `companion:cat`，不复制、合并或清零已有成长。

新增独立 `petBondVault.v: 1`，用 `bond:catwhite` 和 `bond:catsinger` 域分别加密羁绊；持久存档删除新猫的明文 aff。既有钱包、角色 `bondVault.v: 16` 和等级校验结构保持。上一版真实 v16 结构存档缺少新字段时，仅初始化两只新猫为 0 羁绊；重复迁移幂等，不重发奖励。新猫缺少非受保护元数据时只初始化缺少部分，并从受保护值恢复其羁绊。

已有 `purr` / `photo` / `trust` 收藏仍归橘猫，当前图片换成橘猫参考图。白猫与灰猫分别使用 `pet_white_*` / `pet_singer_*` 三个回忆键，满足实际摸摸、拍照与 60 羁绊条件后才收藏，不继承另一只猫的收藏。

损坏的新猫羁绊域、当前格式缺失受保护 vault 或无效版本都会进入现有存档保护：优先恢复可读备份，保留故障原文，无可读备份时禁止启动保存覆盖。导入和主动重置沿用既有明确确认流程，并清理三猫的运行时对白和休息冷却。

## 验证

- `tests/pet-house.cjs`：25 项三猫独立养成检查、真实上一版结构迁移／幂等、原奖励键保留、名字／状态／额度／收藏、受保护存档、刷新、缺少新字段、事务回滚、备份恢复、损坏启动、实际导入与主动重置。夹具为 `tests/fixtures/pet-single-v16.json`，由改动前运行时的 `persistedState()` 生成。
- `tests/pet-room.cjs`：完整静音视频 file/HTTP、独立选择器、播放／暂停／后台／切页／失败重试、减少动态效果、喂食和休息边界、相册、320 / 390 / 760 / 1440px 布局。
- 相关回归：architecture、economy、unified-bonds、album-art、audio-startup。

测试使用独立上下文，不操作玩家浏览器存档。JS/CSS 更新后运行 `node scripts/version-assets.cjs` 与 `node scripts/version-assets.cjs --check`。
