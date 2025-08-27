
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ActionCardProps {
    title: string;
    description: string;
    buttonText: string;
    buttonIcon?: React.ReactNode;
    href: string;
}

export function ActionCard({ title, description, buttonText, buttonIcon, href }: ActionCardProps) {
    return (
        <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild className="bg-accent hover:bg-accent/90">
                    <Link href={href}>
                        {buttonIcon && <div className="mr-2">{buttonIcon}</div>}
                        {buttonText}
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
