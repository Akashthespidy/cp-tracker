'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Code2, Globe, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { categories } from '@/components/leetcode150/problems/index';
import type { Problem } from '@/components/leetcode150/types';

export default function LeetCode150Page() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(
    categories[0].problems[0] ?? null
  );
  const [lang, setLang] = useState<'en' | 'bn'>('en');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">

          {/* ── Sidebar ── */}
          <aside className="w-full md:w-80 space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">LeetCode 150</h1>
              <p className="text-sm text-muted-foreground">Top interview questions prepared for you.</p>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <p className="font-semibold text-sm uppercase tracking-wider text-muted-foreground px-2">Categories</p>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <Button
                    key={cat.name}
                    variant={selectedCategory.name === cat.name ? 'secondary' : 'ghost'}
                    className="w-full justify-between"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedProblem(cat.problems[0] ?? null);
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

            {/* Problems list */}
            <div className="space-y-4">
              <p className="font-semibold text-sm uppercase tracking-wider text-muted-foreground px-2">Problems</p>
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
                            <Badge
                              className={
                                prob.difficulty === 'Easy'
                                  ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                  : prob.difficulty === 'Medium'
                                  ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                                  : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                              }
                            >
                              {prob.difficulty}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            {prob.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-[10px] text-muted-foreground">#{tag}</span>
                            ))}
                          </div>
                        </div>
                      </Button>
                    ))
                  ) : (
                    <p className="text-center py-8 text-muted-foreground text-sm italic">
                      No problems yet in this category.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </aside>

          {/* ── Detail Panel ── */}
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
                          <Badge
                            className={
                              selectedProblem.difficulty === 'Easy'
                                ? 'bg-green-500/10 text-green-500'
                                : selectedProblem.difficulty === 'Medium'
                                ? 'bg-yellow-500/10 text-yellow-500'
                                : 'bg-red-500/10 text-red-500'
                            }
                          >
                            {selectedProblem.difficulty}
                          </Badge>
                          <span className="text-muted-foreground">•</span>
                          {selectedProblem.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                      >
                        <Globe className="w-4 h-4" />
                        {lang === 'en' ? 'English' : 'বাংলা'}
                      </Button>
                    </CardHeader>

                    <CardContent className="space-y-8">
                      {/* Statement */}
                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-primary" />
                          Problem Statement
                        </h3>
                        <div className="bg-muted/30 rounded-lg p-4 text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {selectedProblem.statement}
                        </div>
                      </section>

                      {/* Solution */}
                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Code2 className="w-5 h-5 text-primary" />
                          Solution Code
                        </h3>
                        <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-lg overflow-x-auto text-sm font-mono leading-6">
                          <code>{selectedProblem.solution}</code>
                        </pre>
                      </section>

                      {/* Explanation */}
                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Languages className="w-5 h-5 text-primary" />
                          Explanation
                        </h3>
                        <div className="bg-primary/5 border border-primary/10 rounded-lg p-6 space-y-2">
                          <p className="text-xs font-bold uppercase tracking-widest text-primary">
                            {lang === 'en' ? 'English Description' : 'বাংলা ব্যাখ্যা'}
                          </p>
                          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
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
