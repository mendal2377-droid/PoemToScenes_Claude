import type { PoemScene } from '../types';

/**
 * 登高 — Du Fu, 767, written on the Double Ninth at Kuizhou.
 *
 * Often called the finest 七言律诗 ever written, partly because all four of its
 * couplets are 对仗 — a regulated poem is only required to match the middle two,
 * and matching every line for fifty-six characters without the thing turning
 * into an exercise is the feat. The inscription brackets all four.
 *
 * A high terrace, a great river, a hard wind, and leaves coming down without
 * end.
 */
export const DENG_GAO: PoemScene = {
  id: 'denggao',
  title: '登高',
  author: '杜甫',
  dynasty: '唐',
  romanTitle: 'Climbing High, 767',
  note: '风急天高，落木不尽。全篇四联皆对仗。',
  available: true,
  lines: [
    { text: '风急天高猿啸哀', tones: 'pzpppzp', rhyme: true, note: '风很急，天很高，峡里的猿在叫。三样东西并排放着，一句里就有了三层空。' },
    { text: '渚清沙白鸟飞回', tones: 'zppzzpp', rhyme: true, note: '沙洲清冷，沙是白的，鸟在风里被吹得打转飞回。' },
    { text: '无边落木萧萧下', tones: 'ppzzppz', rhyme: false, note: '"无边"和下句的"不尽"对着说——落叶没有边界，也没有尽头。' },
    { text: '不尽长江滚滚来', tones: 'zzppzzp', rhyme: true, note: '长江滚滚而来。萧萧是声音，滚滚也是声音，一落一来。' },
    { text: '万里悲秋常作客', tones: 'zzpppzz', rhyme: false, note: '离家万里，年年在外，连悲秋都成了习惯。' },
    { text: '百年多病独登台', tones: 'zppzzpp', rhyme: true, note: '一生多病，今天是独自登的台。"独"字是全诗最重的一个字。' },
    { text: '艰难苦恨繁霜鬓', tones: 'ppzzppz', rhyme: false, note: '世道艰难，恨的是两鬓的白发又添了。' },
    { text: '潦倒新停浊酒杯', tones: 'zzppzzp', rhyme: true, note: '潦倒到连浊酒也刚戒了——最后连这点排遣也没有了。' },
  ],
  couplets: [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 7],
  ],
  rhymeName: '上平十灰',
  palette: {
    // Everything the colour of a bruise, or of old paper: brown water, grey
    // rock, a low sky with no sun in it.
    paper: '#e6dcc4',
    ink: '#26221e',
    skyHigh: '#7b7a7c',
    skyLow: '#c9bea2',
    mountainFar: '#5e626c',
    mountainNear: '#78704e',
    groundHigh: '#8f8352',
    groundLow: '#635b3d',
    water: '#a39d88',
    waterDeep: '#5d5a48',
    foliageDark: '#4a4130',
    foliageLight: '#8a7440',
    grassTip: '#b09a58',
    trunk: '#4e3f30',
    accent: '#a04a28',
    ochre: '#987f52',
    moon: '#efe9d6',
    mist: '#d0c9b4',
  },
  terrain: {
    seed: 767,
    extent: 132,
    hills: { amp: 4.2, freq: 0.021 },
    swell: { amp: 7.4, freq: 0.0068 },
    rim: { start: 62, amp: 38 },
    basins: [],
    channels: [],
    // The 台 itself — a level platform cut into the top of a high shoulder.
    flats: [{ x: -84, z: -30, r: 10, h: 24 }],
    bumps: [
      { x: -84, z: -30, r: 24, h: 26 },
      { x: -94, z: 40, r: 22, h: 24 },
      { x: -68, z: -100, r: 24, h: 26 },
      { x: 96, z: -34, r: 26, h: 34 },
      { x: 100, z: 52, r: 26, h: 28 },
    ],
    // 不尽长江滚滚来 — and it does come: the river runs down out of the far
    // gorge and straight at the viewer, brown, wide and in no hurry.
    rivers: [
      {
        path: [
          [0, -150],
          [15, -60],
          [50, 0],
          [40, 70],
          [70, 150],
        ],
        width: 84,
        level: -2,
        depth: 7,
      },
    ],
  },
  // A gorge: walls to either hand and a great mass at the head of it.
  skyline: 1.25,
  massifs: [
    { angle: 0, width: 0.55, boost: 62, ring: 'near' },
    { angle: Math.PI, width: 0.55, boost: 56, ring: 'near' },
    { angle: -Math.PI / 2, width: 0.5, boost: 60, ring: 'mid' },
  ],
  atmosphere: { hour: 0.42, wind: 1.45, mist: 0.5, snow: 0.9, cloud: 0.8 },
  flora: {
    pines: { clusters: [{ x: -92, z: -70, r: 13, count: 8 }] },
    bamboo: { groves: [] },
    broadleaf: {
      clusters: [
        { x: -56, z: -6, r: 16, count: 16, tint: '#a84e28' },
        { x: -62, z: 56, r: 14, count: 11, tint: '#b58a3c' },
      ],
    },
    grass: { count: 14000, radius: 90, stroke: 0.6 },
    reeds: { count: 320 },
    lotus: { count: 0 },
    rocks: { count: 190 },
  },
  landmarks: [
    // 风急天高猿啸哀 — the cliff, and the apes on it, calling.
    { id: 'fengji', line: 0, label: '风急', x: -64, z: -74, radius: 13, look: [-70, -104, 30], zoom: 1.5 },
    // 渚清沙白鸟飞回 — the bar of white sand, and birds wheeling back over it.
    { id: 'zhuqing', line: 1, label: '渚清', x: -44, z: -42, radius: 13, look: [-32, -58, 6], zoom: 1.3 },
    // 无边落木萧萧下 — the trees, being stripped.
    { id: 'luomu', line: 2, label: '落木', x: -44, z: -2, radius: 14, look: [-58, -6, 8], zoom: 1.2 },
    // 不尽长江滚滚来 — the river, coming down out of the north and on towards you.
    { id: 'changjiang', line: 3, label: '长江', x: -44, z: 36, radius: 13, look: [30, -30, 0.4] },
    // 万里悲秋常作客 — the horizon, and how far it is from home.
    { id: 'beiqiu', line: 4, label: '悲秋', x: -50, z: 70, radius: 13, look: [40, -220, 44] },
    // 百年多病独登台 — the terrace, and the river a long way below it.
    { id: 'dengtai', line: 5, label: '登台', x: -84, z: -30, radius: 11, look: [20, 10, 0.3] },
    // 艰难苦恨繁霜鬓 — the ground, close: frost on dead grass.
    { id: 'shuangbin', line: 6, label: '霜鬓', x: -90, z: 20, radius: 12, look: [-98, 36, 0.8], zoom: 1.8 },
    // 潦倒新停浊酒杯 — the jar, and the cup put down beside it.
    { id: 'zhuobei', line: 7, label: '浊酒', x: -60, z: 84, radius: 12, look: [-54, 88, 0.85], zoom: 2.2 },
  ],
  start: { x: -30, z: 98, heading: 0 },
  // The gale strips the trees, and it does not stop.
  fall: { kind: 'leaf', color: '#b07a45', size: 1.7, accumulate: 0 },
  luminary: { x: 0.3, y: 0.5, z: 0.8, size: 0.08, kind: 'sun' },
  pavilion: { x: -84, z: -30, rot: 0.6 },
  // 猿啸哀 — apes on the rock, and birds over the bar.
  people: [
    { x: -69, z: -99, rot: 0.4, role: 'monkey' },
    { x: -73, z: -96, rot: 0.9, role: 'monkey', scale: 0.85 },
    { x: -66, z: -101, rot: 0.1, role: 'monkey', scale: 0.7 },
  ],
  flocks: [{ x: -30, z: -58, y: 9, count: 6, radius: 12, speed: 0.4 }],
  sand: [{ x: -48, z: -56, r: 10 }],
  // 浊酒杯 — set down.
  props: [{ kind: 'winejar', x: -54, z: 88, rot: 0.5 }],
  sounds: [{ kind: 'gibbon', x: -68, z: -98, r: 38 }],
};

