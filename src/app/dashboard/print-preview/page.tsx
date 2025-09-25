
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrint } from '@/contexts/print-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PanelLeft, PanelRight, Loader2 } from 'lucide-react';
import { LabelPreview } from '@/components/label-preview';
import type { CanvasObject, CanvasSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';
import { PrintDataPanel } from '@/components/print/print-data-panel';
import { PrintLayoutSettings } from '@/components/print/print-layout-settings';


export const pageSizes = [
  { name: 'A4 (210mm x 297mm)', width: '210mm', height: '297mm', pdf: { orientation: 'p', unit: 'mm', format: 'a4' } },
  { name: 'Letter (8.5" x 11")', width: '8.5in', height: '11in', pdf: { orientation: 'p', unit: 'in', format: 'letter' } },
  { name: 'Legal (8.5" x 14")', width: '8.5in', height: '14in', pdf: { orientation: 'p', unit: 'in', format: 'legal' } },
];

export default function PrintPreviewPage() {
  const router = useRouter();
  const { template, data, setPrintPageSettings } = usePrint();
  const { toast } = useToast();
  const [templateJson, setTemplateJson] = useState<{ settings: CanvasSettings; objects: CanvasObject[] } | null>(null);
  const [pageSize, setPageSize] = useState(pageSizes[0]);
  const [layout, setLayout] = useState({
    zoom: 1,
    labelScale: 1,
    rowGap: 0,
    columnGap: 0,
  });

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

  useEffect(() => {
    // Pass settings to context for header button to use
    setPrintPageSettings({ pageSize, layout });
  }, [pageSize, layout, setPrintPageSettings]);


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
  
  const scaledLabelWidth = templateJson.settings.width * layout.labelScale;
  const scaledLabelHeight = templateJson.settings.height * layout.labelScale;

  const mainContent = (
    <div className="flex-1 flex flex-col items-center p-4 sm:p-8 bg-muted overflow-auto">
        <div id="print-container" style={{ transform: `scale(${layout.zoom})`, transformOrigin: 'top center' }}>
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
              <div key={index} className="label-container" style={{ width: scaledLabelWidth, height: scaledLabelHeight }}>
                  <div style={{ transform: `scale(${layout.labelScale})`, transformOrigin: 'top left', width: templateJson.settings.width, height: templateJson.settings.height }}>
                    <LabelPreview
                        objects={templateJson.objects}
                        settings={templateJson.settings}
                        data={itemData}
                    />
                  </div>
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
            <PrintLayoutSettings 
              layout={layout} 
              onLayoutChange={handleLayoutChange} 
              pageSize={pageSize.name}
              onPageSizeChange={handleSizeChange}
            />
        ) : (
            <Sheet>
              <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden fixed top-[4.5rem] right-2 z-10 bg-background/80 print-hidden">
                      <PanelRight className="h-5 w-5"/>
                  </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-[300px]">
                  <PrintLayoutSettings 
                    layout={layout} 
                    onLayoutChange={handleLayoutChange} 
                    isSheet
                    pageSize={pageSize.name}
                    onPageSizeChange={handleSizeChange}
                  />
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
            transform: scale(1) !important;
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
          padding: 20px 0;
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
            display: flex;
            justify-content: center;
            align-items: center;
            break-inside: avoid;
            page-break-inside: avoid;
        }
      `}</style>
    </>
  );
}
