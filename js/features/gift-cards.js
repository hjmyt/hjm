'use strict';

const GiftCards = (() => {
    let busy = false;
    let externalSaveChanged = false;
    window.addEventListener('storage', event => { if (event.key === KEY || event.key === null) externalSaveChanged = true; });
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    function decode(value) {
        if (!/^[A-Za-z0-9_-]+$/.test(value)) throw Error('兑换码格式不正确，请粘贴完整代码。');
        return Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    }
    async function verify(code) {
        if (!globalThis.crypto?.subtle) throw Error('当前环境不支持兑换校验，请通过 HTTPS 或本机浏览器打开游戏。');
        if (code.length > 2048) throw Error('兑换码过长，请检查复制的内容。');
        const parts = code.split('.');
        if (parts.length !== 3 || parts[0] !== 'HJM1') throw Error('兑换码格式不正确，请粘贴完整代码。');
        let payload, signature;
        try { payload = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(decode(parts[1]))); signature = decode(parts[2]); }
        catch (_) { throw Error('兑换码格式不正确，请粘贴完整代码。'); }
        if (!payload || payload.v !== 1 || payload.aud !== 'love-hakimi' || !uuid.test(payload.id) ||
            !Number.isSafeInteger(payload.notes) || payload.notes < 1 || payload.notes > 1000000 ||
            !Number.isSafeInteger(payload.iat) || payload.iat <= 0 ||
            !(payload.exp === null || Number.isSafeInteger(payload.exp) && payload.exp > payload.iat) ||
            typeof payload.kid !== 'string' || !Object.hasOwn(GIFT_PUBLIC_KEYS, payload.kid) || signature.length !== 64)
            throw Error('这张礼品卡无效，请核对兑换码或联系赠送者。');
        const key = await crypto.subtle.importKey('jwk', GIFT_PUBLIC_KEYS[payload.kid], { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
        const valid = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, signature, new TextEncoder().encode(parts[0] + '.' + parts[1]));
        if (!valid) throw Error('礼品卡校验未通过，请勿修改兑换码。');
        const now = Math.floor(Date.now() / 1000);
        if (payload.iat > now + 300) throw Error('礼品卡尚未生效，请检查设备时间。');
        if (payload.exp !== null && payload.exp <= now) throw Error('这张礼品卡已过期。');
        return payload;
    }
    async function redeem(raw) {
        if (busy) throw Error('正在兑换，请稍候。');
        busy = true;
        const original = state;
        try {
            const saved = localStorage.getItem(KEY);
            const card = await verify(String(raw).replace(/\s/g, ''));
            const apply = () => {
                // Recheck after asynchronous verification/lock acquisition: never credit a replaced save.
                if (externalSaveChanged || state !== original || localStorage.getItem(KEY) !== saved) throw Error('存档已变化，请刷新后重新兑换。');
                const claims = economy().giftCards;
                if (Object.hasOwn(claims, card.id)) throw Error('这张礼品卡已经兑换过了。');
                if (!Number.isSafeInteger(state.coins + card.notes) || state.coins + card.notes > 99999999) throw Error('音符余额将超过上限，请先使用部分音符。');
                const before = state.coins;
                claims[card.id] = { notes: card.notes, redeemedAt: Date.now(), kid: card.kid };
                state.coins += card.notes;
                save();
                if (!storageOK) { state.coins = before; delete claims[card.id]; throw Error('兑换未保存，音符尚未入账。请开启浏览器存储后重试。'); }
                return card.notes;
            };
            return navigator.locks ? await navigator.locks.request('hjm-gift-card-redeem', apply) : apply();
        } finally { busy = false; }
    }
    function formHTML() {
        return `<section class="gift-card-redeem"><h3>兑换音符礼品卡</h3><p>收到了一份心意？粘贴礼品卡代码，把音符收进你的账户。</p><label for="giftCardCode">礼品卡代码</label><textarea id="giftCardCode" class="text-input" rows="4" maxlength="2048" placeholder="HJM1.…" spellcheck="false" autocapitalize="off" autocomplete="off"></textarea><div class="gift-card-bottom"><span id="giftCardStatus" role="status" aria-live="polite">每张礼品卡在当前存档中可兑换一次。</span><button type="button" class="btn primary" id="redeemGiftCard">兑换音符</button></div></section>`;
    }
    function mount() {
        const button = $('redeemGiftCard'), input = $('giftCardCode'), status = $('giftCardStatus');
        button.onclick = async () => {
            if (!input.value.trim()) { status.textContent = '请先粘贴礼品卡代码。'; input.focus(); return; }
            button.disabled = true; status.textContent = '正在验证礼品卡……';
            try {
                const notes = await redeem(input.value);
                status.textContent = `兑换成功 · ${notes} 音符已到账`; input.value = ''; renderGlobal(); toast(`礼品卡已收好 · 获得 ${notes} 音符`, true);
            } catch (error) { status.textContent = error.message || '兑换失败，请稍后重试。'; }
            finally { button.disabled = false; }
        };
    }
    return { redeem, formHTML, mount };
})();
