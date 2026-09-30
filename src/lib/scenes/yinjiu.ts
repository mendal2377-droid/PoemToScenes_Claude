import type { PoemScene } from '../types';

/**
 * 饮酒·其五 — Tao Yuanming.
 *
 * This slot held 桃花源 on the shelf, which is prose: 桃花源记 is a 记, and the
 * app is built to walk a poem line by line. 饮酒·其五 is the same poet doing the
 * same thing in verse, and it happens to be better suited — a hut, a hedge, a
 * mountain seen without looking for it, and birds going home.
 *
 * An 古诗 rather than a regulated one, so there is no 对仗 to bracket and the
 * tonal pattern is free. The rhyme is steady throughout: 喧·偏·山·还·言.
 */
export const YIN_JIU: PoemScene = {
  id: 'yinjiu',
  title: '饮酒·其五',
  author: '陶渊明',
  dynasty: '东晋',
  romanTitle: 'Drinking Wine, No. 5, c.417',
  note: '结庐在人境，而心远地自偏。',
  available: true,
  lines: [
    { text: '结庐在人境', tones: 'zpzpz', rhyme: false, note: '把屋子盖在有人的地方——不是隐到深山里去。这一句先把后面的话变难了。' },
    { text: '而无车马喧', tones: 'pppzp', rhyme: true, note: '却听不到车马的声音。住在人间而没有人间的吵闹，怎么可能？' },
    { text: '问君何能尔', tones: 'zpppz', rhyme: false, note: '有人替读者问了：你怎么做到的？' },
    { text: '心远地自偏', tones: 'pzzzp', rhyme: true, note: '心远了，地方自然就偏了。答案不在地理上。' },
    { text: '采菊东篱下', tones: 'zzppz', rhyme: false, note: '在东边的篱笆下采菊花。日常到不能再日常的一个动作。' },
    { text: '悠然见南山', tones: 'ppzpp', rhyme: true, note: '一抬头，南山就在那里。是"见"不是"望"——没有去找，它自己来的。' },
    { text: '山气日夕佳', tones: 'pzzzp', rhyme: false, note: '傍晚山间的气象最好。' },
    { text: '飞鸟相与还', tones: 'pzpzp', rhyme: true, note: '鸟成群地飞回去。它们也在回家，和他一样。' },
    { text: '此中有真意', tones: 'zpzpz', rhyme: false, note: '这里面有一点真正的意思。' },
    { text: '欲辨已忘言', tones: 'zzzpp', rhyme: true, note: '想说清楚，却已经忘了要怎么说。全诗到这里停住，不再解释。' },
  ],
  couplets: [],
  rhymeName: '上平十三元',
  palette: {
    // Light and airy: this is the one poem here where nothing is wrong.
    paper: '#f3ecd6',
    ink: '#33322c',
    skyHigh: '#a4c2d8',
    skyLow: '#f7e4b4',
    mountainFar: '#8aa3bb',
    mountainNear: '#86a888',
    groundHigh: '#b0b86a',
    groundLow: '#86985c',
    water: '#c0d2c6',
    waterDeep: '#96aca0',
    foliageDark: '#4a7444',
    foliageLight: '#88ac5e',
    grassTip: '#cdbf6a',
    trunk: '#6a5640',
    accent: '#e2bd3c',
    ochre: '#b89a64',
    moon: '#f7edcf',
    mist: '#f0e8cc',
  },
  terrain: {
    seed: 417,
    extent: 132,
    // Gentle. The land is not trying to do anything.
    hills: { amp: 1.7, freq: 0.017 },
    swell: { amp: 3.2, freq: 0.0055 },
    rim: { start: 92, amp: 20 },
    basins: [],
    channels: [],
    flats: [{ x: -34, z: 22, r: 13, h: 2.2 }],
  },
  // 南山 — seen, not sought. It fills the horizon straight ahead and takes no
  // notice of anyone.
  skyline: 0.7,
  massifs: [
    { angle: -Math.PI / 2, width: 0.6, boost: 92, ring: 'mid' },
    { angle: -Math.PI / 2 + 0.2, width: 0.9, boost: 70, ring: 'far' },
    { angle: -Math.PI / 2 - 0.5, width: 0.4, boost: 34, ring: 'near' },
  ],
  atmosphere: { hour: 0.68, wind: 0.2, mist: 0.2, snow: 0.22, cloud: 0.08 },
  flora: {
    pines: {
      clusters: [
        { x: -52, z: -40, r: 16, count: 8 },
        { x: 46, z: -32, r: 14, count: 7 },
      ],
    },
    // 东篱 — the hedge the chrysanthemums grow under.
    bamboo: { groves: [{ x: -12, z: 12, r: 10, count: 70 }] },
    broadleaf: {
      clusters: [
        // The chrysanthemums themselves: low gold, thick along the hedge.
        { x: -10, z: 18, r: 10, count: 9, tint: '#e2bd3c' },
        { x: 40, z: -30, r: 12, count: 6, tint: '#88ac5e' },
      ],
    },
    grass: { count: 20000, radius: 96, stroke: 0.5 },
    reeds: { count: 0 },
    lotus: { count: 0 },
    rocks: { count: 60 },
  },
  landmarks: [
    // 结庐在人境 — the hut, which is built where people are.
    { id: 'jielu', line: 0, label: '结庐', x: -22, z: 32, radius: 13, look: [-34, 22, 1.6], zoom: 1.2 },
    // 而无车马喧 — the road, empty, and not a sound on it.
    { id: 'wuxuan', line: 1, label: '无喧', x: -6, z: 60, radius: 13, look: [6, 108, 0.3] },
    // 问君何能尔 — a visitor at the gate, asking.
    { id: 'wenjun', line: 2, label: '问君', x: 12, z: 46, radius: 13, look: [-16, 44, 1.4], zoom: 1.4 },
    // 心远地自偏 — the far country, and how far away it is.
    { id: 'xinyuan', line: 3, label: '心远', x: 74, z: -6, radius: 13, look: [150, -24, 32] },
    // 采菊东篱下 — the hedge, and the chrysanthemums under it.
    { id: 'caiju', line: 4, label: '东篱', x: 4, z: 10, radius: 13, look: [-12, 14, 1.2], zoom: 1.3 },
    // 悠然见南山 — and then, looking up, the mountain.
    { id: 'nanshan', line: 5, label: '南山', x: 2, z: -30, radius: 15, look: [10, -150, 38] },
    // 山气日夕佳 — the sun going down behind the ridge, and the haze on it.
    { id: 'shanqi', line: 6, label: '山气', x: -28, z: -20, radius: 14, look: 'sun' },
    // 飞鸟相与还 — the birds, going back together.
    { id: 'feiniao', line: 7, label: '飞鸟', x: 12, z: -8, radius: 14, look: [38, -38, 14], zoom: 1.3 },
    // 此中有真意 — all of it, taken in at once.
    { id: 'zhenyi', line: 8, label: '真意', x: -66, z: 6, radius: 13, look: [-20, -40, 8] },
    // 欲辨已忘言 — and the hut again, small, a long way off, with nothing to say.
    { id: 'wangyan', line: 9, label: '忘言', x: 22, z: 78, radius: 13, look: [-24, 22, 3] },
  ],
  start: { x: 2, z: 94, heading: 0 },
  fall: { kind: 'petal', color: '#e6c860', size: 0.8, accumulate: 0 },
  // Low and gold, from the left: 山气日夕佳.
  luminary: { x: -0.55, y: 0.2, z: -0.81, size: 0.09, kind: 'sun' },
  huts: [{ x: -34, z: 22, rot: 0.5, scale: 1.1 }],
  // 无车马喧 — the road that has no carriages on it, and comes right up to the door.
  extraPaths: [
    [
      [8, 130],
      [4, 96],
      [-8, 64],
      [-22, 42],
      [-31, 27],
    ],
  ],
  people: [
    // 采菊 — the man himself, at his hedge.
    { x: -8.5, z: 9, rot: 0.6, role: 'poet' },
    // 问君 — the friend who has walked out to ask.
    { x: -16, z: 44, rot: 2.6, role: 'scholar' },
  ],
  // 飞鸟相与还 — seven of them, together, turning for home.
  flocks: [{ x: 36, z: -36, y: 14, count: 8, radius: 8, speed: 0.32 }],
  sounds: [{ kind: 'birdsong', x: 46, z: -44, r: 32 }],
};

