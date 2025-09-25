
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PropertiesPanel } from '@/components/editor/properties-panel';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PanelRight } from 'lucide-react';
import type { CanvasObject, CanvasSettings } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';

interface RightSidebarProps {
  selectedObject: CanvasObject | undefined;
  onUpdate: (id: string, newProps: Partial<CanvasObject>) => void;
  canvasSettings: CanvasSettings;
  onUpdateCanvasSettings: (newSettings: Partial<CanvasSettings>) => void;
  isSheet?: boolean;
}

export function RightSidebar({ 
  selectedObject, 
  onUpdate, 
  canvasSettings,
  onUpdateCanvasSettings,
  isSheet = false 
}: RightSidebarProps) {
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const isOpen = isPinned || isHovered;

  const propertiesPanelContent = (
    <PropertiesPanel
      selectedObject={selectedObject}
      onUpdate={onUpdate}
      canvasSettings={canvasSettings}
      onUpdateCanvasSettings={onUpdateCanvasSettings}
    />
  );
  
  if (isSheet) {
    return (
      <ScrollArea className="h-full">
        {propertiesPanelContent}
      </ScrollArea>
    )
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          "bg-card border-l relative transition-all duration-300",
          isOpen ? 'w-[300px]' : 'w-[56px]'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute top-2 left-2 z-10">
          <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setIsPinned(!isPinned)}>
                    <PanelRight className={cn("h-5 w-5", isPinned && "text-primary")} />
                </Button>
            </TooltipTrigger>
             <TooltipContent side="left">
                <p>{isPinned ? 'Unpin' : 'Pin'} Properties Panel</p>
            </TooltipContent>
          </Tooltip>
        </div>
        {isOpen ? (
          <ScrollArea className="h-full">
            {propertiesPanelContent}
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center gap-2 p-2 pt-14">
            {/* Icons can be placed here for collapsed view if needed */}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
