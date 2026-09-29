import * as THREE from 'three';
import { Rng } from '@/lib/noise';
import { terrainHeight } from '@/lib/terrain';
import type { TerrainSpec } from '@/lib/terrain';

const c = (hex: string) => new THREE.Color(hex);

/**
 * Accumulates the scene's plant life into a handful of merged buffers.
 *
 * Nothing here is instanced. Every pine plate and grass blade is baked into
 * world space up front, carrying the anchor it should sway around and how far
 * up the plant it sits. It costs a little memory and buys one draw call per
 * plant type, plus the freedom to give each stroke its own shape.
 */
class Builder {
  pos: number[] = [];
  uv: number[] = [];
  base: number[] = [];
  up: number[] = [];
  seed: number[] = [];
  tint: number[] = [];
  idx: number[] = [];
  private v = 0;

  quad(
    center: THREE.Vector3,
    right: THREE.Vector3,
    up: THREE.Vector3,
    anchor: THREE.Vector3,
    upFrac: number,
    seed: number,
    tint: THREE.Color
  ) {
    const corners = [
      center.clone().sub(right).sub(up),
      center.clone().add(right).sub(up),
      center.clone().add(right).add(up),
      center.clone().sub(right).add(up),
    ];
    const uvs = [0, 0, 1, 0, 1, 1, 0, 1];
    for (let i = 0; i < 4; i++) {
      this.pos.push(corners[i].x, corners[i].y, corners[i].z);
      this.uv.push(uvs[i * 2], uvs[i * 2 + 1]);
      this.base.push(anchor.x, anchor.y, anchor.z);
      this.up.push(upFrac);
      this.seed.push(seed);
      this.tint.push(tint.r, tint.g, tint.b);
    }
    this.idx.push(this.v, this.v + 1, this.v + 2, this.v, this.v + 2, this.v + 3);
    this.v += 4;
  }

  /** A tapered tube along a curved axis — trunks, culms, stems. */
  tube(
    axis: (t: number) => THREE.Vector3,
    radius: (t: number) => number,
    rings: number,
    sides: number,
    anchor: THREE.Vector3,
    seed: number,
    tint: THREE.Color
  ) {
    const start = this.v;
    for (let j = 0; j <= rings; j++) {
      const t = j / rings;
      const p = axis(t);
      const r = radius(t);
      for (let k = 0; k < sides; k++) {
        const a = (k / sides) * Math.PI * 2;
        this.pos.push(p.x + Math.cos(a) * r, p.y, p.z + Math.sin(a) * r);
        this.uv.push(k / sides, t);
        this.base.push(anchor.x, anchor.y, anchor.z);
        this.up.push(t);
        this.seed.push(seed);
        this.tint.push(tint.r, tint.g, tint.b);
        this.v++;
      }
    }
    for (let j = 0; j < rings; j++) {
      for (let k = 0; k < sides; k++) {
        const a = start + j * sides + k;
        const b = start + j * sides + ((k + 1) % sides);
        const cc = a + sides;
        const d = b + sides;
        this.idx.push(a, cc, b, b, cc, d);
      }
    }
  }

  build(): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setAttribute('aBase', new THREE.Float32BufferAttribute(this.base, 3));
    g.setAttribute('aUp', new THREE.Float32BufferAttribute(this.up, 1));
    g.setAttribute('aSeed', new THREE.Float32BufferAttribute(this.seed, 1));
    g.setAttribute('aTint', new THREE.Float32BufferAttribute(this.tint, 3));
    g.setIndex(this.idx);
    g.computeVertexNormals();
    return g;
  }

  get isEmpty() {
    return this.v === 0;
  }
}

export type PlantGeometry = { trunk: THREE.BufferGeometry | null; leaf: THREE.BufferGeometry | null };

const EMPTY: PlantGeometry = { trunk: null, leaf: null };

/**
 * How thickly the brush is loaded and how long each stroke runs. The scenery
 * uses the defaults; the composition palette lets a visitor push them around.
 */
export type BrushOpts = { density?: number; length?: number };
const D = (o: BrushOpts) => o.density ?? 1;
const L = (o: BrushOpts) => o.length ?? 1;

