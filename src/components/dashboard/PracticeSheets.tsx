'use client';

import { useAtom } from 'jotai';
import { handleAtom, selectedLadderAtom, sheetProblemsAtom, sheetLoadingAtom } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Target, CheckCircle2, ExternalLink, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LADDERS = [
  {
    id: 'div2a',
    title: 'Div. 2 A',
    subtitle: 'Newbie → Pupil',
    description: 'Beginner-friendly implementation and constructive problems',
    difficulty: '800–1000',
    count: 100,
    color: '#808080',
    targetRank: 'Pupil',
  },
  {
    id: 'div2b',
    title: 'Div. 2 B',
    subtitle: 'Pupil → Specialist',
    description: 'Basic math, greedy, and simple observations',
    difficulty: '1000–1200',
    count: 100,
    color: '#008000',
    targetRank: 'Specialist',
  },
  {
    id: 'div2c',
    title: 'Div. 2 C',
    subtitle: 'Specialist → Expert',
    description: 'Greedy, sorting, binary search, and simple DP',
    difficulty: '1200–1400',
    count: 100,
    color: '#03a89e',
    targetRank: 'Expert',
  },
  {
    id: 'div2d',
    title: 'Div. 2 D',
    subtitle: 'Expert → Candidate Master',
    description: 'Standard DP, graphs, and data structures',
    difficulty: '1400–1600',
    count: 100,
    color: '#0000ff',
    targetRank: 'Candidate Master',
  },
  {
    id: 'div2e',
    title: 'Div. 2 E',
    subtitle: 'Candidate Master → Master',
    description: 'Advanced algorithms and harder problem variations',
    difficulty: '1600–1900',
    count: 100,
    color: '#aa00aa',
    targetRank: 'Master',
  },
];

export function PracticeSheets() {
  const [handle] = useAtom(handleAtom);
  const [selectedLadder, setSelectedLadder] = useAtom(selectedLadderAtom);
  const [problems, setProblems] = useAtom(sheetProblemsAtom);
  const [loading, setLoading] = useAtom(sheetLoadingAtom);

  const loadProblems = async (ladderId: string) => {
    if (selectedLadder === ladderId && problems.length > 0) return; // Already loaded
    setLoading(true);
    setSelectedLadder(ladderId);
    try {
      const res = await fetch('/api/codeforces/sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ladderId, handle }),
      });
      const data = await res.json();
      if (data.problems) setProblems(data.problems);
    } catch (e) {
      console.error('Failed to load sheet', e);
    } finally {
      setLoading(false);
    }
  };

  const activeLadder = LADDERS.find(l => l.id === selectedLadder);
  const solvedCount = problems.filter(p => p.solved).length;
  const solvedPercent = problems.length > 0 ? Math.round((solvedCount / problems.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
      {/* Sidebar */}
      <div className="lg:col-span-4 xl:col-span-3 space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Ladders</h3>
          <Badge variant="secondary" className="text-xs ml-auto">{LADDERS.length} levels</Badge>
        </div>
        {LADDERS.map((ladder) => {
          const isActive = selectedLadder === ladder.id;
          return (
            <motion.button
              key={ladder.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => loadProblems(ladder.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                isActive
                  ? 'border-primary/40 bg-primary/10 shadow-sm'
                  : 'border-border/50 bg-card hover:bg-accent/50 hover:border-border'
              }`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <div>
                  <div className="font-bold text-sm" style={{ color: isActive ? ladder.color : undefined }}>
                    {ladder.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{ladder.subtitle}</div>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono shrink-0"
                  style={isActive ? { borderColor: `${ladder.color}40`, color: ladder.color } : {}}
                >
                  {ladder.difficulty}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{ladder.description}</p>
              <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" /> {ladder.count} problems
                </span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Main Problem Area */}
      <div className="lg:col-span-8 xl:col-span-9 flex flex-col">
        {!selectedLadder ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground space-y-4 py-20">
            <div className="p-8 bg-muted/20 rounded-full border-2 border-dashed border-border/50">
              <BookOpen className="w-12 h-12 opacity-30" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">Pick a Ladder</h3>
              <p className="text-sm mt-1 max-w-xs mx-auto">
                Choose a difficulty level from the sidebar to load 100 curated problems.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              {LADDERS.map(l => (
                <button
                  key={l.id}
                  onClick={() => loadProblems(l.id)}
                  className="px-3 py-1.5 rounded-full border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  style={{ color: l.color }}
                >
                  {l.title}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">{activeLadder?.title} — {activeLadder?.subtitle}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{activeLadder?.description}</p>
                </div>
                {!loading && problems.length > 0 && (
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold" style={{ color: activeLadder?.color }}>
                      {solvedCount}<span className="text-sm text-muted-foreground font-normal">/{problems.length}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">solved</div>
                  </div>
                )}
              </div>
              {!loading && problems.length > 0 && (
                <div className="space-y-1">
                  <Progress value={solvedPercent} className="h-1.5" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{solvedPercent}% complete</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      {solvedCount} solved
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Problem List */}
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">Curating problems from Codeforces...</p>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="space-y-1.5 pb-8">
                  <AnimatePresence mode="popLayout">
                    {problems.map((prob, i) => (
                      <motion.a
                        key={`${prob.contestId}-${prob.index}`}
                        href={`https://codeforces.com/contest/${prob.contestId}/problem/${prob.index}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(i * 0.02, 0.5) }}
                        className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-border/50 hover:bg-accent/50 transition-all group"
                      >
                        {/* Number */}
                        <span className="text-xs font-mono text-muted-foreground w-7 shrink-0 text-right">
                          {i + 1}
                        </span>

                        {/* Solved indicator */}
                        {prob.solved ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-border/50 shrink-0 group-hover:border-primary/50 transition-colors" />
                        )}

                        {/* Problem name */}
                        <span className={`flex-1 text-sm font-medium group-hover:text-primary transition-colors ${prob.solved ? 'text-muted-foreground line-through' : ''}`}>
                          {prob.name}
                        </span>

                        {/* Tags */}
                        <div className="hidden sm:flex gap-1 shrink-0">
                          {prob.tags.slice(0, 2).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Rating */}
                        <Badge
                          variant="outline"
                          className="text-xs shrink-0"
                          style={{ color: activeLadder?.color, borderColor: `${activeLadder?.color}30` }}
                        >
                          {prob.rating}
                        </Badge>

                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </motion.a>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            )}
          </>
        )}
      </div>
    </div>
  );
}
