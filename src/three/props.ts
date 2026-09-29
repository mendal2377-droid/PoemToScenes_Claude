import * as THREE from 'three';

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