/* -------------------------------------------------------------------- pine */

/**
 * A pine in the 马远 manner: a leaning trunk and flat plates of needles stacked
 * in tiers, widest about three quarters of the way up. Each plate stands facing
 * outward from the trunk, so whichever side you walk around, some face you.
 */
function addPine(
  tr: Builder,
  lf: Builder,
  x: number,
  z: number,
  y: number,
  height: number,
  rng: Rng,
  dark: THREE.Color,
  light: THREE.Color,
  opts: BrushOpts = {}
) {
  const seed = rng.next();
  const anchor = new THREE.Vector3(x, y, z);
  const leanDir = rng.range(0, Math.PI * 2);
  const lean = rng.range(0.2, 1.5);
  const trunkR = height * rng.range(0.022, 0.034);

  const axis = (t: number) =>
    new THREE.Vector3(
      x + Math.cos(leanDir) * lean * t * t,
      y + height * t,
      z + Math.sin(leanDir) * lean * t * t
    );

  tr.tube(axis, (t) => trunkR * (1 - 0.72 * t) + 0.02, 7, 6, anchor, seed, dark);

  // A couple of bare limbs reaching out of the trunk.
  const limbs = rng.int(2, 4);
  for (let i = 0; i < limbs; i++) {
    const t0 = rng.range(0.42, 0.82);
    const a = rng.range(0, Math.PI * 2);
    const reach = height * rng.range(0.14, 0.3);
    const root = axis(t0);
    tr.tube(
      (u) =>
        new THREE.Vector3(
          root.x + Math.cos(a) * reach * u,
          root.y + reach * u * rng.range(0.05, 0.2) + Math.sin(u * 2.4) * 0.12,
          root.z + Math.sin(a) * reach * u
        ),
      (u) => trunkR * 0.45 * (1 - 0.8 * u) + 0.012,
      4,
      5,
      anchor,
      seed,
      dark
    );
  }

  const maxR = height * rng.range(0.3, 0.42);
  const plates = Math.max(6, Math.round(rng.range(26, 40) * D(opts)));
  for (let i = 0; i < plates; i++) {
    const t = rng.range(0.42, 1.0);
    const u = (t - 0.42) / 0.58;
    // Umbrella profile: narrow at the neck, broad at the shoulder, tapering in.
    const rad = maxR * (0.3 + 0.7 * Math.sin(Math.PI * Math.pow(u, 0.72)));
    const a = rng.range(0, Math.PI * 2);
    const spine = axis(t);
    const center = new THREE.Vector3(
      spine.x + Math.cos(a) * rad,
      spine.y + rng.range(-0.3, 0.3),
      spine.z + Math.sin(a) * rad
    );

    const normal = new THREE.Vector3(Math.cos(a), rng.range(0.15, 0.55), Math.sin(a)).normalize();
    const right = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a));
    const up = new THREE.Vector3().crossVectors(normal, right).normalize();

    const w = maxR * rng.range(0.42, 0.72) * L(opts);
    const h = maxR * rng.range(0.3, 0.5) * L(opts);
    const tint = dark.clone().lerp(light, rng.range(0.1, 0.9));
    lf.quad(center, right.multiplyScalar(w), up.multiplyScalar(h), anchor, t, rng.next(), tint);
  }
}

export function buildPines(
  clusters: readonly { x: number; z: number; r: number; count: number }[],
  spec: TerrainSpec,
  colors: { dark: string; light: string },
  seed: number
): PlantGeometry {
  if (!clusters.length) return EMPTY;
  const rng = new Rng(seed);
  const tr = new Builder();
  const lf = new Builder();
  const dark = c(colors.dark);
  const light = c(colors.light);

  for (const cl of clusters) {
    for (let i = 0; i < cl.count; i++) {
      const a = rng.range(0, Math.PI * 2);
      const r = Math.sqrt(rng.next()) * cl.r;
      const x = cl.x + Math.cos(a) * r;
      const z = cl.z + Math.sin(a) * r;
      const y = terrainHeight(x, z, spec);
      addPine(tr, lf, x, z, y, rng.range(8, 15), rng, dark, light);
    }
  }
  return { trunk: tr.build(), leaf: lf.build() };
}

