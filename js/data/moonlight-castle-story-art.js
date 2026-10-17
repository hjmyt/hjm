'use strict';
// Authored physical scene states; regenerated with scripts/build-moonlight-castle-horror.cjs.
const CASTLE_STORY_ART = {
  "version": 4,
  "eventPhaseBindings": {
    "object.musicbox.empty": {
      "loop1": "musicbox-empty-loop1",
      "loop2": "musicbox-empty",
      "loop3": "musicbox-empty-loop3",
      "dawn": "musicbox-empty-dawn"
    },
    "object.violin.empty": {
      "loop1": "violin-case-empty-loop1",
      "loop2": "violin-case-empty",
      "loop3": "violin-case-empty-loop3",
      "dawn": "violin-case-empty-dawn"
    },
    "object.mirror.broken": {
      "loop1": "mirror-broken-loop1",
      "loop2": "mirror-broken",
      "loop3": "mirror-broken-loop3",
      "dawn": "mirror-broken-dawn"
    },
    "object.mirror.reflection": {
      "loop2": "mirror-felix-reflection",
      "loop3": "mirror-felix-reflection-loop3",
      "dawn": "mirror-felix-reflection-dawn"
    },
    "object.musicbox.freed": {
      "loop2": "musicbox-soul-freed",
      "loop3": "musicbox-soul-freed-loop3",
      "dawn": "musicbox-soul-freed-dawn"
    },
    "adrian.soul-protection": {
      "loop2": "adrian-soul-protection",
      "loop3": "adrian-soul-protection-loop3"
    },
    "adrian.candle-repelled": {
      "loop2": "adrian-candle-repelled",
      "loop3": "adrian-candle-repelled-loop3"
    }
  },
  "scenes": {
    "hall-loop1": {
      "id": "hall-loop1",
      "asset": "assets/moonlight-castle/horror-v4/hall-loop1.webp",
      "room": "hall",
      "phase": "loop1",
      "visibleCast": [
        "yeshiyang",
        "tim"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "yeshiyang",
          "x": 43,
          "y": 61
        },
        {
          "id": "tim",
          "x": 65,
          "y": 61
        }
      ],
      "objectRegions": {
        "piano": {
          "outline": [
            [
              0,
              48
            ],
            [
              34,
              48
            ],
            [
              34,
              87
            ],
            [
              0,
              87
            ]
          ],
          "layer": 1
        },
        "armor": {
          "outline": [
            [
              86,
              31
            ],
            [
              100,
              31
            ],
            [
              100,
              76
            ],
            [
              86,
              76
            ]
          ],
          "layer": 1
        },
        "tapestry": {
          "outline": [
            [
              32,
              0
            ],
            [
              68,
              0
            ],
            [
              68,
              24
            ],
            [
              65,
              23
            ],
            [
              62,
              23
            ],
            [
              59,
              26
            ],
            [
              58,
              34
            ],
            [
              50,
              34
            ],
            [
              49,
              29
            ],
            [
              46,
              25
            ],
            [
              42,
              24
            ],
            [
              39,
              27
            ],
            [
              38,
              34
            ],
            [
              32,
              34
            ]
          ],
          "layer": 1
        },
        "candle": {
          "outline": [
            [
              4,
              47
            ],
            [
              10,
              47
            ],
            [
              10,
              63
            ],
            [
              4,
              63
            ]
          ],
          "layer": 3
        }
      },
      "doors": [
        {
          "room": "study",
          "label": "书房门",
          "x": 10,
          "y": 30
        },
        {
          "room": "dining",
          "label": "餐厅门",
          "x": 84,
          "y": 30
        }
      ],
      "isEvent": false,
      "geometryKey": "hall-loop1",
      "alt": "First entry. The fireplace has only a few WEAK RED EMBERS and thin smoke, no tall orange fire. Empty armor stands upright far right facing entrance; its hand is locked shut. Sebastian is tense beside Tim. Cobweb-covered square piano and old tapestry are intact.",
      "source": "assets/moonlight-castle/source/horror-v4/hall-loop1.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/hall-loop1.txt",
      "storyBeat": "First entry. The fireplace has only a few WEAK RED EMBERS and thin smoke, no tall orange fire. Empty armor stands upright far right facing entrance; its hand is locked shut. Sebastian is tense beside Tim. Cobweb-covered square piano and old tapestry are intact."
    },
    "hall-loop2": {
      "id": "hall-loop2",
      "asset": "assets/moonlight-castle/horror-v4/hall-loop2.webp",
      "room": "hall",
      "phase": "loop2",
      "visibleCast": [
        "yeshiyang",
        "tim"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "yeshiyang",
          "x": 43,
          "y": 61
        },
        {
          "id": "tim",
          "x": 65,
          "y": 61
        }
      ],
      "objectRegions": {
        "piano": {
          "outline": [
            [
              0,
              48
            ],
            [
              34,
              48
            ],
            [
              34,
              87
            ],
            [
              0,
              87
            ]
          ],
          "layer": 1
        },
        "armor": {
          "outline": [
            [
              86,
              31
            ],
            [
              100,
              31
            ],
            [
              100,
              76
            ],
            [
              86,
              76
            ]
          ],
          "layer": 1
        },
        "tapestry": {
          "outline": [
            [
              32,
              0
            ],
            [
              68,
              0
            ],
            [
              68,
              24
            ],
            [
              65,
              23
            ],
            [
              62,
              23
            ],
            [
              59,
              26
            ],
            [
              58,
              34
            ],
            [
              50,
              34
            ],
            [
              49,
              29
            ],
            [
              46,
              25
            ],
            [
              42,
              24
            ],
            [
              39,
              27
            ],
            [
              38,
              34
            ],
            [
              32,
              34
            ]
          ],
          "layer": 1
        },
        "candle": {
          "outline": [
            [
              4,
              47
            ],
            [
              10,
              47
            ],
            [
              10,
              63
            ],
            [
              4,
              63
            ]
          ],
          "layer": 3
        }
      },
      "doors": [
        {
          "room": "study",
          "label": "书房门",
          "x": 10,
          "y": 30
        },
        {
          "room": "dining",
          "label": "餐厅门",
          "x": 84,
          "y": 30
        }
      ],
      "isEvent": false,
      "geometryKey": "hall-loop2",
      "alt": "Second loop. Fireplace TOTALLY DEAD and BLACK, tapestry stained dark maroon. Empty armor at right has changed posture, turned toward the WALL and a slashed old portrait, one arm beginning to reach that way. Tim living bareheaded knight has faint cracks in his breastplate. Keep both living men and room architecture.",
      "source": "assets/moonlight-castle/source/horror-v4/hall-loop2.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/hall-loop2.txt",
      "storyBeat": "Second loop. Fireplace TOTALLY DEAD and BLACK, tapestry stained dark maroon. Empty armor at right has changed posture, turned toward the WALL and a slashed old portrait, one arm beginning to reach that way. Tim living bareheaded knight has faint cracks in his breastplate. Keep both living men and room architecture."
    },
    "hall-loop3": {
      "id": "hall-loop3",
      "asset": "assets/moonlight-castle/horror-v4/hall-loop3.webp",
      "room": "hall",
      "phase": "loop3",
      "visibleCast": [
        "yeshiyang",
        "tim"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "yeshiyang",
          "x": 43,
          "y": 61
        },
        {
          "id": "tim",
          "x": 65,
          "y": 61
        }
      ],
      "objectRegions": {
        "piano": {
          "outline": [
            [
              0,
              48
            ],
            [
              34,
              48
            ],
            [
              34,
              87
            ],
            [
              0,
              87
            ]
          ],
          "layer": 1
        },
        "armor": {
          "outline": [
            [
              73,
              78
            ],
            [
              84,
              74
            ],
            [
              89,
              69
            ],
            [
              97,
              68
            ],
            [
              100,
              72
            ],
            [
              100,
              87
            ],
            [
              89,
              89
            ],
            [
              83,
              85
            ],
            [
              73,
              85
            ]
          ],
          "layer": 1
        },
        "tapestry": {
          "outline": [
            [
              32,
              0
            ],
            [
              68,
              0
            ],
            [
              68,
              24
            ],
            [
              65,
              23
            ],
            [
              62,
              23
            ],
            [
              59,
              26
            ],
            [
              58,
              34
            ],
            [
              50,
              34
            ],
            [
              49,
              29
            ],
            [
              46,
              25
            ],
            [
              42,
              24
            ],
            [
              39,
              27
            ],
            [
              38,
              34
            ],
            [
              32,
              34
            ]
          ],
          "layer": 1
        },
        "candle": {
          "outline": [
            [
              4,
              47
            ],
            [
              10,
              47
            ],
            [
              10,
              63
            ],
            [
              4,
              63
            ]
          ],
          "layer": 3
        }
      },
      "doors": [
        {
          "room": "study",
          "label": "书房门",
          "x": 10,
          "y": 30
        },
        {
          "room": "dining",
          "label": "餐厅门",
          "x": 84,
          "y": 30
        }
      ],
      "isEvent": false,
      "geometryKey": "hall-loop3",
      "alt": "Third loop. Fireplace reignited with clearly BLUE supernatural flame, no orange flame. Empty helmeted armor has FALLEN ON FLOOR at far right, one gauntlet grips HALF A SHEET OF MUSIC. Living bareheaded Tim still stands center-right. Sebastian wearing visible little silver cross stands near blue fireplace.",
      "source": "assets/moonlight-castle/source/horror-v4/hall-loop3.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/hall-loop3.txt",
      "storyBeat": "Third loop. Fireplace reignited with clearly BLUE supernatural flame, no orange flame. Empty helmeted armor has FALLEN ON FLOOR at far right, one gauntlet grips HALF A SHEET OF MUSIC. Living bareheaded Tim still stands center-right. Sebastian wearing visible little silver cross stands near blue fireplace."
    },
    "dining-loop1": {
      "id": "dining-loop1",
      "asset": "assets/moonlight-castle/horror-v4/dining-loop1.webp",
      "room": "dining",
      "phase": "loop1",
      "visibleCast": [
        "bingbing",
        "baoshi",
        "feihong"
      ],
      "paintedCast": [
        "adrian",
        "felix"
      ],
      "groupException": "Explicit room group: each named character is physically present and interactable",
      "positions": [
        {
          "id": "bingbing",
          "x": 49,
          "y": 50
        },
        {
          "id": "baoshi",
          "x": 66,
          "y": 55
        },
        {
          "id": "feihong",
          "x": 82,
          "y": 55
        }
      ],
      "objectRegions": {
        "table": {
          "outline": [
            [
              0,
              46
            ],
            [
              40,
              51
            ],
            [
              86,
              65
            ],
            [
              87,
              76
            ],
            [
              49,
              84
            ],
            [
              10,
              73
            ],
            [
              0,
              66
            ]
          ],
          "layer": 1
        },
        "portrait_dining": {
          "outline": [
            [
              21,
              0
            ],
            [
              45,
              0
            ],
            [
              45,
              33
            ],
            [
              21,
              33
            ]
          ],
          "layer": 1
        },
        "musicbox": {
          "outline": [
            [
              42,
              62
            ],
            [
              55,
              62
            ],
            [
              55,
              74
            ],
            [
              42,
              74
            ]
          ],
          "layer": 3
        },
        "mirror": {
          "outline": [
            [
              89,
              0
            ],
            [
              100,
              0
            ],
            [
              100,
              51
            ],
            [
              89,
              51
            ]
          ],
          "layer": 1
        }
      },
      "doors": [
        {
          "room": "hall",
          "label": "返回大厅",
          "x": 7,
          "y": 25
        },
        {
          "room": "cellar",
          "label": "地下室暗门",
          "x": 69,
          "y": 87
        }
      ],
      "isEvent": false,
      "geometryKey": "dining-loop1",
      "alt": "First-loop untouched dinner, fruit and plates. Portrait is definitely two adult MEN together; Felix face is freshly slashed across the whole face, face paint scraped away so facial features are hard to identify, Adrian recognizable but shadowed. Bingbing white crinoline dress, Baoshi ornate gothic vampire suit, Feihong lavish Lestat-inspired dark plum court coat. No modern shirts. Closed little music box on runner.",
      "source": "assets/moonlight-castle/source/horror-v4/dining-loop1.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/dining-loop1.txt",
      "storyBeat": "First-loop untouched dinner, fruit and plates. Portrait is definitely two adult MEN together; Felix face is freshly slashed across the whole face, face paint scraped away so facial features are hard to identify, Adrian recognizable but shadowed. Bingbing white crinoline dress, Baoshi ornate gothic vampire suit, Feihong lavish Lestat-inspired dark plum court coat. No modern shirts. Closed little music box on runner."
    },
    "dining-loop2": {
      "id": "dining-loop2",
      "asset": "assets/moonlight-castle/horror-v4/dining-loop2.webp",
      "room": "dining",
      "phase": "loop2",
      "visibleCast": [
        "bingbing",
        "baoshi",
        "feihong"
      ],
      "paintedCast": [
        "adrian",
        "felix"
      ],
      "groupException": "Explicit room group: each named character is physically present and interactable",
      "positions": [
        {
          "id": "bingbing",
          "x": 49,
          "y": 50
        },
        {
          "id": "baoshi",
          "x": 66,
          "y": 55
        },
        {
          "id": "feihong",
          "x": 82,
          "y": 55
        }
      ],
      "objectRegions": {
        "table": {
          "outline": [
            [
              0,
              46
            ],
            [
              40,
              51
            ],
            [
              86,
              65
            ],
            [
              87,
              76
            ],
            [
              49,
              84
            ],
            [
              10,
              73
            ],
            [
              0,
              66
            ]
          ],
          "layer": 1
        },
        "portrait_dining": {
          "outline": [
            [
              21,
              0
            ],
            [
              45,
              0
            ],
            [
              45,
              33
            ],
            [
              21,
              33
            ]
          ],
          "layer": 1
        },
        "musicbox": {
          "outline": [
            [
              42,
              62
            ],
            [
              55,
              62
            ],
            [
              55,
              74
            ],
            [
              42,
              74
            ]
          ],
          "layer": 3
        },
        "mirror": {
          "outline": [
            [
              89,
              0
            ],
            [
              100,
              0
            ],
            [
              100,
              51
            ],
            [
              89,
              51
            ]
          ],
          "layer": 1
        }
      },
      "doors": [
        {
          "room": "hall",
          "label": "返回大厅",
          "x": 7,
          "y": 25
        },
        {
          "room": "cellar",
          "label": "地下室暗门",
          "x": 69,
          "y": 87
        }
      ],
      "isEvent": false,
      "geometryKey": "dining-loop2",
      "alt": "Second loop. The dinner has ROTTED: wilted flowers, blackened fruit, decayed uneaten meal, dark tarnished plates. Double male portrait drips small dark-red streaks from freshly slashed Felix face. Bingbing now has fine blood tears down her cheeks. Baoshi/Feihong cower near each other at right; hold hands for support. No graphic wounds. Tall mirror remains intact before optional examine.",
      "source": "assets/moonlight-castle/source/horror-v4/dining-loop2.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/dining-loop2.txt",
      "storyBeat": "Second loop. The dinner has ROTTED: wilted flowers, blackened fruit, decayed uneaten meal, dark tarnished plates. Double male portrait drips small dark-red streaks from freshly slashed Felix face. Bingbing now has fine blood tears down her cheeks. Baoshi/Feihong cower near each other at right; hold hands for support. No graphic wounds. Tall mirror remains intact before optional examine."
    },
    "dining-loop3": {
      "id": "dining-loop3",
      "asset": "assets/moonlight-castle/horror-v4/dining-loop3.webp",
      "room": "dining",
      "phase": "loop3",
      "visibleCast": [
        "bingbing"
      ],
      "paintedCast": [
        "adrian",
        "felix"
      ],
      "groupException": null,
      "positions": [
        {
          "id": "bingbing",
          "x": 49,
          "y": 50
        }
      ],
      "objectRegions": {
        "table": {
          "outline": [
            [
              0,
              46
            ],
            [
              40,
              51
            ],
            [
              86,
              65
            ],
            [
              87,
              76
            ],
            [
              49,
              84
            ],
            [
              10,
              73
            ],
            [
              0,
              66
            ]
          ],
          "layer": 1
        },
        "portrait_dining": {
          "outline": [
            [
              21,
              0
            ],
            [
              45,
              0
            ],
            [
              45,
              33
            ],
            [
              21,
              33
            ]
          ],
          "layer": 1
        },
        "musicbox": {
          "outline": [
            [
              42,
              62
            ],
            [
              55,
              62
            ],
            [
              55,
              74
            ],
            [
              42,
              74
            ]
          ],
          "layer": 3
        },
        "mirror": {
          "outline": [
            [
              89,
              0
            ],
            [
              100,
              0
            ],
            [
              100,
              51
            ],
            [
              89,
              51
            ]
          ],
          "layer": 1
        }
      },
      "doors": [
        {
          "room": "hall",
          "label": "返回大厅",
          "x": 7,
          "y": 25
        },
        {
          "room": "cellar",
          "label": "地下室暗门",
          "x": 69,
          "y": 87
        }
      ],
      "isEvent": false,
      "geometryKey": "dining-loop3",
      "alt": "Third loop. Baoshi and Feihong are physically ABSENT. Only Bingbing in white hoop-skirt remains. A small folded NOTE lies where the two men stood. Two-men portrait has repaired/complete silhouettes in court dress, but their FACES are VEILED BY DEEP SHADOW, subtly discernible not a blank frame. This is the before-reveal game frame. Music box still closed. Preserve same camera and all furniture.",
      "source": "assets/moonlight-castle/source/horror-v4/dining-loop3.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/dining-loop3.txt",
      "storyBeat": "Third loop. Baoshi and Feihong are physically ABSENT. Only Bingbing in white hoop-skirt remains. A small folded NOTE lies where the two men stood. Two-men portrait has repaired/complete silhouettes in court dress, but their FACES are VEILED BY DEEP SHADOW, subtly discernible not a blank frame. This is the before-reveal game frame. Music box still closed. Preserve same camera and all furniture."
    },
    "dining-dawn": {
      "id": "dining-dawn",
      "asset": "assets/moonlight-castle/horror-v4/dining-dawn.webp",
      "room": "dining",
      "phase": "dawn",
      "visibleCast": [
        "bingbing"
      ],
      "paintedCast": [
        "adrian",
        "felix"
      ],
      "groupException": null,
      "positions": [
        {
          "id": "bingbing",
          "x": 49,
          "y": 50
        }
      ],
      "objectRegions": {
        "table": {
          "outline": [
            [
              0,
              46
            ],
            [
              40,
              51
            ],
            [
              86,
              65
            ],
            [
              87,
              76
            ],
            [
              49,
              84
            ],
            [
              10,
              73
            ],
            [
              0,
              66
            ]
          ],
          "layer": 1
        },
        "portrait_dining": {
          "outline": [
            [
              21,
              0
            ],
            [
              45,
              0
            ],
            [
              45,
              33
            ],
            [
              21,
              33
            ]
          ],
          "layer": 1
        },
        "musicbox": {
          "outline": [
            [
              36.5,
              60.5
            ],
            [
              49,
              60.5
            ],
            [
              49,
              72.5
            ],
            [
              36.5,
              72.5
            ]
          ],
          "layer": 3
        },
        "mirror": {
          "outline": [
            [
              89,
              0
            ],
            [
              100,
              0
            ],
            [
              100,
              51
            ],
            [
              89,
              51
            ]
          ],
          "layer": 1
        }
      },
      "doors": [
        {
          "room": "hall",
          "label": "返回大厅",
          "x": 7,
          "y": 25
        },
        {
          "room": "cellar",
          "label": "地下室暗门",
          "x": 69,
          "y": 87
        }
      ],
      "isEvent": false,
      "geometryKey": "dining-dawn",
      "alt": "Morning. Only Bingbing in white hoop-skirt, serene no blood. Dinner table now set for exactly TWO places facing one another, WHITE ROSES, no rotten food. Fully restored double male painting with Baoshi-faced Adrian and glasses-wearing Feihong-faced Felix looking at one another. Soft morning light, no threatening shadows.",
      "source": "assets/moonlight-castle/source/horror-v4/dining-dawn.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/dining-dawn.txt",
      "storyBeat": "Morning. Only Bingbing in white hoop-skirt, serene no blood. Dinner table now set for exactly TWO places facing one another, WHITE ROSES, no rotten food. Fully restored double male painting with Baoshi-faced Adrian and glasses-wearing Feihong-faced Felix looking at one another. Soft morning light, no threatening shadows."
    },
    "study-loop1": {
      "id": "study-loop1",
      "asset": "assets/moonlight-castle/horror-v4/study-loop1.webp",
      "room": "study",
      "phase": "loop1",
      "visibleCast": [
        "dijie",
        "qiqi"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "dijie",
          "x": 41,
          "y": 61
        },
        {
          "id": "qiqi",
          "x": 65,
          "y": 61
        }
      ],
      "objectRegions": {
        "bookshelf": {
          "outline": [
            [
              18,
              0
            ],
            [
              69,
              0
            ],
            [
              69,
              13
            ],
            [
              57,
              13
            ],
            [
              57,
              10
            ],
            [
              35,
              10
            ],
            [
              32,
              18
            ],
            [
              30,
              27
            ],
            [
              30,
              61
            ],
            [
              18,
              61
            ]
          ],
          "layer": 1
        },
        "globe": {
          "outline": [
            [
              79,
              35
            ],
            [
              100,
              35
            ],
            [
              100,
              69
            ],
            [
              79,
              69
            ]
          ],
          "layer": 1
        },
        "flute_stand": {
          "outline": [
            [
              3,
              52
            ],
            [
              28,
              52
            ],
            [
              28,
              87
            ],
            [
              3,
              87
            ]
          ],
          "layer": 3
        }
      },
      "doors": [
        {
          "room": "hall",
          "label": "返回大厅",
          "x": 8,
          "y": 26
        },
        {
          "room": "music",
          "label": "音乐室门",
          "x": 95,
          "y": 26
        }
      ],
      "isEvent": false,
      "geometryKey": "study-loop1",
      "alt": "First loop. Dijie in SONG HANFU subtle bamboo-leaf upper robe holds his bamboo flute. Qiqi in dark purple fortune teller gown holds tarot, exactly two people. Five puzzle book spines stand out on shelf. Old globe, flute rack, desk/quill can all be inspected. Dust and cobwebs, almost-black back shelves.",
      "source": "assets/moonlight-castle/source/horror-v4/study-loop1.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/study-loop1.txt",
      "storyBeat": "First loop. Dijie in SONG HANFU subtle bamboo-leaf upper robe holds his bamboo flute. Qiqi in dark purple fortune teller gown holds tarot, exactly two people. Five puzzle book spines stand out on shelf. Old globe, flute rack, desk/quill can all be inspected. Dust and cobwebs, almost-black back shelves."
    },
    "study-loop2": {
      "id": "study-loop2",
      "asset": "assets/moonlight-castle/horror-v4/study-loop2.webp",
      "room": "study",
      "phase": "loop2",
      "visibleCast": [
        "qiqi"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "qiqi",
          "x": 65,
          "y": 61
        }
      ],
      "objectRegions": {
        "bookshelf": {
          "outline": [
            [
              18,
              0
            ],
            [
              77,
              0
            ],
            [
              77,
              14
            ],
            [
              55,
              14
            ],
            [
              54,
              29
            ],
            [
              52,
              40
            ],
            [
              51,
              64
            ],
            [
              27,
              64
            ],
            [
              27,
              56
            ],
            [
              18,
              56
            ]
          ],
          "layer": 1
        },
        "globe": {
          "outline": [
            [
              79,
              35
            ],
            [
              100,
              35
            ],
            [
              100,
              69
            ],
            [
              79,
              69
            ]
          ],
          "layer": 1
        },
        "flute_stand": {
          "outline": [
            [
              3,
              52
            ],
            [
              28,
              52
            ],
            [
              28,
              87
            ],
            [
              3,
              87
            ]
          ],
          "layer": 3
        }
      },
      "doors": [
        {
          "room": "hall",
          "label": "返回大厅",
          "x": 8,
          "y": 26
        },
        {
          "room": "music",
          "label": "音乐室门",
          "x": 95,
          "y": 26
        }
      ],
      "isEvent": false,
      "geometryKey": "study-loop2",
      "alt": "Second loop. Dijie has VANISHED: remove the man entirely; only Qiqi remains on right. A nameless closed book on a shelf has small stamped A&F on cover. Wet FOOTPRINTS lead from the bookcase to left door. His bamboo flute hangs on the left wall/rack without an owner. Empty space where he stood is unsettling.",
      "source": "assets/moonlight-castle/source/horror-v4/study-loop2.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/study-loop2.txt",
      "storyBeat": "Second loop. Dijie has VANISHED: remove the man entirely; only Qiqi remains on right. A nameless closed book on a shelf has small stamped A&F on cover. Wet FOOTPRINTS lead from the bookcase to left door. His bamboo flute hangs on the left wall/rack without an owner. Empty space where he stood is unsettling."
    },
    "study-loop3": {
      "id": "study-loop3",
      "asset": "assets/moonlight-castle/horror-v4/study-loop3.webp",
      "room": "study",
      "phase": "loop3",
      "visibleCast": [
        "qiqi"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "qiqi",
          "x": 65,
          "y": 61
        }
      ],
      "objectRegions": {
        "bookshelf": {
          "outline": [
            [
              18,
              0
            ],
            [
              77,
              0
            ],
            [
              77,
              14
            ],
            [
              55,
              14
            ],
            [
              54,
              29
            ],
            [
              52,
              40
            ],
            [
              51,
              64
            ],
            [
              27,
              64
            ],
            [
              27,
              56
            ],
            [
              18,
              56
            ]
          ],
          "layer": 1
        },
        "globe": {
          "outline": [
            [
              79,
              35
            ],
            [
              100,
              35
            ],
            [
              100,
              69
            ],
            [
              79,
              69
            ]
          ],
          "layer": 1
        },
        "flute_stand": {
          "outline": [
            [
              3,
              52
            ],
            [
              28,
              52
            ],
            [
              28,
              87
            ],
            [
              3,
              87
            ]
          ],
          "layer": 3
        }
      },
      "doors": [
        {
          "room": "hall",
          "label": "返回大厅",
          "x": 8,
          "y": 26
        },
        {
          "room": "music",
          "label": "音乐室门",
          "x": 95,
          "y": 26
        }
      ],
      "isEvent": false,
      "geometryKey": "study-loop3",
      "alt": "Third loop. Dijie is STILL ABSENT. Only Qiqi remains. A CRACKED BAMBOO FLUTE hangs horizontally on left wall/rack, clearly split down bamboo body. ALL library books have OPENED unnaturally: open volumes splayed along shelves, loose pages with repetitive handwritten same name (do not need readable lettering); five puzzle books remain a small accessible group. No modern man holding a flute. The flute display at left contains ONLY ONE HORIZONTAL BAMBOO FLUTE. Remove all vertical bamboo tubes, panpipes and spare flute copies from the old rack. Keep the single horizontally supported flute near x14% y56%.",
      "source": "assets/moonlight-castle/source/horror-v4/study-loop3.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/study-loop3.txt",
      "storyBeat": "Third loop. Dijie is STILL ABSENT. Only Qiqi remains. A CRACKED BAMBOO FLUTE hangs horizontally on left wall/rack, clearly split down bamboo body. ALL library books have OPENED unnaturally: open volumes splayed along shelves, loose pages with repetitive handwritten same name (do not need readable lettering); five puzzle books remain a small accessible group. No modern man holding a flute. The flute display at left contains ONLY ONE HORIZONTAL BAMBOO FLUTE. Remove all vertical bamboo tubes, panpipes and spare flute copies from the old rack. Keep the single horizontally supported flute near x14% y56%."
    },
    "study-dawn": {
      "id": "study-dawn",
      "asset": "assets/moonlight-castle/horror-v4/study-dawn.webp",
      "room": "study",
      "phase": "dawn",
      "visibleCast": [
        "dijie",
        "qiqi"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "dijie",
          "x": 41,
          "y": 61
        },
        {
          "id": "qiqi",
          "x": 65,
          "y": 61
        }
      ],
      "objectRegions": {
        "bookshelf": {
          "outline": [
            [
              18,
              0
            ],
            [
              69,
              0
            ],
            [
              69,
              13
            ],
            [
              57,
              13
            ],
            [
              57,
              10
            ],
            [
              35,
              10
            ],
            [
              32,
              18
            ],
            [
              30,
              27
            ],
            [
              30,
              61
            ],
            [
              18,
              61
            ]
          ],
          "layer": 1
        },
        "globe": {
          "outline": [
            [
              79,
              35
            ],
            [
              100,
              35
            ],
            [
              100,
              69
            ],
            [
              79,
              69
            ]
          ],
          "layer": 1
        },
        "flute_stand": {
          "outline": [
            [
              3,
              52
            ],
            [
              28,
              52
            ],
            [
              28,
              87
            ],
            [
              3,
              87
            ]
          ],
          "layer": 3
        }
      },
      "doors": [
        {
          "room": "hall",
          "label": "返回大厅",
          "x": 8,
          "y": 26
        },
        {
          "room": "music",
          "label": "音乐室门",
          "x": 95,
          "y": 26
        }
      ],
      "isEvent": false,
      "geometryKey": "study-dawn",
      "alt": "Morning. Dijie has returned in same Song Hanfu, bamboo flute SELF-REPAIRED and intact hanging on the wall, with Dijie standing nearby and empty hands; do not duplicate a second flute. Qiqi still here. Old library now peaceful, warm coffee on desk, a new closed book cover shows simple silhouette of TWO MEN holding hands. No blood footprints. No modern clothes. The flute display at left contains ONLY ONE HORIZONTAL BAMBOO FLUTE. Remove all vertical bamboo tubes, panpipes and spare flute copies from the old rack. Keep the single horizontally supported flute near x14% y56%.",
      "source": "assets/moonlight-castle/source/horror-v4/study-dawn.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/study-dawn.txt",
      "storyBeat": "Morning. Dijie has returned in same Song Hanfu, bamboo flute SELF-REPAIRED and intact hanging on the wall, with Dijie standing nearby and empty hands; do not duplicate a second flute. Qiqi still here. Old library now peaceful, warm coffee on desk, a new closed book cover shows simple silhouette of TWO MEN holding hands. No blood footprints. No modern clothes. The flute display at left contains ONLY ONE HORIZONTAL BAMBOO FLUTE. Remove all vertical bamboo tubes, panpipes and spare flute copies from the old rack. Keep the single horizontally supported flute near x14% y56%."
    },
    "music-loop1": {
      "id": "music-loop1",
      "asset": "assets/moonlight-castle/horror-v4/music-loop1.webp",
      "room": "music",
      "phase": "loop1",
      "visibleCast": [
        "jerry"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "jerry",
          "x": 47,
          "y": 60
        }
      ],
      "objectRegions": {
        "harpsichord": {
          "outline": [
            [
              61,
              51
            ],
            [
              67,
              47
            ],
            [
              100,
              47
            ],
            [
              100,
              73
            ],
            [
              94,
              74
            ],
            [
              94,
              87
            ],
            [
              89,
              87
            ],
            [
              88,
              68
            ],
            [
              68,
              67
            ],
            [
              67,
              87
            ],
            [
              63,
              87
            ],
            [
              63,
              67
            ],
            [
              61,
              67
            ]
          ],
          "layer": 1
        },
        "violin_case": {
          "outline": [
            [
              3.5,
              57
            ],
            [
              8,
              55
            ],
            [
              24.5,
              55.5
            ],
            [
              27,
              57
            ],
            [
              27,
              62
            ],
            [
              25,
              64.5
            ],
            [
              6,
              65
            ],
            [
              3.5,
              62
            ]
          ],
          "layer": 2
        }
      },
      "doors": [
        {
          "room": "study",
          "label": "返回书房",
          "x": 8,
          "y": 27
        },
        {
          "room": "bedroom",
          "label": "主卧房门",
          "x": 93,
          "y": 27
        }
      ],
      "isEvent": false,
      "geometryKey": "music-loop1",
      "alt": "First loop. Jerry noble outfit stands alone tuning a trumpet held low. Harpsichord lid closed except keyboard visible, CLOSED LOCKED VIOLIN CASE on table left. Aged dusty room, near-black recesses. No violin outside case.",
      "source": "assets/moonlight-castle/source/horror-v4/music-loop1.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/music-loop1.txt",
      "storyBeat": "First loop. Jerry noble outfit stands alone tuning a trumpet held low. Harpsichord lid closed except keyboard visible, CLOSED LOCKED VIOLIN CASE on table left. Aged dusty room, near-black recesses. No violin outside case."
    },
    "music-loop2": {
      "id": "music-loop2",
      "asset": "assets/moonlight-castle/horror-v4/music-loop2.webp",
      "room": "music",
      "phase": "loop2",
      "visibleCast": [
        "jerry"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "jerry",
          "x": 47,
          "y": 60
        }
      ],
      "objectRegions": {
        "harpsichord": {
          "outline": [
            [
              66,
              51
            ],
            [
              81,
              47
            ],
            [
              84,
              39
            ],
            [
              93,
              24
            ],
            [
              100,
              26
            ],
            [
              100,
              67
            ],
            [
              96,
              70
            ],
            [
              96,
              85
            ],
            [
              92,
              88
            ],
            [
              89,
              87
            ],
            [
              89,
              69
            ],
            [
              69,
              66
            ],
            [
              69,
              83
            ],
            [
              66,
              88
            ],
            [
              63,
              87
            ],
            [
              64,
              66
            ],
            [
              63,
              61
            ]
          ],
          "layer": 1
        },
        "violin_case": {
          "outline": [
            [
              1,
              48
            ],
            [
              29,
              48
            ],
            [
              29,
              65
            ],
            [
              1,
              65
            ]
          ],
          "layer": 2
        }
      },
      "doors": [
        {
          "room": "study",
          "label": "返回书房",
          "x": 8,
          "y": 27
        },
        {
          "room": "bedroom",
          "label": "主卧房门",
          "x": 93,
          "y": 27
        }
      ],
      "isEvent": false,
      "geometryKey": "music-loop2",
      "alt": "Second loop. Harpsichord upper LID OPEN, STRINGS visibly exposed with subtle vibration. Violin CASE is OPEN AND EMPTY, velvet lining visible, NO VIOLIN inside it. Jerry noble outfit with a tiny blood trace at his ear, looks worried at instrument, trumpet held low.",
      "source": "assets/moonlight-castle/source/horror-v4/music-loop2.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/music-loop2.txt",
      "storyBeat": "Second loop. Harpsichord upper LID OPEN, STRINGS visibly exposed with subtle vibration. Violin CASE is OPEN AND EMPTY, velvet lining visible, NO VIOLIN inside it. Jerry noble outfit with a tiny blood trace at his ear, looks worried at instrument, trumpet held low."
    },
    "music-loop3": {
      "id": "music-loop3",
      "asset": "assets/moonlight-castle/horror-v4/music-loop3.webp",
      "room": "music",
      "phase": "loop3",
      "visibleCast": [
        "jerry"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "jerry",
          "x": 47,
          "y": 60
        }
      ],
      "objectRegions": {
        "harpsichord": {
          "outline": [
            [
              66,
              51
            ],
            [
              81,
              47
            ],
            [
              88,
              38
            ],
            [
              100,
              28
            ],
            [
              100,
              67
            ],
            [
              96,
              70
            ],
            [
              96,
              85
            ],
            [
              92,
              88
            ],
            [
              89,
              87
            ],
            [
              89,
              69
            ],
            [
              69,
              66
            ],
            [
              69,
              83
            ],
            [
              66,
              88
            ],
            [
              63,
              87
            ],
            [
              64,
              66
            ],
            [
              63,
              61
            ]
          ],
          "layer": 1
        },
        "violin_case": {
          "outline": [
            [
              1,
              48
            ],
            [
              29,
              48
            ],
            [
              29,
              65
            ],
            [
              1,
              65
            ]
          ],
          "layer": 2
        }
      },
      "doors": [
        {
          "room": "study",
          "label": "返回书房",
          "x": 8,
          "y": 27
        },
        {
          "room": "bedroom",
          "label": "主卧房门",
          "x": 93,
          "y": 27
        }
      ],
      "isEvent": false,
      "geometryKey": "music-loop3",
      "alt": "Third loop. Jerry noble outfit witnesses a VIOLIN AND BOW PLAYING BY THEMSELVES above open empty case, very subtle blue aura; harpsichord open strings accompany by themselves. Violin is one complete physically coherent instrument, correctly curved bow and four strings. Jerry holds trumpet low ready for final note.",
      "source": "assets/moonlight-castle/source/horror-v4/music-loop3.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/music-loop3.txt",
      "storyBeat": "Third loop. Jerry noble outfit witnesses a VIOLIN AND BOW PLAYING BY THEMSELVES above open empty case, very subtle blue aura; harpsichord open strings accompany by themselves. Violin is one complete physically coherent instrument, correctly curved bow and four strings. Jerry holds trumpet low ready for final note."
    },
    "music-dawn": {
      "id": "music-dawn",
      "asset": "assets/moonlight-castle/horror-v4/music-dawn.webp",
      "room": "music",
      "phase": "dawn",
      "visibleCast": [
        "jerry"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "jerry",
          "x": 47,
          "y": 60
        }
      ],
      "objectRegions": {
        "harpsichord": {
          "outline": [
            [
              61,
              51
            ],
            [
              67,
              47
            ],
            [
              100,
              47
            ],
            [
              100,
              73
            ],
            [
              94,
              74
            ],
            [
              94,
              87
            ],
            [
              89,
              87
            ],
            [
              88,
              68
            ],
            [
              68,
              67
            ],
            [
              67,
              87
            ],
            [
              63,
              87
            ],
            [
              63,
              67
            ],
            [
              61,
              67
            ]
          ],
          "layer": 1
        },
        "violin_case": {
          "outline": [
            [
              3.5,
              57
            ],
            [
              8,
              55
            ],
            [
              24.5,
              55.5
            ],
            [
              27,
              57
            ],
            [
              27,
              62
            ],
            [
              25,
              64.5
            ],
            [
              6,
              65
            ],
            [
              3.5,
              62
            ]
          ],
          "layer": 2
        }
      },
      "doors": [
        {
          "room": "study",
          "label": "返回书房",
          "x": 8,
          "y": 27
        },
        {
          "room": "bedroom",
          "label": "主卧房门",
          "x": 93,
          "y": 27
        }
      ],
      "isEvent": false,
      "geometryKey": "music-dawn",
      "alt": "Morning. Jerry in noble costume calmly holds small TUNING FORK, trumpet rests on table, old violin and harpsichord STATIC not floating. Warm stained-glass-colored light patches on floor. Instruments at peace.",
      "source": "assets/moonlight-castle/source/horror-v4/music-dawn.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/music-dawn.txt",
      "storyBeat": "Morning. Jerry in noble costume calmly holds small TUNING FORK, trumpet rests on table, old violin and harpsichord STATIC not floating. Warm stained-glass-colored light patches on floor. Instruments at peace."
    },
    "bedroom-loop1": {
      "id": "bedroom-loop1",
      "asset": "assets/moonlight-castle/horror-v4/bedroom-loop1.webp",
      "room": "bedroom",
      "phase": "loop1",
      "visibleCast": [
        "shiyuan"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "shiyuan",
          "x": 57,
          "y": 61
        }
      ],
      "objectRegions": {
        "bed": {
          "outline": [
            [
              15,
              0
            ],
            [
              70,
              0
            ],
            [
              70,
              18
            ],
            [
              66,
              18
            ],
            [
              65,
              35
            ],
            [
              48,
              35
            ],
            [
              48,
              76
            ],
            [
              19,
              72
            ],
            [
              15,
              60
            ]
          ],
          "layer": 1
        },
        "dresser": {
          "outline": [
            [
              71,
              20
            ],
            [
              100,
              20
            ],
            [
              100,
              80
            ],
            [
              71,
              80
            ]
          ],
          "layer": 1
        }
      },
      "doors": [
        {
          "room": "music",
          "label": "返回音乐室",
          "x": 7,
          "y": 26
        }
      ],
      "isEvent": false,
      "geometryKey": "bedroom-loop1",
      "alt": "First loop. Heavy bed curtains hang LOW; thin DUST coats dressing table, clock and dusty intact oval mirror. Shiyuan in proper black long-sleeve maid dress and white apron trembles slightly, hands clasped. Few weak candles, very dark canopy interior. No rings unconditionally displayed.",
      "source": "assets/moonlight-castle/source/horror-v4/bedroom-loop1.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/bedroom-loop1.txt",
      "storyBeat": "First loop. Heavy bed curtains hang LOW; thin DUST coats dressing table, clock and dusty intact oval mirror. Shiyuan in proper black long-sleeve maid dress and white apron trembles slightly, hands clasped. Few weak candles, very dark canopy interior. No rings unconditionally displayed."
    },
    "bedroom-loop2": {
      "id": "bedroom-loop2",
      "asset": "assets/moonlight-castle/horror-v4/bedroom-loop2.webp",
      "room": "bedroom",
      "phase": "loop2",
      "visibleCast": [
        "shiyuan"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "shiyuan",
          "x": 57,
          "y": 61
        }
      ],
      "objectRegions": {
        "bed": {
          "outline": [
            [
              15,
              0
            ],
            [
              70,
              0
            ],
            [
              70,
              18
            ],
            [
              66,
              18
            ],
            [
              65,
              35
            ],
            [
              48,
              35
            ],
            [
              48,
              76
            ],
            [
              19,
              72
            ],
            [
              15,
              60
            ]
          ],
          "layer": 1
        },
        "dresser": {
          "outline": [
            [
              71,
              20
            ],
            [
              100,
              20
            ],
            [
              100,
              80
            ],
            [
              71,
              80
            ]
          ],
          "layer": 1
        }
      },
      "doors": [
        {
          "room": "music",
          "label": "返回音乐室",
          "x": 7,
          "y": 26
        }
      ],
      "isEvent": false,
      "geometryKey": "bedroom-loop2",
      "alt": "Second loop. Bed pillow shows a deep HEAD-SHAPED INDENT though no one lies there. Tall dressing mirror SHATTERED: broken glass scattered on floor, jagged frame. Shiyuan maid with calm unnerving expression and subtly RED eyes. Keep darker night and no sunshine.",
      "source": "assets/moonlight-castle/source/horror-v4/bedroom-loop2.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/bedroom-loop2.txt",
      "storyBeat": "Second loop. Bed pillow shows a deep HEAD-SHAPED INDENT though no one lies there. Tall dressing mirror SHATTERED: broken glass scattered on floor, jagged frame. Shiyuan maid with calm unnerving expression and subtly RED eyes. Keep darker night and no sunshine."
    },
    "bedroom-loop3": {
      "id": "bedroom-loop3",
      "asset": "assets/moonlight-castle/horror-v4/bedroom-loop3.webp",
      "room": "bedroom",
      "phase": "loop3",
      "visibleCast": [
        "shiyuan"
      ],
      "paintedCast": [
        "adrian",
        "felix"
      ],
      "groupException": null,
      "positions": [
        {
          "id": "shiyuan",
          "x": 19,
          "y": 58
        }
      ],
      "objectRegions": {
        "bed": {
          "outline": [
            [
              15,
              0
            ],
            [
              70,
              0
            ],
            [
              70,
              80
            ],
            [
              29,
              80
            ],
            [
              29,
              37
            ],
            [
              28,
              25
            ],
            [
              26,
              20
            ],
            [
              15,
              20
            ]
          ],
          "layer": 1
        },
        "dresser": {
          "outline": [
            [
              71,
              20
            ],
            [
              100,
              20
            ],
            [
              100,
              80
            ],
            [
              71,
              80
            ]
          ],
          "layer": 1
        }
      },
      "doors": [
        {
          "room": "music",
          "label": "返回音乐室",
          "x": 7,
          "y": 26
        }
      ],
      "isEvent": false,
      "geometryKey": "bedroom-loop3",
      "alt": "Third loop. Exactly TWO plain GOLD RINGS lie together on bed at x35% y57%, subtle engraving A&F. Mirror has repaired itself but reflects a SNOWY HISTORIC WINTER NIGHT and two remote male silhouettes in period clothes, not current room. Shiyuan in proper maid outfit stands closer to left doorway, at x53%.",
      "source": "assets/moonlight-castle/source/horror-v4/bedroom-loop3.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/bedroom-loop3.txt",
      "storyBeat": "Third loop. Exactly TWO plain GOLD RINGS lie together on bed at x35% y57%, subtle engraving A&F. Mirror has repaired itself but reflects a SNOWY HISTORIC WINTER NIGHT and two remote male silhouettes in period clothes, not current room. Shiyuan in proper maid outfit stands closer to left doorway, at x53%."
    },
    "bedroom-dawn": {
      "id": "bedroom-dawn",
      "asset": "assets/moonlight-castle/horror-v4/bedroom-dawn.webp",
      "room": "bedroom",
      "phase": "dawn",
      "visibleCast": [
        "shiyuan"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "shiyuan",
          "x": 57,
          "y": 61
        }
      ],
      "objectRegions": {
        "bed": {
          "outline": [
            [
              15,
              0
            ],
            [
              70,
              0
            ],
            [
              70,
              18
            ],
            [
              66,
              18
            ],
            [
              65,
              35
            ],
            [
              48,
              35
            ],
            [
              48,
              76
            ],
            [
              19,
              72
            ],
            [
              15,
              60
            ]
          ],
          "layer": 1
        },
        "dresser": {
          "outline": [
            [
              71,
              20
            ],
            [
              100,
              20
            ],
            [
              100,
              80
            ],
            [
              71,
              80
            ]
          ],
          "layer": 1
        }
      },
      "doors": [
        {
          "room": "music",
          "label": "返回音乐室",
          "x": 7,
          "y": 26
        }
      ],
      "isEvent": false,
      "geometryKey": "bedroom-dawn",
      "alt": "Morning. Clean WHITE bed sheets, two rings together remain on bed. Repaired intact oval mirror reflects the CURRENT ROOM accurately, not snowy night. Shiyuan maid calm normal brown eyes. Gentle morning sunlight, no glass shards.",
      "source": "assets/moonlight-castle/source/horror-v4/bedroom-dawn.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/bedroom-dawn.txt",
      "storyBeat": "Morning. Clean WHITE bed sheets, two rings together remain on bed. Repaired intact oval mirror reflects the CURRENT ROOM accurately, not snowy night. Shiyuan maid calm normal brown eyes. Gentle morning sunlight, no glass shards."
    },
    "cellar-loop1": {
      "id": "cellar-loop1",
      "asset": "assets/moonlight-castle/horror-v4/cellar-loop1.webp",
      "room": "cellar",
      "phase": "loop1",
      "visibleCast": [
        "lala"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "lala",
          "x": 60,
          "y": 61
        }
      ],
      "objectRegions": {
        "wine": {
          "outline": [
            [
              27,
              13
            ],
            [
              60,
              13
            ],
            [
              61,
              27
            ],
            [
              50,
              28
            ],
            [
              48,
              40
            ],
            [
              46,
              68
            ],
            [
              27,
              68
            ]
          ],
          "layer": 1
        }
      },
      "doors": [
        {
          "room": "dining",
          "label": "返回餐厅",
          "x": 8,
          "y": 25
        },
        {
          "room": "tower",
          "label": "塔楼楼梯",
          "x": 88,
          "y": 25
        }
      ],
      "isEvent": false,
      "geometryKey": "cellar-loop1",
      "alt": "First loop, candles illuminate only one small corner; no bright fill. Wine racks upright and intact. Lala purple witch with side ponytail/pale bow cradles an intact crystal ball containing DARK RED MIST. Walls damp stone; old bottle distinguishable but no floating glows.",
      "source": "assets/moonlight-castle/source/horror-v4/cellar-loop1.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/cellar-loop1.txt",
      "storyBeat": "First loop, candles illuminate only one small corner; no bright fill. Wine racks upright and intact. Lala purple witch with side ponytail/pale bow cradles an intact crystal ball containing DARK RED MIST. Walls damp stone; old bottle distinguishable but no floating glows."
    },
    "cellar-loop2": {
      "id": "cellar-loop2",
      "asset": "assets/moonlight-castle/horror-v4/cellar-loop2.webp",
      "room": "cellar",
      "phase": "loop2",
      "visibleCast": [
        "lala"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "lala",
          "x": 60,
          "y": 61
        }
      ],
      "objectRegions": {
        "wine": {
          "outline": [
            [
              27,
              13
            ],
            [
              60,
              13
            ],
            [
              61,
              27
            ],
            [
              50,
              28
            ],
            [
              48,
              40
            ],
            [
              46,
              68
            ],
            [
              27,
              68
            ]
          ],
          "layer": 1
        }
      },
      "doors": [
        {
          "room": "dining",
          "label": "返回餐厅",
          "x": 8,
          "y": 25
        },
        {
          "room": "tower",
          "label": "塔楼楼梯",
          "x": 88,
          "y": 25
        }
      ],
      "isEvent": false,
      "geometryKey": "cellar-loop2",
      "alt": "Second loop. BLOODY HANDPRINTS climb the stone walls all the way to the vaulted CEILING. Crystal ball in Lala hands has a clear CRACK with faint red mist leaking out. Wine racks still intact. Horror cold shadow, no graphic injury.",
      "source": "assets/moonlight-castle/source/horror-v4/cellar-loop2.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/cellar-loop2.txt",
      "storyBeat": "Second loop. BLOODY HANDPRINTS climb the stone walls all the way to the vaulted CEILING. Crystal ball in Lala hands has a clear CRACK with faint red mist leaking out. Wine racks still intact. Horror cold shadow, no graphic injury."
    },
    "cellar-loop3": {
      "id": "cellar-loop3",
      "asset": "assets/moonlight-castle/horror-v4/cellar-loop3.webp",
      "room": "cellar",
      "phase": "loop3",
      "visibleCast": [
        "lala"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "lala",
          "x": 60,
          "y": 61
        }
      ],
      "objectRegions": {
        "wine": {
          "outline": [
            [
              29,
              10
            ],
            [
              42,
              17
            ],
            [
              40,
              30
            ],
            [
              42,
              48
            ],
            [
              50,
              58
            ],
            [
              49,
              65
            ],
            [
              46,
              73
            ],
            [
              43,
              80
            ],
            [
              39,
              88
            ],
            [
              27,
              91
            ],
            [
              27,
              81
            ],
            [
              25,
              74
            ],
            [
              17,
              58
            ],
            [
              14,
              48
            ],
            [
              22,
              48
            ],
            [
              24,
              36
            ],
            [
              25,
              23
            ]
          ],
          "layer": 1
        }
      },
      "doors": [
        {
          "room": "dining",
          "label": "返回餐厅",
          "x": 8,
          "y": 25
        },
        {
          "room": "tower",
          "label": "通往塔楼的暗门",
          "x": 48,
          "y": 35
        }
      ],
      "isEvent": false,
      "geometryKey": "cellar-loop3",
      "alt": "Third loop. Wine RACK HAS COLLAPSED to left, exposing a dark SECRET DOOR in wall behind it. Dark-red handprints link as a line toward that doorway. Lala crystal sphere now EMPTY, clear lifeless glass, NOT red luminous orb. Broken wooden shelves/bottles coherent, room mostly pitch-black.",
      "source": "assets/moonlight-castle/source/horror-v4/cellar-loop3.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/cellar-loop3.txt",
      "storyBeat": "Third loop. Wine RACK HAS COLLAPSED to left, exposing a dark SECRET DOOR in wall behind it. Dark-red handprints link as a line toward that doorway. Lala crystal sphere now EMPTY, clear lifeless glass, NOT red luminous orb. Broken wooden shelves/bottles coherent, room mostly pitch-black."
    },
    "cellar-dawn": {
      "id": "cellar-dawn",
      "asset": "assets/moonlight-castle/horror-v4/cellar-dawn.webp",
      "room": "cellar",
      "phase": "dawn",
      "visibleCast": [
        "lala"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "lala",
          "x": 60,
          "y": 61
        }
      ],
      "objectRegions": {
        "wine": {
          "outline": [
            [
              29,
              5
            ],
            [
              49,
              10
            ],
            [
              60,
              17
            ],
            [
              59,
              25
            ],
            [
              55,
              31
            ],
            [
              53,
              42
            ],
            [
              51,
              55
            ],
            [
              49,
              65
            ],
            [
              45,
              76
            ],
            [
              31,
              76
            ],
            [
              29,
              66
            ]
          ],
          "layer": 1
        }
      },
      "doors": [
        {
          "room": "dining",
          "label": "返回餐厅",
          "x": 8,
          "y": 25
        },
        {
          "room": "tower",
          "label": "塔楼楼梯",
          "x": 88,
          "y": 25
        }
      ],
      "isEvent": false,
      "geometryKey": "cellar-dawn",
      "alt": "Morning peace UNDERGROUND. Wine racks restored UPRIGHT, one very old wine bottle prominent on shelf, paper label 1791 if possible. Lala holds COMPLETELY CLEAR crystal sphere, no blood mist, walls free of blood. Soft local lantern light, tiny bounce from stairway, NO invented big sunny window.",
      "source": "assets/moonlight-castle/source/horror-v4/cellar-dawn.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/cellar-dawn.txt",
      "storyBeat": "Morning peace UNDERGROUND. Wine racks restored UPRIGHT, one very old wine bottle prominent on shelf, paper label 1791 if possible. Lala holds COMPLETELY CLEAR crystal sphere, no blood mist, walls free of blood. Soft local lantern light, tiny bounce from stairway, NO invented big sunny window."
    },
    "tower-loop1": {
      "id": "tower-loop1",
      "asset": "assets/moonlight-castle/horror-v4/tower-loop1.webp",
      "room": "tower",
      "phase": "loop1",
      "visibleCast": [],
      "paintedCast": [],
      "groupException": null,
      "positions": [],
      "objectRegions": {
        "organ": {
          "outline": [
            [
              8,
              53
            ],
            [
              15,
              51
            ],
            [
              15,
              23
            ],
            [
              25,
              15
            ],
            [
              31,
              0
            ],
            [
              42,
              0
            ],
            [
              46,
              19
            ],
            [
              52,
              38
            ],
            [
              52,
              55
            ],
            [
              57,
              56
            ],
            [
              57,
              78
            ],
            [
              49,
              80
            ],
            [
              48,
              66
            ],
            [
              30,
              64
            ],
            [
              29,
              80
            ],
            [
              10,
              80
            ]
          ],
          "layer": 1
        }
      },
      "doors": [
        {
          "room": "cellar",
          "label": "返回地下室",
          "x": 94,
          "y": 27
        }
      ],
      "isEvent": false,
      "geometryKey": "tower-loop1",
      "alt": "First approach. EMPTY tower with organ and full moon. NO people, no count yet. Closed old music score on stand, menacing shadows and narrow moon shaft. No bright golden candles. Dramatic uncertain dark space.",
      "source": "assets/moonlight-castle/source/horror-v4/tower-loop1.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/tower-loop1.txt",
      "storyBeat": "First approach. EMPTY tower with organ and full moon. NO people, no count yet. Closed old music score on stand, menacing shadows and narrow moon shaft. No bright golden candles. Dramatic uncertain dark space."
    },
    "tower-loop2": {
      "id": "tower-loop2",
      "asset": "assets/moonlight-castle/horror-v4/tower-loop2.webp",
      "room": "tower",
      "phase": "loop2",
      "visibleCast": [],
      "paintedCast": [],
      "groupException": null,
      "positions": [],
      "objectRegions": {
        "organ": {
          "outline": [
            [
              8,
              53
            ],
            [
              15,
              51
            ],
            [
              15,
              23
            ],
            [
              25,
              15
            ],
            [
              31,
              0
            ],
            [
              42,
              0
            ],
            [
              46,
              19
            ],
            [
              52,
              38
            ],
            [
              52,
              55
            ],
            [
              57,
              56
            ],
            [
              57,
              78
            ],
            [
              49,
              80
            ],
            [
              48,
              66
            ],
            [
              30,
              64
            ],
            [
              29,
              80
            ],
            [
              10,
              80
            ]
          ],
          "layer": 1
        }
      },
      "doors": [
        {
          "room": "cellar",
          "label": "返回地下室",
          "x": 94,
          "y": 27
        }
      ],
      "isEvent": false,
      "geometryKey": "tower-loop2",
      "alt": "Second-loop arrival. Count is ABSENT. Half a MUSIC SCORE on organ stand. Rectangular door-shaped patch of MOONLIGHT falls on stone floor beneath tall window. Empty bench and no person. Barely lit cold dark tower.",
      "source": "assets/moonlight-castle/source/horror-v4/tower-loop2.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/tower-loop2.txt",
      "storyBeat": "Second-loop arrival. Count is ABSENT. Half a MUSIC SCORE on organ stand. Rectangular door-shaped patch of MOONLIGHT falls on stone floor beneath tall window. Empty bench and no person. Barely lit cold dark tower."
    },
    "tower-loop3": {
      "id": "tower-loop3",
      "asset": "assets/moonlight-castle/horror-v4/tower-loop3.webp",
      "room": "tower",
      "phase": "loop3",
      "visibleCast": [
        "adrian"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "adrian",
          "x": 66,
          "y": 60
        }
      ],
      "objectRegions": {
        "organ": {
          "outline": [
            [
              8,
              53
            ],
            [
              15,
              51
            ],
            [
              15,
              23
            ],
            [
              25,
              15
            ],
            [
              31,
              0
            ],
            [
              42,
              0
            ],
            [
              46,
              19
            ],
            [
              52,
              38
            ],
            [
              52,
              55
            ],
            [
              57,
              56
            ],
            [
              57,
              78
            ],
            [
              49,
              80
            ],
            [
              48,
              66
            ],
            [
              30,
              64
            ],
            [
              29,
              80
            ],
            [
              10,
              80
            ]
          ],
          "layer": 1
        }
      },
      "doors": [
        {
          "room": "cellar",
          "label": "返回地下室",
          "x": 94,
          "y": 27
        }
      ],
      "isEvent": false,
      "geometryKey": "tower-loop3",
      "alt": "Third loop. Adrian with Baoshi card face, soft youthful adult expression and dark court noble costume stands around x66% in moon shaft holding HALF A MUSIC SCORE. Calm yearning instead of snarling, faint red eyes. Organ left remains accessible, no second man physically present.",
      "source": "assets/moonlight-castle/source/horror-v4/tower-loop3.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/tower-loop3.txt",
      "storyBeat": "Third loop. Adrian with Baoshi card face, soft youthful adult expression and dark court noble costume stands around x66% in moon shaft holding HALF A MUSIC SCORE. Calm yearning instead of snarling, faint red eyes. Organ left remains accessible, no second man physically present."
    },
    "tower-dawn": {
      "id": "tower-dawn",
      "asset": "assets/moonlight-castle/horror-v4/tower-dawn.webp",
      "room": "tower",
      "phase": "dawn",
      "visibleCast": [
        "adrian",
        "felix"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "adrian",
          "x": 44,
          "y": 62
        },
        {
          "id": "felix",
          "x": 66,
          "y": 62
        }
      ],
      "objectRegions": {
        "organ": {
          "outline": [
            [
              8,
              0
            ],
            [
              40,
              0
            ],
            [
              40,
              20
            ],
            [
              34,
              28
            ],
            [
              30,
              41
            ],
            [
              31,
              76
            ],
            [
              28,
              80
            ],
            [
              10,
              80
            ]
          ],
          "layer": 1
        }
      },
      "doors": [
        {
          "room": "cellar",
          "label": "返回地下室",
          "x": 94,
          "y": 27
        }
      ],
      "isEvent": false,
      "geometryKey": "tower-dawn",
      "alt": "Dawn. Adrian stands around x61% in a SIMPLE WHITE SHIRT, eyes warm AMBER (not red), relaxed smile. A warm TRANSLUCENT FELIX spirit (Feihong face, BLACK hair, GLASSES, period court clothes) stands near him x75%, separate distinct face. Open complete score on organ stand, soft golden sunrise through window. No modern vampire costume on Adrian, no angry eyes.",
      "source": "assets/moonlight-castle/source/horror-v4/tower-dawn.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/tower-dawn.txt",
      "storyBeat": "Dawn. Adrian stands around x61% in a SIMPLE WHITE SHIRT, eyes warm AMBER (not red), relaxed smile. A warm TRANSLUCENT FELIX spirit (Feihong face, BLACK hair, GLASSES, period court clothes) stands near him x75%, separate distinct face. Open complete score on organ stand, soft golden sunrise through window. No modern vampire costume on Adrian, no angry eyes."
    },
    "hall-morning": {
      "id": "hall-morning",
      "asset": "assets/moonlight-castle/horror-v4/hall-morning.webp",
      "room": "hall",
      "phase": "dawn",
      "visibleCast": [
        "yeshiyang",
        "tim",
        "baoshi",
        "feihong",
        "bingbing",
        "dijie",
        "jerry",
        "qiqi",
        "shiyuan",
        "lala"
      ],
      "paintedCast": [],
      "groupException": "原文明确十位乐团同伴在大厅醒来，十名各一次，旧世伯爵与灵影不加入",
      "positions": [
        {
          "id": "yeshiyang",
          "x": 43,
          "y": 61
        },
        {
          "id": "tim",
          "x": 57,
          "y": 61
        },
        {
          "id": "baoshi",
          "x": 78,
          "y": 55
        },
        {
          "id": "feihong",
          "x": 83,
          "y": 55
        },
        {
          "id": "bingbing",
          "x": 69,
          "y": 73
        },
        {
          "id": "dijie",
          "x": 29,
          "y": 81
        },
        {
          "id": "jerry",
          "x": 31,
          "y": 38.5
        },
        {
          "id": "qiqi",
          "x": 12,
          "y": 77
        },
        {
          "id": "shiyuan",
          "x": 19,
          "y": 62
        },
        {
          "id": "lala",
          "x": 94,
          "y": 65
        }
      ],
      "objectRegions": {
        "piano": {
          "outline": [
            [
              0,
              37
            ],
            [
              5,
              40
            ],
            [
              8,
              45
            ],
            [
              8,
              50
            ],
            [
              6,
              53
            ],
            [
              6,
              62
            ],
            [
              3,
              65
            ],
            [
              3,
              71
            ],
            [
              0,
              71
            ]
          ],
          "layer": 1
        },
        "armor": {
          "outline": [
            [
              85,
              81
            ],
            [
              91,
              78
            ],
            [
              96,
              73
            ],
            [
              100,
              74
            ],
            [
              100,
              92
            ],
            [
              95,
              94
            ],
            [
              85,
              91
            ],
            [
              84,
              86
            ]
          ],
          "layer": 1
        },
        "tapestry": {
          "outline": [
            [
              32,
              0
            ],
            [
              68,
              0
            ],
            [
              68,
              34
            ],
            [
              63,
              34
            ],
            [
              62,
              29
            ],
            [
              59,
              25
            ],
            [
              55,
              25
            ],
            [
              52,
              29
            ],
            [
              51,
              34
            ],
            [
              49,
              34
            ],
            [
              48,
              29
            ],
            [
              45,
              26
            ],
            [
              41,
              26
            ],
            [
              38,
              30
            ],
            [
              37,
              34
            ],
            [
              35,
              34
            ],
            [
              34,
              29
            ],
            [
              32,
              29
            ]
          ],
          "layer": 1
        },
        "candle": {
          "outline": [
            [
              3.8,
              45.5
            ],
            [
              6.3,
              45.5
            ],
            [
              6.3,
              56
            ],
            [
              3.8,
              56
            ]
          ],
          "layer": 3
        }
      },
      "doors": [
        {
          "room": "study",
          "label": "书房门",
          "x": 10,
          "y": 30
        },
        {
          "room": "dining",
          "label": "餐厅门",
          "x": 90,
          "y": 25
        }
      ],
      "isEvent": false,
      "geometryKey": "hall-morning",
      "alt": "ALL TEN modern party members awaken in hall, each appears exactly once and recognizable. Orange fireplace warmly burns; lifeless EMPTY HELMETED ARMOR lies on right floor clutching half-score (do not confuse with bareheaded living Tim). Full-body or knee-up ensemble arranged in shallow arc, NOT two people with invented extra names. Left to right: Qiqi purple tarot shawl, Shiyuan black/white maid at kitchen doorway holding BREAD TRAY, Jerry glasses embroidered noble suit holding trumpet low, Dijie pale Song Hanfu flute on knees seated, Yeshiyang black butler silver cross, Tim bareheaded silver armor, Bingbing white CRINOLINE skirt, Baoshi black ornate vampire clothes, Feihong black-haired GLASSES plum courtcoat holding Baoshi hand, Lala purple witch sideponytail/pale bow clear sphere. Square piano left, tapestry/fireplace center, doors at extremes. Warm relief, first safe sunlight.",
      "source": "assets/moonlight-castle/source/horror-v4/hall-morning.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/hall-morning.txt",
      "storyBeat": "ALL TEN modern party members awaken in hall, each appears exactly once and recognizable. Orange fireplace warmly burns; lifeless EMPTY HELMETED ARMOR lies on right floor clutching half-score (do not confuse with bareheaded living Tim). Full-body or knee-up ensemble arranged in shallow arc, NOT two people with invented extra names. Left to right: Qiqi purple tarot shawl, Shiyuan black/white maid at kitchen doorway holding BREAD TRAY, Jerry glasses embroidered noble suit holding trumpet low, Dijie pale Song Hanfu flute on knees seated, Yeshiyang black butler silver cross, Tim bareheaded silver armor, Bingbing white CRINOLINE skirt, Baoshi black ornate vampire clothes, Feihong black-haired GLASSES plum courtcoat holding Baoshi hand, Lala purple witch sideponytail/pale bow clear sphere. Square piano left, tapestry/fireplace center, doors at extremes. Warm relief, first safe sunlight."
    },
    "hall-loop2-examine-armor": {
      "id": "hall-loop2-examine-armor",
      "asset": "assets/moonlight-castle/horror-v4/hall-loop2-examine-armor.webp",
      "room": "hall",
      "phase": "event",
      "visibleCast": [
        "yeshiyang",
        "tim"
      ],
      "paintedCast": [
        "adrian",
        "felix"
      ],
      "groupException": null,
      "positions": [
        {
          "id": "yeshiyang",
          "x": 43,
          "y": 61
        },
        {
          "id": "tim",
          "x": 65,
          "y": 61
        }
      ],
      "objectRegions": {
        "piano": {
          "outline": [
            [
              0,
              48
            ],
            [
              34,
              48
            ],
            [
              34,
              87
            ],
            [
              0,
              87
            ]
          ],
          "layer": 1
        },
        "armor": {
          "outline": [
            [
              82,
              32
            ],
            [
              100,
              32
            ],
            [
              100,
              78
            ],
            [
              82,
              78
            ]
          ],
          "layer": 1
        },
        "tapestry": {
          "outline": [
            [
              32,
              0
            ],
            [
              68,
              0
            ],
            [
              68,
              24
            ],
            [
              65,
              23
            ],
            [
              62,
              23
            ],
            [
              59,
              26
            ],
            [
              58,
              34
            ],
            [
              50,
              34
            ],
            [
              49,
              29
            ],
            [
              46,
              25
            ],
            [
              42,
              24
            ],
            [
              39,
              27
            ],
            [
              38,
              34
            ],
            [
              32,
              34
            ]
          ],
          "layer": 1
        },
        "candle": {
          "outline": [
            [
              4,
              47
            ],
            [
              10,
              47
            ],
            [
              10,
              63
            ],
            [
              4,
              63
            ]
          ],
          "layer": 3
        }
      },
      "doors": [
        {
          "room": "study",
          "label": "书房门",
          "x": 10,
          "y": 30
        },
        {
          "room": "dining",
          "label": "餐厅门",
          "x": 84,
          "y": 30
        }
      ],
      "isEvent": false,
      "geometryKey": "hall-loop2",
      "alt": "The EMPTY HELMETED ARMOR far right is turned fully to face wall, its gauntlet arm extends toward a visibly SLASHED DOUBLE-MALE PORTRAIT on wall. Rear/three-quarter view of armor, not looking at camera. Fireplace dead. Keep living Sebastian and bareheaded Tim distinct and exact same camera as hall-loop2.",
      "source": "assets/moonlight-castle/source/horror-v4/hall-loop2-examine-armor.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/hall-loop2-examine-armor.txt",
      "storyBeat": "The EMPTY HELMETED ARMOR far right is turned fully to face wall, its gauntlet arm extends toward a visibly SLASHED DOUBLE-MALE PORTRAIT on wall. Rear/three-quarter view of armor, not looking at camera. Fireplace dead. Keep living Sebastian and bareheaded Tim distinct and exact same camera as hall-loop2."
    },
    "hall-dawn-armor-raised": {
      "id": "hall-dawn-armor-raised",
      "asset": "assets/moonlight-castle/horror-v4/hall-dawn-armor-raised.webp",
      "room": "hall",
      "phase": "dawn",
      "visibleCast": [
        "yeshiyang",
        "tim",
        "baoshi",
        "feihong",
        "bingbing",
        "dijie",
        "jerry",
        "qiqi",
        "shiyuan",
        "lala"
      ],
      "paintedCast": [],
      "groupException": "同一实际地点明确在场的群像",
      "positions": [
        {
          "id": "yeshiyang",
          "x": 43,
          "y": 61
        },
        {
          "id": "tim",
          "x": 55,
          "y": 61
        },
        {
          "id": "baoshi",
          "x": 78,
          "y": 55
        },
        {
          "id": "feihong",
          "x": 83,
          "y": 55
        },
        {
          "id": "bingbing",
          "x": 69,
          "y": 73
        },
        {
          "id": "dijie",
          "x": 29,
          "y": 81
        },
        {
          "id": "jerry",
          "x": 31,
          "y": 38.5
        },
        {
          "id": "qiqi",
          "x": 12,
          "y": 77
        },
        {
          "id": "shiyuan",
          "x": 19,
          "y": 62
        },
        {
          "id": "lala",
          "x": 94,
          "y": 65
        }
      ],
      "objectRegions": {
        "piano": {
          "outline": [
            [
              0,
              37
            ],
            [
              5,
              40
            ],
            [
              8,
              45
            ],
            [
              8,
              50
            ],
            [
              6,
              53
            ],
            [
              6,
              62
            ],
            [
              3,
              65
            ],
            [
              3,
              71
            ],
            [
              0,
              71
            ]
          ],
          "layer": 1
        },
        "armor": {
          "outline": [
            [
              64,
              38
            ],
            [
              69,
              38
            ],
            [
              70,
              44
            ],
            [
              68,
              46
            ],
            [
              67,
              46
            ],
            [
              65,
              49
            ],
            [
              65,
              58
            ],
            [
              64,
              63
            ],
            [
              65,
              68
            ],
            [
              63,
              70
            ],
            [
              61,
              66
            ],
            [
              61,
              58
            ],
            [
              61,
              50
            ],
            [
              62,
              46
            ],
            [
              64,
              44
            ]
          ],
          "layer": 1
        },
        "tapestry": {
          "outline": [
            [
              32,
              0
            ],
            [
              68,
              0
            ],
            [
              68,
              34
            ],
            [
              63,
              34
            ],
            [
              62,
              29
            ],
            [
              59,
              25
            ],
            [
              55,
              25
            ],
            [
              52,
              29
            ],
            [
              51,
              34
            ],
            [
              49,
              34
            ],
            [
              48,
              29
            ],
            [
              45,
              26
            ],
            [
              41,
              26
            ],
            [
              38,
              30
            ],
            [
              37,
              34
            ],
            [
              35,
              34
            ],
            [
              34,
              29
            ],
            [
              32,
              29
            ]
          ],
          "layer": 1
        },
        "candle": {
          "outline": [
            [
              3.8,
              45.5
            ],
            [
              6.3,
              45.5
            ],
            [
              6.3,
              56
            ],
            [
              3.8,
              56
            ]
          ],
          "layer": 3
        }
      },
      "doors": [
        {
          "room": "study",
          "label": "书房门",
          "x": 10,
          "y": 30
        },
        {
          "room": "dining",
          "label": "餐厅门",
          "x": 90,
          "y": 25
        }
      ],
      "isEvent": false,
      "geometryKey": "hall-morning",
      "alt": "Same TEN-CHARACTER morning ensemble, preserve every face/clothing/location and warm orange fire. Change only empty helmeted fallen armor at far right: Tim has now stood the EMPTY suit upright facing window, while the living bareheaded Tim remains beside it. Do not erase any companion.",
      "source": "assets/moonlight-castle/source/horror-v4/hall-dawn-armor-raised.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/hall-dawn-armor-raised.txt",
      "storyBeat": "Same TEN-CHARACTER morning ensemble, preserve every face/clothing/location and warm orange fire. Change only empty helmeted fallen armor at far right: Tim has now stood the EMPTY suit upright facing window, while the living bareheaded Tim remains beside it. Do not erase any companion."
    },
    "dining-loop3-portrait-reveal": {
      "id": "dining-loop3-portrait-reveal",
      "asset": "assets/moonlight-castle/horror-v4/dining-loop3-portrait-reveal.webp",
      "room": "dining",
      "phase": "event",
      "visibleCast": [
        "bingbing"
      ],
      "paintedCast": [
        "adrian",
        "felix"
      ],
      "groupException": null,
      "positions": [
        {
          "id": "bingbing",
          "x": 49,
          "y": 50
        }
      ],
      "objectRegions": {
        "table": {
          "outline": [
            [
              0,
              46
            ],
            [
              40,
              51
            ],
            [
              86,
              65
            ],
            [
              87,
              76
            ],
            [
              49,
              84
            ],
            [
              10,
              73
            ],
            [
              0,
              66
            ]
          ],
          "layer": 1
        },
        "portrait_dining": {
          "outline": [
            [
              21,
              0
            ],
            [
              45,
              0
            ],
            [
              45,
              33
            ],
            [
              21,
              33
            ]
          ],
          "layer": 1
        },
        "musicbox": {
          "outline": [
            [
              42,
              62
            ],
            [
              55,
              62
            ],
            [
              55,
              74
            ],
            [
              42,
              74
            ]
          ],
          "layer": 3
        },
        "mirror": {
          "outline": [
            [
              89,
              0
            ],
            [
              100,
              0
            ],
            [
              100,
              51
            ],
            [
              89,
              51
            ]
          ],
          "layer": 1
        }
      },
      "doors": [
        {
          "room": "hall",
          "label": "返回大厅",
          "x": 7,
          "y": 25
        },
        {
          "room": "cellar",
          "label": "地下室暗门",
          "x": 69,
          "y": 87
        }
      ],
      "isEvent": false,
      "geometryKey": "dining-loop3",
      "alt": "EXACT SAME FRAME AND CAMERA as supplied dining-loop3. Change ONLY the dim double painting at left: faces now clear, reveal BAOSHI face as Adrian and FEIHONG face with rectangular glasses as Felix. Both BLACK hair in ornate nineteenth-century court costume, eyes tender, looking at one another. No modern Baoshi/Feihong physically standing in room. All furniture, Bingbing, lighting and dimensions locked pixel-stable.",
      "source": "assets/moonlight-castle/source/horror-v4/dining-loop3-portrait-reveal.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/dining-loop3-portrait-reveal.txt",
      "storyBeat": "EXACT SAME FRAME AND CAMERA as supplied dining-loop3. Change ONLY the dim double painting at left: faces now clear, reveal BAOSHI face as Adrian and FEIHONG face with rectangular glasses as Felix. Both BLACK hair in ornate nineteenth-century court costume, eyes tender, looking at one another. No modern Baoshi/Feihong physically standing in room. All furniture, Bingbing, lighting and dimensions locked pixel-stable."
    },
    "study-loop2-talk-dijie": {
      "id": "study-loop2-talk-dijie",
      "asset": "assets/moonlight-castle/horror-v4/study-loop2-talk-dijie.webp",
      "room": "study",
      "phase": "event",
      "visibleCast": [
        "dijie",
        "qiqi"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "dijie",
          "x": 36,
          "y": 62
        },
        {
          "id": "qiqi",
          "x": 65,
          "y": 63
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": false,
      "geometryKey": "study-loop2",
      "alt": "Dijie who vanished from ordinary exploration appears momentarily as a faint TRANSLUCENT GHOST in his exact SONG HANFU subtle bamboo-leaf robe, no plaid shirt. He holds a CRACKED bamboo flute and looks grave. Qiqi remains to right, footprints and A&F book remain. Same room geography, very dim moonlight.",
      "source": "assets/moonlight-castle/source/horror-v4/study-loop2-talk-dijie.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/study-loop2-talk-dijie.txt",
      "storyBeat": "Dijie who vanished from ordinary exploration appears momentarily as a faint TRANSLUCENT GHOST in his exact SONG HANFU subtle bamboo-leaf robe, no plaid shirt. He holds a CRACKED bamboo flute and looks grave. Qiqi remains to right, footprints and A&F book remain. Same room geography, very dim moonlight."
    },
    "study-loop3-talk-dijie": {
      "id": "study-loop3-talk-dijie",
      "asset": "assets/moonlight-castle/horror-v4/study-loop3-talk-dijie.webp",
      "room": "study",
      "phase": "event",
      "visibleCast": [
        "dijie",
        "qiqi"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "dijie",
          "x": 35,
          "y": 61
        },
        {
          "id": "qiqi",
          "x": 67,
          "y": 75
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": false,
      "geometryKey": "study-loop3",
      "alt": "Absent Dijie appears as TRANSLUCENT GHOST in Song Hanfu and plays a final farewell melody, the crack in bamboo flute visible. Qiqi listens sadly. All books OPEN in shelves. This is brief farewell encounter, not permanent presence.",
      "source": "assets/moonlight-castle/source/horror-v4/study-loop3-talk-dijie.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/study-loop3-talk-dijie.txt",
      "storyBeat": "Absent Dijie appears as TRANSLUCENT GHOST in Song Hanfu and plays a final farewell melody, the crack in bamboo flute visible. Qiqi listens sadly. All books OPEN in shelves. This is brief farewell encounter, not permanent presence."
    },
    "dining-loop3-talk-servants": {
      "id": "dining-loop3-talk-servants",
      "asset": "assets/moonlight-castle/horror-v4/dining-loop3-talk-servants.webp",
      "room": "dining",
      "phase": "event",
      "visibleCast": [
        "bingbing",
        "baoshi",
        "feihong"
      ],
      "paintedCast": [
        "adrian",
        "felix"
      ],
      "groupException": "同一实际地点明确在场的群像",
      "positions": [
        {
          "id": "baoshi",
          "x": 38,
          "y": 58
        },
        {
          "id": "feihong",
          "x": 54,
          "y": 58
        },
        {
          "id": "bingbing",
          "x": 79,
          "y": 75
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": false,
      "geometryKey": "dining-loop3",
      "alt": "The absent witnesses Baoshi ornate gothic vampire and Feihong glasses plum Lestat-style coat appear fleetingly as two TRANSLUCENT SPIRITS holding hands and smiling farewell. Their lower bodies dissolve into fine notes. Bingbing listens. Double painting restored, no horror gore.",
      "source": "assets/moonlight-castle/source/horror-v4/dining-loop3-talk-servants.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/dining-loop3-talk-servants.txt",
      "storyBeat": "The absent witnesses Baoshi ornate gothic vampire and Feihong glasses plum Lestat-style coat appear fleetingly as two TRANSLUCENT SPIRITS holding hands and smiling farewell. Their lower bodies dissolve into fine notes. Bingbing listens. Double painting restored, no horror gore."
    },
    "tower-loop2-talk-adrian": {
      "id": "tower-loop2-talk-adrian",
      "asset": "assets/moonlight-castle/horror-v4/tower-loop2-talk-adrian.webp",
      "room": "tower",
      "phase": "event",
      "visibleCast": [
        "adrian"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "adrian",
          "x": 58,
          "y": 62
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": false,
      "geometryKey": "tower-loop2",
      "alt": "Count Adrian materializes at x66% in moonlight: Baoshi-faced, black-haired no glasses, ornate black court dress, vivid RED eyes, solemn menacing expression, empty hands visible. Organ and half score remain left. Only ONE physical man.",
      "source": "assets/moonlight-castle/source/horror-v4/tower-loop2-talk-adrian.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/tower-loop2-talk-adrian.txt",
      "storyBeat": "Count Adrian materializes at x66% in moonlight: Baoshi-faced, black-haired no glasses, ornate black court dress, vivid RED eyes, solemn menacing expression, empty hands visible. Organ and half score remain left. Only ONE physical man."
    },
    "adrian-bound": {
      "id": "adrian-bound",
      "asset": "assets/moonlight-castle/horror-v4/adrian-bound.webp",
      "room": "tower",
      "phase": "event",
      "visibleCast": [
        "adrian"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "adrian",
          "x": 50,
          "y": 63
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "adrian-bound",
      "alt": "CINEMATIC close portrait chest-up of Adrian Baoshi face black hair no glasses, ornate court collar, held within a delicate GOLDEN LIGHT aura while time briefly pauses. Conflicted tender face with red eyes. Crop BELOW CHEST so hands and the offered keepsake are OUTSIDE THE FRAME: do not depict any ring, watch, bottle, diary or key. Moonlit organ blurred behind.",
      "source": "assets/moonlight-castle/source/horror-v4/adrian-bound.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/adrian-bound.txt",
      "storyBeat": "CINEMATIC close portrait chest-up of Adrian Baoshi face black hair no glasses, ornate court collar, held within a delicate GOLDEN LIGHT aura while time briefly pauses. Conflicted tender face with red eyes. Crop BELOW CHEST so hands and the offered keepsake are OUTSIDE THE FRAME: do not depict any ring, watch, bottle, diary or key. Moonlit organ blurred behind."
    },
    "adrian-final-letter": {
      "id": "adrian-final-letter",
      "asset": "assets/moonlight-castle/horror-v4/adrian-final-letter.webp",
      "room": "tower",
      "phase": "event",
      "visibleCast": [
        "adrian"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "adrian",
          "x": 50,
          "y": 63
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "adrian-final-letter",
      "alt": "Cinematic medium shot: Baoshi-faced court-dressed Adrian holds the assembled FOUR-PART REPAIRED LETTER in both hands, gaze lowers in remorse then turns toward pipe organ on left. Very faint blue soul light near shoulder, no modern Baoshi or Feihong physically here, no ring/watch unearned props. Dark moonlit tower.",
      "source": "assets/moonlight-castle/source/horror-v4/adrian-final-letter.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/adrian-final-letter.txt",
      "storyBeat": "Cinematic medium shot: Baoshi-faced court-dressed Adrian holds the assembled FOUR-PART REPAIRED LETTER in both hands, gaze lowers in remorse then turns toward pipe organ on left. Very faint blue soul light near shoulder, no modern Baoshi or Feihong physically here, no ring/watch unearned props. Dark moonlit tower."
    },
    "adrian-blocks-organ": {
      "id": "adrian-blocks-organ",
      "asset": "assets/moonlight-castle/horror-v4/adrian-blocks-organ.webp",
      "room": "tower",
      "phase": "event",
      "visibleCast": [
        "adrian"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "adrian",
          "x": 50,
          "y": 63
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "adrian-blocks-organ",
      "alt": "Adrian Baoshi-faced count dark court suit stands in front of pipe organ, hand raised to BLOCK access, stern red eyes, not yet reconciled. No blue soul or happy sunlight. Cold dark tower.",
      "source": "assets/moonlight-castle/source/horror-v4/adrian-blocks-organ.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/adrian-blocks-organ.txt",
      "storyBeat": "Adrian Baoshi-faced count dark court suit stands in front of pipe organ, hand raised to BLOCK access, stern red eyes, not yet reconciled. No blue soul or happy sunlight. Cold dark tower."
    },
    "adrian-soul-protection": {
      "id": "adrian-soul-protection",
      "asset": "assets/moonlight-castle/horror-v4/adrian-soul-protection.webp",
      "room": "tower",
      "phase": "loop2",
      "visibleCast": [
        "adrian"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "adrian",
          "x": 50,
          "y": 63
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "adrian-soul-protection",
      "alt": "Threatening Baoshi-faced count reaches one red-lit hand toward VIEWER but a small BLUE soul glow in foreground makes his fingers stop in midair and his face recoil in recognition. No victim body or injuries. Featureless near-black passage inside the gothic castle, no organ or other room-specific architecture: this encounter can occur on different routes.",
      "source": "assets/moonlight-castle/source/horror-v4/adrian-soul-protection.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/adrian-soul-protection.txt",
      "storyBeat": "Threatening Baoshi-faced count reaches one red-lit hand toward VIEWER but a small BLUE soul glow in foreground makes his fingers stop in midair and his face recoil in recognition. No victim body or injuries. Featureless near-black passage inside the gothic castle, no organ or other room-specific architecture: this encounter can occur on different routes."
    },
    "adrian-candle-repelled": {
      "id": "adrian-candle-repelled",
      "asset": "assets/moonlight-castle/horror-v4/adrian-candle-repelled.webp",
      "room": "tower",
      "phase": "loop2",
      "visibleCast": [
        "adrian"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "adrian",
          "x": 50,
          "y": 63
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "adrian-candle-repelled",
      "alt": "First-person view a single candle at foreground left repels Adrian to FAR dark castle CORRIDOR doorway. Small distant red eyes, Baoshi face vaguely visible, court coat silhouette retreating. No monster close to camera and no other physical person.",
      "source": "assets/moonlight-castle/source/horror-v4/adrian-candle-repelled.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/adrian-candle-repelled.txt",
      "storyBeat": "First-person view a single candle at foreground left repels Adrian to FAR dark castle CORRIDOR doorway. Small distant red eyes, Baoshi face vaguely visible, court coat silhouette retreating. No monster close to camera and no other physical person."
    },
    "musicbox-loop1-refused": {
      "id": "musicbox-loop1-refused",
      "asset": "assets/moonlight-castle/horror-v4/musicbox-loop1-refused.webp",
      "room": "dining",
      "phase": "event",
      "visibleCast": [],
      "paintedCast": [],
      "groupException": null,
      "positions": [],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "musicbox-loop1-refused",
      "alt": "MACRO of an ornate black/gold antique MUSIC BOX open on dark dining runner; a delicate BLUE soul mote reaches toward an anonymous hand at frame edge then curls BACK into the box, small tension in cold moonlight. No character faces or rings/watches. Actual lid, gears and drawer physically coherent.",
      "source": "assets/moonlight-castle/source/horror-v4/musicbox-loop1-refused.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/musicbox-loop1-refused.txt",
      "storyBeat": "MACRO of an ornate black/gold antique MUSIC BOX open on dark dining runner; a delicate BLUE soul mote reaches toward an anonymous hand at frame edge then curls BACK into the box, small tension in cold moonlight. No character faces or rings/watches. Actual lid, gears and drawer physically coherent."
    },
    "musicbox-soul-freed": {
      "id": "musicbox-soul-freed",
      "asset": "assets/moonlight-castle/horror-v4/musicbox-soul-freed.webp",
      "room": "dining",
      "phase": "loop2",
      "visibleCast": [],
      "paintedCast": [],
      "groupException": null,
      "positions": [],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "musicbox-soul-freed",
      "alt": "MACRO of same antique black/gold music box OPEN, small BLUE SOUL MOTE gently floating above an anonymous open palm outside box, leaving the mechanism, hopeful cold light amid deep dark. No people/faces, no extra jewelry.",
      "source": "assets/moonlight-castle/source/horror-v4/musicbox-soul-freed.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/musicbox-soul-freed.txt",
      "storyBeat": "MACRO of same antique black/gold music box OPEN, small BLUE SOUL MOTE gently floating above an anonymous open palm outside box, leaving the mechanism, hopeful cold light amid deep dark. No people/faces, no extra jewelry."
    },
    "musicbox-empty": {
      "id": "musicbox-empty",
      "asset": "assets/moonlight-castle/horror-v4/musicbox-empty.webp",
      "room": "dining",
      "phase": "loop2",
      "visibleCast": [],
      "paintedCast": [],
      "groupException": null,
      "positions": [],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "musicbox-empty",
      "alt": "MACRO same antique music box OPEN and EMPTY: gears and velvet lining, NO blue ghost/mote trapped inside or above. Black/gold box on dark runner, low moonlight.",
      "source": "assets/moonlight-castle/source/horror-v4/musicbox-empty.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/musicbox-empty.txt",
      "storyBeat": "MACRO same antique music box OPEN and EMPTY: gears and velvet lining, NO blue ghost/mote trapped inside or above. Black/gold box on dark runner, low moonlight."
    },
    "mirror-broken": {
      "id": "mirror-broken",
      "asset": "assets/moonlight-castle/horror-v4/mirror-broken.webp",
      "room": "dining",
      "phase": "loop2",
      "visibleCast": [],
      "paintedCast": [],
      "groupException": null,
      "positions": [],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "mirror-broken",
      "alt": "Cinematic closeup old ornate dining MIRROR smashed into jagged pieces, tiny dark frame, fragments on floor reflect moon and furniture only. NO physical person, NO supernatural face yet. Gothic horror shadows.",
      "source": "assets/moonlight-castle/source/horror-v4/mirror-broken.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/mirror-broken.txt",
      "storyBeat": "Cinematic closeup old ornate dining MIRROR smashed into jagged pieces, tiny dark frame, fragments on floor reflect moon and furniture only. NO physical person, NO supernatural face yet. Gothic horror shadows."
    },
    "mirror-felix-reflection": {
      "id": "mirror-felix-reflection",
      "asset": "assets/moonlight-castle/horror-v4/mirror-felix-reflection.webp",
      "room": "dining",
      "phase": "loop2",
      "visibleCast": [],
      "paintedCast": [
        "felix"
      ],
      "groupException": null,
      "positions": [],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "mirror-felix-reflection",
      "alt": "Closeup jagged broken ornate dining mirror. Inside ONE large SHARD only is smiling historic Felix: Feihong exact black-haired adult face with rectangular glasses, nineteenth-century court cravat. He remains a REFLECTION, no physical man outside mirror. No other person.",
      "source": "assets/moonlight-castle/source/horror-v4/mirror-felix-reflection.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/mirror-felix-reflection.txt",
      "storyBeat": "Closeup jagged broken ornate dining mirror. Inside ONE large SHARD only is smiling historic Felix: Feihong exact black-haired adult face with rectangular glasses, nineteenth-century court cravat. He remains a REFLECTION, no physical man outside mirror. No other person."
    },
    "bedroom-loop2-mirror-reflection": {
      "id": "bedroom-loop2-mirror-reflection",
      "asset": "assets/moonlight-castle/horror-v4/bedroom-loop2-mirror-reflection.webp",
      "room": "bedroom",
      "phase": "event",
      "visibleCast": [
        "shiyuan"
      ],
      "paintedCast": [
        "adrian",
        "felix"
      ],
      "groupException": null,
      "positions": [
        {
          "id": "shiyuan",
          "x": 42,
          "y": 64
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": false,
      "geometryKey": "bedroom-loop2",
      "alt": "Same terrifying bedroom with shattered mirror and pillow head indent, maid Shiyuan aside. Within the large remaining broken mirror shard are reflections of TWO HISTORIC MEN embracing: Adrian Baoshi face no glasses and Felix Feihong face with glasses in court dress, not physically standing in bedroom. Keep mirror BROKEN.",
      "source": "assets/moonlight-castle/source/horror-v4/bedroom-loop2-mirror-reflection.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/bedroom-loop2-mirror-reflection.txt",
      "storyBeat": "Same terrifying bedroom with shattered mirror and pillow head indent, maid Shiyuan aside. Within the large remaining broken mirror shard are reflections of TWO HISTORIC MEN embracing: Adrian Baoshi face no glasses and Felix Feihong face with glasses in court dress, not physically standing in bedroom. Keep mirror BROKEN."
    },
    "violin-case-empty": {
      "id": "violin-case-empty",
      "asset": "assets/moonlight-castle/horror-v4/violin-case-empty.webp",
      "room": "music",
      "phase": "loop2",
      "visibleCast": [],
      "paintedCast": [],
      "groupException": null,
      "positions": [],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "violin-case-empty",
      "alt": "Closeup OPEN antique violin CASE with deep red velvet lining, entirely EMPTY after bow is taken, NO violin, no bow inside. Same candlelit-dark music table, coherent lid hinge and lock. No people.",
      "source": "assets/moonlight-castle/source/horror-v4/violin-case-empty.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/violin-case-empty.txt",
      "storyBeat": "Closeup OPEN antique violin CASE with deep red velvet lining, entirely EMPTY after bow is taken, NO violin, no bow inside. Same candlelit-dark music table, coherent lid hinge and lock. No people."
    },
    "hall-dawn-talk-servants": {
      "id": "hall-dawn-talk-servants",
      "asset": "assets/moonlight-castle/horror-v4/hall-dawn-talk-servants.webp",
      "room": "hall",
      "phase": "dawn",
      "visibleCast": [
        "baoshi",
        "feihong"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "baoshi",
          "x": 66,
          "y": 61
        },
        {
          "id": "feihong",
          "x": 31,
          "y": 61
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "hall-dawn-talk-servants",
      "alt": "Morning close scene of Baoshi and Feihong waking on rug, sitting up and rubbing sleepy eyes, STILL HOLDING EACH OTHER HAND with other hands. Baoshi black ornate gothic vampire coat no glasses, Feihong plum Lestat-inspired courtcoat black hair and rectangular glasses. Warm fire dawn behind; other companions remain OFF CAMERA. No Adrian/Felix added.",
      "source": "assets/moonlight-castle/source/horror-v4/hall-dawn-talk-servants.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/hall-dawn-talk-servants.txt",
      "storyBeat": "Morning close scene of Baoshi and Feihong waking on rug, sitting up and rubbing sleepy eyes, STILL HOLDING EACH OTHER HAND with other hands. Baoshi black ornate gothic vampire coat no glasses, Feihong plum Lestat-inspired courtcoat black hair and rectangular glasses. Warm fire dawn behind; other companions remain OFF CAMERA. No Adrian/Felix added."
    },
    "hall-dawn-talk-shiyuan": {
      "id": "hall-dawn-talk-shiyuan",
      "asset": "assets/moonlight-castle/horror-v4/hall-dawn-talk-shiyuan.webp",
      "room": "hall",
      "phase": "dawn",
      "visibleCast": [
        "shiyuan"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "shiyuan",
          "x": 50,
          "y": 63
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "hall-dawn-talk-shiyuan",
      "alt": "Shiyuan in proper black/white long sleeve maid outfit steps out from kitchen doorway with a tray of slightly BURNT BREAD with visibly charred edges, shy cheerful relief, short wavy brown hair gold flowerpin, morning hall warm fire blurred behind. Other party members OFF CAMERA.",
      "source": "assets/moonlight-castle/source/horror-v4/hall-dawn-talk-shiyuan.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/hall-dawn-talk-shiyuan.txt",
      "storyBeat": "Shiyuan in proper black/white long sleeve maid outfit steps out from kitchen doorway with a tray of slightly BURNT BREAD with visibly charred edges, shy cheerful relief, short wavy brown hair gold flowerpin, morning hall warm fire blurred behind. Other party members OFF CAMERA."
    },
    "dining-dawn-talk-bingbing": {
      "id": "dining-dawn-talk-bingbing",
      "asset": "assets/moonlight-castle/horror-v4/dining-dawn-talk-bingbing.webp",
      "room": "dining",
      "phase": "dawn",
      "visibleCast": [
        "bingbing"
      ],
      "paintedCast": [
        "adrian",
        "felix"
      ],
      "groupException": null,
      "positions": [
        {
          "id": "bingbing",
          "x": 50,
          "y": 63
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "dining-dawn-talk-bingbing",
      "alt": "Morning Bingbing in full white crinoline hoop skirt softly touches the restored DOUBLE MALE portrait FRAME, a trace of gold dust on her fingers. Painted two men are clearly Baoshi-faced Adrian and glasses-wearing Feihong-faced Felix in historical court clothes. She smiles sadly with no blood tears. White roses and two place settings.",
      "source": "assets/moonlight-castle/source/horror-v4/dining-dawn-talk-bingbing.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/dining-dawn-talk-bingbing.txt",
      "storyBeat": "Morning Bingbing in full white crinoline hoop skirt softly touches the restored DOUBLE MALE portrait FRAME, a trace of gold dust on her fingers. Painted two men are clearly Baoshi-faced Adrian and glasses-wearing Feihong-faced Felix in historical court clothes. She smiles sadly with no blood tears. White roses and two place settings."
    },
    "loop-death": {
      "id": "loop-death",
      "asset": "assets/moonlight-castle/horror-v4/loop-death.webp",
      "room": "tower",
      "phase": "event",
      "visibleCast": [
        "adrian"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "adrian",
          "x": 50,
          "y": 63
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "loop-death",
      "alt": "First-loop DEATH transition: dramatic close face of Adrian Baoshi identity, black fluffy hair NO glasses, ornate court collar, RED EYES enlarging from near-black tower shadows. Count haunted by loss, not generic beast. Fallen extinguished wax candle and blurred organ low foreground, no graphic wounds, no gore.",
      "source": "assets/moonlight-castle/source/horror-v4/loop-death.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/loop-death.txt",
      "storyBeat": "First-loop DEATH transition: dramatic close face of Adrian Baoshi identity, black fluffy hair NO glasses, ornate court collar, RED EYES enlarging from near-black tower shadows. Count haunted by loss, not generic beast. Fallen extinguished wax candle and blurred organ low foreground, no graphic wounds, no gore."
    },
    "loop-truth": {
      "id": "loop-truth",
      "asset": "assets/moonlight-castle/horror-v4/loop-truth.webp",
      "room": "tower",
      "phase": "event",
      "visibleCast": [],
      "paintedCast": [],
      "groupException": null,
      "positions": [],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "loop-truth",
      "alt": "Four CHARRED LETTER PIECES assembled into one old letter beside a pipe-organ score, delicate golden seam light reveals truth of a two-hundred-year unsent love. Cold moonlit tower, no people, no unearned rings/watch/wine props. Letter handwritten script need not legible.",
      "source": "assets/moonlight-castle/source/horror-v4/loop-truth.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/loop-truth.txt",
      "storyBeat": "Four CHARRED LETTER PIECES assembled into one old letter beside a pipe-organ score, delicate golden seam light reveals truth of a two-hundred-year unsent love. Cold moonlit tower, no people, no unearned rings/watch/wine props. Letter handwritten script need not legible."
    },
    "wrong-ending": {
      "id": "wrong-ending",
      "asset": "assets/moonlight-castle/horror-v4/wrong-ending.webp",
      "room": "tower",
      "phase": "event",
      "visibleCast": [
        "adrian"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "adrian",
          "x": 50,
          "y": 63
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "wrong-ending",
      "alt": "Wrong-ending pursuit caught: dark gothic corridor sealed door, fallen extinguished candle foreground, red moon streaks; Baoshi-faced count in nineteenth-century court coat emerging from dark at center, red eyes and outstretched hand near viewer without touching any visible neck/body. No gore, tragic frightening atmosphere.",
      "source": "assets/moonlight-castle/source/horror-v4/wrong-ending.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/wrong-ending.txt",
      "storyBeat": "Wrong-ending pursuit caught: dark gothic corridor sealed door, fallen extinguished candle foreground, red moon streaks; Baoshi-faced count in nineteenth-century court coat emerging from dark at center, red eyes and outstretched hand near viewer without touching any visible neck/body. No gore, tragic frightening atmosphere."
    },
    "pursuit": {
      "id": "pursuit",
      "asset": "assets/moonlight-castle/horror-v4/pursuit.webp",
      "room": "tower",
      "phase": "event",
      "visibleCast": [
        "adrian"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "adrian",
          "x": 50,
          "y": 63
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "pursuit",
      "alt": "CHASE cinematic long view: castle corridor mostly pitch-black, thin blue light through far open door, a SMALL distant black court-coated Adrian silhouette with red eyes behind, red mist around ankles, motion tension. No extra people, no graphic wounds.",
      "source": "assets/moonlight-castle/source/horror-v4/pursuit.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/pursuit.txt",
      "storyBeat": "CHASE cinematic long view: castle corridor mostly pitch-black, thin blue light through far open door, a SMALL distant black court-coated Adrian silhouette with red eyes behind, red mist around ankles, motion tension. No extra people, no graphic wounds."
    },
    "score-restored": {
      "id": "score-restored",
      "asset": "assets/moonlight-castle/horror-v4/score-restored.webp",
      "room": "tower",
      "phase": "event",
      "visibleCast": [],
      "paintedCast": [],
      "groupException": null,
      "positions": [],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "score-restored",
      "alt": "Three movements of an antique REQUIEM SCORE finally restored on pipe-organ stand, quill and ink beside it, faint blue resonance along music staves, moonlight edge. ONLY score/quill/ink, absolutely NO rings, watch or wine because player may never have collected them. No people.",
      "source": "assets/moonlight-castle/source/horror-v4/score-restored.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/score-restored.txt",
      "storyBeat": "Three movements of an antique REQUIEM SCORE finally restored on pipe-organ stand, quill and ink beside it, faint blue resonance along music staves, moonlight edge. ONLY score/quill/ink, absolutely NO rings, watch or wine because player may never have collected them. No people."
    },
    "ending-grief": {
      "id": "ending-grief",
      "asset": "assets/moonlight-castle/horror-v4/ending-grief.webp",
      "room": "tower",
      "phase": "event",
      "visibleCast": [
        "adrian"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "adrian",
          "x": 50,
          "y": 63
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "ending-grief",
      "alt": "First ending, grief. Adrian with Baoshi face kneels on tower floor beside organ, court dress, eyes now BLUE instead of red, tears and yearning. His hand passes THROUGH a small soft BLUE soul-light without grasping, body turning transparent. Felix remains only blue LIGHT, NOT a physical man. Narrow dawn line outside, melancholy unresolved farewell, no hug.",
      "source": "assets/moonlight-castle/source/horror-v4/ending-grief.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/ending-grief.txt",
      "storyBeat": "First ending, grief. Adrian with Baoshi face kneels on tower floor beside organ, court dress, eyes now BLUE instead of red, tears and yearning. His hand passes THROUGH a small soft BLUE soul-light without grasping, body turning transparent. Felix remains only blue LIGHT, NOT a physical man. Narrow dawn line outside, melancholy unresolved farewell, no hug."
    },
    "ending-tenderness": {
      "id": "ending-tenderness",
      "asset": "assets/moonlight-castle/horror-v4/ending-tenderness.webp",
      "room": "tower",
      "phase": "dawn",
      "visibleCast": [
        "adrian",
        "felix"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "adrian",
          "x": 35,
          "y": 63
        },
        {
          "id": "felix",
          "x": 65,
          "y": 63
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "ending-tenderness",
      "alt": "Second ending, tenderness. Adrian Baoshi-faced court noble and a faint translucent Felix spirit Feihong black hair GLASSES face stand beside organ, their hands overlap for a fleeting moment. Felix lips silently form words, NO singing/open-mouth shout. Both figures begin dissolving into fine blue/gold MUSIC NOTES. Dawn through tall window, tender bittersweet relief. First gentle narrow light of dawn, still large cool shadows; eyes softened natural blue, NOT threatening red.",
      "source": "assets/moonlight-castle/source/horror-v4/ending-tenderness.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/ending-tenderness.txt",
      "storyBeat": "Second ending, tenderness. Adrian Baoshi-faced court noble and a faint translucent Felix spirit Feihong black hair GLASSES face stand beside organ, their hands overlap for a fleeting moment. Felix lips silently form words, NO singing/open-mouth shout. Both figures begin dissolving into fine blue/gold MUSIC NOTES. Dawn through tall window, tender bittersweet relief. First gentle narrow light of dawn, still large cool shadows; eyes softened natural blue, NOT threatening red."
    },
    "ending-farewell": {
      "id": "ending-farewell",
      "asset": "assets/moonlight-castle/horror-v4/ending-farewell.webp",
      "room": "tower",
      "phase": "dawn",
      "visibleCast": [
        "adrian",
        "felix"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "adrian",
          "x": 35,
          "y": 63
        },
        {
          "id": "felix",
          "x": 65,
          "y": 63
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "ending-farewell",
      "alt": "Third ending, final farewell. Adrian Baoshi-faced man in ornate court costume opens both ARMS toward a COLUMN OF BLUE-GOLD LIGHT above organ then bows deeply at waist, peaceful expression. Faint Felix Feihong-faced GLASSES spirit within light, both witness first shared SUNRISE through tower window. This is graceful farewell and reverence, NOT physical hugging. Wide dramatic magnificent dawn, ending CG. Eyes peaceful natural blue/amber, NOT red.",
      "source": "assets/moonlight-castle/source/horror-v4/ending-farewell.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/ending-farewell.txt",
      "storyBeat": "Third ending, final farewell. Adrian Baoshi-faced man in ornate court costume opens both ARMS toward a COLUMN OF BLUE-GOLD LIGHT above organ then bows deeply at waist, peaceful expression. Faint Felix Feihong-faced GLASSES spirit within light, both witness first shared SUNRISE through tower window. This is graceful farewell and reverence, NOT physical hugging. Wide dramatic magnificent dawn, ending CG. Eyes peaceful natural blue/amber, NOT red."
    },
    "exterior": {
      "id": "exterior",
      "asset": "assets/moonlight-castle/horror-v4/exterior.webp",
      "room": "exterior",
      "phase": "event",
      "visibleCast": [],
      "paintedCast": [],
      "groupException": null,
      "positions": [],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "exterior",
      "alt": "Haunted cliffside gothic CASTLE exterior by cold full moon, windows almost all BLACK except one dim tower window, dead tangled ivy and broken gargoyles, tiny pumpkins by iron gate, abyss in shadow/fog. Looming ruined silhouette rather than warmly illuminated fairytale hotel. Night approach, no people.",
      "source": "assets/moonlight-castle/source/horror-v4/exterior.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/exterior.txt",
      "storyBeat": "Haunted cliffside gothic CASTLE exterior by cold full moon, windows almost all BLACK except one dim tower window, dead tangled ivy and broken gargoyles, tiny pumpkins by iron gate, abyss in shadow/fog. Looming ruined silhouette rather than warmly illuminated fairytale hotel. Night approach, no people."
    },
    "musicbox-empty-loop1": {
      "id": "musicbox-empty-loop1",
      "asset": "assets/moonlight-castle/horror-v4/musicbox-empty-loop1.webp",
      "room": "dining",
      "phase": "loop1",
      "visibleCast": [],
      "paintedCast": [],
      "groupException": null,
      "positions": [],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "musicbox-empty-loop1",
      "alt": "The same ornate black/gold music box is OPEN and EMPTY on its burgundy runner. Show coherent gold mechanism and velvet lining, absolutely NO blue soul light or miniature person. FIRST LOOP: untouched dinner or initial music-room furnishing; no rotten fruit, blood-tear aftermath or restored morning objects.",
      "source": "assets/moonlight-castle/source/horror-v4/musicbox-empty-loop1.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/musicbox-empty-loop1.txt",
      "storyBeat": "The same ornate black/gold music box is OPEN and EMPTY on its burgundy runner. Show coherent gold mechanism and velvet lining, absolutely NO blue soul light or miniature person. FIRST LOOP: untouched dinner or initial music-room furnishing; no rotten fruit, blood-tear aftermath or restored morning objects."
    },
    "musicbox-empty-loop3": {
      "id": "musicbox-empty-loop3",
      "asset": "assets/moonlight-castle/horror-v4/musicbox-empty-loop3.webp",
      "room": "dining",
      "phase": "loop3",
      "visibleCast": [],
      "paintedCast": [],
      "groupException": null,
      "positions": [],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "musicbox-empty-loop3",
      "alt": "The same ornate black/gold music box is OPEN and EMPTY on its burgundy runner. Show coherent gold mechanism and velvet lining, absolutely NO blue soul light or miniature person.THIRD LOOP: current room state only. If music room appears in blurred background the harpsichord is open and the self-playing violin stays OUTSIDE the case. No daytime sunlight.",
      "source": "assets/moonlight-castle/source/horror-v4/musicbox-empty-loop3.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/musicbox-empty-loop3.txt",
      "storyBeat": "The same ornate black/gold music box is OPEN and EMPTY on its burgundy runner. Show coherent gold mechanism and velvet lining, absolutely NO blue soul light or miniature person.THIRD LOOP: current room state only. If music room appears in blurred background the harpsichord is open and the self-playing violin stays OUTSIDE the case. No daytime sunlight."
    },
    "musicbox-empty-dawn": {
      "id": "musicbox-empty-dawn",
      "asset": "assets/moonlight-castle/horror-v4/musicbox-empty-dawn.webp",
      "room": "dining",
      "phase": "dawn",
      "visibleCast": [],
      "paintedCast": [],
      "groupException": null,
      "positions": [],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "musicbox-empty-dawn",
      "alt": "The same ornate black/gold music box is OPEN and EMPTY on its burgundy runner. Show coherent gold mechanism and velvet lining, absolutely NO blue soul light or miniature person. This is AFTER SUNRISE: warm clean daylight and calm restored furnishings, no blood, rotten food, night moon or horror shadows.",
      "source": "assets/moonlight-castle/source/horror-v4/musicbox-empty-dawn.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/musicbox-empty-dawn.txt",
      "storyBeat": "The same ornate black/gold music box is OPEN and EMPTY on its burgundy runner. Show coherent gold mechanism and velvet lining, absolutely NO blue soul light or miniature person. This is AFTER SUNRISE: warm clean daylight and calm restored furnishings, no blood, rotten food, night moon or horror shadows."
    },
    "violin-case-empty-loop1": {
      "id": "violin-case-empty-loop1",
      "asset": "assets/moonlight-castle/horror-v4/violin-case-empty-loop1.webp",
      "room": "music",
      "phase": "loop1",
      "visibleCast": [],
      "paintedCast": [],
      "groupException": null,
      "positions": [],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "violin-case-empty-loop1",
      "alt": "The same long antique black/gold violin CASE is OPEN and COMPLETELY EMPTY after the bow was taken. Burgundy velvet lining and coherent hinges, no violin or bow inside. The violin, if visible in the far background, stays OUTSIDE the case and follows the supplied current-room reference. FIRST LOOP: untouched dinner or initial music-room furnishing; no rotten fruit, blood-tear aftermath or restored morning objects.",
      "source": "assets/moonlight-castle/source/horror-v4/violin-case-empty-loop1.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/violin-case-empty-loop1.txt",
      "storyBeat": "The same long antique black/gold violin CASE is OPEN and COMPLETELY EMPTY after the bow was taken. Burgundy velvet lining and coherent hinges, no violin or bow inside. The violin, if visible in the far background, stays OUTSIDE the case and follows the supplied current-room reference. FIRST LOOP: untouched dinner or initial music-room furnishing; no rotten fruit, blood-tear aftermath or restored morning objects."
    },
    "violin-case-empty-loop3": {
      "id": "violin-case-empty-loop3",
      "asset": "assets/moonlight-castle/horror-v4/violin-case-empty-loop3.webp",
      "room": "music",
      "phase": "loop3",
      "visibleCast": [],
      "paintedCast": [],
      "groupException": null,
      "positions": [],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "violin-case-empty-loop3",
      "alt": "The same long antique black/gold violin CASE is OPEN and COMPLETELY EMPTY after the bow was taken. Burgundy velvet lining and coherent hinges, no violin or bow inside. The violin, if visible in the far background, stays OUTSIDE the case and follows the supplied current-room reference.THIRD LOOP: current room state only. If music room appears in blurred background the harpsichord is open and the self-playing violin stays OUTSIDE the case. No daytime sunlight.",
      "source": "assets/moonlight-castle/source/horror-v4/violin-case-empty-loop3.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/violin-case-empty-loop3.txt",
      "storyBeat": "The same long antique black/gold violin CASE is OPEN and COMPLETELY EMPTY after the bow was taken. Burgundy velvet lining and coherent hinges, no violin or bow inside. The violin, if visible in the far background, stays OUTSIDE the case and follows the supplied current-room reference.THIRD LOOP: current room state only. If music room appears in blurred background the harpsichord is open and the self-playing violin stays OUTSIDE the case. No daytime sunlight."
    },
    "violin-case-empty-dawn": {
      "id": "violin-case-empty-dawn",
      "asset": "assets/moonlight-castle/horror-v4/violin-case-empty-dawn.webp",
      "room": "music",
      "phase": "dawn",
      "visibleCast": [],
      "paintedCast": [],
      "groupException": null,
      "positions": [],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "violin-case-empty-dawn",
      "alt": "The same long antique black/gold violin CASE is OPEN and COMPLETELY EMPTY after the bow was taken. Burgundy velvet lining and coherent hinges, no violin or bow inside. The violin, if visible in the far background, stays OUTSIDE the case and follows the supplied current-room reference. This is AFTER SUNRISE: warm clean daylight and calm restored furnishings, no blood, rotten food, night moon or horror shadows.",
      "source": "assets/moonlight-castle/source/horror-v4/violin-case-empty-dawn.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/violin-case-empty-dawn.txt",
      "storyBeat": "The same long antique black/gold violin CASE is OPEN and COMPLETELY EMPTY after the bow was taken. Burgundy velvet lining and coherent hinges, no violin or bow inside. The violin, if visible in the far background, stays OUTSIDE the case and follows the supplied current-room reference. This is AFTER SUNRISE: warm clean daylight and calm restored furnishings, no blood, rotten food, night moon or horror shadows."
    },
    "mirror-broken-loop1": {
      "id": "mirror-broken-loop1",
      "asset": "assets/moonlight-castle/horror-v4/mirror-broken-loop1.webp",
      "room": "dining",
      "phase": "loop1",
      "visibleCast": [],
      "paintedCast": [],
      "groupException": null,
      "positions": [],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "mirror-broken-loop1",
      "alt": "The same dining mirror is BROKEN, with one missing piece and jagged shards reflecting CURRENT room light/furniture only. No face in the mirror, no people anywhere in this close-up. FIRST LOOP: untouched dinner or initial music-room furnishing; no rotten fruit, blood-tear aftermath or restored morning objects.",
      "source": "assets/moonlight-castle/source/horror-v4/mirror-broken-loop1.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/mirror-broken-loop1.txt",
      "storyBeat": "The same dining mirror is BROKEN, with one missing piece and jagged shards reflecting CURRENT room light/furniture only. No face in the mirror, no people anywhere in this close-up. FIRST LOOP: untouched dinner or initial music-room furnishing; no rotten fruit, blood-tear aftermath or restored morning objects."
    },
    "mirror-broken-loop3": {
      "id": "mirror-broken-loop3",
      "asset": "assets/moonlight-castle/horror-v4/mirror-broken-loop3.webp",
      "room": "dining",
      "phase": "loop3",
      "visibleCast": [],
      "paintedCast": [],
      "groupException": null,
      "positions": [],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "mirror-broken-loop3",
      "alt": "The same dining mirror is BROKEN, with one missing piece and jagged shards reflecting CURRENT room light/furniture only. No face in the mirror, no people anywhere in this close-up.THIRD LOOP: current room state only. If music room appears in blurred background the harpsichord is open and the self-playing violin stays OUTSIDE the case. No daytime sunlight.",
      "source": "assets/moonlight-castle/source/horror-v4/mirror-broken-loop3.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/mirror-broken-loop3.txt",
      "storyBeat": "The same dining mirror is BROKEN, with one missing piece and jagged shards reflecting CURRENT room light/furniture only. No face in the mirror, no people anywhere in this close-up.THIRD LOOP: current room state only. If music room appears in blurred background the harpsichord is open and the self-playing violin stays OUTSIDE the case. No daytime sunlight."
    },
    "mirror-broken-dawn": {
      "id": "mirror-broken-dawn",
      "asset": "assets/moonlight-castle/horror-v4/mirror-broken-dawn.webp",
      "room": "dining",
      "phase": "dawn",
      "visibleCast": [],
      "paintedCast": [],
      "groupException": null,
      "positions": [],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "mirror-broken-dawn",
      "alt": "The same dining mirror is BROKEN, with one missing piece and jagged shards reflecting CURRENT room light/furniture only. No face in the mirror, no people anywhere in this close-up. This is AFTER SUNRISE: warm clean daylight and calm restored furnishings, no blood, rotten food, night moon or horror shadows.",
      "source": "assets/moonlight-castle/source/horror-v4/mirror-broken-dawn.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/mirror-broken-dawn.txt",
      "storyBeat": "The same dining mirror is BROKEN, with one missing piece and jagged shards reflecting CURRENT room light/furniture only. No face in the mirror, no people anywhere in this close-up. This is AFTER SUNRISE: warm clean daylight and calm restored furnishings, no blood, rotten food, night moon or horror shadows."
    },
    "mirror-felix-reflection-loop3": {
      "id": "mirror-felix-reflection-loop3",
      "asset": "assets/moonlight-castle/horror-v4/mirror-felix-reflection-loop3.webp",
      "room": "dining",
      "phase": "loop3",
      "visibleCast": [],
      "paintedCast": [
        "felix"
      ],
      "groupException": null,
      "positions": [],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "mirror-felix-reflection-loop3",
      "alt": "The jagged dining mirror shard contains ONLY historic FELIX smiling softly: Feihong card identity, BLACK hair, rectangular glasses, plum nineteenth-century court coat and ivory cravat. His face is confined INSIDE the reflection, never a physical person outside the shard.THIRD LOOP: current room state only. If music room appears in blurred background the harpsichord is open and the self-playing violin stays OUTSIDE the case. No daytime sunlight.",
      "source": "assets/moonlight-castle/source/horror-v4/mirror-felix-reflection-loop3.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/mirror-felix-reflection-loop3.txt",
      "storyBeat": "The jagged dining mirror shard contains ONLY historic FELIX smiling softly: Feihong card identity, BLACK hair, rectangular glasses, plum nineteenth-century court coat and ivory cravat. His face is confined INSIDE the reflection, never a physical person outside the shard.THIRD LOOP: current room state only. If music room appears in blurred background the harpsichord is open and the self-playing violin stays OUTSIDE the case. No daytime sunlight."
    },
    "mirror-felix-reflection-dawn": {
      "id": "mirror-felix-reflection-dawn",
      "asset": "assets/moonlight-castle/horror-v4/mirror-felix-reflection-dawn.webp",
      "room": "dining",
      "phase": "dawn",
      "visibleCast": [],
      "paintedCast": [
        "felix"
      ],
      "groupException": null,
      "positions": [],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "mirror-felix-reflection-dawn",
      "alt": "The jagged dining mirror shard contains ONLY historic FELIX smiling softly: Feihong card identity, BLACK hair, rectangular glasses, plum nineteenth-century court coat and ivory cravat. His face is confined INSIDE the reflection, never a physical person outside the shard. This is AFTER SUNRISE: warm clean daylight and calm restored furnishings, no blood, rotten food, night moon or horror shadows.",
      "source": "assets/moonlight-castle/source/horror-v4/mirror-felix-reflection-dawn.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/mirror-felix-reflection-dawn.txt",
      "storyBeat": "The jagged dining mirror shard contains ONLY historic FELIX smiling softly: Feihong card identity, BLACK hair, rectangular glasses, plum nineteenth-century court coat and ivory cravat. His face is confined INSIDE the reflection, never a physical person outside the shard. This is AFTER SUNRISE: warm clean daylight and calm restored furnishings, no blood, rotten food, night moon or horror shadows."
    },
    "musicbox-soul-freed-loop3": {
      "id": "musicbox-soul-freed-loop3",
      "asset": "assets/moonlight-castle/horror-v4/musicbox-soul-freed-loop3.webp",
      "room": "dining",
      "phase": "loop3",
      "visibleCast": [],
      "paintedCast": [],
      "groupException": null,
      "positions": [],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "musicbox-soul-freed-loop3",
      "alt": "The same black/gold music box is OPEN. One small BLUE soul mote leaves the coherent gold mechanism and gently settles above an anonymous open palm at frame edge; no human face or body, no added jewelry.THIRD LOOP: current room state only. If music room appears in blurred background the harpsichord is open and the self-playing violin stays OUTSIDE the case. No daytime sunlight.",
      "source": "assets/moonlight-castle/source/horror-v4/musicbox-soul-freed-loop3.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/musicbox-soul-freed-loop3.txt",
      "storyBeat": "The same black/gold music box is OPEN. One small BLUE soul mote leaves the coherent gold mechanism and gently settles above an anonymous open palm at frame edge; no human face or body, no added jewelry.THIRD LOOP: current room state only. If music room appears in blurred background the harpsichord is open and the self-playing violin stays OUTSIDE the case. No daytime sunlight."
    },
    "musicbox-soul-freed-dawn": {
      "id": "musicbox-soul-freed-dawn",
      "asset": "assets/moonlight-castle/horror-v4/musicbox-soul-freed-dawn.webp",
      "room": "dining",
      "phase": "dawn",
      "visibleCast": [],
      "paintedCast": [],
      "groupException": null,
      "positions": [],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "musicbox-soul-freed-dawn",
      "alt": "The same black/gold music box is OPEN. One small BLUE soul mote leaves the coherent gold mechanism and gently settles above an anonymous open palm at frame edge; no human face or body, no added jewelry. This is AFTER SUNRISE: warm clean daylight and calm restored furnishings, no blood, rotten food, night moon or horror shadows.",
      "source": "assets/moonlight-castle/source/horror-v4/musicbox-soul-freed-dawn.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/musicbox-soul-freed-dawn.txt",
      "storyBeat": "The same black/gold music box is OPEN. One small BLUE soul mote leaves the coherent gold mechanism and gently settles above an anonymous open palm at frame edge; no human face or body, no added jewelry. This is AFTER SUNRISE: warm clean daylight and calm restored furnishings, no blood, rotten food, night moon or horror shadows."
    },
    "adrian-soul-protection-loop3": {
      "id": "adrian-soul-protection-loop3",
      "asset": "assets/moonlight-castle/horror-v4/adrian-soul-protection-loop3.webp",
      "room": "tower",
      "phase": "loop3",
      "visibleCast": [
        "adrian"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "adrian",
          "x": 50,
          "y": 63
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "adrian-soul-protection-loop3",
      "alt": "Adrian (Baoshi exact fluffy BLACK hair, soft adult male face, NO glasses, black ornate nineteenth-century court coat) reaches toward viewer, red-lit fingers STOPPED by a small BLUE soul glow in foreground. Recognition, conflicted grief; no gore. Generic dark interior corridor, no tower organ because this event can occur en route. Third-loop corridor. All same-period identity locks remain.",
      "source": "assets/moonlight-castle/source/horror-v4/adrian-soul-protection-loop3.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/adrian-soul-protection-loop3.txt",
      "storyBeat": "Adrian (Baoshi exact fluffy BLACK hair, soft adult male face, NO glasses, black ornate nineteenth-century court coat) reaches toward viewer, red-lit fingers STOPPED by a small BLUE soul glow in foreground. Recognition, conflicted grief; no gore. Generic dark interior corridor, no tower organ because this event can occur en route. Third-loop corridor. All same-period identity locks remain."
    },
    "adrian-candle-repelled-loop3": {
      "id": "adrian-candle-repelled-loop3",
      "asset": "assets/moonlight-castle/horror-v4/adrian-candle-repelled-loop3.webp",
      "room": "tower",
      "phase": "loop3",
      "visibleCast": [
        "adrian"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "adrian",
          "x": 50,
          "y": 63
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "adrian-candle-repelled-loop3",
      "alt": "A lit white wax candle held at frame edge repels a DISTANT Adrian (Baoshi face, fluffy BLACK hair, NO glasses, ornate black court coat) into a dark CORRIDOR doorway. Small distant red eyes, retreating posture. No tower organ or other room-specific props. Third-loop corridor. All same-period identity locks remain.",
      "source": "assets/moonlight-castle/source/horror-v4/adrian-candle-repelled-loop3.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/adrian-candle-repelled-loop3.txt",
      "storyBeat": "A lit white wax candle held at frame edge repels a DISTANT Adrian (Baoshi face, fluffy BLACK hair, NO glasses, ornate black court coat) into a dark CORRIDOR doorway. Small distant red eyes, retreating posture. No tower organ or other room-specific props. Third-loop corridor. All same-period identity locks remain."
    },
    "hall-dawn": {
      "id": "hall-dawn",
      "asset": "assets/moonlight-castle/horror-v4/hall-morning.webp",
      "room": "hall",
      "phase": "dawn",
      "visibleCast": [
        "yeshiyang",
        "tim",
        "baoshi",
        "feihong",
        "bingbing",
        "dijie",
        "jerry",
        "qiqi",
        "shiyuan",
        "lala"
      ],
      "paintedCast": [],
      "groupException": "原文明确十位乐团同伴在大厅醒来，十名各一次，旧世伯爵与灵影不加入",
      "positions": [
        {
          "id": "yeshiyang",
          "x": 43,
          "y": 61
        },
        {
          "id": "tim",
          "x": 57,
          "y": 61
        },
        {
          "id": "baoshi",
          "x": 78,
          "y": 55
        },
        {
          "id": "feihong",
          "x": 83,
          "y": 55
        },
        {
          "id": "bingbing",
          "x": 69,
          "y": 73
        },
        {
          "id": "dijie",
          "x": 29,
          "y": 81
        },
        {
          "id": "jerry",
          "x": 31,
          "y": 38.5
        },
        {
          "id": "qiqi",
          "x": 12,
          "y": 77
        },
        {
          "id": "shiyuan",
          "x": 19,
          "y": 62
        },
        {
          "id": "lala",
          "x": 94,
          "y": 65
        }
      ],
      "objectRegions": {
        "piano": {
          "outline": [
            [
              0,
              37
            ],
            [
              5,
              40
            ],
            [
              8,
              45
            ],
            [
              8,
              50
            ],
            [
              6,
              53
            ],
            [
              6,
              62
            ],
            [
              3,
              65
            ],
            [
              3,
              71
            ],
            [
              0,
              71
            ]
          ],
          "layer": 1
        },
        "armor": {
          "outline": [
            [
              85,
              81
            ],
            [
              91,
              78
            ],
            [
              96,
              73
            ],
            [
              100,
              74
            ],
            [
              100,
              92
            ],
            [
              95,
              94
            ],
            [
              85,
              91
            ],
            [
              84,
              86
            ]
          ],
          "layer": 1
        },
        "tapestry": {
          "outline": [
            [
              32,
              0
            ],
            [
              68,
              0
            ],
            [
              68,
              34
            ],
            [
              63,
              34
            ],
            [
              62,
              29
            ],
            [
              59,
              25
            ],
            [
              55,
              25
            ],
            [
              52,
              29
            ],
            [
              51,
              34
            ],
            [
              49,
              34
            ],
            [
              48,
              29
            ],
            [
              45,
              26
            ],
            [
              41,
              26
            ],
            [
              38,
              30
            ],
            [
              37,
              34
            ],
            [
              35,
              34
            ],
            [
              34,
              29
            ],
            [
              32,
              29
            ]
          ],
          "layer": 1
        },
        "candle": {
          "outline": [
            [
              3.8,
              45.5
            ],
            [
              6.3,
              45.5
            ],
            [
              6.3,
              56
            ],
            [
              3.8,
              56
            ]
          ],
          "layer": 3
        }
      },
      "doors": [
        {
          "room": "study",
          "label": "书房门",
          "x": 10,
          "y": 30
        },
        {
          "room": "dining",
          "label": "餐厅门",
          "x": 90,
          "y": 25
        }
      ],
      "isEvent": false,
      "geometryKey": "hall-morning",
      "alt": "ALL TEN modern party members awaken in hall, each appears exactly once and recognizable. Orange fireplace warmly burns; lifeless EMPTY HELMETED ARMOR lies on right floor clutching half-score (do not confuse with bareheaded living Tim). Full-body or knee-up ensemble arranged in shallow arc, NOT two people with invented extra names. Left to right: Qiqi purple tarot shawl, Shiyuan black/white maid at kitchen doorway holding BREAD TRAY, Jerry glasses embroidered noble suit holding trumpet low, Dijie pale Song Hanfu flute on knees seated, Yeshiyang black butler silver cross, Tim bareheaded silver armor, Bingbing white CRINOLINE skirt, Baoshi black ornate vampire clothes, Feihong black-haired GLASSES plum courtcoat holding Baoshi hand, Lala purple witch sideponytail/pale bow clear sphere. Square piano left, tapestry/fireplace center, doors at extremes. Warm relief, first safe sunlight.",
      "source": "assets/moonlight-castle/source/horror-v4/hall-morning.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/hall-morning.txt",
      "storyBeat": "ALL TEN modern party members awaken in hall, each appears exactly once and recognizable. Orange fireplace warmly burns; lifeless EMPTY HELMETED ARMOR lies on right floor clutching half-score (do not confuse with bareheaded living Tim). Full-body or knee-up ensemble arranged in shallow arc, NOT two people with invented extra names. Left to right: Qiqi purple tarot shawl, Shiyuan black/white maid at kitchen doorway holding BREAD TRAY, Jerry glasses embroidered noble suit holding trumpet low, Dijie pale Song Hanfu flute on knees seated, Yeshiyang black butler silver cross, Tim bareheaded silver armor, Bingbing white CRINOLINE skirt, Baoshi black ornate vampire clothes, Feihong black-haired GLASSES plum courtcoat holding Baoshi hand, Lala purple witch sideponytail/pale bow clear sphere. Square piano left, tapestry/fireplace center, doors at extremes. Warm relief, first safe sunlight.",
      "reuses": "hall-morning"
    },
    "dining-loop3-portrait-veiled": {
      "id": "dining-loop3-portrait-veiled",
      "asset": "assets/moonlight-castle/horror-v4/dining-loop3.webp",
      "room": "dining",
      "phase": "loop3",
      "visibleCast": [
        "bingbing"
      ],
      "paintedCast": [
        "adrian",
        "felix"
      ],
      "groupException": null,
      "positions": [
        {
          "id": "bingbing",
          "x": 49,
          "y": 50
        }
      ],
      "objectRegions": {
        "table": {
          "outline": [
            [
              0,
              46
            ],
            [
              40,
              51
            ],
            [
              86,
              65
            ],
            [
              87,
              76
            ],
            [
              49,
              84
            ],
            [
              10,
              73
            ],
            [
              0,
              66
            ]
          ],
          "layer": 1
        },
        "portrait_dining": {
          "outline": [
            [
              21,
              0
            ],
            [
              45,
              0
            ],
            [
              45,
              33
            ],
            [
              21,
              33
            ]
          ],
          "layer": 1
        },
        "musicbox": {
          "outline": [
            [
              42,
              62
            ],
            [
              55,
              62
            ],
            [
              55,
              74
            ],
            [
              42,
              74
            ]
          ],
          "layer": 3
        },
        "mirror": {
          "outline": [
            [
              89,
              0
            ],
            [
              100,
              0
            ],
            [
              100,
              51
            ],
            [
              89,
              51
            ]
          ],
          "layer": 1
        }
      },
      "doors": [
        {
          "room": "hall",
          "label": "返回大厅",
          "x": 7,
          "y": 25
        },
        {
          "room": "cellar",
          "label": "地下室暗门",
          "x": 69,
          "y": 87
        }
      ],
      "isEvent": false,
      "geometryKey": "dining-loop3",
      "alt": "Third loop. Baoshi and Feihong are physically ABSENT. Only Bingbing in white hoop-skirt remains. A small folded NOTE lies where the two men stood. Two-men portrait has repaired/complete silhouettes in court dress, but their FACES are VEILED BY DEEP SHADOW, subtly discernible not a blank frame. This is the before-reveal game frame. Music box still closed. Preserve same camera and all furniture.",
      "source": "assets/moonlight-castle/source/horror-v4/dining-loop3.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/dining-loop3.txt",
      "storyBeat": "Third loop. Baoshi and Feihong are physically ABSENT. Only Bingbing in white hoop-skirt remains. A small folded NOTE lies where the two men stood. Two-men portrait has repaired/complete silhouettes in court dress, but their FACES are VEILED BY DEEP SHADOW, subtly discernible not a blank frame. This is the before-reveal game frame. Music box still closed. Preserve same camera and all furniture.",
      "reuses": "dining-loop3"
    },
    "adrian-bound-ring": {
      "id": "adrian-bound-ring",
      "asset": "assets/moonlight-castle/horror-v4/adrian-bound.webp",
      "room": "tower",
      "phase": "event",
      "visibleCast": [
        "adrian"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "adrian",
          "x": 50,
          "y": 63
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "adrian-bound",
      "alt": "CINEMATIC close portrait chest-up of Adrian Baoshi face black hair no glasses, ornate court collar, held within a delicate GOLDEN LIGHT aura while time briefly pauses. Conflicted tender face with red eyes. Crop BELOW CHEST so hands and the offered keepsake are OUTSIDE THE FRAME: do not depict any ring, watch, bottle, diary or key. Moonlit organ blurred behind.",
      "source": "assets/moonlight-castle/source/horror-v4/adrian-bound.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/adrian-bound.txt",
      "storyBeat": "CINEMATIC close portrait chest-up of Adrian Baoshi face black hair no glasses, ornate court collar, held within a delicate GOLDEN LIGHT aura while time briefly pauses. Conflicted tender face with red eyes. Crop BELOW CHEST so hands and the offered keepsake are OUTSIDE THE FRAME: do not depict any ring, watch, bottle, diary or key. Moonlit organ blurred behind.",
      "reuses": "adrian-bound"
    },
    "adrian-bound-pocket-watch": {
      "id": "adrian-bound-pocket-watch",
      "asset": "assets/moonlight-castle/horror-v4/adrian-bound.webp",
      "room": "tower",
      "phase": "event",
      "visibleCast": [
        "adrian"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "adrian",
          "x": 50,
          "y": 63
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "adrian-bound",
      "alt": "CINEMATIC close portrait chest-up of Adrian Baoshi face black hair no glasses, ornate court collar, held within a delicate GOLDEN LIGHT aura while time briefly pauses. Conflicted tender face with red eyes. Crop BELOW CHEST so hands and the offered keepsake are OUTSIDE THE FRAME: do not depict any ring, watch, bottle, diary or key. Moonlit organ blurred behind.",
      "source": "assets/moonlight-castle/source/horror-v4/adrian-bound.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/adrian-bound.txt",
      "storyBeat": "CINEMATIC close portrait chest-up of Adrian Baoshi face black hair no glasses, ornate court collar, held within a delicate GOLDEN LIGHT aura while time briefly pauses. Conflicted tender face with red eyes. Crop BELOW CHEST so hands and the offered keepsake are OUTSIDE THE FRAME: do not depict any ring, watch, bottle, diary or key. Moonlit organ blurred behind.",
      "reuses": "adrian-bound"
    },
    "adrian-bound-wine": {
      "id": "adrian-bound-wine",
      "asset": "assets/moonlight-castle/horror-v4/adrian-bound.webp",
      "room": "tower",
      "phase": "event",
      "visibleCast": [
        "adrian"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "adrian",
          "x": 50,
          "y": 63
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "adrian-bound",
      "alt": "CINEMATIC close portrait chest-up of Adrian Baoshi face black hair no glasses, ornate court collar, held within a delicate GOLDEN LIGHT aura while time briefly pauses. Conflicted tender face with red eyes. Crop BELOW CHEST so hands and the offered keepsake are OUTSIDE THE FRAME: do not depict any ring, watch, bottle, diary or key. Moonlit organ blurred behind.",
      "source": "assets/moonlight-castle/source/horror-v4/adrian-bound.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/adrian-bound.txt",
      "storyBeat": "CINEMATIC close portrait chest-up of Adrian Baoshi face black hair no glasses, ornate court collar, held within a delicate GOLDEN LIGHT aura while time briefly pauses. Conflicted tender face with red eyes. Crop BELOW CHEST so hands and the offered keepsake are OUTSIDE THE FRAME: do not depict any ring, watch, bottle, diary or key. Moonlit organ blurred behind.",
      "reuses": "adrian-bound"
    },
    "adrian-bound-diary": {
      "id": "adrian-bound-diary",
      "asset": "assets/moonlight-castle/horror-v4/adrian-bound.webp",
      "room": "tower",
      "phase": "event",
      "visibleCast": [
        "adrian"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "adrian",
          "x": 50,
          "y": 63
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "adrian-bound",
      "alt": "CINEMATIC close portrait chest-up of Adrian Baoshi face black hair no glasses, ornate court collar, held within a delicate GOLDEN LIGHT aura while time briefly pauses. Conflicted tender face with red eyes. Crop BELOW CHEST so hands and the offered keepsake are OUTSIDE THE FRAME: do not depict any ring, watch, bottle, diary or key. Moonlit organ blurred behind.",
      "source": "assets/moonlight-castle/source/horror-v4/adrian-bound.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/adrian-bound.txt",
      "storyBeat": "CINEMATIC close portrait chest-up of Adrian Baoshi face black hair no glasses, ornate court collar, held within a delicate GOLDEN LIGHT aura while time briefly pauses. Conflicted tender face with red eyes. Crop BELOW CHEST so hands and the offered keepsake are OUTSIDE THE FRAME: do not depict any ring, watch, bottle, diary or key. Moonlit organ blurred behind.",
      "reuses": "adrian-bound"
    },
    "adrian-bound-key": {
      "id": "adrian-bound-key",
      "asset": "assets/moonlight-castle/horror-v4/adrian-bound.webp",
      "room": "tower",
      "phase": "event",
      "visibleCast": [
        "adrian"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "adrian",
          "x": 50,
          "y": 63
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "adrian-bound",
      "alt": "CINEMATIC close portrait chest-up of Adrian Baoshi face black hair no glasses, ornate court collar, held within a delicate GOLDEN LIGHT aura while time briefly pauses. Conflicted tender face with red eyes. Crop BELOW CHEST so hands and the offered keepsake are OUTSIDE THE FRAME: do not depict any ring, watch, bottle, diary or key. Moonlit organ blurred behind.",
      "source": "assets/moonlight-castle/source/horror-v4/adrian-bound.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/adrian-bound.txt",
      "storyBeat": "CINEMATIC close portrait chest-up of Adrian Baoshi face black hair no glasses, ornate court collar, held within a delicate GOLDEN LIGHT aura while time briefly pauses. Conflicted tender face with red eyes. Crop BELOW CHEST so hands and the offered keepsake are OUTSIDE THE FRAME: do not depict any ring, watch, bottle, diary or key. Moonlit organ blurred behind.",
      "reuses": "adrian-bound"
    },
    "adrian-final-letter-to-organ": {
      "id": "adrian-final-letter-to-organ",
      "asset": "assets/moonlight-castle/horror-v4/adrian-final-letter.webp",
      "room": "tower",
      "phase": "event",
      "visibleCast": [
        "adrian"
      ],
      "paintedCast": [],
      "groupException": null,
      "positions": [
        {
          "id": "adrian",
          "x": 50,
          "y": 63
        }
      ],
      "objectRegions": {},
      "doors": [],
      "isEvent": true,
      "geometryKey": "adrian-final-letter",
      "alt": "Cinematic medium shot: Baoshi-faced court-dressed Adrian holds the assembled FOUR-PART REPAIRED LETTER in both hands, gaze lowers in remorse then turns toward pipe organ on left. Very faint blue soul light near shoulder, no modern Baoshi or Feihong physically here, no ring/watch unearned props. Dark moonlit tower.",
      "source": "assets/moonlight-castle/source/horror-v4/adrian-final-letter.png",
      "prompt": "docs/imagegen/moonlight-castle/horror-v4/prompts/adrian-final-letter.txt",
      "storyBeat": "Cinematic medium shot: Baoshi-faced court-dressed Adrian holds the assembled FOUR-PART REPAIRED LETTER in both hands, gaze lowers in remorse then turns toward pipe organ on left. Very faint blue soul light near shoulder, no modern Baoshi or Feihong physically here, no ring/watch unearned props. Dark moonlit tower.",
      "reuses": "adrian-final-letter"
    }
  }
};
