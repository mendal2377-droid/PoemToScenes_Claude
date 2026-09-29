'use client';

import type React from 'react';
import { useState } from 'react';
import { useScene } from '@/lib/store';
import type { PoemScene, Verse } from '@/lib/types';

/**
 * One line, written as a column of characters.
 *
 * Characters are spans rather than a single text node because the line carries
 * more than its words: the last character of a rhyming line wears a vermilion
 * ring, and in 平仄 mode every character shows whether it is 平 (hollow) or 仄
 * (filled). Seeing that pattern run down the column is how the shape of a
 * 五言律诗 becomes visible rather than merely described.
 */
function Line({
  verse,
  index,
  scene,
  inked,
  near,
  tones,
  onPick,
  onHover,
}: {
  verse: Verse;
  index: number;
  scene: PoemScene;
  inked: boolean;
  near: boolean;
  tones: boolean;
  onPick: (index: number) => void;
  onHover: (index: number | null) => void;
}) {
  const chars = [...verse.text];
  const place = scene.landmarks.find((l) => l.line === index);

  return (
    <button
      type="button"
      className="inscription__line"
      data-inked={inked}
      data-near={near}
      data-tones={tones}
      disabled={!place}
      onClick={() => onPick(index)}
      onPointerEnter={() => onHover(index)}
      onPointerLeave={() => onHover(null)}
      onFocus={() => onHover(index)}
      onBlur={() => onHover(null)}
    >
      {chars.map((ch, k) => (
        <span
          key={k}
          className="ch"
          data-tone={verse.tones[k] === 'z' ? 'z' : 'p'}
          data-rhyme={verse.rhyme && k === chars.length - 1}
        >
          {ch}
        </span>
      ))}
    </button>
  );
}

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
 * up to full ink. Nothing is hidden and nothing has to be collected.
 */
export function Inscription({ scene }: { scene: PoemScene }) {
  const found = useScene((s) => s.found);
  const near = useScene((s) => s.near);
  const mode = useScene((s) => s.mode);
  const open = useScene((s) => s.inscriptionOpen);
  const toggleInscription = useScene((s) => s.toggleInscription);
  const setFocus = useScene((s) => s.setFocus);
  const find = useScene((s) => s.find);

  const [tones, setTones] = useState(false);
  const [hover, setHover] = useState<number | null>(null);

  const placeOf = new Map(scene.landmarks.map((l) => [l.line, l]));
  const inked = new Set(
    scene.landmarks.filter((l) => found.includes(l.id)).map((l) => l.line)
  );
  const complete = inked.size === scene.lines.length;

  // Which lines belong to a 对仗 pair, so the pairs can be bracketed together.
  const pairOf = new Map<number, number>();
  scene.couplets.forEach(([a, b], i) => {
    pairOf.set(a, i);
    pairOf.set(b, i);
  });

  const pick = (index: number) => {
    const place = placeOf.get(index);
    if (!place || mode === 'roam') return;
    // Free view has no walking, so the inscription is how you travel.
    setFocus(place.id);
    find(place.id);
  };

  const lineProps = (i: number) => {
    const place = placeOf.get(i);
    return {
      verse: scene.lines[i],
      index: i,
      scene,
      inked: inked.has(i),
      near: !!place && near === place.id,
      tones,
      onPick: pick,
      onHover: setHover,
    };
  };

  // Walk the lines, grouping any 对仗 pair into one bracketed block.
  const blocks: React.ReactNode[] = [];
  for (let i = 0; i < scene.lines.length; i++) {
    const pair = pairOf.get(i);
    const partner = pair !== undefined ? scene.couplets[pair] : null;
    if (partner && partner[0] === i) {
      blocks.push(
        <div className="couplet" key={`c${pair}`} title="对仗 — 两句字字相对">
          <Line key={partner[1]} {...lineProps(partner[1])} />
          <Line key={partner[0]} {...lineProps(partner[0])} />
        </div>
      );
      i = partner[1];
    } else {
      blocks.push(<Line key={i} {...lineProps(i)} />);
    }
  }

  const noted = hover !== null ? scene.lines[hover] : null;

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
          {blocks}

          <span className="inscription__sign">
            〔{scene.dynasty}〕{scene.author}
            {scene.kind !== 'prose' && (
            <button
              type="button"
              className="inscription__tones"
              data-on={tones}
              onClick={() => setTones((t) => !t)}
              title={`平仄 · 韵 ${scene.rhymeName}`}
            >
              平仄
            </button>
            )}
            <span
              className="inscription__seal"
              data-on={complete}
              style={{ borderColor: scene.palette.accent, color: scene.palette.accent }}
            >
              {complete ? '游毕' : '卧游'}
            </span>
          </span>

          {/* 注释 — one sentence on whichever line the reader is looking at. */}
          {noted && (
            <div className="gloss" key={hover}>
              <span className="gloss__line">{noted.text}</span>
              <span className="gloss__text">{noted.note}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
