'use client';

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { terrainHeight } from '@/lib/terrain';
import type { PoemScene, Role } from '@/lib/types';
import { makeInkMaterial } from './materials';
import { Figure } from './Figure';
import type { World } from './useWorld';

/**
 * Who is in the picture.
 *
 * A role is a costume and a posture: a robe colour, a hat, something carried.
 * They are built from the same handful of primitives as the traveller — a cone
 * for the robe, a sphere for the head — because at the distance anyone is seen
 * from, a silhouette and a colour are all that identifies a washerwoman or a
 * scholar, and because it means a scene can be populated with no model files.
 */

type Costume = {
  robe: string;
  /** Head covering: what sits on top. */
  hat?: 'cap' | 'straw' | 'fur' | 'bun' | 'tufts' | 'white';
  hatColor?: string;
  carry?: 'basket' | 'staff' | 'none';
  height: number;
};

const COSTUME: Record<Exclude<Role, 'fisher' | 'monkey'>, Costume> = {
  washer: { robe: '#9ab7cc', hat: 'bun', hatColor: '#2b2622', carry: 'basket', height: 1 },
  scholar: { robe: '#d8d2c0', hat: 'cap', hatColor: '#26221e', carry: 'none', height: 1.02 },
  poet: { robe: '#3d3a34', hat: 'cap', hatColor: '#1e1b18', carry: 'none', height: 1.02 },
  elder: { robe: '#8a6a4a', hat: 'white', hatColor: '#ece9e2', carry: 'staff', height: 0.94 },
  child: { robe: '#c85a48', hat: 'tufts', hatColor: '#2b2622', carry: 'none', height: 0.6 },
  farmer: { robe: '#7a6a48', hat: 'straw', hatColor: '#c8b070', carry: 'none', height: 1 },
  herdsman: { robe: '#4c3e32', hat: 'fur', hatColor: '#2e2620', carry: 'staff', height: 1.04 },
  companion: { robe: '#6a6258', hat: 'cap', hatColor: '#26221e', carry: 'none', height: 1 },
};

const SKIN = '#d6b48e';

