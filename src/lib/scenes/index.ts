import type { PoemScene } from '../types';
import { validateAll } from '../validate';
import { SHAN_JU } from './shanju-qiuming';
import { JIANG_XUE } from './jiang-xue';
import { CHUN_JIANG } from './chunjiang';
import { CHI_LE } from './chile';
import { DENG_GAO } from './denggao';
import { NIAO_MING } from './niaoming';
import { XI_JIANG } from './xijiang';
import { YIN_JIU } from './yinjiu';

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
];

validateAll(SCENES);
