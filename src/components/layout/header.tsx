

'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Save, Image as ImageIcon, FileJson, ChevronDown, ChevronLeft, Upload, Printer, Loader2 } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEditor } from '@/contexts/editor-context';
import { toPng, toJpeg } from 'html-to-image';
import { SaveTemplateDialog } from '../save-template-dialog';
import type { Template } from '@/lib/types';
import { usePrint } from '@/contexts/print-context';
import { useMediaQuery } from '@/hooks/use-media-query';


export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const isMobile = useMediaQuery("(max-width: 640px)");

  const isEditor = pathname.includes('/editor');
  const isPrintPreview = pathname.includes('/print-preview');
  
  const { editorState, loadTemplate, existingTemplate } = useEditor();
  const { handleDownloadPdf, isPrinting } = usePrint();

  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && loadTemplate?.current) {
        loadTemplate.current(file);
        e.target.value = '';
    }
  };

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
          transform: 'scale(1)',
          width: `${canvasSettings.width}px`,
          height: `${canvasSettings.height}px`,
          backgroundColor: canvasSettings.backgroundColor,
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
  
  const buttonSize = isMobile ? 'icon' : 'sm';
  const showButtonText = !isMobile;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 print-hidden">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Button variant="outline" size={buttonSize} className="h-9 sm:h-10">
                <ChevronLeft className="h-6 w-6 text-primary" />      
                {showButtonText && <span className="font-semibold font-headline">Back</span>}
            </Button>
          </Link>
        </div>

        <div className="flex-1">
        </div>
        
        {isEditor && (
          <div className="flex items-center gap-2">
              <Button variant="outline" size={buttonSize} className="h-9 sm:h-10" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
                {showButtonText && <span className="ml-2">Load</span>}
              </Button>
               <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".json"
                    onChange={handleFileChange}
                />
              <Button variant="outline" size={buttonSize} className="h-9 sm:h-10" onClick={() => setIsSaveDialogOpen(true)}>
                <Save className="h-4 w-4" />
                {showButtonText && <span className="ml-2">{templateId ? 'Update' : 'Save'}</span>}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size={buttonSize} className="h-9 sm:h-10">
                    <span className="sr-only">Export</span>
                    {showButtonText ? <span>Export</span> : <ImageIcon className="h-4 w-4" />}
                    <ChevronDown className="h-4 w-4 ml-2" />
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

        {isPrintPreview && (
          <Button onClick={handleDownloadPdf} disabled={isPrinting} size={buttonSize} className="h-9 sm:h-10">
              {isPrinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
              {showButtonText && <span className="ml-2">{isPrinting ? 'Generating...' : 'Download PDF'}</span>}
          </Button>
        )}
      </header>
      {isSaveDialogOpen && editorState && (
        <SaveTemplateDialog
          isOpen={isSaveDialogOpen}
          onOpenChange={setIsSaveDialogOpen}
          editorState={editorState}
          existingTemplate={existingTemplate}
        />
      )}
    </>
  );
}
