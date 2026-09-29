import * as THREE from 'three';
import { clamp, fbm } from '@/lib/noise';
import type { TerrainSpec } from '@/lib/terrain';

const SIZE = 1024;

/**
 * Paints the trail and the wet ground into one texture the terrain shader reads.
 *
 * The obvious approach — a distance query per terrain vertex — ties the trail's
 * resolution to the mesh, and at 1.5 m per quad the path came out as a chain of
 * lozenges. Rasterising the polyline into a texture instead decouples the two:
 * the ground keeps its cheap mesh and the path gets a clean, soft edge.
 *
 * Red channel is the trail, green is proximity to water.
 */
export function buildGroundMask(
  spec: TerrainSpec,
  trail: readonly (readonly [number, number])[],
  extraPaths: readonly (readonly (readonly [number, number])[])[] = []
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;

  const span = spec.extent * 2;
  const pxPerUnit = SIZE / span;
  const toX = (x: number) => (x + spec.extent) * pxPerUnit;
  const toY = (z: number) => (z + spec.extent) * pxPerUnit;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // Overlapping passes accumulate instead of painting over each other.
  ctx.globalCompositeOperation = 'lighter';

  const strokePath = (
    path: readonly (readonly [number, number])[],
    widthUnits: number,
    channel: 'r' | 'g'
  ) => {
    // Three passes, wide and faint to narrow and solid, give a soft shoulder.
    const passes: [number, number][] = [
      [2.6, 0.22],
      [1.7, 0.3],
      [1.0, 0.6],
    ];
    for (const [mult, alpha] of passes) {
      ctx.beginPath();
      ctx.moveTo(toX(path[0][0]), toY(path[0][1]));
      for (let i = 1; i < path.length; i++) ctx.lineTo(toX(path[i][0]), toY(path[i][1]));
      ctx.lineWidth = widthUnits * mult * pxPerUnit;
      ctx.strokeStyle =
        channel === 'r' ? `rgba(255,0,0,${alpha})` : `rgba(0,255,0,${alpha})`;
      ctx.stroke();
    }
  };

  strokePath(trail, 1.9, 'r');
  // 阡陌 — the footpaths between fields are narrower than the main trail.
  for (const path of extraPaths) strokePath(path, 1.35, 'r');

  for (const ch of spec.channels) strokePath(ch.path, ch.width * 1.5, 'g');
  // Damp ground along a river's banks; the water itself covers the middle.
  for (const rv of spec.rivers ?? []) strokePath(rv.path, rv.width * 0.86, 'g');

  for (const b of spec.basins) {
    const grad = ctx.createRadialGradient(toX(b.x), toY(b.z), 0, toX(b.x), toY(b.z), b.r * 1.35 * pxPerUnit);
    grad.addColorStop(0, 'rgba(0,255,0,0.9)');
    grad.addColorStop(0.7, 'rgba(0,255,0,0.75)');
    grad.addColorStop(1, 'rgba(0,255,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(toX(b.x), toY(b.z), b.r * 1.35 * pxPerUnit, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

/**
 * 留白 — the bare paper.
 *
 * In a landscape scroll something like a third of the silk is never touched, and
 * that absence is what gives the ink somewhere to sit. The scene was painting
 * every square metre, so this field marks out where it should stop: the terrain
 * shader washes those patches back to paper, and the grass builder reads the
 * same numbers so it doesn't plant tufts in the emptiness.
 *
 * The CPU sampler bilinearly filters the identical array the GPU samples, so the
 * two never disagree about where the paper is.
 */
export type PaperField = {
  texture: THREE.DataTexture;
  sample: (x: number, z: number) => number;
};

const FIELD = 128;

export function buildPaperField(spec: TerrainSpec, seed: number): PaperField {
  const data = new Uint8Array(FIELD * FIELD);
  const span = spec.extent * 2;

  for (let j = 0; j < FIELD; j++) {
    for (let i = 0; i < FIELD; i++) {
      const x = (i / (FIELD - 1)) * span - spec.extent;
      const z = (j / (FIELD - 1)) * span - spec.extent;
      // Large, soft patches. Anything higher-frequency reads as noise, not 留白.
      const v = fbm(x * 0.0115 + 40, z * 0.0115 + 40, 3, seed);
      data[j * FIELD + i] = Math.round(clamp(v, 0, 1) * 255);
    }
  }

  const texture = new THREE.DataTexture(data, FIELD, FIELD, THREE.RedFormat, THREE.UnsignedByteType);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  const sample = (x: number, z: number) => {
    const u = clamp((x + spec.extent) / span, 0, 1) * (FIELD - 1);
    const v = clamp((z + spec.extent) / span, 0, 1) * (FIELD - 1);
    const i0 = Math.floor(u);
    const j0 = Math.floor(v);
    const i1 = Math.min(FIELD - 1, i0 + 1);
    const j1 = Math.min(FIELD - 1, j0 + 1);
    const fu = u - i0;
    const fv = v - j0;
    const top = data[j0 * FIELD + i0] + (data[j0 * FIELD + i1] - data[j0 * FIELD + i0]) * fu;
    const bot = data[j1 * FIELD + i0] + (data[j1 * FIELD + i1] - data[j1 * FIELD + i0]) * fu;
    return (top + (bot - top) * fv) / 255;
  };

  return { texture, sample };
}
