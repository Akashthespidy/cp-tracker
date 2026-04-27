# LeetCode 150 Job Interview Questions

Please put your problem contents below. Whenever you add a new problem here, you can provide the raw details, and I will format and arrange them properly according to the structure below.

---

## Example Structure

### Two Sum
**Category:** Array
**Difficulty:** Easy

#### Problem Statement
Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.
You may assume that each input would have exactly one solution, and you may not use the same element twice.

#### Solution Code
```javascript
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}
```

#### English Description
We use a hash map to store the numbers we have seen so far and their indices. For each number, we calculate its complement (target - current number). If the complement exists in the map, we have found our pair and return their indices. Otherwise, we add the current number to the map and continue.

#### Bangla Description
আমরা একটি হ্যাশ ম্যাপ ব্যবহার করে পূর্বের দেখা সংখ্যা এবং তাদের ইনডেক্সগুলো সংরক্ষণ করি। প্রতিটি সংখ্যার জন্য, আমরা তার পরিপূরক (target - বর্তমান সংখ্যা) হিসাব করি। যদি পরিপূরকটি ম্যাপে থাকে, তবে আমরা আমাদের জোড়া পেয়ে গেছি এবং তাদের ইনডেক্স ফেরত দেই। অন্যথায়, আমরা বর্তমান সংখ্যাটি ম্যাপে যোগ করি এবং চালিয়ে যাই।

---

*(Paste your raw problem details here...)*
