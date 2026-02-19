'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Trophy, TrendingUp, Target } from 'lucide-react';

interface LCProfileHeaderProps {
  username: string;
  avatar?: string;
  ranking?: number;
  countryName?: string;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSolved: number;
  contestRating: number | null;
  attendedContests: number;
}

export function LCProfileHeader({
  username,
  avatar,
  ranking,
  countryName,
  easySolved,
  mediumSolved,
  hardSolved,
  totalSolved,
  contestRating,
  attendedContests,
}: LCProfileHeaderProps) {
  const quickStats = [
    { label: 'Easy',           value: easySolved,                            color: 'text-emerald-400', icon: CheckCircle2 },
    { label: 'Medium',         value: mediumSolved,                          color: 'text-amber-400',   icon: TrendingUp   },
    { label: 'Hard',           value: hardSolved,                            color: 'text-red-400',     icon: Target       },
    { label: 'Contest Rating', value: contestRating ?? 'N/A',                color: 'text-purple-400',  icon: Trophy       },
  ];

  return (
    <Card className="border-amber-500/20 bg-gradient-to-r from-card to-amber-500/5 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-full border-4 border-amber-500/30 overflow-hidden bg-muted shrink-0">
            {avatar ? (
              <img src={avatar} alt={username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-amber-400">
                {username[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-extrabold tracking-tight">{username}</h2>
              {countryName && (
                <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/5 shrink-0">
                  {countryName}
                </Badge>
              )}
            </div>
            {ranking && (
              <p className="text-sm text-muted-foreground">
                Global Rank <span className="font-semibold text-foreground">#{ranking.toLocaleString()}</span>
                {attendedContests > 0 && (
                  <span className="ml-3 text-muted-foreground">{attendedContests} contests</span>
                )}
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
          {quickStats.map(({ label, value, color, icon: Icon }) => (
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
  );
}
