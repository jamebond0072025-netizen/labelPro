'use client';

import {
  LayoutGrid,
  Sparkles,
  Type,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { href: '/dashboard/editor', icon: LayoutGrid, label: 'Editor' },
  { href: '/dashboard/ai-assistant', icon: Sparkles, label: 'AI Assistant' },
];

export function AppSidebarNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();

  const brand = (
     <Link
        href="/"
        className="group flex items-center gap-2 px-2.5 text-foreground"
      >
        <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center">
            <Type className="h-5 w-5 text-primary-foreground" />
        </div>
        {!isMobile && <span className="font-bold font-headline text-lg">LabelPro</span>}
    </Link>
  );

  const nav = (
    <nav className={cn("flex flex-col gap-1 px-2", isMobile && 'grid gap-6 text-lg font-medium mt-6')}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const linkContent = (
             <span
                className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                isActive && 'bg-muted text-primary',
                isMobile && 'text-lg'
                )}
            >
                <item.icon className="h-5 w-5" />
                {item.label}
            </span>
          );

          if (isMobile) {
            return <Link key={item.href} href={item.href}>{linkContent}</Link>;
          }

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link href={item.href}>{linkContent}</Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
    </nav>
  )

  if (isMobile) {
    return <>
      {brand}
      {nav}
    </>
  }

  return (
    <TooltipProvider>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            {brand}
        </div>
        <div className="flex-1">
            {nav}
        </div>
      </div>
    </TooltipProvider>
  );
}
