'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain, Zap, Target, TrendingDown, CheckCircle2, ExternalLink,
  RefreshCw, BookOpen,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  Cell, CartesianGrid, PieChart, Pie, Legend,
} from 'recharts';

// Sub-components
import { LCProfileHeader }    from '@/components/dashboard/lc/LCProfileHeader';
import { LCDifficultyCards }  from '@/components/dashboard/lc/LCDifficultyCards';
import { LCTopicProgress }    from '@/components/dashboard/lc/LCTopicProgress';

// ── Types ──────────────────────────────────────────────────────────────────────
interface LeetCodeDashboardProps {
  username: string;
}

interface TagEntry {
  tagName: string;
  tagSlug: string;
  problemsSolved: number;
  tier: 'fundamental' | 'intermediate' | 'advanced';
}

interface UserData {
  matchedUser: {
    username: string;
    profile: { ranking: number; userAvatar: string; countryName: string };
    submitStats: {
      acSubmissionNum:    { difficulty: string; count: number }[];
      totalSubmissionNum: { difficulty: string; count: number }[];
    };
    tagProblemCounts: {
      advanced:     TagEntry[];
      intermediate: TagEntry[];
      fundamental:  TagEntry[];
    };
  };
  userContestRanking: {
    attendedContestsCount: number;
    rating: number;
    globalRanking: number;
    topPercentage: number;
  } | null;
  recentAcSubmissionList: { title: string; titleSlug: string; timestamp: string; lang: string }[];
}

interface CoachData {
  acStats: Record<string, number>;
  weakTags: string[];
  recommendations: {
    topic: string;
    difficulty: string;
    url: string;
    solvedCount: number;
    suggestedCount: number;
  }[];
  tagDistribution: { tagName: string; tagSlug: string; problemsSolved: number; tier: string }[];
  aiAdvice: string;
  userLevel: string;
  contestRating: number | null;
  attendedContests: number;
}

const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(10,12,20,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '12px',
};

const TIER_COLORS: Record<string, string> = {
  fundamental:  '#3b82f6',
  intermediate: '#f59e0b',
  advanced:     '#ef4444',
};

