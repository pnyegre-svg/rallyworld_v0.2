
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MapPin, Share2, UserPlus } from 'lucide-react';
import { Event } from '@/lib/events';
import { DateDisplay } from './date-display';

type EventHeaderProps = {
  event: Event;
};

export function EventHeader({ event }: EventHeaderProps) {
  return (
    <div className="relative w-full h-[450px] rounded-2xl overflow-hidden text-primary-foreground">
        <Image
            src="https://images.unsplash.com/photo-1589980763519-ddfa1c640d10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxyYWxseXxlbnwwfHx8fDE3NTYyMzgzNTN8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Rally car background"
            data-ai-hint="rally car racing"
            fill
            className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-headline font-bold">{event.title}</h1>
                    <p className="text-lg text-muted-foreground">Evenimente Restrictionate</p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-5 w-5" />
                        <span>{event.hqLocation}</span>
                    </div>
                </div>

                <div className="flex-shrink-0 mt-6 md:mt-0 md:ml-8">
                    <DateDisplay event={event} />
                </div>
            </div>
        </div>

        <div className="absolute top-6 right-6 flex items-center gap-2">
            <Button variant="outline" className="bg-black/20 border-white/20 hover:bg-black/50">
                <Share2 className="mr-2" /> Share
            </Button>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <UserPlus className="mr-2"/> Register
            </Button>
        </div>
    </div>
  );
}

