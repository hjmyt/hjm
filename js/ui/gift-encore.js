'use strict';

const ENCORE_VIDEO = new URL('../../assets/effects/heartfelt-encore-full-v2-delivery.mp4', document.currentScript.src).href;
const ENCORE_POSTER = new URL('../../assets/effects/heartfelt-encore-full-v2-poster.jpg', document.currentScript.src).href;
const QIQI_TRANSFORMATION_FILM = {
    video: new URL('../../assets/effects/qiqi-transformation-full-v2-delivery.mp4', document.currentScript.src).href,
    poster: new URL('../../assets/effects/qiqi-transformation-full-v2-poster.jpg', document.currentScript.src).href,
    name: '柒柒的华丽变装', opening: '礼盒开启 · 红金流光', reveal: '华丽变装 · 舞台登场', ritualTitle: '华丽登场 · 心意送达', color: '#ffd2ad', fullBackground: true
};
const KONGGE_NOODLE_FILM = {
    video: new URL('../../assets/effects/kongge-peanut-noodles-full-v2-delivery.mp4', document.currentScript.src).href,
    poster: new URL('../../assets/effects/kongge-peanut-noodles-full-v2-poster.jpg', document.currentScript.src).href,
    name: '花生酱拌面', opening: '礼盒开启 · 暖意升腾', reveal: '花生酱拌面 · 空格开动', ritualTitle: '热腾腾地送达 · 心意 +5', color: '#f4d49d', fullBackground: true
};
const KONGGE_BEEF_BALLS_FILM = {
    video: new URL('../../assets/effects/kongge-beef-balls-full-v2-delivery.mp4', document.currentScript.src).href,
    poster: new URL('../../assets/effects/kongge-beef-balls-full-v2-poster.jpg', document.currentScript.src).href,
    name: '牛肉丸', opening: '礼盒开启 · 暖汤升腾', reveal: '空格享用牛肉丸', ritualTitle: '暖心补给 · 心意送达', color: '#f5d69f', fullBackground: true
};
const TIM_TRANSFORMATION_FILM = {
    video: new URL('../../assets/effects/tim-transformation-full-v2-delivery.mp4', document.currentScript.src).href,
    poster: new URL('../../assets/effects/tim-transformation-full-v2-poster.jpg', document.currentScript.src).href,
    name: 'Tim 的华丽转身', opening: '球场一击 · 星光转换', reveal: '舞台登场 · 小提琴独奏', ritualTitle: '华丽转身 · 心意送达', color: '#ffe4b2', fullBackground: true, openingDelay: 1700, openingCue: 'badminton'
};
const COMFORT_FILMS = Object.fromEntries(Object.values(COMFORT_GIFTS).map(g => [g.giver, {
    video: new URL(`../../assets/effects/${g.giver}-comfort-full-v2-delivery.mp4`, document.currentScript.src).href,
    apple: new URL(`../../assets/effects/${g.giver}-comfort-full-v2-delivery.mp4`, document.currentScript.src).href,
    poster: new URL(`../../assets/effects/${g.giver}-comfort-full-v2-poster.jpg`, document.currentScript.src).href,
    name: g.name, opening: '打开一份安心', reveal: g.name,
    color: g.variant === 'warm' ? '#ffe0ae' : '#e1ceff',
    fullBackground: true
}]));
function startGiftComfort(host, options, giver) {
    host.classList.add('gift-performance-encore', `gift-comfort-${giver}`);
    return startGiftEncore(host, { ...options, film: COMFORT_FILMS[giver] });
}
function startGiftTransformation(host, options) {
    host.classList.add('gift-performance-encore', 'gift-qiqi-transformation');
    return startGiftEncore(host, { ...options, film: QIQI_TRANSFORMATION_FILM });
}
function startGiftNoodle(host, options) {
    host.classList.add('gift-performance-encore', 'gift-kongge-noodle');
    return startGiftEncore(host, { ...options, film: KONGGE_NOODLE_FILM });
}
function startGiftBeefBalls(host, options) {
    host.classList.add('gift-performance-encore', 'gift-kongge-beefballs');
    return startGiftEncore(host, { ...options, film: KONGGE_BEEF_BALLS_FILM });
}
function startGiftTimTransformation(host, options) {
    host.classList.add('gift-performance-encore', 'gift-tim-transformation');
    return startGiftEncore(host, { ...options, film: TIM_TRANSFORMATION_FILM });
}
function startGiftEncore(host, { stop, audio, target, origin, film = { video: ENCORE_VIDEO, poster: ENCORE_POSTER, name: '心动安可', fullBackground: true } }) {
    let active = true, frame = 0, timer = 0, startTimer = 0, blocked = false, failed = false, ending = false, playbackStarted = false;
    const openingDelay = Math.max(0, Number(film.openingDelay) || 0), ritualStart = performance.now();
    let lastTime = -1, lastProgress = ritualStart, stopSound = () => {};
    const releaseMusic = window.StoryBgm?.hold?.() || (() => {});
    host.removeAttribute('aria-hidden');
    if (film.fullBackground) host.classList.add('is-gift-full-background');
    const stage = document.createElement('div'); stage.className = 'gift-encore-stage';
    const aperture = document.createElement('div'); aperture.className = 'gift-dragon-aperture';
    const src = film.fullBackground ? film.video : GiftMedia.source(film.video, film.apple);
    const video = GiftMedia.acquire(src); video.className = 'gift-encore-video';
    video.playsInline = true; video.setAttribute('playsinline', ''); video.preload = 'auto';
    video.disablePictureInPicture = true; video.setAttribute('aria-hidden', 'true');
    video.muted = !audio?.enabled(); video.volume = .85;
    const poster = document.createElement('img'); poster.className = 'gift-encore-poster'; poster.alt = ''; poster.hidden = true;
    const status = document.createElement('div'); status.className = 'gift-encore-status'; status.setAttribute('role','status'); status.textContent = `${film.name}，即将送达…`;
    const skip = document.createElement('button'); skip.type = 'button'; skip.className = 'gift-dragon-skip'; skip.textContent = '跳过演出'; skip.addEventListener('click',stop);
    const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'gift-dragon-resume'; retry.textContent = `点击开启${film.name}`; retry.hidden = true;
    aperture.append(video); stage.append(aperture);
    host.prepend(stage,poster); host.append(status,skip,retry);
    const ritual = createGiftRitual(host, { target, origin, aperture, stop, variant: 'encore', giftName: film.name, openingTitle: film.opening, revealTitle: film.ritualTitle || film.reveal, color: film.color });
    if (film.openingCue === 'badminton') {
        const cue = document.createElement('div'); cue.className = 'gift-tim-shuttlecue'; cue.setAttribute('aria-hidden', 'true');
        cue.innerHTML = '<svg viewBox="0 0 64 72"><path d="M28 34 12 4m23 31L21 2m18 34L31 1m6 36L42 4m-8 34L55 8" fill="none" stroke="#fff1cf" stroke-width="3" stroke-linecap="round"/><path d="M25 35q8-6 17 1l-4 9q-6 4-12-1z" fill="#e9bf78" stroke="#fff1cf" stroke-width="2"/><circle cx="33" cy="50" r="7" fill="#fff0cc" stroke="#d7ae68" stroke-width="2"/></svg>';
        cue.addEventListener('animationend', () => cue.remove(), { once: true }); host.append(cue);
    }
    function finish() {
        if (!active || ending) return;
        ending = true; host.classList.add('is-encore-delivery');
        if (failed) timer = setTimeout(stop, 2200);
        else ritual.finish();
    }
    function fail() {
        if (!active || failed || ending) return;
        failed = true; ritual.destroy(); host.classList.add('is-encore-fallback'); video.pause(); video.removeAttribute('src'); video.load();
        video.hidden = true; poster.src = film.poster; poster.hidden = false;
        status.textContent = `${film.name} · 心意已送达`; retry.hidden = true;
        stopSound = audio ? PawGiftAudio.play({...audio,reduced:true}) : () => {};
        host.classList.add('is-encore-ready'); finish();
    }
    function play() {
        if (!active || failed || ending) return;
        playbackStarted = true;
        blocked = false; lastProgress = performance.now(); retry.hidden = true;
        video.muted = !audio?.enabled();
        video.play().catch(error => {
            if (!active || failed) return;
            if (error.name === 'NotAllowedError') { blocked = true; retry.hidden = false; status.textContent = '心意已就绪'; }
            else if (error.name !== 'AbortError') fail();
        });
    }
    function watch(now) {
        if (!active) return;
        video.muted = !audio?.enabled();
        if (video.currentTime !== lastTime) {lastTime = video.currentTime; lastProgress = now;}
        if (!blocked && !failed && !ending && now - lastProgress > 10000) fail();
        if (!ending) host.dataset.encorePhase = !playbackStarted ? 'opening' : video.currentTime < 2 ? 'opening' : video.currentTime < 7 ? 'concert' : 'heart';
        else host.dataset.encorePhase = 'delivery';
        if (!failed) {
            const videoDuration = Number.isFinite(video.duration) ? video.duration : 10;
            const ritualTime = playbackStarted ? openingDelay / 1000 + video.currentTime : Math.min(openingDelay / 1000, (now - ritualStart) / 1000);
            ritual.draw(ritualTime, openingDelay / 1000 + videoDuration, now);
        }
        if (active) frame = requestAnimationFrame(watch);
    }
    const escape = event => {if (event.key === 'Escape') stop();};
    document.addEventListener('keydown',escape); retry.addEventListener('click',play);
    video.addEventListener('playing',()=>{
        if (!active || failed) return;
        if (!film.fullBackground && !GiftMedia.hasAlpha(video)) { fail(); return; }
        blocked=false;status.hidden=true;retry.hidden=true;host.classList.add('is-encore-ready');
    });
    video.addEventListener('ended',finish); video.addEventListener('error',fail);
    if (src) {
        if (video.src !== src) video.src = src;
        if (openingDelay) startTimer = setTimeout(play, openingDelay);
        else play();
    }
    else queueMicrotask(fail);
    frame = requestAnimationFrame(watch);
    return () => {
        active=false;clearTimeout(timer);clearTimeout(startTimer);cancelAnimationFrame(frame);stopSound();ritual.destroy();
        document.removeEventListener('keydown',escape);
        video.pause();video.removeAttribute('src');video.load();
        [stage,video,poster,status,skip,retry].forEach(el=>el.remove());releaseMusic();
    };
}
