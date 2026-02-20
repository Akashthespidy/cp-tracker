'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ContestResult } from '@/lib/mockdata';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ContestHistoryProps {
  contests: ContestResult[];
}

export function ContestHistory({ contests }: ContestHistoryProps) {
  if (!contests || contests.length === 0) return null;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recent Contests</CardTitle>
        <CardDescription>Last {contests.length} rated contests</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[220px]">
          <div className="divide-y divide-border/30">
            {contests.map((contest, i) => {
              const isUp = contest.ratingChange > 0;
              const isDown = contest.ratingChange < 0;
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors">
                  {/* Change icon */}
                  <div className={`shrink-0 ${isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-muted-foreground'}`}>
                    {isUp ? <TrendingUp className="h-4 w-4" /> : isDown ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                  </div>

                  {/* Contest name */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{contest.contestName}</div>
                    <div className="text-xs text-muted-foreground">{contest.date} · Rank #{contest.rank}</div>
                  </div>

                  {/* Rating change */}
                  <div className="text-right shrink-0">
                    <div className={`text-sm font-bold ${isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-muted-foreground'}`}>
                      {isUp ? '+' : ''}{contest.ratingChange}
                    </div>
                    <div className="text-xs text-muted-foreground">{contest.newRating}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
