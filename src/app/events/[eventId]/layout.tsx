
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import Toaster from '@/components/ui/toaster';

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
    >
      <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <Link href="/" className="flex items-center justify-center" prefetch={false}>
              <Image src="/RW_txt5.svg" alt="Rally World Logo" width={120} height={35} />
              <span className="sr-only">Rally World</span>
            </Link>
            <nav className="ml-auto flex items-center gap-4 sm:gap-6">
                <Button asChild variant="ghost">
                    <Link href="/auth/sign-in">Sign In</Link>
                </Button>
                <Button asChild className="bg-accent hover:bg-accent/90">
                    <Link href="/auth/sign-up">Get Started</Link>
                </Button>
                <ThemeToggle />
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
            <p className="text-xs text-muted-foreground">&copy; 2024 Rally World. All rights reserved.</p>
            <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
                Terms of Service
            </Link>
            <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
                Privacy
            </Link>
            </nav>
        </footer>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
