'use client';

import * as THREE from 'three';
import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { terrainHeight } from '@/lib/terrain';
import type { PoemScene } from '@/lib/types';
import type { World } from './useWorld';
import { Figure } from './Figure';
import { People } from './People';
import { OVERLAY_LAYER } from './InkPass';
import { Animals } from './Animals';

export { Figure };

function Pavilion({ scene, world }: { scene: PoemScene; world: World }) {
  const p = scene.pavilion;
  if (!p || !world.geo.pavilionRoof) return null;
  const y = world.heights.pavilion;
  const posts: [number, number][] = [
    [-2.2, -2.2],
    [2.2, -2.2],
    [2.2, 2.2],
    [-2.2, 2.2],
  ];

  return (
    <group position={[p.x, y, p.z]} rotation={[0, p.rot, 0]}>
      {/* Stone platform, raised a step above the grass. */}
      <mesh material={world.mat.rock} position={[0, 0.16, 0]}>
        <boxGeometry args={[6.4, 0.42, 6.4]} />
      </mesh>
      {posts.map(([px, pz], i) => (
        <mesh key={i} material={world.mat.wood} position={[px, 1.6, pz]}>
          <cylinderGeometry args={[0.13, 0.15, 2.9, 7]} />
        </mesh>
      ))}
      {/* Lintels tying the posts together under the eaves. */}
      <mesh material={world.mat.wood} position={[0, 2.9, -2.2]}>
        <boxGeometry args={[4.6, 0.17, 0.13]} />
      </mesh>
      <mesh material={world.mat.wood} position={[0, 2.9, 2.2]}>
        <boxGeometry args={[4.6, 0.17, 0.13]} />
      </mesh>
      <mesh material={world.mat.wood} position={[-2.2, 2.9, 0]}>
        <boxGeometry args={[0.13, 0.17, 4.6]} />
      </mesh>
      <mesh material={world.mat.wood} position={[2.2, 2.9, 0]}>
        <boxGeometry args={[0.13, 0.17, 4.6]} />
      </mesh>
      <mesh geometry={world.geo.pavilionRoof} material={world.mat.thatch} />
      {/* 宝顶 — the finial at the ridge. */}
      <mesh material={world.mat.wood} position={[0, 5.1, 0]}>
        <sphereGeometry args={[0.26, 10, 8]} />
      </mesh>
    </group>
  );
}

