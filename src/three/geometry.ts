import * as THREE from 'three';
import { Rng, ridge } from '@/lib/noise';
import { terrainHeight } from '@/lib/terrain';
import type { TerrainSpec } from '@/lib/terrain';
import type { PoemScene } from '@/lib/types';

/**
 * The path the poem walks you along. It threads every landmark in a loop, so a
 * visitor who simply follows the ochre trail collects the whole poem.
 */
export function buildTrail(scene: PoemScene): [number, number][] {
  if (scene.journey) {
    // A story is walked in the order it is told: from where you wake, through
    // every place in the sequence of the text, and it does not come back.
    const ordered = [...scene.landmarks].sort((p, q) => p.line - q.line);
    const pts = [{ x: scene.start.x, z: scene.start.z }, ...ordered.map((l) => ({ x: l.x, z: l.z }))];
    const curve = new THREE.CatmullRomCurve3(
      pts.map((p) => new THREE.Vector3(p.x, 0, p.z)),
      false,
      'catmullrom',
      0.35
    );
    return curve.getPoints(Math.max(220, pts.length * 28)).map((v) => [v.x, v.z] as [number, number]);
  }

  const pts = [...scene.landmarks].map((l) => ({ x: l.x, z: l.z }));
  pts.push({ x: scene.start.x, z: scene.start.z });

  // Order them around the valley so the trail is a circuit, not a zigzag.
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cz = pts.reduce((s, p) => s + p.z, 0) / pts.length;
  pts.sort((a, b) => Math.atan2(a.z - cz, a.x - cx) - Math.atan2(b.z - cz, b.x - cx));

  const curve = new THREE.CatmullRomCurve3(
    pts.map((p) => new THREE.Vector3(p.x, 0, p.z)),
    true,
    'catmullrom',
    0.4
  );
  return curve.getPoints(Math.max(180, pts.length * 26)).map((v) => [v.x, v.z] as [number, number]);
}

/**
 * The ground. Built once from `terrainHeight`, with two baked attributes: how
 * close each vertex is to the trail, and how close it is to open water.
 */
export function buildTerrain(spec: TerrainSpec): THREE.BufferGeometry {
  const seg = 176;
  const size = spec.extent * 2;
  const geo = new THREE.PlaneGeometry(size, size, seg, seg);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, terrainHeight(pos.getX(i), pos.getZ(i), spec));
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/**
 * A range of mountains as a ribbon wrapped around the valley.
 *
 * The radius wobbles with the angle rather than staying constant, which is the
 * whole trick: peaks sit at genuinely different distances, so they slide past
 * each other as you walk instead of behaving like a painted backdrop.
 */
export function buildMountainRing(opts: {
  seed: number;
  rMin: number;
  rMax: number;
  hMin: number;
  hMax: number;
  segments?: number;
  bottom?: number;
  /** Peaks that dominate the horizon at a given bearing. */
  massifs?: readonly { angle: number; width: number; boost: number }[];
}): THREE.BufferGeometry {
  const { seed, rMin, rMax, hMin, hMax } = opts;
  const segments = opts.segments ?? 360;
  const bottom = opts.bottom ?? -30;

  const positions: number[] = [];
  const tops: number[] = [];
  const seeds: number[] = [];
  const indices: number[] = [];

  const cols: { x: number; z: number; top: number }[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const a = t * Math.PI * 2;
    // Two noise fields: one shapes the skyline, one pushes peaks near and far.
    const crest = ridge(Math.cos(a) * 2.4 + 10, Math.sin(a) * 2.4 + 10, 5, seed);
    const depth = ridge(Math.cos(a) * 1.1 + 40, Math.sin(a) * 1.1 + 40, 3, seed + 333);
    const r = rMin + (rMax - rMin) * depth;
    let h = hMin + (hMax - hMin) * Math.pow(crest, 1.35);
    // A massif is a Gaussian bump on the skyline at a chosen bearing. Measured
    // the short way round the circle so one straddling the seam still works.
    if (opts.massifs) {
      for (const m of opts.massifs) {
        let d = a - m.angle;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        h += m.boost * Math.exp(-(d / m.width) * (d / m.width));
      }
    }
    cols.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, top: h });
  }

  for (let i = 0; i < cols.length; i++) {
    const col = cols[i];
    const s = ridge(i * 0.13 + 5, 7, 2, seed + 77);
    // bottom vertex
    positions.push(col.x, bottom, col.z);
    tops.push(col.top);
    seeds.push(s);
    // top vertex
    positions.push(col.x, col.top, col.z);
    tops.push(col.top);
    seeds.push(s);
  }

  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    const b = a + 1;
    const cc = a + 2;
    const d = a + 3;
    indices.push(a, cc, b, b, cc, d);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('aTop', new THREE.Float32BufferAttribute(tops, 1));
  geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** A pond surface: a disc that follows the basin, sitting at a flat water level. */
