
'use client';

import { format } from 'date-fns';

type DateDisplayProps = {
    from: Date;
    to: Date;
}

export function DateDisplay({ from, to }: DateDisplayProps) {

    const renderDatePart = (date: Date) => {
        return (
            <div className="flex items-end gap-2">
                <span className="text-5xl font-bold text-accent font-headline leading-none">{format(date, 'dd')}</span>
                <div className="flex flex-col text-sm leading-tight">
                    <span className="font-semibold">{format(date, 'MMM')}</span>
                    <span>{format(date, 'yyyy')}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-end gap-4">
            {renderDatePart(from)}
            <span className="text-3xl text-muted-foreground">-</span>
            {renderDatePart(to)}
        </div>
    )

}
