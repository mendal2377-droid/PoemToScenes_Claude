import { InkLink } from './InkLink';
import { Rng } from '@/lib/noise';
import type { ShelfEntry } from '@/lib/poems';

const W = 110;
const H = 468;

/** A soft ridge line across the strip, drawn as a smooth polyline. */
function ridgePath(baseY: number, amp: number, peaks: number, rng: Rng): string {
  const pts: [number, number][] = [];
  for (let i = 0; i <= peaks; i++) {
    const x = (i / peaks) * W;
    pts.push([x, baseY - Math.pow(rng.next(), 1.5) * amp]);
  }
  let d = `M -8 ${H + 8} L -8 ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    d += ` Q ${x0} ${y0} ${(x0 + x1) / 2} ${(y0 + y1) / 2}`;
  }
  d += ` L ${W + 8} ${pts[pts.length - 1][1]} L ${W + 8} ${H + 8} Z`;
  return d;
}

/**
 * The silhouette of a single downward brushstroke.
 *
 * An feTurbulence displacement filter was the first attempt and it barely read
 * at this size. Tracing the outline directly is both more legible and exactly
 * repeatable: down the right edge, back up the left, with the width breathing
 * and the ends dragging off the way a loaded brush actually leaves the paper.
 */
function brushOutline(rng: Rng): string {
  const steps = 16;
  const cx = W / 2;
  const half = W / 2 - 3;
  const top = 4;
  const bottom = H + 10;

  const edge = (side: 1 | -1) => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const y = top + (bottom - top) * t;
      // The brush lands narrow at the top and then runs at full width. Tapering
      // both ends made the strips read as test tubes floating off the shelf.
      const land = Math.min(1, t / 0.22);
      const taper = 0.58 + 0.42 * (land * land * (3 - 2 * land));
      const wobble = (rng.next() - 0.5) * 7;
      pts.push([cx + side * (half * taper + wobble), y]);
    }
    return pts;
  };

  const right = edge(1);
  const left = edge(-1).reverse();
  const all = [...right, ...left];

  let d = `M ${all[0][0]} ${all[0][1]}`;
  for (let i = 1; i < all.length; i++) {
    const [px, py] = all[i - 1];
    const [x, y] = all[i];
    d += ` Q ${px} ${py} ${(px + x) / 2} ${(py + y) / 2}`;
  }
  return d + ' Z';
}

/**
 * One poem on the shelf, painted as a single vertical brushstroke.
 *
 * The art is always drawn at full height but the strip is short, so hovering —
 * which grows the strip — literally unrolls more of the scroll: the sky, the
 * moon and the far peaks come into view from the top.
 */
export function ScrollStrip({ entry }: { entry: ShelfEntry }) {
  const rng = new Rng(
    entry.id.split('').reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7) || 3
  );
  const p = entry.palette;
  const uid = `s-${entry.id}`;

  const far = ridgePath(238, 96, 5, rng);
  const near = ridgePath(300, 62, 7, rng);
  const hill = ridgePath(352, 30, 6, rng);
  const moonY = 108 + rng.next() * 50;
  const moonX = 26 + rng.next() * 58;
  const treeX = 20 + rng.next() * 16;
  const tree2X = 76 + rng.next() * 16;
  const outline = brushOutline(rng);

  const art = (
    <div className="scroll-strip__art">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.skyHigh} />
            <stop offset="100%" stopColor={p.skyLow} />
          </linearGradient>
          <clipPath id={`${uid}-brush`}>
            <path d={outline} />
          </clipPath>
        </defs>

        <g clipPath={`url(#${uid}-brush)`}>
          <rect x="-8" y="-8" width={W + 16} height={H + 16} fill={`url(#${uid}-sky)`} />
          <circle cx={moonX} cy={moonY} r="17" fill={p.moon} opacity="0.85" />
          <path d={far} fill={p.mountainFar} opacity="0.92" />
          <path d={near} fill={p.mountainNear} />
          <path d={hill} fill={p.groundHigh} />
          <rect x="-8" y="396" width={W + 16} height={H - 388} fill={p.water} opacity="0.92" />

          {/* A tree or two in the foreground, to give the strip a near plane. */}
          <g fill={p.foliageDark}>
            <ellipse cx={treeX} cy={366} rx="15" ry="26" opacity="0.9" />
            <rect x={treeX + 5} y={366} width="3" height="32" fill={p.trunk} />
            <ellipse cx={tree2X} cy={382} rx="11" ry="19" opacity="0.78" />
            <rect x={tree2X + 3} y={382} width="2.5" height="20" fill={p.trunk} />
          </g>

          {/* The dry-brush streaks that run the length of any real stroke. */}
          <g opacity="0.14" fill={p.paper}>
            <rect x="18" y="0" width="2" height={H} />
            <rect x="52" y="0" width="1.4" height={H} />
            <rect x="83" y="0" width="2.4" height={H} />
          </g>
        </g>
      </svg>
    </div>
  );

  const caption = (
    <span className="scroll-strip__caption">
      <span className="scroll-strip__title">{entry.title}</span>
      <span className="scroll-strip__meta">
        {entry.dynasty} · {entry.author}
        {!entry.available && ' · 未启'}
      </span>
    </span>
  );

  if (!entry.available) {
    return (
      <div
        className="scroll-strip scroll-strip--locked"
        title={`${entry.title} — ${entry.note}（尚未绘成）`}
        aria-disabled
      >
        {art}
        {caption}
      </div>
    );
  }

  return (
    <InkLink href={`/scene/${entry.id}`} className="scroll-strip" title={entry.note}>
      {art}
      {caption}
    </InkLink>
  );
}
