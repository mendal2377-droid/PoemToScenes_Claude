'use client';

import { useScene } from '@/lib/store';
import type { PoemScene } from '@/lib/types';

/**
 * 诗笺 — the collected poem. Lines you have not reached yet are still there in
 * their place, blurred out: you can see the shape of what is missing, which is
 * the point of going to look for it.
 */
export function PoemSheet({ scene }: { scene: PoemScene }) {
  const found = useScene((s) => s.found);
  const toggleScroll = useScene((s) => s.toggleScroll);
  const resetFound = useScene((s) => s.resetFound);

  const foundLines = new Set(
    scene.landmarks.filter((l) => found.includes(l.id)).map((l) => l.line)
  );
  const complete = foundLines.size === scene.lines.length;

  return (
    <div
      className="scroll-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="诗笺"
      onClick={() => toggleScroll(false)}
    >
      <div className="scroll-sheet__paper" onClick={(e) => e.stopPropagation()}>
        <h2 className="scroll-sheet__title">{scene.title}</h2>
        <p className="scroll-sheet__by">
          〔{scene.dynasty}〕{scene.author}
        </p>

        <div className="verses">
          {scene.lines.map((line, i) => (
            <p key={i} className="verse" data-found={foundLines.has(i)}>
              {foundLines.has(i)
                ? line
                : line.split('').map((ch, k) => (
                    <span key={k} className="verse__char">
                      {ch}
                    </span>
                  ))}
            </p>
          ))}
        </div>

        <div className="scroll-sheet__foot">
          {complete ? (
            <span className="scroll-sheet__done">诗成 · 八句俱全</span>
          ) : (
            <span className="scroll-sheet__done">
              已得 {foundLines.size} / {scene.lines.length} 句
            </span>
          )}
          <button type="button" className="pill" onClick={() => resetFound()}>
            重走一遍
          </button>
          <button type="button" className="pill pill--solid" onClick={() => toggleScroll(false)}>
            收起
          </button>
        </div>
      </div>
    </div>
  );
}
