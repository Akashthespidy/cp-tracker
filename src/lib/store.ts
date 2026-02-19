
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Core User Handle (Used globally, persisted)
export const handleAtom = atomWithStorage<string | null>('cp-tracker-handle', null);

// Practice Sheet State
export const selectedLadderAtom = atom<string | null>(null);
export const sheetProblemsAtom = atom<any[]>([]); // Using 'any' for now to match current state, could be typed
export const sheetLoadingAtom = atom<boolean>(false);

export interface SheetGoal {
  target: number;
  deadline: string; // ISO date string
  startDate: string; // ISO date string
}

export const sheetGoalsAtom = atomWithStorage<Record<string, SheetGoal>>('cp-tracker-sheet-goals', {});
