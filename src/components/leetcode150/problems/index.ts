// ─────────────────────────────────────────────────────────────────────────────
// Central index — import a new problem file and add it to the right category.
// ─────────────────────────────────────────────────────────────────────────────
import type { Category } from '../types';

import { mergeSortedArray } from './merge-sorted-array';
import { removeElement }    from './remove-element';
import { twoSumII }         from './two-sum-ii';
import { threeSum }         from './three-sum';

export const categories: Category[] = [
  {
    name: 'Array',
    problems: [ mergeSortedArray, removeElement, twoSumII, threeSum],
  },
  {
    name: 'String',
    problems: [],
  },
  {
    name: 'Two Pointers',
    problems: [twoSumII, threeSum],
  }
];
