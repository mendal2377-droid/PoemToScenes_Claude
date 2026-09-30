'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { clamp, distToPath, smoothstep } from '@/lib/noise';
import { riverWidth, terrainHeight } from '@/lib/terrain';
import { useScene } from '@/lib/store';
import { touchInput } from '@/lib/touch';
import type { PoemScene } from '@/lib/types';
import { Figure } from './Figure';
import { bodies } from './materials';
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

    // And the bank of a river. The shore is where the carve reaches the water
    // level — a little inside the visible edge, so nobody stands on the waterline.
    for (const rv of scene.terrain.rivers ?? []) {
      const near = distToPath(pos.current.x, pos.current.z, rv.path);
      const end = smoothstep(0.02, 0.16, near.t) * (1 - smoothstep(0.84, 0.98, near.t));
      const w = riverWidth(rv, near.t);
      const shore = w * 0.5 + w * 0.36 * 0.3;
      if (end > 0.5 && near.dist < shore && near.dist > 1e-3) {
        const dx = pos.current.x - near.px;
        const dz = pos.current.z - near.pz;
        pos.current.x = near.px + (dx / near.dist) * shore;
        pos.current.z = near.pz + (dz / near.dist) * shore;
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
      <Figure world={world} shadow torch={scene.torch} />
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
  // Each world's own opening composition, or the general one.
  const home = useMemo(
    () => ({
      dist: scene.view?.dist ?? 90,
      pitch: scene.view?.pitch ?? 0.12,
      at: scene.view?.target ?? ([0, 16, 0] as [number, number, number]),
    }),
    [scene]
  );
  const state = useRef({ yaw: scene.start.heading, pitch: home.pitch, dist: home.dist });
  const target = useMemo(() => new THREE.Vector3(...home.at), [home]);

  /**
   * The poet's eye.
   *
   * Choosing a line stands the camera on the spot the poet stood, at the height
   * of a person's eyes, turned to what the line is about. `want` is where it is
   * going and `cur` is where it is; they are kept apart so the move is a glide,
   * and so a drag can turn the head without fighting the flight.
   */
  const eye = useRef({
    want: { pos: new THREE.Vector3(), yaw: 0, pitch: 0, fov: 52 },
    cur: { pos: new THREE.Vector3(), yaw: 0, pitch: 0, fov: 52 },
    active: false,
    zoom: 1,
    /** A body in the sky is followed as it moves, until the visitor turns their own head. */
    sky: null as 'sun' | 'moon' | null,
  });

  useEffect(() => {
    state.current = { yaw: scene.start.heading, pitch: home.pitch, dist: home.dist };
    target.set(...home.at);
    eye.current.active = false;
  }, [scene, target, home]);

  // A line was chosen: work out where to stand and what to face.
  useEffect(() => {
    const lm = scene.landmarks.find((l) => l.id === focus);
    if (!lm || mode !== 'view') {
      eye.current.active = false;
      return;
    }
    const gy = terrainHeight(lm.x, lm.z, scene.terrain);
    const pos = new THREE.Vector3(lm.x, gy + 1.65, lm.z);

    // What is it looking at? A point on the ground, or a body in the sky.
    const look = lm.look;
    let aim: THREE.Vector3;
    if (look === 'moon' || look === 'sun') {
      aim = pos.clone().addScaledVector(look === 'moon' ? bodies.moon : bodies.sun, 400);
    } else if (look) {
      aim = new THREE.Vector3(look[0], terrainHeight(look[0], look[1], scene.terrain) + (look[2] ?? 1.5), look[1]);
    } else {
      // No composed view: face the middle of the world.
      aim = new THREE.Vector3(0, gy + 6, 0);
    }
    const d = aim.clone().sub(pos);
    const e = eye.current;
    e.want.pos.copy(pos);
    e.want.yaw = Math.atan2(d.x, d.z);
    e.want.pitch = Math.atan2(d.y, Math.hypot(d.x, d.z));
    e.zoom = lm.zoom ?? 1;
    e.want.fov = 52 / e.zoom;
    e.sky = look === 'moon' || look === 'sun' ? look : null;
    if (!e.active) {
      // Begin the glide from wherever the camera is now.
      e.cur.pos.copy(camera.position);
      const f = camera.getWorldDirection(new THREE.Vector3());
      e.cur.yaw = Math.atan2(f.x, f.z);
      e.cur.pitch = Math.asin(clamp(f.y, -1, 1));
      e.cur.fov = (camera as THREE.PerspectiveCamera).fov;
    }
    e.active = true;
  }, [focus, mode, scene, camera]);

  useEffect(() => {
    if (mode === 'roam') return;
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
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (eye.current.active) {
        // Turning the head: drag the world, so dragging right turns to the left.
        eye.current.sky = null;
        eye.current.want.yaw += dx * 0.0042;
        eye.current.want.pitch = clamp(eye.current.want.pitch + dy * 0.0032, -0.6, 1.25);
      } else {
        state.current.yaw -= dx * 0.004;
        state.current.pitch = clamp(state.current.pitch + dy * 0.003, 0.02, 1.2);
      }
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const up = () => {
      dragging = false;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      if (eye.current.active) {
        eye.current.zoom = clamp(eye.current.zoom * (e.deltaY > 0 ? 0.92 : 1.08), 0.7, 5);
        eye.current.want.fov = 52 / eye.current.zoom;
      } else {
        state.current.dist = clamp(state.current.dist + e.deltaY * 0.09, 24, 220);
      }
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
    const cam = camera as THREE.PerspectiveCamera;
    if (mode === 'roam') {
      // Leaving an eye view for the walk: put the ordinary lens back.
      if (Math.abs(cam.fov - 52) > 0.05) {
        cam.fov = 52;
        cam.updateProjectionMatrix();
      }
      return;
    }
    const dt = Math.min(rawDt, 0.05);
    const e = eye.current;

    if (e.active) {
      if (e.sky) {
        const b = bodies[e.sky];
        e.want.yaw = Math.atan2(b.x, b.z);
        e.want.pitch = Math.atan2(b.y, Math.hypot(b.x, b.z));
      }
      // Glide to the eye, and turn the head the short way round.
      const k = 1 - Math.pow(0.02, dt);
      e.cur.pos.lerp(e.want.pos, k);
      let dy = e.want.yaw - e.cur.yaw;
      dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      e.cur.yaw += dy * k;
      e.cur.pitch += (e.want.pitch - e.cur.pitch) * k;
      e.cur.fov += (e.want.fov - e.cur.fov) * k;

      // Never through the hillside on the way there.
      const floor = terrainHeight(e.cur.pos.x, e.cur.pos.z, scene.terrain) + 1.2;
      if (e.cur.pos.y < floor) e.cur.pos.y = floor;

      cam.position.copy(e.cur.pos);
      const cp = Math.cos(e.cur.pitch);
      cam.lookAt(
        e.cur.pos.x + Math.sin(e.cur.yaw) * cp,
        e.cur.pos.y + Math.sin(e.cur.pitch),
        e.cur.pos.z + Math.cos(e.cur.yaw) * cp
      );
      if (Math.abs(cam.fov - e.cur.fov) > 0.01) {
        cam.fov = e.cur.fov;
        cam.updateProjectionMatrix();
      }
      return;
    }

    // Overview. Ease the field of view back if we have just come down from an eye.
    if (Math.abs(cam.fov - 52) > 0.05) {
      cam.fov += (52 - cam.fov) * (1 - Math.pow(0.02, dt));
      cam.updateProjectionMatrix();
    }
    // No auto-rotation: the default framing is composed around the moon, and a
    // slow drift kept carrying it out of shot.
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
