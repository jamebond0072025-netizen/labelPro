
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrint } from '@/contexts/print-context';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { LabelPreview } from '@/components/label-preview';
import type { CanvasObject, CanvasSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';


const pageSizes = [
  { name: 'A4 (210mm x 297mm)', width: '210mm', height: '297mm' },
  { name: 'Letter (8.5" x 11")', width: '8.5in', height: '11in' },
  { name: 'Legal (8.5" x 14")', width: '8.5in', height: '14in' },
];

export default function PrintPreviewPage() {
  const router = useRouter();
  const { template, data } = usePrint();
  const { toast } = useToast();
  const [templateJson, setTemplateJson] = useState<{ settings: CanvasSettings; objects: CanvasObject[] } | null>(null);
  const [pageSize, setPageSize] = useState(pageSizes[0]);


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

  return (
    <div className="flex-1 flex flex-col items-center p-4 sm:p-8 bg-muted overflow-auto">
      <div className="w-full max-w-5xl flex justify-between items-center mb-4 print:hidden">
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
            <Button onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print Labels
            </Button>
        </div>
      </div>

      <div 
        id="print-sheet" 
        className="sheet bg-white shadow-lg"
        style={{ 
            width: pageSize.width,
            height: pageSize.height,
            gridTemplateColumns: `repeat(auto-fill, minmax(${templateJson.settings.width}px, 1fr))`,
            gridTemplateRows: `repeat(auto-fill, ${templateJson.settings.height}px)`,
        }}
        >
        {data.map((itemData, index) => (
          <div key={index} className="label-container" style={{ width: templateJson.settings.width, height: templateJson.settings.height }}>
            <LabelPreview
              objects={templateJson.objects}
              settings={templateJson.settings}
              data={itemData}
            />
          </div>
        ))}
      </div>

      <style jsx global>{`
        @page {
          size: ${pageSize.name.split(' ')[0]};
          margin: 1cm;
        }
        @media print {
          body {
            background-color: white !important;
          }
          .sheet {
            box-shadow: none !important;
            margin: 0;
            page-break-after: always;
            page-break-inside: avoid;
          }
          .print\:hidden {
            display: none;
          }
        }
        .sheet {
          display: grid;
          gap: 0;
          align-content: start;
          justify-content: start;
          overflow: hidden;
          padding: 1cm;
          box-sizing: border-box;
        }
        .label-container {
            overflow: hidden;
            box-sizing: border-box;
            page-break-inside: avoid;
        }
      `}</style>
    </div>
  );
}
