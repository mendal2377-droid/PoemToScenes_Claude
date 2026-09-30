import { distToPath, smoothstep } from './noise';
import { inWater, riverWidth, terrainHeight } from './terrain';
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
    // Prose has no tonal pattern to check; a story is not scanned.
    if (s.kind !== 'prose') {
      if (v.tones.length !== chars) {
        e.push(at(`line ${i} "${v.text}" has ${chars} characters but ${v.tones.length} tone marks`));
      }
      if (!/^[pz]+$/.test(v.tones)) {
        e.push(at(`line ${i} tones "${v.tones}" must be only p (平) and z (仄)`));
      }
    }
    // A column of characters is read top to bottom; past this it runs off the screen.
    if (chars > 18) e.push(at(`line ${i} is ${chars} characters — break it into clauses of 18 or fewer`));
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
    for (const rv of s.terrain.rivers ?? []) {
      const { dist, t } = distToPath(x, z, rv.path);
      const end = smoothstep(0.02, 0.16, t) * (1 - smoothstep(0.84, 0.98, t));
      const w = riverWidth(rv, t);
      const reach = w * 0.5 + w * 0.36 * 0.45 + margin;
      if (end > 0.5 && dist < reach) {
        e.push(
          at(
            `${label} at (${x}, ${z}) is ${Math.round(dist)} from the river's centre line but the water reaches ` +
              `${Math.round(reach)} — move it ${Math.ceil(reach - dist)} further out`
          )
        );
      }
    }
    for (const c of s.terrain.channels) {
      if (distToPath(x, z, c.path).dist < c.width * 0.42 + margin && label.startsWith('start')) {
        e.push(at(`${label} at (${x}, ${z}) is in the brook`));
      }
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

  // --- and the boat must be where it says it is ----------------------------
  for (const boat of [s.boat, ...(s.boats ?? [])]) {
    if (!boat) continue;
    const on = boat.on ?? 'basin';
    if (on === 'basin') {
      const floating = s.terrain.basins.some((b) => Math.hypot(boat!.x - b.x, boat!.z - b.z) < b.r * 0.92);
      if (!floating) e.push(at(`boat at (${boat.x}, ${boat.z}) is not on any pond`));
    } else if (on === 'river') {
      const afloat = (s.terrain.rivers ?? []).some((rv) => {
        const { dist, t } = distToPath(boat!.x, boat!.z, rv.path);
        return dist < riverWidth(rv, t) * 0.42;
      });
      if (!afloat) e.push(at(`boat at (${boat.x}, ${boat.z}) is not on the river`));
    } else if (on === 'stream') {
      const inBrook = s.terrain.channels.some((c) => distToPath(boat!.x, boat!.z, c.path).dist < c.width * 0.42);
      if (!inBrook) e.push(at(`boat at (${boat.x}, ${boat.z}) is not in the brook`));
    } else if (inWater(boat.x, boat.z, s.terrain)) {
      e.push(at(`boat at (${boat.x}, ${boat.z}) is meant to be on the bank but is in the water`));
    }
  }

  // --- every line has something to look at ----------------------------------
  // Choosing a line stands you where the poet stood, facing its subject. A
  // landmark with nothing to face would drop you on the spot looking at nothing
  // in particular, so every one has to say what it is looking at.
  for (const lm of s.landmarks) {
    if (!lm.look) e.push(at(`landmark ${lm.id} (line ${lm.line}) has no look target`));
  }

  // --- the people, the birds, and the things that are heard ------------------
  s.people?.forEach((q, i) => {
    if (inWater(q.x, q.z, s.terrain)) e.push(at(`person ${i} (${q.role}) at (${q.x}, ${q.z}) is standing in the water`));
  });
  s.animals?.forEach((q, i) => {
    // Egrets and frogs stand at the edge, so the water itself is the only thing ruled out.
    if (inWater(q.x, q.z, s.terrain)) e.push(at(`animal ${i} (${q.kind}) at (${q.x}, ${q.z}) is in the water`));
  });
  s.props?.forEach((q, i) => {
    if (inWater(q.x, q.z, s.terrain)) e.push(at(`prop ${i} at (${q.x}, ${q.z}) is in the water`));
  });
  s.sounds?.forEach((q, i) => {
    if (q.r <= 0) e.push(at(`sound ${i} (${q.kind}) has no radius`));
  });

  // --- dry-land set pieces --------------------------------------------------
  s.huts?.forEach((h, i) => {
    if (inWater(h.x, h.z, s.terrain)) e.push(at(`hut ${i} at (${h.x}, ${h.z}) is in the water`));
  });
  s.steles?.forEach((st, i) => {
    if (inWater(st.x, st.z, s.terrain)) e.push(at(`stele ${i} at (${st.x}, ${st.z}) is in the water`));
  });
  if (s.cave && Math.hypot(s.cave.x, s.cave.z) + s.cave.r > s.terrain.extent) {
    e.push(at(`cave at (${s.cave.x}, ${s.cave.z}) r=${s.cave.r} reaches past the terrain edge`));
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
