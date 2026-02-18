'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Platform, getMockProfile, getRatingHistory, getProblemStats, getRecentContests, getRecommendations } from '@/lib/mockdata';
import { RatingChart } from '@/components/dashboard/RatingChart';
import { ProblemDistribution } from '@/components/dashboard/ProblemDistribution';
import { ContestHistory } from '@/components/dashboard/ContestHistory';
import { GoalStatus } from '@/components/dashboard/GoalStatus';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface PlatformDashboardProps {
  platform: Platform;
  handle: string;
}

const THEME_COLORS = {
  Codeforces: '#3b82f6', // blue-500
  LeetCode: '#f59e0b',   // amber-500
  CodeChef: '#8b4513',   // saddlebrown
  AtCoder: '#1f2937',    // gray-800
};

export function PlatformDashboard({ platform, handle }: PlatformDashboardProps) {
  const [profile, setProfile] = useState(getMockProfile(platform, handle));
  const [ratingHistory, setRatingHistory] = useState(getRatingHistory(platform));
  const [problemStats, setProblemStats] = useState(getProblemStats(platform));
  const [recentContests, setRecentContests] = useState(getRecentContests(platform));
  const [recommendations, setRecommendations] = useState(getRecommendations(platform, profile.rating));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    const timer = setTimeout(() => {
      setProfile(getMockProfile(platform, handle));
      setRatingHistory(getRatingHistory(platform));
      setProblemStats(getProblemStats(platform));
      setRecentContests(getRecentContests(platform));
      setRecommendations(getRecommendations(platform, getMockProfile(platform, handle).rating));
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [platform, handle]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Profile Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="col-span-4 bg-gradient-to-r from-background to-muted/50 border-none shadow-sm">
          <CardContent className="flex items-center gap-6 p-6">
            <Avatar className="h-20 w-20 border-4 border-background shadow-xl">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback>{profile.handle[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight">{profile.handle}</h2>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm px-3 py-1 shadow-sm" style={{ backgroundColor: `${THEME_COLORS[platform]}20`, color: THEME_COLORS[platform] }}>
                  {profile.rank}
                </Badge>
                <span className="text-muted-foreground text-sm">Max Rating: {profile.maxRating}</span>
              </div>
            </div>
            <div className="ml-auto text-right hidden md:block">
              <div className="text-sm text-muted-foreground">Current Rating</div>
              <div className="text-4xl font-extrabold" style={{ color: THEME_COLORS[platform] }}>
                {profile.rating}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Charts */}
        <div className="col-span-12 md:col-span-8 space-y-6">
          <RatingChart data={ratingHistory} color={THEME_COLORS[platform]} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProblemDistribution 
              data={problemStats} 
              type={platform === 'LeetCode' ? 'pie' : 'bar'} 
            />
            <ContestHistory contests={recentContests} />
          </div>
        </div>

        {/* Right Column: Goal & Recommendations */}
        <div className="col-span-12 md:col-span-4 space-y-6">
             <GoalStatus 
                key={`${platform}-${handle}`}
                currentRating={profile.rating} 
                initialGoal={profile.rating + 200} 
                recommendations={recommendations}
             />
        </div>
      </div>
    </motion.div>
  );
}
