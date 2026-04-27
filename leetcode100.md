Merge Sorted Array
Category: Array / Two Pointers
Difficulty: Easy

Problem Statement
You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively. Merge nums1 and nums2 into a single array sorted in non-decreasing order.
The final sorted array should be stored inside the array nums1. To accommodate this, nums1 has a length of m + n.

Solution Code
C++
class Solution {
public:
    void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {
        int i = m - 1; // Index of last element in nums1's valid part
        int j = n - 1; // Index of last element in nums2
        int k = m + n - 1; // Index of last position in nums1

        while (i >= 0 && j >= 0) {
            if (nums1[i] > nums2[j]) {
                nums1[k] = nums1[i];
                i--;
            } else {
                nums1[k] = nums2[j];
                j--;
            }
            k--;
        }

        // If any elements remain in nums2, copy them
        while (j >= 0) {
            nums1[k] = nums2[j];
            j--;
            k--;
        }
    }
};
English Description
The Funny Logic: "Respect the Elders First!"
Imagine nums1 is a room with some people and a few empty chairs at the back. nums2 is another group waiting to enter. To keep things sorted without a mess, we compare the "biggest" people from both groups and seat them in the backmost chairs of nums1 first. We use three pointers: i for the last person in nums1, j for the last person in nums2, and k for the last empty chair. By filling from the back, we ensure we don't accidentally sit on someone already in nums1! If nums2 still has people left after nums1 is empty, we just move them into the remaining front chairs.

Bangla Description
মজার লজিক: "বড় ভাইদের আগে সিট দাও!"
মনে করো nums1 একটা রুম যেখানে কিছু মানুষ অলরেডি আছে আর পেছনে কিছু খালি চেয়ার আছে। nums2 হলো আরেকটা গ্রুপ যারা ওই রুমে ঢুকবে। ঝামেলা এড়াতে আমরা দুই গ্রুপের মধ্যে যারা সবচাইতে "বড়" বা বয়স্ক, তাদের আগে খুঁজে বের করি এবং nums1-এর একদম পেছনের খালি চেয়ারগুলোতে বসিয়ে দেই। আমরা তিনটা পয়েন্টার বা আঙুল ব্যবহার করি: i হলো nums1-এর শেষ মানুষ, j হলো nums2-এর শেষ মানুষ, আর k হলো পেছনের খালি সিট। পেছন থেকে শুরু করার কারণ হলো যেন সামনের আসল মানুষদের ওপর কেউ ভুলে বসে না পড়ে (Overwrite না হয়)! যদি nums1-এর মানুষ শেষ হয়ে যায় কিন্তু nums2-তে আরও কিছু ছোট বাচ্চা বাকি থাকে, তাদের সিরিয়ালি সামনের খালি সিটগুলোতে বসিয়ে দিলেই কেল্লা ফতে!