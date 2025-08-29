
'use client';

import { format, formatISO } from 'date-fns';
import { CalendarPlus, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Event } from '@/lib/events';

type DateDisplayProps = {
    event: Event;
}

export function DateDisplay({ event }: DateDisplayProps) {

    const formatForGoogle = (date: Date) => {
        return format(date, "yyyyMMdd'T'HHmmss'Z'");
    }

    const formatForIcs = (date: Date) => {
        return format(date, "yyyyMMdd'T'HHmmss'Z'");
    }
    
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatForGoogle(event.dates.from)}/${formatForGoogle(event.dates.to)}&location=${encodeURIComponent(event.hqLocation)}&details=${encodeURIComponent(`Details for ${event.title}`)}`;

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `UID:${event.id}@rally.world`,
        `DTSTAMP:${formatForIcs(new Date())}`,
        `DTSTART:${formatForIcs(event.dates.from)}`,
        `DTEND:${formatForIcs(event.dates.to)}`,
        `SUMMARY:${event.title}`,
        `LOCATION:${event.hqLocation}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\n');
    
    const icsUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;


    const renderDatePart = (date: Date) => {
        return (
            <div className="flex items-end gap-2">
                <span className="text-7xl font-bold text-accent font-mono leading-none">{format(date, 'dd')}</span>
                <div className="flex flex-col text-lg leading-tight">
                    <span className="font-bold">{format(date, 'MMM')}</span>
                    <span className="font-bold">{format(date, 'yyyy')}</span>
                </div>
            </div>
        )
    }

    return (
       <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button 
                    className="group flex items-end gap-4 rounded-lg p-4 transition-all hover:bg-white/10 hover:shadow-xl hover:scale-105"
                >
                    {renderDatePart(event.dates.from)}
                    <span className="text-5xl text-muted-foreground">-</span>
                    {renderDatePart(event.dates.to)}
                    <CalendarPlus className="ml-4 h-8 w-8 text-muted-foreground transition-all group-hover:text-accent" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">
                        Add to Google Calendar
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                     <a href={icsUrl} download={`${event.title}.ics`}>
                        Add to Apple/Outlook (.ics)
                    </a>
                </DropdownMenuItem>
            </DropdownMenuContent>
       </DropdownMenu>
    )

}
