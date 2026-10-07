'use strict';

// A single bounded canvas adds depth without growing the DOM or using media assets.
function startGiftAtmosphere(host, { theme, x, y, size }) {
    const canvas = document.createElement('canvas'); canvas.className = 'gift-atmosphere';
    canvas.setAttribute('aria-hidden', 'true'); host.prepend(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => canvas.remove();
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * ratio); canvas.height = Math.round(innerHeight * ratio);
    const count = innerWidth < 600 ? 48 : 80, start = performance.now();
    const motion = theme.motion || 'comet', colors = theme.colors;
    const unit = size / 400;
    let frame = 0;
    function stroke(path, color, width = 1, alpha = 1) {
        ctx.globalAlpha = alpha; ctx.lineWidth = width; ctx.strokeStyle = color;
        ctx.beginPath(); path(); ctx.stroke();
    }
    function dot(px, py, radius, color, alpha, star = false) {
        ctx.globalAlpha = alpha; ctx.fillStyle = color;
        ctx.beginPath();
        if (star) { ctx.moveTo(px, py - radius * 2.3); ctx.lineTo(px + radius * .35, py - radius * .35); ctx.lineTo(px + radius * 1.6, py); ctx.lineTo(px + radius * .35, py + radius * .35); ctx.lineTo(px, py + radius * 2.3); ctx.lineTo(px - radius * .35, py + radius * .35); ctx.lineTo(px - radius * 1.6, py); ctx.lineTo(px - radius * .35, py - radius * .35); ctx.closePath(); }
        else ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    function draw(now) {
        const t = (now - start) / 1000;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.clearRect(0, 0, innerWidth, innerHeight);
        ctx.translate(x, y); ctx.scale(unit, unit);
        const fade = Math.min(1, t / .45, Math.max(0, (4.15 - t) / .55));
        ctx.save();
        // Colored atmospheric pool; no full-screen flash or camera shake.
        const halo = ctx.createRadialGradient(0, 15, 20, 0, 15, 250);
        halo.addColorStop(0, colors[1] + '30'); halo.addColorStop(.5, colors[0] + '18'); halo.addColorStop(1, colors[0] + '00');
        ctx.globalAlpha = fade; ctx.fillStyle = halo; ctx.fillRect(-260, -260, 520, 520);
        if (motion === 'stage') {
            for (let i = 0; i < 4; i++) {
                const bx = (i - 1.5) * 90, end = Math.sin(t * .85 + i * 1.8) * 180;
                const g = ctx.createLinearGradient(bx, -210, end, 150);
                g.addColorStop(0, colors[i%2] + 'b0'); g.addColorStop(1, colors[i%2] + '00');
                ctx.globalAlpha = fade * .65; ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(bx, -210); ctx.lineTo(end - 75, 155); ctx.lineTo(end + 75, 155); ctx.closePath(); ctx.fill();
            }
        }
        if (motion === 'aurora') {
            for (let band = 0; band < 3; band++) {
                ctx.beginPath();
                for (let a = -205; a <= 205; a += 5) { const b = -110 + Math.sin(a * .014 + t * .8 + band * .7) * 40 + band * 22; if(a===-205)ctx.moveTo(a,b); else ctx.lineTo(a,b); }
                for (let a = 205; a >= -205; a -= 5) ctx.lineTo(a, -185 + Math.sin(a * .014 + t * .8 + band * .7) * 30 + band * 18);
                ctx.closePath(); const g = ctx.createLinearGradient(0,-210,0,-45); g.addColorStop(0,colors[1]+'00');g.addColorStop(.6,colors[band%2]+'70');g.addColorStop(1,colors[0]+'00');ctx.fillStyle=g;ctx.globalAlpha=fade*.7;ctx.fill();
            }
        }
        if (motion === 'beat' || motion === 'water') {
            for (let j = 0; j < 4; j++) {
                const p = (t * (motion === 'beat' ? 1.35 : .7) + j * .25) % 1;
                stroke(() => ctx.ellipse(0, motion==='water'?85:45, 35 + p * 205, (25+p*90)*(motion==='water'?.4:1), -.1, 0, Math.PI*2), colors[j%2], 2.5*(1-p)+.5, fade*(1-p)*.7);
            }
        }
        if (motion === 'string') {
            for(let j=0;j<6;j++)stroke(()=>{
                for(let px=-210;px<=210;px+=5){const py=(j-2.5)*18+Math.sin(px*.035-t*8+j*.3)*Math.sin((px+210)/420*Math.PI)*22; if(px===-210)ctx.moveTo(px,py);else ctx.lineTo(px,py);}
            },colors[j%2],j===2?2:1,fade*.5);
        }
        if (['ribbon','comet','firework'].includes(motion)) {
            const winding = motion === 'ribbon' ? 3 : 2;
            for(let j=0;j<winding;j++){
                const head=t*2.1+j*Math.PI;
                stroke(()=>{for(let k=0;k<72;k++){const a=head-k*.025,px=Math.cos(a)*(190+j*14),py=Math.sin(a)*(75+j*17)-20+Math.cos(a)*35;if(!k)ctx.moveTo(px,py);else ctx.lineTo(px,py);}},colors[j%2],2-j*.3,fade*.55);
                dot(Math.cos(head)*(190+j*14),Math.sin(head)*(75+j*17)-20+Math.cos(head)*35,3.2,colors[j%2],fade,true);
            }
        }
        // Analytic particles have a fixed cost and deterministic lifetimes.
        for(let i=0;i<count;i++){
            const seed=((i*73)%101)/101, a=i*2.39996+t*.35;
            let px,py,alpha=fade,radius=1+(i%4)*.55;
            if(motion==='ember') { const p=(t*.38+seed)%1;px=Math.sin(i*9.3)*145+Math.sin(t+i)*16;py=140-p*340;alpha*=Math.sin(p*Math.PI); }
            else if(motion==='firework' && t>1.6){ const group=i%3,age=t-(1.65+group*.28),p=Math.max(0,age),speed=70+(i%7)*13;px=(group-1)*110+Math.cos(i*2.39996)*p*speed;py=-80-Math.sin(i*2.39996)*p*speed+p*p*35;alpha*=age>0?Math.max(0,1-age/1.8):0; }
            else if(motion==='water') { const p=(t*.27+seed)%1;px=Math.sin(i*8.7)*180;py=130-p*300;alpha*=Math.sin(p*Math.PI)*.8;radius*=1.5; }
            else { const pulse=1+Math.max(0,t-1.7)*.12,rad=(115+seed*90)*pulse;px=Math.cos(a)*rad;py=Math.sin(a)*rad*.65-10;alpha*=.3+.6*Math.pow(Math.sin(t*2+i),2); }
            dot(px,py,radius,colors[i%2],alpha,i%9===0);
        }
        ctx.restore();
        if(t<4.2)frame=requestAnimationFrame(draw);
    }
    frame=requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); canvas.remove(); };
}
