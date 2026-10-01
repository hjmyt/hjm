const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    const checks = await page.evaluate(() => {
      const out = [], check = (name, value) => { if (!value) throw Error(name); out.push(name); };
      state = freshState(); state.sound = false; syncStoryCards();
      check('Jerry stays locked before chapter two appearance', !cardOwned('jerry') && !availableCardPool().some(card => card.id === 'jerry'));
      Object.assign(state.chronicle.run, { chapter: 2, ch: 2, name: '测试', scene: 'c2_night_pre', level: 6 });
      syncStoryCards();
      check('Jerry unlocks on his chapter two dialogue', cardOwned('jerry') && availableCardPool().some(card => card.id === 'jerry'));
      state.cards.selected = 'jerry'; route('home'); renderHomeCards();
      check('Jerry home feature keeps portrait aligned to the top', $('homeFeature').classList.contains('is-jerry') && getComputedStyle($('homeFeature').querySelector('.feature-art')).objectPosition === '50% 0%');
      const legacy = freshState(); legacy.cards.encounterVersion = 1;
      Object.assign(legacy.chronicle.run, { chapter: 2, ch: 2, name: '旧档', scene: 'menu', flags: { strGroup: 1 } });
      check('Reached chapter two legacy saves recover Jerry', cleanState(legacy).cards.encounters.includes('jerry'));
      check('Latest supplied trilogy was compiled', FUSION_ROUTES.rl.length === 20 && FUSION_ROUTES.ep2.length === 32 && FUSION_ROUTES.fm.length === 60);
      const emojiPattern = /[\u{1F300}-\u{1FAFF}]/u;
      check('Casual fusion chat messages use visible emoji', FUSION_CHAT_POOL.every(([name, message]) => name === '阿齐' || emojiPattern.test(message)));
      check('Chapter-two contact uses A-Qi and the requested Dongguan line', FUSION_CHAT_POOL.some(([name, message]) => name === '阿齐' && message === '九点了，我要回东莞了') && !FUSION_CHAT_POOL.some(([name]) => name === 'REK'));
      const legacyAqiChat = freshFusion();
      legacyAqiChat.runs.ep2.chats.REK = 1;
      legacyAqiChat.runs.ep2.lastChat = 'REK';
      const migratedAqiChat = cleanFusion(legacyAqiChat).runs.ep2;
      check('Legacy REK chat progress migrates to A-Qi', migratedAqiChat.chats['阿齐'] === 1 && !('REK' in migratedAqiChat.chats) && migratedAqiChat.lastChat === '阿齐');
      check('Expression descriptions use the actual emoji glyph', fusionNode('fm', 'f2_dy2').lines.some(line => line.text.includes('「🤷」')) && fusionNode('fm', 'f2_dy3').lines.some(line => line.text.includes('😂')));
      check('Standalone entry update overrides the trilogy opening', fusionNode('rl', 'fs_00').lines[0].text.startsWith('你是一个现代音乐人。'));
      check('V16 main and chat additions are present', ['f2_m1','f2_m4','f2_llclose','f2_aq1','f2_bsstop','g_pre','g_post'].every(id => Object.values(FUSION_ROUTES).flat().some(node => node.id === id)));
      state.affinity.jerry = 20; goCard('jerry');
      const jerry = cardDef('jerry');
      check('Jerry card uses the supplied SSR profile', jerry.rarity === 'SSR' && jerry.stars === 6 && jerry.profileFields.length === 3 && jerry.stats.some(([name, value]) => name === '心流时长' && value === '6h+'));
      check('Jerry card starts with the Dijie pairing preview', document.querySelector('[data-jerry-pair="dijie"]')?.classList.contains('active') && $('view-card').innerText.includes('竹笛遇上低音炮，山谷里起了雾。'));
      document.querySelector('[data-jerry-pair="lala"]').click();
      check('Jerry card can switch to the Lala pairing preview', document.querySelector('[data-jerry-pair="lala"]')?.classList.contains('active') && $('view-card').innerText.includes('古典的骨头，fusion 的血。'));
      check('Threshold is strictly greater than twenty', !document.querySelector('[data-fusion-open]'));
      route('fusion');
      check('Direct route is also guarded at twenty', currentView === 'card');
      state.affinity.jerry = 21; renderCardPage();
      check('Entry appears at twenty-one', !!document.querySelector('[data-fusion-open]'));
      check('Hidden skill names stay concealed below thirty-five', !$('view-card').innerHTML.includes('音乐治疗师'));
      state.affinity.jerry = 35; expansion().dijie.emo = true;
      const soloDijie = cardBonus('dijie', ['dijie']);
      renderCardPage();
      check('Jerry hidden skills reveal at the shared threshold', $('view-card').innerHTML.includes('音乐治疗师') && hiddenSkillReady('jerry'));
      check('Jerry and Dijie combination removes emo penalty and strengthens the pairing', cardBonus('dijie', ['jerry', 'dijie']) > soloDijie);
      state.affinity.jerry = 21;
      openFusion();
      check('Fusion hub matches Chronicle chrome', !!document.querySelector('#view-fusion .cp-banner') && !!document.querySelector('#view-fusion .cp-hud') && document.querySelectorAll('#view-fusion .fusion-chapter img').length === 3);
      enterFusionChapter('rl');
      check('Old Du stays locked before his first fusion-line mention', !cardOwned('laodu') && !availableCardPool().some(card => card.id === 'laodu'));
      check('Fusion chapter uses Chronicle reader and chapter music', !!document.querySelector('#view-fusion .cp-novel .cp-novel-dialogue') && !!document.querySelector('#view-fusion .cp-choice') && document.querySelector('[data-music-title]').textContent.includes('My Sunset'));
      check('Exact-node artwork is collected on arrival', state.memories.includes('fusion_art_hill_arrival') && document.querySelector('.cp-novel-art img')?.src.includes('hill-arrival.jpg'));
      check('Fusion scene art uses the shared desktop polaroid rule', getComputedStyle(document.querySelector('.cp-novel-art')).paddingTop === '7px' && getComputedStyle(document.querySelector('.cp-novel-art img')).objectFit === 'contain');
      check('Route starts at the supplied opening', state.fusion.runs.rl.current === 'fs_00' && $('view-fusion').innerText.includes('又来到山丘'));
      check('Fusion reader shows at most two dialogue turns per page', document.querySelectorAll('.fusion-lines .cp-dialogue-turn').length <= 2);
      const routeLines = Object.values(FUSION_ROUTES).flat();
      for (const node of routeLines) {
        const expected = node.lines
          .filter(line => !/(本线前置|后宫支线预留|后宫总览|好感进度已存档)/.test(line.text))
          .map(line => line.text.trim());
        const actual = fusionPages(node).flat().map(line => line.text);
        check(`Fusion text stays atomic and complete: ${node.id}`, JSON.stringify(actual) === JSON.stringify(expected));
        check(`Fusion pages keep one or two complete source turns: ${node.id}`, fusionPages(node).every(turns => turns.length >= 1 && turns.length <= 2));
        check(`Fusion pages never start with a detached closer: ${node.id}`, actual.every(text => !/^[」』）)]/.test(text)));
        check(`Fusion choices never render blank: ${node.id}`, node.choices.every(choice => choice.text.trim()));
      }
      const attributedLines = [
        ['fs_laodu', '老杜见你过来', '老杜'], ['fs_dayang', '大羊抱着吉他', '大羊'], ['fs_yuerou', '悦柔坐在角落', '悦柔'],
        ['fs_yrno', '没过一会儿，笛杰', '笛杰'], ['fs_dj', '笛杰见你过来', '笛杰'], ['fs_rush', '七月的音乐会', '垃垃'],
        ['f2_rec', '她回了三个名字', '垃垃'], ['f2_ll7rage', '门在她身后关上', '老杜'], ['m_r2a', '你打了三个电话', '老杜'],
        ['m_r6a', '然后大鹅退群了', '大鹅'], ['m_talk_ld', '老杜看完稿子', '老杜'], ['m_talk_dy', '大羊看完稿子', '大羊'],
        ['m_talk_ge', '大鹅看完稿子', '大鹅'], ['m_talk_dj', '笛杰看完稿子', '笛杰'], ['f2_fusenight', '你把电话递给笛杰', '笛杰'],
        ['f2_aq1', '晚上九点整', '阿齐'], ['f2_aq3', '第三次聊', '阿齐'], ['f2_slap', '阿齐抱着贝斯', '阿齐'],
        ['m_ep', '过了半小时，彩虹姐', '彩虹姐'], ['m_ep1', '彩虹姐第一时间', '彩虹姐'], ['m_ep2', '她回了很长一段', '十元'],
        ['m_ep3', '你让大鹅带话', '大鹅']
      ];
      for (const [id, prefix, speaker] of attributedLines) {
        const node = routeLines.find(item => item.id === id), line = node.lines.find(item => item.text.startsWith(prefix));
        check(`Embedded dialogue is attributed to ${speaker}: ${id}`, fusionLineTurns(node, line)[0].who === speaker);
      }
      const viewpointLines = [['fs_yrok', '加上微信'], ['fs_yr2', '悦柔见你过来'], ['f2_dy2', '你盯着'], ['f2_bsstop', '那个「哦」字']];
      for (const [id, prefix] of viewpointLines.filter(([id]) => id !== 'fs_yr2')) {
        const node = routeLines.find(item => item.id === id), line = node.lines.find(item => item.text.startsWith(prefix));
        check(`Quoted term stays with Jerry viewpoint: ${id}`, fusionLineTurns(node, line)[0].who === 'Jerry');
      }
      const reviewedAttribution = [
        ['fs_yrno', '你婉拒了', 'Jerry'], ['fs_tim', 'TIM 见你过来', 'TIM'], ['fs_yr2', '悦柔见你过来', '悦柔'],
        ['fs_05', '排练第一轮结束', '垃垃'], ['fs_05', '你看见她这个样子', 'Jerry'], ['fs_07', '十元抬起头', '十元'],
        ['f2_m1', '你花了一个星期', 'Jerry'], ['f2_llclose', '第二天的排练照常进行', '垃垃'], ['f2_ll1', '垃垃回得很快', '垃垃'],
        ['f2_ll3', '面试完弦乐手', '垃垃'], ['f2_ll5', '这次她过了很久才回', '垃垃'], ['f2_ll8', '十元跑前跑后地解释', '十元'],
        ['f2_ll8', '这时候，垃垃', '垃垃'], ['m_r4', '十元提议换人', '十元'], ['m_r4b', '垃垃还站在那里', '垃垃'],
        ['m_pre1', '演出前一周，垃垃', '垃垃'], ['m_pre1', '她练了一遍又一遍', '垃垃'], ['m_talk_ll', '垃垃把你的稿子', '垃垃'],
        ['m_talk_ll', '四十分钟后', '垃垃'], ['m_show2', '台下坐了四百个人。十元', '十元'], ['m_perfect', '最后一首歌，十元', '十元'],
        ['f2_ldp1', '第一次课后，老杜', '老杜'], ['f2_ldnight', '第三次聊完的周末，老杜', '老杜'], ['f2_bs1', '宝石跟你聊天', '宝石'],
        ['f2_bs2', '宝石开始绕圈', '宝石'], ['f2_cpgo', '宝石抬起头', '宝石'], ['m_ep2', '你私信十元', 'Jerry'],
        ['m_ep2', '她回了很长一段', '十元'], ['m_ep2', '你没有立刻回答', 'Jerry']
      ];
      for (const [id, prefix, speaker] of reviewedAttribution) {
        const node = routeLines.find(item => item.id === id), line = node.lines.find(item => item.text.startsWith(prefix));
        check(`Reviewed paragraph belongs to ${speaker}: ${id} / ${prefix}`, fusionLineTurns(node, line)[0].who === speaker);
      }
      const reviewedNarration = [
        ['f2_m1', '大羊秒回一段四十六秒'],
        ['f2_dj3', '「这竹笛可以啊'],
        ['f2_fusenight', '队长摘下耳机'],
        ['f2_aq2', '「九点了，我要回东莞了」已经成为'],
        ['f2_slap', '演出那天，阿齐的 slap 段落']
      ];
      for (const [id, prefix] of reviewedNarration) {
        const node = routeLines.find(item => item.id === id), line = node.lines.find(item => item.text.startsWith(prefix));
        check(`Anonymous or multi-speaker paragraph stays with narration: ${id} / ${prefix}`, fusionLineTurns(node, line)[0].who === '旁白');
      }
      const dayangReply = fusionNode('fm', 'f2_rocknight').lines.find(line => line.text.startsWith('「你是不敢承认'));
      check('Jerry keeps the unlabelled follow-up line in Dayang hidden memory', fusionLineTurns(fusionNode('fm', 'f2_rocknight'), dayangReply)[0].who === 'Jerry');
      const routeIds = new Set(routeLines.map(node => node.id));
      const routeSentinels = new Set(['NEXT','POOL','PREPOOL','POSTPOOL','RESULT','LLJUDGE','f2_mX','m_result']);
      check('Every fusion branch resolves to a node or route action', routeLines.every(node => node.choices.every(choice => !choice.next || routeIds.has(choice.next) || routeSentinels.has(choice.next))));
      const exposedRule = /(本线前置|后宫支线预留|如果你刚才加了她微信|演出成功率\s*[+＋]|玩到这里，游戏正式进入|再选一次「别打扰她」|（记住[^）]+）|（去(?:NEXT|POOL|PREPOOL|POSTPOOL|RESULT|[a-z0-9_]+)）|好感[+＋-]\d+)/i;
      check('Author notes and route directives never enter dialogue', routeLines.every(node => node.lines.every(line => !exposedRule.test(line.text))));
      check('Author notes and route directives never enter choices', routeLines.every(node => node.choices.every(choice => !exposedRule.test(choice.text))));
      check('Every second-person paragraph resolves to Jerry or its reviewed character focus', routeLines.every(node => node.lines.filter(line => line.who === '旁白' && /你/.test(line.text)).every(line => {
        const speaker = fusionLineTurns(node, line)[0].who;
        return speaker === 'Jerry' || speaker === fusionReviewedLineSpeaker(node, line.text) || speaker === fusionEmbeddedQuoteSpeaker(node, line.text);
      })));
      check('Jerry direct replies never keep the narrator identity', fusionPages(fusionNode('rl', 'fs_06wait')).flat().some(line => line.who === 'Jerry' && line.text === '「借一步说话。」'));
      check('Nested route directives compile into real branch data', fusionNode('ep2', 'f2_ll11c').choices[0].text === '（把这段对话存进了心底）' && fusionNode('ep2', 'f2_ll11c').choices[0].flags.includes('silenceOK') && fusionNode('ep2', 'f2_ll11c').choices[0].next === 'NEXT');
      state.fusion.runs.rl.flags.yrYes = false;
      check('YueRou demo line stays absent after declining the direct WeChat add', !fusionPages(fusionNode('rl', 'fs_yr2')).flat().some(line => line.text.includes('demo 发你')));
      state.fusion.runs.rl.flags.yrYes = true;
      check('YueRou says the demo line herself after the direct WeChat add', fusionPages(fusionNode('rl', 'fs_yr2')).flat().some(line => line.who === '悦柔' && line.text === '「回头把 demo 发你，你一定要听！」'));
      state.fusion.runs.rl.flags.yrYes = false;
      check('Emoji caption sentence is not split after 秒换成', fusionPages(fusionNode('rl', 'fs_yrok'))[0][0].text === '加上微信，她的头像秒换成「合作愉快」的表情包。你感觉自己的好友列表里，多了一个人形小太阳。');
      check('Yuerou project title remains inside its complete sentence', fusionPages(fusionNode('rl', 'fs_yr2'))[0][0].text.includes('还有那个「攒了很久的项目」。她说起这些的时候眼睛发亮'));
      while (document.querySelector('[data-fusion-page-next]')) continueFusionPage();
      chooseFusion(0);
      check('Opening choice advances and saves', state.fusion.runs.rl.done.includes('fs_00') && state.fusion.runs.rl.current === 'fs_01');
      while (document.querySelector('[data-fusion-page-next]')) continueFusionPage(); chooseFusion(0);
      while (document.querySelector('[data-fusion-page-next]')) continueFusionPage(); chooseFusion(0);
      check('Subscene returns to the next main scene', state.fusion.runs.rl.current === 'fs_02');
      check('Old Du unlocks exactly when fs_laodu is first displayed', cardOwned('laodu') && availableCardPool().some(card => card.id === 'laodu'));
      const laoduSpeaker = FUSION_SPEAKERS['老杜'];
      check('Old Du fusion speaker uses his dedicated card avatar', laoduSpeaker?.asset === 'cardLaoduAvatar' && ASSETS[laoduSpeaker.asset] === ASSETS.cardLaoduAvatar);
      const laodu = cardDef('laodu');
      state.affinity.laodu = 0;
      const laoduLockedDetail = concealCardSkills(renderDetailContent(laodu, true), laodu);
      state.affinity.laodu = 35;
      const laoduReadyDetail = concealCardSkills(renderDetailContent(laodu, true), laodu);
      check('Old Du card carries the supplied SR profile', laodu.rarity === 'SR' && laodu.stars === 3 && laodu.profileFields.length === 4 && laodu.stats.some(([name, value]) => name === '口碑' && value === 98));
      const laoduGifts = effectiveGifts(laodu).filter(gift => !isFullBondGift(gift));
      check('Old Du public skills and gifts match the supplied card', ['Lydian 开讲','口碑最好的人'].every(name => laoduLockedDetail.includes(name)) && laoduGifts.length === 3 && [1,5,10].every(gain => laoduGifts.some(gift => gift[4] === gain)) && laoduGifts.every(gift => gift[3] === gift[4] * 5));
      check('Old Du hidden skill follows the shared thirty-five threshold', !laoduLockedDetail.includes('登台前他只说两个字') && laoduReadyDetail.includes('登台前他只说两个字'));
      const oldDuLegacy = freshState(); oldDuLegacy.cards.encounterVersion = 2; oldDuLegacy.fusion.runs.rl.current = 'fs_laodu';
      check('Legacy fusion progress at fs_laodu recovers Old Du', cleanState(oldDuLegacy).cards.encounters.includes('laodu'));
      const bond = cardBond('jerry'); while (document.querySelector('[data-fusion-page-next]')) continueFusionPage(); chooseFusion(0);
      check('Fusion route score does not create a second bond meter', cardBond('jerry') === bond && !('aff' in state.fusion.runs.rl));
      showFusionNode('rl', 'fs_yuerou');
      check('YueRou is unlocked only when her dialogue is reached', cardOwned('yuerou') && [...document.querySelectorAll('.cp-speaker b')].some(node => node.textContent === '悦柔'));
      const yuerou = cardDef('yuerou'), yuerouDetail = renderDetailContent(yuerou, true);
      check('YueRou card carries the supplied five-star SR profile', yuerou.rarity === 'SR' && yuerou.stars === 5 && yuerou.profileFields.length === 4);
      check('YueRou special display stats preserve 999+', yuerou.stats.some(([name, value]) => name === '朋友圈点赞' && value === '999+') && yuerouDetail.includes('999+'));
      check('YueRou card includes all three supplied skills', ['三分钟好友','朋友圈风暴','周末消失术'].every(name => yuerouDetail.includes(name)));
      const yuerouGifts = effectiveGifts(yuerou).filter(gift => !isFullBondGift(gift));
      check('YueRou weekend supplies follow unified feeding rules', yuerou.giftTitle === '周末装备补给' && yuerouGifts.length === 4 && [1,5,10].every(gain => yuerouGifts.some(gift => gift[4] === gain)) && yuerouGifts.every(gift => gift[3] === gift[4] * 5));
      showFusionNode('rl', 'fs_dj');
      check('Dijie moonlight paragraph renders with Dijie identity and portrait', document.querySelector('.cp-dialogue-turn .cp-speaker')?.dataset.speaker === '笛杰' && document.querySelector('.cp-dialogue-turn .cp-speaker img')?.getAttribute('src') === cardThumbnail(cardDef('dijie'), 'avatar'));
      state.fusion.chapter = 'fm'; showFusionNode('fm', 'm_r6'); while (document.querySelector('[data-fusion-page-next]')) continueFusionPage();
      check('Existing Da-e card supplies the fusion speaker portrait', [...document.querySelectorAll('.cp-speaker')].some(node => node.dataset.speaker === '大鹅' && node.querySelector('img')?.src.includes('/thumbs/avatars/192/goose.webp')));
      check('Every fusion story node has an illustration binding', Object.values(FUSION_ROUTES).flat().every(node => FUSION_ART.some(art => art.scene === node.id)));
      const legacySceneIds = new Set(Object.keys(FUSION_LEGACY_ART));
      check('No fusion node falls back to rotating generic artwork', FUSION_ART.every(art => legacySceneIds.has(art.scene) || art.asset === `fusionNode_${art.scene}`));
      check('Adjacent fusion scenes no longer share a borrowed illustration', fusionSceneArt('fm', 'f2_cpgo').asset === 'fusionNode_f2_cpgo' && fusionSceneArt('fm', 'f2_aq1').asset === 'fusionNode_f2_aq1');
      state.fusion.chapter = 'ep2'; showFusionNode('ep2', 'f2_m1');
      check('Roster planning keeps its full-event artwork instead of the partial Old Du phone crop', document.querySelector('.cp-novel-art img')?.src.includes('/f2_m1.jpg'));
      check('Fusion roster mention unlocks Xiaojie', cardOwned('xiaojie') && availableCardPool().some(card => card.id === 'xiaojie'));
      const xiaojieLegacy = freshState(); xiaojieLegacy.fusion.runs.ep2.done.push('f2_m1');
      check('Legacy fusion progress after the roster mention recovers Xiaojie', cleanState(xiaojieLegacy).cards.encounters.includes('xiaojie'));
      const oldDuArtFiles = {
        fs_laodu: 'fs_laodu-v2.jpg', f2_ll7rage: 'f2_ll7rage-v4.jpg',
        m_r2: 'm_r2-v2.jpg', m_r2a: 'm_r2a-v2.jpg', m_talk_ld: 'm_talk_ld-v2.jpg', m_sd_ld: 'm_sd_ld-v2.jpg',
        f2_ldp1: 'f2_ldp1-v2.jpg', f2_ldp2: 'f2_ldp2-v2.jpg', f2_ldp2a: 'f2_ldp2a-v2.jpg',
        f2_ldp2b: 'f2_ldp2b-v2.jpg', f2_ldp3: 'f2_ldp3-v2.jpg', f2_ldp3a: 'f2_ldp3a-v2.jpg', f2_ldnight: 'f2_ldnight-v2.jpg'
      };
      check('Every Old Du story illustration points to the regenerated identity pass', Object.entries(oldDuArtFiles).every(([id, file]) => ASSETS[fusionSceneArt(Object.entries(FUSION_ROUTES).find(([, nodes]) => nodes.some(node => node.id === id))[0], id).asset].endsWith('/' + file)));
      const hiddenMemoryDetails = {
        f2_ldnight: ['管乐之夜', 'Autumn Leaves'],
        f2_rocknight: ['摇滚佬也有春天', 'chewing gum'],
        f2_fusenight: ['融合第一曲', '竹笛 feat.'],
        f2_slap: ['slap 全场', '加个班'],
        f2_bsstop: ['欲言又止的宝石', '愿闻其详']
      };
      for (const [id, phrases] of Object.entries(hiddenMemoryDetails)) {
        const memory = MEMORIES.find(item => item.id === fusionSceneArt('fm', id).id);
        check(`Hidden memory has detailed rule and description: ${id}`, memory.rule.includes('第三篇') && phrases.every(phrase => memory.title.includes(phrase) || memory.text.includes(phrase)) && memory.text.length > 80);
      }
      state.fusion.chapter = 'rl'; showFusionNode('rl', 'fs_07');
      check('Shiyuan help scene keeps Shiyuan and Jerry as its visual focus', document.querySelector('.cp-novel-art img')?.src.includes('/fs_07-v2.jpg'));
      while (state.fusion.runs.rl.page < 1) continueFusionPage();
      check('Jerry viewpoint narration uses his name and avatar', [...document.querySelectorAll('.cp-speaker')].some(node => node.dataset.speaker === 'Jerry' && node.querySelector('img')?.src.includes('/thumbs/avatars/192/jerry.webp')));
      while (document.querySelector('[data-fusion-page-next]')) continueFusionPage();
      check('Fusion choices are explicitly presented as Jerry replies', document.querySelector('.fusion-choice-owner b')?.textContent === 'Jerry' && document.querySelector('.fusion-choice-owner img')?.src.includes('/thumbs/avatars/192/jerry.webp'));
      state.fusion.chapter = 'ep2'; showFusionNode('ep2', 'f2_llclose');
      check('Lala closure scene uses its corrected canonical portrait', document.querySelector('.cp-novel-art img')?.src.includes('/f2_llclose-v2.jpg'));
      state.fusion.chapter = 'fm'; showFusionNode('fm', 'm_talk_ge');
      check('Da-e dialogue has dedicated card-consistent art', document.querySelector('.cp-novel-art img')?.src.includes('/m_talk_ge-v2.jpg'));
      showFusionNode('fm', 'f2_yrmv');
      check('Yuerou project dialogue has dedicated card-consistent art', document.querySelector('.cp-novel-art img')?.src.includes('/f2_yrmv-v2.jpg'));
      state.fusion.chapter = 'ep2'; showFusionNode('ep2', 'f2_ll6');
      check('Lala scenes with Jerry use corrected viewpoint artwork', document.querySelector('.cp-novel-art img')?.src.includes('/f2_ll6-v3.jpg'));
      state.fusion.chapter = 'fm'; showFusionNode('fm', 'f2_aq1');
      check('Aqi scene uses its new plot-specific illustration with Jerry present', document.querySelector('.cp-novel-art img')?.src.includes('/f2_aq1-v2.jpg'));
      check('A-Qi unlocks exactly when his first dialogue is displayed', cardOwned('aqi') && availableCardPool().some(card => card.id === 'aqi'));
      check('A-Qi fusion speaker uses his dedicated card avatar', FUSION_SPEAKERS['阿齐']?.asset === 'cardAqiAvatar' && document.querySelector('.cp-speaker[data-speaker="阿齐"] img')?.src.includes('/thumbs/avatars/192/aqi.webp'));
      const aqiLegacy = freshState(); aqiLegacy.fusion.runs.fm.done.push('f2_aq1');
      check('Legacy fusion progress after A-Qi mention recovers his card', cleanState(aqiLegacy).cards.encounters.includes('aqi'));
      state.fusion.chapter = 'fm'; showFusionNode('fm', 'f2_cpgo');
      check('Baoshi listening branch uses its own plot-specific illustration', document.querySelector('.cp-novel-art img')?.src.includes('/f2_cpgo-bf202610.jpg'));
      state.fusion.runs.fm.poolStage = 'pre'; while (document.querySelector('[data-fusion-page-next]')) continueFusionPage(); chooseFusion(0);
      check('Baoshi listening branch returns to the active chat pool', state.fusion.runs.fm.flags.poolHub && state.fusion.runs.fm.poolStage === 'pre');
      check('Baoshi listening branch naturally unlocks the CP route and shows both jump choices', state.chronicle.personal.storyUnlocks.baoshi_feihong && !$('modalBackdrop').hidden && $('modalTitle').textContent.includes('宝石×飞鸿 CP 线已解锁') && !!document.querySelector('[data-fusion-cp-enter]') && !!document.querySelector('[data-fusion-cp-later]'));
      Chronicle.enterFusionCp();
      check('Fusion unlock prompt jumps directly into Baoshi and Feihong CP route', currentView === 'chronicle' && state.chronicle.personal.active && state.chronicle.personal.selected === 'baoshi_feihong' && state.chronicle.personal.routes.baoshi_feihong.scene === 'cp_00');
      state.chronicle.personal.active = false;
      state.fusion.chapter = 'fm';
      route('fusion');
      openFusionPool('pre');
      const chatGrid = document.querySelector('.fusion-chat-grid');
      const poolAction = document.querySelector('.fusion-pool-actions');
      const gridRect = chatGrid.getBoundingClientRect(), actionRect = poolAction.getBoundingClientRect();
      const chatGridStyle = getComputedStyle(chatGrid);
      check('Fusion chat buttons keep consistent row and column spacing', parseFloat(chatGridStyle.rowGap) >= 8 && parseFloat(chatGridStyle.columnGap) >= 8);
      check('Fusion pool primary action is separated from the character grid', actionRect.top - gridRect.bottom >= 11);
      check('Fusion pool action has a dedicated full-width action region', poolAction.children.length === 1 && Math.abs(poolAction.firstElementChild.getBoundingClientRect().width - actionRect.width) < 1);
      state.fusion.runs.fm.poolStage = 'post';
      fusionPoolChat('十元');
      check('Shiyuan post-show message renders crying and milk-tea emoji', document.querySelector('.fusion-message')?.textContent.includes('😭😭😭') && document.querySelector('.fusion-message')?.textContent.includes('🧋'));

      const hiddenChatRoutes = {
        '老杜': ['f2_ldp1', 'f2_ldp2', 'f2_ldp3', 'f2_ldnight'],
        '大羊': ['f2_dy1', 'f2_dy2', 'f2_dy3', 'f2_rocknight'],
        '笛杰': ['f2_dj1', 'f2_dj2', 'f2_dj3', 'f2_fusenight'],
        '阿齐': ['f2_aq1', 'f2_aq2', 'f2_aq3', 'f2_slap']
      };
      for (const [name, ids] of Object.entries(hiddenChatRoutes)) {
        state.fusion.runs.fm = freshFusionRun();
        state.fusion.chapter = 'fm';
        ids.forEach((id, index) => {
          state.fusion.runs.fm.poolStage = index < 2 ? 'story' : index === 2 ? 'pre' : 'post';
          fusionPoolChat(name);
          check(`${name} chat ${index + 1} reaches ${id} across pool stages`, state.fusion.runs.fm.current === id && state.fusion.runs.fm.seen[name] === index + 1 && state.fusion.runs.fm.chats[name] === index + 1);
        });
        const memory = fusionSceneArt('fm', ids[3]).id;
        check(`${name} fourth chat collects the hidden memory`, state.memories.includes(memory));
      }
      state.fusion.runs.fm = freshFusionRun();
      state.fusion.chapter = 'fm';
      ['story', 'pre', 'post'].forEach((stage, index) => {
        state.fusion.runs.fm.poolStage = stage;
        fusionPoolChat('宝石');
        check(`Baoshi chat ${index + 1} reaches ${FUSION_FM_POOL_LINES['宝石'][index]}`, state.fusion.runs.fm.current === FUSION_FM_POOL_LINES['宝石'][index]);
      });
      while (document.querySelector('[data-fusion-page-next]')) continueFusionPage();
      chooseFusion(1);
      check('Baoshi third chat consolation branch reaches and collects the withheld-memory scene', state.fusion.runs.fm.current === 'f2_bsstop' && state.memories.includes(fusionSceneArt('fm', 'f2_bsstop').id));

      const pick = index => { while (document.querySelector('[data-fusion-page-next]')) continueFusionPage(); chooseFusion(index); };
      state.fusion.runs.fm = freshFusionRun(); state.fusion.chapter = 'fm'; showFusionNode('fm', 'm_ice');
      pick(0); pick(0); finishFusionPool();
      pick(1); finishFusionPool();
      pick(0); finishFusionPool();
      pick(0); pick(0); pick(0); finishFusionPool();
      pick(0); finishFusionPool();
      pick(0); pick(3); pick(0); pick(0); finishFusionPool();
      pick(5);
      check('Latest third chapter reaches its calculated performance result', ['m_ok','m_bad','m_perfect'].includes(state.fusion.runs.fm.current));
      pick(0); pick(0); finishFusionPool(); pick(1); pick(0);
      check('Latest third chapter reaches and records an ending', state.fusion.runs.fm.ended && state.fusion.runs.fm.ending === 'm_ep2');
      check('Third-chapter ending switches to the supplied finale BGM', document.querySelector('[data-music-title]').textContent.includes('这团不好带'));
      for (const badEnding of ['fs_leave', 'fs_rush']) {
        state.fusion.runs.rl.ended = true; state.fusion.runs.rl.ending = badEnding; state.fusion.chapter = 'rl'; renderFusion();
        check(`First-chapter ${badEnding} blocks the next-chapter action`, !document.querySelector('[data-fusion-next-chapter="ep2"]') && $('view-fusion').innerText.includes('第二篇不会开启'));
        state.fusion.chapter = null; renderFusion();
        check(`First-chapter ${badEnding} keeps chapter two disabled in the hub`, document.querySelector('[data-fusion-chapter="ep2"]').disabled && document.querySelector('[data-fusion-chapter="ep2"] small').textContent.includes('第一篇 BE'));
        enterFusionChapter('ep2');
        check(`Direct entry cannot bypass first-chapter ${badEnding}`, state.fusion.chapter === null);
      }
      state.fusion.runs.rl.ended = true; state.fusion.runs.rl.ending = 'fs_08'; state.fusion.chapter = 'rl'; renderFusion();
      check('Completed chapter offers direct entry to the next chapter', document.querySelector('[data-fusion-next-chapter="ep2"]')?.textContent.includes('进入下一篇章'));
      const endingActions = document.querySelector('.fusion-ending-actions'), endingStyle = getComputedStyle(endingActions);
      check('Chapter completion buttons keep a stable action gap', parseFloat(endingStyle.gap) >= 8 && endingActions.children.length === 2);
      document.querySelector('[data-fusion-next-chapter="ep2"]').click();
      check('Next chapter button opens or resumes the newly unlocked chapter', state.fusion.chapter === 'ep2' && !!state.fusion.runs.ep2.current && !!document.querySelector('#view-fusion .cp-novel'));
      check('Second fusion chapter restores the original NEXT TO YOU BGM', document.querySelector('[data-music-title]').textContent.includes('NEXT TO YOU'));
      state.fusion.runs.rl.ended = true; state.fusion.runs.rl.ending = 'fs_08'; state.fusion.runs.ep2.current = 'f2_00'; state.fusion.chapter = 'ep2';
      showFusionNode('ep2', 'f2_00'); while (document.querySelector('[data-fusion-page-next]')) continueFusionPage(); chooseFusion(0);
      check('Second chapter uses narrative chat counts only', state.fusion.runs.ep2.flags.chatHub && !('aff' in state.fusion.runs.ep2));
      state.fusion.runs.rl.flags.yrYes = true;
      fusionChat('悦柔');
      check('First chat with YueRou remains visible before her arrangement request', document.querySelector('.fusion-message')?.textContent.includes('雪山') && state.fusion.runs.ep2.flags.yrPending);
      continueFusionMain();
      check('Adding YueRou in chapter one restores her arrangement request after the first chapter-two chat', state.fusion.runs.ep2.current === 'f2_yrask' && $('view-fusion').innerText.includes('想请你帮我编一下'));
      while (document.querySelector('[data-fusion-page-next]')) continueFusionPage(); chooseFusion(0);
      fusionChat('垃垃');
      check('Chat is persisted as a count', state.fusion.runs.ep2.chats['垃垃'] === 1 && state.fusion.runs.ep2.chatTotal === 2);
      continueFusionMain();
      check('Accepting the arrangement request restores the next-day micro-film invitation', state.fusion.runs.ep2.current === 'f2_yrmv' && $('view-fusion').innerText.includes('主题曲就是你编的那段'));
      const copy = cleanState(JSON.parse(JSON.stringify(state)));
      check('Fusion progress survives save cleaning', copy.fusion.runs.rl.done.includes('fs_00') && copy.fusion.runs.ep2.chats['垃垃'] === 1 && copy.affinity.jerry === 21);
      save(); return out;
    });
    const fusionAssets = await page.evaluate(() => [...new Set(FUSION_ART.map(art => ASSETS[art.asset]))]);
    for (const asset of fusionAssets)
      assert(await page.evaluate(async src => { const img = new Image(); img.src = src; try { await img.decode(); return img.naturalWidth > 0 && img.naturalHeight > 0; } catch { return false; } }, asset), `Fusion artwork failed to load: ${asset}`);
    await page.reload();
    assert(await page.evaluate(() => state.affinity.jerry === 21 && state.fusion.runs.ep2.chats['垃垃'] === 1), 'Actual reload preserves Jerry and fusion progress');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { state.fusion.chapter = null; route('fusion'); });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Fusion hub fits mobile');
    await page.evaluate(() => { state.fusion.runs.rl = freshFusionRun(); enterFusionChapter('rl'); });
    assert(await page.evaluate(() => getComputedStyle(document.querySelector('.cp-novel-art')).paddingTop === '0px' && getComputedStyle(document.querySelector('.cp-novel-art img')).objectFit === 'cover'), 'Fusion reader uses the shared edge-free mobile art rule');
    await page.evaluate(() => { state.fusion.chapter = null; route('fusion'); });
    await page.evaluate(() => { state.fusion.runs.fm = freshFusionRun(); state.fusion.chapter = 'fm'; openFusionPool('story'); });
    assert(await page.evaluate(() => {
      const grid = document.querySelector('.fusion-chat-grid'), action = document.querySelector('.fusion-pool-actions');
      const gridRect = grid.getBoundingClientRect(), actionRect = action.getBoundingClientRect();
      return getComputedStyle(grid).gridTemplateColumns.split(' ').length === 1
        && actionRect.top - gridRect.bottom >= 11
        && document.documentElement.scrollWidth <= innerWidth;
    }), 'Fusion chat actions stack with spacing and no overflow on mobile');
    assert.deepEqual(errors, []);
    console.log(`PASS: ${checks.length} Jerry/fusion checks, actual reload, mobile layout, no runtime errors.`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
