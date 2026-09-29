'use client';

import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { clamp } from '@/lib/noise';

/**
 * A handle shared between the DOM overlay and the renderer.
 *
 * The overlay owns the elements; this just tells the projector where to find
 * them. Nothing here goes through React state, so moving a label costs one
 * style write per frame rather than a re-render.
 */
export type LabelBus = {
  els: Map<string, HTMLElement | null>;
};

export function createLabelBus(): LabelBus {
  return { els: new Map() };
}

export type LabelPoint = { id: string; x: number; y: number; z: number };

const v = new THREE.Vector3();
const cam = new THREE.Vector3();

/**
 * Projects world anchors onto the screen and drives the overlay elements.
 *
 * This replaces drei's `Html`, which mounts a separate React root per label —
 * under React 19's StrictMode that meant a synchronous unmount during render
 * for every marker, and it gave the labels their own stacking context that kept
 * landing on top of the interface.
 */
export function LabelProjector({ points, bus }: { points: LabelPoint[]; bus: LabelBus }) {
  const { camera, size } = useThree();

  useFrame(() => {
    for (const p of points) {
      const el = bus.els.get(p.id);
      if (!el) continue;

      v.set(p.x, p.y, p.z);
      cam.copy(v).applyMatrix4(camera.matrixWorldInverse);
      // Positive camera-space z is behind the viewer, where projection flips.
      const behind = cam.z > -0.2;
      const dist = cam.length();

      if (behind || dist > 260) {
        el.style.visibility = 'hidden';
        continue;
      }

      v.project(camera);
      const sx = (v.x * 0.5 + 0.5) * size.width;
      const sy = (-v.y * 0.5 + 0.5) * size.height;
      const scale = clamp(26 / dist, 0.3, 1.35);
      // Fade out rather than pop out at the distance limit.
      const fade = clamp((260 - dist) / 60, 0, 1);

      el.style.visibility = 'visible';
      el.style.opacity = String(fade);
      el.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -50%) scale(${scale})`;
    }
  });

  return null;
}
