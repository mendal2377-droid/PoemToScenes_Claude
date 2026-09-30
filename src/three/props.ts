import * as THREE from 'three';
import { Rng } from '@/lib/noise';

/**
 * A 四角亭 roof. The corners lift and the eaves sag between them — that curve is
 * the whole silhouette of the thing, so it is built from eight boundary points
 * (four raised corners, four dropped edge midpoints) fanned up to the ridge.
 */
export function buildPavilionRoof(halfWidth: number, eaveDrop: number, peak: number): THREE.BufferGeometry {
  const pos: number[] = [];
  const idx: number[] = [];

  const apex = new THREE.Vector3(0, peak, 0);
  const ring: THREE.Vector3[] = [];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const isCorner = k % 2 === 1;
    const r = isCorner ? halfWidth * 1.41 : halfWidth;
    const y = isCorner ? eaveDrop + halfWidth * 0.3 : eaveDrop;
    ring.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
  }

  // Two tiers of triangles so the roof surface can bow rather than stay flat.
  const mid = ring.map((p) => p.clone().lerp(apex, 0.45).setY(p.y + (peak - p.y) * 0.62));

  const push = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => {
    const base = pos.length / 3;
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    idx.push(base, base + 1, base + 2);
  };

  for (let k = 0; k < 8; k++) {
    const n = (k + 1) % 8;
    push(ring[k], ring[n], mid[n]);
    push(ring[k], mid[n], mid[k]);
    push(mid[k], mid[n], apex);
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/**
 * A sampan hull: pointed at both ends, open on top, with the sheer rising fore
 * and aft. Sections are stitched into a shell rather than solid, because the
 * fisherman has to sit inside it.
 */
export function buildBoatHull(length: number, width: number, depth: number): THREE.BufferGeometry {
  const sections = 18;
  const across = 7;
  const pos: number[] = [];
  const idx: number[] = [];

  for (let i = 0; i <= sections; i++) {
    const t = i / sections;
    const z = (t - 0.5) * length;
    // Beam is widest amidships and tapers to a point at both ends.
    const halfW = (width / 2) * Math.pow(Math.sin(Math.PI * t), 0.55);
    // Sheer: the gunwale sweeps up towards bow and stern.
    const sheer = Math.pow(Math.abs(t - 0.5) * 2, 2.2) * depth * 0.85;

    for (let k = 0; k < across; k++) {
      const u = k / (across - 1);
      const ang = (u - 0.5) * Math.PI;
      const x = Math.sin(ang) * halfW;
      // A rounded bilge rather than a hard V.
      const y = -Math.cos(ang) * depth * 0.72 + depth * 0.72 + sheer;
      pos.push(x, y, z);
    }
  }

  for (let i = 0; i < sections; i++) {
    for (let k = 0; k < across - 1; k++) {
      const a = i * across + k;
      const b = a + 1;
      const c = a + across;
      const d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** The arched reed canopy amidships. */
export function buildBoatCanopy(length: number, width: number, height: number): THREE.BufferGeometry {
  const ribs = 12;
  const arc = 9;
  const pos: number[] = [];
  const idx: number[] = [];

  for (let i = 0; i <= ribs; i++) {
    const t = i / ribs;
    const z = (t - 0.5) * length;
    const shrink = 1 - Math.pow(Math.abs(t - 0.5) * 2, 3) * 0.25;
    for (let k = 0; k < arc; k++) {
      const a = (k / (arc - 1)) * Math.PI;
      pos.push(Math.cos(a) * (width / 2) * shrink, Math.sin(a) * height * shrink, z);
    }
  }
  for (let i = 0; i < ribs; i++) {
    for (let k = 0; k < arc - 1; k++) {
      const a = i * arc + k;
      const b = a + 1;
      const c = a + arc;
      const d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/**
 * 斗笠 — the conical rain hat. Slightly domed rather than a straight cone, with
 * a brim that turns down. Seen from behind on a walking figure it is the single
 * most recognisable shape in the scene.
 */
export function buildHat(radius: number, height: number): THREE.BufferGeometry {
  const rings = 8;
  const sides = 20;
  const pos: number[] = [];
  const idx: number[] = [];

  for (let j = 0; j <= rings; j++) {
    const t = j / rings;
    const r = radius * t;
    // Domed profile, then a downward flick at the very edge.
    const y = height * (1 - Math.pow(t, 1.7)) - Math.pow(t, 9) * height * 0.55;
    for (let k = 0; k < sides; k++) {
      const a = (k / sides) * Math.PI * 2;
      pos.push(Math.cos(a) * r, y, Math.sin(a) * r);
    }
  }
  for (let j = 0; j < rings; j++) {
    for (let k = 0; k < sides; k++) {
      const a = j * sides + k;
      const b = j * sides + ((k + 1) % sides);
      const c = a + sides;
      const d = b + sides;
      idx.push(a, c, b, b, c, d);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** 蓑衣 — a straw cape, flared and ragged at the hem. */
export function buildCape(topR: number, bottomR: number, height: number): THREE.BufferGeometry {
  const rings = 6;
  const sides = 22;
  const pos: number[] = [];
  const idx: number[] = [];

  for (let j = 0; j <= rings; j++) {
    const t = j / rings;
    const r = topR + (bottomR - topR) * Math.pow(t, 1.4);
    for (let k = 0; k < sides; k++) {
      const a = (k / sides) * Math.PI * 2;
      // Ragged hem: the straw does not end in a clean line.
      const frill = j === rings ? Math.sin(a * 7) * height * 0.06 : 0;
      pos.push(Math.cos(a) * r, -height * t + frill, Math.sin(a) * r);
    }
  }
  for (let j = 0; j < rings; j++) {
    for (let k = 0; k < sides; k++) {
      const a = j * sides + k;
      const b = j * sides + ((k + 1) % sides);
      const c = a + sides;
      const d = b + sides;
      idx.push(a, c, b, b, c, d);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/**
 * 牛羊 — grazing animals, merged into a single buffer.
 *
 * 敕勒歌 spends six lines describing emptiness and then ends by pulling the
 * grass aside to reveal cattle and sheep. The line has nothing to show without
 * them, so: a squat body, a lowered head and four legs, which is all the
 * silhouette needs at the distance you actually see them from.
 */
export function buildHerd(
  placements: readonly { x: number; y: number; z: number; s: number; seed: number }[]
): THREE.BufferGeometry | null {
  if (!placements.length) return null;

  const sphere = new THREE.SphereGeometry(1, 9, 7).toNonIndexed();
  const cyl = new THREE.CylinderGeometry(1, 0.78, 1, 5).toNonIndexed();
  const cone = new THREE.ConeGeometry(1, 1, 5).toNonIndexed();
  const out: number[] = [];
  const world = new THREE.Matrix4();
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const v = new THREE.Vector3();
  const one = new THREE.Vector3(1, 1, 1);

  /** Stamp a part given in the animal's own frame (metres, forward is +z). */
  const part = (
    geo: THREE.BufferGeometry,
    sx: number, sy: number, sz: number,
    px: number, py: number, pz: number,
    rx = 0, ry = 0, rz = 0
  ) => {
    e.set(rx, ry, rz);
    q.setFromEuler(e);
    m.compose(new THREE.Vector3(px, py, pz), q, new THREE.Vector3(sx, sy, sz));
    m.premultiply(world);
    const arr = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      v.set(arr[i], arr[i + 1], arr[i + 2]).applyMatrix4(m);
      out.push(v.x, v.y, v.z);
    }
  };

  const legs = (spread: number, fore: number, aft: number, len: number, r: number) => {
    for (const [ox, oz] of [
      [-spread, fore],
      [spread, fore],
      [-spread, aft],
      [spread, aft],
    ]) {
      part(cyl, r, len, r, ox, len / 2, oz);
      part(cyl, r * 1.15, len * 0.12, r * 1.15, ox, len * 0.06, oz); // the hoof
    }
  };

  for (const p of placements) {
    const rng = new Rng(Math.floor(p.seed * 1e6) + 17);
    const face = rng.range(0, Math.PI * 2);
    const grazing = rng.next() < 0.7;
    const ox = rng.next() < 0.58;
    world.compose(new THREE.Vector3(p.x, p.y, p.z), q.setFromEuler(e.set(0, face, 0)), one.clone().setScalar(p.s));

    if (ox) {
      // 牛 — a broad back with a shoulder hump, a thick neck, horns and a tail.
      part(sphere, 0.36, 0.34, 0.62, 0, 0.72, 0);
      part(sphere, 0.3, 0.27, 0.3, 0, 0.9, 0.36);
      part(sphere, 0.34, 0.3, 0.3, 0, 0.74, -0.36);
      const hy = grazing ? 0.36 : 0.72;
      const hz = grazing ? 0.98 : 1.0;
      part(sphere, 0.18, 0.2, 0.34, 0, grazing ? 0.6 : 0.76, 0.72, grazing ? 0.9 : 0.15);
      part(sphere, 0.17, 0.17, 0.26, 0, hy, hz, grazing ? 0.5 : 0.1);
      part(sphere, 0.12, 0.11, 0.13, 0, hy - (grazing ? 0.07 : 0.03), hz + 0.2);
      for (const s of [-1, 1]) {
        part(cone, 0.035, 0.3, 0.035, s * 0.16, hy + (grazing ? 0.1 : 0.15), hz - 0.02, 0, 0, -s * 1.0);
        part(sphere, 0.07, 0.04, 0.09, s * 0.17, hy + 0.03, hz - 0.07, 0, 0, s * 0.4);
      }
      part(cyl, 0.03, 0.55, 0.03, 0, 0.5, -0.66, 0.15);
      legs(0.18, 0.38, -0.36, 0.52, 0.055);
    } else {
      // 羊 — a round woolly body, a small dark head, thin legs.
      part(sphere, 0.3, 0.29, 0.34, 0, 0.55, 0.06);
      part(sphere, 0.27, 0.26, 0.3, 0, 0.52, -0.22);
      part(sphere, 0.24, 0.24, 0.26, 0.05, 0.66, 0.14);
      const hy = grazing ? 0.26 : 0.68;
      part(sphere, 0.09, 0.1, 0.16, 0, hy, 0.66, grazing ? 0.7 : 0.1);
      part(cone, 0.06, 0.17, 0.06, 0, hy - (grazing ? 0.1 : 0.03), 0.78, Math.PI / 2 - (grazing ? 0.6 : 0.1));
      for (const s of [-1, 1]) part(sphere, 0.05, 0.02, 0.07, s * 0.09, hy + 0.07, 0.6, 0, 0, s * 0.7);
      part(sphere, 0.05, 0.05, 0.05, 0, 0.52, -0.5);
      legs(0.12, 0.26, -0.26, 0.38, 0.03);
    }
  }

  sphere.dispose();
  cyl.dispose();
  cone.dispose();

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
  g.computeVertexNormals();
  return g;
}

/**
 * Points of light: each carries its own colour, size and whether it burns in
 * daylight. See `makeGlowMaterial`. `boundingSphere` is set by hand because the
 * points are scattered across the whole valley and a default sphere computed
 * from a few of them will cull the rest.
 */
export function buildGlowPoints(
  glows: readonly { x: number; y: number; z: number; color: string; size: number; always: boolean }[]
): THREE.BufferGeometry | null {
  if (!glows.length) return null;
  const pos: number[] = [];
  const size: number[] = [];
  const always: number[] = [];
  const color: number[] = [];
  const seed: number[] = [];
  const c = new THREE.Color();
  glows.forEach((g, i) => {
    pos.push(g.x, g.y, g.z);
    size.push(g.size);
    always.push(g.always ? 1 : 0);
    c.set(g.color);
    color.push(c.r, c.g, c.b);
    seed.push(((i * 0.6180339) % 1) as number);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('aSize', new THREE.Float32BufferAttribute(size, 1));
  geo.setAttribute('aAlways', new THREE.Float32BufferAttribute(always, 1));
  geo.setAttribute('aColor', new THREE.Float32BufferAttribute(color, 3));
  geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 400);
  return geo;
}

/**
 * Birds in flight, every one of them in a single buffer.
 *
 * Each bird is four vertices — a beak and a tail with a wingtip either side —
 * and the whole flight happens in the vertex shader: a circuit round the
 * flock's centre at its own radius and height, and a flap that lifts the
 * wingtips. Nothing is updated from JavaScript, so a flock costs a draw call and
 * no per-frame work, which is why there can be a few of them in every world.
 */
export function buildFlocks(
  flocks: readonly { x: number; y: number; z: number; count: number; radius: number; speed: number; size?: number; pale?: boolean }[]
): THREE.BufferGeometry | null {
  if (!flocks.length) return null;
  const pos: number[] = [];
  const center: number[] = [];
  const params: number[] = [];
  const pale: number[] = [];
  const idx: number[] = [];
  let v = 0;

  flocks.forEach((f, fi) => {
    const rng = new Rng(9000 + fi * 31);
    for (let i = 0; i < f.count; i++) {
      const phase = rng.next() * Math.PI * 2;
      const size = (f.size ?? 1) * rng.range(0.85, 1.2);
      // A bird seen from below, twelve points: x is span, z is forward. The wing
      // is two panels that sweep back, so the flap (which lifts a point in
      // proportion to how far out it is) bends it like a real one.
      const local = [
        [0, 0, 0.62], //   0 beak
        [-0.16, 0, 0.2], // 1 left shoulder
        [0.16, 0, 0.2], //  2 right shoulder
        [0, 0, -0.4], //    3 rump
        [-0.85, 0, 0.12], // 4 left wing, leading edge
        [-1.6, 0, -0.42], // 5 left wingtip
        [-0.62, 0, -0.34], // 6 left wing, trailing edge
        [0.85, 0, 0.12], //  7 right wing, leading edge
        [1.6, 0, -0.42], //  8 right wingtip
        [0.62, 0, -0.34], // 9 right wing, trailing edge
        [-0.16, 0, -0.78], // 10 tail, left
        [0.16, 0, -0.78], //  11 tail, right
      ];
      for (const [lx, ly, lz] of local) {
        pos.push(lx * 0.65, ly, lz * 0.65);
        center.push(f.x, f.y, f.z);
        params.push(f.radius, f.speed * rng.range(0.85, 1.15), phase, size);
        pale.push(f.pale ? 1 : 0);
      }
      idx.push(
        v, v + 1, v + 2, // head and chest
        v + 1, v + 3, v + 2, // body
        v + 1, v + 4, v + 5, v + 1, v + 5, v + 6, v + 1, v + 6, v + 3, // left wing
        v + 2, v + 8, v + 7, v + 2, v + 9, v + 8, v + 2, v + 3, v + 9, // right wing
        v + 3, v + 10, v + 11 // tail
      );
      v += 12;
    }
  });

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aCenter', new THREE.Float32BufferAttribute(center, 3));
  g.setAttribute('aParams', new THREE.Float32BufferAttribute(params, 4));
  g.setAttribute('aPale', new THREE.Float32BufferAttribute(pale, 1));
  g.setIndex(idx);
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 400);
  return g;
}
