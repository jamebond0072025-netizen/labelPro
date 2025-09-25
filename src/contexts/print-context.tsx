
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

interface PrintContextType {
  template: ImagePlaceholder | null;
  setTemplate: (template: ImagePlaceholder) => void;
  data: Record<string, any>[] | null;
  setData: (data: Record<string, any>[]) => void;
}

const PrintContext = createContext<PrintContextType | undefined>(undefined);

export function PrintProvider({ children }: { children: ReactNode }) {
  const [template, setTemplate] = useState<ImagePlaceholder | null>(null);
  const [data, setData] = useState<Record<string, any>[] | null>(null);

  const setTemplateCallback = useCallback((newTemplate: ImagePlaceholder) => {
    setTemplate(newTemplate);
  }, []);

  const setDataCallback = useCallback((newData: Record<string, any>[]) => {
    setData(newData);
  }, []);

  return (
    <PrintContext.Provider value={{ template, setTemplate: setTemplateCallback, data, setData: setDataCallback }}>
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
