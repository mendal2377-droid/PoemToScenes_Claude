'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { terrainHeight } from '@/lib/terrain';
import type { Animal, PoemScene } from '@/lib/types';
import { makeInkMaterial } from './materials';

/**
 * The creatures a poem names — 鸡犬相闻, 蛙声一片, a heron at the shallows.
 *
 * Like the people they are a few primitives each, but every one has its own
 * small habit: the hen pecks in bursts, the dog's tail goes, the frog's throat
 * swells, the egret stands stock still and turns its head like a signpost.
 */

type Mats = (color: string) => THREE.ShaderMaterial;

function Leg({ m, x, z, len, r }: { m: THREE.Material; x: number; z: number; len: number; r: number }) {
  return (
    <mesh material={m} position={[x, len / 2, z]}>
      <cylinderGeometry args={[r, r * 0.75, len, 5]} />
    </mesh>
  );
}

function Hen({ mats, seed }: { mats: Mats; seed: number }) {
  const neck = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 1.6 + seed * 3.1;
    // Pecking comes in flurries: a slow beat gates a fast one.
    const gate = Math.max(0, Math.sin(t * 0.7));
    const peck = Math.max(0, Math.sin(t * 6)) * gate * gate;
    if (neck.current) neck.current.rotation.x = 0.15 + peck * 0.9;
  });
  const body = mats('#a86a3a');
  const dark = mats('#3a2a20');
  return (
    <group>
      <mesh material={body} position={[0, 0.24, 0]} scale={[0.15, 0.15, 0.21]}>
        <sphereGeometry args={[1, 9, 7]} />
      </mesh>
      <group ref={neck} position={[0, 0.3, 0.14]}>
        <mesh material={body} position={[0, 0.07, 0.02]} rotation={[0.25, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.06, 0.16, 6]} />
        </mesh>
        <mesh material={body} position={[0, 0.17, 0.05]}>
          <sphereGeometry args={[0.055, 8, 6]} />
        </mesh>
        <mesh material={mats('#d9a03c')} position={[0, 0.165, 0.11]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.02, 0.06, 5]} />
        </mesh>
        <mesh material={mats('#c84a3a')} position={[0, 0.235, 0.04]} scale={[0.4, 1, 1.4]}>
          <sphereGeometry args={[0.03, 6, 5]} />
        </mesh>
        <mesh material={mats('#c84a3a')} position={[0, 0.12, 0.09]}>
          <sphereGeometry args={[0.018, 5, 4]} />
        </mesh>
      </group>
      {/* The tail: three curved feathers fanned up and back. */}
      {[-0.3, 0, 0.3].map((r) => (
        <mesh key={r} material={dark} position={[r * 0.1, 0.34, -0.22]} rotation={[-0.9, 0, r]}>
          <coneGeometry args={[0.04, 0.2, 4]} />
        </mesh>
      ))}
      <Leg m={mats('#c8a050')} x={-0.05} z={0.02} len={0.15} r={0.014} />
      <Leg m={mats('#c8a050')} x={0.05} z={0.02} len={0.15} r={0.014} />
    </group>
  );
}

