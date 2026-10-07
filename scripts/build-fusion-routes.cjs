'use strict';

const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const input = argv[0];
const output = argv[1] && argv[1] !== '--rl' ? argv[1] : path.join(__dirname, '..', 'js', 'data', 'fusion-routes.js');
const rlIndex = argv.indexOf('--rl');
const rlOverride = rlIndex >= 0 ? argv[rlIndex + 1] : null;
if (!input)
    throw new Error('Usage: node scripts/build-fusion-routes.cjs <source-html> [output-js] [--rl <standalone-entry-html>]');

const wrapper = fs.readFileSync(input, 'utf8');
const chapters = {};
const assignment = /CHAPTERS\.([a-z0-9]+)=("(?:\\.|[^"\\])*");/g;
let match;

function parseChoice(raw) {
    let text = raw.replace(/^-\s*/, '').trim();
    const choice = { text: '', score: 0, flags: [], next: null };
    // Compile control directives even when the authored choice wraps them inside
    // another pair of parentheses.  Legacy per-character “好感” annotations are
    // presentation notes only; the game uses the shared global bond system.
    text = text.replace(/（记住([^（）]+)）/g, (_, flag) => {
        choice.flags.push(flag.trim());
        return '';
    });
    text = text.replace(/（去([^（）]+)）/g, (_, target) => {
        choice.next = target.trim();
        return '';
    });
    text = text.replace(/（(?:大旗|羁绊|哈基米)([+-])(\d+)）/g, (_, sign, amount) => {
        choice.score += (sign === '-' ? -1 : 1) * Number(amount);
        return '';
    });
    text = text.replace(/（(?:[^（）]{1,16}好感)([+-])(\d+)）/g, '');
    while (true) {
        const directive = text.match(/（([^（）]*)）\s*$/);
        if (!directive)
            break;
        const value = directive[1].trim();
        const score = value.match(/^(?:大旗|羁绊|哈基米)([+-])(\d+)$/);
        if (score)
            choice.score += (score[1] === '-' ? -1 : 1) * Number(score[2]);
        else if (value.startsWith('记住'))
            choice.flags.push(value.slice(2));
        else if (value.startsWith('去'))
            choice.next = value.slice(1).trim();
        else
            break;
        text = text.slice(0, directive.index).trim();
    }
    // Some authored branches contain directives only.  Keep the action usable
    // after directives are compiled instead of rendering an empty button.
    choice.text = text || '（继续）';
    return choice;
}

function isAuthorNote(text) {
    return [
        /^（本线前置：/,
        /^（如果你刚才加了她微信/,
        /^（玩到这里，游戏正式进入/,
        /^（再选一次「别打扰她」/,
        /^（演出成功率\s*[+＋]/,
        /^（后宫支线预留：/
    ].some(pattern => pattern.test(text));
}

function parseScript(script) {
    const blocks = [];
    let current = [];
    const raw = script.split('\n');
    for (let i = 0; i < raw.length; i++) {
        const line = raw[i];
        if (!line.trim()) {
            const next = raw.slice(i + 1).find(item => item.trim())?.trim();
            if (next?.startsWith('【')) {
                blocks.push(current.join('\n'));
                current = [];
            }
            else
                current.push(line);
        }
        else
            current.push(line);
    }
    blocks.push(current.join('\n'));
    return blocks.map(block => {
        const lines = block.trim().split('\n');
        const heading = lines[0]?.match(/^【(.+?)】/);
        if (!heading)
            return null;
        const parts = heading[1].split('｜').map(part => part.trim());
        const node = { id: parts[0], title: parts.slice(1).filter(part => !part.includes('副场景')).join(' · '), sub: parts.some(part => part.includes('副场景')), lines: [], choices: [] };
        let choices = false;
        for (const source of lines.slice(1)) {
            const line = source.trim();
            if (!line)
                continue;
            if (line === '选项：') {
                choices = true;
                continue;
            }
            if (choices && line.startsWith('-'))
                node.choices.push(parseChoice(line));
            else {
                const dialogue = line.match(/^(.+?)：([\s\S]*)$/);
                const storyLine = dialogue ? { who: dialogue[1], text: dialogue[2] } : { who: '旁白', text: line };
                if (!isAuthorNote(storyLine.text))
                    node.lines.push(storyLine);
            }
        }
        return node;
    }).filter(Boolean);
}

function scriptFromHtml(html, label) {
    const script = html.match(/<textarea id="script"[^>]*>([\s\S]*?)<\/textarea>/)?.[1];
    if (!script)
        throw new Error(`Missing script textarea for ${label}`);
    // V16 contains one accidental narrator prefix before the f2_bsstop heading.
    // Recover the intended node without changing its authored dialogue.
    return script.replace(/\n旁白：（【([^\n]+)】/g, '\n\n【$1】');
}

while ((match = assignment.exec(wrapper))) {
    const key = match[1];
    const html = JSON.parse(match[2]);
    chapters[key] = parseScript(scriptFromHtml(html, key));
    const seen = new Map();
    for (const node of chapters[key]) {
        const count = seen.get(node.id) || 0;
        seen.set(node.id, count + 1);
        if (count)
            node.id += `_chat${count}`;
    }
}


if (rlOverride) {
    chapters.rl = parseScript(scriptFromHtml(fs.readFileSync(rlOverride, 'utf8'), rlOverride));
}

for (const key of ['rl', 'ep2', 'fm'])
    if (!chapters[key]?.length)
        throw new Error(`Missing chapter ${key}`);

const payload = `'use strict';\n\n// Generated from the supplied “融合线-完整三部曲.html”. Rebuild with scripts/build-fusion-routes.cjs.\nconst FUSION_ROUTES = ${JSON.stringify(chapters, null, 2)};\n`;
fs.writeFileSync(output, payload);
console.log(`Wrote ${output}: ${Object.entries(chapters).map(([key, nodes]) => `${key}=${nodes.length}`).join(', ')}`);
