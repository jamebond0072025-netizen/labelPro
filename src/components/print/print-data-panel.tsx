
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Database, Trash2, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface PrintDataPanelProps {
    data: Record<string, any>[];
    onDataUpdate: (data: Record<string, any>[]) => void;
    defaultCollapsed?: boolean;
}

export function PrintDataPanel({ 
    data,
    onDataUpdate,
    defaultCollapsed = false,
}: PrintDataPanelProps) {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);

  const handleValueChange = (rowIndex: number, key: string, value: string) => {
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex], [key]: value };
    onDataUpdate(newData);
  };

  const handleDeleteRow = (rowIndex: number) => {
    const newData = data.filter((_, index) => index !== rowIndex);
    onDataUpdate(newData);
  };

  const sidebarContent = (
      <ScrollArea className="h-full">
        <div className="h-full flex flex-col pt-12">
          <Accordion type="single" collapsible defaultValue="data" className="w-full px-4">
              <AccordionItem value="data" className="border-none">
                  <AccordionTrigger>
                      <div className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          <span>Label Data ({data.length})</span>
                      </div>
                  </AccordionTrigger>
                  <AccordionContent>
                      <Accordion type="multiple" className="w-full">
                        {data.map((row, rowIndex) => (
                           <AccordionItem key={rowIndex} value={`item-${rowIndex}`}>
                            <div className="flex items-center justify-between group">
                               <AccordionTrigger className="flex-1 pr-2">Label #{rowIndex + 1}</AccordionTrigger>
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                 onClick={() => handleDeleteRow(rowIndex)}
                               >
                                 <Trash2 className="h-4 w-4 text-destructive" />
                               </Button>
                             </div>
                             <AccordionContent>
                                <div className="space-y-3">
                                  {Object.entries(row).map(([key, value]) => (
                                    <div key={key} className="space-y-1.5">
                                        <Label htmlFor={`input-${rowIndex}-${key}`} className="capitalize">{key.replace(/_/g, ' ')}</Label>
                                        <Input
                                            id={`input-${rowIndex}-${key}`}
                                            value={String(value)}
                                            onChange={(e) => handleValueChange(rowIndex, key, e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                  ))}
                                </div>
                             </AccordionContent>
                           </AccordionItem>
                        ))}
                      </Accordion>
                  </AccordionContent>
              </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
  );

  return (
    <TooltipProvider>
      <div
        className={cn(
          "bg-card border-r relative transition-all duration-300 print-hidden h-full",
          isOpen ? 'w-[300px]' : 'w-[56px]'
        )}
      >
        <div className="absolute top-1/2 -right-[15px] z-10 -translate-y-1/2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full h-8 w-8" onClick={() => setIsOpen(!isOpen)}>
                 {isOpen ? <ChevronsLeft className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{isOpen ? 'Collapse' : 'Expand'} Panel</p>
            </TooltipContent>
          </Tooltip>
        </div>
        {isOpen ? (
          sidebarContent
        ) : (
          <div className="flex flex-col items-center gap-4 p-2 pt-16">
             <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Database className="h-6 w-6 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Data</p></TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
