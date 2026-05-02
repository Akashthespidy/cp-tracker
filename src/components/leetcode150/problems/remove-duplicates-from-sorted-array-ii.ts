import type { Problem } from '../types';

export const removeDuplicatesFromSortedArrayII: Problem = {
  id: 8,
  title: 'Remove Duplicates from Sorted Array II',
  difficulty: 'Medium',
  tags: ['Array', 'Two Pointers'],
  statement:
    'Given an integer array nums sorted in non-decreasing order, remove some duplicates in-place such that each unique element appears at most twice. The relative order of the elements should be kept the same. Return the number of elements k after placing the result in the first k slots of nums.',
  solution: `class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        int k = 0; // The index where the next valid element will be placed

        for (int i = 0; i < nums.size(); i++) {
            // Logic: If we haven't placed 2 elements yet, OR 
            // the current element is different from the one placed two spots back.
            if (k < 2 || nums[i] != nums[k - 2]) {
                nums[k] = nums[i];
                k++;
            }
        }

        return k;
    }
};`,
  englishDesc: `The Funny Logic: "The Rule of Two!"
Imagine you are a Gatekeeper for a VIP club. The guests are standing in a sorted line. The rule is simple: we love twins, but we hate triplets! So, you can allow at most two people with the same look.
How do you check? For every new person (nums[i]), you look back at the person you seated two seats ago (nums[k-2]).
If the new person is the same as the one two seats back, it means you already have two of them in the front. "Sorry buddy, we already have two of you!" you say and move to the next person in line. If they are different, you let them in and move to seat k. This way, every unique person gets a maximum of two seats!`,
  banglaDesc: `মজার লজিক: "দুইটার বেশি এলাউড না!"
মনে করো তুমি একটা রেস্টুরেন্টের ম্যানেজার। বাইরে কাস্টমাররা উচ্চতা অনুযায়ী সিরিয়ালে দাঁড়িয়ে আছে। তোমার পলিসি হলো—একই চেহারার মানুষ সর্বোচ্চ দুইজন ঢুকতে পারবে। তিন নাম্বার জন আসলেই তাকে রিজেক্ট করা হবে।
এখন তুমি চেক করবে কীভাবে? যখনই নতুন একজন (nums[i]) ঢুকতে চায়, তুমি চেক করো ভেতরে যে লাস্ট দুইজনকে ঢুকিয়েছো, তাদের মধ্যে প্রথম জন (nums[k-2]) আর এই নতুন জন কি একই দেখতে কি না?
যদি তারা একই হয়, তারমানে অলরেডি দুইজন ঢুকে গেছে! তখন তুমি তাকে ঢুকতে দিলে না। আর যদি তারা আলাদা হয়, তারমানে এখনো কোটা খালি আছে, তখন তাকে k নাম্বার সিটে বসিয়ে দিলে। এই লজিকটা ব্যবহার করলে অটোমেটিক্যালি ৩ নম্বর বা ৪ নম্বর ডুপ্লিকেটগুলো বাদ পড়ে যায়।

মুন-স্টাইল টিপস: এখানে nums[i] != nums[k - 2] এই লাইনটাই আসল ম্যাজিক। এটা নিশ্চিত করে যে সামনের দুইটা সিট চেক করে তবেই তিন নাম্বার জনকে জায়গা দেওয়া হচ্ছে।`,
};
