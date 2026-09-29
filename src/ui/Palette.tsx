'use client';

import { useState } from 'react';
import { PLACEABLES, useScene, type PlaceableKind } from '@/lib/store';
import type { PoemScene } from '@/lib/types';

/** The colour each dab shows on the palette board. */
function dabColor(kind: PlaceableKind, p: PoemScene['palette']): string {
  switch (kind) {
    case 'pine':
      return p.foliageDark;
    case 'bamboo':
      return p.foliageLight;
    case 'maple':
      return p.accent;
    case 'rock':
      return p.mountainNear;
    case 'reed':
      return p.ochre;
    case 'cloud':
      return p.mist;
  }
}

/**
 * The painter's palette. Categories curve along the top edge, the dabs of
 * pigment sit below, and there is a thumb hole — without which the shape does
 * not read as a palette at all.
 */
export function Palette({ scene }: { scene: PoemScene }) {
  const [group, setGroup] = useState(PLACEABLES[0].id);
  const brush = useScene((s) => s.brush);
  const setBrush = useScene((s) => s.setBrush);

  const active = PLACEABLES.find((g) => g.id === group) ?? PLACEABLES[0];

  return (
    <div className="palette">
      <div className="palette__board" />
      <div className="palette__thumb" />

      <div className="palette__tabs">
        {PLACEABLES.map((g) => (
          <button
            key={g.id}
            type="button"
            className="palette__tab"
            data-on={g.id === group}
            onClick={() => setGroup(g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="palette__items">
        {active.items.map((it) => (
          <button
            key={it.kind}
            type="button"
            className="dab"
            data-on={brush === it.kind}
            onClick={() => setBrush(brush === it.kind ? null : it.kind)}
          >
            <span className="dab__blob" style={{ background: dabColor(it.kind, scene.palette) }} />
            <span className="dab__label">{it.label}</span>
          </button>
        ))}
      </div>

      <p className="palette__hint">{brush ? '点山水落笔' : '取一色'}</p>
    </div>
  );
}
