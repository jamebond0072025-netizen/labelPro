
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Save, Image as ImageIcon, FileJson, ChevronDown, Printer, Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Type } from 'lucide-react';
import { useEditor } from '@/contexts/editor-context';
import { usePrint } from '@/contexts/print-context';
import { useToast } from '@/hooks/use-toast';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';


export function Header() {
  const pathname = usePathname();
  const isEditor = pathname.includes('/editor');
  const isPrintPreview = pathname.includes('/print-preview');
  
  const { editorState } = useEditor();
  const { printPageSettings } = usePrint();
  const { toast } = useToast();
  const [isPrinting, setIsPrinting] = useState(false);

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

  const handleDownloadPdf = async () => {
    if (!printPageSettings) {
      toast({ variant: 'destructive', title: 'Error', description: 'Print settings not available.' });
      return;
    }

    setIsPrinting(true);
    const printSheet = document.getElementById('print-sheet');
    if (!printSheet) {
        toast({ variant: 'destructive', title: 'Error', description: 'Print container not found.' });
        setIsPrinting(false);
        return;
    }
    
    try {
        const { pageSize } = printPageSettings;
        const { orientation, unit, format } = pageSize.pdf;
        const pdf = new jsPDF(orientation, unit, format);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const printContainer = document.getElementById('print-container');
        const originalTransform = printContainer ? printContainer.style.transform : '';
        if (printContainer) printContainer.style.transform = '';
        
        const dataUrl = await toPng(printSheet, {
          quality: 1,
          pixelRatio: 2,
        });

        if (printContainer) printContainer.style.transform = originalTransform;

        const tempImage = new Image();
        tempImage.src = dataUrl;
        await new Promise(resolve => tempImage.onload = resolve);
        
        const imgWidth = pdfWidth;
        const imgHeight = (tempImage.height * imgWidth) / tempImage.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save('labels.pdf');

    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not generate PDF.' });
    } finally {
        setIsPrinting(false);
    }
  };


  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 print-hidden">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
            <Type className="h-6 w-6 text-primary" />
            <span className="font-semibold font-headline">Label Designer</span>
        </Link>
      </div>

      <div className="flex-1">
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

      {isPrintPreview && (
        <Button onClick={handleDownloadPdf} disabled={isPrinting}>
          {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
          {isPrinting ? 'Generating...' : 'Download PDF'}
        </Button>
      )}
    </header>
  );
}
