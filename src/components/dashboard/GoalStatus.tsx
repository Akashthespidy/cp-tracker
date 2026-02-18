'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink } from 'lucide-react';
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

  useEffect(() => {
    setGoal(initialGoal);
    setDisplayedGoal(initialGoal);
  }, [initialGoal]);

  const progress = Math.min(100, (currentRating / displayedGoal) * 100);

  const handleGoalUpdate = () => {
    setDisplayedGoal(goal);
  };

  return (
    <Card className="col-span-12 xl:col-span-4 h-full">
      <CardHeader>
        <CardTitle>Goal Tracker</CardTitle>
        <CardDescription>
          Set your next rating milestone
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Current: {currentRating}</span>
              <span>Goal: {displayedGoal}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex gap-2">
            <Input
              type="number"
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              className="w-full"
              placeholder="Set new goal"
            />
            <Button onClick={handleGoalUpdate}>Set</Button>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-sm">Recommended Problems</h4>
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-3">
                {recommendations.map((problem, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm">{problem.title}</span>
                      <div className="flex gap-2">
                        {problem.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={
                        typeof problem.difficulty === 'number' && problem.difficulty > currentRating 
                          ? "bg-red-500/10 text-red-500 border-red-500/20" 
                          : "bg-green-500/10 text-green-500 border-green-500/20"
                      }>
                        {problem.difficulty}
                      </Badge>
                      <Button size="icon" variant="ghost" className="h-6 w-6">
                        <ExternalLink size={14} />
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
