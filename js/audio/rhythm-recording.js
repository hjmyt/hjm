'use strict';

// A media element supports both file:// and static hosting. Its playback clock
// drives recorded charts, including their baked-in silent count-in.
const RhythmRecording = (() => {
    let media = null, countIn = 0;
    async function play(element) {
        let timer;
        try {
            await Promise.race([
                element.play(),
                new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Recording load timed out')), 12000); })
            ]);
        } catch (error) {
            element.pause();
            throw error;
        } finally {
            clearTimeout(timer);
        }
    }
    return {
        async start(track) {
            this.reset();
            const element = new Audio(track.audio);
            media = element;
            countIn = track.countIn + track.leadIn;
            element.preload = 'auto';
            element.setAttribute('playsinline', '');
            element.volume = .85;
            element.muted = !state.sound;
            const interrupted = () => {
                if (media === element && !element.ended && ['running', 'countdown'].includes(game.status))
                    pauseGame();
            };
            element.addEventListener('pause', interrupted);
            element.addEventListener('error', () => {
                interrupted();
                if (media === element)
                    toast('歌曲加载失败，请检查音频文件后从头再来。');
            });
            await play(element);
        },
        async resume() {
            if (!media || media.error) throw new Error('Recording unavailable');
            media.muted = !state.sound;
            await play(media);
        },
        pause() { media?.pause(); },
        reset() {
            const previous = media;
            media = null;
            if (previous) {
                previous.pause();
                previous.removeAttribute('src');
                previous.load();
            }
        },
        syncSound() { if (media) media.muted = !state.sound; },
        time() { return media ? media.currentTime - countIn : game.elapsed; }
    };
})();
