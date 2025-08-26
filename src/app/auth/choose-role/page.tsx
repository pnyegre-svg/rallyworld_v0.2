
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useUserStore } from '@/hooks/use-user';
import type { UserRole } from '@/lib/data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Building, Car, Flag, HardHat, Info, Mic, Shield, User, Users, Wrench } from 'lucide-react';

const rolesConfig = [
  { 
    id: 'organizer', 
    name: 'Organizer / Club', 
    description: 'Host competitors, hold events, and assign duties to timekeepers.',
    icon: Building 
  },
  { 
    id: 'competitor', 
    name: 'Competitor', 
    description: 'Pilot or Co-pilot. Create your profile, add vehicles, and register for events.',
    icon: Car
  },
  {
    category: 'Route & Stage Operators',
    roles: [
      {
        id: 'stage_commander',
        name: 'Stage Commander',
        description: 'Oversee a specific stage, ensuring it is set up correctly and is safe.',
        icon: Flag
      },
      {
        id: 'timekeeper',
        name: 'Timekeeper',
        description: 'Record times at various control points of special stages.',
        icon: HardHat
      },
    ]
  },
  {
    category: 'Technical & Administrative',
    roles: [
       {
        id: 'scrutineer',
        name: 'Scrutineer',
        description: 'Inspect vehicles to ensure they meet safety and technical regulations.',
        icon: Wrench
      },
      {
        id: 'event_secretary',
        name: 'Secretary of the Event',
        description: 'Manage administrative tasks and compile results.',
        icon: Shield
      },
      {
        id: 'communications_officer',
        name: 'Communication Officer',
        description: 'Manage communication channels and disseminate information.',
        icon: Mic
      },
      {
        id: 'competitor_relations_officer',
        name: 'Competitor Relations Officer (CRO)',
        description: 'Act as a liaison between the Clerk of the Course and competitors.',
        icon: Info
      },
    ]
  },
  {
    id: 'fan',
    name: 'Fan',
    description: 'Follow the action, view results, and support your favorite teams.',
    icon: Users
  }
];

export default function ChooseRolePage() {
  const router = useRouter();
  const { setRole } = useUserStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>('fan');

  const handleContinue = () => {
    setRole(selectedRole);
    router.push('/dashboard');
  };
  
  const renderRole = (role: any) => {
    const Icon = role.icon;
    return (
        <Label
            key={role.id}
            htmlFor={role.id}
            className="flex cursor-pointer items-center gap-4 rounded-md border p-4 transition-colors hover:bg-accent/50 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-accent/80"
        >
            <RadioGroupItem value={role.id} id={role.id} className="sr-only" />
            <Icon className="h-6 w-6" />
            <div className="flex-1">
                <p className="font-medium">{role.name}</p>
                <p className="text-sm text-muted-foreground">{role.description}</p>
            </div>
        </Label>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Your Role</CardTitle>
        <CardDescription>Select your primary role in the world of rally.</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)} className="grid gap-4">
          {rolesConfig.map((item) => {
            if ('category' in item) {
              return (
                 <Accordion type="single" collapsible key={item.category}>
                    <AccordionItem value={item.category} className="border-b-0">
                      <AccordionTrigger className="hover:no-underline border rounded-md px-4 py-2 text-base font-medium [&[data-state=open]]:bg-accent/80 [&[data-state=open]]:border-primary">
                        {item.category}
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 grid gap-4">
                        {item.roles.map(renderRole)}
                      </AccordionContent>
                    </AccordionItem>
                 </Accordion>
              )
            }
            return renderRole(item);
          })}
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-accent hover:bg-accent/90" onClick={handleContinue}>Continue</Button>
      </CardFooter>
    </Card>
  );
}
