import type { PoemScene } from '../types';

/**
 * 春江花月夜 — Zhang Ruoxu. The poem runs to thirty-six lines; these are its
 * opening eight, where the river meets the sea and the moon comes up out of the
 * tide with it.
 *
 * Almost everything here is light on water, so the world is mostly water: one
 * enormous basin, a moon low and huge above it, and a thin margin of blossom
 * and white sand to stand on. The rhyme changes halfway, from 庚 to 霰, which
 * the inscription marks.
 */
export const CHUN_JIANG: PoemScene = {
  id: 'chunjiang',
  title: '春江花月夜',
  author: '张若虚',
  dynasty: '唐',
  romanTitle: 'Spring River, Flowers, Moonlit Night, c.700',
  note: '潮水把月亮一起带上来了。开篇八句。',
  available: true,
  lines: [
    { text: '春江潮水连海平', tones: 'pppzpzp', rhyme: true, note: '春天的江水涨起来，一直平到海里去，分不出哪里是江、哪里是海。' },
    { text: '海上明月共潮生', tones: 'zzpzzpp', rhyme: true, note: '月亮不是升起来的，是跟着潮水一起"生"出来的。' },
    { text: '滟滟随波千万里', tones: 'zzpppzz', rhyme: false, note: '月光碎在波上，一路闪到千万里外。' },
    { text: '何处春江无月明', tones: 'pzpppzp', rhyme: true, note: '反问：哪一段春江上没有月亮？——于是天下的江都被这一句连了起来。' },
    { text: '江流宛转绕芳甸', tones: 'ppzzzpz', rhyme: true, note: '江水绕着开满花的原野转了个弯。这里换了韵。' },
    { text: '月照花林皆似霰', tones: 'zzpppzz', rhyme: true, note: '月光落在花林上，白得像雪粒。' },
    { text: '空里流霜不觉飞', tones: 'pzppzzp', rhyme: false, note: '空中像有霜在流动，却察觉不到它在飞。' },
    { text: '汀上白沙看不见', tones: 'pzzppzz', rhyme: true, note: '沙洲上的白沙，和月色混成一片，反而看不见了。' },
  ],
  couplets: [
    [4, 5],
    [6, 7],
  ],
  rhymeName: '下平八庚 · 霰（换韵）',
  palette: {
    paper: '#e8e4d6',
    ink: '#20222c',
    skyHigh: '#2b3a63',
    skyLow: '#8fa0b8',
    mountainFar: '#33456f',
    mountainNear: '#3f5a73',
    groundHigh: '#8f9384',
    groundLow: '#66705f',
    water: '#9fb2c4',
    waterDeep: '#4a6180',
    foliageDark: '#3a4b48',
    foliageLight: '#6d7d70',
    grassTip: '#a7ab8e',
    trunk: '#4a4238',
    accent: '#e0b8c4',
    ochre: '#a89a7a',
    moon: '#f7f4e6',
    mist: '#dfe2e0',
  },
  terrain: {
    seed: 133,
    extent: 132,
    hills: { amp: 2.2, freq: 0.02 },
    swell: { amp: 4.4, freq: 0.006 },
    rim: { start: 84, amp: 24 },
    basins: [{ x: 0, z: 55, r: 58, depth: 5 }],
    channels: [],
    flats: [],
  },
  atmosphere: { hour: 0.92, wind: 0.35, mist: 0.5, snow: 0.5, cloud: 0.22 },
  flora: {
    pines: { clusters: [{ x: -62, z: -58, r: 16, count: 9 }] },
    bamboo: { groves: [] },
    broadleaf: {
      clusters: [
        { x: 36, z: -44, r: 17, count: 12, tint: '#e0b8c4' },
        { x: -40, z: -40, r: 15, count: 10, tint: '#dcc6cc' },
      ],
    },
    grass: { count: 15000, radius: 92 },
    reeds: { count: 380 },
    lotus: { count: 0 },
    rocks: { count: 70 },
  },
  landmarks: [
    { id: 'chaoping', line: 0, label: '连海', x: 0, z: -6, radius: 14 },
    { id: 'chaosheng', line: 1, label: '潮生', x: 52, z: 10, radius: 14 },
    { id: 'suibo', line: 2, label: '随波', x: -56, z: 6, radius: 14 },
    { id: 'yueming', line: 3, label: '月明', x: 0, z: -62, radius: 14 },
    { id: 'fangdian', line: 4, label: '芳甸', x: -40, z: -40, radius: 15 },
    { id: 'hualin', line: 5, label: '花林', x: 36, z: -44, radius: 15 },
    { id: 'liushuang', line: 6, label: '流霜', x: 66, z: -16, radius: 14 },
    { id: 'baisha', line: 7, label: '白沙', x: -24, z: -14, radius: 14 },
  ],
  start: { x: 0, z: -80, heading: Math.PI },
  fall: { kind: 'petal', color: '#f0dbe2', size: 1.1, accumulate: 0 },
  luminary: { x: 0.05, y: 0.16, z: 0.99, size: 0.2, kind: 'moon' },
  boat: { x: 10, z: 40, rot: 0.3 },
};
