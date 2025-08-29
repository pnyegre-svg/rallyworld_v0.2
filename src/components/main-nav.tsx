'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Building,
  Car,
  Flag,
  LayoutDashboard,
  Newspaper,
  Shield,
  ShoppingBag,
  Store,
  Users,
  PlusSquare,
  Calendar,
  Megaphone,
  Upload,
  Route,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useUserStore } from '@/hooks/use-user';
import { UserNav } from './user-nav';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function MainNav() {
  const pathname = usePathname();
  const { user } = useUserStore();
  
  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['fan', 'competitor', 'timekeeper', 'organizer', 'stage_commander', 'scrutineer', 'event_secretary', 'communications_officer', 'competitor_relations_officer'] },
    { href: '/myevents', label: 'My Events', icon: Calendar, roles: ['fan', 'competitor', 'timekeeper', 'organizer', 'stage_commander', 'scrutineer', 'event_secretary', 'communications_officer', 'competitor_relations_officer'] },
    { href: '/stages', label: 'Manage Stages', icon: Route, roles: ['organizer'] },
    { href: '/entries', label: 'Manage Entries', icon: Users, roles: ['organizer'] },
    { href: '/announcements', label: 'Announcements', icon: Megaphone, roles: ['organizer'] },
    { href: '/uploads', label: 'Uploads', icon: Upload, roles: ['organizer'] },
    { href: '/feed', label: 'Feed', icon: Users, roles: ['fan', 'competitor', 'timekeeper', 'organizer', 'stage_commander', 'scrutineer', 'event_secretary', 'communications_officer', 'competitor_relations_officer'] },
    { href: '/marketplace', label: 'Marketplace', icon: Store, roles: ['fan', 'competitor', 'timekeeper', 'organizer', 'stage_commander', 'scrutineer', 'event_secretary', 'communications_officer', 'competitor_relations_officer'] },
    { href: '/shop', label: 'MyShop', icon: ShoppingBag, roles: ['fan', 'competitor', 'timekeeper', 'organizer', 'stage_commander', 'scrutineer', 'event_secretary', 'communications_officer', 'competitor_relations_officer'] },
    { href: '/news', label: 'News', icon: Newspaper, roles: ['fan', 'competitor', 'timekeeper', 'organizer', 'stage_commander', 'scrutineer', 'event_secretary', 'communications_officer', 'competitor_relations_officer'] },
    { href: '/competitors', label: 'Competitors', icon: Users, roles: ['fan', 'competitor', 'timekeeper', 'organizer', 'stage_commander', 'scrutineer', 'event_secretary', 'communications_officer', 'competitor_relations_officer'] },
    { href: '/leaderboard', label: 'Leaderboard', icon: BarChart3, roles: ['fan', 'competitor', 'timekeeper', 'organizer', 'stage_commander', 'scrutineer', 'event_secretary', 'communications_officer', 'competitor_relations_officer'] },
    { href: '/organizer', label: 'Club Profile', icon: Building, roles: ['organizer'] },
    { href: '/admin', label: 'Admin', icon: Shield, roles: ['organizer'] },
  ];

  const isAdmin = user?.email === 'admin@rally.world';
  const logoSrc = '/RW_txt5.svg';
  const logoWidth = 120;
  const logoHeight = 35;

  return (
    <Sidebar>
      <SidebarHeader className="p-4 justify-center flex">
        <Link href="/" className="flex items-center gap-2">
            <Image src={logoSrc} alt="Rally World Logo" width={logoWidth} height={logoHeight} className="w-auto h-auto transition-all hover:scale-105 active:scale-100"/>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map(
            (item) =>
            {
              if (item.href === '/admin' && !isAdmin) {
                return null;
              }
              // A user has access to a menu item if their CURRENT role is in the item's roles list
              if (!item.roles.includes(user.currentRole)) {
                return null;
              }
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            }
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto">
        {/* The UserNav is now in the PageHeader for better visibility */}
      </SidebarFooter>
    </Sidebar>
  );
}
