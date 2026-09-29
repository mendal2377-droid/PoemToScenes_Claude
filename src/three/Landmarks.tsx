'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { clamp } from '@/lib/noise';
import { terrainHeight } from '@/lib/terrain';
import { useScene } from '@/lib/store';
import type { PoemScene } from '@/lib/types';

/**
 * A place waiting to be reached, marked only on the ground.
 *
 * Floating seals turned the painting into a quest map, so nothing hovers any
 * more: just a ring drawn on the earth that fades up as you come near it and is
 * invisible from across the valley. The poem itself lives in the inscription.
 */
function Ring({
  lm,
  scene,
  found,
}: {
  lm: PoemScene['landmarks'][number];
  scene: PoemScene;
  found: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const y = useMemo(() => terrainHeight(lm.x, lm.z, scene.terrain), [lm, scene]);

  useFrame(({ clock, camera }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const d = camera.position.distanceTo(mesh.position);
    // Only visible from within a few ring-radii; nothing to see from a distance.
    const near = 1 - clamp((d - lm.radius * 1.5) / (lm.radius * 4), 0, 1);
    const pulse = 0.72 + Math.sin(clock.elapsedTime * 1.5) * 0.28;
    const m = mesh.material as THREE.MeshBasicMaterial;
    m.opacity = near * pulse * (found ? 0.06 : 0.3);
    mesh.visible = m.opacity > 0.01;
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[lm.x, y + 0.22, lm.z]}>
      <ringGeometry args={[lm.radius * 0.88, lm.radius, 56]} />
      <meshBasicMaterial
        color={scene.palette.accent}
        transparent
        opacity={0}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function Landmarks({ scene }: { scene: PoemScene }) {
  const found = useScene((s) => s.found);
  return (
    <group>
      {scene.landmarks.map((lm) => (
        <Ring key={lm.id} lm={lm} scene={scene} found={found.includes(lm.id)} />
      ))}
    </group>
  );
}
