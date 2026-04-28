// ─────────────────────────────────────────────────────────────────────────────
// Central index — import a new problem file and add it to the right category.
// ─────────────────────────────────────────────────────────────────────────────
import type { Category } from '../types';

import { twoSum }           from './two-sum';
import { threeSum }         from './three-sum';
import { mergeSortedArray } from './merge-sorted-array';

export const categories: Category[] = [
  {
    name: 'Array',
    problems: [twoSum, threeSum, mergeSortedArray],
  },
  {
    name: 'String',
    problems: [],
  },
];
