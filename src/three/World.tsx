'use client';

import * as THREE from 'three';
import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import type { PoemScene } from '@/lib/types';
import type { World } from './useWorld';

/**
 * The figure in the straw hat and rain cape: you, and the fisherman in the boat.
 *
 * Read from behind at walking distance, almost all of the recognition comes from
 * the silhouette — a wide conical hat over a flared cape — so the hat overhangs
 * the shoulders and everything under it stays as bare ink.
 */
export function Figure({
  world,
  scale = 1,
  shadow = false,
}: {
  world: World;
  scale?: number;
  shadow?: boolean;
}) {
  return (
    <group scale={scale}>
      {shadow && (
        <mesh material={world.mat.shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <planeGeometry args={[1.25, 1.25]} />
        </mesh>
      )}
      <mesh geometry={world.geo.cape} material={world.mat.straw} position={[0, 1.44, 0]} />
      <mesh geometry={world.geo.hat} material={world.mat.hat} position={[0, 1.56, 0]} />
      {/* Head and legs, kept to the barest ink. */}
      <mesh material={world.mat.ink} position={[0, 1.38, 0]}>
        <sphereGeometry args={[0.13, 12, 10]} />
      </mesh>
      <mesh material={world.mat.ink} position={[-0.11, 0.33, 0]}>
        <cylinderGeometry args={[0.065, 0.045, 0.68, 6]} />
      </mesh>
      <mesh material={world.mat.ink} position={[0.11, 0.33, 0]}>
        <cylinderGeometry args={[0.065, 0.045, 0.68, 6]} />
      </mesh>
    </group>
  );
}

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

function Boat({ scene, world }: { scene: PoemScene; world: World }) {
  const b = scene.boat;
  if (!b || !world.geo.boatHull) return null;
  const y = world.heights.waterLevel;

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

      {geo.pond && <mesh geometry={geo.pond} material={mat.water} />}
      {geo.stream && <mesh geometry={geo.stream} material={mat.water} />}

      {geo.rocks && <mesh geometry={geo.rocks} material={mat.rock} />}
      {geo.grass && <mesh geometry={geo.grass} material={mat.grass} />}

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
      <Boat scene={scene} world={world} />

      <mesh geometry={geo.mist} material={mat.mist} renderOrder={5} />
      {geo.herd && mat.herd && <mesh geometry={geo.herd} material={mat.herd} />}
      <FollowCamera>
        <points geometry={geo.fall} material={mat.fall} renderOrder={6} frustumCulled={false} />
        <points geometry={geo.wsnow} material={mat.wsnow} renderOrder={6} frustumCulled={false} />
        <points geometry={geo.rain} material={mat.rain} renderOrder={7} frustumCulled={false} />
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
