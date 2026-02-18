'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen, Clock, Target, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PracticeSheetsProps {
  handle: string;
}

const LADDERS = [
  { id: 'div2a', title: 'Div. 2 A', description: 'Beginner friendly constructive problems', difficulty: '800-1000', count: 100 },
  { id: 'div2b', title: 'Div. 2 B', description: 'Requires basic math and logic', difficulty: '1000-1200', count: 100 },
  { id: 'div2c', title: 'Div. 2 C', description: 'Greedy, sorting, and simple algorithms', difficulty: '1200-1400', count: 100 },
  { id: 'div2d', title: 'Div. 2 D', description: 'Standard DP, Graph, and Data Structures', difficulty: '1400-1600', count: 100 },
  { id: 'div2e', title: 'Div. 2 E', description: 'Advanced topics and harder variations', difficulty: '1600-1900', count: 100 },
];

export function PracticeSheets({ handle }: PracticeSheetsProps) {
  const [selectedLadder, setSelectedLadder] = useState<string | null>(null);
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProblems = async (ladderId: string) => {
    setLoading(true);
    setSelectedLadder(ladderId);
    
    // Simulate fetching ladder problems based on ID difficulty range
    // In a real app, this could fetch from a specific JSON or API
    // For now, let's fetch from our problemset API with specific rating filters
    let ratingMin = 800;
    let ratingMax = 1000;
    
    switch(ladderId) {
        case 'div2a': ratingMin=800; ratingMax=1000; break;
        case 'div2b': ratingMin=1000; ratingMax=1200; break;
        case 'div2c': ratingMin=1200; ratingMax=1400; break;
        case 'div2d': ratingMin=1400; ratingMax=1600; break;
        case 'div2e': ratingMin=1600; ratingMax=1900; break;
    }

    try {
        const res = await fetch('/api/codeforces/sheet', {
            method: 'POST',
            body: JSON.stringify({ ladderId, handle }),
        });
        const data = await res.json();
        if (data.problems) {
            setProblems(data.problems);
        }
    } catch (e) {
        console.error("Failed to load sheet", e);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
      {/* Sidebar: Ladders List */}
      <div className="lg:col-span-4 xl:col-span-3 space-y-4">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Available Sheets
            </h3>
        </div>
        <ScrollArea className="h-full pr-4">
            <div className="space-y-3">
                {LADDERS.map((ladder) => (
                    <motion.div
                        key={ladder.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => loadProblems(ladder.id)}
                        className={`
                            cursor-pointer p-4 rounded-xl border transition-all
                            ${selectedLadder === ladder.id 
                                ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary/20' 
                                : 'bg-card hover:bg-accent/50 hover:border-accent-foreground/20'
                            }
                        `}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h4 className={`font-bold ${selectedLadder === ladder.id ? 'text-primary' : ''}`}>
                                {ladder.title}
                            </h4>
                            <Badge variant="outline" className="text-xs font-mono">
                                {ladder.difficulty}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                            {ladder.description}
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                            <Target className="w-3 h-3" />
                            <span>{ladder.count} Problems</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </ScrollArea>
      </div>

      {/* Main Content: Problem List */}
      <div className="lg:col-span-8 xl:col-span-9">
        <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
            {selectedLadder ? (
                <>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold tracking-tight mb-2">
                            {LADDERS.find(l => l.id === selectedLadder)?.title} Practice
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" /> Est. Time: 2 weeks
                            </span>
                            <span className="flex items-center gap-1">
                                <Target className="w-4 h-4" /> Goal: Solve 80%
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <p className="text-muted-foreground animate-pulse">Curating problems...</p>
                            </div>
                        </div>
                    ) : (
                        <ScrollArea className="flex-1 -mx-6 px-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
                                <AnimatePresence mode="popLayout">
                                    {problems.map((prob, i) => (
                                        <motion.a
                                            key={`${prob.contestId}-${prob.index}`}
                                            href={`https://codeforces.com/contest/${prob.contestId}/problem/${prob.index}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="block group"
                                        >
                                            <Card className={`
                                                h-full hover:shadow-lg transition-all border-l-4
                                                ${prob.solved ? 'border-l-green-500 bg-green-500/5' : 'border-l-primary/50 hover:border-l-primary'}
                                            `}>
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="font-bold text-lg group-hover:text-primary transition-colors">
                                                            {prob.index}
                                                        </span>
                                                        {prob.solved && (
                                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                        )}
                                                    </div>
                                                    <h3 className="font-medium text-sm mb-3 line-clamp-1 group-hover:underline">
                                                        {prob.name}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-1">
                                                        {prob.tags.slice(0, 2).map((tag: string) => (
                                                            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.a>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </ScrollArea>
                    )}
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground space-y-4">
                    <div className="p-6 bg-muted/30 rounded-full">
                        <BookOpen className="w-12 h-12 opacity-20" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Select a Sheet</h3>
                        <p className="max-w-[250px] mx-auto text-sm mt-1">
                            Choose a difficulty ladder from the sidebar to start practicing tailored problems.
                        </p>
                    </div>
                </div>
            )}
        </Card>
      </div>
    </div>
  );
}