/** A single pine, for the composition palette. */
export function buildOnePine(
  x: number,
  z: number,
  y: number,
  scale: number,
  seed: number,
  colors: { dark: string; light: string },
  opts: BrushOpts = {}
): PlantGeometry {
  const rng = new Rng(Math.floor(seed * 1e6) + 3);
  const tr = new Builder();
  const lf = new Builder();
  addPine(tr, lf, x, z, y, 11 * scale, rng, c(colors.dark), c(colors.light), opts);
  return { trunk: tr.build(), leaf: lf.build() };
}

/* ------------------------------------------------------------------ bamboo */

function addBamboo(
  tr: Builder,
  lf: Builder,
  x: number,
  z: number,
  y: number,
  height: number,
  rng: Rng,
  dark: THREE.Color,
  light: THREE.Color,
  opts: BrushOpts = {}
) {
  const seed = rng.next();
  const anchor = new THREE.Vector3(x, y, z);
  const bendDir = rng.range(0, Math.PI * 2);
  const bend = rng.range(0.3, 1.6);
  const r = rng.range(0.07, 0.13);

  const axis = (t: number) =>
    new THREE.Vector3(
      x + Math.cos(bendDir) * bend * t * t * t,
      y + height * t,
      z + Math.sin(bendDir) * bend * t * t * t
    );

  tr.tube(axis, (t) => r * (1 - 0.35 * t), 9, 5, anchor, seed, light);

  // Leaves ride the upper third, hanging outward in the 个-shaped clusters
  // every student of ink painting learns first.
  const clusters = Math.max(2, Math.round(rng.int(13, 21) * D(opts)));
  for (let i = 0; i < clusters; i++) {
    const t = rng.range(0.5, 1.0);
    const node = axis(t);
    const blades = rng.int(4, 7);
    const baseAngle = rng.range(0, Math.PI * 2);
    for (let k = 0; k < blades; k++) {
      const a = baseAngle + (k - blades / 2) * rng.range(0.3, 0.6);
      const droop = rng.range(-0.55, -0.12);
      const len = rng.range(0.55, 1.15) * L(opts);
      const dir = new THREE.Vector3(Math.cos(a), droop, Math.sin(a)).normalize();
      const center = node.clone().addScaledVector(dir, len * 0.5);
      const right = dir.clone().multiplyScalar(len * 0.5);
      const side = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a)).normalize();
      const up = new THREE.Vector3().crossVectors(dir, side).normalize().multiplyScalar(len * 0.17);
      const tint = dark.clone().lerp(light, rng.range(0.25, 1));
      lf.quad(center, right, up, anchor, t, rng.next(), tint);
    }
  }
}

export function buildBamboo(
  groves: readonly { x: number; z: number; r: number; count: number }[],
  spec: TerrainSpec,
  colors: { dark: string; light: string },
  seed: number
): PlantGeometry {
  if (!groves.length) return EMPTY;
  const rng = new Rng(seed);
  const tr = new Builder();
  const lf = new Builder();
  const dark = c(colors.dark);
  const light = c(colors.light);

  for (const g of groves) {
    for (let i = 0; i < g.count; i++) {
      const a = rng.range(0, Math.PI * 2);
      const r = Math.sqrt(rng.next()) * g.r;
      const x = g.x + Math.cos(a) * r;
      const z = g.z + Math.sin(a) * r;
      addBamboo(tr, lf, x, z, terrainHeight(x, z, spec), rng.range(6, 12), rng, dark, light);
    }
  }
  return { trunk: tr.build(), leaf: lf.build() };
}

export function buildOneBamboo(
  x: number,
  z: number,
  y: number,
  scale: number,
  seed: number,
  colors: { dark: string; light: string },
  opts: BrushOpts = {}
): PlantGeometry {
  const rng = new Rng(Math.floor(seed * 1e6) + 11);
  const tr = new Builder();
  const lf = new Builder();
  for (let i = 0; i < 5; i++) {
    const a = rng.range(0, Math.PI * 2);
    const r = rng.range(0, 1.1);
    addBamboo(
      tr,
      lf,
      x + Math.cos(a) * r,
      z + Math.sin(a) * r,
      y,
      rng.range(6, 10) * scale,
      rng,
      c(colors.dark),
      c(colors.light),
      opts
    );
  }
  return { trunk: tr.build(), leaf: lf.build() };
}

