'use client';

import { useEffect, useRef, useState } from 'react';
import { touchInput } from '@/lib/touch';

/**
 * A thumbstick for walking on a touch screen.
 *
 * Roaming was keyboard-only, which meant anyone opening the link on a phone
 * could look at the painting but never walk into it. The stick writes into a
 * plain module object rather than React state, because the walk loop reads it
 * every frame and re-rendering at frame rate to move a figure would be absurd.
 *
 * It only mounts for coarse pointers, so a mouse user never sees it.
 */
export function Thumbstick() {
  const padRef = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const apply = () => setCoarse(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const pad = padRef.current;
    if (!pad) return;

    let id: number | null = null;

    const measure = (e: PointerEvent) => {
      const r = pad.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const radius = r.width / 2;
      let dx = (e.clientX - cx) / radius;
      let dy = (e.clientY - cy) / radius;
      const len = Math.hypot(dx, dy);
      if (len > 1) {
        dx /= len;
        dy /= len;
      }
      // Screen y grows downward; forward is up.
      touchInput.x = dx;
      touchInput.y = -dy;
      touchInput.active = true;
      setKnob({ x: dx, y: dy });
    };

    const down = (e: PointerEvent) => {
      if (id !== null) return;
      id = e.pointerId;
      pad.setPointerCapture(e.pointerId);
      setActive(true);
      measure(e);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      e.preventDefault();
      measure(e);
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = null;
      if (pad.hasPointerCapture(e.pointerId)) pad.releasePointerCapture(e.pointerId);
      touchInput.x = 0;
      touchInput.y = 0;
      touchInput.active = false;
      setActive(false);
      setKnob({ x: 0, y: 0 });
    };

    pad.addEventListener('pointerdown', down);
    pad.addEventListener('pointermove', move);
    pad.addEventListener('pointerup', up);
    pad.addEventListener('pointercancel', up);
    return () => {
      pad.removeEventListener('pointerdown', down);
      pad.removeEventListener('pointermove', move);
      pad.removeEventListener('pointerup', up);
      pad.removeEventListener('pointercancel', up);
      touchInput.x = 0;
      touchInput.y = 0;
      touchInput.active = false;
    };
  }, [coarse]);

  if (!coarse) return null;

  return (
    <div className="stick" ref={padRef} data-active={active} aria-hidden>
      <span
        className="stick__knob"
        style={{ transform: `translate(${knob.x * 26}px, ${knob.y * 26}px)` }}
      />
      <span className="stick__label">行</span>
    </div>
  );
}
