'use client';

import { useEffect, useState } from 'react';

/**
 * 观片 — the two-minute-or-less film about the app, on the shelf's foot.
 * The video is not fetched until it is asked for.
 */
export function IntroButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button type="button" className="intro-btn" onClick={() => setOpen(true)}>
        <span className="intro-btn__play" aria-hidden="true">
          ▷
        </span>
        观片 · Watch the film
      </button>
      {open && (
        <div className="intro-modal" role="dialog" aria-label="卧游 · 简介片" onClick={() => setOpen(false)}>
          <video
            className="intro-modal__video"
            src="/film/intro.mp4"
            controls
            autoPlay
            playsInline
            preload="auto"
            onClick={(e) => e.stopPropagation()}
          />
          <button type="button" className="intro-modal__close" onClick={() => setOpen(false)} aria-label="关闭">
            ×
          </button>
        </div>
      )}
    </>
  );
}
