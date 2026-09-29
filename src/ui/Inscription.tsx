'use client';

import type React from 'react';
import { useScene } from '@/lib/store';
import type { PoemScene } from '@/lib/types';

/**
 * 题款 — the poem inscribed on the painting.
 *
 * A Chinese landscape carries its poem written onto the picture itself, in
 * vertical columns read right to left, signed and sealed. That is where the text
 * belongs, so the whole poem is here from the first moment: a reader can take it
 * in before walking a single step.
 *
 * Walking no longer *reveals* the words, it inks them. A line you have not
 * reached sits in 淡墨, pale and slightly withdrawn; reaching its place brings it
 * up to full ink. Nothing is hidden and nothing has to be collected — the
 * landscape and the text simply agree with each other a little more each time.
 */
export function Inscription({ scene }: { scene: PoemScene }) {
  const found = useScene((s) => s.found);
  const near = useScene((s) => s.near);
  const mode = useScene((s) => s.mode);
  const open = useScene((s) => s.inscriptionOpen);
  const toggleInscription = useScene((s) => s.toggleInscription);
  const setFocus = useScene((s) => s.setFocus);
  const find = useScene((s) => s.find);

  // Each line knows the place it belongs to.
  const placeOf = new Map(scene.landmarks.map((l) => [l.line, l]));
  const inked = new Set(
    scene.landmarks.filter((l) => found.includes(l.id)).map((l) => l.line)
  );
  const complete = inked.size === scene.lines.length;

  return (
    <div
      className="inscription"
      data-open={open}
      style={{ '--ins-paper': scene.palette.paper } as React.CSSProperties}
    >
      <button
        type="button"
        className="inscription__title"
        onClick={() => toggleInscription()}
        title={open ? '收卷' : '展卷'}
      >
        {scene.title}
      </button>

      {open && (
        <>
          {scene.lines.map((line, i) => {
            const place = placeOf.get(i);
            const isInked = inked.has(i);
            const isNear = !!place && near === place.id;

            return (
              <button
                key={i}
                type="button"
                className="inscription__line"
                data-inked={isInked}
                data-near={isNear}
                disabled={!place}
                title={place ? (mode === 'roam' ? `走到${place.label}` : `移步${place.label}`) : undefined}
                onClick={() => {
                  if (!place) return;
                  if (mode === 'roam') return;
                  // In free view there is no walking, so the inscription is the
                  // way to move: the camera goes to the place the line describes.
                  setFocus(place.id);
                  find(place.id);
                }}
              >
                {line}
              </button>
            );
          })}

          <span className="inscription__sign">
            〔{scene.dynasty}〕{scene.author}
            <span className="inscription__seal" data-on={complete} style={{ borderColor: scene.palette.accent, color: scene.palette.accent }}>
              {complete ? '游毕' : '卧游'}
            </span>
          </span>
        </>
      )}
    </div>
  );
}
