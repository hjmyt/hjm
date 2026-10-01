'use strict';

// Generated 3D artwork with layered camera/atmosphere motion; not a skeletal 3D animation.
const JADE_DRAGON_ASSET = new URL('../../assets/effects/jade-dragon-v2.png', document.currentScript.src).href;
let jadeDragonPreload = null;
function preloadGiftDragon() {
    if (jadeDragonPreload) return jadeDragonPreload;
    const image = new Image(); image.decoding = 'async';
    jadeDragonPreload = new Promise(resolve => {
        image.onload = () => resolve(true);
        image.onerror = () => { jadeDragonPreload = null; resolve(false); };
        image.src = JADE_DRAGON_ASSET;
    });
    return jadeDragonPreload;
}
function startGiftDragonArtwork(host, { stop, onReady }) {
    let active = true, settled = false, frame = 0, started = 0;
    host.removeAttribute('aria-hidden'); host.classList.add('is-jade-loading');
    host.querySelector('.gift-scene').setAttribute('aria-hidden', 'true');
    const stage = document.createElement('div'); stage.className = 'gift-jade-stage'; stage.setAttribute('aria-hidden', 'true');
    stage.innerHTML = `<div class="gift-jade-depth"></div><div class="gift-jade-halo"></div><div class="gift-jade-ring gift-jade-ring-back"></div><div class="gift-jade-figure"><img alt="" draggable="false"></div><div class="gift-jade-fog gift-jade-fog-back"></div><div class="gift-jade-fog gift-jade-fog-front"></div><div class="gift-jade-ring gift-jade-ring-front"></div><canvas class="gift-dragon-sky"></canvas><div class="gift-jade-seal"><span>满 心 礼 盒</span><strong>青霄御龙</strong><small>云起 · 御风 · 共赴山海</small></div>`;
    stage.querySelector('img').src = JADE_DRAGON_ASSET;
    const status = document.createElement('div'); status.className='gift-jade-loading'; status.textContent='云起，游龙将至…'; status.setAttribute('role','status');
    const skip = document.createElement('button'); skip.type='button';skip.className='gift-dragon-skip';skip.textContent='跳过演出';skip.addEventListener('click',stop);
    host.prepend(stage);host.append(status,skip);
    const canvas=stage.querySelector('canvas'),ctx=canvas.getContext('2d');
    const width=innerWidth,height=innerHeight,dpr=Math.min(devicePixelRatio||1,2),compact=width<600;
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    const count=compact?40:70;
    function draw(now) {
        if(!active)return;
        const t=(now-started)/1000,fade=Math.min(1,t/.8,Math.max(0,(7.3-t)/1.1));
        host.dataset.dragonPhase=t<1.2?'opening':t<4.7?'reveal':t<5.55?'return':'arrival';
        if(ctx){
            ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
            const cx=width/2,cy=height*.67,rx=Math.min(width*.38,height*.34);
            for(let ring=0;ring<2;ring++){
                const head=t*.8+ring*Math.PI;
                ctx.beginPath();for(let j=0;j<90;j++){const a=head-j*.035,px=cx+Math.cos(a)*rx,py=cy+Math.sin(a)*rx*.22;if(!j)ctx.moveTo(px,py);else ctx.lineTo(px,py);}
                ctx.strokeStyle=ring?'#d5b5f0':'#b4ffdf';ctx.lineWidth=1.1;ctx.globalAlpha=fade*.65;ctx.stroke();
                ctx.fillStyle='#ddfff3';ctx.beginPath();ctx.arc(cx+Math.cos(head)*rx,cy+Math.sin(head)*rx*.22,2.1,0,Math.PI*2);ctx.fill();
            }
            for(let i=0;i<count;i++){
                const progress=(t*.07+i/count)%1,seed=((i*73)%101)/101;
                const px=cx+(seed-.5)*Math.min(width*.86,760)+Math.sin(t*.7+i)*18,py=height*.86-progress*height*.75;
                const size=.7+(i%3)*.5;
                ctx.globalAlpha=fade*Math.sin(progress*Math.PI)*(.25+.35*Math.sin(t+i)**2);
                ctx.fillStyle=i%4?'#95e5d1':'#f0d3ff';ctx.beginPath();ctx.arc(px,py,size,0,Math.PI*2);ctx.fill();
                if(i%8===0){ctx.strokeStyle='#defff4';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(px-size*3,py);ctx.lineTo(px+size*3,py);ctx.moveTo(px,py-size*3);ctx.lineTo(px,py+size*3);ctx.stroke();}
            }
        }
        if(t<7.4)frame=requestAnimationFrame(draw);
    }
    function ready(ok) {
        if(!active||settled)return;
        settled=true;
        clearTimeout(loadTimeout);status.remove();host.classList.remove('is-jade-loading');
        if(!ok){stage.remove();host.classList.add('is-jade-fallback');onReady(true);return;}
        started=performance.now();host.classList.add('is-jade-ready');
        frame=requestAnimationFrame(draw);onReady(false);
    }
    const loadTimeout=setTimeout(()=>ready(false),10000);
    preloadGiftDragon().then(ready);
    const escape=event=>{if(event.key==='Escape')stop();};document.addEventListener('keydown',escape);
    return ()=>{active=false;clearTimeout(loadTimeout);cancelAnimationFrame(frame);document.removeEventListener('keydown',escape);stage.remove();status.remove();skip.remove();};
}

