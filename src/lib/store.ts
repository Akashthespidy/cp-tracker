
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Core User Handle — Codeforces (persisted)
export const handleAtom = atomWithStorage<string | null>('cp-tracker-handle', null);

// LeetCode Handle (persisted separately)
export const leetcodeHandleAtom = atomWithStorage<string | null>('cp-tracker-lc-handle', null);

// LeetCode cached response data (so we don't re-fetch on every tab switch)
export const leetcodeDataAtom         = atom<unknown>(null);
export const leetcodeDataUsernameAtom = atom<string | null>(null);

// Practice Sheet State
export interface SheetProblem {
  contestId: number;
  index:     string;
  name:      string;
  rating:    number;
  tags:      string[];
  solved:    boolean;
}
export const selectedLadderAtom  = atom<string | null>(null);
export const sheetProblemsAtom   = atom<SheetProblem[]>([]);
export const sheetLoadingAtom    = atom<boolean>(false);

export interface SheetGoal {
  target: number;
  deadline: string; // ISO date string
  startDate: string; // ISO date string
}

export const sheetGoalsAtom = atomWithStorage<Record<string, SheetGoal>>('cp-tracker-sheet-goals', {});
