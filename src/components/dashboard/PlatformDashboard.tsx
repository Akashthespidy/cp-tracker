'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Platform, getMockProfile, getRatingHistory, getProblemStats,
  getRecentContests, getRecommendations,
  UserProfile, Recommendation, ProblemStats, ContestResult,
} from '@/lib/mockdata';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

// Sub-components
import { CFProfileHeader }   from '@/components/dashboard/cf/CFProfileHeader';
import { CFTopicProgress }   from '@/components/dashboard/cf/CFTopicProgress';
import { RatingChart }       from '@/components/dashboard/RatingChart';
import { ProblemDistribution } from '@/components/dashboard/ProblemDistribution';
import { ContestHistory }    from '@/components/dashboard/ContestHistory';
import { GoalStatus }        from '@/components/dashboard/GoalStatus';
import { CoachView }         from '@/components/dashboard/CoachView';

interface PlatformDashboardProps {
  platform: Platform;
  handle: string;
}

const THEME_COLORS: Record<Platform, string> = {
  Codeforces: '#3b82f6',
  LeetCode:   '#f59e0b',
  CodeChef:   '#8b4513',
  AtCoder:    '#818cf8',
};

// ── Rank utilities ────────────────────────────────────────────────────────────
function getRankColor(rank: string): string {
  const r = rank.toLowerCase();
  if (r.includes('legendary grandmaster'))    return '#ff0000';
  if (r.includes('international grandmaster')) return '#ff0000';
  if (r.includes('grandmaster'))              return '#ff0000';
  if (r.includes('international master'))     return '#ff8c00';
  if (r.includes('master'))                   return '#ff8c00';
  if (r.includes('candidate master'))         return '#aa00aa';
  if (r.includes('expert'))                   return '#0000ff';
  if (r.includes('specialist'))               return '#03a89e';
  if (r.includes('pupil'))                    return '#008000';
  return '#808080';
}

function getNextRank(rating: number): { rank: string; target: number; color: string } {
  if (rating < 1200) return { rank: 'Pupil',                    target: 1200, color: '#008000' };
  if (rating < 1400) return { rank: 'Specialist',               target: 1400, color: '#03a89e' };
  if (rating < 1600) return { rank: 'Expert',                   target: 1600, color: '#0000ff' };
  if (rating < 1900) return { rank: 'Candidate Master',         target: 1900, color: '#aa00aa' };
  if (rating < 2100) return { rank: 'Master',                   target: 2100, color: '#ff8c00' };
  if (rating < 2300) return { rank: 'International Master',     target: 2300, color: '#ff8c00' };
  if (rating < 2400) return { rank: 'Grandmaster',              target: 2400, color: '#ff0000' };
  if (rating < 2600) return { rank: 'International Grandmaster',target: 2600, color: '#ff0000' };
  // Already Legendary Grandmaster — peaked
  return { rank: '✦ Legendary Grandmaster',                     target: rating, color: '#ff0000' };
}

// ─────────────────────────────────────────────────────────────────────────────

