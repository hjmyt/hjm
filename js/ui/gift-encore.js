'use strict';

const ENCORE_VIDEO = new URL('../../assets/effects/heartfelt-encore-alpha-v3.webm', document.currentScript.src).href;
const ENCORE_POSTER = new URL('../../assets/effects/heartfelt-encore-v1.png', document.currentScript.src).href;
const COMFORT_FILMS = Object.fromEntries(Object.values(COMFORT_GIFTS).map(g => [g.giver, {
    video: new URL(`../../assets/effects/${g.giver}-comfort-alpha-v2.webm`, document.currentScript.src).href,
    poster: new URL(`../../assets/effects/${g.giver}-comfort-v1.png`, document.currentScript.src).href,
    name: g.name, opening: '打开一份安心', reveal: g.name,
    color: g.variant === 'warm' ? '#ffe0ae' : '#e1ceff'
}]));
function startGiftComfort(host, options, giver) {
    host.classList.add('gift-performance-encore', `gift-comfort-${giver}`);
    return startGiftEncore(host, { ...options, film: COMFORT_FILMS[giver] });
}
function startGiftEncore(host, { stop, audio, target, origin, film = { video: ENCORE_VIDEO, poster: ENCORE_POSTER, name: '心动安可' } }) {
    let active = true, frame = 0, timer = 0, blocked = false, failed = false, ending = false;
    let lastTime = -1, lastProgress = performance.now(), stopSound = () => {};
    const releaseMusic = window.StoryBgm?.hold?.() || (() => {});
    host.removeAttribute('aria-hidden');
    const stage = document.createElement('div'); stage.className = 'gift-encore-stage';
    const aperture = document.createElement('div'); aperture.className = 'gift-dragon-aperture';
    const video = document.createElement('video'); video.className = 'gift-encore-video';
    video.playsInline = true; video.setAttribute('playsinline', ''); video.preload = 'auto';
    video.disablePictureInPicture = true; video.setAttribute('aria-hidden', 'true');
    video.muted = !audio?.enabled(); video.volume = .85;
    const poster = document.createElement('img'); poster.className = 'gift-encore-poster'; poster.alt = ''; poster.hidden = true;
    const status = document.createElement('div'); status.className = 'gift-encore-status'; status.setAttribute('role','status'); status.textContent = `${film.name}，即将送达…`;
    const skip = document.createElement('button'); skip.type = 'button'; skip.className = 'gift-dragon-skip'; skip.textContent = '跳过演出'; skip.addEventListener('click',stop);
    const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'gift-dragon-resume'; retry.textContent = `点击开启${film.name}`; retry.hidden = true;
    aperture.append(video); stage.append(aperture);
    host.prepend(stage,poster); host.append(status,skip,retry);
    const ritual = createGiftRitual(host, { target, origin, aperture, stop, variant: 'encore', giftName: film.name, openingTitle: film.opening, revealTitle: film.reveal, color: film.color });
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
        if (!ending) host.dataset.encorePhase = video.currentTime < 2 ? 'opening' : video.currentTime < 7 ? 'concert' : 'heart';
        else host.dataset.encorePhase = 'delivery';
        if (!failed && Number.isFinite(video.duration)) ritual.draw(video.currentTime, video.duration, now);
        if (active) frame = requestAnimationFrame(watch);
    }
    const escape = event => {if (event.key === 'Escape') stop();};
    document.addEventListener('keydown',escape); retry.addEventListener('click',play);
    video.addEventListener('playing',()=>{if(active && !failed){blocked=false;status.hidden=true;retry.hidden=true;host.classList.add('is-encore-ready');}});
    video.addEventListener('ended',finish); video.addEventListener('error',fail);
    video.src = film.video; play(); frame = requestAnimationFrame(watch);
    return () => {
        active=false;clearTimeout(timer);cancelAnimationFrame(frame);stopSound();ritual.destroy();
        document.removeEventListener('keydown',escape);
        video.pause();video.removeAttribute('src');video.load();
        [stage,video,poster,status,skip,retry].forEach(el=>el.remove());releaseMusic();
    };
}
