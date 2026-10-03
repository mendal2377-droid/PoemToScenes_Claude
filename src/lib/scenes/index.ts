import type { PoemScene } from '../types';
import { validateAll } from '../validate';
import { terrainHeight } from '../terrain';
import { SHAN_JU } from './shanju-qiuming';
import { JIANG_XUE } from './jiang-xue';
import { CHUN_JIANG } from './chunjiang';
import { CHI_LE } from './chile';
import { DENG_GAO } from './denggao';
import { NIAO_MING } from './niaoming';
import { XI_JIANG } from './xijiang';
import { YIN_JIU } from './yinjiu';
import { TAO_HUA_YUAN } from './taohuayuan';
import { BAO_CHAN_SHAN } from './baochanshan';

/**
 * Level ground under what people have built or set down.
 *
 * A house on a hillside stands on a terrace cut for it, a stone table on a
 * scrap of levelled earth, a boat pulled up out of the water on the flat of the
 * bank — none of them tilts with the slope, and none of them hangs over it.
 * Each gets a pad at the height of the ground where it stands; so does a place
 * a line is read from, when it is on a steep side.
 */
function settle(s: PoemScene): PoemScene {
  const spec = s.terrain;
  const slope = (x: number, z: number) =>
    Math.hypot(
      terrainHeight(x + 0.8, z, spec) - terrainHeight(x - 0.8, z, spec),
      terrainHeight(x, z + 0.8, spec) - terrainHeight(x, z - 0.8, spec)
    ) / 1.6;
  const pads = [
    // Where a line is read from a mountainside, there is a ledge to stand on.
    ...s.landmarks.filter((lm) => slope(lm.x, lm.z) > 0.8).map((lm) => ({ x: lm.x, z: lm.z, r: 3.4 })),
    ...(s.huts ?? []).map((h) => ({ x: h.x, z: h.z, r: 5.2 * (h.scale ?? 1) })),
    ...(s.steles ?? []).map((st) => ({ x: st.x, z: st.z, r: 2.6 })),
    ...(s.props ?? []).map((p) => ({ x: p.x, z: p.z, r: 2.4 })),
    ...[s.boat, ...(s.boats ?? [])].filter((b) => b?.on === 'ground').map((b) => ({ x: b!.x, z: b!.z, r: 5.5 })),
  ].map((p) => ({ ...p, h: terrainHeight(p.x, p.z, spec) }));
  if (!pads.length) return s;
  return { ...s, terrain: { ...spec, flats: [...spec.flats, ...pads] } };
}

/**
 * The shelf, in the order it is read.
 *
 * Every scene is checked at module load — a landmark in the water or a tone
 * string that does not match its line fails the build rather than the walk.
 */
export const SCENES: readonly PoemScene[] = [
  SHAN_JU,
  JIANG_XUE,
  NIAO_MING,
  CHUN_JIANG,
  XI_JIANG,
  YIN_JIU,
  DENG_GAO,
  CHI_LE,
  TAO_HUA_YUAN,
  BAO_CHAN_SHAN,
].map(settle);

validateAll(SCENES);
