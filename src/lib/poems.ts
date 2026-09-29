import type { PoemScene } from './types';

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
const SHAN_JU: PoemScene = {
  id: 'shanju-qiuming',
  title: '山居秋暝',
  author: '王维',
  dynasty: '唐',
  romanTitle: 'Autumn Dusk in the Mountains, 730',
  note: '雨后的空山，月光从松针间落下来。',
  available: true,
  lines: [
    '空山新雨后',
    '天气晚来秋',
    '明月松间照',
    '清泉石上流',
    '竹喧归浣女',
    '莲动下渔舟',
    '随意春芳歇',
    '王孙自可留',
  ],
  palette: {
    paper: '#efe4c8',
    ink: '#26262e',
    skyHigh: '#8fa2bd',
    skyLow: '#e6d6ad',
    mountainFar: '#3f639e',
    mountainNear: '#438d6b',
    groundHigh: '#7d9260',
    groundLow: '#5d7a55',
    water: '#a9c2c4',
    waterDeep: '#6b8a92',
    foliageDark: '#2f5340',
    foliageLight: '#6d9464',
    trunk: '#5e4a36',
    accent: '#b4523c',
    ochre: '#a8895f',
    moon: '#f6efd4',
    mist: '#dfe3d8',
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
  atmosphere: { hour: 0.74, wind: 0.5, mist: 0.32, snow: 0 },
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
    { id: 'kongshan', line: 0, label: '空山', x: -4, z: -66, radius: 9 },
    { id: 'wanqiu', line: 1, label: '晚秋', x: 58, z: 30, radius: 9 },
    { id: 'songjian', line: 2, label: '松间', x: -28, z: -34, radius: 10 },
    { id: 'qingquan', line: 3, label: '清泉', x: -6, z: -8, radius: 8 },
    { id: 'zhuxuan', line: 4, label: '竹林', x: 44, z: -12, radius: 10 },
    { id: 'liandong', line: 5, label: '莲塘', x: 18, z: 30, radius: 10 },
    { id: 'chunfang', line: 6, label: '春芳', x: -58, z: -6, radius: 9 },
    { id: 'wangsun', line: 7, label: '茅亭', x: -46, z: 28, radius: 9 },
  ],
  start: { x: 4, z: 84, heading: 0 },
  luminary: { x: -0.34, y: 0.42, z: -0.84, size: 0.085, kind: 'moon' },
  boat: { x: 14, z: 36, rot: 0.6 },
  pavilion: { x: -46, z: 28, rot: 0.35 },
};

/**
 * 江雪 — Liu Zongyuan. Twenty characters, and almost all of them are absences:
 * no birds, no footprints. The world is nearly empty on purpose.
 */
const JIANG_XUE: PoemScene = {
  id: 'jiang-xue',
  title: '江雪',
  author: '柳宗元',
  dynasty: '唐',
  romanTitle: 'River Snow, 806',
  note: '千山无鸟，万径无人，只剩一条船。',
  available: true,
  lines: ['千山鸟飞绝', '万径人踪灭', '孤舟蓑笠翁', '独钓寒江雪'],
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
  atmosphere: { hour: 0.26, wind: 0.26, mist: 0.5, snow: 0.8 },
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
    { id: 'qianshan', line: 0, label: '千山', x: -50, z: -48, radius: 11 },
    { id: 'wanjing', line: 1, label: '万径', x: 46, z: -28, radius: 11 },
    { id: 'guzhou', line: 2, label: '孤舟', x: 4, z: 8, radius: 11 },
    { id: 'duchao', line: 3, label: '寒江', x: -22, z: 34, radius: 12 },
  ],
  start: { x: -10, z: 84, heading: 0 },
  luminary: { x: 0.28, y: 0.3, z: -0.91, size: 0.07, kind: 'sun' },
  boat: { x: 4, z: 8, rot: -0.4 },
};

export const SCENES: readonly PoemScene[] = [SHAN_JU, JIANG_XUE];

/** Worlds that are sketched but not yet painted. They show on the shelf, greyed. */
const UPCOMING = [
  {
    id: 'chunjiang',
    title: '春江花月夜',
    author: '张若虚',
    dynasty: '唐',
    note: '春江潮水连海平，海上明月共潮生。',
    tint: { skyHigh: '#4b5f92', skyLow: '#cbb8d8', mountainFar: '#3e5285', mountainNear: '#5a6f96' },
  },
  {
    id: 'chile',
    title: '敕勒歌',
    author: '佚名',
    dynasty: '北朝',
    note: '天苍苍，野茫茫，风吹草低见牛羊。',
    tint: { skyHigh: '#7fa0c4', skyLow: '#e3dcae', mountainFar: '#6d7f9a', mountainNear: '#8a9a5e' },
  },
  {
    id: 'denggao',
    title: '登高',
    author: '杜甫',
    dynasty: '唐',
    note: '无边落木萧萧下，不尽长江滚滚来。',
    tint: { skyHigh: '#8b8577', skyLow: '#d8c69a', mountainFar: '#6b6352', mountainNear: '#8a7a4f' },
  },
  {
    id: 'taohua',
    title: '桃花源',
    author: '陶渊明',
    dynasty: '东晋',
    note: '忽逢桃花林，夹岸数百步，中无杂树。',
    tint: { skyHigh: '#9db9c9', skyLow: '#f0dcd6', mountainFar: '#6e8fa0', mountainNear: '#6f9169' },
  },
  {
    id: 'niaoming',
    title: '鸟鸣涧',
    author: '王维',
    dynasty: '唐',
    note: '月出惊山鸟，时鸣春涧中。',
    tint: { skyHigh: '#3f5470', skyLow: '#9fb0ae', mountainFar: '#36506e', mountainNear: '#456b5c' },
  },
  {
    id: 'xijiang',
    title: '西江月',
    author: '辛弃疾',
    dynasty: '宋',
    note: '稻花香里说丰年，听取蛙声一片。',
    tint: { skyHigh: '#5b6f8c', skyLow: '#d6cfa0', mountainFar: '#4c6480', mountainNear: '#7d8f56' },
  },
] as const;

export type ShelfEntry = {
  id: string;
  title: string;
  author: string;
  dynasty: string;
  note: string;
  available: boolean;
  palette: PoemScene['palette'];
};

export const SHELF: readonly ShelfEntry[] = [
  ...SCENES.map((s) => ({
    id: s.id,
    title: s.title,
    author: s.author,
    dynasty: s.dynasty,
    note: s.note,
    available: true,
    palette: s.palette,
  })),
  ...UPCOMING.map((u) => ({
    id: u.id,
    title: u.title,
    author: u.author,
    dynasty: u.dynasty,
    note: u.note,
    available: false,
    palette: { ...SHAN_JU.palette, ...u.tint },
  })),
];

export function getScene(id: string): PoemScene | undefined {
  return SCENES.find((s) => s.id === id);
}
