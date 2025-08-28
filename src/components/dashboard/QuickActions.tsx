

'use client';

import { Button } from '@/components/ui/button';
import { PlusSquare, Users, FileUp, Megaphone } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
    return (
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild size="sm" className="bg-accent hover:bg-accent/90">
                <Link href="/organizer/create-event"><PlusSquare className="mr-2 h-4 w-4"/> Create Event</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
                <Link href="/entries"><Users className="mr-2 h-4 w-4"/> Manage Entries</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
                <Link href="#"><FileUp className="mr-2 h-4 w-4"/> Upload Docs</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
                <Link href="/announcements/new"><Megaphone className="mr-2 h-4 w-4"/> Post Announcement</Link>
            </Button>
        </div>
    );
}
