'use strict';

// Pure presentation. All payment and bond settlement stays in feedCard.
const PawGift = (() => {
    let cleanup = null;
    const heart = `<svg viewBox="0 0 120 112" aria-hidden="true"><defs>
      <radialGradient id="paw-heart-glass" cx="32%" cy="18%" r="88%"><stop stop-color="#fff6fa"/><stop offset=".22" stop-color="#ffadc9"/><stop offset=".52" stop-color="#f8669d"/><stop offset=".82" stop-color="#c52f70"/><stop offset="1" stop-color="#8f2056"/></radialGradient>
      <linearGradient id="paw-heart-edge" x2=".7" y2="1"><stop stop-color="#fff"/><stop offset=".48" stop-color="#ffb5d6"/><stop offset="1" stop-color="#ee80b0"/></linearGradient>
      </defs><path d="M60 102C46 90 8 65 7 37 6 7 42 0 60 25 78 0 114 7 113 37 112 65 74 90 60 102Z" fill="url(#paw-heart-glass)" stroke="url(#paw-heart-edge)" stroke-width="2"/>
      <path d="M17 35C17 17 38 13 48 26" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".78"/><path d="M20 46 22 51" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55"/>
      <path d="M70 88C87 73 99 61 103 46" fill="none" stroke="#ffb0d7" stroke-width="3" opacity=".55"/><path d="m90 16 2 7 7 2-7 2-2 7-2-7-7-2 7-2Z" fill="#fff7e9"/></svg>`;
    const paw = `<svg viewBox="0 0 240 300" aria-hidden="true"><defs>
      <radialGradient id="paw-fur" cx="36%" cy="29%" r="77%"><stop stop-color="#fffef5"/><stop offset=".5" stop-color="#fff0db"/><stop offset=".8" stop-color="#e9c8a5"/><stop offset="1" stop-color="#cda385"/></radialGradient>
      <radialGradient id="paw-bean" cx="34%" cy="23%" r="85%"><stop stop-color="#ffe4e7"/><stop offset=".45" stop-color="#f5b3c3"/><stop offset=".85" stop-color="#d97e9c"/><stop offset="1" stop-color="#bc6b8c"/></radialGradient>
      <linearGradient id="paw-arm" x1="0" x2="1"><stop stop-color="#dbb693"/><stop offset=".35" stop-color="#fff7e7"/><stop offset=".7" stop-color="#f6e0c3"/><stop offset="1" stop-color="#ceaa8b"/></linearGradient>
      <filter id="paw-soft"><feGaussianBlur stdDeviation="2"/></filter></defs>
      <path d="M64 305C67 251 50 217 56 165L184 164C194 220 175 258 185 305Z" fill="url(#paw-arm)"/>
      <path d="M55 185C28 169 18 143 27 119 7 94 21 59 44 61 34 24 66 7 87 36 90 0 128 0 137 33 159 7 192 26 186 57 219 54 235 89 214 115 230 143 202 181 183 188 142 211 89 208 55 185Z" fill="url(#paw-fur)" stroke="#fff3e2" stroke-width="1.5"/>
      <g fill="#ac776f" opacity=".13" filter="url(#paw-soft)"><ellipse cx="53" cy="102" rx="23" ry="28"/><ellipse cx="99" cy="66" rx="23" ry="29"/><ellipse cx="151" cy="74" rx="23" ry="29"/><ellipse cx="192" cy="105" rx="22" ry="26"/><ellipse cx="121" cy="160" rx="49" ry="31"/></g>
      <g fill="url(#paw-bean)"><ellipse cx="51" cy="94" rx="20" ry="25" transform="rotate(-25 51 94)"/><ellipse cx="98" cy="58" rx="20" ry="26" transform="rotate(-8 98 58)"/><ellipse cx="150" cy="65" rx="20" ry="26" transform="rotate(15 150 65)"/><ellipse cx="192" cy="97" rx="18" ry="24" transform="rotate(30 192 97)"/>
      <path d="M78 148C74 132 87 116 101 119 111 102 135 103 143 123 165 124 173 143 161 159 151 176 135 169 120 170 101 180 76 169 78 148Z"/></g>
      <g fill="#fff" opacity=".46"><ellipse cx="44" cy="84" rx="7" ry="4" transform="rotate(-35 44 84)"/><ellipse cx="93" cy="46" rx="8" ry="4"/><ellipse cx="145" cy="53" rx="7" ry="4"/><ellipse cx="187" cy="85" rx="6" ry="3"/><ellipse cx="111" cy="125" rx="13" ry="5" transform="rotate(-20 111 125)"/></g>
      <g fill="none" stroke="#fffaf0" stroke-linecap="round" opacity=".75" stroke-width="2"><path d="m37 133 9 5m-6 4 9 4m-1 23 9-2m123 2 10-5m-6-9 12-5M69 216l7 14m2-17 7 15m68 15 7-14m-3 35 7-12"/></g>
      <path d="M78 204Q120 222 162 204" fill="none" stroke="#e2bbaa" stroke-width="2" opacity=".35"/></svg>`;
    function stop() { if (cleanup) cleanup(); }
    function play({ target, name = '', origin, audio = null, onEnd }  = {}) {
        stop();
        if (document.hidden) { onEnd?.(); return; }
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const r = target?.getBoundingClientRect();
        const visible = r && r.bottom > 80 && r.top < innerHeight - 100;
        const x = visible ? Math.max(90, Math.min(innerWidth - 90, r.left + r.width * .5)) : innerWidth * .5;
        const y = visible ? Math.max(100, Math.min(innerHeight - 170, r.top + r.height * .63)) : innerHeight * .42;
        const from = origin?.getBoundingClientRect();
        const sx = Math.max(100, Math.min(innerWidth - 100, from ? from.left + from.width / 2 : innerWidth * .7));
        const sy = Math.min(innerHeight - 125, Math.max(y + 125, from ? from.top - 25 : innerHeight * .73));
        const el = document.createElement('div');
        el.className = 'paw-gift'; el.setAttribute('aria-hidden', 'true');
        for (const [k, v] of Object.entries({ x, y, sx, sy })) el.style.setProperty(`--${k}`, `${v}px`);
        el.innerHTML = `<div class="paw-gift-aura"></div><canvas class="paw-gift-particles"></canvas><div class="paw-gift-hand">${paw}</div><div class="paw-gift-heart">${heart}</div><div class="paw-gift-ring"></div><div class="paw-gift-ring paw-gift-ring-second"></div><div class="paw-gift-caption"><span class="paw-gift-caption-title"></span><small>A LITTLE LOVE, JUST FOR YOU</small></div>`;
        el.querySelector('.paw-gift-caption-title').textContent = name ? `${name}，心意送达` : '心意送达';
        document.body.append(el);
        const canvas = el.querySelector('canvas'), ctx = reduced ? null : canvas.getContext('2d');
        const dpr = Math.min(devicePixelRatio || 1, 2);
        canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr);
        if (ctx) ctx.scale(dpr, dpr);
        const h = el.querySelector('.paw-gift-heart');
        const particles = []; let raf = 0, last = 0, emitted = false;
        const start = performance.now();
        const stopSound = audio ? PawGiftAudio.play({ ...audio, reduced }) : () => {};
        const ease = t => t * t * (3 - 2 * t);
        function add(px, py, vx, vy, life, size, star = false) {
            particles.push({ x: px, y: py, vx, vy, life, max: life, size, star, hue: Math.random() > .45 ? '255,216,164' : '255,158,197' });
        }
        function draw(now) {
            const t = now - start, dt = Math.min(32, now - (last || now)); last = now;
            const f = ease(Math.max(0, Math.min(1, (t - 1000) / 780)));
            const hx = sx + (x - sx) * f + Math.sin(f * Math.PI) * 38;
            const hy = sy - 48 + (y - sy + 48) * f - Math.sin(f * Math.PI) * 75;
            const entrance = ease(Math.max(0, Math.min(1, (t - 280) / 500)));
            const fade = 1 - Math.max(0, Math.min(1, (t - 1800) / 280));
            const scale = t < 1000 ? (.45 + .55 * entrance + Math.sin(t / 160) * .025) : 1 - f * .22 + (1 - fade) * .4;
            h.style.transform = `translate3d(${hx - 49}px,${hy - 46}px,0) rotate(${Math.sin(f * Math.PI) * 15 - 8 * (1 - f)}deg) scale(${scale})`;
            h.style.opacity = String(entrance * fade);
            if (ctx) {
                ctx.clearRect(0, 0, innerWidth, innerHeight);
                if (t > 600 && t < 1800 && particles.length < 110) {
                    for (let i = 0; i < 2; i++) add(hx + (Math.random() - .5) * 32, hy + 18, (Math.random() - .5) * .045, .018, 400 + Math.random() * 300, 1 + Math.random() * 2.5, i === 0);
                }
                if (t >= 1780 && !emitted) {
                    emitted = true;
                    for (let i = 0; i < 48; i++) { const a = i * Math.PI * 2 / 48, speed = .055 + Math.random() * .11; add(x, y, Math.cos(a) * speed, Math.sin(a) * speed, 600 + Math.random() * 600, 1.5 + Math.random() * 4, i % 3 === 0); }
                }
                for (let i = particles.length - 1; i >= 0; i--) {
                    const p = particles[i]; p.life -= dt;
                    if (p.life <= 0) { particles.splice(i, 1); continue; }
                    p.x += p.vx * dt; p.y += p.vy * dt; p.vy += dt * .000025;
                    const alpha = Math.min(1, p.life / p.max * 1.5), size = p.size * Math.min(1, p.life / 160);
                    ctx.fillStyle = `rgba(${p.hue},${alpha})`; ctx.shadowColor = `rgba(${p.hue},.7)`; ctx.shadowBlur = 8;
                    ctx.beginPath();
                    if (p.star) { ctx.moveTo(p.x, p.y - size * 1.6); ctx.quadraticCurveTo(p.x + size * .2, p.y - size * .2, p.x + size, p.y); ctx.quadraticCurveTo(p.x + size * .2, p.y + size * .2, p.x, p.y + size * 1.6); ctx.quadraticCurveTo(p.x - size * .2, p.y + size * .2, p.x - size, p.y); ctx.quadraticCurveTo(p.x - size * .2, p.y - size * .2, p.x, p.y - size * 1.6); }
                    else ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            if (t < 3200) raf = requestAnimationFrame(draw);
        }
        if (!reduced) raf = requestAnimationFrame(draw);
        const timer = setTimeout(stop, reduced ? 1400 : 3300);
        const hide = () => { if (document.hidden) stop(); };
        cleanup = () => {
            clearTimeout(timer); cancelAnimationFrame(raf); stopSound(); el.remove();
            document.removeEventListener('visibilitychange', hide);
            window.removeEventListener('resize', stop); window.removeEventListener('wheel', stop); window.removeEventListener('touchmove', stop);
            cleanup = null;
            onEnd?.();
        };
        document.addEventListener('visibilitychange', hide);
        window.addEventListener('resize', stop); window.addEventListener('wheel', stop, { passive: true }); window.addEventListener('touchmove', stop, { passive: true });
    }
    return { play, stop };
})();
