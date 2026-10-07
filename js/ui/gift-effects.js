'use strict';

const GiftEffects = (() => {
    let cleanup = null;
    function preload({ characterId, giftId } = {}) {
        const binding = giftEffectFor(characterId, giftId);
        let src = null;
        if (binding?.theme === 'full') src = JADE_DRAGON_VIDEO;
        if (binding?.theme === 'encore') src = ENCORE_VIDEO;
        if (binding?.theme === 'transformation') src = QIQI_TRANSFORMATION_FILM.video;
        if (binding?.theme === 'noodles') src = KONGGE_NOODLE_FILM.video;
        if (binding?.theme === 'beefballs') src = KONGGE_BEEF_BALLS_FILM.video;
        if (binding?.theme === 'timTransformation') src = TIM_TRANSFORMATION_FILM.video;
        if (binding?.theme === 'comfort') {
            const film = COMFORT_FILMS[binding.giver]; src = film.fullBackground ? film.video : GiftMedia.source(film.video, film.apple);
        }
        GiftMedia.prepare(src);
    }
    function stop() { if (cleanup) cleanup(); PawGift.stop(); }
    function play({ characterId, giftId, giftName = '', ...options } = {}) {
        stop();
        const binding = giftEffectFor(characterId, giftId);
        if (!binding || !GIFT_EFFECT_THEMES[binding.theme]) { PawGift.play(options); return; }
        if (document.hidden) { options.onEnd?.(); return; }
        const theme = GIFT_EFFECT_THEMES[binding.theme];
        const cinematic = ['full', 'encore', 'comfort', 'transformation', 'noodles', 'beefballs', 'timTransformation'].includes(binding.theme);
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const r = options.target?.getBoundingClientRect();
        const size = Math.min(390, innerWidth - 24, innerHeight - 130);
        const inView = r && r.bottom > 100 && r.top < innerHeight - 100;
        const x = Math.max(size / 2 + 6, Math.min(innerWidth - size / 2 - 6, inView ? r.left + r.width / 2 : innerWidth / 2));
        const y = Math.max(size / 2 + 12, Math.min(innerHeight - size / 2 - 65, inView ? r.top + r.height * .67 : innerHeight * .47));
        const el = document.createElement('div');
        el.className = `gift-performance gift-performance-${binding.theme}${reduced ? ' is-reduced' : ''}`;
        el.dataset.giftEffect = binding.theme;
        el.setAttribute('aria-hidden', 'true');
        for (const [key, value] of Object.entries({ x: `${x}px`, y: `${y}px`, size: `${size}px`, tint: theme.colors[0], deep: theme.colors[1] })) el.style.setProperty(`--gift-${key}`, value);
        el.innerHTML = `<div class="gift-scene"><div class="gift-local-glow"></div><div class="gift-orbit"></div><div class="gift-orbit gift-orbit-two"></div><div class="gift-art-shell">${giftEffectArt(binding.theme, binding.variant)}</div><div class="gift-particles"></div><div class="gift-receipt"><span class="gift-receipt-kicker"></span><strong></strong><small></small></div></div>`;
        el.querySelector('.gift-receipt-kicker').textContent = giftName || binding.title || '';
        if (binding.theme === 'comfort') {
            const img = document.createElement('img'); img.className = 'gift-comfort-art'; img.alt = binding.title;
            img.src = COMFORT_FILMS[binding.giver].poster;
            el.querySelector('.gift-art-shell').replaceChildren(img);
        }
        el.querySelector('.gift-receipt strong').textContent = theme.title;
        el.querySelector('.gift-receipt small').textContent = options.name ? `${options.name} · 心意送达` : '心意送达';
        if (!reduced) {
            const particles = el.querySelector('.gift-particles');
            for (let i = 0; i < (cinematic ? 0 : 32); i++) {
                const p = document.createElement('i'), a = i * Math.PI * 2 / 32;
                p.className = i % 4 === 0 ? 'gift-dust gift-dust-star' : 'gift-dust';
                p.style.setProperty('--px', `${Math.cos(a) * (75 + (i % 5) * 16)}px`);
                p.style.setProperty('--py', `${Math.sin(a) * (60 + (i % 5) * 15)}px`);
                p.style.setProperty('--delay', `${1.72 + (i % 5) * .035}s`);
                p.style.setProperty('--dot', `${i % 4 === 0 ? 9 : 2 + i % 3}px`);
                particles.append(p);
            }
        }
        document.body.append(el);
        let stopSound = () => {}, timer = null;
        const begin = (failed = false) => {
            stopSound = options.audio ? PawGiftAudio.play({ ...options.audio, reduced: reduced || failed, preset: { ...theme, id: binding.theme } }) : () => {};
            timer = setTimeout(stop, reduced ? 1500 : failed ? 1800 : binding.theme === 'full' ? 7600 : 4300);
        };
        const mediaOptions = { stop, audio: options.audio, target: options.target, origin: options.origin };
        const stopAtmosphere = reduced ? () => {} : (binding.theme === 'comfort' ? startGiftComfort(el, mediaOptions, binding.giver) : binding.theme === 'transformation' ? startGiftTransformation(el, mediaOptions) : binding.theme === 'noodles' ? startGiftNoodle(el, mediaOptions) : binding.theme === 'beefballs' ? startGiftBeefBalls(el, mediaOptions) : binding.theme === 'timTransformation' ? startGiftTimTransformation(el, mediaOptions) : binding.theme === 'encore' ? startGiftEncore(el, mediaOptions) : binding.theme === 'full' ? startGiftDragon(el, { ...mediaOptions, onReady: begin }) : startGiftAtmosphere(el, { theme, x, y, size }));
        if (reduced || !cinematic) begin();
        const hide = () => { if (document.hidden) stop(); };
        cleanup = () => {
            clearTimeout(timer); stopSound(); stopAtmosphere(); el.remove();
            document.removeEventListener('visibilitychange', hide);
            window.removeEventListener('resize', stop); window.removeEventListener('wheel', stop); window.removeEventListener('touchmove', stop);
            cleanup = null;
            options.onEnd?.();
        };
        document.addEventListener('visibilitychange', hide);
        window.addEventListener('resize', stop); window.addEventListener('wheel', stop, { passive: true }); window.addEventListener('touchmove', stop, { passive: true });
    }
    return { play, stop, preload };
})();
