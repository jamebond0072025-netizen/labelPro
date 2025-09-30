
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PropertiesPanel } from '@/components/editor/properties-panel';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { CanvasObject, CanvasSettings } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';

interface RightSidebarProps {
  selectedObject: CanvasObject | undefined;
  onUpdate: (id: string, newProps: Partial<CanvasObject>) => void;
  canvasSettings: CanvasSettings;
  onUpdateCanvasSettings: (newSettings: Partial<CanvasSettings>) => void;
  onDelete: () => void;
  defaultCollapsed?: boolean;
}

export function RightSidebar({ 
  selectedObject, 
  onUpdate, 
  canvasSettings,
  onUpdateCanvasSettings,
  onDelete,
  defaultCollapsed = false 
}: RightSidebarProps) {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);

  const propertiesPanelContent = (
    <PropertiesPanel
      selectedObject={selectedObject}
      onUpdate={onUpdate}
      onDelete={onDelete}
      canvasSettings={canvasSettings}
      onUpdateCanvasSettings={onUpdateCanvasSettings}
    />
  );
  
  return (
    <TooltipProvider>
      <div
        className={cn(
          "bg-card border-l relative transition-all duration-300 h-full",
          isOpen ? 'w-[300px]' : 'w-[40px]'
        )}
      >
        <div className="absolute top-1/2 -left-[15px] z-10 -translate-y-1/2">
          <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full h-8 w-8" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
                </Button>
            </TooltipTrigger>
             <TooltipContent side="left">
                <p>{isOpen ? 'Collapse' : 'Expand'} Properties Panel</p>
            </TooltipContent>
          </Tooltip>
        </div>
        {isOpen && (
          <ScrollArea className="h-full">
            {propertiesPanelContent}
          </ScrollArea>
        )}
      </div>
    </TooltipProvider>
  );
}
