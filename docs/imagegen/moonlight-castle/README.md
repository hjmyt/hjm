# 月光古堡 Image2 美术记录

当前正式版使用 [individual-v3/README.md](individual-v3/README.md) 记录的九张场景原图，以及 [outcomes-v1/README.md](outcomes-v1/README.md) 记录的八张过场与结局原图，均逐张独立高清生成。角色卡用于身份，古堡剧本用于衣服与道具。下方内容为首版八合一历史记录，仅供来源追溯，不是现行服装或取图规则。

生成方式：内置 ImageGen（Image2），八合一母图。两张母图均保留在 `assets/moonlight-castle/source/`，角色参考只读取现有正式角色卡，未改动卡册素材。

- `environment-prompt.txt`：八个空场景，建立可调查物品与房间布局。
- `cast-prompt.txt`：七个人物场景与一张日出结局环境。逐格含 Before、VisibleCast、Beat、After 和只允许当前人物入镜的限制。
- `character-references.json`：对应卡册完整立绘、头像来源。
- `character-reference-board.png`：由正式立绘制作的带英文 ID 的参考联系表，仅用作生成身份参考。
- `plan.json`：稳定画面 ID → 母图路径／格号／实际裁切矩形／visibleCast／正式 WebP 的映射。
- `contact-sheet.png`：带画面 ID、母图格号、预期人物的连续 QA 联系表。

## 场景人物映射

| 画面 ID | 实际在场人物 | 对话入口 |
| --- | --- | --- |
| hall-conversation | 叶思阳、TIM | 大厅执事／骑士 |
| dining-isabella | 冰冰 | 餐厅白裙女子 |
| dining-witnesses | 宝石、飞鸿 | 餐厅见证者 |
| study-conversation | 笛杰、柒柒 | 书房两人 |
| music-cecil | Jerry | 音乐室调律师 |
| bedroom-conversation | 十元 | 主卧 |
| cellar-selene | 垃垃 | 地下室女巫 |
| dawn-requiem | 无人物，蓝金残音象征解脱 | 三个风琴结局／日出塔楼 |

艾德里安与菲利克斯在现有卡册没有正式立绘；按项目规则使用无人物塔楼和明确的月亮符号，不使用其他角色代替。人物只在实际所在房间的专用画面中出现；日出后的大厅多人交谈不从相邻页自动拼成群像。

## QA 与裁切

已逐格检查：叶思阳的卷短发、黑框眼镜、全黑衬衫与长外套；TIM 的白衬衫领带与黑西装；冰冰的女性身份、花饰与白色挂脖裙；宝石黑衣无眼镜，飞鸿白外衫／眼镜／银链与黑手套；Jerry 黑短袖／矩形眼镜／牛仔裤；笛杰竹笛归本人；柒柒卡片归本人；垃垃水晶球归本人。没有把对话里提及的其他人加入画面。

母图格序与语义一致。人物母图的行分隔线实际位于 y=363–364、721–722、1087，未机械用四等分导致串入下一格；裁切脚本记录独立起止行，并去除分隔线。每张正式图为 960×720 WebP，完整保留头部与当前场景构图；手机使用完整图，不裁掉人物头部。

重建：`node scripts/build-moonlight-castle-art.cjs`。脚本只做用户授权的八合一裁切、缩放和 WebP 编码，不进行 AI 修图替代。
