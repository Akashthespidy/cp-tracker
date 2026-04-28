// ─────────────────────────────────────────────────────────────────────────────
// Central index — import a new problem file and add it to the right category.
// ─────────────────────────────────────────────────────────────────────────────
import type { Category } from '../types';

import { twoSum }           from './two-sum';
import { threeSum }         from './three-sum';
import { mergeSortedArray } from './merge-sorted-array';
import { removeElement }    from './remove-element';

export const categories: Category[] = [
  {
    name: 'Array',
    problems: [twoSum, threeSum, mergeSortedArray, removeElement],
  },
  {
    name: 'String',
    problems: [],
  },
];
