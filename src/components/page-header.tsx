
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/data';

type PageHeaderProps = {
  title: string;
  role?: UserRole;
  children?: React.ReactNode;
};

export function PageHeader({ title, role, children }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
      <div className="flex items-center gap-2">
        <h1 className="font-headline text-lg font-semibold md:text-xl">
            {title}
        </h1>
      </div>
      {children}
    </header>
  );
}
