'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { terrainHeight } from '@/lib/terrain';
import type { PoemScene, Role } from '@/lib/types';
import { makeInkMaterial } from './materials';
import { Figure } from './Figure';
import type { World } from './useWorld';

/**
 * Who is in the picture.
 *
 * A person is built the way a figure painter builds one: a flared robe, a sash,
 * a chest, sleeves that end in hands, a head and whatever sits on it. There are no
 * model files — every part is a primitive — but each role has its own posture and
 * its own small thing to hold (a wash-cloth, a scroll, a hoe, a staff, a torch),
 * because at the distance the poet's eye stands from anyone, what they are *doing*
 * is what tells you who they are.
 */

type Pose = 'stand' | 'carry' | 'wash' | 'read' | 'staff' | 'hoe' | 'play' | 'torch' | 'poet';

type Costume = {
  robe: string;
  trim: string;
  hat?: 'cap' | 'straw' | 'fur' | 'bun' | 'tufts' | 'white';
  hatColor?: string;
  pose: Pose;
  height: number;
  /** A long white beard. */
  beard?: boolean;
  /** How far the back is bent. */
  stoop?: number;
};

const COSTUME: Record<Exclude<Role, 'fisher' | 'monkey'>, Costume> = {
  washer: { robe: '#9ab7cc', trim: '#e8e2d0', hat: 'bun', hatColor: '#2b2622', pose: 'carry', height: 1 },
  scholar: { robe: '#d8d2c0', trim: '#7a6a48', hat: 'cap', hatColor: '#26221e', pose: 'read', height: 1.02 },
  poet: { robe: '#3d3a34', trim: '#8a7a5a', hat: 'cap', hatColor: '#1e1b18', pose: 'poet', height: 1.02 },
  elder: { robe: '#8a6a4a', trim: '#c8b070', hat: 'white', hatColor: '#ece9e2', pose: 'staff', height: 0.94, beard: true, stoop: 0.16 },
  child: { robe: '#c85a48', trim: '#e8c860', hat: 'tufts', hatColor: '#2b2622', pose: 'play', height: 0.6 },
  farmer: { robe: '#7a6a48', trim: '#4c3e32', hat: 'straw', hatColor: '#c8b070', pose: 'hoe', height: 1 },
  herdsman: { robe: '#4c3e32', trim: '#c8a050', hat: 'fur', hatColor: '#2e2620', pose: 'staff', height: 1.04 },
  companion: { robe: '#6a6258', trim: '#3a3226', hat: 'cap', hatColor: '#26221e', pose: 'torch', height: 1 },
};

const SKIN = '#d6b48e';
const DARK = '#2b2622';

type Mats = (color: string) => THREE.ShaderMaterial;

/** One arm: a sleeve that widens to the cuff, and a hand. Hangs along -y. */
function Arm({
  side,
  mats,
  robe,
  trim,
  h,
  armRef,
  rot,
  children,
}: {
  side: 1 | -1;
  mats: Mats;
  robe: string;
  trim: string;
  h: number;
  armRef: React.Ref<THREE.Group>;
  rot: [number, number, number];
  children?: React.ReactNode;
}) {
  const len = 0.5 * h;
  return (
    <group ref={armRef} position={[side * 0.19 * h, 0.4 * h, 0]} rotation={rot}>
      <mesh material={mats(robe)} position={[0, -len * 0.5, 0]}>
        <cylinderGeometry args={[0.05 * h, 0.085 * h, len * 0.86, 7]} />
      </mesh>
      <mesh material={mats(trim)} position={[0, -len * 0.9, 0]}>
        <cylinderGeometry args={[0.086 * h, 0.09 * h, 0.035 * h, 7]} />
      </mesh>
      <group position={[0, -len, 0]}>
        <mesh material={mats(SKIN)} position={[0, -0.035 * h, 0]}>
          <sphereGeometry args={[0.045 * h, 8, 6]} />
        </mesh>
        {children}
      </group>
    </group>
  );
}

