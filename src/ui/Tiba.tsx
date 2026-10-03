'use client';

import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { PoemScene } from '@/lib/types';

/** A character's strokes: outlines and medians, in a 1024 box with y up. */
type Glyph = { s: string[]; m: [number, number][][] };
type Glyphs = Record<string, Glyph>;

const cache = new Map<string, Promise<Glyphs | null>>();

/** Each scene's characters live in their own small file (scripts/build-strokes.js). */
export function loadGlyphs(id: string): Promise<Glyphs | null> {
  let p = cache.get(id);
  if (!p) {
    p = fetch(`/strokes/${id}.json`)
      .then((r) => (r.ok ? (r.json() as Promise<Glyphs>) : null))
      .catch(() => null);
    cache.set(id, p);
  }
  return p;
}

/** 朱砂 — the red of a seal, whatever the painting's own palette. */
const CINNABAR = '#b5302a';
/** Brush speed, in glyph units per second, and the breath between strokes. */
const SPEED = 1500;
const LIFT = 0.07;
const BETWEEN_CHARS = 0.16;
const HOLD = 2.2;
const FADE = 1.3;

/** Clauses become columns; the punctuation is not written, as on any painting. */
function columnsOf(text: string): string[] {
  return text
    .split(/[，。；：、？！,.;:?!\s]+/)
    .map((c) => c.trim())
    .filter(Boolean);
}

function medianLength(m: [number, number][]): number {
  let L = 0;
  for (let i = 1; i < m.length; i++) L += Math.hypot(m[i][0] - m[i - 1][0], m[i][1] - m[i - 1][1]);
  return L;
}

type Stroke = { outline: string; median: string; length: number; delay: number; dur: number };

/** Lay a run of characters out stroke by stroke, with each stroke's start time. */
function schedule(chars: string[], glyphs: Glyphs, start: number) {
  let t = start;
  const out = chars.map((ch) => {
    const g = glyphs[ch];
    if (!g) return null;
    const strokes: Stroke[] = g.s.map((outline, i) => {
      const m = g.m[i];
      // The brush has to start a little before the median and end past it, or
      // the rounded ends of the outline are left unpainted.
      const length = medianLength(m) + 80;
      const dur = Math.max(0.12, length / SPEED);
      const s: Stroke = {
        outline,
        median: `M ${m.map((p) => p.join(' ')).join(' L ')}`,
        length,
        delay: t,
        dur,
      };
      t += dur + LIFT;
      return s;
    });
    t += BETWEEN_CHARS;
    return { ch, strokes };
  });
  return { chars: out, end: t };
}

function GlyphStrokes({
  id,
  strokes,
  x,
  y,
  size,
  color,
  still,
}: {
  id: string;
  strokes: Stroke[];
  x: number;
  y: number;
  size: number;
  color: string;
  still: boolean;
}) {
  const k = size / 1024;
  return (
    <g transform={`translate(${x} ${y}) scale(${k}) translate(0 900) scale(1 -1)`}>
      <defs>
        {strokes.map((s, i) => (
          <clipPath key={i} id={`${id}-${i}`}>
            <path d={s.outline} />
          </clipPath>
        ))}
      </defs>
      {strokes.map((s, i) => (
        <path
          key={i}
          d={s.median}
          clipPath={`url(#${id}-${i})`}
          fill="none"
          stroke={color}
          strokeWidth={180}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={
            still
              ? undefined
              : ({
                  strokeDasharray: s.length,
                  strokeDashoffset: s.length,
                  animation: `tiba-brush ${s.dur}s cubic-bezier(0.45, 0.05, 0.4, 1) ${s.delay}s forwards`,
                } as React.CSSProperties)
          }
        />
      ))}
    </g>
  );
}

/**
 * 题跋 — a line written onto the painting, stroke by stroke, and sealed.
 *
 * A painter wrote the poem into the empty part of the picture with the brush
 * and pressed a seal beneath it; this does the same each time you arrive at a
 * line's place. The clauses become columns read right to left, every stroke is
 * drawn in its proper order and direction, and when the last one is down the
 * poet's seal goes on in cinnabar. Then the ink settles back into the paper and
 * the line stays in the inscription.
 */
