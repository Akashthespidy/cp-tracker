'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Platform, getMockProfile, getRatingHistory, getProblemStats, getRecentContests, getRecommendations, UserProfile, Recommendation, ProblemStats, ContestResult } from '@/lib/mockdata';
import { format } from 'date-fns';
import { RatingChart } from '@/components/dashboard/RatingChart';
import { ProblemDistribution } from '@/components/dashboard/ProblemDistribution';
import { ContestHistory } from '@/components/dashboard/ContestHistory';
import { GoalStatus } from '@/components/dashboard/GoalStatus';
import { CoachView } from '@/components/dashboard/CoachView';
import { motion } from 'framer-motion';
import { TrendingUp, Award, CheckCircle2, Flame } from 'lucide-react';

interface PlatformDashboardProps {
  platform: Platform;
  handle: string;
}

const THEME_COLORS: Record<Platform, string> = {
  Codeforces: '#3b82f6',
  LeetCode: '#f59e0b',
  CodeChef: '#8b4513',
  AtCoder: '#1f2937',
};

// Codeforces rank → color mapping
function getRankColor(rank: string): string {
  const r = rank.toLowerCase();
  if (r.includes('legendary grandmaster')) return '#ff0000';
  if (r.includes('international grandmaster')) return '#ff0000';
  if (r.includes('grandmaster')) return '#ff0000';
  if (r.includes('international master')) return '#ff8c00';
  if (r.includes('master')) return '#ff8c00';
  if (r.includes('candidate master')) return '#aa00aa';
  if (r.includes('expert')) return '#0000ff';
  if (r.includes('specialist')) return '#03a89e';
  if (r.includes('pupil')) return '#008000';
  return '#808080'; // newbie / unrated
}

// Next rank milestone
function getNextRank(rating: number): { rank: string; target: number; color: string } {
  if (rating < 1200) return { rank: 'Pupil', target: 1200, color: '#008000' };
  if (rating < 1400) return { rank: 'Specialist', target: 1400, color: '#03a89e' };
  if (rating < 1600) return { rank: 'Expert', target: 1600, color: '#0000ff' };
  if (rating < 1900) return { rank: 'Candidate Master', target: 1900, color: '#aa00aa' };
  if (rating < 2100) return { rank: 'Master', target: 2100, color: '#ff8c00' };
  if (rating < 2300) return { rank: 'International Master', target: 2300, color: '#ff8c00' };
  if (rating < 2400) return { rank: 'Grandmaster', target: 2400, color: '#ff0000' };
  if (rating < 2600) return { rank: 'International Grandmaster', target: 2600, color: '#ff0000' };
  return { rank: 'Legendary Grandmaster', target: 3000, color: '#ff0000' };
}

