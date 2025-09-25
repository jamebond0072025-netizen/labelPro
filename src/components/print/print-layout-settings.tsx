
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PanelRight } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';

interface PrintLayoutSettingsProps {
    layout: {
        columns: number;
        scale: number;
        rowGap: number;
        columnGap: number;
    };
    onLayoutChange: (newLayout: Partial<PrintLayoutSettingsProps['layout']>) => void;
    isSheet?: boolean;
}

export function PrintLayoutSettings({ 
  layout,
  onLayoutChange,
  isSheet = false 
}: PrintLayoutSettingsProps) {
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const isOpen = isPinned || isHovered;

  const content = (
    <div className="p-4 pt-12 space-y-4">
        <h3 className="text-lg font-headline font-semibold">Layout Settings</h3>
        <div className="space-y-2">
            <Label htmlFor="columns">Columns</Label>
            <Input 
                id="columns"
                type="number"
                min="1"
                max="10"
                value={layout.columns}
                onChange={(e) => onLayoutChange({ columns: parseInt(e.target.value) || 1 })}
            />
        </div>
         <div className="space-y-2">
            <Label>Scale ({Math.round(layout.scale * 100)}%)</Label>
            <Slider
                value={[layout.scale]}
                max={2}
                min={0.1}
                step={0.05}
                onValueChange={(value) => onLayoutChange({ scale: value[0] })}
            />
        </div>
         <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
                <Label htmlFor="row-gap">Row Gap (px)</Label>
                <Input 
                    id="row-gap"
                    type="number"
                    value={layout.rowGap}
                    onChange={(e) => onLayoutChange({ rowGap: parseInt(e.target.value) || 0 })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="col-gap">Column Gap (px)</Label>
                <Input 
                    id="col-gap"
                    type="number"
                    value={layout.columnGap}
                    onChange={(e) => onLayoutChange({ columnGap: parseInt(e.target.value) || 0 })}
                />
            </div>
        </div>
    </div>
  );
  
  if (isSheet) {
    return (
      <ScrollArea className="h-full">
        {content}
      </ScrollArea>
    )
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          "bg-card border-l relative transition-all duration-300 print:hidden",
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
                <p>{isPinned ? 'Unpin' : 'Pin'} Panel</p>
            </TooltipContent>
          </Tooltip>
        </div>
        {isOpen ? (
          <ScrollArea className="h-full">
            {content}
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
