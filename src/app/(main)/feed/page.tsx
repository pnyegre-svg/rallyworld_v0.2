
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FeedPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground h-48 flex items-center justify-center">
          The community feed will be available here soon!
        </p>
      </CardContent>
    </Card>
  );
}
