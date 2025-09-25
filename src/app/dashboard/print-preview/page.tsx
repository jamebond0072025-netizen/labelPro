
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrint } from '@/contexts/print-context';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { LabelPreview } from '@/components/label-preview';
import type { CanvasObject, CanvasSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function PrintPreviewPage() {
  const router = useRouter();
  const { template, data } = usePrint();
  const { toast } = useToast();
  const [templateJson, setTemplateJson] = useState<{ settings: CanvasSettings; objects: CanvasObject[] } | null>(null);

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

  return (
    <div className="flex-1 flex flex-col items-center p-4 sm:p-8 bg-muted overflow-auto">
      <div className="w-full max-w-4xl flex justify-between items-center mb-4 print:hidden">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Editor
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Print Labels
        </Button>
      </div>

      <div className="a4-sheet bg-white shadow-lg">
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
          size: A4;
          margin: 1cm;
        }
        @media print {
          body {
            background-color: white !important;
          }
          .a4-sheet {
            box-shadow: none !important;
            margin: 0;
            overflow: visible;
          }
          .print\:hidden {
            display: none;
          }
        }
        .a4-sheet {
          width: 210mm;
          height: 297mm;
          display: flex;
          flex-wrap: wrap;
          align-content: flex-start;
          gap: 10px;
          padding: 1cm;
          box-sizing: border-box;
          overflow: hidden;
        }
        .label-container {
            overflow: hidden;
            box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}

