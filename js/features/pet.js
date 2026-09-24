'use strict';

function renderPet() { const c = state.cat; $$('.pet-name').forEach(e => e.textContent = state.catName); $$('.pet-aff-text').forEach(e => e.textContent = `${c.aff} / 100`); $$('.pet-aff-bar').forEach(e => e.style.width = `${c.aff}%`); $('petMoodTag').textContent = c.aff >= 60 ? '最喜欢你啦' : c.aff >= 25 ? '我们很熟啦' : '等你摸摸'; $('togetherDays').textContent = 1 + Math.max(0, Math.floor((Date.now() - state.created) / 86400000)); $('petNeeds').innerHTML = [['fish', '饱腹感', 'hunger', 'gold'], ['heart', '好心情', 'mood', ''], ['moon', '小精力', 'energy', 'sage']].map(([i, t, k, cl]) => `<div class="need-row ${cl}"><div class="need-title"><span>${I(i)}${t}</span><span>${c[k]} / 100</span></div><div class="progress-track"><div class="progress-fill" style="width:${c[k]}%"></div></div></div>`).join(''); }
function sayCat(text) { $$('.pet-speech').forEach(e => e.textContent = text); $$('.cat-touch').forEach(e => { e.classList.remove('bounce'); void e.offsetWidth; e.classList.add('bounce'); }); }
function care(action, el) {
    const now = performance.now();
    if (now - lastPetAction < 850)
        return;
    lastPetAction = now;
    const c = state.cat;
    if (action === 'pet') {
        const gained = grantBond('cat', 1, { daily: true });
        c.mood = clamp(c.mood + 5, 0, 100);
        c.pets++;
        markDaily('pet');
        sayCat(['呼噜呼噜…是你就喜欢。', '今天的快乐，是你摸摸给的。', '再摸一下嘛，就一下！', '喵～你身上有排练室的味道。'][c.pets % 4]);
        unlock('purr');
        toast('羁绊分 +' + gained + (gained ? '' : ' · 今日陪伴奖励已领取'));
    }
    else if (action === 'feed') {
        if (c.hunger >= 100) {
            sayCat('肚子圆圆啦，先不吃了喵。');
            toast('小猫吃饱啦，来陪它玩一会儿吧。');
            return;
        }
        const ledger = bondProgress(), used = ledger.daily.counts['catGift:cat'] || 0;
        if (used >= BOND_RULES.giftsPerDay) {
            toast('今天已投喂三次，明天再来吧。');
            return;
        }
        if (state.coins < BOND_RULES.giftCost) {
            toast('音符不够啦，投喂需要 10 音符。');
            return;
        }
        state.coins -= BOND_RULES.giftCost;
        ledger.daily.counts['catGift:cat'] = used + 1;
        c.hunger = clamp(c.hunger + 18, 0, 100);
        const gained = grantBond('cat', 1);
        c.mood = clamp(c.mood + 3, 0, 100);
        markDaily('pet');
        sayCat('是小鱼干！你果然最懂我。');
        toast('喂食成功 · 音符 −10 · 饱腹感 +18 · 羁绊分 +' + gained);
    }
    else if (action === 'play') {
        if (c.energy < 10) {
            sayCat('玩不动啦，想窝在你身边。');
            toast('小猫有点累，去「喵咪小屋」让它休息一下。');
            return;
        }
        c.energy -= 10;
        c.hunger = clamp(c.hunger - 4, 0, 100);
        c.mood = clamp(c.mood + 12, 0, 100);
        const gained = grantBond('cat', 1, { daily: true });
        markDaily('pet');
        sayCat('抓到啦！下次换我来追你。');
        toast('羁绊分 +' + gained + ' · 心情 +12 · 精力 −10');
    }
    else if (action === 'earn') {
        if (now - lastRest < 10000 && lastRest > 0) {
            toast('猫咪还在伸懒腰，稍等几秒再休息。');
            return;
        }
        if (c.energy >= 100) {
            sayCat('睡醒啦！现在精力满满。');
            return;
        }
        lastRest = now;
        c.energy = clamp(c.energy + 25, 0, 100);
        c.mood = clamp(c.mood + 4, 0, 100);
        sayCat('呼…在你身边睡得好安心。');
        toast('精力 +25 · 心情 +4');
    }
    else
        return;
    if (c.aff >= 60)
        unlock('trust');
    if (el)
        heartBurst(el);
    playPetSound(action);
    save();
    renderGlobal();
}
