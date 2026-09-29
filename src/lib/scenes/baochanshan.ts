import type { PoemScene } from '../types';

/**
 * 游褒禅山记 — Wang Anshi, 1054.
 *
 * A travel essay that turns into an argument. It has two caves, and the whole
 * point is the difference between them: the front cave is level and bright and
 * full of the names of people who have been, and the back cave is cold and dark
 * and goes on further than anyone has found the end of. Wang Anshi and four
 * companions go in with torches, get partway, and turn back when someone says
 * the fire is running out — and it is from having turned back that he writes
 * the last third of the essay.
 *
 * So the world is one mountain, a bright hall halfway up its front, and a dark
 * trench cut into its flank. Inside the dark, everything is black except what
 * your torch reaches, and what it reaches gets stranger the deeper you go.
 */

// The back cave: a chain of hollows cut into the mountain's east flank, going
// down and in. Each is a negative hill; where they overlap they make a passage.
const TRENCH = [
  { x: 24, z: -54, r: 9, h: -16 },
  { x: 33, z: -64, r: 9, h: -18 },
  { x: 29, z: -74, r: 9, h: -18 },
  { x: 19, z: -80, r: 9, h: -16 },
  { x: 10, z: -85, r: 10, h: -14 },
];

export const BAO_CHAN_SHAN: PoemScene = {
  id: 'baochanshan',
  kind: 'prose',
  journey: true,
  title: '游褒禅山记',
  author: '王安石',
  dynasty: '北宋',
  romanTitle: 'A Trip to Mount Baochan, 1054',
  note: '世之奇伟瑰怪非常之观，常在于险远。',
  available: true,
  lines: [
    { text: '褒禅山亦谓之华山', tones: '', rhyme: false, note: '褒禅山又叫华山，在今安徽含山。唐代和尚慧褒在此筑舍、死后葬于此，山因此得名。' },
    { text: '距洞百余步，有碑仆道', tones: '', rhyme: false, note: '离洞口一百多步，有一块石碑倒在路上。' },
    { text: '其文漫灭，独其为文犹可识，曰花山', tones: '', rhyme: false, note: '碑上的字已磨灭，只有"花山"二字还认得出。文章由此岔出一段小考证：古时"华"与"花"同音。' },
    { text: '洞之内平旷，有泉侧出', tones: '', rhyme: false, note: '这是前洞：里面平坦开阔，有泉水从旁流出，洞壁上题字的游人很多。' },
    { text: '有穴窈然，入之甚寒', tones: '', rhyme: false, note: '这是后洞：幽深的洞穴，进去很冷，问它有多深，连爱游山的人也没走到过尽头。' },
    { text: '余与四人拥火以入', tones: '', rhyme: false, note: '作者和四个同伴举着火把进去。"拥火"是把火抱在怀里——一个字就写出了洞里有多黑。' },
    { text: '入之愈深，其进愈难', tones: '', rhyme: false, note: '越往里走，路越难走。' },
    { text: '而其见愈奇', tones: '', rhyme: false, note: '可是看到的景象，一处比一处奇。"难"与"奇"成正比，这一句是后面全部议论的根。' },
    { text: '有怠而欲出者，曰：不出，火且尽', tones: '', rhyme: false, note: '有个同伴累了，想退出去，说：再不出去，火把就要烧完了。' },
    { text: '遂与之俱出', tones: '', rhyme: false, note: '于是大家跟着一起出来。后来作者估算，他们走到的地方，还不到爱游的人所到之处的十分之一。' },
    { text: '世之奇伟瑰怪非常之观', tones: '', rhyme: false, note: '世上奇伟、瑰丽、怪异、不寻常的景观——' },
    { text: '常在于险远，而人之所罕至焉', tones: '', rhyme: false, note: '——常常在险要遥远的地方，人很少到达。' },
    { text: '故非有志者不能至也', tones: '', rhyme: false, note: '所以，没有志向的人是到不了的。' },
    { text: '尽吾志也而不能至者', tones: '', rhyme: false, note: '尽了自己的志向和力量，却仍然到不了的人——' },
    { text: '可以无悔矣', tones: '', rhyme: false, note: '——可以没有遗憾了。文章最后落在"无悔"二字上，替没能走到底的人留了体面。' },
  ],
  couplets: [],
  rhymeName: '',
  palette: {
    paper: '#eee8d8',
    ink: '#2c2b28',
    skyHigh: '#9cbcd2',
    skyLow: '#f0e6cc',
    mountainFar: '#8a95a2',
    mountainNear: '#7f9a86',
    groundHigh: '#8ba460',
    groundLow: '#5f7b48',
    water: '#b6cfc8',
    waterDeep: '#7ea29c',
    foliageDark: '#3f6a44',
    foliageLight: '#7fae52',
    grassTip: '#b8bc70',
    trunk: '#5f5346',
    accent: '#d2733c',
    // The mountain is limestone, so the paths and the bare ground go pale.
    ochre: '#c8bc9a',
    moon: '#f8f2dc',
    mist: '#e6e4d6',
  },
  terrain: {
    seed: 1054,
    extent: 132,
    hills: { amp: 2.6, freq: 0.02 },
    swell: { amp: 4.2, freq: 0.006 },
    rim: { start: 88, amp: 24 },
    // The spring in the front cave.
    basins: [{ x: -27, z: -30, r: 5, depth: 1.1 }],
    channels: [],
    // The floor of the front hall, cut level into the slope.
    flats: [{ x: -26, z: -26, r: 11, h: 22 }],
    bumps: [
      // The mountain, with its summit at about (-8, -74).
      { x: -8, z: -74, r: 44, h: 58 },
      { x: -50, z: -50, r: 28, h: 34 },
      { x: 50, z: -46, r: 30, h: 38 },
      { x: -24, z: -102, r: 30, h: 46 },
      { x: 28, z: -98, r: 28, h: 40 },
      // Shoulders of rock round the front hall, open to the south.
      { x: -38, z: -30, r: 7, h: 16 },
      { x: -30, z: -40, r: 8, h: 20 },
      { x: -16, z: -36, r: 7, h: 14 },
      ...TRENCH,
    ],
  },
  skyline: 0.9,
  view: { dist: 150, pitch: 0.3, target: [0, 24, -20] },
  atmosphere: { hour: 0.28, wind: 0.3, mist: 0.4, snow: 0.12, cloud: 0.22 },
  flora: {
    pines: {
      clusters: [
        { x: -46, z: 30, r: 18, count: 13 },
        { x: 46, z: 24, r: 16, count: 12 },
        { x: -64, z: -6, r: 14, count: 9 },
        { x: 62, z: -2, r: 14, count: 8 },
      ],
    },
    bamboo: { groves: [] },
    broadleaf: {
      clusters: [
        { x: -30, z: 70, r: 12, count: 9, tint: '#7fae52' },
        { x: 30, z: 72, r: 12, count: 9, tint: '#88b45a' },
        { x: 0, z: 22, r: 12, count: 8, tint: '#6a9a48' },
      ],
    },
    grass: { count: 22000, radius: 92, stroke: 0.6 },
    reeds: { count: 30 },
    lotus: { count: 0 },
    // Limestone country: there is a lot of loose stone about.
    rocks: { count: 250 },
  },
  landmarks: [
    { id: 'baochan', line: 0, label: '华山', x: 10, z: 90, radius: 13 },
    { id: 'beipu', line: 1, label: '仆碑', x: 2, z: 62, radius: 10 },
    { id: 'huashan', line: 2, label: '花山', x: -12, z: 48, radius: 9 },
    { id: 'qiandong', line: 3, label: '前洞', x: -24, z: -20, radius: 10 },
    { id: 'houdong', line: 4, label: '后洞', x: 26, z: -44, radius: 7 },
    { id: 'yonghuo', line: 5, label: '拥火', x: 25, z: -56, radius: 6 },
    { id: 'yujin', line: 6, label: '愈难', x: 33, z: -65, radius: 6 },
    { id: 'yuqi', line: 7, label: '愈奇', x: 28, z: -75, radius: 6 },
    { id: 'huojin', line: 8, label: '火尽', x: 14, z: -83, radius: 6 },
    { id: 'jinchu', line: 9, label: '俱出', x: 46, z: -52, radius: 8 },
    { id: 'qiwei', line: 10, label: '奇伟', x: -8, z: -74, radius: 10 },
    { id: 'xianyuan', line: 11, label: '险远', x: -32, z: -94, radius: 10 },
    { id: 'youzhi', line: 12, label: '有志', x: 34, z: -100, radius: 10 },
    { id: 'jinzhi', line: 13, label: '尽志', x: -58, z: -62, radius: 10 },
    { id: 'wuhui', line: 14, label: '无悔', x: 2, z: -106, radius: 9 },
  ],
  start: { x: 8, z: 108, heading: 0 },
  fall: { kind: 'leaf', color: '#9bb060', size: 1.0, accumulate: 0 },
  luminary: { x: 0.45, y: 0.45, z: -0.77, size: 0.07, kind: 'sun' },
  steles: [
    // 有碑仆道 — down across the road; and the one beside it still standing.
    { x: 0, z: 60, rot: 0.4, fallen: true },
    { x: -14, z: 50, rot: 0.3 },
    // 记游者甚众 — the names of everyone who has been, in the front hall.
    { x: -33, z: -21, rot: 0.6 },
    { x: -21, z: -33, rot: -0.4 },
    { x: -24, z: -19, rot: 0.1 },
  ],
  // The dark. It starts at the mouth of the back cave and is total inside.
  cave: { x: 22, z: -70, r: 19, fade: 9, depth: 0.96 },
  torch: true,
  // 其见愈奇: the deeper, the stranger and the brighter.
  glows: [
    { x: 27, z: -58, h: 0.9, color: '#ffd08a', size: 1.1 },
    { x: 33, z: -67, h: 1.4, color: '#a8e0ff', size: 1.6 },
    { x: 28, z: -76, h: 1.2, color: '#ffd8a0', size: 1.9 },
    { x: 20, z: -80, h: 1.6, color: '#b8f0ff', size: 2.3 },
    { x: 14, z: -84, h: 1.2, color: '#ffe0b0', size: 2.7 },
    { x: 11, z: -88, h: 2.0, color: '#c8f4ff', size: 3.2 },
  ],
};
