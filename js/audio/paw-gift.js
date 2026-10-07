'use strict';

// Short, original synthesized cues; the caller supplies its audio output and mute policy.
const PawGiftAudio = (() => {
    function play({ getAudio, enabled, reduced = false, preset = null }) {
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
            if (preset?.id === 'full') {
                cue(.25, .75, 98, 146.83, .13);
                cue(.65, .65, 196, 392, .07, 'triangle');
                cue(1.1, 1.45, 130.81, 523.25, .12, 'triangle');
                cue(1.25, 1.1, 392, 1568, .038);
                [523.25, 659.25, 783.99, 1046.5].forEach((hz, i) => cue(2.05 + i * .17, 1.15, hz, hz, .045));
                cue(3.4, .95, 523.25, 196, .05, 'triangle');
                cue(4.5, .65, 261.63, 1046.5, .065);
                [1046.5, 1318.5, 1568, 2093].forEach((hz, i) => {
                    cue(5.35 + i * .1, 1.15, hz, hz, .065);
                    cue(5.35 + i * .1, .45, hz * 2, hz * 2, .008);
                });
                return;
            }
            if (preset) {
                const notes = preset.notes;
                cue(.32, .25, notes[0] / 2, notes[0] / 2, .085, preset.wave);
                if (preset.id === 'drum') {
                    [.99, 1.14, 2.09, 2.24].forEach(t => cue(t, .18, 145, 52, .2));
                } else if (preset.id === 'strings' || preset.id === 'pick') {
                    [.68, .88, 1.08, 1.28].forEach((t, i) => cue(t, .24, notes[i % notes.length], notes[i % notes.length], .07, 'triangle'));
                } else if (preset.id === 'duck') {
                    cue(.6, .13, 610, 460, .08, 'triangle'); cue(.78, .12, 690, 510, .07, 'triangle');
                } else if (preset.id === 'racket') {
                    cue(.7, .23, 340, 1350, .045, 'triangle'); cue(1.08, .07, 880, 440, .1);
                } else if (preset.id === 'camera') {
                    cue(1.68, .05, 170, 85, .14, 'triangle');
                    cue(1.75, .055, 230, 115, .09, 'triangle');
                } else if (preset.id === 'beer') {
                    cue(1.78, .35, 2350, 2340, .07);
                } else if (preset.id === 'tea') {
                    [.65, .86, 1.04].forEach((t, i) => cue(t, .1, 340 + i * 100, 170 + i * 60, .07));
                } else if (preset.id === 'headphones') {
                    [.62, .97, 1.32].forEach(t => cue(t, .23, 130.81, 130.81, .095));
                } else {
                    cue(1.0, .5, notes[0] * .6, notes[1], .035, preset.wave);
                }
                notes.forEach((hz, i) => {
                    cue(1.78 + i * .095, .8, hz, hz * .999, .075, preset.wave);
                    cue(1.78 + i * .095, .3, hz * 2, hz * 2, .009);
                });
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