export function buildPond(b: { x: number; z: number; r: number }, level: number): THREE.BufferGeometry {
  const geo = new THREE.CircleGeometry(b.r * 1.02, 72);
  geo.rotateX(-Math.PI / 2);
  geo.translate(b.x, level, b.z);
  return geo;
}

/**
 * A stream: a ribbon that follows the channel path and rides just above the
 * carved bed, so it reads as water running over stone rather than a flat decal.
 */
export function buildStream(
  path: readonly (readonly [number, number])[],
  width: number,
  spec: TerrainSpec
): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(
    path.map((p) => new THREE.Vector3(p[0], 0, p[1])),
    false,
    'catmullrom',
    0.5
  );
  const steps = 180;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = curve.getPoint(t);
    const tan = curve.getTangent(t);
    const nx = -tan.z;
    const nz = tan.x;
    const len = Math.hypot(nx, nz) || 1;
    // Wider and slower as it nears the pond.
    const w = (width * 0.5) * (0.7 + t * 0.9);
    const y = terrainHeight(p.x, p.z, spec) + 0.42;
    positions.push(p.x - (nx / len) * w, y, p.z - (nz / len) * w);
    positions.push(p.x + (nx / len) * w, y, p.z + (nz / len) * w);
    uvs.push(0, t * 12, 1, t * 12);
  }

  for (let i = 0; i < steps; i++) {
    const a = i * 2;
    indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Drifting mist banks.
 *
 * `position` holds only each quad's own corners and `aAnchor` holds where the
 * bank sits, because the shader has to spin the quad about its anchor to face
 * the camera — baking the two together would make that impossible.
 */
export function buildMistBanks(count: number, spec: TerrainSpec, seed: number): THREE.BufferGeometry {
  const rng = new Rng(seed);
  const positions: number[] = [];
  const anchors: number[] = [];
  const uvs: number[] = [];
  const seeds: number[] = [];
  const indices: number[] = [];
  let v = 0;

  for (let i = 0; i < count; i++) {
    const a = rng.range(0, Math.PI * 2);
    const r = rng.range(20, spec.extent * 0.86);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const y = terrainHeight(x, z, spec) + rng.range(1.5, 9);
    const w = rng.range(16, 44);
    const h = rng.range(4, 11);
    const s = rng.next();

    positions.push(-w / 2, -h / 2, 0, w / 2, -h / 2, 0, w / 2, h / 2, 0, -w / 2, h / 2, 0);
    uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
    for (let k = 0; k < 4; k++) {
      anchors.push(x, y, z);
      seeds.push(s);
    }
    indices.push(v, v + 1, v + 2, v, v + 2, v + 3);
    v += 4;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('aAnchor', new THREE.Float32BufferAttribute(anchors, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
  geo.setIndex(indices);
  // The quads live at the origin until the shader places them, so give three a
  // bounding sphere that actually covers the valley or it will cull them all.
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), spec.extent * 1.6);
  return geo;
}

/** Falling snow, as a point cloud the shader recycles vertically. */
export function buildSnow(count: number, radius: number, seed: number): THREE.BufferGeometry {
  const rng = new Rng(seed);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const a = rng.range(0, Math.PI * 2);
    const r = Math.sqrt(rng.next()) * radius;
    positions[i * 3] = Math.cos(a) * r;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = Math.sin(a) * r;
    seeds[i] = rng.next();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  // The shader lifts each flake up to 42 and drops it; the stored y is always 0,
  // so an auto-computed bounding sphere would cull the whole snowfall.
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 20, 0), radius + 48);
  return geo;
}

/**
 * The water of a wide river: a flat ribbon at the river's own level.
 *
 * Unlike the brook — which rides just above its bed because it runs downhill —
 * a river is level across its width, so this is a plane, and it relies on the
 * terrain to hide it wherever the bank rises above the water. It only runs
 * where the carve is strongest; past that the ground has risen to meet it.
 */
export function buildRiver(rv: {
  path: readonly (readonly [number, number])[];
  width: number;
  level: number;
}): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(
    rv.path.map((p) => new THREE.Vector3(p[0], 0, p[1])),
    false,
    'catmullrom',
    0.5
  );
  const steps = 260;
  // Reach a little past the banks; the terrain trims it back to the waterline.
  const half = rv.width * 0.5 + rv.width * 0.36 * 0.62;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  let n = 0;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Where the carve has faded the ground is above the water anyway.
    if (t < 0.05 || t > 0.95) continue;
    const p = curve.getPoint(t);
    const tan = curve.getTangent(t);
    const nx = -tan.z;
    const nz = tan.x;
    const len = Math.hypot(nx, nz) || 1;
    positions.push(p.x - (nx / len) * half, rv.level, p.z - (nz / len) * half);
    positions.push(p.x + (nx / len) * half, rv.level, p.z + (nz / len) * half);
    uvs.push(0, t * 30, 1, t * 30);
    if (n > 0) {
      const a = (n - 1) * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
    n++;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}
