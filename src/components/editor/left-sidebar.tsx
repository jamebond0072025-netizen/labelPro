'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LayersPanel } from '@/components/editor/layers-panel';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PanelLeft, Pin, PinOff } from 'lucide-react';
import type { CanvasObject } from '@/lib/types';

interface LeftSidebarProps {
  objects: CanvasObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string) => void;
  onLayerAction: (action: 'delete') => void;
  isSheet?: boolean;
}

export function LeftSidebar({ 
    objects, 
    selectedObjectId, 
    onSelectObject, 
    onLayerAction,
    isSheet = false,
}: LeftSidebarProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isOpen = isPinned || isHovered;

  if (isSheet) {
    return (
        <div className="bg-card h-full">
            <LayersPanel
                objects={objects}
                selectedObjectId={selectedObjectId}
                onSelectObject={onSelectObject}
                onLayerAction={onLayerAction}
            />
        </div>
    )
  }
  
  return (
    <TooltipProvider>
      <div
        className={cn(
          "bg-card border-r relative transition-all duration-300",
          isOpen ? 'w-[240px]' : 'w-[56px]'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isOpen ? (
          <LayersPanel
            objects={objects}
            selectedObjectId={selectedObjectId}
            onSelectObject={onSelectObject}
            onLayerAction={onLayerAction}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setIsHovered(true)}>
                  <PanelLeft className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Layers</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        <div className="absolute top-2 right-2 z-10">
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
            <TooltipContent side="right">
              <p>{isPinned ? 'Unpin' : 'Pin'} Layers Panel</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
