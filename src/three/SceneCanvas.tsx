'use client';

import { Suspense, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene } from '@/lib/store';
import type { PoemScene } from '@/lib/types';
import { shared } from './materials';
import { useWorld } from './useWorld';
import { WorldView } from './World';
import { RoamRig, ViewRig } from './Roam';
import { Landmarks } from './Landmarks';
import type { LabelBus } from './Labels';
import { Composer } from './Composer';

/** Drives the one uniform block every material in the scene reads from. */
function Ticker() {
  const atm = useScene((s) => s.atmosphere);

  useEffect(() => {
    shared.uWind.value = atm.wind;
    shared.uHour.value = atm.hour;
    shared.uMist.value = atm.mist;
    shared.uSnow.value = atm.snow;
  }, [atm]);

  useFrame(({ clock }) => {
    shared.uTime.value = clock.elapsedTime;
  });

  return null;
}

function Contents({
  scene,
  onReady,
  bus,
}: {
  scene: PoemScene;
  onReady?: () => void;
  bus: LabelBus;
}) {
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

  // The world is built synchronously above; by the time this effect runs the
  // first frame is on its way, so the loading card can step aside.
  useEffect(() => {
    if (!onReady) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(onReady));
    return () => cancelAnimationFrame(id);
  }, [onReady, world]);

  return (
    <>
      <Ticker />
      <WorldView scene={scene} world={world} onGroundDown={mode === 'compose' ? onGroundDown : undefined} />
      <Composer scene={scene} />
      <Landmarks scene={scene} bus={bus} />
      <ViewRig scene={scene} />
      <RoamRig scene={scene} world={world} />
    </>
  );
}

export function SceneCanvas({
  scene,
  onReady,
  bus,
}: {
  scene: PoemScene;
  onReady?: () => void;
  bus: LabelBus;
}) {
  return (
    <Canvas
      className="scene-canvas"
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 52, near: 0.4, far: 1600, position: [0, 30, 120] }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color(scene.palette.paper), 1);
      }}
    >
      <Suspense fallback={null}>
        <Contents scene={scene} onReady={onReady} bus={bus} />
      </Suspense>
    </Canvas>
  );
}
