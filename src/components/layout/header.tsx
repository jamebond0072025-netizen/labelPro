
'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Save, Image as ImageIcon, FileJson } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Type } from 'lucide-react';

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <ImageIcon className="mr-2" />
                  Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ImageIcon className="mr-2" />
                  Export as JPEG
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileJson className="mr-2" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
         </div>
      )}
    </header>
  );
}
