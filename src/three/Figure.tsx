'use client';

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
  torch = false,
}: {
  world: World;
  scale?: number;
  shadow?: boolean;
  /** 拥火以入 — the traveller holds a flame. */
  torch?: boolean;
}) {
  return (
    <group scale={scale}>
      {torch && (
        <group>
          {/* The brand: a short stick held out at the side, and the flame on it. */}
          <mesh material={world.mat.wood} position={[0.36, 1.2, 0.26]} rotation={[0.25, 0, -0.14]}>
            <cylinderGeometry args={[0.028, 0.034, 0.7, 5]} />
          </mesh>
          {world.geo.torchGlow && <points geometry={world.geo.torchGlow} material={world.mat.glow} renderOrder={9} frustumCulled={false} />}
        </group>
      )}
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

