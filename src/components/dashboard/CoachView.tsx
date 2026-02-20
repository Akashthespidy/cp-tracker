'use client';

import {
  Brain, Zap, Target, BarChart2, TrendingDown, RefreshCw, ExternalLink, CheckCircle2
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface CoachViewProps {
  handle: string;
  currentRating: number;
}

interface Recommendation {
  contestId: number;
  index:     string;
  name:      string;
  rating:    number;
  tags:      string[];
}

interface CoachData {
  tagCounts:       Record<string, number>;
  weakTags:        string[];
  recommendations: Recommendation[];
  aiAdvice:        string;
}

export function CoachView({ handle, currentRating }: CoachViewProps) {
  const [data, setData] = useState<CoachData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/codeforces/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, goal: currentRating + 200 }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  const chartData = data?.tagCounts
    ? Object.entries(data.tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 12)
        .map(([tag, count]) => ({ tag, count }))
    : [];

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
              Analyzes your last 2000 submissions, identifies your weakest topics, and generates a personalized training plan with targeted problems to reach <strong className="text-foreground">rating {currentRating + 200}</strong>.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            {['Weakness Detection', 'Problem Recommendations', 'AI Strategy', 'Skill Chart'].map(f => (
              <span key={f} className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted border border-border/50">
                <CheckCircle2 className="h-3 w-3 text-primary" /> {f}
              </span>
            ))}
          </div>
          <Button size="lg" onClick={handleGeneratePlan} disabled={loading} className="mt-2 px-8">
            {loading ? (
              <><Zap className="mr-2 h-4 w-4 animate-spin" /> Analyzing your profile...</>
            ) : (
              <><Zap className="mr-2 h-4 w-4" /> Generate My Training Plan</>
            )}
          </Button>
          {error && <p className="text-destructive text-sm">{error}</p>}
        </CardContent>
      </Card>
    );
  }

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
              <p className="text-xs text-muted-foreground">Based on your recent submissions</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleGeneratePlan} disabled={loading} className="gap-2">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Target className="h-3.5 w-3.5 text-blue-400" /> Next Milestone
              </div>
              <div className="text-3xl font-extrabold text-blue-400">{currentRating + 200}</div>
              <div className="text-xs text-muted-foreground mt-1">Target rating</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <TrendingDown className="h-3.5 w-3.5 text-red-400" /> Weakest Topic
              </div>
              <div className="text-xl font-bold text-red-400 capitalize leading-tight">
                {data.weakTags[0] || '—'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Focus here first</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Zap className="h-3.5 w-3.5 text-emerald-400" /> Weak Tags Found
              </div>
              <div className="text-3xl font-extrabold text-emerald-400">{data.weakTags.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Topics to improve</div>
            </CardContent>
          </Card>
        </div>

        {/* Weak Tags Badges */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-400" />
              Your Weak Topics (Prioritize These)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.weakTags.map((tag, i) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-red-500/30 text-red-400 bg-red-500/5 capitalize"
                >
                  #{i + 1} {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* AI Advice */}
          <Card className="lg:col-span-3 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-4 w-4 text-primary" />
                Strategic Training Plan
              </CardTitle>
              <CardDescription>AI-generated advice based on your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/40 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap border border-border/50">
                {data.aiAdvice}
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
                {data.recommendations.map((prob, i) => (
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skill Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
              Skill Distribution
            </CardTitle>
            <CardDescription>
              Problems solved per topic — <span className="text-red-400">red = weak area</span>, <span className="text-primary">blue = strong</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="tag"
                    type="category"
                    width={130}
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
