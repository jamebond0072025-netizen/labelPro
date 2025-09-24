'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PropertiesPanel } from '@/components/editor/properties-panel';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PanelRight, Pin, PinOff } from 'lucide-react';
import type { CanvasObject } from '@/lib/types';

interface RightSidebarProps {
  selectedObject: CanvasObject | undefined;
  onUpdate: (id: string, newProps: Partial<CanvasObject>) => void;
  isSheet?: boolean;
}

export function RightSidebar({ selectedObject, onUpdate, isSheet = false }: RightSidebarProps) {
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const isOpen = isPinned || isHovered;

  if (isSheet) {
    return (
        <PropertiesPanel
            selectedObject={selectedObject}
            onUpdate={onUpdate}
        />
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
        {isOpen ? (
          <PropertiesPanel selectedObject={selectedObject} onUpdate={onUpdate} />
        ) : (
          <div className="flex flex-col items-center gap-2 p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setIsHovered(true)}>
                  <PanelRight className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Properties</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        <div className="absolute top-2 left-2 z-10">
          <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setIsPinned(!isPinned)}>
                    {isPinned ? (
                    <Pin className="h-5 w-5" />
                    ) : (
                    <PinOff className="h-5 w-5 text-muted-foreground" />
                    )}
                </Button>
            </TooltipTrigger>
             <TooltipContent side="left">
                <p>{isPinned ? 'Unpin' : 'Pin'} Properties Panel</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
