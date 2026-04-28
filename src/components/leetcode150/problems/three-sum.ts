import type { Problem } from '../types';

export const threeSum: Problem = {
  id: 2,
  title: '3Sum',
  difficulty: 'Medium',
  tags: ['Array', 'Two Pointers'],
  statement:
    'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.',
  solution: `var threeSum = function(nums) {
    nums.sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < nums.length; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        let left = i + 1, right = nums.length - 1;
        while (left < right) {
            const sum = nums[i] + nums[left] + nums[right];
            if (sum === 0) {
                result.push([nums[i], nums[left], nums[right]]);
                while (nums[left] === nums[left + 1]) left++;
                while (nums[right] === nums[right - 1]) right--;
                left++; right--;
            } else if (sum < 0) left++;
            else right--;
        }
    }
    return result;
};`,
  englishDesc:
    'First, we sort the array to handle duplicates easily and use two pointers. We iterate through the array, and for each element, we find pairs that sum to its negative value using two pointers (left and right). We skip duplicates at each step.',
  banglaDesc:
    'প্রথমে আমরা অ্যারেটিকে সর্ট করি যাতে ডুপ্লিকেটগুলো সহজে হ্যান্ডেল করা যায় এবং টু-পয়েন্টার ব্যবহার করা যায়। আমরা অ্যারের প্রতিটি এলিমেন্টের জন্য লুপ চালাই এবং টু-পয়েন্টার (বাম এবং ডান) ব্যবহার করে এমন জোড়া খুঁজি যাদের যোগফল ওই এলিমেন্টের নেগেটিভ মানের সমান। প্রতিটি ধাপে আমরা ডুপ্লিকেটগুলো এড়িয়ে চলি।',
};
