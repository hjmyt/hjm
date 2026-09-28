'use strict';

const KEY = 'love_hakimi_cards_save_v62';
const V61_KEY = 'love_hakimi_cards_save_v61';
const V6_KEY = 'love_hakimi_cards_save_v6';
const V53_KEY = 'love_hakimi_cards_save_v53';
const V5_KEY = 'love_hakimi_cards_save_v5';
const V4_KEY = 'love_hakimi_cards_save_v4';
const PREVIOUS_KEY = 'love_hakimi_cards_save_v2';
const LEGACY_KEY = 'love_hakimi_save_v1';
const BACKUP_KEY = 'love_hakimi_cards_save_v62_backup';
const RECOVERY_KEY = 'love_hakimi_cards_save_v62_recovery';

// The wallet is deliberately only a lightweight anti-tamper layer. Its fixed
// key is split so the balance is not exposed by a plain-text search in either
// localStorage or an exported save. A determined player can still recover a
// client-side key, so this must never be treated as server-side authority.
const WALLET_KEY_PARTS = Object.freeze(['7fQ2', 'm9Lx', 'Hak1', 'v6!C']);
function walletKey() {
    const source = [WALLET_KEY_PARTS[2], WALLET_KEY_PARTS[0], WALLET_KEY_PARTS[3], WALLET_KEY_PARTS[1]].join('');
    const words = new Uint32Array(4);
    for (let lane = 0; lane < 4; lane++) {
        let value = (0x811c9dc5 ^ (lane * 0x9e3779b9)) >>> 0;
        for (let i = lane; i < source.length; i += 4) {
            value ^= source.charCodeAt(i);
            value = Math.imul(value, 0x01000193) >>> 0;
        }
        words[lane] = value;
    }
    return words;
}
function walletMarker(coins, nonce, key) {
    let value = (coins ^ nonce ^ key[0]) >>> 0;
    for (let i = 1; i < 4; i++) {
        value ^= key[i];
        value = Math.imul(value ^ (value >>> 16), 0x45d9f3b) >>> 0;
    }
    return (value ^ (value >>> 16)) >>> 0;
}
function walletCrypt(left, right, decrypt = false) {
    const key = walletKey(), delta = 0x9e3779b9;
    let a = left >>> 0, b = right >>> 0;
    if (decrypt) {
        let sum = Math.imul(delta, 32) >>> 0;
        for (let i = 0; i < 32; i++) {
            b = (b - ((((a << 4) ^ (a >>> 5)) + a ^ sum) + key[(sum >>> 11) & 3])) >>> 0;
            sum = (sum - delta) >>> 0;
            a = (a - ((((b << 4) ^ (b >>> 5)) + b ^ sum) + key[sum & 3])) >>> 0;
        }
    } else {
        let sum = 0;
        for (let i = 0; i < 32; i++) {
            a = (a + ((((b << 4) ^ (b >>> 5)) + b ^ sum) + key[sum & 3])) >>> 0;
            sum = (sum + delta) >>> 0;
            b = (b + ((((a << 4) ^ (a >>> 5)) + a ^ sum) + key[(sum >>> 11) & 3])) >>> 0;
        }
    }
    return [a, b];
}
function sealCoins(coins) {
    const nonceWords = new Uint32Array(1);
    if (globalThis.crypto?.getRandomValues) crypto.getRandomValues(nonceWords);
    else nonceWords[0] = (Math.random() * 0x100000000) >>> 0;
    const nonce = nonceWords[0], encrypted = walletCrypt(coins, walletMarker(coins, nonce, walletKey()));
    return { v: 1, n: nonce.toString(36), c: encrypted.map(value => value.toString(36).padStart(7, '0')).join('.') };
}
function protectedScope(scope) {
    let value = 0x811c9dc5;
    for (const char of scope) {
        value ^= char.charCodeAt(0);
        value = Math.imul(value, 0x01000193) >>> 0;
    }
    return value;
}
function sealProtectedNumber(value, scope) {
    const nonceWords = new Uint32Array(1);
    if (globalThis.crypto?.getRandomValues) crypto.getRandomValues(nonceWords);
    else nonceWords[0] = (Math.random() * 0x100000000) >>> 0;
    const nonce = nonceWords[0], markerNonce = (nonce ^ protectedScope(scope)) >>> 0;
    const encrypted = walletCrypt(value, walletMarker(value, markerNonce, walletKey()));
    return { n: nonce.toString(36), c: encrypted.map(word => word.toString(36).padStart(7, '0')).join('.') };
}
function openProtectedNumber(token, scope, max = 99999) {
    if (!token || !/^[0-9a-z]{1,7}$/.test(token.n) || !/^[0-9a-z]{7}\.[0-9a-z]{7}$/.test(token.c))
        throw new Error('受保护成长数据校验失败');
    const nonce = Number.parseInt(token.n, 36), encrypted = token.c.split('.').map(value => Number.parseInt(value, 36));
    if (!Number.isSafeInteger(nonce) || nonce < 0 || nonce > 0xffffffff || encrypted.some(value => !Number.isSafeInteger(value) || value < 0 || value > 0xffffffff))
        throw new Error('受保护成长数据校验失败');
    const [value, marker] = walletCrypt(encrypted[0], encrypted[1], true), markerNonce = (nonce ^ protectedScope(scope)) >>> 0;
    if (value > max || marker !== walletMarker(value, markerNonce, walletKey()))
        throw new Error('受保护成长数据校验失败');
    return value;
}
function sealBonds(source) {
    const values = { cat: sealProtectedNumber(source.cat.aff, 'bond:cat') };
    for (const card of CARD_DEFS)
        values[card.id] = sealProtectedNumber(source.affinity[card.id] || 0, 'bond:' + card.id);
    return { v: 2, values };
}
function openBonds(vault) {
    if (!vault || ![1, 2].includes(vault.v) || !vault.values || typeof vault.values !== 'object')
        throw new Error('羁绊数据校验失败');
    const values = { cat: openProtectedNumber(vault.values.cat, 'bond:cat') };
    for (const card of CARD_DEFS) {
        // Bond vault v1 shipped before Xiaojie and REK. Their missing tokens are
        // valid only in v1; v2 requires the complete roster so deleting an
        // existing protected value still fails validation.
        const legacyAddition = vault.v === 1 && ['xiaojie', 'rek'].includes(card.id);
        values[card.id] = legacyAddition && vault.values[card.id] === undefined
            ? 0
            : openProtectedNumber(vault.values[card.id], 'bond:' + card.id);
    }
    return values;
}
function levelClaimsDigest(claims) {
    let value = 0x811c9dc5;
    for (const char of [...claims].sort().join('\u001f')) {
        value ^= char.charCodeAt(0);
        value = Math.imul(value, 0x01000193) >>> 0;
    }
    return value;
}
function sealLevels(source) {
    const p = syncGlobalLevels(source);
    const claimed = Object.keys(p.claimed).filter(id => p.claimed[id] && LEVEL_MILESTONE_SET.has(id)).sort();
    return { v: 3, orchestra: sealProtectedNumber(p.orchestraLevel, 'level:orchestra'), band: sealProtectedNumber(p.bandLevel, 'level:band'), claimed, claimGuard: sealProtectedNumber(levelClaimsDigest(claimed), 'level:claims') };
}
function openLevels(vault) {
    if (!vault || ![1, 2, 3].includes(vault.v))
        throw new Error('等级数据校验失败');
    const claimed = vault.v >= 3 && Array.isArray(vault.claimed) ? vault.claimed : [];
    if (claimed.some(id => typeof id !== 'string' || !LEVEL_MILESTONE_SET.has(id)) || new Set(claimed).size !== claimed.length || vault.v >= 3 && openProtectedNumber(vault.claimGuard, 'level:claims', 0xffffffff) !== levelClaimsDigest(claimed))
        throw new Error('等级数据校验失败');
    return { version: vault.v, orchestraLevel: openProtectedNumber(vault.orchestra, 'level:orchestra'), bandLevel: openProtectedNumber(vault.band, 'level:band'), claimed: Object.fromEntries(claimed.map(id => [id, true])) };
}
function openWallet(wallet) {
    if (!wallet || wallet.v !== 1 || !/^[0-9a-z]{1,7}$/.test(wallet.n) || !/^[0-9a-z]{7}\.[0-9a-z]{7}$/.test(wallet.c))
        throw new Error('音符数据校验失败');
    const nonce = Number.parseInt(wallet.n, 36), encrypted = wallet.c.split('.').map(value => Number.parseInt(value, 36));
    if (!Number.isSafeInteger(nonce) || nonce < 0 || nonce > 0xffffffff || encrypted.some(value => !Number.isSafeInteger(value) || value < 0 || value > 0xffffffff))
        throw new Error('音符数据校验失败');
    const [coins, marker] = walletCrypt(encrypted[0], encrypted[1], true);
    if (coins > 99999999 || marker !== walletMarker(coins, nonce, walletKey()))
        throw new Error('音符数据校验失败');
    return coins;
}
function persistedState() {
    syncUnifiedBonds(state);
    syncGlobalLevels(state);
    const snapshot = JSON.parse(JSON.stringify(state));
    snapshot.wallet = sealCoins(state.coins);
    snapshot.bondVault = sealBonds(state);
    snapshot.levelVault = sealLevels(state);
    delete snapshot.coins;
    delete snapshot.affinity;
    delete snapshot.progression;
    delete snapshot.cat.aff;
    delete snapshot.chronicle.bonds;
    for (const run of allChronicleRuns(snapshot.chronicle)) {
        delete run.aff;
        delete run.level;
    }
    return snapshot;
}
function freshState() { const d = { version: 1, economy: freshEconomy(), bondProgress: freshBondProgress(), progression: freshProgression(), created: Date.now(), nickname: '乐团新人', catName: '哈基米', coins: ECONOMY_RULES.start, cat: { aff: 0, hunger: 76, mood: 84, energy: 72, pets: 0 }, completed: [], memories: ['first'], affinity: Object.fromEntries(CARD_DEFS.map(c => [c.id, 0])), best: {}, storyProgress: {}, daily: { date: dateKey(), pet: false, story: false, rhythm: false, claimed: false }, gift: false, sound: true, cards: freshCards(), fusion: freshFusion(), chronicle: Chronicle.fresh() }; syncUnifiedBonds(d); syncGlobalLevels(d); return d; }
function cleanState(obj) {
    if (!obj || typeof obj !== 'object' || obj.version !== 1)
        throw new Error('存档格式不正确');
    const d = freshState(), number = (x, def, min = 0, max = 99999999) => Number.isFinite(Number(x)) ? clamp(Math.round(Number(x)), min, max) : def;
    d.created = number(obj.created, d.created, 946684800000, Date.now());
    d.nickname = typeof obj.nickname === 'string' && obj.nickname.trim() ? obj.nickname.trim().slice(0, 12) : d.nickname;
    d.catName = typeof obj.catName === 'string' && obj.catName.trim() ? obj.catName.trim().slice(0, 10) : d.catName;
    d.coins = obj.wallet === undefined ? number(obj.coins, d.coins) : openWallet(obj.wallet);
    d.economy = cleanEconomy(obj.economy);
    d.bondProgress = cleanBondProgress(obj.bondProgress);
    for (const k of ['aff', 'hunger', 'mood', 'energy'])
        d.cat[k] = number(obj.cat?.[k], d.cat[k], 0, 100);
    d.cat.pets = number(obj.cat?.pets, 0);
    d.completed = Array.isArray(obj.completed) ? [...new Set(obj.completed.filter(x => CHARACTERS.some(c => c.id === x)))] : [];
    d.memories = Array.isArray(obj.memories) ? [...new Set(['first', ...obj.memories.filter(x => MEMORIES.some(m => m.id === x))])] : ['first'];
    for (const c of CARD_DEFS)
        d.affinity[c.id] = obj.bondVault ? 0 : number(obj.affinity?.[c.id], 0, 0, 99999);
    const bestKeys = new Set(TRACKS.flatMap((track, index) => [track.id || index, track.scoreId, ...(track.legacyScoreIds || [])].filter(id => id !== undefined).flatMap(id => ['gentle', 'normal'].map(mode => `${id}_${mode}`))));
    if (obj.best && typeof obj.best === 'object')
        for (const [k, v] of Object.entries(obj.best)) {
            if (bestKeys.has(k) && v && typeof v === 'object')
                d.best[k] = { score: number(v.score, 0), accuracy: number(v.accuracy, 0, 0, 100), combo: number(v.combo, 0, 0, 99999), rank: ['S', 'A', 'B', 'C', 'D'].includes(v.rank) ? v.rank : 'D' };
        }
    if (obj.storyProgress && typeof obj.storyProgress === 'object')
        for (const c of CHARACTERS) {
            const v = obj.storyProgress[c.id];
            if (v && typeof v === 'object')
                d.storyProgress[c.id] = { index: number(v.index, 0, 0, 6), choice: v.choice === 0 ? 0 : v.choice === 1 ? 1 : null };
        }
    if (obj.daily?.date === dateKey())
        for (const k of ['pet', 'story', 'rhythm', 'claimed'])
            d.daily[k] = obj.daily[k] === true;
    d.gift = obj.gift === true;
    d.sound = obj.sound !== false;
    d.cards = cleanCards(obj.cards);
    d.fusion = cleanFusion(obj.fusion);
    d.chronicle = Chronicle.clean(obj.chronicle);
    if (obj.bondVault) {
        const bonds = openBonds(obj.bondVault);
        d.affinity = Object.fromEntries(CARD_DEFS.map(card => [card.id, bonds[card.id]]));
        d.cat.aff = bonds.cat;
        d.chronicle.bonds = {};
        for (const run of allChronicleRuns(d.chronicle))
            run.aff = {};
    }
    d.progression = obj.levelVault ? openLevels(obj.levelVault) : cleanProgression(obj.progression, d.chronicle);
    if (!obj.economy)
        seedLegacyEconomy(d);
    // TIM's old independent meter is merged once, never summed or used as a second source again.
    if (!obj.bondVault)
        d.affinity.tim = Math.max(d.affinity.tim, number(obj.cards?.trio?.tim?.performance, 0, 0, 100));
    delete d.cards.trio.tim.performance;
    syncUnifiedBonds(d);
    syncGlobalLevels(d);
    // Seed claims from actual legacy journals and completed stories, preserving replay protection.
    if (!obj.bondProgress) {
        for (const r of [d.chronicle.run, ...Object.values(d.chronicle.slots)])
            for (const e of r.journal || [])
                if (e.choice)
                    for (const c of CARD_DEFS)
                        d.bondProgress.claimed[`plot:${r.chapter}:${e.scene}:${c.id}`] = true;
        for (const id of d.completed)
            d.bondProgress.claimed['story:' + id] = true;
    }
    syncStoryCards(d);
    restoreChronicleArt(d);
    if (!obj.bondVault && (Number(obj.affinity?.shiyuan) < 0 || Number(obj.chronicle?.run?.aff?.shiyuan) < 0))
        d.cards.trio.ye.closed = true;
    return d;
}
function cleanImportedState(obj) {
    if (!obj || typeof obj !== 'object' || !Object.hasOwn(obj, 'wallet') || !Object.hasOwn(obj, 'bondVault') || !Object.hasOwn(obj, 'levelVault'))
        throw new Error('导入存档缺少完整的加密成长数据');
    return cleanState(obj);
}
let storageOK = true, storageRecovered = false, storageLoadError = '', state;
function preserveUnreadableSave(raw) {
    if (!raw)
        return;
    try {
        if (!localStorage.getItem(RECOVERY_KEY))
            localStorage.setItem(RECOVERY_KEY, raw);
    }
    catch {}
}
function loadState() {
    storageOK = true;
    storageRecovered = false;
    storageLoadError = '';
    let current;
    try {
        current = localStorage.getItem(KEY);
    }
    catch (error) {
        state = freshState();
        storageOK = false;
        storageLoadError = '浏览器拒绝读取本地存档，自动保存已暂停，现有数据不会被覆盖。';
        return;
    }
    if (current) {
        try {
            state = cleanImportedState(JSON.parse(current));
            return;
        }
        catch (error) {
            preserveUnreadableSave(current);
            try {
                const backup = localStorage.getItem(BACKUP_KEY);
                if (backup) {
                    state = cleanImportedState(JSON.parse(backup));
                    storageRecovered = true;
                    storageLoadError = '当前存档校验失败，已自动恢复上一份可读备份。';
                    return;
                }
            }
            catch {}
            state = freshState();
            storageOK = false;
            storageLoadError = '存档读取失败，原始数据已保留，自动保存已暂停。请从设置导入备份，或导出故障存档交给开发者恢复。';
            return;
        }
    }
    try {
            const legacy = localStorage.getItem(V61_KEY) || localStorage.getItem(V6_KEY) || localStorage.getItem(V53_KEY) || localStorage.getItem(V5_KEY) || localStorage.getItem(V4_KEY) || localStorage.getItem(PREVIOUS_KEY) || localStorage.getItem(LEGACY_KEY);
            state = legacy ? cleanState(JSON.parse(legacy)) : freshState();
    }
    catch (error) {
        state = freshState();
        storageOK = false;
        storageLoadError = '旧存档读取失败，原始数据未被覆盖，自动保存已暂停。';
    }
}
let currentView = 'home', albumFilter = 'all', modalPreviousFocus = null, modalOnClose = null, lastPetAction = -1000, lastRest = 0, storySession = null;
function save() {
    if (!storageOK)
        return false;
    syncUnifiedBonds(state);
    syncGlobalLevels(state);
    syncStoryCards();
    try {
        const current = localStorage.getItem(KEY);
        if (current && !storageRecovered)
            localStorage.setItem(BACKUP_KEY, current);
        localStorage.setItem(KEY, JSON.stringify(persistedState()));
        for (const key of [V61_KEY, V6_KEY, V53_KEY, V5_KEY, V4_KEY, PREVIOUS_KEY, LEGACY_KEY])
            localStorage.removeItem(key);
        storageOK = true;
        storageRecovered = false;
        return true;
    }
    catch (e) {
        if (storageOK)
            toast('浏览器暂不允许保存；可在设置里导出存档。');
        storageOK = false;
        return false;
    }
}
function ensureDaily() {
    if (state.daily.date !== dateKey())
        state.daily = { date: dateKey(), pet: false, story: false, rhythm: false, claimed: false };
}
