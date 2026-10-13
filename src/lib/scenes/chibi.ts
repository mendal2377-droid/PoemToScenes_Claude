import type { PoemScene } from '../types';

/**
 * 赤壁 — the red cliffs, a wall of them along the north bank, standing straight
 * up out of the water. A row of hills whose river side the channel has cut
 * sheer: the carve takes the foot of each, so the face rises twenty-five metres
 * in the last ten.
 */
const CLIFFS = [-104, -86, -68, -50, -32, -14, 4, 22, 40, 58, 76, 94].map((x, i) => ({
  x,
  z: -84 - (i % 3) * 3,
  r: 15 + (i % 2) * 3,
  h: [44, 52, 48, 58, 50, 46, 56, 50, 54, 46, 50, 42][i],
}));

/** Crags along the top of the wall, so its skyline breaks rather than rolls. */
const CRAGS = [-96, -78, -59, -41, -24, -5, 31, 49, 67, 86].map((x, i) => ({
  x: x + (i % 2) * 3,
  z: -76 - (i % 3) * 4,
  r: 5 + (i % 3) * 1.5,
  h: [16, 11, 19, 13, 17, 12, 18, 14, 15, 11][i],
}));

/**
 * 赤壁赋 — Su Shi, the autumn of 1082, in exile at Huangzhou.
 *
 * On the night after the full moon of the seventh month he and his friends took
 * a boat out under the red cliffs on the Yangtze. The moon came up over the
 * eastern hills, the mist lay white across the river, and one of the guests
 * played the 洞箫 so sadly that Su asked him why. The guest answered with Cao
 * Cao, whose fleet was burnt somewhere near here: so great a man, and where is
 * he now — and what are we, mayflies on a leaf of a boat? Su answered with the
 * water and the moon. Then they drank again and slept in the boat till it was
 * light.
 *
 * It is a 赋, prose with a sung core, and too long to inscribe whole; the
 * inscription carries its sixteen most-quoted sentences, walked in order along
 * the south bank, the cliffs across the water the whole way. The film
 * (scripts/reel/chibi.js) writes all of it.
 */
