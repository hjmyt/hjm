'use strict';

// Composition root: only controller state and cross-feature wiring live here.
const Chronicle = (() => {
    const { PEOPLE, PERSON_IDS, SCENES, ENDINGS, FLAG_KEYS, REWARD_IDS, STORY_VOICES, SHANQIU_DRINKS, KEY_BOND_CHOICES } = ChronicleData;
    'use strict';
    let raf = 0, lastFrame = 0, lastCheckpoint = 0, renderSignature = '', renderedRun = null, renderedScene = '', selectedInstrument = '弦乐', lastInput = -9999, weekNotice = null;
    const R = () => state.chronicle.run;
    const M = () => state.chronicle;
    const E = escapeHTML;
    const person = k => PEOPLE[k] || STORY_VOICES[k] || STORY_VOICES.narrator;
    const nInt = (x, def = 0, min = 0, max = 999999) => Number.isFinite(Number(x)) ? clamp(Math.floor(Number(x)), min, max) : def;
    const str = (v, max = 100) => typeof v === 'string' ? v.slice(0, max) : '';
    function log(text, warning = false) {
        const r = R();
        r.log.push({ chapter: r.chapter, week: r.week, text, warning });
        if (r.log.length > 70)
            r.log.shift();
    }
    function changed() {
        if (R().chapter === 4 && R().scene === 'c4_bao')
            R().flags.c4bao = 1;
        LalaUI.recap = false;
        const sceneChanged = renderedRun === R() && renderedScene !== R().scene;
        R().rev++;
        syncStoryCards(state, true);
        save();
        renderSignature = '';
        renderGlobal();
        if (sceneChanged && currentView === 'chronicle' && innerWidth <= 520)
            requestAnimationFrame(() => $('cpMain')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
    function go(scene) {
        if (!SCENES.includes(scene))
            return;
        R().scene = scene;
        changed();
    }
    function reward(id) {
        if (ENDINGS[id]) {
            const e = ENDINGS[id], key = 'chapter:' + R().chapter, first = !economy().claimed[key], gain = claimEconomy(key, 15);
            if (first)
                state.cards.tickets++;
            if (!M().claimed.includes(id))
                M().claimed.push(id);
            unlock(e.memory);
            log(`结局「${e.title}」已收录 · 音符 +${gain}${first ? ' · 邀请券 +1' : '（本章奖励已领取）'}。`);
            return first;
        }
        if (M().claimed.includes(id))
            return false;
        M().claimed.push(id);
        if (id === 'c5_entry' || id === 'c6_entry') {
            unlock(id === 'c5_entry' ? 'cp5_entry' : 'cp6_entry');
            log(chapterName() + '已启程，故事写入手记。');
        }
        else if (id === 'c4_entry') {
            unlock('cp4_entry');
            log('剧场之夜已启程，6.7 的排练计划写入手记。');
        }
        else if (id === 'c3_entry') {
            unlock('cp3_entry');
            log('星光530已启程，专场筹备写入手记。');
        }
        else if (id === 'c2_entry') {
            unlock('cp2_entry');
            log('第二章已启程：「山丘酒吧的灯」回忆已收藏。');
        }
        else if (id === 'c2_night') {
            unlock('cp2_night');
            log('哈基米之夜已记入相册。');
        }
        else if (id === 'c2_choice') {
            unlock('cp2_choice');
            log('空格去留的谈话已记入相册。');
        }
        else if (id === 'entry') {
            state.cards.tickets++;
            unlock('cp_entry');
            log('正传初遇奖励：卡册邀请券 +1；「推门而入」回忆已收藏。');
        }
        else if (id === 'audition') {
            claimEconomy('audition', 3);
            unlock('cp_audition');
            log('首次考核合格：音符 +3；考核回忆已收藏。');
        }
        return true;
    }
    function ending(id) {
        if (!ENDINGS[id] || R().ending)
            return;
        R().ending = id;
        R().ch = R().chapter + 1;
        M().completedChapters = [...new Set([...(M().completedChapters || []), R().chapter])];
        if (!M().endings.includes(id))
            M().endings.push(id);
        M().chapterEndings ??= {};
        M().chapterEndings[R().chapter] = [...new Set([...(M().chapterEndings[R().chapter] || []), id])];
        reward(id);
    }
    let choiceRewards = null;
    function affUp(k, v) {
        if (!PEOPLE[k] || v <= 0)
            return 0;
        const id = PEOPLE[k].card, amount = choiceRewards?.[id] ?? Math.min(2, v);
        const gained = grantBond(id, amount, { key: `plot:${R().chapter}:${R().scene}:${id}` });
        if (gained)
            log(`${person(k).name}的羁绊分 +${gained}。`);
        return gained;
    }
    function darkUp(k, v) {
        if (!['feihong', 'dijie'].includes(k))
            return;
        R().dark[k] = Math.max(0, R().dark[k] + v);
        log(`${person(k).name}的黑化值 ${v >= 0 ? '+' : ''}${v}。`, v > 0);
    }
    function checkEnding() {
        const r = R();
        if (r.ending)
            return false;
        if (r.chapter === 4 && r.flags.lemonDanger) {
            delete r.flags.lemonDanger;
            ending('c4_lemon');
            r.scene = 'be_mianbei';
            return true;
        }
        return false;
    }
    const choice = (text, next, effect = null) => ({ text, next, effect });
    const spoken = (who, text) => ({ who, text });
    const D = (who, text, ...choices) => { const parts = Array.isArray(text) ? text : [spoken(who, text)]; return { who: parts[0].who, text: parts.map(p => p.text).join('\n\n'), parts, choices }; };
    function dispatch(action, btn) {
        if (M().personal?.active && !action.startsWith('personal-') && !['switch-chapter','ending-chapter'].includes(action)) return;
        if (action === 'bar-continue') {
            if (R().scene !== 'shanqiu_closed')
                return;
            R().bar.closureSeen = true;
            unlock('shanqiu_closed');
            R().scene = 'zhu_offer';
            closeModal(false);
            changed();
            return;
        }
        if (action === 'cancel-restart') {
            closeModal();
            return;
        }
        if (action === 'confirm-restart') {
            restart();
            return;
        }
        const rev = btn?.dataset.cpRev;
        if (rev !== undefined && Number(rev) !== R().rev)
            return;
        if (action.startsWith('personal-')) return personalAction(action,btn);
        if (M().personal?.active && !['switch-chapter','ending-chapter'].includes(action)) return;
        if (action === 'ending-chapter') {
            const ch = Number(btn?.dataset.cpChapter);
            if (!chapterUnlocked(ch))
                return;
            closeModal(false);
            requestChapter(ch);
            route('chronicle');
            return;
        }
        if (action === 'switch-chapter')
            return requestChapter(Number(btn?.dataset.cpChapter));
        if (action === 'start-second')
            return startChapter(2, btn?.dataset.cpMode);
        if (action === 'start-fourth')
            return startChapter(4, btn?.dataset.cpMode);
        if (action === 'start-third')
            return startChapter(3, btn?.dataset.cpMode);
        if (action.startsWith('training-')) return trainingAction(action, btn);
        if (action === 'week-story') return startWeekStory();
        if (action === 'week-side') return startSide(btn?.dataset.cpEvent);
        if (action === 'event')
            return projectEvent(btn?.dataset.cpEvent);
        if (action === 'enroll')
            return enroll();
        if (action === 'help')
            return help();
        if (action === 'restart')
            return confirmRestart();
        if (action === 'gallery')
            return gallery();
        if (action === 'practice' || action === 'earn' || action === 'social' || action === 'ensemble')
            return weeklyAction(action);
        if (action === 'end-week')
            return endWeek();
        if (action === 'menu') {
            if (R().ending || R().legacyEnded)
                go('title' + (R().chapter + 1));
            else if (['chat_select', 'b_live', 'menu'].includes(R().scene))
                go('menu');
            return;
        }
        if (action === 'chat')
            return chat(btn.dataset.cpPerson);
        if (action === 'partner')
            return startPartner(btn.dataset.cpPerson);
        if (action === 'battle')
            return battleAction(btn.dataset.cpBattle);
        if (action === 'practice-continue') {
            if (R().scene !== 'practice_result' || !R().battle?.over)
                return;
            go(R().battle.context === 'weekly' ? 'menu' : 'after_practice');
            return;
        }
        if (action === 'to-live') {
            if (!R().ending && R().week >= 6)
                startWeekStory();
            return;
        }
        if (action === 'live-resume')
            return startLiveMotion();
        if (action === 'live-pause')
            return suspend();
        if (action === 'live-hit')
            return liveHit();
        if (action === 'live-next')
            return nextLive();
        if (action === 'chapter-finish') {
            if (R().scene === 'live_result')
                go('title' + (R().chapter + 1));
        }
    }
    // Chapter II: source-driven scenes. Anonymous labels keep the prior privacy edits.
    function isTwo() { return R().chapter === 2; }
    function isThree() { return R().chapter === 3; }
    function isFour() { return R().chapter === 4; }
    function endingKeys(ch = R().chapter) { return Object.keys(ENDINGS).filter(id => ENDINGS[id].chapter === ch || id === 'shadow' && ch <= 4); }
    function chapterName(ch = R().chapter) { return ch === 6 ? '第六章 · 开幕之夜' : ch === 5 ? '第五章 · 夏天的形状' : ch === 4 ? '第四章 · 剧场之夜' : ch === 3 ? '第三章 · 星光530' : ch === 2 ? '第二章 · 暗涌' : '第一章 · 入团试炼'; }
    function requiredTech(r = R()) { return r.chapter === 6 ? 20 : r.chapter === 5 ? 18 : r.chapter === 4 ? 15 : r.chapter >= 2 ? 14 : 12; }
    function stageName(r = R()) { return r.chapter === 6 ? '音乐剧《拾光》首演' : r.chapter === 5 ? '夏日音乐节' : r.chapter === 4 ? '6.7 剧场之夜' : r.chapter === 3 ? '530 陶喆专场' : r.chapter === 2 ? '独立路演' : '商场快闪'; }
    function liveDifficulty(r = R()) {
        if (r.chapter >= 5)
            return Math.min(50, (r.chapter === 6 ? 18 : 17) + r.week);
        return (r.chapter === 4 ? 15 - (r.flags.zhouSolo ? 2 : 0) - (r.flags.yangSolo ? 1 : 0) : r.chapter === 3 ? 14 + (r.flags.billWait ? 2 : 0) - (r.flags.taIn ? 2 : 0) : r.chapter === 2 ? 12 : 10) + r.week;
    }
    function mount() {
        mountTraining();
        document.addEventListener('click', event => {
            const b = event.target.closest('button');
            if (!b || b.disabled)
                return;
            const data = b.dataset;
            if (data.cpInstrument !== undefined) {
                selectedInstrument = data.cpInstrument;
                $$('[data-cp-instrument]').forEach(el => { el.classList.toggle('selected', el.dataset.cpInstrument === selectedInstrument); el.setAttribute('aria-pressed', String(el.dataset.cpInstrument === selectedInstrument)); });
                if (selectedInstrument === '键盘 / 其他')
                    $('cpInstrument')?.focus();
                return;
            }
            if (data.cpChoice === undefined && data.cpAction === undefined)
                return;
            if (data.cpRev !== undefined && Number(data.cpRev) !== R().rev)
                return;
            const now = performance.now();
            if (now - lastInput < 200)
                return;
            lastInput = now;
            if (data.cpChoice !== undefined)
                pick(Number(data.cpChoice));
            else
                dispatch(data.cpAction, b);
        });
        document.addEventListener('keydown', event => {
            if (!$('modalBackdrop').hidden || currentView !== 'chronicle' || event.repeat || event.ctrlKey || event.metaKey || event.altKey || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName))
                return;
            if (trainingKey(event)) return;
            if (R().scene === 'training' && event.code === 'Space') {event.preventDefault();trainingTap();return;}
            if (R().scene === 'live_play' && R().live?.phase === 'playing') {
                if (event.code === 'Space') {
                    event.preventDefault();
                    liveHit();
                }
                if (event.key === 'Escape') {
                    event.preventDefault();
                    suspend();
                }
            }
        });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden)
                suspend();
        });
        window.addEventListener('blur', () => suspend());
        window.addEventListener('pagehide', () => suspend());
    }
    function suspend() {suspendTraining();suspendPerformance();}
    const context = {
        get cleanTraining() { return cleanTraining; },
        get trainingHTML() { return trainingHTML; },
        get trainingHubHTML() { return trainingHubHTML; },
        get pendingStory() { return pendingStory; },
        get freshWeeks() { return freshWeeks; },
        get cleanWeeks() { return cleanWeeks; },
        get weekPlan() { return weekPlan; },
        get storyTransition() { return storyTransition; },
        get enterWeekStory() { return enterWeekStory; },
        get startWeekStory() { return startWeekStory; },
        get sideEvents() { return sideEvents; },
        get startSide() { return startSide; },
        get weeklyDialogue() { return weeklyDialogue; },
        get weekStoryHTML() { return weekStoryHTML; },
        get sideStoriesHTML() { return sideStoriesHTML; },
        get illustrationHTML() { return illustrationHTML; },
        get weeklyHelp() { return weeklyHelp; },

        get D() { return D; },
        get E() { return E; },
        get ENDINGS() { return ENDINGS; },
        get FLAG_KEYS() { return FLAG_KEYS; },
        get KEY_BOND_CHOICES() { return KEY_BOND_CHOICES; },
        get M() { return M; },
        get PEOPLE() { return PEOPLE; },
        get PERSON_IDS() { return PERSON_IDS; },
        get R() { return R; },
        get REWARD_IDS() { return REWARD_IDS; },
        get SCENES() { return SCENES; },
        get SHANQIU_DRINKS() { return SHANQIU_DRINKS; },
        get STORY_VOICES() { return STORY_VOICES; },
        get actionButton() { return actionButton; },
        get affUp() { return affUp; },
        get barDialogue() { return barDialogue; },
        get barMenuHTML() { return barMenuHTML; },
        get beginBarChapter() { return beginBarChapter; },
        get canChat() { return canChat; },
        get changed() { return changed; },
        get chapterEndingIds() { return chapterEndingIds; },
        get chapterFourDialogue() { return chapterFourDialogue; },
        get chapterName() { return chapterName; },
        get chapterThreeDialogue() { return chapterThreeDialogue; },
        get chapterTwoDialogue() { return chapterTwoDialogue; },
        get chapterTwoHelp() { return chapterTwoHelp; },
        get chapterComplete() { return chapterComplete; },
        get freshPersonal() { return freshPersonal; },
        get cleanPersonal() { return cleanPersonal; },
        get personalHTML() { return personalHTML; },
        get personalPreview() { return personalPreview; },
        get chapterUnlocked() { return chapterUnlocked; },
        get checkEnding() { return checkEnding; },
        get choice() { return choice; },
        get choiceRewards() { return choiceRewards; }, set choiceRewards(value) { choiceRewards = value; },
        get closedBarHTML() { return closedBarHTML; },
        get collectedEndingIds() { return collectedEndingIds; },
        get darkUp() { return darkUp; },
        get dialogue() { return dialogue; },
        get ending() { return ending; },
        get endingKeys() { return endingKeys; },
        get endingType() { return endingType; },
        get eventBoard() { return eventBoard; },
        get extraPracticeChoice() { return extraPracticeChoice; },
        get fourthHelp() { return fourthHelp; },
        get fourthTitleHTML() { return fourthTitleHTML; },
        get freshRun() { return freshRun; },
        get go() { return go; },
        get initLive() { return initLive; },
        get initPractice() { return initPractice; },
        get isFour() { return isFour; },
        get isThree() { return isThree; },
        get isTwo() { return isTwo; },
        get lastCheckpoint() { return lastCheckpoint; }, set lastCheckpoint(value) { lastCheckpoint = value; },
        get lastFrame() { return lastFrame; }, set lastFrame(value) { lastFrame = value; },
        get lateChapterDialogue() { return lateChapterDialogue; },
        get lateMilestones() { return lateMilestones; },
        get lateRulesHTML() { return lateRulesHTML; },
        get lateTitleHTML() { return lateTitleHTML; },
        get liveDifficulty() { return liveDifficulty; },
        get liveHTML() { return liveHTML; },
        get log() { return log; },
        get nInt() { return nInt; },
        get normalizeFourthOpening() { return normalizeFourthOpening; },
        get person() { return person; },
        get plotNotes() { return plotNotes; },
        get plotTech() { return plotTech; },
        get priorHeCount() { return priorHeCount; },
        get raf() { return raf; }, set raf(value) { raf = value; },
        get recordReadScene() { return recordReadScene; },
        get refresh() { return refresh; },
        get renderSignature() { return renderSignature; }, set renderSignature(value) { renderSignature = value; },
        get renderedRun() { return renderedRun; }, set renderedRun(value) { renderedRun = value; },
        get renderedScene() { return renderedScene; }, set renderedScene(value) { renderedScene = value; },
        get requiredTech() { return requiredTech; },
        get reward() { return reward; },
        get savedChapter() { return savedChapter; },
        get secondProgress() { return secondProgress; },
        get secondResultHTML() { return secondResultHTML; },
        get secondTitleHTML() { return secondTitleHTML; },
        get selectedInstrument() { return selectedInstrument; }, set selectedInstrument(value) { selectedInstrument = value; },
        get showBarClosure() { return showBarClosure; },
        get speaker() { return speaker; },
        get spoken() { return spoken; },
        get stageName() { return stageName; },
        get str() { return str; },
        get supplementalDialogue() { return supplementalDialogue; },
        get suspend() { return suspend; },
        get thirdHelp() { return thirdHelp; },
        get thirdTitleHTML() { return thirdTitleHTML; },
        get weekNotice() { return weekNotice; }, set weekNotice(value) { weekNotice = value; }
    };
    const { freshPersonal, cleanPersonal, personalAction, personalHTML, personalPreview } = createChroniclePersonal(context);
    const { cleanTraining, startTraining, trainingAction, trainingTap, trainingHTML, trainingHubHTML, suspendTraining, trainingKey, mountTraining } = createChronicleTraining(context);
    const { freshWeeks, cleanWeeks, weekPlan, pendingStory, storyTransition, enterWeekStory, startWeekStory, sideEvents, startSide, weeklyDialogue, weekStoryHTML, sideStoriesHTML, illustrationHTML, weeklyHelp } = createChronicleWeeks(context);
    const { savedChapter, shouldCloseBar, normalizeFourthOpening, beginBarChapter, barDialogue, orderDrink, barMenuHTML, closedBarHTML, showBarClosure } = createChronicleBar(context);
    const { freshRun, fresh, isRetiredRun, isRetiredLog, cleanSingle, syncBonds, confirmRestart, restart, sourceSaveDetected, legacy, requestLegacy, safeSnapshot, clean, chapterComplete, chapterUnlocked, repairChapterCarry, previousChapter, playerIdentity, canCarryChapter, quickRun, requestChapter, startChapter } = createChroniclePersistence(context);
    const { speaker, dialogueHTML, actionButton, choicesHTML, startHTML, weekAdvanceHTML, weeklyHTML, socialHTML, partnerHTML, practiceHTML, liveResultHTML, titleHTML, mainHTML, phaseText, hudHTML, sidebarHTML, journalHTML, render, refresh, endingType, collectedEndingIds, chapterEndingIds, endingBadges, endingOverviewHTML, endingGalleryChapter, gallery, help, chapterTabs } = createChronicleViews(context);
    const { paidPractice, extraPracticeChoice, plotTech, plotNotes, pick, enroll, weeklyAction, endWeek, canChat, chat, initPractice, startPartner, battleAction } = createChronicleActivities(context);
    const { journalSpeaker, sceneEncounterIds, legacyEncounterIds, encounterIds, recordReadScene } = createChronicleEncounters(context);
    const { dialogue } = createChronicleChaptersOne(context);
    const { initLive, liveHTML, startLiveMotion, tick, suspend: suspendPerformance, liveHit, nextLive, finishLive } = createChroniclePerformance(context);
    const { priorHeCount, lateMilestones, lateRulesHTML, lateChapterDialogue, lateTitleHTML } = createChronicleChaptersFiveSix(context);
    const { projectEvent, resolveEvent, chapterTwoDialogue, secondProgress, eventBoard, secondOutcomeText, secondResultHTML, secondTitleHTML, chapterTwoHelp } = createChronicleChaptersTwo(context);
    const { supplementalDialogue, chapterThreeDialogue, thirdTitleHTML, thirdHelp } = createChronicleChaptersThree(context);
    const { chapterFourDialogue, fourthTitleHTML, fourthHelp } = createChronicleChaptersFour(context);
    return { fresh, clean, syncBonds, refresh, mount, suspend, sourceSaveDetected, requestLegacy, encounterIds, journalSpeaker, priorHeCount, requiredTech };
})();
