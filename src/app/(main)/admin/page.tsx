
'use client';

import * as React from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserStore } from '@/hooks/use-user';
import { User } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// MOCK: In a real app, this would be fetched from Firestore
const fetchAllUsers = async (): Promise<User[]> => {
    console.log("Fetching all users (mock)");
    return Promise.resolve([]);
}

export default function AdminPage() {
  const { user } = useUserStore();
  const { toast } = useToast();
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadUsers() {
        setLoading(true);
        // This is where you would fetch all users from your database
        // For now, it will be empty as we don't have a full user list yet.
        const fetchedUsers = await fetchAllUsers();
        setUsers(fetchedUsers);
        setLoading(false);
    }
    if (user?.email === 'admin@rally.world') {
        loadUsers();
    }
  }, [user?.email])

  if (!user || user.email !== 'admin@rally.world') {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">You do not have permission to access this page.</p>
      </div>
    );
  }

  const handleRoleChange = (userId: string, role: User['currentRole']) => {
    // This is a mock implementation. In a real app, you'd update the user in a database.
    // setUsers(users.map(u => u.id === userId ? {...u, roles: [role], currentRole: role} : u));
    // const updatedUser = users.find(u => u.id === userId);
    // toast({
    //     title: "User Role Updated",
    //     description: `${updatedUser?.name}'s role has been changed to ${role}.`,
    // });
     toast({
        title: "Role Change (Mock)",
        description: `In a real app, this would update the user in Firestore.`,
    });
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return names[0].substring(0, 2);
  };
  
  if (loading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[150px]">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                       <AvatarImage src={u.avatar} alt={u.name} />
                       <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{u.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Select value={u.currentRole} onValueChange={(value) => handleRoleChange(u.id, value as User['currentRole'])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fan">Fan</SelectItem>
                      <SelectItem value="competitor">Competitor</SelectItem>
                      <SelectItem value="timekeeper">Timekeeper</SelectItem>
                      <SelectItem value="organizer">Organizer</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        No users found. User management requires Firestore rules to allow admins to read all user profiles.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
