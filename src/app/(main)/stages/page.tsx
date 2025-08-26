'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
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
import { Badge } from '@/components/ui/badge';
import { stages } from '@/lib/data';
import { useUserStore } from '@/hooks/use-user';
import { PlusCircle } from 'lucide-react';

export default function StagesPage() {
  const { user } = useUserStore();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'secondary';
      case 'live':
        return 'destructive';
      case 'upcoming':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Rally Stages</CardTitle>
        {user.currentRole === 'organizer' && (
          <Button size="sm" className="gap-1 bg-accent hover:bg-accent/90">
            <PlusCircle className="h-4 w-4" />
            Create Stage
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stage</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Distance (km)</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stages.map((stage) => (
              <TableRow key={stage.id}>
                <TableCell className="font-medium">{stage.name}</TableCell>
                <TableCell>{stage.location}</TableCell>
                <TableCell className="text-right">{stage.distance.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={getStatusVariant(stage.status)} className="capitalize">
                    {stage.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
