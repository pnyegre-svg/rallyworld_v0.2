
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, AlertTriangle, Clock, CheckCircle, Download } from 'lucide-react';
import type { DashboardSummary } from '@/lib/dashboard';

type EntriesAndPaymentsProps = {
    counters: DashboardSummary['counters'] | undefined;
}

export function EntriesAndPayments({ counters }: EntriesAndPaymentsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/>Entries & Payments</CardTitle>
                <CardDescription>Status of competitor registrations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-around text-center">
                    <div>
                        <p className="text-3xl font-bold">{counters?.pendingEntries ?? 0}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-orange-400"/>Pending</p>
                    </div>
                        <div>
                        <p className="text-3xl font-bold">{counters?.unpaidEntries ?? 0}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-4 w-4 text-red-500"/>Unpaid</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">48</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-500"/>Confirmed</p>
                    </div>
                </div>
                    <div className="flex flex-col gap-2">
                        <Button variant="outline">Bulk Approve</Button>
                        <Button variant="outline">Message Pending</Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground"><Download className="mr-2 h-4 w-4"/>Export CSV</Button>
                    </div>
            </CardContent>
        </Card>
    );
}
