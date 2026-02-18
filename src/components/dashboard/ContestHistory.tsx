'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContestResult } from '@/lib/mockdata';
import clsx from 'clsx';

interface ContestHistoryProps {
  contests: ContestResult[];
}

export function ContestHistory({ contests }: ContestHistoryProps) {
  return (
    <Card className="col-span-12 xl:col-span-8 overflow-hidden">
      <CardHeader>
        <CardTitle>Recent Contests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Contest</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Change</TableHead>
              <TableHead className="text-right">New Rating</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contests.map((contest, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{contest.contestName}</TableCell>
                <TableCell>{contest.date}</TableCell>
                <TableCell>{contest.rank}</TableCell>
                <TableCell>
                  <Badge
                    variant={contest.ratingChange > 0 ? 'secondary' : 'destructive'}
                    className={clsx(
                      contest.ratingChange > 0 ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                    )}
                  >
                    {contest.ratingChange > 0 ? `+${contest.ratingChange}` : contest.ratingChange}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{contest.newRating}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
