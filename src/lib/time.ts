import { clamp } from './noise';

/**
 * The clock.
 *
 * Time is kept as hours on a 24-hour dial, but read the way the poems read it:
 * as the twelve 时辰. 酉时 is the hour of 日入, sunset, and 山居秋暝 is set at the
 * end of it — "晚来秋" is not 18:20, it is late in 酉.
 *
 * The renderer thinks in a different unit: `uHour`, a single number where 0 is
 * dawn, 0.5 is full day and 1 is night. That predates the clock, and every
 * shader reads it, so the clock maps onto it rather than the other way round.
 */

/** [hour on the dial, uHour]. Linear between anchors; flat where the light is steady. */
const ANCHORS: readonly [number, number][] = [
  [0, 1],
  [4, 1],
  [6, 0.02],
  [9, 0.26],
  [12, 0.5],
  [15, 0.5],
  [17, 0.62],
  [19, 0.86],
  [21, 1],
  [24, 1],
];

export function clockToShader(clock: number): number {
  const c = ((clock % 24) + 24) % 24;
  for (let i = 0; i < ANCHORS.length - 1; i++) {
    const [a, av] = ANCHORS[i];
    const [b, bv] = ANCHORS[i + 1];
    if (c >= a && c <= b) return av + (bv - av) * ((c - a) / (b - a));
  }
  return 1;
}

/**
 * The inverse, for scenes authored in shader units. It is not one-to-one — the
 * whole afternoon is 0.5 and the whole night is 1 — so it picks the earliest
 * hour on the way from dawn to dusk that matches.
 */
export function shaderToClock(h: number): number {
  if (h >= 0.999) return 22;
  if (h <= 0.02) return 6;
  for (let i = 0; i < ANCHORS.length - 1; i++) {
    const [a, av] = ANCHORS[i];
    const [b, bv] = ANCHORS[i + 1];
    // Only the way up from dawn to dusk. The stretch before 06:00 *falls* from
    // 1 to 0.02 and so matches every value there is, which is how a poem set at
    // dusk once opened at four in the morning.
    if (a < 6 || bv <= av) continue;
    if (h >= av && h <= bv) return a + (b - a) * ((h - av) / (bv - av));
  }
  return 12;
}

const SHICHEN = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/** 子时 runs 23:00–01:00, so the twelve names are offset by an hour. */
export function shichen(clock: number): string {
  const c = ((clock % 24) + 24) % 24;
  return SHICHEN[Math.floor(((c + 1) % 24) / 2)] + '时';
}

/** Where in its 时辰 the moment falls, named the way a night watchman would. */
export function shichenPart(clock: number): string {
  const c = ((clock % 24) + 24) % 24;
  const into = (((c + 1) % 24) % 2) / 2;
  return into < 0.34 ? '初' : into < 0.67 ? '正' : '末';
}

export function clockLabel(clock: number): string {
  const c = ((clock % 24) + 24) % 24;
  const h = Math.floor(c);
  const m = Math.floor((c - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** 晨 · 午 · 暮 · 夜 — the named part of the day, for the panel. */
export function dayPart(clock: number): string {
  const c = ((clock % 24) + 24) % 24;
  if (c >= 4.5 && c < 7) return '拂晓';
  if (c >= 7 && c < 11) return '上午';
  if (c >= 11 && c < 13.5) return '正午';
  if (c >= 13.5 && c < 16.5) return '下午';
  if (c >= 16.5 && c < 19.5) return '黄昏';
  if (c >= 19.5 && c < 22) return '入夜';
  return '深夜';
}

/**
 * Where the sun and moon are, as unit vectors.
 *
 * Both follow a simple arc — up in the east at 06:00 and 18:00 respectively,
 * highest twelve hours apart in phase, gone below the horizon between. But each
 * scene *composes* its light: 山居秋暝 puts a moon just over the left shoulder
 * of the ridge because that is where the picture wants it. So the authored
 * position is honoured at the scene's own opening time, and the sky is shifted
 * by whatever it takes to make that true. Move the clock and everything travels
 * along the arc from there.
 */
export type Sky = { sun: [number, number, number]; moon: [number, number, number] };

function arc(kind: 'sun' | 'moon', clock: number, zBias: number): [number, number, number] {
  const start = kind === 'sun' ? 6 : 18;
  const a = ((((clock - start) % 24) + 24) % 24) / 12 * Math.PI;
  // Past π the body is below the horizon; the sine simply goes negative.
  return [Math.cos(a), Math.sin(a) * 0.92, zBias];
}

export function skyAt(
  clock: number,
  authored: { x: number; y: number; z: number; kind: 'sun' | 'moon' },
  authoredClock: number
): Sky {
  const zBias = authored.z;
  const base = arc(authored.kind, authoredClock, zBias);
  const off: [number, number, number] = [authored.x - base[0], authored.y - base[1], 0];

  const place = (kind: 'sun' | 'moon'): [number, number, number] => {
    const v = arc(kind, clock, zBias);
    const x = v[0] + off[0];
    const y = v[1] + off[1];
    const z = v[2];
    const len = Math.hypot(x, y, z) || 1;
    return [x / len, y / len, z / len];
  };

  return { sun: place('sun'), moon: place('moon') };
}

/** How high a body stands above the horizon, 0–1, for fading it in and out. */
export function elevation(v: readonly [number, number, number]): number {
  return clamp(v[1], -1, 1);
}
