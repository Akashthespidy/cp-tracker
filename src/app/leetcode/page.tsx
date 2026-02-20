'use client';

import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { leetcodeHandleAtom } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { LeetCodeDashboard } from '@/components/dashboard/LeetCodeDashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight, Code, CheckCircle2, Activity } from 'lucide-react';

export default function LeetCodePage() {
  const [handle, setHandle] = useAtom(leetcodeHandleAtom);
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
    }, 300);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {!handle ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] py-20">
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 w-full max-w-md text-center space-y-8"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm font-medium">
                <Code className="w-3.5 h-3.5" />
                LeetCode Integration
              </div>

              {/* Headline */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                  Master <span className="text-amber-400">LeetCode</span>
                </h1>
                <p className="text-muted-foreground text-base max-w-sm mx-auto">
                  Get a full breakdown of your Easy / Medium / Hard progress, identify weak topics, and generate a personalized study plan.
                </p>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                {['Difficulty Breakdown', 'Topic Mastery', 'Contest Rating', 'AI Study Plan', 'Weak Tag Analysis'].map(f => (
                  <span key={f} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted border border-border/50 text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-amber-400" /> {f}
                  </span>
                ))}
              </div>

              {/* Input Form */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl">
                <CardContent className="p-6">
                  <form onSubmit={submitHandle} className="space-y-4">
                    <div className="space-y-2 text-left">
                      <label className="text-sm font-medium text-muted-foreground">
                        Your LeetCode Username
                      </label>
                      <Input
                        placeholder="e.g. neal_wu, jiangly"
                        value={inputHandle}
                        onChange={(e) => setInputHandle(e.target.value)}
                        className="h-12 text-base bg-background/50 border-border/50"
                        autoFocus
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-semibold bg-amber-500 hover:bg-amber-600 text-black"
                      disabled={loading || !inputHandle.trim()}
                    >
                      {loading ? (
                        <><Activity className="mr-2 h-4 w-4 animate-spin" /> Connecting...</>
                      ) : (
                        <>Load My Stats <ArrowRight className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">LeetCode Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Stats for <span className="text-foreground font-medium">{handle}</span>
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setHandle(null)} className="text-muted-foreground">
                Switch User
              </Button>
            </div>
            <LeetCodeDashboard username={handle} />
          </>
        )}
      </main>
    </div>
  );
}
