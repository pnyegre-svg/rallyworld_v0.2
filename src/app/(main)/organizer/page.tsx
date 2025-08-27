

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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, ChevronsUpDown, Facebook, Instagram, PenSquare, Youtube, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { clubs, Club, Organizer } from '@/lib/data';
import { cn } from "@/lib/utils"
import { useUserStore } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { uploadFile } from '@/lib/storage';

const formSchema = z.object({
  clubId: z.string().optional(),
  name: z.string().min(2, { message: 'Club name must be at least 2 characters.' }),
  cis: z.string().min(1, { message: 'CIS is required.' }),
  cif: z.string().min(1, { message: 'CIF is required.' }),
  address: z.string().min(5, { message: 'Address is required.' }),
  phone: z.string().optional(),
  email: z.string().email({ message: 'Invalid email address.' }),
  website: z.string().url().optional().or(z.literal('')),
  facebook: z.string().url().optional().or(z.literal('')),
  instagram: z.string().url().optional().or(z.literal('')),
  youtube: z.string().url().optional().or(z.literal('')),
  tiktok: z.string().url().optional().or(z.literal('')),
  x: z.string().url().optional().or(z.literal('')),
  profilePicture: z.any().optional(),
});

export default function OrganizerProfilePage() {
    const { toast } = useToast();
    const router = useRouter();
    const { user, updateOrganizerProfile } = useUserStore();
    const [isEditing, setIsEditing] = React.useState(true); // Default to editing for setup
    const [selectedClubId, setSelectedClubId] = React.useState<string>('');
    const [isManualEntry, setIsManualEntry] = React.useState(false);
    const [popoverOpen, setPopoverOpen] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: user?.organizerProfile || {
            name: '',
            cis: '',
            cif: '',
            address: '',
            phone: '',
            email: user?.email || '',
            website: '',
            facebook: '',
            instagram: '',
            youtube: '',
            tiktok: '',
            x: '',
        },
    });
    
    React.useEffect(() => {
        if(user?.organizerProfile) {
            form.reset(user.organizerProfile);
            const existingClub = clubs.find(c => c.name === user.organizerProfile?.name);
            if (existingClub) {
                setSelectedClubId(existingClub.id);
                setIsManualEntry(false);
            } else {
                 setSelectedClubId('new');
                 setIsManualEntry(true);
            }
            setIsEditing(false);
        } else {
            setIsEditing(true);
        }
    }, [user, form]);


    const handleClubChange = (clubId: string) => {
        form.setValue("clubId", clubId)
        setSelectedClubId(clubId);
        setPopoverOpen(false)

        if (clubId === 'new') {
            setIsManualEntry(true);
            form.reset({
                ...form.getValues(),
                clubId: 'new',
                name: '',
                cis: '',
                cif: '',
                address: '',
                email: user?.email || '', // Keep email pre-filled
            });
        } else {
            setIsManualEntry(false);
            const club = clubs.find(c => c.id === clubId);
            if (club) {
                form.setValue('name', club.name);
                form.setValue('cis', club.cis);
                form.setValue('cif', club.cif);
                form.setValue('address', club.address);
            }
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const organizerId = user?.organizerProfile?.id || values.clubId || `org_${Date.now()}`;
            
            let profilePictureUrl = values.profilePicture;
            if (values.profilePicture instanceof File) {
                const fileExtension = values.profilePicture.name.split('.').pop();
                const path = `public/organizers/${organizerId}/profile.${fileExtension}`;
                profilePictureUrl = await uploadFile(values.profilePicture, path);
            }

            const organizerData: Organizer = {
                id: organizerId,
                name: values.name,
                cis: values.cis,
                cif: values.cif,
                address: values.address,
                phone: values.phone,
                email: values.email,
                website: values.website,
                socials: {
                    facebook: values.facebook,
                    instagram: values.instagram,
                    youtube: values.youtube,
                    tiktok: values.tiktok,
                    x: values.x,
                },
                profilePicture: profilePictureUrl,
            };

            await updateOrganizerProfile(organizerData);
            
            toast({
                title: "Profile Saved",
                description: "Your club profile has been successfully updated.",
            });
            setIsEditing(false);
            router.push('/dashboard');

        } catch (error) {
            console.error("Error saving profile:", error);
            toast({
                title: "Failed to save profile",
                description: "An error occurred while saving. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const copyToClipboard = (text: string, fieldName: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            toast({
                title: 'Copied to clipboard',
                description: `${fieldName} has been copied.`,
            });
        });
    };
    
    const TikTokIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12.52.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.65 4.31 1.7.01.08.01.16.02.23-.02 1.53-.63 3.09-1.75 4.17-1.12 1.1-2.7 1.65-4.31 1.7-.01.08-.01.16-.02.23-.02 1.3-.01 2.6-.02 3.91-.02.08-.04.15-.05.23-.02 1.53-.63 3.09-1.75 4.17-1.12 1.11-2.7 1.65-4.31 1.7C12.52 24 12.52 24 12.52 24c-1.31.02-2.61.01-3.91.02-.08-1.53-.63-3.09-1.75-4.17-1.12-1.11-2.7-1.65-4.31-1.7-.01-.08-.01-.16-.02-.23.02-1.53.63-3.09 1.75-4.17 1.12-1.1 2.7-1.65 4.31-1.7.01-.08.01-.16.02-.23.02-1.3.01-2.6.02-3.91.02-.08.04.15.05-.23.02-1.53.63-3.09 1.75-4.17 1.12-1.11-2.7-1.65-4.31-1.7.01-.08.01-.16.02-.23.01-.08.01-.16.01-.23z"/></svg>
    )

    const XIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    )

    const fieldsDisabled = !isEditing || (!isManualEntry && selectedClubId !== '' && selectedClubId !== 'new');
    const allFieldsDisabled = !isEditing;

    const profilePictureValue = form.watch('profilePicture');
    const displayImage = profilePictureValue instanceof File 
        ? URL.createObjectURL(profilePictureValue) 
        : profilePictureValue;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Club Profile</CardTitle>
                        <CardDescription>
                            {user?.organizerProfile ? "View or edit your club's profile." : "Select your club from the list or add a new one."}
                        </CardDescription>
                    </div>
                    {!isEditing && user?.organizerProfile && (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            <PenSquare className="mr-2 h-4 w-4" /> Edit Profile
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                         <FormField
                            control={form.control}
                            name="clubId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Select Your Club</FormLabel>
                                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            disabled={allFieldsDisabled}
                                            className={cn(
                                                "w-full justify-between",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            >
                                            {field.value && field.value !== 'new'
                                                ? clubs.find(
                                                    (club) => club.id === field.value
                                                )?.name
                                                : field.value === 'new' ? 'My club is not listed' : 'Choose your organization'}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search clubs..." />
                                        <CommandEmpty>No club found.</CommandEmpty>
                                        <CommandList>
                                            <CommandGroup>
                                                {clubs.map((club) => (
                                                <CommandItem
                                                    value={club.name}
                                                    key={club.id}
                                                    onSelect={() => {
                                                        handleClubChange(club.id)
                                                    }}
                                                >
                                                    <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        club.id === field.value
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                    )}
                                                    />
                                                    {club.name}
                                                </CommandItem>
                                                ))}
                                                 <CommandItem
                                                    value="new"
                                                    key="new"
                                                    onSelect={() => handleClubChange('new')}
                                                >
                                                     <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            'new' === field.value ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    My club is not listed
                                                </CommandItem>
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                            />

                        { (selectedClubId) && <>
                        <div className="flex items-center gap-4">
                            <FormField
                                control={form.control}
                                name="profilePicture"
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                    <div className="relative">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={displayImage} alt="Club Profile Picture" />
                                            <AvatarFallback>CLUB</AvatarFallback>
                                        </Avatar>
                                        {isEditing && (
                                            <label htmlFor="profile-picture-upload" className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-1 text-primary-foreground">
                                                <PenSquare className="h-4 w-4" />
                                            </label>
                                        )}
                                        <Input 
                                            id="profile-picture-upload" 
                                            type="file" 
                                            className="sr-only" 
                                            accept="image/*"
                                            disabled={allFieldsDisabled}
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
                                            <Input placeholder="e.g. Rally Sport Club" {...field} disabled={fieldsDisabled} />
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
                                                <div className="flex items-center gap-2">
                                                    <FormControl>
                                                        <Input placeholder="Club's Sport Identity Card" {...field} disabled={fieldsDisabled} />
                                                    </FormControl>
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => copyToClipboard(field.value, 'CIS')}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
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
                                                <div className="flex items-center gap-2">
                                                    <FormControl>
                                                        <Input placeholder="Club's Fiscal ID Code" {...field} disabled={fieldsDisabled}/>
                                                    </FormControl>
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => copyToClipboard(field.value, 'CIF')}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
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
                                        <div className="flex items-start gap-2">
                                            <FormControl>
                                                <Textarea placeholder="Club's full address" {...field} disabled={fieldsDisabled} />
                                            </FormControl>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => copyToClipboard(field.value, 'Address')} className="mt-1">
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
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
                                            <Input type="tel" placeholder="+1234567890" {...field} disabled={allFieldsDisabled} />
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
                                            <Input type="email" placeholder="contact@rallysport.club" {...field} disabled={allFieldsDisabled}/>
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
                                            <Input placeholder="https://rallysport.club" {...field} disabled={allFieldsDisabled}/>
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
                                            <Input placeholder="https://facebook.com/rallysportclub" {...field} disabled={allFieldsDisabled}/>
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
                                            <Input placeholder="https://instagram.com/rallysportclub" {...field} disabled={allFieldsDisabled}/>
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
                                            <Input placeholder="https://youtube.com/c/rallysportclub" {...field} disabled={allFieldsDisabled}/>
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
                                            <Input placeholder="https://tiktok.com/@rallysportclub" {...field} disabled={allFieldsDisabled}/>
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
                                            <Input placeholder="https://x.com/rallysportclub" {...field} disabled={allFieldsDisabled}/>
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex gap-2">
                                <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Save Profile'}
                                </Button>
                                {user?.organizerProfile && (
                                     <Button variant="outline" onClick={() => {
                                        setIsEditing(false);
                                        form.reset(user.organizerProfile);
                                     }}>Cancel</Button>
                                )}
                            </div>
                        )}
                        </>}
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

    