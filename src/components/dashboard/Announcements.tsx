
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { Megaphone } from 'lucide-react';
import type { DashboardSummary } from '@/lib/dashboard';

type AnnouncementsProps = {
    summary: DashboardSummary | null;
}

export function Announcements({ summary }: AnnouncementsProps) {
    return (
        <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5"/>Announcements</CardTitle>
                <CardDescription>Latest bulletins and information for all participants.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">Target: All</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>All</DropdownMenuItem>
                            <DropdownMenuItem>Competitors</DropdownMenuItem>
                            <DropdownMenuItem>Officials</DropdownMenuItem>
                            <DropdownMenuItem>Public</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button>New Announcement</Button>
                </div>

            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <div className="grid grid-cols-3">
                                <TableCell>Title</TableCell>
                                <TableCell>Event</TableCell>
                                <TableCell>Published</TableCell>
                            </div>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {summary?.latestAnnouncements && summary.latestAnnouncements.length > 0 ? summary.latestAnnouncements.map(ann => (
                            <TableRow key={ann.annId}>
                                 <div className="grid grid-cols-3">
                                    <TableCell className="font-medium">{ann.title}</TableCell>
                                    <TableCell>{ann.eventTitle}</TableCell>
                                    <TableCell className="text-muted-foreground">{ann.publishedAt ? new Date(ann.publishedAt.seconds * 1000).toLocaleString() : 'N/A'}</TableCell>
                                 </div>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                    No recent announcements.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
