'use client';

import {
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip,
  Cell, PieChart, Pie, Legend, LabelList,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ProblemStatsProps {
  data: { difficulty: string; count: number; color: string }[];
  type?: 'bar' | 'pie';
  /** If provided, overrides the sum of bars as the displayed total (e.g. to include unrated) */
  totalOverride?: number;
}

interface BarLabelProps {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
}

function BarLabel(props: BarLabelProps) {
  const { x = 0, y = 0, width = 0, value } = props;
  if (!value) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 5}
      fill="#aaa"
      fontSize={10}
      fontWeight={600}
      textAnchor="middle"
    >
      {value}
    </text>
  );
}

export function ProblemDistribution({ data, type = 'bar', totalOverride }: ProblemStatsProps) {
  const ratedTotal = data.reduce((sum, d) => sum + d.count, 0);
  const displayTotal = totalOverride ?? ratedTotal;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">Problems Solved</CardTitle>
            <CardDescription>By difficulty rating</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{displayTotal}</div>
            <div className="text-xs text-muted-foreground">
              total {totalOverride && totalOverride > ratedTotal ? `(${ratedTotal} rated)` : ''}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pl-2 pt-0">
        <div style={{ width: '100%', height: 220 }}>
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
                label={({ value }) => `${value}`}
                labelLine={false}
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
            <BarChart data={data} margin={{ top: 24, right: 10, bottom: 0, left: 0 }}>
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
                formatter={(val: number | undefined) => [`${val ?? 0} solved`, 'Count']}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
                ))}
                <LabelList dataKey="count" content={<BarLabel />} />
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
