
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LayersPanel } from '@/components/editor/layers-panel';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Layers, ChevronsLeft, ChevronsRight } from 'lucide-react';
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
  onLayerAction: (id: string, action: 'bring-forward' | 'send-backward' | 'delete') => void;
  defaultCollapsed?: boolean;
}

export function LeftSidebar({ 
    objects, 
    selectedObjectIds, 
    onSelectObject, 
    onLayerAction,
    defaultCollapsed = false,
}: LeftSidebarProps) {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);

  const sidebarContent = (
      <ScrollArea className="h-full">
        <div className="h-full flex flex-col pt-4">
          <Accordion type="single" collapsible defaultValue="layers" className="w-full px-4">
              <AccordionItem value="layers" className="border-none">
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
          </Accordion>
        </div>
      </ScrollArea>
  );

  return (
    <TooltipProvider>
      <div
        className={cn(
          "bg-card border-r relative transition-all duration-300 h-full",
          isOpen ? 'w-[260px]' : 'w-[40px]'
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
        {isOpen && sidebarContent}
      </div>
    </TooltipProvider>
  );
}
