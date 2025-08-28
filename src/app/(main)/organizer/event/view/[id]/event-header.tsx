
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MapPin, Share2, UserPlus, Link as LinkIcon, Copy, PenSquare, Award, Camera, Loader2, Youtube, Video, MoreVertical, Edit } from 'lucide-react';
import { Event, updateEvent } from '@/lib/events';
import { DateDisplay } from './date-display';
import { useToast } from '@/components/ui/toaster';
import { useUserStore } from '@/hooks/use-user';
import Link from 'next/link';
import { getResizedImageUrl } from '@/lib/utils';
import { uploadFile } from '@/lib/storage';
import { db } from '@/lib/firebase.client';

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
        <path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 3.3 4.9 3 7.1 0 .8-.4 1.5-.9 1.9-1 .8-2.7 1.2-4.1 1.1-2.4-.2-4.4-.1-6.6.6-2 .6-3.8 1.4-5.2 2.6-1.5 1.2-2.9 2.7-4.1 4.4" />
        <path d="M18 6c-2.3 2.1-4.1 3.5-5.6 4.3-1.6.8-3.2 1-4.6.8-1.4-.2-2.8-1-3.6-2.2" />
    </svg>
);

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
);


type EventHeaderProps = {
  event: Event;
  organizerName?: string;
  setEvent: React.Dispatch<React.SetStateAction<Event | null>>;
  setActiveTab: (tab: string) => void;
};

export function EventHeader({ event, organizerName, setEvent, setActiveTab }: EventHeaderProps) {
  const { push: toast } = useToast();
  const { user } = useUserStore();
  const [eventUrl, setEventUrl] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const logoFileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setEventUrl(window.location.href);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(eventUrl);
    toast({
      text: 'The event link has been copied to your clipboard.',
    });
  };

  const createShareLink = (platform: 'facebook' | 'twitter' | 'whatsapp') => {
    const encodedUrl = encodeURIComponent(eventUrl);
    const encodedTitle = encodeURIComponent(`Check out this event: ${event.title}`);

    switch (platform) {
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      case 'twitter':
        return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
      case 'whatsapp':
        return `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
    }
  };

  const isOwner = user?.organizerProfile?.id === event.organizerId;

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
        const newCoverImageUrl = await uploadFile(file, 'organizer');
        await updateEvent(db, event.id, { coverImage: newCoverImageUrl });
        
        // Update the parent component's state
        setEvent(prevEvent => prevEvent ? { ...prevEvent, coverImage: newCoverImageUrl } : null);

        toast({
            text: 'Your event cover image has been changed successfully.',
            kind: 'success'
        });
    } catch (error) {
        toast({
            text: 'There was a problem changing your cover image. Please try again.',
            kind: 'error',
        });
        console.error(error);
    } finally {
        setIsUploading(false);
    }
  };
  
   const handleLogoImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
        const newLogoImageUrl = await uploadFile(file, 'organizer');
        await updateEvent(db, event.id, { logoImage: newLogoImageUrl });
        
        setEvent(prevEvent => prevEvent ? { ...prevEvent, logoImage: newLogoImageUrl } : null);

        toast({
            text: 'Your event logo has been changed successfully.',
            kind: 'success'
        });
    } catch (error) {
        toast({
            text: 'There was a problem changing your event logo. Please try again.',
            kind: 'error',
        });
        console.error(error);
    } finally {
        setIsUploadingLogo(false);
    }
  };


  return (
    <div className="relative w-full h-[450px] rounded-2xl overflow-hidden text-primary-foreground">
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleCoverImageChange}
            accept="image/*"
            disabled={isUploading}
        />
        <input 
            type="file" 
            ref={logoFileInputRef} 
            className="hidden" 
            onChange={handleLogoImageChange}
            accept="image/*"
            disabled={isUploadingLogo}
        />
        <Image
            src={getResizedImageUrl(event.coverImage, '1200x630') || "https://images.unsplash.com/photo-1589980763519-ddfa1c640d10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxyYWlseXxlbnwwfHx8fDE3NTYyMzgzNTN8MA&ixlib=rb-4.1.0&q=80&w=1080"}
            alt={event.title}
            data-ai-hint="rally car racing"
            fill
            className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
            <div className="flex flex-row items-end justify-between gap-6">
                <div className="flex flex-col gap-4 items-start flex-1">
                    {event.logoImage && (
                        <div className="relative w-48 h-24 flex-shrink-0 group">
                            <Image 
                                src={getResizedImageUrl(event.logoImage, '512x256')!}
                                alt={`${event.title} logo`}
                                fill
                                className="object-contain drop-shadow-lg"
                            />
                            {isOwner && (
                                <Button 
                                    variant="outline"
                                    size="icon"
                                    className="absolute top-0 right-0 h-7 w-7 rounded-full bg-black/50 border-white/30 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => logoFileInputRef.current?.click()}
                                    disabled={isUploadingLogo}
                                >
                                    {isUploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
                                    <span className="sr-only">Change Logo</span>
                                </Button>
                            )}
                        </div>
                    )}
                    <div className="space-y-1 w-full">
                        <h1 className="text-4xl md:text-6xl font-headline font-bold drop-shadow-md w-full">{event.title}</h1>
                        <div className="flex flex-col items-start gap-1">
                           <a 
                             href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.hqLocation)}`}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                           >
                              <MapPin className="h-5 w-5" />
                              <span>{event.hqLocation}</span>
                           </a>
                           {organizerName && (
                              <p className="text-sm text-muted-foreground pl-7">
                                  hosted by <Link href={`/organizer/${event.organizerId}`} className="font-semibold text-foreground/80 hover:underline">{organizerName}</Link>
                              </p>
                           )}
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0">
                    <DateDisplay event={event} />
                </div>
            </div>
        </div>

        <div className="absolute top-6 right-6 flex items-center gap-2">
             {event.livestreamLink && (
                 <Button variant="outline" className="bg-black/20 border-white/20 hover:bg-black/50" onClick={() => setActiveTab('livestream')}>
                    <Youtube className="mr-2" /> Watch Live
                </Button>
            )}
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-black/20 border-white/20 hover:bg-black/50">
                        <Share2 className="mr-2" /> Share
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <a href={createShareLink('facebook')} target="_blank" rel="noopener noreferrer">
                            <FacebookIcon className="mr-2 h-4 w-4" /> Facebook
                        </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <a href={createShareLink('twitter')} target="_blank" rel="noopener noreferrer">
                            <TwitterIcon className="mr-2 h-4 w-4" /> Twitter / X
                        </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                         <a href={createShareLink('whatsapp')} target="_blank" rel="noopener noreferrer">
                            <WhatsAppIcon className="mr-2 h-4 w-4" /> WhatsApp
                        </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={copyToClipboard}>
                        <Copy className="mr-2 h-4 w-4" /> Copy Link
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {isOwner ? (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                            <Edit className="mr-2"/> Edit
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/organizer/event/edit/${event.id}`}>
                                <PenSquare className="mr-2 h-4 w-4" />
                                <span>Edit Event Details</span>
                            </Link>
                        </DropdownMenuItem>
                         <DropdownMenuItem onSelect={() => fileInputRef.current?.click()} disabled={isUploading}>
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                            <span>{isUploading ? 'Uploading...' : 'Change Cover Photo'}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                 </DropdownMenu>
            ) : (
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <UserPlus className="mr-2"/> Register
                </Button>
            )}
        </div>
    </div>
  );
}