function Dog({ mats, seed }: { mats: Mats; seed: number }) {
  const tail = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + seed * 2.3;
    if (tail.current) tail.current.rotation.z = Math.sin(t * 7) * 0.5;
    if (head.current) head.current.rotation.y = Math.sin(t * 0.5) * 0.35;
  });
  const fur = mats('#b58a52');
  const dark = mats('#3a2a20');
  return (
    <group>
      <mesh material={fur} position={[0, 0.4, 0]} scale={[0.15, 0.15, 0.34]}>
        <sphereGeometry args={[1, 9, 7]} />
      </mesh>
      <mesh material={fur} position={[0, 0.46, 0.26]} scale={[0.14, 0.15, 0.14]}>
        <sphereGeometry args={[1, 8, 6]} />
      </mesh>
      <group ref={head} position={[0, 0.58, 0.4]}>
        <mesh material={fur}>
          <sphereGeometry args={[0.11, 9, 7]} />
        </mesh>
        <mesh material={fur} position={[0, -0.03, 0.12]} scale={[0.7, 0.6, 1.2]}>
          <sphereGeometry args={[0.07, 7, 6]} />
        </mesh>
        <mesh material={dark} position={[0, -0.015, 0.2]}>
          <sphereGeometry args={[0.02, 5, 4]} />
        </mesh>
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh material={dark} position={[s * 0.09, 0.09, -0.02]} rotation={[0, 0, s * 0.5]}>
              <coneGeometry args={[0.04, 0.11, 4]} />
            </mesh>
            <mesh material={dark} position={[s * 0.05, 0.03, 0.09]}>
              <sphereGeometry args={[0.012, 4, 4]} />
            </mesh>
          </group>
        ))}
      </group>
      <group ref={tail} position={[0, 0.5, -0.34]} rotation={[-0.9, 0, 0]}>
        <mesh material={fur} position={[0, 0.11, 0]}>
          <cylinderGeometry args={[0.02, 0.035, 0.24, 5]} />
        </mesh>
      </group>
      <Leg m={fur} x={-0.09} z={0.22} len={0.34} r={0.035} />
      <Leg m={fur} x={0.09} z={0.22} len={0.34} r={0.035} />
      <Leg m={fur} x={-0.09} z={-0.22} len={0.34} r={0.035} />
      <Leg m={fur} x={0.09} z={-0.22} len={0.34} r={0.035} />
    </group>
  );
}

