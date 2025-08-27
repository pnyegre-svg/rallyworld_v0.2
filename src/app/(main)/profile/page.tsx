

'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { PenSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserStore } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { uploadFile } from '@/lib/storage';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  profilePicture: z.any().optional(),
});

export default function ProfilePage() {
    const { toast } = useToast();
    const router = useRouter();
    const { user, updateUserProfile } = useUserStore();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user?.name || '',
            profilePicture: user?.profilePicture || user?.avatar || '',
        },
    });

    React.useEffect(() => {
        if (user) {
            form.reset({
                name: user.name,
                profilePicture: user.profilePicture || user.avatar,
            });
        }
    }, [user, form]);


    async function onSubmit(values: z.infer<typeof formSchema>) {
        const { user } = useUserStore.getState();
        if (!user) {
            toast({
                title: "Authentication Error",
                description: "You must be signed in to save your profile.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            let profilePictureUrl = user?.profilePicture || user?.avatar || '';
            const profilePictureFile = values.profilePicture;

            if (profilePictureFile instanceof File) {
                 profilePictureUrl = await uploadFile(profilePictureFile, 'user');
            }
            
            await updateUserProfile({ 
                name: values.name,
                profilePicture: profilePictureUrl,
            });
            
            toast({
                title: "Profile Saved",
                description: "Your profile has been successfully updated.",
            });

        } catch (error) {
            console.error("Error saving profile:", error);
            const errorMessage = (error as Error).message || "An error occurred while saving. Please try again.";
            toast({
                title: "Failed to save profile",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const profilePictureValue = form.watch('profilePicture');
    const displayImage = profilePictureValue instanceof File 
        ? URL.createObjectURL(profilePictureValue) 
        : (typeof profilePictureValue === 'string' ? profilePictureValue : null);

    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`;
        }
        return name.substring(0, 2);
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>
                    Update your personal information and profile picture.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="flex items-center gap-6">
                            <FormField
                                control={form.control}
                                name="profilePicture"
                                render={({ field: { onChange, value, ...rest } }) => (
                                <FormItem>
                                    <FormControl>
                                    <div className="relative">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={displayImage || undefined} alt="User Profile Picture" />
                                            <AvatarFallback>{getInitials(user?.name || 'U')}</AvatarFallback>
                                        </Avatar>
                                        <label htmlFor="profile-picture-upload" className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-1.5 text-primary-foreground transition-transform hover:scale-110">
                                            <PenSquare className="h-4 w-4" />
                                        </label>
                                        <Input 
                                            id="profile-picture-upload" 
                                            type="file" 
                                            className="sr-only" 
                                            accept="image/*"
                                            onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
                                            {...rest}
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
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" value={user?.email || ''} disabled />
                                    </FormControl>
                                    <FormDescription>You cannot change your email address.</FormDescription>
                                </FormItem>
                            </div>
                        </div>

                        <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
