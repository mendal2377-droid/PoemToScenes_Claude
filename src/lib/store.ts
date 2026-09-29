'use client';

import { create } from 'zustand';
import type { Atmosphere, PoemScene } from './types';

export type Mode = 'view' | 'roam' | 'compose';

/** A prop the visitor added themselves, on top of the poem's own scenery. */
export type PlacedItem = {
  uid: string;
  kind: PlaceableKind;
  x: number;
  z: number;
  /** Rotation about Y, radians. */
  rot: number;
  scale: number;
  /** Brush parameters — these are what make it look hand-painted. */
  strokeDensity: number;
  strokeLength: number;
  strokeCurl: number;
  inkTone: number;
};

export type PlaceableKind = 'pine' | 'bamboo' | 'maple' | 'rock' | 'reed' | 'cloud';

export type PlaceableGroup = {
  id: string;
  label: string;
  items: { kind: PlaceableKind; label: string }[];
};

export const PLACEABLES: PlaceableGroup[] = [
  {
    id: 'tree',
    label: '树木',
    items: [
      { kind: 'pine', label: '孤松' },
      { kind: 'maple', label: '丹枫' },
    ],
  },
  {
    id: 'bamboo',
    label: '竹石',
    items: [
      { kind: 'bamboo', label: '修竹' },
      { kind: 'rock', label: '湖石' },
    ],
  },
  {
    id: 'water',
    label: '汀渚',
    items: [{ kind: 'reed', label: '芦苇' }],
  },
  {
    id: 'sky',
    label: '云气',
    items: [{ kind: 'cloud', label: '留白云' }],
  },
];

type SceneState = {
  scene: PoemScene | null;
  mode: Mode;
  atmosphere: Atmosphere;
  /** Landmark ids the traveller has reached. */
  found: string[];
  /** The line currently being revealed in the world, if any. */
  revealing: string | null;
  /** The landmark the traveller is closest to — its line stirs in the inscription. */
  near: string | null;
  /** A place the free view is flying to, chosen from the inscription. */
  focus: string | null;
  panelOpen: boolean;
  inscriptionOpen: boolean;
  /** Composition mode. */
  brush: PlaceableKind | null;
  placed: PlacedItem[];
  selected: string | null;

  load: (scene: PoemScene) => void;
  setMode: (mode: Mode) => void;
  setAtmosphere: (patch: Partial<Atmosphere>) => void;
  find: (id: string) => void;
  clearRevealing: () => void;
  setNear: (id: string | null) => void;
  setFocus: (id: string | null) => void;
  togglePanel: (open?: boolean) => void;
  toggleInscription: (open?: boolean) => void;
  setBrush: (kind: PlaceableKind | null) => void;
  place: (x: number, z: number) => void;
  select: (uid: string | null) => void;
  updateSelected: (patch: Partial<PlacedItem>) => void;
  removeSelected: () => void;
  resetFound: () => void;
};

const DEFAULT_BRUSH = {
  strokeDensity: 1,
  strokeLength: 1,
  strokeCurl: 0.35,
  inkTone: 0.5,
};

let uidSeq = 0;

export const useScene = create<SceneState>((set, get) => ({
  scene: null,
  mode: 'view',
  atmosphere: { hour: 0.8, wind: 0.5, mist: 0.4, snow: 0 },
  found: [],
  revealing: null,
  near: null,
  focus: null,
  panelOpen: false,
  inscriptionOpen: true,
  brush: null,
  placed: [],
  selected: null,

  load: (scene) =>
    set({
      scene,
      atmosphere: { ...scene.atmosphere },
      found: [],
      revealing: null,
      near: null,
      focus: null,
      placed: [],
      selected: null,
      brush: null,
      mode: 'view',
    }),

  setMode: (mode) => set({ mode, brush: mode === 'compose' ? get().brush : null }),

  setAtmosphere: (patch) => set({ atmosphere: { ...get().atmosphere, ...patch } }),

  find: (id) => {
    const { found } = get();
    if (found.includes(id)) return;
    set({ found: [...found, id], revealing: id });
  },

  clearRevealing: () => set({ revealing: null }),

  // Called every frame from the walk loop, so it must not churn the store.
  setNear: (id) => {
    if (get().near === id) return;
    set({ near: id });
  },

  setFocus: (id) => set({ focus: id }),

  togglePanel: (open) => set({ panelOpen: open ?? !get().panelOpen }),

  toggleInscription: (open) => set({ inscriptionOpen: open ?? !get().inscriptionOpen }),

  setBrush: (kind) => set({ brush: kind, selected: kind ? null : get().selected }),

  place: (x, z) => {
    const kind = get().brush;
    if (!kind) return;
    const uid = `p${++uidSeq}`;
    const item: PlacedItem = {
      uid,
      kind,
      x,
      z,
      rot: Math.random() * Math.PI * 2,
      scale: 0.85 + Math.random() * 0.4,
      ...DEFAULT_BRUSH,
    };
    set({ placed: [...get().placed, item], selected: uid });
  },

  select: (uid) => set({ selected: uid, brush: uid ? null : get().brush }),

  updateSelected: (patch) => {
    const { selected, placed } = get();
    if (!selected) return;
    set({ placed: placed.map((p) => (p.uid === selected ? { ...p, ...patch } : p)) });
  },

  removeSelected: () => {
    const { selected, placed } = get();
    if (!selected) return;
    set({ placed: placed.filter((p) => p.uid !== selected), selected: null });
  },

  resetFound: () => set({ found: [], revealing: null, near: null, focus: null }),
}));
