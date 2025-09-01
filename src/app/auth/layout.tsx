
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="absolute top-4 right-4">
            <ThemeToggle />
        </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2 text-primary">
                <Image src="/RW_txt5.svg" alt="Rally World Logo" width={180} height={50} />
            </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
