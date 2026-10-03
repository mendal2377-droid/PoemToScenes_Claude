'use client';

import type React from 'react';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

const SPREAD_MS = 720;

/**
 * A link into a scene that wets the sheet first.
 *
 * Choosing a poem spreads a wash of clean paper out from where you touched,
 * with a faint tide line at its edge, until the shelf is gone; then the scene
 * loads on that paper, and its painting arrives as a drop of ink (InkPass).
 * A modified click — new tab, new window — is left to the browser.
 */
export function InkLink({
  href,
  className,
  title,
  children,
}: {
  href: string;
  className?: string;
  title?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const circle = useRef<SVGCircleElement>(null);
  const tide = useRef<SVGCircleElement>(null);

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    e.preventDefault();
    router.prefetch(href);
    const x = e.clientX || window.innerWidth / 2;
    const y = e.clientY || window.innerHeight / 2;
    setAt({ x, y });
    const far = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) * 1.35;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / SPREAD_MS);
      // Water spreads fast and then creeps.
      const r = far * (1 - Math.pow(1 - p, 2.6));
      circle.current?.setAttribute('r', String(r));
      tide.current?.setAttribute('r', String(r));
      if (p < 1) requestAnimationFrame(step);
      else router.push(href);
    };
    requestAnimationFrame(step);
  };

  return (
    <>
      <Link href={href} className={className} title={title} onClick={onClick}>
        {children}
      </Link>
      {at &&
        createPortal(
        <svg className="ink-wash" aria-hidden>
          <defs>
            <filter id="ink-wash-edge" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="3" seed="11" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="70" />
            </filter>
          </defs>
          <g filter="url(#ink-wash-edge)">
            <circle ref={tide} cx={at.x} cy={at.y} r={0} fill="none" stroke="#5b564c" strokeOpacity={0.28} strokeWidth={14} />
            <circle ref={circle} cx={at.x} cy={at.y} r={0} fill="var(--paper)" />
          </g>
        </svg>,
          document.body
        )}
    </>
  );
}
