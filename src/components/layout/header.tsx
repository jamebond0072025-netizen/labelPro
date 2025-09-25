
'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Save, Image as ImageIcon, FileJson, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Type } from 'lucide-react';
import { useEditor } from '@/contexts/editor-context';
import { toPng, toJpeg } from 'html-to-image';

export function Header() {
  const pathname = usePathname();
  const isEditor = pathname.includes('/editor');
  const { editorState } = useEditor();

  const handleExport = (format: 'png' | 'jpeg' | 'json') => {
    if (!editorState) return;

    const { canvasRef, objects, canvasSettings } = editorState;

    if (format === 'json') {
      const data = {
        settings: canvasSettings,
        objects: objects,
      };
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = "label-design.json";
      link.click();
      return;
    }

    if (canvasRef?.current) {
      const node = canvasRef.current;
      const exporter = format === 'png' ? toPng : toJpeg;

      exporter(node, {
        quality: 1,
        width: canvasSettings.width,
        height: canvasSettings.height,
        style: {
          // Temporarily override the transform to ensure we get a 1:1 pixel-perfect image
          transform: 'scale(1)',
          // Ensure the node itself is sized correctly for capture
          width: `${canvasSettings.width}px`,
          height: `${canvasSettings.height}px`,
        }
      })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `label-design.${format}`;
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error('oops, something went wrong!', err);
        });
    }
  };


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
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  Export
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('png')}>
                  <ImageIcon className="mr-2" />
                  Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('jpeg')}>
                  <ImageIcon className="mr-2" />
                  Export as JPEG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
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
