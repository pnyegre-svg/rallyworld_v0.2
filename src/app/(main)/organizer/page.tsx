
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Facebook, Instagram, PenSquare, Youtube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Club name must be at least 2 characters.' }),
  cis: z.string().min(1, { message: 'CIS is required.' }),
  cif: z.string().min(1, { message: 'CIF is required.' }),
  address: z.string().min(5, { message: 'Address is required.' }),
  phone: z.string().optional(),
  email: z.string().email({ message: 'Invalid email address.' }),
  website: z.string().url().optional().or(z.literal('')),
  facebook: z.string().url().optional().or(z.literal('')),
  instagram: z.string().url().optional().or(z.literal('')),
  youtube: z.string().url().optional().or(z-literal('')),
  tiktok: z.string().url().optional().or(z.literal('')),
  x: z.string().url().optional().or(z.literal('')),
  profilePicture: z.any().optional(),
});

export default function OrganizerProfilePage() {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = React.useState(true); // Default to editing for setup

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            cis: '',
            cif: '',
            address: '',
            phone: '',
            email: '',
            website: '',
            facebook: '',
            instagram: '',
            youtube: '',
            tiktok: '',
            x: '',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        toast({
            title: "Profile Saved",
            description: "Your club profile has been successfully updated.",
        });
        setIsEditing(false);
    }
    
    // For the TikTok and X icons, we'll use inline SVGs as they are not in lucide-react
    const TikTokIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12.52.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.65 4.31 1.7.01.08.01.16.02.23-.02 1.53-.63 3.09-1.75 4.17-1.12 1.1-2.7 1.65-4.31 1.7-.01.08-.01.16-.02.23-.02 1.3-.01 2.6-.02 3.91-.02.08-.04.15-.05.23-.02 1.53-.63 3.09-1.75 4.17-1.12 1.11-2.7 1.65-4.31 1.7C12.52 24 12.52 24 12.52 24c-1.31.02-2.61.01-3.91.02-.08-1.53-.63-3.09-1.75-4.17-1.12-1.11-2.7-1.65-4.31-1.7-.01-.08-.01-.16-.02-.23.02-1.53.63-3.09 1.75-4.17 1.12-1.1 2.7-1.65 4.31-1.7.01-.08.01-.16.02-.23.02-1.3.01-2.6.02-3.91.02-.08.04-.15.05-.23.02-1.53.63-3.09 1.75-4.17 1.12-1.11 2.7-1.65 4.31-1.7.01-.08.01-.16.02-.23.01-.08.01-.16.01-.23z"/></svg>
    )

    const XIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    )

    return (
        <Card>
            <CardHeader>
                <CardTitle>Club Profile Setup</CardTitle>
                <CardDescription>Fill in your club's details to get started.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="flex items-center gap-4">
                            <FormField
                                control={form.control}
                                name="profilePicture"
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                    <div className="relative">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={field.value ? URL.createObjectURL(field.value) : ''} alt="Club Profile Picture" />
                                            <AvatarFallback>CLUB</AvatarFallback>
                                        </Avatar>
                                        <label htmlFor="profile-picture-upload" className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-1 text-primary-foreground">
                                            <PenSquare className="h-4 w-4" />
                                        </label>
                                        <Input 
                                            id="profile-picture-upload" 
                                            type="file" 
                                            className="sr-only" 
                                            accept="image/*"
                                            onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} 
                                        />
                                    </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <div className="grid gap-2 flex-1">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Club Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Rally Sport Club" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="cis"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Club CIS</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Club's Sport Identity Card" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="cif"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Club CIF</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Club's Fiscal ID Code" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Club's full address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-4">
                               <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Phone Number (Optional)</FormLabel>
                                        <FormControl>
                                            <Input type="tel" placeholder="+1234567890" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="contact@rallysport.club" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-medium mb-4">Social Presence</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                 <FormField
                                    control={form.control}
                                    name="website"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Website (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://rallysport.club" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="facebook"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Facebook className="h-5 w-5"/> Facebook (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://facebook.com/rallysportclub" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="instagram"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Instagram className="h-5 w-5"/> Instagram (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://instagram.com/rallysportclub" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="youtube"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Youtube className="h-5 w-5"/> YouTube (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://youtube.com/c/rallysportclub" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="tiktok"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <TikTokIcon /> TikTok (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://tiktok.com/@rallysportclub" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="x"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <XIcon /> X / Twitter (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://x.com/rallysportclub" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="bg-accent hover:bg-accent/90">Save Profile</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
