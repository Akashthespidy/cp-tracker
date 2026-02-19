'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Award, CheckCircle2, Flame } from 'lucide-react';

interface QuickStat {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}

interface CFProfileHeaderProps {
  handle: string;
  rank: string;
  rankColor: string;
  rating: number;
  maxRating: number;
  totalSolved: number;
  contestCount: number;
  nextRank: { rank: string; target: number; color: string };
  progressToNext: number;
  avatar?: string;
}

export function CFProfileHeader({
  handle,
  rank,
  rankColor,
  rating,
  maxRating,
  totalSolved,
  contestCount,
  nextRank,
  progressToNext,
  avatar,
}: CFProfileHeaderProps) {
  const quickStats: QuickStat[] = [
    { icon: TrendingUp,   label: 'Max Rating',      value: maxRating,          color: 'text-primary'    },
    { icon: CheckCircle2, label: 'Problems Solved',  value: totalSolved || '—', color: 'text-emerald-400' },
    { icon: Award,        label: 'Contests',         value: contestCount,       color: 'text-amber-400'  },
    { icon: Flame,        label: 'Next Target',      value: nextRank.target,    color: 'text-orange-400' },
  ];

  return (
    <Card className="border-border/50 bg-gradient-to-r from-card to-muted/30 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <Avatar
            className="h-20 w-20 border-4 shadow-xl shrink-0"
            style={{ borderColor: `${rankColor}40` }}
          >
            <AvatarImage src={avatar} />
            <AvatarFallback className="text-2xl font-bold">
              {handle[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Handle + rank + progress */}
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-extrabold tracking-tight truncate">{handle}</h2>
              <Badge
                className="text-sm px-3 py-1 font-semibold border-0 shrink-0"
                style={{ backgroundColor: `${rankColor}20`, color: rankColor }}
              >
                {rank}
              </Badge>
            </div>

            {/* Next rank progress */}
            <div className="space-y-1 max-w-xs">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{rating}</span>
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

          {/* Current Rating */}
          <div className="sm:text-right shrink-0">
            <div className="text-4xl font-extrabold" style={{ color: rankColor }}>
              {rating}
            </div>
            <div className="text-xs text-muted-foreground">Current Rating</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
          {quickStats.map(({ icon: Icon, label, value, color }) => (
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
