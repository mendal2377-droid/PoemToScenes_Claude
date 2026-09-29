'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useScene, type Mode } from '@/lib/store';
import type { PoemScene } from '@/lib/types';
import { Panel } from './Panel';
import { Palette } from './Palette';
import { Inscription } from './Inscription';
import { ambience } from '@/lib/ambience';
import { Thumbstick } from './Thumbstick';

const SceneCanvas = dynamic(() => import('@/three/SceneCanvas').then((m) => m.SceneCanvas), {
  ssr: false,
});

const MODES: [Mode, string][] = [
  ['view', '自由观看'],
  ['roam', '漫游'],
  ['compose', '落笔'],
];

/** The little framed painting that floats while the world is being built. */
function LoadingCard({ scene, done }: { scene: PoemScene; done: boolean }) {
  const p = scene.palette;
  return (
    <div className="loading" data-done={done} aria-hidden={done}>
      <div className="loading__card">
        <div className="loading__frame">
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
              <linearGradient id="lc-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={p.skyHigh} />
                <stop offset="100%" stopColor={p.skyLow} />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#lc-sky)" />
            <circle cx="70" cy="24" r="9" fill={p.moon} opacity="0.9" />
            <path d="M0 62 Q 18 36 34 56 Q 50 30 68 54 Q 84 40 100 60 L100 100 L0 100 Z" fill={p.mountainFar} />
            <path d="M0 76 Q 22 58 44 74 Q 66 58 100 78 L100 100 L0 100 Z" fill={p.mountainNear} />
            <rect y="88" width="100" height="12" fill={p.water} />
          </svg>
        </div>
        <h2 className="loading__title">{scene.title}</h2>
        <p className="loading__roman">{scene.romanTitle}</p>
        <p className="loading__status">正在以笔墨堆砌山川…</p>
      </div>
    </div>
  );
}

export function SceneView({ scene }: { scene: PoemScene }) {
  const load = useScene((s) => s.load);
  const mode = useScene((s) => s.mode);
  const setMode = useScene((s) => s.setMode);
  const revealing = useScene((s) => s.revealing);
  const clearRevealing = useScene((s) => s.clearRevealing);
  const panelOpen = useScene((s) => s.panelOpen);
  const togglePanel = useScene((s) => s.togglePanel);

  const [phase, setPhase] = useState<'card' | 'build' | 'done'>('card');
  const [sound, setSound] = useState(false);
  const [sealed, setSealed] = useState(false);

  useEffect(() => {
    load(scene);
  }, [scene, load]);

  // Let the loading card paint before the world build blocks the main thread.
  useEffect(() => {
    const t = setTimeout(() => setPhase('build'), 90);
    return () => clearTimeout(t);
  }, [scene]);

  const onReady = useCallback(() => setPhase('done'), []);

  // Audio can only be created from a gesture, so this lives behind a toggle —
  // and silence is a legitimate way to read a poem anyway.
  const toggleSound = useCallback(() => {
    setSound((on) => {
      if (on) ambience.stop();
      else void ambience.start();
      return !on;
    });
  }, []);

  useEffect(() => () => ambience.stop(), []);

  // A line you have just reached holds the middle of the screen for a beat,
  // then hands over to the inscription, where it stays inked.
  useEffect(() => {
    if (!revealing) return;
    const t = setTimeout(clearRevealing, 2200);
    return () => clearTimeout(t);
  }, [revealing, clearRevealing]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') togglePanel(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePanel]);

  const found = useScene((s) => s.found);
  const complete = found.length === scene.lines.length;

  // The poem coming whole deserves a beat of its own, once.
  useEffect(() => {
    if (!complete) {
      setSealed(false);
      return;
    }
    const t = setTimeout(() => setSealed(true), 1400);
    return () => clearTimeout(t);
  }, [complete]);

  const revealed = scene.landmarks.find((l) => l.id === revealing);

  return (
    <main className="scene-page">
      {phase !== 'card' && <SceneCanvas scene={scene} onReady={onReady} />}

      <div className="topbar">
        <Link href="/" className="topbar__home">
          卧游
        </Link>

        <div className="topbar__modes">
          {MODES.map(([m, label]) => (
            <button
              key={m}
              type="button"
              className="mode-tab"
              data-on={mode === m}
              onClick={() => setMode(m)}
            >
              {label}
            </button>
          ))}
        </div>

        <button type="button" className="pill" data-on={panelOpen} onClick={() => togglePanel()}>
          天时
        </button>

        <button type="button" className="pill" data-on={sound} onClick={toggleSound} title="松风 · 泉声 · 竹喧">
          {sound ? '闻声' : '寂'}
        </button>

        <div className="topbar__spacer" />
      </div>

      {mode === 'roam' && <Thumbstick />}

      {mode === 'roam' && (
        <div className="hud__keys">
          <kbd>W</kbd>
          <kbd>A</kbd>
          <kbd>S</kbd>
          <kbd>D</kbd> 行 · <kbd>Shift</kbd> 疾 · 拖动转身 · 循径而行
        </div>
      )}

      <Inscription scene={scene} />

      {panelOpen && <Panel scene={scene} />}
      {mode === 'compose' && <Palette scene={scene} />}

      {revealed && (
        <div className="reveal" key={revealed.id}>
          <p className="reveal__line">{scene.lines[revealed.line].text}</p>
        </div>
      )}

      {sealed && (
        <div className="sealed" key="sealed" onAnimationEnd={() => setSealed(false)}>
          <p className="sealed__mark" style={{ background: scene.palette.accent }}>
            游毕
          </p>
          <p className="sealed__note">
            {scene.title} · {scene.lines.length}句俱全 · 韵在{scene.rhymeName}
          </p>
        </div>
      )}

      <LoadingCard scene={scene} done={phase === 'done'} />
    </main>
  );
}
