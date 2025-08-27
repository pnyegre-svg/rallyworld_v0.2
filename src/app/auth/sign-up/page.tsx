
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
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useUserStore } from '@/hooks/use-user';


const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Google</title>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.48 2.04-4.26 2.04-4.81 0-8.73-3.86-8.73-8.64s3.92-8.64 8.73-8.64c2.73 0 4.51 1.05 5.54 2.04l2.5-2.5C20.49 1.82 17.13 0 12.48 0 5.88 0 .02 5.82 0 12.91s5.86 12.91 12.48 12.91c7.22 0 12.01-4.44 12.01-12.25 0-.82-.07-1.48-.18-2.18H12.48z" />
    </svg>
)

export default function SignUpPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { signInUser } = useUserStore();
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // This will now create the user in Firestore via the hook
            await signInUser(email, name);
            router.push('/auth/choose-role');
        } catch(error: any) {
            toast({
                title: 'Sign up failed',
                description: error.message,
                variant: 'destructive'
            });
            setIsLoading(false);
        }
    }
    
    const handleGoogleSignUp = async () => {
        setIsLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            // signInUser will handle the user creation logic
            await signInUser(user.email!, user.displayName || 'New User');
            router.push('/auth/choose-role');
        } catch (error: any) {
             toast({
                title: 'Sign up with Google failed',
                description: error.message,
                variant: 'destructive'
            });
            setIsLoading(false);
        }
    };


  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>Enter your details below to create your account</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
         <Button variant="outline" onClick={handleGoogleSignUp} disabled={isLoading}>
            <GoogleIcon className="mr-2 h-4 w-4" />
            Sign up with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
      <form onSubmit={handleSignUp} className="grid gap-4">
        <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading}/>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading}/>
        </div>
         <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Sign Up with Email'}
        </Button>
      </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="text-center text-sm">
          Already have an account?{' '}
          <Link href="/auth/sign-in" className="underline">
            Sign In
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