function Frog({ mats, seed }: { mats: Mats; seed: number }) {
  const throat = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 2.2 + seed * 1.7;
    const call = Math.max(0, Math.sin(t)) * Math.max(0, Math.sin(t * 3.1));
    if (throat.current) throat.current.scale.setScalar(0.4 + call * 1.1);
  });
  const g = mats('#6a8f4a');
  return (
    <group>
      <mesh material={g} position={[0, 0.06, 0]} scale={[0.11, 0.07, 0.15]}>
        <sphereGeometry args={[1, 8, 6]} />
      </mesh>
      <mesh material={mats('#d8e0b0')} position={[0, 0.045, 0.1]}>
        <sphereGeometry args={[0.04, 6, 5]} />
      </mesh>
      <mesh ref={throat} material={mats('#e6ecc0')} position={[0, 0.05, 0.14]}>
        <sphereGeometry args={[0.04, 6, 5]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh material={g} position={[s * 0.05, 0.13, 0.08]}>
            <sphereGeometry args={[0.028, 6, 5]} />
          </mesh>
          <mesh material={mats('#20281a')} position={[s * 0.05, 0.14, 0.1]}>
            <sphereGeometry args={[0.012, 4, 4]} />
          </mesh>
          <mesh material={g} position={[s * 0.1, 0.035, -0.07]} rotation={[0, 0, s * 0.5]} scale={[1, 0.5, 1.6]}>
            <sphereGeometry args={[0.04, 6, 5]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Egret({ mats, seed }: { mats: Mats; seed: number }) {
  const neck = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.4 + seed * 2.7;
    if (neck.current) neck.current.rotation.y = Math.sin(t) * 0.7 * Math.abs(Math.sin(t * 0.6));
  });
  const w = mats('#f3f0e8');
  const leg = mats('#2a2622');
  return (
    <group>
      <Leg m={leg} x={0.03} z={0} len={0.62} r={0.013} />
      <mesh material={leg} position={[-0.03, 0.4, 0.02]} rotation={[0.9, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.01, 0.3, 4]} />
      </mesh>
      <mesh material={w} position={[0, 0.72, -0.02]} rotation={[0.3, 0, 0]} scale={[0.1, 0.12, 0.3]}>
        <sphereGeometry args={[1, 9, 7]} />
      </mesh>
      {/* the plume trailing off the back */}
      <mesh material={w} position={[0, 0.72, -0.34]} rotation={[-1.3, 0, 0]}>
        <coneGeometry args={[0.05, 0.3, 5]} />
      </mesh>
      <group ref={neck} position={[0, 0.78, 0.2]}>
        <mesh material={w} position={[0, 0.16, 0.02]} rotation={[-0.35, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.03, 0.34, 6]} />
        </mesh>
        <mesh material={w} position={[0, 0.34, -0.02]} rotation={[0.55, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.022, 0.2, 6]} />
        </mesh>
        <mesh material={w} position={[0, 0.44, 0.03]}>
          <sphereGeometry args={[0.038, 8, 6]} />
        </mesh>
        <mesh material={mats('#d9b040')} position={[0, 0.44, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.014, 0.16, 5]} />
        </mesh>
      </group>
    </group>
  );
}

function Ox({ mats, seed }: { mats: Mats; seed: number }) {
  const head = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + seed * 1.9;
    if (head.current) head.current.rotation.x = 0.25 + Math.sin(t * 0.6) * 0.18;
    if (tail.current) tail.current.rotation.z = Math.sin(t * 1.8) * 0.3;
  });
  const hide = mats('#5a4030');
  const dark = mats('#2e2018');
  return (
    <group scale={1.15}>
      <mesh material={hide} position={[0, 0.9, 0]} scale={[0.4, 0.4, 0.75]}>
        <sphereGeometry args={[1, 10, 8]} />
      </mesh>
      <mesh material={hide} position={[0, 1.12, 0.45]} scale={[0.34, 0.3, 0.34]}>
        <sphereGeometry args={[1, 8, 6]} />
      </mesh>
      <mesh material={hide} position={[0, 0.92, -0.5]} scale={[0.36, 0.34, 0.34]}>
        <sphereGeometry args={[1, 8, 6]} />
      </mesh>
      <group ref={head} position={[0, 0.98, 0.78]}>
        <mesh material={hide} position={[0, -0.05, 0.22]} rotation={[0.9, 0, 0]} scale={[0.2, 0.24, 0.4]}>
          <sphereGeometry args={[1, 8, 6]} />
        </mesh>
        <mesh material={hide} position={[0, -0.3, 0.5]} scale={[0.19, 0.2, 0.3]}>
          <sphereGeometry args={[1, 8, 6]} />
        </mesh>
        <mesh material={dark} position={[0, -0.36, 0.72]} scale={[0.13, 0.11, 0.13]}>
          <sphereGeometry args={[1, 7, 5]} />
        </mesh>
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh material={mats('#e6dcc0')} position={[s * 0.16, -0.18, 0.46]} rotation={[0, 0, -s * 1.0]}>
              <coneGeometry args={[0.04, 0.34, 5]} />
            </mesh>
            <mesh material={hide} position={[s * 0.2, -0.24, 0.42]} rotation={[0, 0, s * 0.5]} scale={[1, 0.4, 1.4]}>
              <sphereGeometry args={[0.07, 6, 5]} />
            </mesh>
          </group>
        ))}
      </group>
      <group ref={tail} position={[0, 1.0, -0.8]}>
        <mesh material={hide} position={[0, -0.3, -0.05]} rotation={[0.15, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.02, 0.62, 5]} />
        </mesh>
        <mesh material={dark} position={[0, -0.66, -0.07]}>
          <sphereGeometry args={[0.06, 6, 5]} />
        </mesh>
      </group>
      <Leg m={hide} x={-0.22} z={0.46} len={0.62} r={0.07} />
      <Leg m={hide} x={0.22} z={0.46} len={0.62} r={0.07} />
      <Leg m={hide} x={-0.22} z={-0.46} len={0.62} r={0.07} />
      <Leg m={hide} x={0.22} z={-0.46} len={0.62} r={0.07} />
    </group>
  );
}

export function Animals({ scene }: { scene: PoemScene }) {
  const cache = useMemo(() => new Map<string, THREE.ShaderMaterial>(), []);
  const mats = useMemo<Mats>(
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

  if (!scene.animals?.length) return null;

  const body = (a: Animal, i: number) => {
    switch (a.kind) {
      case 'hen':
        return <Hen mats={mats} seed={i} />;
      case 'dog':
        return <Dog mats={mats} seed={i} />;
      case 'frog':
        return <Frog mats={mats} seed={i} />;
      case 'egret':
        return <Egret mats={mats} seed={i} />;
      case 'ox':
        return <Ox mats={mats} seed={i} />;
    }
  };

  return (
    <>
      {scene.animals.map((a, i) => (
        <group
          key={i}
          position={[a.x, terrainHeight(a.x, a.z, scene.terrain), a.z]}
          rotation={[0, a.rot, 0]}
          scale={a.scale ?? 1}
        >
          {body(a, i + 1)}
        </group>
      ))}
    </>
  );
}
