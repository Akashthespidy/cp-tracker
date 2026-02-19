'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TopicRadial } from '@/components/dashboard/shared/TopicRadial';
import { BarChart2 } from 'lucide-react';

// Standard CF tag colors (most common tags)
const TAG_COLOR_MAP: Record<string, string> = {
  'implementation':        '#3b82f6',
  'math':                  '#8b5cf6',
  'greedy':                '#f59e0b',
  'dp':                    '#ef4444',
  'data structures':       '#06b6d4',
  'constructive algorithms':'#10b981',
  'brute force':           '#84cc16',
  'graphs':                '#f97316',
  'sortings':              '#a78bfa',
  'binary search':         '#fb7185',
  'dfs and similar':       '#34d399',
  'trees':                 '#fde68a',
  'strings':               '#93c5fd',
  'number theory':         '#c084fc',
};

function getTagColor(tag: string, idx: number): string {
  if (TAG_COLOR_MAP[tag]) return TAG_COLOR_MAP[tag];
  // Cycle through palette for unknown tags
  const palette = ['#3b82f6','#f59e0b','#ef4444','#10b981','#8b5cf6','#06b6d4','#f97316','#84cc16'];
  return palette[idx % palette.length];
}

interface CFTopicProgressProps {
  tagCounts: Record<string, number>;
}

export function CFTopicProgress({ tagCounts }: CFTopicProgressProps) {
  const topics = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag, count], idx) => ({
      name: tag,
      solved: count,
      color: getTagColor(tag, idx),
    }));

  if (topics.length === 0) return null;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Topic Mastery</CardTitle>
        </div>
        <CardDescription>
          Your most solved CF topics — ring fill = relative strength
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TopicRadial topics={topics} />
      </CardContent>
    </Card>
  );
}
