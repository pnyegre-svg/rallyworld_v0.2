'use client';
import { Heart, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function DashboardPage() {
  return (
    <div className="space-y-4">
        <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome Rally Fan!</h1>
        </div>
        <p className="text-muted-foreground">
          Follow live events, view results, and explore the world of rally racing.
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search events, competitors, clubs..." className="pl-10" />
        </div>
    </div>
  );
}
