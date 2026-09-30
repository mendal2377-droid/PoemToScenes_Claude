import type { PoemScene } from '../types';

/** 缘溪行 — the stream the fisherman follows, from the boat to its source. */
const STREAM = [
  [22, 120],
  [14, 92],
  [-8, 66],
  [-10, 40],
  [6, 16],
  [10, -14],
] as const;

/**
 * The wall of the mountain, as a row of hills either side of a gap.
 *
 * The gap is at x≈10. It is cut narrow by pinning a short run of level ground
 * through it (see `flats`), so the floor of the passage is a slot a dozen
 * metres wide with walls thirty metres high — 初极狭，才通人.
 */
const WALL_WEST = [-14, -30, -46, -62, -78, -94, -110].map((x, i) => ({ x, z: -38, r: 16, h: [58, 52, 60, 56, 50, 54, 58][i] }));
const WALL_EAST = [34, 50, 66, 82, 98, 114].map((x, i) => ({ x, z: -38, r: 16, h: [60, 54, 58, 52, 56, 60][i] }));

/** 美池 — the pond of the text is a brook through the valley's fields. */
const VALLEY_BROOK = [
  [-70, -58],
  [-40, -70],
  [-6, -84],
  [30, -80],
  [66, -94],
] as const;

/** 阡陌 — the footpaths between the fields, running both ways. */
const ACROSS = [-56, -68, -80, -92].map((z) => [[-44, z], [-22, z + 1], [0, z - 1], [22, z + 1], [44, z]] as [number, number][]);
const ALONG = [-28, -10, 8, 26].map((x) => [[x, -50], [x + 1, -64], [x - 1, -78], [x, -96]] as [number, number][]);

/**
 * 桃花源记 — Tao Yuanming.
 *
 * A story, not a poem, and the world is built to be walked in the order it is
 * told: a stream, a forest of peach blossom on both banks, the place where the
 * forest and the water both end at the foot of a mountain, a small opening
 * with something like light in it, a passage barely wide enough to squeeze
 * through — and then, all at once, an open valley of fields and houses.
 *
 * The valley is hidden the way it is in the text: from the outside there is
 * nothing but a wall of mountain, and you cannot see in until you are through.
 */
