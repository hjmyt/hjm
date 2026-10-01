'use strict';
const descriptions = {
    hotpot: '铜色锅沿与鸳鸯汤底升起热气，火星从锅底腾起，热烈的心意正在沸腾。',
    grill: '热食从烟火中登场，细碎火星向上散开，为深夜补足能量。',
    drum: '双鼓棒交替落下，低音与环形冲击波向外扩散，让心跳跟上这一拍。',
    pick: '三枚珠光拨片展开成扇，极光色光带绕行，拨弦音点亮轨迹。',
    strings: '琴弦与金属配件在冷光中显现，六道光弦振动，泛音依次响起。',
    racket: '球拍挥出一道弧线，羽球掠过星尘，留下一条轻盈的彗星轨迹。',
    mountain: '层叠雪峰缓缓升起，青绿与紫色极光穿过夜空，徒步路线逐渐亮起。',
    plant: '叶片从嫩芽逐一舒展，光点绕着新绿盘旋，把小小春天带到桌上。',
    duck: '金色小鸭摇晃入水，涟漪扩散，水珠与轻快音符一同浮起。',
    candy: '晶亮糖纸旋转展开，糖粒轻轻落下，彩色星尘留下一点甜。',
    ribbon: '丝带与织物旋转展开，柔光顺着边缘流动，让心意有了形状。',
    concert: '交错聚光灯扫过舞台，票券或应援物件浮现，和弦托起高光时刻。',
    notebook: '纸页、笔尖与金色线条渐次出现，一句心意沿着波动光弦写下。',
    cocktail: '晶莹杯身托起渐层酒色，气泡与光环上浮，一声碰杯留住拾光。',
    coffee: '瓷杯在暖光中浮起。热饮升起轻雾，冰饮透出冰块的清亮光泽。',
    bouquet: '花瓣逐朵舒展，香槟色丝带收拢，花束在细碎金光里献上。',
    star: '金色星形发卡旋转入场，晶石映出冷光，环绕的星轨缓缓展开。',
    camera: '器材从光影里显现，定格声响起，一张珍藏瞬间的相片浮出。',
    tea: '珍珠轻轻落入杯底，奶茶渐次显现，几声轻弹带来小小的甜意。',
    cake: '奶油与夹层逐渐浮现，精巧的甜点落在瓷盘上，清亮和弦送达。',
    score: '纸页托起一段旋律，音符从五线谱中升起，组成温柔的大三和弦。',
    headphones: '金属与软垫浮现柔光，两侧声波随低音律动，留下一片安静。',
    beer: '两杯琥珀色酒液相向轻碰，泡沫与气泡上浮，清脆碰杯声落下。',
    encore: '粉金礼盒开盖，猫爪音乐舞台从盒中展开，琴键、鼓点与追光为你安可；爱心回到收礼角色，点亮羁绊。',
    comfort: '礼盒打开，宝石与飞鸿的安慰化作一段温柔陪伴。人物以透明背景融入当前页面，最后由爱心飞向收礼角色。',
    full: '青玉礼盒蓄光开启，游龙从云门腾空。龙归时化作心意流光，落向收礼角色，点亮满心相伴。'
};
const characterSelect = document.getElementById('character'), giftSelect = document.getElementById('gift');
let gallerySound = true, galleryContext = null, galleryOutput = null;
const galleryAudio = {
    enabled: () => gallerySound,
    getAudio: async () => {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) { document.getElementById('sound-note').textContent = '浏览器无法播放音效，仍可观看动画'; return null; }
        if (!galleryContext || galleryContext.state === 'closed') {
            galleryContext = new AC(); galleryOutput = galleryContext.createGain();
            galleryOutput.gain.value = gallerySound ? .28 : 0; galleryOutput.connect(galleryContext.destination);
        }
        try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; await galleryContext.resume(); }
        catch { document.getElementById('sound-note').textContent = '音频未启动，请再次点击播放'; return null; }
        return { context: galleryContext, output: galleryOutput };
    }
};
for (const c of CARD_DEFS.filter(c => !c.placeholder)) characterSelect.add(new Option(c.name, c.id));
function syncGifts(selected) {
    giftSelect.replaceChildren();
    const c = CARD_DEFS.find(c => c.id === characterSelect.value);
    const comfort = COMFORT_GIFTS[c.id];
    for (const g of [...(c.gifts || []), ...(comfort ? [[comfort.id, comfort.name]] : []), ['heartfelt_encore', '心动安可'], ['full_bond', '满心礼盒']]) giftSelect.add(new Option(g[1], g[0]));
    if (selected) giftSelect.value = selected;
    syncPreview();
}
function syncPreview() {
    GiftEffects.stop();
    GiftEffects.preload({ characterId: characterSelect.value, giftId: giftSelect.value });
    const c = CARD_DEFS.find(c => c.id === characterSelect.value), binding = giftEffectFor(c.id, giftSelect.value);
    document.getElementById('character-image').src = '../' + cardImage(c, 'full');
    document.getElementById('character-image').alt = `${c.name}完整立绘`;
    document.getElementById('character-name').textContent = c.name;
    document.getElementById('stage-gift').textContent = giftSelect.selectedOptions[0]?.textContent || '';
    document.getElementById('effect-badge').textContent = binding ? 'SPECIAL GIFT / 专属演出' : 'CLASSIC GIFT / 默认演出';
    document.getElementById('effect-title').textContent = binding ? GIFT_EFFECT_THEMES[binding.theme].title : '猫爪送心';
    document.getElementById('effect-description').textContent = binding ? (binding.theme === 'tea' && binding.variant === 'plain' ? '丝滑奶茶在光晕中浮现，为今天留一点恰好的甜。' : descriptions[binding.theme]) : '奶油猫爪托起玻璃爱心，推送星光。尚未设计专属演出的礼物，都由它送达。';
    for (const b of document.querySelectorAll('[data-theme]')) b.setAttribute('aria-pressed', String(b.dataset.theme === binding?.theme));
}
characterSelect.addEventListener('change', () => syncGifts()); giftSelect.addEventListener('change', syncPreview);
function replayGift() {
    document.getElementById('recipient').scrollIntoView({ behavior: 'instant', block: 'center' });
    const c = CARD_DEFS.find(c => c.id === characterSelect.value);
    GiftEffects.play({ characterId: c.id, giftId: giftSelect.value, giftName: giftSelect.selectedOptions[0].textContent, name: c.name, target: document.getElementById('recipient'), origin: document.getElementById('stage-replay'), audio: galleryAudio });
}
document.getElementById('replay').addEventListener('click', replayGift);
document.getElementById('stage-replay').addEventListener('click', replayGift);
document.getElementById('sound-toggle').addEventListener('click', event => {
    gallerySound = !gallerySound;
    event.currentTarget.setAttribute('aria-pressed', String(gallerySound)); event.currentTarget.textContent = `音效：${gallerySound ? '开' : '关'}`;
    if (galleryOutput) galleryOutput.gain.setTargetAtTime(gallerySound ? .28 : 0, galleryContext.currentTime, .015);
});
Object.entries(GIFT_EFFECT_THEMES).forEach(([theme, config], i) => {
    const b = document.createElement('button'); b.dataset.theme = theme; b.setAttribute('aria-pressed', 'false');
    const number = document.createElement('span'); number.textContent = `0${i + 1}`.slice(-2) + ' / ' + theme.toUpperCase();
    b.append(number, document.createTextNode(config.title));
    b.addEventListener('click', () => {
        let pair = ['shiyuan', 'full_bond'];
        if (theme === 'encore') pair = ['shiyuan', 'heartfelt_encore'];
        if (theme === 'comfort') pair = ['feihong', 'baoshi_comfort'];
        if (!['full', 'encore', 'comfort'].includes(theme)) for (const [id, gifts] of Object.entries(GIFT_EFFECT_BINDINGS)) {
            const gift = Object.keys(gifts).find(key => gifts[key].theme === theme);
            if (gift) { pair = [id, gift]; break; }
        }
        characterSelect.value = pair[0]; syncGifts(pair[1]);
    }); document.getElementById('themes').append(b);
});
document.getElementById('theme-count').textContent = `${Object.keys(GIFT_EFFECT_THEMES).length} 种专属演出`;
const count = Object.values(GIFT_EFFECT_BINDINGS).reduce((sum, gifts) => sum + Object.keys(gifts).length, 0);
document.getElementById('coverage').textContent = `${count} 份普通礼物已绑定专属演出 · 全员可送心动安可与满心礼盒 · 其余默认猫爪送心`;
characterSelect.value = 'shiyuan'; syncGifts('full_bond');

if (new URLSearchParams(location.search).get('effect') === 'full') { characterSelect.value = 'shiyuan'; syncGifts('full_bond'); }

if (new URLSearchParams(location.search).get('effect') === 'encore') { characterSelect.value = 'shiyuan'; syncGifts('heartfelt_encore'); }

for (const [id, gift] of Object.entries(COMFORT_GIFTS)) {
    if (new URLSearchParams(location.search).get('effect') === gift.id) { characterSelect.value = id; syncGifts(gift.id); }
}
