# 恋与哈基米

无需构建的静态乐团养成游戏，包含正传剧情、角色卡册、羁绊成长、团宠与节奏演奏。

## 运行

直接用浏览器打开 `index.html`。也可以在项目目录启动静态服务：

```sh
python3 -m http.server 8000
```

随后打开 `http://localhost:8000`。进度保存在当前浏览器来源的 localStorage；更换访问地址时，可在游戏设置中导出、导入存档。

分发时请保留 `index.html`、`js/`、`styles/` 和 `assets/` 的目录关系。

## 开发

- [架构与修改入口](docs/architecture.md)
- [项目全局规则](AGENTS.md)
- [音符经济](docs/economy.md)
- [统一羁绊](docs/unified-bonds.md)
- [每周剧情与第一章插图](docs/weekly-stories.md)
- [浏览器回归](tests/README.md)
