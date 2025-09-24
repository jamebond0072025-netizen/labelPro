'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Download, Menu, Share2, FileDown, Type, Pin, PinOff } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function Header() {
  const pathname = usePathname();
  const isEditor = pathname.includes('/editor');

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
            <Type className="h-6 w-6 text-primary" />
            <span className="font-semibold font-headline">Label Designer</span>
        </Link>
      </div>

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
