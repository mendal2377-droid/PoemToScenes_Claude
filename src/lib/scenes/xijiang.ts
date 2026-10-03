import type { PoemScene } from '../types';

const BROOK = [
  [-64, 40],
  [-30, 22],
  [0, 6],
  [26, -14],
  [52, -44],
] as const;

/**
 * 西江月·夜行黄沙道中 — Xin Qiji. A 词 rather than a 诗, so it follows the
 * tune's fixed shape: six characters, six, seven, six, twice over.
 *
 * Its rhyme is 平仄通叶 — the same rhyme taken in both tones, 蝉·年·前·边 level
 * against 片·见 oblique — which is a thing 律诗 is not allowed to do.
 *
 * Nothing in it is grand. A magpie leaving a branch, cicadas, the smell of rice
 * flowers, frogs, seven or eight stars, two or three drops of rain, and then
 * the inn you had forgotten was there.
 */
export const XI_JIANG: PoemScene = {
  id: 'xijiang',
  title: '西江月',
  author: '辛弃疾',
  dynasty: '宋',
  romanTitle: 'Moon over the West River, c.1181',
  note: '夜行黄沙道中。稻花、蛙声，和忽然出现的茅店。',
  available: true,
  lines: [
    { text: '明月别枝惊鹊', tones: 'pzzppz', rhyme: false, note: '月光亮得把喜鹊从枝上惊起来。"别枝"是离开树枝，不是另一根枝。' },
    { text: '清风半夜鸣蝉', tones: 'ppzzpp', rhyme: true, note: '半夜的清风里有蝉声。上两句一动一静，字字相对。' },
    { text: '稻花香里说丰年', tones: 'zppzzpp', rhyme: true, note: '在稻花的香气里谈今年的收成——说话的是谁？下一句才揭晓。' },
    { text: '听取蛙声一片', tones: 'pzppzz', rhyme: true, note: '是蛙。满田的蛙声，就是它们在说丰年。这个转折是全词最可爱的地方。' },
    { text: '七八个星天外', tones: 'zzzppz', rhyme: false, note: '天边只剩七八颗星——云上来了。' },
    { text: '两三点雨山前', tones: 'zpzzpp', rhyme: true, note: '山前落下两三点雨。用数字写景，疏得恰好。' },
    { text: '旧时茅店社林边', tones: 'zppzzpp', rhyme: true, note: '从前那家茅店，就在土地庙的树林边上。' },
    { text: '路转溪桥忽见', tones: 'zzppzz', rhyme: true, note: '路一转，过了溪桥，它忽然就在眼前。"忽见"二字，把一路的雨都收住了。' },
  ],
  couplets: [
    [0, 1],
    [4, 5],
  ],
  rhymeName: '先 · 霰（平仄通叶）',
  paint: 'dancai',
  palette: {
    paper: '#efe4c4',
    ink: '#2a2620',
    // A summer night that has not quite let go of the day: the horizon is
    // still warm.
    skyHigh: '#3a4c7c',
    skyLow: '#d8b878',
    mountainFar: '#4b5f8a',
    mountainNear: '#5f8a5a',
    groundHigh: '#b8b04e',
    groundLow: '#78883c',
    water: '#b8cdbc',
    waterDeep: '#6a9080',
    foliageDark: '#2f5a34',
    foliageLight: '#6a9c48',
    grassTip: '#dcc65c',
    trunk: '#5a4630',
    accent: '#ffc46a',
    ochre: '#b89a5c',
    moon: '#fbf1d0',
    mist: '#e8dcbc',
  },
  terrain: {
    seed: 1181,
    extent: 132,
    hills: { amp: 2.6, freq: 0.017 },
    swell: { amp: 4.6, freq: 0.0058 },
    rim: { start: 80, amp: 26 },
    basins: [],
    // 溪 — the brook is the water in this poem, and it is wide enough to want a bridge.
    channels: [{ path: BROOK, width: 8, depth: 1.8 }],
    flats: [{ x: 36, z: 30, r: 13, h: 2.6 }],
  },
  skyline: 0.85,
  atmosphere: { hour: 0.9, wind: 0.5, mist: 0.28, snow: 0.3, cloud: 0.4, rain: 0.13 },
  flora: {
    pines: {
      clusters: [
        { x: 60, z: 8, r: 15, count: 12 },
        { x: 0, z: -78, r: 20, count: 14 },
      ],
    },
    bamboo: { groves: [{ x: 44, z: 40, r: 11, count: 80 }] },
    broadleaf: {
      clusters: [
        { x: 14, z: 60, r: 10, count: 8, tint: '#5e8c40' },
        { x: 48, z: 30, r: 9, count: 7, tint: '#6a9a44' },
      ],
    },
    // The whole valley is rice: tall, gold at the tip, and stroked across the
    // ground so it reads as fields rather than as lawn.
    grass: { count: 30000, radius: 96, height: 1.7, stroke: 0.95 },
    reeds: { count: 260 },
    lotus: { count: 0 },
    rocks: { count: 90 },
  },
  landmarks: [
    // 明月别枝惊鹊 — the tree, and the magpies that have just left it.
    { id: 'jingque', line: 0, label: '惊鹊', x: 21, z: 86, radius: 12, look: 'moon', zoom: 1.0 },
    // 清风半夜鸣蝉 — the pines, where the cicadas are.
    { id: 'mingchan', line: 1, label: '鸣蝉', x: 44, z: 6, radius: 12, look: [60, 10, 6], zoom: 1.2 },
    // 稻花香里说丰年 — the rice, standing gold in the dark.
    { id: 'daohua', line: 2, label: '稻花', x: -52, z: -8, radius: 13, look: [-84, -28, 1.4] },
    // 听取蛙声一片 — the brook's edge, where the frogs are.
    { id: 'washeng', line: 3, label: '蛙声', x: -44, z: 40, radius: 12, look: [-36, 26, 0.3], zoom: 1.5 },
    // 七八个星天外 — up, at the few stars the cloud has left.
    { id: 'tianwai', line: 4, label: '天外', x: 66, z: -30, radius: 13, look: [66, -230, 170] },
    // 两三点雨山前 — the foot of the hills, and rain that is only a few drops.
    { id: 'shanqian', line: 5, label: '山前', x: 0, z: -48, radius: 13, look: [0, -140, 14] },
    // 旧时茅店社林边 — the inn, at the edge of the trees, with its lamp.
    { id: 'maodian', line: 6, label: '茅店', x: 22, z: 20, radius: 12, look: [36, 30, 1.9], zoom: 1.3 },
    // 路转溪桥忽见 — round the turn of the path, across the bridge, there it is.
    { id: 'xiqiao', line: 7, label: '溪桥', x: -8, z: 19, radius: 12, look: [36, 30, 2], zoom: 1.15 },
  ],
  start: { x: -4, z: 92, heading: 0 },
  // Fireflies more than weather: small, slow, and the colour of the lamp.
  fall: { kind: 'petal', color: '#e2ec8c', size: 0.6, accumulate: 0 },
  luminary: { x: -0.25, y: 0.42, z: -0.88, size: 0.11, kind: 'moon' },
  huts: [{ x: 36, z: 30, rot: 0.8, scale: 1.15 }],
  // The light in the window is the emotional centre of the poem — the thing
  // you had forgotten was there.
  glows: [{ x: 34.6, z: 30.2, h: 1.9, color: '#ffb864', size: 2.6 }],
  bridges: [{ x: 0, z: 6, rot: -1.0, length: 11 }],
  // The innkeeper, at his door in the light of his own lamp.
  people: [{ x: 33, z: 33.5, rot: 3.6, role: 'farmer' }],
  // 惊鹊 — magpies up out of the tree.
  flocks: [{ x: 13, z: 58, y: 11, count: 4, radius: 4, speed: 0.6 }],
  sounds: [
    { kind: 'birdsong', x: 14, z: 60, r: 20 },
    { kind: 'cicada', x: 60, z: 10, r: 26 },
    { kind: 'frogs', x: -40, z: 30, r: 28 },
    { kind: 'frogs', x: -8, z: 14, r: 22 },
  ],
  // 听取蛙声一片 — frogs on the brook's banks; and the inn's own hens and dog.
  animals: [
    { kind: 'frog', x: -39, z: 30.6, rot: -2.65, scale: 2.4 },
    { kind: 'frog', x: -33.2, z: 27.5, rot: -2.65, scale: 2.2 },
    { kind: 'frog', x: -41.2, z: 31.8, rot: -2.4, scale: 2.0 },
    { kind: 'frog', x: -26.1, z: 14.9, rot: 0.49, scale: 2.2 },
    { kind: 'frog', x: 4.8, z: 7.9, rot: -2.49, scale: 2.2 },
    { kind: 'frog', x: 18.1, z: -13.5, rot: 0.66, scale: 2.2 },
    { kind: 'frog', x: 22.5, z: -7, rot: -2.49, scale: 2.2 },
    { kind: 'dog', x: 38, z: 34, rot: 3.9 },
    { kind: 'hen', x: 31, z: 36, rot: 2.0 },
    { kind: 'hen', x: 35, z: 36, rot: 5.0 },
  ],
};

