import type { Problem } from '../types';

export const removeDuplicatesFromSortedArray: Problem = {
  id: 7,
  title: 'Remove Duplicates from Sorted Array',
  difficulty: 'Easy',
  tags: ['Array', 'Two Pointers'],
  statement:
    'Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same. Then return the number of unique elements k.',
  solution: `class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        if (nums.size() == 0) return 0;
        
        int k = 1; // The first element is always unique

        for (int i = 1; i < nums.size(); i++) {
            // If we find a new unique element
            if (nums[i] != nums[i - 1]) {
                nums[k] = nums[i]; // Move it to the next unique position
                k++; // Increment the unique count
            }
        }

        return k; // Total unique elements found
    }
};`,
  englishDesc: `The Funny Logic: "No Twin Allowed in the Front Row!"
Imagine you are organizing a photoshoot for a group of people standing in a line, sorted by height. But wait—some people are identical twins and wearing the same clothes! You only want one representative from each twin group in the front row.
We use two pointers: i is our "Scout" who walks through the entire line. k is our "Front Row Manager." Since the first person is always unique, the manager starts at the second seat (k = 1). Whenever the Scout finds someone who doesn't look like the person standing right before them, the Manager says, "Hey! You're new! Come sit here at seat k." The manager then moves to the next seat. By the end, the front row only has unique people!`,
  banglaDesc: `মজার লজিক: "একই চেহারার পাবলিক পিছনে যাও!"
মনে করো তুমি একটা ফটোশুটের আয়োজন করছো যেখানে সবাই উচ্চতা অনুযায়ী সিরিয়ালি দাঁড়িয়ে আছে (Sorted)। কিন্তু ভেজাল হলো, এখানে একই চেহারার অনেক মানুষ (Duplicates) আছে। তোমার টার্গেট হলো—একই চেহারার মানুষের মধ্যে থেকে শুধু একজনকে লাইনের সামনে রাখা।
এখানে আমাদের দুইটা ক্যারেক্টার আছে: i হলো আমাদের "চেকার" যে লাইনের শুরু থেকে শেষ পর্যন্ত সবাইকে দেখে। আর k হলো "লাইন কন্ট্রোলার।" যেহেতু প্রথম মানুষটা সবসময়ই ইউনিক, তাই তাকে নিয়ে টেনশন নেই, কন্ট্রোলার ২ নম্বর সিটে (k = 1) দাঁড়িয়ে থাকে। যখনই চেকার i এমন কাউকে পায় যে দেখতে তার ঠিক আগের মানুষের মতো না, তখন কন্ট্রোলার বলে, "বস, আপনি নতুন! চলে আসেন এই k নাম্বার সিটে।" এরপর কন্ট্রোলার পরের সিটের জন্য রেডি হয়। দিনশেষে, লাইনের প্রথম k জন মানুষই হবে ইউনিক!

মুন-স্টাইল টিপস: যেহেতু অ্যারে-টা অলরেডি সর্টেড, তাই ডুপ্লিকেটগুলো সবসময় পাশাপাশিই থাকবে। আমাদের কাজ শুধু পাশের জনের সাথে তুলনা করা আর ইউনিক হলে তাকে সামনের সিটে প্রমোশন দেওয়া!`,
};