export function PlatformDashboard({ platform, handle }: PlatformDashboardProps) {
  const [profile, setProfile] = useState<UserProfile>(getMockProfile(platform, handle));
  const [ratingHistory, setRatingHistory] = useState<any[]>(getRatingHistory(platform));
  const [problemStats, setProblemStats] = useState<ProblemStats[]>(getProblemStats(platform));
  const [recentContests, setRecentContests] = useState<ContestResult[]>(getRecentContests(platform));
  const [recommendations, setRecommendations] = useState<Recommendation[]>(getRecommendations(platform, profile.rating));
  const [totalSolved, setTotalSolved] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      if (platform === 'Codeforces') {
        try {
          const res = await fetch(`/api/codeforces?handle=${handle}`);
          const data = await res.json();

          if (data.error) {
            setError(data.error);
            setLoading(false);
            return;
          }

          const newProfile: UserProfile = {
            handle: data.info.handle,
            rating: data.info.rating || 0,
            maxRating: data.info.maxRating || 0,
            rank: data.info.rank ? (data.info.rank.charAt(0).toUpperCase() + data.info.rank.slice(1)) : 'Unrated',
            avatar: data.info.titlePhoto,
          };
          setProfile(newProfile);

          const newHistory = data.ratingHistory.map((r: any) => ({
            date: format(new Date(r.ratingUpdateTimeSeconds * 1000), 'MMM yy'),
            rating: r.newRating,
          }));
          setRatingHistory(newHistory);

          const reversedHistory = [...data.ratingHistory].reverse().slice(0, 10);
          const newContests: ContestResult[] = reversedHistory.map((r: any) => ({
            contestName: r.contestName,
            rank: r.rank,
            ratingChange: r.newRating - r.oldRating,
            newRating: r.newRating,
            date: format(new Date(r.ratingUpdateTimeSeconds * 1000), 'yyyy-MM-dd'),
          }));
          setRecentContests(newContests);

          const solved = new Set<string>();
          const ratingCounts: Record<string, number> = {
            '≤1000': 0, '1001–1200': 0, '1201–1400': 0, '1401–1600': 0, '1601+': 0
          };

          data.submissions.forEach((sub: any) => {
            if (sub.verdict === 'OK' && sub.problem.rating) {
              const key = `${sub.problem.contestId}-${sub.problem.index}`;
              if (!solved.has(key)) {
                solved.add(key);
                const r = sub.problem.rating;
                if (r <= 1000) ratingCounts['≤1000']++;
                else if (r <= 1200) ratingCounts['1001–1200']++;
                else if (r <= 1400) ratingCounts['1201–1400']++;
                else if (r <= 1600) ratingCounts['1401–1600']++;
                else ratingCounts['1601+']++;
              }
            }
          });

          setTotalSolved(solved.size);
          setProblemStats([
            { difficulty: '≤1000',    count: ratingCounts['≤1000'],    color: '#8884d8' },
            { difficulty: '1001–1200', count: ratingCounts['1001–1200'], color: '#82ca9d' },
            { difficulty: '1201–1400', count: ratingCounts['1201–1400'], color: '#ffc658' },
            { difficulty: '1401–1600', count: ratingCounts['1401–1600'], color: '#ff8042' },
            { difficulty: '1601+',    count: ratingCounts['1601+'],    color: '#ef4444' },
          ]);

          setRecommendations(getRecommendations(platform, newProfile.rating));
        } catch (err) {
          setError('Failed to fetch Codeforces data');
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        const timer = setTimeout(() => {
          setProfile(getMockProfile(platform, handle));
          setRatingHistory(getRatingHistory(platform));
          setProblemStats(getProblemStats(platform));
          setRecentContests(getRecentContests(platform));
          setRecommendations(getRecommendations(platform, getMockProfile(platform, handle).rating));
          setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
      }
    }

    fetchData();
  }, [platform, handle]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Fetching your stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-16">
        <Card className="border-destructive/30 bg-destructive/5 max-w-sm w-full">
          <CardContent className="p-6 text-center space-y-2">
            <p className="font-semibold text-destructive">Handle not found</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rankColor = getRankColor(profile.rank);
  const nextRank = getNextRank(profile.rating);
  const progressToNext = Math.min(100, Math.round(
    ((profile.rating - (nextRank.target - 200)) / 200) * 100
  ));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Profile Header */}
      <Card className="border-border/50 bg-gradient-to-r from-card to-muted/30 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <Avatar className="h-20 w-20 border-4 shadow-xl" style={{ borderColor: `${rankColor}40` }}>
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="text-2xl font-bold">{profile.handle[0].toUpperCase()}</AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-extrabold tracking-tight">{profile.handle}</h2>
                <Badge
                  className="text-sm px-3 py-1 font-semibold border-0"
                  style={{ backgroundColor: `${rankColor}20`, color: rankColor }}
                >
                  {profile.rank}
                </Badge>
              </div>

              {/* Next rank progress */}
              <div className="space-y-1 max-w-xs">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{profile.rating}</span>
                  <span className="font-medium" style={{ color: nextRank.color }}>
                    → {nextRank.rank} ({nextRank.target})
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${progressToNext}%`, backgroundColor: nextRank.color }}
                  />
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex sm:flex-col gap-4 sm:gap-2 sm:text-right">
              <div>
                <div className="text-4xl font-extrabold" style={{ color: rankColor }}>
                  {profile.rating}
                </div>
                <div className="text-xs text-muted-foreground">Current Rating</div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
            {[
              { icon: TrendingUp, label: 'Max Rating', value: profile.maxRating, color: 'text-primary' },
              { icon: CheckCircle2, label: 'Problems Solved', value: totalSolved || '—', color: 'text-emerald-400' },
              { icon: Award, label: 'Contests', value: ratingHistory.length, color: 'text-amber-400' },
              { icon: Flame, label: 'Next Target', value: nextRank.target, color: 'text-orange-400' },
            ].map(({ icon: Icon, label, value, color }) => (
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Charts */}
        <div className="col-span-12 md:col-span-8 space-y-6">
          <RatingChart data={ratingHistory} color={THEME_COLORS[platform]} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProblemDistribution data={problemStats} type={platform === 'LeetCode' ? 'pie' : 'bar'} />
            <ContestHistory contests={recentContests} />
          </div>
        </div>

        {/* Right: Goal */}
        <div className="col-span-12 md:col-span-4 space-y-6">
          <GoalStatus
            key={`${platform}-${handle}`}
            currentRating={profile.rating}
            initialGoal={nextRank.target}
            recommendations={recommendations}
          />
        </div>

        {/* AI Coach — full width */}
        {platform === 'Codeforces' && (
          <div className="col-span-12">
            <CoachView handle={handle} currentRating={profile.rating} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
