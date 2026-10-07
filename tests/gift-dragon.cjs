const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
(async () => {
    const server = http.createServer((req, res) => {
        const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://local').pathname));
        fs.readFile(file, (err, data) => {
            if (err) { res.writeHead(404); res.end(); return; }
            const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.mp4':'video/mp4','.png':'image/png'};
            res.setHeader('Content-Type',types[path.extname(file)] || 'application/octet-stream'); res.end(data);
        });
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const browser = await chromium.launch({headless:true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE} : {})});
    try {
        const page = await browser.newPage({viewport:{width:1280,height:900}}), errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        await page.goto(pathToFileURL(path.join(root,'previews/gift-effects.html')).href+'?effect=full');
        assert.equal(await page.locator('#gift').inputValue(),'full_bond');
        for (const width of [1280,390]) {
            await page.setViewportSize({width,height:900}); await page.locator('#replay').click();
            await page.waitForFunction(()=>document.querySelector('video.gift-dragon-video')?.currentTime>.35);
            assert.equal(await page.locator('.gift-ritual-box').count(),1);
            await page.screenshot({path:`/tmp/hjm-dragon-box-${width}.png`});
            await page.waitForFunction(()=>document.querySelector('video.gift-dragon-video')?.currentTime>1.25);
            await page.screenshot({path:`/tmp/hjm-dragon-open-${width}.png`});
            await page.waitForFunction(()=>document.querySelector('video.gift-dragon-video')?.currentTime>3);
            const media=await page.locator('.gift-dragon-video').evaluate(v=>({width:v.videoWidth,height:v.videoHeight,duration:v.duration,muted:v.muted,audio:v.webkitAudioDecodedByteCount,fit:getComputedStyle(v).objectFit}));
            assert.equal(media.width,480); assert.equal(media.height,854); assert(media.duration>10 && media.duration<10.2);
            assert(!media.muted && media.audio>0); assert.equal(media.fit,'contain');
            const bounds=await page.locator('.gift-dragon-video').boundingBox();
            assert(bounds.x>=0 && bounds.y>=0 && bounds.width<=width && bounds.height<=900,'Video element fits viewport without intrinsic-size overflow');
            assert.equal(await page.locator('.gift-dragon-sky').count(),0,'Video does not run the old animation');
            await page.screenshot({path:`/tmp/hjm-dragon-video-${width}.png`});
            // Run the full real duration: old 7.6s timer must not cut it short.
            await page.waitForFunction(()=>document.querySelector('.gift-dragon-video')?.currentTime>8.7);
            assert(await page.locator('.gift-receipt').evaluate(e=>+getComputedStyle(e).opacity<.1),'Receipt waits until energy reaches the card');
            await page.waitForFunction(()=>document.querySelector('.gift-performance')?.dataset.dragonPhase==='arrival');
            await page.waitForTimeout(250);
            assert(await page.locator('.gift-receipt').evaluate(e=>+getComputedStyle(e).opacity>.5));
            const anchor=await page.locator('#recipient').boundingBox(), halo=await page.locator('.gift-ritual-target').boundingBox();
            assert(Math.abs(anchor.x-halo.x)<1 && Math.abs(anchor.y-halo.y)<1,'Delivery halo follows actual recipient');
            await page.screenshot({path:`/tmp/hjm-dragon-delivery-${width}.png`});
            await page.waitForSelector('.gift-performance',{state:'detached',timeout:3000});
        }
        await page.locator('#stage-replay').click();
        await page.waitForFunction(()=>document.querySelector('.gift-dragon-video')?.currentTime>.3);
        await page.evaluate(()=>{window.lastVideo=document.querySelector('.gift-dragon-video');gallerySound=false;});
        await page.waitForFunction(()=>lastVideo.muted);
        await page.evaluate(()=>gallerySound=true);await page.waitForFunction(()=>!lastVideo.muted);
        await page.locator('.gift-dragon-skip').click();
        assert(await page.evaluate(()=>lastVideo.paused && !lastVideo.hasAttribute('src')));
        await page.locator('#stage-replay').click();await page.waitForFunction(()=>document.querySelector('.gift-dragon-video')?.currentTime>.5);await page.keyboard.press('Escape');
        assert.equal(await page.locator('.gift-performance').count(),0);
        await page.locator('#stage-replay').click();await page.locator('#stage-replay').click();
        assert.equal(await page.locator('.gift-dragon-video').count(),1);await page.evaluate(()=>GiftEffects.stop());
        await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#stage-replay').click();
        assert.equal(await page.locator('.gift-dragon-video').count(),0);
        await page.waitForSelector('.gift-performance',{state:'detached'});await page.emulateMedia({reducedMotion:'no-preference'});
        // Decode failure falls back to the retained jade artwork.
        await page.locator('#stage-replay').click();
        await page.evaluate(()=>document.querySelector('.gift-dragon-video').dispatchEvent(new Event('error')));
        await page.waitForSelector('.is-jade-ready');assert.equal(await page.locator('.gift-jade-figure img').count(),1);
        await page.evaluate(()=>GiftEffects.stop());
        // Browser autoplay rejection has an explicit user gesture recovery.
        await page.evaluate(()=>{window.nativePlay=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('Blocked','NotAllowedError'));};});
        await page.locator('#stage-replay').click();await page.waitForSelector('.gift-dragon-resume:not([hidden])');
        await page.evaluate(()=>HTMLMediaElement.prototype.play=nativePlay);
        await page.locator('.gift-dragon-resume').click();await page.waitForFunction(()=>document.querySelector('.gift-dragon-video')?.currentTime>.2);
        await page.evaluate(()=>GiftEffects.stop());
        // HTTP audio: capture the actual decoded original soundtrack.
        await page.goto(base+'/previews/gift-effects.html?effect=full');await page.locator('#replay').click();
        await page.evaluate(async()=>{
            window.filmContext=new AudioContext();await filmContext.resume();
            window.meter=filmContext.createAnalyser();meter.fftSize=2048;
            filmContext.createMediaElementSource(document.querySelector('.gift-dragon-video')).connect(meter);meter.connect(filmContext.destination);
            window.level=()=>{const a=new Float32Array(2048);meter.getFloatTimeDomainData(a);return Math.max(...a.map(Math.abs));};
        });
        await page.waitForFunction(()=>level()>.001);
        await page.evaluate(()=>{window.lastVideo=document.querySelector('.gift-dragon-video');GiftEffects.stop();});
        await page.waitForTimeout(100);assert(await page.evaluate(()=>level()<.0001 && lastVideo.paused));
        await page.evaluate(()=>filmContext.close());
        // Real game path: pause site music, honor global sound, release on navigation.
        await page.goto(base+'/index.html');await page.locator('[data-music-enter]').click();
        await page.waitForFunction(()=>!document.querySelector('#storyBgmAudio').paused);
        await page.evaluate(()=>{
            state.cards.encounters=CARD_DEFS.map(c=>c.id);goCard('shiyuan');
            window.synthCalls=0;window.savedGiftAudio=PawGiftAudio.play;PawGiftAudio.play=()=>{synthCalls++;return ()=>{};};
            playCardGiftEffect(cardDef('shiyuan'),['full_bond','满心礼盒']);
        });
        await page.waitForFunction(()=>document.querySelector('.gift-dragon-video')?.currentTime>.3);
        assert(await page.locator('#storyBgmAudio').evaluate(v=>v.paused));assert.equal(await page.evaluate(()=>synthCalls),0);
        await page.evaluate(()=>state.sound=false);await page.waitForFunction(()=>document.querySelector('.gift-dragon-video').muted);
        await page.evaluate(()=>{state.sound=true;route('home');});
        assert.equal(await page.locator('.gift-dragon-video').count(),0);
        await page.waitForFunction(()=>!document.querySelector('#storyBgmAudio').paused);
        await page.evaluate(()=>{playCardGiftEffect(cardDef('shiyuan'),['full_bond','满心礼盒']);Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
        assert.equal(await page.locator('.gift-performance').count(),0);
        assert.deepEqual(errors,[]);
        console.log('PASS: file/HTTP video, decoded soundtrack, full duration, desktop/mobile, mute, box opening, media-clock portal, recipient delivery, no duplicate synth, BGM pause/restore, skip/Escape/replay/navigation/background, fallback, autoplay recovery and reduced motion.');
    } finally {await browser.close(); await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
