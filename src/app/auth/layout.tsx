
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { app } from '@/lib/firebase';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider('6LdG2bQrAAAAAC0BUzZWftropwGWCkAcpCqOKhqt'),
        isTokenAutoRefreshEnabled: true,
      });
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2 text-primary">
                <Image src="/RW_txt2.svg" alt="Rally World Logo" width={180} height={50} />
            </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
