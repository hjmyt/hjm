#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2), command = args.shift(), options = {};
try {
    while (args.length) {
        const flag = args.shift();
        if (!['--key', '--public', '--notes', '--days'].includes(flag) || !args.length || options[flag] !== undefined)
            throw Error('参数错误。使用 init 或 issue --notes 100 [--days 30] [--key 私钥路径] [--public 公钥配置路径]');
        options[flag] = args.shift();
    }
    const keyPath = path.resolve(options['--key'] || path.join(os.homedir(), '.local/share/hjm-gift-cards/issuer-private.pem'));
    const publicPath = path.resolve(options['--public'] || path.join(root, 'js/data/gift-keys.js'));
    if (keyPath === root || keyPath.startsWith(root + path.sep)) throw Error('私钥必须放在网站目录之外，避免随静态站点发布。');
    if (!['init', 'issue'].includes(command)) throw Error('用法：node scripts/gift-card.cjs init | issue --notes 100 [--days 30]');
    if (command === 'init' && !fs.existsSync(keyPath)) {
        const { privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
        fs.mkdirSync(path.dirname(keyPath), { recursive: true, mode: 0o700 });
        fs.writeFileSync(keyPath, privateKey.export({ type: 'pkcs8', format: 'pem' }), { flag: 'wx', mode: 0o600 });
    }
    const privateKey = crypto.createPrivateKey(fs.readFileSync(keyPath));
    if (privateKey.asymmetricKeyType !== 'ec' || privateKey.asymmetricKeyDetails.namedCurve !== 'prime256v1') throw Error('需要 P-256 私钥。');
    const publicKey = crypto.createPublicKey(privateKey);
    const kid = crypto.createHash('sha256').update(publicKey.export({ type: 'spki', format: 'der' })).digest('hex').slice(0, 16);
    if (command === 'init') {
        if (fs.existsSync(publicPath)) {
            if (!fs.readFileSync(publicPath, 'utf8').includes(JSON.stringify(kid))) throw Error('公钥配置已存在且不匹配；请保留旧公钥并按文档增加新密钥，不能直接覆盖。');
        } else {
            fs.mkdirSync(path.dirname(publicPath), { recursive: true });
            fs.writeFileSync(publicPath, "'use strict';\n\n// Public verification keys only. Never put a private key in the website.\nconst GIFT_PUBLIC_KEYS = Object.freeze(" + JSON.stringify({ [kid]: publicKey.export({ format: 'jwk' }) }, null, 2) + ');\n', { flag: 'wx' });
        }
        console.log(`签发环境已就绪。\n私钥（勿发布）：${keyPath}\n网站公钥：${publicPath}\n密钥编号：${kid}`);
    } else {
        const notes = Number(options['--notes']), days = options['--days'] === undefined ? null : Number(options['--days']);
        if (!Number.isSafeInteger(notes) || notes < 1 || notes > 1000000) throw Error('音符数量必须是 1～1000000 的整数。');
        if (days !== null && (!Number.isInteger(days) || days < 1 || days > 3650)) throw Error('有效天数必须是 1～3650 的整数。');
        if (!fs.readFileSync(publicPath, 'utf8').includes(JSON.stringify(kid))) throw Error('当前私钥不在网站公钥配置中，请先初始化并发布对应公钥。');
        const iat = Math.floor(Date.now() / 1000);
        const payload = { v: 1, aud: 'love-hakimi', kid, id: crypto.randomUUID(), notes, iat, exp: days === null ? null : iat + days * 86400 };
        const message = 'HJM1.' + Buffer.from(JSON.stringify(payload)).toString('base64url');
        const signature = crypto.sign('sha256', Buffer.from(message), { key: privateKey, dsaEncoding: 'ieee-p1363' });
        console.log(message + '.' + signature.toString('base64url'));
    }
} catch (error) {
    console.error(error.message); process.exitCode = 1;
}