export const CHI_BI: PoemScene = {
  id: 'chibi',
  kind: 'prose',
  journey: true,
  title: '赤壁赋',
  author: '苏轼',
  dynasty: '宋',
  romanTitle: 'The Red Cliffs, 1082',
  note: '清风徐来，水波不兴。月出东山，白露横江。',
  available: true,
  lines: [
    { text: '壬戌之秋，七月既望', tones: '', rhyme: false, note: '壬戌年是宋神宗元丰五年（1082）。"既望"是十六，月亮刚过最圆的那一夜。苏轼贬到黄州，已经第三年。' },
    { text: '苏子与客泛舟游于赤壁之下', tones: '', rhyme: false, note: '泛舟，是让船自己漂。他们去的是黄州的赤鼻矶，未必是当年鏖战的赤壁——苏轼自己也知道，并不在意。' },
    { text: '清风徐来，水波不兴', tones: '', rhyme: false, note: '风是慢慢来的，水面一点波都不起。全篇从这样一个平静的江面开始。' },
    { text: '月出于东山之上，徘徊于斗牛之间', tones: '', rhyme: false, note: '月亮从东山后面上来，在斗宿和牛宿之间流连。"徘徊"二字把月亮写成了一个不肯走的人。' },
    { text: '白露横江，水光接天', tones: '', rhyme: false, note: '白茫茫的水气横在江上，水上的光一直连到天上，分不出界线。' },
    { text: '纵一苇之所如，凌万顷之茫然', tones: '', rhyme: false, note: '任这一叶小船漂到哪里去，越过茫茫万顷的江面。"一苇"是极小，"万顷"是极大。' },
    { text: '客有吹洞箫者，倚歌而和之', tones: '', rhyme: false, note: '有位客人吹洞箫，按着歌声应和。箫声一起，前面的快乐就转了调。' },
    { text: '舞幽壑之潜蛟，泣孤舟之嫠妇', tones: '', rhyme: false, note: '箫声能让深谷里潜藏的蛟龙起舞，让孤船上的寡妇落泪。写声音，却全写听的人。' },
    { text: '月明星稀，乌鹊南飞', tones: '', rhyme: false, note: '客人引曹操《短歌行》里的句子。同一轮月，同一条江，当年的人在哪里？' },
    { text: '西望夏口，东望武昌', tones: '', rhyme: false, note: '往西是夏口，往东是武昌，山水缠绕，一片苍苍。这里正是曹操被周瑜所困的地方。' },
    { text: '舳舻千里，旌旗蔽空', tones: '', rhyme: false, note: '曹操顺江东下时，战船首尾相接千里，旗帜遮住了天空。"固一世之雄也，而今安在哉？"' },
    { text: '寄蜉蝣于天地，渺沧海之一粟', tones: '', rhyme: false, note: '人在天地间，像朝生暮死的蜉蝣，像大海里的一粒米。客人的悲，到这里说尽了。' },
    { text: '逝者如斯，而未尝往也', tones: '', rhyme: false, note: '苏轼答：江水这样流去，却从来没有真正流走。从变的一面看，天地一瞬；从不变的一面看，物与我都无尽。' },
    { text: '惟江上之清风，与山间之明月', tones: '', rhyme: false, note: '只有江上的清风、山间的明月，耳听为声，目见成色，取之不尽，谁也不禁。' },
    { text: '客喜而笑，洗盏更酌', tones: '', rhyme: false, note: '客人笑了，洗了杯子重新斟酒。一场辩论，以一杯酒收场。' },
    { text: '相与枕藉乎舟中，不知东方之既白', tones: '', rhyme: false, note: '大家横七竖八睡在船里，不知道东方已经亮了。全篇停在天亮，没有结论。' },
  ],
  couplets: [],
  rhymeName: '',
  // 浅绛 — the ochre-and-crimson tradition, which is the colour of the cliffs.
  paint: 'qianjiang',
  palette: {
    paper: '#e8dfcb',
    ink: '#231f1c',
    skyHigh: '#28304a',
    skyLow: '#7b7f92',
    mountainFar: '#4c5470',
    mountainNear: '#6e4c40',
    // 赤 — the rock is red where it stands high.
    groundHigh: '#a84a30',
    groundLow: '#4f4b3f',
    water: '#98a2b2',
    waterDeep: '#33405a',
    foliageDark: '#2f3a2e',
    foliageLight: '#6a7656',
    grassTip: '#a8a074',
    trunk: '#3e342a',
    accent: '#b8442c',
    ochre: '#a48a62',
    moon: '#f8f3e0',
    mist: '#d4d8de',
  },
  terrain: {
    seed: 1082,
    extent: 132,
    hills: { amp: 3.2, freq: 0.03 },
    swell: { amp: 2.6, freq: 0.007 },
    rim: { start: 96, amp: 28 },
    basins: [],
    channels: [],
    flats: [],
    bumps: [
      ...CLIFFS,
      ...CRAGS,
      // 幽壑 — a dark cleft cut back into the cliff.
      { x: 13, z: -74, r: 6, h: -26 },
      { x: 14, z: -82, r: 5, h: -20 },
      // A low hill at the east end of the south bank, high enough to look down
      // on the boat and see how small it is.
      { x: 74, z: 94, r: 14, h: 12 },
    ],
    // 长江 — east to west across the whole world, wide enough that the far bank
    // is a wall of rock across a field of water.
    rivers: [
      {
        path: [
          [-150, 4],
          [-75, -4],
          [0, 2],
          [75, 8],
          [150, 0],
        ],
        width: 100,
        level: -1.6,
        depth: 7,
      },
    ],
  },
  skyline: 0.85,
  massifs: [
    // 东山 — the moon comes up behind it.
    { angle: -0.45, width: 0.5, boost: 34, ring: 'mid' },
    // 西望夏口 — and the far hills the other way.
    { angle: Math.PI, width: 0.6, boost: 22, ring: 'far' },
  ],
  // Low on the south bank, the river and the cliffs across it.
  view: { dist: 130, pitch: 0.3, target: [0, 8, -20] },
  atmosphere: { hour: 0.9, wind: 0.22, mist: 0.6, snow: 0.12, cloud: 0.12 },
  flora: {
    pines: {
      clusters: [
        { x: -60, z: -96, r: 14, count: 9 },
        { x: 30, z: -98, r: 14, count: 9 },
        { x: 64, z: -90, r: 10, count: 6 },
      ],
    },
    bamboo: { groves: [] },
    broadleaf: {
      clusters: [
        { x: -48, z: 98, r: 12, count: 9, tint: '#7a6a3e' },
        { x: 30, z: 102, r: 12, count: 9, tint: '#8a5a34' },
      ],
    },
    grass: { count: 6000, radius: 100, stroke: 0.5 },
    // 江渚 — reeds all along the south shore.
    reeds: { count: 700 },
    lotus: { count: 0 },
    rocks: { count: 120 },
  },
  landmarks: [
    // 壬戌之秋，七月既望 — the river at night, and the moon one night past full.
    { id: 'jiwang', line: 0, label: '既望', x: -70, z: 76, radius: 12, look: [-20, -20, 6] },
    // 苏子与客泛舟游于赤壁之下 — the boat, small under the cliffs.
    { id: 'fanzhou', line: 1, label: '泛舟', x: -58, z: 80, radius: 12, look: [-6, -32, 2], zoom: 1.4 },
    // 清风徐来，水波不兴 — the water, flat.
    { id: 'qingfeng', line: 2, label: '清风', x: -46, z: 78, radius: 12, look: [-30, 20, -1.2] },
    // 月出于东山之上 — the moon over the eastern hills.
    { id: 'yuechu', line: 3, label: '月出', x: -34, z: 80, radius: 12, look: 'moon' },
    // 白露横江，水光接天 — the mist on the river, and the light running into the sky.
    { id: 'bailu', line: 4, label: '白露', x: -22, z: 78, radius: 12, look: [60, -10, 2] },
    // 纵一苇之所如 — one reed of a boat on all that water.
    { id: 'yiwei', line: 5, label: '一苇', x: -8, z: 80, radius: 12, look: [-6, -32, 1], zoom: 1.2 },
    // 客有吹洞箫者 — the piper, in the boat.
    { id: 'dongxiao', line: 6, label: '洞箫', x: 6, z: 78, radius: 12, look: [-6, -32, 1.4], zoom: 2.4 },
    // 舞幽壑之潜蛟 — a dark cleft in the cliffs.
    { id: 'youhe', line: 7, label: '幽壑', x: 20, z: 80, radius: 12, look: [13, -80, 14], zoom: 1.5 },
    // 月明星稀，乌鹊南飞 — the sky, and the birds going over.
    { id: 'wuque', line: 8, label: '乌鹊', x: 34, z: 80, radius: 12, look: [10, -90, 60] },
    // 西望夏口，东望武昌 — up the river to the west.
    { id: 'xiakou', line: 9, label: '夏口', x: 48, z: 82, radius: 12, look: [-130, -10, 6] },
    // 舳舻千里 — down the river to the east, where the fleet came from.
    { id: 'zhulu', line: 10, label: '舳舻', x: 60, z: 84, radius: 12, look: [130, 0, 4] },
    // 寄蜉蝣于天地 — from the hill, the boat a speck on the river.
    { id: 'fuyou', line: 11, label: '蜉蝣', x: 68, z: 86, radius: 11, look: [-6, -32, 0.5], zoom: 1.1 },
    // 逝者如斯 — the water going by.
    { id: 'shizhe', line: 12, label: '逝者', x: 52, z: 76, radius: 12, look: [100, 40, -1.4] },
    // 惟江上之清风，与山间之明月 — the moon over the cliffs.
    { id: 'mingyue', line: 13, label: '明月', x: 38, z: 74, radius: 12, look: 'moon', zoom: 0.9 },
    // 客喜而笑，洗盏更酌 — the boat again, close.
    { id: 'gengzhuo', line: 14, label: '更酌', x: 24, z: 74, radius: 12, look: [-6, -32, 1], zoom: 2.2 },
    // 不知东方之既白 — the east.
    { id: 'jibai', line: 15, label: '既白', x: 10, z: 74, radius: 12, look: [140, -20, 10] },
  ],
  start: { x: -80, z: 74, heading: Math.PI },
  // Early autumn: a few leaves on the wind, nothing more.
  fall: { kind: 'leaf', color: '#9a7a4c', size: 1.1, accumulate: 0 },
  // The moon over 东山, a little north of east, above the end of the cliffs.
  luminary: { x: 0.86, y: 0.26, z: -0.42, size: 0.11, kind: 'moon' },
  // 泛舟 — a covered boat under the cliffs, and the three of them in it: Su
  // at the bow end, facing back, the piper and the other guest facing him —
  // all three where the hull is wide enough to hold them (see validate.ts).
  boat: {
    x: -6,
    z: -32,
    rot: Math.PI / 2,
    on: 'river',
    party: [
      { role: 'scholar', x: 0, z: 1.6, rot: Math.PI },
      { role: 'piper', x: -0.1, z: -0.8, rot: 0.2 },
      { role: 'poet', x: 0.05, z: -1.75, rot: -0.15 },
    ],
  },
  // 泣孤舟之嫠妇 — and one other boat out on the river, alone.
  boats: [{ x: 34, z: 14, rot: 2.2, on: 'river' }],
  // 乌鹊南飞 — a few dark birds circling over the cliff top.
  flocks: [{ x: 10, z: -70, y: 52, count: 6, radius: 14, speed: 0.22 }],
  // 江渚 — a pale shingle bar on the south shore.
  sand: [{ x: -36, z: 72, r: 9 }, { x: 46, z: 74, r: 8 }],
};
