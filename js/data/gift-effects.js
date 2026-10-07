'use strict';

// Keyed by recipient. The giver determines the film, never the current card.
const COMFORT_GIFTS = Object.freeze({
    feihong: Object.freeze({ id: 'baoshi_comfort', name: '宝石的安慰', giver: 'baoshi', variant: 'warm' }),
    baoshi: Object.freeze({ id: 'feihong_comfort', name: '飞鸿的安慰', giver: 'feihong', variant: 'cool' })
});
const QIQI_TRANSFORMATION_GIFT = Object.freeze({ id: 'qiqi_transformation', name: '柒柒的华丽变装' });
const KONGGE_NOODLE_GIFT = Object.freeze({ id: 'kongge_peanut_noodles', name: '花生酱拌面' });
const KONGGE_BEEF_BALLS_GIFT = Object.freeze({ id: 'kongge_beef_balls', name: '牛肉丸' });
const TIM_TRANSFORMATION_GIFT = Object.freeze({ id: 'tim_transformation', name: 'Tim 的华丽转身' });

// Explicit character + gift IDs. No reward, save data, or text inference here.
const GIFT_EFFECT_THEMES = {
    coffee: { title: '留一杯温柔', colors: ['#eac99a', '#ad784f'], notes: [659.25, 783.99, 987.77], wave: 'sine', motion: 'ember' },
    bouquet: { title: '把安可送给你', colors: ['#f6b3cd', '#d779a2'], notes: [783.99, 1046.5, 1318.5], wave: 'sine', motion: 'ribbon' },
    star: { title: '为你摘一颗星', colors: ['#ffe7a5', '#bda1e9'], notes: [1318.5, 1568, 2093], wave: 'sine', motion: 'comet' },
    camera: { title: '珍藏这一瞬', colors: ['#bce2ef', '#8e9cc7'], notes: [523.25, 783.99, 1046.5], wave: 'triangle', motion: 'stage' },
    tea: { title: '今天也甜一点', colors: ['#ecc7a4', '#d594a8'], notes: [659.25, 880, 1046.5], wave: 'sine', motion: 'water' },
    cake: { title: '甜蜜切片', colors: ['#ffc8d3', '#e27f98'], notes: [1046.5, 1318.5, 1568], wave: 'sine', motion: 'comet' },
    score: { title: '心意写进乐章', colors: ['#e5d4a9', '#9bb8d7'], notes: [523.25, 659.25, 783.99], wave: 'triangle', motion: 'string' },
    headphones: { title: '只听见你的频率', colors: ['#b6e1ee', '#a993e2'], notes: [261.63, 392, 523.25], wave: 'sine', motion: 'beat' },
    beer: { title: '为这一刻碰杯', colors: ['#ffda8f', '#e89f58'], notes: [783.99, 1174.66, 1568], wave: 'sine', motion: 'water' },
    hotpot: { title: '人间烟火，为你沸腾', colors: ['#ffbd75', '#f27868'], notes: [392, 523.25, 659.25], wave: 'triangle', motion: 'ember' },
    grill: { title: '深夜补给，热烈登场', colors: ['#ffce80', '#df8265'], notes: [329.63, 493.88, 659.25], wave: 'triangle', motion: 'ember' },
    drum: { title: '这一拍，击中心跳', colors: ['#b3f4f6', '#a187fa'], notes: [196, 392, 587.33], wave: 'triangle', motion: 'beat' },
    pick: { title: '拨动一束极光', colors: ['#b6ffde', '#c096ff'], notes: [659.25, 987.77, 1318.5], wave: 'triangle', motion: 'ribbon' },
    strings: { title: '把心弦重新点亮', colors: ['#b4e7ff', '#b19be5'], notes: [329.63, 493.88, 659.25, 987.77], wave: 'triangle', motion: 'string' },
    racket: { title: '一拍，划破星空', colors: ['#d6ffb2', '#71d8d5'], notes: [523.25, 1046.5, 1568], wave: 'sine', motion: 'comet' },
    mountain: { title: '奔赴下一座雪山', colors: ['#b4fff1', '#8496e8'], notes: [523.25, 783.99, 1174.66], wave: 'sine', motion: 'aurora' },
    plant: { title: '把春天放在你身边', colors: ['#d2f9be', '#7cbfa8'], notes: [659.25, 880, 1318.5], wave: 'sine', motion: 'ribbon' },
    duck: { title: '快乐小鸭，闪亮出航', colors: ['#ffe594', '#80dbed'], notes: [698.46, 880, 1396.91], wave: 'sine', motion: 'water' },
    candy: { title: '把一点甜藏进日常', colors: ['#e4f7e5', '#c79bdf'], notes: [1174.66, 1568, 1760], wave: 'sine', motion: 'comet' },
    ribbon: { title: '温柔，系成一个结', colors: ['#f1c6e6', '#9c88cf'], notes: [783.99, 987.77, 1568], wave: 'sine', motion: 'ribbon' },
    concert: { title: '今夜，舞台属于你', colors: ['#e0c1ff', '#7ae6ee'], notes: [523.25, 659.25, 783.99, 1046.5], wave: 'triangle', motion: 'stage' },
    notebook: { title: '写下属于你的下一页', colors: ['#f4dfb2', '#aea5ef'], notes: [523.25, 698.46, 1046.5], wave: 'sine', motion: 'string' },
    cocktail: { title: '拾光，在杯中流转', colors: ['#ffd09f', '#e38bad'], notes: [880, 1318.5, 1760], wave: 'sine', motion: 'water' },
    encore: { title: '心动安可 · 为你闪耀', colors: ['#ffb5db', '#b695ef'], notes: [523.25, 659.25, 783.99], wave: 'sine', motion: 'encore' },
    comfort: { title: '此刻有我 · 安心相伴', colors: ['#f8d7ba', '#b8a0db'], notes: [261.63, 329.63, 392], wave: 'sine', motion: 'encore' },
    transformation: { title: '柒柒 · 华丽变装', colors: ['#f5a7a1', '#d8ad75'], notes: [523.25, 783.99, 1046.5], wave: 'sine', motion: 'encore' },
    noodles: { title: '花生酱拌面 · 暖心补给', colors: ['#f3cf91', '#b8784f'], notes: [392, 523.25, 659.25], wave: 'sine', motion: 'encore' },
    beefballs: { title: '牛肉丸 · 暖心补给', colors: ['#f6d99f', '#b9805d'], notes: [392, 523.25, 698.46], wave: 'sine', motion: 'encore' },
    timTransformation: { title: 'Tim · 华丽登台', colors: ['#ffe1a1', '#bd9b75'], notes: [659.25, 783.99, 1046.5], wave: 'sine', motion: 'encore' },
    full: { title: '青霄御龙 · 满心相伴', colors: ['#b7ffea', '#b9a2e3'], notes: [1046.5, 1318.5, 1568, 2093], wave: 'sine', motion: 'dragon' }
};
const GIFT_EFFECT_BINDINGS = {
    tang: { body: { theme: 'camera', variant: 'camera' }, card: { theme: 'camera', variant: 'memory' }, tea: { theme: 'coffee', variant: 'hot' } },
    lala: { coffee: { theme: 'coffee', variant: 'iced' } },
    azhe: { flowers: { theme: 'bouquet' } },
    shiyuan: { milkTea: { theme: 'tea' }, cake: { theme: 'cake', variant: 'strawberry' }, star: { theme: 'star' }, bouquet: { theme: 'bouquet' } },
    zhu: { coffee: { theme: 'coffee', variant: 'iced' } },
    yeshiyang: { pour: { theme: 'coffee', variant: 'hot' } },
    kongge: { score: { theme: 'score' } },
    dijie: { coffee: { theme: 'coffee', variant: 'hot' }, headphones: { theme: 'headphones' } },
    rek: { tea: { theme: 'tea', variant: 'plain' } },
    aqi: { coffee: { theme: 'coffee', variant: 'hot' } },
    lemon: { tea: { theme: 'tea', variant: 'plain' } },
    xiaozhou: { tea: { theme: 'tea' }, score: { theme: 'score', variant: 'folder' } },
    goose: { coffee: { theme: 'coffee', variant: 'iced' }, headphones: { theme: 'headphones' }, score: { theme: 'score' } },
    dayang: { beer: { theme: 'beer' } },
    baoshi: { honey: { theme: 'coffee', variant: 'honey' }, cake: { theme: 'cake', variant: 'cream' } },
    huangyx: { coffee: { theme: 'coffee', variant: 'hot' } },
    jerry: { coffee: { theme: 'coffee', variant: 'iced' }, beer: { theme: 'beer' } },
    yuerou: { vlog: { theme: 'camera', variant: 'camera' }, film: { theme: 'camera', variant: 'slate' } },
    laodu: { harmony_page: { theme: 'score' } },
    xuezi: { headphones: { theme: 'headphones' }, harmony: { theme: 'score' } }
};
const GIFT_EFFECT_ADDITIONS = {
    "lala": {
        "notebook": {
            "theme": "notebook"
        },
        "pen": {
            "theme": "notebook",
            "variant": "pen"
        }
    },
    "azhe": {
        "mint": {
            "theme": "candy",
            "variant": "mint"
        }
    },
    "zhu": {
        "candy": {
            "theme": "candy"
        },
        "night": {
            "theme": "cocktail"
        }
    },
    "yeshiyang": {
        "lozenge": {
            "theme": "candy"
        },
        "accounts": {
            "theme": "notebook",
            "variant": "ledger"
        },
        "square": {
            "theme": "ribbon",
            "variant": "square"
        }
    },
    "feihong": {
        "sweet": {
            "theme": "candy"
        }
    },
    "kongge": {
        "icecream": {
            "theme": "cake",
            "variant": "icecream"
        }
    },
    "dijie": {
        "duck": {
            "theme": "duck"
        }
    },
    "rek": {
        "strings": {
            "theme": "strings",
            "variant": "bass"
        }
    },
    "aqi": {
        "cable": {
            "theme": "strings",
            "variant": "cable"
        }
    },
    "qiqi": {
        "ticket": {
            "theme": "concert",
            "variant": "ticket"
        },
        "compliment": {
            "theme": "ribbon",
            "variant": "button"
        }
    },
    "tim": {
        "plant": {
            "theme": "plant"
        },
        "duet": {
            "theme": "concert",
            "variant": "duet"
        },
        "offwork": {
            "theme": "concert",
            "variant": "offwork"
        }
    },
    "xiaozhou": {
        "praise": {
            "theme": "concert",
            "variant": "encore"
        }
    },
    "xiaota": {
        "sticks": {
            "theme": "drum"
        }
    },
    "dayang": {
        "picks": {
            "theme": "pick"
        },
        "center": {
            "theme": "concert",
            "variant": "center"
        }
    },
    "baoshi": {
        "ribbon": {
            "theme": "ribbon"
        },
        "dress": {
            "theme": "ribbon",
            "variant": "tie"
        }
    },
    "huangyx": {
        "minutes": {
            "theme": "notebook",
            "variant": "ledger"
        },
        "respect": {
            "theme": "concert",
            "variant": "encore"
        }
    },
    "jerry": {
        "hotpot": {
            "theme": "hotpot"
        },
        "steak": {
            "theme": "grill",
            "variant": "steak"
        }
    },
    "yuerou": {
        "racket": {
            "theme": "racket"
        },
        "hiking": {
            "theme": "mountain"
        }
    },
    "laodu": {
        "late_bbq": {
            "theme": "grill",
            "variant": "skewers"
        }
    },
    "xiaojie": {
        "pick": {
            "theme": "pick"
        },
        "strings": {
            "theme": "strings",
            "variant": "guitar"
        },
        "amp_battery": {
            "theme": "concert",
            "variant": "battery"
        }
    }
};
for (const [id, gifts] of Object.entries(GIFT_EFFECT_ADDITIONS)) {
    GIFT_EFFECT_BINDINGS[id] = { ...GIFT_EFFECT_BINDINGS[id], ...gifts };
}

