'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene } from '@/lib/store';
import { ambience } from '@/lib/ambience';
import type { PoemScene } from '@/lib/types';
import { bodies, shared } from './materials';
import { clockToShader, shaderToClock, skyAt } from '@/lib/time';
import { smoothstep } from '@/lib/noise';
import { useWorld } from './useWorld';
import { WorldView } from './World';
import { RoamRig, ViewRig } from './Roam';
import { Landmarks } from './Landmarks';
import { Composer } from './Composer';
import { FilmVeil, film, installFilm } from './Film';
import { InkPass, OVERLAY_LAYER, ink } from './InkPass';

/**
 * Runs the sky.
 *
 * Every frame it turns the clock, puts the sun and moon where the clock says,
 * and eases each weather value toward the target the panel last set — so clear
 * going to storm is a darkening over a few seconds, not a cut. It also carries
 * the listener's position to the ambience, and fires the lightning.
 *
 * The clock lives in a ref here and in the store there, and the two are kept
 * honest without re-rendering the interface sixty times a second: the store is
 * written back a few times a second while the day is turning, and if the store
 * value ever differs from what this last wrote, somebody moved the slider and
 * the ref follows.
 */
function Ticker({ scene }: { scene: PoemScene }) {
  const local = useRef(useScene.getState().clock);
  const wrote = useRef(local.current);
  const saveIn = useRef(0);
  const snap = useRef(true);
  const cover = useRef(0);
  const thunderIn = useRef(6);
  const secondFlash = useRef(0);
  const flash = useRef(0);
  const authoredClock = useMemo(() => shaderToClock(scene.atmosphere.hour), [scene]);

  // A new poem starts where it is, not fading in from the last one's weather.
  useEffect(() => {
    snap.current = true;
    local.current = useScene.getState().clock;
    wrote.current = local.current;
  }, [scene]);

  useFrame(({ clock, camera }, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    const st = useScene.getState();
    shared.uTime.value = clock.elapsedTime;

    // --- the clock ---------------------------------------------------------
    if (Math.abs(st.clock - wrote.current) > 1e-3) local.current = st.clock;
    if (st.running) {
      // One day in about three and a half minutes at the ordinary pace.
      local.current = (local.current + dt * 0.115 * st.speed) % 24;
      saveIn.current -= dt;
      if (saveIn.current <= 0) {
        saveIn.current = 0.2;
        wrote.current = local.current;
        useScene.setState({ clock: local.current });
      }
    }

    const hour = clockToShader(local.current);
    shared.uHour.value = hour;

    const sky = skyAt(local.current, scene.luminary, authoredClock);
    bodies.sun.set(...sky.sun);
    bodies.moon.set(...sky.moon);

    // --- the weather eases toward its target ------------------------------
    const ease = snap.current ? 1 : 1 - Math.exp(-dt * 1.5);
    const approach = (u: { value: number }, target: number) => {
      u.value += (target - u.value) * ease;
    };
    approach(shared.uWind, st.atmosphere.wind);
    approach(shared.uMist, st.atmosphere.mist);
    approach(shared.uSnow, st.atmosphere.snow);
    approach(shared.uCloud, st.sky.cloud);
    approach(shared.uRain, st.sky.rain);
    approach(shared.uWSnow, st.sky.snow);

    // The dark of a cave is a property of where the camera is. It comes in
    // quickly — walking into a cave is a step, not a fade — and goes the same way.
    const cave = scene.cave;
    const caveTarget = cave
      ? cave.depth * (1 - smoothstep(cave.r, cave.r + cave.fade, Math.hypot(camera.position.x - cave.x, camera.position.z - cave.z)))
      : 0;
    shared.uCave.value += (caveTarget - shared.uCave.value) * (snap.current ? 1 : 1 - Math.exp(-dt * 3.2));

    // Snow lies down slowly and goes slowly; the sky can change faster than the ground.
    const lying = Math.max(shared.uSnow.value * shared.uAccum.value, shared.uWSnow.value);
    const rate = lying > cover.current ? 0.55 : 0.22;
    cover.current += (lying - cover.current) * (snap.current ? 1 : 1 - Math.exp(-dt * rate));
    shared.uCover.value = cover.current;
    snap.current = false;

    // --- lightning ---------------------------------------------------------
    if (st.sky.thunder > 0.3) {
      thunderIn.current -= dt;
      if (thunderIn.current <= 0) {
        flash.current = 1;
        secondFlash.current = 0.11 + Math.random() * 0.1;
        thunderIn.current = 4 + Math.random() * 11 / st.sky.thunder;
        // Light first, sound after — the farther the strike, the longer the gap.
        if (ambience.running) window.setTimeout(() => ambience.thunder(), 350 + Math.random() * 2100);
      }
    }
    if (secondFlash.current > 0) {
      secondFlash.current -= dt;
      if (secondFlash.current <= 0) flash.current = Math.max(flash.current, 0.7);
    }
    flash.current *= Math.exp(-dt * 8);
    shared.uFlash.value = flash.current < 0.01 ? 0 : flash.current;

    // --- sound -------------------------------------------------------------
    if (ambience.running) {
      ambience.update(camera.position.x, camera.position.z, scene, shared.uWind.value, dt, shared.uRain.value);
    }
  });

  return null;
}

function Contents({ scene, onReady }: { scene: PoemScene; onReady?: () => void }) {
  const world = useWorld(scene);
  const mode = useScene((s) => s.mode);
  const brush = useScene((s) => s.brush);
  const place = useScene((s) => s.place);
  const select = useScene((s) => s.select);

  const onGroundDown = useCallback(
    (point: THREE.Vector3) => {
      if (mode !== 'compose') return;
      if (brush) place(point.x, point.z);
      else select(null);
    },
    [mode, brush, place, select]
  );

  useEffect(() => installFilm(scene), [scene]);

  // The world is built synchronously above; by the time this effect runs the
  // first frame is on its way, so the loading card can step aside.
  useEffect(() => {
    if (!onReady) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(onReady));
    return () => cancelAnimationFrame(id);
  }, [onReady, world]);

  return (
    <>
      <Ticker scene={scene} />
      <WorldView scene={scene} world={world} onGroundDown={mode === 'compose' ? onGroundDown : undefined} />
      <Composer scene={scene} />
      {!film.active && <Landmarks scene={scene} />}
      <ViewRig scene={scene} />
      <RoamRig scene={scene} world={world} />
      <FilmVeil paper={scene.palette.paper} />
      {ink.enabled && <InkPass scene={scene} />}
    </>
  );
}

export function SceneCanvas({ scene, onReady }: { scene: PoemScene; onReady?: () => void }) {
  return (
    <Canvas
      className="scene-canvas"
      dpr={[1, ink.enabled ? 1.5 : 1.75]}
      // Film mode renders frame by frame, on request, so a recording does not
      // depend on the window being on screen.
      frameloop={film.active ? 'never' : 'always'}
      gl={{ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: film.active }}
      camera={{ fov: 52, near: 0.4, far: 1600, position: [0, 30, 120] }}
      onCreated={({ gl, advance, camera }) => {
        film.advance = advance;
        // Falling things live on their own layer (see InkPass); the camera sees it.
        camera.layers.enable(OVERLAY_LAYER);
        gl.setClearColor(new THREE.Color(scene.palette.paper), 1);
      }}
    >
      <Suspense fallback={null}>
        <Contents scene={scene} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
