import type { TerrainSpec } from './terrain';

export type Palette = {
  /** Paper the whole picture sits on. Also the page background. */
  paper: string;
  /** Outline ink. Everything is drawn with this. */
  ink: string;
  skyHigh: string;
  skyLow: string;
  /** 石青 — azurite, the far ranges. */
  mountainFar: string;
  /** 石绿 — malachite, the near ranges. */
  mountainNear: string;
  groundHigh: string;
  groundLow: string;
  water: string;
  waterDeep: string;
  foliageDark: string;
  foliageLight: string;
  /** Tip colour of the ground cover — golden in autumn, dry in winter. */
  grassTip: string;
  trunk: string;
  accent: string;
  /** 赭石 — ochre, for paths and thatch. */
  ochre: string;
  moon: string;
  mist: string;
};

export type FloraSpec = {
  pines: { clusters: readonly { x: number; z: number; r: number; count: number }[] };
  bamboo: { groves: readonly { x: number; z: number; r: number; count: number }[] };
  broadleaf: { clusters: readonly { x: number; z: number; r: number; count: number; tint: string }[] };
  grass: { count: number; radius: number; /** Blade height multiplier. */ height?: number; /** How strongly the ground itself is brushed with grass strokes, 0–1. */ stroke?: number };
  reeds: { count: number };
  lotus: { count: number };
  rocks: { count: number };
};

/**
 * What drifts down through the scene. Snow settles and whitens the ground;
 * 桂花 and 落木 do not, so accumulation is separate from the particles.
 */
export type Fall = {
  kind: 'snow' | 'petal' | 'leaf';
  color: string;
  /** Point size multiplier. */
  size: number;
  /** 0 = nothing settles on the ground, 1 = full snow cover. */
  accumulate: number;
};

export type Atmosphere = {
  /** 0 = dawn, 0.5 = midday, 1 = night. */
  hour: number;
  wind: number;
  mist: number;
  /** Ambient fall — leaves, petals or snow, per the scene's `fall`. */
  snow: number;
  /** How overcast the poem is by default, 0–1. Defaults to a light 0.2. */
  cloud?: number;
  /** Authored rain, 0–1 — 西江月 has "两三点雨山前", which is a few drops, not weather. */
  rain?: number;
};

/**
 * One line of the poem, with the things a reader of classical verse actually
 * wants: what it means, where it falls in the tonal pattern, and whether it
 * carries the rhyme.
 */
export type Verse = {
  text: string;
  /**
   * 平仄 for each character, one letter per character: 'p' for 平, 'z' for 仄.
   * Taken from 平水韵, so 入声 characters count as 仄 even where modern Mandarin
   * has flattened them — 月, 石, 竹, 歇, 绝, 灭, 雪 all do.
   */
  tones: string;
  /** Whether the line ends on the rhyme. */
  rhyme: boolean;
  /** A sentence of 注释 — what the line is saying. */
  note: string;
};

export type Landmark = {
  id: string;
  /** Index into the poem's lines. */
  line: number;
  /** What the traveller is standing in front of. */
  label: string;
  x: number;
  z: number;
  radius: number;
  /**
   * What the poet is looking at from here. Choosing a line in the free view puts
   * the camera at eye height on this spot, facing this point: [x, z, height above
   * the ground there]. Or 'moon' / 'sun', for a line whose subject is in the sky.
   */
  look?: [number, number, number?] | 'moon' | 'sun';
  /** Narrow the field of view to look at something small or far, 1 = normal. */
  zoom?: number;
};

/** Who is in the picture. Each role is a costume and a posture, not a person. */
export type Role =
  | 'washer' // 浣女 — pale blue, a basket on the hip
  | 'scholar' // 王孙, a visitor — pale robe, a black cap
  | 'poet' // a man in a dark robe and cap, alone
  | 'elder' // 黄发 — white hair, a staff
  | 'child' // 垂髫 — small, red, two tufts of hair
  | 'farmer' // a straw hat and a brown tunic
  | 'herdsman' // dark coat, tall hat, a staff
  | 'companion' // one of the four, with a torch
  | 'fisher' // 蓑笠 — straw cape and rain hat
  | 'monkey'; // 猿 — small, brown, on a rock

/** Creatures placed by hand — the ones a line names, or one that would be there. */
export type AnimalKind =
  | 'hen' // 鸡 — a red comb and a fan of tail
  | 'dog' // 犬 — a curled tail, ears, always near a door
  | 'frog' // 蛙 — on the stones at the water's edge
  | 'egret' // 鹭 — white, on one leg, at the shallows
  | 'ox'; // 牛 — the plough animal, standing

export type Animal = {
  kind: AnimalKind;
  x: number;
  z: number;
  rot: number;
  scale?: number;
};

export type Person = {
  x: number;
  z: number;
  rot: number;
  role: Role;
  scale?: number;
  /** Sitting rather than standing. */
  sit?: boolean;
  /** Lit torch, held out to the side. */
  torch?: boolean;
};

