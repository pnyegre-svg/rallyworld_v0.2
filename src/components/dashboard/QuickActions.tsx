
'use client';

import { Button } from '@/components/ui/button';
import { PlusSquare, Users, FileUp, Megaphone } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild className="h-20 text-lg bg-accent hover:bg-accent/90" size="lg">
                <Link href="/organizer/create-event"><PlusSquare className="mr-4 h-6 w-6"/> Create Event</Link>
            </Button>
                <Button asChild className="h-20 text-lg" size="lg" variant="outline">
                <Link href="#"><Users className="mr-4 h-6 w-6"/> Manage Entries</Link>
            </Button>
                <Button asChild className="h-20 text-lg" size="lg" variant="outline">
                <Link href="#"><FileUp className="mr-4 h-6 w-6"/> Upload Docs</Link>
            </Button>
                <Button asChild className="h-20 text-lg" size="lg" variant="outline">
                <Link href="#"><Megaphone className="mr-4 h-6 w-6"/> Post Announcement</Link>
            </Button>
        </div>
    );
}