function Costumed({
  role,
  sit,
  torch,
  mats,
}: {
  role: keyof typeof COSTUME;
  sit?: boolean;
  torch?: boolean;
  mats: (color: string) => THREE.ShaderMaterial;
}) {
  const c = COSTUME[role];
  const h = c.height;
  // Sitting: the robe is short and folded, and everything above sinks with it.
  const bodyH = (sit ? 0.78 : 1.25) * h;
  const bodyY = bodyH / 2 + (sit ? 0.22 : 0);
  const headY = bodyH + (sit ? 0.22 : 0) + 0.15 * h;

  return (
    <group>
      {/* A low stone to sit on. */}
      {sit && (
        <mesh material={mats('#8a8478')} position={[0, 0.11, 0]}>
          <cylinderGeometry args={[0.36, 0.42, 0.22, 7]} />
        </mesh>
      )}
      <mesh material={mats(c.robe)} position={[0, bodyY, 0]}>
        <cylinderGeometry args={[0.13 * h, 0.36 * h, bodyH, 10]} />
      </mesh>
      <mesh material={mats(SKIN)} position={[0, headY, 0]}>
        <sphereGeometry args={[0.15 * h, 10, 8]} />
      </mesh>

      {c.hat === 'cap' && (
        <mesh material={mats(c.hatColor!)} position={[0, headY + 0.15 * h, 0]}>
          <boxGeometry args={[0.24 * h, 0.13 * h, 0.24 * h]} />
        </mesh>
      )}
      {c.hat === 'bun' && (
        <>
          <mesh material={mats(c.hatColor!)} position={[0, headY + 0.03 * h, 0]}>
            <sphereGeometry args={[0.16 * h, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          </mesh>
          <mesh material={mats(c.hatColor!)} position={[0, headY + 0.19 * h, -0.02]}>
            <sphereGeometry args={[0.075 * h, 8, 6]} />
          </mesh>
        </>
      )}
      {c.hat === 'straw' && (
        <mesh material={mats(c.hatColor!)} position={[0, headY + 0.15 * h, 0]}>
          <coneGeometry args={[0.42 * h, 0.2 * h, 12]} />
        </mesh>
      )}
      {c.hat === 'fur' && (
        <mesh material={mats(c.hatColor!)} position={[0, headY + 0.2 * h, 0]}>
          <coneGeometry args={[0.17 * h, 0.36 * h, 8]} />
        </mesh>
      )}
      {c.hat === 'white' && (
        <mesh material={mats(c.hatColor!)} position={[0, headY + 0.07 * h, 0]}>
          <sphereGeometry args={[0.165 * h, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        </mesh>
      )}
      {c.hat === 'tufts' && (
        <>
          <mesh material={mats(c.hatColor!)} position={[-0.13 * h, headY + 0.1 * h, 0]}>
            <sphereGeometry args={[0.06 * h, 7, 6]} />
          </mesh>
          <mesh material={mats(c.hatColor!)} position={[0.13 * h, headY + 0.1 * h, 0]}>
            <sphereGeometry args={[0.06 * h, 7, 6]} />
          </mesh>
        </>
      )}

      {c.carry === 'basket' && (
        <mesh material={mats('#a98a5a')} position={[0.36, 0.66 * h, 0.04]}>
          <cylinderGeometry args={[0.2, 0.15, 0.22, 9]} />
        </mesh>
      )}
      {c.carry === 'staff' && (
        <mesh material={mats('#6a5238')} position={[0.4 * h, 0.78 * h, 0.05]} rotation={[0, 0, -0.06]}>
          <cylinderGeometry args={[0.024, 0.03, 1.56 * h, 5]} />
        </mesh>
      )}

      {/* 拥火 — the flame itself is a glow point, added in useWorld; this is the stick. */}
      {torch && (
        <mesh material={mats('#4a3a28')} position={[0.4, 1.2 * h, 0.3]} rotation={[0.25, 0, -0.14]}>
          <cylinderGeometry args={[0.028, 0.034, 0.7, 5]} />
        </mesh>
      )}
    </group>
  );
}

/** 猿 — a small brown ape on a rock, hunched. */
function Monkey({ mats }: { mats: (color: string) => THREE.ShaderMaterial }) {
  return (
    <group>
      <mesh material={mats('#7a766a')} position={[0, 0.3, 0]}>
        <dodecahedronGeometry args={[0.7, 0]} />
      </mesh>
      <mesh material={mats('#5c4432')} position={[0, 1.0, 0]} scale={[1, 1.15, 0.85]}>
        <sphereGeometry args={[0.3, 9, 7]} />
      </mesh>
      <mesh material={mats('#6a5038')} position={[0, 1.42, 0.12]}>
        <sphereGeometry args={[0.19, 9, 7]} />
      </mesh>
      {/* the tail, hanging */}
      <mesh material={mats('#5c4432')} position={[0, 0.75, -0.32]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.03, 0.95, 5]} />
      </mesh>
    </group>
  );
}

export function People({ scene, world }: { scene: PoemScene; world: World }) {
  // One material per colour used, shared between every figure that wears it.
  const cache = useMemo(() => new Map<string, THREE.ShaderMaterial>(), []);
  const mats = useMemo(
    () => (color: string) => {
      let m = cache.get(color);
      if (!m) {
        m = makeInkMaterial(scene.palette, color);
        cache.set(color, m);
      }
      return m;
    },
    [cache, scene.palette]
  );

  useEffect(
    () => () => {
      cache.forEach((m) => m.dispose());
      cache.clear();
    },
    [cache]
  );

  if (!scene.people?.length) return null;

  return (
    <>
      {scene.people.map((p, i) => {
        const y = terrainHeight(p.x, p.z, scene.terrain);
        const k = p.scale ?? 1;
        return (
          <group key={i} position={[p.x, y, p.z]} rotation={[0, p.rot, 0]} scale={k}>
            {p.role === 'fisher' ? (
              <Figure world={world} scale={0.9} />
            ) : p.role === 'monkey' ? (
              <Monkey mats={mats} />
            ) : (
              <Costumed role={p.role} sit={p.sit} torch={p.torch} mats={mats} />
            )}
          </group>
        );
      })}
    </>
  );
}
