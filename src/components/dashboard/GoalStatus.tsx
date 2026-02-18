'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Target, Trophy, Edit2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Recommendation } from '@/lib/mockdata';

interface GoalStatusProps {
  currentRating: number;
  initialGoal: number;
  recommendations: Recommendation[];
}

export function GoalStatus({ currentRating, initialGoal, recommendations }: GoalStatusProps) {
  const [goal, setGoal] = useState(initialGoal);
  const [displayedGoal, setDisplayedGoal] = useState(initialGoal);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setGoal(initialGoal);
    setDisplayedGoal(initialGoal);
  }, [initialGoal]);

  const progress = Math.min(100, Math.round((currentRating / displayedGoal) * 100));
  const remaining = Math.max(0, displayedGoal - currentRating);

  const handleGoalUpdate = () => {
    setDisplayedGoal(goal);
    setEditing(false);
  };

  return (
    <Card className="col-span-12 xl:col-span-4 h-full border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-400" />
          Goal Tracker
        </CardTitle>
        <CardDescription>Your path to the next rank</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-3xl font-extrabold text-primary">{currentRating}</span>
              <span className="text-sm text-muted-foreground">→ <span className="font-semibold text-foreground">{displayedGoal}</span></span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress}% complete</span>
              <span>{remaining} points to go</span>
            </div>
          </div>

          {/* Edit Goal */}
          {editing ? (
            <div className="flex gap-2">
              <Input
                type="number"
                value={goal}
                onChange={(e) => setGoal(Number(e.target.value))}
                className="h-9"
                placeholder="Set new goal"
                autoFocus
              />
              <Button size="sm" onClick={handleGoalUpdate}>Set</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>✕</Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-muted-foreground"
              onClick={() => setEditing(true)}
            >
              <Edit2 className="h-3.5 w-3.5" />
              Change Goal Rating
            </Button>
          )}

          {/* Recommendations */}
          <div className="space-y-3 pt-2 border-t border-border/50">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-primary" />
              Suggested Problems
            </h4>
            <ScrollArea className="h-[220px] pr-2">
              <div className="space-y-2">
                {recommendations.map((problem, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 hover:bg-muted transition-colors border border-transparent hover:border-border/50"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="font-medium text-sm truncate">{problem.title}</span>
                      <div className="flex gap-1 flex-wrap">
                        {problem.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <Badge
                        variant="outline"
                        className={
                          typeof problem.difficulty === 'number' && problem.difficulty > currentRating
                            ? 'border-red-500/30 text-red-400 bg-red-500/5'
                            : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
                        }
                      >
                        {problem.difficulty}
                      </Badge>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-primary">
                        <ExternalLink size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
