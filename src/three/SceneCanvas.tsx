'use client';

import { Suspense, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene } from '@/lib/store';
import { ambience } from '@/lib/ambience';
import type { PoemScene } from '@/lib/types';
import { shared } from './materials';
import { useWorld } from './useWorld';
import { WorldView } from './World';
import { RoamRig, ViewRig } from './Roam';
import { Landmarks } from './Landmarks';
import { Composer } from './Composer';

/**
 * Drives the one uniform block every material in the scene reads from, and
 * carries the listener's position to the ambience so the sound follows the eye.
 */
function Ticker({ scene }: { scene: PoemScene }) {
  const atm = useScene((s) => s.atmosphere);

  useEffect(() => {
    shared.uWind.value = atm.wind;
    shared.uHour.value = atm.hour;
    shared.uMist.value = atm.mist;
    shared.uSnow.value = atm.snow;
  }, [atm]);

  useFrame(({ clock, camera }, dt) => {
    shared.uTime.value = clock.elapsedTime;
    if (ambience.running) {
      ambience.update(camera.position.x, camera.position.z, scene, atm.wind, Math.min(dt, 0.1));
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
      <Landmarks scene={scene} />
      <ViewRig scene={scene} />
      <RoamRig scene={scene} world={world} />
    </>
  );
}

export function SceneCanvas({ scene, onReady }: { scene: PoemScene; onReady?: () => void }) {
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
        <Contents scene={scene} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