export function PlatformDashboard({ platform, handle }: PlatformDashboardProps) {
  const [profile,        setProfile]        = useState<UserProfile>(getMockProfile(platform, handle));
  const [ratingHistory,  setRatingHistory]  = useState<any[]>(getRatingHistory(platform));
  const [problemStats,   setProblemStats]   = useState<ProblemStats[]>(getProblemStats(platform));
  const [recentContests, setRecentContests] = useState<ContestResult[]>(getRecentContests(platform));
  const [recommendations,setRecommendations]= useState<Recommendation[]>(getRecommendations(platform, profile.rating));
  const [totalSolved,    setTotalSolved]    = useState(0);
  const [tagCounts,      setTagCounts]      = useState<Record<string, number>>({});
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      if (platform === 'Codeforces') {
        try {
          const res  = await fetch(`/api/codeforces?handle=${handle}`);
          const data = await res.json();

          if (data.error) { setError(data.error); return; }

          // Profile
          const newProfile: UserProfile = {
            handle:    data.info.handle,
            rating:    data.info.rating    || 0,
            maxRating: data.info.maxRating || 0,
            rank:      data.info.rank
              ? data.info.rank.charAt(0).toUpperCase() + data.info.rank.slice(1)
              : 'Unrated',
            avatar: data.info.titlePhoto,
          };
          setProfile(newProfile);

          // Rating history
          setRatingHistory(data.ratingHistory.map((r: any) => ({
            date:   format(new Date(r.ratingUpdateTimeSeconds * 1000), 'MMM yy'),
            rating: r.newRating,
          })));

          // Recent contests (last 10, newest first)
          setRecentContests(
            [...data.ratingHistory].reverse().slice(0, 10).map((r: any) => ({
              contestName: r.contestName,
              rank:        r.rank,
              ratingChange: r.newRating - r.oldRating,
              newRating:   r.newRating,
              date:        format(new Date(r.ratingUpdateTimeSeconds * 1000), 'yyyy-MM-dd'),
            }))
          );

          // Submissions → solved counts + rating buckets + tag counts
          const allSolved   = new Set<string>();
          const ratedSolved = new Set<string>();
          const tagMap: Record<string, number> = {};
          const ratingCounts: Record<string, number> = {
            '≤1000': 0, '1001–1200': 0, '1201–1400': 0, '1401–1600': 0, '1601+': 0,
          };

          data.submissions.forEach((sub: any) => {
            if (sub.verdict !== 'OK' || !sub.problem) return;
            const key       = `${sub.problem.contestId}-${sub.problem.index}`;
            const isNewSolve = !allSolved.has(key);
            allSolved.add(key);

            // Tag counts (once per unique solved problem)
            if (isNewSolve && sub.problem.tags) {
              sub.problem.tags.forEach((tag: string) => {
                tagMap[tag] = (tagMap[tag] || 0) + 1;
              });
            }

            // Rating buckets
            if (sub.problem.rating && !ratedSolved.has(key)) {
              ratedSolved.add(key);
              const r = sub.problem.rating;
              if      (r <= 1000) ratingCounts['≤1000']++;
              else if (r <= 1200) ratingCounts['1001–1200']++;
              else if (r <= 1400) ratingCounts['1201–1400']++;
              else if (r <= 1600) ratingCounts['1401–1600']++;
              else                ratingCounts['1601+']++;
            }
          });

          setTotalSolved(allSolved.size);
          setTagCounts(tagMap);
          setProblemStats([
            { difficulty: '≤1000',     count: ratingCounts['≤1000'],     color: '#8884d8' },
            { difficulty: '1001–1200', count: ratingCounts['1001–1200'], color: '#82ca9d' },
            { difficulty: '1201–1400', count: ratingCounts['1201–1400'], color: '#ffc658' },
            { difficulty: '1401–1600', count: ratingCounts['1401–1600'], color: '#ff8042' },
            { difficulty: '1601+',     count: ratingCounts['1601+'],     color: '#ef4444' },
          ]);

          setRecommendations(getRecommendations(platform, newProfile.rating));
        } catch (err) {
          setError('Failed to fetch Codeforces data');
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        // Other platforms — use mock data
        const timer = setTimeout(() => {
          setProfile(getMockProfile(platform, handle));
          setRatingHistory(getRatingHistory(platform));
          setProblemStats(getProblemStats(platform));
          setRecentContests(getRecentContests(platform));
          setRecommendations(getRecommendations(platform, getMockProfile(platform, handle).rating));
          setLoading(false);
        }, 400);
        return () => clearTimeout(timer);
      }
    }

    fetchData();
  }, [platform, handle]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Fetching your stats...</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
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

  const rankColor      = getRankColor(profile.rank);
  const nextRank       = getNextRank(profile.rating);
  // If target == current rating, user is at max rank — show full bar
  const isMaxRank      = nextRank.target === profile.rating;
  const progressToNext = isMaxRank
    ? 100
    : Math.min(100, Math.round(((profile.rating - (nextRank.target - 200)) / 200) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* ── Profile Header ── */}
      <CFProfileHeader
        handle={profile.handle}
        rank={profile.rank}
        rankColor={rankColor}
        rating={profile.rating}
        maxRating={profile.maxRating}
        totalSolved={totalSolved}
        contestCount={ratingHistory.length}
        nextRank={nextRank}
        progressToNext={progressToNext}
        avatar={profile.avatar}
      />

      {/* ── Topic Mastery (radial circles) ── */}
      {Object.keys(tagCounts).length > 0 && (
        <CFTopicProgress tagCounts={tagCounts} />
      )}

      {/* ── Charts + Goal Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left column */}
        <div className="col-span-12 md:col-span-8 space-y-6">
          <RatingChart data={ratingHistory} color={THEME_COLORS[platform]} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProblemDistribution
              data={problemStats}
              type={platform === 'LeetCode' ? 'pie' : 'bar'}
              totalOverride={totalSolved}
            />
            <ContestHistory contests={recentContests} />
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-12 md:col-span-4">
          <GoalStatus
            key={`${platform}-${handle}`}
            currentRating={profile.rating}
            initialGoal={nextRank.target}
            recommendations={recommendations}
          />
        </div>

        {/* AI Coach — full width, Codeforces only */}
        {platform === 'Codeforces' && (
          <div className="col-span-12">
            <CoachView handle={handle} currentRating={profile.rating} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
