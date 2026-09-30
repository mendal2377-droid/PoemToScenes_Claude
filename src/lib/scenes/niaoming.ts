import type { PoemScene } from '../types';

const RAVINE = [
  [-10, -96],
  [8, -58],
  [-6, -22],
  [6, 14],
  [-2, 52],
  [6, 100],
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
    paper: '#e2e3da',
    ink: '#141822',
    skyHigh: '#10182f',
    skyLow: '#43586e',
    mountainFar: '#1f3050',
    mountainNear: '#2a4a52',
    groundHigh: '#3d5a4a',
    groundLow: '#243830',
    water: '#8aa4b0',
    waterDeep: '#3a5664',
    foliageDark: '#183428',
    foliageLight: '#3f7a5c',
    grassTip: '#6e8f6a',
    trunk: '#302c26',
    accent: '#dcc45e',
    ochre: '#7a6e52',
    moon: '#fbf6df',
    mist: '#b9c6cc',
  },
  terrain: {
    seed: 715,
    extent: 132,
    hills: { amp: 5.2, freq: 0.024 },
    swell: { amp: 9, freq: 0.0075 },
    // A bowl: the walls stand up all round at about forty metres out.
    rim: { start: 44, amp: 62 },
    basins: [],
    channels: [{ path: RAVINE, width: 7.4, depth: 3.2 }],
    flats: [],
    // Two shoulders of the mountain pressing in from either side, so the
    // ravine is a slot and not a valley.
    bumps: [
      { x: -50, z: -18, r: 22, h: 30 },
      { x: 52, z: -20, r: 23, h: 34 },
      { x: -58, z: 34, r: 20, h: 22 },
      { x: 60, z: 30, r: 20, h: 24 },
      { x: 0, z: -92, r: 32, h: 46 },
    ],
  },
  skyline: 1.35,
  atmosphere: { hour: 0.95, wind: 0.08, mist: 0.66, snow: 0.6, cloud: 0.22 },
  flora: {
    pines: {
      clusters: [
        { x: -36, z: -46, r: 16, count: 12 },
        { x: 40, z: -44, r: 15, count: 11 },
        { x: -40, z: 4, r: 13, count: 8 },
        { x: 42, z: 8, r: 13, count: 8 },
      ],
    },
    bamboo: { groves: [{ x: 34, z: 58, r: 11, count: 80 }] },
    // 桂花 — osmanthus, small and gold, the thing that is falling.
    broadleaf: { clusters: [{ x: -28, z: 38, r: 10, count: 7, tint: '#dcc45e' }] },
    grass: { count: 14000, radius: 78, stroke: 0.5 },
    reeds: { count: 110 },
    lotus: { count: 0 },
    rocks: { count: 210 },
  },
  landmarks: [
    // 人闲桂花落 — the osmanthus, seen from a little way off, and someone idle under it.
    { id: 'guihua', line: 0, label: '桂花', x: -12, z: 46, radius: 13, look: [-28, 38, 4], zoom: 1.25 },
    // 夜静春山空 — up the empty ravine to the mountain at its head.
    { id: 'chunshan', line: 1, label: '春山', x: 0, z: -56, radius: 14, look: [0, -100, 28] },
    // 月出惊山鸟 — the moon coming up, and the birds it has startled.
    { id: 'yuechu', line: 2, label: '月出', x: 0, z: 88, radius: 13, look: 'moon' },
    // 时鸣春涧中 — the brook, and somewhere along it a bird.
    { id: 'jianzhong', line: 3, label: '春涧', x: 6, z: 14, radius: 12, look: [-6, -20, 0.5], zoom: 1.2 },
  ],
  start: { x: -14, z: 94, heading: 0 },
  // Petals so small and slow they are barely weather at all.
  fall: { kind: 'petal', color: '#e2cc6a', size: 0.7, accumulate: 0 },
  luminary: { x: 0.12, y: 0.34, z: -0.93, size: 0.13, kind: 'moon' },
  // 人闲 — a man with nothing to do, sitting under the tree.
  people: [{ x: -22, z: 41, rot: -1.0, role: 'scholar', sit: true }],
  // 惊山鸟 — a few birds up off the ridge, and the sounds of one in the brook.
  flocks: [{ x: 4.5, z: 53, y: 45, count: 5, radius: 5, speed: 0.5 }],
  sounds: [
    { kind: 'birdsong', x: 34, z: -30, r: 24 },
    { kind: 'birdsong', x: 4, z: 8, r: 26 },
  ],
};

