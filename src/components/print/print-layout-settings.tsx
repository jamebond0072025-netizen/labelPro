
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { pageSizes } from '@/app/dashboard/print-preview/page';

interface PrintLayoutSettingsProps {
    layout: {
        zoom: number;
        labelScale: number;
        rowGap: number;
        columnGap: number;
    };
    onLayoutChange: (newLayout: Partial<PrintLayoutSettingsProps['layout']>) => void;
    pageSize: string;
    onPageSizeChange: (value: string) => void;
    defaultCollapsed?: boolean;
}

export function PrintLayoutSettings({ 
  layout,
  onLayoutChange,
  pageSize,
  onPageSizeChange,
  defaultCollapsed = false 
}: PrintLayoutSettingsProps) {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);

  const content = (
    <div className="p-4 pt-12 space-y-4">
        <h3 className="text-lg font-headline font-semibold">Layout Settings</h3>

        <div className="space-y-2">
            <Label htmlFor="page-size">Page Size</Label>
            <Select value={pageSize} onValueChange={onPageSizeChange}>
                <SelectTrigger id="page-size" className="w-full">
                    <SelectValue placeholder="Select a size" />
                </SelectTrigger>
                <SelectContent>
                    {pageSizes.map(size => (
                        <SelectItem key={size.name} value={size.name}>
                            {size.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <Separator />
        
         <div className="space-y-2">
            <Label>Zoom ({Math.round(layout.zoom * 100)}%)</Label>
            <Slider
                value={[layout.zoom]}
                max={2}
                min={0.1}
                step={0.05}
                onValueChange={(value) => onLayoutChange({ zoom: value[0] })}
            />
        </div>
        <Separator />
        <div className="space-y-2">
            <Label>Label Scale ({Math.round(layout.labelScale * 100)}%)</Label>
            <Slider
                value={[layout.labelScale]}
                max={2}
                min={0.1}
                step={0.05}
                onValueChange={(value) => onLayoutChange({ labelScale: value[0] })}
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
  
  return (
    <TooltipProvider>
      <div
        className={cn(
          "bg-card border-l relative transition-all duration-300 print-hidden h-full",
          isOpen ? 'w-[300px]' : 'w-[56px]'
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
                <p>{isOpen ? 'Collapse' : 'Expand'} Panel</p>
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
