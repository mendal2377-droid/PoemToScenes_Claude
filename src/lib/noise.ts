// Deterministic value noise. The same numbers must come out on every machine and
// on every reload: terrain geometry, object scattering and the walking avatar all
// read from these functions, so any drift would float the player above the ground.

function hash2(x: number, y: number, seed: number): number {
  let h = x * 374761393 + y * 668265263 + seed * 1442695040888963407;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const fade = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Value noise in [0,1]. */
export function noise2(x: number, y: number, seed = 0): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = fade(x - xi);
  const yf = fade(y - yi);
  const a = hash2(xi, yi, seed);
  const b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2(xi + 1, yi + 1, seed);
  return lerp(lerp(a, b, xf), lerp(c, d, xf), yf);
}

/** Fractal brownian motion in [0,1]. */
export function fbm(x: number, y: number, octaves = 4, seed = 0): number {
  let sum = 0;
  let amp = 0.5;
  let norm = 0;
  let fx = x;
  let fy = y;
  for (let i = 0; i < octaves; i++) {
    sum += noise2(fx, fy, seed + i * 101) * amp;
    norm += amp;
    amp *= 0.5;
    fx *= 2.03;
    fy *= 2.01;
  }
  return sum / norm;
}

/** Ridged noise — sharper crests, used for mountain silhouettes. */
export function ridge(x: number, y: number, octaves = 4, seed = 0): number {
  let sum = 0;
  let amp = 0.5;
  let norm = 0;
  let fx = x;
  let fy = y;
  for (let i = 0; i < octaves; i++) {
    const n = 1 - Math.abs(noise2(fx, fy, seed + i * 71) * 2 - 1);
    sum += n * n * amp;
    norm += amp;
    amp *= 0.5;
    fx *= 2.07;
    fy *= 2.03;
  }
  return sum / norm;
}

/** Stable pseudo-random stream for scattering. Same seed, same layout, forever. */
export class Rng {
  private s: number;
  constructor(seed: number) {
    this.s = (seed >>> 0) || 1;
  }
  next(): number {
    this.s ^= this.s << 13;
    this.s ^= this.s >>> 17;
    this.s ^= this.s << 5;
    this.s >>>= 0;
    return this.s / 4294967296;
  }
  range(a: number, b: number): number {
    return a + (b - a) * this.next();
  }
  int(a: number, b: number): number {
    return Math.floor(this.range(a, b + 1));
  }
  pick<T>(arr: readonly T[]): T {
    return arr[Math.min(arr.length - 1, Math.floor(this.next() * arr.length))];
  }
}

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Shortest distance from a point to a polyline, plus how far along it that lands. */
export function distToPath(
  x: number,
  z: number,
  path: readonly (readonly [number, number])[]
): { dist: number; t: number; px: number; pz: number } {
  let best = Infinity;
  let bestT = 0;
  let bestX = path[0][0];
  let bestZ = path[0][1];
  let acc = 0;
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const [ax, az] = path[i];
    const [bx, bz] = path[i + 1];
    total += Math.hypot(bx - ax, bz - az);
  }
  for (let i = 0; i < path.length - 1; i++) {
    const [ax, az] = path[i];
    const [bx, bz] = path[i + 1];
    const dx = bx - ax;
    const dz = bz - az;
    const len = Math.hypot(dx, dz) || 1e-6;
    const t = clamp(((x - ax) * dx + (z - az) * dz) / (len * len), 0, 1);
    const px = ax + dx * t;
    const pz = az + dz * t;
    const d = Math.hypot(x - px, z - pz);
    if (d < best) {
      best = d;
      bestT = total > 0 ? (acc + t * len) / total : 0;
      bestX = px;
      bestZ = pz;
    }
    acc += len;
  }
  return { dist: best, t: bestT, px: bestX, pz: bestZ };
}

/** Sample a polyline at normalised distance t, returning position and tangent. */
export function samplePath(
  path: readonly (readonly [number, number])[],
  t: number
): { x: number; z: number; dx: number; dz: number } {
  const segs: number[] = [];
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const l = Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]);
    segs.push(l);
    total += l;
  }
  let target = clamp(t, 0, 1) * total;
  for (let i = 0; i < segs.length; i++) {
    if (target <= segs[i] || i === segs.length - 1) {
      const u = segs[i] > 0 ? clamp(target / segs[i], 0, 1) : 0;
      const [ax, az] = path[i];
      const [bx, bz] = path[i + 1];
      const len = segs[i] || 1e-6;
      return {
        x: lerp(ax, bx, u),
        z: lerp(az, bz, u),
        dx: (bx - ax) / len,
        dz: (bz - az) / len,
      };
    }
    target -= segs[i];
  }
  const [ax, az] = path[0];
  return { x: ax, z: az, dx: 1, dz: 0 };
}
