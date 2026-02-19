'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface DifficultyCard {
  label: 'Easy' | 'Medium' | 'Hard';
  solved: number;
  total: number;
  color: string;
  gradient: string;
}

const DIFFICULTY_DATA: Omit<DifficultyCard, 'solved'>[] = [
  { label: 'Easy',   total: 880,  color: '#22c55e', gradient: 'from-emerald-500/10' },
  { label: 'Medium', total: 1842, color: '#f59e0b', gradient: 'from-amber-500/10'   },
  { label: 'Hard',   total: 834,  color: '#ef4444', gradient: 'from-red-500/10'     },
];

interface LCDifficultyCardsProps {
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
}

export function LCDifficultyCards({ easySolved, mediumSolved, hardSolved }: LCDifficultyCardsProps) {
  const solvedMap: Record<string, number> = {
    Easy:   easySolved,
    Medium: mediumSolved,
    Hard:   hardSolved,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {DIFFICULTY_DATA.map(({ label, total, color, gradient }) => {
        const solved = solvedMap[label];
        const pct = Math.min(100, Math.round((solved / total) * 100));

        return (
          <Card key={label} className={`bg-gradient-to-br ${gradient} to-transparent border-border/50`}>
            <CardContent className="p-4">
              <div className="flex justify-between items-baseline mb-3">
                <span className="text-sm font-semibold" style={{ color }}>{label}</span>
                <span className="text-2xl font-extrabold" style={{ color }}>{solved}</span>
              </div>
              <Progress value={pct} className="h-1.5 mb-1" />
              <div className="text-xs text-muted-foreground">
                {pct}% of ~{total.toLocaleString()} {label} problems
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
