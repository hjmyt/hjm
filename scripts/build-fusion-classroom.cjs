'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const input = process.argv[2];
const output = process.argv[3] || path.join(__dirname, '..', 'js', 'data', 'fusion-classroom.js');
if (!input)
    throw new Error('Usage: node scripts/build-fusion-classroom.cjs <source-html> [output-js]');

const wrapper = fs.readFileSync(input, 'utf8');
const assignment = wrapper.match(/CHAPTERS\.quiz=("(?:\\.|[^"\\])*");/);
if (!assignment)
    throw new Error('Missing CHAPTERS.quiz in supplied fusion wrapper');
const html = JSON.parse(assignment[1]);
const dataBlock = html.match(/var INTRO=([\s\S]*?)\nvar WHO=/)?.[1];
if (!dataBlock)
    throw new Error('Missing Fusion classroom data arrays');

// Evaluate only the isolated literal declarations in a capability-free context,
// then validate their shapes before serialising them as project data.
const sandbox = Object.create(null);
vm.createContext(sandbox, { codeGeneration: { strings: false, wasm: false } });
vm.runInContext(`INTRO=${dataBlock}\nthis.payload={INTRO,CARDS,QS};`, sandbox, { timeout: 1000 });
const { INTRO, CARDS, QS } = sandbox.payload;
if (!Array.isArray(INTRO) || !INTRO.every(item => Array.isArray(item) && item.length === 2 && item.every(value => typeof value === 'string')))
    throw new Error('Invalid Fusion classroom intro data');
if (!Array.isArray(CARDS) || !CARDS.every(item => Array.isArray(item) && item.length === 2 && item.every(value => typeof value === 'string')))
    throw new Error('Invalid Fusion classroom lesson data');
if (!Array.isArray(QS) || !QS.every(item => typeof item?.q === 'string' && Array.isArray(item.o) && item.o.every(value => typeof value === 'string') && Number.isInteger(item.a) && typeof item.w === 'string'))
    throw new Error('Invalid Fusion classroom quiz data');

const correctPositions = [1, 0, 2, 2, 1, 0, 1, 2, 0, 2];
const payload = {
    intro: INTRO.map(([speaker, text]) => ({ speaker: speaker === 'sys' ? '旁白' : speaker === 'laodu' ? '老杜' : '垃垃', text })),
    lessons: CARDS.map(([title, text]) => ({ title, text })),
    questions: QS.map((item, index) => {
        const correct = item.o[item.a];
        const options = item.o.filter((_, optionIndex) => optionIndex !== item.a);
        const answer = correctPositions[index % correctPositions.length];
        options.splice(answer, 0, correct);
        return {
            title: item.q.split('｜')[0],
            prompt: item.q.split('｜').slice(1).join('｜'),
            options,
            answer,
            explanation: item.w
        };
    })
};
const source = `'use strict';\n\n// Generated from the supplied Fusion trilogy classroom extra. Rebuild with scripts/build-fusion-classroom.cjs.\nconst FUSION_CLASSROOM = ${JSON.stringify(payload, null, 2)};\n`;
fs.writeFileSync(output, source);
console.log(`Wrote ${output}: intro=${payload.intro.length}, lessons=${payload.lessons.length}, questions=${payload.questions.length}`);
