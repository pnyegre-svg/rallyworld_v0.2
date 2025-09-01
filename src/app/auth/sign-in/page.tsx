
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase.client';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/components/ui/toaster';
import { useUserStore } from '@/hooks/use-user';
import { Eye, EyeOff } from 'lucide-react';

export default function SignInPage() {
    const router = useRouter();
    const { push: toast } = useToast();
    const { signInUser } = useUserStore();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // The onAuthStateChanged listener in useUserStore will handle the rest
            router.push('/dashboard');
        } catch (error: any) {
            toast({
                text: error.message,
                kind: 'error'
            });
             setIsLoading(false);
        }
    }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>Enter your email below to sign in to your account</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
          <form onSubmit={handleSignIn} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                </Button>
              </div>
            </div>
             <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
             </Button>
          </form>
      </CardContent>
       <CardFooter className="flex flex-col gap-4">
          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/auth/sign-up" className="underline">
              Sign Up
            </Link>
          </div>
        </CardFooter>
    </Card>
  );
}
