'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TopicRadial } from '@/components/dashboard/shared/TopicRadial';
import { Tag } from 'lucide-react';

interface TagEntry {
  tagName: string;
  tagSlug: string;
  problemsSolved: number;
  tier: 'fundamental' | 'intermediate' | 'advanced';
}

interface LCTopicProgressProps {
  fundamental: TagEntry[];
  intermediate: TagEntry[];
  advanced: TagEntry[];
}

const TIER_COLORS: Record<string, string> = {
  fundamental:  '#3b82f6',
  intermediate: '#f59e0b',
  advanced:     '#ef4444',
};

export function LCTopicProgress({ fundamental, intermediate, advanced }: LCTopicProgressProps) {
  const allTags: (TagEntry & { color: string })[] = [
    ...fundamental.map(t => ({ ...t, color: TIER_COLORS.fundamental })),
    ...intermediate.map(t => ({ ...t, color: TIER_COLORS.intermediate })),
    ...advanced.map(t => ({ ...t, color: TIER_COLORS.advanced })),
  ]
    .sort((a, b) => b.problemsSolved - a.problemsSolved)
    .slice(0, 10);

  const radialTopics = allTags.map(t => ({
    name: t.tagName,
    solved: t.problemsSolved,
    color: t.color,
  }));

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Topic Mastery</CardTitle>
        </div>
        <CardDescription>
          Your most-solved LeetCode topics — ring fill = relative strength
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Radial circles */}
        <TopicRadial topics={radialTopics} />

        {/* Tier legend */}
        <div className="flex gap-3 flex-wrap pt-2 border-t border-border/40">
          {Object.entries(TIER_COLORS).map(([tier, color]) => (
            <span key={tier} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
