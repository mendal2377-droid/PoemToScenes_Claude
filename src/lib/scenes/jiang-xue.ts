import type { PoemScene } from '../types';

/**
 * 江雪 — Liu Zongyuan. Twenty characters, and almost all of them are absences:
 * no birds, no footprints. The world is nearly empty on purpose.
 */
export const JIANG_XUE: PoemScene = {
  id: 'jiang-xue',
  title: '江雪',
  author: '柳宗元',
  dynasty: '唐',
  romanTitle: 'River Snow, 806',
  note: '千山无鸟，万径无人，只剩一条船。',
  available: true,
  lines: [
    { text: '千山鸟飞绝', tones: 'ppzpz', rhyme: true, note: '一千座山，连飞鸟的影子都断了。' },
    { text: '万径人踪灭', tones: 'zzppz', rhyme: true, note: '一万条路，连脚印都被雪填平了。前两句都是在说"没有"。' },
    { text: '孤舟蓑笠翁', tones: 'pppzp', rhyme: false, note: '天地之间只剩一条船，一个披蓑衣、戴斗笠的老人。' },
    { text: '独钓寒江雪', tones: 'zzppz', rhyme: true, note: '他钓的不是鱼——是这一整条江的雪。' },
  ],
  couplets: [[0, 1]],
  rhymeName: '入声九屑（仄韵）',
  palette: {
    paper: '#e9e7de',
    ink: '#1f2228',
    skyHigh: '#9aa6b0',
    skyLow: '#dcdcd4',
    mountainFar: '#77838f',
    mountainNear: '#8d979f',
    groundHigh: '#e6e8e6',
    groundLow: '#c4cacb',
    // Against all that white the river has to be the darkest thing in the world.
    water: '#8f9ba3',
    waterDeep: '#44525c',
    foliageDark: '#3c4a46',
    foliageLight: '#5d6d64',
    grassTip: '#b6b9ab',
    trunk: '#3a3833',
    accent: '#8c4a3a',
    ochre: '#9a8a70',
    moon: '#f2f2ec',
    mist: '#eceee9',
  },
  terrain: {
    seed: 19,
    extent: 132,
    // Smooth and empty. A snowfield has no detail to give.
    hills: { amp: 1.1, freq: 0.021 },
    swell: { amp: 2.8, freq: 0.0058 },
    rim: { start: 66, amp: 42 },
    basins: [],
    channels: [],
    flats: [],
    // A river you would not cross in a day, running dark through the white.
    rivers: [
      {
        path: [
          [-150, -6],
          [-60, -18],
          [10, -4],
          [80, -20],
          [150, -8],
        ],
        width: 70,
        level: -1.2,
        depth: 5,
      },
    ],
  },
  // 千山: the mountains close in on the far bank, and they are the whole
  // background, not a few hills at the edge.
  skyline: 1.2,
  massifs: [
    { angle: -Math.PI / 2, width: 0.5, boost: 76, ring: 'mid' },
    { angle: -Math.PI / 2 + 0.85, width: 0.34, boost: 46, ring: 'near' },
    { angle: -Math.PI / 2 - 0.95, width: 0.4, boost: 52, ring: 'near' },
    { angle: -Math.PI / 2, width: 0.9, boost: 40, ring: 'far' },
  ],
  atmosphere: { hour: 0.26, wind: 0.16, mist: 0.64, snow: 0.85, cloud: 0.8 },
  flora: {
    // Two or three dead trees, so there is something for the snow to be
    // measured against — and nothing that could be mistaken for company.
    pines: { clusters: [{ x: -84, z: 74, r: 9, count: 3 }] },
    bamboo: { groves: [] },
    broadleaf: { clusters: [] },
    grass: { count: 900, radius: 84, stroke: 0.15 },
    reeds: { count: 220 },
    lotus: { count: 0 },
    rocks: { count: 70 },
  },
  landmarks: [
    { id: 'qianshan', line: 0, label: '千山', x: -70, z: 62, radius: 13 },
    { id: 'wanjing', line: 1, label: '万径', x: -28, z: 76, radius: 13 },
    { id: 'guzhou', line: 2, label: '孤舟', x: 28, z: 76, radius: 13 },
    { id: 'duchao', line: 3, label: '寒江', x: 70, z: 62, radius: 13 },
  ],
  start: { x: 0, z: 94, heading: 0 },
  fall: { kind: 'snow', color: '#ffffff', size: 1, accumulate: 1 },
  luminary: { x: 0.28, y: 0.3, z: -0.91, size: 0.07, kind: 'sun' },
  // One boat, a long way out, and no one within sight of it.
  boat: { x: 28, z: -8, rot: -0.4, on: 'river' },
};
