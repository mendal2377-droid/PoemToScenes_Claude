'use client';

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { basinWaterLevel, terrainHeight } from '@/lib/terrain';
import type { PoemScene } from '@/lib/types';
import { buildGroundMask } from './groundMask';
import {
  buildMistBanks,
  buildMountainRing,
  buildPond,
  buildSnow,
  buildStream,
  buildTerrain,
  buildTrail,
} from './geometry';
import {
  buildBamboo,
  buildBroadleaf,
  buildGrass,
  buildLotus,
  buildPines,
  buildReeds,
  buildRocks,
  scatterRocks,
} from './flora';
import { buildBoatCanopy, buildBoatHull, buildCape, buildHat, buildPavilionRoof } from './props';
import {
  makeBarkMaterial,
  makeFoliageMaterial,
  makeGrassMaterial,
  makeContactShadowMaterial,
  makeInkMaterial,
  makeMistMaterial,
  makeMountainMaterial,
  makeRockMaterial,
  makeSkyMaterial,
  makeSnowMaterial,
  makeTerrainMaterial,
  makeThatchMaterial,
  makeWaterMaterial,
} from './materials';

export type World = ReturnType<typeof buildWorld>;

function buildWorld(scene: PoemScene) {
  const spec = scene.terrain;
  const p = scene.palette;

  const trail = buildTrail(scene);
  const basin = spec.basins[0];
  const waterLevel = basin ? basinWaterLevel(basin, spec) : 0;

  // Keep grass out of the water and off the trail-worn ground.
  const avoid = spec.basins.map((b) => ({ x: b.x, z: b.z, r: b.r * 0.95 }));

  const pines = buildPines(
    scene.flora.pines.clusters,
    spec,
    { dark: p.foliageDark, light: p.foliageLight },
    spec.seed + 1
  );
  const bamboo = buildBamboo(
    scene.flora.bamboo.groves,
    spec,
    { dark: p.foliageDark, light: p.foliageLight },
    spec.seed + 2
  );
  const broadleaf = buildBroadleaf(scene.flora.broadleaf.clusters, spec, p.trunk, spec.seed + 3);

  const lotus = basin
    ? buildLotus(
        scene.flora.lotus.count,
        basin,
        waterLevel,
        { pad: p.foliageLight, flower: '#f0d9dd' },
        spec.seed + 4
      )
    : { pads: null, flowers: null };

  const geo = {
    terrain: buildTerrain(spec),
    mountainNear: buildMountainRing({ seed: spec.seed + 11, rMin: 152, rMax: 216, hMin: 22, hMax: 54 }),
    mountainMid: buildMountainRing({ seed: spec.seed + 23, rMin: 244, rMax: 326, hMin: 40, hMax: 94 }),
    mountainFar: buildMountainRing({ seed: spec.seed + 37, rMin: 384, rMax: 524, hMin: 62, hMax: 150 }),
    sky: new THREE.SphereGeometry(760, 40, 26),
    pond: basin ? buildPond(basin, waterLevel) : null,
    stream: spec.channels[0] ? buildStream(spec.channels[0].path, spec.channels[0].width, spec) : null,
    pines,
    bamboo,
    broadleaf,
    lotus,
    grass: buildGrass(scene.flora.grass.count, scene.flora.grass.radius, spec, spec.seed + 5, avoid),
    reeds: buildReeds(
      scene.flora.reeds.count,
      spec,
      spec.basins.map((b) => ({ x: b.x, z: b.z, r: b.r })),
      { dark: p.foliageDark, light: p.foliageLight },
      spec.seed + 6
    ),
    rocks: buildRocks(scatterRocks(scene.flora.rocks.count, spec, spec.seed + 7)),
    mist: buildMistBanks(34, spec, spec.seed + 8),
    snow: scene.atmosphere.snow > 0 ? buildSnow(2600, 90, spec.seed + 9) : null,
    pavilionRoof: scene.pavilion ? buildPavilionRoof(3.1, 2.9, 4.9) : null,
    boatHull: scene.boat ? buildBoatHull(5.6, 1.5, 0.62) : null,
    boatCanopy: scene.boat ? buildBoatCanopy(2.1, 1.35, 0.85) : null,
    hat: buildHat(0.44, 0.2),
    cape: buildCape(0.17, 0.44, 0.82),
  };

  // The rain cape is dark plaited straw; the hat is fresh and pale. Without
  // that contrast the two cones merge into one brown blob.
  const strawDark = makeThatchMaterial(p);
  strawDark.uniforms.uOchre.value = new THREE.Color(p.ochre).multiplyScalar(0.52);
  const hatPale = makeThatchMaterial(p);
  hatPale.uniforms.uOchre.value = new THREE.Color(p.ochre).lerp(new THREE.Color(p.paper), 0.42);

  const bambooMat = makeBarkMaterial(p);
  // Bamboo culms are green, not bark-brown.
  bambooMat.uniforms.uTrunk.value = new THREE.Color(p.foliageLight).lerp(new THREE.Color('#c8cf8a'), 0.45);

  const mat = {
    terrain: makeTerrainMaterial(p),
    mountainNear: makeMountainMaterial(p, false),
    mountainMid: makeMountainMaterial(p, false),
    mountainFar: makeMountainMaterial(p, true),
    sky: makeSkyMaterial(p, scene.luminary),
    water: makeWaterMaterial(p),
    bark: makeBarkMaterial(p),
    bamboo: bambooMat,
    needle: makeFoliageMaterial(p, 'needle', 0.55),
    bambooLeaf: makeFoliageMaterial(p, 'leaf', 1.5),
    dab: makeFoliageMaterial(p, 'dab', 0.8),
    reed: makeFoliageMaterial(p, 'leaf', 1.8),
    pad: makeFoliageMaterial(p, 'dab', 0.15),
    grass: makeGrassMaterial(p),
    rock: makeRockMaterial(p),
    mist: makeMistMaterial(p),
    snow: makeSnowMaterial(p),
    thatch: makeThatchMaterial(p),
    ink: makeInkMaterial(p),
    shadow: makeContactShadowMaterial(p),
    straw: strawDark,
    hat: hatPale,
    wood: makeInkMaterial(p, p.trunk),
  };

  // The middle range sits between the other two in weight as well as distance.
  mat.mountainMid.uniforms.uFarness.value = 0.45;

  const mask = buildGroundMask(spec, trail);
  mat.terrain.uniforms.uMask.value = mask;
  mat.terrain.uniforms.uExtent.value = spec.extent;

  const heights = {
    pavilion: scene.pavilion ? terrainHeight(scene.pavilion.x, scene.pavilion.z, spec) : 0,
    waterLevel,
  };

  return { geo, mat, mask, trail, heights, basin };
}

/** Builds the whole world once per poem, and tears it down on the way out. */
export function useWorld(scene: PoemScene): World {
  const world = useMemo(() => buildWorld(scene), [scene]);

  useEffect(() => {
    return () => {
      const walk = (v: unknown) => {
        if (!v) return;
        if (v instanceof THREE.BufferGeometry || v instanceof THREE.Material) {
          v.dispose();
        } else if (typeof v === 'object') {
          Object.values(v as Record<string, unknown>).forEach(walk);
        }
      };
      walk(world.geo);
      walk(world.mat);
      world.mask.dispose();
    };
  }, [world]);

  return world;
}
