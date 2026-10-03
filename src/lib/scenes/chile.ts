import type { PoemScene } from '../types';

/**
 * 敕勒歌 — anonymous, from the Northern Dynasties. A steppe song, not a
 * regulated poem: the lines are of unequal length and the rhyme changes.
 *
 * Six of its seven lines describe emptiness — plain, mountain, sky like a tent,
 * grass without end — and then the last one parts the grass and shows you
 * cattle. So this world has almost nothing in it: no groves, no water, a very
 * low horizon and an enormous quantity of grass, with one herd to find.
 */
export const CHI_LE: PoemScene = {
  id: 'chile',
  title: '敕勒歌',
  author: '佚名',
  dynasty: '北朝',
  romanTitle: 'Song of the Chile, 5th c.',
  note: '六句写空，最后一句把草分开，露出牛羊。',
  available: true,
  lines: [
    { text: '敕勒川', tones: 'zzp', rhyme: false, note: '敕勒人住的那片平川。开口就是一个地名，不加修饰。' },
    { text: '阴山下', tones: 'ppz', rhyme: true, note: '在阴山脚下。两句话就把一整片草原安放好了。' },
    { text: '天似穹庐', tones: 'pzpp', rhyme: false, note: '天像牧人自己住的毡帐——用最熟悉的东西去比最大的东西。' },
    { text: '笼盖四野', tones: 'pzzz', rhyme: true, note: '四面八方都被这顶帐子罩住。' },
    { text: '天苍苍', tones: 'ppp', rhyme: true, note: '天是苍的。这里换了平声韵，句子也短下来，像在放声唱。' },
    { text: '野茫茫', tones: 'zpp', rhyme: true, note: '野是茫的。叠字一出，空旷就有了声音。' },
    { text: '风吹草低见牛羊', tones: 'ppzpzpp', rhyme: true, note: '风把草吹低了，牛羊才露出来。前面六句的空，全是为这一下准备的。' },
  ],
  couplets: [
    [0, 1],
    [4, 5],
  ],
  rhymeName: '上声马 · 下平七阳（换韵）',
  paint: 'mogu',
  palette: {
    paper: '#efe8d2',
    ink: '#2a2a2e',
    skyHigh: '#6f9ecb',
    skyLow: '#d8e0dc',
    mountainFar: '#5d6f8c',
    mountainNear: '#7c8a6a',
    groundHigh: '#93a05a',
    groundLow: '#6e7a44',
    water: '#a8bcc0',
    waterDeep: '#7b9298',
    foliageDark: '#4a5a3a',
    foliageLight: '#8a9a58',
    grassTip: '#c4c072',
    trunk: '#6a5a44',
    accent: '#c88a4a',
    ochre: '#b09a68',
    moon: '#f8f4e0',
    mist: '#e4e8de',
  },
  terrain: {
    // Almost flat. A steppe that rolls like a valley stops being a steppe.
    seed: 205,
    extent: 132,
    hills: { amp: 1.6, freq: 0.014 },
    swell: { amp: 3.4, freq: 0.0045 },
    rim: { start: 96, amp: 18 },
    basins: [],
    channels: [],
    flats: [],
    // 阴山下 — a river along the foot of the range, in long slow bends. The steppe
    // has no other water, so this is the only thing in it that shines.
    rivers: [
      {
        path: [
          [-150, -76],
          [-70, -92],
          [-10, -84],
          [50, -96],
          [110, -82],
          [150, -98],
        ],
        width: 18,
        level: -1.4,
        depth: 3.4,
      },
    ],
  },
  // 阴山 — a long, low range across the whole far side, and nothing tall
  // anywhere else: the sky is meant to be most of the picture.
  skyline: 0.55,
  massifs: [
    { angle: -Math.PI / 2, width: 1.15, boost: 38, ring: 'mid' },
    { angle: -Math.PI / 2, width: 1.6, boost: 30, ring: 'far' },
  ],
  atmosphere: { hour: 0.45, wind: 1.2, mist: 0.2, snow: 0, cloud: 0.12 },
  flora: {
    pines: { clusters: [{ x: -78, z: -54, r: 12, count: 5 }] },
    bamboo: { groves: [] },
    broadleaf: { clusters: [] },
    // The grass is the subject, so there is a great deal more of it than
    // anywhere else on the shelf.
    grass: { count: 42000, radius: 112, height: 2.1, stroke: 1 },
    reeds: { count: 0 },
    lotus: { count: 0 },
    rocks: { count: 60 },
  },
  landmarks: [
    // 敕勒川 — the plain, and how far it goes.
    { id: 'chuan', line: 0, label: '川', x: 0, z: 40, radius: 16, look: [0, -40, 1] },
    // 阴山下 — the range, with the river in front of it.
    { id: 'yinshan', line: 1, label: '阴山', x: 0, z: -56, radius: 16, look: [0, -170, 34] },
    // 天似穹庐 — up: the sky as a tent over the whole world.
    { id: 'qionglu', line: 2, label: '穹庐', x: 56, z: -20, radius: 16, look: [56, -260, 210], zoom: 0.85 },
    // 笼盖四野 — out: the edge of the sky, on every side.
    { id: 'siye', line: 3, label: '四野', x: -58, z: -18, radius: 16, look: [-200, 20, 4], zoom: 0.9 },
    // 天苍苍 — up again, at blue.
    { id: 'cangcang', line: 4, label: '苍苍', x: 46, z: 34, radius: 16, look: [46, -200, 200], zoom: 0.85 },
    // 野茫茫 — the grass, going away.
    { id: 'mangmang', line: 5, label: '茫茫', x: -48, z: 36, radius: 16, look: [-150, 60, 1] },
    // 风吹草低见牛羊 — and there they are.
    { id: 'niuyang', line: 6, label: '牛羊', x: 12, z: -6, radius: 18, look: [24, -30, 1.4], zoom: 1.25 },
  ],
  start: { x: 0, z: 78, heading: 0 },
  fall: { kind: 'snow', color: '#ffffff', size: 1, accumulate: 1 },
  luminary: { x: 0.2, y: 0.62, z: -0.75, size: 0.07, kind: 'sun' },
  herd: { count: 22, x: 6, z: -30, r: 34, color: '#6b5a47', scale: 2.4 },
  // The man who keeps them, standing in the grass at the edge of the herd.
  people: [{ x: 15, z: -20, rot: -1.0, role: 'herdsman' }],
  // The herdsman's dog, at his heel.
  animals: [{ kind: 'dog', x: 13, z: -17, rot: 0.6 }],
};

