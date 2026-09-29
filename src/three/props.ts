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

  const body = new THREE.SphereGeometry(1, 9, 7).toNonIndexed();
  const head = new THREE.SphereGeometry(1, 7, 6).toNonIndexed();
  const leg = new THREE.CylinderGeometry(1, 0.8, 1, 5).toNonIndexed();
  const out: number[] = [];
  const m = new THREE.Matrix4();
  const v = new THREE.Vector3();

  const stamp = (geo: THREE.BufferGeometry) => {
    const arr = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      v.set(arr[i], arr[i + 1], arr[i + 2]).applyMatrix4(m);
      out.push(v.x, v.y, v.z);
    }
  };

  for (const p of placements) {
    const rng = new Rng(Math.floor(p.seed * 1e6) + 17);
    const face = rng.range(0, Math.PI * 2);
    const s = p.s;
    const bodyY = p.y + s * 0.62;

    m.makeScale(s * 0.34, s * 0.3, s * 0.62);
    m.premultiply(new THREE.Matrix4().makeRotationY(face));
    m.setPosition(p.x, bodyY, p.z);
    stamp(body);

    // Head down in the grass, which is what grazing looks like.
    const hx = p.x + Math.sin(face) * s * 0.6;
    const hz = p.z + Math.cos(face) * s * 0.6;
    m.makeScale(s * 0.19, s * 0.17, s * 0.23);
    m.setPosition(hx, p.y + s * rng.range(0.3, 0.46), hz);
    stamp(head);

    for (const [ox, oz] of [
      [-0.18, 0.34],
      [0.18, 0.34],
      [-0.18, -0.34],
      [0.18, -0.34],
    ]) {
      const lx = p.x + (ox * Math.cos(face) + oz * Math.sin(face)) * s;
      const lz = p.z + (-ox * Math.sin(face) + oz * Math.cos(face)) * s;
      m.makeScale(s * 0.045, s * 0.62, s * 0.045);
      m.setPosition(lx, p.y + s * 0.31, lz);
      stamp(leg);
    }
  }

  body.dispose();
  head.dispose();
  leg.dispose();

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
  g.computeVertexNormals();
  return g;
}
