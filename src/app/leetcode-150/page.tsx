'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Code2, Globe, Languages, Search, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data structure based on user request
const categories = [
  {
    name: 'Array',
    problems: [
      {
        id: 1,
        title: 'Two Sum',
        difficulty: 'Easy',
        tags: ['Array', 'Hash Table'],
        statement: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
        solution: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
        englishDesc: 'We use a hash map to store the numbers we have seen so far and their indices. For each number, we calculate its complement (target - current number). If the complement exists in the map, we have found our pair and return their indices. Otherwise, we add the current number to the map and continue.',
        banglaDesc: 'আমরা একটি হ্যাশ ম্যাপ ব্যবহার করে পূর্বের দেখা সংখ্যা এবং তাদের ইনডেক্সগুলো সংরক্ষণ করি। প্রতিটি সংখ্যার জন্য, আমরা তার পরিপূরক (target - বর্তমান সংখ্যা) হিসাব করি। যদি পরিপূরকটি ম্যাপে থাকে, তবে আমরা আমাদের জোড়া পেয়ে গেছি এবং তাদের ইনডেক্স ফেরত দেই। অন্যথায়, আমরা বর্তমান সংখ্যাটি ম্যাপে যোগ করি এবং চালিয়ে যাই।'
      },
      {
        id: 2,
        title: '3Sum',
        difficulty: 'Medium',
        tags: ['Array', 'Two Pointers'],
        statement: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.',
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
        englishDesc: 'First, we sort the array to handle duplicates easily and use two pointers. We iterate through the array, and for each element, we find pairs that sum to its negative value using two pointers (left and right). We skip duplicates at each step.',
        banglaDesc: 'প্রথমে আমরা অ্যারেটিকে সর্ট করি যাতে ডুপ্লিকেটগুলো সহজে হ্যান্ডেল করা যায় এবং টু-পয়েন্টার ব্যবহার করা যায়। আমরা অ্যারের প্রতিটি এলিমেন্টের জন্য লুপ চালাই এবং টু-পয়েন্টার (বাম এবং ডান) ব্যবহার করে এমন জোড়া খুঁজি যাদের যোগফল ওই এলিমেন্টের নেগেটিভ মানের সমান। প্রতিটি ধাপে আমরা ডুপ্লিকেটগুলো এড়িয়ে চলি।'
      }
    ]
  },
  {
    name: 'String',
    problems: []
  }
];

export default function LeetCode150Page() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedProblem, setSelectedProblem] = useState(categories[0].problems[0]);
  const [lang, setLang] = useState<'en' | 'bn'>('en');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-80 space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">LeetCode 150</h1>
              <p className="text-sm text-muted-foreground">Top interview questions prepared for you.</p>
            </div>

            <div className="space-y-4">
              <div className="font-semibold text-sm uppercase tracking-wider text-muted-foreground px-2">Categories</div>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <Button
                    key={cat.name}
                    variant={selectedCategory.name === cat.name ? 'secondary' : 'ghost'}
                    className="w-full justify-between"
                    onClick={() => {
                      setSelectedCategory(cat);
                      if (cat.problems.length > 0) setSelectedProblem(cat.problems[0]);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {cat.name}
                    </span>
                    <Badge variant="outline">{cat.problems.length}</Badge>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="font-semibold text-sm uppercase tracking-wider text-muted-foreground px-2">Problems</div>
              <ScrollArea className="h-[400px] rounded-md border p-2">
                <div className="space-y-1">
                  {selectedCategory.problems.length > 0 ? (
                    selectedCategory.problems.map((prob) => (
                      <Button
                        key={prob.id}
                        variant={selectedProblem?.id === prob.id ? 'secondary' : 'ghost'}
                        className="w-full justify-start text-left h-auto py-3 px-3"
                        onClick={() => setSelectedProblem(prob)}
                      >
                        <div className="flex flex-col gap-1 w-full">
                          <div className="flex justify-between items-center gap-2">
                            <span className="font-medium truncate">{prob.title}</span>
                            <Badge className={
                              prob.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' :
                              prob.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' :
                              'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                            }>
                              {prob.difficulty}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            {prob.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-[10px] text-muted-foreground">#{tag}</span>
                            ))}
                          </div>
                        </div>
                      </Button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm italic">No problems yet in this category.</div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {selectedProblem ? (
                <motion.div
                  key={selectedProblem.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <Card className="border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <div className="space-y-1">
                        <CardTitle className="text-3xl font-bold">{selectedProblem.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            selectedProblem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                            selectedProblem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-red-500/10 text-red-500'
                          }>
                            {selectedProblem.difficulty}
                          </Badge>
                          <span className="text-muted-foreground">•</span>
                          {selectedProblem.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                        >
                          <Globe className="w-4 h-4" />
                          {lang === 'en' ? 'English' : 'বাংলা'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-primary" />
                          Problem Statement
                        </h3>
                        <div className="bg-muted/30 rounded-lg p-4 text-muted-foreground leading-relaxed">
                          {selectedProblem.statement}
                        </div>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Code2 className="w-5 h-5 text-primary" />
                          Solution Code
                        </h3>
                        <div className="relative">
                          <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-lg overflow-x-auto text-sm font-mono leading-6">
                            <code>{selectedProblem.solution}</code>
                          </pre>
                        </div>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Languages className="w-5 h-5 text-primary" />
                          Explanation
                        </h3>
                        <div className="bg-primary/5 border border-primary/10 rounded-lg p-6 space-y-4">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                            {lang === 'en' ? 'English Description' : 'বাংলা ব্যাখ্যা'}
                          </div>
                          <p className="text-foreground leading-relaxed">
                            {lang === 'en' ? selectedProblem.englishDesc : selectedProblem.banglaDesc}
                          </p>
                        </div>
                      </section>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4 bg-muted/20 rounded-xl border border-dashed">
                  <BookOpen className="w-12 h-12 text-muted-foreground opacity-20" />
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold">Select a problem</h3>
                    <p className="text-muted-foreground">Choose a problem from the list to see details.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
