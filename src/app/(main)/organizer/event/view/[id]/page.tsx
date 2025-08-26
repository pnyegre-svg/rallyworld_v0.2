
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useEventStore } from '@/hooks/use-event-store';
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
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Calendar, MapPin, Link as LinkIcon, FileText, Download, Globe } from 'lucide-react';
import Link from 'next/link';

export default function ViewEventPage() {
  const params = useParams();
  const { events } = useEventStore();
  const eventId = params.id as string;
  const event = events.find(e => e.id === eventId);

  if (!event) {
    return <div>Event not found.</div>;
  }
  
  const renderLinks = (links: {value: string}[]) => {
    if (!links || links.length === 0 || links.every(l => !l.value)) return <p className="text-sm text-muted-foreground">No links provided.</p>;
    return (
        <ul className="list-disc list-inside space-y-1">
            {links.filter(l => l.value).map((link, index) => (
                <li key={index}>
                    <a href={link.value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                        {link.value}
                    </a>
                </li>
            ))}
        </ul>
    );
  };
  
  const renderFiles = (files: {value: File}[]) => {
     if (!files || files.length === 0 || files.every(f => !f.value)) return <p className="text-sm text-muted-foreground">No files uploaded.</p>;
     return (
        <ul className="space-y-2">
            {files.filter(f => f.value).map((file, index) => (
                 <li key={index} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted">
                    <span className="truncate">{file.value.name}</span>
                    {/* In a real app, clicking this would trigger a download from cloud storage */}
                    <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-2"/>
                        Download
                    </Button>
                </li>
            ))}
        </ul>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">{event.title}</CardTitle>
        <CardDescription className="flex items-center gap-4 pt-2">
            <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(event.dates.from, 'LLL dd, y')} - {format(event.dates.to, 'LLL dd, y')}
            </span>
             <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {event.hqLocation}
            </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Separator />
        
        <div className="grid md:grid-cols-2 gap-6">
             <div>
                <h3 className="text-lg font-medium mb-2">Event Links</h3>
                <div className="space-y-2">
                    {event.whatsappLink && <p className="text-sm flex items-center gap-2"><LinkIcon className="h-4 w-4" /> WhatsApp: <a href={event.whatsappLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{event.whatsappLink}</a></p>}
                    {event.livestreamLink && <p className="text-sm flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Livestream: <a href={event.livestreamLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{event.livestreamLink}</a></p>}
                </div>
            </div>
        </div>

        <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-medium flex items-center gap-2"><FileText /> Itinerary</h3>
             <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2"><Globe className="h-4 w-4" />Links</h4>
                    {renderLinks(event.itineraryLinks || [])}
                </div>
                <div>
                     <h4 className="font-semibold mb-2 flex items-center gap-2"><Download className="h-4 w-4" />Files</h4>
                    {renderFiles(event.itineraryFiles || [])}
                </div>
            </div>
        </div>

         <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-medium flex items-center gap-2"><FileText /> Documents</h3>
             <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2"><Globe className="h-4 w-4" />Links</h4>
                    {renderLinks(event.docsLinks || [])}
                </div>
                <div>
                     <h4 className="font-semibold mb-2 flex items-center gap-2"><Download className="h-4 w-4" />Files</h4>
                    {renderFiles(event.docsFiles || [])}
                </div>
            </div>
        </div>

        <div>
            <h3 className="text-lg font-medium mb-2">Stages</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Stage Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">Distance (km)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {event.stages.map((stage, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{stage.name}</TableCell>
                            <TableCell>{stage.location}</TableCell>
                            <TableCell className="text-right font-mono">{stage.distance.toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                     {event.stages.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">No stages have been added for this event.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
        
      </CardContent>
    </Card>
  );
}
