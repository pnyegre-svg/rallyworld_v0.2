import { SidebarTrigger } from '@/components/ui/sidebar';

type PageHeaderProps = {
  title: string;
  children?: React.ReactNode;
};

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <h1 className="font-headline text-lg font-semibold md:text-xl">
        {title}
      </h1>
      <div className="ml-auto flex items-center gap-2">
        {children}
      </div>
    </header>
  );
}
