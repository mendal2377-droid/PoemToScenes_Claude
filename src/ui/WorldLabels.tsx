'use client';

import { useScene } from '@/lib/store';
import type { LabelBus } from '@/three/Labels';
import type { PoemScene } from '@/lib/types';

/**
 * The seals and verse slips that float in the scene.
 *
 * They are ordinary DOM, laid over the canvas and moved each frame by the
 * projector. That keeps Chinese type rendering with the system's calligraphic
 * font — which no in-canvas text can do without shipping a CJK font file — and
 * leaves them in the page's own stacking order, safely under the interface.
 */
export function WorldLabels({ scene, bus }: { scene: PoemScene; bus: LabelBus }) {
  const found = useScene((s) => s.found);
  const mode = useScene((s) => s.mode);
  const find = useScene((s) => s.find);
  const p = scene.palette;

  return (
    <div className="world-labels" aria-hidden={false}>
      {scene.landmarks.map((lm) => {
        const isFound = found.includes(lm.id);
        return (
          <div
            key={lm.id}
            className="world-label"
            ref={(el) => {
              bus.els.set(lm.id, el);
            }}
          >
            {isFound ? (
              <div className="verse-slip" style={{ borderColor: p.accent }}>
                <span className="verse-slip__text">{scene.lines[lm.line]}</span>
                <span className="verse-slip__seal" style={{ background: p.accent }}>
                  {lm.label}
                </span>
              </div>
            ) : (
              <button
                type="button"
                className="seal seal--waiting"
                style={{ background: p.accent }}
                onClick={() => {
                  // Free view has no walking, so the seal itself is the way in.
                  if (mode !== 'roam') find(lm.id);
                }}
                title={mode === 'roam' ? '走到此处' : '点此拾取'}
              >
                {lm.label}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
