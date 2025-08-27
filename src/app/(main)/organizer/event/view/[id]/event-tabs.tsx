
'use client';

import * as React from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Globe, Users, FileText, BarChart2, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { competitors } from '@/lib/data';
import { Event } from '@/lib/events';
import { cn } from '@/lib/utils';


type EventTabsProps = {
    event: Event;
}

export function EventTabs({ event }: EventTabsProps) {

  const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    let videoId = null;
    
    try {
        // Standard watch URL
        const urlObj = new URL(url);
        if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
             videoId = urlObj.searchParams.get('v');
        } else if (urlObj.hostname === 'youtu.be') {
             videoId = urlObj.pathname.slice(1);
        }
    } catch (e) {
        // Fallback for invalid URLs or other formats
    }
    
    if (!videoId && url.includes('/embed/')) {
        videoId = url.split('/embed/')[1].split('?')[0];
    } else if (!videoId && url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
    }

    if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;

    // If it's another video provider, just return the raw link but we can't embed it.
    // In a real app, you'd add parsers for Facebook, etc.
    return null;
  }

  const embedUrl = getYouTubeEmbedUrl(event.livestreamLink || '');
  const hasLivestream = !!event.livestreamLink;

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
  
  const renderFiles = (files: any[]) => { // `any` because we don't have file uploads yet
     if (!files || files.length === 0) return <p className="text-sm text-muted-foreground">No files uploaded.</p>;
     return (
        <ul className="space-y-2">
            {files.map((file, index) => (
                 <li key={index} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted">
                    <span className="truncate">{file.name || 'uploaded-file'}</span>
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
    <Tabs defaultValue="results" className="w-full">
        <TabsList className={cn(
            "grid w-full md:w-auto md:inline-flex",
            hasLivestream ? "grid-cols-5" : "grid-cols-4"
        )}>
            {hasLivestream && <TabsTrigger value="livestream"><span className="text-red-500 mr-2 animate-pulse">•</span>Live Stream</TabsTrigger>}
            <TabsTrigger value="results">Live Results</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="competitors">
                Competitors <Badge variant="secondary" className="ml-2">0</Badge>
            </TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {hasLivestream && (
            <TabsContent value="livestream">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Video /> Live Stream</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {embedUrl ? (
                            <div className="aspect-video w-full rounded-lg overflow-hidden">
                                <iframe 
                                    width="100%" 
                                    height="100%" 
                                    src={embedUrl}
                                    title="YouTube video player" 
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ) : (
                             <p className="text-muted-foreground">The live stream link is not a valid YouTube URL. <a href={event.livestreamLink} target="_blank" rel="noopener noreferrer" className="text-primary underline">Watch here</a>.</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        )}

        <TabsContent value="results">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart2 /> Results</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Live results will be available here once the event starts.</p>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="overview">
             <Card>
                <CardHeader>
                    <CardTitle>Stages</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="competitors">
            <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users/> Competitors</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Competitor information will be available here.</p>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText /> Itinerary</CardTitle>
                </CardHeader>
                <CardContent>
                    <h4 className="font-semibold mb-2 flex items-center gap-2"><Globe className="h-4 w-4" />Links</h4>
                    {renderLinks(event.itineraryLinks || [])}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText /> Documents</CardTitle>
                </CardHeader>
                <CardContent>
                    <h4 className="font-semibold mb-2 flex items-center gap-2"><Globe className="h-4 w-4" />Links</h4>
                    {renderLinks(event.docsLinks || [])}
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
  );
}
