'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ProblemStatsProps {
  data: { difficulty: string; count: number; color: string }[];
  type?: 'bar' | 'pie';
}

export function ProblemDistribution({ data, type = 'bar' }: ProblemStatsProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">Problems Solved</CardTitle>
            <CardDescription>By difficulty rating</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{total}</div>
            <div className="text-xs text-muted-foreground">total</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pl-2 pt-0">
        <ResponsiveContainer width="100%" height={220}>
          {type === 'pie' ? (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="count"
                nameKey="difficulty"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10,12,20,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconSize={10} />
            </PieChart>
          ) : (
            <BarChart data={data} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="difficulty"
                stroke="#555"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#555"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10,12,20,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                formatter={(val: any) => [`${val} solved`, 'Count']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={50}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
