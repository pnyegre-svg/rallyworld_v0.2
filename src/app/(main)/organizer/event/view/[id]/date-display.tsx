
'use client';

import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CalendarPlus } from 'lucide-react';

type DateDisplayProps = {
    from: Date;
    to: Date;
}

export function DateDisplay({ from, to }: DateDisplayProps) {
    const { toast } = useToast();

    const handleAddToCalendar = () => {
        // In a real implementation, this would generate an .ics file or a link
        // to Google Calendar, Outlook, etc.
        toast({
            title: "Coming Soon!",
            description: "Ability to add this event to your calendar is on its way.",
        });
    };


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
       <button 
        onClick={handleAddToCalendar}
        className="group flex items-end gap-4 rounded-lg p-4 transition-all hover:bg-white/10 hover:shadow-xl hover:scale-105"
        >
            {renderDatePart(from)}
            <span className="text-5xl text-muted-foreground">-</span>
            {renderDatePart(to)}
            <CalendarPlus className="ml-4 h-8 w-8 text-muted-foreground transition-all group-hover:text-accent" />
        </button>
    )

}
