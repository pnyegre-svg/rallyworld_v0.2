
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUserStore } from '@/hooks/use-user';
import { PlusCircle } from 'lucide-react';
import { getCompetitors, type Competitor } from '@/lib/competitors';
import { db } from '@/lib/firebase.client';
import { Skeleton } from '@/components/ui/skeleton';

export default function CompetitorsPage() {
  const { user } = useUserStore();
  const [competitors, setCompetitors] = React.useState<Competitor[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadCompetitors() {
      setLoading(true);
      const fetchedCompetitors = await getCompetitors(db);
      setCompetitors(fetchedCompetitors);
      setLoading(false);
    }
    loadCompetitors();
  }, []);

  if (loading) {
    return (
       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden text-center">
                 <CardHeader className="p-0">
                    <div className="relative h-32 w-full bg-muted">
                        <Skeleton className="h-full w-full" />
                    </div>
                     <div className="pt-16 pb-2">
                        <Skeleton className="h-5 w-3/4 mx-auto" />
                    </div>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                </CardContent>
                <CardFooter className="p-2">
                    <Skeleton className="h-4 w-full" />
                </CardFooter>
            </Card>
        ))}
       </div>
    );
  }

  return (
    <div className="flex-1">
        <div className="flex items-center justify-end mb-4">
            {user.currentRole === 'organizer' && (
              <Button size="sm" className="gap-1 bg-accent hover:bg-accent/90">
                <PlusCircle className="h-4 w-4" />
                Add Competitor
              </Button>
            )}
        </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {competitors.map((competitor) => (
          <Card key={competitor.id} className="overflow-hidden text-center">
            <CardHeader className="p-0">
              <div className="relative h-32 w-full bg-muted">
                <Image
                  src={`https://picsum.photos/seed/${competitor.id}/400/200`}
                  alt={`${competitor.name}'s rally car`}
                  data-ai-hint="rally car"
                  fill
                  style={{ objectFit: 'cover' }}
                />
                 <div className="absolute bottom-[-3rem] left-1/2 -translate-x-1/2">
                    <Image
                        src={competitor.avatar}
                        alt={competitor.name}
                        data-ai-hint="person portrait"
                        width={96}
                        height={96}
                        className="rounded-full border-4 border-card"
                    />
                 </div>
              </div>
               <div className="pt-16 pb-2">
                    <CardTitle className="font-headline text-lg">{competitor.name}</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{competitor.team}</p>
            </CardContent>
            <CardFooter className="flex justify-center bg-muted/50 p-2 text-xs">
              <p>{competitor.vehicle}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
