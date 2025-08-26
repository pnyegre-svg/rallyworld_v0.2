'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { leaderboard, stages, Competitor } from '@/lib/data';
import { useUserStore } from '@/hooks/use-user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function UpdateTimeDialog({ competitor }: { competitor: Competitor }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Update Time</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Time for {competitor.name}</DialogTitle>
          <DialogDescription>
            Enter the new stage time. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stage-time" className="text-right">
              Stage Time
            </Label>
            <Input id="stage-time" defaultValue="00:00.0" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" className="bg-accent hover:bg-accent/90">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function LeaderboardPage() {
  const { user } = useUserStore();

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return names[0].substring(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead>Competitor</TableHead>
              <TableHead>Vehicle</TableHead>
              {stages.filter(s => s.status !== 'upcoming').map(stage => (
                <TableHead key={stage.id} className="text-right">{stage.name}</TableHead>
              ))}
              <TableHead className="text-right">Total Time</TableHead>
              {user.currentRole === 'timekeeper' && <TableHead></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((entry) => (
              <TableRow key={entry.rank}>
                <TableCell className="font-bold text-center">{entry.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                       <AvatarImage src={entry.competitor.avatar} alt={entry.competitor.name} />
                       <AvatarFallback>{getInitials(entry.competitor.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{entry.competitor.name}</div>
                        <div className="text-xs text-muted-foreground">{entry.competitor.team}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{entry.competitor.vehicle}</TableCell>
                {stages.filter(s => s.status !== 'upcoming').map(stage => (
                    <TableCell key={stage.id} className="text-right font-mono">
                        {entry.stageTimes.find(st => st.stageId === stage.id)?.time || '-'}
                    </TableCell>
                ))}
                <TableCell className="font-bold text-right font-mono">{entry.totalTime}</TableCell>
                {user.currentRole === 'timekeeper' && (
                  <TableCell className="text-right">
                    <UpdateTimeDialog competitor={entry.competitor} />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
