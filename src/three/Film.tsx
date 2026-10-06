'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene } from '@/lib/store';
import type { PoemScene } from '@/lib/types';
import type { WeatherId } from '@/lib/weather';
import { terrainHeight } from '@/lib/terrain';
import { bodies } from './materials';

/**
 * Film mode — `/scene/<id>?film`.
 *
 * The home page's background is a short wander through the poems, and it is made
 * from the poems themselves rather than from footage: this mode takes the
 * interface away, lets the camera walk slowly on from wherever it stands, and
 * puts a veil the colour of the paper in front of the lens so a shot can be
 * faded in and out *inside* the canvas, where a recording can see it.
 *
 * It is driven from outside through `window.__film` (see `installFilm`), which
 * is how the clips in `public/film/` were recorded.
 */

export const film = {
  active: false,
  /** 1 is paper, 0 is picture. */
  fade: 1,
  target: 1,
  /** Seconds the fade takes to go the whole way. */
  span: 1.2,
  /** Metres per second the eye walks on in the direction it faces. */
  walk: 0.55,
  /** The next focus is a cut, not a glide. */
  cut: false,
  /** Set by the canvas: renders one frame at the given time, in seconds. */
  advance: undefined as undefined | ((t: number) => void),
  t: 0,
  /** The ink pass draws the veil itself, on top of the painting. */
  inkVeil: false,
  /**
   * A scripted camera: where the lens is, what it looks at, its field of view
   * and a little roll. While set it overrides the poet's eye entirely, so a
   * director can crane, push in and hold.
   */
  pose: null as null | { pos: [number, number, number]; look: [number, number, number]; fov?: number; roll?: number },
  /** The arriving ink drop, driven by hand (0 bare paper … 1 the painting); null leaves it off. */
  bloom: null as number | null,
};

if (typeof window !== 'undefined') {
  film.active = new URLSearchParams(window.location.search).has('film');
}

declare global {
  interface Window {
    __film?: {
      ids: string[];
      focus: (id: string, cut?: boolean) => void;
      fadeTo: (v: number, seconds?: number) => void;
      rise: () => void;
      /** Render one frame, 1/30 s later than the last. */
      step: () => void;
      /** Render the same instant again — for a second camera in a dissolve. */
      again: () => void;
      /** The hour on the 24-hour dial, and the weather. */
      clock: (hour: number) => void;
      weather: (id: WeatherId) => void;
      /** Wind, mist and falling snow, 0–1 each. */
      air: (patch: { wind?: number; mist?: number; snow?: number }) => void;
      pose: (p: (typeof film)['pose']) => void;
      bloom: (v: number | null) => void;
      /** Height of the ground, and of the river, for placing a camera. */
      ground: (x: number, z: number) => number;
      water: number;
      /** Directions of the sun and moon as they stand now (unit vectors). */
      sky: () => { sun: [number, number, number]; moon: [number, number, number] };
    };
  }
}

/** Hands the scene's controls to the page, for whoever is recording it. */
export function installFilm(scene: PoemScene) {
  if (!film.active) return () => {};
  film.fade = 1;
  film.target = 1;
  window.__film = {
    ids: [...scene.landmarks].sort((a, b) => a.line - b.line).map((l) => l.id),
    focus: (id, cut = false) => {
      film.cut = cut;
      useScene.getState().setFocus(id);
    },
    fadeTo: (v, seconds = 1.2) => {
      film.target = v;
      film.span = Math.max(0.05, seconds);
    },
    rise: () => useScene.getState().setFocus(null),
    step: () => {
      film.t += 1 / 30;
      film.advance?.(film.t);
    },
    again: () => film.advance?.(film.t),
    clock: (hour) => useScene.getState().setClock(hour),
    weather: (id) => useScene.getState().setWeather(id),
    air: (patch) => useScene.getState().setAtmosphere(patch),
    pose: (p) => {
      film.pose = p;
    },
    bloom: (v) => {
      film.bloom = v;
    },
    ground: (x, z) => terrainHeight(x, z, scene.terrain),
    water: scene.terrain.rivers?.[0]?.level ?? 0,
    sky: () => ({ sun: bodies.sun.toArray() as [number, number, number], moon: bodies.moon.toArray() as [number, number, number] }),
  };
  return () => {
    delete window.__film;
  };
}

/** A sheet of paper hung just in front of the camera. */
export function FilmVeil({ paper }: { paper: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ camera }, rawDt) => {
    if (!mesh.current || !mat.current) return;
    const dt = Math.min(rawDt, 0.1);
    const step = dt / film.span;
    if (film.fade < film.target) film.fade = Math.min(film.target, film.fade + step);
    else if (film.fade > film.target) film.fade = Math.max(film.target, film.fade - step);
    // Ease the ends, so a fade does not start or stop like a switch.
    const f = film.fade * film.fade * (3 - 2 * film.fade);
    mat.current.opacity = f;
    mesh.current.visible = f > 0.002 && !film.inkVeil;

    const cam = camera as THREE.PerspectiveCamera;
    const d = 0.6;
    const h = 2 * d * Math.tan((cam.fov * Math.PI) / 360) * 1.1;
    mesh.current.position.copy(camera.position);
    mesh.current.quaternion.copy(camera.quaternion);
    mesh.current.translateZ(-d);
    mesh.current.scale.set(h * cam.aspect, h, 1);
  });

  // Only exists in film mode.
  useEffect(() => {
    if (film.active) document.documentElement.dataset.film = 'true';
    return () => {
      delete document.documentElement.dataset.film;
    };
  }, []);

  if (!film.active) return null;
  return (
    <mesh ref={mesh} renderOrder={1000} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial ref={mat} color={paper} transparent opacity={1} depthTest={false} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}
