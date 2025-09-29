

'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { Template } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';


interface PrintPageSettings {
  pageSize: any;
  layout: any;
}

interface PrintContextType {
  template: Template | null;
  setTemplate: (template: Template) => void;
  data: Record<string, any>[] | null;
  setData: (data: Record<string, any>[]) => void;
  printPageSettings: PrintPageSettings | null;
  setPrintPageSettings: (settings: PrintPageSettings) => void;
  isPrinting: boolean;
  handleDownloadPdf: () => Promise<void>;
}

const PrintContext = createContext<PrintContextType | undefined>(undefined);

export function PrintProvider({ children }: { children: ReactNode }) {
  const [template, setTemplateState] = useState<Template | null>(null);
  const [data, setDataState] = useState<Record<string, any>[] | null>(null);
  const [printPageSettings, setPrintPageSettingsState] = useState<PrintPageSettings | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const { toast } = useToast();


  const setTemplate = useCallback((newTemplate: Template) => {
    setTemplateState(newTemplate);
  }, []);

  const setData = useCallback((newData: Record<string, any>[]) => {
    setDataState(newData);
  }, []);

  const setPrintPageSettings = useCallback((settings: PrintPageSettings) => {
    setPrintPageSettingsState(settings);
  }, []);

  const handleDownloadPdf = async () => {
    if (!printPageSettings) {
        toast({ variant: 'destructive', title: 'Error', description: 'Print settings not available.' });
        return;
    }

    setIsPrinting(true);
    const { pageSize } = printPageSettings;
    const { orientation, unit, format } = pageSize.pdf;
    const pdf = new jsPDF(orientation, unit, format);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const sheets = Array.from(document.querySelectorAll('.sheet'));

    try {
        for (let i = 0; i < sheets.length; i++) {
            const sheet = sheets[i] as HTMLElement;
             if (i > 0) {
                pdf.addPage();
            }
            
            const dataUrl = await toPng(sheet, {
                quality: 1,
                pixelRatio: 2,
                width: pageSize.pxWidth,
                height: pageSize.pxHeight,
                style: {
                    // Ensure the content is visible for capture
                    //transform: 'scale(1)',
                }
            });

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
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
    <PrintContext.Provider value={{ 
      template, 
      setTemplate,
      data, 
      setData,
      printPageSettings,
      setPrintPageSettings,
      isPrinting,
      handleDownloadPdf,
    }}>
      {children}
    </PrintContext.Provider>
  );
}

export function usePrint() {
  const context = useContext(PrintContext);
  if (context === undefined) {
    throw new Error('usePrint must be used within a PrintProvider');
  }
  return context;
}
