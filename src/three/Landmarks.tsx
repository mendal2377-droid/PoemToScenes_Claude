'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { terrainHeight } from '@/lib/terrain';
import { useScene } from '@/lib/store';
import type { PoemScene } from '@/lib/types';
import { LabelProjector, type LabelBus, type LabelPoint } from './Labels';

/** The breathing ring that marks a place still waiting to be reached. */
function Ring({ radius, color, y }: { radius: number; color: string; y: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.scale.setScalar(0.86 + Math.sin(t * 1.6) * 0.09);
    const m = ref.current.material as THREE.MeshBasicMaterial;
    m.opacity = 0.2 + Math.sin(t * 1.6) * 0.1;
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, y + 0.25, 0]}>
      <ringGeometry args={[radius * 0.82, radius, 56]} />
      <meshBasicMaterial color={color} transparent opacity={0.25} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

/**
 * The 3D half of the landmarks: the ground rings, plus the anchors that the DOM
 * overlay hangs its seals and verse slips from.
 */
export function Landmarks({ scene, bus }: { scene: PoemScene; bus: LabelBus }) {
  const found = useScene((s) => s.found);

  const heights = useMemo(
    () => scene.landmarks.map((lm) => terrainHeight(lm.x, lm.z, scene.terrain)),
    [scene]
  );

  const points: LabelPoint[] = useMemo(
    () =>
      scene.landmarks.map((lm, i) => ({
        id: lm.id,
        x: lm.x,
        // A found verse hangs a little higher than the seal it replaces.
        y: heights[i] + (found.includes(lm.id) ? 4.6 : 3.2),
        z: lm.z,
      })),
    [scene, heights, found]
  );

  return (
    <group>
      {scene.landmarks.map((lm, i) =>
        found.includes(lm.id) ? null : (
          <group key={lm.id} position={[lm.x, 0, lm.z]}>
            <Ring radius={lm.radius} color={scene.palette.accent} y={heights[i]} />
          </group>
        )
      )}
      <LabelProjector points={points} bus={bus} />
    </group>
  );
}
