'use strict';

const ScoreAuditionRules = (() => {
    const scores = SCORE_AUDITION_DATA.scores;
    const visibleScores = scores.filter(candidate => candidate.hidden !== true);
    const score = visibleScores[0] || SCORE_AUDITION_DATA.score;
    const tempoRange = Object.freeze({ min: 40, max: 200 });
    const scoreById = scoreId => scores.find(candidate => candidate.id === scoreId) || null;
    const modeSpec = (mode, selectedScore = score) => selectedScore?.modes?.[mode] || null;
    const validTempo = tempo => Number.isInteger(tempo) && tempo >= tempoRange.min && tempo <= tempoRange.max;
    const phrase = (mode, tempo = null, scoreId = score.id) => {
        const selectedScore = scoreById(scoreId), selectedTempo = tempo === null ? Math.round(selectedScore?.tempo || 0) : tempo, spec = modeSpec(mode, selectedScore);
        return spec && validTempo(selectedTempo) ? { ...selectedScore, tempo: selectedTempo, mode, modeSpec: spec } : null;
    };
    const tieContinues = item => item.tie === 'stop' || item.tie === 'stop-start';
    function leadingSilentMeasures(data) {
        let count = 0;
        for (const measure of data.measures) {
            if (measure.items.some(item => !item.rest)) break;
            count++;
        }
        return count;
    }
    function playablePhrase(data, skipLeadingRests = false) {
        if (!skipLeadingRests) return data;
        const skippedLeadingMeasures = leadingSilentMeasures(data);
        return skippedLeadingMeasures ? { ...data, measures: data.measures.slice(skippedLeadingMeasures), skippedLeadingMeasures } : data;
    }
    function measureStarts(data) {
        const starts = [];
        let beat = 0;
        data.measures.forEach(measure => { starts.push(beat); beat += measure.beats; });
        return { starts, totalBeats: beat };
    }
    function targetEvents(data) {
        const result = [], { starts } = measureStarts(data);
        data.measures.forEach((measure, measureIndex) => measure.items.forEach(item => {
            if (!item.rest && !tieContinues(item)) result.push({ pitch: item.pitch, beat: starts[measureIndex] + item.at, measure: measureIndex });
        }));
        return result.filter((event,index)=>result.findIndex(other=>other.beat===event.beat)===index);
    }
    function soundingEvents(data) {
        const result = [], active = new Map(), { starts } = measureStarts(data);
        data.measures.forEach((measure, measureIndex) => measure.items.forEach(item => {
            if (item.rest) return;
            const beat = starts[measureIndex] + item.at;
            if (tieContinues(item)) {
                const previous = active.get(item.pitch);
                if (previous) previous.duration += item.duration;
                if (item.tie === 'stop') active.delete(item.pitch);
                return;
            }
            const event = { pitch: item.pitch, beat, duration: item.duration, measure: measureIndex, tied: item.tie === 'start' };
            result.push(event);
            if (item.tie === 'start') active.set(item.pitch, event);
        }));
        return result;
    }
    function timing(data) {
        const beatSeconds = 60 / data.tempo, { totalBeats } = measureStarts(data);
        const [meterBeats, meterUnit] = String(data.meter || '').split('/').map(Number);
        const countInBeats = Number.isInteger(meterBeats) && meterBeats > 0 ? meterBeats : Math.max(1, Math.round(data.measures[0]?.beats || 4));
        const countInBeatSeconds = beatSeconds * (Number.isInteger(meterUnit) && meterUnit > 0 ? 4 / meterUnit : 1);
        return { beatSeconds, countInBeats, countInBeatSeconds, countInSeconds: countInBeats * countInBeatSeconds, phraseBeats: totalBeats, phraseSeconds: totalBeats * beatSeconds };
    }
    function metronomeBeats(data) {
        const { starts } = measureStarts(data), beats = [];
        data.measures.forEach((measure, measureIndex) => {
            for (let localBeat = 0; localBeat < measure.beats; localBeat++) beats.push({ beat: starts[measureIndex] + localBeat, accent: localBeat === 0, measure: measureIndex });
        });
        return beats;
    }
    function measureAtBeat(data, beat) {
        const { starts } = measureStarts(data);
        for (let index = starts.length - 1; index >= 0; index--) if (beat >= starts[index]) return index;
        return 0;
    }
    function holdTargets(data) {
        const { beatSeconds } = timing(data);
        // One physical space-key attack plays every pitch of a simultaneous chord.
        const attacks=new Map();
        for(const event of soundingEvents(data)){
            const previous=attacks.get(event.beat);
            if(previous){previous.duration=Math.max(previous.duration,event.duration);previous.tied=previous.tied||event.tied;}
            else attacks.set(event.beat,{...event});
        }
        return [...attacks.values()].map((event, index) => ({ ...event, index, start: event.beat * beatSeconds, end: (event.beat + event.duration) * beatSeconds, beats: event.duration, required: event.tied || event.duration > 1 + 1e-7 }));
    }
    function holdReleaseWindow(event, tapStart = event.start) {
        const seconds = event.end - event.start, beatSeconds = seconds / event.beats;
        const earlyReleaseTolerance = Math.min(beatSeconds * .5, seconds * .35), lateReleaseTolerance = Math.min(.3, beatSeconds * .4, seconds * .35), minimumHeldSeconds = seconds - earlyReleaseTolerance;
        return { earlyReleaseTolerance, lateReleaseTolerance, minimumHeldSeconds, earliestEnd: Math.max(event.end - earlyReleaseTolerance, tapStart + minimumHeldSeconds), latestEnd: event.end + lateReleaseTolerance };
    }
    function analyze(data, taps = [], holds = []) {
        const spec = modeSpec(data.mode, data);
        if (!spec || !validTempo(data.tempo)) return null;
        const clock = timing(data), maxTime = clock.phraseSeconds + 2;
        if (!Array.isArray(taps) || taps.length > 1024 || !taps.every(value => Number.isFinite(value) && value >= -.5 && value <= maxTime)) return null;
        if (!Array.isArray(holds) || holds.length > taps.length || new Set(holds.map(hold => hold?.tapIndex)).size !== holds.length || !holds.every(hold => hold && Number.isInteger(hold.tapIndex) && hold.tapIndex >= 0 && hold.tapIndex < taps.length && Number.isFinite(hold.end) && hold.end >= taps[hold.tapIndex] && hold.end <= maxTime && (hold.cancelled === undefined || typeof hold.cancelled === 'boolean'))) return null;
        const { beatSeconds } = clock, { starts } = measureStarts(data), performanceTargets = holdTargets(data), targets = performanceTargets.map(event => ({ ...event, time: event.start }));
        const used = new Set(), matches = targets.map(target => {
            let tapIndex = -1, error = Infinity;
            taps.forEach((tap, index) => {
                const distance = Math.abs(tap - target.time);
                if (!used.has(index) && distance < error) { tapIndex = index; error = distance; }
            });
            if (tapIndex >= 0 && error <= spec.tolerance) used.add(tapIndex); else tapIndex = -1;
            return { ...target, tapIndex, error };
        });
        const measures = data.measures.map((measure, measureIndex) => {
            const local = matches.filter(match => match.measure === measureIndex), matched = local.filter(match => match.tapIndex >= 0);
            const start = starts[measureIndex] * beatSeconds, end = (starts[measureIndex] + measure.beats) * beatSeconds;
            const extras = taps.filter((tap, index) => !used.has(index) && tap >= start - spec.tolerance && tap < end - spec.tolerance).length;
            const averageError = matched.length ? matched.reduce((sum, match) => sum + match.error, 0) / matched.length : Infinity;
            const accuracy = local.length ? matched.length / local.length : 1;
            const requiredHolds = local.filter(match => match.required), holdErrors = requiredHolds.filter(match => {
                if (match.tapIndex < 0) return true;
                const release = holds.find(hold => hold.tapIndex === match.tapIndex), window = holdReleaseWindow(match, taps[match.tapIndex]);
                return !release || release.cancelled || release.end < window.earliestEnd - 1e-7 || release.end > window.latestEnd + 1e-7;
            }).length;
            const passed = local.length === 0 ? extras === 0 : accuracy >= spec.measureAccuracy && extras <= (data.mode === 'hard' ? 0 : 1) && averageError <= spec.tolerance * .82 && holdErrors === 0;
            return { number: measure.number, targets: local.length, matched: matched.length, extras, averageError, requiredHolds: requiredHolds.length, holdErrors, passed };
        });
        const sections = Array.from({ length: 4 }, (_, index) => {
            const start = Math.floor(index * measures.length / 4), end = Math.floor((index + 1) * measures.length / 4);
            const slice = measures.slice(start, end), passedMeasures = slice.filter(measure => measure.passed).length;
            return { index: index + 1, startMeasure: data.measures[start]?.number ?? start + 1, endMeasure: data.measures[end - 1]?.number ?? end, passedMeasures, totalMeasures: slice.length, passed: passedMeasures / slice.length >= spec.sectionAccuracy };
        });
        return { targets, matches, measures, sections, score: sections.filter(section => section.passed).length, maxScore: 4, extras: taps.length - used.size, requiredHolds: performanceTargets.filter(event => event.required).length };
    }
    function validResult(mode, scoreId, taps, holds, claimedScore, tempo = null, skipLeadingRests = false) {
        const source = phrase(mode, tempo, scoreId), data = source && playablePhrase(source, skipLeadingRests === true);
        if (!data || !Number.isInteger(claimedScore)) return false;
        const analysis = analyze(data, taps, holds);
        return !!analysis && claimedScore === analysis.score;
    }
    return Object.freeze({ scores, visibleScores, score, scoreById, tempoRange, validTempo, modeSpec, phrase, leadingSilentMeasures, playablePhrase, measureStarts, measureAtBeat, metronomeBeats, targetEvents, soundingEvents, holdTargets, holdReleaseWindow, timing, analyze, validResult });
})();
