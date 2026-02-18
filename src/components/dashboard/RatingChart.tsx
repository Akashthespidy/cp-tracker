'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface RatingChartProps {
  data: { date: string; rating: number }[];
  color: string;
}

export function RatingChart({ data, color }: RatingChartProps) {
  if (!data || data.length === 0) return null;

  const maxRating = Math.max(...data.map(d => d.rating));
  const minRating = Math.min(...data.map(d => d.rating));
  const lastRating = data[data.length - 1]?.rating;
  const firstRating = data[0]?.rating;
  const totalChange = lastRating - firstRating;
  const isPositive = totalChange >= 0;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">Rating History</CardTitle>
            <CardDescription>Your progress over {data.length} contests</CardDescription>
          </div>
          <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {isPositive ? '+' : ''}{totalChange}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pl-2 pt-0">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#555"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={40}
              />
              <YAxis
                stroke="#555"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[Math.max(0, minRating - 100), maxRating + 100]}
                width={45}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 12, 20, 0.95)',
                  color: '#fff',
                  border: `1px solid ${color}40`,
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                itemStyle={{ color: color }}
                formatter={(val: any) => [val, 'Rating']}
              />
              <Area
                type="monotone"
                dataKey="rating"
                stroke={color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRating)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0, fill: color }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
