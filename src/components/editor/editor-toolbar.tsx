'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Undo, Redo, Plus, Type, ImageIcon, Barcode, Trash2, ZoomIn, ZoomOut,
  ChevronsUp, ChevronsDown, MoreVertical, AlignCenter, AlignStartHorizontal,
  AlignCenterHorizontal, AlignEndHorizontal, AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  Columns, Rows,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useMediaQuery } from '@/hooks/use-media-query';
import type { Alignment } from '@/hooks/use-canvas-objects';

interface EditorToolbarProps {
  onAddItem: (type: 'text' | 'image' | 'barcode') => void;
  onClearAll: () => void;
  onLayerAction: (action: 'bring-forward' | 'send-backward') => void;
  onZoom: (zoom: number) => void;
  zoom: number;
  selectedObjectIds: string[];
  onAlign: (alignment: Alignment) => void;
}

export function EditorToolbar({ 
    onAddItem, 
    onClearAll, 
    onLayerAction,
    onZoom,
    zoom,
    selectedObjectIds,
    onAlign,
}: EditorToolbarProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const hasSelection = selectedObjectIds.length > 0;
  const hasMultipleSelection = selectedObjectIds.length > 1;

  const addElementMenu = (
    <TooltipProvider>
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size={isMobile ? "icon" : "sm"}>
              <Plus className={isMobile ? "" : "mr-2"} /> {!isMobile && 'Add Element'}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add a new element to the canvas</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onAddItem('text')}>
          <Type className="mr-2" /> Text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAddItem('image')}>
          <ImageIcon className="mr-2" /> Image
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAddItem('barcode')}>
          <Barcode className="mr-2" /> Barcode
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </TooltipProvider>
  );

  const clearAllDialog = (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive-outline" size={isMobile ? "icon": "sm"} className={isMobile ? "w-full justify-start" : ""}>
          <Trash2 className={isMobile ? "mr-2" : ""} /> {!isMobile && "Clear All"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete all objects from your canvas. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onClearAll}>Clear All</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const alignmentTools = (
    <DropdownMenu>
        <Tooltip>
            <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={!hasSelection}>
                        <AlignCenter />
                    </Button>
                </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent><p>Alignment</p></TooltipContent>
        </Tooltip>
        <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onAlign('left')} disabled={!hasSelection}>
                <AlignStartHorizontal className="mr-2" /> Align Left
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAlign('center')} disabled={!hasSelection}>
                <AlignCenterHorizontal className="mr-2" /> Align Center
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAlign('right')} disabled={!hasSelection}>
                <AlignEndHorizontal className="mr-2" /> Align Right
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAlign('top')} disabled={!hasSelection}>
                <AlignStartVertical className="mr-2" /> Align Top
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAlign('middle')} disabled={!hasSelection}>
                <AlignCenterVertical className="mr-2" /> Align Middle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAlign('bottom')} disabled={!hasSelection}>
                <AlignEndVertical className="mr-2" /> Align Bottom
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAlign('distribute-horizontally')} disabled={!hasMultipleSelection}>
                <Columns className="mr-2" /> Distribute Horizontally
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAlign('distribute-vertically')} disabled={!hasMultipleSelection}>
                <Rows className="mr-2" /> Distribute Vertically
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );

  if (isMobile) {
    return (
      <div className="w-full bg-card border-b p-2 flex items-center justify-between gap-1 z-20">
        {addElementMenu}
        <div className="flex items-center gap-1">
          <div className="w-12 text-center text-sm">{Math.round(zoom * 100)}%</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onZoom(zoom + 0.1)}>
                <ZoomIn className="mr-2" /> Zoom In
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onZoom(Math.max(0.1, zoom - 0.1))}>
                <ZoomOut className="mr-2" /> Zoom Out
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onLayerAction('bring-forward')} disabled={!hasSelection}>
                <ChevronsUp className="mr-2" /> Bring Forward
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onLayerAction('send-backward')} disabled={!hasSelection}>
                <ChevronsDown className="mr-2" /> Send Backward
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {alignmentTools}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>{clearAllDialog}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
    <div className="w-full bg-card border-b p-2 flex items-center justify-between gap-2 z-20">
      <div className="flex items-center gap-2">
        <Tooltip>
            <TooltipTrigger asChild><Button variant="ghost" size="icon" disabled><Undo /></Button></TooltipTrigger>
            <TooltipContent><p>Undo (Coming Soon)</p></TooltipContent>
        </Tooltip>
        <Tooltip>
            <TooltipTrigger asChild><Button variant="ghost" size="icon" disabled><Redo /></Button></TooltipTrigger>
            <TooltipContent><p>Redo (Coming Soon)</p></TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-8" />
        {addElementMenu}
        <Separator orientation="vertical" className="h-8" />
        <Tooltip>
            <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => onLayerAction('bring-forward')} disabled={!hasSelection}><ChevronsUp /></Button></TooltipTrigger>
            <TooltipContent><p>Bring Forward</p></TooltipContent>
        </Tooltip>
        <Tooltip>
            <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => onLayerAction('send-backward')} disabled={!hasSelection}><ChevronsDown /></Button></TooltipTrigger>
            <TooltipContent><p>Send Backward</p></TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-8" />
        {alignmentTools}
      </div>

      <div className="flex items-center gap-2">
        <Tooltip>
            <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => onZoom(zoom + 0.1)}><ZoomIn /></Button></TooltipTrigger>
            <TooltipContent><p>Zoom In</p></TooltipContent>
        </Tooltip>
        <Tooltip>
            <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => onZoom(Math.max(0.1, zoom - 0.1))}><ZoomOut /></Button></TooltipTrigger>
            <TooltipContent><p>Zoom Out</p></TooltipContent>
        </Tooltip>
        <div className="w-12 text-center text-sm">{Math.round(zoom * 100)}%</div>
        <Separator orientation="vertical" className="h-8" />
         <Tooltip>
            <TooltipTrigger asChild>{clearAllDialog}</TooltipTrigger>
            <TooltipContent><p>Clear All</p></TooltipContent>
        </Tooltip>
      </div>
    </div>
    </TooltipProvider>
  );
}
