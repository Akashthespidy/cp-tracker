'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain, Zap, Target, TrendingUp, CheckCircle2, ExternalLink,
  Trophy, RefreshCw, BarChart2, TrendingDown, BookOpen, Award
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid,
  PieChart, Pie, Legend
} from 'recharts';

interface LeetCodeDashboardProps {
  username: string;
}

interface UserData {
  matchedUser: {
    username: string;
    profile: {
      ranking: number;
      userAvatar: string;
      countryName: string;
    };
    submitStats: {
      acSubmissionNum: { difficulty: string; count: number }[];
      totalSubmissionNum: { difficulty: string; count: number }[];
    };
    tagProblemCounts: {
      advanced: { tagName: string; tagSlug: string; problemsSolved: number }[];
      intermediate: { tagName: string; tagSlug: string; problemsSolved: number }[];
      fundamental: { tagName: string; tagSlug: string; problemsSolved: number }[];
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
  recommendations: { topic: string; difficulty: string; url: string; solvedCount: number; suggestedCount: number }[];
  tagDistribution: { tagName: string; tagSlug: string; problemsSolved: number; tier: string }[];
  aiAdvice: string;
  userLevel: string;
  contestRating: number | null;
  attendedContests: number;
}

const DIFFICULTY_COLORS = {
  Easy: '#22c55e',
  Medium: '#f59e0b',
  Hard: '#ef4444',
};

const TIER_COLORS: Record<string, string> = {
  fundamental: '#3b82f6',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
};

export function LeetCodeDashboard({ username }: LeetCodeDashboardProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [coachData, setCoachData] = useState<CoachData | null>(null);
  const [loading, setLoading] = useState(false);
  const [coachLoading, setCoachLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coachError, setCoachError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/leetcode?username=${username}`);
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
      const res = await fetch('/api/leetcode/coach', {
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

  // ── Empty State ──────────────────────────────────────────────────────────────
  if (!userData && !loading) {
    return (
      <Card className="border-dashed border-2 border-amber-500/20 bg-amber-500/5">
        <CardContent className="flex flex-col items-center justify-center py-14 space-y-5 text-center">
          <div className="p-5 bg-amber-500/10 rounded-full ring-4 ring-amber-500/5">
            <img src="/leetcode.svg" alt="LeetCode" className="h-12 w-12" onError={(e: any) => { e.target.style.display = 'none'; }} />
            <BookOpen className="h-12 w-12 text-amber-400 hidden" />
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-2xl font-bold">LeetCode Dashboard</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Connect your LeetCode account to see your solved count breakdown (Easy / Medium / Hard), topic distribution, and get a personalized improvement plan.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            {['Difficulty Breakdown', 'Topic Mastery', 'Contest Rating', 'AI Study Plan'].map(f => (
              <span key={f} className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted border border-border/50">
                <CheckCircle2 className="h-3 w-3 text-amber-400" /> {f}
              </span>
            ))}
          </div>
          <Button size="lg" onClick={fetchProfile} className="mt-2 px-8 bg-amber-500 hover:bg-amber-600 text-black font-semibold">
            <Zap className="mr-2 h-4 w-4" /> Load LeetCode Profile
          </Button>
          {error && <p className="text-destructive text-sm">{error}</p>}
        </CardContent>
      </Card>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400" />
        <p className="text-sm text-muted-foreground animate-pulse">Fetching LeetCode stats...</p>
      </div>
    );
  }

  if (!userData) return null;

  const { matchedUser, userContestRanking, recentAcSubmissionList } = userData;
  const acNums = matchedUser.submitStats.acSubmissionNum;
  const totalNums = matchedUser.submitStats.totalSubmissionNum;

  const totalSolved = acNums.find(s => s.difficulty === 'All')?.count || 0;
  const easySolved = acNums.find(s => s.difficulty === 'Easy')?.count || 0;
  const mediumSolved = acNums.find(s => s.difficulty === 'Medium')?.count || 0;
  const hardSolved = acNums.find(s => s.difficulty === 'Hard')?.count || 0;

  const totalSubmissions = totalNums.find(s => s.difficulty === 'All')?.count || 1;
  const acceptanceRate = Math.round((totalSolved / totalSubmissions) * 100);

  // Difficulty pie data
  const pieData = [
    { name: 'Easy', value: easySolved, color: DIFFICULTY_COLORS.Easy },
    { name: 'Medium', value: mediumSolved, color: DIFFICULTY_COLORS.Medium },
    { name: 'Hard', value: hardSolved, color: DIFFICULTY_COLORS.Hard },
  ];

  // Top tags (combine all tiers, sorted)
  const allTags = [
    ...matchedUser.tagProblemCounts.fundamental.map(t => ({ ...t, tier: 'fundamental' })),
    ...matchedUser.tagProblemCounts.intermediate.map(t => ({ ...t, tier: 'intermediate' })),
    ...matchedUser.tagProblemCounts.advanced.map(t => ({ ...t, tier: 'advanced' })),
  ].sort((a, b) => b.problemsSolved - a.problemsSolved).slice(0, 12);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Profile Header */}
      <Card className="border-amber-500/20 bg-gradient-to-r from-card to-amber-500/5 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-full border-4 border-amber-500/30 overflow-hidden bg-muted shrink-0">
              {matchedUser.profile.userAvatar ? (
                <img src={matchedUser.profile.userAvatar} alt={username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-amber-400">
                  {username[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-extrabold tracking-tight">{username}</h2>
                {matchedUser.profile.countryName && (
                  <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/5">
                    {matchedUser.profile.countryName}
                  </Badge>
                )}
              </div>
              {matchedUser.profile.ranking && (
                <p className="text-sm text-muted-foreground">
                  Global Rank #{matchedUser.profile.ranking.toLocaleString()}
                </p>
              )}
            </div>

            {/* Total Solved */}
            <div className="sm:text-right shrink-0">
              <div className="text-4xl font-extrabold text-amber-400">{totalSolved}</div>
              <div className="text-xs text-muted-foreground">problems solved</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
            {[
              { label: 'Easy', value: easySolved, color: 'text-emerald-400', icon: CheckCircle2 },
              { label: 'Medium', value: mediumSolved, color: 'text-amber-400', icon: TrendingUp },
              { label: 'Hard', value: hardSolved, color: 'text-red-400', icon: Target },
              {
                label: 'Contest Rating',
                value: userContestRanking?.rating ? Math.round(userContestRanking.rating) : 'N/A',
                color: 'text-purple-400',
                icon: Trophy,
              },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                  {label}
                </div>
                <div className={`text-xl font-bold ${color}`}>{value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Difficulty Breakdown Donut */}
        <Card className="md:col-span-4 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Difficulty Breakdown</CardTitle>
            <CardDescription>Accepted solutions by level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(10,12,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any, name: any) => [`${val} solved`, name]}
                  />
                  <Legend iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Acceptance rate */}
            <div className="mt-2 text-center">
              <span className="text-xs text-muted-foreground">
                Acceptance Rate — <span className="font-semibold text-foreground">{acceptanceRate}%</span>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Tag Distribution Bar Chart */}
        <Card className="md:col-span-5 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Topic Mastery</CardTitle>
            <CardDescription>Top solved topics across all tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={allTags} layout="vertical" margin={{ left: 0, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="tagName"
                    type="category"
                    width={120}
                    tick={{ fontSize: 10, fill: '#888' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(10,12,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any) => [`${val} solved`, 'Problems']}
                  />
                  <Bar dataKey="problemsSolved" radius={[0, 4, 4, 0]} barSize={14}>
                    {allTags.map((entry, i) => (
                      <Cell key={i} fill={TIER_COLORS[entry.tier]} opacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
              {Object.entries(TIER_COLORS).map(([tier, color]) => (
                <span key={tier} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: color }} />
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contest + Recent */}
        <Card className="md:col-span-3 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Solves</CardTitle>
            <CardDescription>Last accepted submissions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[280px]">
              <div className="divide-y divide-border/30">
                {recentAcSubmissionList?.slice(0, 12).map((sub, i) => (
                  <a
                    key={i}
                    href={`https://leetcode.com/problems/${sub.titleSlug}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors group"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="text-xs font-medium truncate group-hover:text-amber-400 transition-colors">{sub.title}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-auto">{sub.lang}</span>
                  </a>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Easy', solved: easySolved, total: 880, color: '#22c55e', bg: 'from-emerald-500/10' },
          { label: 'Medium', solved: mediumSolved, total: 1842, color: '#f59e0b', bg: 'from-amber-500/10' },
          { label: 'Hard', solved: hardSolved, total: 834, color: '#ef4444', bg: 'from-red-500/10' },
        ].map(({ label, solved, total, color, bg }) => {
          const pct = Math.min(100, Math.round((solved / total) * 100));
          return (
            <Card key={label} className={`bg-gradient-to-br ${bg} to-transparent border-border/50`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-baseline mb-3">
                  <span className="text-sm font-semibold" style={{ color }}>{label}</span>
                  <span className="text-2xl font-extrabold" style={{ color }}>{solved}</span>
                </div>
                <Progress value={pct} className="h-1.5 mb-1" style={{ '--progress-color': color } as any} />
                <div className="text-xs text-muted-foreground">{pct}% of ~{total} {label} problems</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Coach */}
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
            <Button onClick={fetchCoach} disabled={coachLoading} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2">
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

              {/* Topic Recommendations */}
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
                                  borderColor: rec.difficulty.includes('Easy') ? '#22c55e40' : rec.difficulty.includes('Hard') ? '#ef444440' : '#f59e0b40',
                                  color: rec.difficulty.includes('Easy') ? '#22c55e' : rec.difficulty.includes('Hard') ? '#ef4444' : '#f59e0b',
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
                      <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/5 capitalize hover:bg-red-500/10 transition-colors cursor-pointer">
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
