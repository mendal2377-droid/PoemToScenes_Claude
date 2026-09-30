import type { PoemScene } from '../types';

/** 空里流霜 — points of frost hanging in the air over the bank, at a scatter of heights. */
const FROST = Array.from({ length: 18 }, (_, i) => ({
  x: 34 + ((i * 37) % 36),
  z: -94 + ((i * 53) % 34),
  h: 2 + ((i * 29) % 7),
  color: '#eaf1ff',
  size: 0.55,
}));

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
    paper: '#e6e2d6',
    ink: '#1e2230',
    skyHigh: '#26355e',
    skyLow: '#8c9ec0',
    mountainFar: '#3b4a75',
    mountainNear: '#56688a',
    groundHigh: '#a8a898',
    groundLow: '#7a8478',
    water: '#a6b9cc',
    waterDeep: '#3f5a82',
    foliageDark: '#4a4a52',
    foliageLight: '#7c7f86',
    grassTip: '#b6b8a4',
    trunk: '#4c443c',
    accent: '#e2b6c6',
    ochre: '#b2a68a',
    moon: '#f9f5e4',
    mist: '#dde2e6',
  },
  terrain: {
    seed: 133,
    extent: 132,
    hills: { amp: 1.4, freq: 0.02 },
    swell: { amp: 2.4, freq: 0.006 },
    rim: { start: 92, amp: 26 },
    basins: [],
    channels: [],
    // 汀 — a low shelf of sand where the bank comes down to the water.
    flats: [{ x: 58, z: -77, r: 15, h: -0.3 }],
    // The Yangtze at its widest: not a river you look at but one you look
    // across. A hundred and twenty metres of channel, and the banks shelve away
    // from it for another forty, so the water is some 170 metres from shore to
    // shore in a world 264 across.
    rivers: [
      {
        path: [
          [-150, 26],
          [-75, 10],
          [0, 30],
          [75, 12],
          [150, 28],
        ],
        width: 120,
        level: -1.6,
        depth: 6,
      },
    ],
  },
  // Low horizon: this poem is about how far and how level everything is.
  skyline: 0.5,
  atmosphere: { hour: 0.92, wind: 0.3, mist: 0.5, snow: 0.35, cloud: 0.14 },
  flora: {
    pines: { clusters: [] },
    bamboo: { groves: [] },
    // 芳甸 and 花林 — the blossom banks, on the near shore.
    broadleaf: {
      clusters: [
        { x: -28, z: -98, r: 12, count: 11, tint: '#e6b8c8' },
        { x: 10, z: -100, r: 13, count: 12, tint: '#f0cad2' },
        { x: -62, z: -90, r: 11, count: 8, tint: '#dcaebd' },
        { x: 48, z: -94, r: 11, count: 8, tint: '#e6bdca' },
      ],
    },
    grass: { count: 7000, radius: 100, stroke: 0.55 },
    reeds: { count: 520 },
    lotus: { count: 0 },
    rocks: { count: 50 },
  },
  landmarks: [
    // 春江潮水连海平 — across the river to a horizon where it meets the sky.
    { id: 'chaoping', line: 0, label: '连海', x: -64, z: -76, radius: 13, look: [0, 126, 0.4] },
    // 海上明月共潮生 — the moon coming up with the tide.
    { id: 'chaosheng', line: 1, label: '潮生', x: -46, z: -84, radius: 13, look: 'moon' },
    // 滟滟随波千万里 — the moon's road across the water, going away for ever.
    { id: 'suibo', line: 2, label: '随波', x: -28, z: -90, radius: 13, look: [-18, 56, 3.4], zoom: 1.25 },
    // 何处春江无月明 — the whole river, and the same moon over every stretch of it.
    { id: 'yueming', line: 3, label: '月明', x: -10, z: -92, radius: 13, look: 'moon', zoom: 1.1 },
    // 江流宛转绕芳甸 — the river bending round a meadow.
    { id: 'fangdian', line: 4, label: '芳甸', x: 8, z: -92, radius: 13, look: [90, -40, 2] },
    // 月照花林皆似霰 — the blossom, and the moon on it like sleet.
    { id: 'hualin', line: 5, label: '花林', x: 26, z: -90, radius: 13, look: [10, -100, 4], zoom: 1.3 },
    // 空里流霜不觉飞 — frost hanging in the air, that you cannot see move.
    { id: 'liushuang', line: 6, label: '流霜', x: 44, z: -84, radius: 13, look: [52, -64, 5], zoom: 1.2 },
    // 汀上白沙看不见 — the white sand of the bar, lost in the same light.
    { id: 'baisha', line: 7, label: '白沙', x: 50, z: -86, radius: 13, look: [60, -76, 0.3], zoom: 1.5 },
  ],
  start: { x: 0, z: -110, heading: Math.PI },
  fall: { kind: 'petal', color: '#f0dbe2', size: 1.1, accumulate: 0 },
  // The moon hangs just above the far shore, so its road across the water is
  // as long as the river is wide.
  luminary: { x: 0.04, y: 0.2, z: 0.98, size: 0.2, kind: 'moon' },
  boat: { x: -10, z: -12, rot: 0.3, on: 'river' },
  glows: FROST,
  // 汀上白沙 — a bar of it at the water's edge, and pale birds standing off it.
  sand: [{ x: 60, z: -75, r: 10 }, { x: 50, z: -80, r: 6 }],
  flocks: [{ x: 60, z: -68, y: 6, count: 4, radius: 9, speed: 0.28, pale: true }],
  // 汀上白沙 — pale herons on the bar, the same colour as the sand and the light.
  animals: [
    { kind: 'egret', x: 57, z: -76, rot: 0.2 },
    { kind: 'egret', x: 61, z: -79, rot: -0.3, scale: 0.9 },
    { kind: 'egret', x: 54, z: -81, rot: 0.6, scale: 0.95 },
  ],
};

