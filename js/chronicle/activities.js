'use strict';

// Private Chronicle feature. ctx contains live accessors to sibling features and controller state.
function createChronicleActivities(ctx) {
    function paidPractice() {
        if (state.coins < ECONOMY_RULES.practice) {
            toast('练琴需要 10 音符，可以先免费演奏。');
            return false;
        }
        state.coins -= ECONOMY_RULES.practice;
        ctx.R().tech += 2;
        ctx.log('练琴：音符 −10，琴技 +2。');
        return true;
    }
    function extraPracticeChoice() {
        return { ...ctx.choice('加练一周 · 10 音符 / 琴技 +2 / 周数 +1', 'b_live', () => {
                if (paidPractice())
                    ctx.R().week = Math.min(999, ctx.R().week + 1);
            }), disabled: state.coins < ECONOMY_RULES.practice };
    }
    function plotTech(amount) {
        const r = ctx.R(), key = `tech:${r.chapter}:${r.scene}`;
        if (economy().claimed[key])
            return;
        economy().claimed[key] = true;
        r.tech += amount;
        ctx.log(`首次剧情练习：琴技 +${amount}；重玩不重复。`);
    }
    function plotNotes(amount) { const r = ctx.R(), gain = claimEconomy(`plot:${r.chapter}:${r.scene}`, amount); ctx.log(gain ? `首次赞助：音符 +${gain}。` : '这份赞助已领取，重玩不重复。'); }
    function pick(index) {
        if (ctx.M().personal?.active) return;
        const d = ctx.dialogue(), c = d?.choices?.[index];
        if (!c || c.disabled)
            return;
        ctx.recordReadScene(c.text);
        ctx.choiceRewards = ctx.KEY_BOND_CHOICES[ctx.R().scene + ':' + index] || null;
        try {
            if (c.effect)
                c.effect();
            for (const [id, n] of Object.entries(ctx.choiceRewards || {}))
                ctx.affUp(id === 'tang' ? 'tangshao' : id, n);
        }
        finally {
            ctx.choiceRewards = null;
        }
        markDaily('story');
        if (!ctx.checkEnding()) {
            if (c.next === 's_first')
                ctx.reward('entry');
            if (ctx.R().chapter === 1 && ctx.R().scene === 's_shi' && !ctx.R().bar.order) {
                ctx.R().bar.returnTo = c.next;
                ctx.R().scene = 'zhu_offer';
            }
            else
                ctx.storyTransition(c.next);
        }
        ctx.changed();
    }
    function enroll() {
        const name = $('cpName')?.value.trim(), custom = $('cpInstrument')?.value.trim();
        if (!name) {
            $('cpInputError').textContent = '先写下一个名字，再推门进去吧。';
            $('cpName').focus();
            return;
        }
        if (ctx.selectedInstrument === '键盘 / 其他' && !custom) {
            $('cpInputError').textContent = '写下具体的乐器，例如钢琴或吉他。';
            $('cpInstrument').focus();
            return;
        }
        ctx.R().name = name.slice(0, 10);
        ctx.R().inst = (custom || ctx.selectedInstrument).slice(0, 20);
        ctx.log(`${ctx.R().name}带着${ctx.R().inst}，推开了排练室的门。`);
        ctx.go('s_door');
    }
    function weeklyAction(kind) {
        const r = ctx.R();
        if (r.scene !== 'menu' || r.ending)
            return;
        if (kind === 'practice') {
            if (!paidPractice())
                return;
        }
        else if (kind === 'earn') {
            route('rhythm');
            return;
        }
        else if (kind === 'social')
            r.scene = 'chat_select';
        else if (kind === 'ensemble') {
            initPractice('weekly');
            r.scene = 'practice_partner';
            ctx.log('参加阶段验收；验收不加琴技，训练项目可提高琴技。');
        }
        ctx.changed();
    }
    function endWeek() {
        const r = ctx.R();
        if (r.scene !== 'menu' || r.ending || r.week >= 6 || ctx.pendingStory(r))
            return;
        const previousWeek = r.week;
        r.week++;
        ctx.weekNotice = { run: r, from: previousWeek, to: r.week };
        ctx.log(`第 ${r.week} 周开始了。`);
        if (ctx.isThree() || ctx.isFour()) {
            const count = ['azhe', 'dijie', 'feihong', 'tangshao', 'tim'].filter(k => r.aff[k] > 10).length;
            if (count >= 3 && !r.flags.qiJealous) {
                r.flags.qiJealous = 1;
                r.scene = ctx.isFour() ? 'c4_jeal' : 'c3_jeal';
                ctx.changed();
                requestAnimationFrame(() => $('cpMain')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
                toast(`已进入第 ${r.week} 周 · 有新的剧情发生。`, true);
                return;
            }
        }
        r.scene = 'menu';
        ctx.enterWeekStory();
        ctx.changed();
        requestAnimationFrame(() => $('cpMain')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        toast(r.week >= 6 ? `已进入第 ${r.week} 周 · ${ctx.stageName()}剧情开启。` : `第 ${r.week} 周 · ${ctx.weekPlan().title}已开放。`, true);
    }
    function canChat(k) {
        if (k === 'huangyx')
            return ctx.R().chapter >= 5 && cardOwned(k);
        if (k === 'zhu')
            return cardOwned('zhu');
        if (!ctx.PEOPLE[k] || k === 'kongge' || k === 'feihong' && ctx.R().level < 2)
            return false;
        if (ctx.isFour()) {
            if (['goose', 'bill'].includes(k))
                return false;
            if (k === 'baoshi' && !ctx.R().flags.c4bao)
                return false;
            if (['yeshiyang', 'xiaota', 'dayang', 'xiaozhou', 'lemon'].includes(k) && ctx.R().level < 3)
                return false;
        }
        return (!['qiqi', 'lemon', 'xiaozhou', 'goose', 'xiaota', 'bill', 'dayang', 'baoshi'].includes(k) || cardOwned(k)) && (ctx.R().chapter < 3 || k !== 'yeshiyang' || ctx.R().level >= 3);
    }
    function chat(k) {
        if (ctx.R().scene !== 'chat_select' || !canChat(k))
            return;
        ctx.R().chat = k;
        const gain = grantBond(ctx.PEOPLE[k].card, 1, { daily: true });
        ctx.log(`${ctx.person(k).name}的羁绊分 +${gain}${gain ? '' : '（今日陪伴奖励已领取）'}。`);
        ctx.R().scene = 'chat';
        ctx.checkEnding();
        markDaily('story');
        ctx.changed();
    }
    function initPractice(context = 'intro') {
        ctx.R().battle = { context, hp: 10 + ctx.R().tech, maxHp: 10 + ctx.R().tech, pressure: 14, round: 1, partner: null, over: false, win: false, last: '' };
    }
    function startPartner(k) {
        const duo=k==='baoshi_feihong'&&ctx.R().flags.feiSide&&(cardOwned('baoshi')||ctx.R().flags.c4bao);
        if (ctx.R().scene !== 'practice_partner' || !(['shiyuan', 'azhe', 'dijie', 'feihong', 'tim', 'yeshiyang', 'lala'].includes(k)||duo))
            return;
        if (!ctx.R().battle)
            initPractice('intro');
        ctx.R().battle.partner = k;
        ctx.R().scene = 'practice_turn';
        ctx.changed();
    }
    function battleAction(type) {
        const r = ctx.R(), b = r.battle;
        if (r.scene !== 'practice_turn' || !b || b.over || !b.partner)
            return;
        let me = 0, msg = '';
        if (type === 'stable') {
            me = 3 + Math.floor(Math.random() * 3);
            msg = '稳稳的一小节。';
        }
        else if (type === 'risk') {
            me = Math.random() < .5 ? 8 + Math.floor(Math.random() * 4) : 1;
            msg = me > 5 ? '状态爆棚，首席都挑了挑眉！' : '手感冰凉，拉呲了一个音……';
        }
        else if (type === 'duet') {
            const aff = b.partner==='baoshi_feihong'?Math.min(cardBond('baoshi'),cardBond('feihong')):(r.aff[b.partner] || 0);
            me = aff < 3 ? 2 : 6 + aff + Math.floor(Math.random() * 3);
            msg = aff < 3 ? '默契还不够，合奏有点散。' : (b.partner==='baoshi_feihong'?'宝石主唱、飞鸿和声，三个声部稳稳合在一起':ctx.person(b.partner).name+'与你严丝合缝，首席空格的笔停了。');
        }
        else
            return;
        const foe = 2 + Math.floor(Math.random() * 4);
        b.pressure = Math.max(0, b.pressure - me);
        b.hp = Math.max(0, b.hp - foe);
        b.last = `${msg}（我方 −${foe}，对面压力 −${me}）`;
        b.round++;
        ctx.log(b.last);
        if (b.hp <= 0 || b.pressure <= 0) {
            b.over = true;
            b.win = b.hp > 0 && b.pressure <= 0;
            r.scene = 'practice_result';
            if (b.win) {
                r.flags.practiceWin = 1;
                if(b.partner==='baoshi_feihong')r.flags.baoFeiPractice=1;
                r.level++;
                const gain = claimEconomy('battle', 3, { daily: true });
                ctx.reward('audition');
                ctx.log(`考核合格：音符 +${gain}（每日首次 +3），乐团提升到 Lv.${r.level}；考核不增加琴技。`);
            }
            else {
                r.flags.practiceFail = 1;
                ctx.log('这次考核没通过。回去再练一练，下次继续。');
            }
            markDaily('story');
        }
        ctx.changed();
    }
    return { paidPractice, extraPracticeChoice, plotTech, plotNotes, pick, enroll, weeklyAction, endWeek, canChat, chat, initPractice, startPartner, battleAction };
}
