# 音符礼品卡

首页「来自乐团的礼物 → 兑换礼物」保留 MEOW2026 见面礼，并增加独立的礼品卡输入框。领取见面礼不会关闭礼品卡兑换资格。

## 本地签发

在项目目录执行（需要 Node.js 20 或更新版本，无第三方依赖）：

```sh
node scripts/gift-card.cjs issue --notes 100
node scripts/gift-card.cjs issue --notes 300 --days 30
```

命令输出一整行兑换码，复制给玩家即可。每次执行都会产生不同的礼品卡编号。数量范围为 1～1000000 整数；不指定 `--days` 时不过期。有效期按签发时间计算，最多 3650 天。

当前环境已经完成初始化：

- 私钥：`~/.local/share/hjm-gift-cards/issuer-private.pem`，位于网站外，创建权限为 0600。请单独妥善备份；不要发给玩家、上传仓库或放进静态站点。
- 网站公钥：`js/data/gift-keys.js`。部署更新时需要一起发布此文件及新功能代码。
- 初始化命令为 `node scripts/gift-card.cjs init`，重复执行复用私钥，不覆盖已有不匹配的公钥。新电脑应先恢复原私钥；遗失私钥无法继续用该密钥签发。
- 可用 `--key /绝对路径/私钥.pem --public /绝对路径/gift-keys.js` 指定路径。工具拒绝将私钥放进项目目录。

## 格式与校验

采用 ECDSA P-256 / SHA-256 数字签名：本地私钥签发、浏览器公钥验证。**金额无需保密，这是验签而非解密**。任何人可读取码中金额，但无法在不使签名失效的情况下修改金额或编号。

格式：`HJM1.<base64url JSON>.<base64url signature>`。签名覆盖前两段（包括前缀），使用 IEEE-P1363 的 64 字节 r‖s 格式。JSON 包含版本 `v`、用途 `aud`、公钥编号 `kid`、UUID `id`、音符 `notes`、签发时间 `iat` 和可空到期时间 `exp`（Unix 秒）。验签后才允许入账。

浏览器使用 [Web Crypto ECDSA](https://www.w3.org/TR/WebCryptoAPI/#ecdsa)，签发使用 [Node.js crypto.sign](https://nodejs.org/api/crypto.html#cryptosignalgorithm-data-key-callback)。需要支持 Web Crypto 的安全上下文，如 HTTPS、localhost 或兼容浏览器的本地 file 页面；不支持时会明确报错，绝不跳过验签。

## 存档与边界

兑换记录按卡编号保存在 `economy.giftCards`，金额与记录同一次保存。刷新、章节重开以及导出后再导入包含该记录的存档都不会重复入账。保存失败则撤销本次金额和记录，允许重试。页面内防连点；支持 Web Locks 的浏览器会串行处理同源兑换，其他标签页更改存档后要求刷新。

纯前端无法保证跨设备全局一次性，也不能阻止玩家清除存档、导入兑换前备份、修改系统时间或修改本地代码/余额。兑换码可被转发，不绑定玩家。若用于付费或严格限量发放，需要服务端校验和原子核销；本版没有这一能力。

以后轮换密钥时，应在公钥映射中保留旧 `kid` 并增加新 `kid`（撤销旧公钥会使其尚未兑换的卡失效）。不要静默替换现有公钥。
