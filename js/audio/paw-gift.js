'use strict';

// Short, original synthesized cues; the caller supplies its audio output and mute policy.
const PawGiftAudio = (() => {
    function play({ getAudio, enabled, reduced = false }) {
        let cancelled = false, monitor = 0;
        const nodes = new Set(), started = performance.now();
        function stop() {
            cancelled = true; cancelAnimationFrame(monitor);
            for (const { source, release } of nodes) {
                try { source.stop(); } catch { }
                release();
            }
            nodes.clear();
        }
        if (!enabled()) return stop;
        function watch() {
            if (!enabled() || document.hidden) { stop(); return; }
            if (!cancelled) monitor = requestAnimationFrame(watch);
        }
        watch();
        Promise.resolve().then(getAudio).then(audio => {
            if (!audio || cancelled || !enabled() || document.hidden || audio.context.state !== 'running') return;
            const { context: ctx, output } = audio;
            const elapsed = (performance.now() - started) / 1000;
            function cue(at, duration, frequency, endFrequency, volume, type = 'sine') {
                // Never replay missed cues after a slow browser audio unlock.
                if (at + .08 < elapsed) return;
                const t = ctx.currentTime + Math.max(.005, at - elapsed);
                const source = ctx.createOscillator(), gain = ctx.createGain();
                source.type = type; source.frequency.setValueAtTime(frequency, t);
                source.frequency.exponentialRampToValueAtTime(endFrequency, t + duration);
                gain.gain.setValueAtTime(.0001, t);
                gain.gain.exponentialRampToValueAtTime(volume, t + .018);
                gain.gain.exponentialRampToValueAtTime(.0001, t + duration);
                source.connect(gain); gain.connect(output);
                let released = false;
                const node = { source, release: () => {
                    if (released) return;
                    released = true; nodes.delete(node); source.disconnect(); gain.disconnect(); audio.untrack?.(source);
                } };
                nodes.add(node); audio.track?.(source);
                source.onended = node.release;
                source.start(t); source.stop(t + duration + .02);
            }
            if (reduced) {
                cue(.05, .42, 1046.5, 1046.5, .08);
                return;
            }
            // Soft rounded pop, upward airy sweep, then a small C-major bell bloom.
            cue(.32, .19, 420, 210, .16);
            cue(.38, .13, 740, 490, .055);
            cue(1.0, .48, 520, 1450, .052, 'triangle');
            cue(1.08, .43, 780, 1950, .022);
            [[0, 1046.5], [.085, 1318.5], [.17, 1568]].forEach(([offset, hz]) => {
                cue(1.78 + offset, .7, hz, hz * .999, .085);
                cue(1.78 + offset, .3, hz * 2.76, hz * 2.76, .012);
            });
        }).catch(() => { /* Audio is optional; a later user click can retry. */ });
        return stop;
    }
    return { play };
})();
