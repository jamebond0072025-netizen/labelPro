'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Download, Menu, Share2, FileDown } from 'lucide-react';
import { AppSidebarNav } from './sidebar-nav';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const isEditor = pathname.includes('/editor');

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <AppSidebarNav isMobile={true} />
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex-1">
        {/* Placeholder for Breadcrumbs or Title */}
      </div>
      {isEditor && (
         <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
            </Button>
            <Button size="sm">
                <FileDown className="mr-2 h-4 w-4" />
                Export
            </Button>
         </div>
      )}
    </header>
  );
}
