
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
import { Download, Globe, Users, FileText, BarChart2 } from 'lucide-react';
import { Event } from '@/hooks/use-event-store';
import { Badge } from '@/components/ui/badge';
import { competitors } from '@/lib/data';

type EventTabsProps = {
    event: Event;
}

export function EventTabs({ event }: EventTabsProps) {

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
        <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex">
            <TabsTrigger value="results">Live Results</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="competitors">
                Competitors <Badge variant="secondary" className="ml-2">0</Badge>
            </TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

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
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><Globe className="h-4 w-4" />Links</h4>
                        {renderLinks(event.itineraryLinks || [])}
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><Download className="h-4 w-4" />Files</h4>
                        {renderFiles(event.itineraryFiles || [])}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText /> Documents</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><Globe className="h-4 w-4" />Links</h4>
                        {renderLinks(event.docsLinks || [])}
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><Download className="h-4 w-4" />Files</h4>
                        {renderFiles(event.docsFiles || [])}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
  );
}