function giftEffectFor(characterId, giftId) {
    const character = CARD_DEFS.find(c => c.id === characterId);
    if (!character || character.placeholder) return null;
    const comfort = COMFORT_GIFTS[characterId];
    if (comfort?.id === giftId) return { theme: 'comfort', title: comfort.name, variant: comfort.variant, giver: comfort.giver };
    if (characterId === 'qiqi' && giftId === QIQI_TRANSFORMATION_GIFT.id) return { theme: 'transformation', title: QIQI_TRANSFORMATION_GIFT.name };
    if (characterId === 'kongge' && giftId === KONGGE_NOODLE_GIFT.id) return { theme: 'noodles', title: KONGGE_NOODLE_GIFT.name };
    if (characterId === 'kongge' && giftId === KONGGE_BEEF_BALLS_GIFT.id) return { theme: 'beefballs', title: KONGGE_BEEF_BALLS_GIFT.name };
    if (characterId === 'tim' && giftId === TIM_TRANSFORMATION_GIFT.id) return { theme: 'timTransformation', title: TIM_TRANSFORMATION_GIFT.name };
    if (giftId === 'heartfelt_encore') return { theme: 'encore', title: '心动安可' };
    if (giftId === 'full_bond') return { theme: 'full', title: '满心礼盒' };
    if (!(character.gifts || []).some(g => g[0] === giftId)) return null;
    return GIFT_EFFECT_BINDINGS[characterId]?.[giftId] || null;
}
