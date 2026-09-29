'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { clamp } from '@/lib/noise';
import { terrainHeight } from '@/lib/terrain';
import { useScene } from '@/lib/store';
import { touchInput } from '@/lib/touch';
import type { PoemScene } from '@/lib/types';
import { Figure } from './World';
import type { World } from './useWorld';

const MOVE_KEYS: Record<string, [number, number]> = {
  KeyW: [0, 1],
  ArrowUp: [0, 1],
  KeyS: [0, -1],
  ArrowDown: [0, -1],
  KeyA: [-1, 0],
  ArrowLeft: [-1, 0],
  KeyD: [1, 0],
  ArrowRight: [1, 0],
};

function useKeys() {
  const keys = useRef(new Set<string>());
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (MOVE_KEYS[e.code] || e.code === 'ShiftLeft' || e.code === 'ShiftRight') e.preventDefault();
      keys.current.add(e.code);
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const clear = () => keys.current.clear();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', clear);
    };
  }, []);
  return keys;
}

/** Shortest way round the circle from a to b. */
function angleLerp(a: number, b: number, t: number) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

/**
 * Third-person wandering.
 *
 * Movement is camera-relative — push forward and you go where you are looking,
 * which is what anyone who has played a game expects. The figure turns to face
 * wherever they are headed, and the camera trails behind on a spring.
 */
export function RoamRig({ scene, world }: { scene: PoemScene; world: World }) {
  const { camera, gl } = useThree();
  const keys = useKeys();
  const find = useScene((s) => s.find);
  const setNear = useScene((s) => s.setNear);
  const mode = useScene((s) => s.mode);

  const figureRef = useRef<THREE.Group>(null);
  const pos = useRef(new THREE.Vector3(scene.start.x, 0, scene.start.z));
  const yaw = useRef(scene.start.heading);
  const camYaw = useRef(scene.start.heading);
  const camPitch = useRef(0.08);
  const camDist = useRef(9.5);
  const bob = useRef(0);
  const smoothed = useRef(new THREE.Vector3());
  const first = useRef(true);

  // Reset to the trailhead whenever a new poem loads.
  useEffect(() => {
    pos.current.set(scene.start.x, terrainHeight(scene.start.x, scene.start.z, scene.terrain), scene.start.z);
    yaw.current = scene.start.heading;
    camYaw.current = scene.start.heading;
    first.current = true;
  }, [scene]);

  // Drag to look around; wheel to pull the camera in and out.
  useEffect(() => {
    const el = gl.domElement;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      camYaw.current -= (e.clientX - lastX) * 0.005;
      camPitch.current = clamp(camPitch.current + (e.clientY - lastY) * 0.004, -0.25, 1.05);
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const up = (e: PointerEvent) => {
      dragging = false;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      camDist.current = clamp(camDist.current + e.deltaY * 0.012, 3.5, 26);
    };

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', wheel, { passive: false });
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('wheel', wheel);
    };
  }, [gl]);

  const limit = scene.terrain.extent * 0.84;

  useFrame((_, rawDt) => {
    if (mode !== 'roam') return;
    const dt = Math.min(rawDt, 0.05);

    let ix = 0;
    let iz = 0;
    for (const code of keys.current) {
      const v = MOVE_KEYS[code];
      if (v) {
        ix += v[0];
        iz += v[1];
      }
    }

    // The thumbstick feeds the same two axes as the keys, so everything
    // downstream is unaware of which one is driving.
    if (touchInput.active) {
      ix += touchInput.x;
      iz += touchInput.y;
    }

    const running = keys.current.has('ShiftLeft') || keys.current.has('ShiftRight');
    const speed = running ? 13 : 5.6;

    const cy = camYaw.current;
    const fx = -Math.sin(cy);
    const fz = -Math.cos(cy);
    const rx = Math.cos(cy);
    const rz = -Math.sin(cy);

    let mx = fx * iz + rx * ix;
    let mz = fz * iz + rz * ix;
    const len = Math.hypot(mx, mz);

    if (len > 0.001) {
      mx /= len;
      mz /= len;
      pos.current.x = clamp(pos.current.x + mx * speed * dt, -limit, limit);
      pos.current.z = clamp(pos.current.z + mz * speed * dt, -limit, limit);
      yaw.current = angleLerp(yaw.current, Math.atan2(mx, mz), 1 - Math.pow(0.001, dt));
      bob.current += dt * (running ? 13 : 8);
    } else {
      bob.current += dt * 1.4;
    }

    // Keep to the bank. The basins are carved below their water level, so
    // walking in put the camera under the surface — and a 蓑笠翁 watches the
    // boat from the shore, he does not wade out to it.
    for (const b of scene.terrain.basins) {
      const dx = pos.current.x - b.x;
      const dz = pos.current.z - b.z;
      const d = Math.hypot(dx, dz);
      const shore = b.r * 0.97;
      if (d < shore && d > 1e-4) {
        pos.current.x = b.x + (dx / d) * shore;
        pos.current.z = b.z + (dz / d) * shore;
      }
    }

    const groundY = terrainHeight(pos.current.x, pos.current.z, scene.terrain);
    pos.current.y = groundY;

    if (figureRef.current) {
      const walking = len > 0.001;
      figureRef.current.position.set(
        pos.current.x,
        groundY + (walking ? Math.abs(Math.sin(bob.current)) * 0.09 : Math.sin(bob.current) * 0.02),
        pos.current.z
      );
      figureRef.current.rotation.y = yaw.current;
      // A slight roll into each step.
      figureRef.current.rotation.z = walking ? Math.sin(bob.current) * 0.035 : 0;
    }

    // Camera trails behind on a spring, and never sinks into the hillside.
    const target = new THREE.Vector3(pos.current.x, groundY + 1.75, pos.current.z);
    const d = camDist.current;
    const cp = Math.cos(camPitch.current);
    const desired = new THREE.Vector3(
      target.x + Math.sin(cy) * d * cp,
      target.y + Math.sin(camPitch.current) * d + 0.6,
      target.z + Math.cos(cy) * d * cp
    );
    const floor = terrainHeight(desired.x, desired.z, scene.terrain) + 1.4;
    if (desired.y < floor) desired.y = floor;

    if (first.current) {
      smoothed.current.copy(desired);
      first.current = false;
    } else {
      smoothed.current.lerp(desired, 1 - Math.pow(0.0015, dt));
    }
    camera.position.copy(smoothed.current);
    camera.lookAt(target);

    // Reaching a place inks its line. Coming within a few radii only stirs it,
    // which is how you can tell you are walking towards something.
    let nearest: string | null = null;
    let nearestD = Infinity;
    for (const lm of scene.landmarks) {
      const dx = pos.current.x - lm.x;
      const dz = pos.current.z - lm.z;
      const d2 = dx * dx + dz * dz;
      if (d2 < lm.radius * lm.radius) find(lm.id);
      if (d2 < (lm.radius * 3) ** 2 && d2 < nearestD) {
        nearestD = d2;
        nearest = lm.id;
      }
    }
    setNear(nearest);
  });

  if (mode !== 'roam') return null;
  return (
    <group ref={figureRef}>
      <Figure world={world} shadow />
    </group>
  );
}

