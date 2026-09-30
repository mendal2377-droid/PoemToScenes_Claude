'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The shelf's background: a slow wander through the poems, laid under the paper.
 *
 * The clips are not footage. Each one was recorded from the scene itself
 * (`/scene/<id>?film`), a few shots standing where the poem was written and
 * walking on at a stroller's pace, faded in and out of paper. They play one
 * after another and loop.
 *
 * It is a background, so it gives way: no motion for those who ask for none, no
 * download on a data saver or a phone, and the bare paper is there before the
 * first frame and instead of the film wherever it does not play.
 */
const CLIPS = ['shanju', 'chunjiang', 'taohuayuan', 'chile', 'xijiang', 'denggao', 'yinjiu', 'niaoming', 'jiangxue'];

/** The first frame of each clip is black; start a moment in. */
const SKIP = 0.3;

export function HeroFilm() {
  const [play, setPlay] = useState(false);
  const [i, setI] = useState(0);
  const [on, setOn] = useState(false);
  // If every clip in a row fails there is nothing to play; stop asking.
  const fails = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const narrow = window.matchMedia('(max-width: 640px)').matches;
    const saver = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    setPlay(!(reduce || narrow || saver));
  }, []);

  const next = () => {
    setOn(false);
    setTimeout(() => setI((n) => (n + 1) % CLIPS.length), 700);
  };

  return (
    <div className="hero-film" data-on={on} aria-hidden="true">
      {play && (
        <video
          key={CLIPS[i]}
          src={`/film/${CLIPS[i]}.mp4`}
          muted
          playsInline
          autoPlay
          preload="auto"
          disablePictureInPicture
          onLoadedMetadata={(e) => {
            e.currentTarget.currentTime = SKIP;
          }}
          onPlaying={() => {
            fails.current = 0;
            setOn(true);
          }}
          onEnded={next}
          onError={() => {
            if (++fails.current >= CLIPS.length) setPlay(false);
            else next();
          }}
        />
      )}
    </div>
  );
}
