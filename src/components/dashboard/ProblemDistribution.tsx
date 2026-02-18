'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ProblemStatsProps {
  data: { difficulty: string; count: number; color: string }[];
  type?: 'bar' | 'pie'; // Add type prop to switch visualization
}

export function ProblemDistribution({ data, type = 'bar' }: ProblemStatsProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Problem Difficulty</CardTitle>
        <CardDescription>
          Your solved problems by difficulty
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          {type === 'pie' ? (
            <PieChart>
               <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
                nameKey="difficulty"
               >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#333', color: '#fff' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          ) : (
            <BarChart data={data}>
              <XAxis
                dataKey="difficulty"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#333', color: '#fff' }}
                cursor={{ fill: 'transparent' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList dataKey="count" position="top" className="fill-foreground text-xs font-bold" />
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
