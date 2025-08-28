

'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { useUserStore } from '@/hooks/use-user';
import Link from 'next/link';
import { auth } from '@/lib/firebase.client';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Check, UserSquare, User as UserIcon, Building } from 'lucide-react';
import { UserRole } from '@/lib/data';

export function UserNav() {
  const { user, switchRole } = useUserStore();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    // The auth listener in the layout will handle the redirect.
  };
  
  if (!user) return null;

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
         <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
         {user.roles.includes('organizer') && (
            <DropdownMenuItem asChild>
                <Link href="/organizer">
                    <Building className="mr-2 h-4 w-4" />
                    <span>Club Profile</span>
                </Link>
            </DropdownMenuItem>
        )}
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <UserSquare className="mr-2 h-4 w-4" />
                <span>Switch Role</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup value={user.currentRole} onValueChange={(role) => switchRole(role as UserRole)}>
                        {user.roles && user.roles.map((role) => (
                            <DropdownMenuRadioItem key={role} value={role} className="capitalize">
                                {role.replace(/_/g, " ")}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
