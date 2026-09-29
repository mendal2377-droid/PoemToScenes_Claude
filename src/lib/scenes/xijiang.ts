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
  palette: {
    paper: '#ece3c6',
    ink: '#242430',
    skyHigh: '#33446a',
    skyLow: '#9aa08c',
    mountainFar: '#36507c',
    mountainNear: '#3e6a52',
    groundHigh: '#8f9048',
    groundLow: '#5e6b3c',
    water: '#9eb2ae',
    waterDeep: '#5e7a74',
    foliageDark: '#28462f',
    foliageLight: '#4f7a44',
    grassTip: '#cbb85c',
    trunk: '#4e4030',
    accent: '#d8c060',
    ochre: '#a08a58',
    moon: '#faf3d8',
    mist: '#dcdcc8',
  },
  terrain: {
    seed: 1181,
    extent: 132,
    hills: { amp: 3.0, freq: 0.018 },
    swell: { amp: 5.6, freq: 0.006 },
    rim: { start: 78, amp: 28 },
    // A flooded paddy rather than a pond — shallow, and full of frogs.
    basins: [{ x: -28, z: -30, r: 22, depth: 1.6 }],
    channels: [{ path: BROOK, width: 6, depth: 1.6 }],
    flats: [{ x: 36, z: 30, r: 13, h: 2.6 }],
  },
  atmosphere: { hour: 0.88, wind: 0.45, mist: 0.4, snow: 0.22, cloud: 0.34 },
  flora: {
    pines: {
      clusters: [
        { x: 58, z: 12, r: 16, count: 12 },
        { x: 0, z: -76, r: 20, count: 14 },
      ],
    },
    bamboo: { groves: [{ x: 40, z: 36, r: 12, count: 80 }] },
    broadleaf: {
      clusters: [
        { x: 14, z: 58, r: 13, count: 8, tint: '#4e6f3e' },
        { x: 56, z: 16, r: 12, count: 7, tint: '#5a7a44' },
      ],
    },
    grass: { count: 30000, radius: 96 },
    reeds: { count: 260 },
    lotus: { count: 0 },
    rocks: { count: 110 },
  },
  landmarks: [
    { id: 'jingque', line: 0, label: '惊鹊', x: 14, z: 58, radius: 14 },
    { id: 'mingchan', line: 1, label: '鸣蝉', x: 58, z: 12, radius: 14 },
    { id: 'daohua', line: 2, label: '稻花', x: -52, z: -8, radius: 15 },
    { id: 'washeng', line: 3, label: '蛙声', x: -28, z: -56, radius: 15 },
    { id: 'tianwai', line: 4, label: '天外', x: 66, z: -30, radius: 14 },
    { id: 'shanqian', line: 5, label: '山前', x: 0, z: -76, radius: 15 },
    { id: 'maodian', line: 6, label: '茅店', x: 36, z: 30, radius: 14 },
    { id: 'xiqiao', line: 7, label: '溪桥', x: 0, z: 6, radius: 14 },
  ],
  start: { x: -4, z: 92, heading: 0 },
  fall: { kind: 'snow', color: '#aebccb', size: 0.6, accumulate: 0 },
  luminary: { x: -0.25, y: 0.4, z: -0.88, size: 0.11, kind: 'moon' },
  pavilion: { x: 36, z: 30, rot: 0.8 },
};
