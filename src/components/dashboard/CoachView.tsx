'use client';

import {
  Brain, Zap, Target, BarChart2, TrendingDown, RefreshCw, ExternalLink,
  CheckCircle2, Trophy, Flame, Lightbulb, CalendarDays, AlertTriangle, Medal,
  Clock,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { cachedCoachAtom } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface CoachViewProps {
  handle: string;
  goalRating: number;
}

interface Recommendation {
  contestId: number;
  index:     string;
  name:      string;
  rating:    number;
  tags:      string[];
}

interface CoachData {
  tagCounts:    Record<string, number>;
  weakTags:     string[];
  recommendations: Recommendation[];
  aiAdvice:     string;
  currentTier:  string;
  targetTier:   string;
  totalSolved:  number;
  maxRating:    number;
}

// 24 hours — after this the cache is considered stale (but still usable)
const CACHE_STALE_MS = 1000 * 60 * 60 * 24;

export function CoachView({ handle, goalRating }: CoachViewProps) {
  const [coachCache, setCoachCache] = useAtom(cachedCoachAtom);
  const cacheKey = `cf-${handle}`;
  const cached = coachCache[cacheKey];

  const [data, setData]           = useState<CoachData | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);

  // Hydrate from cache on mount
  useEffect(() => {
    if (cached?.data && !data) {
      setData(cached.data as CoachData);
    }
  }, [cached, data]);

  const handleGeneratePlan = async (forceRefresh = false) => {
    // If cache exists and not forcing refresh, use it
    if (!forceRefresh && cached?.data) {
      setData(cached.data as CoachData);
      return;
    }

    setLoading(true);
    setError(null);
    setVisibleCount(5);
    try {
      const res = await fetch('/api/codeforces/coach', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ handle, goal: goalRating }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setData(result);
      // Save to localStorage cache
      setCoachCache(prev => ({
        ...prev,
        [cacheKey]: { data: result, ts: Date.now() },
      }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  const isStale = cached?.ts ? Date.now() - cached.ts > CACHE_STALE_MS : false;

  const formatAge = (ts: number) => {
    const mins = Math.floor((Date.now() - ts) / 60_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const chartData = data?.tagCounts
    ? Object.entries(data.tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 12)
        .map(([tag, count]) => ({ tag, count }))
    : [];

  /* ── Empty / prompt state ─────────────────────────────────────────────── */
  if (!data) {
    return (
      <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col items-center justify-center py-14 space-y-5 text-center">
          <div className="p-5 bg-primary/10 rounded-full ring-4 ring-primary/5">
            <Brain className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-2xl font-bold">AI Performance Coach</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Analyzes your last 2 000 submissions, maps your weak topics, and delivers a
              personalized training plan to reach{' '}
              <strong className="text-foreground">rating {goalRating}</strong> — like
              having a professional CP coach in your corner.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            {['Weakness Detection', 'Problem Recommendations', 'AI Strategy', 'Skill Chart'].map(f => (
              <span key={f} className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted border border-border/50">
                <CheckCircle2 className="h-3 w-3 text-primary" /> {f}
              </span>
            ))}
          </div>
          <Button size="lg" onClick={() => handleGeneratePlan(false)} disabled={loading} className="mt-2 px-8 gap-2">
            {loading
              ? <><RefreshCw className="h-4 w-4 animate-spin" /> Analyzing your profile...</>
              : cached?.data
                ? <><Brain className="h-4 w-4" /> Load Saved Report</>
                : <><Zap className="h-4 w-4" /> Get My Coaching Report</>
            }
          </Button>
          {cached?.ts && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Saved report from {formatAge(cached.ts)}
            </p>
          )}
          {error && <p className="text-destructive text-sm">{error}</p>}
        </CardContent>
      </Card>
    );
  }

  /* ── Report ───────────────────────────────────────────────────────────── */
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Coach Report</h3>
              <p className="text-xs text-muted-foreground">
                {cached?.ts && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Generated {formatAge(cached.ts)}
                    {isStale && <span className="text-yellow-500 ml-1">(stale)</span>}
                    <span className="mx-1">·</span>
                  </span>
                )}
                Based on your last 2 000 submissions
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleGeneratePlan(true)} disabled={loading} className="gap-2">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Target className="h-3.5 w-3.5 text-blue-400" /> Next Milestone
                </div>
                <div className="text-3xl font-extrabold text-blue-400">{goalRating}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Target — <span className="text-blue-400 font-medium">{data.targetTier}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Medal className="h-3.5 w-3.5 text-emerald-400" /> Current Tier
                </div>
                <div className="text-xl font-bold text-emerald-400 leading-tight">{data.currentTier}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Peak: <span className="font-medium text-foreground">{data.maxRating}</span> · {data.totalSolved} solved
                </div>
              </CardContent>
            </Card>
          </div>

          {/* All weak topics — full width */}
          <Card className="bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400" /> Weak Topics — Focus Here
              </div>
              <div className="flex flex-wrap gap-2">
                {data.weakTags.map((tag, i) => (
                  <a
                    key={tag}
                    href={`https://codeforces.com/problemset?tags=${encodeURIComponent(tag)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer capitalize">
                      <span className="text-[10px] font-bold opacity-50">#{i + 1}</span>
                      {tag}
                    </span>
                  </a>
                ))}
              </div>
              <div className="text-xs text-muted-foreground mt-2">Tap any topic to find practice problems on Codeforces</div>
            </CardContent>
          </Card>
        </div>

        {/* Coach Advice — parsed sections */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* AI Advice — rendered as section cards */}
          <Card className="lg:col-span-3 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-4 w-4 text-primary" />
                Your Coaching Report
              </CardTitle>
              <CardDescription>Personalized advice from your AI coach</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.aiAdvice.split('\n\n').filter(Boolean).map((block, i) => {
                  const isStand   = block.startsWith('🎯');
                  const isWeak    = block.startsWith('⚠️');
                  const isPlan    = block.startsWith('📅');
                  const isContest = block.startsWith('🏆');
                  const isTip     = block.startsWith('💡');

                  const icon = isStand   ? <Target      className="h-4 w-4 text-primary     shrink-0 mt-0.5" />
                             : isWeak    ? <AlertTriangle className="h-4 w-4 text-red-400    shrink-0 mt-0.5" />
                             : isPlan    ? <CalendarDays  className="h-4 w-4 text-blue-400   shrink-0 mt-0.5" />
                             : isContest ? <Trophy        className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                             : isTip     ? <Lightbulb     className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                             :             <Flame         className="h-4 w-4 text-primary     shrink-0 mt-0.5" />;

                  const bgClass = isStand   ? 'bg-primary/5    border-primary/20'
                                : isWeak    ? 'bg-red-500/5    border-red-500/20'
                                : isPlan    ? 'bg-blue-500/5   border-blue-500/20'
                                : isContest ? 'bg-violet-500/5 border-violet-500/20'
                                : isTip     ? 'bg-emerald-500/5 border-emerald-500/20'
                                :             'bg-muted/30     border-border/50';

                  const lines  = block.split('\n');
                  const header = lines[0];
                  const body   = lines.slice(1).join('\n').trim();

                  return (
                    <div key={i} className={`rounded-lg border p-3.5 ${bgClass}`}>
                      <div className="flex items-start gap-2">
                        {icon}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm mb-1">{header}</p>
                          {body && (
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{body}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-emerald-400" />
                Today&apos;s Training Set
              </CardTitle>
              <CardDescription>Targeted problems for your weak areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.recommendations.slice(0, visibleCount).map((prob, i) => (
                  <a
                    key={i}
                    href={`https://codeforces.com/contest/${prob.contestId}/problem/${prob.index}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="p-3 rounded-lg border border-border/50 bg-card hover:bg-accent hover:border-primary/30 transition-all">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                          {prob.index}. {prob.name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                            {prob.rating}
                          </Badge>
                          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {prob.tags.slice(0, 3).map((t: string) => (
                          <span
                            key={t}
                            className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                              data.weakTags.includes(t)
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-secondary text-muted-foreground'
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </a>
                ))}
                {/* View More / Less toggle */}
                {data.recommendations.length > 5 && (
                  <button
                    onClick={() => setVisibleCount(v => v >= data.recommendations.length ? 5 : Math.min(v + 5, data.recommendations.length))}
                    className="w-full mt-1 text-xs text-primary hover:text-primary/80 font-medium py-2 rounded-lg border border-primary/20 hover:bg-primary/5 transition-all flex items-center justify-center gap-1"
                  >
                    {visibleCount >= data.recommendations.length
                      ? '↑ Show Less'
                      : `↓ View More (${data.recommendations.length - visibleCount} more)`
                    }
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weak Tags — clickable to CF tag filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-400" />
              Your Weak Topics (Prioritize These)
            </CardTitle>
            <CardDescription>Tap any tag to find problems on Codeforces</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.weakTags.map((tag, i) => (
                <a
                  key={tag}
                  href={`https://codeforces.com/problemset?tags=${encodeURIComponent(tag)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Badge
                    variant="outline"
                    className="border-red-500/30 text-red-400 bg-red-500/5 capitalize hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    #{i + 1} {tag}
                  </Badge>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skill Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
              Skill Distribution
            </CardTitle>
            <CardDescription>
              Problems solved per topic —{' '}
              <span className="text-red-400">red = weak area</span>,{' '}
              <span className="text-primary">blue = strong</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full" style={{ minWidth: 1, minHeight: 1 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="tag"
                    type="category"
                    width={150}
                    tick={{ fontSize: 11, fill: '#888' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{
                      backgroundColor: 'rgba(17,24,39,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: number | undefined) => [`${val ?? 0} solved`, 'Count']}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={data.weakTags.includes(entry.tag) ? '#ef4444' : '#3b82f6'}
                        opacity={data.weakTags.includes(entry.tag) ? 1 : 0.7}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