// User-generated film includes its own synchronized soundtrack. Native media
// audio also works on file://, where MediaElementSource can become silent.
const JADE_DRAGON_VIDEO = new URL('../../assets/effects/jade-dragon-v3.mp4', document.currentScript.src).href;
function startGiftDragon(host, { stop, onReady, audio, target, origin }) {
    let active = true, fallback = false, frame = 0;
    let stopArtwork = () => {}, releaseMusic = () => {};
    let lastTime = -1, lastProgress = performance.now(), blocked = false;
    host.removeAttribute('aria-hidden');
    host.classList.add('is-dragon-video', 'is-jade-loading');
    host.querySelector('.gift-scene').setAttribute('aria-hidden', 'true');
    const stage = document.createElement('div'); stage.className = 'gift-dragon-film';
    stage.setAttribute('aria-hidden', 'true');
    const video = document.createElement('video'); video.className = 'gift-dragon-video';
    video.playsInline = true; video.preload = 'auto'; video.controls = false; video.loop = false;
    video.setAttribute('playsinline', ''); video.disablePictureInPicture = true;
    video.muted = !audio?.enabled(); video.volume = .85;
    const status = document.createElement('div'); status.className = 'gift-jade-loading';
    status.textContent = '云起，游龙将至…'; status.setAttribute('role', 'status');
    const skip = document.createElement('button'); skip.type = 'button';
    skip.className = 'gift-dragon-skip'; skip.textContent = '跳过演出';
    const retry = document.createElement('button'); retry.type = 'button';
    retry.className = 'gift-dragon-resume'; retry.textContent = '点击播放游龙演出'; retry.hidden = true;
    const aperture = document.createElement('div'); aperture.className = 'gift-dragon-aperture';
    aperture.append(video); stage.append(aperture); host.prepend(stage); host.append(status, skip, retry);
    const ritual = createGiftRitual(host, { target, origin, aperture, stop });
    const escape = event => { if (event.key === 'Escape') stop(); };
    document.addEventListener('keydown', escape); skip.addEventListener('click', stop);
    function unload() {
        video.pause(); video.removeAttribute('src'); video.load();
        stage.remove(); status.remove(); skip.remove(); retry.remove(); ritual.destroy();
    }
    function fail() {
        if (!active || fallback) return;
        fallback = true; cancelAnimationFrame(frame); unload();
        releaseMusic(); releaseMusic = () => {};
        host.classList.remove('is-dragon-video', 'is-video-ready', 'is-video-arrival', 'is-video-ended', 'is-jade-loading', 'is-dragon-ritual', 'is-ritual-delivered');
        stopArtwork = startGiftDragonArtwork(host, { stop, onReady });
    }
    function watch(now) {
        if (!active || fallback) return;
        video.muted = !audio?.enabled();
        const t = video.currentTime, duration = video.duration;
        if (t !== lastTime) { lastTime = t; lastProgress = now; }
        if (!blocked && !video.ended && now - lastProgress > 10000) { fail(); return; }
        if (Number.isFinite(duration)) {
            ritual.draw(t, duration, now);
        }
        frame = requestAnimationFrame(watch);
    }
    function play() {
        if (!active || fallback) return;
        blocked = false; lastProgress = performance.now(); retry.hidden = true;
        video.muted = !audio?.enabled();
        video.play().catch(error => {
            if (!active || fallback) return;
            if (error.name === 'NotAllowedError') {
                blocked = true; status.textContent = '游龙已就绪'; retry.hidden = false;
            } else if (error.name !== 'AbortError') fail();
        });
    }
    video.addEventListener('playing', () => {
        if (!active || fallback) return;
        blocked = false; status.remove(); retry.hidden = true;
        host.classList.remove('is-jade-loading'); host.classList.add('is-video-ready');
    });
    video.addEventListener('error', fail);
    video.addEventListener('ended', () => {
        if (!active || fallback) return;
        ritual.finish();
    });
    retry.addEventListener('click', play);
    releaseMusic = window.StoryBgm?.hold?.() || (() => {});
    video.src = JADE_DRAGON_VIDEO;
    play(); frame = requestAnimationFrame(watch);
    return () => {
        active = false; cancelAnimationFrame(frame);
        document.removeEventListener('keydown', escape);
        unload(); stopArtwork(); releaseMusic();
    };
}

