
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PanelLeft, Database, Trash2 } from 'lucide-react';
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
    isSheet?: boolean;
}

export function PrintDataPanel({ 
    data,
    onDataUpdate,
    isSheet = false,
}: PrintDataPanelProps) {
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  const isOpen = isPinned || isHovered;

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

  if (isSheet) {
    return (
        <div className="bg-card h-full">
            {sidebarContent}
        </div>
    )
  }
  
  return (
    <TooltipProvider>
      <div
        className={cn(
          "bg-card border-r relative transition-all duration-300 print-hidden",
          isOpen ? 'w-[300px]' : 'w-[56px]'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute top-2 right-2 z-10 pt-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setIsPinned(!isPinned)}>
                 <PanelLeft className={cn("h-5 w-5", isPinned && "text-primary")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{isPinned ? 'Unpin' : 'Pin'} Panel</p>
            </TooltipContent>
          </Tooltip>
        </div>
        {isOpen ? (
          sidebarContent
        ) : (
          <div className="flex flex-col items-center gap-4 p-2 pt-16">
             <Tooltip>
              <TooltipTrigger asChild>
                <Database className="h-6 w-6 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="right"><p>Data</p></TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
