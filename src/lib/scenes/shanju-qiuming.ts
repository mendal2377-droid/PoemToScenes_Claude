import type { PoemScene } from '../types';

const STREAM_PATH = [
  [-72, -80],
  [-48, -54],
  [-24, -28],
  [-6, -8],
  [4, 14],
  [12, 34],
  [18, 46],
] as const;

/**
 * 山居秋暝 — Wang Wei. An autumn dusk after rain: an empty mountain, moonlight
 * through pines, a spring over stones, washerwomen in the bamboo, a boat parting
 * the lotus. Eight lines, eight places to stand.
 */
export const SHAN_JU: PoemScene = {
  id: 'shanju-qiuming',
  title: '山居秋暝',
  author: '王维',
  dynasty: '唐',
  romanTitle: 'Autumn Dusk in the Mountains, 730',
  note: '雨后的空山，月光从松针间落下来。',
  available: true,
  lines: [
    { text: '空山新雨后', tones: 'pppzz', rhyme: false, note: '雨停了，山里空得像没有人来过。"空"不是无物，是静到近于无。' },
    { text: '天气晚来秋', tones: 'pzzpp', rhyme: true, note: '凉意是傍晚才落下来的——秋天到这一刻才算真的到了。' },
    { text: '明月松间照', tones: 'pzppz', rhyme: false, note: '月光从松针的缝隙里漏下来，落在地上是一块一块的。' },
    { text: '清泉石上流', tones: 'ppzzp', rhyme: true, note: '泉水漫过石面。这一句先被听见，才被看见。' },
    { text: '竹喧归浣女', tones: 'zppzz', rhyme: false, note: '竹林忽然喧闹起来——是洗衣的女子回来了。人未见，声先到。' },
    { text: '莲动下渔舟', tones: 'pzzpp', rhyme: true, note: '莲叶动了一下，渔舟正从那里顺流下来。也是先见其动，后见其人。' },
    { text: '随意春芳歇', tones: 'pzppz', rhyme: false, note: '春天的芳菲，尽管由它谢去吧。' },
    { text: '王孙自可留', tones: 'ppzzp', rhyme: true, note: '《楚辞》说"王孙兮归来，山中兮不可久留"。王维把它反过来说：留下也好。' },
  ],
  couplets: [
    [2, 3],
    [4, 5],
  ],
  rhymeName: '下平十一尤',
  palette: {
    paper: '#efe4c8',
    ink: '#26262e',
    skyHigh: '#8fa2bd',
    skyLow: '#e6d6ad',
    mountainFar: '#3f639e',
    mountainNear: '#438d6b',
    groundHigh: '#8b9455',
    groundLow: '#5c6f44',
    water: '#bcc7bf',
    waterDeep: '#8fa09c',
    foliageDark: '#2c4c3a',
    foliageLight: '#5f8557',
    grassTip: '#bda869',
    trunk: '#5e4a36',
    accent: '#b4523c',
    ochre: '#a8895f',
    moon: '#f6efd4',
    mist: '#e3ddc9',
  },
  terrain: {
    seed: 71,
    extent: 132,
    hills: { amp: 3.4, freq: 0.019 },
    swell: { amp: 6.8, freq: 0.0062 },
    rim: { start: 74, amp: 30 },
    basins: [{ x: 18, z: 46, r: 27, depth: 3.4 }],
    channels: [{ path: STREAM_PATH, width: 5.2, depth: 1.5 }],
    flats: [{ x: -46, z: 28, r: 13, h: 3.2 }],
  },
  atmosphere: { hour: 0.78, wind: 0.5, mist: 0.32, snow: 0, cloud: 0.3 },
  flora: {
    pines: {
      clusters: [
        { x: -28, z: -34, r: 22, count: 22 },
        { x: -52, z: -62, r: 18, count: 12 },
        { x: 34, z: -56, r: 20, count: 13 },
        { x: -66, z: 44, r: 16, count: 9 },
      ],
    },
    bamboo: {
      groves: [
        { x: 44, z: -12, r: 17, count: 150 },
        { x: 56, z: 6, r: 11, count: 70 },
      ],
    },
    broadleaf: {
      clusters: [
        { x: 58, z: 30, r: 13, count: 9, tint: '#b4523c' },
        { x: -58, z: -6, r: 10, count: 5, tint: '#c8913f' },
      ],
    },
    grass: { count: 20000, radius: 90 },
    reeds: { count: 320 },
    lotus: { count: 46 },
    rocks: { count: 130 },
  },
  landmarks: [
    { id: 'kongshan', line: 0, label: '空山', x: -4, z: -66, radius: 13 },
    { id: 'wanqiu', line: 1, label: '晚秋', x: 58, z: 30, radius: 13 },
    { id: 'songjian', line: 2, label: '松间', x: -28, z: -34, radius: 14 },
    { id: 'qingquan', line: 3, label: '清泉', x: -6, z: -8, radius: 11 },
    { id: 'zhuxuan', line: 4, label: '竹林', x: 44, z: -12, radius: 14 },
    { id: 'liandong', line: 5, label: '莲塘', x: 18, z: 14, radius: 14 },
    { id: 'chunfang', line: 6, label: '春芳', x: -58, z: -6, radius: 13 },
    { id: 'wangsun', line: 7, label: '茅亭', x: -46, z: 28, radius: 13 },
  ],
  start: { x: 4, z: 84, heading: 0 },
  fall: { kind: 'leaf', color: '#b4694a', size: 1.3, accumulate: 0 },
  luminary: { x: -0.3, y: 0.34, z: -0.9, size: 0.1, kind: 'moon' },
  boat: { x: 14, z: 36, rot: 0.6 },
  pavilion: { x: -46, z: 28, rot: 0.35 },
};
