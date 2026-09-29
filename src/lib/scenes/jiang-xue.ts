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
    groundHigh: '#e4e6e4',
    groundLow: '#c2c8c9',
    water: '#b8c4ca',
    waterDeep: '#77878f',
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
    hills: { amp: 2.4, freq: 0.021 },
    swell: { amp: 5.2, freq: 0.0058 },
    rim: { start: 62, amp: 40 },
    basins: [{ x: 4, z: 26, r: 48, depth: 4.2 }],
    channels: [],
    flats: [],
  },
  atmosphere: { hour: 0.26, wind: 0.26, mist: 0.5, snow: 0.8, cloud: 0.62 },
  flora: {
    pines: {
      clusters: [
        { x: -54, z: -46, r: 18, count: 9 },
        { x: 52, z: -52, r: 16, count: 7 },
      ],
    },
    bamboo: { groves: [] },
    broadleaf: { clusters: [] },
    grass: { count: 1200, radius: 74 },
    reeds: { count: 180 },
    lotus: { count: 0 },
    rocks: { count: 90 },
  },
  landmarks: [
    { id: 'qianshan', line: 0, label: '千山', x: -50, z: -48, radius: 15 },
    { id: 'wanjing', line: 1, label: '万径', x: 46, z: -28, radius: 15 },
    { id: 'guzhou', line: 2, label: '孤舟', x: 4, z: -28, radius: 15 },
    { id: 'duchao', line: 3, label: '寒江', x: -46, z: 2, radius: 17 },
  ],
  start: { x: -10, z: 84, heading: 0 },
  fall: { kind: 'snow', color: '#ffffff', size: 1, accumulate: 1 },
  luminary: { x: 0.28, y: 0.3, z: -0.91, size: 0.07, kind: 'sun' },
  boat: { x: 4, z: 8, rot: -0.4 },
};
