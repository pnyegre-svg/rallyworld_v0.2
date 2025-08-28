
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import type { DashboardSummary } from '@/lib/dashboard';

type TodayStagesProps = {
    summary: DashboardSummary | null;
}

export function TodayStages({ summary }: TodayStagesProps) {
    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5"/>Today's Stages</CardTitle>
                    <CardDescription>What's happening right now.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <div className="grid grid-cols-4">
                                <TableCell>Time</TableCell>
                                <TableCell>Stage</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell className="text-right">Actions</TableCell>
                            </div>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {summary?.todayStages && summary.todayStages.length > 0 ? summary.todayStages.map(stage => (
                            <TableRow key={stage.stageId}>
                                <div className="grid grid-cols-4">
                                    <TableCell className="font-mono">{stage.startAt ? new Date(stage.startAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</TableCell>
                                    <TableCell className="font-medium">{stage.stageName}</TableCell>
                                    <TableCell><Badge variant="outline" className="capitalize">{stage.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">View</Button>
                                    </TableCell>
                                </div>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                    No stages scheduled for today.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
