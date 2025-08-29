
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
import { Download, Globe, Users, FileText, BarChart2, Video, Megaphone, PlusCircle, Pin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/lib/events';
import { type Announcement } from '@/lib/announcements.client';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type EventTabsProps = {
    event: Event;
    announcements: Announcement[];
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export function EventTabs({ event, announcements, activeTab, setActiveTab }: EventTabsProps) {

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
  const tabCount = 5 + (hasLivestream ? 1 : 0);

  const renderLinks = (links: {name?: string, value: string}[]) => {
    if (!links || links.length === 0 || links.every(l => !l.value)) return <p className="text-sm text-muted-foreground">No links provided.</p>;

    const getLinkName = (link: {name?: string, value: string}) => {
        if (link.name) return link.name;
        try {
            const url = new URL(link.value);
            const pathParts = url.pathname.split('/');
            return pathParts[pathParts.length - 1] || link.value;
        } catch {
            return link.value;
        }
    }
    
    return (
        <ul className="list-disc list-inside space-y-1">
            {links.filter(l => l.value).map((link, index) => (
                <li key={index}>
                    <a href={link.value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                        {getLinkName(link)}
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
  
    const sortedAnnouncements = [...announcements].sort((a,b)=>{
        const pin = Number(!!b.pinned) - Number(!!a.pinned);
        if (pin) return pin;
        const ad = a.publishedAt?.toDate ? a.publishedAt.toDate() : a.publishedAt ? new Date(a.publishedAt) : null;
        const bd = b.publishedAt?.toDate ? b.publishedAt.toDate() : b.publishedAt ? new Date(b.publishedAt) : null;
        return (bd?.getTime()||0) - (ad?.getTime()||0);
    });

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={cn(
            "grid w-full md:w-auto md:inline-flex",
            `grid-cols-${tabCount}`
        )}>
            {hasLivestream && <TabsTrigger value="livestream"><span className="text-red-500 mr-2 animate-pulse">•</span>Live Stream</TabsTrigger>}
            <TabsTrigger value="results">Live Results</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="announcements">
                Announcements <Badge variant="secondary" className="ml-2">{announcements.length}</Badge>
            </TabsTrigger>
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

        <TabsContent value="announcements">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Megaphone /> Announcements</CardTitle>
                    <Button asChild className="bg-accent hover:bg-accent/90">
                        <Link href={`/announcements/new?eventId=${event.id}`}>
                            <PlusCircle className="mr-2 h-4 w-4" /> New Announcement
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                   {sortedAnnouncements.length > 0 ? (
                        <div className="space-y-4">
                            {sortedAnnouncements.map((ann) => (
                                <div key={ann.id} className="p-4 rounded-lg border bg-muted/50">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold">{ann.title}</h4>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            {ann.pinned && <Badge variant="default" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50"><Pin className="h-3 w-3 mr-1"/>Pinned</Badge>}
                                            <Badge variant={ann.status === 'published' ? 'default' : 'secondary'} className="capitalize">{ann.status}</Badge>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/announcements/edit/${event.id}/${ann.id}`}>Edit</Link>
                                            </Button>
                                        </div>
                                    </div>
                                    {ann.body && <p className="mt-2 text-sm text-muted-foreground">{ann.body.substring(0, 150)}{ann.body.length > 150 ? '...' : ''}</p>}
                                </div>
                            ))}
                        </div>
                   ) : (
                    <p className="text-muted-foreground">No announcements have been posted for this event yet.</p>
                   )}
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
