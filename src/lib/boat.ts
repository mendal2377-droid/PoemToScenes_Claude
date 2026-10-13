/**
 * The one boat the worlds use, in its own frame (z along it, bow at +z), so the
 * hull that is drawn and the seats the validator checks agree.
 */
export const BOAT = { length: 5.6, beam: 1.5, depth: 0.62 };

/** Half the beam at a point along the hull: widest amidships, a point at either end. */
export function boatHalfBeam(z: number): number {
  const t = z / BOAT.length + 0.5;
  if (t <= 0 || t >= 1) return 0;
  return (BOAT.beam / 2) * Math.pow(Math.sin(Math.PI * t), 0.55);
}

/** How far a seated figure's robe spreads from where they sit. */
export const SEATED_RADIUS = 0.35;
