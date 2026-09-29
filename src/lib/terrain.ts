import { clamp, distToPath, fbm, smoothstep } from './noise';

export type Basin = { x: number; z: number; r: number; depth: number };
export type Channel = { path: readonly (readonly [number, number])[]; width: number; depth: number };
export type Flat = { x: number; z: number; r: number; h: number };

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

  return h;
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
