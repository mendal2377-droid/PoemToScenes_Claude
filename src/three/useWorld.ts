'use client';

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Rng } from '@/lib/noise';
import { basinWaterLevel, riverWidth, terrainHeight } from '@/lib/terrain';
import type { PoemScene } from '@/lib/types';
import { buildGroundMask, buildPaperField } from './groundMask';
import {
  buildMistBanks,
  buildMountainRing,
  buildRiver,
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
import { buildBoatCanopy, buildBoatHull, buildCape, buildFlocks, buildGlowPoints, buildHat, buildHerd, buildPavilionRoof } from './props';
import { bodies, shared } from './materials';
import {
  makeBarkMaterial,
  makeBirdMaterial,
  makeFoliageMaterial,
  makeGlowMaterial,
  makeGrassMaterial,
  makeContactShadowMaterial,
  makeInkMaterial,
  makeMistMaterial,
  makeMountainMaterial,
  makeRockMaterial,
  makeSkyMaterial,
  makeFallMaterial,
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

  const sk = scene.skyline ?? 1;
  const paper = buildPaperField(spec, spec.seed + 313);

  // Reeds stand along the banks of a river as well as round a pond. Each bank
  // gets a run of small clusters, offset from the path by the edge of the water.
  const riverSpots: { x: number; z: number; r: number }[] = [];
  for (const rv of spec.rivers ?? []) {
    const curve = new THREE.CatmullRomCurve3(
      rv.path.map((q) => new THREE.Vector3(q[0], 0, q[1])),
      false,
      'catmullrom',
      0.5
    );
    for (let i = 4; i <= 96; i += 2) {
      const t = i / 100;
      const w = riverWidth(rv, t);
      const edge = w * 0.5 + w * 0.36 * 0.36;
      const q = curve.getPoint(t);
      const tan = curve.getTangent(t);
      const nl = Math.hypot(tan.x, tan.z) || 1;
      for (const side of [-1, 1]) {
        riverSpots.push({ x: q.x + (-tan.z / nl) * edge * side, z: q.z + (tan.x / nl) * edge * side, r: 2.4 });
      }
    }
  }
  // A brook has reeds too, closer in: its bank is only half its width from the middle.
  for (const ch of spec.channels) {
    const curve = new THREE.CatmullRomCurve3(
      ch.path.map((q) => new THREE.Vector3(q[0], 0, q[1])),
      false,
      'catmullrom',
      0.5
    );
    for (let i = 4; i <= 96; i += 3) {
      const t = i / 100;
      const q = curve.getPoint(t);
      const tan = curve.getTangent(t);
      const nl = Math.hypot(tan.x, tan.z) || 1;
      for (const side of [-1, 1]) {
        riverSpots.push({
          x: q.x + (-tan.z / nl) * ch.width * 0.55 * side,
          z: q.z + (tan.x / nl) * ch.width * 0.55 * side,
          r: 1.4,
        });
      }
    }
  }
  const reedSpots = [...spec.basins.map((b) => ({ x: b.x, z: b.z, r: b.r })), ...riverSpots];

  // Every spot a line is read from is kept clear of trunks.
  const eyes = scene.landmarks.map((l) => ({ x: l.x, z: l.z }));
  const pines = buildPines(
    scene.flora.pines.clusters,
    spec,
    { dark: p.foliageDark, light: p.foliageLight },
    spec.seed + 1,
    eyes
  );
  const bamboo = buildBamboo(
    scene.flora.bamboo.groves,
    spec,
    { dark: p.foliageDark, light: p.foliageLight },
    spec.seed + 2,
    eyes
  );
  const broadleaf = buildBroadleaf(scene.flora.broadleaf.clusters, spec, p.trunk, spec.seed + 3, eyes);

  // 莲 grows where the water is slow: the whole of a pond, or one reach of a river.
  const river0 = spec.rivers?.[0];
  let lotusLevel = waterLevel;
  let lotusPlace: ((rng: Rng) => [number, number]) | null = null;
  if (river0) {
    const curve = new THREE.CatmullRomCurve3(
      river0.path.map((q) => new THREE.Vector3(q[0], 0, q[1])),
      false,
      'catmullrom',
      0.5
    );
    lotusLevel = river0.level;
    lotusPlace = (rng) => {
      const t = rng.range(0.24, 0.62);
      const q = curve.getPoint(t);
      const tan = curve.getTangent(t);
      const nl = Math.hypot(tan.x, tan.z) || 1;
      // Keep to the middle two thirds of the channel, off the banks.
      const off = rng.range(-1, 1) * riverWidth(river0, t) * 0.36;
      return [q.x + (-tan.z / nl) * off, q.z + (tan.x / nl) * off];
    };
  } else if (basin) {
    lotusPlace = (rng) => {
      const a = rng.range(0, Math.PI * 2);
      const r = Math.sqrt(rng.next()) * basin.r * 0.82;
      return [basin.x + Math.cos(a) * r, basin.z + Math.sin(a) * r];
    };
  }
  const lotus = lotusPlace
    ? buildLotus(scene.flora.lotus.count, lotusPlace, lotusLevel, { pad: p.foliageLight, flower: '#f0d9dd' }, spec.seed + 4)
    : { pads: null, flowers: null };

  const geo = {
    terrain: buildTerrain(spec),
    mountainNear: buildMountainRing({ seed: spec.seed + 11, rMin: 152, rMax: 216, hMin: 22 * sk, hMax: 54 * sk, massifs: scene.massifs?.filter((m) => m.ring === 'near'), }),
    mountainMid: buildMountainRing({ seed: spec.seed + 23, rMin: 244, rMax: 326, hMin: 40 * sk, hMax: 94 * sk, massifs: scene.massifs?.filter((m) => m.ring === 'mid'), }),
    mountainFar: buildMountainRing({ seed: spec.seed + 37, rMin: 384, rMax: 524, hMin: 62 * sk, hMax: 150 * sk, massifs: scene.massifs?.filter((m) => m.ring === 'far'), }),
    sky: new THREE.SphereGeometry(760, 40, 26),
    // Every basin holds water, each at its own level.
    ponds: spec.basins.map((b) => buildPond(b, basinWaterLevel(b, spec))),
    // Every brook carries water, not only the first.
    streams: spec.channels.map((c) => buildStream(c, spec)),
    rivers: (spec.rivers ?? []).map((rv) => buildRiver(rv)),
    glows: buildGlowPoints([
      ...(scene.glows ?? []).map((g) => ({
        x: g.x,
        y: terrainHeight(g.x, g.z, spec) + (g.h ?? 2.2),
        z: g.z,
        color: g.color,
        size: g.size,
        always: !!g.always,
      })),
      // Each torch a companion holds is a flame at the end of the stick, turned
      // with the figure — the raised right hand, at (0.19, 1.78, 0.54) in its own frame.
      ...(scene.people ?? [])
        .filter((q) => q.torch)
        .map((q) => {
          const k = q.scale ?? 1;
          const c = Math.cos(q.rot);
          const sn = Math.sin(q.rot);
          const ox = 0.19 * k;
          const oz = 0.54 * k;
          const wx = q.x + ox * c + oz * sn;
          const wz = q.z - ox * sn + oz * c;
          return { x: wx, y: terrainHeight(q.x, q.z, spec) + 1.78 * k, z: wz, color: '#ffb35c', size: 1.5, always: true };
        }),
    ]),
    flocks: buildFlocks(
      (scene.flocks ?? []).map((f) => ({ ...f, y: terrainHeight(f.x, f.z, spec) + f.y }))
    ),
    torchGlow: scene.torch
      ? buildGlowPoints([{ x: 0.42, y: 1.55, z: 0.32, color: '#ffb35c', size: 2.4, always: true }])
      : null,
    pines,
    bamboo,
    broadleaf,
    lotus,
    grass: buildGrass(
      scene.flora.grass.count,
      scene.flora.grass.radius,
      spec,
      spec.seed + 5,
      avoid,
      paper.sample,
      scene.flora.grass.height ?? 1
    ),
    reeds: buildReeds(
      scene.flora.reeds.count,
      spec,
      reedSpots,
      { dark: p.foliageDark, light: p.foliageLight },
      spec.seed + 6
    ),
    rocks: buildRocks(scatterRocks(scene.flora.rocks.count, spec, spec.seed + 7)),
    mist: buildMistBanks(34, spec, spec.seed + 8),
    fall: buildSnow(2600, 90, spec.seed + 9),
    rain: buildSnow(5600, 48, spec.seed + 10),
    wsnow: buildSnow(3800, 64, spec.seed + 11),
    herd: scene.herd
      ? buildHerd(
          Array.from({ length: scene.herd.count }, (_, i) => {
            const rng = new Rng(spec.seed + 400 + i);
            const a = rng.range(0, Math.PI * 2);
            const r = Math.sqrt(rng.next()) * scene.herd!.r;
            const hx = scene.herd!.x + Math.cos(a) * r;
            const hz = scene.herd!.z + Math.sin(a) * r;
            return { x: hx, y: terrainHeight(hx, hz, spec), z: hz, s: scene.herd!.scale * rng.range(0.8, 1.25), seed: rng.next() };
          })
        )
      : null,
    pavilionRoof: scene.pavilion ? buildPavilionRoof(3.1, 2.9, 4.9) : null,
    boatHull: scene.boat || scene.boats?.length ? buildBoatHull(5.6, 1.5, 0.62) : null,
    boatCanopy: scene.boat || scene.boats?.length ? buildBoatCanopy(2.1, 1.35, 0.85) : null,
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
    fall: makeFallMaterial(p, scene.fall, shared.uSnow),
    rain: makeFallMaterial(p, { kind: 'rain', color: '#d3dbe2', size: 1 }, shared.uRain),
    wsnow: makeFallMaterial(p, { kind: 'snow', color: '#ffffff', size: 1.1 }, shared.uWSnow),
    thatch: makeThatchMaterial(p),
    ink: makeInkMaterial(p),
    shadow: makeContactShadowMaterial(p),
    straw: strawDark,
    hat: hatPale,
    wood: makeInkMaterial(p, p.trunk),
    herd: null as THREE.ShaderMaterial | null,
    plaster: makeInkMaterial(p, '#d8c8a2'),
    bird: makeBirdMaterial(p),
    glow: makeGlowMaterial(),
  };

  // The middle range sits between the other two in weight as well as distance.
  mat.mountainMid.uniforms.uFarness.value = 0.45;

  // Petals and leaves drift but do not settle; snow does.
  shared.uAccum.value = scene.fall.accumulate;
  shared.uTorch.value = scene.torch ? 1 : 0;
  if (scene.herd) {
    mat.herd = makeInkMaterial(p, scene.herd.color);
  }

  const mask = buildGroundMask(spec, trail, scene.extraPaths ?? [], scene.sand ?? []);
  mat.terrain.uniforms.uMask.value = mask;
  mat.terrain.uniforms.uPaperField.value = paper.texture;
  mat.terrain.uniforms.uExtent.value = spec.extent;

  // 明月松间照 needs to know where the moon is and where the pines are.
  // The moon moves with the clock, so every material holds the one shared vector.
  const moonDir = bodies.moon;
  const grove = scene.flora.pines.clusters[0];
  mat.terrain.uniforms.uMoonDir.value = moonDir;
  mat.terrain.uniforms.uGrove.value = new THREE.Vector2(grove?.x ?? 0, grove?.z ?? 0);
  mat.terrain.uniforms.uGroveR.value = grove?.r ?? 1;
  mat.terrain.uniforms.uGrassStroke.value = scene.flora.grass.stroke ?? 0.4;

  for (const m of [mat.needle, mat.bambooLeaf, mat.dab, mat.reed, mat.pad]) {
    m.uniforms.uMoonDir.value = moonDir;
  }

  const heights = {
    pavilion: scene.pavilion ? terrainHeight(scene.pavilion.x, scene.pavilion.z, spec) : 0,
    waterLevel,
    riverLevel: spec.rivers?.[0]?.level ?? 0,
  };

  return { geo, mat, mask, paper, trail, heights, basin };
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
      world.paper.texture.dispose();
    };
  }, [world]);

  return world;
}