function Huts({ scene, world }: { scene: PoemScene; world: World }) {
  if (!scene.huts?.length) return null;
  return (
    <>
      {scene.huts.map((h, i) => {
        const k = h.scale ?? 1;
        const y = terrainHeight(h.x, h.z, scene.terrain);
        return (
          <group key={i} position={[h.x, y, h.z]} rotation={[0, h.rot, 0]} scale={k}>
            {/* Rammed-earth walls, and a hipped roof of thatch with a wide eave. */}
            <mesh material={world.mat.plaster} position={[0, 1.05, 0]}>
              <boxGeometry args={[3.6, 2.1, 2.9]} />
            </mesh>
            <mesh material={world.mat.wood} position={[0, 0.95, 1.46]}>
              <boxGeometry args={[0.8, 1.5, 0.08]} />
            </mesh>
            <mesh material={world.mat.thatch} position={[0, 2.85, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.9, 1, 1.55]}>
              <coneGeometry args={[1.55, 1.7, 4]} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

/** A plank footbridge with a low rail either side, laid across a brook. */
function Bridges({ scene, world }: { scene: PoemScene; world: World }) {
  if (!scene.bridges?.length) return null;
  return (
    <>
      {scene.bridges.map((br, i) => {
        const len = br.length ?? 9;
        const y = terrainHeight(br.x, br.z, scene.terrain);
        // Stand on the higher of the two banks.
        const bank = Math.max(
          terrainHeight(br.x + Math.cos(br.rot) * len * 0.5, br.z - Math.sin(br.rot) * len * 0.5, scene.terrain),
          terrainHeight(br.x - Math.cos(br.rot) * len * 0.5, br.z + Math.sin(br.rot) * len * 0.5, scene.terrain),
          y
        );
        return (
          <group key={i} position={[br.x, bank + 0.42, br.z]} rotation={[0, br.rot, 0]}>
            <mesh material={world.mat.wood}>
              <boxGeometry args={[len, 0.18, 2.3]} />
            </mesh>
            {[-1, 1].map((side) => (
              <mesh key={side} material={world.mat.wood} position={[0, 0.62, side * 1.05]}>
                <boxGeometry args={[len, 0.1, 0.1]} />
              </mesh>
            ))}
            {[-0.45, -0.15, 0.15, 0.45].flatMap((f) =>
              [-1, 1].map((side) => (
                <mesh key={`${f}${side}`} material={world.mat.wood} position={[len * f, 0.32, side * 1.05]}>
                  <boxGeometry args={[0.12, 0.62, 0.12]} />
                </mesh>
              ))
            )}
          </group>
        );
      })}
    </>
  );
}

/** A stone table with a wine jar and a cup on it. */
function Props({ scene, world }: { scene: PoemScene; world: World }) {
  if (!scene.props?.length) return null;
  return (
    <>
      {scene.props.map((pr, i) => {
        const y = terrainHeight(pr.x, pr.z, scene.terrain);
        return (
          <group key={i} position={[pr.x, y, pr.z]} rotation={[0, pr.rot, 0]}>
            <mesh material={world.mat.rock} position={[0, 0.42, 0]}>
              <boxGeometry args={[1.5, 0.16, 1.1]} />
            </mesh>
            <mesh material={world.mat.rock} position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.32, 0.4, 0.4, 7]} />
            </mesh>
            {/* the jar */}
            <mesh material={world.mat.wood} position={[-0.36, 0.72, 0.04]}>
              <cylinderGeometry args={[0.16, 0.22, 0.42, 9]} />
            </mesh>
            {/* the cup, and it is nearly empty */}
            <mesh material={world.mat.ink} position={[0.28, 0.55, -0.06]}>
              <cylinderGeometry args={[0.09, 0.06, 0.09, 8]} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

/** 碑 — standing slabs, and the ones that have come down across the road. */
function Steles({ scene, world }: { scene: PoemScene; world: World }) {
  if (!scene.steles?.length) return null;
  return (
    <>
      {scene.steles.map((st, i) => {
        const y = terrainHeight(st.x, st.z, scene.terrain);
        return (
          <mesh
            key={i}
            material={world.mat.rock}
            position={[st.x, y + (st.fallen ? 0.28 : 1.2), st.z]}
            rotation={st.fallen ? [-Math.PI / 2 + 0.12, 0, st.rot] : [0.04, st.rot, 0.03]}
          >
            <boxGeometry args={[0.7, 2.4, 0.34]} />
          </mesh>
        );
      })}
    </>
  );
}

function Boats({ scene, world }: { scene: PoemScene; world: World }) {
  const all = [scene.boat, ...(scene.boats ?? [])].filter(Boolean) as NonNullable<PoemScene['boat']>[];
  return (
    <>
      {all.map((b, i) => (
        <Boat key={i} b={b} scene={scene} world={world} />
      ))}
    </>
  );
}

function Boat({ b, scene, world }: { b: NonNullable<PoemScene['boat']>; scene: PoemScene; world: World }) {
  if (!world.geo.boatHull) return null;
  // On a pond it floats at the pond's level, on a river at the river's, and a
  // boat that has been left on the bank — 便舍船 — sits on the ground.
  const y =
    b.on === 'river'
      ? world.heights.riverLevel
      : b.on === 'ground' || b.on === 'stream'
        ? terrainHeight(b.x, b.z, scene.terrain) + 0.5
        : world.heights.waterLevel;

  return (
    <group position={[b.x, y - 0.18, b.z]} rotation={[0, b.rot, 0]}>
      <mesh geometry={world.geo.boatHull} material={world.mat.wood} />
      {world.geo.boatCanopy && (
        <mesh geometry={world.geo.boatCanopy} material={world.mat.thatch} position={[0, 0.36, 0.5]} />
      )}
      {/* The fisherman, seated at the stern under his hat. */}
      <group position={[0, 0.34, -1.5]} scale={0.78}>
        <Figure world={world} scale={0.82} />
      </group>
      {/* His line, a single stroke into the water. */}
      <mesh material={world.mat.ink} position={[0.55, 0.5, -2.2]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.018, 0.018, 2.4, 4]} />
      </mesh>
    </group>
  );
}

/**
 * Weather has to be where the viewer is. Precipitation used to sit at the
 * origin with a fixed radius, so walking to the edge of the valley walked out
 * from under the snow; now the whole cloud of particles is carried along with
 * the camera, and only its horizontal position — it still falls from the same
 * height whatever the ground is doing.
 */
/** Falling things go on the overlay layer, drawn after the ink pass. */
const onOverlay = (o: THREE.Object3D | null) => {
  o?.layers.set(OVERLAY_LAYER);
};

function FollowCamera({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ camera }) => {
    if (ref.current) ref.current.position.set(camera.position.x, 0, camera.position.z);
  });
  return <group ref={ref}>{children}</group>;
}

/** Everything in the poem that does not move on its own. */
export function WorldView({
  scene,
  world,
  onGroundDown,
}: {
  scene: PoemScene;
  world: World;
  onGroundDown?: (point: THREE.Vector3) => void;
}) {
  const { geo, mat } = world;

  return (
    <group>
      <mesh geometry={geo.sky} material={mat.sky} renderOrder={-10} />

      <mesh geometry={geo.mountainFar} material={mat.mountainFar} />
      <mesh geometry={geo.mountainMid} material={mat.mountainMid} />
      <mesh geometry={geo.mountainNear} material={mat.mountainNear} />

      <mesh
        geometry={geo.terrain}
        material={mat.terrain}
        name="terrain"
        onPointerDown={
          onGroundDown
            ? (e) => {
                e.stopPropagation();
                onGroundDown(e.point);
              }
            : undefined
        }
      />

      {geo.ponds.map((g, i) => (
        <mesh key={i} geometry={g} material={mat.water} />
      ))}
      {geo.stream && <mesh geometry={geo.stream} material={mat.water} />}
      {geo.rivers.map((g, i) => (
        <mesh key={i} geometry={g} material={mat.water} />
      ))}

      {geo.rocks && <mesh geometry={geo.rocks} material={mat.rock} />}
      {/* Grass is wash, not line: drawn last of the solids and left out of the depth
          the ink pass outlines from, so a field is not a thicket of contours. */}
      {geo.grass && <mesh geometry={geo.grass} material={mat.grass} renderOrder={2} />}

      {geo.pines.trunk && <mesh geometry={geo.pines.trunk} material={mat.bark} />}
      {geo.pines.leaf && <mesh geometry={geo.pines.leaf} material={mat.needle} />}

      {geo.bamboo.trunk && <mesh geometry={geo.bamboo.trunk} material={mat.bamboo} />}
      {geo.bamboo.leaf && <mesh geometry={geo.bamboo.leaf} material={mat.bambooLeaf} />}

      {geo.broadleaf.trunk && <mesh geometry={geo.broadleaf.trunk} material={mat.bark} />}
      {geo.broadleaf.leaf && <mesh geometry={geo.broadleaf.leaf} material={mat.dab} />}

      {geo.reeds && <mesh geometry={geo.reeds} material={mat.reed} />}
      {geo.lotus.pads && <mesh geometry={geo.lotus.pads} material={mat.pad} />}
      {geo.lotus.flowers && <mesh geometry={geo.lotus.flowers} material={mat.pad} />}

      <Pavilion scene={scene} world={world} />
      <Huts scene={scene} world={world} />
      <Bridges scene={scene} world={world} />
      <Steles scene={scene} world={world} />
      <Props scene={scene} world={world} />
      <People scene={scene} world={world} />
      <Animals scene={scene} />
      {geo.flocks && <mesh geometry={geo.flocks} material={mat.bird} frustumCulled={false} />}
      {geo.glows && <points geometry={geo.glows} material={mat.glow} renderOrder={9} frustumCulled={false} />}
      <Boats scene={scene} world={world} />

      <mesh geometry={geo.mist} material={mat.mist} renderOrder={5} />
      {geo.herd && mat.herd && <mesh geometry={geo.herd} material={mat.herd} />}
      <FollowCamera>
        <points geometry={geo.fall} material={mat.fall} renderOrder={6} frustumCulled={false} ref={onOverlay} />
        <points geometry={geo.wsnow} material={mat.wsnow} renderOrder={6} frustumCulled={false} ref={onOverlay} />
        <points geometry={geo.rain} material={mat.rain} renderOrder={7} frustumCulled={false} ref={onOverlay} />
      </FollowCamera>
    </group>
  );
}

/** Keeps the scene's shared uniforms fed. Exported for the canvas to mount once. */
export function disposeObject(obj: THREE.Object3D) {
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
  });
}
