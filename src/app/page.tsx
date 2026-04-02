'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

import { PlatformDashboard } from '@/components/dashboard/PlatformDashboard';
import { Navbar } from '@/components/Navbar';
import { Activity, ArrowRight, Zap, Code2, ChefHat, LayoutGrid, User, Trash2 } from 'lucide-react';
import { useAtom } from 'jotai';
import { handleAtom, leetcodeHandleAtom, savedProfilesAtom, SavedProfile } from '@/lib/store';
import Link from 'next/link';

type LoginPlatform = 'codeforces' | 'leetcode';

const PLATFORM_CONFIG = {
  codeforces: {
    label: 'Codeforces',
    icon: LayoutGrid,
    color: 'blue',
    accent: 'text-blue-400',
    borderAccent: 'border-blue-500/40',
    bgAccent: 'bg-blue-500/10',
    btnClass: '',
    placeholder: 'e.g. tourist, Petr, Um_nik',
    inputLabel: 'Your Codeforces Handle',
    headline: (
      <>
        From <span className="text-green-400">Pupil</span> to{' '}
        <span className="text-blue-400">Expert</span>
      </>
    ),
    subtitle: 'Track your Codeforces progress, discover your weak spots, and follow an AI-generated roadmap to your next rank.',
    pills: ['Rating Tracker', 'Weakness Analysis', 'AI Coach', 'A2OJ Ladders', 'Solved Tracking'],
    stats: [
      { label: 'Problems Indexed', value: '8,000+' },
      { label: 'Tags Analyzed', value: '35+' },
      { label: 'Rating Range', value: '800–3500' },
    ],
  },
  leetcode: {
    label: 'LeetCode',
    icon: Code2,
    color: 'amber',
    accent: 'text-amber-400',
    borderAccent: 'border-amber-500/40',
    bgAccent: 'bg-amber-500/10',
    btnClass: 'bg-amber-500 hover:bg-amber-600 text-black',
    placeholder: 'e.g. neal_wu, jiangly',
    inputLabel: 'Your LeetCode Username',
    headline: (
      <>
        Master <span className="text-amber-400">LeetCode</span>
      </>
    ),
    subtitle: 'Get a full breakdown of your Easy / Medium / Hard progress, identify weak topics, and generate a personalized study plan.',
    pills: ['Difficulty Breakdown', 'Topic Mastery', 'Contest Rating', 'AI Study Plan', 'Weak Tag Analysis'],
    stats: [
      { label: 'Difficulty Tiers', value: '3' },
      { label: 'Topics Tracked', value: '40+' },
      { label: 'AI Coach', value: '✓' },
    ],
  },
} as const;

