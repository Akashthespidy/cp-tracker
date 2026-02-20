'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

import { PlatformDashboard } from '@/components/dashboard/PlatformDashboard';
import { Navbar } from '@/components/Navbar';
import { Activity, ArrowRight, Zap, Code2 } from 'lucide-react';
import { useAtom } from 'jotai';
import { handleAtom } from '@/lib/store';
import Link from 'next/link';

export default function Home() {
  const [handle, setHandle] = useAtom(handleAtom);
  const [inputHandle, setInputHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const submitHandle = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputHandle.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setHandle(inputHandle.trim());
      setLoading(false);
    }, 400);
  };

  if (!mounted) return null;

  if (!handle) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 w-full max-w-lg text-center space-y-8"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
              <Zap className="w-3.5 h-3.5" />
              AI-Powered CP Training
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
                From <span className="text-green-400">Pupil</span> to{' '}
                <span className="text-blue-400">Expert</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Track your Codeforces progress, discover your weak spots, and follow an AI-generated roadmap to your next rank.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              {['Rating Tracker', 'Weakness Analysis', 'AI Coach', 'A2OJ Ladders', 'Solved Tracking'].map(f => (
                <span key={f} className="px-3 py-1 rounded-full bg-muted border border-border/50 text-muted-foreground">
                  {f}
                </span>
              ))}
            </div>

            {/* Input Form */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl">
              <CardContent className="p-6">
                <form onSubmit={submitHandle} className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-medium text-muted-foreground">
                      Your Codeforces Handle
                    </label>
                    <Input
                      placeholder="e.g. tourist, Petr, Um_nik"
                      value={inputHandle}
                      onChange={(e) => setInputHandle(e.target.value)}
                      className="h-12 text-base bg-background/50 border-border/50"
                      autoFocus
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold"
                    disabled={loading || !inputHandle.trim()}
                  >
                    {loading ? (
                      <>
                        <Activity className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        Start Training
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: 'Problems Indexed', value: '8,000+' },
                { label: 'Tags Analyzed', value: '35+' },
                { label: 'Rating Range', value: '800–3500' },
              ].map(s => (
                <div key={s.label} className="space-y-1">
                  <div className="text-2xl font-bold text-primary">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Dashboard header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your competitive programming overview</p>
        </div>

        {/* Codeforces */}
        <PlatformDashboard platform="Codeforces" handle={handle} />

        {/* LeetCode CTA banner */}
        <Link href="/leetcode" className="block group">
          <Card className="border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent hover:border-amber-500/40 hover:from-amber-500/10 transition-all">
            <CardContent className="p-5 flex items-center gap-5">
              <div className="p-3 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20 transition-colors">
                <Code2 className="h-7 w-7 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base group-hover:text-amber-400 transition-colors">
                  LeetCode Dashboard
                </h3>
                <p className="text-sm text-muted-foreground">
                  Track Easy / Medium / Hard solved, topic mastery rings, and get a 30-day AI study plan.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>
      </main>
    </div>
  );
}
