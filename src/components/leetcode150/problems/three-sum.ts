import type { Problem } from '../types';

export const threeSum: Problem = {
  id: 6,
  title: '3Sum',
  difficulty: 'Medium',
  tags: ['Array', 'Two Pointers'],
  statement:
    'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that they are at different indices and their sum is exactly 0. The solution set must not contain duplicate triplets.',
  solution: `class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        vector<vector<int>> ans;
        sort(nums.begin(), nums.end()); // Sorting is key!

        for (int i = 0; i < nums.size() - 2; i++) {
            // Skip duplicates for the first element
            if (i > 0 && nums[i] == nums[i - 1]) continue;

            int left = i + 1;
            int right = nums.size() - 1;

            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];

                if (sum == 0) {
                    ans.push_back({nums[i], nums[left], nums[right]});

                    // Skip duplicates for left and right to avoid same triplets
                    while (left < right && nums[left] == nums[left + 1]) left++;
                    while (left < right && nums[right] == nums[right - 1]) right--;

                    left++;
                    right--;
                }
                else if (sum < 0) {
                    left++; // Need more power to reach zero
                }
                else {
                    right--; // Too much power, need to reduce
                }
            }
        }
        return ans;
    }
};`,
  englishDesc: `The Funny Logic: "The Trio Band Audition!"
Imagine you are forming a 3-member music band. You need three people whose "vibe levels" add up to exactly zero.

The Fixer (i): You fix one person first. But if the next person in line is exactly like the one you just checked, you skip them because you don't want the same band twice!

The Dynamic Duo (left & right): Once i is fixed, the problem becomes exactly like Two Sum II. You use two pointers to find the other two members.

No Clones Allowed: If you find a perfect trio, you make sure to skip anyone else nearby who looks exactly like your current left or right members. We hate duplicates!`,
  banglaDesc: `মজার লজিক: "তিন মক্কেলের আড্ডা!"
মনে করো তুমি একটা নাটকের জন্য তিনজন মানুষকে খুঁজছো যাদের মেজাজের যোগফল হবে একদম জিরো (শান্ত)।
১. প্রথম মেম্বার (i): তুমি প্রথমে একজনকে ধরলে। কিন্তু যদি দেখো তার পাশের জন দেখতে হুবহু তার মতো, তবে তাকে বাদ দাও। কারণ একই চেহারার মানুষ নিয়ে আলাদা টিম বানিয়ে লাভ নেই (No duplicates)!
২. বাকি দুইজন (left & right): একজনকে ফিক্সড করে বাকি দুইজনকে খোঁজা তো একদম Two Sum II এর মতো সহজ। বাম আর ডান থেকে দুইজন করে চেক করে দেখবে তিনজনের যোগফল জিরো হয় কি না।
৩. কপি পেস্ট মানা: যখনই একটা পারফেক্ট টিম পেয়ে যাবে, তখন বাম আর ডানের পয়েন্টারগুলোকে টেনে সামনে-পেছনে সরিয়ে দাও যেন পরের বার একই ভ্যালু আবার না আসে। আমরা চাই একদম ইউনিক টিম!`,
};
