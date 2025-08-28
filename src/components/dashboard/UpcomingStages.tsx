
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
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

export function UpcomingStages() {
    return (
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5"/>Upcoming Stages (Next 7 Days)</CardTitle>
                <CardDescription>Prepare for what's next on the calendar.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <div className="grid grid-cols-5">
                                <TableCell>Date</TableCell>
                                <TableCell>Stage</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>Distance</TableCell>
                                <TableCell>Status</TableCell>
                            </div>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <div className="grid grid-cols-5">
                                <TableCell className="font-mono">Jul 28</TableCell>
                                <TableCell className="font-medium">SS3 - Myherin</TableCell>
                                <TableCell>Wales</TableCell>
                                <TableCell>29.13 km</TableCell>
                                <TableCell><Badge>Ready</Badge></TableCell>
                            </div>
                        </TableRow>
                        <TableRow>
                             <div className="grid grid-cols-5">
                                <TableCell className="font-mono">Jul 29</TableCell>
                                <TableCell className="font-medium">SS4 - Fafe</TableCell>
                                <TableCell>Portugal</TableCell>
                                <TableCell>11.18 km</TableCell>
                                <TableCell><Badge variant="outline">Docs Missing</Badge></TableCell>
                            </div>
                        </TableRow>
                            <TableRow>
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                No more upcoming stages in the next week.
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
