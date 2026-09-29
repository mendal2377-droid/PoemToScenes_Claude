import type { PoemScene } from '../types';

const RAVINE = [
  [-72, -62],
  [-42, -36],
  [-10, -6],
  [8, 14],
  [20, 30],
] as const;

/**
 * 鸟鸣涧 — Wang Wei. Twenty characters, and the whole thing turns on how quiet
 * it is: the poem is only able to notice osmanthus falling, and a bird waking,
 * because there is nothing else to hear.
 *
 * So this is the darkest and emptiest of the walkable worlds — a spring night,
 * a ravine running through it, and gold osmanthus coming down.
 */
export const NIAO_MING: PoemScene = {
  id: 'niaoming',
  title: '鸟鸣涧',
  author: '王维',
  dynasty: '唐',
  romanTitle: 'Birdsong Ravine, c.715',
  note: '静到能听见桂花落下来。',
  available: true,
  lines: [
    { text: '人闲桂花落', tones: 'ppzpz', rhyme: false, note: '人闲下来了，才听得见桂花落。桂花极小，落地无声——所以这一句其实是在写"静"。' },
    { text: '夜静春山空', tones: 'zzppp', rhyme: true, note: '夜静了，春天的山也空了。"空"不是没有东西，是没有事情。' },
    { text: '月出惊山鸟', tones: 'zzppz', rhyme: false, note: '月亮升起来，竟把山鸟惊动了——月光是没有声音的，可见这里静到什么地步。' },
    { text: '时鸣春涧中', tones: 'pppzp', rhyme: true, note: '鸟在春涧里不时叫一声。一声一声之间的空白，才是全诗要写的东西。' },
  ],
  couplets: [[0, 1]],
  rhymeName: '上平一东',
  palette: {
    paper: '#e6e4d8',
    ink: '#1e2028',
    skyHigh: '#22304e',
    skyLow: '#6b7f86',
    mountainFar: '#2a4060',
    mountainNear: '#365a52',
    groundHigh: '#4e6b4c',
    groundLow: '#36503c',
    water: '#8ea6a8',
    waterDeep: '#4c666c',
    foliageDark: '#22402f',
    foliageLight: '#457a52',
    grassTip: '#7e9460',
    trunk: '#3e3a30',
    accent: '#c9b060',
    ochre: '#8a7a58',
    moon: '#fbf6df',
    mist: '#cfd6d2',
  },
  terrain: {
    seed: 715,
    extent: 132,
    hills: { amp: 4.2, freq: 0.022 },
    swell: { amp: 7.4, freq: 0.0066 },
    rim: { start: 72, amp: 32 },
    basins: [{ x: 20, z: 30, r: 16, depth: 3 }],
    channels: [{ path: RAVINE, width: 6.4, depth: 2.2 }],
    flats: [],
  },
  atmosphere: { hour: 0.95, wind: 0.25, mist: 0.55, snow: 0.45, cloud: 0.28 },
  flora: {
    pines: {
      clusters: [
        { x: 0, z: -58, r: 22, count: 18 },
        { x: 52, z: -30, r: 18, count: 12 },
        { x: -60, z: -20, r: 16, count: 10 },
      ],
    },
    bamboo: { groves: [{ x: 30, z: 52, r: 14, count: 100 }] },
    broadleaf: { clusters: [{ x: -30, z: 44, r: 14, count: 9, tint: '#c9b060' }] },
    grass: { count: 16000, radius: 88 },
    reeds: { count: 120 },
    lotus: { count: 0 },
    rocks: { count: 150 },
  },
  landmarks: [
    { id: 'guihua', line: 0, label: '桂花', x: -30, z: 44, radius: 14 },
    { id: 'chunshan', line: 1, label: '春山', x: 0, z: -58, radius: 15 },
    { id: 'yuechu', line: 2, label: '月出', x: 52, z: -30, radius: 15 },
    { id: 'jianzhong', line: 3, label: '春涧', x: -10, z: -6, radius: 14 },
  ],
  start: { x: 4, z: 82, heading: 0 },
  fall: { kind: 'petal', color: '#d8c274', size: 0.75, accumulate: 0 },
  luminary: { x: 0.1, y: 0.2, z: -0.97, size: 0.16, kind: 'moon' },
};
