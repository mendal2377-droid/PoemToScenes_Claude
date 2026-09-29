import * as THREE from 'three';
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
  trail: readonly (readonly [number, number])[]
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

  strokePath(trail, 2.6, 'r');

  for (const ch of spec.channels) strokePath(ch.path, ch.width * 1.5, 'g');

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