// ── Main Component ─────────────────────────────────────────────────────────────
export function LeetCodeDashboard({ username }: LeetCodeDashboardProps) {
  const [userData,     setUserData]     = useState<UserData | null>(null);
  const [coachData,    setCoachData]    = useState<CoachData | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [coachLoading, setCoachLoading] = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [coachError,   setCoachError]   = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/leetcode?username=${username}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setUserData(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load LeetCode profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoach = async () => {
    setCoachLoading(true);
    setCoachError(null);
    try {
      const res  = await fetch('/api/leetcode/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCoachData(data);
    } catch (e: any) {
      setCoachError(e.message || 'Failed to generate plan');
    } finally {
      setCoachLoading(false);
    }
  };

  // ── Empty (prompt to load) ─────────────────────────────────────────────────
  if (!userData && !loading) {
    return (
      <Card className="border-dashed border-2 border-amber-500/20 bg-amber-500/5">
        <CardContent className="flex flex-col items-center justify-center py-14 space-y-5 text-center">
          <div className="p-5 bg-amber-500/10 rounded-full ring-4 ring-amber-500/5">
            <BookOpen className="h-12 w-12 text-amber-400" />
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-2xl font-bold">LeetCode Dashboard</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Connect your LeetCode account to see your Easy / Medium / Hard progress, topic mastery rings, and get a personalized AI study plan.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            {['Difficulty Breakdown', 'Topic Mastery', 'Contest Rating', 'AI Study Plan'].map(f => (
              <span key={f} className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted border border-border/50">
                <CheckCircle2 className="h-3 w-3 text-amber-400" /> {f}
              </span>
            ))}
          </div>
          <Button
            size="lg"
            onClick={fetchProfile}
            className="mt-2 px-8 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
          >
            <Zap className="mr-2 h-4 w-4" /> Load LeetCode Profile
          </Button>
          {error && <p className="text-destructive text-sm">{error}</p>}
        </CardContent>
      </Card>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400" />
        <p className="text-sm text-muted-foreground animate-pulse">Fetching LeetCode stats...</p>
      </div>
    );
  }

  if (!userData) return null;

  // ── Derived values ─────────────────────────────────────────────────────────
  const { matchedUser, userContestRanking, recentAcSubmissionList } = userData;
  const acNums = matchedUser.submitStats.acSubmissionNum;
  const totalNums = matchedUser.submitStats.totalSubmissionNum;

  const totalSolved    = acNums.find(s => s.difficulty === 'All')?.count    || 0;
  const easySolved     = acNums.find(s => s.difficulty === 'Easy')?.count   || 0;
  const mediumSolved   = acNums.find(s => s.difficulty === 'Medium')?.count || 0;
  const hardSolved     = acNums.find(s => s.difficulty === 'Hard')?.count   || 0;
  const totalAttempted = totalNums.find(s => s.difficulty === 'All')?.count || 1;
  const acceptanceRate = Math.round((totalSolved / totalAttempted) * 100);

  // Difficulty pie data
  const pieData = [
    { name: 'Easy',   value: easySolved,   color: '#22c55e' },
    { name: 'Medium', value: mediumSolved,  color: '#f59e0b' },
    { name: 'Hard',   value: hardSolved,    color: '#ef4444' },
  ];

  // Top tags for bar chart
  const allTagsForChart = [
    ...matchedUser.tagProblemCounts.fundamental.map(t  => ({ ...t, tier: 'fundamental'  as const })),
    ...matchedUser.tagProblemCounts.intermediate.map(t => ({ ...t, tier: 'intermediate' as const })),
    ...matchedUser.tagProblemCounts.advanced.map(t     => ({ ...t, tier: 'advanced'     as const })),
  ].sort((a, b) => b.problemsSolved - a.problemsSolved).slice(0, 12);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      {/* ── Profile Header ── */}
      <LCProfileHeader
        username={username}
        avatar={matchedUser.profile.userAvatar}
        ranking={matchedUser.profile.ranking}
        countryName={matchedUser.profile.countryName}
        easySolved={easySolved}
        mediumSolved={mediumSolved}
        hardSolved={hardSolved}
        totalSolved={totalSolved}
        contestRating={userContestRanking?.rating ? Math.round(userContestRanking.rating) : null}
        attendedContests={userContestRanking?.attendedContestsCount || 0}
      />

      {/* ── Topic Mastery Radial ── */}
      <LCTopicProgress
        fundamental={matchedUser.tagProblemCounts.fundamental.map(t => ({ ...t, tier: 'fundamental' as const }))}
        intermediate={matchedUser.tagProblemCounts.intermediate.map(t => ({ ...t, tier: 'intermediate' as const }))}
        advanced={matchedUser.tagProblemCounts.advanced.map(t => ({ ...t, tier: 'advanced' as const }))}
      />

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Difficulty Donut */}
        <Card className="md:col-span-4 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Difficulty Breakdown</CardTitle>
            <CardDescription>Accepted solutions by level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={58} outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ value }) => value}
                    labelLine={false}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any, n: any) => [`${v} solved`, n]} />
                  <Legend iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-1">
              Acceptance Rate — <span className="font-semibold text-foreground">{acceptanceRate}%</span>
            </p>
          </CardContent>
        </Card>

        {/* Tag Bar Chart */}
        <Card className="md:col-span-5 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Topics</CardTitle>
            <CardDescription>Most solved topics across tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={allTagsForChart} layout="vertical" margin={{ left: 0, right: 36 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="tagName" type="category" width={120}
                    tick={{ fontSize: 10, fill: '#888' }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(v: any) => [`${v} solved`, 'Problems']}
                  />
                  <Bar dataKey="problemsSolved" radius={[0, 6, 6, 0]} barSize={14}>
                    {allTagsForChart.map((entry, i) => (
                      <Cell key={i} fill={TIER_COLORS[entry.tier]} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-3 mt-2 flex-wrap">
              {Object.entries(TIER_COLORS).map(([tier, color]) => (
                <span key={tier} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: color }} />
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Solves */}
        <Card className="md:col-span-3 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Solves</CardTitle>
            <CardDescription>Last accepted submissions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[272px]">
              <div className="divide-y divide-border/30">
                {recentAcSubmissionList?.slice(0, 15).map((sub, i) => (
                  <a
                    key={i}
                    href={`https://leetcode.com/problems/${sub.titleSlug}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-muted/30 transition-colors group"
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span className="text-xs font-medium truncate group-hover:text-amber-400 transition-colors flex-1">
                      {sub.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{sub.lang}</span>
                  </a>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* ── Difficulty Progress Cards ── */}
      <LCDifficultyCards
        easySolved={easySolved}
        mediumSolved={mediumSolved}
        hardSolved={hardSolved}
      />

      {/* ── AI Coach ── */}
      {!coachData ? (
        <Card className="border-dashed border-2 border-amber-500/20 bg-amber-500/5">
          <CardContent className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
            <Brain className="h-10 w-10 text-amber-400" />
            <div>
              <h3 className="font-bold text-lg">LeetCode AI Coach</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Analyzes your tag distribution, identifies weak areas, and generates a 30-day topic-based study plan.
              </p>
            </div>
            <Button
              onClick={fetchCoach}
              disabled={coachLoading}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2"
            >
              {coachLoading
                ? <><RefreshCw className="h-4 w-4 animate-spin" /> Analyzing...</>
                : <><Zap className="h-4 w-4" /> Generate Study Plan</>
              }
            </Button>
            {coachError && <p className="text-destructive text-sm">{coachError}</p>}
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Coach header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Brain className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">AI Study Plan</h3>
                  <p className="text-xs text-muted-foreground">Based on your topic distribution</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={fetchCoach} disabled={coachLoading} className="gap-2">
                <RefreshCw className={`h-3.5 w-3.5 ${coachLoading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* AI Advice */}
              <Card className="lg:col-span-3 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Brain className="h-4 w-4 text-amber-400" />
                    30-Day Improvement Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/40 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap border border-border/50">
                    {coachData.aiAdvice}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="h-4 w-4 text-amber-400" />
                    Focus Topics
                  </CardTitle>
                  <CardDescription>Your weakest areas — practice here</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {coachData.recommendations.map((rec, i) => (
                      <a
                        key={i}
                        href={rec.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        <div className="p-3 rounded-lg border border-border/50 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-medium text-sm capitalize group-hover:text-amber-400 transition-colors">
                              {rec.topic}
                            </span>
                            <div className="flex items-center gap-1">
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{
                                  borderColor: rec.difficulty.includes('Easy')  ? '#22c55e40'
                                             : rec.difficulty.includes('Hard') ? '#ef444440' : '#f59e0b40',
                                  color: rec.difficulty.includes('Easy')  ? '#22c55e'
                                       : rec.difficulty.includes('Hard') ? '#ef4444' : '#f59e0b',
                                }}
                              >
                                {rec.difficulty}
                              </Badge>
                              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={Math.min(100, (rec.solvedCount / rec.suggestedCount) * 100)}
                              className="h-1 flex-1"
                            />
                            <span className="text-xs text-muted-foreground shrink-0">
                              {rec.solvedCount}/{rec.suggestedCount}
                            </span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weak Tags */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  Topics to Prioritize
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {coachData.weakTags.map((tag, i) => (
                    <a
                      key={tag}
                      href={`https://leetcode.com/tag/${tag}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Badge
                        variant="outline"
                        className="border-red-500/30 text-red-400 bg-red-500/5 capitalize hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        #{i + 1} {tag.replace(/-/g, ' ')}
                      </Badge>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
