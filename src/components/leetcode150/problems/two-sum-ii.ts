import type { Problem } from '../types';

export const twoSumII: Problem = {
  id: 5,
  title: 'Two Sum II - Input Array Is Sorted',
  difficulty: 'Medium',
  tags: ['Array', 'Two Pointers'],
  statement:
    'Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number.\nReturn the indices of the two numbers, index1 and index2, each incremented by one, as an integer array [index1, index2].',
  solution: `class Solution {
public:
    vector<int> twoSum(vector<int>& numbers, int target) {
        int left = 0;               // Starting from the smallest number
        int right = numbers.size() - 1; // Starting from the largest number

        while (left < right) {
            int sum = numbers[left] + numbers[right];

            if (sum == target) {
                // Return 1-based indices
                return {left + 1, right + 1};
            }
            else if (sum < target) {
                // We need a bigger sum, so move the left pointer forward
                left++;
            }
            else {
                // We need a smaller sum, so move the right pointer backward
                right--;
            }
        }

        return {};
    }
};`,
  englishDesc: `The Funny Logic: "The Matchmaking Tug-of-War!"
Imagine you are a Matchmaker. You have a sorted row of people based on their "power levels." You need to find two people whose combined power equals the target.
You put one hand on the weakest person (left) and the other on the strongest person (right).
If their combined power is too low, you need more "juice," so you move your left hand to the next, stronger person. If their power is too high, you need to tone it down, so you move your right hand to a slightly weaker person. You keep adjusting until you hit the perfect pair! Since the array is "1-indexed," we just add +1 to the final result to make the judge happy.`,
  banglaDesc: `মজার লজিক: "পারফেক্ট পার্টনার খোঁজা!"
মনে করো তুমি একটা গেম শো-তে আছো। সেখানে এক সারিতে কিছু মানুষ ছোট থেকে বড় শক্তি অনুযায়ী দাঁড়িয়ে আছে (Sorted Array)। তোমাকে এমন দুইজনকে খুঁজে বের করতে হবে যাদের শক্তির যোগফল হবে একদম target-এর সমান।
তুমি কী করলে? এক হাত রাখলে একদম বামের দুর্বল মানুষটার ওপর (left), আর অন্য হাত রাখলে একদম ডানের শক্তিশালী মানুষটার ওপর (right)।
এখন দুইজনের শক্তি যোগ করে দেখলে যদি দেখো সেটা টার্গেটের চেয়ে কম, তার মানে তোমার আরও বেশি শক্তি দরকার—তাই তুমি বাম হাতটা এক ঘর ডানে সরিয়ে একটু বেশি শক্তিশালী মানুষের কাছে নিয়ে গেলে। আর যদি যোগফল টার্গেটের চেয়ে বেশি হয়ে যায়, তার মানে একটু শক্তি কমাতে হবে—তখন তুমি ডান হাতটা এক ঘর বামে সরিয়ে একটু কম শক্তিশালী মানুষের কাছে আনলে। এভাবে হাত সরাতে সরাতে যখনই পারফেক্ট জোড়া পাবে, তখনই কেল্লা ফতে! আর যেহেতু ওরা বলেছে ১ থেকে গুনতে হবে (1-indexed), তাই আমরা শেষে ইনডেক্সের সাথে ১ যোগ করে দিয়েছি।

ব্যাস! এই লজিকটা বুঝলে যে কেউ টু-পয়ন্টার (Two Pointers) মেথডের ফ্যান হয়ে যাবে।`,
};
