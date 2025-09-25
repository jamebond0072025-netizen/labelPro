
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrint } from '@/contexts/print-context';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, PanelLeft, PanelRight, Loader2 } from 'lucide-react';
import { LabelPreview } from '@/components/label-preview';
import type { CanvasObject, CanvasSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';
import { PrintDataPanel } from '@/components/print/print-data-panel';
import { PrintLayoutSettings } from '@/components/print/print-layout-settings';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


const pageSizes = [
  { name: 'A4 (210mm x 297mm)', width: '210mm', height: '297mm', pdf: { orientation: 'p', unit: 'mm', format: 'a4' } },
  { name: 'Letter (8.5" x 11")', width: '8.5in', height: '11in', pdf: { orientation: 'p', unit: 'in', format: 'letter' } },
  { name: 'Legal (8.5" x 14")', width: '8.5in', height: '14in', pdf: { orientation: 'p', unit: 'in', format: 'legal' } },
];

export default function PrintPreviewPage() {
  const router = useRouter();
  const { template, data } = usePrint();
  const { toast } = useToast();
  const [templateJson, setTemplateJson] = useState<{ settings: CanvasSettings; objects: CanvasObject[] } | null>(null);
  const [pageSize, setPageSize] = useState(pageSizes[0]);
  const [layout, setLayout] = useState({
    scale: 1,
    rowGap: 0,
    columnGap: 0,
  });
  const [isPrinting, setIsPrinting] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    if (!template) {
      toast({
        variant: 'destructive',
        title: 'No template selected',
        description: 'Redirecting to home page.',
      });
      router.replace('/');
    } else if (template.templateUrl) {
      fetch(template.templateUrl)
        .then(res => res.json())
        .then(setTemplateJson)
        .catch(() => {
            toast({
                variant: 'destructive',
                title: 'Failed to load template',
                description: 'The template file could not be loaded.',
            });
            router.replace('/');
        });
    }
  }, [template, router, toast]);

  const handleDownloadPdf = async () => {
    setIsPrinting(true);
    const printContainer = document.getElementById('print-container');
    if (!printContainer) {
        setIsPrinting(false);
        return;
    }
    
    // Temporarily hide sidebars and buttons
    const originalDisplay: { el: HTMLElement, value: string }[] = [];
    document.querySelectorAll('.print-hidden').forEach(el => {
        const htmlEl = el as HTMLElement;
        originalDisplay.push({ el: htmlEl, value: htmlEl.style.display });
        htmlEl.style.display = 'none';
    });

    const canvas = await html2canvas(printContainer, {
        scale: 2, // Higher scale for better quality
    });

    // Restore hidden elements
    originalDisplay.forEach(({ el, value }) => {
        el.style.display = value;
    });

    const imgData = canvas.toDataURL('image/png');
    
    const { orientation, unit, format } = pageSize.pdf;
    const pdf = new jsPDF(orientation, unit, format);
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const canvasAspectRatio = canvasWidth / canvasHeight;
    const pdfAspectRatio = pdfWidth / pdfHeight;

    let imgWidth, imgHeight;

    if (canvasAspectRatio > pdfAspectRatio) {
        imgWidth = pdfWidth;
        imgHeight = pdfWidth / canvasAspectRatio;
    } else {
        imgHeight = pdfHeight;
        imgWidth = pdfHeight * canvasAspectRatio;
    }

    const x = (pdfWidth - imgWidth) / 2;
    const y = (pdfHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    pdf.save('labels.pdf');
    setIsPrinting(false);
  };


  if (!template || !templateJson) {
    return (
        <div className="flex-1 flex items-center justify-center">
            <p>Loading template...</p>
        </div>
    );
  }
  
  if (!data || data.length === 0) {
     return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <p className="text-lg text-muted-foreground mb-4">No data was provided to generate labels.</p>
            <Button onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
        </div>
    );
  }

  const handleSizeChange = (value: string) => {
    const newSize = pageSizes.find(s => s.name === value);
    if (newSize) {
        setPageSize(newSize);
    }
  }
  
  const handleLayoutChange = (newLayout: Partial<Omit<typeof layout, 'columns'>>) => {
    setLayout(prev => ({...prev, ...newLayout}));
  }
  
  const scaledLabelWidth = templateJson.settings.width * layout.scale;

  const mainContent = (
    <div className="flex-1 flex flex-col items-center p-4 sm:p-8 bg-muted overflow-auto">
        <div className="w-full max-w-5xl flex justify-between items-center mb-4 print-hidden">
            <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <div className='flex items-center gap-4'>
                <div className="flex items-center gap-2">
                    <Label htmlFor="page-size">Page Size</Label>
                    <Select value={pageSize.name} onValueChange={handleSizeChange}>
                        <SelectTrigger id="page-size" className="w-[220px]">
                            <SelectValue placeholder="Select a size" />
                        </SelectTrigger>
                        <SelectContent>
                            {pageSizes.map(size => (
                                <SelectItem key={size.name} value={size.name}>
                                    {size.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleDownloadPdf} disabled={isPrinting}>
                {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                 {isPrinting ? 'Generating...' : 'Download PDF'}
                </Button>
            </div>
        </div>

        <div id="print-container">
          <div 
              id="print-sheet" 
              className="sheet bg-white shadow-lg"
              style={{ 
                  width: pageSize.width,
                  minHeight: pageSize.height,
                  gridTemplateColumns: `repeat(auto-fill, minmax(${scaledLabelWidth}px, 1fr))`,
                  rowGap: `${layout.rowGap}px`,
                  columnGap: `${layout.columnGap}px`,
              }}
              >
              {data.map((itemData, index) => (
              <div key={index} className="label-container" style={{ transform: `scale(${layout.scale})`}}>
                  <LabelPreview
                      objects={templateJson.objects}
                      settings={templateJson.settings}
                      data={itemData}
                  />
              </div>
              ))}
          </div>
        </div>
    </div>
  )

  return (
    <>
      <div className="flex-1 flex w-full">
        {isDesktop ? (
            <PrintDataPanel data={data} />
        ) : (
             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden fixed top-[4.5rem] left-2 z-10 bg-background/80 print-hidden">
                        <PanelLeft className="h-5 w-5"/>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[300px]">
                   <PrintDataPanel data={data} isSheet />
                </SheetContent>
            </Sheet>
        )}
        
        {mainContent}

        {isDesktop ? (
            <PrintLayoutSettings layout={layout} onLayoutChange={handleLayoutChange} />
        ) : (
            <Sheet>
              <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden fixed top-[4.5rem] right-2 z-10 bg-background/80 print-hidden">
                      <PanelRight className="h-5 w-5"/>
                  </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-[300px]">
                  <PrintLayoutSettings layout={layout} onLayoutChange={handleLayoutChange} isSheet/>
              </SheetContent>
          </Sheet>
        )}
      </div>
      <style jsx global>{`
        @page {
          size: ${pageSize.width} ${pageSize.height};
          margin: 1cm;
        }
        @media print {
          body {
            background-color: white !important;
          }
          .print-hidden {
            display: none !important;
          }
          #print-container {
            width: 100%;
            height: auto;
            padding: 0;
            margin: 0;
          }
          .sheet {
            box-shadow: none !important;
            margin: 0;
            page-break-after: always;
            width: 100% !important;
            height: auto !important;
            min-height: calc(${pageSize.height} - 2cm);
          }
          .label-container {
             page-break-inside: avoid !important;
             display: flex;
             justify-content: center;
             align-items: center;
          }
        }
        #print-container {
          width: ${pageSize.width};
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px; /* Represents gap between pages on screen */
        }
        .sheet {
          display: grid;
          align-content: start;
          justify-items: center;
          overflow: hidden;
          padding: 1cm;
          box-sizing: border-box;
          break-after: page;
        }
        .label-container {
            overflow: hidden;
            box-sizing: border-box;
            width: ${templateJson.settings.width}px;
            height: ${templateJson.settings.height}px;
            display: flex;
            justify-content: center;
            align-items: center;
            transform-origin: center center;
            break-inside: avoid;
            page-break-inside: avoid;
        }
      `}</style>
    </>
  );
}