export function Tiba({ scene, line, onDone }: { scene: PoemScene; line: number; onDone: () => void }) {
  const [glyphs, setGlyphs] = useState<Glyphs | null | undefined>(undefined);
  const still = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    []
  );

  useEffect(() => {
    let live = true;
    loadGlyphs(scene.id).then((g) => live && setGlyphs(g));
    return () => {
      live = false;
    };
  }, [scene.id]);

  const text = scene.lines[line].text;
  const cols = useMemo(() => columnsOf(text), [text]);

  // Size the characters so the longest column fits the height it is given.
  const longest = Math.max(...cols.map((c) => [...c].length));
  const cell = 100;
  const gap = cell * 0.42;
  const colH = longest * cell;

  const layout = useMemo(() => {
    if (!glyphs) return null;
    let t = 0.15;
    const columns = cols.map((c) => {
      const s = schedule([...c], glyphs, t);
      t = s.end + 0.1;
      return s.chars;
    });
    // A hand keeps its rhythm, not its speed: a line of dense characters is
    // written a little quicker, so no line takes much longer than its breath.
    const count = cols.reduce((n, c) => n + [...c].length, 0);
    const budget = Math.min(7, Math.max(2.5, count * 0.85));
    const f = Math.min(1, budget / t);
    for (const col of columns) {
      for (const g of col) {
        g?.strokes.forEach((s) => {
          s.delay *= f;
          s.dur *= f;
        });
      }
    }
    const seal = scene.author.length === 2 ? `${scene.author}之印` : `${scene.author}印`.slice(0, 4);
    return { columns, writtenBy: t * f, seal: [...seal] };
  }, [glyphs, cols, scene.author]);

  const total = layout ? (still ? 0.2 : layout.writtenBy) + 0.5 + HOLD + FADE : 4;

  useEffect(() => {
    if (glyphs === undefined) return;
    const t = setTimeout(onDone, total * 1000);
    return () => clearTimeout(t);
  }, [glyphs, total, onDone]);

  if (glyphs === undefined) return null;

  // Without the stroke data the line still arrives, set in type.
  if (!layout) {
    return (
      <div className="reveal">
        <p className="reveal__line">{text}</p>
      </div>
    );
  }

  const ink = scene.paint === 'night' ? '#14161c' : scene.palette.ink;
  const width = cols.length * cell + (cols.length - 1) * gap;
  const sealSize = cell * 0.82;
  const sealAt = layout.writtenBy + 0.15;
  const height = colH + gap + sealSize;
  const uid = `tb${line}`;

  return (
    <div
      className="tiba"
      style={
        {
          '--tiba-hold': `${total - FADE}s`,
          '--tiba-fade': `${FADE}s`,
          '--tiba-cols': cols.length,
          '--tiba-rows': longest,
          '--tiba-paper': scene.palette.paper,
          // At night the ink needs more paper under it to be read at all.
          '--tiba-halo': scene.paint === 'night' ? '80%' : '46%',
        } as React.CSSProperties
      }
    >
      <svg viewBox={`-20 -20 ${width + 40} ${height + 40}`} className="tiba__sheet" aria-label={text} role="img">
        <defs>
          {/* Ink that has soaked a little into the paper: a soft edge and a ragged one. */}
          <filter id="tiba-ink" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" result="d" />
            <feGaussianBlur in="d" stdDeviation="0.5" />
          </filter>
          <filter id="tiba-seal" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="2" seed="3" result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.55" result="holes" />
            <feComposite in="SourceGraphic" in2="holes" operator="in" result="worn" />
            <feDisplacementMap in="worn" in2="n" scale="3" />
          </filter>
        </defs>

        <g filter="url(#tiba-ink)">
          {layout.columns.map((col, ci) => {
            // Right to left.
            const x = width - cell - ci * (cell + gap);
            return col.map((g, ri) =>
              g ? (
                <GlyphStrokes
                  key={`${ci}-${ri}`}
                  id={`${uid}-${ci}-${ri}`}
                  strokes={g.strokes}
                  x={x}
                  y={ri * cell}
                  size={cell}
                  color={ink}
                  still={still}
                />
              ) : null
            );
          })}
        </g>

        {/* The seal, under the last column, pressed once the writing is done. */}
        <g
          className="tiba__seal"
          style={{ animationDelay: `${still ? 0 : sealAt}s`, transformOrigin: `${sealSize / 2}px ${colH + gap + sealSize / 2}px` }}
          filter="url(#tiba-seal)"
        >
          <rect x={0} y={colH + gap} width={sealSize} height={sealSize} rx={4} fill={CINNABAR} />
          {layout.seal.map((ch, i) => {
            const g = glyphs![ch];
            if (!g) return null;
            // 2×2, read right column first, top to bottom.
            const q = sealSize * 0.4;
            const pad = sealSize * 0.07;
            const cx = i < 2 ? sealSize - pad - q : pad;
            const cy = colH + gap + pad + (i % 2) * (q + sealSize * 0.06);
            return (
              <g key={i} transform={`translate(${cx} ${cy}) scale(${q / 1024}) translate(0 900) scale(1 -1)`}>
                {g.s.map((d, j) => (
                  <path key={j} d={d} fill="#f6ead8" />
                ))}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
