import { terrainHeight } from './terrain';
import type { PoemScene } from './types';

/**
 * Checks a poem's data before it can ship.
 *
 * Two landmarks reached production sitting inside a pond, so walking to them
 * put the camera under the water. That class of mistake is invisible in the
 * type system and easy to make again across a shelf of poems, so every scene is
 * now checked at module load and a bad one fails the build rather than the
 * reader's walk.
 *
 * Messages carry the numbers needed to fix the entry, not just the fact that it
 * is wrong.
 */
export function validateScene(s: PoemScene): string[] {
  const e: string[] = [];
  const at = (label: string) => `[${s.id}] ${label}`;
  const limit = s.terrain.extent * 0.84;

  // --- the poem itself -----------------------------------------------------
  s.lines.forEach((v, i) => {
    const chars = [...v.text].length;
    if (v.tones.length !== chars) {
      e.push(at(`line ${i} "${v.text}" has ${chars} characters but ${v.tones.length} tone marks`));
    }
    if (!/^[pz]+$/.test(v.tones)) {
      e.push(at(`line ${i} tones "${v.tones}" must be only p (平) and z (仄)`));
    }
    if (!v.note.trim()) e.push(at(`line ${i} has no 注释`));
  });

  for (const [a, b] of s.couplets) {
    if (a < 0 || b >= s.lines.length || a >= b) {
      e.push(at(`couplet [${a}, ${b}] is out of range or not in order`));
    }
    if (b !== a + 1) e.push(at(`couplet [${a}, ${b}] is not a pair of adjacent lines`));
  }

  // --- one landmark per line, no duplicates --------------------------------
  const byLine = new Map<number, string>();
  for (const lm of s.landmarks) {
    if (lm.line < 0 || lm.line >= s.lines.length) {
      e.push(at(`landmark ${lm.id} points at line ${lm.line}, which does not exist`));
    }
    const prev = byLine.get(lm.line);
    if (prev) e.push(at(`line ${lm.line} is claimed by both ${prev} and ${lm.id}`));
    byLine.set(lm.line, lm.id);
  }
  for (let i = 0; i < s.lines.length; i++) {
    if (!byLine.has(i)) e.push(at(`line ${i} "${s.lines[i].text}" has nowhere to stand`));
  }

  // --- everything the traveller walks to must be reachable dry land --------
  const onLand = (label: string, x: number, z: number, margin = 0) => {
    const d = Math.hypot(x, z);
    if (d > limit) {
      e.push(at(`${label} at (${x}, ${z}) is ${Math.round(d)} from centre, past the walkable limit of ${Math.round(limit)}`));
    }
    for (const b of s.terrain.basins) {
      const inside = Math.hypot(x - b.x, z - b.z);
      const needed = b.r + margin;
      if (inside < needed) {
        e.push(
          at(
            `${label} at (${x}, ${z}) is inside the water at (${b.x}, ${b.z}) r=${b.r} — ` +
              `move it ${Math.ceil(needed - inside)} further out`
          )
        );
      }
    }
  };

  for (const lm of s.landmarks) onLand(`landmark ${lm.id}`, lm.x, lm.z, 1);
  onLand('start', s.start.x, s.start.z, 2);
  if (s.pavilion) onLand('pavilion', s.pavilion.x, s.pavilion.z, 2);

  // --- and the boat must be *in* the water ---------------------------------
  if (s.boat) {
    const floating = s.terrain.basins.some(
      (b) => Math.hypot(s.boat!.x - b.x, s.boat!.z - b.z) < b.r * 0.92
    );
    if (!floating) e.push(at(`boat at (${s.boat.x}, ${s.boat.z}) is not on any water`));
  }

  // --- scenery should sit inside the world ---------------------------------
  const inBounds = (label: string, x: number, z: number, r: number) => {
    if (Math.hypot(x, z) + r > s.terrain.extent) {
      e.push(at(`${label} at (${x}, ${z}) r=${r} reaches past the terrain edge (${s.terrain.extent})`));
    }
  };
  s.flora.pines.clusters.forEach((c, i) => inBounds(`pine cluster ${i}`, c.x, c.z, c.r));
  s.flora.bamboo.groves.forEach((c, i) => inBounds(`bamboo grove ${i}`, c.x, c.z, c.r));
  s.flora.broadleaf.clusters.forEach((c, i) => inBounds(`broadleaf cluster ${i}`, c.x, c.z, c.r));

  // --- a start point on a cliff is a bad first impression ------------------
  const h = terrainHeight(s.start.x, s.start.z, s.terrain);
  const slope = Math.abs(h - terrainHeight(s.start.x + 2, s.start.z, s.terrain)) / 2;
  if (slope > 0.9) e.push(at(`start at (${s.start.x}, ${s.start.z}) is on a ${slope.toFixed(1)}:1 slope`));

  return e;
}

/** Validates every scene, and refuses to let a broken one build. */
export function validateAll(scenes: readonly PoemScene[]) {
  const errors = scenes.flatMap(validateScene);
  if (errors.length) {
    throw new Error(`Poem data is invalid:\n  ${errors.join('\n  ')}`);
  }
}
