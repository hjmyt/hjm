'use strict';

// Each selected cat has independent saved care; concert playback is display only.
let petPose = 'idle', petMotionEnabled = true, petVideoWanted = false;
let petVideoPending = false, petVideoFailed = false, petMediaGeneration = 0;
let petReducedMotion;
const petRestTimes = {}, petSpeech = {};
function petRestTime(id) { return id === "orange" ? lastRest : petRestTimes[id] || 0; }
function setPetRestTime(id, value) { if (id === "orange") lastRest = value; else petRestTimes[id] = value; }
function resetPetRuntime() {
    lastRest = 0;
    for (const key of Object.keys(petRestTimes)) delete petRestTimes[key];
    for (const key of Object.keys(petSpeech)) delete petSpeech[key];
}

function renderPet() {
    const def = selectedPetDef(), c = petStats(def.id), used = bondProgress().daily.counts['catGift:' + def.bondId] || 0;
    petPose = def.pose;
    $$('.pet-speech').forEach(e => e.textContent = petSpeech[def.id] || `我是${petName()}，今天也想贴贴。`);
    $$('.cat-touch').forEach(e => e.setAttribute('aria-label', `轻轻摸摸${petName()}`));
    const photo = $('petPhotoImage');
    photo.src = ASSETS[def.asset]; photo.alt = PET_POSES[def.pose].alt;
    const homeImage = $('view-home').querySelector('.cat-touch img');
    homeImage.src = ASSETS[def.asset]; homeImage.alt = PET_POSES[def.pose].alt;
    $$('[data-pet-pose-select]').forEach(button => {
        const pet = PET_DEFS.find(p => p.pose === button.dataset.petPoseSelect);
        button.querySelector('[data-pet-picker-name]').textContent = petName(pet.id);
        button.querySelector('small').textContent = `${pet.label} · 羁绊 ${petStats(pet.id).aff}`;
    });
    $$('.pet-name').forEach(e => e.textContent = petName());
    $$('.pet-aff-text').forEach(e => e.textContent = `${c.aff} / 100`);
    $$('.pet-aff-bar').forEach(e => e.style.width = `${clamp(c.aff, 0, 100)}%`);
    $('petMoodTag').textContent = c.aff >= 60 ? '最喜欢你啦' : c.aff >= 25 ? '我们很熟啦' : '等你摸摸';
    $('togetherDays').textContent = 1 + Math.max(0, Math.floor((Date.now() - (def.id === "orange" ? state.created : c.created)) / 86400000));
    $('petNeeds').innerHTML = [['fish', '饱腹感', 'hunger', 'gold'], ['heart', '好心情', 'mood', ''], ['moon', '小精力', 'energy', 'sage']].map(([i, t, k, cl]) => `<div class="need-row ${cl}"><div class="need-title"><span>${I(i)}${t}</span><span>${c[k]} / 100</span></div><div class="progress-track"><div class="progress-fill" style="width:${c[k]}%"></div></div></div>`).join('');
    $$('[data-pet-cost]').forEach(e => e.textContent = `${BOND_RULES.giftCost} ♪${e.closest('#view-care') ? ' / 次' : ''}`);
    $('petFeedQuota').textContent = `今日小鱼干 ${used} / ${BOND_RULES.giftsPerDay} 次`;
    $('petCareRules').textContent = `喂食每次消耗 ${BOND_RULES.giftCost} 音符、羁绊 +1，每天最多 ${BOND_RULES.giftsPerDay} 次（每只猫独立计数）。摸摸与逗猫免费，每只猫每日合计最多 +${BOND_RULES.dailyCompanion} 羁绊；逗猫消耗 10 精力，休息恢复 25 精力。名字、羁绊、状态与收藏分别保存；三猫演出不增加奖励。`;
    $$('[data-care="feed"]').forEach(button => {
        button.disabled = c.hunger >= 100 || state.coins < BOND_RULES.giftCost || used >= BOND_RULES.giftsPerDay || !storageOK;
        button.title = c.hunger >= 100 ? '小猫已经吃饱啦' : used >= BOND_RULES.giftsPerDay ? '今天的小鱼干已送完，明天再来' : state.coins < BOND_RULES.giftCost ? `需要 ${BOND_RULES.giftCost} 音符，可以去节奏舞台赚取` : '小鱼干 · 饱腹感 +18 · 羁绊 +1';
    });
    syncPetMedia();
}
function sayCat(text) {
    petSpeech[selectedPetDef().id] = text;
    $$('.pet-speech').forEach(e => e.textContent = text);
    $$('.cat-touch').forEach(e => { e.classList.remove('bounce'); void e.offsetWidth; e.classList.add('bounce'); });
}
function setPetPose(pose) {
    const pet = PET_DEFS.find(p => p.pose === pose);
    if (!pet || !selectPet(pet.id)) return;
    renderPet();
}
function resetPetVideoFailure() {
    const video = $('petRoomVideo');
    petVideoFailed = false;
    petVideoWanted = false;
    petMediaGeneration++;
    video.removeAttribute('src');
    video.load();
}
function syncPetMedia() {
    petPose = selectedPetDef().pose;
    const pose = PET_POSES[petPose], image = $('petRoomImage'), poster = $('petConcertPoster'), video = $('petRoomVideo');
    poster.src = ASSETS.catVideoPoster;
    const source = ASSETS[pose.asset];
    if (image.getAttribute('src') !== source) image.src = source;
    image.alt = pose.alt;
    image.closest('.pet-room-scene').dataset.petPose = petPose;
    $('petPoseLabel').textContent = pose.label;
    $('petPoseCaption').textContent = pose.caption;
    $$('[data-pet-pose-select]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.petPoseSelect === petPose)));
    const toggle = $('petMotionToggle');
    toggle.hidden = !!petReducedMotion?.matches;
    toggle.setAttribute('aria-pressed', String(petMotionEnabled && !petVideoFailed));
    toggle.innerHTML = I(petVideoFailed || !petMotionEnabled ? 'play' : 'pause') + (petVideoFailed ? '重试动画' : petMotionEnabled ? '暂停动画' : '播放动画');
    const wanted = currentView === 'care' && !document.hidden && petMotionEnabled && !petReducedMotion?.matches && !petVideoFailed;
    if (wanted !== petVideoWanted) {
        petVideoWanted = wanted;
        petMediaGeneration++;
    }
    if (!wanted) {
        video.pause();
        video.hidden = true;
        poster.hidden = false;
        return;
    }
    if (petVideoPending) return;
    if (!video.paused) {
        video.hidden = false;
        poster.hidden = true;
        return;
    }
    const generation = petMediaGeneration;
    if (!video.getAttribute('src')) {
        video.poster = ASSETS.catVideoPoster;
        video.src = ASSETS.catVideo;
    }
    video.muted = true;
    petVideoPending = true;
    video.play().then(() => {
        if (generation !== petMediaGeneration || !petVideoWanted) return;
        video.hidden = false;
        poster.hidden = true;
    }).catch(() => {
        if (generation === petMediaGeneration) petVideoFailed = true;
    }).finally(() => {
        petVideoPending = false;
        // A route/pose may change while a play promise is pending.
        if (!petVideoWanted) video.pause();
        syncPetMedia();
    });
}
function mountPetRoom() {
    petReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    petMotionEnabled = !petReducedMotion.matches;
    petReducedMotion.addEventListener('change', () => syncPetMedia());
    $('petMotionToggle').onclick = () => {
        if (petVideoFailed) { resetPetVideoFailure(); petMotionEnabled = true; }
        else petMotionEnabled = !petMotionEnabled;
        syncPetMedia();
    };
    $('view-care').addEventListener('click', e => {
        const button = e.target.closest('[data-pet-pose-select]');
        if (button) setPetPose(button.dataset.petPoseSelect);
    });
    $('petRoomVideo').addEventListener('error', () => { petVideoFailed = true; syncPetMedia(); });
    document.addEventListener('visibilitychange', syncPetMedia);
    addEventListener('pagehide', () => {
        petVideoWanted = false;
        petMediaGeneration++;
        $('petRoomVideo').pause();
    });
    addEventListener('pageshow', syncPetMedia);
}
function care(action, el) {
    if (action === 'rest') action = 'earn'; // Preserve the existing rest action alias.
    if (!['pet', 'feed', 'play', 'earn'].includes(action)) return;
    const now = performance.now();
    if (now - lastPetAction < 850) return;
    lastPetAction = now;
    if (!storageOK) { toast('存档保护中，暂时无法保存猫咪互动。请先从设置恢复存档。'); return; }
    const def = selectedPetDef(), c = petStats(def.id), bondId = def.bondId, restTime = petRestTime(def.id);
    if (action === 'feed') {
        if (c.hunger >= 100) { sayCat('肚子圆圆啦，先不吃了喵。'); toast('小猫吃饱啦，来陪它玩一会儿吧。'); return; }
        if ((bondProgress().daily.counts['catGift:' + bondId] || 0) >= BOND_RULES.giftsPerDay) { toast(`今天已投喂${BOND_RULES.giftsPerDay}次，明天再来吧。`); return; }
        if (state.coins < BOND_RULES.giftCost) { toast(`音符不够啦，投喂需要 ${BOND_RULES.giftCost} 音符。`); return; }
    }
    if (action === 'play' && c.energy < 10) { sayCat('玩不动啦，想窝在你身边。'); toast('小猫有点累，点「休息一下」让它休息吧。'); return; }
    if (action === 'earn') {
        if (now - restTime < 10000 && restTime > 0) { toast('猫咪还在伸懒腰，稍等几秒再休息。'); return; }
        if (c.energy >= 100) { sayCat('睡醒啦！现在精力满满。'); return; }
    }
    const before = JSON.stringify(state), oldRest = restTime, newMemories = [];
    let message, receipt;
    if (action === 'pet') {
        const gained = grantBond(bondId, 1, { daily: true });
        c.mood = clamp(c.mood + 5, 0, 100);
        c.pets++;
        markDaily('pet');
        message = ['呼噜呼噜…是你就喜欢。', '今天的快乐，是你摸摸给的。', '再摸一下嘛，就一下！', '喵～你身上有排练室的味道。'][c.pets % 4];
        if (unlock(def.purr, false)) newMemories.push(def.purr);
        receipt = '羁绊分 +' + gained + (gained ? '' : ' · 今日陪伴奖励已领取');
    } else if (action === 'feed') {
        const ledger = bondProgress();
        state.coins -= BOND_RULES.giftCost;
        ledger.daily.counts['catGift:' + bondId] = (ledger.daily.counts['catGift:' + bondId] || 0) + 1;
        c.hunger = clamp(c.hunger + 18, 0, 100);
        const gained = grantBond(bondId, 1);
        c.mood = clamp(c.mood + 3, 0, 100);
        markDaily('pet');
        message = '是小鱼干！你果然最懂我。';
        receipt = `喂食成功 · 音符 −${BOND_RULES.giftCost} · 饱腹感 +18 · 羁绊分 +${gained}`;
    } else if (action === 'play') {
        c.energy -= 10;
        c.hunger = clamp(c.hunger - 4, 0, 100);
        c.mood = clamp(c.mood + 12, 0, 100);
        const gained = grantBond(bondId, 1, { daily: true });
        markDaily('pet');
        message = '抓到啦！下次换我来追你。';
        receipt = '羁绊分 +' + gained + ' · 心情 +12 · 精力 −10';
    } else {
        setPetRestTime(def.id, now);
        c.energy = clamp(c.energy + 25, 0, 100);
        c.mood = clamp(c.mood + 4, 0, 100);
        message = '呼…在你身边睡得好安心。';
        receipt = '精力 +25 · 心情 +4';
    }
    if (c.aff >= 60 && unlock(def.trust, false)) newMemories.push(def.trust);
    if (!save()) {
        // This is a valid runtime snapshot, not an imported save. Restore it
        // without re-running migrations that could alter unrelated progress.
        state = JSON.parse(before);
        syncUnifiedBonds(state);
        syncGlobalLevels(state);
        setPetRestTime(def.id, oldRest);
        renderGlobal();
        toast('互动未保存，音符、羁绊和状态已恢复。请先检查存档。');
        return;
    }
    sayCat(message);
    toast(receipt);
    newMemories.forEach(id => toast(`新回忆已收藏：${MEMORIES.find(m => m.id === id).title}`, true));
    if (el && !petReducedMotion?.matches) heartBurst(el);
    playPetSound(action);
    renderGlobal();
}
