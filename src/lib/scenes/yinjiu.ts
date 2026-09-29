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
    paper: '#efe6ce',
    ink: '#2a2822',
    skyHigh: '#8ea6b4',
    skyLow: '#edd9a8',
    mountainFar: '#5d7490',
    mountainNear: '#5a8060',
    groundHigh: '#8d9a55',
    groundLow: '#62734a',
    water: '#b6c4b8',
    waterDeep: '#8c9c94',
    foliageDark: '#33502f',
    foliageLight: '#6f9050',
    grassTip: '#c2b062',
    trunk: '#5e4a34',
    accent: '#d8b447',
    ochre: '#ad8f5c',
    moon: '#f7edcf',
    mist: '#e6dec6',
  },
  terrain: {
    seed: 417,
    extent: 132,
    hills: { amp: 3.2, freq: 0.019 },
    swell: { amp: 6.0, freq: 0.0062 },
    rim: { start: 76, amp: 30 },
    basins: [],
    channels: [],
    flats: [{ x: -34, z: 22, r: 13, h: 3 }],
  },
  atmosphere: { hour: 0.7, wind: 0.4, mist: 0.35, snow: 0.2, cloud: 0.14 },
  flora: {
    pines: {
      clusters: [
        { x: -48, z: -44, r: 18, count: 12 },
        { x: 40, z: -30, r: 16, count: 11 },
      ],
    },
    // 东篱 — the hedge the chrysanthemums grow under.
    bamboo: { groves: [{ x: -12, z: 12, r: 12, count: 90 }] },
    broadleaf: {
      clusters: [
        { x: -10, z: 16, r: 9, count: 6, tint: '#d8b447' },
        { x: 40, z: -30, r: 12, count: 7, tint: '#7a9a55' },
      ],
    },
    grass: { count: 24000, radius: 96 },
    reeds: { count: 0 },
    lotus: { count: 0 },
    rocks: { count: 90 },
  },
  landmarks: [
    { id: 'jielu', line: 0, label: '结庐', x: -34, z: 22, radius: 14 },
    { id: 'wuxuan', line: 1, label: '无喧', x: -6, z: 58, radius: 14 },
    { id: 'wenjun', line: 2, label: '问君', x: 46, z: 44, radius: 14 },
    { id: 'xinyuan', line: 3, label: '心远', x: 74, z: -6, radius: 14 },
    { id: 'caiju', line: 4, label: '东篱', x: -12, z: 12, radius: 14 },
    { id: 'nanshan', line: 5, label: '南山', x: 10, z: -56, radius: 15 },
    { id: 'shanqi', line: 6, label: '山气', x: -48, z: -44, radius: 15 },
    { id: 'feiniao', line: 7, label: '飞鸟', x: 40, z: -30, radius: 15 },
    { id: 'zhenyi', line: 8, label: '真意', x: -66, z: 6, radius: 14 },
    { id: 'wangyan', line: 9, label: '忘言', x: 22, z: 76, radius: 14 },
  ],
  start: { x: 2, z: 92, heading: 0 },
  fall: { kind: 'petal', color: '#e2c568', size: 0.8, accumulate: 0 },
  luminary: { x: -0.4, y: 0.22, z: -0.88, size: 0.09, kind: 'sun' },
  pavilion: { x: -34, z: 22, rot: 0.5 },
};
