'use strict';

function showHelp() {
    if (['running', 'countdown'].includes(game.status))
        pauseGame();
    openModal('欢迎来到小小排练室', `<div class="help-step">${I('album')}<div><strong>新增：夏天的形状与开幕之夜</strong><p>从首页新横幅或底部「乐团剧情」进入。六章正传依次解锁。第五章走进夏日音乐节，遇见黄奕兴；第六章筹备音乐剧《拾光》，搭配《热烈》配乐。名字与乐器沿用第一章，羁绊分全局保留；心动故事仍保留在另一标签。正传进度随整个 V6.3 存档一起导出。</p></div></div><p>这是一份可以玩的乐团周边。没有输赢压力，只有乐手、猫咪，和一些值得记住的小事。</p><div class="help-step">${I('paw')}<div><strong>先和团宠熟悉起来</strong><p>点击猫咪、喂食或逗猫都能增加羁绊分。音符是游戏内积分，不涉及真实付款。</p></div></div><div class="help-step">${I('heart')}<div><strong>读一段属于你们的故事</strong><p>十位伙伴各有一段原创互动故事与两种回应，剧情提到角色时自动解锁。首次读完可领取 3 音符、2 羁绊分，以及专属回忆。重读不会重复刷奖励。</p></div></div><div class="help-step">${I('music')}<div><strong>让猫爪落在节拍上</strong><p>先选曲和难度。猫爪中心落到横线时，按 D / F / J / K；手机点击下方四个琴键。Esc 暂停，切换页面也会自动暂停。浏览器会实时合成两首原创小曲。</p></div></div><div class="help-step">${I('cards')}<div><strong>新的乐团卡册已经上线</strong><p>跟随剧情相遇并获得人物卡，去「乐团卡册」邀请重逢、投喂养成，逐步发现隐藏技能。最多编队三位，演奏结束后获得真实的游戏音符加成。卡册内的玩法按钮有完整说明。</p></div></div><div class="help-step">${I('album')}<div><strong>把喜欢收进相册</strong><p>撸猫、剧情和演奏会解锁照片。点击已收藏的照片，可以保存带有纪念文字的图片。</p></div></div><div class="note-box" style="margin-top:15px">${I('gift')}<span>乐团送你的彩蛋口令：<strong>MEOW2026</strong><br>去首页的「来自乐团的礼物」兑换。</span></div><div class="modal-foot">本地体验版：插画沿用本次原型；角色和剧情为虚构。无需账号或联网。存档只保存在当前浏览器，可在设置中导出备份。不是实际付费兑换或联网游戏服务。</div>`);
}
function showSettings() {
    if (['running', 'countdown'].includes(game.status))
        pauseGame();
    openModal('留住我们的排练日常', `<label class="form-label" for="nicknameInput">大家怎么称呼你？</label><div class="form-row"><input class="text-input" id="nicknameInput" maxlength="12" value="${escapeHTML(state.nickname)}" placeholder="最多 12 个字"><button class="btn primary" id="saveNickname">保存</button></div><label class="form-label" for="catNameInput">团宠的小名</label><div class="form-row"><input class="text-input" id="catNameInput" maxlength="10" value="${escapeHTML(state.catName)}"><button class="btn secondary" id="saveCatName">保存</button></div><h3>存档只属于你</h3><p>${storageOK ? '正在自动保存到这个浏览器。' : '当前浏览器限制了自动存档，请导出备份。'}第一章、第二章以及卡牌养成都包含在同一份 JSON 备份中。移动 HTML 文件、切换浏览器或清理浏览数据后，原存档可能不可用。建议导出一份小备份。</p><div class="settings-actions"><button class="btn secondary small" id="exportSave">${I('download')}导出存档</button><button class="btn ghost small" id="importSave">${I('album')}导入存档</button><button class="btn ghost small" id="resetSave">重新开始</button></div><div class="modal-foot">所有音符与奖励仅为本地游戏数据，无实际货币价值。游戏不收集或上传任何个人信息。</div>`);
    $('saveNickname').onclick = () => {
        const v = $('nicknameInput').value.trim();
        if (!v) {
            toast('先写下一个称呼吧。');
            return;
        }
        state.nickname = v.slice(0, 12);
        save();
        renderGlobal();
        toast(`大家记住你啦，${state.nickname}。`, true);
    };
    $('saveCatName').onclick = () => {
        const v = $('catNameInput').value.trim();
        if (!v) {
            toast('小猫也需要一个名字。');
            return;
        }
        state.catName = v.slice(0, 10);
        save();
        renderGlobal();
        toast(`以后就叫 ${state.catName} 啦。`, true);
    };
    $('exportSave').onclick = exportSave;
    $('importSave').onclick = () => $('importInput').click();
    $('resetSave').onclick = () => { openModal('真的要重新相遇吗？', `<p>这会清空 V6.2 的猫咪、故事、相册、成绩、卡牌等级、邀请券、编队，以及正传周目和结局图鉴。只想重开正传，请在「乐团剧情」中重开本周目。建议先导出存档。</p><div class="settings-actions"><button class="btn ghost" id="cancelReset">还是留着吧</button><button class="btn primary" id="confirmReset">确认重新开始</button></div>`); $('cancelReset').onclick = showSettings; $('confirmReset').onclick = () => { stopGame(true); Chronicle.suspend(); state = freshState(); storySession = null; lastPetAction = 0; lastRest = 0; save(); closeModal(); renderCharacters(); $('storyPlayer').hidden = true; $('storySelect').hidden = false; route('home'); sayCat('你来啦！今天也想贴贴。'); toast('新的一页，正在等你。', true); }; };
}
function downloadBlob(blob, filename) { const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = filename; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000); }
function exportSave() { downloadBlob(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }), `恋与哈基米_存档_${dateKey()}.json`); toast('存档备份已生成。', true); }
async function importSave(file) {
    if (!file)
        return;
    if (file.size > 1024 * 1024) {
        toast('存档文件过大，请选择游戏导出的 JSON。');
        return;
    }
    try {
        const raw = JSON.parse(await file.text());
        if (Chronicle.sourceSaveDetected(raw)) {
            Chronicle.requestLegacy(raw);
            return;
        }
        const obj = cleanState(raw);
        openModal('恢复这份排练日记？', `<p>玩家：${escapeHTML(obj.nickname)}<br>猫咪：${escapeHTML(obj.catName)}<br>已收藏 ${obj.memories.length} 张回忆，拥有 ${obj.coins} 音符。<br>卡牌 ${Object.values(obj.cards.collection).filter(c => c.owned).length} / ${CARD_DEFS.length}，邀请券 ${obj.cards.tickets}。</p><p style="margin-top:12px">导入会覆盖 V6.2 当前存档（含两章正传进度）。V5.1–V6 存档可继续使用，已取消分支的存档会回到本周安排；V4 存档会开启全新的入团周目。仅恢复仍在卡册中的伙伴；已移除角色的相关数据不会重新加入。</p><div class="settings-actions"><button class="btn ghost" id="cancelImport">取消</button><button class="btn primary" id="confirmImport">恢复存档</button></div>`);
        $('cancelImport').onclick = closeModal;
        $('confirmImport').onclick = () => { Chronicle.suspend(); stopGame(true); state = obj; save(); storySession = null; $('storyPlayer').hidden = true; $('storySelect').hidden = false; closeModal(); route('home'); sayCat('你回来啦，我一直记得你。'); toast('所有回忆，都回来啦。', true); };
    }
    catch (e) {
        toast('这份文件不是有效的游戏存档，原进度没有改变。');
    }
}
function showGift() {
    openModal('来自乐团的礼物', `<div style="text-align:center;margin:6px 0 15px;color:#b28695">${I('gift', 'lg')}</div><p>“下次排练，也记得来。你的位置已经留好，团宠也在等你。”</p><p style="margin-top:12px">${state.gift ? '你已经领取过这份见面礼了，邀请函已放进相册。' : '输入口令，领取 10 音符和一张限定邀请函。'}</p><div class="redeem-row"><input id="giftCode" class="text-input" placeholder="提示：MEOW2026" maxlength="30" autocomplete="off" ${state.gift ? 'disabled' : ''}><button class="btn primary" id="redeemGift" ${state.gift ? 'disabled' : ''}>${state.gift ? '已领取' : '拆开礼物'}</button></div>${GiftCards.formHTML()}<div class="modal-foot">回忆和兑换记录随当前存档保存，记得在设置中备份。</div>`);
    GiftCards.mount();
    $('redeemGift').onclick = () => {
        if (state.gift)
            return;
        if ($('giftCode').value.trim().toUpperCase() !== 'MEOW2026') {
            toast('口令不太对哦，试试 MEOW2026。');
            return;
        }
        state.gift = true;
        state.coins += 10;
        unlock('gift');
        save();
        renderGlobal();
        closeModal();
        toast('邀请函已收好 · 获得 10 音符', true);
    };
    $('giftCode').onkeydown = e => {
        if (e.key === 'Enter')
            $('redeemGift').click();
    };
}
