import type { PoemScene } from './types';
import { SCENES } from './scenes';

export { SCENES };

export type ShelfEntry = {
  id: string;
  title: string;
  author: string;
  dynasty: string;
  note: string;
  available: boolean;
  palette: PoemScene['palette'];
};

/** Everything the shelf on the landing page needs. */
export const SHELF: readonly ShelfEntry[] = SCENES.map((s) => ({
  id: s.id,
  title: s.title,
  author: s.author,
  dynasty: s.dynasty,
  note: s.note,
  available: s.available,
  palette: s.palette,
}));

export function getScene(id: string): PoemScene | undefined {
  return SCENES.find((s) => s.id === id);
}