function Person({ role, sit, torch, mats, seed }: { role: keyof typeof COSTUME; sit?: boolean; torch?: boolean; mats: Mats; seed: number }) {
  const c = COSTUME[role];
  const h = c.height;
  const pose: Pose = torch ? 'torch' : c.pose;

  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);

  const stoop = (c.stoop ?? 0) + (pose === 'wash' ? 0.62 : 0) + (sit ? 0.06 : 0);
  const waistY = sit ? 0.22 + 0.4 * h : 1.0 * h;
  const skirtBottom = sit ? 0.22 : 0.14 * h;
  const skirtH = waistY - skirtBottom;

  // Arm positions per pose: [rotation.x, rotation.z] for the left and the right.
  const armPose = (
    {
      stand: { l: [0, 0.12], r: [0, -0.12] },
      carry: { l: [-0.55, 0.62], r: [0.12, -0.12] },
      wash: { l: [-1.15, 0.22], r: [-1.15, -0.22] },
      read: { l: [-0.95, 0.12], r: [-0.95, -0.12] },
      staff: { l: [0.05, 0.14], r: [-0.55, -0.1] },
      hoe: { l: [-0.5, 0.15], r: [0.45, -0.05] },
      play: { l: [0.1, 0.95], r: [0.1, -0.95] },
      torch: { l: [0.05, 0.14], r: [-1.5, -0.12] },
      poet: { l: [0.38, 0.06], r: [0.38, -0.06] },
    } as const
  )[pose];

  // The little movements: breath, a settling of weight, the wash-cloth working.
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + seed * 7;
    if (root.current) root.current.rotation.z = Math.sin(t * 0.7) * 0.012;
    if (torso.current) torso.current.rotation.x = stoop + Math.sin(t * 1.1) * 0.01;
    if (pose === 'wash') {
      const s = Math.sin(t * 3.4) * 0.2;
      if (armL.current) armL.current.rotation.x = armPose.l[0] + s;
      if (armR.current) armR.current.rotation.x = armPose.r[0] - s;
    } else if (pose === 'play') {
      const s = Math.sin(t * 2.2) * 0.25;
      if (armL.current) armL.current.rotation.z = armPose.l[1] + s;
      if (armR.current) armR.current.rotation.z = armPose.r[1] - s;
    } else if (pose === 'stand' || pose === 'poet' || pose === 'carry') {
      const s = Math.sin(t * 0.9) * 0.03;
      if (armL.current) armL.current.rotation.x = armPose.l[0] + s;
      if (armR.current) armR.current.rotation.x = armPose.r[0] - s;
    }
  });

  return (
    <group ref={root}>
      {sit && (
        <mesh material={mats('#8a8478')} position={[0, 0.11, 0]}>
          <cylinderGeometry args={[0.36, 0.42, 0.22, 7]} />
        </mesh>
      )}

      {/* Legs and feet, mostly under the robe. */}
      {!sit &&
        [-1, 1].map((s) => (
          <group key={s}>
            <mesh material={mats(DARK)} position={[s * 0.09 * h, 0.3 * h, 0]}>
              <cylinderGeometry args={[0.055 * h, 0.045 * h, 0.6 * h, 6]} />
            </mesh>
            <mesh material={mats(DARK)} position={[s * 0.09 * h, 0.035 * h, 0.05 * h]}>
              <boxGeometry args={[0.09 * h, 0.06 * h, 0.2 * h]} />
            </mesh>
          </group>
        ))}

      {/* The robe: a flared skirt, then everything above the waist leans as one. */}
      <mesh material={mats(c.robe)} position={[0, skirtBottom + skirtH / 2, 0]}>
        <cylinderGeometry args={[0.15 * h, (sit ? 0.34 : 0.33) * h, skirtH, 12]} />
      </mesh>
      <mesh material={mats(c.trim)} position={[0, skirtBottom + 0.015 * h, 0]}>
        <cylinderGeometry args={[(sit ? 0.34 : 0.33) * h, (sit ? 0.345 : 0.335) * h, 0.03 * h, 12]} />
      </mesh>

      <group ref={torso} position={[0, waistY, 0]}>
        <mesh material={mats(c.robe)} position={[0, 0.21 * h, 0]}>
          <cylinderGeometry args={[0.17 * h, 0.15 * h, 0.42 * h, 10]} />
        </mesh>
        <mesh material={mats(c.trim)} position={[0, 0.02 * h, 0]}>
          <cylinderGeometry args={[0.156 * h, 0.156 * h, 0.075 * h, 10]} />
        </mesh>
        {/* A crossed collar. */}
        <mesh material={mats(c.trim)} position={[0, 0.37 * h, 0.09 * h]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[0.13 * h, 0.09 * h, 0.02 * h]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} material={mats(c.robe)} position={[s * 0.17 * h, 0.39 * h, 0]}>
            <sphereGeometry args={[0.078 * h, 8, 6]} />
          </mesh>
        ))}
        <mesh material={mats(SKIN)} position={[0, 0.46 * h, 0]}>
          <cylinderGeometry args={[0.045 * h, 0.05 * h, 0.09 * h, 6]} />
        </mesh>

        {/* The head. */}
        <group position={[0, 0.6 * h, 0]}>
          <mesh material={mats(SKIN)} scale={[1, 1.1, 1]}>
            <sphereGeometry args={[0.108 * h, 12, 10]} />
          </mesh>
          {/* Hair over the crown and down the back. */}
          <mesh material={mats(c.hat === 'white' ? '#e6e3dc' : DARK)} position={[0, 0.012 * h, -0.012 * h]} rotation={[-0.35, 0, 0]}>
            <sphereGeometry args={[0.114 * h, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
          </mesh>
          {/* Two eyes, as ink dots. */}
          {[-1, 1].map((s) => (
            <mesh key={s} material={mats(DARK)} position={[s * 0.036 * h, 0.012 * h, 0.098 * h]}>
              <sphereGeometry args={[0.011 * h, 5, 4]} />
            </mesh>
          ))}
          {c.beard && (
            <mesh material={mats('#ece9e2')} position={[0, -0.13 * h, 0.05 * h]} rotation={[0.18, 0, 0]}>
              <coneGeometry args={[0.07 * h, 0.22 * h, 8]} />
            </mesh>
          )}

          {c.hat === 'cap' && (
            <>
              <mesh material={mats(c.hatColor!)} position={[0, 0.11 * h, -0.005 * h]}>
                <boxGeometry args={[0.17 * h, 0.1 * h, 0.17 * h]} />
              </mesh>
              {/* The two trailing bands of a scholar's cap. */}
              <mesh material={mats(c.hatColor!)} position={[0, 0.02 * h, -0.13 * h]} rotation={[0.25, 0, 0]}>
                <boxGeometry args={[0.05 * h, 0.16 * h, 0.012 * h]} />
              </mesh>
            </>
          )}
          {c.hat === 'bun' && (
            <>
              <mesh material={mats(c.hatColor!)} position={[0, 0.115 * h, -0.05 * h]}>
                <sphereGeometry args={[0.062 * h, 8, 6]} />
              </mesh>
              <mesh material={mats('#c85a48')} position={[0.03 * h, 0.125 * h, -0.03 * h]}>
                <sphereGeometry args={[0.02 * h, 6, 5]} />
              </mesh>
            </>
          )}
          {c.hat === 'straw' && (
            <mesh material={mats(c.hatColor!)} position={[0, 0.115 * h, 0]}>
              <coneGeometry args={[0.36 * h, 0.15 * h, 14]} />
            </mesh>
          )}
          {c.hat === 'fur' && (
            <mesh material={mats(c.hatColor!)} position={[0, 0.15 * h, 0]}>
              <coneGeometry args={[0.14 * h, 0.27 * h, 8]} />
            </mesh>
          )}
          {c.hat === 'white' && (
            <mesh material={mats(c.hatColor!)} position={[0, 0.045 * h, 0]}>
              <sphereGeometry args={[0.12 * h, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            </mesh>
          )}
          {c.hat === 'tufts' &&
            [-1, 1].map((s) => (
              <mesh key={s} material={mats(c.hatColor!)} position={[s * 0.1 * h, 0.09 * h, 0]}>
                <sphereGeometry args={[0.05 * h, 7, 6]} />
              </mesh>
            ))}
        </group>

        {/* Arms, and what they hold. */}
        <Arm side={-1} mats={mats} robe={c.robe} trim={c.trim} h={h} armRef={armL} rot={[armPose.l[0], 0, armPose.l[1]]}>
          {pose === 'carry' && (
            // 浣女 — the basket of washing, held against the hip.
            <group position={[-0.1, 0.02, 0.1]}>
              <mesh material={mats('#a98a5a')} position={[0, -0.02, 0]}>
                <cylinderGeometry args={[0.2, 0.15, 0.24, 10]} />
              </mesh>
              <mesh material={mats('#e6e0d0')} position={[0, 0.14, 0]} scale={[1.2, 0.7, 1.2]}>
                <sphereGeometry args={[0.15, 8, 6]} />
              </mesh>
            </group>
          )}
          {pose === 'wash' && (
            <mesh material={mats('#f0ece0')} position={[0.02, -0.03, 0.06]} scale={[1.4, 0.7, 1.2]}>
              <sphereGeometry args={[0.08 * h, 8, 6]} />
            </mesh>
          )}
          {pose === 'read' && (
            <mesh material={mats('#eee6cc')} rotation={[0, 0, Math.PI / 2]} position={[-0.1 * h, -0.02, 0]}>
              <cylinderGeometry args={[0.028 * h, 0.028 * h, 0.34 * h, 8]} />
            </mesh>
          )}
          {pose === 'hoe' && (
            <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
              <mesh material={mats('#6a5238')} position={[0, 0.2 * h, 0.5 * h]} rotation={[1.2, 0, 0]}>
                <cylinderGeometry args={[0.022 * h, 0.026 * h, 1.5 * h, 5]} />
              </mesh>
              <mesh material={mats('#5a5850')} position={[0, 0.66 * h, 1.15 * h]} rotation={[0.2, 0, 0]}>
                <boxGeometry args={[0.16 * h, 0.03 * h, 0.09 * h]} />
              </mesh>
            </group>
          )}
        </Arm>
        <Arm side={1} mats={mats} robe={c.robe} trim={c.trim} h={h} armRef={armR} rot={[armPose.r[0], 0, armPose.r[1]]}>
          {pose === 'staff' && (
            <mesh material={mats('#6a5238')} position={[0, 0.3 * h, 0.02]}>
              <cylinderGeometry args={[0.022 * h, 0.03 * h, 1.6 * h, 5]} />
            </mesh>
          )}
          {pose === 'torch' && (
            // 拥火 — the stick is here; the flame itself is a glow point added in useWorld.
            <mesh material={mats('#4a3a28')} position={[0.02, 0.12, 0.04]} rotation={[0.05, 0, -0.1]}>
              <cylinderGeometry args={[0.026, 0.034, 0.62, 5]} />
            </mesh>
          )}
          {pose === 'wash' && (
            <mesh material={mats('#f0ece0')} position={[-0.02, -0.03, 0.06]} scale={[1.4, 0.7, 1.2]}>
              <sphereGeometry args={[0.07 * h, 8, 6]} />
            </mesh>
          )}
        </Arm>

      </group>

    </group>
  );
}

/** 猿 — a brown ape on a rock: hunched, long-armed, a pale face, a tail hanging. */
function Monkey({ mats, seed }: { mats: Mats; seed: number }) {
  const head = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + seed * 5;
    if (head.current) head.current.rotation.y = Math.sin(t * 0.6) * 0.5;
    if (tail.current) tail.current.rotation.x = 0.3 + Math.sin(t * 1.3) * 0.18;
  });
  const fur = '#5c4432';
  return (
    <group>
      <mesh material={mats('#7a766a')} position={[0, 0.3, 0]}>
        <dodecahedronGeometry args={[0.7, 0]} />
      </mesh>
      {/* Haunches, back, chest. */}
      <mesh material={mats(fur)} position={[0, 0.85, -0.08]} scale={[1, 0.9, 0.9]}>
        <sphereGeometry args={[0.34, 9, 7]} />
      </mesh>
      <mesh material={mats(fur)} position={[0, 1.18, 0.06]} rotation={[0.25, 0, 0]} scale={[1, 1.2, 0.85]}>
        <sphereGeometry args={[0.27, 9, 7]} />
      </mesh>
      {/* Long arms hanging to the rock. */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.28, 1.28, 0.06]} rotation={[-0.25, 0, s * 0.15]}>
          <mesh material={mats(fur)} position={[0, -0.32, 0]}>
            <cylinderGeometry args={[0.06, 0.05, 0.64, 6]} />
          </mesh>
          <mesh material={mats('#3e2e22')} position={[0, -0.66, 0]}>
            <sphereGeometry args={[0.065, 6, 5]} />
          </mesh>
        </group>
      ))}
      <group ref={head} position={[0, 1.55, 0.14]}>
        <mesh material={mats('#6a5038')}>
          <sphereGeometry args={[0.17, 9, 7]} />
        </mesh>
        <mesh material={mats('#d9bfa0')} position={[0, -0.02, 0.1]} scale={[1, 0.9, 0.7]}>
          <sphereGeometry args={[0.11, 8, 6]} />
        </mesh>
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh material={mats('#2a2018')} position={[s * 0.045, 0.02, 0.15]}>
              <sphereGeometry args={[0.014, 5, 4]} />
            </mesh>
            <mesh material={mats('#6a5038')} position={[s * 0.17, 0.03, -0.01]}>
              <sphereGeometry args={[0.05, 6, 5]} />
            </mesh>
          </group>
        ))}
      </group>
      <group ref={tail} position={[0, 0.8, -0.32]}>
        <mesh material={mats(fur)} position={[0, -0.28, -0.05]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.028, 0.72, 5]} />
        </mesh>
      </group>
    </group>
  );
}

export function People({ scene, world }: { scene: PoemScene; world: World }) {
  // One material per colour used, shared between every figure that wears it.
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
              <Monkey mats={mats} seed={i} />
            ) : (
              <Person role={p.role} sit={p.sit} torch={p.torch} mats={mats} seed={i + 1} />
            )}
          </group>
        );
      })}
    </>
  );
}
