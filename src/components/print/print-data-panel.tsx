
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PanelLeft, Database } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface PrintDataPanelProps {
    data: Record<string, any>[];
    isSheet?: boolean;
}

export function PrintDataPanel({ 
    data,
    isSheet = false,
}: PrintDataPanelProps) {
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  const isOpen = isPinned || isHovered;

  const sidebarContent = (
      <ScrollArea className="h-full">
        <div className="h-full flex flex-col pt-12">
          <Accordion type="single" defaultValue="data" collapsible className="w-full px-4">
              <AccordionItem value="data">
                  <AccordionTrigger>
                      <div className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          <span>Label Data</span>
                      </div>
                  </AccordionTrigger>
                  <AccordionContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {headers.map(header => <TableHead key={header}>{header}</TableHead>)}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {headers.map(header => (
                                <TableCell key={`${rowIndex}-${header}`} className="text-xs">
                                  {String(row[header])}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
