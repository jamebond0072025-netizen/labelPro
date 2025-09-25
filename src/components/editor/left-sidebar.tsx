'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LayersPanel } from '@/components/editor/layers-panel';
import { DataPanel } from '@/components/editor/data-panel';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PanelLeft, Layers, Database } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CanvasObject } from '@/lib/types';

interface LeftSidebarProps {
  objects: CanvasObject[];
  selectedObjectIds: string[];
  onSelectObject: (id: string) => void;
  onLayerAction: (action: 'delete') => void;
  isSheet?: boolean;
}

export function LeftSidebar({ 
    objects, 
    selectedObjectIds, 
    onSelectObject, 
    onLayerAction,
    isSheet = false,
}: LeftSidebarProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isOpen = isPinned || isHovered;

  const sidebarContent = (
      <Tabs defaultValue="layers" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mt-12 mx-auto max-w-[220px]">
          <TabsTrigger value="layers"><Layers className="h-4 w-4 mr-2"/>Layers</TabsTrigger>
          <TabsTrigger value="data"><Database className="h-4 w-4 mr-2"/>Data</TabsTrigger>
        </TabsList>
        <TabsContent value="layers" className="flex-1 overflow-hidden">
            <LayersPanel
                objects={objects}
                selectedObjectIds={selectedObjectIds}
                onSelectObject={onSelectObject}
                onLayerAction={onLayerAction}
            />
        </TabsContent>
        <TabsContent value="data" className="flex-1 overflow-hidden">
            <DataPanel objects={objects} />
        </TabsContent>
    </Tabs>
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
          "bg-card border-r relative transition-all duration-300",
          isOpen ? 'w-[260px]' : 'w-[56px]'
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
                <Layers className="h-6 w-6 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="right"><p>Layers</p></TooltipContent>
            </Tooltip>
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
