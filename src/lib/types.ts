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
  grass: { count: number; radius: number };
  reeds: { count: number };
  lotus: { count: number };
  rocks: { count: number };
};

export type Atmosphere = {
  /** 0 = dawn, 0.5 = midday, 1 = night. */
  hour: number;
  wind: number;
  mist: number;
  snow: number;
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
};

export type PoemScene = {
  id: string;
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
  /** Where the fisherman's boat rides, if the poem has one. */
  boat?: { x: number; z: number; rot: number };
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
