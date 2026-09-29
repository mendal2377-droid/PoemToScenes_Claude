'use client';

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { terrainHeight } from '@/lib/terrain';
import { useScene, type PlacedItem } from '@/lib/store';
import type { PoemScene } from '@/lib/types';
import { buildCloud, buildOneBamboo, buildOneMaple, buildOnePine, buildReeds, buildRocks } from './flora';
import { makeFoliageMaterial, makeBarkMaterial, makeRockMaterial } from './materials';

/** Turn a uid into a stable number, so the same tree regrows the same way. */
function uidSeed(uid: string): number {
  let h = 2166136261;
  for (let i = 0; i < uid.length; i++) {
    h ^= uid.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

/**
 * A prop the visitor added. Geometry is rebuilt when the stroke count or length
 * changes — a single plant is a few dozen quads, so that is cheap enough to do
 * live while a slider is dragged. Curl and ink tone are uniforms and cost nothing.
 */
function Placed({ item, scene }: { item: PlacedItem; scene: PoemScene }) {
  const select = useScene((s) => s.select);
  const selected = useScene((s) => s.selected) === item.uid;
  const p = scene.palette;
  const y = useMemo(() => terrainHeight(item.x, item.z, scene.terrain), [item.x, item.z, scene.terrain]);

  const seed = useMemo(() => uidSeed(item.uid), [item.uid]);
  const opts = { density: item.strokeDensity, length: item.strokeLength };

  const built = useMemo(() => {
    const colors = { dark: p.foliageDark, light: p.foliageLight };
    switch (item.kind) {
      case 'pine':
        return buildOnePine(0, 0, 0, item.scale, seed, colors, opts);
      case 'bamboo':
        return buildOneBamboo(0, 0, 0, item.scale, seed, colors, opts);
      case 'maple':
        return buildOneMaple(0, 0, 0, item.scale, seed, p.trunk, p.accent, opts);
      case 'rock':
        return {
          trunk: null,
          leaf: null,
          rock: buildRocks([{ x: 0, y: 0, z: 0, s: 1.6 * item.scale, seed }]),
        };
      case 'reed':
        return {
          trunk: null,
          leaf: buildReeds(
            Math.max(1, Math.round(5 * item.strokeDensity)),
            { ...scene.terrain, basins: [], channels: [], flats: [] },
            [{ x: 0, z: 0, r: 0.9 * item.scale }],
            colors,
            seed
          ),
        };
      case 'cloud':
        return { trunk: null, leaf: buildCloud(0, 0, 0, item.scale * 1.3, seed, p.mist) };
      default:
        return { trunk: null, leaf: null };
    }
    // `opts` is a fresh object each render; its two fields are the real inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.kind, item.scale, item.strokeDensity, item.strokeLength, seed, p, scene.terrain]);

  const mats = useMemo(() => {
    const kind = item.kind === 'bamboo' || item.kind === 'reed' ? 'leaf' : item.kind === 'pine' ? 'needle' : 'dab';
    return {
      leaf: makeFoliageMaterial(p, kind, item.kind === 'cloud' ? 0.2 : 1),
      bark: makeBarkMaterial(p),
      rock: makeRockMaterial(p),
    };
  }, [item.kind, p]);

  // Curl and tone ride straight into the shader.
  useEffect(() => {
    mats.leaf.uniforms.uStrokeCurl.value = item.strokeCurl;
    mats.leaf.uniforms.uInkTone.value = item.inkTone;
  }, [mats, item.strokeCurl, item.inkTone]);

  useEffect(() => {
    return () => {
      Object.values(mats).forEach((m) => m.dispose());
    };
  }, [mats]);

  useEffect(() => {
    return () => {
      const b = built as Record<string, THREE.BufferGeometry | null>;
      Object.values(b).forEach((g) => g?.dispose());
    };
  }, [built]);

  const rock = (built as { rock?: THREE.BufferGeometry | null }).rock ?? null;
  const yOffset = item.kind === 'cloud' ? 14 + item.scale * 3 : 0;

  return (
    <group
      position={[item.x, y + yOffset, item.z]}
      rotation={[0, item.rot, 0]}
      onPointerDown={(e) => {
        e.stopPropagation();
        select(item.uid);
      }}
    >
      {built.trunk && <mesh geometry={built.trunk} material={mats.bark} />}
      {built.leaf && <mesh geometry={built.leaf} material={mats.leaf} />}
      {rock && <mesh geometry={rock} material={mats.rock} />}
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2 - yOffset, 0]}>
          <ringGeometry args={[1.5, 1.85, 40]} />
          <meshBasicMaterial color={p.accent} transparent opacity={0.65} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

export function Composer({ scene }: { scene: PoemScene }) {
  const placed = useScene((s) => s.placed);
  return (
    <group>
      {placed.map((item) => (
        <Placed key={item.uid} item={item} scene={scene} />
      ))}
    </group>
  );
}