/* --------------------------------------------------------------- broadleaf */

function addBroadleaf(
  tr: Builder,
  lf: Builder,
  x: number,
  z: number,
  y: number,
  height: number,
  rng: Rng,
  trunkCol: THREE.Color,
  tint: THREE.Color,
  opts: BrushOpts = {}
) {
  const seed = rng.next();
  const anchor = new THREE.Vector3(x, y, z);
  const leanDir = rng.range(0, Math.PI * 2);
  const lean = rng.range(0.3, 1.2);
  const axis = (t: number) =>
    new THREE.Vector3(
      x + Math.cos(leanDir) * lean * t * t,
      y + height * t * 0.62,
      z + Math.sin(leanDir) * lean * t * t
    );
  tr.tube(axis, (t) => height * 0.03 * (1 - 0.6 * t) + 0.02, 6, 6, anchor, seed, trunkCol);

  const crownY = y + height * 0.62;
  const crownR = height * rng.range(0.3, 0.42);
  const dabs = Math.max(8, Math.round(rng.range(78, 116) * D(opts)));
  for (let i = 0; i < dabs; i++) {
    const a = rng.range(0, Math.PI * 2);
    const el = rng.range(-0.35, 1.0);
    const rr = crownR * Math.sqrt(rng.next());
    const center = new THREE.Vector3(
      axis(1).x + Math.cos(a) * rr,
      crownY + el * crownR * 0.72,
      axis(1).z + Math.sin(a) * rr
    );
    const normal = new THREE.Vector3(Math.cos(a), rng.range(0.1, 0.6), Math.sin(a)).normalize();
    const right = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a));
    const up = new THREE.Vector3().crossVectors(normal, right).normalize();
    const s = crownR * rng.range(0.15, 0.29) * L(opts);
    const col = tint.clone().offsetHSL(rng.range(-0.03, 0.03), rng.range(-0.1, 0.1), rng.range(-0.1, 0.12));
    lf.quad(center, right.multiplyScalar(s), up.multiplyScalar(s * 0.8), anchor, 0.6 + el * 0.3, rng.next(), col);
  }
}

export function buildBroadleaf(
  clusters: readonly { x: number; z: number; r: number; count: number; tint: string }[],
  spec: TerrainSpec,
  trunkColor: string,
  seed: number
): PlantGeometry {
  if (!clusters.length) return EMPTY;
  const rng = new Rng(seed);
  const tr = new Builder();
  const lf = new Builder();
  const trunkCol = c(trunkColor);

  for (const cl of clusters) {
    const tint = c(cl.tint);
    for (let i = 0; i < cl.count; i++) {
      const a = rng.range(0, Math.PI * 2);
      const r = Math.sqrt(rng.next()) * cl.r;
      const x = cl.x + Math.cos(a) * r;
      const z = cl.z + Math.sin(a) * r;
      addBroadleaf(tr, lf, x, z, terrainHeight(x, z, spec), rng.range(7, 12), rng, trunkCol, tint);
    }
  }
  return { trunk: tr.build(), leaf: lf.build() };
}

export function buildOneMaple(
  x: number,
  z: number,
  y: number,
  scale: number,
  seed: number,
  trunkColor: string,
  tint: string,
  opts: BrushOpts = {}
): PlantGeometry {
  const rng = new Rng(Math.floor(seed * 1e6) + 23);
  const tr = new Builder();
  const lf = new Builder();
  addBroadleaf(tr, lf, x, z, y, 9 * scale, rng, c(trunkColor), c(tint), opts);
  return { trunk: tr.build(), leaf: lf.build() };
}

/* ------------------------------------------------------------------- grass */

/**
 * 点苔 — moss dots, in three dimensions. Chinese landscape painting never draws
 * a lawn; it drops clumps and lets the eye join them up. So do we: tufts in
 * clusters rather than a uniform carpet, which also happens to be far cheaper.
 */
