

'use client';

import * as React from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Facebook, Instagram, Youtube, Globe, Mail, Phone, MapPin, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { User, Organizer } from '@/lib/data';
import { useParams, useRouter } from 'next/navigation';
import { getUser } from '@/lib/users';
import { Skeleton } from '@/components/ui/skeleton';

const TikTokIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12.52.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.65 4.31 1.7.01.08.01.16.02.23-.02 1.53-.63 3.09-1.75 4.17-1.12 1.1-2.7 1.65-4.31 1.7-.01.08-.01.16-.02.23-.02 1.3-.01 2.6-.02 3.91-.02.08-.04.15-.05.23-.02 1.53-.63 3.09-1.75 4.17-1.12 1.11-2.7-1.65-4.31 1.7C12.52 24 12.52 24 12.52 24c-1.31.02-2.61.01-3.91.02-.08-1.53-.63-3.09-1.75-4.17-1.12-1.11-2.7-1.65-4.31-1.7-.01-.08-.01-.16-.02-.23.02-1.53.63-3.09 1.75-4.17 1.12-1.1 2.7-1.65 4.31-1.7.01-.08.01-.16.02-.23.02-1.3.01-2.6.02-3.91.02-.08.04.15.05-.23.02-1.53-.63-3.09 1.75-4.17 1.12-1.11-2.7-1.65-4.31-1.7.01-.08.01-.16.02-.23.01-.08.01-.16.01-.23z"/></svg>
)

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
)

const InfoItem = ({ icon, label, value, isLink }: { icon: React.ReactNode, label: string, value: string, isLink?: boolean }) => {
    if (!value) return null;
    const { toast } = useToast();

    const copyToClipboard = () => {
        navigator.clipboard.writeText(value).then(() => {
            toast({
                title: 'Copied to clipboard',
                description: `${label} has been copied.`,
            });
        });
    };

    return (
        <div className="flex items-start gap-3">
            <div className="text-muted-foreground mt-1">{icon}</div>
            <div className="flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                {isLink ? (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">{value.replace(/^(https?:\/\/)?(www\.)?/, '')}</a>
                ) : (
                    <p className="text-sm font-medium">{value}</p>
                )}
            </div>
             <Button type="button" variant="ghost" size="icon" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
            </Button>
        </div>
    )
}

const SocialLink = ({ href, icon, name }: { href?: string, icon: React.ReactNode, name: string }) => {
    if (!href) return null;
    return (
        <Button asChild variant="outline" size="icon">
            <a href={href} target="_blank" rel="noopener noreferrer" aria-label={name} title={name}>
                {icon}
            </a>
        </Button>
    )
}

export default function PublicClubProfilePage() {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const organizerId = params.id as string;

    const [profile, setProfile] = React.useState<Organizer | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (organizerId) {
            const fetchOrganizer = async () => {
                setLoading(true);
                const user = await getUser(organizerId);
                if (user && user.organizerProfile) {
                    setProfile(user.organizerProfile);
                } else {
                    toast({
                        title: "Organizer not found",
                        description: "Could not find a profile for this organizer.",
                        variant: "destructive",
                    });
                    router.push('/dashboard');
                }
                setLoading(false);
            }
            fetchOrganizer();
        }
    }, [organizerId, router, toast]);

    if (loading) {
        return (
            <Card>
                <CardHeader className="text-center">
                    <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-8 w-1/2 mx-auto" />
                    <Skeleton className="h-4 w-1/4 mx-auto" />
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                     </div>
                     <div className="space-y-6">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                     </div>
                </CardContent>
            </Card>
        )
    }

    if (!profile) {
        return null;
    }
    
    return (
        <Card>
            <CardHeader className="text-center items-center">
                <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={profile.profilePicture || undefined} alt="Club Profile Picture" />
                    <AvatarFallback>{profile.name?.substring(0, 2) || 'C'}</AvatarFallback>
                </Avatar>
                <CardTitle>{profile.name}</CardTitle>
                <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>CIS: {profile.cis}</span>
                    <span>CIF: {profile.cif}</span>
                </div>
            </CardHeader>
            <CardContent className="max-w-4xl mx-auto w-full grid md:grid-cols-2 gap-x-12 gap-y-6 pt-6">
                <div className="space-y-4">
                     <InfoItem icon={<MapPin size={20} />} label="Address" value={profile.address} />
                     <InfoItem icon={<Mail size={20} />} label="Email" value={profile.email} isLink={`mailto:${profile.email}`} />
                     {profile.phone && <InfoItem icon={<Phone size={20} />} label="Phone" value={profile.phone} isLink={`tel:${profile.phone}`} />}
                </div>

                 <div className="space-y-4">
                    {profile.website && <InfoItem icon={<Globe size={20} />} label="Website" value={profile.website} isLink />}
                    <div className="flex items-center gap-3">
                         <div className="text-muted-foreground"><Facebook size={20} /></div>
                        <div className="flex-1">
                             <p className="text-xs text-muted-foreground">Socials</p>
                            <div className="flex gap-2 pt-1">
                                <SocialLink href={profile.socials?.facebook} icon={<Facebook />} name="Facebook" />
                                <SocialLink href={profile.socials?.instagram} icon={<Instagram />} name="Instagram" />
                                <SocialLink href={profile.socials?.youtube} icon={<Youtube />} name="YouTube" />
                                <SocialLink href={profile.socials?.tiktok} icon={<TikTokIcon />} name="TikTok" />
                                <SocialLink href={profile.socials?.x} icon={<XIcon />} name="X" />
                            </div>
                        </div>
                    </div>
                 </div>
            </CardContent>
        </Card>
    );
}

