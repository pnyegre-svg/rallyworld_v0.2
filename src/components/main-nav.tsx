
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
    { href: '/organizer', label: 'Organizer', icon: Building, roles: ['organizer'] },
    { href: '/admin', label: 'Admin', icon: Shield, roles: ['organizer'] },
  ];

  const isAdmin = user?.email === 'admin@rally.world';
  const logoSrc = pathname === '/dashboard' ? '/RW_favi.svg' : '/RW_txt2.svg';

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
            <Image src={logoSrc} alt="Rally World Logo" width={pathname === '/dashboard' ? 40 : 150} height={40} className="w-auto h-auto"/>
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
              return user.roles.includes(user.currentRole) && (
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
