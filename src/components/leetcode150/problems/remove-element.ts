import type { Problem } from '../types';

export const removeElement: Problem = {
  id: 2,
  title: 'Remove Element',
  difficulty: 'Easy',
  tags: ['Array', 'Two Pointers'],
  statement:
    'Given an integer array nums and an integer val, remove all occurrences of val in nums in-place. The order of the elements may be changed. Then return the number of elements in nums which are not equal to val.\nThe first k elements of nums should contain the elements which are not equal to val.',
  solution: `class Solution {
public:
    int removeElement(vector<int>& nums, int val) {
        int k = 0; // Pointer for the next position of a 'valid' element

        for (int i = 0; i < nums.size(); i++) {
            // If the current element is NOT the one we want to remove
            if (nums[i] != val) {
                nums[k] = nums[i]; // Move it to the 'k' index
                k++; // Move the 'k' pointer forward
            }
        }

        return k; // k is the count of elements not equal to val
    }
};`,
  englishDesc: `The Funny Logic: "Filtering the Fake Friends!"
Imagine you are a Gatekeeper at a party. You have a list of people (nums), but there's a specific person named val who is NOT invited. Your job is to move all the "Good Guests" to the front of the line.
We use two pointers: i is our scout who checks everyone in the line, and k is the spot for the next good guest. Whenever i finds someone who isn't val, he shouts, "Hey, you're cool! Move to seat number k." We then increment k to the next seat. By the end, the first k seats are filled with good guests, and we don't care what happens to the rest of the line!`,
  banglaDesc: `মজার লজিক: "ফেইক ফ্রেন্ড বিদায় করো!"
মনে করো তুমি একটা ক্লাবের বাউন্সার। লাইনে অনেক মানুষ (nums) দাঁড়িয়ে আছে, কিন্তু তোমার কাছে খবর আছে যে val নামের লোকটা ঝামেলা করবে, তাকে ভেতরে ঢোকানো যাবে না। তোমার কাজ হলো যারা val নয়, তাদের লাইনের সামনের দিকে পাঠিয়ে দেওয়া।
এখানে আমরা দুইটা পয়েন্টার ব্যবহার করছি: i হলো আমাদের বাউন্সার যে লাইনের শুরু থেকে শেষ পর্যন্ত সবাইকে চেক করে। আর k হলো "ভালো মানুষদের" জন্য বরাদ্দ করা সিট নাম্বার। যখনই বাউন্সার i দেখে যে কোনো একজন লোক val-এর মতো না, সে তাকে টেনে এনে k নাম্বার সিটে বসিয়ে দেয়। এরপর k এক ঘর এগিয়ে গিয়ে পরের ভালো মানুষের জন্য অপেক্ষা করে। শেষমেশ, প্রথম k সংখ্যক মানুষই হলো আমাদের আসল গেস্ট। এর পরে কে থাকলো না থাকলো, তাতে আমাদের কিচ্ছু যায় আসে না!`,
};