/** Birds on the wing, circling a point. */
export type Flock = {
  x: number;
  z: number;
  /** Height above the ground. */
  y: number;
  count: number;
  radius: number;
  /** Radians per second; the sign is the direction of circling. */
  speed: number;
  size?: number;
  /** White — cranes and egrets — rather than ink. */
  pale?: boolean;
};

/** Where a sound comes from. The sound itself is synthesised; see ambience.ts. */
export type SoundSource = {
  kind: 'frogs' | 'cicada' | 'birdsong' | 'gibbon' | 'poultry';
  x: number;
  z: number;
  r: number;
};

/** A set piece too small to be its own feature. */
export type Prop = { kind: 'winejar'; x: number; z: number; rot: number };

/** A patch of bare, pale ground: a sandbar, a shingle bank. */
export type Patch = { x: number; z: number; r: number };

/** A lamp, a torch, a light at the end of a passage. */
export type Glow = {
  x: number;
  z: number;
  /** Height above the ground. */
  h?: number;
  color: string;
  size: number;
  /** Shown by day as well as by night. Defaults to night only. */
  always?: boolean;
};

/**
 * A part of the world where the light goes out.
 *
 * Inside it everything dims towards black and only what is close to the
 * traveller — the torch — stays lit. It is a property of where you stand, so it
 * is measured against the camera, and fades in over `fade` metres.
 */
export type Cave = { x: number; z: number; r: number; fade: number; depth: number };

export type Massif = {
  /** Where on the horizon, as an angle: atan2(z, x). Looking towards -z is -π/2. */
  angle: number;
  width: number;
  boost: number;
  ring: 'near' | 'mid' | 'far';
};

export type PoemScene = {
  id: string;
  /** 'prose' scenes are walked in order and carry no tonal apparatus. */
  kind?: 'poem' | 'prose';
  title: string;
  author: string;
  dynasty: string;
  lines: readonly Verse[];
  /** Indices of lines that form a 对仗 pair. */
  couplets: readonly (readonly [number, number])[];
  /** The rhyme category, e.g. 下平十一尤. */
  rhymeName: string;
  /** One sentence for the landing page and the loading card. */
  note: string;
  /** Latin title on the loading card, the way a gallery would label it. */
  romanTitle: string;
  available: boolean;
  palette: Palette;
  terrain: TerrainSpec;
  atmosphere: Atmosphere;
  flora: FloraSpec;
  landmarks: readonly Landmark[];
  /** Where the traveller wakes up, and which way they face. */
  start: { x: number; z: number; heading: number };
  /** Moon or sun position in the sky, as a direction. */
  luminary: { x: number; y: number; z: number; size: number; kind: 'moon' | 'sun' };
  /** What falls through the air when the 落 slider is raised. */
  fall: Fall;
  /** Grazing animals, for poems that need them. */
  herd?: { count: number; x: number; z: number; r: number; color: string; scale: number };
  /** Where the fisherman's boat rides, if the poem has one. */
  boat?: { x: number; z: number; rot: number; on?: 'basin' | 'river' | 'stream' | 'ground' };
  /** Further boats, for stories that have more than one. */
  boats?: readonly { x: number; z: number; rot: number; on?: 'basin' | 'river' | 'stream' | 'ground' }[];
  people?: readonly Person[];
  animals?: readonly Animal[];
  flocks?: readonly Flock[];
  sounds?: readonly SoundSource[];
  props?: readonly Prop[];
  /** 汀上白沙 — sandbars and the like, painted into the ground. */
  sand?: readonly Patch[];
  /** A footbridge over a brook. */
  bridges?: readonly { x: number; z: number; rot: number; length?: number }[];
  /** Huts and houses, for the worlds that have people in them. */
  huts?: readonly { x: number; z: number; rot: number; scale?: number }[];
  glows?: readonly Glow[];
  /** Standing stones; `fallen` ones lie across the road. */
  steles?: readonly { x: number; z: number; rot: number; fallen?: boolean }[];
  cave?: Cave;
  /** The traveller carries a torch. */
  torch?: boolean;
  /** Extra footpaths beyond the main trail — 阡陌, a field grid. */
  extraPaths?: readonly (readonly (readonly [number, number])[])[];
  /** Shape the skyline: a mountain that dominates, or a wall that closes in. */
  massifs?: readonly Massif[];
  /**
   * Where the free view opens. Each world composes differently: a slot in a
   * mountain wants the camera high and back, a river wants it low on the bank.
   */
  view?: { dist?: number; pitch?: number; target?: [number, number, number] };
  /** Scales every mountain range's height. 0.4 is a low horizon; 1.4 closes in. */
  skyline?: number;
  /**
   * The trail runs from the start through the landmarks in the order of the
   * text, rather than looping. For a story, the order is the point.
   */
  journey?: boolean;
  /** Where the thatched pavilion stands, if the poem has one. */
  pavilion?: { x: number; z: number; rot: number };
};

export const EMPTY_FLORA: FloraSpec = {
  pines: { clusters: [] },
  bamboo: { groves: [] },
  broadleaf: { clusters: [] },
  grass: { count: 0, radius: 0 },
  reeds: { count: 0 },
  lotus: { count: 0 },
  rocks: { count: 0 },
};
