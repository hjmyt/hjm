# 冰冰 · 2026-10-02

人物原件：`assets/characters/source/bingbing-2026-10.png`，用户提供。人物描述截图保留为本目录 `description.jpg`。完整立绘保留原构图；横向卡面与方形头像按 `card-crops.json` 从原件裁切，完整保留发顶、花饰与下巴。卡牌为 SSR 六星，称号「全团女神」，大提琴／钢琴／小提琴，银色保时捷 911 与 STAT S000 为人物档案。

唯一形象基准：成年女性、精致柔和的脸型、侧分长黑发、白色花饰、垂坠水晶耳饰、白色挂脖无袖纱裙、腕表、琥珀色大提琴。阿喆、小塔、十元分别使用现有卡牌为参考，玩家保持个人线匿名第一视角。

使用内置 image_gen 生成四格剧情母图（2×2），完整提示词见 `story-prompt.txt`，母图位于 `assets/chronicle/personal/source/bingbing-202610.png`，裁切坐标及最终路径见 `art.json`。四个节点为 `azhe_03`（团建打趣）、`azhe_03b`（误会澄清）、`azhe_08`（异地视频与排练室的新琴）、`sy_r1b`（实名声援）。回忆 ID 保持不变，剧情、相册与下载共用同一资源。

重建：`python3 scripts/crop-bingbing-art.py`，再执行 `node scripts/build-card-thumbnails.cjs`。历史个人线重建入口也会执行本次重建。最后运行 `node scripts/version-assets.cjs` 更新资源版本。

卡牌只在实际展示提及冰冰的剧情页面时免费解锁；阿喆线首次为第三幕团建饭局，十元线实际提及时也可解锁。不能通过翻阅人物目录或音符购买提前获得。旧档根据已读／已完成页恢复，不按章数猜测。当前加密羁绊存档升级为 v4：v1～v3 仅允许补齐新加入的冰冰为 0，现有受保护角色值依旧严格校验。上一版本 `041701f` 实际浏览器结构夹具为 `tests/fixtures/pre-bingbing-v3.json`。

主动技「爆金币」：入队并准备后，下次完整且有手动命中的节奏演奏独立判定一次，概率严格为 35%。成功后本次展示得分翻倍，结算页显示金色音符特效；准确率、评级、基础最佳成绩、音符和成长仍按原始演奏结算。准备、取消与刷新复用现有技能字段；不新增消费货币或永久技能字段。减少动态效果时保留静态回执。

回归：`node tests/bingbing.cjs`、`node tests/economy.cjs`、`node tests/unified-bonds.cjs`、`node tests/architecture.cjs`、`node tests/personal-routes.cjs`。

## 琴弓修正 v2

原四格母图的 `azhe_08` 漏画冰冰琴弓。使用内置 image_gen 定点修正，补上完整弓杆、弓毛、弓根与右手握弓，平板下移以露出运弓路径。提示词见 `bow-fix-prompt.txt`，新原图在 `assets/chronicle/personal/source/azhe_08-bingbing-bow-v2.png`，游戏播放图为 `assets/chronicle/personal/azhe_08-bingbing-bow-v2.webp`。`scene-overrides.json` 保证重新裁切历史母图后仍应用修正版；原始母图保留。剧情与相册共用新路径，回忆 ID 不变。
