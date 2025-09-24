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
  Undo,
  Redo,
  Plus,
  Type,
  ImageIcon,
  Barcode,
  Trash2,
  ZoomIn,
  ZoomOut,
  ChevronsUp,
  ChevronsDown,
  MoreVertical,
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

interface EditorToolbarProps {
  onAddItem: (type: 'text' | 'image' | 'barcode') => void;
  onClearAll: () => void;
  onLayerAction: (action: 'bring-forward' | 'send-backward') => void;
  onZoom: (zoom: number) => void;
  zoom: number;
  hasSelectedObject: boolean;
}

export function EditorToolbar({ 
    onAddItem, 
    onClearAll, 
    onLayerAction,
    onZoom,
    zoom,
    hasSelectedObject
}: EditorToolbarProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const addElementMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={isMobile ? "icon" : "sm"}>
          <Plus className={isMobile ? "" : "mr-2"} /> {!isMobile && 'Add Element'}
        </Button>
      </DropdownMenuTrigger>
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
  );

  const clearAllDialog = (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive-outline" size="sm" className={isMobile ? "w-full justify-start" : ""}>
          <Trash2 className="mr-2" /> Clear All
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
              <DropdownMenuItem onClick={() => onLayerAction('bring-forward')} disabled={!hasSelectedObject}>
                <ChevronsUp className="mr-2" /> Bring Forward
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onLayerAction('send-backward')} disabled={!hasSelectedObject}>
                <ChevronsDown className="mr-2" /> Send Backward
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>{clearAllDialog}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-card border-b p-2 flex items-center justify-between gap-2 z-20">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" disabled>
          <Undo />
        </Button>
        <Button variant="ghost" size="icon" disabled>
          <Redo />
        </Button>
        <Separator orientation="vertical" className="h-8" />
        {addElementMenu}
        <Separator orientation="vertical" className="h-8" />
        <Button variant="ghost" size="icon" onClick={() => onLayerAction('bring-forward')} disabled={!hasSelectedObject} title="Bring Forward">
          <ChevronsUp />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onLayerAction('send-backward')} disabled={!hasSelectedObject} title="Send Backward">
          <ChevronsDown />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => onZoom(zoom + 0.1)} title="Zoom In">
          <ZoomIn />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onZoom(Math.max(0.1, zoom - 0.1))} title="Zoom Out">
          <ZoomOut />
        </Button>
        <div className="w-12 text-center text-sm">{Math.round(zoom * 100)}%</div>
        <Separator orientation="vertical" className="h-8" />
        {clearAllDialog}
      </div>
    </div>
  );
}