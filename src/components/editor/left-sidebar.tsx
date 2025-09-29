
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LayersPanel } from '@/components/editor/layers-panel';
import { DataPanel } from '@/components/editor/data-panel';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PanelLeft, Layers, Database, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { CanvasObject } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';

interface LeftSidebarProps {
  objects: CanvasObject[];
  selectedObjectIds: string[];
  onSelectObject: (id: string) => void;
  onLayerAction: (action: 'delete') => void;
  onReplaceData: (data: Record<string, any>) => void;
  isSheet?: boolean;
}

export function LeftSidebar({ 
    objects, 
    selectedObjectIds, 
    onSelectObject, 
    onLayerAction,
    onReplaceData,
    isSheet = false,
}: LeftSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  const sidebarContent = (
      <ScrollArea className="h-full">
        <div className="h-full flex flex-col pt-4">
          <Accordion type="multiple" defaultValue={['layers', 'data']} className="w-full px-4">
              <AccordionItem value="layers">
                  <AccordionTrigger>
                      <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4" />
                          <span>Layers</span>
                      </div>
                  </AccordionTrigger>
                  <AccordionContent>
                      <LayersPanel
                          objects={objects}
                          selectedObjectIds={selectedObjectIds}
                          onSelectObject={onSelectObject}
                          onLayerAction={onLayerAction}
                      />
                  </AccordionContent>
              </AccordionItem>
              <AccordionItem value="data">
                  <AccordionTrigger>
                      <div className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          <span>Data Schema</span>
                      </div>
                  </AccordionTrigger>
                  <AccordionContent>
                      <DataPanel objects={objects} onReplaceData={onReplaceData} />
                  </AccordionContent>
              </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
  );

  if (isSheet) {
    return (
        <div className="bg-card h-full pt-8">
            {sidebarContent}
        </div>
    )
  }
  
  return (
    <TooltipProvider>
      <div
        className={cn(
          "bg-card border-r relative transition-all duration-300 h-full",
          isOpen ? 'w-[260px]' : 'w-[56px]'
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
          <div className="flex flex-col items-center gap-4 p-2 pt-6">
            <Tooltip>
              <TooltipTrigger asChild>
                 <Button variant="ghost" size="icon">
                    <Layers className="h-6 w-6 text-muted-foreground" />
                 </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Layers</p></TooltipContent>
            </Tooltip>
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