export default function Home() {
  const [handle, setHandle] = useAtom(handleAtom);
  const [, setLcHandle] = useAtom(leetcodeHandleAtom);
  const [savedProfiles, setSavedProfiles] = useAtom(savedProfilesAtom);
  const [inputHandle, setInputHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [platform, setPlatform] = useState<LoginPlatform>('codeforces');
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const cfg = PLATFORM_CONFIG[platform];

  const addToSavedProfiles = (h: string, p: 'codeforces' | 'leetcode') => {
    setSavedProfiles(prev => {
      const exists = prev.some(sp => sp.handle === h && sp.platform === p);
      if (exists) return prev;
      return [...prev, { handle: h, platform: p, addedAt: Date.now() }];
    });
  };

  const removeProfile = (h: string, p: string) => {
    setSavedProfiles(prev => prev.filter(sp => !(sp.handle === h && sp.platform === p)));
  };

  const loadSavedProfile = (sp: SavedProfile) => {
    if (sp.platform === 'codeforces') {
      setHandle(sp.handle);
    } else {
      setLcHandle(sp.handle);
      router.push('/leetcode');
    }
  };

  const submitHandle = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputHandle.trim()) return;
    setLoading(true);
    const trimmed = inputHandle.trim();
    setTimeout(() => {
      if (platform === 'codeforces') {
        setHandle(trimmed);
        addToSavedProfiles(trimmed, 'codeforces');
      } else {
        setLcHandle(trimmed);
        addToSavedProfiles(trimmed, 'leetcode');
        router.push('/leetcode');
      }
      setLoading(false);
    }, 400);
  };

  const switchPlatform = (p: LoginPlatform) => {
    if (p === platform) return;
    setPlatform(p);
    setInputHandle('');
  };

  if (!mounted) return null;

  if (!handle) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl transition-colors duration-700 ${
              platform === 'codeforces' ? 'bg-blue-500/8' : 'bg-amber-500/8'
            }`} />
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

            {/* Headline — animated swap */}
            <AnimatePresence mode="wait">
              <motion.div
                key={platform}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
                  {cfg.headline}
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto">
                  {cfg.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              {cfg.pills.map(f => (
                <span key={f} className="px-3 py-1 rounded-full bg-muted border border-border/50 text-muted-foreground">
                  {f}
                </span>
              ))}
            </div>

            {/* Input Form with platform toggle */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl">
              <CardContent className="p-6 space-y-5">
                {/* Platform Toggle */}
                <div className="flex rounded-lg border border-border/50 bg-muted/40 p-1 gap-1">
                  {(Object.keys(PLATFORM_CONFIG) as LoginPlatform[]).map(p => {
                    const c = PLATFORM_CONFIG[p];
                    const Icon = c.icon;
                    const active = p === platform;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => switchPlatform(p)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-all ${
                          active
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {c.label}
                      </button>
                    );
                  })}
                </div>

                {/* Form */}
                <form onSubmit={submitHandle} className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-medium text-muted-foreground">
                      {cfg.inputLabel}
                    </label>
                    <Input
                      placeholder={cfg.placeholder}
                      value={inputHandle}
                      onChange={(e) => setInputHandle(e.target.value)}
                      className="h-12 text-base bg-background/50 border-border/50"
                      autoFocus
                    />
                  </div>
                  <Button
                    type="submit"
                    className={`w-full h-12 text-base font-semibold ${cfg.btnClass}`}
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
              {cfg.stats.map(s => (
                <div key={s.label} className="space-y-1">
                  <div className="text-2xl font-bold text-primary">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Saved Profiles */}
            {savedProfiles.length > 0 && (
              <div className="w-full space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-muted-foreground">Saved Profiles</h3>
                </div>
                <div className="grid gap-2">
                  {savedProfiles.map(sp => {
                    const isCF = sp.platform === 'codeforces';
                    return (
                      <div
                        key={`${sp.platform}-${sp.handle}`}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-accent/50 transition-all group cursor-pointer"
                        onClick={() => loadSavedProfile(sp)}
                      >
                        <div className={`p-2 rounded-lg ${isCF ? 'bg-blue-500/10' : 'bg-amber-500/10'}`}>
                          {isCF
                            ? <LayoutGrid className="h-4 w-4 text-blue-400" />
                            : <Code2 className="h-4 w-4 text-amber-400" />
                          }
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{sp.handle}</p>
                          <p className="text-xs text-muted-foreground">{isCF ? 'Codeforces' : 'LeetCode'}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeProfile(sp.handle, sp.platform); }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                          title="Remove profile"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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

        {/* CodeChef CTA banner */}
        <Link href="/codechef" className="block group">
          <Card className="border-orange-700/20 bg-gradient-to-r from-orange-700/5 to-transparent hover:border-orange-700/40 hover:from-orange-700/10 transition-all">
            <CardContent className="p-5 flex items-center gap-5">
              <div className="p-3 bg-orange-700/10 rounded-xl group-hover:bg-orange-700/20 transition-colors">
                <ChefHat className="h-7 w-7 text-orange-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base group-hover:text-orange-500 transition-colors">
                  CodeChef Dashboard
                </h3>
                <p className="text-sm text-muted-foreground">
                  Track Rating History, analyze Problem Breakdown, and map your journey to 7 stars.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>
      </main>
    </div>
  );
}
