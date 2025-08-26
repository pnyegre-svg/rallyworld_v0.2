
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Car,
  Flag,
  LayoutDashboard,
  Newspaper,
  Shield,
  ShoppingBag,
  Store,
  Users,
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

export function MainNav() {
  const pathname = usePathname();
  const { user } = useUserStore();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['fan', 'competitor', 'timekeeper', 'organizer', 'stage_commander', 'scrutineer', 'event_secretary', 'communications_officer', 'competitor_relations_officer'] },
    { href: '/community', label: 'Community', icon: Users, roles: ['fan', 'competitor', 'timekeeper', 'organizer', 'stage_commander', 'scrutineer', 'event_secretary', 'communications_officer', 'competitor_relations_officer'] },
    { href: '/marketplace', label: 'Marketplace', icon: Store, roles: ['fan', 'competitor', 'timekeeper', 'organizer', 'stage_commander', 'scrutineer', 'event_secretary', 'communications_officer', 'competitor_relations_officer'] },
    { href: '/shop', label: 'Shop', icon: ShoppingBag, roles: ['fan', 'competitor', 'timekeeper', 'organizer', 'stage_commander', 'scrutineer', 'event_secretary', 'communications_officer', 'competitor_relations_officer'] },
    { href: '/news', label: 'News', icon: Newspaper, roles: ['fan', 'competitor', 'timekeeper', 'organizer', 'stage_commander', 'scrutineer', 'event_secretary', 'communications_officer', 'competitor_relations_officer'] },
    { href: '/stages', label: 'Stages', icon: Flag, roles: ['fan', 'competitor', 'timekeeper', 'organizer', 'stage_commander', 'scrutineer', 'event_secretary', 'communications_officer', 'competitor_relations_officer'] },
    { href: '/competitors', label: 'Competitors', icon: Users, roles: ['fan', 'competitor', 'timekeeper', 'organizer', 'stage_commander', 'scrutineer', 'event_secretary', 'communications_officer', 'competitor_relations_officer'] },
    { href: '/leaderboard', label: 'Leaderboard', icon: BarChart3, roles: ['fan', 'competitor', 'timekeeper', 'organizer', 'stage_commander', 'scrutineer', 'event_secretary', 'communications_officer', 'competitor_relations_officer'] },
    { href: '/admin', label: 'Admin', icon: Shield, roles: ['organizer'] },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Car className="text-primary h-8 w-8" />
          <h1 className="font-headline text-2xl font-bold">Rally World</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map(
            (item) =>
              item.roles.includes(user.role) && (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        {/* The UserNav is now in the PageHeader for better visibility */}
      </SidebarFooter>
    </Sidebar>
  );
}