// The media clock drives the opening and portal; only the delivery uses a
// separate clock after ended. No reward or save state is touched here.
function createGiftRitual(host, { target, origin, aperture, stop, variant = 'dragon', giftName, openingTitle, revealTitle, color }) {
    const encore = variant === 'encore', tint = color || (encore ? '#ffd1e7' : '#b8ffe7');
    const width = innerWidth, height = innerHeight;
    const cx = width / 2, boxY = height * .73;
    const rect = target?.getBoundingClientRect(), from = origin?.getBoundingClientRect();
    const visible = rect && rect.bottom > 0 && rect.top < height && rect.right > 0 && rect.left < width;
    let tx = visible ? Math.max(32, Math.min(width - 32, rect.left + rect.width / 2)) : cx;
    let ty = visible ? Math.max(64, Math.min(height - 120, rect.top + rect.height * .65)) : height * .46;
    const ox = from ? Math.max(0, Math.min(width, from.left + from.width / 2)) : cx;
    const oy = from ? Math.max(0, Math.min(height, from.top + from.height / 2)) : height + 60;
    let finishedAt = null, alive = true;
    host.classList.add('is-dragon-ritual');
    const veil = document.createElement('div'); veil.className = 'gift-ritual-veil';
    const box = document.createElement('div'); box.className = 'gift-ritual-box';
    box.innerHTML = `<svg viewBox="0 0 320 280" aria-hidden="true"><defs>
      <linearGradient id="ritual-jade" x2=".9" y2="1"><stop stop-color="#d8fff0"/><stop offset=".24" stop-color="#468c81"/><stop offset=".6" stop-color="#164e4c"/><stop offset="1" stop-color="#0a292f"/></linearGradient>
      <linearGradient id="ritual-silver" x2=".7" y2="1"><stop stop-color="#faffed"/><stop offset=".28" stop-color="#b7d3ce"/><stop offset=".55" stop-color="#587c83"/><stop offset=".8" stop-color="#effff3"/><stop offset="1" stop-color="#79b3ad"/></linearGradient>
      <radialGradient id="ritual-light"><stop stop-color="#e0fff0"/><stop offset=".35" stop-color="#80ffe4" stop-opacity=".65"/><stop offset="1" stop-color="#7bffe0" stop-opacity="0"/></radialGradient>
    </defs><ellipse cx="160" cy="247" rx="110" ry="20" fill="#041d26" opacity=".5"/>
    <path d="M52 132 159 94 267 133 267 221 160 264 52 221Z" fill="url(#ritual-jade)" stroke="url(#ritual-silver)" stroke-width="3"/>
    <path d="m52 133 108 41 107-41-108-39Z" fill="#052329" stroke="#8decd5" stroke-width="2"/>
    <path d="M60 148v66l94 37v-67M166 184v67l93-36v-65" fill="none" stroke="#b7e8d0" stroke-opacity=".5"/>
    <path d="m63 184 88 35m19 0 86-35M88 158v58m141-56v56" stroke="#a1ceba" stroke-opacity=".25" fill="none"/>
    <path d="m139 168 21 8 21-8v83l-21 9-21-9Z" fill="url(#ritual-silver)"/>
    <path d="m160 196 13 14-13 18-13-18Z" fill="#a0ffde" stroke="#e4fff3"/>
    <ellipse class="gift-ritual-core" cx="160" cy="137" rx="133" ry="47" fill="url(#ritual-light)"/>
    <g class="gift-ritual-lid"><path d="m43 113 116-43 118 43v25l-117 44-117-44Z" fill="url(#ritual-jade)" stroke="url(#ritual-silver)" stroke-width="3"/>
    <path d="m43 113 117 43 117-43M160 156v26" fill="none" stroke="#e7fff0" stroke-width="2"/>
    <path d="m130 82 116 44-29 11-114-44Z" fill="url(#ritual-silver)"/>
    <path d="m187 81-113 44 30 11 113-44Z" fill="url(#ritual-silver)"/>
    <path d="M160 93C89 89 107 29 137 58L160 93C224 95 218 37 186 59Z" fill="none" stroke="url(#ritual-silver)" stroke-width="9"/>
    <circle cx="160" cy="94" r="11" fill="#caffea" stroke="#fff5d3" stroke-width="2"/></g></svg>`;
    const label = document.createElement('div'); label.className = 'gift-ritual-title';
    const kicker = document.createElement('span'); kicker.textContent = giftName || (encore ? '心 动 安 可' : '满 心 礼 盒');
    const title = document.createElement('strong'); title.textContent = encore ? '一盒心意 · 为你安可' : '一盒心意 · 唤醒游龙';
    label.append(kicker, title);
    const canvas = document.createElement('canvas'); canvas.className = 'gift-ritual-particles';
    const ctx = canvas.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    const halo = document.createElement('div'); halo.className = 'gift-ritual-target';
    if (visible) {
        halo.style.cssText = `left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px`;
    } else halo.style.cssText = `left:${tx - 90}px;top:${ty - 100}px;width:180px;height:200px`;
    host.prepend(veil); host.append(canvas, box, label, halo);
    const lid = box.querySelector('.gift-ritual-lid'), core = box.querySelector('.gift-ritual-core');
    const clamp = n => Math.max(0, Math.min(1, n));
    const ease = n => 1 - (1 - clamp(n)) ** 3;
    const dot = (x, y, r, alpha, color = tint) => {
        if (!ctx) return;
        ctx.globalAlpha = clamp(alpha); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    };
    function draw(t, duration, now) {
        if (!alive) return;
        const delivery = finishedAt === null ? -1 : (now - finishedAt) / 1000;
        const entrance = ease(t / .65), opening = ease((t - .65) / 1.05);
        const reveal = ease((t - 1.15) / 1.5), closing = ease((t - duration + .9) / .9);
        const returnToGame = delivery >= 0 ? ease(delivery / .75) : 0;
        host.dataset.dragonPhase = delivery >= .85 ? 'arrival' : delivery >= 0 ? 'delivery' : t < .65 ? 'summon' : t < 2.65 ? 'unseal' : 'reveal';
        veil.style.opacity = String((.32 + .38 * reveal) * (1 - returnToGame));
        aperture.style.opacity = String(reveal * (1 - closing));
        aperture.style.transform = `translate(-50%,-50%) translateY(${(1 - reveal) * (boxY - 30 - height * .46)}px) scale(${.06 + .94 * reveal})`;
        box.style.left = `${ox + (cx - ox) * entrance}px`;
        box.style.top = `${oy + (boxY - oy) * entrance}px`;
        box.style.opacity = String(entrance * (delivery >= 0 ? 1 - returnToGame : clamp(1 - reveal + .8 * closing)));
        box.style.transform = `translate(-50%,-50%) scale(${(.28 + .72 * entrance) * (1 - .24 * reveal)})`;
        lid.style.transform = `translate(${-22 * opening}px,${-88 * opening}px) rotate(${-13 * opening}deg)`;
        lid.style.opacity = String(1 - .85 * reveal); core.style.opacity = String(opening);
        label.style.opacity = String(delivery >= 0 ? 0 : t < 1.5 ? entrance : 1 - ease((t - 7) / 1));
        title.textContent = t < 1.5 ? (openingTitle || (encore ? '一盒心意 · 为你安可' : '一盒心意 · 唤醒游龙')) : (revealTitle || (encore ? '心动安可' : '青霄御龙'));
        if (ctx) { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height); }
        // An expanding seal at the box mouth, then continuous ascending motes.
        if (ctx && delivery < 0) {
            ctx.save();ctx.translate(cx, boxY - 30);ctx.scale(1,.26);
            for (let i = 0; i < 3; i++) {
                ctx.globalAlpha = (.5 - i * .12) * entrance; ctx.strokeStyle = i === 1 ? '#d5bafa' : tint; ctx.lineWidth = 1.6;
                ctx.beginPath();ctx.ellipse(0,0,65 + opening * 85 + i * 24,65 + opening * 85 + i * 24,t * .3,0,Math.PI * 2);ctx.stroke();
            } ctx.restore();
            const count = width < 600 ? 42 : 70;
            for (let i=0;i<count;i++) {
                const p=(t*.17+i/count)%1, a=i*2.399+t*.65;
                const spread=(22+p*Math.min(width*.36,260))*opening;
                dot(cx+Math.cos(a)*spread,boxY-30-p*height*.7,1+i%3*.55,Math.sin(p*Math.PI)*entrance*.75,i%5?tint:'#e8caff');
            }
            // Light rises from the opening into the portal rather than cutting to a frame.
            if (t > .65 && t < 3.2) {
                ctx.globalAlpha = Math.sin(clamp((t-.65)/2.55)*Math.PI)*.45;
                const beam=ctx.createLinearGradient(0,boxY,0,height*.15);beam.addColorStop(0,tint);beam.addColorStop(1,'#8affde00');
                ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(cx-22,boxY-35);ctx.lineTo(cx-110,height*.17);ctx.lineTo(cx+110,height*.17);ctx.lineTo(cx+22,boxY-35);ctx.fill();
            }
        }
        if (delivery >= 0) {
            // Images and responsive panels can settle after the gift was sent.
            const live = target?.isConnected ? target.getBoundingClientRect() : null;
            if (live && live.bottom > 0 && live.top < height) {
                tx = Math.max(32, Math.min(width - 32, live.left + live.width / 2));
                ty = Math.max(64, Math.min(height - 120, live.top + live.height * .65));
                halo.style.cssText = `left:${live.left}px;top:${live.top}px;width:${live.width}px;height:${live.height}px`;
            }
            const p = ease(delivery / 1.05);
            const bx = cx + (tx - cx) * p, by = boxY + (ty - boxY) * p - Math.sin(p * Math.PI) * height * .2;
            if (delivery < 1.1) {
                for (let i = 0; i < 26; i++) {
                    const q = clamp(p - i * .012), x = cx + (tx - cx) * q, y = boxY + (ty - boxY) * q - Math.sin(q * Math.PI) * height * .2;
                    dot(x,y,Math.max(1,7-i*.22),(1-i/26)*.8);
                }
                dot(bx,by,12,.12);
                if (encore && ctx) {ctx.globalAlpha=1;ctx.fillStyle=tint;ctx.font='28px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('♥',bx,by);}
                else dot(bx,by,5,1,'#f3fff5');
            }
            const bloom = clamp((delivery - .65) / .85);
            halo.style.opacity = String(Math.sin(bloom * Math.PI) * .95);
            if (bloom > 0 && ctx) {
                for (let i=0;i<36;i++) {
                    const a=i*Math.PI/18,r=18+ease(bloom)*105;
                    dot(tx+Math.cos(a)*r,ty+Math.sin(a)*r*.72,1.5+i%3*.4,(1-bloom)*.9);
                }
            }
            host.classList.toggle('is-ritual-delivered', delivery > .8);
            if (delivery > 2.4) stop();
        }
    }
    return {
        draw,
        finish: () => { if (finishedAt === null) finishedAt = performance.now(); },
        destroy: () => { alive=false; [veil,box,label,canvas,halo].forEach(el=>el.remove()); }
    };
}
