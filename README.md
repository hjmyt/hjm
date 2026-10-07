# 恋与哈基米

无需构建的静态乐团养成游戏，包含正传剧情、角色卡册、羁绊成长、团宠与节奏演奏。

## 运行

直接用浏览器打开 `index.html`。也可以在项目目录启动静态服务：

```sh
python3 -m http.server 8000
```

随后打开 `http://localhost:8000`。进度保存在当前浏览器来源的 localStorage；更换访问地址时，可在游戏设置中导出、导入存档。

分发时请保留 `index.html`、`js/`、`styles/` 和 `assets/` 的目录关系。

## 发布与缓存

每次修改 JS/CSS 后，发布前运行：

```sh
node scripts/version-assets.cjs
node scripts/version-assets.cjs --check
```

脚本为首页所有本地 JS/CSS 引用更新 `?v=内容哈希`，文件改变才更换版本号。将更新后的 `index.html` 和资源一起发布；仍支持直接打开 HTML，无需运行时构建。

部署服务器或 CDN 应为 `/` 和 `/index.html` 设置响应头 `Cache-Control: no-cache`，使首页每次访问重新校验；JS/CSS 可以继续缓存，但 CDN 缓存键必须包含 `v` 查询参数。若首页已有长效缓存，首次切换时需清理 CDN 的首页缓存；手机可临时用 `/?v=20260926` 这样的新地址打开。仅给 JS/CSS 加参数无法更新仍被缓存的旧首页。不要通过清除网站数据解决缓存，以免删除本地游戏存档。

## 开发

- [架构与修改入口](docs/architecture.md)
- [项目全局规则](AGENTS.md)
- [音符经济](docs/economy.md)
- [统一羁绊](docs/unified-bonds.md)
- [连贯剧情、每周训练与插图](docs/weekly-stories.md)
- [第七章个人线](docs/personal-routes.md)
- [浏览器回归](tests/README.md)
