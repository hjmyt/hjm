'use strict';

// Registered once, after state and all feature definitions are ready.
function bindAppEvents() {
    document.addEventListener('click', e => {
        const b = e.target.closest('[data-zhu-reveal]');
        if (!b || b.disabled || !hiddenSkillReady('zhu') || state.cards.zhuNight)
            return;
        state.cards.zhuNight = true;
        CardUI.zhuOpened = true;
        unlock('zhu_night');
        save();
        renderGlobal();
        toast('深夜吧台已解锁 · 调酒 96', true);
    });
    document.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b || b.disabled)
            return;
        const d = b.dataset;
        if (d.lemonTarget)
            return resolveLemonChallenge(d.lemonTarget, d.lemonResponse);
        if (d.sourceAction === 'lemon-ending')
            return showLemonEnding();
        if (d.sourceAction === 'cloud') {
            sourceCast().dayang.online = !sourceCast().dayang.online;
            if (state.cards.prepared?.id === 'dayang')
                state.cards.prepared = null;
            save();
            renderGlobal();
        }
        if (d.sourceAction === 'baoshi-memory' && hiddenSkillReady('baoshi')) {
            unlock('baoshi_secret');
            save();
            showMemory('baoshi_secret');
        }
    });
    document.addEventListener('click', e => {
        if (e.target.closest('[data-qiqi-party]'))
            hostQiqiParty();
    });
    // Events: delegated for the dynamic story cards, album, and game overlays.
    document.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b || b.disabled)
            return;
        if (b.dataset.route) {
            route(b.dataset.route);
            return;
        }
        if (b.dataset.care) {
            care(b.dataset.care, b.classList.contains('cat-touch') ? b : document.querySelector(`#view-${currentView} .cat-touch`));
            return;
        }
        if (b.dataset.character) {
            beginStory(b.dataset.character);
            return;
        }
        if (b.dataset.choice !== undefined) {
            chooseStory(Number(b.dataset.choice));
            return;
        }
        if (b.dataset.memory) {
            showMemory(b.dataset.memory);
            return;
        }
        if (b.dataset.filter) {
            albumFilter = b.dataset.filter;
            renderAlbum();
            return;
        }
        if (b.dataset.game === 'start') {
            startGame();
            return;
        }
        if (b.dataset.game === 'resume') {
            resumeGame();
            return;
        }
        if (b.dataset.mode) {
            if (['running', 'countdown', 'paused', 'starting'].includes(game.status))
                return;
            game.mode = b.dataset.mode;
            stopGame(true);
            return;
        }
    });
    $('helpBtn').onclick = showHelp;
    $('footerHelp').onclick = showHelp;
    $('settingsBtn').onclick = showSettings;
    $('renamePet').onclick = showSettings;
    $('giftBtn').onclick = showGift;
    $('homeAlbumBtn').onclick = () => route('album');
    $('storyNext').onclick = nextStory;
    $('exitStory').onclick = exitStory;
    $('closeModal').onclick = () => closeModal();
    $('modalBackdrop').addEventListener('click', e => {
        if (e.target === $('modalBackdrop'))
            closeModal();
    });
    $('soundBtn').onclick = async () => {
        state.sound = !state.sound;
        save();
        renderGlobal();
        if (state.sound)
            await ensureAudio();
        else
            stopAudioBridge();
        if (audioMaster)
            audioMaster.gain.setTargetAtTime(state.sound ? 0.28 : 0, audioCtx.currentTime, .04);
        toast(state.sound ? (['chronicle', 'story'].includes(currentView) ? '声音已开启 · 故事配乐随剧情播放' : '声音已开启 · 进入故事或开始演奏即可听到音乐') : '声音已关闭');
    };
    $('dailyClaim').onclick = () => {
        ensureDaily();
        const d = state.daily;
        if (!d.claimed && d.pet && d.story && d.rhythm) {
            d.claimed = true;
            state.coins += ECONOMY_RULES.daily;
            state.cards.tickets++;
            save();
            renderGlobal();
            toast('今日份的小幸福已收好 · 音符 +10 · 邀请券 +1', true);
        }
    };
    $('takePhoto').onclick = () => { unlock('photo'); save(); renderGlobal(); showMemory('photo'); };
    $('importInput').onchange = async (e) => { await importSave(e.target.files[0]); e.target.value = ''; };
    $('startGame').onclick = startGame;
    $('pauseGame').onclick = () => game.status === 'paused' ? resumeGame() : pauseGame();
    $('restartGame').onclick = () => { stopGame(true); toast('乐谱已回到开头，可以重新选曲和开始。'); };
    $('trackSelect').onchange = e => {
        if (['running', 'countdown', 'paused', 'starting'].includes(game.status))
            return;
        game.track = Number(e.target.value) === 1 ? 1 : 0;
        stopGame(true);
    };
    $('rhythmGuide').onclick = () => {
        if (['running', 'countdown'].includes(game.status))
            pauseGame();
        openModal('第一次合奏，也可以很好听', `<p>猫爪从上方落下，<strong>中心到达底部横线时</strong>，按下对应琴键。</p><div class="help-step">${I('music')}<div><strong>电脑：D / F / J / K</strong><p>分别对应从左到右四条轨道。每个猫爪只需点按一次，不用长按。Esc 可以暂停或继续。</p></div></div><div class="help-step">${I('hand')}<div><strong>手机：点击下方四个琴键</strong><p>也可以点击相应轨道。建议打开声音，听着节拍来按。</p></div></div><p>PERFECT：1000 分；GOOD：700 分；NICE：400 分。漏接为 0 分并中断连击，但不会结束游戏。空按不扣分。</p><p style="margin-top:12px">${ECONOMY_HELP}</p><p>准确率＝实际得分 ÷ 全部音符的满分。S ≥ 95%；A ≥ 85%；B ≥ 70%；C ≥ 45%。达到 C 及以上可解锁合奏回忆。</p><div class="modal-foot">“初见”是慢速单点谱；“合奏”速度更快且音符更密。每首曲子约 35—46 秒，另有 3 秒准备时间。歌曲是浏览器实时合成的原创旋律，不是原声录音。</div>`);
    };
    $$('[data-lane]').forEach(btn => {
        btn.addEventListener('pointerdown', e => { e.preventDefault(); hitLane(Number(btn.dataset.lane)); });
        btn.addEventListener('click', e => {
            if (e.detail === 0)
                hitLane(Number(btn.dataset.lane));
        });
    });
    canvas.addEventListener('pointerdown', e => { e.preventDefault(); const r = canvas.getBoundingClientRect(); hitLane(clamp(Math.floor((e.clientX - r.left) / r.width * 4), 0, 3)); });
    document.addEventListener('keydown', e => {
        if (!$('modalBackdrop').hidden) {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeModal();
                return;
            }
            if (e.key === 'Tab') {
                const all = Array.from($('modalBackdrop').querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]')).filter(x => x.offsetParent !== null);
                const first = all[0], last = all[all.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last?.focus();
                }
                else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first?.focus();
                }
            }
            return;
        }
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey)
            return;
        if (currentView === 'rhythm') {
            const k = e.key.toLowerCase(), index = ['d', 'f', 'j', 'k'].indexOf(k);
            if (index >= 0 && !e.repeat) {
                e.preventDefault();
                hitLane(index);
            }
            if (e.key === 'Escape' && !e.repeat) {
                e.preventDefault();
                if (game.status === 'paused')
                    resumeGame();
                else
                    pauseGame();
            }
        }
        if (currentView === 'story' && storySession && e.key === ' ' && !e.repeat && e.target.tagName !== 'BUTTON') {
            e.preventDefault();
            nextStory();
        }
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAudioBridge();
            if (['running', 'countdown'].includes(game.status))
                pauseGame();
        }
    });
    window.addEventListener('blur', () => {
        if (['running', 'countdown'].includes(game.status))
            pauseGame();
    });
    window.addEventListener('pagehide', () => { save(); stopSongAudio(); stopAudioBridge(); });
    window.addEventListener('resize', () => {
        if (currentView === 'rhythm')
            resizeCanvas();
    });
    if (window.ResizeObserver)
        new ResizeObserver(() => {
            if (currentView === 'rhythm')
                resizeCanvas();
        }).observe($('canvasArea'));
    $$('[data-icon]').forEach(el => el.innerHTML = I(el.dataset.icon));
    $$('img[data-asset]').forEach(el => el.src = ASSETS[el.dataset.asset]);
    document.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b || b.disabled)
            return;
        const d = b.dataset;
        if (d.cardOpen)
            return goCard(d.cardOpen);
        if (d.cardFeedOpen)
            return goCard(d.cardFeedOpen, true);
        if (d.cardSelect)
            return selectCard(d.cardSelect);
        if (d.cardFilter !== undefined) {
            CardUI.filter = d.cardFilter;
            renderCards();
            return;
        }
        if (d.cardTab) {
            CardUI.tab = d.cardTab;
            renderCardPage();
            if (innerWidth < 721)
                requestAnimationFrame(() => document.querySelector('.profile-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
            return;
        }
        if (d.cardBack !== undefined)
            return route(CardUI.returnTo);
        if (d.cardGift)
            return chooseCardGift(d.cardGift);
        if (d.cardFeed !== undefined)
            return feedCard();
        if (d.cardTrain)
            return trainCard(d.cardTrain);
        if (d.cardTeam)
            return toggleTeam(d.cardTeam);
        if (d.cardReplaceOld)
            return replaceTeam(d.cardReplaceOld, d.cardReplaceNew);
        if (d.cardTeamPick !== undefined) {
            if (currentView === 'cards') {
                CardUI.filter = '全部';
                renderCards();
                toast('点击卡牌下方的编队按钮，即可加入。');
            }
            else
                route('cards');
            return;
        }
        if (d.cardSkill)
            return prepareCardSkill(d.cardSkill);
        if (d.cardStory)
            return openCardStory(d.cardStory);
        if (d.cardForm !== undefined)
            return switchTangForm();
        if (d.cardDark !== undefined)
            return triggerBlack();
        if (d.cardSoothe !== undefined)
            return sootheOrange();
        if (d.cardEye !== undefined)
            return useEye();
        if (d.cardBondMemory !== undefined)
            return showBondMemory();
        if (d.cardHelp !== undefined)
            return showCardsHelp();
        if (d.cardRecruit !== undefined)
            return showRecruit();
        if (d.cardDraw)
            return recruitCards(Number(d.cardDraw));
        if (d.cardClose !== undefined)
            return closeModal();
    });
    setInterval(() => {
        if (!state.cards)
            return;
        const wasExpired = state.cards.blackUntil > 0 && state.cards.blackUntil <= Date.now();
        if (wasExpired) {
            state.cards.blackUntil = 0;
            save();
            renderCardGlobals();
        }
        $$('[data-black-clock]').forEach(el => el.textContent = cardDark() ? `好好先生回归倒计时 ${formatTime((state.cards.blackUntil - Date.now()) / 1000)}` : '橘猫正在旁边监督');
    }, 1000);
    document.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b || b.disabled)
            return;
        const d = b.dataset;
        if (d.dijieInstrument !== undefined)
            return switchDijieInstrument(Number(d.dijieInstrument));
        if (d.dijieScript !== undefined)
            return runRehearsalScript();
        if (d.dijieEmoDemo !== undefined)
            return demoDijieEmo();
        if (d.shiyuanTarget)
            return assignPraise(d.shiyuanTarget);
        if (d.shiyuanGreet !== undefined)
            return greetShiyuan();
        if (d.shiyuanPlay !== undefined)
            return playShiyuanMoon();
        if (d.azheApplause !== undefined)
            return startAzheApplause();
    });
    document.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b || b.disabled)
            return;
        const d = b.dataset;
        if (d.trioArt) {
            const c = cardDef(d.trioArt);
            if (c)
                openModal(c.name + ' · 虚拟角色立绘', `<img class="trio-art-preview" src="${ASSETS[c.asset]}" alt="${c.name}的虚拟立绘"><p class="trio-tiny-rule">原创虚拟形象，不是团员的真实照片。</p>`);
            return;
        }
        if (d.trioArchive)
            return showTimArchive();
        if (d.trioTimRoute)
            return chooseTimRoute(d.trioTimRoute);
        if (d.trioTimConfirm)
            return confirmTimRoute(d.trioTimConfirm);
        if (d.trioContract !== undefined)
            return showContract();
        if (d.trioAnchor !== undefined)
            return showYeAnchor();
        if (d.trioInvite !== undefined)
            return showYeInvitation();
        if (d.trioMusicPreview)
            return showKonggePreview(d.trioMusicPreview === 'good');
        if (d.trioForm)
            return showKonggeForm(d.trioForm);
        if (d.trioKonggeTarget)
            return chooseKonggeTarget(d.trioKonggeTarget);
        if (d.trioPractice !== undefined)
            return startChiefTrial();
        if (d.trioTrial !== undefined)
            return actChiefTrial();
    });
    document.addEventListener('keydown', e => {
        if (ChiefTrial && !ChiefTrial.closed && e.code === 'Space' && !e.repeat && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            actChiefTrial();
        }
    }, true);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden)
            pauseChiefTrial();
    });
    window.addEventListener('blur', pauseChiefTrial);
    document.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b || b.disabled)
            return;
        const d = b.dataset;
        if (d.lalaCover)
            return setLalaCover(d.lalaCover);
        if (d.lalaJournal)
            return showLalaJournal(Number(d.lalaJournal));
        const action = d.lalaAction;
        if (!action)
            return;
        if (action === 'journal')
            return showLalaJournal();
        if (action === 'recap')
            return showLalaJournal(state.chronicle.run.chapter, true);
        if (action === 'score')
            return showLalaScore();
        if (action === 'keep-score')
            return keepLalaScore();
        if (action === 'score-audio')
            return playLalaScore();
        if (action === 'continue') {
            LalaUI.recap = false;
            closeModal();
            route('chronicle');
            LalaUI.recap = false;
            Chronicle.refresh();
            return;
        }
        if (action === 'toggle-recap') {
            if (!hiddenSkillReady('lala'))
                return;
            lalaState().autoRecap = !lalaState().autoRecap;
            LalaUI.recap = false;
            save();
            renderGlobal();
            toast(lalaState().autoRecap ? '续章引路已开启。' : '自动回顾已关闭，仍可手动查看。', true);
            return;
        }
        if (action === 'dismiss-recap') {
            LalaUI.recap = false;
            Chronicle.refresh();
            $('cpMain')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        if (action === 'export-journal') {
            const r = lalaRun(LalaUI.journalChapter);
            if (r)
                downloadBlob(new Blob([lalaJournalText(r)], { type: 'text/plain;charset=utf-8' }), '垃垃手记_' + lalaChapterTitle(r.chapter) + '_' + dateKey() + '.txt');
            return;
        }
    });
}