export const TAO_HUA_YUAN: PoemScene = {
  id: 'taohuayuan',
  kind: 'prose',
  journey: true,
  title: '桃花源记',
  author: '陶渊明',
  dynasty: '东晋',
  romanTitle: 'The Peach Blossom Spring, 421',
  note: '缘溪行，忘路之远近。忽逢桃花林，夹岸数百步。',
  available: true,
  lines: [
    { text: '晋太元中，武陵人捕鱼为业', tones: '', rhyme: false, note: '太元是东晋孝武帝的年号。故事从一个具体的年份、一个具体的行当开始——是要让后面的事显得可信。' },
    { text: '缘溪行，忘路之远近', tones: '', rhyme: false, note: '沿着溪水走，走到忘了远近。走神，是进入这个故事的第一步。' },
    { text: '忽逢桃花林，夹岸数百步', tones: '', rhyme: false, note: '忽然遇上一片桃花林，夹着溪岸绵延数百步。"忽"字之前，一路都是寻常景致。' },
    { text: '中无杂树，芳草鲜美，落英缤纷', tones: '', rhyme: false, note: '林中没有一棵杂树，草鲜嫩，花瓣纷纷落下。作者只写一个"纯"字——满眼一色，才不像人间。' },
    { text: '林尽水源，便得一山', tones: '', rhyme: false, note: '桃林走到尽头，正是溪水的源头。路和水在这里同时尽了。' },
    { text: '山有小口，仿佛若有光', tones: '', rhyme: false, note: '山脚有个小洞口，隐约透出光来。"仿佛"二字要紧——渔人自己也不敢确信。' },
    { text: '便舍船，从口入', tones: '', rhyme: false, note: '他把船留在溪边，从洞口进去。回头路，从这一刻起就靠不住了。' },
    { text: '初极狭，才通人', tones: '', rhyme: false, note: '起初极窄，仅容一人通过。进桃花源的门，是窄的。' },
    { text: '复行数十步，豁然开朗', tones: '', rhyme: false, note: '又走了几十步，眼前一下子开阔明亮。"豁然开朗"后来成了成语。' },
    { text: '土地平旷，屋舍俨然', tones: '', rhyme: false, note: '土地平坦开阔，房屋整整齐齐，还有良田、美池、桑竹。一个什么都有、又什么都刚刚好的地方。' },
    { text: '阡陌交通，鸡犬相闻', tones: '', rhyme: false, note: '田间小路纵横相通，鸡鸣狗吠彼此听得见。人间烟火，只写声音。' },
    { text: '黄发垂髫，并怡然自乐', tones: '', rhyme: false, note: '"黄发"指老人，"垂髫"指小孩，用头发代人。老的小的，都安适快乐。' },
    { text: '乃不知有汉，无论魏晋', tones: '', rhyme: false, note: '问他们如今是什么朝代，竟不知道有过汉朝，更不用说魏晋。' },
    { text: '遂迷，不复得路', tones: '', rhyme: false, note: '渔人出来后处处做了标记，再去寻找却迷了路，再也找不到入口。故事到此收住，不给答案。' },
  ],
  couplets: [],
  rhymeName: '',
  palette: {
    paper: '#f4e9d4',
    ink: '#2e2a26',
    skyHigh: '#9ec4dc',
    skyLow: '#f8e8d2',
    mountainFar: '#83a1b9',
    mountainNear: '#6f9c7c',
    groundHigh: '#94b862',
    groundLow: '#62904a',
    water: '#bcd8d2',
    waterDeep: '#78a6a6',
    foliageDark: '#3f7a4a',
    foliageLight: '#82b85e',
    grassTip: '#cbd87c',
    trunk: '#6a4a3a',
    accent: '#e8a2b4',
    ochre: '#c2a272',
    moon: '#fbf6e2',
    mist: '#f0e6da',
  },
  terrain: {
    seed: 421,
    extent: 132,
    hills: { amp: 2.4, freq: 0.019 },
    swell: { amp: 4.0, freq: 0.006 },
    rim: { start: 80, amp: 34 },
    basins: [],
    // 缘溪 — the stream the fisherman follows, up to its source under the
    // mountain; and, in the valley, another, small enough to step across.
    channels: [
      { path: STREAM, width: 8, depth: 2 },
      { path: VALLEY_BROOK, width: 6, depth: 1.5 },
    ],
    // The slot through the wall, and then the level floor of the valley.
    flats: [
      { x: 10, z: -28, r: 12, h: 1.0 },
      { x: 10, z: -38, r: 12, h: 1.2 },
      { x: 10, z: -48, r: 12, h: 1.2 },
      { x: 0, z: -76, r: 46, h: 1.2 },
    ],
    bumps: [
      ...WALL_WEST,
      ...WALL_EAST,
      // The sides of the hidden valley.
      { x: -74, z: -64, r: 22, h: 30 },
      { x: -78, z: -94, r: 22, h: 32 },
      { x: 74, z: -64, r: 22, h: 30 },
      { x: 78, z: -94, r: 22, h: 32 },
    ],
  },
  massifs: [{ angle: -Math.PI / 2, width: 0.9, boost: 30, ring: 'mid' }],
  // High and well back, so the stream, the forest and the wall are all in view.
  view: { dist: 150, pitch: 0.36, target: [0, 10, 20] },
  // Bright, warm, quite still: the point is the contrast with the dark slot.
  atmosphere: { hour: 0.3, wind: 0.22, mist: 0.34, snow: 0.85, cloud: 0.1 },
  flora: {
    pines: {
      clusters: [
        { x: -74, z: 62, r: 18, count: 12 },
        { x: 74, z: 52, r: 16, count: 10 },
      ],
    },
    bamboo: { groves: [{ x: -44, z: -72, r: 7, count: 50 }] },
    broadleaf: {
      clusters: [
        // 夹岸数百步 — the peach forest, on both banks the whole way up.
        { x: -24, z: 80, r: 10, count: 11, tint: '#f2a8bd' },
        { x: 22, z: 80, r: 10, count: 11, tint: '#f6bccb' },
        { x: -22, z: 56, r: 11, count: 13, tint: '#ee9db4' },
        { x: 24, z: 58, r: 10, count: 12, tint: '#f4b2c4' },
        { x: -22, z: 34, r: 10, count: 11, tint: '#f6bccb' },
        { x: 22, z: 34, r: 10, count: 11, tint: '#ee9db4' },
        { x: -16, z: 10, r: 9, count: 8, tint: '#f2a8bd' },
        { x: 28, z: 10, r: 9, count: 8, tint: '#f6bccb' },
        // A few in the valley too, and the mulberries.
        { x: -40, z: -64, r: 8, count: 6, tint: '#f4b2c4' },
        { x: 40, z: -62, r: 8, count: 6, tint: '#f2a8bd' },
        { x: -38, z: -92, r: 8, count: 6, tint: '#6a9a44' },
      ],
    },
    // The fields are grass the colour of ripening.
    grass: { count: 26000, radius: 96, height: 1.1, stroke: 0.65 },
    reeds: { count: 70 },
    lotus: { count: 0 },
    rocks: { count: 80 },
  },
  landmarks: [
    // 晋太元中，武陵人捕鱼为业 — the fisherman, and his boat on the stream.
    { id: 'wuling', line: 0, label: '武陵', x: 28, z: 100, radius: 12, look: [14, 92, 0.9], zoom: 1.4 },
    // 缘溪行，忘路之远近 — the stream, going on ahead, and no thought of how far.
    { id: 'yuanxi', line: 1, label: '缘溪', x: 10, z: 74, radius: 12, look: [-8, 66, 0.5], zoom: 1.2 },
    // 忽逢桃花林，夹岸数百步 — and there is the wood, on both banks.
    { id: 'taolin', line: 2, label: '桃林', x: 8, z: 52, radius: 12, look: [-22, 56, 4], zoom: 1.2 },
    // 中无杂树，芳草鲜美，落英缤纷 — nothing but peach, fresh grass, petals coming down.
    { id: 'fangcao', line: 3, label: '落英', x: -24, z: 42, radius: 12, look: [-22, 28, 7] },
    // 林尽水源，便得一山 — the wood ends where the water does, at the foot of a mountain.
    { id: 'shuiyuan', line: 4, label: '水源', x: 18, z: 4, radius: 11, look: [10, -28, 9] },
    // 山有小口，仿佛若有光 — and in it a small opening, and something like light.
    { id: 'xiaokou', line: 5, label: '小口', x: 20, z: -10, radius: 9, look: [10, -50, 3.4], zoom: 1.7 },
    // 便舍船，从口入 — the boat, left on the bank.
    { id: 'sheshuan', line: 6, label: '舍船', x: 12, z: -26, radius: 8, look: [16, -20, 0.7], zoom: 1.9 },
    // 初极狭，才通人 — the slot, barely wide enough.
    { id: 'jixia', line: 7, label: '极狭', x: 10, z: -38, radius: 8, look: [10, -60, 2], zoom: 1.2 },
    // 复行数十步，豁然开朗 — and then it opens.
    { id: 'huoran', line: 8, label: '开朗', x: 10, z: -56, radius: 9, look: [0, -86, 3] },
    // 土地平旷，屋舍俨然 — the flat land, and the houses standing in rows.
    { id: 'pingkuang', line: 9, label: '平旷', x: -10, z: -70, radius: 12, look: [-24, -58, 2.4], zoom: 1.2 },
    // 阡陌交通，鸡犬相闻 — the little paths crossing, and the sound of hens and dogs.
    { id: 'qianmo', line: 10, label: '阡陌', x: 18, z: -70, radius: 12, look: [4, -78, 1], zoom: 1.2 },
    // 黄发垂髫，并怡然自乐 — the old and the young, at their ease.
    { id: 'huangfa', line: 11, label: '怡然', x: -20, z: -86, radius: 12, look: [-17, -93, 1.2], zoom: 2 },
    // 乃不知有汉，无论魏晋 — the fisherman and the elder, talking.
    { id: 'wuhan', line: 12, label: '不知', x: 16, z: -96, radius: 12, look: [22, -100, 1.3], zoom: 1.9 },
    // 遂迷，不复得路 — and back, through the gap, to where the way in was.
    { id: 'suimi', line: 13, label: '遂迷', x: -4, z: -104, radius: 11, look: [10, -44, 3] },
  ],
  start: { x: 12, z: 108, heading: 0 },
  // 落英缤纷 — the petals never stop.
  fall: { kind: 'petal', color: '#f6c4d2', size: 1.25, accumulate: 0 },
  luminary: { x: 0.3, y: 0.6, z: -0.75, size: 0.07, kind: 'sun' },
  // 仿佛若有光: the light is always there, at any hour, at the end of the slot.
  glows: [
    { x: 10, z: -50, h: 3.4, color: '#fff0b8', size: 4.8, always: true },
    { x: 11, z: -44, h: 2.6, color: '#ffe9a8', size: 2.6, always: true },
  ],
  // Dim, not dark: no torch here, so the slot is just shadow with light ahead.
  cave: { x: 10, z: -38, r: 12, fade: 12, depth: 0.5 },
  // 舍船 — the fisherman's boat at the start, and where he leaves it.
  boat: { x: 14, z: 92, rot: 0.5, on: 'stream' },
  boats: [{ x: 16, z: -20, rot: 1.2, on: 'ground' }],
  huts: [
    { x: -24, z: -58, rot: 0.4 },
    { x: 6, z: -62, rot: -0.3 },
    { x: 30, z: -58, rot: 0.9 },
    { x: -36, z: -82, rot: 0.1 },
    { x: -6, z: -90, rot: 0.5 },
    { x: 38, z: -76, rot: 0.7 },
  ],
  extraPaths: [...ACROSS, ...ALONG],
  // 鸡犬相闻: small animals about the houses.
  herd: { count: 10, x: 0, z: -72, r: 24, color: '#7a5a3a', scale: 0.6 },
  // 黄发垂髫 — an old man, a child, two at work; and the visitor being told.
  people: [
    { x: -16, z: -92, rot: 0.5, role: 'elder' },
    { x: -20.5, z: -95, rot: 1.0, role: 'child' },
    { x: -2, z: -70, rot: 2.0, role: 'farmer' },
    { x: 24, z: -68, rot: -0.5, role: 'farmer' },
    { x: 24, z: -99, rot: 3.6, role: 'elder' },
    { x: 20, z: -101, rot: 0.9, role: 'fisher' },
  ],
  // 鸡犬相闻 — heard more than seen.
  sounds: [{ kind: 'poultry', x: 0, z: -72, r: 40 }],
};