/**
 * Free viewing: an orbit around the valley, the way you would walk around a
 * hanging scroll rather than step into it.
 */
export function ViewRig({ scene }: { scene: PoemScene }) {
  const { camera, gl } = useThree();
  const mode = useScene((s) => s.mode);
  const focus = useScene((s) => s.focus);
  const state = useRef({ yaw: scene.start.heading, pitch: 0.12, dist: 90 });
  const target = useMemo(() => new THREE.Vector3(0, 16, 0), []);
  const wanted = useMemo(() => new THREE.Vector3(0, 16, 0), []);

  useEffect(() => {
    state.current = { yaw: scene.start.heading, pitch: 0.12, dist: 90 };
    target.set(0, 16, 0);
    wanted.set(0, 16, 0);
  }, [scene, target, wanted]);

  // Choosing a line from the inscription moves the view to the place it names.
  useEffect(() => {
    const lm = scene.landmarks.find((l) => l.id === focus);
    if (!lm) {
      wanted.set(0, 16, 0);
      state.current.dist = 90;
      return;
    }
    wanted.set(lm.x, terrainHeight(lm.x, lm.z, scene.terrain) + 9, lm.z);
    state.current.dist = 42;
  }, [focus, scene, wanted]);

  useEffect(() => {
    if (mode !== 'view') return;
    const el = gl.domElement;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      state.current.yaw -= (e.clientX - lastX) * 0.004;
      state.current.pitch = clamp(state.current.pitch + (e.clientY - lastY) * 0.003, 0.02, 1.2);
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const up = () => {
      dragging = false;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      state.current.dist = clamp(state.current.dist + e.deltaY * 0.09, 24, 220);
    };

    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    el.addEventListener('wheel', wheel, { passive: false });
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      el.removeEventListener('wheel', wheel);
    };
  }, [gl, mode]);

  useFrame((_, rawDt) => {
    if (mode === 'roam') return;
    const dt = Math.min(rawDt, 0.05);
    // No auto-rotation: the default framing is composed around the moon, and a
    // slow drift kept carrying it out of shot.
    target.lerp(wanted, 1 - Math.pow(0.02, dt));
    const { yaw, pitch, dist } = state.current;
    const cp = Math.cos(pitch);
    const desired = new THREE.Vector3(
      target.x + Math.sin(yaw) * dist * cp,
      target.y + Math.sin(pitch) * dist,
      target.z + Math.cos(yaw) * dist * cp
    );
    const floor = terrainHeight(desired.x, desired.z, scene.terrain) + 3;
    if (desired.y < floor) desired.y = floor;
    camera.position.lerp(desired, 1 - Math.pow(0.004, dt));
    camera.lookAt(target);
  });

  return null;
}