export function buildGrass(
  count: number,
  radius: number,
  spec: TerrainSpec,
  seed: number,
  avoid: readonly { x: number; z: number; r: number }[] = [],
  paper?: (x: number, z: number) => number
): THREE.BufferGeometry | null {
  if (count <= 0) return null;
  const rng = new Rng(seed);
  const pos: number[] = [];
  const base: number[] = [];
  const up: number[] = [];
  const seeds: number[] = [];
  const idx: number[] = [];
  let v = 0;

  const clumps = Math.ceil(count / 11);
  for (let cI = 0; cI < clumps; cI++) {
    const ca = rng.range(0, Math.PI * 2);
    const cr = Math.sqrt(rng.next()) * radius;
    const cx = Math.cos(ca) * cr;
    const cz = Math.sin(ca) * cr;

    let skip = false;
    for (const av of avoid) {
      if (Math.hypot(cx - av.x, cz - av.z) < av.r) skip = true;
    }
    // Nothing grows in the 留白 — that emptiness is deliberate, and a tuft
    // standing in the middle of it undoes the whole effect.
    if (paper && paper(cx, cz) > 0.56) skip = true;
    if (skip) continue;

    const spread = rng.range(0.7, 2.2);
    const blades = rng.int(7, 15);
    for (let i = 0; i < blades; i++) {
      const x = cx + rng.range(-spread, spread);
      const z = cz + rng.range(-spread, spread);
      const y = terrainHeight(x, z, spec);
      const h = rng.range(0.2, 0.58);
      const w = rng.range(0.04, 0.078);
      const a = rng.range(0, Math.PI * 2);
      const leanX = Math.cos(a) * rng.range(0.1, 0.5);
      const leanZ = Math.sin(a) * rng.range(0.1, 0.5);
      const dx = Math.cos(a + Math.PI / 2) * w;
      const dz = Math.sin(a + Math.PI / 2) * w;
      const s = rng.next();

      const segs = 3;
      const start = v;
      for (let j = 0; j <= segs; j++) {
        const t = j / segs;
        const taper = 1 - t * 0.92;
        const px = x + leanX * t * t;
        const py = y + h * t;
        const pz = z + leanZ * t * t;
        pos.push(px - dx * taper, py, pz - dz * taper);
        pos.push(px + dx * taper, py, pz + dz * taper);
        for (let k = 0; k < 2; k++) {
          base.push(x, y, z);
          up.push(t);
          seeds.push(s);
        }
        v += 2;
      }
      for (let j = 0; j < segs; j++) {
        const a0 = start + j * 2;
        idx.push(a0, a0 + 2, a0 + 1, a0 + 1, a0 + 2, a0 + 3);
      }
    }
  }

  if (v === 0) return null;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aBase', new THREE.Float32BufferAttribute(base, 3));
  g.setAttribute('aUp', new THREE.Float32BufferAttribute(up, 1));
  g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* ------------------------------------------------------------------- reeds */

export function buildReeds(
  count: number,
  spec: TerrainSpec,
  spots: readonly { x: number; z: number; r: number }[],
  colors: { dark: string; light: string },
  seed: number
): THREE.BufferGeometry | null {
  if (count <= 0 || !spots.length) return null;
  const rng = new Rng(seed);
  const lf = new Builder();
  const dark = c(colors.dark);
  const light = c(colors.light);

  for (let i = 0; i < count; i++) {
    const spot = spots[rng.int(0, spots.length - 1)];
    const a = rng.range(0, Math.PI * 2);
    // Reeds crowd the waterline, not the middle of the pond.
    const r = spot.r * rng.range(0.86, 1.14);
    const x = spot.x + Math.cos(a) * r;
    const z = spot.z + Math.sin(a) * r;
    const y = terrainHeight(x, z, spec);
    const anchor = new THREE.Vector3(x, y, z);
    const stalks = rng.int(3, 7);
    for (let k = 0; k < stalks; k++) {
      const h = rng.range(0.8, 1.7);
      const ang = rng.range(0, Math.PI * 2);
      const tilt = rng.range(0.1, 0.45);
      const dir = new THREE.Vector3(Math.cos(ang) * tilt, 1, Math.sin(ang) * tilt).normalize();
      const off = new THREE.Vector3(rng.range(-0.4, 0.4), 0, rng.range(-0.4, 0.4));
      const bottom = anchor.clone().add(off);
      const center = bottom.clone().addScaledVector(dir, h * 0.5);
      const side = new THREE.Vector3(-Math.sin(ang), 0, Math.cos(ang)).multiplyScalar(0.045);
      lf.quad(
        center,
        side,
        dir.clone().multiplyScalar(h * 0.5),
        anchor,
        0.9,
        rng.next(),
        dark.clone().lerp(light, rng.next())
      );
    }
  }
  return lf.isEmpty ? null : lf.build();
}

/* ------------------------------------------------------------------ lotus */

export function buildLotus(
  count: number,
  basin: { x: number; z: number; r: number },
  level: number,
  colors: { pad: string; flower: string },
  seed: number
): { pads: THREE.BufferGeometry | null; flowers: THREE.BufferGeometry | null } {
  if (count <= 0) return { pads: null, flowers: null };
  const rng = new Rng(seed);
  const pads = new Builder();
  const flowers = new Builder();
  const padCol = c(colors.pad);
  const flowerCol = c(colors.flower);

  for (let i = 0; i < count; i++) {
    const a = rng.range(0, Math.PI * 2);
    const r = Math.sqrt(rng.next()) * basin.r * 0.82;
    const x = basin.x + Math.cos(a) * r;
    const z = basin.z + Math.sin(a) * r;
    const anchor = new THREE.Vector3(x, level, z);
    const s = rng.range(0.5, 1.15);

    // The pad lies on the water, tilted a few degrees so it catches the light.
    const tilt = rng.range(0, 0.3);
    const ta = rng.range(0, Math.PI * 2);
    const normal = new THREE.Vector3(Math.cos(ta) * tilt, 1, Math.sin(ta) * tilt).normalize();
    const right = new THREE.Vector3(1, 0, 0).cross(normal).normalize().multiplyScalar(s);
    const up = new THREE.Vector3().crossVectors(normal, right).normalize().multiplyScalar(s);
    pads.quad(
      new THREE.Vector3(x, level + 0.06 + rng.range(0, 0.1), z),
      right,
      up,
      anchor,
      0.12,
      rng.next(),
      padCol.clone().offsetHSL(0, 0, rng.range(-0.08, 0.08))
    );

    // Every few pads, a bloom on a stem.
    if (rng.next() < 0.22) {
      const fh = rng.range(0.5, 1.1);
      const fy = level + fh;
      const petals = 5;
      for (let k = 0; k < petals; k++) {
        const pa = (k / petals) * Math.PI * 2 + rng.range(-0.2, 0.2);
        const dir = new THREE.Vector3(Math.cos(pa), 0.9, Math.sin(pa)).normalize();
        const center = new THREE.Vector3(x, fy, z).addScaledVector(dir, 0.22);
        const side = new THREE.Vector3(-Math.sin(pa), 0, Math.cos(pa)).multiplyScalar(0.11);
        flowers.quad(
          center,
          side,
          dir.clone().multiplyScalar(0.26),
          anchor,
          0.95,
          rng.next(),
          flowerCol.clone().offsetHSL(0, 0, rng.range(-0.05, 0.1))
        );
      }
    }
  }

  return { pads: pads.isEmpty ? null : pads.build(), flowers: flowers.isEmpty ? null : flowers.build() };
}

/* ------------------------------------------------------------------- rocks */

/**
 * Stones, deformed icosahedra with hard facets. 皴 in the shader does the rest.
 * Polyhedron geometry is already non-indexed, which makes merging trivial.
 */
export function buildRocks(
  placements: readonly { x: number; y: number; z: number; s: number; seed: number }[]
): THREE.BufferGeometry | null {
  if (!placements.length) return null;
  const out: number[] = [];
  const src = new THREE.IcosahedronGeometry(1, 1);
  const srcPos = src.attributes.position.array as Float32Array;

  for (const p of placements) {
    const rng = new Rng(Math.floor(p.seed * 1e6) + 7);
    const sx = p.s * rng.range(0.7, 1.4);
    const sy = p.s * rng.range(0.45, 0.9);
    const sz = p.s * rng.range(0.7, 1.4);
    const rot = rng.range(0, Math.PI * 2);
    const cosR = Math.cos(rot);
    const sinR = Math.sin(rot);
    // Per-vertex jitter keyed to the rounded direction, so shared corners of
    // neighbouring faces move together and the rock stays closed.
    const jitter = (x: number, y: number, z: number) => {
      const k = Math.round(x * 12) * 73 + Math.round(y * 12) * 131 + Math.round(z * 12) * 197;
      const r = new Rng(Math.abs(k) + Math.floor(p.seed * 1e5) + 1);
      return 0.72 + r.next() * 0.55;
    };

    for (let i = 0; i < srcPos.length; i += 3) {
      const ox = srcPos[i];
      const oy = srcPos[i + 1];
      const oz = srcPos[i + 2];
      const j = jitter(ox, oy, oz);
      let vx = ox * sx * j;
      const vy = oy * sy * j;
      let vz = oz * sz * j;
      const rx = vx * cosR - vz * sinR;
      const rz = vx * sinR + vz * cosR;
      vx = rx;
      vz = rz;
      out.push(p.x + vx, p.y + vy * 0.9 + sy * 0.32, p.z + vz);
    }
  }
  src.dispose();

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
  g.computeVertexNormals();
  return g;
}

/** Scatter rocks: heavier along the stream bed, lighter across the slopes. */
export function scatterRocks(
  count: number,
  spec: TerrainSpec,
  seed: number
): { x: number; y: number; z: number; s: number; seed: number }[] {
  const rng = new Rng(seed);
  const out: { x: number; y: number; z: number; s: number; seed: number }[] = [];
  const channel = spec.channels[0];

  for (let i = 0; i < count; i++) {
    let x: number;
    let z: number;
    if (channel && rng.next() < 0.6) {
      const t = rng.next();
      const i0 = Math.min(channel.path.length - 2, Math.floor(t * (channel.path.length - 1)));
      const u = t * (channel.path.length - 1) - i0;
      const a = channel.path[i0];
      const b = channel.path[i0 + 1];
      x = a[0] + (b[0] - a[0]) * u + rng.range(-4.5, 4.5);
      z = a[1] + (b[1] - a[1]) * u + rng.range(-4.5, 4.5);
    } else {
      const a = rng.range(0, Math.PI * 2);
      const r = Math.sqrt(rng.next()) * spec.extent * 0.8;
      x = Math.cos(a) * r;
      z = Math.sin(a) * r;
    }
    out.push({ x, y: terrainHeight(x, z, spec), z, s: rng.range(0.2, 0.85), seed: rng.next() });
  }
  return out;
}

/* ------------------------------------------------------------------ clouds */

/** A 留白 cloud for the composition palette — soft dabs floating in the air. */
export function buildCloud(
  x: number,
  y: number,
  z: number,
  scale: number,
  seed: number,
  tint: string
): THREE.BufferGeometry {
  const rng = new Rng(Math.floor(seed * 1e6) + 31);
  const b = new Builder();
  const col = c(tint);
  const anchor = new THREE.Vector3(x, y, z);
  const puffs = rng.int(10, 16);
  for (let i = 0; i < puffs; i++) {
    const a = rng.range(0, Math.PI * 2);
    const r = rng.range(0, 3.4) * scale;
    const center = new THREE.Vector3(
      x + Math.cos(a) * r * 1.8,
      y + rng.range(-0.6, 0.9) * scale,
      z + Math.sin(a) * r
    );
    const normal = new THREE.Vector3(Math.cos(a), rng.range(0.05, 0.3), Math.sin(a)).normalize();
    const right = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a));
    const up = new THREE.Vector3().crossVectors(normal, right).normalize();
    const s = rng.range(1.3, 2.6) * scale;
    b.quad(center, right.multiplyScalar(s), up.multiplyScalar(s * 0.7), anchor, 0.5, rng.next(), col);
  }
  return b.build();
}
