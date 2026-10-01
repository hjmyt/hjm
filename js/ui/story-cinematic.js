'use strict';

// Reusable visual layer. The host owns story progress, modal lifecycle and BGM.
const StoryCinematic = (() => {
    function mount(host, { src, videoSrc, musicHTML = '', onClose = () => {} }) {
        host.innerHTML = `<section class="story-cinematic" aria-label="宝石与飞鸿 · 摩天轮下的拥抱">
          <div class="cinematic-backdrop" aria-hidden="true"></div><div class="cinematic-aura" aria-hidden="true"></div>
          <div class="cinematic-dust" aria-hidden="true"></div>
          <header class="cinematic-kicker"><span>BAOSHI &amp; FEIHONG</span><span>摩天轮下 · HE</span></header>
          <div class="cinematic-story" tabindex="0" role="region" aria-label="拥抱剧情，可上下滑动阅读">
            <div class="cinematic-prelude"><span>飞鸿，我不是来续约搭档的。</span><strong>我是来追你的。</strong></div>
            <figure class="cinematic-picture"><video autoplay muted playsinline preload="auto" aria-label="摩天轮下，宝石与飞鸿拥抱的视频"></video><img class="cinematic-still" hidden alt="摩天轮下，宝石与飞鸿紧紧拥抱。"><figcaption>摩天轮下，霓虹还亮着。</figcaption></figure>
            <div class="cinematic-words"><span class="cinematic-overline">终于，不再错过。</span><h2>我喜欢你。<em>我选你。</em></h2><div class="cinematic-prose"><p>霓虹下，两个人都安静了一秒。<br>然后飞鸿张开手臂，<br>宝石不管不顾地撞了进去。</p><p>那个拥抱很长，很用力。<br>仅此而已——但胜过万语千言。</p></div><p class="cinematic-credit">宝石 × 飞鸿 · 爱我还是他</p></div>
          </div>
          <footer class="cinematic-footer"><div class="cinematic-music">${musicHTML}</div><div class="cinematic-actions"><button type="button" data-cinematic-skip>跳过入场</button><button type="button" data-cinematic-replay>重看演出</button><button type="button" data-cinematic-close>继续故事 <span aria-hidden="true">→</span></button></div></footer>
        </section>`;
        const root = host.querySelector('.story-cinematic'), video = root.querySelector('video');
        const still = root.querySelector('.cinematic-still');
        still.src = src;
        let disposed = false, finished = false;
        video.onended = () => {
            finished = true;
            video.hidden = true;
            still.hidden = false;
        };
        root.querySelector('.cinematic-backdrop').style.backgroundImage = `url("${new URL(src, document.baseURI).href}")`;
        video.poster = src;
        video.muted = true;
        video.defaultMuted = true;
        video.src = videoSrc;
        video.onerror = () => { if (!disposed) root.querySelector('figcaption').textContent = '视频暂未加载，点击“重看演出”重试。'; };
        function playVideo() {
            if (disposed || finished || document.hidden) return;
            video.play().catch(() => {
                if (!disposed && !document.hidden && video.paused) root.querySelector('figcaption').textContent = '点击“重看演出”播放视频。';
            });
        }
        video.onplaying = () => { root.querySelector('figcaption').textContent = '摩天轮下，霓虹还亮着。'; };
        const dust = root.querySelector('.cinematic-dust');
        for (let i = 0; i < 28; i++) {
            const dot = document.createElement('i');
            dot.style.cssText = `--left:${(i * 37 + 13) % 100}%;--top:${(i * 23 + 19) % 100}%;--delay:${-i * .63}s;--duration:${8 + i % 7}s;--size:${2 + i % 4}px`;
            dust.append(dot);
        }
        function visibility() {
            root.classList.toggle('is-paused', document.hidden);
            if (document.hidden) video.pause(); else playVideo();
        }
        function click(event) {
            if (event.target.closest('[data-cinematic-close]')) onClose();
            if (event.target.closest('[data-cinematic-skip]')) root.classList.add('is-settled');
            if (event.target.closest('[data-cinematic-replay]')) {
                root.classList.remove('is-settled');
                // Restart the silent video and visual entrance, keeping BGM continuous.
                finished = false;
                still.hidden = true;
                video.hidden = false;
                if (video.error) video.load();
                video.currentTime = 0;
                playVideo();
                for (const animation of root.getAnimations({ subtree: true })) { animation.currentTime = 0; }
            }
        }
        // Embedded mobile browsers can expose less usable space than CSS viewport units.
        function fitViewport() {
            const viewport = window.visualViewport;
            if (!viewport || viewport.scale === 1) root.style.setProperty('--cinematic-height', `${viewport?.height || window.innerHeight}px`);
        }
        fitViewport();
        window.addEventListener('resize', fitViewport);
        window.visualViewport?.addEventListener('resize', fitViewport);
        root.addEventListener('click', click);
        document.addEventListener('visibilitychange', visibility); visibility();
        return () => { disposed = true; window.removeEventListener('resize', fitViewport); window.visualViewport?.removeEventListener('resize', fitViewport); video.onplaying = video.onerror = video.onended = null; video.pause(); video.removeAttribute('src'); video.load(); root.removeEventListener('click', click); document.removeEventListener('visibilitychange', visibility); root.remove(); };
    }
    return { mount };
})();
