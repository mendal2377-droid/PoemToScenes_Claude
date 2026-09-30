import { clamp, distToPath, fbm, smoothstep } from './noise';

export type Basin = { x: number; z: number; r: number; depth: number };
export type Channel = { path: readonly (readonly [number, number])[]; width: number; depth: number };
export type Flat = { x: number; z: number; r: number; h: number };
/** A hill, or a piece of a wall. Gaussian, so neighbours merge into one range. */
export type Bump = { x: number; z: number; r: number; h: number };
/**
 * A river wide enough to be a landscape rather than a stream.
 *
 * `level` is the absolute height of the water surface — a river is flat across
 * its width in a way a brook running downhill is not — and the bed is carved to
 * `depth` below it. The carve fades out towards both ends of the path so the
 * river runs into the rising ground at the edge of the world instead of into
 * the void beyond it.
 */
export type River = {
  path: readonly (readonly [number, number])[];
  width: number;
  level: number;
  depth: number;
  /**
   * Starting width as a fraction of `width`, widening to the full width over the
   * first 40% of the path. A brook that becomes a river is narrow at its source.
   */
  taper?: number;
};

/** The river's full width at a point `t` (0–1) along its path. */
export function riverWidth(rv: River, t: number): number {
  if (rv.taper === undefined) return rv.width;
  return rv.width * (rv.taper + (1 - rv.taper) * smoothstep(0, 0.4, t));
}

export type TerrainSpec = {
  seed: number;
  /** Half-extent of the walkable world in metres. */
  extent: number;
  hills: { amp: number; freq: number };
  swell: { amp: number; freq: number };
  /** Ground tilts up towards the horizon so distant hills read as "far". */
  rim: { start: number; amp: number };
  basins: readonly Basin[];
  channels: readonly Channel[];
  flats: readonly Flat[];
  bumps?: readonly Bump[];
  rivers?: readonly River[];
};

/**
 * Height of the ground at (x, z).
 *
 * This is the single source of truth for the terrain: the mesh is built from it,
 * every scattered pine and rock is dropped onto it, and the avatar's feet are
 * glued to it each frame. Keep it cheap — it runs a few thousand times per frame.
 */
export function terrainHeight(x: number, z: number, spec: TerrainSpec): number {
  const { hills, swell, rim } = spec;

  let h = (fbm(x * hills.freq, z * hills.freq, 4, spec.seed) - 0.5) * 2 * hills.amp;
  h += (fbm(x * swell.freq + 31.7, z * swell.freq - 12.3, 2, spec.seed + 900) - 0.5) * 2 * swell.amp;

  // Lift the outer ring so the valley feels enclosed by the painted mountains.
  const d = Math.hypot(x, z);
  h += smoothstep(rim.start, spec.extent, d) * rim.amp;

  // Hills and walls — added before the pads so a pavilion still gets its level
  // ground even when it is built on the side of one.
  if (spec.bumps) {
    for (const b of spec.bumps) {
      const dx = (x - b.x) / b.r;
      const dz = (z - b.z) / b.r;
      const q = dx * dx + dz * dz;
      if (q < 9) h += b.h * Math.exp(-q);
    }
  }

  // Level pads — a pavilion on a slope looks like a mistake, not a painting.
  for (const f of spec.flats) {
    const w = 1 - smoothstep(f.r * 0.55, f.r, Math.hypot(x - f.x, z - f.z));
    if (w > 0) h = h * (1 - w) + f.h * w;
  }

  // Ponds.
  for (const b of spec.basins) {
    const w = 1 - smoothstep(b.r * 0.35, b.r, Math.hypot(x - b.x, z - b.z));
    h -= w * b.depth;
  }

  // Stream beds.
  for (const c of spec.channels) {
    const { dist } = distToPath(x, z, c.path);
    const w = 1 - smoothstep(c.width * 0.4, c.width, dist);
    h -= w * c.depth;
  }

  // Rivers.
  if (spec.rivers) {
    for (const rv of spec.rivers) {
      const { dist, t } = distToPath(x, z, rv.path);
      const width = riverWidth(rv, t);
      const core = width * 0.5;
      const bank = width * 0.36;
      // Fade the carve at both ends so the river meets rising ground.
      const end = smoothstep(0.02, 0.16, t) * (1 - smoothstep(0.84, 0.98, t));
      const w = (1 - smoothstep(core, core + bank, dist)) * end;
      if (w > 0) {
        // Deepest along the middle, shelving towards the banks.
        const bed = rv.level - rv.depth * (1 - 0.45 * smoothstep(0, core, dist));
        h = h * (1 - w) + bed * w;
      }
    }
  }

  return h;
}

/** True where the ground is under open water — pond, brook or river. */
export function inWater(x: number, z: number, spec: TerrainSpec): boolean {
  for (const b of spec.basins) {
    if (Math.hypot(x - b.x, z - b.z) < b.r * 0.98) return true;
  }
  for (const c of spec.channels) {
    if (distToPath(x, z, c.path).dist < c.width * 0.42) return true;
  }
  if (spec.rivers) {
    for (const rv of spec.rivers) {
      const { dist, t } = distToPath(x, z, rv.path);
      const end = smoothstep(0.02, 0.16, t) * (1 - smoothstep(0.84, 0.98, t));
      const width = riverWidth(rv, t);
      if (end > 0.5 && dist < width * 0.5 + width * 0.36 * 0.45) return true;
    }
  }
  return false;
}

/** Surface normal by central difference — used for tilting scattered props. */
export function terrainNormal(
  x: number,
  z: number,
  spec: TerrainSpec,
  eps = 0.6
): [number, number, number] {
  const hL = terrainHeight(x - eps, z, spec);
  const hR = terrainHeight(x + eps, z, spec);
  const hD = terrainHeight(x, z - eps, spec);
  const hU = terrainHeight(x, z + eps, spec);
  const nx = hL - hR;
  const nz = hD - hU;
  const ny = 2 * eps;
  const len = Math.hypot(nx, ny, nz) || 1;
  return [nx / len, ny / len, nz / len];
}

/** How steep the ground is at a point, 0 = flat, 1 = cliff. */
export function slopeAt(x: number, z: number, spec: TerrainSpec): number {
  const n = terrainNormal(x, z, spec);
  return clamp(1 - n[1], 0, 1);
}

/** Water surface height for a basin — flat, slightly above the deepest point. */
export function basinWaterLevel(b: Basin, spec: TerrainSpec): number {
  return terrainHeight(b.x, b.z, spec) + b.depth * 0.72;
}
