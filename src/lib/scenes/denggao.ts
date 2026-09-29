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
    paper: '#e9e0cc',
    ink: '#282622',
    skyHigh: '#8b8e94',
    skyLow: '#cfc8b2',
    mountainFar: '#6e737c',
    mountainNear: '#7e7a62',
    groundHigh: '#9a8f5e',
    groundLow: '#6e6748',
    water: '#b3b6ae',
    waterDeep: '#7d8480',
    foliageDark: '#514a34',
    foliageLight: '#8a7a48',
    grassTip: '#b9a464',
    trunk: '#5a4a38',
    accent: '#a8552f',
    ochre: '#a08a5e',
    moon: '#efe9d6',
    mist: '#ddd8c6',
  },
  terrain: {
    seed: 767,
    extent: 132,
    hills: { amp: 4.6, freq: 0.021 },
    swell: { amp: 8.2, freq: 0.0068 },
    rim: { start: 70, amp: 34 },
    basins: [{ x: 0, z: 62, r: 60, depth: 5 }],
    channels: [],
    // The 台 stands well above everything else; the wine shop is a low pad.
    flats: [
      { x: -30, z: -40, r: 15, h: 15 },
      { x: 52, z: -66, r: 12, h: 4 },
    ],
  },
  atmosphere: { hour: 0.42, wind: 1.45, mist: 0.45, snow: 0.55, cloud: 0.5 },
  flora: {
    pines: { clusters: [{ x: -64, z: -46, r: 18, count: 11 }] },
    bamboo: { groves: [] },
    broadleaf: {
      clusters: [
        { x: 44, z: -38, r: 19, count: 14, tint: '#a8552f' },
        { x: 12, z: -72, r: 14, count: 8, tint: '#b08a46' },
      ],
    },
    grass: { count: 18000, radius: 94 },
    reeds: { count: 300 },
    lotus: { count: 0 },
    rocks: { count: 160 },
  },
  landmarks: [
    { id: 'fengji', line: 0, label: '风急', x: -64, z: -46, radius: 15 },
    { id: 'zhuqing', line: 1, label: '渚清', x: 0, z: -4, radius: 14 },
    { id: 'luomu', line: 2, label: '落木', x: 44, z: -38, radius: 16 },
    { id: 'changjiang', line: 3, label: '长江', x: -40, z: 4, radius: 14 },
    { id: 'beiqiu', line: 4, label: '悲秋', x: 64, z: 6, radius: 15 },
    { id: 'dengtai', line: 5, label: '登台', x: -30, z: -40, radius: 15 },
    { id: 'shuangbin', line: 6, label: '霜鬓', x: 12, z: -72, radius: 14 },
    { id: 'zhuobei', line: 7, label: '浊酒', x: 52, z: -66, radius: 14 },
  ],
  start: { x: 0, z: -92, heading: Math.PI },
  fall: { kind: 'leaf', color: '#b07a45', size: 1.5, accumulate: 0 },
  luminary: { x: 0.3, y: 0.5, z: 0.8, size: 0.08, kind: 'sun' },
  pavilion: { x: 52, z: -66, rot: -0.4 },
};
