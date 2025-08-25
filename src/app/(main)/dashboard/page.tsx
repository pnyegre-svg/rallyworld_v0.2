import { Megaphone, Wrench } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { newsPosts } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <h2 className="font-headline text-2xl font-bold mb-4">Latest News</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {newsPosts.map((post) => (
            <Card key={post.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 font-headline">
                        {post.type === 'system' ? <Wrench className="h-5 w-5 text-muted-foreground" /> : <Megaphone className="h-5 w-5 text-muted-foreground" />}
                        {post.title}
                        </CardTitle>
                        <CardDescription>
                            by {post.author} &bull; {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                        </CardDescription>
                    </div>
                    <Badge variant={post.type === 'system' ? 'secondary' : 'default'} className="capitalize">
                        {post.type}
                    </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{post.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
